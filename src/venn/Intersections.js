goog.provide('anychart.vennModule.Intersections');


goog.require('anychart.core.Base');
goog.require('anychart.core.StateSettings');
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

  this.addThemes('venn.intersections');

  /**
   * Chart.
   * @type {anychart.core.Chart}
   * @private
   */
  this.chart_ = chart;

  var normalDescriptorsMeta = {};
  anychart.core.settings.createDescriptorsMeta(normalDescriptorsMeta, [
    ['fill', 0, anychart.Signal.NEEDS_REDRAW_APPEARANCE | anychart.Signal.NEED_UPDATE_LEGEND],
    ['stroke', 0, anychart.Signal.NEEDS_REDRAW_APPEARANCE | anychart.Signal.NEED_UPDATE_LEGEND],
    ['hatchFill', 0, anychart.Signal.NEEDS_REDRAW_APPEARANCE | anychart.Signal.NEED_UPDATE_LEGEND],
    ['labels', 0, 0],
    ['markers', 0, 0]
  ]);

  this.normal_ = new anychart.core.StateSettings(this, normalDescriptorsMeta, anychart.PointState.NORMAL);
  this.normal_.setOption(anychart.core.StateSettings.MARKERS_FACTORY_CONSTRUCTOR, anychart.core.StateSettings.DEFAULT_MARKERS_CONSTRUCTOR_NO_THEME);
  this.normal_.setOption(anychart.core.StateSettings.MARKERS_AFTER_INIT_CALLBACK, anychart.core.StateSettings.DEFAULT_MARKERS_AFTER_INIT_CALLBACK);
  this.normal_.setOption(anychart.core.StateSettings.LABELS_FACTORY_CONSTRUCTOR, anychart.core.StateSettings.DEFAULT_LABELS_CONSTRUCTOR_NO_THEME);
  this.normal_.setOption(anychart.core.StateSettings.LABELS_AFTER_INIT_CALLBACK, /** @this {anychart.vennModule.Intersections} */ function(factory) {
    factory.listenSignals(this.labelsInvalidated_, this);
  });

  var descriptorsMeta = {};
  anychart.core.settings.createDescriptorsMeta(descriptorsMeta, [
    ['fill', 0, anychart.Signal.NEEDS_REDRAW_APPEARANCE],
    ['stroke', 0, anychart.Signal.NEEDS_REDRAW_APPEARANCE],
    ['hatchFill', 0, anychart.Signal.NEEDS_REDRAW_APPEARANCE],
    ['labels', 0, 0],
    ['markers', 0, 0]
  ]);
  this.hovered_ = new anychart.core.StateSettings(this, descriptorsMeta, anychart.PointState.HOVER);
  this.hovered_.setOption(anychart.core.StateSettings.LABELS_FACTORY_CONSTRUCTOR, anychart.core.StateSettings.DEFAULT_LABELS_CONSTRUCTOR_NO_THEME);
  this.hovered_.setOption(anychart.core.StateSettings.MARKERS_FACTORY_CONSTRUCTOR, anychart.core.StateSettings.DEFAULT_MARKERS_CONSTRUCTOR_NO_THEME);

  this.selected_ = new anychart.core.StateSettings(this, descriptorsMeta, anychart.PointState.SELECT);
  this.selected_.setOption(anychart.core.StateSettings.LABELS_FACTORY_CONSTRUCTOR, anychart.core.StateSettings.DEFAULT_LABELS_CONSTRUCTOR_NO_THEME);
  this.selected_.setOption(anychart.core.StateSettings.MARKERS_FACTORY_CONSTRUCTOR, anychart.core.StateSettings.DEFAULT_MARKERS_CONSTRUCTOR_NO_THEME);
  function markAllConsistent(factory) {
    factory.markConsistent(anychart.ConsistencyState.ALL);
  }

  this.hovered_.setOption(anychart.core.StateSettings.LABELS_AFTER_INIT_CALLBACK, markAllConsistent);
  this.hovered_.setOption(anychart.core.StateSettings.MARKERS_AFTER_INIT_CALLBACK, markAllConsistent);
  this.selected_.setOption(anychart.core.StateSettings.LABELS_AFTER_INIT_CALLBACK, markAllConsistent);
  this.selected_.setOption(anychart.core.StateSettings.MARKERS_AFTER_INIT_CALLBACK, markAllConsistent);
};
goog.inherits(anychart.vennModule.Intersections, anychart.core.Base);
anychart.core.settings.populateAliases(anychart.vennModule.Intersections, ['fill', 'stroke', 'hatchFill', 'labels', 'markers'], 'normal');


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


//region State settings
/**
 * Normal state settings.
 * @param {!Object=} opt_value
 * @return {anychart.core.StateSettings|anychart.vennModule.Intersections}
 */
anychart.vennModule.Intersections.prototype.normal = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.normal_.setup(opt_value);
    return this;
  }
  return this.normal_;
};


/**
 * Hovered state settings.
 * @param {!Object=} opt_value
 * @return {anychart.core.StateSettings|anychart.vennModule.Intersections}
 */
anychart.vennModule.Intersections.prototype.hovered = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.hovered_.setup(opt_value);
    return this;
  }
  return this.hovered_;
};


/**
 * Selected state settings.
 * @param {!Object=} opt_value
 * @return {anychart.core.StateSettings|anychart.vennModule.Intersections}
 */
anychart.vennModule.Intersections.prototype.selected = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.selected_.setup(opt_value);
    return this;
  }
  return this.selected_;
};

//endregion
//region -- Labels
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
  this.normal().labels().markConsistent(anychart.ConsistencyState.ALL);
  this.hovered().labels().markConsistent(anychart.ConsistencyState.ALL);
  this.selected().labels().markConsistent(anychart.ConsistencyState.ALL);
};


//endregion
//region -- Markers
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
  this.normal().markers().markConsistent(anychart.ConsistencyState.ALL);
  this.hovered().markers().markConsistent(anychart.ConsistencyState.ALL);
  this.selected().markers().markConsistent(anychart.ConsistencyState.ALL);
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
    this.setupCreated('tooltip', this.tooltip_);
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


/**
 * Setup theme for elements
 * */
anychart.vennModule.Intersections.prototype.setupElements = function() {
  this.setupCreated('normal', this.normal_);
  this.setupCreated('hovered', this.hovered_);
  this.setupCreated('selected', this.selected_);
};


/** @inheritDoc */
anychart.vennModule.Intersections.prototype.serialize = function() {
  var json = anychart.vennModule.Intersections.base(this, 'serialize');

  json['normal'] = this.normal_.serialize();
  json['hovered'] = this.hovered_.serialize();
  json['selected'] = this.selected_.serialize();

  json['tooltip'] = this.tooltip().serialize();

  return json;
};


/** @inheritDoc */
anychart.vennModule.Intersections.prototype.setupByJSON = function(config, opt_default) {
  anychart.vennModule.Intersections.base(this, 'setupByJSON', config, opt_default);

  this.normal_.setupInternal(!!opt_default, config);
  this.normal_.setupInternal(!!opt_default, config['normal']);
  this.hovered_.setupInternal(!!opt_default, config['hovered']);
  this.selected_.setupInternal(!!opt_default, config['selected']);

  this.tooltip().setupInternal(!!opt_default, config['tooltip']);
};


//endregion
//region -- Disposing
/** @inheritDoc */
anychart.vennModule.Intersections.prototype.disposeInternal = function() {
  goog.disposeAll(this.normal_, this.hovered_, this.selected_, this.tooltip_);
  anychart.vennModule.Intersections.base(this, 'disposeInternal');

  this.normal_ = null;
  this.hovered_ = null;
  this.selected_ = null;

  this.tooltip_ = null;
};


//endregion
//exports
(function() {
  var proto = anychart.vennModule.Intersections.prototype;

  proto['normal'] = proto.normal;
  proto['hovered'] = proto.hovered;
  proto['selected'] = proto.selected;

  proto['tooltip'] = proto.tooltip;
})();
