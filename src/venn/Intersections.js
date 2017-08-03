goog.provide('anychart.vennModule.Intersections');


goog.require('anychart.core.Base');
goog.require('anychart.core.settings.IObjectWithSettings');
goog.require('anychart.core.ui.LabelsFactory');
goog.require('anychart.core.ui.MarkersFactory');
goog.require('anychart.core.ui.Tooltip');



/**
 * Venn intersections settings collector.
 * @param {anychart.core.Chart} chart - Chart that intersections belong to.
 * @constructor
 * @extends {anychart.core.Base}
 */
anychart.vennModule.Intersections = function(chart) {
  anychart.vennModule.Intersections.base(this, 'constructor');

  /**
   * Chart.
   * @type {anychart.core.Chart}
   * @private
   */
  this.chart_ = chart;

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['fill', 0, anychart.Signal.NEEDS_REDRAW_APPEARANCE | anychart.Signal.NEED_UPDATE_LEGEND],
    ['hoverFill', 0, anychart.Signal.NEEDS_REDRAW_APPEARANCE],
    ['selectFill', 0, anychart.Signal.NEEDS_REDRAW_APPEARANCE],
    ['hatchFill', 0, anychart.Signal.NEEDS_REDRAW_APPEARANCE | anychart.Signal.NEED_UPDATE_LEGEND],
    ['hoverHatchFill', 0, anychart.Signal.NEEDS_REDRAW_APPEARANCE],
    ['selectHatchFill', 0, anychart.Signal.NEEDS_REDRAW_APPEARANCE],
    ['stroke', 0, anychart.Signal.NEEDS_REDRAW_APPEARANCE | anychart.Signal.NEED_UPDATE_LEGEND],
    ['hoverStroke', 0, anychart.Signal.NEEDS_REDRAW_APPEARANCE],
    ['selectStroke', 0, anychart.Signal.NEEDS_REDRAW_APPEARANCE]
  ]);
};
goog.inherits(anychart.vennModule.Intersections, anychart.core.Base);


/**
 * Supported signals mask.
 * @type {number}
 */
anychart.vennModule.Intersections.prototype.SUPPORTED_SIGNALS =
    anychart.core.Base.prototype.SUPPORTED_SIGNALS |
    anychart.Signal.NEEDS_REDRAW_LABELS |
    anychart.Signal.NEEDS_REDRAW_APPEARANCE |
    anychart.Signal.NEEDS_UPDATE_MARKERS |
    anychart.Signal.NEED_UPDATE_LEGEND;


//region -- Descriptors
/**
 * Simple descriptors.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.vennModule.Intersections.prototype.SIMPLE_PROPS_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'fill',
      anychart.core.settings.fillOrFunctionNormalizer);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'hoverFill',
      anychart.core.settings.fillOrFunctionNormalizer);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'selectFill',
      anychart.core.settings.fillOrFunctionNormalizer);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'hatchFill',
      anychart.core.settings.hatchFillOrFunctionNormalizer);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'hoverHatchFill',
      anychart.core.settings.hatchFillOrFunctionNormalizer);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'selectHatchFill',
      anychart.core.settings.hatchFillOrFunctionNormalizer);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'stroke',
      anychart.core.settings.strokeOrFunctionNormalizer);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'hoverStroke',
      anychart.core.settings.strokeOrFunctionNormalizer);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'selectStroke',
      anychart.core.settings.strokeOrFunctionNormalizer);

  return map;
})();
anychart.core.settings.populate(anychart.vennModule.Intersections, anychart.vennModule.Intersections.prototype.SIMPLE_PROPS_DESCRIPTORS);


//endregion
//region -- Labels
/**
 * Getter/setter for current series data labels.
 * @param {(Object|boolean|null)=} opt_value Series data labels settings.
 * @return {!(anychart.core.ui.LabelsFactory|anychart.vennModule.Intersections)} Labels instance or itself for chaining call.
 */
anychart.vennModule.Intersections.prototype.labels = function(opt_value) {
  if (!this.labels_) {
    this.labels_ = new anychart.core.ui.LabelsFactory();
    // this.labels_.setParentEventTarget(this);
    this.labels_.listenSignals(this.labelsInvalidated_, this);
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
 * Gets or sets series hover data labels.
 * @param {(Object|boolean|null)=} opt_value Series data labels settings.
 * @return {!(anychart.core.ui.LabelsFactory|anychart.vennModule.Intersections)} Labels instance or itself for chaining call.
 */
anychart.vennModule.Intersections.prototype.hoverLabels = function(opt_value) {
  if (!this.hoverLabels_) {
    this.hoverLabels_ = new anychart.core.ui.LabelsFactory();
    this.hoverLabels_.markConsistent(anychart.ConsistencyState.ALL);
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
 * Gets or sets series select data labels.
 * @param {(Object|boolean|null)=} opt_value Series data labels settings.
 * @return {!(anychart.core.ui.LabelsFactory|anychart.vennModule.Intersections)} Labels instance or itself for chaining call.
 */
anychart.vennModule.Intersections.prototype.selectLabels = function(opt_value) {
  if (!this.selectLabels_) {
    this.selectLabels_ = new anychart.core.ui.LabelsFactory();
    this.selectLabels_.markConsistent(anychart.ConsistencyState.ALL);
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
 * Listener for labels invalidation.
 * @param {anychart.SignalEvent} event - Invalidation event.
 * @private
 */
anychart.vennModule.Intersections.prototype.labelsInvalidated_ = function(event) {
  this.dispatchSignal(anychart.Signal.NEEDS_REDRAW_LABELS);
};


/**
 * Marks labels as consistent.
 */
anychart.vennModule.Intersections.prototype.markLabelsConsistent = function() {
  this.labels().markConsistent(anychart.ConsistencyState.ALL);
  this.selectLabels().markConsistent(anychart.ConsistencyState.ALL);
  this.hoverLabels().markConsistent(anychart.ConsistencyState.ALL);
};


//endregion
//region -- Markers
/**
 * Getter/setter for markers.
 * @param {(Object|boolean|null|string)=} opt_value Series data markers settings.
 * @return {!(anychart.core.ui.MarkersFactory|anychart.vennModule.Intersections)} Markers instance or itself for chaining call.
 */
anychart.vennModule.Intersections.prototype.markers = function(opt_value) {
  if (!this.markers_) {
    this.markers_ = new anychart.core.ui.MarkersFactory();
    this.markers_.setParentEventTarget(this);
    this.markers_.listenSignals(this.markersInvalidated_, this);
  }

  if (goog.isDef(opt_value)) {
    if (goog.isObject(opt_value) && !('enabled' in opt_value))
      opt_value['enabled'] = true;
    this.markers_.setup(opt_value);
    return this;
  }
  return this.markers_;
};


/**
 * Getter/setter for hoverMarkers.
 * @param {(Object|boolean|null|string)=} opt_value Series data markers settings.
 * @return {!(anychart.core.ui.MarkersFactory|anychart.vennModule.Intersections)} Markers instance or itself for chaining call.
 */
anychart.vennModule.Intersections.prototype.hoverMarkers = function(opt_value) {
  if (!this.hoverMarkers_) {
    this.hoverMarkers_ = new anychart.core.ui.MarkersFactory();
    this.hoverMarkers_.markConsistent(anychart.ConsistencyState.ALL);
    // don't listen to it, for it will be reapplied at the next hover
  }

  if (goog.isDef(opt_value)) {
    if (goog.isObject(opt_value) && !('enabled' in opt_value))
      opt_value['enabled'] = true;
    this.hoverMarkers_.setup(opt_value);
    return this;
  }
  return this.hoverMarkers_;
};


/**
 * @param {(Object|boolean|null|string)=} opt_value Series data markers settings.
 * @return {!(anychart.core.ui.MarkersFactory|anychart.vennModule.Intersections)} Markers instance or itself for chaining call.
 */
anychart.vennModule.Intersections.prototype.selectMarkers = function(opt_value) {
  if (!this.selectMarkers_) {
    this.selectMarkers_ = new anychart.core.ui.MarkersFactory();
    this.selectMarkers_.markConsistent(anychart.ConsistencyState.ALL);
    // don't listen to it, for it will be reapplied at the next hover
  }

  if (goog.isDef(opt_value)) {
    if (goog.isObject(opt_value) && !('enabled' in opt_value))
      opt_value['enabled'] = true;
    this.selectMarkers_.setup(opt_value);
    return this;
  }
  return this.selectMarkers_;
};


/**
 * Listener for markers invalidation.
 * @param {anychart.SignalEvent} event - Invalidation event.
 * @private
 */
anychart.vennModule.Intersections.prototype.markersInvalidated_ = function(event) {
  this.dispatchSignal(anychart.Signal.NEEDS_UPDATE_MARKERS);
};


/**
 * Marks markers as consistent.
 */
anychart.vennModule.Intersections.prototype.markMarkersConsistent = function() {
  this.markers().markConsistent(anychart.ConsistencyState.ALL);
  this.selectMarkers().markConsistent(anychart.ConsistencyState.ALL);
  this.hoverMarkers().markConsistent(anychart.ConsistencyState.ALL);
};


//endregion
//region -- Tooltip
/**
 * Getter and setter for the tooltip.
 * @param {(Object|boolean|null)=} opt_value Tooltip settings.
 * @return {!(anychart.vennModule.Intersections|anychart.core.ui.Tooltip)} Tooltip instance or itself for chaining call.
 */
anychart.vennModule.Intersections.prototype.tooltip = function(opt_value) {
  if (!this.tooltip_) {
    this.tooltip_ = new anychart.core.ui.Tooltip(0);
    var parent = /** @type {anychart.core.ui.Tooltip} */ (this.chart_.tooltip());
    this.tooltip_.parent(parent);
    this.tooltip_.chart(this.chart_);
  }
  if (goog.isDef(opt_value)) {
    this.tooltip_.setup(opt_value);
    return this;
  } else {
    return this.tooltip_;
  }
};


//endregion
//region -- Serialization/Deserialization
/** @inheritDoc */
anychart.vennModule.Intersections.prototype.serialize = function() {
  var json = anychart.vennModule.Intersections.base(this, 'serialize');

  anychart.core.settings.serialize(this, this.SIMPLE_PROPS_DESCRIPTORS, json, 'Venn Intersections');
  json['labels'] = this.labels().serialize();
  json['hoverLabels'] = this.hoverLabels().serialize();
  json['selectLabels'] = this.selectLabels().serialize();

  json['markers'] = this.markers().serialize();
  json['hoverMarkers'] = this.hoverMarkers().serialize();
  json['selectMarkers'] = this.selectMarkers().serialize();

  json['tooltip'] = this.tooltip().serialize();

  return json;
};


/** @inheritDoc */
anychart.vennModule.Intersections.prototype.setupByJSON = function(config, opt_default) {
  anychart.vennModule.Intersections.base(this, 'setupByJSON', config, opt_default);

  if (opt_default) {
    this.themeSettings = config;
  } else
    anychart.core.settings.deserialize(this, this.SIMPLE_PROPS_DESCRIPTORS, config);

  this.labels().setupInternal(!!opt_default, config['labels']);
  this.hoverLabels().setupInternal(!!opt_default, config['hoverLabels']);
  this.selectLabels().setupInternal(!!opt_default, config['selectLabels']);

  this.markers().setupInternal(!!opt_default, config['markers']);
  this.hoverMarkers().setupInternal(!!opt_default, config['hoverMarkers']);
  this.selectMarkers().setupInternal(!!opt_default, config['selectMarkers']);

  this.tooltip().setupInternal(!!opt_default, config['tooltip']);
};


//endregion
//region -- Disposing
/** @inheritDoc */
anychart.vennModule.Intersections.prototype.disposeInternal = function() {
  goog.disposeAll(this.labels_, this.hoverLabels_, this.selectLabels_, this.markers_, this.hoverMarkers_, this.selectMarkers_, this.tooltip_);
  anychart.vennModule.Intersections.base(this, 'disposeInternal');

  this.labels_ = null;
  this.hoverLabels_ = null;
  this.selectLabels_ = null;

  this.markers_ = null;
  this.hoverMarkers_ = null;
  this.selectMarkers_ = null;

  this.tooltip_ = null;
};


//endregion
//exports
(function() {
  var proto = anychart.vennModule.Intersections.prototype;
  proto['labels'] = proto.labels;
  proto['hoverLabels'] = proto.hoverLabels;
  proto['selectLabels'] = proto.selectLabels;

  proto['markers'] = proto.markers;
  proto['hoverMarkers'] = proto.hoverMarkers;
  proto['selectMarkers'] = proto.selectMarkers;

  proto['tooltip'] = proto.tooltip;
})();
