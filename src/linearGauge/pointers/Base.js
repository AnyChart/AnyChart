goog.provide('anychart.linearGaugeModule.pointers.Base');

goog.require('anychart.core.VisualBase');
goog.require('anychart.core.ui.LabelsFactory');
goog.require('anychart.core.utils.IInteractiveSeries');
goog.require('anychart.core.utils.LegendItemSettings');
goog.require('anychart.core.utils.LinearGaugeInteractivityState');
goog.require('anychart.format.Context');



/**
 * Base class for pointers.
 * @param {anychart.linearGaugeModule.Chart} gauge Gauge.
 * @param {number} dataIndex Pointer data index.
 * @extends {anychart.core.VisualBase}
 * @implements {anychart.core.utils.IInteractiveSeries}
 * @constructor
 */
anychart.linearGaugeModule.pointers.Base = function(gauge, dataIndex) {
  anychart.linearGaugeModule.pointers.Base.base(this, 'constructor');

  /**
   * Gauge.
   * @type {anychart.linearGaugeModule.Chart}
   * @protected
   */
  this.gauge = gauge;

  /**
   * Pointer data index.
   * @type {number}
   * @private
   */
  this.dataIndex_ = dataIndex;

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
  this.BOUNDS_DEPENDENT_STATES = anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.GAUGE_POINTER_LABEL;
};
goog.inherits(anychart.linearGaugeModule.pointers.Base, anychart.core.VisualBase);


//region --- STATES / SIGNALS ---
/**
 * Supported signals.
 * @type {number}
 */
anychart.linearGaugeModule.pointers.Base.prototype.SUPPORTED_SIGNALS =
    anychart.core.VisualBase.prototype.SUPPORTED_SIGNALS |
    anychart.Signal.NEED_UPDATE_LEGEND;


/**
 * Supported states.
 * @type {number}
 */
anychart.linearGaugeModule.pointers.Base.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.VisualBase.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.APPEARANCE |
    anychart.ConsistencyState.GAUGE_POINTER_LABEL;


//endregion
//region --- PROPERTIES ---
/**
 * Default hatch fill type.
 * @type {acgraph.vector.HatchFill.HatchFillType|string}
 */
anychart.linearGaugeModule.pointers.Base.DEFAULT_HATCH_FILL_TYPE = acgraph.vector.HatchFill.HatchFillType.DIAGONAL_BRICK;


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
 * Getter/setter for pointer name.
 * @param {string=} opt_value Pointer name.
 * @return {string|anychart.linearGaugeModule.pointers.Base}
 */
anychart.linearGaugeModule.pointers.Base.prototype.name = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.name_ != opt_value) {
      this.name_ = opt_value;
      this.dispatchSignal(anychart.Signal.NEED_UPDATE_LEGEND);
    }
    return this;
  }
  return this.name_;
};


/**
 * Returns series index in chart.
 * @return {number}
 */
anychart.linearGaugeModule.pointers.Base.prototype.getIndex = function() {
  if (this.isDisposed())
    return -1;
  return goog.array.indexOf(this.gauge.getAllSeries(), this);
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
    return this.dataIndex_;
  }
};


/**
 * Getter/setter for gauge.
 * @return {anychart.linearGaugeModule.Chart} Gauge.
 */
anychart.linearGaugeModule.pointers.Base.prototype.getGauge = function() {
  return this.gauge;
};


/**
 * Returns gauge iterator.
 * @return {!anychart.data.Iterator} Iterator.
 */
anychart.linearGaugeModule.pointers.Base.prototype.getIterator = function() {
  return this.gauge.getIterator();
};


/**
 * Returns reset iterator.
 * @return {!anychart.data.Iterator}
 */
anychart.linearGaugeModule.pointers.Base.prototype.getResetIterator = function() {
  return this.gauge.data().getIterator();
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
    if (!(opt_value instanceof anychart.scales.ScatterBase)) {
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
    this.scale(/** @type {anychart.scales.ScatterBase} */ (this.gauge.scale()));
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
  var iterator = this.gauge.getIterator();
  iterator.select(/** @type {number} */ (this.dataIndex()));
  var value = iterator.get('value');
  return goog.math.clamp(this.scale().transform(value), 0, 1);
};


/**
 * Pointer label.
 * @param {(anychart.core.ui.LabelsFactory|Object)=} opt_value Pointer label.
 * @return {anychart.core.ui.LabelsFactory|anychart.linearGaugeModule.pointers.Base} Label or self for chaining.
 */
anychart.linearGaugeModule.pointers.Base.prototype.label = function(opt_value) {
  if (!this.label_) {
    this.label_ = new anychart.core.ui.LabelsFactory();
    this.label_.setParentEventTarget(this);
    this.label_.listenSignals(this.onLabelSignal_, this);
  }
  if (goog.isDef(opt_value)) {
    this.label_.setup(opt_value);
    this.invalidate(anychart.ConsistencyState.GAUGE_POINTER_LABEL, anychart.Signal.NEEDS_REDRAW);
    return this;
  }
  return this.label_;
};


/**
 * Pointer hover label.
 * @param {(anychart.core.ui.LabelsFactory|Object)=} opt_value Pointer label.
 * @return {anychart.core.ui.LabelsFactory|anychart.linearGaugeModule.pointers.Base} Label or self for chaining.
 */
anychart.linearGaugeModule.pointers.Base.prototype.hoverLabel = function(opt_value) {
  if (!this.hoverLabel_) {
    this.hoverLabel_ = new anychart.core.ui.LabelsFactory();
  }
  if (goog.isDef(opt_value)) {
    if (goog.isObject(opt_value) && !('enabled' in opt_value))
      opt_value['enabled'] = true;
    this.hoverLabel_.setup(opt_value);
    return this;
  }
  return this.hoverLabel_;
};


/**
 * Pointer select label.
 * @param {(anychart.core.ui.LabelsFactory|Object)=} opt_value Pointer label.
 * @return {anychart.core.ui.LabelsFactory|anychart.linearGaugeModule.pointers.Base} Label or self for chaining.
 */
anychart.linearGaugeModule.pointers.Base.prototype.selectLabel = function(opt_value) {
  if (!this.selectLabel_) {
    this.selectLabel_ = new anychart.core.ui.LabelsFactory();
  }

  if (goog.isDef(opt_value)) {
    if (goog.isObject(opt_value) && !('enabled' in opt_value))
      opt_value['enabled'] = true;
    this.selectLabel_.setup(opt_value);
    return this;
  }
  return this.selectLabel_;
};


/**
 * Label invalidation handler.
 * @param {anychart.SignalEvent} e Signal.
 * @private
 */
anychart.linearGaugeModule.pointers.Base.prototype.onLabelSignal_ = function(e) {
  if (e.hasSignal(anychart.Signal.NEEDS_REDRAW))
    this.invalidate(anychart.ConsistencyState.GAUGE_POINTER_LABEL, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Creates label format provider.
 * @return {Object}
 */
anychart.linearGaugeModule.pointers.Base.prototype.createLabelContextProvider = function() {
  return this.createFormatProvider();
};


//endregion
//region --- COLOR/HATCH ---
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
 * Gets final normalized fill or stroke color.
 * @param {acgraph.vector.Fill|acgraph.vector.Stroke|Function} color Normal state color.
 * @param {...(acgraph.vector.Fill|acgraph.vector.Stroke|Function)} var_args .
 * @return {!(acgraph.vector.Fill|acgraph.vector.Stroke)} Normalized color.
 * @protected
 */
anychart.linearGaugeModule.pointers.Base.prototype.normalizeColor = function(color, var_args) {
  var fill;
  if (goog.isFunction(color)) {
    var sourceColor = arguments.length > 1 ?
        this.normalizeColor.apply(this, goog.array.slice(arguments, 1)) :
        this.color();
    var scope = {
      'index': this.getIterator().getIndex(),
      'sourceColor': sourceColor,
      'isVertical': this.isVertical()
    };
    fill = color.call(scope);
  } else
    fill = color;
  return fill;
};


/**
 * Pointer fill.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|Function|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!anychart.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!anychart.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {(!anychart.linearGaugeModule.pointers.Base|acgraph.vector.Fill|Function)} .
 */
anychart.linearGaugeModule.pointers.Base.prototype.fill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var fill = goog.isFunction(opt_fillOrColorOrKeys) ?
        opt_fillOrColorOrKeys :
        acgraph.vector.normalizeFill.apply(null, arguments);
    if (fill != this.fill_) {
      this.fill_ = fill;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEED_UPDATE_LEGEND);
    }
    return this;
  }
  return this.fill_;
};


/**
 * Pointer hover fill.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|Function|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!anychart.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!anychart.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {(!anychart.linearGaugeModule.pointers.Base|acgraph.vector.Fill|Function)} .
 */
anychart.linearGaugeModule.pointers.Base.prototype.hoverFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    this.hoverFill_ = goog.isFunction(opt_fillOrColorOrKeys) ?
        opt_fillOrColorOrKeys :
        acgraph.vector.normalizeFill.apply(null, arguments);
    return this;
  }
  return this.hoverFill_;
};


/**
 * Pointer select fill.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|Function|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!anychart.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!anychart.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {(!anychart.linearGaugeModule.pointers.Base|acgraph.vector.Fill|Function)} .
 */
anychart.linearGaugeModule.pointers.Base.prototype.selectFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    this.selectFill_ = goog.isFunction(opt_fillOrColorOrKeys) ?
        opt_fillOrColorOrKeys :
        acgraph.vector.normalizeFill.apply(null, arguments);
    return this;
  }
  return this.selectFill_;
};


/**
 * Method that gets final fill color for the pointer, with all fallbacks taken into account.
 * @param {boolean} usePointSettings If point settings should count too (iterator questioning).
 * @param {anychart.PointState|number} pointState Point state.
 * @return {!acgraph.vector.Fill} Final hover stroke for the current row.
 * @protected
 */
anychart.linearGaugeModule.pointers.Base.prototype.getFinalFill = function(usePointSettings, pointState) {
  var iterator = this.getIterator();
  iterator.select(/** @type {number} */ (this.dataIndex()));
  var normalColor = /** @type {acgraph.vector.Fill|Function} */((usePointSettings && iterator.get('fill')) || this.fill());
  var result;
  if (this.state.isStateContains(pointState, anychart.PointState.SELECT)) {
    result = this.normalizeColor(
        /** @type {acgraph.vector.Fill|Function} */(
        (usePointSettings && iterator.get('selectFill')) || this.selectFill() || normalColor),
        normalColor);
  } else if (this.state.isStateContains(pointState, anychart.PointState.HOVER)) {
    result = this.normalizeColor(
        /** @type {acgraph.vector.Fill|Function} */(
        (usePointSettings && iterator.get('hoverFill')) || this.hoverFill() || normalColor),
        normalColor);
  } else {
    result = this.normalizeColor(normalColor);
  }

  return acgraph.vector.normalizeFill(/** @type {!acgraph.vector.Fill} */(result));
};


/**
 * Pointer stroke.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|Function|string|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line joint style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {(!anychart.linearGaugeModule.pointers.Base|acgraph.vector.Stroke|Function)} .
 */
anychart.linearGaugeModule.pointers.Base.prototype.stroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var stroke = goog.isFunction(opt_strokeOrFill) ?
        opt_strokeOrFill :
        acgraph.vector.normalizeStroke.apply(null, arguments);
    if (stroke != this.stroke_) {
      this.stroke_ = stroke;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEED_UPDATE_LEGEND);
    }
    return this;
  }
  return this.stroke_;
};


/**
 * Pointer hover stroke.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|Function|string|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line joint style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {(!anychart.linearGaugeModule.pointers.Base|acgraph.vector.Stroke|Function)} .
 */
anychart.linearGaugeModule.pointers.Base.prototype.hoverStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    this.hoverStroke_ = goog.isFunction(opt_strokeOrFill) ?
        opt_strokeOrFill :
        acgraph.vector.normalizeStroke.apply(null, arguments);
    return this;
  }
  return this.hoverStroke_;
};


/**
 * Pointer select stroke.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|Function|string|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line joint style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {(!anychart.linearGaugeModule.pointers.Base|acgraph.vector.Stroke|Function)} .
 */
anychart.linearGaugeModule.pointers.Base.prototype.selectStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    this.selectStroke_ = goog.isFunction(opt_strokeOrFill) ?
        opt_strokeOrFill :
        acgraph.vector.normalizeStroke.apply(null, arguments);
    return this;
  }
  return this.selectStroke_;
};


/**
 * Method that gets final stroke color for the pointer, with all fallbacks taken into account.
 * @param {boolean} usePointSettings If point settings should count too (iterator questioning).
 * @param {anychart.PointState|number} pointState Point state.
 * @return {!acgraph.vector.Stroke} Final hover stroke for the current row.
 * @protected
 */
anychart.linearGaugeModule.pointers.Base.prototype.getFinalStroke = function(usePointSettings, pointState) {
  var iterator = this.getIterator();
  iterator.select(/** @type {number} */ (this.dataIndex()));
  var normalColor = /** @type {acgraph.vector.Stroke|Function} */((usePointSettings && iterator.get('stroke')) || this.stroke());
  var result;
  if (this.state.isStateContains(pointState, anychart.PointState.SELECT)) {
    result = this.normalizeColor(
        /** @type {acgraph.vector.Stroke|Function} */(
        (usePointSettings && iterator.get('selectStroke')) || this.selectStroke() || normalColor),
        normalColor);
  } else if (this.state.isStateContains(pointState, anychart.PointState.HOVER)) {
    result = this.normalizeColor(
        /** @type {acgraph.vector.Stroke|Function} */(
        (usePointSettings && iterator.get('hoverStroke')) || this.hoverStroke() || normalColor),
        normalColor);
  } else {
    result = this.normalizeColor(normalColor);
  }

  return acgraph.vector.normalizeStroke(/** @type {!acgraph.vector.Stroke} */(result));
};


/**
 * Pointer hatch fill.
 * @param {(acgraph.vector.PatternFill|acgraph.vector.HatchFill|acgraph.vector.HatchFill.HatchFillType|
 * string|boolean)=} opt_patternFillOrTypeOrState PatternFill or HatchFill instance or type or state of hatch fill.
 * @param {string=} opt_color Color.
 * @param {number=} opt_thickness Thickness.
 * @param {number=} opt_size Pattern size.
 * @return {acgraph.vector.PatternFill|acgraph.vector.HatchFill|anychart.linearGaugeModule.pointers.Base|boolean} Hatch fill.
 */
anychart.linearGaugeModule.pointers.Base.prototype.hatchFill = function(opt_patternFillOrTypeOrState, opt_color, opt_thickness, opt_size) {
  if (goog.isDef(opt_patternFillOrTypeOrState)) {
    var hatchFill = goog.isFunction(opt_patternFillOrTypeOrState) || goog.isBoolean(opt_patternFillOrTypeOrState) ?
        opt_patternFillOrTypeOrState :
        acgraph.vector.normalizeHatchFill.apply(null, arguments);

    if (hatchFill != this.hatchFill_) {
      this.hatchFill_ = hatchFill;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEED_UPDATE_LEGEND);
    }
    return this;
  }
  return this.hatchFill_;
};


/**
 * Pointer hover hatch fill.
 * @param {(acgraph.vector.PatternFill|acgraph.vector.HatchFill|acgraph.vector.HatchFill.HatchFillType|
 * string|boolean)=} opt_patternFillOrTypeOrState PatternFill or HatchFill instance or type or state of hatch fill.
 * @param {string=} opt_color Color.
 * @param {number=} opt_thickness Thickness.
 * @param {number=} opt_size Pattern size.
 * @return {acgraph.vector.PatternFill|acgraph.vector.HatchFill|anychart.linearGaugeModule.pointers.Base|boolean} Hatch fill.
 */
anychart.linearGaugeModule.pointers.Base.prototype.hoverHatchFill = function(opt_patternFillOrTypeOrState, opt_color, opt_thickness, opt_size) {
  if (goog.isDef(opt_patternFillOrTypeOrState)) {
    var hatchFill = goog.isFunction(opt_patternFillOrTypeOrState) || goog.isBoolean(opt_patternFillOrTypeOrState) ?
        opt_patternFillOrTypeOrState :
        acgraph.vector.normalizeHatchFill.apply(null, arguments);

    if (hatchFill !== this.hoverHatchFill_)
      this.hoverHatchFill_ = hatchFill;
    return this;
  }
  return this.hoverHatchFill_;
};


/**
 * Pointer select hatch fill.
 * @param {(acgraph.vector.PatternFill|acgraph.vector.HatchFill|acgraph.vector.HatchFill.HatchFillType|
 * string|boolean)=} opt_patternFillOrTypeOrState PatternFill or HatchFill instance or type or state of hatch fill.
 * @param {string=} opt_color Color.
 * @param {number=} opt_thickness Thickness.
 * @param {number=} opt_size Pattern size.
 * @return {acgraph.vector.PatternFill|acgraph.vector.HatchFill|anychart.linearGaugeModule.pointers.Base|boolean} Hatch fill.
 */
anychart.linearGaugeModule.pointers.Base.prototype.selectHatchFill = function(opt_patternFillOrTypeOrState, opt_color, opt_thickness, opt_size) {
  if (goog.isDef(opt_patternFillOrTypeOrState)) {
    var hatchFill = goog.isFunction(opt_patternFillOrTypeOrState) || goog.isBoolean(opt_patternFillOrTypeOrState) ?
        opt_patternFillOrTypeOrState :
        acgraph.vector.normalizeHatchFill.apply(null, arguments);

    if (hatchFill !== this.selectHatchFill_)
      this.selectHatchFill_ = hatchFill;
    return this;
  }
  return this.selectHatchFill_;
};


/**
 * Method that gets the final hatch fill for a pointer, with all fallbacks taken into account.
 * @param {boolean} usePointSettings If point settings should count too (iterator questioning).
 * @param {anychart.PointState|number} pointState Point state.
 * @return {!(acgraph.vector.HatchFill|acgraph.vector.PatternFill)} Final hatch fill.
 */
anychart.linearGaugeModule.pointers.Base.prototype.getFinalHatchFill = function(usePointSettings, pointState) {
  var iterator = this.getIterator();
  iterator.select(/** @type {number} */ (this.dataIndex()));

  var normalHatchFill;
  if (usePointSettings && goog.isDef(iterator.get('hatchFill'))) {
    normalHatchFill = iterator.get('hatchFill');
  } else {
    normalHatchFill = this.hatchFill();
  }

  var hatchFill;
  if (this.state.isStateContains(pointState, anychart.PointState.SELECT)) {
    if (usePointSettings && goog.isDef(iterator.get('selectHatchFill'))) {
      hatchFill = iterator.get('selectHatchFill');
    } else if (goog.isDef(this.selectHatchFill())) {
      hatchFill = this.selectHatchFill();
    } else {
      hatchFill = normalHatchFill;
    }
  } else if (this.state.isStateContains(pointState, anychart.PointState.HOVER)) {
    if (usePointSettings && goog.isDef(iterator.get('hoverHatchFill'))) {
      hatchFill = iterator.get('hoverHatchFill');
    } else if (goog.isDef(this.hoverHatchFill())) {
      hatchFill = this.hoverHatchFill();
    } else {
      hatchFill = normalHatchFill;
    }
  } else {
    hatchFill = normalHatchFill;
  }
  return /** @type {!(acgraph.vector.HatchFill|acgraph.vector.PatternFill)} */(
      this.normalizeHatchFill(
          /** @type {acgraph.vector.HatchFill|acgraph.vector.PatternFill|Function|boolean|string} */(hatchFill)));
};


/**
 * Gets final normalized pattern/hatch fill.
 * @param {acgraph.vector.HatchFill|acgraph.vector.PatternFill|Function|string|boolean} hatchFill Normal state hatch fill.
 * @return {acgraph.vector.HatchFill|acgraph.vector.PatternFill} Normalized hatch fill.
 * @protected
 */
anychart.linearGaugeModule.pointers.Base.prototype.normalizeHatchFill = function(hatchFill) {
  var fill;
  var index = this.getIterator().getIndex();
  if (goog.isFunction(hatchFill)) {
    var sourceHatchFill = this.autoHatchFill ||
        acgraph.vector.normalizeHatchFill(anychart.linearGaugeModule.pointers.Base.DEFAULT_HATCH_FILL_TYPE);
    var scope = {
      'index': index,
      'sourceHatchFill': sourceHatchFill,
      'isVertical': this.isVertical()
    };
    fill = acgraph.vector.normalizeHatchFill(hatchFill.call(scope));
  } else if (goog.isBoolean(hatchFill)) {
    fill = hatchFill ? this.autoHatchFill : null;
  } else
    fill = acgraph.vector.normalizeHatchFill(hatchFill);
  return fill;
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
/**
 * Width for pointer.
 * @param {string=} opt_value
 * @return {string|anychart.linearGaugeModule.pointers.Base} Width or self for chaining.
 */
anychart.linearGaugeModule.pointers.Base.prototype.width = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = /** @type {string} */ (anychart.utils.normalizeToPercent(opt_value));
    if (this.width_ != opt_value) {
      this.width_ = opt_value;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.width_;
};


/**
 * Getter/setter for pointer offset.
 * @param {string=} opt_value Percent offset.
 * @return {string|anychart.linearGaugeModule.pointers.Base} Offset or self for chaining.
 */
anychart.linearGaugeModule.pointers.Base.prototype.offset = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = /** @type {string} */ (anychart.utils.normalizeToPercent(opt_value));
    if (this.offset_ != opt_value) {
      this.offset_ = opt_value;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.offset_;
};


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

  var pointLabel = iterator.get('label');
  var hoverPointLabel = hovered ? iterator.get('hoverLabel') : null;
  var selectPointLabel = selected ? iterator.get('selectLabel') : null;

  var labelPosition = pointLabel && pointLabel['position'] ? pointLabel['position'] : null;
  var labelHoverPosition = hoverPointLabel && hoverPointLabel['position'] ? hoverPointLabel['position'] : null;
  var labelSelectPosition = selectPointLabel && selectPointLabel['position'] ? selectPointLabel['position'] : null;

  return /** @type {string} */(hovered || selected ?
      hovered ?
          labelHoverPosition ?
              labelHoverPosition :
              this.hoverLabel().getOption('position') ?
                  this.hoverLabel().getOption('position') :
                  labelPosition ?
                      labelPosition :
                      this.label().getOption('position') :
          labelSelectPosition ?
              labelSelectPosition :
              this.selectLabel().getOption('position') ?
                  this.selectLabel().getOption('position') :
                  labelPosition ?
                      labelPosition :
                      this.label().getOption('position') :
      labelPosition ?
          labelPosition :
          this.label().getOption('position'));
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
    itemText = goog.isDef(this.name()) ? this.name() : 'Pointer: ' + this.autoIndex();

  json['iconType'] = this.getLegendIconType(json['iconType']);

  var ret = {
    'meta': /** @type {Object} */ ({}),
    'text': /** @type {string} */ (itemText),
    'iconEnabled': true,
    'iconStroke': this.getFinalStroke(false, anychart.PointState.NORMAL),
    'iconFill': this.getFinalFill(false, anychart.PointState.NORMAL),
    'iconHatchFill': this.getFinalHatchFill(false, anychart.PointState.NORMAL),
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
  if (this.label_)
    this.label_.remove();
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
  var fill = this.getFinalFill(true, pointerState);
  var stroke = this.getFinalStroke(true, pointerState);
  var hatch = this.getFinalHatchFill(true, pointerState);

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

  var labelsFactory;
  if (selected) {
    labelsFactory = /** @type {anychart.core.ui.LabelsFactory} */(this.selectLabel());
  } else if (hovered) {
    labelsFactory = /** @type {anychart.core.ui.LabelsFactory} */(this.hoverLabel());
  } else {
    labelsFactory = null;
  }

  var label = this.label().getLabel(0);
  var pointLabel = iterator.get('label');
  var hoverPointLabel = hovered ? iterator.get('hoverLabel') : null;
  var selectPointLabel = selected ? iterator.get('selectLabel') : null;

  var labelEnabledState = pointLabel && goog.isDef(pointLabel['enabled']) ? pointLabel['enabled'] : null;
  var labelSelectEnabledState = selectPointLabel && goog.isDef(selectPointLabel['enabled']) ? selectPointLabel['enabled'] : null;
  var labelHoverEnabledState = hoverPointLabel && goog.isDef(hoverPointLabel['enabled']) ? hoverPointLabel['enabled'] : null;
  var isDraw;
  isDraw = hovered || selected ?
      hovered ?
          goog.isNull(labelHoverEnabledState) ?
              goog.isNull(this.hoverLabel().enabled()) ?
                  goog.isNull(labelEnabledState) ?
                      this.label().enabled() :
                      labelEnabledState :
                  this.hoverLabel().enabled() :
              labelHoverEnabledState :
          goog.isNull(labelSelectEnabledState) ?
              goog.isNull(this.selectLabel().enabled()) ?
                  goog.isNull(labelEnabledState) ?
                      this.label().enabled() :
                      labelEnabledState :
                  this.selectLabel().enabled() :
              labelSelectEnabledState :
      goog.isNull(labelEnabledState) ?
          this.label().enabled() :
          labelEnabledState;

  if (isDraw) {
    var position = this.normalizeLabelPosition(anychart.enums.normalizePosition(this.getLabelsPosition(pointerState)));
    var bounds = this.getPointerBounds();
    var positionProvider = {'value': anychart.utils.getCoordinateByAnchor(bounds, position)};
    var formatProvider = this.createLabelContextProvider();
    if (label) {
      this.label().dropCallsCache(0);
      label.formatProvider(formatProvider);
      label.positionProvider(positionProvider);
    } else {
      label = this.label().add(formatProvider, positionProvider, 0);
    }

    label.resetSettings();
    label.currentLabelsFactory(/** @type {anychart.core.ui.LabelsFactory} */ (labelsFactory));
    label.setSettings(/** @type {Object} */(pointLabel), /** @type {Object} */(hovered ? hoverPointLabel : selectPointLabel));
    label.draw();
  } else if (label) {
    this.label().clear(label.getIndex());
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

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    this.rootLayer.zIndex(/** @type {number} */ (this.zIndex()));
    if (this.label_)
      this.label_.zIndex(/** @type {number} */ (this.zIndex()));
    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    this.rootLayer.parent(container);
    if (this.label_)
      this.label_.container(container);
    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }

  var iterator = this.getIterator();
  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    this.createShapes();
    if (iterator.select(/** @type {number} */ (this.dataIndex()))) {
      if (this.isVertical())
        this.drawVertical();
      else
        this.drawHorizontal();
      this.colorizePointer(this.state.getPointStateByIndex(0));
    }
    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.GAUGE_POINTER_LABEL)) {
    if (iterator.select(/** @type {number} */ (this.dataIndex()))) {
      this.drawLabel(this.state.getPointStateByIndex(/** @type {number} */ (0)));
      this.label().draw();
    } else {
      this.label().clear();
    }
    this.markConsistent(anychart.ConsistencyState.GAUGE_POINTER_LABEL);
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
  return /** @type {anychart.enums.HoverMode} */((/** @type {anychart.linearGaugeModule.Chart}*/(this.gauge)).interactivity().hoverMode());
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
  return /** @type {anychart.enums.SelectionMode}*/(this.selectionMode_);
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
anychart.linearGaugeModule.pointers.Base.prototype.applyAppearanceToPoint = function(pointState) {
  this.colorizePointer(pointState);
  this.drawLabel(pointState);
};


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
    'name': {value: this.name() || 'Pointer ' + this.autoIndex(), type: anychart.enums.TokenType.STRING},
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
//region --- JSON/DISPOSING ---
/** @inheritDoc */
anychart.linearGaugeModule.pointers.Base.prototype.serialize = function() {
  var json = anychart.linearGaugeModule.pointers.Base.base(this, 'serialize');
  json['pointerType'] = this.getType();
  if (goog.isDef(this.name()))
    json['name'] = this.name();
  json['width'] = this.width();
  json['offset'] = this.offset();
  json['dataIndex'] = this.dataIndex();
  json['label'] = this.label().serialize();
  json['hoverLabel'] = this.hoverLabel().getChangedSettings();
  json['selectLabel'] = this.selectLabel().getChangedSettings();
  json['legendItem'] = this.legendItem().serialize();

  if (this.id_)
    json['id'] = this.id();

  if (this.autoIndex_ != this.getIndex())
    json['autoIndex'] = this.autoIndex();

  if (this.color_)
    json['color'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.color_));
  if (goog.isFunction(this.fill())) {
    anychart.core.reporting.warning(
        anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
        null,
        ['Pointer fill']
    );
  } else {
    json['fill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.fill()));
  }
  if (goog.isFunction(this.hoverFill())) {
    anychart.core.reporting.warning(
        anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
        null,
        ['Pointer hoverFill']
    );
  } else {
    json['hoverFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.hoverFill()));
  }
  if (goog.isFunction(this.selectFill())) {
    anychart.core.reporting.warning(
        anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
        null,
        ['Pointer selectFill']
    );
  } else {
    json['selectFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.selectFill()));
  }
  if (goog.isFunction(this.stroke())) {
    anychart.core.reporting.warning(
        anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
        null,
        ['Pointer stroke']
    );
  } else {
    json['stroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke}*/(this.stroke()));
  }
  if (goog.isFunction(this.hoverStroke())) {
    anychart.core.reporting.warning(
        anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
        null,
        ['Pointer hoverStroke']
    );
  } else {
    json['hoverStroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke}*/(this.hoverStroke()));
  }
  if (goog.isFunction(this.selectStroke())) {
    anychart.core.reporting.warning(
        anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
        null,
        ['Pointer selectStroke']
    );
  } else {
    json['selectStroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke}*/(this.selectStroke()));
  }
  if (goog.isFunction(this.hatchFill())) {
    anychart.core.reporting.warning(
        anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
        null,
        ['Pointer hatchFill']
    );
  } else {
    if (goog.isDef(this.hatchFill()))
      json['hatchFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.hatchFill()));
  }
  if (goog.isFunction(this.hoverHatchFill())) {
    anychart.core.reporting.warning(
        anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
        null,
        ['Pointer hoverHatchFill']
    );
  } else {
    if (goog.isDef(this.hoverHatchFill()))
      json['hoverHatchFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/
          (this.hoverHatchFill()));
  }
  if (goog.isFunction(this.selectHatchFill())) {
    anychart.core.reporting.warning(
        anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
        null,
        ['Pointer selectHatchFill']
    );
  } else {
    if (goog.isDef(this.selectHatchFill()))
      json['selectHatchFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/
          (this.selectHatchFill()));
  }
  return json;
};


/** @inheritDoc */
anychart.linearGaugeModule.pointers.Base.prototype.setupByJSON = function(config, opt_default) {
  anychart.linearGaugeModule.pointers.Base.base(this, 'setupByJSON', config, opt_default);

  this.id(config['id']);
  this.autoIndex(config['autoIndex']);
  this.name(config['name']);
  this.width(config['width']);
  this.offset(config['offset']);
  this.dataIndex(config['dataIndex']);
  this.label().setupInternal(!!opt_default, config['label']);
  this.hoverLabel().setupInternal(!!opt_default, config['hoverLabel']);
  this.selectLabel().setupInternal(!!opt_default, config['selectLabel']);
  this.legendItem().setup(config['legendItem']);

  this.color(config['color']);
  this.fill(config['fill']);
  this.hoverFill(config['hoverFill']);
  this.selectFill(config['selectFill']);

  this.stroke(config['stroke']);
  this.hoverStroke(config['hoverStroke']);
  this.selectStroke(config['selectStroke']);

  this.hatchFill(config['hatchFill']);
  this.hoverHatchFill(config['hoverHatchFill']);
  this.selectHatchFill(config['selectHatchFill']);
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

  goog.disposeAll(this.label_, this.hoverLabel_, this.selectLabel_);
  this.label_ = null;
  this.hoverLabel_ = null;
  this.selectLabel_ = null;

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
  proto['name'] = proto.name;
  proto['dataIndex'] = proto.dataIndex;
  proto['getGauge'] = proto.getGauge;
  proto['color'] = proto.color;
  proto['fill'] = proto.fill;
  proto['hoverFill'] = proto.hoverFill;
  proto['selectFill'] = proto.selectFill;
  proto['stroke'] = proto.stroke;
  proto['hoverStroke'] = proto.hoverStroke;
  proto['selectStroke'] = proto.selectStroke;
  proto['hatchFill'] = proto.hatchFill;
  proto['hoverHatchFill'] = proto.hoverHatchFill;
  proto['selectHatchFill'] = proto.selectHatchFill;
  proto['label'] = proto.label;
  proto['hoverLabel'] = proto.hoverLabel;
  proto['selectLabel'] = proto.selectLabel;
  proto['width'] = proto.width;
  proto['offset'] = proto.offset;
  proto['hover'] = proto.hoverPoint;
  proto['unhover'] = proto.unhover;
  proto['select'] = proto.selectPoint;
  proto['unselect'] = proto.unselect;
})();
