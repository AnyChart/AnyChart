goog.provide('anychart.core.gauge.pointers.Base');
goog.require('acgraph');
goog.require('anychart.core.VisualBase');
goog.require('anychart.core.reporting');
goog.require('anychart.core.utils.IInteractiveSeries');
goog.require('anychart.core.utils.InteractivityState');
goog.require('anychart.core.utils.SeriesPointContextProvider');



/**
 * Bar pointer class.<br/>
 * @constructor
 * @extends {anychart.core.VisualBase}
 * @implements {anychart.core.utils.IInteractiveSeries}
 */
anychart.core.gauge.pointers.Base = function() {
  anychart.core.gauge.pointers.Base.base(this, 'constructor');

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

  /**
   * Interactivity state.
   * @type {anychart.core.utils.InteractivityState}
   */
  this.state = new anychart.core.utils.InteractivityState(this);
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
 * Tester if the series is discrete based.
 * @return {boolean}
 */
anychart.core.gauge.pointers.Base.prototype.isDiscreteBased = function() {
  return true;
};


/**
 * Interface tester.
 * @return {boolean}
 */
anychart.core.gauge.pointers.Base.prototype.isSizeBased = function() {
  return false;
};


/**
 * Tester if it is series.
 * @return {boolean}
 */
anychart.core.gauge.pointers.Base.prototype.isSeries = function() {
  return true;
};


/**
 * Tester if it is chart.
 * @return {boolean}
 */
anychart.core.gauge.pointers.Base.prototype.isChart = function() {
  return false;
};


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
 * @param {(number|boolean|!anychart.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!anychart.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
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
          anychart.charts.CircularGauge.DEFAULT_HATCH_FILL_TYPE : 'none';

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
 * @param {anychart.charts.CircularGauge=} opt_gauge Gauge inst for set.
 * @return {anychart.core.gauge.pointers.Base|anychart.charts.CircularGauge}
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
 * Returns current mapping iterator.
 * @return {!anychart.data.Iterator} Current series iterator.
 */
anychart.core.gauge.pointers.Base.prototype.getIterator = function() {
  return this.gauge().getIterator();
};


/**
 * Returns new default iterator for the current mapping.
 * @return {!anychart.data.Iterator} New iterator.
 */
anychart.core.gauge.pointers.Base.prototype.getResetIterator = function() {
  return this.gauge().getResetIterator();
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
      this.hatchFillElement.zIndex(/** @type {number} */(this.zIndex() + anychart.charts.CircularGauge.ZINDEX_MULTIPLIER * 0.1));
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


//----------------------------------------------------------------------------------------------------------------------
//
//  Interactivity section.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Create base series format provider.
 * @param {boolean=} opt_force create context provider forcibly.
 * @return {Object} Object with info for labels formatting.
 */
anychart.core.gauge.pointers.Base.prototype.createFormatProvider = function(opt_force) {
  if (!this.pointProvider_ || opt_force)
    this.pointProvider_ = new anychart.core.utils.SeriesPointContextProvider(this, ['value'], false);
  this.pointProvider_.applyReferenceValues();

  return this.pointProvider_;
};


/**
 * Creates tooltip format provider.
 * @return {Object}
 */
anychart.core.gauge.pointers.Base.prototype.createTooltipContextProvider = function() {
  return this.createFormatProvider();
};


/**
 * Apply appearance to point.
 * @param {anychart.PointState|number} pointState
 */
anychart.core.gauge.pointers.Base.prototype.applyAppearanceToPoint = goog.nullFunction;


/**
 * Finalization point appearance. For drawing labels and markers.
 */
anychart.core.gauge.pointers.Base.prototype.finalizePointAppearance = goog.nullFunction;


/**
 * Apply appearance to series.
 * @param {anychart.PointState|number} pointState .
 */
anychart.core.gauge.pointers.Base.prototype.applyAppearanceToSeries = goog.nullFunction;


//----------------------------------------------------------------------------------------------------------------------
//
//  Events manipulation.
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.gauge.pointers.Base.prototype.makeBrowserEvent = function(e) {
  //this method is invoked only for events from data layer
  var res = anychart.core.gauge.pointers.Base.base(this, 'makeBrowserEvent', e);
  res['pointIndex'] = this.getIndexByEvent(res);
  return res;
};


/**
 * This method also has a side effect - it patches the original source event to maintain pointIndex support for
 * browser events.
 * @param {anychart.core.MouseEvent} event
 * @return {Object} An object of event to dispatch. If null - unrecognized type was found.
 */
anychart.core.gauge.pointers.Base.prototype.makePointEvent = function(event) {
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
      type = anychart.enums.EventType.POINT_CLICK;
      break;
    case acgraph.events.EventType.DBLCLICK:
      type = anychart.enums.EventType.POINT_DBLCLICK;
      break;
    default:
      return null;
  }

  var pointIndex;
  if ('pointIndex' in event) {
    pointIndex = event['pointIndex'];
  } else if ('labelIndex' in event) {
    pointIndex = event['labelIndex'];
  } else if ('markerIndex' in event) {
    pointIndex = event['markerIndex'];
  }
  pointIndex = anychart.utils.toNumber(pointIndex);
  event['pointIndex'] = pointIndex;

  var iter = this.gauge().getIterator();
  if (!iter.select(pointIndex))
    iter.reset();

  return {
    'type': type,
    'actualTarget': event['target'],
    'series': this,
    'iterator': iter,
    'pointIndex': pointIndex,
    'target': this,
    'originalEvent': event
  };
};


/**
 * Get point index by event. Used for events from data layer only
 * @param {anychart.core.MouseEvent} event .
 * @protected
 * @return {number} Point index.
 */
anychart.core.gauge.pointers.Base.prototype.getIndexByEvent = function(event) {
  return anychart.utils.toNumber(anychart.utils.extractTag(event['domTarget']).index);
};


/** @inheritDoc */
anychart.core.gauge.pointers.Base.prototype.handleMouseEvent = function(event) {
  var evt = this.makePointEvent(event);
  if (evt)
    this.dispatchEvent(evt);
};


/**
 * Temporarily works only for acgraph.vector.Element.
 * @param {acgraph.vector.Element} element .
 * @param {boolean=} opt_seriesGlobal .
 * @protected
 */
anychart.core.gauge.pointers.Base.prototype.makeInteractive = function(element, opt_seriesGlobal) {
  if (!element) return;
  element.tag = {series: this};
  if (opt_seriesGlobal) {
    element.tag.index = true;
  } else {
    element.tag.index = this.gauge().getIterator().getIndex();
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Hover.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * If index is passed, hovers a point of the series by its index, else hovers all points of the series.
 * @param {(number|Array<number>)=} opt_indexOrIndexes Point index or array of indexes.
 * @return {!anychart.core.gauge.pointers.Base}  {@link anychart.core.gauge.pointers.Base} instance for method chaining.
 */
anychart.core.gauge.pointers.Base.prototype.hover = function(opt_indexOrIndexes) {
  if (goog.isDef(opt_indexOrIndexes))
    this.hoverPoint(opt_indexOrIndexes);
  else
    this.hoverSeries();

  return this;
};


/**
 * Removes hover from the series.
 * @return {!anychart.core.gauge.pointers.Base} {@link anychart.core.gauge.pointers.Base} instance for method chaining.
 */
anychart.core.gauge.pointers.Base.prototype.unhover = function() {
  if (!(this.state.hasPointState(anychart.PointState.HOVER) ||
      this.state.isStateContains(this.state.getSeriesState(), anychart.PointState.HOVER)) ||
      !this.enabled())
    return this;

  this.state.removePointState(anychart.PointState.HOVER, this.state.seriesState == anychart.PointState.NORMAL ? NaN : undefined);

  return this;
};


/**
 * Hovers a point of the series by its index.
 * @param {number|Array<number>} index Index of the point to hover.
 * @return {!anychart.core.gauge.pointers.Base}  {@link anychart.core.gauge.pointers.Base} instance for method chaining.
 */
anychart.core.gauge.pointers.Base.prototype.hoverPoint = function(index) {
  if (!this.enabled())
    return this;

  if (goog.isArray(index)) {
    var hoveredPoints = this.state.getIndexByPointState(anychart.PointState.HOVER);
    for (var i = 0; i < hoveredPoints.length; i++) {
      if (!goog.array.contains(index, hoveredPoints[i])) {
        this.state.removePointState(anychart.PointState.HOVER, hoveredPoints[i]);
      }
    }
    this.state.addPointState(anychart.PointState.HOVER, index);
  } else if (goog.isNumber(index)) {
    this.unhover();
    this.state.addPointState(anychart.PointState.HOVER, index);
  }
  return this;
};


/**
 * Hovers all points of the series. Use <b>unhover</b> method for unhover series.
 * @return {!anychart.core.gauge.pointers.Base} An instance of the {@link anychart.core.gauge.pointers.Base} class for method chaining.
 */
anychart.core.gauge.pointers.Base.prototype.hoverSeries = function() {
  if (!this.enabled())
    return this;

  this.state.setPointState(anychart.PointState.HOVER);

  return this;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Select.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Deselects all points.
 * @return {!anychart.core.gauge.pointers.Base} {@link anychart.core.gauge.pointers.Base} instance for method chaining.
 */
anychart.core.gauge.pointers.Base.prototype.unselect = function() {
  return this;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Interactivity modes.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Selection mode.
 * @type {?anychart.enums.SelectionMode}
 * @private
 */
anychart.core.gauge.pointers.Base.prototype.selectionMode_;


/**
 * Selection mode.
 * @type {anychart.enums.HoverMode}
 * @private
 */
anychart.core.gauge.pointers.Base.prototype.hoverMode_;


/**
 * @param {(anychart.enums.SelectionMode|string|null)=} opt_value Selection mode.
 * @return {anychart.core.gauge.pointers.Base|anychart.enums.SelectionMode|null} .
 */
anychart.core.gauge.pointers.Base.prototype.selectionMode = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = goog.isNull(opt_value) ? null : anychart.enums.normalizeSelectMode(opt_value);
    if (opt_value != this.selectionMode_) {
      this.selectionMode_ = opt_value;
    }
    return this;
  }
  return /** @type {anychart.enums.SelectionMode}*/(this.selectionMode_);
};


/**
 * @param {(anychart.enums.HoverMode|string)=} opt_value Hover mode.
 * @return {anychart.core.gauge.pointers.Base|anychart.enums.HoverMode} .
 */
anychart.core.gauge.pointers.Base.prototype.hoverMode = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeHoverMode(opt_value);
    if (opt_value != this.hoverMode_) {
      this.hoverMode_ = opt_value;
    }
    return this;
  }
  return /** @type {anychart.enums.HoverMode}*/(this.hoverMode_);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Serialize & Deserialize
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.gauge.pointers.Base.prototype.serialize = function() {
  var json = anychart.core.gauge.pointers.Base.base(this, 'serialize');


  if (goog.isFunction(this['fill'])) {
    if (goog.isFunction(this.fill())) {
      anychart.core.reporting.warning(
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
      anychart.core.reporting.warning(
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
anychart.core.gauge.pointers.Base.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.gauge.pointers.Base.base(this, 'setupByJSON', config, opt_default);

  this.fill(config['fill']);
  this.stroke(config['stroke']);
  this.hatchFill(config['hatchFill']);
  this.axisIndex(config['axisIndex']);
  this.dataIndex(config['dataIndex']);
};


//exports
(function() {
  var proto = anychart.core.gauge.pointers.Base.prototype;
  proto['stroke'] = proto.stroke;
  proto['fill'] = proto.fill;
  proto['hatchFill'] = proto.hatchFill;
  proto['axisIndex'] = proto.axisIndex;
  proto['dataIndex'] = proto.dataIndex;
})();
