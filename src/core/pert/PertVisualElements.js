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
  this.fill_;

  /**
   * @type {acgraph.vector.Fill}
   * @private
   */
  this.hoverFill_;

  /**
   * @type {acgraph.vector.Fill}
   * @private
   */
  this.selectFill_;

  /**
   * @type {acgraph.vector.Stroke}
   * @private
   */
  this.stroke_;

  /**
   * @type {acgraph.vector.Stroke}
   * @private
   */
  this.hoverStroke_;

  /**
   * @type {acgraph.vector.Stroke}
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

};
goog.inherits(anychart.core.pert.PertVisualElements, anychart.core.Base);


/**
 * Supported signals mask.
 * @type {number}
 */
anychart.core.pert.PertVisualElements.prototype.SUPPORTED_SIGNALS =
    anychart.core.Base.prototype.SUPPORTED_SIGNALS |
    anychart.Signal.NEEDS_REDRAW_LABELS |
    anychart.Signal.NEEDS_REDRAW_APPEARANCE;


/**
 * Supported consistency states mask.
 * @type {number}
 */
anychart.core.pert.PertVisualElements.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.Base.prototype.SUPPORTED_CONSISTENCY_STATES;


/**
 * Getter/setter for fill.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!anychart.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!anychart.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.core.pert.PertVisualElements} .
 */
anychart.core.pert.PertVisualElements.prototype.fill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var val = acgraph.vector.normalizeFill.apply(null, arguments);
    if (!anychart.color.equals(/** @type {acgraph.vector.Fill} */ (this.fill_), val)) {
      this.fill_ = /** @type {acgraph.vector.Fill} */ (val);
      this.dispatchSignal(anychart.Signal.NEEDS_REDRAW_APPEARANCE);
    }
    return this;
  }
  return this.fill_;
};


/**
 * Getter/setter for hoverFill.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!anychart.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!anychart.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.core.pert.PertVisualElements} .
 */
anychart.core.pert.PertVisualElements.prototype.hoverFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var val = acgraph.vector.normalizeFill.apply(null, arguments);
    if (!anychart.color.equals(/** @type {acgraph.vector.Fill} */ (this.hoverFill_), val)) {
      this.hoverFill_ = /** @type {acgraph.vector.Fill} */ (val);
      this.dispatchSignal(anychart.Signal.NEEDS_REDRAW_APPEARANCE);
    }
    return this;
  }
  return this.hoverFill_;
};


/**
 * Getter/setter for selectFill.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!anychart.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!anychart.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.core.pert.PertVisualElements} .
 */
anychart.core.pert.PertVisualElements.prototype.selectFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var val = acgraph.vector.normalizeFill.apply(null, arguments);
    if (!anychart.color.equals(/** @type {acgraph.vector.Fill} */ (this.selectFill_), val)) {
      this.selectFill_ = /** @type {acgraph.vector.Fill} */ (val);
      this.dispatchSignal(anychart.Signal.NEEDS_REDRAW_APPEARANCE);
    }
    return this;
  }
  return this.selectFill_;
};


/**
 * Getter/setter for stroke settings.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line join style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {anychart.core.pert.PertVisualElements|acgraph.vector.Stroke} .
 */
anychart.core.pert.PertVisualElements.prototype.stroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var val = acgraph.vector.normalizeStroke.apply(null, arguments);
    if (!anychart.color.equals(/** @type {acgraph.vector.Stroke} */ (this.stroke_), val)) {
      this.stroke_ = /** @type {acgraph.vector.Stroke} */ (val);
      this.dispatchSignal(anychart.Signal.NEEDS_REDRAW_APPEARANCE);
    }
    return this;
  }
  return this.stroke_;
};


/**
 * Getter/setter for hover stroke settings.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line join style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {anychart.core.pert.PertVisualElements|acgraph.vector.Stroke} .
 */
anychart.core.pert.PertVisualElements.prototype.hoverStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var val = acgraph.vector.normalizeStroke.apply(null, arguments);
    if (!anychart.color.equals(/** @type {acgraph.vector.Stroke} */ (this.hoverStroke_), val)) {
      this.hoverStroke_ = /** @type {acgraph.vector.Stroke} */ (val);
      this.dispatchSignal(anychart.Signal.NEEDS_REDRAW_APPEARANCE);
    }
    return this;
  }
  return this.hoverStroke_;
};


/**
 * Getter/setter for select stroke settings.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness - Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line join style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {anychart.core.pert.PertVisualElements|acgraph.vector.Stroke} .
 */
anychart.core.pert.PertVisualElements.prototype.selectStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var val = acgraph.vector.normalizeStroke.apply(null, arguments);
    if (!anychart.color.equals(/** @type {acgraph.vector.Stroke} */ (this.selectStroke_), val)) {
      this.selectStroke_ = /** @type {acgraph.vector.Stroke} */ (val);
      this.dispatchSignal(anychart.Signal.NEEDS_REDRAW_APPEARANCE);
    }
    return this;
  }
  return this.selectStroke_;
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
    if (goog.isObject(opt_value) && !(anychart.opt.ENABLED in opt_value))
      opt_value[anychart.opt.ENABLED] = true;
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
    if (goog.isObject(opt_value) && !(anychart.opt.ENABLED in opt_value))
      opt_value[anychart.opt.ENABLED] = true;
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
    if (goog.isObject(opt_value) && !(anychart.opt.ENABLED in opt_value))
      opt_value[anychart.opt.ENABLED] = true;
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
    this.tooltip_ = new anychart.core.ui.Tooltip();
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
  var tooltip = /** @type {anychart.core.ui.Tooltip} */(this.tooltip());
  tooltip.redraw();
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

  //This drawing initializes mouse events on hover-select labels.
  this.hoverLabels().draw();
  this.selectLabels().draw();
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
  this.hoverLabels().setParentEventTarget(parentEventTarget);
  this.selectLabels().setParentEventTarget(parentEventTarget);
  return this;
};


/** @inheritDoc */
anychart.core.pert.PertVisualElements.prototype.serialize = function() {
  var json = anychart.core.pert.PertVisualElements.base(this, 'serialize');

  if (goog.isFunction(this['fill'])) {
    if (goog.isFunction(this.fill())) {
      anychart.core.reporting.warning(
          anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
          null,
          ['Pert element fill']
      );
    } else {
      json['fill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.fill()));
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
      json['hoverFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.hoverFill()));
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
      json['selectFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.selectFill()));
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
      json['stroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke}*/(this.stroke()));
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
      json['hoverStroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke}*/(this.hoverStroke()));
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
      json['selectStroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke}*/(this.selectStroke()));
    }
  }

  json['labels'] = this.labels().serialize();
  json['selectLabels'] = this.selectLabels().serialize();
  json['hoverLabels'] = this.hoverLabels().serialize();

  json['tooltip'] = this.tooltip().serialize();

  return json;
};


/** @inheritDoc */
anychart.core.pert.PertVisualElements.prototype.setupByJSON = function(config) {
  anychart.core.pert.PertVisualElements.base(this, 'setupByJSON', config);

  this.fill(config['fill']);
  this.hoverFill(config['hoverFill']);
  this.selectFill(config['selectFill']);

  this.stroke(config['stroke']);
  this.hoverStroke(config['hoverStroke']);
  this.selectStroke(config['selectStroke']);

  this.labels(config['labels']);
  this.selectLabels(config['selectLabels']);
  this.hoverLabels(config['hoverLabels']);

  this.tooltip(config['tooltip']);
};
