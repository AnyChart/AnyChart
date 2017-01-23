goog.provide('anychart.core.resource.Conflicts');
goog.require('anychart.core.VisualBase');
goog.require('anychart.core.settings');
goog.require('anychart.core.ui.LabelsFactory');
goog.require('anychart.core.utils.GenericContextProvider');
goog.require('anychart.core.utils.TypedLayer');
goog.require('anychart.math.Rect');



/**
 * Conflicts settings and drawing class
 * @param {anychart.charts.Resource} chart
 * @constructor
 * @extends {anychart.core.VisualBase}
 * @implements {anychart.core.settings.IObjectWithSettings}
 */
anychart.core.resource.Conflicts = function(chart) {
  anychart.core.resource.Conflicts.base(this, 'constructor');

  /**
   * Chart reference.
   * @type {anychart.charts.Resource}
   * @private
   */
  this.chart_ = chart;

  /**
   * Settings map.
   * @type {Object}
   */
  this.settings = {};

  /**
   * Default settings map.
   * @type {Object}
   */
  this.defaultSettings = {};

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
};
goog.inherits(anychart.core.resource.Conflicts, anychart.core.VisualBase);


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
anychart.core.resource.Conflicts.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.VisualBase.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.APPEARANCE |
    anychart.ConsistencyState.RESOURCE_CONFLICTS_LABELS |
    anychart.ConsistencyState.RESOURCE_CONFLICTS_CONFLICTS;


/**
 * Supported signals.
 * @type {number}
 */
anychart.core.resource.Conflicts.prototype.SUPPORTED_SIGNALS =
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
anychart.core.resource.Conflicts.prototype.clear = function() {
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
 * @param {?anychart.core.resource.Resource.Allocation} allocation
 * @param {anychart.core.resource.Resource} resource
 * @param {number} top
 */
anychart.core.resource.Conflicts.prototype.evaluate = function(date, allocation, resource, top) {
  if (allocation && allocation.allocated > allocation.vacant) {
    var provider = this.createFormatProvider(date, allocation, resource);
    var text = this.labels_.callTextFormatter(/** @type {Function} */(this.labels_.textFormatter()), provider, ++this.labelIndex_);
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
anychart.core.resource.Conflicts.prototype.finalizeCurrent_ = function(date) {
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
anychart.core.resource.Conflicts.prototype.drawConflict_ = function(conflict) {
  var start = conflict.start;
  var end = conflict.end;
  var stroke = /** @type {acgraph.vector.Stroke} */(this.getOption('stroke'));
  var xScale = /** @type {anychart.scales.DateTimeWithCalendar} */(this.chart_.xScale());
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
anychart.core.resource.Conflicts.prototype.draw = function() {
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
 * @return {!(anychart.core.ui.LabelsFactory|anychart.core.resource.Conflicts)} Labels instance or itself for chaining call.
 */
anychart.core.resource.Conflicts.prototype.labels = function(opt_value) {
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
//  * @return {!(anychart.core.ui.LabelsFactory|anychart.core.resource.Conflicts)} Labels instance or itself for chaining call.
//  */
// anychart.core.resource.Conflicts.prototype.hoverLabels = function(opt_value) {
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
//  * @return {!(anychart.core.ui.LabelsFactory|anychart.core.resource.Conflicts)} Labels instance or itself for chaining call.
//  */
// anychart.core.resource.Conflicts.prototype.selectLabels = function(opt_value) {
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
anychart.core.resource.Conflicts.prototype.labelsInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Creates label format provider
 * @param {number} date
 * @param {anychart.core.resource.Resource.Allocation} allocation
 * @param {anychart.core.resource.Resource} resource
 * @return {Object}
 */
anychart.core.resource.Conflicts.prototype.createFormatProvider = function(date, allocation, resource) {
  var minutes = allocation.allocated - allocation.vacant;
  return new anychart.core.utils.GenericContextProvider({
    'minutes': minutes,
    'hours': minutes / 60,
    'hoursRounded': Math.ceil(minutes / 30) / 2,
    'percent': minutes / allocation.vacant * 100,
    'allocated': allocation.allocated,
    'vacant': allocation.vacant,
    'activities': goog.array.map(allocation.activities, function(index) {
      var activity = resource.getActivity(index);
      return activity ? activity.data : null;
    })
  }, {
    'minutes': anychart.enums.TokenType.NUMBER,
    'hours': anychart.enums.TokenType.NUMBER,
    'hoursRounded': anychart.enums.TokenType.NUMBER,
    'percent': anychart.enums.TokenType.NUMBER,
    'allocated': anychart.enums.TokenType.NUMBER,
    'vacant': anychart.enums.TokenType.NUMBER,
    'activities': anychart.enums.TokenType.UNKNOWN
  });
};


/**
 * Draws a label for passed providers and index.
 * @param {number} index
 * @param {*} formatProvider
 * @param {anychart.math.Rect} bounds
 * @param {?Object=} opt_settings
 */
anychart.core.resource.Conflicts.prototype.drawLabel = function(index, formatProvider, bounds, opt_settings) {
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
    element.width(bounds.width);
    element.height(bounds.height);
    element.clip(bounds);
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
anychart.core.resource.Conflicts.DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};
  map['fill'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'fill',
      anychart.core.settings.fillNormalizer,
      anychart.ConsistencyState.APPEARANCE,
      anychart.Signal.NEEDS_REDRAW);
  map['stroke'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'stroke',
      anychart.core.settings.strokeNormalizer,
      anychart.ConsistencyState.APPEARANCE,
      anychart.Signal.NEEDS_REDRAW);
  map['hatchFill'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'hatchFill',
      anychart.core.settings.hatchFillNormalizer,
      anychart.ConsistencyState.APPEARANCE,
      anychart.Signal.NEEDS_REDRAW);
  map['height'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'height',
      anychart.core.settings.numberNormalizer,
      anychart.ConsistencyState.ONLY_DISPATCHING,
      anychart.Signal.NEEDS_REAPPLICATION);

  return map;
})();
anychart.core.settings.populate(anychart.core.resource.Conflicts, anychart.core.resource.Conflicts.DESCRIPTORS);


//endregion
//region --- IObjectWithSettings impl
//----------------------------------------------------------------------------------------------------------------------
//
//  --- IObjectWithSettings impl
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Returns option value if it was set directly to the object.
 * @param {string} name
 * @return {*}
 */
anychart.core.resource.Conflicts.prototype.getOwnOption = function(name) {
  return this.settings[name];
};


/**
 * Returns true if the option value was set directly to the object.
 * @param {string} name
 * @return {boolean}
 */
anychart.core.resource.Conflicts.prototype.hasOwnOption = function(name) {
  return goog.isDefAndNotNull(this.settings[name]);
};


/**
 * Returns option value from the theme if any.
 * @param {string} name
 * @return {*}
 */
anychart.core.resource.Conflicts.prototype.getThemeOption = function(name) {
  return this.defaultSettings[name];
};


/**
 * Returns option value by priorities.
 * @param {string} name
 * @return {*}
 */
anychart.core.resource.Conflicts.prototype.getOption = function(name) {
  return goog.isDefAndNotNull(this.settings[name]) ? this.settings[name] : this.defaultSettings[name];
};


/**
 * Sets option value to the instance.
 * @param {string} name
 * @param {*} value
 */
anychart.core.resource.Conflicts.prototype.setOption = function(name, value) {
  this.settings[name] = value;
};


/**
 * Performs checks on the instance to determine whether the state should be invalidated after option change.
 * @param {number} flags
 * @return {boolean}
 */
anychart.core.resource.Conflicts.prototype.check = function(flags) {
  return true;
};


/**
 * Returns proper settings due to the state.
 * @param {string} name
 * @param {Object} interval
 * @param {Function} normalizer
 * @return {*}
 */
anychart.core.resource.Conflicts.prototype.resolveOption = function(name, interval, normalizer) {
  var val = interval[name];
  if (goog.isDef(val)) {
    val = normalizer(val);
  } else {
    val = this.settings[name];
    if (!goog.isDefAndNotNull(val)) {
      val = this.defaultSettings[name];
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
anychart.core.resource.Conflicts.prototype.serialize = function() {
  var json = anychart.core.resource.Conflicts.base(this, 'serialize');
  anychart.core.settings.serialize(this, anychart.core.resource.Conflicts.DESCRIPTORS, json, 'Resource Conflicts');
  return json;
};


/** @inheritDoc */
anychart.core.resource.Conflicts.prototype.setupByJSON = function(config) {
  anychart.core.resource.Conflicts.base(this, 'setupByJSON', config);
  anychart.core.settings.deserialize(this, anychart.core.resource.Conflicts.DESCRIPTORS, config);
  this.labels(config['labels']);
};


/** @inheritDoc */
anychart.core.resource.Conflicts.prototype.disposeInternal = function() {
  goog.disposeAll(this.conflictsLayer_, this.hatchLayer_, this.clip_);
  this.conflictsLayer_ = this.hatchLayer_ = this.clip_ = null;
  anychart.core.resource.Conflicts.base(this, 'disposeInternal');
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
  var proto = anychart.core.resource.Conflicts.prototype;
  //proto['height'] = proto.height;
  //proto['stroke'] = proto.stroke;
  //proto['fill'] = proto.fill;
  //proto['hatchFill'] = proto.hatchFill;
  proto['labels'] = proto.labels;
})();


//endregion
