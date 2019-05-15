goog.provide('anychart.core.axisMarkers.TextBase');

//region -- Requirements.
goog.require('acgraph.math');
goog.require('anychart.core.Axis');
goog.require('anychart.core.IStandaloneBackend');
goog.require('anychart.core.reporting');
goog.require('anychart.core.ui.Background');
goog.require('anychart.core.ui.LabelBase');
goog.require('anychart.core.utils.Padding');
goog.require('anychart.enums');
goog.require('anychart.math.Rect');
goog.require('anychart.utils');
goog.require('goog.math');



//endregion
//region -- Constructor.
/**
 * Text marker base.
 * @constructor
 * @extends {anychart.core.ui.LabelBase}
 * @implements {anychart.core.IStandaloneBackend}
 */
anychart.core.axisMarkers.TextBase = function() {
  anychart.core.axisMarkers.TextBase.base(this, 'constructor');

  /**
   * Current value.
   * @type {*}
   * @protected
   */
  this.val;

  /**
   * Current scale.
   * @type {anychart.scales.Base|anychart.scales.GanttDateTime}
   * @private
   */
  this.scale_;


  /**
   * Auto scale.
   * @type {anychart.scales.Base|anychart.scales.GanttDateTime}
   * @private
   */
  this.autoScale_ = null;

  /**
   * Assigned axis.
   * @type {anychart.core.Axis}
   * @private
   */
  this.axis_ = null;

  /**
   * Parent chart instance.
   * @type {anychart.core.SeparateChart|anychart.stockModule.Plot}
   * @private
   */
  this.chart_ = null;

  /**
   * @type {anychart.enums.Layout}
   * @private
   */
  this.layout_;

  /**
   * @type {anychart.enums.Layout}
   * @private
   */
  this.defaultLayout_ = anychart.enums.Layout.HORIZONTAL;

  /**
   * Parent bounds storage to wrap LabelsBase parentBounds logic.
   * @type {anychart.math.Rect}
   * @private
   */
  this.contBounds_ = null;

  /**
   * Flag to allow drawing with any ratio.
   * @type {boolean}
   * @private
   */
  this.drawAtAnyRatio_ = false;

  this.bindHandlersToComponent(this);

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['align', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['scaleRangeMode', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_RECALCULATION]
  ]);

};
goog.inherits(anychart.core.axisMarkers.TextBase, anychart.core.ui.LabelBase);


//endregion
//region -- Events
/** @inheritDoc */
anychart.core.axisMarkers.TextBase.prototype.handleMouseEvent = function(event) {
  var evt = this.createAxisMarkerEvent_(event);
  if (evt) {
    this.dispatchEvent(evt);
  }
};


/**
 * @param {anychart.core.MouseEvent} event
 * @return {Object}
 * @private
 */
anychart.core.axisMarkers.TextBase.prototype.createAxisMarkerEvent_ = function(event) {
  var type = event['type'];
  switch (type) {
    case acgraph.events.EventType.MOUSEOUT:
      type = anychart.enums.EventType.AXIS_MARKER_OUT;
      break;
    case acgraph.events.EventType.MOUSEOVER:
      type = anychart.enums.EventType.AXIS_MARKER_OVER;
      break;
    case acgraph.events.EventType.MOUSEMOVE:
      type = anychart.enums.EventType.AXIS_MARKER_MOVE;
      break;
    default:
      return null;
  }
  return {
    'type': type,
    'target': this,
    'originalEvent': event,
    'rawValue': this.valueInternal(),
    'formattedValue': this.getFormattedValue(),
    'offsetX': event.offsetX,
    'offsetY': event.offsetY
  };
};


/**
 * Retruns formatted value to use with createAxisMarkerEvent_
 * @return {string}
 * @protected
 */
anychart.core.axisMarkers.TextBase.prototype.getFormattedValue = function() {
  return 'Value: ' + this.valueInternal();
};


//endregion
//region -- States and Signals.
/**
 * Supported signals.
 * @type {number}
 */
anychart.core.axisMarkers.TextBase.prototype.SUPPORTED_SIGNALS =
    anychart.core.ui.LabelBase.prototype.SUPPORTED_SIGNALS |
    anychart.Signal.NEEDS_RECALCULATION;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.axisMarkers.TextBase.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.ui.LabelBase.prototype.SUPPORTED_CONSISTENCY_STATES;


//endregion
//region -- Descriptors.
/**
 * Descriptors.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.core.axisMarkers.TextBase.DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  anychart.core.settings.createDescriptors(map, [
    anychart.core.settings.descriptors.ALIGN,
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'scaleRangeMode', anychart.enums.normalizeScaleRangeMode]
  ]);

  return map;
})();
anychart.core.settings.populate(anychart.core.axisMarkers.TextBase, anychart.core.axisMarkers.TextBase.DESCRIPTORS);


//endregion
//region -- Gettings and setting chart.
/**
 * Sets the chart axisMarkers belongs to.
 * @param {anychart.core.SeparateChart|anychart.stockModule.Plot} chart Chart instance.
 */
anychart.core.axisMarkers.TextBase.prototype.setChart = function(chart) {
  this.chart_ = chart;
};


/**
 * Get the chart axisMarkers belongs to.
 * @return {anychart.core.SeparateChart|anychart.stockModule.Plot}
 */
anychart.core.axisMarkers.TextBase.prototype.getChart = function() {
  return this.chart_;
};


//endregion
//region -- Scale.
/**
 * Getter/setter for auto scale.
 * Works with instances of anychart.scales.Base only.
 * @param {(anychart.scales.Base|anychart.scales.GanttDateTime|Object|anychart.enums.ScaleTypes)=} opt_value - Scale.
 * @return {anychart.scales.Base|anychart.scales.GanttDateTime|!anychart.core.axisMarkers.TextBase} - Axis scale or
 * itself for method chaining.
 */
anychart.core.axisMarkers.TextBase.prototype.autoScale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var scType = opt_value && goog.isFunction(opt_value.getType) && opt_value.getType();
    var ganttScale = scType == anychart.enums.ScaleTypes.GANTT;
    var val = ganttScale ?
        (opt_value == this.autoScale_ ? null : opt_value) :
        anychart.scales.Base.setupScale(/** @type {anychart.scales.Base} */(this.autoScale_), opt_value, null, anychart.scales.Base.ScaleTypes.ALL_DEFAULT, null, this.scaleInvalidated, this);
    if (val) {
      var dispatch = this.autoScale_ == val;
      this.autoScale_ = /** @type {anychart.scales.Base|anychart.scales.GanttDateTime} */(val);
      var scaleIsSet = this.scale_ || (this.axis_ && /** @type {?anychart.scales.Base} */ (this.axis_.scale()));
      if (scaleIsSet) {
        val.resumeSignalsDispatching(false);
      } else if (!ganttScale)
        val.resumeSignalsDispatching(dispatch);
      if (!dispatch && !scaleIsSet)
        this.invalidate(anychart.ConsistencyState.BOUNDS,
            anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED | anychart.Signal.NEEDS_RECALCULATION);
    }
    return this;
  } else {
    return this.autoScale_;
  }
};


/**
 * Getter/setter for default scale.
 * Works with instances of anychart.scales.Base only.
 * @param {(anychart.scales.Base|anychart.scales.GanttDateTime|Object|anychart.enums.ScaleTypes)=} opt_value - Scale.
 * @return {anychart.scales.Base|anychart.scales.GanttDateTime|!anychart.core.axisMarkers.TextBase} - Axis scale or
 * itself for method chaining.
 */
anychart.core.axisMarkers.TextBase.prototype.scaleInternal = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var scType = opt_value && goog.isFunction(opt_value.getType) && opt_value.getType();
    var ganttScale = scType == anychart.enums.ScaleTypes.GANTT;
    var val = ganttScale ?
        (opt_value == this.scale_ ? null : opt_value) :
        anychart.scales.Base.setupScale(/** @type {anychart.scales.Base} */(this.scale_), opt_value, null, anychart.scales.Base.ScaleTypes.ALL_DEFAULT, null, this.scaleInvalidated, this);
    if (val) {
      var dispatch = this.scale_ == val;
      this.scale_ = /** @type {anychart.scales.Base|anychart.scales.GanttDateTime} */(val);
      if (!ganttScale)
        val.resumeSignalsDispatching(dispatch);
      if (!dispatch)
        this.invalidate(anychart.ConsistencyState.BOUNDS,
            anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED | anychart.Signal.NEEDS_RECALCULATION);
    }
    return this;
  } else {
    return this.scale_ || (this.axis_ && /** @type {?anychart.scales.Base} */ (this.axis_.scale())) || this.autoScale_;
  }
};


/**
 * Whether scale is set for marker.
 * @return {boolean}
 */
anychart.core.axisMarkers.TextBase.prototype.isScaleSet = function() {
  return !!this.scale_;
};


/**
 * Scale invalidation handler.
 * @param {anychart.SignalEvent} event - Event object.
 * @protected
 */
anychart.core.axisMarkers.TextBase.prototype.scaleInvalidated = function(event) {
  if (event.target == this.scaleInternal()) {
    var signal = 0;
    if (event.hasSignal(anychart.Signal.NEEDS_RECALCULATION))
      signal |= anychart.Signal.NEEDS_RECALCULATION;
    if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION))
      signal |= anychart.Signal.NEEDS_REDRAW;

    signal |= anychart.Signal.BOUNDS_CHANGED;

    this.invalidate(anychart.ConsistencyState.BOUNDS, signal);
  }
};


/**
 * If set to true - allows drawing marker using any ratio, even (-Infinity, 0) and (1, Infinity).
 * Default value is false.
 * Should not be in the public API.
 * @param {boolean=} opt_value
 * @return {anychart.core.axisMarkers.TextBase|boolean}
 */
anychart.core.axisMarkers.TextBase.prototype.drawAtAnyRatio = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.drawAtAnyRatio_ = opt_value;
    return this;
  }

  return this.drawAtAnyRatio_;
};


//endregion
//region -- Axis.
/**
 * Axis invalidation handler.
 * @param {anychart.SignalEvent} event - Event object.
 * @private
 */
anychart.core.axisMarkers.TextBase.prototype.axisInvalidated_ = function(event) {
  this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
};


/**
 * Sets axis for marker.
 * @param {anychart.core.Axis=} opt_value - Value to be set.
 * @return {(anychart.core.Axis|anychart.core.axisMarkers.TextBase)} - Current value or itself for method chaining.
 */
anychart.core.axisMarkers.TextBase.prototype.axis = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.axis_ != opt_value) {
      if (this.axis_) this.axis_.unlistenSignals(this.axisInvalidated_, this);
      this.axis_ = opt_value;
      this.axis_.listenSignals(this.axisInvalidated_, this);
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED | anychart.Signal.NEEDS_RECALCULATION);
    }
    return this;
  }
  return this.axis_;
};


/**
 * Axes lines space.
 * TODO (A.Kudryavtsev): NOTE that this method is useless for text markers.
 * TODO (A.Kudryavtsev): However I don't remove it to keep all markers internal API consistent
 * TODO (A.Kudryavtsev): because ChartWithAxes doesn't differ marker types on draw.
 * @param {(string|number|anychart.core.utils.Space)=} opt_spaceOrTopOrTopAndBottom Space object or top or top and bottom
 *    space.
 * @param {(string|number)=} opt_rightOrRightAndLeft Right or right and left space.
 * @param {(string|number)=} opt_bottom Bottom space.
 * @param {(string|number)=} opt_left Left space.
 * @return {!(anychart.core.VisualBase|anychart.core.utils.Padding)} .
 */
anychart.core.axisMarkers.TextBase.prototype.axesLinesSpace = function(opt_spaceOrTopOrTopAndBottom, opt_rightOrRightAndLeft, opt_bottom, opt_left) {
  if (!this.axesLinesSpace_) {
    this.axesLinesSpace_ = new anychart.core.utils.Padding();
  }

  if (goog.isDef(opt_spaceOrTopOrTopAndBottom)) {
    this.axesLinesSpace_.setup.apply(this.axesLinesSpace_, arguments);
    return this;
  } else {
    return this.axesLinesSpace_;
  }
};


//endregion
//region -- Layout.
/**
 * Get/set layout.
 * @param {anychart.enums.Layout=} opt_value - RangeMarker layout.
 * @return {anychart.enums.Layout|anychart.core.axisMarkers.TextBase} - Layout or this.
 */
anychart.core.axisMarkers.TextBase.prototype.layout = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var layout = anychart.enums.normalizeLayout(opt_value);
    if (this.layout_ != layout) {
      this.layout_ = layout;
      this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else if (this.layout_) {
    return this.layout_;
  } else if (this.axis_) {
    var axisOrientation = this.axis_.getOption('orientation');
    var isHorizontal = (axisOrientation == anychart.enums.Orientation.LEFT || axisOrientation == anychart.enums.Orientation.RIGHT);
    return isHorizontal ? anychart.enums.Layout.HORIZONTAL : anychart.enums.Layout.VERTICAL;
  } else {
    return this.defaultLayout_;
  }
};


/**
 * Set default layout.
 * @param {anychart.enums.Layout} value - Layout value.
 */
anychart.core.axisMarkers.TextBase.prototype.setDefaultLayout = function(value) {
  var needInvalidate = !this.layout_ && this.defaultLayout_ != value;
  this.defaultLayout_ = value;
  if (needInvalidate) this.invalidate(anychart.ConsistencyState.BOUNDS);
};


/**
 * Whether marker is horizontal
 * @return {boolean} - If the marker is horizontal.
 */
anychart.core.axisMarkers.TextBase.prototype.isHorizontal = function() {
  return this.layout() == anychart.enums.Layout.HORIZONTAL;
};


//endregion
//region -- Overridden API.
/**
 * Checks if marker is ready to be drawn.
 * @return {boolean}
 * @private
 */
anychart.core.axisMarkers.TextBase.prototype.isReady_ = function() {
  return Boolean(goog.isDefAndNotNull(this.valueInternal()) && this.scaleInternal());
};


/**
 * @inheritDoc
 */
anychart.core.axisMarkers.TextBase.prototype.checkDrawingNeeded = function() {
  var draw = anychart.core.axisMarkers.TextBase.base(this, 'checkDrawingNeeded') && this.isReady_();
  if (!draw)
    return draw;

  var ratio = this.scale().transform(this.valueInternal(), 0.5);
  if ((ratio >= 0 && ratio <= 1) || this.drawAtAnyRatio_) {
    this.invalidate(anychart.ConsistencyState.CONTAINER | anychart.ConsistencyState.BOUNDS);
    return true;
  } else {
    this.remove();
    this.markConsistent(anychart.ConsistencyState.CONTAINER | anychart.ConsistencyState.BOUNDS);
    return false;
  }
};


/**
 * @inheritDoc
 */
anychart.core.axisMarkers.TextBase.prototype.getFinalRotation = function() {
  var rot = this.getOption('rotation');
  return /** @type {number} */ (goog.isDefAndNotNull(rot) && !isNaN(rot) ? rot : (this.isHorizontal() ? 0 : -90));
};


/**
 * @inheritDoc
 */
anychart.core.axisMarkers.TextBase.prototype.getPosition = function() {
  var align = /** @type {anychart.enums.Align} */ (this.getOption('align'));
  if (this.isHorizontal()) {
    if (align == anychart.enums.Align.LEFT)
      return anychart.enums.Position.LEFT_CENTER;
    else if (align == anychart.enums.Align.RIGHT)
      return anychart.enums.Position.RIGHT_CENTER;
  } else {
    if (align == anychart.enums.Align.TOP)
      return anychart.enums.Position.CENTER_TOP;
    else if (align == anychart.enums.Align.BOTTOM)
      return anychart.enums.Position.CENTER_BOTTOM;
  }
  return anychart.enums.Position.CENTER;
};


/**
 * @inheritDoc
 */
anychart.core.axisMarkers.TextBase.prototype.getFinalAnchor = function() {
  var anch = /** @type {?anychart.enums.Anchor} */(this.getOption('anchor'));
  if (!anch || anch == anychart.enums.Anchor.AUTO) {
    //here pos has only values CENTER, LEFT_CENTER, RIGHT_CENTER, CENTER_TOP, CENTER_BOTTOM.
    var pos = this.getPosition();
    switch (pos) {
      case anychart.enums.Position.CENTER_TOP:
      case anychart.enums.Position.RIGHT_CENTER:
        anch = anychart.enums.Anchor.RIGHT_CENTER;
        break;
      case anychart.enums.Position.CENTER_BOTTOM:
      case anychart.enums.Position.LEFT_CENTER:
        anch = anychart.enums.Anchor.LEFT_CENTER;
        break;
      default:
        anch = anychart.enums.Anchor.CENTER;
    }
  }
  return anch;
};


/**
 * @inheritDoc
 */
anychart.core.axisMarkers.TextBase.prototype.getLabelsParentBounds = function() {
  return /** @type {anychart.math.Rect} */ (this.contBounds_);
};


/**
 * @inheritDoc
 */
anychart.core.axisMarkers.TextBase.prototype.parentBounds = function(opt_boundsOrLeft, opt_top, opt_width, opt_height) {
  if (goog.isDef(opt_boundsOrLeft)) {
    if (goog.isNull(opt_boundsOrLeft) || anychart.utils.instanceOf(opt_boundsOrLeft, anychart.math.Rect)) {
      this.contBounds_ = /** @type {anychart.math.Rect} */ (opt_boundsOrLeft);
    } else if (goog.typeOf(opt_boundsOrLeft) == 'object') {
      this.contBounds_ = new anychart.math.Rect(opt_boundsOrLeft['left'], opt_boundsOrLeft['top'],
          opt_boundsOrLeft['width'], opt_boundsOrLeft['height']);
    } else {
      this.contBounds_ = new anychart.math.Rect(/** @type {number} */ (opt_boundsOrLeft || 0), opt_top || 0, opt_width || 0, opt_height || 0);
    }
    this.invalidateParentBounds();
    return this;
  } else {
    if (this.isReady_() && this.contBounds_) {
      //TODO (A.Kudryavtsev): Cache cloning result.
      var clone = this.contBounds_.clone();
      var ratio = this.scale().transform(this.valueInternal(), 0.5);
      if (this.isHorizontal()) {
        clone.height = 0;
        clone.top = Math.round(this.contBounds_.top + this.contBounds_.height - ratio * this.contBounds_.height);
      } else {
        clone.width = 0;
        clone.left = Math.round(this.contBounds_.left + ratio * this.contBounds_.width);
      }
      return clone;
    } else {
      return null;
    }
  }
};


//endregion
//region -- Value.
/**
 * Getter/setter for scale.
 * @param {*=} opt_value - Value to be set.
 * @return {*} - Current value or itself for method chaining.
 */
anychart.core.axisMarkers.TextBase.prototype.valueInternal = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.getOption('value') !== opt_value) {
      this['value'](opt_value);
    }
    return this;
  }
  return this.getOption('value');
};


/**
 * Signals dispatched on value change.
 * @return {number}
 */
anychart.core.axisMarkers.TextBase.prototype.getValueChangeSignals = function() {
  var signals = anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED;
  if (this.getOption('scaleRangeMode') == anychart.enums.ScaleRangeMode.CONSIDER)
    signals |= anychart.Signal.NEEDS_RECALCULATION;
  return signals;
};


/** @inheritDoc */
anychart.core.axisMarkers.TextBase.prototype.getEnableChangeSignals = function() {
  var signals = anychart.core.axisMarkers.TextBase.base(this, 'getEnableChangeSignals');
  return signals | anychart.Signal.NEEDS_RECALCULATION;
};


/**
 * Values for scale extending.
 * @return {Array}
 */
anychart.core.axisMarkers.TextBase.prototype.getReferenceValues = function() {
  return [this.valueInternal()];
};


//endregion
//region -- Serialize/Deserialize.
/** @inheritDoc */
anychart.core.axisMarkers.TextBase.prototype.serialize = function() {
  var json = anychart.core.axisMarkers.TextBase.base(this, 'serialize');
  anychart.core.settings.serialize(this, anychart.core.axisMarkers.TextBase.DESCRIPTORS, json, 'TextBase');

  if (this.layout_) json['layout'] = this.layout_;
  return json;
};


/** @inheritDoc */
anychart.core.axisMarkers.TextBase.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.axisMarkers.TextBase.base(this, 'setupByJSON', config, opt_default);

  anychart.core.settings.deserialize(this, anychart.core.axisMarkers.TextBase.DESCRIPTORS, config, opt_default);

  if ('layout' in config && config['layout']) this.layout(config['layout']);

  if ('axis' in config) {
    var ax = config['axis'];
    if (goog.isNumber(ax)) {
      if (this.chart_) {
        this.axis((/** @type {anychart.core.CartesianBase} */(this.chart_)).getAxisByIndex(ax));
      }
    } else if (ax.isAxisMarkerProvider && ax.isAxisMarkerProvider()) {
      this.axis(ax);
    }
  }
};


/** @inheritDoc */
anychart.core.axisMarkers.TextBase.prototype.disposeInternal = function() {
  goog.dispose(this.axesLinesSpace_);
  this.axesLinesSpace_ = null;
  this.chart_ = null;
  this.axis_ = null;
  anychart.core.axisMarkers.TextBase.base(this, 'disposeInternal');
};


//endregion
