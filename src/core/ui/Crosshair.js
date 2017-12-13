goog.provide('anychart.core.ui.Crosshair');

goog.require('anychart.core.VisualBase');
goog.require('anychart.core.settings');
goog.require('anychart.core.ui.CrosshairLabel');
goog.require('anychart.core.utils.TokenParser');
goog.require('anychart.format.Context');
goog.require('goog.array');



/**
 * Crosshair class.
 * @constructor
 * @extends {anychart.core.VisualBase}
 * @implements {anychart.core.settings.IResolvable}
 */
anychart.core.ui.Crosshair = function() {
  anychart.core.ui.Crosshair.base(this, 'constructor');

  /**
   * @type {anychart.core.ChartWithAxes|anychart.mapModule.Chart|anychart.stockModule.Chart|anychart.stockModule.Plot}
   * @private
   */
  this.interactivityTarget_ = null;

  /**
   * @type {anychart.core.Axis|anychart.mapModule.elements.Axis|anychart.stockModule.Axis}
   * @private
   */
  this.xAxis_ = null;

  /**
   * @type {anychart.core.Axis|anychart.mapModule.elements.Axis}
   * @private
   */
  this.yAxis_ = null;

  /**
   * @type {acgraph.vector.Path}
   * @protected
   */
  this.xLine = acgraph.path();

  /**
   * @type {acgraph.vector.Path}
   * @protected
   */
  this.yLine = acgraph.path();

  /**
   * @type {anychart.core.ui.CrosshairLabel}
   * @private
   */
  this.xLabel_ = new anychart.core.ui.CrosshairLabel();

  /**
   * @type {anychart.core.ui.CrosshairLabel}
   * @private
   */
  this.yLabel_ = new anychart.core.ui.CrosshairLabel();

  this.xLine.disablePointerEvents(true);
  this.yLine.disablePointerEvents(true);

  this.xLabel_.listenSignals(this.labelInvalidated, this);
  this.yLabel_.listenSignals(this.labelInvalidated, this);

  /**
   * This flag is used to auto enable or disable xLabel.
   * Used to correctly show xLabels for stock plots.
   * @type {boolean}
   * @private
   */
  this.xLabelAutoEnabled_ = true;

  /**
   * Resolution chain cache.
   * @type {?Array.<Object|null|undefined>}
   * @private
   */
  this.resolutionChainCache_ = null;

  /**
   * Parent.
   * @type {?anychart.core.ui.Crosshair}
   * @private
   */
  this.parent_ = null;

  /**
   * @type {Object.<string, anychart.core.ui.Crosshair>}
   */
  this.childrenMap = {};

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['xStroke', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW],
    ['yStroke', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW],
    ['displayMode', 0, 0]
  ]);
};
goog.inherits(anychart.core.ui.Crosshair, anychart.core.VisualBase);


//region -- Consistency states.
/**
 * Supported signals.
 * @type {number}
 */
anychart.core.ui.Crosshair.prototype.SUPPORTED_SIGNALS =
    anychart.core.VisualBase.prototype.SUPPORTED_SIGNALS |
    anychart.Signal.NEEDS_REAPPLICATION;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.ui.Crosshair.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.VisualBase.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.APPEARANCE;


//endregion
//region -- Descriptors.
/**
 * Descriptors.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.core.ui.Crosshair.DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'xStroke',
      anychart.core.settings.strokeNormalizer);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'yStroke',
      anychart.core.settings.strokeNormalizer);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'displayMode',
      anychart.enums.normalizeCrosshairDisplayMode);

  return map;
})();
anychart.core.settings.populate(anychart.core.ui.Crosshair, anychart.core.ui.Crosshair.DESCRIPTORS);


//endregion
//region -- IResolvable impl.
/**
 * @override
 * @param {string} name
 * @return {*}
 */
anychart.core.ui.Crosshair.prototype.getOption = anychart.core.settings.getOption;


/** @inheritDoc */
anychart.core.ui.Crosshair.prototype.resolutionChainCache = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.resolutionChainCache_ = opt_value;
  }
  return this.resolutionChainCache_;
};


/** @inheritDoc */
anychart.core.ui.Crosshair.prototype.getResolutionChain = anychart.core.settings.getResolutionChain;


/** @inheritDoc */
anychart.core.ui.Crosshair.prototype.getLowPriorityResolutionChain = function() {
  var sett = [this.themeSettings];
  if (this.parent_)
    sett = goog.array.concat(sett, this.parent_.getLowPriorityResolutionChain());
  return sett;
};


/** @inheritDoc */
anychart.core.ui.Crosshair.prototype.getHighPriorityResolutionChain = function() {
  var sett = [this.ownSettings];
  if (this.parent_) {
    sett = goog.array.concat(sett, this.parent_.getHighPriorityResolutionChain());
  }
  return sett;
};


//endregion
//region -- Parental relations
/**
 * Gets/sets new parent title.
 * @param {anychart.core.ui.Crosshair=} opt_value - Value to set.
 * @return {anychart.core.ui.Crosshair} - Current value or itself for method chaining.
 */
anychart.core.ui.Crosshair.prototype.parent = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.parent_ != opt_value) {
      var uid = String(goog.getUid(this));
      if (goog.isNull(opt_value)) { //removing parent.
        //this.parent_ is not null here.
        this.parent_.unlistenSignals(this.parentInvalidated_, this);
        this.xLabel().parent(null);
        this.yLabel().parent(null);
        delete this.parent_.childrenMap[uid];
        this.parent_ = null;
      } else {
        if (this.parent_)
          this.parent_.unlistenSignals(this.parentInvalidated_, this);
        this.parent_ = opt_value;
        this.xLabel().parent(this.parent_.xLabel());
        this.yLabel().parent(this.parent_.yLabel());
        this.parent_.childrenMap[uid] = this;
        this.parent_.listenSignals(this.parentInvalidated_, this);
      }
    }
    return this;
  }
  return this.parent_;

};


/**
 * Parent invalidation handler.
 * @param {anychart.SignalEvent} e - Signal event.
 * @private
 */
anychart.core.ui.Crosshair.prototype.parentInvalidated_ = function(e) {
  var state = 0;
  var signal = 0;

  if (e.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    state |= anychart.ConsistencyState.APPEARANCE;
    signal |= anychart.Signal.NEEDS_REDRAW;
  }

  if (e.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    state |= anychart.ConsistencyState.BOUNDS;
    signal |= anychart.Signal.BOUNDS_CHANGED;
  }

  if (e.hasSignal(anychart.Signal.ENABLED_STATE_CHANGED)) {
    state |= anychart.ConsistencyState.ENABLED;
    signal |= anychart.Signal.ENABLED_STATE_CHANGED | anychart.Signal.NEEDS_REDRAW;
  }

  this.resolutionChainCache_ = null;

  this.invalidate(state, signal);
};


//endregion
//region -- Common.
/**
 * Internal label invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @protected
 */
anychart.core.ui.Crosshair.prototype.labelInvalidated = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
  }
};


/**
 *
 * @param {(anychart.core.Axis|anychart.mapModule.elements.Axis|anychart.stockModule.Axis)=} opt_value
 * @return {anychart.core.Axis|anychart.mapModule.elements.Axis|anychart.stockModule.Axis|anychart.core.ui.Crosshair}
 */
anychart.core.ui.Crosshair.prototype.xAxis = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.xAxis_ != opt_value) {
      this.suspendSignalsDispatching();
      // set format
      if (!this.xLabel_.format() ||
          (this.xAxis_ && this.xLabel_.format() == this.xAxis_.labels().getOption('format'))) {

        this.xLabel_.format(/** @type {Function} */(opt_value.labels().getOption('format')));
      }

      // set anchor
      this.xLabel_.autoAnchor(this.getAnchorByAxis_(opt_value));

      this.xAxis_ = opt_value;
      this.resumeSignalsDispatching(true);
    }
    return this;
  } else {
    return this.xAxis_;
  }
};


/**
 *
 * @param {(anychart.core.Axis|anychart.mapModule.elements.Axis)=} opt_value
 * @return {anychart.core.Axis|anychart.mapModule.elements.Axis|anychart.core.ui.Crosshair}
 */
anychart.core.ui.Crosshair.prototype.yAxis = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.yAxis_ != opt_value) {
      this.suspendSignalsDispatching();
      // set format
      if (!this.yLabel_.format() ||
          (this.yAxis_ && this.yLabel_.format() == this.yAxis_.labels()['format']())) {

        this.yLabel_.format(/** @type {Function} */(opt_value.labels()['format']()));
      }

      // set anchor
      this.yLabel_.autoAnchor(this.getAnchorByAxis_(opt_value));

      this.yAxis_ = opt_value;
      this.resumeSignalsDispatching(true);
    }
    return this;
  } else {
    return this.yAxis_;
  }
};


/**
 *
 * @param {anychart.core.Axis|anychart.mapModule.elements.Axis|anychart.stockModule.Axis} axis
 * @return {anychart.enums.Anchor}
 * @private
 */
anychart.core.ui.Crosshair.prototype.getAnchorByAxis_ = function(axis) {
  switch (axis.orientation()) {
    case anychart.enums.Orientation.LEFT:
      return anychart.enums.Anchor.RIGHT_CENTER;
    case anychart.enums.Orientation.TOP:
      return anychart.enums.Anchor.CENTER_BOTTOM;
    case anychart.enums.Orientation.RIGHT:
      return anychart.enums.Anchor.LEFT_CENTER;
    case anychart.enums.Orientation.BOTTOM:
      return anychart.enums.Anchor.CENTER_TOP;
    default:
      return anychart.enums.Anchor.LEFT_TOP;
  }
};


/**
 * Getter crosshair xLabel
 * @param {(Object|boolean|null)=} opt_value
 * @return {anychart.core.ui.CrosshairLabel|anychart.core.ui.Crosshair}
 */
anychart.core.ui.Crosshair.prototype.xLabel = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.xLabel_.setup(opt_value);
    return this;
  } else {
    return this.xLabel_;
  }
};


/**
 * Getter crosshair yLabel
 * @param {(Object|boolean|null)=} opt_value
 * @return {anychart.core.ui.CrosshairLabel|anychart.core.ui.Crosshair}
 */
anychart.core.ui.Crosshair.prototype.yLabel = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.yLabel_.setup(opt_value);
    return this;
  } else {
    return this.yLabel_;
  }
};


//endregion
//region -- Draw.
/**
 * Create xLine, yLine and Labels
 * @return {!anychart.core.ui.Crosshair} {@link anychart.core.ui.Crosshair} instance for method chaining.
 */
anychart.core.ui.Crosshair.prototype.draw = function() {
  if (!this.checkDrawingNeeded())
    return this;

  var bounds = /** @type {anychart.math.Rect} */(this.parentBounds());
  var zIndex = /** @type {number} */(this.zIndex());
  var container = /** @type {acgraph.vector.ILayer} */(this.container());

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    this.xLine.stroke(/** @type {acgraph.vector.Stroke} */ (this.getOption('xStroke')));
    this.yLine.stroke(/** @type {acgraph.vector.Stroke} */ (this.getOption('yStroke')));

    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    this.xLine.parent(container);
    this.yLine.parent(container);

    this.xLabel_.container(container);
    this.yLabel_.container(container);

    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    this.xLine.zIndex(zIndex);
    this.yLine.zIndex(zIndex);

    this.xLabel_.setAutoZIndex(zIndex);
    this.yLabel_.setAutoZIndex(zIndex);

    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    this.xLabel_.parentBounds(bounds);
    this.yLabel_.parentBounds(bounds);

    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }

  return this;
};


//endregion
/**
 * Gets/sets interactivity target.
 * @param {(anychart.core.ChartWithAxes|anychart.mapModule.Chart|anychart.stockModule.Chart|anychart.stockModule.Plot)=} opt_value - Target to set.
 * @return {anychart.core.ui.Crosshair|anychart.core.ChartWithAxes|anychart.mapModule.Chart|anychart.stockModule.Chart|anychart.stockModule.Plot}
 */
anychart.core.ui.Crosshair.prototype.interactivityTarget = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.interactivityTarget_ != opt_value) {
      if (this.interactivityTarget_) {
        this.interactivityTarget_.unlisten(acgraph.events.EventType.MOUSEOVER, this.handleMouseOverAndMove, false, this);
        this.interactivityTarget_.unlisten(acgraph.events.EventType.MOUSEMOVE, this.handleMouseOverAndMove, false, this);
        this.interactivityTarget_.unlisten(acgraph.events.EventType.MOUSEOUT, this.handleMouseOut, false, this);
      }
      this.interactivityTarget_ = opt_value;
      if (this.interactivityTarget_) { // null condition.
        this.interactivityTarget_.listen(acgraph.events.EventType.MOUSEOVER, this.handleMouseOverAndMove, false, this);
        this.interactivityTarget_.listen(acgraph.events.EventType.MOUSEMOVE, this.handleMouseOverAndMove, false, this);
        this.interactivityTarget_.listen(acgraph.events.EventType.MOUSEOUT, this.handleMouseOut, false, this);
      }
    }
    return this;
  }
  return this.interactivityTarget_;
};


/**
 * Handler for sticky mode.
 */
anychart.core.ui.Crosshair.prototype.hide = function() {
  this.hideX();
  this.hideY();
};


/**
 * Removes x-part of crosshair.
 * @protected
 */
anychart.core.ui.Crosshair.prototype.hideX = function() {
  this.xLine.clear();
  this.xLabel_.container(null);
  this.xLabel_.remove();
};


/**
 * Removes y-part of crosshair.
 * @protected
 */
anychart.core.ui.Crosshair.prototype.hideY = function() {
  this.yLine.clear();
  this.yLabel_.container(null);
  this.yLabel_.remove();
};


/**
 * Checks whether scale for axis can return a value.
 * @param {anychart.core.Axis|anychart.mapModule.elements.Axis|anychart.stockModule.Axis} axis Axis.
 * @return {boolean} Is scale of axis can resolve defined ratio.
 */
anychart.core.ui.Crosshair.prototype.canDrawForAxis = function(axis) {
  return goog.isDef(axis.scale().inverseTransform(0));
};


/**
 * Handler for float mode.
 * @param {anychart.core.MouseEvent} e Event object.
 * @protected
 */
anychart.core.ui.Crosshair.prototype.handleMouseOverAndMove = function(e) {
  if (!this.enabled()) return;

  var mouseY;
  var clientX = e['clientX'];
  var clientY = e['clientY'];

  var chartOffset = this.container().getStage().getClientPosition();
  var mouseX = clientX - chartOffset.x;

  if (this.getOption('displayMode') == anychart.enums.CrosshairDisplayMode.STICKY) {
    var pointsData = this.interactivityTarget_.getByXInfo(clientX, clientY);
    if (pointsData) {
      var nearestSeries, nearestIndex;
      var nearestDistance = Infinity;
      for (var i = 0; i < pointsData.length; i++) {
        var data = pointsData[i];
        var dataDistance = data.nearestPointToCursor.distance;
        if (dataDistance < nearestDistance) {
          nearestDistance = dataDistance;
          nearestSeries = data.series;
          nearestIndex = data.nearestPointToCursor.index;
        }
      }
      var iterator = nearestSeries.getIterator();
      iterator.select(nearestIndex);
      // mouseX = anychart.utils.toNumber(iterator.meta('x'));
    }
  }

  var bounds = this.parentBounds();

  mouseY = clientY - chartOffset.y;

  if (mouseX >= bounds.getLeft() && mouseX <= bounds.getRight() &&
      mouseY >= bounds.getTop() && mouseY <= bounds.getBottom()) {

    if (this.xAxis_ && this.canDrawForAxis(this.xAxis_)) {
      this.drawLine_(this.xAxis_, mouseX, mouseY);
      this.drawLabel_(this.xAxis_, mouseX, mouseY);
    } else {
      this.hideX();
    }

    if (this.yAxis_ && this.canDrawForAxis(this.yAxis_)) {
      this.drawLine_(this.yAxis_, mouseX, mouseY);
      this.drawLabel_(this.yAxis_, mouseX, mouseY);
    } else {
      this.hideY();
    }

  } else {
    this.hide();
  }
};


/**
 * This flag is used to auto enable or disable xLabel.
 * Used to correctly show xLabels for stock plots.
 * @param {boolean=} opt_value - Value to set.
 * @return {boolean|anychart.core.ui.Crosshair}
 */
anychart.core.ui.Crosshair.prototype.xLabelAutoEnabled = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.xLabelAutoEnabled_ = opt_value;
    return this;
  }
  return this.xLabelAutoEnabled_;
};


/**
 * Draws X or Y line.
 * @param {anychart.core.Axis|anychart.mapModule.elements.Axis|anychart.stockModule.Axis} axis - Axis.
 * @param {number} mouseX - .
 * @param {number} mouseY - .
 * @private
 */
anychart.core.ui.Crosshair.prototype.drawLine_ = function(axis, mouseX, mouseY) {
  var xDirection = axis == this.xAxis_;
  var line = xDirection ? this.xLine : this.yLine;

  var stroke = this.getOption(xDirection ? 'xStroke' : 'yStroke');
  if (stroke && !anychart.utils.isNone(stroke)) {
    var bounds = this.parentBounds();
    var width = bounds.getRight() - bounds.getLeft();
    var height = bounds.getBottom() - bounds.getTop();
    var dataPlotOffsetX = mouseX - bounds.getLeft();
    var dataPlotOffsetY = mouseY - bounds.getTop();
    var shift = line.strokeThickness() % 2 == 0 ? 0 : -.5;
    var isHorizontal = axis.isHorizontal();

    var startX, startY, endX, endY;
    var scale = axis.scale();

    var offset = isHorizontal ? dataPlotOffsetX : dataPlotOffsetY;
    var side = isHorizontal ? width : height;
    var start = isHorizontal ? bounds.getLeft() : bounds.getTop();

    var ratio = scale.transform(scale.inverseTransform(offset / side), .5); //aligning
    var coord = Math.round(start + ratio * side);
    if (isHorizontal) {
      startX = coord - shift;
      startY = bounds.getTop();
      endX = startX;
      endY = bounds.getBottom();
    } else {
      startX = bounds.getLeft();
      startY = coord - shift;
      endX = bounds.getRight();
      endY = startY;
    }
    line.clear()
        .moveTo(startX, startY)
        .lineTo(endX, endY);
  }
};


/**
 * Draws X or Y label.
 * @param {anychart.core.Axis|anychart.mapModule.elements.Axis|anychart.stockModule.Axis} axis - Axis.
 * @param {number} mouseX - .
 * @param {number} mouseY - .
 * @param {number=} opt_ratio - Ratio value set directly. Used for stock plot to provide plot's date alignment without
 *  considering mouse ratio.
 * @private
 */
anychart.core.ui.Crosshair.prototype.drawLabel_ = function(axis, mouseX, mouseY, opt_ratio) {
  var xDirection = axis == this.xAxis_;
  var label = xDirection ? this.xLabel_ : this.yLabel_;

  //complex condition for stock auto label hide purposes.
  var enabled = xDirection ? (label.hasOwnOption('enabled') && label.ownSettings['enabled']) ||
      (label.enabled() && this.xLabelAutoEnabled_) :
      label.enabled();

  if (enabled) {
    var bounds = this.parentBounds();
    var width = bounds.getRight() - bounds.getLeft();
    var height = bounds.getBottom() - bounds.getTop();
    var isHorizontal = axis.isHorizontal();
    var side = isHorizontal ? width : height;
    var scale = axis.scale();
    var start = isHorizontal ? bounds.getLeft() : bounds.getTop();

    var providedRatio;
    if (goog.isDef(opt_ratio)) {
      providedRatio = opt_ratio;
    } else {
      var dataPlotOffsetX = mouseX - bounds.getLeft();
      var dataPlotOffsetY = mouseY - bounds.getTop();
      var offset = isHorizontal ? dataPlotOffsetX : dataPlotOffsetY;
      providedRatio = offset / side;
    }

    var ratio = scale.transform(scale.inverseTransform(providedRatio), .5); //aligning

    var provider = this.getLabelsFormatProvider(axis, isHorizontal ? ratio : 1 - ratio);
    var labelFormat = /** @type {string|Function} */(label.getOption('format') || anychart.utils.DEFAULT_FORMATTER);
    if (goog.isString(labelFormat))
      labelFormat = anychart.core.utils.TokenParser.getInstance().getFormat(labelFormat);
    label.text(labelFormat.call(provider, provider));
    var labelPosition = this.getLabelPosition_(axis, label, side, start, ratio);
    label.x(/** @type {number}*/(labelPosition.x)).y(/** @type {number}*/(labelPosition.y));
    label.container(/** @type {acgraph.vector.ILayer} */(this.container())).draw();
  }
};


/**
 * For Shock chart: highlights vertical line.
 * @param {number} x - X coordinate got from plot mouse move event.
 * @param {boolean=} opt_showXLabel - Whether to show xLabel.
 * @param {boolean=} opt_hideY -  Whether to hide Y line and label.
 * @param {number=} opt_y - .
 * @param {number=} opt_ratio - .
 */
anychart.core.ui.Crosshair.prototype.autoHighlightX = function(x, opt_showXLabel, opt_hideY, opt_y, opt_ratio) {
  if (this.enabled()) {
    if (opt_hideY) {
      this.hideY();
    } else {
      if (goog.isDef(opt_y)) {
        var chartOffset = this.container().getStage().getClientPosition();
        opt_y = opt_y - chartOffset.y;
        this.drawLine_(this.yAxis_, x, opt_y);
        this.drawLabel_(this.yAxis_, x, opt_y);
      }
    }

    if (opt_showXLabel || (this.xLabel_.hasOwnOption('enabled') && this.xLabel_.ownSettings['enabled'])) {
      this.drawLabel_(this.xAxis_, x, opt_y || 0, opt_ratio);
    } else {
      this.xLabel_.container(null).remove();
    }
    this.drawLine_(this.xAxis_, x, opt_y || 0);
  }
};


/**
 * Get the coordinate on the axis scale, given the type of scale.
 * @param {anychart.core.Axis|anychart.mapModule.elements.Axis|anychart.stockModule.Axis} axis
 * @param {number} ratio Current ratio.
 * @param {number} coord Current mouse coordinate.
 * @return {number}
 * @private
 */
anychart.core.ui.Crosshair.prototype.prepareCoordinate_ = function(axis, ratio, coord) {
  var bounds = this.parentBounds();
  var scale = axis.scale();
  var isOrdinal = scale.getType() == anychart.enums.ScaleTypes.ORDINAL;
  var centerRatio = scale.transform(scale.inverseTransform(ratio), .5);

  if (axis.isHorizontal()) {
    return isOrdinal ? Math.round(bounds.left + centerRatio * bounds.width) : coord;
  } else {
    return isOrdinal ? Math.round(bounds.top + bounds.height - centerRatio * bounds.height) : coord;
  }
};


/**
 * Get the label position, given the type of scale and axis orientation.
 * @param {anychart.core.Axis|anychart.mapModule.elements.Axis|anychart.stockModule.Axis} axis
 * @param {anychart.core.ui.CrosshairLabel} label
 * @param {number} side - .
 * @param {number} start - .
 * @param {number} ratio Current ratio.
 * @return {anychart.math.CoordinateObject}
 * @private
 */
anychart.core.ui.Crosshair.prototype.getLabelPosition_ = function(axis, label, side, start, ratio) {
  var bounds = this.parentBounds();
  var x = 0, y = 0;

  if (!axis) return {x: x, y: y};

  var axisBounds = axis.getPixelBounds();
  var shift = 1;

  var axisEnabled = axis.enabled();
  var left = axisEnabled ? axisBounds.getLeft() : bounds.getRight();
  var top = axisEnabled ? axisBounds.getTop() : bounds.getBottom();
  var right = axisEnabled ? axisBounds.getRight() : bounds.getLeft();
  var bottom = axisEnabled ? axisBounds.getBottom() : bounds.getTop();

  switch (axis.orientation()) {
    case anychart.enums.Orientation.LEFT:
      x = this.isLabelAnchorLeft(label) ? right - shift : right + shift;
      y = Math.round(bounds.top + ratio * side);
      break;
    case anychart.enums.Orientation.TOP:
      x = Math.round(bounds.left + ratio * side);
      y = this.isLabelAnchorTop(label) ? bottom - shift : bottom + shift;
      break;
    case anychart.enums.Orientation.RIGHT:
      x = this.isLabelAnchorLeft(label) ? left - shift : left + shift;
      y = Math.round(bounds.top + ratio * side);
      break;
    case anychart.enums.Orientation.BOTTOM:
      x = Math.round(bounds.left + ratio * side);
      y = this.isLabelAnchorTop(label) ? top - shift : top + shift;
      break;
  }

  return {x: x, y: y};
};


/**
 *
 * @param {anychart.core.ui.CrosshairLabel} label
 * @return {boolean}
 */
anychart.core.ui.Crosshair.prototype.isLabelAnchorLeft = function(label) {
  var anchor = label.getFinalAnchor();
  return anchor == anychart.enums.Anchor.LEFT_TOP ||
      anchor == anychart.enums.Anchor.LEFT_CENTER ||
      anchor == anychart.enums.Anchor.LEFT_BOTTOM;
};


/**
 *
 * @param {anychart.core.ui.CrosshairLabel} label
 * @return {boolean}
 */
anychart.core.ui.Crosshair.prototype.isLabelAnchorTop = function(label) {
  var anchor = label.getFinalAnchor();
  return anchor == anychart.enums.Anchor.LEFT_TOP ||
      anchor == anychart.enums.Anchor.CENTER_TOP ||
      anchor == anychart.enums.Anchor.RIGHT_TOP;
};


/**
 * Gets format provider for label.
 * @param {anychart.core.Axis|anychart.mapModule.elements.Axis|anychart.stockModule.Axis} axis
 * @param {number} ratio
 * @return {Object} Labels format provider.
 * @protected
 */
anychart.core.ui.Crosshair.prototype.getLabelsFormatProvider = function(axis, ratio) {
  if (!axis) return null;

  var scale = axis.scale();
  var scaleType = scale.getType();
  var scaleValue = scale.inverseTransform(ratio);

  var labelText;
  var labelType = anychart.enums.TokenType.NUMBER;
  switch (scaleType) {
    case anychart.enums.ScaleTypes.LINEAR:
    case anychart.enums.ScaleTypes.LOG:
      labelText = scaleValue;
      break;
    case anychart.enums.ScaleTypes.ORDINAL:
      labelText = String(scaleValue);
      labelType = anychart.enums.TokenType.STRING;
      break;
    case anychart.enums.ScaleTypes.STOCK_SCATTER_DATE_TIME:
    case anychart.enums.ScaleTypes.STOCK_ORDINAL_DATE_TIME:
    case anychart.enums.ScaleTypes.DATE_TIME:
      labelText = anychart.format.date(scaleValue);
      labelType = anychart.enums.TokenType.STRING; // date already formatted
      break;
  }

  var values = {
    'value': {value: labelText, type: labelType}, // because labelText - already formatted value
    'rawValue': {value: scaleValue, type: anychart.enums.TokenType.NUMBER},
    'max': {value: goog.isDef(scale.max) ? scale.max : null, type: anychart.enums.TokenType.NUMBER},
    'min': {value: goog.isDef(scale.min) ? scale.min : null, type: anychart.enums.TokenType.NUMBER},
    'scale': {value: scale, type: anychart.enums.TokenType.UNKNOWN},
    'tickValue': {value: scaleValue, type: anychart.enums.TokenType.NUMBER}
  };

  var context = new anychart.format.Context(values);
  return context.propagate();
};


/**
 * Handler for float mode.
 * @param {anychart.core.MouseEvent} e Event object.
 * @protected
 */
anychart.core.ui.Crosshair.prototype.handleMouseOut = function(e) {
  var bounds = this.parentBounds();

  var offsetX = e['offsetX'];
  var offsetY = e['offsetY'];

  if ((offsetX <= bounds.getLeft() || offsetX >= bounds.getRight()) ||
      (offsetY <= bounds.getTop() || offsetY >= bounds.getBottom())) {

    this.hide();
  }
};


/** @inheritDoc */
anychart.core.ui.Crosshair.prototype.remove = function() {
  this.hide();
};


//region -- Disposing.
/** @inheritDoc */
anychart.core.ui.Crosshair.prototype.disposeInternal = function() {
  if (this.interactivityTarget_) {
    this.interactivityTarget_.unlisten(acgraph.events.EventType.MOUSEOVER, this.handleMouseOverAndMove, false, this);
    this.interactivityTarget_.unlisten(acgraph.events.EventType.MOUSEMOVE, this.handleMouseOverAndMove, false, this);
    this.interactivityTarget_.unlisten(acgraph.events.EventType.MOUSEOUT, this.handleMouseOut, false, this);
    this.interactivityTarget_ = null;
  }

  goog.dispose(this.xLine);
  this.xLine = null;

  goog.dispose(this.yLine);
  this.yLine = null;

  this.xAxis_ = null;
  this.yAxis_ = null;

  goog.dispose(this.xLabel_);
  this.xLabel_ = null;

  goog.dispose(this.yLabel_);
  this.yLabel_ = null;

  anychart.core.ui.Crosshair.base(this, 'disposeInternal');
};


//endregion
//region -- Serialize/Deserialize.
/** @inheritDoc */
anychart.core.ui.Crosshair.prototype.enabled = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.ownSettings['enabled'] != opt_value) {
      this.ownSettings['enabled'] = opt_value;
      this.invalidate(anychart.ConsistencyState.ENABLED,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED | anychart.Signal.ENABLED_STATE_CHANGED);
      if (this.ownSettings['enabled']) {
        this.doubleSuspension = false;
        this.resumeSignalsDispatching(true);
      } else {
        if (isNaN(this.suspendedDispatching)) {
          this.suspendSignalsDispatching();
        } else {
          this.doubleSuspension = true;
        }
      }
    }
    return this;
  } else {
    return /** @type {boolean} */(this.getOption('enabled'));
  }
};


/** @inheritDoc */
anychart.core.ui.Crosshair.prototype.serialize = function() {
  var json = anychart.core.ui.Crosshair.base(this, 'serialize');
  anychart.core.settings.serialize(this, anychart.core.ui.Crosshair.DESCRIPTORS, json, 'Crosshair');
  json['xLabel'] = this.xLabel_.serialize();
  json['yLabel'] = this.yLabel_.serialize();
  return json;
};


/** @inheritDoc */
anychart.core.ui.Crosshair.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.ui.Crosshair.base(this, 'setupByJSON', config, opt_default);

  if (opt_default) {
    anychart.core.settings.copy(this.themeSettings, anychart.core.ui.Crosshair.DESCRIPTORS, config);
  } else {
    anychart.core.settings.deserialize(this, anychart.core.ui.Crosshair.DESCRIPTORS, config);
  }
  this.xLabel().setupInternal(!!opt_default, config['xLabel']);
  this.yLabel().setupInternal(!!opt_default, config['yLabel']);
};


//endregion
//exports
(function() {
  var proto = anychart.core.ui.Crosshair.prototype;
  proto['xLabel'] = proto.xLabel;
  proto['yLabel'] = proto.yLabel;
})();
