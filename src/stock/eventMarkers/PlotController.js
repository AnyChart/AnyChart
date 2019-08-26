goog.provide('anychart.stockModule.eventMarkers.PlotController');
goog.require('anychart.core.StateSettings');
goog.require('anychart.core.VisualBase');
goog.require('anychart.core.ui.Tooltip');
goog.require('anychart.math.Rect');
goog.require('anychart.stockModule.eventMarkers.Group');



/**
 * Plot-level event markers controller.
 * @param {anychart.stockModule.Plot} plot
 * @param {anychart.stockModule.eventMarkers.ChartController} chartController
 * @constructor
 * @extends {anychart.core.VisualBase}
 */
anychart.stockModule.eventMarkers.PlotController = function(plot, chartController) {
  anychart.stockModule.eventMarkers.PlotController.base(this, 'constructor');

  this.addThemes('stock.eventMarkers');

  chartController.listenSignals(this.onSignal_, this);

  /**
   * Plot reference.
   * @type {anychart.stockModule.Plot}
   * @private
   */
  this.plot_ = plot;

  /**
   * Groups list.
   * @type {!Array.<anychart.stockModule.eventMarkers.Group>}
   * @private
   */
  this.groups_ = [];

  /**
   * Event marker offsets hash map.
   * @type {Object.<Object>}
   * @private
   */
  this.eventMarkerOffsets_ = {};

  /**
   * @type {Array.<acgraph.vector.Path>}
   * @private
   */
  this.connectorPaths_ = [];

  this.normal_ = new anychart.core.StateSettings(this,
      anychart.stockModule.eventMarkers.Group.STATE_DESCRIPTORS_META_NORMAL,
      anychart.PointState.NORMAL,
      anychart.stockModule.eventMarkers.Group.STATE_DESCRIPTORS_OVERRIDE);
  this.normal_.setOption(anychart.core.StateSettings.CONNECTOR_AFTER_INIT_CALLBACK, anychart.core.StateSettings.DEFAULT_CONNECTOR_AFTER_INIT_CALLBACK);
  this.normal_.addThemes('defaultFontSettings', 'stock.eventMarkers.normal');

  this.hovered_ = new anychart.core.StateSettings(this,
      anychart.stockModule.eventMarkers.Group.STATE_DESCRIPTORS_META_STATE,
      anychart.PointState.NORMAL,
      anychart.stockModule.eventMarkers.Group.STATE_DESCRIPTORS_OVERRIDE);
  this.setupCreated('hovered', this.hovered_);

  this.selected_ = new anychart.core.StateSettings(this,
      anychart.stockModule.eventMarkers.Group.STATE_DESCRIPTORS_META_STATE,
      anychart.PointState.NORMAL,
      anychart.stockModule.eventMarkers.Group.STATE_DESCRIPTORS_OVERRIDE);
  this.setupCreated('selected', this.selected_);

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, anychart.stockModule.eventMarkers.Group.OWN_DESCRIPTORS_META);

  /**
   * Partial resolution chains cache.
   * @type {!Array.<Array>}
   * @private
   */
  this.partialChains_ = [];

  this.bindHandlersToComponent(this);
};
goog.inherits(anychart.stockModule.eventMarkers.PlotController, anychart.core.VisualBase);
anychart.core.settings.populate(anychart.stockModule.eventMarkers.PlotController, anychart.stockModule.eventMarkers.Group.OWN_DESCRIPTORS);
anychart.core.settings.populateAliases(anychart.stockModule.eventMarkers.PlotController, anychart.stockModule.eventMarkers.Group.STATE_DESCRIPTORS_NAMES, 'normal');


/**
 * Supported consistency states
 * @type {number}
 */
anychart.stockModule.eventMarkers.PlotController.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.VisualBase.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.EVENT_MARKERS_DATA;


/**
 * Z index multiplier for default group zIndex.
 * @const {number}
 */
anychart.stockModule.eventMarkers.PlotController.Z_INDEX_GROUPS_MULTI = 0.01;


/**
 * Z index multiplier for zIndex in group.
 * Event marker has 3 layers - path, label, overlay. Path has zIndex 0, overlay - 2e-6.
 * @const {number}
 */
anychart.stockModule.eventMarkers.PlotController.Z_INDEX_MARKERS_MULTI = 3e-6;


/**
 * Z index base for event markers in state.
 * @const {number}
 */
anychart.stockModule.eventMarkers.PlotController.Z_INDEX_MARKERS_HOVERED = 30;


/**
 * Z index base for event markers in state.
 * @const {number}
 */
anychart.stockModule.eventMarkers.PlotController.Z_INDEX_MARKERS_SELECTED = 20;


/**
 * Z index multiplier for zIndex in group.
 * @const {number}
 */
anychart.stockModule.eventMarkers.PlotController.Z_INDEX_LABELS_ADD = 1e-6;


/**
 * Z index for event markers inside a plot controller group.
 * @const {number}
 */
anychart.stockModule.eventMarkers.PlotController.Z_INDEX_MARKERS = 10;


/**
 * Z index for connectors inside a plot controller group.
 * @const {number}
 */
anychart.stockModule.eventMarkers.PlotController.Z_INDEX_CONNECTORS = 0;


/**
 * Connector invalidation signal.
 * @param {anychart.SignalEvent} e
 * @private
 */
anychart.stockModule.eventMarkers.PlotController.prototype.connectorInvalidated_ = function(e) {
  this.invalidate(anychart.ConsistencyState.EVENT_MARKERS_DATA, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Normal state settings.
 * @param {!Object=} opt_value
 * @return {anychart.core.StateSettings|anychart.stockModule.eventMarkers.PlotController}
 */
anychart.stockModule.eventMarkers.PlotController.prototype.normal = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.normal_.setup(opt_value);
    return this;
  }
  return this.normal_;
};


/**
 * Hovered state settings.
 * @param {!Object=} opt_value
 * @return {anychart.core.StateSettings|anychart.stockModule.eventMarkers.PlotController}
 */
anychart.stockModule.eventMarkers.PlotController.prototype.hovered = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.hovered_.setup(opt_value);
    return this;
  }
  return this.hovered_;
};


/**
 * Selected state settings.
 * @param {!Object=} opt_value
 * @return {anychart.core.StateSettings|anychart.stockModule.eventMarkers.PlotController}
 */
anychart.stockModule.eventMarkers.PlotController.prototype.selected = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.selected_.setup(opt_value);
    return this;
  }
  return this.selected_;
};


/**
 * Returns partial resolution chain for passed state and priority.
 * Always returns 4 elements.
 * @param {anychart.PointState|number} state
 * @param {boolean} low
 * @param {boolean=} opt_forConnector
 * @return {Array.<Object>}
 */
anychart.stockModule.eventMarkers.PlotController.prototype.getPartialChain = function(state, low, opt_forConnector) {
  var index = Math.min(state, anychart.PointState.SELECT) * 4 + low * 2 + !opt_forConnector;
  var res = this.partialChains_[index];
  if (!res) {
    var controller = /** @type {anychart.stockModule.eventMarkers.ChartController} */(this.plot_.getChart().eventMarkers());
    var plotState, chartState;
    if (!state) {
      plotState = this.normal_;
      chartState = /** @type {anychart.core.StateSettings} */(controller.normal());
    } else if (state == 1) {
      plotState = this.hovered_;
      chartState = /** @type {anychart.core.StateSettings} */(controller.hovered());
    } else {
      plotState = this.selected_;
      chartState = /** @type {anychart.core.StateSettings} */(controller.selected());
    }
    if (opt_forConnector) {
      plotState = plotState.connector();
      chartState = chartState.connector();
    }
    if (low) {
      res = [(state || opt_forConnector) ? null : this.themeSettings, (state || opt_forConnector) ? null : controller.themeSettings, plotState.themeSettings, chartState.themeSettings];
    } else {
      res = [(state || opt_forConnector) ? null : this.ownSettings, (state || opt_forConnector) ? null : controller.ownSettings, plotState.ownSettings, chartState.ownSettings];
    }
    this.partialChains_[index] = res;
  }
  return res;
};



/**
 * Returns an event markers offsets object for given index.
 * @param {number} index
 * @return {Object.<number>}
 */
anychart.stockModule.eventMarkers.PlotController.prototype.getEventMarkerOffsets = function(index) {
  var res = this.eventMarkerOffsets_[index];
  if (!res) {
    res = this.eventMarkerOffsets_[index] = {};
  }
  return res;
};


/**
 * Getter/setter for groups.
 * @param {(Object|boolean|null|number)=} opt_indexOrValue Group settings to set or index of a group.
 * @param {(Object|boolean|null)=} opt_value Group settings to set.
 * @return {!anychart.stockModule.eventMarkers.Group} Axis instance by index or itself for method chaining.
 */
anychart.stockModule.eventMarkers.PlotController.prototype.group = function(opt_indexOrValue, opt_value) {
  var index,
      value;
  index = anychart.utils.toNumber(opt_indexOrValue);
  if (isNaN(index)) {
    index = 0;
    value = opt_indexOrValue;
  } else {
    index = /** @type {number} */(opt_indexOrValue);
    value = opt_value;
  }
  var group = this.groups_[index];
  if (!group) {
    group = new anychart.stockModule.eventMarkers.Group(this.plot_, index);
    group.setParentEventTarget(this);
    group.setAutoZIndex(anychart.stockModule.eventMarkers.PlotController.Z_INDEX_MARKERS + this.groups_.length * anychart.stockModule.eventMarkers.PlotController.Z_INDEX_GROUPS_MULTI);
    this.groups_[index] = group;
    group.listenSignals(this.onSignal_, this);
    this.invalidate(anychart.ConsistencyState.EVENT_MARKERS_DATA, anychart.Signal.NEEDS_REDRAW);
  }

  if (goog.isDef(value)) {
    group.setup(value);
  }
  return group;
};


/**
 * Proxy to a group with index 0 of the plot.
 * @param {(anychart.stockModule.data.TableMapping|anychart.stockModule.data.Table|Array.<Array.<*>>|string)=} opt_value
 * @return {anychart.stockModule.eventMarkers.PlotController|anychart.stockModule.data.TableMapping|anychart.stockModule.data.Table|Array.<Array.<*>>|string}
 */
anychart.stockModule.eventMarkers.PlotController.prototype.data = function(opt_value) {
  var res = this.group().data(opt_value);
  if (goog.isDef(opt_value))
    return this;
  return /** @type {anychart.stockModule.data.TableMapping|anychart.stockModule.data.Table|Array.<Array.<*>>|string} */(res);
};


/**
 * Draws all groups.
 * @return {anychart.stockModule.eventMarkers.PlotController}
 */
anychart.stockModule.eventMarkers.PlotController.prototype.draw = function() {
  if (!this.checkDrawingNeeded())
    return this;

  if (!this.rootLayer_) {
    this.rootLayer_ = acgraph.layer();
    this.bindHandlersToGraphics(this.rootLayer_);
  }
  var container = /** @type {acgraph.vector.ILayer} */(this.container());

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    this.pixelBoundsCache = /** @type {anychart.math.Rect} */(this.parentBounds());
    var stage = container.getStage();
    var width = stage ? /** @type {number} */(stage.width()) : this.pixelBoundsCache.width;
    this.rootLayer_.clip(new anychart.math.Rect(0, this.pixelBoundsCache.top, width, this.pixelBoundsCache.height));
    this.invalidate(anychart.ConsistencyState.EVENT_MARKERS_DATA);
    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.EVENT_MARKERS_DATA)) {
    this.partialChains_.length = 0;
    this.eventMarkerOffsets_ = {};
    this.clearConnectors_();
    for (var i = 0; i < this.groups_.length; i++) {
      var group = this.groups_[i];
      group.suspendSignalsDispatching();
      group.parentBounds(this.pixelBoundsCache);
      group.container(this.rootLayer_);
      group.invalidate(anychart.ConsistencyState.EVENT_MARKERS_DATA);
      group.draw();
      group.resumeSignalsDispatching(false);
    }
    this.normal_.connector().markConsistent(anychart.ConsistencyState.ALL);
    this.markConsistent(anychart.ConsistencyState.EVENT_MARKERS_DATA);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    this.rootLayer_.parent(container);
    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    this.rootLayer_.zIndex(this.zIndex());
    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  return this;
};


/**
 * Group signals handler.
 * @param {anychart.SignalEvent} event
 * @private
 */
anychart.stockModule.eventMarkers.PlotController.prototype.onSignal_ = function(event) {
  this.invalidate(anychart.ConsistencyState.EVENT_MARKERS_DATA, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Clears connector paths.
 * @private
 */
anychart.stockModule.eventMarkers.PlotController.prototype.clearConnectors_ = function() {
  if (!this.pathsPool_)
    this.pathsPool_ = /** @type {Array.<acgraph.vector.Path>} */([]);
  var path;
  while (path = this.connectorPaths_.pop()) {
    path.clear();
    path.parent(null);
    this.pathsPool_.push(path);
  }
};


/**
 * Returns connector path.
 * @param {acgraph.vector.Stroke} stroke
 * @param {acgraph.vector.Path=} opt_path
 * @return {acgraph.vector.Path}
 * @private
 */
anychart.stockModule.eventMarkers.PlotController.prototype.getConnectorPath_ = function(stroke, opt_path) {
  var path = opt_path ? opt_path.clear() : (this.pathsPool_.length ? this.pathsPool_.pop() : acgraph.path());
  if (goog.isObject(stroke) && ('keys' in stroke) && !goog.isObject(stroke['mode'])) {
    stroke = /** @type {acgraph.vector.Stroke} */(anychart.utils.recursiveClone(stroke));
    stroke['mode'] = this.pixelBoundsCache;
  }
  path.stroke(stroke);
  path.fill(null);
  path.zIndex(anychart.stockModule.eventMarkers.PlotController.Z_INDEX_CONNECTORS);
  if (!opt_path) {
    this.rootLayer_.addChild(path);
    this.connectorPaths_.push(path);
  }
  return path;
};


/**
 * Draws a connector by passed coordinates with passed stroke. Intended to be called by Groups draw().
 * @param {number} x
 * @param {number} y1
 * @param {number} y2
 * @param {acgraph.vector.Stroke} stroke
 * @param {acgraph.vector.Path=} opt_path
 * @return {acgraph.vector.Path}
 */
anychart.stockModule.eventMarkers.PlotController.prototype.drawConnector = function(x, y1, y2, stroke, opt_path) {
  var path = this.getConnectorPath_(stroke, opt_path);
  path.moveTo(x, y1).lineTo(x, y2);
  return path;
};


/** @inheritDoc */
anychart.stockModule.eventMarkers.PlotController.prototype.handleMouseEvent = function(event) {
  var group;

  var tag = anychart.utils.extractTag(event['domTarget']);

  if (anychart.utils.instanceOf(event['target'], anychart.core.ui.LabelsFactory)) {
    var parent = event['target'].getParentEventTarget();
    if (anychart.utils.instanceOf(parent, anychart.stockModule.eventMarkers.Group)) {
      group = parent;
    }
  } else if (goog.isObject(tag) && !anychart.utils.instanceOf(tag, anychart.stockModule.eventMarkers.PlotController)) {
    group = tag.group;
    event['eventMarkerIndex'] = tag.index;
  }
  if (group && !group.isDisposed() && group.enabled()) {
    var evt = group.makePointEvent(event);
    if (evt)
      group.dispatchEvent(evt);
  }
};


/**
 * Applies state to the event marker.
 * @param {anychart.stockModule.eventMarkers.Group} group
 * @param {number} markerIndex
 * @param {anychart.PointState} state
 * @param {anychart.PointState=} opt_fromState
 * @param {boolean=} opt_toggle
 * @return {boolean} - if the state changed.
 */
anychart.stockModule.eventMarkers.PlotController.prototype.applyState = function(group, markerIndex, state, opt_fromState, opt_toggle) {
  var iterator = group.getIterator();
  if (iterator.select(markerIndex)) {
    var currState = Number(iterator.meta('state') || 0);
    if (goog.isDef(opt_fromState)) {
      if (opt_toggle && currState == state) {
        state = opt_fromState;
      } else if (currState != opt_fromState) {
        return false;
      }
    }
    if (currState != state) {
      iterator.meta('state', state);
      var tuple = group.drawEventMarker();
      var offset = /** @type {number} */(tuple[1]);
      if (offset) {
        var hash = /** @type {string} */(tuple[0]);
        var stackIndex = iterator.getPointIndex();
        while (iterator.advance() && iterator.getPointIndex() == stackIndex) {
          group.translateEventMarker(iterator, hash, offset);
        }
        for (var i = group.index + 1; i < this.groups_.length; i++) {
          group = this.groups_[i];
          if (group && group.enabled() && (iterator = group.getIterator()).selectByDataIndex(stackIndex)) {
            do {
              group.translateEventMarker(iterator, hash, offset);
            } while (iterator.advance() && iterator.getPointIndex() == stackIndex);
          }
        }
      }
      return true;
    }
  }
  return false;
};


//region --- Tooltip
//------------------------------------------------------------------------------
//
//  Tooltip
//
//------------------------------------------------------------------------------
/**
 * Creates chart tooltip.
 * @param {(Object|boolean|null)=} opt_value
 * @return {!(anychart.core.ui.Tooltip|anychart.stockModule.eventMarkers.PlotController)}
 */
anychart.stockModule.eventMarkers.PlotController.prototype.tooltip = function(opt_value) {
  if (!this.tooltip_) {
    this.tooltip_ = new anychart.core.ui.Tooltip(0);
    this.tooltip_.dropThemes().parent(/** @type {anychart.core.ui.Tooltip} */(this.plot_.getChart().eventMarkers().tooltip()));
  }

  if (goog.isDef(opt_value)) {
    this.tooltip_.setup(opt_value);
    return this;
  } else {
    return this.tooltip_;
  }
};


//endregion
//region --- Ser/Deser/Disp
//------------------------------------------------------------------------------
//
//  Ser/Deser/Disp
//
//------------------------------------------------------------------------------
/** @inheritDoc */
anychart.stockModule.eventMarkers.PlotController.prototype.serialize = function() {
  var json = anychart.stockModule.eventMarkers.PlotController.base(this, 'serialize');

  // Group is not a typo
  anychart.core.settings.serialize(this, anychart.stockModule.eventMarkers.Group.OWN_DESCRIPTORS, json);
  json['normal'] = this.normal_.serialize();
  json['hovered'] = this.hovered_.serialize();
  json['selected'] = this.selected_.serialize();
  json['tooltip'] = this.tooltip().serialize();

  var groups = [];
  for (var i = 0; i < this.groups_.length; i++) {
    var group = this.groups_[i];
    groups.push(group ? group.serialize() : null);
  }
  json['groups'] = groups;

  return json;
};


/** @inheritDoc */
anychart.stockModule.eventMarkers.PlotController.prototype.setupByJSON = function(config, opt_default) {
  anychart.stockModule.eventMarkers.PlotController.base(this, 'setupByJSON', config, opt_default);

  this.normal_.setupInternal(!!opt_default, config);
  this.normal_.setupInternal(!!opt_default, config['normal']);
  this.hovered_.setupInternal(!!opt_default, config['hovered']);
  this.selected_.setupInternal(!!opt_default, config['selected']);
  this.tooltip().setupInternal(!!opt_default, config['tooltip']);
  // Group is not a typo
  anychart.core.settings.deserialize(this, anychart.stockModule.eventMarkers.Group.OWN_DESCRIPTORS, config);

  var groups, data;
  if (goog.isDef(groups = config['groups'])) {
    this.disposeGroups();
    this.clearConnectors_();
    if (goog.isArray(groups)) {
      for (var i = 0; i < groups.length; i++) {
        var group = groups[i];
        if (goog.isDefAndNotNull(group)) {
          this.group(i, group);
        }
      }
    }
  } else if (goog.isDef(data = config['data'])) {
    this.data(data);
  }
};


/**
 * Disposes groups.
 */
anychart.stockModule.eventMarkers.PlotController.prototype.disposeGroups = function() {
  goog.disposeAll(this.groups_);
  this.groups_.length = 0;
};


/** @inheritDoc */
anychart.stockModule.eventMarkers.PlotController.prototype.disposeInternal = function() {
  goog.disposeAll(this.groups_, this.rootLayer_, this.normal_, this.hovered_, this.selected_, this.tooltip_);
  delete this.groups_;
  this.normal_ = this.hovered_ = this.selected_ = this.rootLayer_ = this.plot_ = this.tooltip_ = null;
  anychart.stockModule.eventMarkers.PlotController.base(this, 'disposeInternal');
};


//endregion
//exports
(function() {
  var proto = anychart.stockModule.eventMarkers.PlotController.prototype;
  proto['group'] = proto.group;
  proto['data'] = proto.data;
  proto['tooltip'] = proto.tooltip;
  proto['normal'] = proto.normal;
  proto['hovered'] = proto.hovered;
  proto['selected'] = proto.selected;
})();

