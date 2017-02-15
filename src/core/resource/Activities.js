goog.provide('anychart.core.resource.Activities');
goog.require('anychart.core.Base');
goog.require('anychart.core.settings');
goog.require('anychart.core.ui.LabelsFactory');
goog.require('anychart.core.utils.GenericContextProvider');
goog.require('anychart.enums');



/**
 * Activity settings representation class.
 * @param {anychart.charts.Resource} chart
 * @constructor
 * @extends {anychart.core.Base}
 * @implements {anychart.core.settings.IObjectWithSettings}
 */
anychart.core.resource.Activities = function(chart) {
  anychart.core.resource.Activities.base(this, 'constructor');

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
   * Fill resolver.
   * @type {?function(anychart.core.resource.Activities, Object, anychart.core.resource.Resource.ActivityInterval, number):acgraph.vector.AnyColor}
   * @private
   */
  this.fillResolver_ = null;

  /**
   * Stroke resolver.
   * @type {?function(anychart.core.resource.Activities, Object, anychart.core.resource.Resource.ActivityInterval, number):acgraph.vector.AnyColor}
   * @private
   */
  this.strokeResolver_ = null;

  /**
   * HatchFill resolver.
   * @type {?function(anychart.core.resource.Activities, Object, anychart.core.resource.Resource.ActivityInterval, number):acgraph.vector.AnyColor}
   * @private
   */
  this.hatchFillResolver_ = null;
};
goog.inherits(anychart.core.resource.Activities, anychart.core.Base);


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
anychart.core.resource.Activities.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.ConsistencyState.APPEARANCE;


/**
 * Supported signals.
 * @type {number}
 */
anychart.core.resource.Activities.prototype.SUPPORTED_SIGNALS =
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
anychart.core.resource.Activities.DEFAULT_HATCH_FILL = acgraph.vector.normalizeHatchFill(acgraph.vector.HatchFill.HatchFillType.DIAGONAL_BRICK);


/**
 * Default color.
 * @type {string}
 */
anychart.core.resource.Activities.DEFAULT_COLOR = 'blue';


//endregion
//region --- Labels
//----------------------------------------------------------------------------------------------------------------------
//
//  --- Labels
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter/setter for labels.
 * @param {(Object|boolean|null|string)=} opt_value Series data labels settings.
 * @return {!(anychart.core.ui.LabelsFactory|anychart.core.resource.Activities)} Labels instance or itself for chaining call.
 */
anychart.core.resource.Activities.prototype.labels = function(opt_value) {
  if (!this.labels_) {
    this.labels_ = new anychart.core.ui.LabelsFactory();
    this.labels_.setParentEventTarget(this.chart_);
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
 * Getter/setter for hoverLabels.
 * @param {(Object|boolean|null|string)=} opt_value Series data labels settings.
 * @return {!(anychart.core.ui.LabelsFactory|anychart.core.resource.Activities)} Labels instance or itself for chaining call.
 */
anychart.core.resource.Activities.prototype.hoverLabels = function(opt_value) {
  if (!this.hoverLabels_) {
    this.hoverLabels_ = new anychart.core.ui.LabelsFactory();
    // don't listen to it, for it will be reapplied at the next hover
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
 * @param {(Object|boolean|null|string)=} opt_value Series data labels settings.
 * @return {!(anychart.core.ui.LabelsFactory|anychart.core.resource.Activities)} Labels instance or itself for chaining call.
 */
anychart.core.resource.Activities.prototype.selectLabels = function(opt_value) {
  if (!this.selectLabels_) {
    this.selectLabels_ = new anychart.core.ui.LabelsFactory();
    // don't listen to it, for it will be reapplied at the next hover
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
 * @param {anychart.SignalEvent} event Invalidation event.
 * @private
 */
anychart.core.resource.Activities.prototype.labelsInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Creates label format provider
 * @param {anychart.core.resource.Resource.ActivityInterval} interval
 * @param {Object} dataObj
 * @return {Object}
 */
anychart.core.resource.Activities.prototype.createFormatProvider = function(interval, dataObj) {
  return new anychart.core.utils.GenericContextProvider({
    'start': interval.start,
    'end': interval.end,
    'minutesPerDay': interval.minutesPerDay,
    'hoursPerDay': interval.minutesPerDay / 60,
    'hoursPerDayRounded': Math.ceil(interval.minutesPerDay / 30) / 2,
    'name': dataObj['name'] || 'Unnamed Activity',
    'activityName': dataObj['name'],
    'activityInfo': dataObj
  }, {
    'start': anychart.enums.TokenType.DATE_TIME,
    'end': anychart.enums.TokenType.DATE_TIME,
    'minutesPerDay': anychart.enums.TokenType.NUMBER,
    'hoursPerDay': anychart.enums.TokenType.NUMBER,
    'hoursPerDayRounded': anychart.enums.TokenType.NUMBER,
    'name': anychart.enums.TokenType.STRING,
    'activityName': anychart.enums.TokenType.STRING,
    'activityInfo': anychart.enums.TokenType.UNKNOWN
  });
};


/**
 * Draws a label for passed providers and index.
 * @param {number} index
 * @param {number|anychart.PointState} state
 * @param {*} formatProvider
 * @param {anychart.math.Rect} bounds
 * @param {Object} data
 */
anychart.core.resource.Activities.prototype.drawLabel = function(index, state, formatProvider, bounds, data) {
  var mainFactory = /** @type {anychart.core.ui.LabelsFactory} */(this.labels());
  var pointOverride = data['label'];
  var statePointOverride = undefined;
  if (state != anychart.PointState.NORMAL)
    statePointOverride = data[state == anychart.PointState.HOVER ? 'hoverLabel' : 'selectLabel'];

  var pointOverrideEnabled = pointOverride && goog.isDef(pointOverride['enabled']) ? pointOverride['enabled'] : null;
  var statePointOverrideEnabled = statePointOverride && goog.isDef(statePointOverride['enabled']) ? statePointOverride['enabled'] : null;

  var stateFactory = /** @type {anychart.core.ui.LabelsFactory} */((state == anychart.PointState.SELECT) ?
      this.selectLabels() :
      ((state == anychart.PointState.HOVER) ?
          this.hoverLabels() :
          null));

  var isDraw = goog.isNull(statePointOverrideEnabled) ? // has no state marker or null "enabled" in it ?
      (!stateFactory || goog.isNull(stateFactory.enabled())) ? // has no state stateFactory or null "enabled" in it ?
          goog.isNull(pointOverrideEnabled) ? // has no marker in point or null "enabled" in it ?
              mainFactory.enabled() :
              pointOverrideEnabled :
          stateFactory.enabled() :
      statePointOverrideEnabled;

  if (isDraw) {
    var position = (statePointOverride && statePointOverride['position']) ||
        (stateFactory && stateFactory.position()) ||
        (pointOverride && pointOverride['position']) ||
        mainFactory.position();
    var positionProvider = {'value': anychart.utils.getCoordinateByAnchor(bounds, position)};

    var element = mainFactory.getLabel(/** @type {number} */(index));
    if (element) {
      element.formatProvider(formatProvider);
      element.positionProvider(positionProvider);
    } else {
      element = mainFactory.add(formatProvider, positionProvider, index);
    }
    element.resetSettings();
    element.currentLabelsFactory(stateFactory || mainFactory);
    element.setSettings(pointOverride, statePointOverride);
    element.width(bounds.width);
    element.height(bounds.height);
    element.clip(bounds);
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
anychart.core.resource.Activities.prototype.prepareLabels = function(root, bounds) {
  var factory = /** @type {anychart.core.ui.LabelsFactory} */(this.labels());
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
anychart.core.resource.Activities.prototype.drawLabels = function() {
  var factory = /** @type {anychart.core.ui.LabelsFactory} */(this.labels());
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
anychart.core.resource.Activities.DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};
  map['color'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'color',
      anychart.core.settings.colorNormalizer,
      anychart.ConsistencyState.APPEARANCE,
      anychart.Signal.NEEDS_REDRAW);

  map['fill'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'fill',
      anychart.core.settings.fillOrFunctionNormalizer,
      anychart.ConsistencyState.APPEARANCE,
      anychart.Signal.NEEDS_REDRAW);
  map['hoverFill'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'hoverFill',
      anychart.core.settings.fillOrFunctionNormalizer,
      0,
      0);
  map['selectFill'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'selectFill',
      anychart.core.settings.fillOrFunctionNormalizer,
      0,
      0);

  map['stroke'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'stroke',
      anychart.core.settings.strokeOrFunctionNormalizer,
      anychart.ConsistencyState.APPEARANCE,
      anychart.Signal.NEEDS_REDRAW);
  map['hoverStroke'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'hoverStroke',
      anychart.core.settings.strokeOrFunctionNormalizer,
      0,
      0);
  map['selectStroke'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'selectStroke',
      anychart.core.settings.strokeOrFunctionNormalizer,
      0,
      0);

  map['hatchFill'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'hatchFill',
      anychart.core.settings.hatchFillOrFunctionNormalizer,
      anychart.ConsistencyState.APPEARANCE,
      anychart.Signal.NEEDS_REDRAW);
  map['hoverHatchFill'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'hoverHatchFill',
      anychart.core.settings.hatchFillOrFunctionNormalizer,
      0,
      0);
  map['selectHatchFill'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'selectHatchFill',
      anychart.core.settings.hatchFillOrFunctionNormalizer,
      0,
      0);

  return map;
})();
anychart.core.settings.populate(anychart.core.resource.Activities, anychart.core.resource.Activities.DESCRIPTORS);


//endregion
//region --- Color resolution
//----------------------------------------------------------------------------------------------------------------------
//
//  Color resolution
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Series cache of resolver functions.
 * @type {Object.<string, function(anychart.core.resource.Activities, Object, anychart.core.resource.Resource.ActivityInterval, number):acgraph.vector.AnyColor>}
 * @private
 */
anychart.core.resource.Activities.colorResolversCache_ = {};


/**
 * Returns a color resolver for passed color names and type.
 * @param {?Array.<string>} colorNames
 * @param {anychart.enums.ColorType} colorType
 * @return {function(anychart.core.resource.Activities, Object, anychart.core.resource.Resource.ActivityInterval, number):acgraph.vector.AnyColor}
 */
anychart.core.resource.Activities.getColorResolver = function(colorNames, colorType) {
  if (!colorNames) return anychart.core.resource.Activities.getNullColor_;
  var hash = colorType + '|' + colorNames.join('|');
  var result = anychart.core.resource.Activities.colorResolversCache_[hash];
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
    anychart.core.resource.Activities.colorResolversCache_[hash] = result = goog.partial(anychart.core.resource.Activities.getColor_,
        colorNames, normalizerFunc, colorType == anychart.enums.ColorType.HATCH_FILL);
  }
  return result;
};


/**
 * Returns final color or hatch fill for passed params.
 * @param {Array.<string>} colorNames
 * @param {!Function} normalizer
 * @param {boolean} isHatchFill
 * @param {anychart.core.resource.Activities} self
 * @param {Object} dataObj
 * @param {anychart.core.resource.Resource.ActivityInterval} interval
 * @param {number} state
 * @return {acgraph.vector.Fill|acgraph.vector.Stroke|acgraph.vector.PatternFill}
 * @private
 */
anychart.core.resource.Activities.getColor_ = function(colorNames, normalizer, isHatchFill, self, dataObj, interval, state) {
  var stateColor, context;
  state = anychart.core.utils.InteractivityState.clarifyState(state);
  if (state != anychart.PointState.NORMAL && colorNames.length > 1) {
    stateColor = self.resolveOption(colorNames[state], dataObj, normalizer);
    if (isHatchFill && stateColor === true)
      stateColor = anychart.core.resource.Activities.DEFAULT_HATCH_FILL;
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
  var color = self.resolveOption(colorNames[0], dataObj, normalizer);
  if (isHatchFill && color === true)
    color = anychart.core.resource.Activities.DEFAULT_HATCH_FILL;
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
anychart.core.resource.Activities.getNullColor_ = function() {
  return 'none';
};


/**
 * Returns color resolution context.
 * This context is used to resolve a fill or stroke set as a function for current interval.
 * @param {anychart.core.resource.Resource.ActivityInterval} interval
 * @param {Object} dataObj
 * @param {(acgraph.vector.Fill|acgraph.vector.Stroke)=} opt_baseColor
 * @return {Object}
 */
anychart.core.resource.Activities.prototype.getColorResolutionContext = function(interval, dataObj, opt_baseColor) {
  var source = opt_baseColor || this.getOption('color') || anychart.core.resource.Activities.DEFAULT_COLOR;
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
 * @param {anychart.core.resource.Resource.ActivityInterval} interval
 * @param {Object} dataObj
 * @return {Object}
 */
anychart.core.resource.Activities.prototype.getHatchFillResolutionContext = function(interval, dataObj) {
  var source = anychart.core.resource.Activities.DEFAULT_HATCH_FILL;
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
 * @param {anychart.core.resource.Resource.ActivityInterval} interval
 * @param {anychart.PointState|number} state
 * @return {acgraph.vector.Stroke}
 */
anychart.core.resource.Activities.prototype.resolveStroke = function(dataObj, interval, state) {
  if (!this.strokeResolver_)
    this.strokeResolver_ = anychart.core.resource.Activities.getColorResolver(
        ['stroke', 'hoverStroke', 'selectStroke'], anychart.enums.ColorType.STROKE);
  return /** @type {acgraph.vector.Stroke} */(this.strokeResolver_(this, dataObj, interval, state));
};


/**
 * Resolves fill.
 * @param {Object} dataObj
 * @param {anychart.core.resource.Resource.ActivityInterval} interval
 * @param {anychart.PointState|number} state
 * @return {acgraph.vector.Fill}
 */
anychart.core.resource.Activities.prototype.resolveFill = function(dataObj, interval, state) {
  if (!this.fillResolver_)
    this.fillResolver_ = anychart.core.resource.Activities.getColorResolver(
        ['fill', 'hoverFill', 'selectFill'], anychart.enums.ColorType.FILL);
  return /** @type {acgraph.vector.Fill} */(this.fillResolver_(this, dataObj, interval, state));
};


/**
 * Resolves hatchFill.
 * @param {Object} dataObj
 * @param {anychart.core.resource.Resource.ActivityInterval} interval
 * @param {anychart.PointState|number} state
 * @return {acgraph.vector.HatchFill}
 */
anychart.core.resource.Activities.prototype.resolveHatchFill = function(dataObj, interval, state) {
  if (!this.hatchFillResolver_)
    this.hatchFillResolver_ = anychart.core.resource.Activities.getColorResolver(
        ['hatchFill', 'hoverHatchFill', 'selectHatchFill'], anychart.enums.ColorType.HATCH_FILL);
  return /** @type {acgraph.vector.HatchFill} */(this.hatchFillResolver_(this, dataObj, interval, state));
};


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
anychart.core.resource.Activities.prototype.getOwnOption = function(name) {
  return this.settings[name];
};


/**
 * Returns true if the option value was set directly to the object.
 * @param {string} name
 * @return {boolean}
 */
anychart.core.resource.Activities.prototype.hasOwnOption = function(name) {
  return goog.isDefAndNotNull(this.settings[name]);
};


/**
 * Returns option value from the theme if any.
 * @param {string} name
 * @return {*}
 */
anychart.core.resource.Activities.prototype.getThemeOption = function(name) {
  return this.defaultSettings[name];
};


/**
 * Returns option value by priorities.
 * @param {string} name
 * @return {*}
 */
anychart.core.resource.Activities.prototype.getOption = function(name) {
  return goog.isDefAndNotNull(this.settings[name]) ? this.settings[name] : this.defaultSettings[name];
};


/**
 * Sets option value to the instance.
 * @param {string} name
 * @param {*} value
 */
anychart.core.resource.Activities.prototype.setOption = function(name, value) {
  this.settings[name] = value;
};


/**
 * Performs checks on the instance to determine whether the state should be invalidated after option change.
 * @param {number} flags
 * @return {boolean}
 */
anychart.core.resource.Activities.prototype.check = function(flags) {
  return true;
};


/**
 * Returns proper settings due to the state.
 * @param {string} name
 * @param {Object} dataObj
 * @param {Function} normalizer
 * @return {*}
 */
anychart.core.resource.Activities.prototype.resolveOption = function(name, dataObj, normalizer) {
  var val = dataObj[name];
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
anychart.core.resource.Activities.prototype.serialize = function() {
  var json = anychart.core.resource.Activities.base(this, 'serialize');
  anychart.core.settings.serialize(this, anychart.core.resource.Activities.DESCRIPTORS, json, 'Activities');
  json['labels'] = this.labels().serialize();
  return json;
};


/** @inheritDoc */
anychart.core.resource.Activities.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.resource.Activities.base(this, 'setupByJSON', config);
  anychart.core.settings.deserialize(this, anychart.core.resource.Activities.DESCRIPTORS, config);
  this.labels().setup(config['labels']);
};


/** @inheritDoc */
anychart.core.resource.Activities.prototype.disposeInternal = function() {
  this.settings = this.defaultSettings = this.strokeResolver_ = this.fillResolver_ = this.hatchFillResolver_ = null;
  goog.disposeAll(this.labels_, this.clip_);
  this.labels_ = this.clip_ = null;
  anychart.core.resource.Activities.base(this, 'disposeInternal');
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
  var proto = anychart.core.resource.Activities.prototype;
  //proto['color'] = proto.color;
  //proto['stroke'] = proto.stroke;
  //proto['hoverStroke'] = proto.hoverStroke;
  //proto['selectStroke'] = proto.selectStroke;
  //proto['fill'] = proto.fill;
  //proto['hoverFill'] = proto.hoverFill;
  //proto['selectFill'] = proto.selectFill;
  //proto['hatchFill'] = proto.hatchFill;
  //proto['hoverHatchFill'] = proto.hoverHatchFill;
  //proto['selectHatchFill'] = proto.selectHatchFill;
  proto['labels'] = proto.labels;
  proto['hoverLabels'] = proto.hoverLabels;
  proto['selectLabels'] = proto.selectLabels;
})();


//endregion
