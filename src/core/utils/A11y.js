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
   * @type {boolean}
   * @private
   */
  this.enabled_ = true;

  /**
   * @type {Function|string}
   * @private
   */
  this.titleFormat_ = '';

  /**
   * Parent a11y.
   * We listen it to enable/disable current a11y by enabling/disabling parent a11y.
   * @type {anychart.core.utils.A11y}
   * @private
   */
  this.parentA11y_ = null;
};
goog.inherits(anychart.core.utils.A11y, anychart.core.Base);


/**
 * Supported signals.
 * @type {number}
 */
anychart.core.utils.A11y.prototype.SUPPORTED_SIGNALS = anychart.core.Base.prototype.SUPPORTED_SIGNALS |
    anychart.Signal.NEEDS_REAPPLICATION |
    anychart.Signal.BOUNDS_CHANGED; //Note: literally this signal here means that a11y is enabled or disabled.


/**
 * Turns on animations.
 * @param {boolean=} opt_value
 * @return {boolean|anychart.core.utils.A11y}
 */
anychart.core.utils.A11y.prototype.enabled = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.enabled_ != opt_value) {
      this.enabled_ = opt_value;
      this.dispatchSignal(anychart.Signal.BOUNDS_CHANGED | anychart.Signal.NEEDS_REAPPLICATION);
    }
    return this;
  } else {
    return this.enabled_;
  }
};


/**
 * Function to format title text.
 * @param {(Function|string)=} opt_value - Function to format content text.
 * @return {Function|string|anychart.core.utils.A11y} Function to format content text or itself for method chaining.
 * @deprecated Since 7.13.1. Use 'titleFormat' instead.
 */
anychart.core.utils.A11y.prototype.titleFormatter = function(opt_value) {
  anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null, ['titleFormatter', 'titleFormat'], true);
  return this.titleFormat(opt_value);
};


/**
 * Function to format title text.
 * @param {(Function|string)=} opt_value - Function to format content text.
 * @return {Function|string|anychart.core.utils.A11y} Function to format content text or itself for method chaining.
 */
anychart.core.utils.A11y.prototype.titleFormat = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.titleFormat_ != opt_value) {
      this.titleFormat_ = opt_value;
      this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
    }
    return this;
  } else {
    return this.titleFormat_;
  }
};


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
  if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED)) this.enabled(/** @type {boolean} */ (this.parentA11y_.enabled()));
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
  json['enabled'] = this.enabled_;

  if (goog.isFunction(this.titleFormat())) {
    anychart.core.reporting.warning(
        anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
        null,
        ['A11y titleFormat']
    );
  } else if (this.titleFormat_) {
    json['titleFormat'] = this.titleFormat_;
  }

  return json;
};


/**
 * Special objects to setup current instance.
 * @param {...(Object|Array|number|string|undefined|boolean|null)} var_args
 * @return {boolean} If passed values were recognized as special setup values.
 * @protected
 */
anychart.core.utils.A11y.prototype.setupSpecial = function(var_args) {
  var arg0 = arguments[0];
  if (goog.isBoolean(arg0) || goog.isNull(arg0)) {
    this.enabled(!!arg0);
    return true;
  } else if (goog.isFunction(arg0)) {
    this.titleFormat(arg0);
    return true;
  }

  return anychart.core.Base.prototype.setupSpecial.apply(this, arguments);
};


/**
 * @inheritDoc
 * @suppress {deprecated}
 */
anychart.core.utils.A11y.prototype.setupByJSON = function(json, opt_default) {
  anychart.core.utils.A11y.base(this, 'setupByJSON', json, opt_default);
  this.enabled('enabled' in json ? json['enabled'] : true);
  this.titleFormat(json['titleFormat']);
  if ('titleFormatter' in json)
    this.titleFormatter(json['titleFormatter']);
};


/**
 * @inheritDoc
 * @suppress {deprecated}
 */
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

  /**
   * A11y mode.
   * @type {anychart.enums.A11yMode}
   * @private
   */
  this.mode_ = anychart.enums.A11yMode.CHART_ELEMENTS;

  this.relatedHtmlTable_ = null;
};
goog.inherits(anychart.core.utils.ChartA11y, anychart.core.utils.A11y);


/** @inheritDoc */
anychart.core.utils.ChartA11y.prototype.createTextInfo = function() {
  return this.chart.createChartContextProvider();
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

  if (this.enabled()) {
    var titleText;
    var textInfo = this.createTextInfo();

    if (this.titleFormat_) {
      var formatter = this.titleFormat_;
      if (goog.isString(formatter))
        formatter = anychart.core.utils.TokenParser.getInstance().getFormat(formatter);
      titleText = formatter.call(textInfo, textInfo);
    }

    var title = this.chart.title();
    if (!titleText && title.getOption('text') && title.enabled())
      titleText = title.getOption('text');

    if (this.mode_ == anychart.enums.A11yMode.DATA_TABLE) {
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


/**
 * Gets/sets a11y mode.
 * @param {anychart.enums.A11yMode=} opt_value - Value to be set.
 * @return {anychart.enums.A11yMode|anychart.core.utils.ChartA11y} - Current value or itself for method chaining.
 */
anychart.core.utils.ChartA11y.prototype.mode = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var normalized = /** @type {anychart.enums.A11yMode} */ (anychart.enums.normalizeA11yMode(opt_value));
    if (this.mode_ != normalized) {
      this.mode_ = normalized;
      this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
    }
    return this;
  }
  return this.mode_;
};


/** @inheritDoc */
anychart.core.utils.ChartA11y.prototype.serialize = function() {
  var json = anychart.core.utils.ChartA11y.base(this, 'serialize');
  json['mode'] = this.mode_;
  return json;
};


/** @inheritDoc */
anychart.core.utils.ChartA11y.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.utils.ChartA11y.base(this, 'setupByJSON', config, opt_default);
  this.mode(config['mode']);
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
 * @param {anychart.core.series.Base|anychart.core.SeriesBase} series - Related series instance.
 * @constructor
 * @extends {anychart.core.utils.A11y}
 */
anychart.core.utils.SeriesA11y = function(series) {
  anychart.core.utils.SeriesA11y.base(this, 'constructor', series.getChart());

  /**
   * Series reference.
   * @type {anychart.core.series.Base|anychart.core.SeriesBase}
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
  if (this.enabled() && this.titleFormat()) {
    var textInfo = this.createTextInfo();
    var formatter = this.titleFormat();
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
/**
 * @suppress {deprecated}
 */
(function() {
  var proto = anychart.core.utils.ChartA11y.prototype;
  proto['enabled'] = proto.enabled;
  proto['titleFormat'] = proto.titleFormat;
  proto['titleFormatter'] = proto.titleFormatter;
  proto['mode'] = proto.mode;

  proto = anychart.core.utils.SeriesA11y.prototype;
  proto['enabled'] = proto.enabled;
  proto['titleFormat'] = proto.titleFormat;
  proto['titleFormatter'] = proto.titleFormatter;
})();

