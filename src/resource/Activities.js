goog.provide('anychart.resourceModule.Activities');

goog.require('anychart.core.Base');
goog.require('anychart.core.StateSettings');
goog.require('anychart.core.settings');
goog.require('anychart.core.ui.LabelsFactory');
goog.require('anychart.enums');
goog.require('anychart.format.Context');



/**
 * Activity settings representation class.
 * @param {anychart.resourceModule.Chart} chart
 * @constructor
 * @extends {anychart.core.Base}
 */
anychart.resourceModule.Activities = function(chart) {
  anychart.resourceModule.Activities.base(this, 'constructor');

  /**
   * Chart reference.
   * @type {anychart.resourceModule.Chart}
   * @private
   */
  this.chart_ = chart;

  /**
   * Fill resolver.
   * @type {?function(anychart.resourceModule.Activities, Object, anychart.resourceModule.Resource.ActivityInterval, number):acgraph.vector.AnyColor}
   * @private
   */
  this.fillResolver_ = null;

  /**
   * Stroke resolver.
   * @type {?function(anychart.resourceModule.Activities, Object, anychart.resourceModule.Resource.ActivityInterval, number):acgraph.vector.AnyColor}
   * @private
   */
  this.strokeResolver_ = null;

  /**
   * HatchFill resolver.
   * @type {?function(anychart.resourceModule.Activities, Object, anychart.resourceModule.Resource.ActivityInterval, number):acgraph.vector.AnyColor}
   * @private
   */
  this.hatchFillResolver_ = null;

  /**
   * @type {anychart.format.Context}
   * @private
   */
  this.formatProvider_ = null;

  var normalDescriptorsMeta = {};
  anychart.core.settings.createDescriptorsMeta(normalDescriptorsMeta, [
    ['fill', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW],
    ['stroke', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW],
    ['hatchFill', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW],
    ['labels', 0, 0]
  ]);
  this.normal_ = new anychart.core.StateSettings(this, normalDescriptorsMeta, anychart.PointState.NORMAL);
  this.normal_.setOption(anychart.core.StateSettings.LABELS_AFTER_INIT_CALLBACK, anychart.core.StateSettings.DEFAULT_LABELS_AFTER_INIT_CALLBACK);

  var hoveredSelectedDescriptorsMeta = {};
  anychart.core.settings.createDescriptorsMeta(hoveredSelectedDescriptorsMeta, [
    ['fill', 0, 0],
    ['stroke', 0, 0],
    ['hatchFill', 0, 0],
    ['labels', 0, 0]
  ]);
  this.hovered_ = new anychart.core.StateSettings(this, hoveredSelectedDescriptorsMeta, anychart.PointState.HOVER);
  this.hovered_.setOption(anychart.core.StateSettings.LABELS_FACTORY_CONSTRUCTOR,  anychart.core.StateSettings.DEFAULT_LABELS_CONSTRUCTOR_NO_THEME);
  this.selected_ = new anychart.core.StateSettings(this, hoveredSelectedDescriptorsMeta, anychart.PointState.SELECT);
  this.selected_.setOption(anychart.core.StateSettings.LABELS_FACTORY_CONSTRUCTOR,  anychart.core.StateSettings.DEFAULT_LABELS_CONSTRUCTOR_NO_THEME);

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['color', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW]
  ]);
};
goog.inherits(anychart.resourceModule.Activities, anychart.core.Base);
anychart.core.settings.populateAliases(anychart.resourceModule.Activities, ['fill', 'stroke', 'hatchFill', 'labels'], 'normal');


//region --- State Settings
/**
 * Normal state settings.
 * @param {!Object=} opt_value
 * @return {anychart.core.StateSettings|anychart.resourceModule.Activities}
 */
anychart.resourceModule.Activities.prototype.normal = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.normal_.setup(opt_value);
    return this;
  }
  return this.normal_;
};


/**
 * Hovered state settings.
 * @param {!Object=} opt_value
 * @return {anychart.core.StateSettings|anychart.resourceModule.Activities}
 */
anychart.resourceModule.Activities.prototype.hovered = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.hovered_.setup(opt_value);
    return this;
  }
  return this.hovered_;
};


/**
 * Selected state settings.
 * @param {!Object=} opt_value
 * @return {anychart.core.StateSettings|anychart.resourceModule.Activities}
 */
anychart.resourceModule.Activities.prototype.selected = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.selected_.setup(opt_value);
    return this;
  }
  return this.selected_;
};


//endregion
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
anychart.resourceModule.Activities.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.ConsistencyState.APPEARANCE;


/**
 * Supported signals.
 * @type {number}
 */
anychart.resourceModule.Activities.prototype.SUPPORTED_SIGNALS =
    anychart.Signal.NEEDS_REDRAW;


//endregion
//region --- Constants
//------------------------------------------------------------------------------
//
//  Constants
//
//------------------------------------------------------------------------------
/**
 * Default hatch fill.
 * @const {acgraph.vector.PatternFill}
 */
anychart.resourceModule.Activities.DEFAULT_HATCH_FILL = acgraph.vector.normalizeHatchFill(acgraph.vector.HatchFill.HatchFillType.DIAGONAL_BRICK);


/**
 * Default color.
 * @type {string}
 */
anychart.resourceModule.Activities.DEFAULT_COLOR = 'blue';


//endregion
//region --- Labels
//----------------------------------------------------------------------------------------------------------------------
//
//  --- Labels
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Listener for labels invalidation.
 * @param {anychart.SignalEvent} event Invalidation event.
 * @private
 */
anychart.resourceModule.Activities.prototype.labelsInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Creates label format provider
 * @param {anychart.resourceModule.Resource.ActivityInterval} interval
 * @param {Object} dataObj
 * @return {Object}
 */
anychart.resourceModule.Activities.prototype.createFormatProvider = function(interval, dataObj) {
  if (!this.formatProvider_)
    this.formatProvider_ = new anychart.format.Context();

  var values = {
    'start': {value: interval.start, type: anychart.enums.TokenType.DATE_TIME},
    'end': {value: interval.end, type: anychart.enums.TokenType.DATE_TIME},
    'minutesPerDay': {value: interval.minutesPerDay, type: anychart.enums.TokenType.NUMBER},
    'hoursPerDay': {value: interval.minutesPerDay / 60, type: anychart.enums.TokenType.NUMBER},
    'hoursPerDayRounded': {value: Math.ceil(interval.minutesPerDay / 30) / 2, type: anychart.enums.TokenType.NUMBER},
    'name': {value: dataObj['name'] || 'Unnamed Activity', type: anychart.enums.TokenType.STRING},
    'activityName': {value: dataObj['name'], type: anychart.enums.TokenType.STRING},
    'activityInfo': {value: dataObj, type: anychart.enums.TokenType.UNKNOWN}
  };

  return this.formatProvider_.propagate(values);
};


/**
 * Draws a label for passed providers and index.
 * @param {number} index
 * @param {number|anychart.PointState} state
 * @param {*} formatProvider
 * @param {anychart.math.Rect} bounds
 * @param {Object} data
 */
anychart.resourceModule.Activities.prototype.drawLabel = function(index, state, formatProvider, bounds, data) {
  var mainFactory = /** @type {anychart.core.ui.LabelsFactory} */(this.normal_.labels());
  var pointStateName = state == 0 ? 'normal' : state == 1 ? 'hovered' : 'selected';
  var pointStateObject = data['normal'] ? data['normal']['label'] : void 0;
  var pointOverride = pointStateObject || data['label'];
  var statePointOverride = undefined;
  if (state != anychart.PointState.NORMAL) {
    pointStateObject = data[pointStateName] ? data[pointStateName]['label'] : void 0;
    statePointOverride = pointStateObject || data[state == anychart.PointState.HOVER ? 'hoverLabel' : 'selectLabel'];
  }

  var pointOverrideEnabled = pointOverride && goog.isDef(pointOverride['enabled']) ? pointOverride['enabled'] : null;
  var statePointOverrideEnabled = statePointOverride && goog.isDef(statePointOverride['enabled']) ? statePointOverride['enabled'] : null;

  var stateFactory = /** @type {anychart.core.ui.LabelsFactory} */((state == anychart.PointState.SELECT) ?
      this.selected().labels() :
      ((state == anychart.PointState.HOVER) ?
          this.hovered().labels() :
          null));

  var isDraw = goog.isNull(statePointOverrideEnabled) ? // has no state marker or null "enabled" in it ?
      (!stateFactory || goog.isNull(stateFactory.enabled()) || !goog.isDef(stateFactory.enabled())) ? // has no state stateFactory or null "enabled" in it ?
          goog.isNull(pointOverrideEnabled) ? // has no marker in point or null "enabled" in it ?
              mainFactory.enabled() :
              pointOverrideEnabled :
          stateFactory.enabled() :
      statePointOverrideEnabled;

  if (isDraw) {
    var position = (statePointOverride && statePointOverride['position']) ||
        (stateFactory && stateFactory.getOption('position')) ||
        (pointOverride && pointOverride['position']) ||
        mainFactory.getOption('position');
    var positionProvider = {'value': anychart.utils.getCoordinateByAnchor(bounds, position)};

    var element = mainFactory.getLabel(/** @type {number} */(index));
    if (element) {
      element.formatProvider(formatProvider);
      element.positionProvider(positionProvider);
    } else {
      element = mainFactory.add(formatProvider, positionProvider, index);
    }
    element.resetSettings();
    element.currentLabelsFactory(stateFactory);
    element.setSettings(pointOverride, statePointOverride);
    element['width'](bounds.width);
    element['height'](bounds.height);
    element['clip'](bounds);
    element.draw();
  } else {
    mainFactory.clear(index);
  }
};


/**
 * Prepares labels to be drawn.
 * @param {acgraph.vector.ILayer} root
 * @param {anychart.math.Rect} bounds
 */
anychart.resourceModule.Activities.prototype.prepareLabels = function(root, bounds) {
  var factory = /** @type {anychart.core.ui.LabelsFactory} */(this.normal_.labels());
  factory.suspendSignalsDispatching();
  if (!this.labelsRoot_) {
    this.labelsRoot_ = acgraph.layer();
    this.labelsRoot_.zIndex(4).parent(root);
    this.clip_ = acgraph.clip();
    this.labelsRoot_.clip(this.clip_);
  }
  // var stateFactoriesEnabled = /** @type {boolean} */(this.hoverLabels().enabled() || /** @type {anychart.core.ui.LabelsFactory} */(this.selectLabels()).enabled());
  factory.container(this.labelsRoot_);
  factory.clear();
  factory.parentBounds(bounds);
  factory.setAutoZIndex(0);
  this.clip_.shape(bounds);
};


/**
 * Finalizes labels drawing.
 */
anychart.resourceModule.Activities.prototype.drawLabels = function() {
  var factory = /** @type {anychart.core.ui.LabelsFactory} */(this.normal_.labels());
  factory.draw();
  var layer = factory.getRootLayer();
  if (layer)
    layer.disablePointerEvents(true);
  factory.resumeSignalsDispatching(false);
  this.markConsistent(anychart.ConsistencyState.APPEARANCE);
};


//endregion
//region --- Descriptors
//------------------------------------------------------------------------------
//
//  Descriptors
//
//------------------------------------------------------------------------------
/**
 * These descriptors are used to parse passed data object.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.resourceModule.Activities.DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};
  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'color',
      anychart.core.settings.colorNormalizer);

  return map;
})();
anychart.core.settings.populate(anychart.resourceModule.Activities, anychart.resourceModule.Activities.DESCRIPTORS);


//endregion
//region --- Color resolution
//----------------------------------------------------------------------------------------------------------------------
//
//  Color resolution
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Series cache of resolver functions.
 * @type {Object.<string, function(anychart.resourceModule.Activities, Object, anychart.resourceModule.Resource.ActivityInterval, number):acgraph.vector.AnyColor>}
 * @private
 */
anychart.resourceModule.Activities.colorResolversCache_ = {};


/**
 * Returns a color resolver for passed color names and type.
 * @param {(string|null|boolean)} colorName
 * @param {anychart.enums.ColorType} colorType
 * @param {boolean} canBeHoveredSelected Whether need to resolve hovered selected colors
 * @return {function(anychart.resourceModule.Activities, Object, anychart.resourceModule.Resource.ActivityInterval, number):acgraph.vector.AnyColor}
 */
anychart.resourceModule.Activities.getColorResolver = function(colorName, colorType, canBeHoveredSelected) {
  if (!colorName) return anychart.resourceModule.Activities.getNullColor_;
  var hash = colorType + '|' + colorName + '|' + canBeHoveredSelected;
  var result = anychart.resourceModule.Activities.colorResolversCache_[hash];
  if (!result) {
    /** @type {!Function} */
    var normalizerFunc;
    switch (colorType) {
      case anychart.enums.ColorType.STROKE:
        normalizerFunc = anychart.core.settings.strokeOrFunctionSimpleNormalizer;
        break;
      case anychart.enums.ColorType.HATCH_FILL:
        normalizerFunc = anychart.core.settings.hatchFillOrFunctionSimpleNormalizer;
        break;
      default:
      case anychart.enums.ColorType.FILL:
        normalizerFunc = anychart.core.settings.fillOrFunctionSimpleNormalizer;
        break;
    }
    anychart.resourceModule.Activities.colorResolversCache_[hash] = result = goog.partial(anychart.resourceModule.Activities.getColor_,
        colorName, normalizerFunc, colorType == anychart.enums.ColorType.HATCH_FILL, canBeHoveredSelected);
  }
  return result;
};


/**
 * Returns final color or hatch fill for passed params.
 * @param {string} colorName
 * @param {!Function} normalizer
 * @param {boolean} isHatchFill
 * @param {boolean} canBeHoveredSelected
 * @param {anychart.resourceModule.Activities} self
 * @param {Object} dataObj
 * @param {anychart.resourceModule.Resource.ActivityInterval} interval
 * @param {number} state
 * @return {acgraph.vector.Fill|acgraph.vector.Stroke|acgraph.vector.PatternFill}
 * @private
 */
anychart.resourceModule.Activities.getColor_ = function(colorName, normalizer, isHatchFill, canBeHoveredSelected, self, dataObj, interval, state) {
  var stateColor, context;
  state = anychart.core.utils.InteractivityState.clarifyState(state);
  if (state != anychart.PointState.NORMAL && canBeHoveredSelected) {
    stateColor = self.resolveOption(colorName, state, dataObj, normalizer);
    if (isHatchFill && stateColor === true)
      stateColor = anychart.resourceModule.Activities.DEFAULT_HATCH_FILL;
    if (goog.isDef(stateColor)) {
      if (!goog.isFunction(stateColor))
        return /** @type {acgraph.vector.Fill|acgraph.vector.Stroke|acgraph.vector.PatternFill} */(stateColor);
      else if (isHatchFill) { // hatch fills set as function some why cannot nest by initial implementation
        context = self.getHatchFillResolutionContext(interval, dataObj);
        return /** @type {acgraph.vector.PatternFill} */(normalizer(stateColor.call(context, context)));
      }
    }
  }
  // we can get here only if state color is undefined or is a function
  var color = self.resolveOption(colorName, 0, dataObj, normalizer);
  if (isHatchFill && color === true)
    color = anychart.resourceModule.Activities.DEFAULT_HATCH_FILL;
  if (goog.isFunction(color)) {
    context = isHatchFill ?
        self.getHatchFillResolutionContext(interval, dataObj) :
        self.getColorResolutionContext(interval, dataObj);
    color = /** @type {acgraph.vector.Fill|acgraph.vector.Stroke|acgraph.vector.PatternFill} */(normalizer(color.call(context, context)));
  }
  if (stateColor) { // it is a function and not a hatch fill here
    context = self.getColorResolutionContext(interval, dataObj, /** @type {acgraph.vector.Fill|acgraph.vector.Stroke} */(color));
    color = normalizer(stateColor.call(context, context));
  }
  return /** @type {acgraph.vector.Fill|acgraph.vector.Stroke|acgraph.vector.PatternFill} */(color);
};


/**
 * Returns normalized null stroke or fill.
 * @return {string}
 * @private
 */
anychart.resourceModule.Activities.getNullColor_ = function() {
  return 'none';
};


/**
 * Returns color resolution context.
 * This context is used to resolve a fill or stroke set as a function for current interval.
 * @param {anychart.resourceModule.Resource.ActivityInterval} interval
 * @param {Object} dataObj
 * @param {(acgraph.vector.Fill|acgraph.vector.Stroke)=} opt_baseColor
 * @return {Object}
 */
anychart.resourceModule.Activities.prototype.getColorResolutionContext = function(interval, dataObj, opt_baseColor) {
  var source = opt_baseColor || this.getOption('color') || anychart.resourceModule.Activities.DEFAULT_COLOR;
  return {
    'sourceColor': source,
    'start': interval.start,
    'end': interval.end,
    'minutesPerDay': interval.minutesPerDay,
    'activityName': dataObj['name'],
    'activityInfo': dataObj
  };
};


/**
 * Returns hatch fill resolution context.
 * This context is used to resolve a hatch fill set as a function for current interval.
 * @param {anychart.resourceModule.Resource.ActivityInterval} interval
 * @param {Object} dataObj
 * @return {Object}
 */
anychart.resourceModule.Activities.prototype.getHatchFillResolutionContext = function(interval, dataObj) {
  var source = anychart.resourceModule.Activities.DEFAULT_HATCH_FILL;
  return {
    'sourceHatchFill': source,
    'start': interval.start,
    'end': interval.end,
    'minutesPerDay': interval.minutesPerDay,
    'activityName': dataObj['name'],
    'activityInfo': dataObj
  };
};


/**
 * Resolves stroke.
 * @param {Object} dataObj
 * @param {anychart.resourceModule.Resource.ActivityInterval} interval
 * @param {anychart.PointState|number} state
 * @return {acgraph.vector.Stroke}
 */
anychart.resourceModule.Activities.prototype.resolveStroke = function(dataObj, interval, state) {
  if (!this.strokeResolver_)
    this.strokeResolver_ = anychart.resourceModule.Activities.getColorResolver('stroke', anychart.enums.ColorType.STROKE, true);
  return /** @type {acgraph.vector.Stroke} */(this.strokeResolver_(this, dataObj, interval, state));
};


/**
 * Resolves fill.
 * @param {Object} dataObj
 * @param {anychart.resourceModule.Resource.ActivityInterval} interval
 * @param {anychart.PointState|number} state
 * @return {acgraph.vector.Fill}
 */
anychart.resourceModule.Activities.prototype.resolveFill = function(dataObj, interval, state) {
  if (!this.fillResolver_)
    this.fillResolver_ = anychart.resourceModule.Activities.getColorResolver('fill', anychart.enums.ColorType.FILL, true);
  return /** @type {acgraph.vector.Fill} */(this.fillResolver_(this, dataObj, interval, state));
};


/**
 * Resolves hatchFill.
 * @param {Object} dataObj
 * @param {anychart.resourceModule.Resource.ActivityInterval} interval
 * @param {anychart.PointState|number} state
 * @return {acgraph.vector.HatchFill}
 */
anychart.resourceModule.Activities.prototype.resolveHatchFill = function(dataObj, interval, state) {
  if (!this.hatchFillResolver_)
    this.hatchFillResolver_ = anychart.resourceModule.Activities.getColorResolver('hatchFill', anychart.enums.ColorType.HATCH_FILL, true);
  return /** @type {acgraph.vector.HatchFill} */(this.hatchFillResolver_(this, dataObj, interval, state));
};


//endregion
//region --- IObjectWithSettings overrides
//----------------------------------------------------------------------------------------------------------------------
//
//  --- IObjectWithSettings overrides
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.resourceModule.Activities.prototype.hasOwnOption = function(name) {
  return goog.isDefAndNotNull(this.ownSettings[name]);
};


/**
 * Returns proper settings due to the state.
 * @param {string} name
 * @param {number} state
 * @param {Object} dataObj
 * @param {Function} normalizer
 * @return {*}
 */
anychart.resourceModule.Activities.prototype.resolveOption = function(name, state, dataObj, normalizer) {
  var stateObject = /** @type {anychart.core.StateSettings} */ (state == 0 ? this.normal_ : state == 1 ? this.hovered_ : this.selected_);
  var stateName = state == 0 ? 'normal' : state == 1 ? 'hovered' : 'selected';
  var dataObjState = dataObj[stateName];
  var dataObjStateVal = dataObjState ? dataObjState[name] : void 0;
  var val = dataObjStateVal || dataObj[anychart.color.getPrefixedColorName(state, name)];
  if (goog.isDef(val)) {
    val = normalizer(val);
  } else {
    val = stateObject.getOwnOption(name);
    if (!goog.isDefAndNotNull(val)) {
      val = stateObject.getThemeOption(name);
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
anychart.resourceModule.Activities.prototype.serialize = function() {
  var json = anychart.resourceModule.Activities.base(this, 'serialize');
  anychart.core.settings.serialize(this, anychart.resourceModule.Activities.DESCRIPTORS, json, 'Activities');
  json['normal'] = this.normal_.serialize();
  json['hovered'] = this.hovered_.serialize();
  json['selected'] = this.selected_.serialize();
  return json;
};


/** @inheritDoc */
anychart.resourceModule.Activities.prototype.setupByJSON = function(config, opt_default) {
  anychart.resourceModule.Activities.base(this, 'setupByJSON', config);
  anychart.core.settings.deserialize(this, anychart.resourceModule.Activities.DESCRIPTORS, config);
  this.normal_.setupInternal(!!opt_default, config);
  this.normal_.setupInternal(!!opt_default, config['normal']);
  this.hovered_.setupInternal(!!opt_default, config['hovered']);
  this.selected_.setupInternal(!!opt_default, config['selected']);
};


/** @inheritDoc */
anychart.resourceModule.Activities.prototype.disposeInternal = function() {
  this.strokeResolver_ = this.fillResolver_ = this.hatchFillResolver_ = null;
  goog.disposeAll(this.normal_, this.hovered_, this.selected_, this.clip_);
  this.normal_ = null;
  this.hovered_ = null;
  this.selected_ = null;
  this.clip_ = null;
  anychart.resourceModule.Activities.base(this, 'disposeInternal');
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
  var proto = anychart.resourceModule.Activities.prototype;
  //proto['color'] = proto.color;
  proto['normal'] = proto.normal;
  proto['hovered'] = proto.hovered;
  proto['selected'] = proto.selected;
})();


//endregion
