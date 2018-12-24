goog.provide('anychart.pertModule.VisualElements');

goog.require('anychart.core.Base');
goog.require('anychart.core.StateSettings');
goog.require('anychart.core.settings');
goog.require('anychart.core.ui.LabelsFactory');
goog.require('anychart.core.ui.Tooltip');



/**
 * Pert visual element settings collector.
 * @constructor
 * @extends {anychart.core.Base}
 * @implements {anychart.core.settings.IObjectWithSettings}
 * @implements {anychart.core.settings.IResolvable}
 */
anychart.pertModule.VisualElements = function() {
  anychart.pertModule.VisualElements.base(this, 'constructor');


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

  /**
   * Parent PertVisualElements settings object.
   * @type {?anychart.pertModule.VisualElements}
   * @private
   */
  this.parent_ = null;

  /**
   * Resolution chain cache.
   * @type {?Array.<Object|null|undefined>}
   * @private
   */
  this.resolutionChainCache_ = null;

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['color', 0, anychart.Signal.NEEDS_REDRAW_APPEARANCE]
  ]);

  var descriptorsMap = {};
  anychart.core.settings.createDescriptorsMeta(descriptorsMap, [
    ['fill', 0, anychart.Signal.NEEDS_REDRAW_APPEARANCE],
    ['stroke', 0, anychart.Signal.NEEDS_REDRAW_APPEARANCE],
    ['labels', 0, 0]
  ]);
  this.normal_ = new anychart.core.StateSettings(this, descriptorsMap, anychart.PointState.NORMAL);
  this.normal_.setOption(anychart.core.StateSettings.LABELS_FACTORY_CONSTRUCTOR,  anychart.core.StateSettings.DEFAULT_LABELS_CONSTRUCTOR_NO_THEME);
  this.normal_.setOption(anychart.core.StateSettings.LABELS_AFTER_INIT_CALLBACK, this.labelsAfterInitCallback);

  this.hovered_ = new anychart.core.StateSettings(this, descriptorsMap, anychart.PointState.HOVER);
  this.hovered_.setOption(anychart.core.StateSettings.LABELS_FACTORY_CONSTRUCTOR,  anychart.core.StateSettings.DEFAULT_LABELS_CONSTRUCTOR_NO_THEME);
  this.hovered_.setOption(anychart.core.StateSettings.LABELS_AFTER_INIT_CALLBACK, this.labelsAfterInitCallback);

  this.selected_ = new anychart.core.StateSettings(this, descriptorsMap, anychart.PointState.SELECT);
  this.selected_.setOption(anychart.core.StateSettings.LABELS_FACTORY_CONSTRUCTOR,  anychart.core.StateSettings.DEFAULT_LABELS_CONSTRUCTOR_NO_THEME);
  this.selected_.setOption(anychart.core.StateSettings.LABELS_AFTER_INIT_CALLBACK, this.labelsAfterInitCallback);
};
goog.inherits(anychart.pertModule.VisualElements, anychart.core.Base);
anychart.core.settings.populateAliases(anychart.pertModule.VisualElements, ['fill', 'stroke', 'labels'], 'normal');


/**
 * Supported signals mask.
 * @type {number}
 */
anychart.pertModule.VisualElements.prototype.SUPPORTED_SIGNALS =
    anychart.core.Base.prototype.SUPPORTED_SIGNALS |
    anychart.Signal.NEEDS_REDRAW_LABELS |
    anychart.Signal.NEEDS_REDRAW_APPEARANCE |
    anychart.Signal.NEEDS_UPDATE_TOOLTIP;


/**
 * Supported consistency states mask.
 * @type {number}
 */
anychart.pertModule.VisualElements.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.Base.prototype.SUPPORTED_CONSISTENCY_STATES;


/**
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.pertModule.VisualElements.PROPERTY_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};
  anychart.core.settings.createDescriptor(map,
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'color',
      anychart.core.settings.fillNormalizer);
  return map;
})();
anychart.core.settings.populate(anychart.pertModule.VisualElements, anychart.pertModule.VisualElements.PROPERTY_DESCRIPTORS);


//region --- IObjectWithSettings implementation
/**
 * @override
 * @param {string} name
 * @return {*}
 */
anychart.pertModule.VisualElements.prototype.getOption = anychart.core.settings.getOption;


/** @inheritDoc */
anychart.pertModule.VisualElements.prototype.getParentState = function(stateType) {
  var parent = this.parent();
  if (parent) {
    var state = !!(stateType & anychart.PointState.SELECT) ? 'selected' : !!(stateType & anychart.PointState.HOVER) ? 'hovered' : 'normal';
    return parent[state]();
  }
  return null;
};


//endregion
//region --- IResolvable + Parent implementation
/** @inheritDoc */
anychart.pertModule.VisualElements.prototype.resolutionChainCache = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.resolutionChainCache_ = opt_value;
  }
  return this.resolutionChainCache_;
};


/** @inheritDoc */
anychart.pertModule.VisualElements.prototype.getResolutionChain = anychart.core.settings.getResolutionChain;


/** @inheritDoc */
anychart.pertModule.VisualElements.prototype.getLowPriorityResolutionChain = function() {
  var sett = [this.themeSettings];
  if (this.parent_) {
    sett = goog.array.concat(sett, this.parent_.getLowPriorityResolutionChain());
  }
  return sett;
};


/** @inheritDoc */
anychart.pertModule.VisualElements.prototype.getHighPriorityResolutionChain = function() {
  var sett = [this.ownSettings];
  if (this.parent_) {
    sett = goog.array.concat(sett, this.parent_.getHighPriorityResolutionChain());
  }
  return sett;
};


/**
 * Gets/sets parent settings object.
 * @param {anychart.pertModule.VisualElements=} opt_value - Value.
 * @return {?anychart.pertModule.VisualElements} - Current parent object.
 */
anychart.pertModule.VisualElements.prototype.parent = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.parent_ != opt_value) {
      if (goog.isNull(opt_value)) {
        //this.parent_ is not null here.
        this.parent_.unlistenSignals(this.parentInvalidated_, this);
        this.parent_ = null;
      } else {
        if (this.parent_)
          this.parent_.unlistenSignals(this.parentInvalidated_, this);
        this.parent_ = opt_value;
        this.tooltip().dropThemes().parent(this.parent_.tooltip());
        this.parent_.listenSignals(this.parentInvalidated_, this);
      }
    }
    return this;
  }
  return this.parent_;
};


/**
 * .
 * @param {anychart.SignalEvent} e
 * @private
 */
anychart.pertModule.VisualElements.prototype.parentInvalidated_ = function(e) {
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
    signal |= anychart.Signal.NEEDS_REDRAW;
  }

  this.resolutionChainCache_ = null;

  this.invalidate(state, signal);
};


//endregion
//region --- States
/**
 * Normal state settings.
 * @param {!Object=} opt_value
 * @return {anychart.core.StateSettings|anychart.pertModule.VisualElements}
 */
anychart.pertModule.VisualElements.prototype.normal = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.normal_.setup(opt_value);
    return this;
  }
  return this.normal_;
};


/**
 * Hovered state settings.
 * @param {!Object=} opt_value
 * @return {anychart.core.StateSettings|anychart.pertModule.VisualElements}
 */
anychart.pertModule.VisualElements.prototype.hovered = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.hovered_.setup(opt_value);
    return this;
  }
  return this.hovered_;
};


/**
 * Selected state settings.
 * @param {!Object=} opt_value
 * @return {anychart.core.StateSettings|anychart.pertModule.VisualElements}
 */
anychart.pertModule.VisualElements.prototype.selected = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.selected_.setup(opt_value);
    return this;
  }
  return this.selected_;
};
//endregion


/**
 * Gets final fill.
 * @param {anychart.PointState|number} state - Current state.
 * @param {anychart.format.Context} provider - Context provider.
 * @return {!acgraph.vector.Fill} - Final fill.
 */
anychart.pertModule.VisualElements.prototype.getFinalFill = function(state, provider) {
  return /** @type {!acgraph.vector.Fill} */ (this.resolveColor('fill', state, provider));
};


/**
 * Gets final stroke.
 * @param {anychart.PointState|number} state - Current state.
 * @param {anychart.format.Context} provider - Context provider.
 * @return {!acgraph.vector.Stroke} - Final stroke.
 */
anychart.pertModule.VisualElements.prototype.getFinalStroke = function(state, provider) {
  return /** @type {!acgraph.vector.Stroke} */ (this.resolveColor('stroke', state, provider));
};


/**
 * Resolves fill/stroke.
 * @param {string} colorType
 * @param {number} state
 * @param {anychart.format.Context} provider
 * @return {!acgraph.vector.Stroke|!acgraph.vector.Fill}
 */
anychart.pertModule.VisualElements.prototype.resolveColor = function(colorType, state, provider) {
  var result;
  var stateObject = state == 0 ? this.normal_ : state == 1 ? this.hovered_ : this.selected_;
  result = stateObject.getOption(colorType);

  if (goog.isFunction(result)) {
    provider['sourceColor'] = this.getOption('color');
    result = result.call(provider);
  }

  return /** @type {!acgraph.vector.Stroke|!acgraph.vector.Fill} */ (result);
};


/**
 * @param {anychart.core.ui.LabelsFactory} factory
 */
anychart.pertModule.VisualElements.prototype.labelsAfterInitCallback = function(factory) {
  factory.listenSignals(this.labelsInvalidated, this);
};


/**
 * Listener for labels invalidation.
 * @param {anychart.SignalEvent} event - Invalidation event.
 */
anychart.pertModule.VisualElements.prototype.labelsInvalidated = function(event) {
  this.dispatchSignal(anychart.Signal.NEEDS_REDRAW_LABELS);
};


/**
 * Getter for tooltip settings.
 * @param {(Object|boolean|null)=} opt_value - Tooltip settings.
 * @return {!(anychart.pertModule.VisualElements|anychart.core.ui.Tooltip)} - Tooltip instance or self for method chaining.
 */
anychart.pertModule.VisualElements.prototype.tooltip = function(opt_value) {
  if (!this.tooltip_) {
    this.tooltip_ = new anychart.core.ui.Tooltip(0);
    this.setupCreated('tooltip', this.tooltip_);
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
anychart.pertModule.VisualElements.prototype.onTooltipSignal_ = function(event) {
  this.dispatchSignal(anychart.Signal.NEEDS_UPDATE_TOOLTIP);
};


/**
 * Gets tooltip config. Includes formatter-functions.
 * @return {Object}
 */
anychart.pertModule.VisualElements.prototype.getCurrentTooltipConfig = function() {
  var config = this.tooltip().serialize();
  var titleFormat = this.tooltip().getOption('titleFormat');
  var format = this.tooltip().getOption('format');
  if (titleFormat && titleFormat != anychart.utils.DEFAULT_FORMATTER)
    config['titleFormat'] = titleFormat;
  if (format && format != anychart.utils.DEFAULT_FORMATTER)
    config['format'] = format;
  return config;
};


/**
 * Gets/sets labels container.
 * @param {acgraph.vector.Layer=} opt_value - Value to be set.
 * @return {acgraph.vector.Layer|anychart.pertModule.VisualElements|null} - Current value or itself for method chaining.
 */
anychart.pertModule.VisualElements.prototype.labelsContainer = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.labelsContainer_ != opt_value) {
      this.labelsContainer_ = opt_value;
      this.normal_.labels().container(this.labelsContainer_);
    }
    return this;
  }
  return this.labelsContainer_;
};


/**
 * Draws labels.
 * @return {anychart.pertModule.VisualElements}
 */
anychart.pertModule.VisualElements.prototype.drawLabels = function() {
  this.normal_.labels().draw();
  return this;
};


/**
 * Clears labels.
 * @return {anychart.pertModule.VisualElements}
 */
anychart.pertModule.VisualElements.prototype.clearLabels = function() {
  this.normal_.labels().clear();
  return this;
};


/**
 * Sets all labels parent event target.
 * @param {goog.events.EventTarget} parentEventTarget - Parent event target.
 * @return {anychart.pertModule.VisualElements}
 */
anychart.pertModule.VisualElements.prototype.setLabelsParentEventTarget = function(parentEventTarget) {
  this.normal_.labels().setParentEventTarget(parentEventTarget);
  return this;
};


// /**
//  * Util method. Use it to deeply compare two objects.
//  * NOTE: Currently (01 Aug 2016) we can't create tooltip with background without fill and stroke.
//  * This comparison allows to exclude
//  *
//  * @param {*} o1 Object or value to compare.
//  * @param {*} o2 Object or value to compare.
//  * @return {boolean} - True if arguments are equal.
//  * @private
//  */
// anychart.pertModule.VisualElements.prototype.deepEqual_ = function(o1, o2) {
//   if (o1 === o2) return true;
//   var t1 = typeof o1, t2 = typeof o2;
//   if (t1 == 'object' && t1 == t2) {
//     for (var key in o1) {
//       if (!this.deepEqual_(o1[key], o2[key])) return false;
//     }
//     return true;
//   }
//   return false;
// };


/** @inheritDoc */
anychart.pertModule.VisualElements.prototype.serialize = function() {
  var json = anychart.pertModule.VisualElements.base(this, 'serialize');
  anychart.core.settings.serialize(this, anychart.pertModule.VisualElements.PROPERTY_DESCRIPTORS, json, 'Pert visual element');

  json['normal'] = this.normal_.serialize();
  json['hovered'] = this.hovered_.serialize();
  json['selected'] = this.selected_.serialize();

  json['tooltip'] = this.tooltip().serialize();

  return json;
};


/** @inheritDoc */
anychart.pertModule.VisualElements.prototype.setupByJSON = function(config, opt_default) {
  anychart.pertModule.VisualElements.base(this, 'setupByJSON', config, opt_default);
  anychart.core.settings.deserialize(this, anychart.pertModule.VisualElements.PROPERTY_DESCRIPTORS, config);

  this.normal_.setupInternal(!!opt_default, config);
  this.normal_.setupInternal(!!opt_default, config['normal']);
  this.hovered_.setupInternal(!!opt_default, config['hovered']);
  this.selected_.setupInternal(!!opt_default, config['selected']);

  if ('tooltip' in config)
    this.tooltip().setupInternal(!!opt_default, config['tooltip']);
};


/** @inheritDoc */
anychart.pertModule.VisualElements.prototype.disposeInternal = function() {
  goog.disposeAll(this.tooltip_);
  anychart.pertModule.VisualElements.base(this, 'disposeInternal');
};

(function() {
  var proto = anychart.pertModule.VisualElements.prototype;
  //auto
  //proto['color'] = proto.color;
  proto['tooltip'] = proto.tooltip;
  proto['normal'] = proto.normal;
  proto['hovered'] = proto.hovered;
  proto['selected'] = proto.selected;
})();
