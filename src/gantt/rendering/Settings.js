goog.provide('anychart.ganttModule.rendering.Settings');

goog.require('anychart.core.Base');
goog.require('anychart.core.settings');
goog.require('anychart.ganttModule.rendering.Context');
goog.require('anychart.ganttModule.rendering.shapes');

goog.require('goog.array');



//region -- Constructor.
/**
 *
 * @param {anychart.ganttModule.TimeLine} timeline - Timeline that rendering settings belong to.
 * @param {anychart.ganttModule.elements.TimelineElement} element - Related element.
 * @constructor
 * @implements {anychart.core.settings.IResolvable}
 * @extends {anychart.core.Base}
 */
anychart.ganttModule.rendering.Settings = function(timeline, element) {
  anychart.ganttModule.rendering.Settings.base(this, 'constructor');

  /**
   * Related timeline.
   * @type {anychart.ganttModule.TimeLine}
   * @private
   */
  this.tl_ = timeline;

  /**
   * Related element.
   * @type {anychart.ganttModule.elements.TimelineElement}
   * @private
   */
  this.element_ = element;

  /**
   * Current rendering settings shapes configurations.
   * @type {?Array.<anychart.ganttModule.rendering.shapes.ShapeConfig>}
   * @private
   */
  this.shapes_ = null;

  /**
   * Parent element.
   * @type {?anychart.ganttModule.rendering.Settings}
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
    ['drawer', anychart.ConsistencyState.ONLY_DISPATCHING, anychart.Signal.NEEDS_REDRAW],
    ['shapes', anychart.ConsistencyState.ONLY_DISPATCHING, anychart.Signal.NEEDS_REDRAW]
  ]);

};
goog.inherits(anychart.ganttModule.rendering.Settings, anychart.core.Base);


//endregion
//region -- Consistency states and signals.
/**
 * Supported signals.
 * @type {number}
 */
anychart.ganttModule.rendering.Settings.prototype.SUPPORTED_SIGNALS = anychart.Signal.NEEDS_REDRAW;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.ganttModule.rendering.Settings.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.Base.prototype.SUPPORTED_CONSISTENCY_STATES;


//endregion
//region -- Optimized props descriptors.
/**
 * Simple properties descriptors.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.ganttModule.rendering.Settings.DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};
  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'drawer',
      anychart.core.settings.functionNormalizer);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'shapes',
      anychart.core.settings.asIsNormalizer);

  return map;
})();
anychart.core.settings.populate(anychart.ganttModule.rendering.Settings, anychart.ganttModule.rendering.Settings.DESCRIPTORS);


//endregion
//region -- IResolvable impl.
/**
 * @override
 * @param {string} name
 * @return {*}
 */
anychart.ganttModule.rendering.Settings.prototype.getOption = anychart.core.settings.getOption;


/** @inheritDoc */
anychart.ganttModule.rendering.Settings.prototype.getResolutionChain = anychart.core.settings.getResolutionChain;


/** @inheritDoc */
anychart.ganttModule.rendering.Settings.prototype.resolutionChainCache = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.resolutionChainCache_ = opt_value;
  }
  return this.resolutionChainCache_;
};


/** @inheritDoc */
anychart.ganttModule.rendering.Settings.prototype.getLowPriorityResolutionChain = function() {
  var sett = [this.themeSettings];
  if (this.parent_) {
    sett = goog.array.concat(sett, this.parent_.getLowPriorityResolutionChain());
  }
  return sett;
};


/** @inheritDoc */
anychart.ganttModule.rendering.Settings.prototype.getHighPriorityResolutionChain = function() {
  var sett = [this.ownSettings];
  if (this.parent_) {
    sett = goog.array.concat(sett, this.parent_.getHighPriorityResolutionChain());
  }
  return sett;
};


//endregion
//region -- Parental relations.
/**
 * Gets/sets parnet element.
 * @param {?anychart.ganttModule.rendering.Settings=} opt_value - Value to set.
 * @return {?anychart.ganttModule.rendering.Settings} - Current parent or itself for chaining.
 */
anychart.ganttModule.rendering.Settings.prototype.parent = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.parent_ != opt_value) {
      this.resolutionChainCache_ = null;
      if (goog.isNull(opt_value)) {
        //this.parent_ is not null here.
        this.parent_.unlistenSignals(this.parentInvalidated_, this);
        this.parent_ = null;
      } else {
        if (this.parent_)
          this.parent_.unlistenSignals(this.parentInvalidated_, this);
        this.parent_ = opt_value;
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
anychart.ganttModule.rendering.Settings.prototype.parentInvalidated_ = function(e) {
  this.dispatchSignal(anychart.Signal.NEEDS_REDRAW);
};


//endregion
//region -- Drawing call.
/**
 *
 * @param {anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem} item - .
 * @param {anychart.math.Rect} predictedBounds - .
 * @param {Object} tag - Tag data object. NOTE: not optional because current implementation (16 Jan 2018) depends on this data a lot.
 * @param {number=} opt_periodIndex - .
 * @param {boolean=} opt_selected - Whether is selected. TODO (A.Kudryavtsev): Replace this with State in future implementation.
 * @param {number=} opt_initializerUid - UID of item that has initialized the milestone preview drawing.
 */
anychart.ganttModule.rendering.Settings.prototype.callDrawer = function(item, predictedBounds, tag, opt_periodIndex, opt_selected, opt_initializerUid) {
  var context = new anychart.ganttModule.rendering.Context(this.element_, item, predictedBounds, tag, opt_periodIndex, opt_selected, opt_initializerUid);
  var drawer = this.getOption('drawer');
  drawer.call(context, context);
};


//endregion
//region -- Serialization/Deserialization
/** @inheritDoc */
anychart.ganttModule.rendering.Settings.prototype.serialize = function() {
  var json = anychart.ganttModule.rendering.Settings.base(this, 'serialize');
  anychart.core.settings.serialize(this, anychart.ganttModule.rendering.Settings.DESCRIPTORS, json, void 0, void 0, true);
  return json;
};


/** @inheritDoc */
anychart.ganttModule.rendering.Settings.prototype.setupByJSON = function(config, opt_default) {
  anychart.ganttModule.rendering.Settings.base(this, 'setupByJSON', config);
  if (opt_default)
    anychart.core.settings.copy(this.themeSettings, anychart.ganttModule.rendering.Settings.DESCRIPTORS, config);
  else
    anychart.core.settings.deserialize(this, anychart.ganttModule.rendering.Settings.DESCRIPTORS, config);
};


//endregion
//region -- Disposing.
/** @inheritDoc */
anychart.ganttModule.rendering.Settings.prototype.disposeInternal = function() {
  if (this.parent_) {
    this.parent_.unlistenSignals(this.parentInvalidated_, this);
    delete this.parent_;
  }

  this.resolutionChainCache_ = null;

  anychart.ganttModule.rendering.Settings.base(this, 'disposeInternal');
};


//endregion
