goog.provide('anychart.ganttModule.elements.Base');

//region -- Requirements.
goog.require('anychart.core.Base');
goog.require('anychart.core.settings');
goog.require('anychart.ganttModule.rendering.Settings');
goog.require('anychart.ganttModule.rendering.ShapeManager');

goog.require('goog.array');



//endregion
//region -- Constructor.
/**
 * Base element settings storage and provider.
 * @param {anychart.ganttModule.TimeLine} timeline - Related timeline.
 * @param {anychart.enums.TLElementTypes=} opt_type - Element type.
 * @constructor
 * @implements {anychart.core.settings.IResolvable}
 * @extends {anychart.core.Base}
 */
anychart.ganttModule.elements.Base = function(timeline, opt_type) {
  anychart.ganttModule.elements.Base.base(this, 'constructor');

  /**
   * Related timeline.
   * @type {anychart.ganttModule.TimeLine}
   * @private
   */
  this.timeline_ = timeline;

  /**
   * Element type.
   * @type {anychart.enums.TLElementTypes}
   * @private
   */
  this.type_ = goog.isDef(opt_type) ? opt_type : anychart.enums.TLElementTypes.ALL;

  /**
   * Parent element.
   * @type {?anychart.ganttModule.elements.Base}
   * @private
   */
  this.parent_ = null;

  /**
   * Resolution chain cache.
   * @type {?Array.<Object|null|undefined>}
   * @private
   */
  this.resolutionChainCache_ = null;

  this.renderingSettings = new anychart.ganttModule.rendering.Settings(this.timeline_, this);
  this.renderingSettings.listenSignals(this.renderingSettingsInvalidated_, this);
};
goog.inherits(anychart.ganttModule.elements.Base, anychart.core.Base);


//endregion
//region -- Consistency states and signals.
/**
 * Supported signals.
 * @type {number}
 */
anychart.ganttModule.elements.Base.prototype.SUPPORTED_SIGNALS = anychart.Signal.NEEDS_REDRAW;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.ganttModule.elements.Base.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.Base.prototype.SUPPORTED_CONSISTENCY_STATES;


//endregion
//region -- IResolvable impl.
/**
 * @override
 * @param {string} name
 * @return {*}
 */
anychart.ganttModule.elements.Base.prototype.getOption = anychart.core.settings.getOption;


/** @inheritDoc */
anychart.ganttModule.elements.Base.prototype.getResolutionChain = anychart.core.settings.getResolutionChain;


/** @inheritDoc */
anychart.ganttModule.elements.Base.prototype.resolutionChainCache = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.resolutionChainCache_ = opt_value;
  }
  return this.resolutionChainCache_;
};


/** @inheritDoc */
anychart.ganttModule.elements.Base.prototype.getLowPriorityResolutionChain = function() {
  var sett = [this.themeSettings];
  if (this.parent_) {
    sett = goog.array.concat(sett, this.parent_.getLowPriorityResolutionChain());
  }
  return sett;
};


/** @inheritDoc */
anychart.ganttModule.elements.Base.prototype.getHighPriorityResolutionChain = function() {
  var sett = [this.ownSettings];
  if (this.parent_) {
    sett = goog.array.concat(sett, this.parent_.getHighPriorityResolutionChain());
  }
  return sett;
};


//endregion
//region -- Parental relations.
/**
 * Gets/sets parent element.
 * @param {?anychart.ganttModule.elements.Base=} opt_value - Value to set.
 * @return {?anychart.ganttModule.elements.Base} - Current parent or itself for chaining.
 */
anychart.ganttModule.elements.Base.prototype.parent = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.parent_ != opt_value) {
      this.resolutionChainCache_ = null;
      if (goog.isNull(opt_value)) {
        //this.parent_ is not null here.
        this.parent_.unlistenSignals(this.parentInvalidated_, this);
        this.rendering().parent(null);
        this.parent_ = null;
      } else {
        if (this.parent_)
          this.parent_.unlistenSignals(this.parentInvalidated_, this);
        this.parent_ = opt_value;
        this.rendering().parent(this.parent_.rendering());
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
anychart.ganttModule.elements.Base.prototype.parentInvalidated_ = function(e) {
  this.dispatchSignal(anychart.Signal.NEEDS_REDRAW);
};


//endregion
//region -- Internal API.
/**
 * Gets current element type.
 * @param {anychart.enums.TLElementTypes=} opt_value - Type ot set.
 * @return {anychart.enums.TLElementTypes|anychart.ganttModule.elements.Base}
 */
anychart.ganttModule.elements.Base.prototype.type = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.type_ = opt_value;
    return this;
  }
  return this.type_;
};


/**
 * Gets current related timeline.
 * @return {anychart.ganttModule.TimeLine}
 */
anychart.ganttModule.elements.Base.prototype.getTimeline = function() {
  return this.timeline_;
};


/**
 * Gets fill option name depending on type.
 * @return {string}
 */
anychart.ganttModule.elements.Base.prototype.getFillOptionName = function() {
  var optionName;
  switch (this.type()) {
    case anychart.enums.TLElementTypes.MILESTONES:
      optionName = 'milestoneFill';
      break;
    case anychart.enums.TLElementTypes.BASELINES:
      optionName = 'baselineFill';
      break;
    case anychart.enums.TLElementTypes.GROUPING_TASKS:
      optionName = 'parentFill';
      break;
    case anychart.enums.TLElementTypes.PROGRESS:
      optionName = 'progressFill';
      break;
    default:
      optionName = 'baseFill';
  }
  return /** @type {string} */ (optionName);
};


/**
 * Gets stroke option name depending on type.
 * @return {string}
 */
anychart.ganttModule.elements.Base.prototype.getStrokeOptionName = function() {
  var optionName;
  switch (this.type()) {
    case anychart.enums.TLElementTypes.MILESTONES:
      optionName = 'milestoneStroke';
      break;
    case anychart.enums.TLElementTypes.BASELINES:
      optionName = 'baselineStroke';
      break;
    case anychart.enums.TLElementTypes.GROUPING_TASKS:
      optionName = 'parentStroke';
      break;
    case anychart.enums.TLElementTypes.PROGRESS:
      optionName = 'progressStroke';
      break;
    default:
      optionName = 'baseStroke';
  }
  return /** @type {string} */ (optionName);
};


/**
 * Gets fill represented as suitable for acgraph coloring.
 * @param {(anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem)} item - Related data item.
 * @param {number=} opt_periodIndex - Related period index.
 * @param {boolean=} opt_selected - Whether is selected. TODO (A.Kudryavtsev): Replace this with State in future implementation.
 * @return {acgraph.vector.Fill}
 */
anychart.ganttModule.elements.Base.prototype.getFill = function(item, opt_periodIndex, opt_selected) {
  var resolver = anychart.ganttModule.BaseGrid.getColorResolver;
  var optionName = opt_selected ? 'selectedElementFill' : this.getFillOptionName();
  var resolved = resolver(optionName, anychart.enums.ColorType.FILL, false);
  return /** @type {acgraph.vector.Fill} */ (resolved(this.getTimeline(), 0, item, void 0, void 0, opt_periodIndex));
};


/**
 * Gets stroke represented as suitable for acgraph coloring.
 * @param {(anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem)} item - Related data item.
 * @param {number=} opt_periodIndex - Related period index.
 * @param {boolean=} opt_selected - Whether is selected. TODO (A.Kudryavtsev): Replace this with State in future implementation.
 * @return {acgraph.vector.Stroke}
 */
anychart.ganttModule.elements.Base.prototype.getStroke = function(item, opt_periodIndex, opt_selected) {
  var resolver = anychart.ganttModule.BaseGrid.getColorResolver;
  var optionName = opt_selected ? 'selectedElementStroke' : this.getStrokeOptionName();
  var resolved = resolver(optionName, anychart.enums.ColorType.STROKE, false);
  return /** @type {acgraph.vector.Stroke} */ (resolved(this.getTimeline(), 0, item, void 0, void 0, opt_periodIndex));
};


/**
 * Recreates shape manager.
 */
anychart.ganttModule.elements.Base.prototype.recreateShapeManager = function() {
  goog.dispose(this.shapeManager);
  var shapes = /** @type {!Array.<anychart.ganttModule.rendering.shapes.ShapeConfig>} */ (this.renderingSettings.getOption('shapes'));
  this.shapeManager = new anychart.ganttModule.rendering.ShapeManager(this.getTimeline(), this, shapes);
  this.shapeManager.setContainer(this.getTimeline().getDrawLayer());
};


//endregion
//region -- External API.
/**
 * Rendering settings getter/setter.
 * @param {(Object|string)=} opt_value - Value to set.
 * @return {anychart.ganttModule.elements.Base|anychart.ganttModule.rendering.Settings} - .
 */
anychart.ganttModule.elements.Base.prototype.rendering = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.renderingSettings != opt_value) {
      this.renderingSettings.setup(opt_value);
    }
    return this;
  }
  return this.renderingSettings;
};


/**
 * Rendering settings invalidation handler.
 * @param {anychart.SignalEvent} e - Signal event.
 * @private
 */
anychart.ganttModule.elements.Base.prototype.renderingSettingsInvalidated_ = function(e) {
  this.recreateShapeManager();
  this.dispatchSignal(anychart.Signal.NEEDS_REDRAW);
};


/**
 * Fill.
 * @param {...*} var_args - Fill arguments.
 * @return {anychart.ganttModule.elements.Base|acgraph.vector.Fill|Function}
 */
anychart.ganttModule.elements.Base.prototype.fill = function(var_args) {
  var fillOptionName = this.getFillOptionName();
  if (arguments.length) {
    this.getTimeline()[fillOptionName].apply(this.getTimeline(), arguments);
    return this;
  }
  return /** @type {acgraph.vector.Fill|Function} */ (this.getTimeline().getOption(fillOptionName));
};


/**
 * Stroke.
 * @param {...*} var_args - Stroke arguments.
 * @return {anychart.ganttModule.elements.Base|acgraph.vector.Stroke|Function}
 */
anychart.ganttModule.elements.Base.prototype.stroke = function(var_args) {
  var strokeOptionName = this.getStrokeOptionName();
  if (arguments.length) {
    this.getTimeline()[strokeOptionName].apply(this.getTimeline(), arguments);
    return this;
  }
  return /** @type {acgraph.vector.Stroke|Function} */ (this.getTimeline().getOption(strokeOptionName));
};


//endregion
//region -- Serialization/Deserialization.
/**
 * @inheritDoc
 */
anychart.ganttModule.elements.Base.prototype.setupByJSON = function(config, opt_default) {
  anychart.ganttModule.elements.Base.base(this, 'setupByJSON', config, opt_default);
  //TODO (A.Kudryavtsev): We can skip setting up fill and stroke in current implementation because it falls back to Timeline API.
  this.rendering().setupInternal(!!opt_default, config['rendering']);
};


/**
 * @inheritDoc
 */
anychart.ganttModule.elements.Base.prototype.serialize = function() {
  var json = anychart.ganttModule.elements.Base.base(this, 'serialize');
  json['rendering'] = this.rendering().serialize();
  //TODO (A.Kudryavtsev): Here fill and stroke are not serialized because of current Timeline API.
  return json;
};


//endregion
//region -- Disposing.
/** @inheritDoc */
anychart.ganttModule.elements.Base.prototype.disposeInternal = function() {
  this.renderingSettings.unlistenSignals(this.renderingSettingsInvalidated_, this);
  goog.dispose(this.renderingSettings);
  delete this.renderingSettings;

  if (this.parent_) {
    this.parent_.unlistenSignals(this.parentInvalidated_, this);
    delete this.parent_;
  }

  this.resolutionChainCache_ = null;

  anychart.ganttModule.elements.Base.base(this, 'disposeInternal');
};


//endregion
//region -- Exports.
//exports
(function() {
  var proto = anychart.ganttModule.elements.Base.prototype;
  proto['rendering'] = proto.rendering;
  proto['fill'] = proto.fill;
  proto['stroke'] = proto.stroke;
})();


//endregion
