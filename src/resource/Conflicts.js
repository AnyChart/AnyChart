goog.provide('anychart.resourceModule.Conflicts');
goog.require('anychart.core.VisualBase');
goog.require('anychart.core.settings');
goog.require('anychart.core.ui.LabelsFactory');
goog.require('anychart.core.utils.TypedLayer');
goog.require('anychart.format.Context');
goog.require('anychart.math.Rect');



/**
 * Conflicts settings and drawing class
 * @param {anychart.resourceModule.Chart} chart
 * @constructor
 * @extends {anychart.core.VisualBase}
 */
anychart.resourceModule.Conflicts = function(chart) {
  anychart.resourceModule.Conflicts.base(this, 'constructor');

  /**
   * Chart reference.
   * @type {anychart.resourceModule.Chart}
   * @private
   */
  this.chart_ = chart;

  /**
   * Layer for conflicts drawing.
   * @type {anychart.core.utils.TypedLayer}
   * @private
   */
  this.conflictsLayer_ = new anychart.core.utils.TypedLayer(function() {
    return acgraph.rect();
  });

  /**
   * Layer for hatch fills drawing.
   * @type {anychart.core.utils.TypedLayer}
   * @private
   */
  this.hatchLayer_ = new anychart.core.utils.TypedLayer(function() {
    return acgraph.rect();
  });

  /**
   * Labels root.
   * @type {acgraph.vector.Layer}
   * @private
   */
  this.labelsRoot_ = acgraph.layer();

  /**
   * Clip shape.
   * @type {acgraph.vector.Clip}
   * @private
   */
  this.clip_ = acgraph.clip();

  /**
   * Root layer
   * @type {acgraph.vector.Layer}
   * @private
   */
  this.rootLayer_ = acgraph.layer();
  this.conflictsLayer_.parent(this.rootLayer_);
  this.hatchLayer_.parent(this.rootLayer_);
  this.labelsRoot_.parent(this.rootLayer_);
  this.rootLayer_.clip(this.clip_);

  /**
   * Conflicts list.
   * @type {Array}
   * @private
   */
  this.conflicts_ = [];

  /**
   * @type {anychart.format.Context}
   * @private
   */
  this.formatProvider_ = null;

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['fill', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW],
    ['stroke', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW],
    ['hatchFill', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW],
    ['height', anychart.ConsistencyState.ONLY_DISPATCHING, anychart.Signal.NEEDS_REAPPLICATION]
  ]);
};
goog.inherits(anychart.resourceModule.Conflicts, anychart.core.VisualBase);


//region --- Infrastructure
//------------------------------------------------------------------------------
//
//  Infrastructure
//
//------------------------------------------------------------------------------
/**
 * Supported consistency states.
 * @type {number}
 */
anychart.resourceModule.Conflicts.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.VisualBase.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.APPEARANCE |
    anychart.ConsistencyState.RESOURCE_CONFLICTS_LABELS |
    anychart.ConsistencyState.RESOURCE_CONFLICTS_CONFLICTS;


/**
 * Supported signals.
 * @type {number}
 */
anychart.resourceModule.Conflicts.prototype.SUPPORTED_SIGNALS =
    anychart.core.VisualBase.prototype.SUPPORTED_SIGNALS |
    anychart.Signal.NEEDS_REAPPLICATION;


//endregion
//region --- Public methods
//------------------------------------------------------------------------------
//
//  Public methods
//
//------------------------------------------------------------------------------
/**
 * Clears conflicts.
 */
anychart.resourceModule.Conflicts.prototype.clear = function() {
  this.conflictsLayer_.clear();
  this.hatchLayer_.clear();
  this.labels().clear();
  this.conflicts_.length = 0;
  this.current_ = null;
  this.labelIndex_ = -1;
  this.invalidate(anychart.ConsistencyState.RESOURCE_CONFLICTS_LABELS | anychart.ConsistencyState.RESOURCE_CONFLICTS_CONFLICTS);
};


/**
 * Evaluates passed schedule and detects a conflict if any.
 * @param {number} date
 * @param {?anychart.resourceModule.Resource.Allocation} allocation
 * @param {anychart.resourceModule.Resource} resource
 * @param {number} top
 */
anychart.resourceModule.Conflicts.prototype.evaluate = function(date, allocation, resource, top) {
  if (allocation && allocation.allocated > allocation.vacant) {
    var provider = this.createFormatProvider(date, allocation, resource);
    var text = this.labels_.callFormat(/** @type {Function} */(this.labels_.getOption('format')), provider, ++this.labelIndex_);
    if (this.current_) {
      if (this.current_.text == text)
        return;
      else
        this.finalizeCurrent_(date);
    }
    this.current_ = {
      index: this.labelIndex_,
      text: text,
      start: date,
      provider: provider,
      allocation: allocation,
      resource: resource,
      top: top
    };
  } else {
    this.finalizeCurrent_(date);
  }
};


/**
 * Finalizes current conflict if any.
 * @param {number} date
 * @private
 */
anychart.resourceModule.Conflicts.prototype.finalizeCurrent_ = function(date) {
  if (this.current_) {
    this.current_.end = date;
    this.conflicts_.push(this.current_);
    this.current_ = null;
  }
};


/**
 * Draws conflicts.
 * @param {Object} conflict
 * @private
 */
anychart.resourceModule.Conflicts.prototype.drawConflict_ = function(conflict) {
  var start = conflict.start;
  var end = conflict.end;
  var stroke = /** @type {acgraph.vector.Stroke} */(this.getOption('stroke'));
  var xScale = /** @type {anychart.resourceModule.Scale} */(this.chart_.xScale());
  var thickness = acgraph.vector.getThickness(stroke);
  var vLineThickness = acgraph.vector.getThickness(
      /** @type {acgraph.vector.Stroke} */(this.chart_.grid().getOption('verticalStroke')));
  var hDiff = vLineThickness / 2 + thickness / 2;
  var left = goog.math.clamp(
      anychart.utils.applyPixelShift(xScale.dateToPix(start) + this.boundsCache_.left, vLineThickness) + hDiff,
      this.boundsCache_.left, this.boundsCache_.getRight());
  var right = goog.math.clamp(
      anychart.utils.applyPixelShift(xScale.dateToPix(end) + this.boundsCache_.left, vLineThickness) - hDiff,
      this.boundsCache_.left, this.boundsCache_.getRight());
  var top = anychart.utils.applyPixelShift(conflict.top + thickness / 2, thickness);
  var bottom = anychart.utils.applyPixelShift(conflict.top + this.getOption('height') - thickness / 2, thickness);
  var rect = /** @type {acgraph.vector.Rect} */(this.conflictsLayer_.genNextChild());
  rect
      .setX(left)
      .setY(top)
      .setWidth(right - left)
      .setHeight(bottom - top)
      .fill(/** @type {acgraph.vector.Fill} */(this.getOption('fill')))
      .stroke(stroke);
  var hatchFill = /** @type {acgraph.vector.HatchFill} */(this.getOption('hatchFill'));
  if (hatchFill) {
    rect = /** @type {acgraph.vector.Rect} */(this.conflictsLayer_.genNextChild());
    rect
        .setX(left + thickness / 2)
        .setY(top + thickness / 2)
        .setWidth(right - left - thickness)
        .setHeight(bottom - top - thickness)
        .fill(hatchFill)
        .stroke(null);
  }
  this.drawLabel(conflict.index, conflict.provider, new anychart.math.Rect(left, top, right - left, bottom - top));
};


/**
 * Draws the root layer.
 */
anychart.resourceModule.Conflicts.prototype.draw = function() {
  if (!this.checkDrawingNeeded())
    return;

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    this.boundsCache_ = /** @type {anychart.math.Rect} */(this.parentBounds());
    this.clip_.shape(this.boundsCache_);
    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.RESOURCE_CONFLICTS_CONFLICTS)) {
    for (var i = 0; i < this.conflicts_.length; i++) {
      this.drawConflict_(this.conflicts_[i]);
    }
    this.markConsistent(anychart.ConsistencyState.RESOURCE_CONFLICTS_CONFLICTS | anychart.ConsistencyState.APPEARANCE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.RESOURCE_CONFLICTS_LABELS)) {
    var factory = /** @type {anychart.core.ui.LabelsFactory} */(this.labels());
    factory.suspendSignalsDispatching();
    // var stateFactoriesEnabled = /** @type {boolean} */(this.hoverLabels().enabled() || /** @type {anychart.core.ui.LabelsFactory} */(this.selectLabels()).enabled());
    factory.container(this.labelsRoot_);
    factory.parentBounds(this.boundsCache_);
    factory.setAutoZIndex(0);
    this.clip_.shape(this.boundsCache_);
    factory.draw();
    var layer = factory.getRootLayer();
    if (layer)
      layer.disablePointerEvents(true);
    factory.resumeSignalsDispatching(false);
    this.markConsistent(anychart.ConsistencyState.RESOURCE_CONFLICTS_LABELS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    var fill = this.getOption('fill');
    var stroke = this.getOption('stroke');
    this.conflictsLayer_.forEachChild(function(child) {
      child.fill(fill);
      child.stroke(stroke);
    });
    var hatchFill = this.getOption('hatchFill');
    this.hatchLayer_.forEachChild(function(child) {
      child.fill(hatchFill);
      child.stroke(null);
    });
    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    var container = /** @type {acgraph.vector.ILayer} */(this.container());
    this.rootLayer_.parent(container);
    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    var zIndex = /** @type {number} */(this.zIndex());
    this.rootLayer_.zIndex(zIndex);
    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }
};


//endregion
//region Labels
//----------------------------------------------------------------------------------------------------------------------
//
//  Labels
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter/setter for labels.
 * @param {(Object|boolean|null|string)=} opt_value Series data labels settings.
 * @return {!(anychart.core.ui.LabelsFactory|anychart.resourceModule.Conflicts)} Labels instance or itself for chaining call.
 */
anychart.resourceModule.Conflicts.prototype.labels = function(opt_value) {
  if (!this.labels_) {
    this.labels_ = new anychart.core.ui.LabelsFactory();
    this.labels_.setParentEventTarget(this);
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


// /**
//  * Getter/setter for hoverLabels.
//  * @param {(Object|boolean|null|string)=} opt_value Series data labels settings.
//  * @return {!(anychart.core.ui.LabelsFactory|anychart.resourceModule.Conflicts)} Labels instance or itself for chaining call.
//  */
// anychart.resourceModule.Conflicts.prototype.hoverLabels = function(opt_value) {
//   if (!this.hoverLabels_) {
//     this.hoverLabels_ = new anychart.core.ui.LabelsFactory();
//     // don't listen to it, for it will be reapplied at the next hover
//   }
//
//   if (goog.isDef(opt_value)) {
//     if (goog.isObject(opt_value) && !('enabled' in opt_value))
//       opt_value['enabled'] = true;
//     this.hoverLabels_.setup(opt_value);
//     return this;
//   }
//   return this.hoverLabels_;
// };
//
//
// /**
//  * @param {(Object|boolean|null|string)=} opt_value Series data labels settings.
//  * @return {!(anychart.core.ui.LabelsFactory|anychart.resourceModule.Conflicts)} Labels instance or itself for chaining call.
//  */
// anychart.resourceModule.Conflicts.prototype.selectLabels = function(opt_value) {
//   if (!this.selectLabels_) {
//     this.selectLabels_ = new anychart.core.ui.LabelsFactory();
//     // don't listen to it, for it will be reapplied at the next hover
//   }
//
//   if (goog.isDef(opt_value)) {
//     if (goog.isObject(opt_value) && !('enabled' in opt_value))
//       opt_value['enabled'] = true;
//     this.selectLabels_.setup(opt_value);
//     return this;
//   }
//   return this.selectLabels_;
// };


/**
 * Listener for labels invalidation.
 * @param {anychart.SignalEvent} event Invalidation event.
 * @private
 */
anychart.resourceModule.Conflicts.prototype.labelsInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Creates label format provider
 * @param {number} date
 * @param {anychart.resourceModule.Resource.Allocation} allocation
 * @param {anychart.resourceModule.Resource} resource
 * @return {Object}
 */
anychart.resourceModule.Conflicts.prototype.createFormatProvider = function(date, allocation, resource) {
  if (!this.formatProvider_)
    this.formatProvider_ = new anychart.format.Context();

  var minutes = allocation.allocated - allocation.vacant;
  var values = {
    'minutes': {value: minutes, type: anychart.enums.TokenType.NUMBER},
    'hours': {value: minutes / 60, type: anychart.enums.TokenType.NUMBER},
    'hoursRounded': {value: Math.ceil(minutes / 30) / 2, type: anychart.enums.TokenType.NUMBER},
    'percent': {value: minutes / allocation.vacant * 100, type: anychart.enums.TokenType.NUMBER},
    'allocated': {value: allocation.allocated, type: anychart.enums.TokenType.NUMBER},
    'vacant': {value: allocation.vacant, type: anychart.enums.TokenType.NUMBER},
    'activities': {value: goog.array.map(allocation.activities, function(index) {
      var activity = resource.getActivity(index);
      return activity ? activity.data : null;
    }), type: anychart.enums.TokenType.UNKNOWN}
  };

  return this.formatProvider_.propagate(values);
};


/**
 * Draws a label for passed providers and index.
 * @param {number} index
 * @param {*} formatProvider
 * @param {anychart.math.Rect} bounds
 * @param {?Object=} opt_settings
 */
anychart.resourceModule.Conflicts.prototype.drawLabel = function(index, formatProvider, bounds, opt_settings) {
  var mainFactory = /** @type {anychart.core.ui.LabelsFactory} */(this.labels());
  if (formatProvider) {
    var element = mainFactory.getLabel(/** @type {number} */(index));
    var positionProvider = {'value': {'x': bounds.left, 'y': bounds.top}};
    if (element) {
      element.formatProvider(formatProvider);
      element.positionProvider(positionProvider);
    } else {
      element = mainFactory.add(formatProvider, positionProvider, index);
    }
    element.resetSettings();
    // element.currentLabelsFactory(/*stateFactory || */mainFactory);
    element.setSettings(opt_settings);
    element['width'](bounds.width);
    element['height'](bounds.height);
    element['clip'](bounds);
    element.draw();
  } else {
    mainFactory.clear(index);
  }
};


//endregion
//region --- Settings
//------------------------------------------------------------------------------
//
//  Settings
//
//------------------------------------------------------------------------------
/**
 * Settings descriptors.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.resourceModule.Conflicts.DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};
  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'fill',
      anychart.core.settings.fillNormalizer);
  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'stroke',
      anychart.core.settings.strokeNormalizer);
  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'hatchFill',
      anychart.core.settings.hatchFillNormalizer);
  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'height',
      anychart.core.settings.numberNormalizer);

  return map;
})();
anychart.core.settings.populate(anychart.resourceModule.Conflicts, anychart.resourceModule.Conflicts.DESCRIPTORS);


//endregion
//region --- IObjectWithSettings overrides
//----------------------------------------------------------------------------------------------------------------------
//
//  --- IObjectWithSettings overrides
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.resourceModule.Conflicts.prototype.hasOwnOption = function(name) {
  return goog.isDefAndNotNull(this.ownSettings[name]);
};


/**
 * Returns proper settings due to the state.
 * @param {string} name
 * @param {Object} interval
 * @param {Function} normalizer
 * @return {*}
 */
anychart.resourceModule.Conflicts.prototype.resolveOption = function(name, interval, normalizer) {
  var val = interval[name];
  if (goog.isDef(val)) {
    val = normalizer(val);
  } else {
    val = this.ownSettings[name];
    if (!goog.isDefAndNotNull(val)) {
      val = this.themeSettings[name];
      if (goog.isDef(val))
        val = normalizer(val);
    }
  }
  return val;
};


//endregion
//region --- Serialization / Deserialization / Disposing
//------------------------------------------------------------------------------
//
//  Serialization / Deserialization / Disposing
//
//------------------------------------------------------------------------------
/** @inheritDoc */
anychart.resourceModule.Conflicts.prototype.serialize = function() {
  var json = anychart.resourceModule.Conflicts.base(this, 'serialize');
  anychart.core.settings.serialize(this, anychart.resourceModule.Conflicts.DESCRIPTORS, json, 'Resource Conflicts');
  return json;
};


/** @inheritDoc */
anychart.resourceModule.Conflicts.prototype.setupByJSON = function(config, opt_default) {
  anychart.resourceModule.Conflicts.base(this, 'setupByJSON', config);
  anychart.core.settings.deserialize(this, anychart.resourceModule.Conflicts.DESCRIPTORS, config);
  this.labels().setupInternal(!!opt_default, config['labels']);
};


/** @inheritDoc */
anychart.resourceModule.Conflicts.prototype.disposeInternal = function() {
  goog.disposeAll(this.conflictsLayer_, this.hatchLayer_, this.clip_);
  this.conflictsLayer_ = this.hatchLayer_ = this.clip_ = null;
  anychart.resourceModule.Conflicts.base(this, 'disposeInternal');
};


//endregion
//region --- Exports
//------------------------------------------------------------------------------
//
//  Exports
//
//------------------------------------------------------------------------------
//exports
(function() {
  var proto = anychart.resourceModule.Conflicts.prototype;
  //proto['height'] = proto.height;
  //proto['stroke'] = proto.stroke;
  //proto['fill'] = proto.fill;
  //proto['hatchFill'] = proto.hatchFill;
  proto['labels'] = proto.labels;
})();


//endregion
