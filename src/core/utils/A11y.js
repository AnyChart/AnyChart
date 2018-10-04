goog.provide('anychart.core.utils.A11y');
goog.provide('anychart.core.utils.ChartA11y');
goog.provide('anychart.core.utils.SeriesA11y');


goog.require('anychart.core.Base');
goog.require('goog.dom');



/**
 * Anychart accessibility class.
 * @param {anychart.core.Chart} chart - Related chart instance.
 * @constructor
 * @extends {anychart.core.Base}
 */
anychart.core.utils.A11y = function(chart) {
  anychart.core.utils.A11y.base(this, 'constructor');

  /**
   * Chart reference.
   * @type {anychart.core.Chart}
   * @protected
   */
  this.chart = chart;

  /**
   * Parent a11y.
   * We listen it to enable/disable current a11y by enabling/disabling parent a11y.
   * @type {anychart.core.utils.A11y}
   * @private
   */
  this.parentA11y_ = null;

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['enabled', 0, anychart.Signal.BOUNDS_CHANGED | anychart.Signal.NEEDS_REAPPLICATION],
    ['titleFormat', 0, anychart.Signal.NEEDS_REAPPLICATION]
  ]);
};
goog.inherits(anychart.core.utils.A11y, anychart.core.Base);


/**
 * @type {!Object<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.core.utils.A11y.PROPERTY_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  anychart.core.settings.createDescriptors(map, [
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'enabled', anychart.core.settings.booleanNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'titleFormat', anychart.core.settings.stringOrFunctionNormalizer]
  ]);
  return map;
})();
anychart.core.settings.populate(anychart.core.utils.A11y, anychart.core.utils.A11y.PROPERTY_DESCRIPTORS);


/**
 * Supported signals.
 * @type {number}
 */
anychart.core.utils.A11y.prototype.SUPPORTED_SIGNALS = anychart.core.Base.prototype.SUPPORTED_SIGNALS |
    anychart.Signal.NEEDS_REAPPLICATION |
    anychart.Signal.BOUNDS_CHANGED; //Note: literally this signal here means that a11y is enabled or disabled.


/**
 * Gets/sets parent a11y. See field's description.
 * @param {anychart.core.utils.A11y=} opt_value - Value to be set.
 * @return {?anychart.core.utils.A11y} - Current value or itself for method chaining.
 */
anychart.core.utils.A11y.prototype.parentA11y = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.parentA11y_ != opt_value) {
      if (this.parentA11y_)
        this.parentA11y_.unlistenSignals(this.onParentEnabled_, this);
      this.parentA11y_ = opt_value;
      this.parentA11y_.listenSignals(this.onParentEnabled_, this);
    }
    return this;
  }
  return this.parentA11y_;
};


/**
 * Parent a11y enable/disable handler.
 * @param {anychart.SignalEvent} event - Event object.
 * @private
 */
anychart.core.utils.A11y.prototype.onParentEnabled_ = function(event) {
  if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED)) this['enabled'](/** @type {boolean} */ (this.parentA11y_.getOption('enabled')));
};


/**
 * Applies changes made by child a11y.
 * @return {anychart.core.utils.A11y} - Itself for method chaining.
 */
anychart.core.utils.A11y.prototype.applyChangesInChildA11y = function() {
  this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
  return this;
};


/**
 * Applies accessibility settings.
 */
anychart.core.utils.A11y.prototype.applyA11y = goog.abstractMethod;


/**
 * Creates text info to apply a11y.
 * @return {Object} Text info object.
 */
anychart.core.utils.A11y.prototype.createTextInfo = goog.abstractMethod;


/** @inheritDoc */
anychart.core.utils.A11y.prototype.serialize = function() {
  var json = anychart.core.utils.A11y.base(this, 'serialize');
  anychart.core.settings.serialize(this, anychart.core.utils.A11y.PROPERTY_DESCRIPTORS, json);
  return json;
};


/** @inheritDoc */
anychart.core.utils.A11y.prototype.resolveSpecialValue = function(var_args) {
  var arg0 = arguments[0];
  if (goog.isBoolean(arg0) || goog.isNull(arg0)) {
    return {'enabled': !!arg0};
  } else if (goog.isFunction(arg0)) {
    return {'titleFormat': arg0};
  }
  return null;
};


/** @inheritDoc */
anychart.core.utils.A11y.prototype.setupSpecial = function(isDefault, var_args) {
  var resolvedValue = this.resolveSpecialValue(arguments[1]);
  if (resolvedValue) {
    if ('enabled' in resolvedValue)
      this['enabled'](resolvedValue['enabled']);
    if ('titleFormat' in resolvedValue)
      this['titleFormat'](resolvedValue['titleFormat']);
    return true;
  }
  return false;
};


/** @inheritDoc */
anychart.core.utils.A11y.prototype.setupByJSON = function(json, opt_default) {
  anychart.core.utils.A11y.base(this, 'setupByJSON', json, opt_default);

  anychart.core.settings.deserialize(this, anychart.core.utils.A11y.PROPERTY_DESCRIPTORS, json, opt_default);
};


/** @inheritDoc */
anychart.core.utils.A11y.prototype.disposeInternal = function() {
  this.chart = null;
  if (this.parentA11y_) {
    this.parentA11y_.applyChangesInChildA11y();
    this.parentA11y_.unlistenSignals(this.onParentEnabled_, this);
  }
  this.parentA11y_ = null;
  anychart.core.utils.A11y.base(this, 'disposeInternal');
};



//----------------------------------------------------------------------------------------------------------------------
//
//  Chart accessibility.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Anychart chart accessibility class.
 * @param {anychart.core.Chart} chart - Related chart instance.
 * @constructor
 * @extends {anychart.core.utils.A11y}
 */
anychart.core.utils.ChartA11y = function(chart) {
  anychart.core.utils.ChartA11y.base(this, 'constructor', chart);

  this.relatedHtmlTable_ = null;

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['mode', 0, anychart.Signal.NEEDS_REAPPLICATION]
  ]);
};
goog.inherits(anychart.core.utils.ChartA11y, anychart.core.utils.A11y);


/**
 * @type {!Object<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.core.utils.ChartA11y.PROPERTY_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  anychart.core.settings.createDescriptor(map, anychart.enums.PropertyHandlerType.SINGLE_ARG, 'mode', anychart.enums.normalizeA11yMode);
  return map;
})();
anychart.core.settings.populate(anychart.core.utils.ChartA11y, anychart.core.utils.ChartA11y.PROPERTY_DESCRIPTORS);


/** @inheritDoc */
anychart.core.utils.ChartA11y.prototype.createTextInfo = function() {
  return this.chart.createA11yContextProvider();
};


/**
 * @inheritDoc
 */
anychart.core.utils.ChartA11y.prototype.applyA11y = function() {
  var rootLayer = this.chart.getRootElement();
  rootLayer.attr('role', null);
  rootLayer.attr('aria-hidden', 'true');
  rootLayer.attr('aria-label', null);
  goog.dom.removeNode(this.relatedHtmlTable_);
  this.relatedHtmlTable_ = null;

  if (/** @type {boolean} */(this.getOption('enabled'))) {
    var titleText;
    var textInfo = this.createTextInfo();

    if (this.getOption('titleFormat')) {
      var formatter = this.getOption('titleFormat');
      if (goog.isString(formatter))
        formatter = anychart.core.utils.TokenParser.getInstance().getFormat(formatter);
      titleText = formatter.call(textInfo, textInfo);
    }

    var title = this.chart.getCreated('title');
    if (title && !titleText && title.getOption('text') && title.enabled())
      titleText = title.getOption('text');

    if (this.getOption('mode') == anychart.enums.A11yMode.DATA_TABLE) {
      this.relatedHtmlTable_ = /** @type {Element} */ (this.chart.toA11yTable(/** @type {string} */ (titleText)));
      var containerDiv = /** @type {Element} */ (this.chart.container().container());
      if (containerDiv)
        goog.dom.insertChildAt(containerDiv, this.relatedHtmlTable_, 0);
    } else if (titleText) {
      rootLayer.attr('aria-label', titleText);
      rootLayer.attr('aria-hidden', null);
      rootLayer.attr('role', 'article');
    }
  }
};


/** @inheritDoc */
anychart.core.utils.ChartA11y.prototype.serialize = function() {
  var json = anychart.core.utils.ChartA11y.base(this, 'serialize');
  anychart.core.settings.serialize(this, anychart.core.utils.ChartA11y.PROPERTY_DESCRIPTORS, json);
  return json;
};


/** @inheritDoc */
anychart.core.utils.ChartA11y.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.utils.ChartA11y.base(this, 'setupByJSON', config, opt_default);

  anychart.core.settings.deserialize(this, anychart.core.utils.ChartA11y.PROPERTY_DESCRIPTORS, config);
};


/** @inheritDoc */
anychart.core.utils.ChartA11y.prototype.disposeInternal = function() {
  goog.dom.removeNode(this.relatedHtmlTable_);
  this.relatedHtmlTable_ = null;
  anychart.core.utils.ChartA11y.base(this, 'disposeInternal');
};



//----------------------------------------------------------------------------------------------------------------------
//
//  Series accessibility.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Anychart series accessibility class.
 * @param {anychart.core.series.Base} series - Related series instance.
 * @constructor
 * @extends {anychart.core.utils.A11y}
 */
anychart.core.utils.SeriesA11y = function(series) {
  anychart.core.utils.SeriesA11y.base(this, 'constructor', series.getChart());

  /**
   * Series reference.
   * @type {anychart.core.series.Base}
   * @private
   */
  this.series_ = series;

  /**
   * Layer where to apply a11y.
   * Some of series don't have own layer. it means that we need to create this layer.
   * @type {acgraph.vector.Layer}
   * @private
   */
  this.forceLayer_ = null;
};
goog.inherits(anychart.core.utils.SeriesA11y, anychart.core.utils.A11y);


/**
 * @inheritDoc
 */
anychart.core.utils.SeriesA11y.prototype.applyA11y = function() {
  var titleText = null;
  var role = null;
  var layer = /** @type {acgraph.vector.Layer} */ (this.series_.getRootLayer() || this.forceLayer_);
  if (/** @type {boolean} */(this.getOption('enabled')) && /** @type {Function|string} */(this.getOption('titleFormat'))) {
    var textInfo = this.createTextInfo();
    var formatter = /** @type {Function|string} */(this.getOption('titleFormat'));
    if (goog.isString(formatter))
      formatter = anychart.core.utils.TokenParser.getInstance().getFormat(formatter);
    titleText = formatter.call(textInfo, textInfo);
    role = 'img';
  }

  if (!this.series_.hasOwnLayer() && !this.forceLayer_) {
    this.forceLayer_ = this.series_.getRootLayer().layer();
    layer = this.forceLayer_;
  }
  layer.attr('aria-label', titleText);
  layer.attr('role', role);
};


/** @inheritDoc */
anychart.core.utils.SeriesA11y.prototype.createTextInfo = function() {
  //TODO(AntonKagakin): Remove this method from series.Base
  //TODO(AntonKagakin): this method exists only because of SeriesBase rudiment.
  return this.series_.createA11yTextInfo();
};


/** @inheritDoc */
anychart.core.utils.SeriesA11y.prototype.disposeInternal = function() {
  goog.dispose(this.forceLayer_);
  this.series_ = null;
  anychart.core.utils.SeriesA11y.base(this, 'disposeInternal');
};


//exports
(function() {
  var proto = anychart.core.utils.ChartA11y.prototype;
  // auto generated
  // proto['enabled'] = proto.enabled;
  // proto['titleFormat'] = proto.titleFormat;
  // proto['mode'] = proto.mode;
  proto = anychart.core.utils.SeriesA11y.prototype;
  // auto generated
  // proto['enabled'] = proto.enabled;
  // proto['titleFormat'] = proto.titleFormat;
})();

