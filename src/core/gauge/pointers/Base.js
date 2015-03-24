goog.provide('anychart.core.gauge.pointers.Base');
goog.require('acgraph');
goog.require('anychart.core.VisualBase');



/**
 * Bar pointer class.<br/>
 * @constructor
 * @extends {anychart.core.VisualBase}
 */
anychart.core.gauge.pointers.Base = function() {
  goog.base(this);

  /**
   * Pointer stroke.
   * @type {acgraph.vector.Stroke|string|Function}
   * @private
   */
  this.stroke_;

  /**
   * Pointer fill.
   * @type {acgraph.vector.Fill|string|Function}
   * @private
   */
  this.fill_;

  /**
   * Pointer hatch fill.
   * @type {acgraph.vector.PatternFill|acgraph.vector.HatchFill|boolean}
   * @private
   */
  this.hatchFill_;

  /**
   * Defines data index in gauge data.
   * @type {number}
   * @private
   */
  this.dataIndex_;

  /**
   * Defines index of axis which will be used to display its data value.
   * @type {number}
   * @private
   */
  this.axisIndex_;

  /**
   * @type {anychart.core.ui.MarkersFactory|acgraph.vector.Path}
   * @protected
   */
  this.domElement;

  /**
   * @type {anychart.core.ui.MarkersFactory|acgraph.vector.Path}
   * @protected
   */
  this.hatchFillElement;

  /**
   * @type {Object}
   * @protected
   */
  this.contextProvider = {};
};
goog.inherits(anychart.core.gauge.pointers.Base, anychart.core.VisualBase);


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.gauge.pointers.Base.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.VisualBase.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.APPEARANCE |
    anychart.ConsistencyState.GAUGE_HATCH_FILL;


/**
 * Supported signals.
 * @type {number}
 */
anychart.core.gauge.pointers.Base.prototype.SUPPORTED_SIGNALS =
    anychart.core.VisualBase.prototype.SUPPORTED_SIGNALS |
    anychart.Signal.NEEDS_RECALCULATION;


/**
 * Pointer stroke.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|Function|string|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line joint style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {(!anychart.core.gauge.pointers.Base|acgraph.vector.Stroke|Function)} .
 */
anychart.core.gauge.pointers.Base.prototype.stroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var stroke = goog.isFunction(opt_strokeOrFill) ?
        opt_strokeOrFill :
        acgraph.vector.normalizeStroke.apply(null, arguments);
    if (stroke != this.stroke_) {
      this.stroke_ = stroke;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.stroke_;
};


/**
 * Pointer fill.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|Function|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {(!anychart.core.gauge.pointers.Base|acgraph.vector.Fill|Function)} .
 */
anychart.core.gauge.pointers.Base.prototype.fill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {

    var fill = goog.isFunction(opt_fillOrColorOrKeys) ?
        opt_fillOrColorOrKeys :
        acgraph.vector.normalizeFill.apply(null, arguments);
    if (fill != this.fill_) {
      this.fill_ = fill;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.fill_;
};


/**
 * Gets final normalized fill or stroke color.
 * @param {acgraph.vector.Fill|acgraph.vector.Stroke|Function} color Normal state color.
 * @param {boolean} isFill Is it fill?
 * @return {acgraph.vector.Fill|acgraph.vector.Stroke} Normalized color.
 * @protected
 */
anychart.core.gauge.pointers.Base.prototype.normalizeColor = function(color, isFill) {
  var fill;
  if (goog.isFunction(color)) {
    fill = color.call(this.contextProvider, this.contextProvider);
    fill = isFill ?
        acgraph.vector.normalizeFill(fill) :
        acgraph.vector.normalizeStroke(fill);
  } else
    fill = color;
  return /** @type {acgraph.vector.Fill|acgraph.vector.Stroke} */(fill);
};


/**
 * Pointer hatch fill.
 * @param {(acgraph.vector.PatternFill|acgraph.vector.HatchFill|acgraph.vector.HatchFill.HatchFillType|
 * string|boolean)=} opt_patternFillOrTypeOrState PatternFill or HatchFill instance or type or state of hatch fill.
 * @param {string=} opt_color Color.
 * @param {number=} opt_thickness Thickness.
 * @param {number=} opt_size Pattern size.
 * @return {acgraph.vector.PatternFill|acgraph.vector.HatchFill|anychart.core.gauge.pointers.Base|boolean} Hatch fill.
 */
anychart.core.gauge.pointers.Base.prototype.hatchFill = function(opt_patternFillOrTypeOrState, opt_color, opt_thickness, opt_size) {
  if (goog.isDef(opt_patternFillOrTypeOrState)) {
    if (goog.isBoolean(opt_patternFillOrTypeOrState))
      opt_patternFillOrTypeOrState = opt_patternFillOrTypeOrState ?
          anychart.gauges.Circular.DEFAULT_HATCH_FILL_TYPE : 'none';

    var hatchFill = acgraph.vector.normalizeHatchFill.apply(null, arguments);

    if (hatchFill !== this.hatchFill_) {
      this.hatchFill_ = hatchFill;
      this.invalidate(anychart.ConsistencyState.GAUGE_HATCH_FILL,
          anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.hatchFill_;
};


/**
 * Axis index.
 * @param {number=} opt_index .
 * @return {number|anychart.core.gauge.pointers.Base} .
 */
anychart.core.gauge.pointers.Base.prototype.axisIndex = function(opt_index) {
  if (goog.isDef(opt_index)) {
    if (this.axisIndex_ != opt_index) {
      this.axisIndex_ = opt_index;
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW |
          anychart.Signal.NEEDS_RECALCULATION
      );
    }
    return this;
  } else {
    return this.axisIndex_;
  }
};


/**
 * Data index.
 * @param {number=} opt_index .
 * @return {number|anychart.core.gauge.pointers.Base} .
 */
anychart.core.gauge.pointers.Base.prototype.dataIndex = function(opt_index) {
  if (goog.isDef(opt_index)) {
    if (this.dataIndex_ != opt_index) {
      this.dataIndex_ = opt_index;
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW |
          anychart.Signal.NEEDS_RECALCULATION
      );
    }
    return this;
  } else {
    return this.dataIndex_;
  }
};


/**
 * Set/get link to gauge.
 * @param {anychart.gauges.Circular=} opt_gauge Gauge inst for set.
 * @return {anychart.core.gauge.pointers.Base|anychart.gauges.Circular}
 */
anychart.core.gauge.pointers.Base.prototype.gauge = function(opt_gauge) {
  if (goog.isDef(opt_gauge)) {
    if (this.gauge_ != opt_gauge) {
      this.gauge_ = opt_gauge;
    }
    return this;
  } else {
    return this.gauge_;
  }
};


/** @inheritDoc */
anychart.core.gauge.pointers.Base.prototype.remove = function() {
  if (this.domElement) {
    if (this.domElement instanceof acgraph.vector.Path)
      this.domElement.parent(null);
    else
      this.domElement.container(null);
  }

  if (this.hatchFillElement) {
    if (this.hatchFillElement instanceof acgraph.vector.Path)
      this.hatchFillElement.parent(null);
    else
      this.hatchFillElement.container(null);
  }
};


/**
 * Drawing.
 * @return {anychart.core.gauge.pointers.Base} .
 */
anychart.core.gauge.pointers.Base.prototype.draw = function() {
  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    this.domElement.fill(/** @type {acgraph.vector.Fill} */(this.normalizeColor(this.fill_, true)));
    this.domElement.stroke(/** @type {acgraph.vector.Stroke} */(this.normalizeColor(this.stroke_, false)));

    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    this.domElement.zIndex(/** @type {number} */(this.zIndex()));

    if (this.hatchFillElement)
      this.hatchFillElement.zIndex(/** @type {number} */(this.zIndex() + anychart.gauges.Circular.ZINDEX_MULTIPLIER * 0.1));
    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    if (this.domElement instanceof acgraph.vector.Path)
      this.domElement.parent(/** @type {acgraph.vector.ILayer} */(this.container()));
    else
      this.domElement.container(/** @type {acgraph.vector.ILayer} */(this.container()));

    if (this.hatchFillElement) {
      if (this.hatchFillElement instanceof acgraph.vector.Path)
        this.hatchFillElement.parent(/** @type {acgraph.vector.ILayer} */(this.container()));
      else
        this.hatchFillElement.container(/** @type {acgraph.vector.ILayer} */(this.container()));
    }

    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }

  return this;
};


/**
 * Restore labels default settings.
 */
anychart.core.gauge.pointers.Base.prototype.restoreDefaults = function() {
  this.suspendSignalsDispatching();
  this.stroke('rgb(242,41,34)');
  this.fill('rgb(242,41,34)');
  this.hatchFill(false);
  this.resumeSignalsDispatching(true);
};


//----------------------------------------------------------------------------------------------------------------------
//  Serialize & Deserialize
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.gauge.pointers.Base.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');


  if (goog.isFunction(this['fill'])) {
    if (goog.isFunction(this.fill())) {
      anychart.utils.warning(
          anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
          null,
          ['Pointers fill']
      );
    } else {
      json['fill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.fill()));
    }
  }
  if (goog.isFunction(this['stroke'])) {
    if (goog.isFunction(this.stroke())) {
      anychart.utils.warning(
          anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
          null,
          ['Pointers stroke']
      );
    } else {
      json['stroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke}*/(this.stroke()));
    }
  }
  json['hatchFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.hatchFill()));
  json['axisIndex'] = this.axisIndex();
  json['dataIndex'] = this.dataIndex();

  return json;
};


/** @inheritDoc */
anychart.core.gauge.pointers.Base.prototype.setupByJSON = function(config) {
  goog.base(this, 'setupByJSON', config);

  this.fill(config['fill']);
  this.stroke(config['stroke']);
  this.hatchFill(config['hatchFill']);
  this.axisIndex(config['axisIndex']);
  this.dataIndex(config['dataIndex']);
};


//exports
anychart.core.gauge.pointers.Base.prototype['stroke'] = anychart.core.gauge.pointers.Base.prototype.stroke;
anychart.core.gauge.pointers.Base.prototype['fill'] = anychart.core.gauge.pointers.Base.prototype.fill;
anychart.core.gauge.pointers.Base.prototype['hatchFill'] = anychart.core.gauge.pointers.Base.prototype.hatchFill;
anychart.core.gauge.pointers.Base.prototype['axisIndex'] = anychart.core.gauge.pointers.Base.prototype.axisIndex;
anychart.core.gauge.pointers.Base.prototype['dataIndex'] = anychart.core.gauge.pointers.Base.prototype.dataIndex;
