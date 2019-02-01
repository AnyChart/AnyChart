//region Provide / Require
goog.provide('anychart.sankeyModule.elements.VisualElement');

goog.require('anychart.core.Base');
goog.require('anychart.core.StateSettings');
goog.require('anychart.core.settings');
goog.require('anychart.core.ui.Tooltip');



//endregion
//region Constructor
/**
 * Sankey visual element base settings.
 * @constructor
 * @extends {anychart.core.Base}
 * @param {anychart.sankeyModule.Chart} chart
 * @param {anychart.sankeyModule.Chart.ElementType} type
 * @implements {anychart.core.settings.IObjectWithSettings}
 */
anychart.sankeyModule.elements.VisualElement = function(chart, type) {
  anychart.sankeyModule.elements.VisualElement.base(this, 'constructor');

  /**
   * Sankey chart.
   * @type {anychart.sankeyModule.Chart}
   */
  this.chart = chart;

  /**
   * Element type.
   * @type {anychart.sankeyModule.Chart.ElementType}
   * @private
   */
  this.type_ = type;

  /**
   * @type {anychart.core.ui.Tooltip}
   * @private
   */
  this.tooltip_ = null;

  var descriptorsMap = {};
  anychart.core.settings.createDescriptorsMeta(descriptorsMap, [
    ['fill', 0, anychart.Signal.NEEDS_REDRAW_APPEARANCE],
    ['stroke', 0, anychart.Signal.NEEDS_REDRAW_APPEARANCE],
    ['labels', 0, 0]
  ]);

  this.normal_ = new anychart.core.StateSettings(this, descriptorsMap, anychart.PointState.NORMAL);
  this.setupCreated('normal', this.normal_);
  this.normal_.setOption(anychart.core.StateSettings.LABELS_FACTORY_CONSTRUCTOR, anychart.core.StateSettings.DEFAULT_LABELS_CONSTRUCTOR);
  this.normal_.setOption(anychart.core.StateSettings.LABELS_AFTER_INIT_CALLBACK, anychart.core.StateSettings.DEFAULT_LABELS_AFTER_INIT_CALLBACK);

  this.hovered_ = new anychart.core.StateSettings(this, descriptorsMap, anychart.PointState.HOVER);
  this.setupCreated('hovered', this.hovered_);
  this.hovered_.setOption(anychart.core.StateSettings.LABELS_FACTORY_CONSTRUCTOR, anychart.core.StateSettings.DEFAULT_LABELS_CONSTRUCTOR_NO_THEME);
  this.hovered_.setOption(anychart.core.StateSettings.LABELS_AFTER_INIT_CALLBACK, function(factory) {
    factory.markConsistent(anychart.ConsistencyState.ALL);
  });
};
goog.inherits(anychart.sankeyModule.elements.VisualElement, anychart.core.Base);
anychart.core.settings.populateAliases(anychart.sankeyModule.elements.VisualElement, ['fill', 'stroke', 'labels'], 'normal');


//endregion
//region ConsistencyStates / Signals
/**
 * Supported signals mask.
 * @type {number}
 */
anychart.sankeyModule.elements.VisualElement.prototype.SUPPORTED_SIGNALS =
    anychart.core.Base.prototype.SUPPORTED_SIGNALS |
    anychart.Signal.NEEDS_REDRAW_APPEARANCE |
    anychart.Signal.NEEDS_UPDATE_TOOLTIP |
    anychart.Signal.NEEDS_REDRAW_LABELS;


//endregion
//region Infrastructure
/**
 * Returns type of sankey visual element.
 * @return {anychart.sankeyModule.Chart.ElementType} Element type.
 */
anychart.sankeyModule.elements.VisualElement.prototype.getType = function() {
  return this.type_;
};


/**
 * Setup state settings for elements.
 * */
anychart.sankeyModule.elements.VisualElement.prototype.setupElements = function() {
  this.setupCreated('normal', this.normal_);
  this.setupCreated('hovered', this.hovered_);
};


//endregion
//region Tooltip
/**
 * Getter for tooltip settings.
 * @param {(Object|boolean|null)=} opt_value - Tooltip settings.
 * @return {!(anychart.sankeyModule.elements.VisualElement|anychart.core.ui.Tooltip)} - Tooltip instance or self for method chaining.
 */
anychart.sankeyModule.elements.VisualElement.prototype.tooltip = function(opt_value) {
  if (!this.tooltip_) {
    this.tooltip_ = new anychart.core.ui.Tooltip(0);
    this.tooltip_.dropThemes();
    this.setupCreated('tooltip', this.tooltip_);
    this.tooltip_.parent(/** @type {anychart.core.ui.Tooltip} */ (this.chart.tooltip()));
    this.tooltip_.chart(this.chart);
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
anychart.sankeyModule.elements.VisualElement.prototype.onTooltipSignal_ = function(event) {
  this.dispatchSignal(anychart.Signal.NEEDS_UPDATE_TOOLTIP);
};


//endregion
//region Labels
/**
 * Labels invalidation handler.
 * @param {anychart.SignalEvent} e
 * @private
 */
anychart.sankeyModule.elements.VisualElement.prototype.labelsInvalidated_ = function(e) {
  this.dispatchSignal(anychart.Signal.NEEDS_REDRAW_LABELS);
};


/**
 * Marks labels consistent.
 */
anychart.sankeyModule.elements.VisualElement.prototype.markLabelsConsistent = function() {
  this.normal_.labels().markConsistent(anychart.ConsistencyState.ALL);
  this.hovered_.labels().markConsistent(anychart.ConsistencyState.ALL);
};


//endregion
//region State Settings
/**
 * Normal state settings.
 * @param {!Object=} opt_value
 * @return {anychart.core.StateSettings|anychart.sankeyModule.elements.VisualElement}
 */
anychart.sankeyModule.elements.VisualElement.prototype.normal = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.normal_.setup(opt_value);
    return this;
  }
  return this.normal_;
};


/**
 * Hovered state settings.
 * @param {!Object=} opt_value
 * @return {anychart.core.StateSettings|anychart.sankeyModule.elements.VisualElement}
 */
anychart.sankeyModule.elements.VisualElement.prototype.hovered = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.hovered_.setup(opt_value);
    return this;
  }
  return this.hovered_;
};


//endregion
//region Color resolving
/**
 * Returns fill for the element.
 * @param {anychart.PointState|number} state
 * @param {Object} context
 * @return {acgraph.vector.Fill|acgraph.vector.Stroke}
 */
anychart.sankeyModule.elements.VisualElement.prototype.getFill = function(state, context) {
  return this.resolveColor('fill', state, context);
};


/**
 * Returns stroke for the element.
 * @param {anychart.PointState|number} state
 * @param {Object} context
 * @return {acgraph.vector.Fill|acgraph.vector.Stroke}
 */
anychart.sankeyModule.elements.VisualElement.prototype.getStroke = function(state, context) {
  return this.resolveColor('stroke', state, context);
};


/**
 * Resolves color for element (node, flow, dropoff).
 * @param {string} name Color name - fill, stroke, hatchFill
 * @param {anychart.PointState|number} state
 * @param {Object} context color resolution context.
 * @return {acgraph.vector.Fill|acgraph.vector.Stroke}
 */
anychart.sankeyModule.elements.VisualElement.prototype.resolveColor = function(name, state, context) {
  var result;
  var stateObject = state ? this.hovered_ : this.normal_;
  result = stateObject.getOption(name) || this.normal_.getOption(name);

  if (goog.isFunction(result)) {
    result = result.call(context, context);
  }

  return /** @type {acgraph.vector.Fill|acgraph.vector.Stroke} */ (result);
};


//endregion
//region Serialize / Setup / Dispose
/** @inheritDoc */
anychart.sankeyModule.elements.VisualElement.prototype.serialize = function() {
  var json = anychart.sankeyModule.elements.VisualElement.base(this, 'serialize');

  json['tooltip'] = this.tooltip().serialize();

  json['normal'] = this.normal_.serialize();
  json['hovered'] = this.hovered_.serialize();

  return json;
};


/** @inheritDoc */
anychart.sankeyModule.elements.VisualElement.prototype.setupByJSON = function(config, opt_default) {
  anychart.sankeyModule.elements.VisualElement.base(this, 'setupByJSON', config, opt_default);

  if ('tooltip' in config)
    this.tooltip().setupInternal(!!opt_default, config['tooltip']);

  this.normal_.setupInternal(!!opt_default, config);
  this.normal_.setupInternal(!!opt_default, config['normal']);
  this.hovered_.setupInternal(!!opt_default, config['hovered']);
};


/** @inheritDoc */
anychart.sankeyModule.elements.VisualElement.prototype.disposeInternal = function() {
  goog.disposeAll(this.tooltip_, this.normal_, this.hovered_);
  anychart.sankeyModule.elements.VisualElement.base(this, 'disposeInternal');
};


//endregion
//region Exports
//exports
(function() {
  var proto = anychart.sankeyModule.elements.VisualElement.prototype;
  proto['tooltip'] = proto.tooltip;
  // state settings
  proto['normal'] = proto.normal;
  proto['hovered'] = proto.hovered;
})();
//endregion
