//region --- Require and Provide
goog.provide('anychart.stockModule.CurrentPriceIndicator');
goog.require('acgraph');
goog.require('anychart.core.VisualBase');
goog.require('anychart.core.ui.LabelsFactory');
goog.require('anychart.format.Context');
//endregion



/**
 * Stock current price indicator class.
 * @constructor
 * @extends {anychart.core.VisualBase}
 */
anychart.stockModule.CurrentPriceIndicator = function() {
  anychart.stockModule.CurrentPriceIndicator.base(this, 'constructor');

  /**
   * @type {anychart.stockModule.Plot}
   * @private
   */
  this.plot_ = null;

  /**
   * @type {anychart.core.ui.LabelsFactory}
   * @private
   */
  this.mainLabel_ = null;

  /**
   * @type {anychart.core.ui.LabelsFactory}
   * @private
   */
  this.risingLabel_ = null;

  /**
   * @type {anychart.core.ui.LabelsFactory}
   * @private
   */
  this.fallingLabel_ = null;

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['value', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW],
    ['valueField', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW],
    ['stroke', anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW],
    ['fallingStroke', anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW],
    ['risingStroke', anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW]
  ]);
};
goog.inherits(anychart.stockModule.CurrentPriceIndicator, anychart.core.VisualBase);


//region --- Signals and States
/**
 * Supported consistency states.
 * @type {number}
 */
anychart.stockModule.CurrentPriceIndicator.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.VisualBase.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.APPEARANCE |
    anychart.ConsistencyState.STOCK_PRICE_INDICATOR_LABEL |
    anychart.ConsistencyState.STOCK_PRICE_INDICATOR_SERIES;


/**
 * Supported signals.
 * @type {number}
 */
anychart.stockModule.CurrentPriceIndicator.prototype.SUPPORTED_SIGNALS = anychart.core.VisualBase.prototype.SUPPORTED_SIGNALS;


//endregion
//region --- Descriptors
/**
 * Simple properties descriptors.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.stockModule.CurrentPriceIndicator.prototype.SIMPLE_PROPS_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'value',
      anychart.enums.normalizeDataSource);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'valueField',
      anychart.core.settings.asIsNormalizer);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'stroke',
      anychart.core.settings.strokeNormalizer);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'risingStroke',
      anychart.core.settings.strokeNormalizer);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'fallingStroke',
      anychart.core.settings.strokeNormalizer);

  return map;
})();
anychart.core.settings.populate(anychart.stockModule.CurrentPriceIndicator, anychart.stockModule.CurrentPriceIndicator.prototype.SIMPLE_PROPS_DESCRIPTORS);


//endregion
//region --- Infrastructure
/**
 * Sets plot.
 * @param {anychart.stockModule.Plot} value .
 */
anychart.stockModule.CurrentPriceIndicator.prototype.setPlot = function(value) {
  this.plot_ = value;
};


/**
 * Create line.
 * @return {acgraph.vector.Path}
 * @protected
 */
anychart.stockModule.CurrentPriceIndicator.prototype.getLine = function() {
  return this.line ? this.line : this.line = /** @type {acgraph.vector.Element} */(acgraph.path()).zIndex(0).parent(this.rootLayer);
};


//endregion
//region --- Utils
/**
 * @param {anychart.core.ui.LabelsFactory.Label} label
 * @return {boolean}
 */
anychart.stockModule.CurrentPriceIndicator.prototype.isLabelAnchorLeft = function(label) {
  var anchor = /** @type {anychart.enums.Anchor} */(label.getOption('anchor'));
  return anchor == anychart.enums.Anchor.LEFT_TOP ||
      anchor == anychart.enums.Anchor.LEFT_CENTER ||
      anchor == anychart.enums.Anchor.LEFT_BOTTOM;
};


/**
 * Gets format provider for label.
 * @param {anychart.stockModule.Series} series
 * @param {anychart.core.Axis} axis
 * @param {number} ratio
 * @return {Object} Labels format provider.
 * @protected
 */
anychart.stockModule.CurrentPriceIndicator.prototype.getLabelsFormatProvider = function(series, axis, ratio) {
  if (!axis) return null;

  var scale = axis.scale();
  var scaleType = scale.getType();
  var scaleValue = scale.inverseTransform(ratio);

  var labelText;
  var labelType = anychart.enums.TokenType.NUMBER;
  switch (scaleType) {
    case anychart.enums.ScaleTypes.LINEAR:
    case anychart.enums.ScaleTypes.LOG:
      labelText = scaleValue;
      break;
    case anychart.enums.ScaleTypes.ORDINAL:
      labelText = String(scaleValue);
      labelType = anychart.enums.TokenType.STRING;
      break;
    case anychart.enums.ScaleTypes.STOCK_SCATTER_DATE_TIME:
    case anychart.enums.ScaleTypes.STOCK_ORDINAL_DATE_TIME:
    case anychart.enums.ScaleTypes.DATE_TIME:
      labelText = anychart.format.date(/** @type {Date|number} */ (scaleValue));
      labelType = anychart.enums.TokenType.STRING; // date already formatted
      break;
  }

  var values = {
    'series': {value: series, type: anychart.enums.TokenType.UNKNOWN},
    'axis': {value: axis, type: anychart.enums.TokenType.UNKNOWN},
    'value': {value: labelText, type: labelType},
    'tickValue': {value: scaleValue, type: anychart.enums.TokenType.NUMBER},
    'scale': {value: scale, type: anychart.enums.TokenType.UNKNOWN}
  };

  var context = series.updateContext(new anychart.format.Context(), this.row_);
  return context.propagate(goog.object.extend(context.contextValues(), values));
};


/**
 * Returns label position provider.
 * @param {anychart.core.Axis} axis .
 * @param {number} y .
 * @return {!Object}
 */
anychart.stockModule.CurrentPriceIndicator.prototype.getLabelPositionProvider = function(axis, y) {
  var plotBounds = this.plot_.getPlotBounds();
  var axisBounds = axis.getPixelBounds();
  var axisEnabled = axis.enabled();
  var left = axisEnabled ? axisBounds.getLeft() : plotBounds.getRight();
  var right = axisEnabled ? axisBounds.getRight() : plotBounds.getLeft();

  var x;
  switch (axis.getOption('orientation')) {
    case anychart.enums.Orientation.LEFT:
      x = this.isLabelAnchorLeft(this.label_) ? right : right;
      break;
    case anychart.enums.Orientation.RIGHT:
      x = this.isLabelAnchorLeft(this.label_) ? left : left;
      break;
  }

  if (!(y >= plotBounds.getTop() && y <= plotBounds.getBottom())) {
    x = y = NaN;
  }

  return {'value': {'x': x, 'y': y}};
};


//endregion
//region --- API
/**
 * Label.
 * @param {(Object|boolean|null)=} opt_value
 * @return {anychart.core.ui.LabelsFactory|anychart.stockModule.CurrentPriceIndicator}
 */
anychart.stockModule.CurrentPriceIndicator.prototype.label = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.mainLabel_.setup(opt_value);
    return this;
  } else {
    return this.mainLabel_;
  }
};


/**
 * Falling label.
 * @param {(Object|boolean|null)=} opt_value
 * @return {anychart.core.ui.LabelsFactory|anychart.stockModule.CurrentPriceIndicator}
 */
anychart.stockModule.CurrentPriceIndicator.prototype.fallingLabel = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.fallingLabel_.setup(opt_value);
    return this;
  } else {
    return this.fallingLabel_;
  }
};


/**
 * Rising label.
 * @param {(Object|boolean|null)=} opt_value
 * @return {anychart.core.ui.LabelsFactory|anychart.stockModule.CurrentPriceIndicator}
 */
anychart.stockModule.CurrentPriceIndicator.prototype.risingLabel = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.risingLabel_.setup(opt_value);
    return this;
  } else {
    return this.risingLabel_;
  }
};


/**
 * Label invalidation handler.
 * @param {anychart.SignalEvent} e
 * @private
 */
anychart.stockModule.CurrentPriceIndicator.prototype.labelInvalidated_ = function(e) {
  this.invalidate(anychart.ConsistencyState.BOUNDS | anychart.ConsistencyState.STOCK_PRICE_INDICATOR_LABEL,
      anychart.Signal.NEEDS_REDRAW);
};


/**
 * Target series.
 * @param {(string|number|anychart.stockModule.Series)=} opt_value .
 * @return {anychart.stockModule.Series|anychart.stockModule.CurrentPriceIndicator}
 */
anychart.stockModule.CurrentPriceIndicator.prototype.series = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var seriesId = opt_value;
    if (goog.isNumber(opt_value))
      opt_value = this.plot_.getSeriesAt(opt_value);
    else if (goog.isString(opt_value))
      opt_value = this.plot_.getSeries(opt_value);

    if (this.series_ !== opt_value) {
      this.seriesId_ = seriesId;
      this.series_ = opt_value;
      this.invalidate(anychart.ConsistencyState.STOCK_PRICE_INDICATOR_SERIES | anychart.ConsistencyState.BOUNDS | anychart.ConsistencyState.CONTAINER,
          anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.series_;
};


/**
 * Target axis.
 * @param {(number|anychart.core.Axis)=} opt_value .
 * @return {anychart.core.Axis|anychart.stockModule.CurrentPriceIndicator} .
 */
anychart.stockModule.CurrentPriceIndicator.prototype.axis = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var axisIndex = +opt_value;
    if (goog.isNumber(opt_value))
      opt_value = /** @type {anychart.core.Axis} */(this.plot_.yAxis(opt_value));
    if (this.axis_ !== opt_value) {
      this.axisIndex_ = axisIndex;
      this.axis_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.axis_;
};


//endregion
//region --- Drawing
/**
 * Removing.
 */
anychart.stockModule.CurrentPriceIndicator.prototype.remove = function() {
  this.rootLayer.parent(null);
  this.invalidate(anychart.ConsistencyState.CONTAINER);
};


/**
 * Drawing.
 * @return {anychart.stockModule.CurrentPriceIndicator}
 */
anychart.stockModule.CurrentPriceIndicator.prototype.draw = function() {
  if (!this.checkDrawingNeeded())
    return this;

  if (!this.rootLayer)
    this.rootLayer = acgraph.layer();

  var labelFormatProvider, seriesValue, isSeriesOHLCBased;
  var series = this.series_ || this.plot_.getSeriesAt(0);
  if (series && !series.isDisposed()) {
    var fieldValue = this.getOption('valueField') || series.drawer.valueFieldName;
    isSeriesOHLCBased = !!(series.drawer.flags & anychart.core.drawers.Capabilities.IS_OHLC_BASED);
    this.row_ = series.getSelectableData().getRowByDataSource(this.getOption('value'), fieldValue);
    seriesValue = this.row_ ? this.row_.get(fieldValue) : null;
  }

  this.markConsistent(anychart.ConsistencyState.STOCK_PRICE_INDICATOR_SERIES);

  if (!seriesValue) {
    this.remove();
    return this;
  }

  var line = this.getLine();
  var stroke = /** @type {acgraph.vector.Stroke} */(this.getOption('stroke'));

  var axis = this.axis_ || this.plot_.yAxis(0);
  var yScale = axis.scale();

  var yRatio = yScale.transform(seriesValue);
  var plotBounds = this.plot_.getPlotBounds();

  var stateLF;
  if (isSeriesOHLCBased) {
    var risingStroke = /** @type {acgraph.vector.Stroke} */(this.getOption('risingStroke'));
    var fallingStroke = /** @type {acgraph.vector.Stroke} */(this.getOption('fallingStroke'));

    var openValue = this.row_.get('open');
    var closeValue = this.row_.get('close');

    var rising = closeValue > openValue;
    if (rising) {
      stroke = risingStroke ? risingStroke : stroke;
      stateLF = this.risingLabel_;
    } else {
      stroke = fallingStroke ? fallingStroke : stroke;
      stateLF = this.fallingLabel_;
    }
  }

  var thickness = /** @type {number} */(acgraph.vector.getThickness(/** @type {acgraph.vector.Stroke} */(stroke)) || 1);

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    var container = /** @type {acgraph.vector.ILayer} */(this.container());
    this.rootLayer.parent(container);

    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    var zIndex = /** @type {number} */(this.zIndex());
    this.rootLayer.zIndex(zIndex);

    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    var y = plotBounds.getBottom() - yRatio * plotBounds.height;
    y = anychart.utils.applyPixelShift(y, thickness);

    line.clear();
    line
        .moveTo(plotBounds.left, y)
        .lineTo(plotBounds.getRight(), y);
    line.clip(this.plot_.getPlotBounds());
    line.parent(/** @type {acgraph.vector.ILayer} */(this.rootLayer));

    if (this.label_.getFinalSettings('enabled')) {
      var labelPositionProvider = this.getLabelPositionProvider(axis, y);

      if (isNaN(labelPositionProvider['value']['x'])) {
        this.labelDisabled = true;
        this.label_.clear();
      } else {
        if (this.labelDisabled || isSeriesOHLCBased) {
          this.invalidate(anychart.ConsistencyState.STOCK_PRICE_INDICATOR_LABEL);
          this.labelDisabled = false;
        }
        labelFormatProvider = this.getLabelsFormatProvider(series, axis, yRatio);
        this.label_.formatProvider(labelFormatProvider);
        this.mainLabel_.dropCallsCache();
        this.label_.positionProvider(labelPositionProvider);
        this.label_.autoAnchor(axis.getOption('orientation') == anychart.enums.Orientation.LEFT ? anychart.enums.Anchor.RIGHT_CENTER : anychart.enums.Anchor.LEFT_CENTER);
      }
    } else {
      this.label_.clear();
      this.labelDisabled = true;
    }
    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.STOCK_PRICE_INDICATOR_LABEL)) {
    if (this.label_.getFinalSettings('enabled')) {
      labelFormatProvider = this.getLabelsFormatProvider(series, axis, yRatio);
      this.label_.formatProvider(labelFormatProvider);
      this.mainLabel_.dropCallsCache();
      this.label_.autoAnchor(axis.getOption('orientation') == anychart.enums.Orientation.LEFT ? anychart.enums.Anchor.RIGHT_CENTER : anychart.enums.Anchor.LEFT_CENTER);

      var labelStateOrder = [];
      if (isSeriesOHLCBased) {
        labelStateOrder.push(
            stateLF.ownSettings,
            this.mainLabel_.ownSettings,
            this.label_.autoSettings,
            this.mainLabel_.autoSettings,
            stateLF.themeSettings,
            this.mainLabel_.themeSettings);
      } else {
        labelStateOrder.push(
            this.mainLabel_.ownSettings,
            this.label_.autoSettings,
            this.mainLabel_.autoSettings,
            this.mainLabel_.themeSettings);
      }

      this.label_.stateOrder(labelStateOrder);
    } else {
      this.label_.clear();
      this.labelDisabled = true;
    }
    this.markConsistent(anychart.ConsistencyState.STOCK_PRICE_INDICATOR_LABEL);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    line.stroke(stroke);
    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }

  if (!this.labelDisabled) {
    this.label_.container(this.rootLayer);
    this.label_.draw();
  }

  this.mainLabel_.markConsistent(anychart.ConsistencyState.ALL);
  this.risingLabel_.markConsistent(anychart.ConsistencyState.ALL);
  this.fallingLabel_.markConsistent(anychart.ConsistencyState.ALL);

  return this;
};


//endregion
//region --- Serialize and Setup
/**
 * Sets default settings.
 * @param {!Object} config
 */
anychart.stockModule.CurrentPriceIndicator.prototype.setThemeSettings = function(config) {
  anychart.core.settings.copy(this.themeSettings, this.SIMPLE_PROPS_DESCRIPTORS, config);
};


/** @inheritDoc */
anychart.stockModule.CurrentPriceIndicator.prototype.serialize = function() {
  var json = anychart.stockModule.CurrentPriceIndicator.base(this, 'serialize');

  anychart.core.settings.serialize(this, this.SIMPLE_PROPS_DESCRIPTORS, json, 'Current price indicator');

  if (goog.isString(this.seriesId_) || goog.isNumber(this.seriesId_))
    json['series'] = this.seriesId_;
  if (!isNaN(this.axisIndex_))
    json['axis'] = this.axisIndex_;

  json['mainLabel'] = this.mainLabel_.serialize();
  json['risingLabel'] = this.risingLabel_.getChangedSettings();
  json['fallingLabel'] = this.fallingLabel_.getChangedSettings();

  return json;
};


/** @inheritDoc */
anychart.stockModule.CurrentPriceIndicator.prototype.setupByJSON = function(config, opt_default) {
  if (opt_default) {
    this.setThemeSettings(config);
  } else {
    anychart.core.settings.deserialize(this, this.SIMPLE_PROPS_DESCRIPTORS, config);
  }

  this.series(config['series']);
  this.axis(config['axis']);

  this.setupLabels(config, opt_default);

  anychart.stockModule.CurrentPriceIndicator.base(this, 'setupByJSON', config, opt_default);
};


/**
 * @param {Object=} opt_config
 * @param {boolean=} opt_default
 */
anychart.stockModule.CurrentPriceIndicator.prototype.setupLabels = function(opt_config, opt_default) {
  var config = goog.isDef(opt_config) ? opt_config : this.themeSettings;

  if (!this.mainLabel_) {
    this.mainLabel_ = new anychart.core.ui.LabelsFactory();
    this.mainLabel_.listenSignals(this.labelInvalidated_, this);
    this.label_ = this.mainLabel_.add(null, null, 0);
    this.label_.zIndex(1);
    this.mainLabel_.markConsistent(anychart.ConsistencyState.ALL);
  }

  if (!this.risingLabel_) {
    this.risingLabel_ = new anychart.core.ui.LabelsFactory();
    this.risingLabel_.listenSignals(this.labelInvalidated_, this);
    this.risingLabel_.markConsistent(anychart.ConsistencyState.ALL);
  }

  if (!this.fallingLabel_) {
    this.fallingLabel_ = new anychart.core.ui.LabelsFactory();
    this.fallingLabel_.listenSignals(this.labelInvalidated_, this);
    this.fallingLabel_.markConsistent(anychart.ConsistencyState.ALL);
  }

  this.mainLabel_.setupInternal(!!opt_default, config['label']);
  this.risingLabel_.setupInternal(!!opt_default, config['risingLabel']);
  this.fallingLabel_.setupInternal(!!opt_default, config['fallingLabel']);
};


/** @inheritDoc */
anychart.stockModule.CurrentPriceIndicator.prototype.disposeInternal = function() {
  this.plot_ = null;
  this.axis_ = null;
  this.series_ = null;

  this.remove();
  if (this.line)
    this.line.dispose();

  this.mainLabel_.clear();

  goog.disposeAll(this.mainLabel_, this.risingLabel_, this.fallingLabel_);
  this.mainLabel_ = null;
  this.risingLabel_ = null;
  this.fallingLabel_ = null;

  anychart.stockModule.CurrentPriceIndicator.base(this, 'disposeInternal');
};


//endregion
//exports
(function() {
  var proto = anychart.stockModule.CurrentPriceIndicator.prototype;
  // proto['value'] = proto.value;
  // proto['valueField'] = proto.valueField
  // proto['stroke'] = proto.stroke;
  // proto['risingStroke'] = proto.risingStroke;
  // proto['fallingStroke'] = proto.fallingStroke;
  proto['label'] = proto.label;
  proto['fallingLabel'] = proto.fallingLabel;
  proto['risingLabel'] = proto.risingLabel;
  proto['axis'] = proto.axis;
  proto['series'] = proto.series;
})();
