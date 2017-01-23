goog.provide('anychart.core.pert.PertVisualElements');

goog.require('anychart.core.Base');
goog.require('anychart.core.ui.LabelsFactory');
goog.require('anychart.core.ui.Tooltip');



/**
 * Pert visual element settings collector.
 * @constructor
 * @extends {anychart.core.Base}
 */
anychart.core.pert.PertVisualElements = function() {
  anychart.core.pert.PertVisualElements.base(this, 'constructor');

  /**
   * @type {acgraph.vector.Fill}
   * @private
   */
  this.color_;

  /**
   * @type {acgraph.vector.Fill|Function}
   * @private
   */
  this.fill_;

  /**
   * @type {acgraph.vector.Fill|Function}
   * @private
   */
  this.hoverFill_;

  /**
   * @type {acgraph.vector.Fill|Function}
   * @private
   */
  this.selectFill_;

  /**
   * @type {acgraph.vector.Stroke|Function}
   * @private
   */
  this.stroke_;

  /**
   * @type {acgraph.vector.Stroke|Function}
   * @private
   */
  this.hoverStroke_;

  /**
   * @type {acgraph.vector.Stroke|Function}
   * @private
   */
  this.selectStroke_;

  /**
   * @type {anychart.core.ui.LabelsFactory}
   * @private
   */
  this.labels_;

  /**
   * @type {anychart.core.ui.LabelsFactory}
   * @private
   */
  this.hoverLabels_;

  /**
   * @type {anychart.core.ui.LabelsFactory}
   * @private
   */
  this.selectLabels_;

  /**
   * @type {anychart.core.ui.Tooltip}
   * @private
   */
  this.tooltip_ = null;

  /**
   * Labels container.
   * @type {acgraph.vector.Layer}
   * @private
   */
  this.labelsContainer_ = null;

  /**
   * Parent PertVisualElements settings object.
   * @type {?anychart.core.pert.PertVisualElements}
   * @private
   */
  this.parent_ = null;

};
goog.inherits(anychart.core.pert.PertVisualElements, anychart.core.Base);


/**
 * Supported signals mask.
 * @type {number}
 */
anychart.core.pert.PertVisualElements.prototype.SUPPORTED_SIGNALS =
    anychart.core.Base.prototype.SUPPORTED_SIGNALS |
    anychart.Signal.NEEDS_REDRAW_LABELS |
    anychart.Signal.NEEDS_REDRAW_APPEARANCE |
    anychart.Signal.NEEDS_UPDATE_TOOLTIP;


/**
 * Supported consistency states mask.
 * @type {number}
 */
anychart.core.pert.PertVisualElements.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.Base.prototype.SUPPORTED_CONSISTENCY_STATES;


/**
 * Gets/sets parent settings object.
 * @param {anychart.core.pert.PertVisualElements=} opt_value - Value.
 * @return {?anychart.core.pert.PertVisualElements} - Current parent object.
 */
anychart.core.pert.PertVisualElements.prototype.parent = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.parent_ = opt_value;
    return this;
  }
  return this.parent_;
};


/**
 * Getter/setter for color.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!anychart.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!anychart.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.core.pert.PertVisualElements} .
 */
anychart.core.pert.PertVisualElements.prototype.color = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var val = acgraph.vector.normalizeFill.apply(null, arguments);
    if (val != this.color_) {
      this.color_ = val;
      this.dispatchSignal(anychart.Signal.NEEDS_REDRAW_APPEARANCE);
    }
    return this;
  }
  return this.color_ || (this.parent_ ? this.parent_.color() : 'none');
};


/**
 * Getter/setter for fill.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|Function|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!anychart.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!anychart.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.core.pert.PertVisualElements|Function} .
 */
anychart.core.pert.PertVisualElements.prototype.fill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var val = goog.isFunction(opt_fillOrColorOrKeys) ?
        opt_fillOrColorOrKeys :
        acgraph.vector.normalizeFill.apply(null, arguments);
    if (val != this.fill_) {
      this.fill_ = val;
      this.dispatchSignal(anychart.Signal.NEEDS_REDRAW_APPEARANCE);
    }
    return this;
  }
  return this.fill_ || (this.parent_ ? this.parent_.fill() : 'none');
};


/**
 * Getter/setter for hoverFill.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|Function|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!anychart.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!anychart.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.core.pert.PertVisualElements|Function} .
 */
anychart.core.pert.PertVisualElements.prototype.hoverFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var val = goog.isFunction(opt_fillOrColorOrKeys) ?
        opt_fillOrColorOrKeys :
        acgraph.vector.normalizeFill.apply(null, arguments);
    if (val != this.hoverFill_) {
      this.hoverFill_ = val;
      this.dispatchSignal(anychart.Signal.NEEDS_REDRAW_APPEARANCE);
    }
    return this;
  }
  return this.hoverFill_ || (this.parent_ ? this.parent_.hoverFill() : 'none');
};


/**
 * Getter/setter for selectFill.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|Function|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!anychart.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!anychart.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.core.pert.PertVisualElements|Function} .
 */
anychart.core.pert.PertVisualElements.prototype.selectFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var val = goog.isFunction(opt_fillOrColorOrKeys) ?
        opt_fillOrColorOrKeys :
        acgraph.vector.normalizeFill.apply(null, arguments);
    if (val != this.selectFill_) {
      this.selectFill_ = val;
      this.dispatchSignal(anychart.Signal.NEEDS_REDRAW_APPEARANCE);
    }
    return this;
  }
  return this.selectFill_ || (this.parent_ ? this.parent_.selectFill() : 'none');
};


/**
 * Gets final fill.
 * @param {anychart.PointState|number} state - Current state.
 * @param {anychart.core.utils.PertPointContextProvider} provider - Context provider.
 * @return {!acgraph.vector.Fill} - Final fill.
 */
anychart.core.pert.PertVisualElements.prototype.getFinalFill = function(state, provider) {
  var result;
  var fill;

  switch (state) {
    case anychart.PointState.HOVER:
      fill = this.hoverFill();
      break;
    case anychart.PointState.SELECT:
      fill = this.selectFill();
      break;
    default:
      fill = this.fill();
  }

  result = fill;

  if (goog.isFunction(fill)) {
    provider['sourceColor'] = this.color();
    result = fill.call(provider);
  }

  return result;
};


/**
 * Getter/setter for stroke settings.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line join style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {anychart.core.pert.PertVisualElements|acgraph.vector.Stroke|Function} .
 */
anychart.core.pert.PertVisualElements.prototype.stroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var stroke = goog.isFunction(opt_strokeOrFill) ?
        opt_strokeOrFill :
        acgraph.vector.normalizeStroke.apply(null, arguments);
    if (stroke != this.stroke_) {
      this.stroke_ = stroke;
      this.dispatchSignal(anychart.Signal.NEEDS_REDRAW_APPEARANCE);
    }
    return this;
  }
  return this.stroke_ || (this.parent_ ? this.parent_.stroke() : 'none');
};


/**
 * Getter/setter for hover stroke settings.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line join style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {anychart.core.pert.PertVisualElements|acgraph.vector.Stroke|Function} .
 */
anychart.core.pert.PertVisualElements.prototype.hoverStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var stroke = goog.isFunction(opt_strokeOrFill) ?
        opt_strokeOrFill :
        acgraph.vector.normalizeStroke.apply(null, arguments);
    if (stroke != this.hoverStroke_) {
      this.hoverStroke_ = stroke;
      this.dispatchSignal(anychart.Signal.NEEDS_REDRAW_APPEARANCE);
    }
    return this;
  }
  return this.hoverStroke_ || (this.parent_ ? this.parent_.hoverStroke() : 'none');
};


/**
 * Getter/setter for select stroke settings.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness - Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line join style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {anychart.core.pert.PertVisualElements|acgraph.vector.Stroke|Function} .
 */
anychart.core.pert.PertVisualElements.prototype.selectStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var stroke = goog.isFunction(opt_strokeOrFill) ?
        opt_strokeOrFill :
        acgraph.vector.normalizeStroke.apply(null, arguments);
    if (stroke != this.selectStroke_) {
      this.selectStroke_ = stroke;
      this.dispatchSignal(anychart.Signal.NEEDS_REDRAW_APPEARANCE);
    }
    return this;
  }
  return this.selectStroke_ || (this.parent_ ? this.parent_.selectStroke() : 'none');
};


/**
 * Gets final stroke.
 * @param {anychart.PointState|number} state - Current state.
 * @param {anychart.core.utils.PertPointContextProvider} provider - Context provider.
 * @return {!acgraph.vector.Stroke} - Final stroke.
 */
anychart.core.pert.PertVisualElements.prototype.getFinalStroke = function(state, provider) {
  var result;
  var stroke;

  switch (state) {
    case anychart.PointState.HOVER:
      stroke = this.hoverStroke();
      break;
    case anychart.PointState.SELECT:
      stroke = this.selectStroke();
      break;
    default:
      stroke = this.stroke();
  }

  result = stroke;

  if (goog.isFunction(stroke)) {
    provider['sourceColor'] = this.color();
    result = stroke.call(provider);
  }

  return result;
};


/**
 * Gets or sets labels settings.
 * @param {(Object|boolean|null)=} opt_value - Labels settings.
 * @return {!(anychart.core.ui.LabelsFactory|anychart.core.pert.PertVisualElements)} - Labels instance or itself for chaining call.
 */
anychart.core.pert.PertVisualElements.prototype.labels = function(opt_value) {
  if (!this.labels_) {
    this.labels_ = new anychart.core.ui.LabelsFactory();
    this.labels_.listenSignals(this.labelsInvalidated, this);
    this.registerDisposable(this.labels_);
  }

  if (goog.isDef(opt_value)) {
    if (goog.isObject(opt_value) && !('enabled' in opt_value))
      opt_value['enabled'] = true;
    this.labels_.setup(opt_value);
    return this;
  }
  return this.labels_;
};


/**
 * Gets or sets select labels settings.
 * @param {(Object|boolean|null)=} opt_value - Labels settings.
 * @return {!(anychart.core.ui.LabelsFactory|anychart.core.pert.PertVisualElements)} - Labels instance or itself for chaining call.
 */
anychart.core.pert.PertVisualElements.prototype.selectLabels = function(opt_value) {
  if (!this.selectLabels_) {
    this.selectLabels_ = new anychart.core.ui.LabelsFactory();
    this.selectLabels_.listenSignals(this.labelsInvalidated, this);
    this.registerDisposable(this.selectLabels_);
  }

  if (goog.isDef(opt_value)) {
    if (goog.isObject(opt_value) && !('enabled' in opt_value))
      opt_value['enabled'] = true;
    this.selectLabels_.setup(opt_value);
    return this;
  }
  return this.selectLabels_;
};


/**
 * Gets or sets hover labels settings.
 * @param {(Object|boolean|null)=} opt_value - Labels settings.
 * @return {!(anychart.core.ui.LabelsFactory|anychart.core.pert.PertVisualElements)} - Labels instance or itself for chaining call.
 */
anychart.core.pert.PertVisualElements.prototype.hoverLabels = function(opt_value) {
  if (!this.hoverLabels_) {
    this.hoverLabels_ = new anychart.core.ui.LabelsFactory();
    this.hoverLabels_.listenSignals(this.labelsInvalidated, this);
    this.registerDisposable(this.hoverLabels_);
  }

  if (goog.isDef(opt_value)) {
    if (goog.isObject(opt_value) && !('enabled' in opt_value))
      opt_value['enabled'] = true;
    this.hoverLabels_.setup(opt_value);
    return this;
  }
  return this.hoverLabels_;
};


/**
 * Listener for labels invalidation.
 * @param {anychart.SignalEvent} event - Invalidation event.
 */
anychart.core.pert.PertVisualElements.prototype.labelsInvalidated = function(event) {
  this.dispatchSignal(anychart.Signal.NEEDS_REDRAW_LABELS);
};


/**
 * Getter for tooltip settings.
 * @param {(Object|boolean|null)=} opt_value - Tooltip settings.
 * @return {!(anychart.core.pert.PertVisualElements|anychart.core.ui.Tooltip)} - Tooltip instance or self for method chaining.
 */
anychart.core.pert.PertVisualElements.prototype.tooltip = function(opt_value) {
  if (!this.tooltip_) {
    this.tooltip_ = new anychart.core.ui.Tooltip(anychart.core.ui.Tooltip.Capabilities.SUPPORTS_ALLOW_LEAVE_SCREEN);
    this.registerDisposable(this.tooltip_);
    this.tooltip_.listenSignals(this.onTooltipSignal_, this);
  }
  if (goog.isDef(opt_value)) {
    this.tooltip_.setup(opt_value);
    return this;
  } else {
    return this.tooltip_;
  }
};


/**
 * Tooltip invalidation handler.
 * @param {anychart.SignalEvent} event - Event object.
 * @private
 */
anychart.core.pert.PertVisualElements.prototype.onTooltipSignal_ = function(event) {
  this.dispatchSignal(anychart.Signal.NEEDS_UPDATE_TOOLTIP);
};


/**
 * Gets tooltip config. Includes formatter-functions.
 * @return {Object}
 */
anychart.core.pert.PertVisualElements.prototype.getCurrentTooltipConfig = function() {
  var config = this.tooltip().serialize();
  var titleFormatter = this.tooltip().getOption('titleFormatter');
  var textFormatter = this.tooltip().getOption('textFormatter');
  if (titleFormatter && titleFormatter != anychart.utils.DEFAULT_FORMATTER)
    config['titleFormatter'] = titleFormatter;
  if (textFormatter && textFormatter != anychart.utils.DEFAULT_FORMATTER)
    config['textFormatter'] = textFormatter;
  return config;
};


/**
 * Gets/sets labels container.
 * @param {acgraph.vector.Layer=} opt_value - Value to be set.
 * @return {acgraph.vector.Layer|anychart.core.pert.PertVisualElements|null} - Current value or itself for method chaining.
 */
anychart.core.pert.PertVisualElements.prototype.labelsContainer = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.labelsContainer_ != opt_value) {
      this.labelsContainer_ = opt_value;
      this.labels().container(this.labelsContainer_);
    }
    return this;
  }
  return this.labelsContainer_;
};


/**
 * Draws labels.
 * @return {anychart.core.pert.PertVisualElements}
 */
anychart.core.pert.PertVisualElements.prototype.drawLabels = function() {
  this.labels().draw();
  return this;
};


/**
 * Clears labels.
 * @return {anychart.core.pert.PertVisualElements}
 */
anychart.core.pert.PertVisualElements.prototype.clearLabels = function() {
  this.labels().clear();
  return this;
};


/**
 * Sets all labels parent event target.
 * @param {goog.events.EventTarget} parentEventTarget - Parent event target.
 * @return {anychart.core.pert.PertVisualElements}
 */
anychart.core.pert.PertVisualElements.prototype.setLabelsParentEventTarget = function(parentEventTarget) {
  this.labels().setParentEventTarget(parentEventTarget);
  return this;
};


// /**
//  * Util method. Use it to deeply compare two objects.
//  * NOTE: Currently (01 Aug 2016) we can't create tooltip with background without fill and stroke.
//  * This comparison allows to exclude
//  *
//  * @param {*} o1 Object or value to compare.
//  * @param {*} o2 Object or value to compare.
//  * @return {boolean} - True if arguments are equal.
//  * @private
//  */
// anychart.core.pert.PertVisualElements.prototype.deepEqual_ = function(o1, o2) {
//   if (o1 === o2) return true;
//   var t1 = typeof o1, t2 = typeof o2;
//   if (t1 == 'object' && t1 == t2) {
//     for (var key in o1) {
//       if (!this.deepEqual_(o1[key], o2[key])) return false;
//     }
//     return true;
//   }
//   return false;
// };


/** @inheritDoc */
anychart.core.pert.PertVisualElements.prototype.serialize = function() {
  var json = anychart.core.pert.PertVisualElements.base(this, 'serialize');

  if (goog.isDef(this.color_))
    json['color'] = anychart.color.serialize(this.color_);

  if (goog.isFunction(this['fill'])) {
    if (goog.isFunction(this.fill())) {
      anychart.core.reporting.warning(
          anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
          null,
          ['Pert element fill']
      );
    } else {
      if (this.fill_) json['fill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill} */ (this.fill_));
    }
  }

  if (goog.isFunction(this['hoverFill'])) {
    if (goog.isFunction(this.hoverFill())) {
      anychart.core.reporting.warning(
          anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
          null,
          ['Pert element hoverFill']
      );
    } else {
      if (this.hoverFill_) json['hoverFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill} */ (this.hoverFill_));
    }
  }

  if (goog.isFunction(this['selectFill'])) {
    if (goog.isFunction(this.selectFill())) {
      anychart.core.reporting.warning(
          anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
          null,
          ['Pert element selectFill']
      );
    } else {
      if (this.selectFill_) json['selectFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill} */ (this.selectFill_));
    }
  }

  if (goog.isFunction(this['stroke'])) {
    if (goog.isFunction(this.stroke())) {
      anychart.core.reporting.warning(
          anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
          null,
          ['Pert element stroke']
      );
    } else {
      if (this.stroke_) json['stroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke} */ (this.stroke_));
    }
  }

  if (goog.isFunction(this['hoverStroke'])) {
    if (goog.isFunction(this.hoverStroke())) {
      anychart.core.reporting.warning(
          anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
          null,
          ['Pert element hoverStroke']
      );
    } else {
      if (this.hoverStroke_) json['hoverStroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke} */ (this.hoverStroke_));
    }
  }

  if (goog.isFunction(this['selectStroke'])) {
    if (goog.isFunction(this.selectStroke())) {
      anychart.core.reporting.warning(
          anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
          null,
          ['Pert element selectStroke']
      );
    } else {
      if (this.selectStroke_) json['selectStroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke} */ (this.selectStroke_));
    }
  }

  json['labels'] = this.labels().serialize();
  json['selectLabels'] = this.selectLabels().getChangedSettings();
  json['hoverLabels'] = this.hoverLabels().getChangedSettings();
  if (goog.isNull(json['hoverLabels']['enabled'])) {
    delete json['hoverLabels']['enabled'];
  }
  if (goog.isNull(json['selectLabels']['enabled'])) {
    delete json['selectLabels']['enabled'];
  }

  json['tooltip'] = this.tooltip().serialize();

  return json;
};


/** @inheritDoc */
anychart.core.pert.PertVisualElements.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.pert.PertVisualElements.base(this, 'setupByJSON', config, opt_default);

  this.color(config['color']);

  this.fill(config['fill']);
  this.hoverFill(config['hoverFill']);
  this.selectFill(config['selectFill']);

  this.stroke(config['stroke']);
  this.hoverStroke(config['hoverStroke']);
  this.selectStroke(config['selectStroke']);

  this.labels(config['labels']);
  this.selectLabels(config['selectLabels']);
  this.hoverLabels(config['hoverLabels']);

  if ('tooltip' in config)
    this.tooltip().setupByVal(config['tooltip'], opt_default);
};
