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
   * @type {Array.<anychart.core.ui.CrosshairLabel>}
   * @private
   */
  this.xLabels_;

  /**
   * @type {Array.<anychart.core.ui.CrosshairLabel>}
   * @private
   */
  this.yLabels_;

  this.xLine.disablePointerEvents(true);
  this.yLine.disablePointerEvents(true);

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
 * Sets null as parent for all labels.
 */
anychart.core.ui.Crosshair.prototype.setLabelsParentNull = function() {
  var xLabels = this.getXLabels();
  var yLabels = this.getYLabels();
  var labels = goog.array.concat(xLabels, yLabels);
  for (var i = 0; i < labels.length; i++) {
    var label = labels[i];
    if (label)
      label.parent(null);
  }
};


/**
 * @param {Array.<anychart.core.ui.CrosshairLabel>} parentLabels
 * @param {boolean} isX
 */
anychart.core.ui.Crosshair.prototype.setParentForLabels = function(parentLabels, isX) {
  var childLabels = isX ? this.getXLabels() : this.getYLabels();
  for (var i = 0; i < parentLabels.length; i++) {
    if (parentLabels[i] && childLabels[i]) { // there is parent label with index i and child label with same index
      childLabels[i].dropThemes().parent(parentLabels[i]);
    }
  }
};


/**
 * @param {anychart.core.ui.CrosshairLabel} parentOrChildLabel
 * @param {number} index
 * @param {boolean} isX
 */
anychart.core.ui.Crosshair.prototype.propagateParentalRelationship = function(parentOrChildLabel, index, isX) {
  var labels, childLabel, parentLabel;

  // check if we have children (means that <this> crosshair instance is Stock crosshair)
  for (var uid in this.childrenMap) {
    var plotCrosshair = this.childrenMap[uid];
    labels = isX ? plotCrosshair.getXLabels() : plotCrosshair.getYLabels();
    childLabel = labels[index];
    if (!childLabel) {
      childLabel = isX ? plotCrosshair.xLabel(index) : plotCrosshair.yLabel(index);
    }
    childLabel.dropThemes().parent(parentOrChildLabel);
  }

  // check if we have parent (means that <this> crosshair instance is Plot crosshair)
  if (this.parent_) {
    labels = isX ? this.parent_.getXLabels() : this.parent_.getYLabels();
    parentLabel = labels[index];
    if (!parentLabel) {
      parentLabel = /** @type {anychart.core.ui.CrosshairLabel} */ (isX ? this.parent_.xLabel(index) : this.parent_.yLabel(index));
    }
    parentOrChildLabel.dropThemes().parent(parentLabel);
  }
};


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
        this.setLabelsParentNull();
        delete this.parent_.childrenMap[uid];
        this.parent_ = null;
      } else {
        if (this.parent_)
          this.parent_.unlistenSignals(this.parentInvalidated_, this);
        this.parent_ = opt_value;
        this.setParentForLabels(this.parent_.getXLabels(), true);
        this.setParentForLabels(this.parent_.getYLabels(), false);
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
 * For stock.
 * @param {(anychart.core.Axis|anychart.mapModule.elements.Axis|anychart.stockModule.Axis)=} opt_value
 * @return {anychart.core.Axis|anychart.mapModule.elements.Axis|anychart.stockModule.Axis|anychart.core.ui.Crosshair}
 */
anychart.core.ui.Crosshair.prototype.xAxis = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.xAxis_ != opt_value) {
      this.xAxis_ = opt_value;
    }
    return this;
  } else {
    return this.xAxis_;
  }
};


/**
 *
 * @param {anychart.core.Axis|anychart.mapModule.elements.Axis|anychart.stockModule.Axis} axis
 * @return {anychart.enums.Anchor}
 */
anychart.core.ui.Crosshair.prototype.getAnchorByAxis = function(axis) {
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
 * Getter/setter crosshair xLabel
 * @param {(null|boolean|Object|string|number)=} opt_indexOrValue Crosshair label settings or index.
 * @param {(Object|boolean|null)=} opt_value Crosshair label settings.
 * @return {anychart.core.ui.CrosshairLabel|anychart.core.ui.Crosshair}
 */
anychart.core.ui.Crosshair.prototype.xLabel = function(opt_indexOrValue, opt_value) {
  var index, value;
  if (goog.isNumber(opt_indexOrValue) || (goog.isString(opt_indexOrValue) && !isNaN(+opt_indexOrValue))) {
    index = +opt_indexOrValue;
    value = opt_value;
  } else {
    index = 0;
    value = opt_indexOrValue;
  }
  var xLabels = this.getXLabels();
  var label = xLabels[index];
  if (!label) {
    label = new anychart.core.ui.CrosshairLabel();
    label.addThemes('defaultFontSettings', 'defaultCrosshairLabel');

    xLabels[index] = label;
    this.propagateParentalRelationship(label, index, true);
    label.listenSignals(this.labelInvalidated, this);
    label.setAutoZIndex(/** @type {number} */(this.zIndex()));
  }
  if (goog.isDef(value)) {
    label.setup(value);
    return this;
  } else {
    return label;
  }
};


/**
 * Getter/setter crosshair yLabel
 * @param {(null|boolean|Object|string|number)=} opt_indexOrValue Crosshair label settings or index.
 * @param {(Object|boolean|null)=} opt_value Crosshair label settings.
 * @return {anychart.core.ui.CrosshairLabel|anychart.core.ui.Crosshair}
 */
anychart.core.ui.Crosshair.prototype.yLabel = function(opt_indexOrValue, opt_value) {
  var index, value;
  if (goog.isNumber(opt_indexOrValue) || (goog.isString(opt_indexOrValue) && !isNaN(+opt_indexOrValue))) {
    index = +opt_indexOrValue;
    value = opt_value;
  } else {
    index = 0;
    value = opt_indexOrValue;
  }
  var yLabels = this.getYLabels();
  var label = yLabels[index];
  if (!label) {
    label = new anychart.core.ui.CrosshairLabel();
    label.addThemes('defaultFontSettings', 'defaultCrosshairLabel');

    yLabels[index] = label;
    this.propagateParentalRelationship(label, index, false);
    label.listenSignals(this.labelInvalidated, this);
    label.setAutoZIndex(/** @type {number} */(this.zIndex()));
  }
  if (goog.isDef(value)) {
    label.setup(value);
    return this;
  } else {
    return label;
  }
};


/**
 * Getter for x labels.
 * @return {Array.<anychart.core.ui.CrosshairLabel>}
 */
anychart.core.ui.Crosshair.prototype.getXLabels = function() {
  if (!this.xLabels_) {
    this.xLabels_ = [];
    var labels = this.themeSettings['xLabels'];
    var i;
    if (goog.isArray(labels)) {
      for (i = 0; i < labels.length; i++)
        this.xLabel(i, labels[i]);
    } else if ('xLabel' in this.themeSettings) {
      this.xLabel(0, this.themeSettings['xLabel']);
    }
  }
  return this.xLabels_;
};


/**
 * Getter for y labels.
 * @return {Array.<anychart.core.ui.CrosshairLabel>}
 */
anychart.core.ui.Crosshair.prototype.getYLabels = function() {
  if (!this.yLabels_) {
    this.yLabels_ = [];
    var labels = this.themeSettings['yLabels'];
    var i;
    if (goog.isArray(labels)) {
      for (i = 0; i < labels.length; i++)
        this.yLabel(i, labels[i]);
    } else if ('yLabel' in this.themeSettings) {
      this.yLabel(0, this.themeSettings['yLabel']);
    }
  }
  return this.yLabels_;
};


//endregion
//region -- Draw.
/**
 * @param {Array.<anychart.core.ui.CrosshairLabel>} labels
 * @param {acgraph.vector.ILayer} container
 */
anychart.core.ui.Crosshair.prototype.setLabelsContainer = function(labels, container) {
  var labelsLength = labels.length;
  for (var i = 0; i < labelsLength; i++) {
    var label = /** @type {anychart.core.ui.CrosshairLabel} */(labels[i]);
    if (label)
      label.container(container);
  }
};


/**
 * @param {Array.<anychart.core.ui.CrosshairLabel>} labels
 * @param {anychart.math.Rect} bounds
 */
anychart.core.ui.Crosshair.prototype.setParentBounds = function(labels, bounds) {
  var labelsLength = labels.length;
  for (var i = 0; i < labelsLength; i++) {
    var label = /** @type {anychart.core.ui.CrosshairLabel} */(labels[i]);
    if (label)
      label.parentBounds(bounds);
  }
};


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

  var i, label;
  var xLabels = this.getXLabels();
  var yLabels = this.getYLabels();
  var labels = goog.array.concat(xLabels, yLabels);
  var labelsLength = labels.length;
  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    this.xLine.parent(container);
    this.yLine.parent(container);

    this.setLabelsContainer(labels, container);

    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    this.xLine.zIndex(zIndex);
    this.yLine.zIndex(zIndex);

    for (i = 0; i < labelsLength; i++) {
      label = /** @type {anychart.core.ui.CrosshairLabel} */(labels[i]);
      if (label)
        label.setAutoZIndex(zIndex);
    }

    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    this.setParentBounds(labels, bounds);
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
 * Used in stock plot.
 * @param {anychart.stockModule.Plot} target
 */
anychart.core.ui.Crosshair.prototype.setInteractivityTarget = function(target) {
  this.interactivityTarget_ = target;
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
 * @param {anychart.core.ui.CrosshairLabel=} opt_label
 */
anychart.core.ui.Crosshair.prototype.hideX = function(opt_label) {
  this.xLine.clear();
  this.hideXLabel(opt_label);
};


/**
 * Removes y-part of crosshair.
 * @param {anychart.core.ui.CrosshairLabel=} opt_label
 */
anychart.core.ui.Crosshair.prototype.hideY = function(opt_label) {
  this.yLine.clear();
  this.hideYLabel(opt_label);
};


/**
 * Hides x labels or label
 * @param {anychart.core.ui.CrosshairLabel=} opt_label
 */
anychart.core.ui.Crosshair.prototype.hideXLabel = function(opt_label) {
  if (goog.isDef(opt_label)) {
    opt_label.container(null);
    opt_label.remove();
  } else {
    var xLabels = this.getXLabels();
    for (var i = 0; i < xLabels.length; i++) {
      var label = xLabels[i];
      if (label) {
        label.container(null);
        label.remove();
      }
    }
  }
};


/**
 * Hides y labels or label
 * @param {anychart.core.ui.CrosshairLabel=} opt_label
 */
anychart.core.ui.Crosshair.prototype.hideYLabel = function(opt_label) {
  if (goog.isDef(opt_label)) {
    opt_label.container(null);
    opt_label.remove();
  } else {
    var yLabels = this.getYLabels();
    for (var i = 0; i < yLabels.length; i++) {
      var label = yLabels[i];
      if (label) {
        label.container(null);
        label.remove();
      }
    }
  }
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

  var clientX = e['clientX'];
  var clientY = e['clientY'];

  var chartOffset = this.container().getStage().getClientPosition();
  var mouseX = clientX - chartOffset.x;
  var mouseY = clientY - chartOffset.y;

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

      var xVal = anychart.utils.toNumber(iterator.meta('x'));

      var yVal = anychart.utils.getFirstNotNullValue(iterator.meta('value'), iterator.meta('close'), iterator.meta('high'));
      yVal = anychart.utils.toNumber(yVal);

      if (this.interactivityTarget_.isVerticalInternal) {
        mouseY = xVal;
        if (!isNaN(yVal))
          mouseX = yVal;
      } else {
        mouseX = xVal;
        if (!isNaN(yVal))
          mouseY = yVal;
      }
    }
  }

  var bounds = this.parentBounds();

  if (mouseX >= bounds.getLeft() && mouseX <= bounds.getRight() &&
      mouseY >= bounds.getTop() && mouseY <= bounds.getBottom()) {

    this.suspendSignalsDispatching();
    var xLabels = this.getXLabels();
    var yLabels = this.getYLabels();
    this.drawLabels_(xLabels, true, mouseX, mouseY);
    this.drawLabels_(yLabels, false, mouseX, mouseY);
    this.resumeSignalsDispatching(true);

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
 * @param {boolean} xDirection Whether is x axis.
 * @param {number} mouseX - .
 * @param {number} mouseY - .
 * @private
 */
anychart.core.ui.Crosshair.prototype.drawLine_ = function(axis, xDirection, mouseX, mouseY) {
  var line = xDirection ? this.xLine : this.yLine;

  var stroke = this.getOption(xDirection ? 'xStroke' : 'yStroke');
  if (stroke && !anychart.utils.isNone(stroke)) {
    var bounds = this.parentBounds();
    var width = bounds.getRight() - bounds.getLeft();
    var height = bounds.getBottom() - bounds.getTop();
    var dataPlotOffsetX = mouseX - bounds.getLeft();
    var dataPlotOffsetY = mouseY - bounds.getTop();
    var isHorizontal = axis.isHorizontal();

    var startX, startY, endX, endY;
    var scale = axis.scale();

    var offset = isHorizontal ? dataPlotOffsetX : dataPlotOffsetY;
    var side = isHorizontal ? width : height;
    var start = isHorizontal ? bounds.getLeft() : bounds.getTop();

    var ratio;
    var scaleType = scale.getType();
    // on this scales there is no need in aligning and precision is lost on inversetTransform/transform
    if (scaleType == 'linear' || scaleType == 'datetime' || scaleType == 'log')
      ratio = offset / side;
    else
      ratio = scale.transform(scale.inverseTransform(offset / side), .5); //aligning
    if (ratio < 0 || ratio > 1) {
      line.clear();
      return;
    }

    var coord = start + ratio * side;
    var strokeThickness = /** @type {number} */(line.strokeThickness());
    if (isHorizontal) {
      startX = anychart.utils.applyPixelShift(coord, strokeThickness);
      startY = bounds.getTop();
      endX = startX;
      endY = bounds.getBottom();
    } else {
      startX = bounds.getLeft();
      startY = anychart.utils.applyPixelShift(coord, strokeThickness);
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
 * @param {boolean} xDirection whether axis is x-axis.
 * @param {number} labelIndex Label index.
 * @param {number} mouseX - .
 * @param {number} mouseY - .
 * @param {number=} opt_ratio - Ratio value set directly. Used for stock plot to provide plot's date alignment without
 *  considering mouse ratio.
 * @private
 */
anychart.core.ui.Crosshair.prototype.drawLabel_ = function(axis, xDirection, labelIndex, mouseX, mouseY, opt_ratio) {
  var xLabels = this.getXLabels();
  var yLabels = this.getYLabels();
  var label = xDirection ? xLabels[labelIndex] : yLabels[labelIndex];

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
    if (ratio < 0 || ratio > 1) {
      label.container(null);
      label.remove();
      return;
    }

    var provider = this.getLabelsFormatProvider(axis, isHorizontal ? ratio : 1 - ratio);
    var labelFormat = /** @type {string|Function} */(label.getOption('format') || axis.labels().getOption('format') || anychart.utils.DEFAULT_FORMATTER);
    if (goog.isString(labelFormat))
      labelFormat = anychart.core.utils.TokenParser.getInstance().getFormat(labelFormat);
    label.text(labelFormat.call(provider, provider));
    label.autoAnchor(this.getAnchorByAxis(axis));
    var labelPosition = this.getLabelPosition_(axis, label, side, start, ratio);
    label.x(/** @type {number} */(labelPosition.x)).y(/** @type {number} */(labelPosition.y));
    label.container(/** @type {acgraph.vector.ILayer} */(this.container()));
    label.draw();
  }
};


/**
 * Draws labels.
 * @param {Array.<anychart.core.ui.CrosshairLabel>} labels labels array.
 * @param {boolean} xDirection whether we are drawing xLabels or yLabels
 * @param {number} mouseX - .
 * @param {number} mouseY - .
 * @param {number=} opt_ratio - Ratio value set directly. Used for stock plot to provide plot's date alignment without
 *  considering mouse ratio.
 * @param {boolean=} opt_showXLabel - Whether to show xLabel.
 * @private
 */
anychart.core.ui.Crosshair.prototype.drawLabels_ = function(labels, xDirection, mouseX, mouseY, opt_ratio, opt_showXLabel) {
  var i, label, axisIndex, axis, lineDrawed;
  var axisProvider = /** @type {(anychart.core.ChartWithAxes|anychart.mapModule.Chart|anychart.stockModule.Plot)} */(this.interactivityTarget());
  var isStock = goog.isDef(opt_ratio);
  if (isStock) {
    for (i = 0; i < labels.length; i++) {
      label = /** @type {anychart.core.ui.CrosshairLabel} */(labels[i]);
      if (label) {
        if (opt_showXLabel || label.hasOwnOption('enabled') && label.ownSettings['enabled'])
          this.drawLabel_(this.xAxis_, xDirection, i, mouseX, mouseY, opt_ratio);
        else
          this.hideXLabel(label);
      }
    }
  } else {
    var getAxisByIndex = xDirection ? axisProvider.getXAxisByIndex : axisProvider.getYAxisByIndex;
    for (i = 0; i < labels.length; i++) {
      label = /** @type {anychart.core.ui.CrosshairLabel} */(labels[i]);
      if (label) {
        axisIndex = /** @type {number} */(label.getOption('axisIndex'));
        axis = /** @type {anychart.core.Axis} */(getAxisByIndex.call(axisProvider, axisIndex));

        if (axis && this.canDrawForAxis(axis)) {
          if (!lineDrawed) {
            this.drawLine_(axis, xDirection, mouseX, mouseY);
            lineDrawed = true;
          }
          this.drawLabel_(axis, xDirection, i, mouseX, mouseY);
        } else {
          this.hideX(label);
        }
      }
    }
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
        var yLabels = this.getYLabels();
        this.drawLabels_(yLabels, false, x, opt_y);
      }
    }

    this.drawLine_(this.xAxis_, true, x, opt_y || 0);
    var xLabels = this.getXLabels();
    this.drawLabels_(xLabels, true, x, opt_y || 0, opt_ratio, opt_showXLabel);
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
      labelText = scale.roundToTicksPrecision(scaleValue);
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

  goog.disposeAll(this.xLine, this.yLine, this.xLabels_, this.yLabels_);
  this.xLine = this.yLine = this.xLabels_ = this.yLabels_ = null;

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

  var i, labels;
  labels = [];

  var xLabels = this.getXLabels();
  var yLabels = this.getYLabels();
  for (i = 0; i < xLabels.length; i++) {
    if (xLabels[i])
      labels.push(xLabels[i].serialize());
  }
  if (labels.length > 0)
    json['xLabels'] = labels;

  labels = [];
  for (i = 0; i < yLabels.length; i++) {
    if (yLabels[i])
      labels.push(yLabels[i].serialize());
  }
  if (labels.length > 0)
    json['yLabels'] = labels;

  return json;
};


/** @inheritDoc */
anychart.core.ui.Crosshair.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.ui.Crosshair.base(this, 'setupByJSON', config, opt_default);
  anychart.core.settings.deserialize(this, anychart.core.ui.Crosshair.DESCRIPTORS, config, opt_default);

  var i, labels;
  labels = config['xLabels'];
  if (goog.isArray(labels)) {
    for (i = 0; i < labels.length; i++)
      this.xLabel(i, labels[i]);
  } else if ('xLabel' in config) {
    this.xLabel(0, config['xLabel']);
  }

  labels = config['yLabels'];
  if (goog.isArray(labels)) {
    for (i = 0; i < labels.length; i++)
      this.yLabel(i, labels[i]);
  } else if ('yLabel' in config) {
    this.yLabel(0, config['yLabel']);
  }
};


//endregion
//exports
(function() {
  var proto = anychart.core.ui.Crosshair.prototype;
  proto['xLabel'] = proto.xLabel;
  proto['yLabel'] = proto.yLabel;
})();
