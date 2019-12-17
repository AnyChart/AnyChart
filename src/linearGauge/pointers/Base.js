goog.provide('anychart.linearGaugeModule.pointers.Base');

goog.require('anychart.core.IShapeManagerUser');
goog.require('anychart.core.StateSettings');
goog.require('anychart.core.VisualBase');
goog.require('anychart.core.utils.IInteractiveSeries');
goog.require('anychart.core.utils.LegendItemSettings');
goog.require('anychart.core.utils.LinearGaugeInteractivityState');
goog.require('anychart.data.Set');
goog.require('anychart.format.Context');



/**
 * Base class for pointers.
 * @extends {anychart.core.VisualBase}
 * @implements {anychart.core.utils.IInteractiveSeries}
 * @implements {anychart.core.IShapeManagerUser}
 * @constructor
 */
anychart.linearGaugeModule.pointers.Base = function() {
  anychart.linearGaugeModule.pointers.Base.base(this, 'constructor');

  /**
   * Reference value names.
   * @type {Array.<string>}
   */
  this.referenceValueNames = ['value'];

  /**
   * Interactivity state.
   * @type {anychart.core.utils.LinearGaugeInteractivityState}
   */
  this.state = new anychart.core.utils.LinearGaugeInteractivityState(this);

  /**
   * Used in labels position calculating.
   * @type {!anychart.math.Rect}
   * @protected
   */
  this.pointerBounds = anychart.math.rect(0, 0, 0, 0);

  /**
   * @type {acgraph.vector.Path}
   */
  this.path = null;

  /**
   * @type {acgraph.vector.Path}
   */
  this.hatch = null;

  /**
   * States that should be invalidated when bounds method is called.
   * @type {number}
   */
  this.BOUNDS_DEPENDENT_STATES = anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.GAUGE_POINTER_LABELS;

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['name', 0, anychart.Signal.NEED_UPDATE_LEGEND],
    ['width', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['offset', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED]
  ]);

  var normalDescriptorsMeta = {};
  anychart.core.settings.createDescriptorsMeta(normalDescriptorsMeta, [
    ['fill', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEED_UPDATE_LEGEND],
    ['stroke', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEED_UPDATE_LEGEND],
    ['hatchFill', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEED_UPDATE_LEGEND],
    ['labels', 0, 0]
  ]);
  this.normal_ = new anychart.core.StateSettings(this, normalDescriptorsMeta, anychart.PointState.NORMAL);
  this.normal_.setOption(anychart.core.StateSettings.LABELS_AFTER_INIT_CALLBACK, anychart.core.StateSettings.DEFAULT_LABELS_AFTER_INIT_CALLBACK);

  var hoveredSelectedDescriptorsMeta = {};
  anychart.core.settings.createDescriptorsMeta(hoveredSelectedDescriptorsMeta, [
    ['fill', 0, 0],
    ['stroke', 0, 0],
    ['hatchFill', 0, 0],
    ['labels', 0, 0]
  ]);
  this.hovered_ = new anychart.core.StateSettings(this, hoveredSelectedDescriptorsMeta, anychart.PointState.HOVER);
  this.selected_ = new anychart.core.StateSettings(this, hoveredSelectedDescriptorsMeta, anychart.PointState.SELECT);

  this.fillResolver = anychart.color.getColorResolver('fill', anychart.enums.ColorType.FILL, true);
  this.strokeResolver = anychart.color.getColorResolver('stroke', anychart.enums.ColorType.STROKE, true);
  this.hatchFillResolver = anychart.color.getColorResolver('hatchFill', anychart.enums.ColorType.HATCH_FILL, true);

  this.data(null);
};
goog.inherits(anychart.linearGaugeModule.pointers.Base, anychart.core.VisualBase);
anychart.core.settings.populateAliases(anychart.linearGaugeModule.pointers.Base, ['fill', 'stroke', 'hatchFill', 'labels'], 'normal');


//region --- STATES / SIGNALS ---
/**
 * Supported signals.
 * @type {number}
 */
anychart.linearGaugeModule.pointers.Base.prototype.SUPPORTED_SIGNALS =
    anychart.core.VisualBase.prototype.SUPPORTED_SIGNALS |
    anychart.Signal.NEED_UPDATE_LEGEND |
    anychart.Signal.NEEDS_RECALCULATION;


/**
 * Supported states.
 * @type {number}
 */
anychart.linearGaugeModule.pointers.Base.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.VisualBase.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.APPEARANCE |
    anychart.ConsistencyState.GAUGE_POINTER_LABELS;


//endregion
//region --- PROPERTIES ---
/**
 * Link to incoming raw data.
 * Used to avoid data reapplication on same data sets.
 * NOTE: If is disposable entity, should be disposed from the source, not from this class.
 * @type {?(anychart.data.View|anychart.data.Set|Array|string)}
 * @private
 */
anychart.linearGaugeModule.pointers.Base.prototype.rawData_;


/**
 *
 * @type {?anychart.data.Iterator}
 * @private
 */
anychart.linearGaugeModule.pointers.Base.prototype.iterator_;


/**
 * Default hatch fill type.
 * @type {acgraph.vector.HatchFill.HatchFillType|string}
 */
anychart.linearGaugeModule.pointers.Base.DEFAULT_HATCH_FILL_TYPE = acgraph.vector.HatchFill.HatchFillType.DIAGONAL_BRICK;


//endregion
//region --- DATA ---
/**
 * Getter/setter for series mapping.
 * @param {?(anychart.data.View|anychart.data.Set|Array|string)=} opt_value Value to set.
 * @param {(anychart.enums.TextParsingMode|anychart.data.TextParsingSettings)=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings here as a hash map.
 * @return {(!anychart.linearGaugeModule.pointers.Base|!anychart.data.View)} Returns itself if used as a setter or the mapping if used as a getter.
 */
anychart.linearGaugeModule.pointers.Base.prototype.data = function(opt_value, opt_csvSettings) {
  if (goog.isDef(opt_value)) {
    if (this.rawData_ !== opt_value) {
      this.rawData_ = opt_value;
      goog.dispose(this.parentViewToDispose); // disposing a view created by the series if any;
      this.iterator_ = null; // reset iterator
      if (anychart.utils.instanceOf(opt_value, anychart.data.View))
        this.ownData = this.parentViewToDispose = opt_value.derive(); // deriving a view to avoid interference with other view users
      else if (anychart.utils.instanceOf(opt_value, anychart.data.Set))
        this.ownData = this.parentViewToDispose = opt_value.mapAs();
      else
        this.ownData = !goog.isNull(opt_value) ? (this.parentViewToDispose = new anychart.data.Set(
            (goog.isArray(opt_value) || goog.isString(opt_value)) ? opt_value : null, opt_csvSettings)).mapAs() : null;
      if (this.ownData) {
        this.ownData.listenSignals(this.dataInvalidated_, this);
      }

      //GAUGE_COLOR_SCALE invalidated for Led to redraw correctly
      this.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.GAUGE_COLOR_SCALE,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEEDS_RECALCULATION);
    }
    return this;
  }
  return this.ownData;
};


/**
 * Listens to data invalidation.
 * @param {anychart.SignalEvent} e
 * @private
 */
anychart.linearGaugeModule.pointers.Base.prototype.dataInvalidated_ = function(e) {
  if (e.hasSignal(anychart.Signal.DATA_CHANGED)) {
    this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
  }
};


//endregion
//region --- OWN API ---
/**
 * Returns type of the pointer.
 * @return {string} Pointer type.
 */
anychart.linearGaugeModule.pointers.Base.prototype.getType = goog.abstractMethod;


/**
 * Returns referenced values.
 * @return {Array} Array of values.
 */
anychart.linearGaugeModule.pointers.Base.prototype.getReferenceValues = function() {
  var iterator = this.getIterator();
  var rv = [];
  if (iterator.select(/** @type {number} */ (this.dataIndex()))) {
    for (var i = 0; i < this.referenceValueNames.length; i++) {
      rv.push(iterator.get(this.referenceValueNames[i]));
    }
  }
  return rv;
};


/**
 * Returns pointer index in gauge.
 * @return {number}
 */
anychart.linearGaugeModule.pointers.Base.prototype.getIndex = function() {
  if (this.isDisposed())
    return -1;
  return goog.array.indexOf(this.gauge_.getAllSeries(), this);
};


/**
 * Getter/setter for pointer global index, used in palettes and autoId.
 * @param {number=} opt_value Id of the pointer.
 * @return {number|anychart.linearGaugeModule.pointers.Base} Id or self for chaining.
 */
anychart.linearGaugeModule.pointers.Base.prototype.autoIndex = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.autoIndex_ = opt_value;
    return this;
  }
  return this.autoIndex_;
};


/**
 * Getter/setter for pointer id.
 * @param {(string|number)=} opt_value Id of the pointer.
 * @return {string|number|anychart.linearGaugeModule.pointers.Base} Id or self for chaining.
 */
anychart.linearGaugeModule.pointers.Base.prototype.id = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.id_ = opt_value;
    return this;
  } else {
    return this.id_ || String(this.autoIndex_);
  }
};


/**
 * Data index.
 * @param {number=} opt_index .
 * @return {number|anychart.linearGaugeModule.pointers.Base} Data index or self for chaining.
 */
anychart.linearGaugeModule.pointers.Base.prototype.dataIndex = function(opt_index) {
  if (goog.isDef(opt_index)) {
    if (this.dataIndex_ != opt_index) {
      this.dataIndex_ = opt_index;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return /** @type {number} */(goog.isDefAndNotNull(this.dataIndex_) ? this.dataIndex_ : (this.ownData ? 0 : this.autoIndex()));
  }
};


/**
 * Getter for gauge.
 * @return {anychart.linearGaugeModule.Chart} Gauge.
 */
anychart.linearGaugeModule.pointers.Base.prototype.getGauge = function() {
  return /** @type {anychart.linearGaugeModule.Chart} */(this.gauge());
};


/**
 * Getter/setter for gauge.
 * @param {anychart.linearGaugeModule.Chart=} opt_value Gauge inst for set.
 * @return {anychart.linearGaugeModule.pointers.Base|anychart.linearGaugeModule.Chart}
 */
anychart.linearGaugeModule.pointers.Base.prototype.gauge = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.gauge_ != opt_value) {
      this.gauge_ = opt_value;
    }
    return this;
  } else {
    return this.gauge_;
  }
};


/**
 * Returns own data iterator.
 * @return {!anychart.data.Iterator}
 */
anychart.linearGaugeModule.pointers.Base.prototype.getOwnIterator = function() {
  return this.iterator_ || this.getOwnResetIterator();
};


/**
 * Returns own data reset iterator.
 * @return {!anychart.data.Iterator}
 */
anychart.linearGaugeModule.pointers.Base.prototype.getOwnResetIterator = function() {
  return (this.iterator_ = this.ownData.getIterator());
};


/**
 * Returns gauge iterator.
 * @return {!anychart.data.Iterator} Iterator.
 */
anychart.linearGaugeModule.pointers.Base.prototype.getIterator = function() {
  return this.ownData ? this.getOwnIterator() : this.gauge_.getIterator();
};


/**
 * Returns reset iterator.
 * @return {!anychart.data.Iterator}
 */
anychart.linearGaugeModule.pointers.Base.prototype.getResetIterator = function() {
  return this.ownData ? this.getOwnResetIterator() : this.gauge_.getResetIterator();
};


/**
 * Getter/setter for pointer layout.
 * @param {anychart.enums.Layout=} opt_value Layout.
 * @return {string|anychart.linearGaugeModule.pointers.Base} Layout or self for chaining.
 */
anychart.linearGaugeModule.pointers.Base.prototype.layout = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.layout_ = opt_value;
    return this;
  }
  return this.layout_;
};


/**
 * Getter/setter for pointer scale.
 * @param {anychart.scales.ScatterBase=} opt_value Pointer scale.
 * @return {anychart.linearGaugeModule.pointers.Base|anychart.scales.Base} Scale of self for chaining.
 */
anychart.linearGaugeModule.pointers.Base.prototype.scale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (!(anychart.utils.instanceOf(opt_value, anychart.scales.ScatterBase))) {
      anychart.core.reporting.error(anychart.enums.ErrorCode.INCORRECT_SCALE_TYPE, undefined, ['Pointer scale', 'scatter', 'linear, log']);
      return this;
    }
    if (this.scale_ != opt_value) {
      if (this.scale_)
        this.scale_.unlistenSignals(this.scaleInvalidated, this);
      this.scale_ = opt_value;
      if (this.scale_)
        this.scale_.listenSignals(this.scaleInvalidated, this);
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  if (!this.scale_)
    this.scale(/** @type {anychart.scales.ScatterBase} */ (this.gauge_.scale()));
  return this.scale_;
};


/**
 * Scales invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @protected
 */
anychart.linearGaugeModule.pointers.Base.prototype.scaleInvalidated = function(event) {
  var signal = 0;
  if (event.hasSignal(anychart.Signal.NEEDS_RECALCULATION))
    signal |= anychart.Signal.NEEDS_RECALCULATION;
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION))
    signal |= anychart.Signal.NEEDS_REDRAW;
  else
    this.dispatchSignal(signal);
  this.invalidate(anychart.ConsistencyState.APPEARANCE, signal);
};


/**
 * Util method to identify whether layout is vertical.
 * @return {boolean} Is layout vertical or not.
 */
anychart.linearGaugeModule.pointers.Base.prototype.isVertical = function() {
  return this.layout_ == anychart.enums.Layout.VERTICAL;
};


/**
 * @return {boolean}
 */
anychart.linearGaugeModule.pointers.Base.prototype.isMissing = function() {
  var iterator = this.getIterator();
  var value = iterator.get('value');
  return isNaN(this.scale().transform(value));
};


/**
 * Returns start ratio for pointer.
 * @return {number}
 */
anychart.linearGaugeModule.pointers.Base.prototype.getStartRatio = function() {
  var scale = this.scale();
  var scaleMin = scale.minimum();
  return scale.transform(scaleMin);
};


/**
 * Returns end ratio for pointer.
 * @return {number}
 */
anychart.linearGaugeModule.pointers.Base.prototype.getEndRatio = function() {
  var iterator = this.getIterator();
  iterator.select(/** @type {number} */ (this.dataIndex()));
  var value = iterator.get('value');
  return goog.math.clamp(this.scale().transform(value), 0, 1);
};


/**
 * Label invalidation handler.
 * @param {anychart.SignalEvent} e Signal.
 * @private
 */
anychart.linearGaugeModule.pointers.Base.prototype.labelsInvalidated_ = function(e) {
  if (e.hasSignal(anychart.Signal.NEEDS_REDRAW))
    this.invalidate(anychart.ConsistencyState.GAUGE_POINTER_LABELS, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Creates label format provider.
 * @return {Object}
 */
anychart.linearGaugeModule.pointers.Base.prototype.createLabelContextProvider = function() {
  return this.createFormatProvider();
};


/**
 * Normal state settings.
 * @param {!Object=} opt_value
 * @return {anychart.core.StateSettings|anychart.linearGaugeModule.pointers.Base}
 */
anychart.linearGaugeModule.pointers.Base.prototype.normal = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.normal_.setup(opt_value);
    return this;
  }
  return this.normal_;
};


/**
 * Hovered state settings.
 * @param {!Object=} opt_value
 * @return {anychart.core.StateSettings|anychart.linearGaugeModule.pointers.Base}
 */
anychart.linearGaugeModule.pointers.Base.prototype.hovered = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.hovered_.setup(opt_value);
    return this;
  }
  return this.hovered_;
};


/**
 * Selected state settings.
 * @param {!Object=} opt_value
 * @return {anychart.core.StateSettings|anychart.linearGaugeModule.pointers.Base}
 */
anychart.linearGaugeModule.pointers.Base.prototype.selected = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.selected_.setup(opt_value);
    return this;
  }
  return this.selected_;
};


//endregion
//region --- COLORING ---
/** @inheritDoc */
anychart.linearGaugeModule.pointers.Base.prototype.resolveOption = function(name, state, point, normalizer, scrollerSelected, opt_seriesName, opt_ignorePointSettings) {
  var val;
  var stateObject = state == 0 ? this.normal_ : state == 1 ? this.hovered_ : this.selected_;
  var stateValue = stateObject.getOption(name);
  if (opt_ignorePointSettings) {
    val = stateValue;
  } else {
    var pointStateName = state == 0 ? 'normal' : state == 1 ? 'hovered' : 'selected';
    var pointStateObject = point.get(pointStateName);
    val = anychart.utils.getFirstDefinedValue(
        goog.isDef(pointStateObject) ? pointStateObject[name] : void 0,
        point.get(anychart.color.getPrefixedColorName(state, name)),
        stateValue);
  }
  if (goog.isDef(val))
    val = normalizer(val);
  return val;
};


/** @inheritDoc */
anychart.linearGaugeModule.pointers.Base.prototype.getAutoHatchFill = function() {
  return this.autoHatchFill || acgraph.vector.normalizeHatchFill(anychart.linearGaugeModule.pointers.Base.DEFAULT_HATCH_FILL_TYPE);
};


/** @inheritDoc */
anychart.linearGaugeModule.pointers.Base.prototype.getHatchFillResolutionContext = function(opt_ignorePointSettings) {
  var index = this.getIterator().getIndex();
  var isVertical = this.isVertical();
  var sourceHatchFill = this.getAutoHatchFill();
  return {
    'index': index,
    'isVertical': isVertical,
    'sourceHatchFill': sourceHatchFill
  };
};


/** @inheritDoc */
anychart.linearGaugeModule.pointers.Base.prototype.getColorResolutionContext = function(opt_baseColor, opt_ignorePointSettings, opt_ignoreColorScale) {
  var index = this.getIterator().getIndex();
  var isVertical = this.isVertical();
  var sourceColor = opt_baseColor || this.color();
  return {
    'index': index,
    'isVertical': isVertical,
    'sourceColor': sourceColor
  };
};


/**
 * Getter/setter for current pointers color.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!anychart.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!anychart.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {!(acgraph.vector.Fill|anychart.linearGaugeModule.pointers.Base)} .
 */
anychart.linearGaugeModule.pointers.Base.prototype.color = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var color = goog.isNull(opt_fillOrColorOrKeys) ? null : acgraph.vector.normalizeFill.apply(null, arguments);
    if (this.color_ != color) {
      this.color_ = color;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEED_UPDATE_LEGEND);
    }
    return this;
  }
  return this.color_ || this.autoColor_ || 'blue';
};


/**
 * Sets auto color for pointer.
 * @param {acgraph.vector.Fill} value Auto color.
 */
anychart.linearGaugeModule.pointers.Base.prototype.setAutoColor = function(value) {
  this.autoColor_ = value;
};


/**
 * Sets series hatch fill type that parent chart have set for it.
 * @param {?(acgraph.vector.HatchFill|acgraph.vector.PatternFill)} value Auto hatch fill type distributed by the chart.
 */
anychart.linearGaugeModule.pointers.Base.prototype.setAutoHatchFill = function(value) {
  this.autoHatchFill = /** @type {acgraph.vector.HatchFill} */(acgraph.vector.normalizeHatchFill(value));
};


//endregion
//region --- POSITION/BOUNDS ---


/** @inheritDoc */
anychart.linearGaugeModule.pointers.Base.prototype.invalidateParentBounds = function() {
  this.invalidate(this.BOUNDS_DEPENDENT_STATES);
};


/**
 * Applies ratio to bounds.
 * @param {number} ratio
 * @return {number}
 */
anychart.linearGaugeModule.pointers.Base.prototype.applyRatioToBounds = function(ratio) {
  var bounds = this.parentBounds();
  var min, range;
  if (this.isVertical()) {
    min = bounds.getBottom();
    range = -bounds.height;
  } else {
    min = bounds.left;
    range = bounds.width;
  }
  return min + ratio * range;
};


/**
 * Returns bound reserved for pointer.
 * @param {number} parentWidth Parent width.
 * @param {number} parentHeight Parent height.
 * @return {Array.<number>} Array of reserved bounds(gaps) [left, top, right, bottom].
 */
anychart.linearGaugeModule.pointers.Base.prototype.getReservedBounds = function(parentWidth, parentHeight) {
  return [0, 0, 0, 0];
};


/**
 * Returns bounds of pointer shape.
 * @return {anychart.math.Rect} Pointer's shape bounds.
 */
anychart.linearGaugeModule.pointers.Base.prototype.getPointerBounds = function() {
  return /** @type {anychart.math.Rect} */ (this.pointerBounds);
};


/**
 * Normalizes label position considering layout and scale inversion.
 * @param {anychart.enums.Position} position Label position.
 * @return {anychart.enums.Position} Normalized position.
 */
anychart.linearGaugeModule.pointers.Base.prototype.normalizeLabelPosition = function(position) {
  var isInverted = this.scale().inverted();
  if (this.isVertical()) {
    if (!isInverted) return position;
    else switch (position) {
      case anychart.enums.Position.LEFT_TOP:
        return anychart.enums.Position.LEFT_BOTTOM;

      case anychart.enums.Position.LEFT_CENTER:
        return anychart.enums.Position.LEFT_CENTER;

      case anychart.enums.Position.LEFT_BOTTOM:
        return anychart.enums.Position.LEFT_TOP;

      case anychart.enums.Position.CENTER_TOP:
        return anychart.enums.Position.CENTER_BOTTOM;

      case anychart.enums.Position.CENTER:
        return anychart.enums.Position.CENTER;

      case anychart.enums.Position.CENTER_BOTTOM:
        return anychart.enums.Position.CENTER_TOP;

      case anychart.enums.Position.RIGHT_TOP:
        return anychart.enums.Position.RIGHT_BOTTOM;

      case anychart.enums.Position.RIGHT_CENTER:
        return anychart.enums.Position.RIGHT_CENTER;

      case anychart.enums.Position.RIGHT_BOTTOM:
        return anychart.enums.Position.RIGHT_TOP;
    }
  }

  switch (position) {
    case anychart.enums.Position.LEFT_TOP:
      return isInverted ? anychart.enums.Position.LEFT_TOP : anychart.enums.Position.RIGHT_TOP;

    case anychart.enums.Position.LEFT_CENTER:
      return anychart.enums.Position.CENTER_TOP;

    case anychart.enums.Position.LEFT_BOTTOM:
      return isInverted ? anychart.enums.Position.RIGHT_TOP : anychart.enums.Position.LEFT_TOP;

    case anychart.enums.Position.CENTER_TOP:
      return isInverted ? anychart.enums.Position.LEFT_CENTER : anychart.enums.Position.RIGHT_CENTER;

    case anychart.enums.Position.CENTER:
      return anychart.enums.Position.CENTER;

    case anychart.enums.Position.CENTER_BOTTOM:
      return isInverted ? anychart.enums.Position.RIGHT_CENTER : anychart.enums.Position.LEFT_CENTER;

    case anychart.enums.Position.RIGHT_TOP:
      return isInverted ? anychart.enums.Position.LEFT_BOTTOM : anychart.enums.Position.RIGHT_BOTTOM;

    case anychart.enums.Position.RIGHT_CENTER:
      return anychart.enums.Position.CENTER_BOTTOM;

    case anychart.enums.Position.RIGHT_BOTTOM:
      return isInverted ? anychart.enums.Position.RIGHT_BOTTOM : anychart.enums.Position.LEFT_BOTTOM;
  }
  return position;
};


/**
 * Gets label position
 * @param {anychart.PointState|number} pointerState Pointer state.
 * @return {string} Position settings.
 */
anychart.linearGaugeModule.pointers.Base.prototype.getLabelsPosition = function(pointerState) {
  var selected = this.state.isStateContains(pointerState, anychart.PointState.SELECT);
  var hovered = !selected && this.state.isStateContains(pointerState, anychart.PointState.HOVER);

  var iterator = this.getIterator();

  var pointNormalLabel = iterator.get('normal');
  pointNormalLabel = goog.isDef(pointNormalLabel) ? pointNormalLabel['label'] : void 0;
  var pointHoveredLabel = iterator.get('hovered');
  pointHoveredLabel = goog.isDef(pointHoveredLabel) ? pointHoveredLabel['label'] : void 0;
  var pointSelectedLabel = iterator.get('selected');
  pointSelectedLabel = goog.isDef(pointSelectedLabel) ? pointSelectedLabel['label'] : void 0;

  var pointLabel = anychart.utils.getFirstDefinedValue(pointNormalLabel, iterator.get('label'));
  var hoverPointLabel = hovered ? anychart.utils.getFirstDefinedValue(pointHoveredLabel, iterator.get('hoverLabel')) : null;
  var selectPointLabel = selected ? anychart.utils.getFirstDefinedValue(pointSelectedLabel, iterator.get('selectLabel')) : null;

  var labelPosition = pointLabel && pointLabel['position'] ? pointLabel['position'] : null;
  var labelHoverPosition = hoverPointLabel && hoverPointLabel['position'] ? hoverPointLabel['position'] : null;
  var labelSelectPosition = selectPointLabel && selectPointLabel['position'] ? selectPointLabel['position'] : null;

  var labels = this.normal().labels();
  var hoverLabels = this.hovered().labels();
  var selectLabels = this.selected().labels();

  return /** @type {string} */(hovered || selected ?
      hovered ?
          labelHoverPosition ?
              labelHoverPosition :
              hoverLabels.getOption('position') ?
                  hoverLabels.getOption('position') :
                  labelPosition ?
                      labelPosition :
                      labels.getOption('position') :
          labelSelectPosition ?
              labelSelectPosition :
              selectLabels.getOption('position') ?
                  selectLabels.getOption('position') :
                  labelPosition ?
                      labelPosition :
                      labels.getOption('position') :
      labelPosition ?
          labelPosition :
          labels.getOption('position'));
};


//endregion
//region --- LEGEND ---
/**
 * Creates legend item data.
 * @param {Function} itemsFormat Items text formatter.
 * @return {!anychart.core.ui.Legend.LegendItemProvider} Color for legend item.
 */
anychart.linearGaugeModule.pointers.Base.prototype.getLegendItemData = function(itemsFormat) {
  var legendItem = this.legendItem();
  legendItem.markAllConsistent();
  var json = legendItem.serialize();
  var ctx = {
    'sourceColor': this.color()
  };
  if (goog.isFunction(legendItem.iconFill())) {
    json['iconFill'] = legendItem.iconFill().call(ctx, ctx);
  }
  if (goog.isFunction(legendItem.iconStroke())) {
    json['iconStroke'] = legendItem.iconStroke().call(ctx, ctx);
  }
  if (goog.isFunction(legendItem.iconHatchFill())) {
    ctx['sourceColor'] = this.autoHatchFill;
    json['iconHatchFill'] = legendItem.iconHatchFill().call(ctx, ctx);
  }
  var itemText;
  if (goog.isFunction(itemsFormat)) {
    var format = this.createLegendContextProvider();
    itemText = itemsFormat.call(format, format);
  }
  if (!goog.isString(itemText))
    itemText = goog.isDef(this.getOption('name')) ? this.getOption('name') : 'Pointer: ' + this.autoIndex();

  json['iconType'] = this.getLegendIconType(json['iconType']);

  var ret = {
    'meta': /** @type {Object} */ ({}),
    'text': /** @type {string} */ (itemText),
    'iconEnabled': true,
    'iconStroke': /** @type {acgraph.vector.Stroke} */ (this.strokeResolver(this, anychart.PointState.NORMAL, true)),
    'iconFill': /** @type {acgraph.vector.Fill} */ (this.fillResolver(this, anychart.PointState.NORMAL, true)),
    'iconHatchFill': /** @type {acgraph.vector.PatternFill|acgraph.vector.HatchFill} */ (this.hatchFillResolver(this, anychart.PointState.NORMAL, true)),
    'disabled': !this.enabled()
  };
  goog.object.extend(ret, json);
  return ret;
};


/**
 * Gets legend icon type for the pointer.
 * @param {*} type iconType.
 * @return {anychart.enums.LegendItemIconType} Icon type.
 */
anychart.linearGaugeModule.pointers.Base.prototype.getLegendIconType = function(type) {
  return anychart.enums.normalizeLegendItemIconType(type);
};


/**
 * Creates context provider for legend items text formatter function.
 * @return {Object} Legend context provider.
 * @protected
 */
anychart.linearGaugeModule.pointers.Base.prototype.createLegendContextProvider = function() {
  if (!this.legendProvider) {
    /**
     * Legend context cache.
     * @type {Object}
     */
    this.legendProvider = new anychart.format.Context(void 0, void 0, [this]);
  }
  return this.legendProvider; //nothing to propagate().
};


/**
 * Sets/Gets legend item setting for series.
 * @param {(Object)=} opt_value Legend item settings object.
 * @return {(anychart.core.utils.LegendItemSettings|anychart.linearGaugeModule.pointers.Base)} Legend item settings or self for chaining.
 */
anychart.linearGaugeModule.pointers.Base.prototype.legendItem = function(opt_value) {
  if (!this.legendItem_) {
    this.legendItem_ = new anychart.core.utils.LegendItemSettings();
    this.setupCreated('legendItem', this.legendItem_);
    this.legendItem_.listenSignals(this.onLegendItemSignal, this);
  }
  if (goog.isDef(opt_value)) {
    this.legendItem_.setup(opt_value);
    return this;
  }

  return this.legendItem_;
};


/**
 * Listener for legend item settings invalidation.
 * @param {anychart.SignalEvent} event Invalidation event.
 * @protected
 */
anychart.linearGaugeModule.pointers.Base.prototype.onLegendItemSignal = function(event) {
  var signal = anychart.Signal.NEED_UPDATE_LEGEND;
  var force = false;
  if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    signal |= anychart.Signal.BOUNDS_CHANGED;
    force = true;
  }
  this.dispatchSignal(signal, force);
};


//endregion
//region --- DRAWING ---
/** @inheritDoc */
anychart.linearGaugeModule.pointers.Base.prototype.remove = function() {
  if (this.rootLayer)
    this.rootLayer.parent(null);
  if (this.normal().labels())
    this.normal().labels().remove();
};


/**
 * Draws pointer in vertical layout.
 */
anychart.linearGaugeModule.pointers.Base.prototype.drawVertical = goog.nullFunction;


/**
 * Draws pointer in horizontal layout.
 */
anychart.linearGaugeModule.pointers.Base.prototype.drawHorizontal = goog.nullFunction;


/**
 * Apply fill, stroke and hatch fill to pointer.
 * @param {number|anychart.PointState} pointerState Pointer state.
 */
anychart.linearGaugeModule.pointers.Base.prototype.colorizePointer = function(pointerState) {
  var fill = /** @type {acgraph.vector.Fill} */ (this.fillResolver(this, pointerState, false));
  var stroke = /** @type {acgraph.vector.Stroke} */ (this.strokeResolver(this, pointerState, false));
  var hatch = /** @type {acgraph.vector.Fill} */ (this.hatchFillResolver(this, pointerState, false));

  this.path.fill(fill);
  this.path.stroke(stroke);

  this.hatch.fill(hatch);
  this.hatch.stroke('none');
};


/**
 * Create shapes for pointer.
 */
anychart.linearGaugeModule.pointers.Base.prototype.createShapes = function() {
  if (!this.path) {
    this.path = this.rootLayer.path();
    this.makeInteractive(this.path);
  } else
    this.path.clear();

  if (!this.hatch) {
    this.hatch = this.rootLayer.path();
    this.hatch.disablePointerEvents(true);
  } else
    this.hatch.clear();
};


/**
 * Draws pointer label.
 * @param {anychart.PointState|number} pointerState Pointer state.
 */
anychart.linearGaugeModule.pointers.Base.prototype.drawLabel = function(pointerState) {
  var iterator = this.getIterator();
  var selected = this.state.isStateContains(pointerState, anychart.PointState.SELECT);
  var hovered = !selected && this.state.isStateContains(pointerState, anychart.PointState.HOVER);

  var labels = this.normal().labels();
  var hoverLabels = this.hovered().labels();
  var selectLabels = this.selected().labels();
  var labelsFactory;
  if (selected) {
    labelsFactory = /** @type {anychart.core.ui.LabelsFactory} */(selectLabels);
  } else if (hovered) {
    labelsFactory = /** @type {anychart.core.ui.LabelsFactory} */(hoverLabels);
  } else {
    labelsFactory = null;
  }

  var label = this.normal().labels().getLabel(0);
  var pointNormalLabel = iterator.get('normal');
  pointNormalLabel = goog.isDef(pointNormalLabel) ? pointNormalLabel['label'] : void 0;
  var pointHoveredLabel = iterator.get('hovered');
  pointHoveredLabel = goog.isDef(pointHoveredLabel) ? pointHoveredLabel['label'] : void 0;
  var pointSelectedLabel = iterator.get('selected');
  pointSelectedLabel = goog.isDef(pointSelectedLabel) ? pointSelectedLabel['label'] : void 0;

  var pointLabel = anychart.utils.getFirstDefinedValue(pointNormalLabel, iterator.get('label'));
  var hoverPointLabel = hovered ? anychart.utils.getFirstDefinedValue(pointHoveredLabel, iterator.get('hoverLabel')) : null;
  var selectPointLabel = selected ? anychart.utils.getFirstDefinedValue(pointSelectedLabel, iterator.get('selectLabel')) : null;

  var labelEnabledState = pointLabel && goog.isDef(pointLabel['enabled']) ? pointLabel['enabled'] : null;
  var labelSelectEnabledState = selectPointLabel && goog.isDef(selectPointLabel['enabled']) ? selectPointLabel['enabled'] : null;
  var labelHoverEnabledState = hoverPointLabel && goog.isDef(hoverPointLabel['enabled']) ? hoverPointLabel['enabled'] : null;
  var isDraw;
  isDraw = hovered || selected ?
      hovered ?
          goog.isNull(labelHoverEnabledState) ?
              goog.isNull(hoverLabels.enabled()) ?
                  goog.isNull(labelEnabledState) ?
                      labels.enabled() :
                      labelEnabledState :
                  hoverLabels.enabled() :
              labelHoverEnabledState :
          goog.isNull(labelSelectEnabledState) ?
              goog.isNull(selectLabels.enabled()) ?
                  goog.isNull(labelEnabledState) ?
                      labels.enabled() :
                      labelEnabledState :
                  selectLabels.enabled() :
              labelSelectEnabledState :
      goog.isNull(labelEnabledState) ?
          labels.enabled() :
          labelEnabledState;

  if (isDraw) {
    var position = this.normalizeLabelPosition(anychart.enums.normalizePosition(this.getLabelsPosition(pointerState)));
    var bounds = this.getPointerBounds();
    var positionProvider = {'value': anychart.utils.getCoordinateByAnchor(bounds, position)};
    var formatProvider = this.createLabelContextProvider();
    if (label) {
      labels.dropCallsCache(0);
      label.formatProvider(formatProvider);
      label.positionProvider(positionProvider);
    } else {
      label = labels.add(formatProvider, positionProvider, 0);
    }

    label.resetSettings();
    label.currentLabelsFactory(/** @type {anychart.core.ui.LabelsFactory} */ (labelsFactory));
    label.setSettings(/** @type {Object} */(pointLabel), /** @type {Object} */(hovered ? hoverPointLabel : selectPointLabel));
    label.draw();
  } else if (label) {
    labels.clear(label.getIndex());
  }
};


/**
 * Draws a pointer.
 * @return {anychart.linearGaugeModule.pointers.Base} Self.
 */
anychart.linearGaugeModule.pointers.Base.prototype.draw = function() {
  if (!this.checkDrawingNeeded())
    return this;

  var container = /** @type {acgraph.vector.ILayer} */(this.container());

  if (!this.rootLayer) {
    this.rootLayer = acgraph.layer();
    this.bindHandlersToGraphics(this.rootLayer);
  }

  var labels = this.normal().labels();
  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    this.rootLayer.zIndex(/** @type {number} */ (this.zIndex()));
    if (labels)
      labels.zIndex(/** @type {number} */ (this.zIndex()));
    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    this.rootLayer.parent(container);
    if (labels)
      labels.container(container);
    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }

  var iterator = this.getIterator();
  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    this.createShapes();
    if (iterator.select(/** @type {number} */ (this.dataIndex())) && !this.isMissing()) {
      if (this.isVertical())
        this.drawVertical();
      else
        this.drawHorizontal();
      this.colorizePointer(this.state.getPointStateByIndex(0));
    }
    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.GAUGE_POINTER_LABELS)) {
    if (iterator.select(/** @type {number} */ (this.dataIndex()))) {
      this.drawLabel(this.state.getPointStateByIndex(/** @type {number} */ (0)));
      labels.draw();
    } else {
      labels.clear();
    }
    this.markConsistent(anychart.ConsistencyState.GAUGE_POINTER_LABELS);
  }

  return this;
};


//endregion
//region --- IINTERACTIVESERIES IMPLEMENTATION ---
/** @inheritDoc */
anychart.linearGaugeModule.pointers.Base.prototype.hoverMode = function(opt_value) {
  if (goog.isDef(opt_value)) {
    return this;
  }
  return /** @type {anychart.enums.HoverMode} */((/** @type {anychart.linearGaugeModule.Chart} */(this.gauge_)).interactivity().getOption('hoverMode'));
};


/**
 * @param {(anychart.enums.SelectionMode|string|null)=} opt_value Selection mode.
 * @return {anychart.linearGaugeModule.pointers.Base|anychart.enums.SelectionMode|null} .
 */
anychart.linearGaugeModule.pointers.Base.prototype.selectionMode = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = goog.isNull(opt_value) ? null : anychart.enums.normalizeSelectMode(opt_value);
    if (opt_value != this.selectionMode_) {
      this.selectionMode_ = opt_value;
    }
    return this;
  }
  return /** @type {anychart.enums.SelectionMode} */(this.selectionMode_);
};


/** @inheritDoc */
anychart.linearGaugeModule.pointers.Base.prototype.isDiscreteBased = function() {
  return true;
};


/** @inheritDoc */
anychart.linearGaugeModule.pointers.Base.prototype.isSizeBased = function() {
  return false;
};


/** @inheritDoc */
anychart.linearGaugeModule.pointers.Base.prototype.applyAppearanceToSeries = function(pointState) {
  this.colorizePointer(pointState);
};


/** @inheritDoc */
anychart.linearGaugeModule.pointers.Base.prototype.applyAppearanceToPoint = function(pointState, opt_value) {
  this.colorizePointer(pointState);
  this.drawLabel(pointState);

  return opt_value;
};


/** @inheritDoc */
anychart.linearGaugeModule.pointers.Base.prototype.getStartValueForAppearanceReduction = goog.nullFunction;


/** @inheritDoc */
anychart.linearGaugeModule.pointers.Base.prototype.finalizePointAppearance = goog.nullFunction;


//endregion
//region --- INTERACTIVITY ---
/**
 * Is it series?
 * @return {boolean} Series or not.
 */
anychart.linearGaugeModule.pointers.Base.prototype.isSeries = function() {
  return true;
};


/**
 * Temporarily works only for acgraph.vector.Element.
 * @param {acgraph.vector.Element} element .
 * @protected
 */
anychart.linearGaugeModule.pointers.Base.prototype.makeInteractive = function(element) {
  if (!element) return;
  element.tag = {
    series: this,
    index: 0
  };
};


/** @inheritDoc */
anychart.linearGaugeModule.pointers.Base.prototype.handleMouseEvent = function(event) {
  var evt = this.makePointEvent(event);
  if (evt)
    this.dispatchEvent(evt);
};


/**
 * This method also has a side effect - it patches the original source event to maintain pointIndex support for
 * browser events.
 * @param {anychart.core.MouseEvent} event
 * @return {Object} An object of event to dispatch. If null - unrecognized type was found.
 */
anychart.linearGaugeModule.pointers.Base.prototype.makePointEvent = function(event) {
  var type = event['type'];
  switch (type) {
    case acgraph.events.EventType.MOUSEOUT:
      type = anychart.enums.EventType.POINT_MOUSE_OUT;
      break;
    case acgraph.events.EventType.MOUSEOVER:
      type = anychart.enums.EventType.POINT_MOUSE_OVER;
      break;
    case acgraph.events.EventType.MOUSEMOVE:
      type = anychart.enums.EventType.POINT_MOUSE_MOVE;
      break;
    case acgraph.events.EventType.MOUSEDOWN:
      type = anychart.enums.EventType.POINT_MOUSE_DOWN;
      break;
    case acgraph.events.EventType.MOUSEUP:
      type = anychart.enums.EventType.POINT_MOUSE_UP;
      break;
    case acgraph.events.EventType.CLICK:
    case acgraph.events.EventType.TOUCHSTART:
      type = anychart.enums.EventType.POINT_CLICK;
      break;
    case acgraph.events.EventType.DBLCLICK:
      type = anychart.enums.EventType.POINT_DBLCLICK;
      break;
    default:
      return null;
  }

  var pointIndex = /** @type {number} */(0);
  event['pointIndex'] = pointIndex;

  var iter = this.getResetIterator();
  if (!iter.select(/** @type {number} */ (this.dataIndex())))
    iter.reset();

  return {
    'type': type,
    'actualTarget': event['target'],
    'series': this,
    'iterator': iter,
    'pointIndex': pointIndex,
    'target': this,
    'originalEvent': event
    //'point': this.getPoint(pointIndex)
  };
};


/**
 * Create base pointer format provider.
 * @param {boolean=} opt_force create context provider forcibly.
 * @return {Object} Object with info for formatting.
 */
anychart.linearGaugeModule.pointers.Base.prototype.createFormatProvider = function(opt_force) {
  this.getIterator().select(/** @type {number} */ (this.dataIndex()));

  if (!this.pointProvider_ || opt_force)
    this.pointProvider_ = new anychart.format.Context();

  var iterator = this.getIterator();
  var values = {
    'pointer': {value: this, type: anychart.enums.TokenType.UNKNOWN},
    'index': {value: iterator.getIndex(), type: anychart.enums.TokenType.NUMBER},
    'value': {value: iterator.get('value'), type: anychart.enums.TokenType.NUMBER},
    'name': {value: this.getOption('name') || 'Pointer ' + this.autoIndex(), type: anychart.enums.TokenType.STRING},
    'high': {value: iterator.get('high'), type: anychart.enums.TokenType.NUMBER},
    'low': {value: iterator.get('low'), type: anychart.enums.TokenType.NUMBER}
  };

  this.pointProvider_.dataSource(iterator);

  return this.pointProvider_.propagate(values);
};


/**
 * Creates tooltip format provider.
 * @return {Object}
 */
anychart.linearGaugeModule.pointers.Base.prototype.createTooltipContextProvider = function() {
  return this.createFormatProvider();
};


/**
 * Unhover pointer.
 * @return {anychart.linearGaugeModule.pointers.Base} Self for chaining.
 */
anychart.linearGaugeModule.pointers.Base.prototype.unhover = function() {
  if (!(this.state.hasPointState(anychart.PointState.HOVER) ||
      this.state.isStateContains(this.state.getSeriesState(), anychart.PointState.HOVER)) ||
      !this.enabled())
    return this;

  this.state.removePointState(anychart.PointState.HOVER, this.state.seriesState == anychart.PointState.NORMAL ? NaN : undefined);

  return this;
};


/**
 * Hovers a pointer.
 * @param {number=} opt_index Index of the point to hover.
 * @return {anychart.linearGaugeModule.pointers.Base} Self for chaining.
 */
anychart.linearGaugeModule.pointers.Base.prototype.hoverPoint = function(opt_index) {
  if (!this.enabled())
    return this;

  if (!goog.isDefAndNotNull(opt_index))
    opt_index = /** @type {number} */ (0);

  if (goog.isNumber(opt_index)) {
    this.unhover();
    this.state.addPointState(anychart.PointState.HOVER, 0);
  }
  return this;
};


/**
 * Hovers a pointer.
 * @return {anychart.linearGaugeModule.pointers.Base} Self for chaining.
 */
anychart.linearGaugeModule.pointers.Base.prototype.hoverSeries = function() {
  if (!this.enabled())
    return this;

  this.state.setPointState(anychart.PointState.HOVER);

  return this;
};


/**
 * Deselects pointer.
 * @return {anychart.linearGaugeModule.pointers.Base} Self for chaining.
 */
anychart.linearGaugeModule.pointers.Base.prototype.unselect = function() {
  if (!this.enabled())
    return this;

  this.state.removePointState(anychart.PointState.SELECT, this.state.seriesState == anychart.PointState.NORMAL ? NaN : undefined);

  return this;
};


/**
 * Selects a pointer.
 * @param {number=} opt_index Index of the point to hover.
 * @param {anychart.core.MouseEvent=} opt_event Event that initiate point selecting.
 * @return {anychart.linearGaugeModule.pointers.Base} Self for chaining.
 */
anychart.linearGaugeModule.pointers.Base.prototype.selectPoint = function(opt_index, opt_event) {
  if (!this.enabled())
    return this;

  if (!goog.isDefAndNotNull(opt_index))
    opt_index = /** @type {number} */ (0);
  var unselect;
  if (goog.isDef(opt_event))
    unselect = !(opt_event && opt_event.shiftKey);

  if (goog.isNumber(opt_index)) {
    this.state.setPointState(anychart.PointState.SELECT, 0, unselect ? anychart.PointState.HOVER : undefined);
  }

  return this;
};


/**
 * Selects pointer.
 * @return {anychart.linearGaugeModule.pointers.Base} Self for chaining.
 */
anychart.linearGaugeModule.pointers.Base.prototype.selectSeries = function() {
  if (!this.enabled())
    return this;

  this.state.setPointState(anychart.PointState.SELECT);

  return this;
};


//endregion
//region --- DESCRIPTORS
/**
 * Properties that should be defined in series.Base prototype.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.linearGaugeModule.pointers.Base.OWN_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};
  anychart.core.settings.createDescriptors(map, [
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'name', anychart.core.settings.asIsNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'width', anychart.utils.normalizeToPercent],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'offset', anychart.utils.normalizeToPercent]
  ]);
  return map;
})();
anychart.core.settings.populate(anychart.linearGaugeModule.pointers.Base, anychart.linearGaugeModule.pointers.Base.OWN_DESCRIPTORS);


//endregion
//region --- JSON/DISPOSING ---
/** @inheritDoc */
anychart.linearGaugeModule.pointers.Base.prototype.serialize = function() {
  var json = anychart.linearGaugeModule.pointers.Base.base(this, 'serialize');
  anychart.core.settings.serialize(this, anychart.linearGaugeModule.pointers.Base.OWN_DESCRIPTORS, json, 'Pointer');
  json['pointerType'] = this.getType();
  if (this.ownData) {
    json['data'] = this.data().serialize();
  }
  if (goog.isDef(this.dataIndex_))
    json['dataIndex'] = this.dataIndex_;
  json['legendItem'] = this.legendItem().serialize();

  if (this.id_)
    json['id'] = this.id();

  if (this.autoIndex_ != this.getIndex())
    json['autoIndex'] = this.autoIndex();

  if (this.color_)
    json['color'] = anychart.color.serialize(/** @type {acgraph.vector.Fill} */(this.color_));
  json['normal'] = this.normal().serialize();
  json['hovered'] = this.hovered().serialize();
  json['selected'] = this.selected().serialize();
  return json;
};


/** @inheritDoc */
anychart.linearGaugeModule.pointers.Base.prototype.setupByJSON = function(config, opt_default) {
  anychart.linearGaugeModule.pointers.Base.base(this, 'setupByJSON', config, opt_default);

  this.id(config['id']);
  this.autoIndex(config['autoIndex']);
  this.dataIndex(config['dataIndex']);
  if ('data' in config)
    this.data(config['data'] || null);
  this.legendItem().setup(config['legendItem']);

  anychart.core.settings.deserialize(this, anychart.linearGaugeModule.pointers.Base.OWN_DESCRIPTORS, config, opt_default);

  this.color(config['color']);
  this.normal_.setupInternal(!!opt_default, config);
  this.normal_.setupInternal(!!opt_default, config['normal']);
  this.hovered_.setupInternal(!!opt_default, config['hovered']);
  this.selected_.setupInternal(!!opt_default, config['selected']);
};


/**
 * Sets up state settings with flat themes.
 */
anychart.linearGaugeModule.pointers.Base.prototype.setupStateSettings = function() {
  this.normal_.addThemes(this.themeSettings);
  this.setupCreated('normal', this.normal_);
  this.normal_.setupInternal(true, {});

  this.setupCreated('hovered', this.hovered_);
  this.hovered_.setupInternal(true, {});

  this.setupCreated('selected', this.selected_);
  this.selected_.setupInternal(true, {});
};


/** @inheritDoc */
anychart.linearGaugeModule.pointers.Base.prototype.disposeInternal = function() {
  goog.disposeAll(this.path, this.hatch);
  this.path = null;
  this.hatch = null;

  goog.dispose(this.rootLayer);
  this.rootLayer = null;

  if (this.scale_)
    this.scale_.unlistenSignals(this.scaleInvalidated, this);
  this.scale_ = null;

  goog.disposeAll(this.normal_, this.hovered_, this.selected_);
  this.normal_ = null;
  this.hovered_ = null;
  this.selected_ = null;

  goog.dispose(this.legendItem_);
  this.legendItem_ = null;

  anychart.linearGaugeModule.pointers.Base.base(this, 'disposeInternal');
};
//endregion

//exports
(function() {
  var proto = anychart.linearGaugeModule.pointers.Base.prototype;
  proto['scale'] = proto.scale;
  proto['legendItem'] = proto.legendItem;
  proto['id'] = proto.id;
  proto['dataIndex'] = proto.dataIndex;
  proto['getGauge'] = proto.getGauge;
  proto['color'] = proto.color;

  proto['data'] = proto.data;

  proto['normal'] = proto.normal;
  proto['hovered'] = proto.hovered;
  proto['selected'] = proto.selected;
  // auto generated
  //proto['name'] = proto.name;
  //proto['width'] = proto.width;
  //proto['offset'] = proto.offset;

  proto['hover'] = proto.hoverPoint;
  proto['unhover'] = proto.unhover;
  proto['select'] = proto.selectPoint;
  proto['unselect'] = proto.unselect;
})();
