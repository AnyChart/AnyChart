//region --- Requiring and Providing
goog.provide('anychart.tagCloudModule.Chart');
goog.require('acgraph.vector.SimpleText');
goog.require('anychart.colorScalesModule.ui.ColorRange');
goog.require('anychart.core.Point');
goog.require('anychart.core.SeparateChart');
goog.require('anychart.core.StateSettings');
goog.require('anychart.core.settings');
goog.require('anychart.core.utils.IInteractiveSeries');
goog.require('anychart.core.utils.InteractivityState');
goog.require('anychart.data.Set');
goog.require('anychart.enums');
goog.require('anychart.format.Context');
//endregion



/**
 * TagCloud chart class.
 * @param {(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Resource Chart data.
 * @param {(anychart.enums.TextParsingMode|anychart.data.TextParsingSettings)=} opt_settings If CSV string is passed, you
 * can pass CSV parser settings here as a hash map.
 * @constructor
 * @extends {anychart.core.SeparateChart}
 * @implements {anychart.core.utils.IInteractiveSeries}
 */
anychart.tagCloudModule.Chart = function(opt_data, opt_settings) {
  anychart.tagCloudModule.Chart.base(this, 'constructor');

  this.addThemes('tagCloud');

  /**
   * @type {Array.<string>}
   */
  this.referenceValueNames = ['x', 'value'];

  /**
   * @type {string}
   */
  this.categoryFieldName = 'category';

  /**
   * Canvas width.
   * @type {number}
   */
  this.cw = 1 << 6;

  /**
   * Canvas height.
   * @type {number}
   */
  this.ch = 1 << 11;

  /**
   * Minimum font size.
   * @type {number}
   */
  this.minFontSize = NaN;

  /**
   * Maximum font size.
   * @type {number}
   */
  this.maxFontSize = NaN;

  var descriptorsOverride = [anychart.core.settings.descriptors.FILL_FUNCTION_SIMPLE];

  var normalDescriptorsMeta = {};
  anychart.core.settings.createDescriptorsMeta(normalDescriptorsMeta, [
    ['fill', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW],
    ['fontFamily', anychart.ConsistencyState.TAG_CLOUD_TAGS | anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW],
    ['fontStyle', anychart.ConsistencyState.TAG_CLOUD_TAGS | anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW],
    ['fontVariant', anychart.ConsistencyState.TAG_CLOUD_TAGS | anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW],
    ['fontWeight', anychart.ConsistencyState.TAG_CLOUD_TAGS | anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW],
    ['fontSize', anychart.ConsistencyState.TAG_CLOUD_TAGS | anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW]
  ]);

  var hoveredSelectedDescriptorsMeta = {};
  anychart.core.settings.createDescriptorsMeta(hoveredSelectedDescriptorsMeta, [
    ['fill', 0, 0],
    ['fontFamily', 0, 0],
    ['fontStyle', 0, 0],
    ['fontVariant', 0, 0],
    ['fontWeight', 0, 0],
    ['fontSize', 0, 0]
  ]);

  this.normal_ = new anychart.core.StateSettings(this, normalDescriptorsMeta, anychart.PointState.NORMAL, descriptorsOverride);
  this.hovered_ = new anychart.core.StateSettings(this, hoveredSelectedDescriptorsMeta, anychart.PointState.HOVER, descriptorsOverride);
  this.selected_ = new anychart.core.StateSettings(this, hoveredSelectedDescriptorsMeta, anychart.PointState.SELECT, descriptorsOverride);
  this.normal_.addThemes(this.themeSettings);
  this.setupCreated('normal', this.normal_);
  this.setupCreated('hovered', this.hovered_);
  this.setupCreated('selected', this.selected_);

  /**
   * Scale.
   * @type {anychart.scales.Linear}
   * @private
   */
  this.scale_;

  /**
   * Interactivity state.
   * @type {anychart.core.utils.InteractivityState}
   */
  this.state = new anychart.core.utils.InteractivityState(this);

  /**
   * @type {Array.<anychart.tagCloudModule.Chart.Tag>}
   */
  this.normalizedData;

  this.data(opt_data || null, opt_settings);

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['mode', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW],
    ['fromAngle', anychart.ConsistencyState.TAG_CLOUD_ANGLES, anychart.Signal.NEEDS_REDRAW],
    ['toAngle', anychart.ConsistencyState.TAG_CLOUD_ANGLES, anychart.Signal.NEEDS_REDRAW],
    ['anglesCount', anychart.ConsistencyState.TAG_CLOUD_ANGLES, anychart.Signal.NEEDS_REDRAW],
    ['textSpacing', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW]
  ]);
  //We need create tootlip here because now we don't call setupByJson method.
  this.tooltip();
};
goog.inherits(anychart.tagCloudModule.Chart, anychart.core.SeparateChart);
anychart.core.settings.populateAliases(anychart.tagCloudModule.Chart, [
  'fill', 'fontFamily', 'fontStyle', 'fontVariant', 'fontWeight', 'fontSize'], 'normal');


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.tagCloudModule.Chart.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.SeparateChart.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.TAG_CLOUD_DATA |
    anychart.ConsistencyState.TAG_CLOUD_ANGLES |
    anychart.ConsistencyState.TAG_CLOUD_TAGS |
    anychart.ConsistencyState.TAG_CLOUD_COLOR_RANGE |
    anychart.ConsistencyState.TAG_CLOUD_COLOR_SCALE |
    anychart.ConsistencyState.TAG_CLOUD_SCALE |
    anychart.ConsistencyState.APPEARANCE;


/**
 *  @typedef {{
 *   rowIndex: number,
 *   text: string,
 *   value: number,
 *   drawed: boolean,
 *   category: (undefined|string),
 *   font: string,
 *   style: string,
 *   variant: string,
 *   weight: (string|number),
 *   padding: number,
 *   rotate: number,
 *   sizeRatio: number,
 *   fill: acgraph.vector.Fill,
 *   size: number,
 *   sprite: Array,
 *   x: number,
 *   y: number,
 *   x0: number,
 *   y0: number,
 *   x1: number,
 *   y1: number,
 *   xoff: number,
 *   yoff: number,
 *   width: number,
 *   height: number,
 *   hasText: boolean,
 *   textEl: (acgraph.vector.Element|undefined),
 *   eHandler: (*|undefined)
 * }}
 */
anychart.tagCloudModule.Chart.Tag;


//region --- Descriptors
/**
 * Simple properties descriptors.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.tagCloudModule.Chart.SIMPLE_PROPS_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  anychart.core.settings.createDescriptors(map, [
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'mode', anychart.enums.normalizeTagCloudMode],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'fromAngle', anychart.core.settings.numberNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'toAngle', anychart.core.settings.numberNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'anglesCount', anychart.core.settings.numberNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'textSpacing', anychart.core.settings.numberNormalizer]
  ]);

  return map;
})();
anychart.core.settings.populate(anychart.tagCloudModule.Chart, anychart.tagCloudModule.Chart.SIMPLE_PROPS_DESCRIPTORS);


//endregion
//region --- Chart Infrastructure Overrides
//------------------------------------------------------------------------------
//
//  Chart Infrastructure Overrides
//
//------------------------------------------------------------------------------
/** @inheritDoc */
anychart.tagCloudModule.Chart.prototype.getType = function() {
  return anychart.enums.ChartTypes.TAG_CLOUD;
};


/**
 * Returns chart.
 * @return {anychart.tagCloudModule.Chart}
 */
anychart.tagCloudModule.Chart.prototype.getChart = function() {
  return this;
};


/**
 * Tester if the series is discrete based.
 * @return {boolean}
 */
anychart.tagCloudModule.Chart.prototype.isDiscreteBased = function() {
  return true;
};


/**
 * Tester if the series is discrete based.
 * @return {boolean}
 */
anychart.tagCloudModule.Chart.prototype.isSizeBased = function() {
  return false;
};


/**
 * @inheritDoc
 */
anychart.tagCloudModule.Chart.prototype.isSeries = function() {
  return true;
};


/** @inheritDoc */
anychart.tagCloudModule.Chart.prototype.getAllSeries = function() {
  return [this];
};


/** @inheritDoc */
anychart.tagCloudModule.Chart.prototype.getPoint = function(index) {
  var point = new anychart.core.Point(this, index);
  var iterator = this.getIterator();

  if (iterator.select(index) && point.exists()) {
    var value = /** @type {number} */(point.get('value'));
    var v = value / /** @type {number} */ (this.getStat(anychart.enums.Statistics.SUM));
    point.statistics(anychart.enums.Statistics.Y_PERCENT_OF_TOTAL, anychart.math.round(v * 100, 2));
    point.statistics(anychart.enums.Statistics.PERCENT_VALUE, v);
  }

  return point;
};


/** @inheritDoc */
anychart.tagCloudModule.Chart.prototype.getSeriesStatus = function() {
  return null;
};


/**
 * Returns current view iterator.
 * @return {!anychart.data.Iterator} Current chart view iterator.
 */
anychart.tagCloudModule.Chart.prototype.getIterator = function() {
  return this.iterator_ || (this.iterator_ = this.data_.getIterator());
};


/**
 * Returns new default iterator for the current mapping.
 * @return {!anychart.data.Iterator} New iterator.
 */
anychart.tagCloudModule.Chart.prototype.getResetIterator = function() {
  return this.iterator_ = this.data_.getIterator();
};


//endregion
//region --- Private properties
//------------------------------------------------------------------------------
//
//  Private properties
//
//------------------------------------------------------------------------------
/**
 * Raw data holder.
 * @type {?(anychart.data.View|anychart.data.Set|Array|string|anychart.data.DataSettings)}
 * @private
 */
anychart.tagCloudModule.Chart.prototype.rawData_;


/**
 * View to dispose on next data set, if any.
 * @type {goog.Disposable}
 * @private
 */
anychart.tagCloudModule.Chart.prototype.parentViewToDispose_;


/**
 * Chart data.
 * @type {!anychart.data.View}
 * @private
 */
anychart.tagCloudModule.Chart.prototype.data_;


//endregion
//region --- Palettes
//----------------------------------------------------------------------------------------------------------------------
//
//  Palettes
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter/setter for palette.
 * @param {(anychart.palettes.RangeColors|anychart.palettes.DistinctColors|Object|Array.<string>)=} opt_value .
 * @return {!(anychart.palettes.RangeColors|anychart.palettes.DistinctColors|anychart.tagCloudModule.Chart)} .
 */
anychart.tagCloudModule.Chart.prototype.palette = function(opt_value) {
  if (anychart.utils.instanceOf(opt_value, anychart.palettes.RangeColors)) {
    this.setupPalette_(anychart.palettes.RangeColors, /** @type {anychart.palettes.RangeColors} */(opt_value));
    return this;
  } else if (anychart.utils.instanceOf(opt_value, anychart.palettes.DistinctColors)) {
    this.setupPalette_(anychart.palettes.DistinctColors, /** @type {anychart.palettes.DistinctColors} */(opt_value));
    return this;
  } else if (goog.isObject(opt_value) && opt_value['type'] == 'range') {
    this.setupPalette_(anychart.palettes.RangeColors);
  } else if (goog.isObject(opt_value) || this.palette_ == null)
    this.setupPalette_(anychart.palettes.DistinctColors);

  if (goog.isDef(opt_value)) {
    this.palette_.setup(opt_value);
    return this;
  }
  return /** @type {!(anychart.palettes.RangeColors|anychart.palettes.DistinctColors)} */(this.palette_);
};


/**
 * @param {Function} cls Palette constructor.
 * @param {(anychart.palettes.RangeColors|anychart.palettes.DistinctColors)=} opt_cloneFrom Settings to clone from.
 * @private
 */
anychart.tagCloudModule.Chart.prototype.setupPalette_ = function(cls, opt_cloneFrom) {
  if (anychart.utils.instanceOf(this.palette_, cls)) {
    if (opt_cloneFrom)
      this.palette_.setup(opt_cloneFrom);
  } else {
    // we dispatch only if we replace existing palette.
    var doDispatch = !!this.palette_;
    goog.dispose(this.palette_);
    this.palette_ = /** @type {anychart.palettes.DistinctColors|anychart.palettes.RangeColors} */ (new cls());
    this.setupCreated('palette', this.palette_);
    this.palette_.restoreDefaults();
    if (opt_cloneFrom)
      this.palette_.setup(opt_cloneFrom);
    this.palette_.listenSignals(this.paletteInvalidated_, this);
    if (doDispatch)
      this.invalidate(anychart.ConsistencyState.CHART_LEGEND, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Internal palette invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.tagCloudModule.Chart.prototype.paletteInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.TAG_CLOUD_COLOR_SCALE,
        anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEED_UPDATE_COLOR_RANGE);
  }
};


//endregion
//region --- Coloring
/**
 * @param {string=} opt_baseColor .
 * @return {Object}
 */
anychart.tagCloudModule.Chart.prototype.getColorResolutionContext = function(opt_baseColor) {
  var iterator = this.getIterator();
  var index = iterator.getIndex();
  var source = opt_baseColor || this.palette().itemAt(index) || 'blue';
  var scaledColor;
  var ctx = {};
  var colorScale = this.getColorScale();

  var value = /** @type {number} */(iterator.get('value'));
  var category = iterator.meta('category');
  ctx['value'] = value;
  ctx['category'] = category;

  if (colorScale) {
    var valueForScale = anychart.utils.instanceOf(colorScale, anychart.colorScalesModule.Ordinal) && goog.isDef(category) ?
        category : value;

    if (this.colorScale_ || goog.isDef(category))
      scaledColor = colorScale.valueToColor(/** @type {string|number} */(valueForScale));

    goog.object.extend(ctx, {
      'scaledColor': scaledColor,
      'colorScale': this.colorScale_
    });
  }
  ctx['sourceColor'] = source;

  return ctx;
};


/**
 * Applying fill.
 * @param {acgraph.vector.Element} element .
 * @param {string|Object} fill .
 */
anychart.tagCloudModule.Chart.prototype.applyFill = function(element, fill) {
  if (goog.isString(fill)) {
    element.attr('fill', fill);
    element.attr('fill-opacity', 1);
  } else {
    element.attr('fill', fill['color']);
    element.attr('fill-opacity', fill['opacity']);
  }
};


/**
 * Returns user color scale otherwise auto color scale.
 * @return {anychart.colorScalesModule.Ordinal|anychart.colorScalesModule.Linear}
 */
anychart.tagCloudModule.Chart.prototype.getColorScale = function() {
  return this.colorScale_ || this.autoColorScale_ || (this.autoColorScale_ = anychart.scales.ordinalColor());
};


//endregion
//region --- Interactivity
/**
 * Create chart label/tooltip format provider.
 * @return {Object} Object with info for labels/tooltip formatting.
 * @protected
 */
anychart.tagCloudModule.Chart.prototype.createFormatProvider = function() {
  var iterator = this.getIterator();

  if (!this.pointProvider_)
    this.pointProvider_ = new anychart.format.Context();

  this.pointProvider_
      .dataSource(iterator)
      .statisticsSources([this.getPoint(iterator.getIndex()), this]);

  var values = {
    'x': {value: iterator.get('x'), type: anychart.enums.TokenType.STRING},
    'value': {value: iterator.get('value'), type: anychart.enums.TokenType.NUMBER},
    'name': {value: iterator.get('name'), type: anychart.enums.TokenType.STRING},
    'index': {value: iterator.getIndex(), type: anychart.enums.TokenType.NUMBER},
    'chart': {value: this, type: anychart.enums.TokenType.UNKNOWN}
  };

  this.pointProvider_.propagate(values);

  return this.pointProvider_;
};


/**
 * Creates tooltip format provider.
 * @return {Object}
 */
anychart.tagCloudModule.Chart.prototype.createTooltipContextProvider = function() {
  return this.createFormatProvider();
};


/**
 * Creates position provider. Series-like behaviour.
 * @return {Object} Object positioning data.
 */
anychart.tagCloudModule.Chart.prototype.createPositionProvider = function() {
  var iterator = this.getIterator();
  var item = iterator.meta('item');
  var left = this.lCenterX_ + item.x * this.lScale_;
  var top = this.lCenterY_ + item.y * this.lScale_;
  return {'value': {'x': left, 'y': top}};
};


/**
 * Apply appearance to series.
 * @param {anychart.PointState|number} pointState .
 */
anychart.tagCloudModule.Chart.prototype.applyAppearanceToSeries = function(pointState) {};


/** @inheritDoc */
anychart.tagCloudModule.Chart.prototype.applyAppearanceToPoint = function(pointState, opt_value) {
  var iterator = this.getIterator();
  var item = iterator.meta('item');

  if (!item || !item.drawed)
    return;

  var state = anychart.core.utils.InteractivityState.clarifyState(pointState);

  var fill = acgraph.vector.normalizeFill(/** @type {acgraph.vector.Fill} */(this.resolveProperty('fill', state)));
  var fontFamily = this.resolveProperty('fontFamily', state);
  var fontStyle = this.resolveProperty('fontStyle', state);
  var fontVariant = this.resolveProperty('fontVariant', state);
  var fontWeight = this.resolveProperty('fontWeight', state);
  var fontSize = this.resolveProperty('fontSize', state);

  var stage = this.container() ? this.container().getStage() : null;
  var manualSuspend = stage && !stage.isSuspended();
  if (manualSuspend) stage.suspend();

  this.applyFill(item.textEl, fill);
  item.textEl.attr('font-family', fontFamily);
  item.textEl.attr('font-style', fontStyle);
  item.textEl.attr('font-variant', fontVariant);
  item.textEl.attr('font-weight', fontWeight);
  item.textEl.attr('font-size', fontSize);

  var zIndex = anychart.core.shapeManagers.FILL_SHAPES_ZINDEX +
      (state == anychart.PointState.NORMAL ? 0 : anychart.core.shapeManagers.ZINDEX_STEP);
  item.textEl.zIndex(zIndex);

  if (manualSuspend)
    stage.resume();

  return opt_value;
};


/** @inheritDoc */
anychart.tagCloudModule.Chart.prototype.getStartValueForAppearanceReduction = goog.nullFunction;


/** @inheritDoc */
anychart.tagCloudModule.Chart.prototype.doAdditionActionsOnMouseOverAndMove = function(index, series) {
  var colorRange = this.colorRange();
  index = goog.isArray(index) ? index.length ? index[0] : NaN : index;
  if (colorRange && colorRange.target() && !isNaN(index)) {
    var target = /** @type {anychart.mapModule.Series} */(colorRange.target());
    var iterator = target.getIterator();
    iterator.select(index);
    var colorScale = this.getColorScale();
    var value;
    if (anychart.utils.instanceOf(colorScale, anychart.colorScalesModule.Ordinal)) {
      value = iterator.meta(this.categoryFieldName);
    } else {
      value = iterator.get(this.referenceValueNames[1]);
    }
    colorRange.showMarker(/** @type {number} */(value));
  }
};


/** @inheritDoc */
anychart.tagCloudModule.Chart.prototype.doAdditionActionsOnMouseOut = function() {
  var colorRange = this.colorRange();
  if (colorRange && colorRange.enabled()) {
    colorRange.hideMarker();
  }
};


/**
 * Returns item property.
 * @param {Object} item .
 * @param {string} propName .
 * @return {*}
 */
anychart.tagCloudModule.Chart.prototype.getItemProp = function(item, propName) {
  var itemValue;
  switch (propName) {
    case 'fontFamily':
      itemValue = item.font;
      break;
    case 'fill':
      itemValue = item.fill;
      break;
    case 'fontStyle':
      itemValue = item.style;
      break;
    case 'fontVariant':
      itemValue = item.variant;
      break;
    case 'fontWeight':
      itemValue = item.weight;
      break;
    case 'fontSize':
      itemValue = item.size;
      break;
  }
  return itemValue;
};


/**
 * Resolve style property.
 * @param {string} propName .
 * @param {number} state .
 * @return {*} .
 */
anychart.tagCloudModule.Chart.prototype.resolveProperty = function(propName, state) {
  var stateProp, settings, statePropIsPercent, ctx;
  if (state != anychart.PointState.NORMAL) {
    settings = state == anychart.PointState.HOVER ? this.hovered_ : this.selected_;
    stateProp = settings.getOption(propName);

    statePropIsPercent = anychart.utils.isPercent(stateProp);
    if (goog.isDefAndNotNull(stateProp) && !goog.isFunction(stateProp) && !statePropIsPercent)
      return stateProp;
  }

  var iterator = this.getIterator();
  var item = /** @type {Object} */(iterator.meta('item'));

  var normalProp = this.normal_.getOption(propName);
  var isPercent = anychart.utils.isPercent(normalProp);
  if (!goog.isDefAndNotNull(normalProp) || isPercent) {
    normalProp = this.getItemProp(item, propName);
  } else if (goog.isFunction(normalProp)) {
    if (propName == 'fill') {
      ctx = this.getColorResolutionContext();
    } else {
      ctx = this.createFormatProvider();
      ctx['sourceValue'] = normalProp;
    }

    normalProp = normalProp.call(ctx, ctx);
  }

  if (stateProp) {
    if (statePropIsPercent)
      return (/** @type {number} */(normalProp)) * parseFloat(stateProp) / 100;
    else {
      if (propName == 'fill') {
        ctx = this.getColorResolutionContext(/** @type {string} */(normalProp));
      } else {
        ctx = this.createFormatProvider();
        ctx['sourceValue'] = normalProp;
      }
      return stateProp.call(ctx, ctx);
    }
  }

  return normalProp;
};


/**
 * Makes interactive.
 * @param {Object} item .
 * @protected
 */
anychart.tagCloudModule.Chart.prototype.makeInteractive = function(item) {
  if (!item.eHandler) return;
  item.eHandler.tag = {
    series: this,
    index: item.rowIndex
  };
};


/**
 * This method also has a side effect - it patches the original source event to maintain pointIndex support for
 * browser events.
 * @param {anychart.core.MouseEvent} event
 * @return {Object} An object of event to dispatch. If null - unrecognized type was found.
 */
anychart.tagCloudModule.Chart.prototype.makePointEvent = function(event) {
  var type = event['type'];
  switch (type) {
    case acgraph.events.EventType.MOUSEOUT:
      type = anychart.enums.EventType.POINT_MOUSE_OUT;
      break;
    case acgraph.events.EventType.MOUSEOVER:
      type = anychart.enums.EventType.POINT_MOUSE_OVER;
      break;
    case acgraph.events.EventType.MOUSEMOVE:
      type = anychart.enums.EventType.POINT_MOUSE_MOVE;
      break;
    case acgraph.events.EventType.MOUSEDOWN:
      type = anychart.enums.EventType.POINT_MOUSE_DOWN;
      break;
    case acgraph.events.EventType.MOUSEUP:
      type = anychart.enums.EventType.POINT_MOUSE_UP;
      break;
    case acgraph.events.EventType.CLICK:
      type = anychart.enums.EventType.POINT_CLICK;
      break;
    case acgraph.events.EventType.DBLCLICK:
      type = anychart.enums.EventType.POINT_DBLCLICK;
      break;
    default:
      return null;
  }

  var pointIndex;
  if ('pointIndex' in event) {
    pointIndex = event['pointIndex'];
  } else if ('labelIndex' in event) {
    pointIndex = event['labelIndex'];
  } else if ('markerIndex' in event) {
    pointIndex = event['markerIndex'];
  }
  pointIndex = anychart.utils.toNumber(pointIndex);
  event['pointIndex'] = pointIndex;

  return {
    'type': type,
    'actualTarget': event['target'],
    'series': this,
    'pointIndex': pointIndex,
    'target': this,
    'originalEvent': event,
    'point': this.getPoint(pointIndex)
  };
};


/** @inheritDoc */
anychart.tagCloudModule.Chart.prototype.makeBrowserEvent = function(e) {
  var res = anychart.core.VisualBase.prototype.makeBrowserEvent.call(this, e);

  var tag = anychart.utils.extractTag(res['domTarget']);
  var pointIndex = tag.index;
  // fix for domTarget == layer (mouseDown on label + mouseUp on path = click on layer)
  if (!goog.isDef(pointIndex) && this.state.hasPointState(anychart.PointState.HOVER)) {
    var hoveredPointsIndex = this.state.getIndexByPointState(anychart.PointState.HOVER);
    if (hoveredPointsIndex.length) {
      pointIndex = hoveredPointsIndex[0];
    }
  }

  pointIndex = anychart.utils.toNumber(pointIndex);
  if (!isNaN(pointIndex)) {
    res['pointIndex'] = pointIndex;
  }
  return res;
};


/**
 * Finalization point appearance. For drawing labels and markers.
 */
anychart.tagCloudModule.Chart.prototype.finalizePointAppearance = function() {};


/**
 * Internal dummy getter/setter for Resource chart hover mode.
 * @param {anychart.enums.HoverMode=} opt_value Hover mode.
 * @return {anychart.tagCloudModule.Chart|anychart.enums.HoverMode} .
 */
anychart.tagCloudModule.Chart.prototype.hoverMode = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeHoverMode(opt_value);
    if (opt_value != this.hoverMode_) {
      this.hoverMode_ = opt_value;
    }
    return this;
  }
  return /** @type {anychart.enums.HoverMode} */(this.hoverMode_);
};


/**
 * @param {(anychart.enums.SelectionMode|string)=} opt_value Selection mode.
 * @return {anychart.tagCloudModule.Chart|anychart.enums.SelectionMode} .
 */
anychart.tagCloudModule.Chart.prototype.selectionMode = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.interactivity()['selectionMode'](opt_value);
    return this;
  } else {
    return /** @type {anychart.enums.SelectionMode} */(this.interactivity().getOption('selectionMode'));
  }
};


/**
 * Selects a point of the series by its index.
 * @param {number|Array<number>} indexOrIndexes Index of the point to select.
 * @param {anychart.core.MouseEvent=} opt_event Event that initiate point selecting.
 * @return {!anychart.tagCloudModule.Chart} {@link anychart.tagCloudModule.Chart} instance for method chaining.
 */
anychart.tagCloudModule.Chart.prototype.selectPoint = function(indexOrIndexes, opt_event) {
  if (!this.enabled())
    return this;

  var stage = this.container() ? this.container().getStage() : null;
  var manualSuspend = stage && !stage.isSuspended();
  if (manualSuspend) stage.suspend();

  var unselect = !(opt_event && opt_event.shiftKey);

  if (goog.isArray(indexOrIndexes)) {
    if (!opt_event)
      this.unselect();

    this.state.setPointState(anychart.PointState.SELECT, indexOrIndexes, unselect ? anychart.PointState.HOVER : undefined);
  } else if (goog.isNumber(indexOrIndexes)) {
    this.state.setPointState(anychart.PointState.SELECT, indexOrIndexes, unselect ? anychart.PointState.HOVER : undefined);
  }

  if (manualSuspend)
    stage.resume();

  return this;
};


/**
 * Deselects all points or points by index.
 * @param {(number|Array.<number>)=} opt_indexOrIndexes Index or array of indexes of the point to select.
 */
anychart.tagCloudModule.Chart.prototype.unselect = function(opt_indexOrIndexes) {
  if (!this.enabled())
    return;

  var stage = this.container() ? this.container().getStage() : null;
  var manualSuspend = stage && !stage.isSuspended();
  if (manualSuspend) stage.suspend();

  var index;
  if (goog.isDef(opt_indexOrIndexes))
    index = opt_indexOrIndexes;
  else
    index = (this.state.seriesState == anychart.PointState.NORMAL ? NaN : undefined);
  this.state.removePointState(anychart.PointState.SELECT, index);

  if (manualSuspend)
    stage.resume();
};


/**
 * Hovers a point of the series by its index.
 * @param {number|Array<number>} index Index of the point to hover.
 * @return {!anychart.tagCloudModule.Chart}  {@link anychart.tagCloudModule.Chart} instance for method chaining.
 */
anychart.tagCloudModule.Chart.prototype.hoverPoint = function(index) {
  if (!this.enabled())
    return this;

  var stage = this.container() ? this.container().getStage() : null;
  var manualSuspend = stage && !stage.isSuspended();
  if (manualSuspend) stage.suspend();

  if (goog.isArray(index)) {
    var hoveredPoints = this.state.getIndexByPointState(anychart.PointState.HOVER);
    for (var i = 0; i < hoveredPoints.length; i++) {
      if (!goog.array.contains(index, hoveredPoints[i])) {
        this.state.removePointState(anychart.PointState.HOVER, hoveredPoints[i]);
      }
    }
    this.state.addPointState(anychart.PointState.HOVER, index);
  } else if (goog.isNumber(index)) {
    this.unhover();
    this.state.addPointState(anychart.PointState.HOVER, index);
  }

  if (manualSuspend)
    stage.resume();

  return this;
};


/** @inheritDoc */
anychart.tagCloudModule.Chart.prototype.unhover = function(opt_indexOrIndexes) {
  if (!(this.state.hasPointState(anychart.PointState.HOVER) ||
      this.state.isStateContains(this.state.getSeriesState(), anychart.PointState.HOVER)) ||
      !this.enabled())
    return;

  var stage = this.container() ? this.container().getStage() : null;
  var manualSuspend = stage && !stage.isSuspended();
  if (manualSuspend) stage.suspend();

  var index;
  if (goog.isDef(opt_indexOrIndexes))
    index = opt_indexOrIndexes;
  else
    index = (this.state.seriesState == anychart.PointState.NORMAL ? NaN : undefined);
  this.state.removePointState(anychart.PointState.HOVER, index);

  if (manualSuspend)
    stage.resume();
};


//endregion
//region --- Public methods
//------------------------------------------------------------------------------
//
//  Public methods
//
//------------------------------------------------------------------------------
/**
 * Getter/setter for chart data.
 * @param {?(anychart.data.View|anychart.data.Set|Array|anychart.data.DataSettings|string)=} opt_value Value to set.
 * @param {(anychart.enums.TextParsingMode|anychart.data.TextParsingSettings)=} opt_settings If CSV string is passed, you can pass CSV parser settings here as a hash map.
 * @return {(!anychart.tagCloudModule.Chart|!anychart.data.View)} Returns itself if used as a setter or the mapping if used as a getter.
 */
anychart.tagCloudModule.Chart.prototype.data = function(opt_value, opt_settings) {
  if (goog.isDef(opt_value)) {
    // handle HTML table data
    if (opt_value) {
      var title = opt_value['title'] || opt_value['caption'];
      if (title) this.title(title);
      if (opt_value['rows']) opt_value = opt_value['rows'];
    }

    if (this.rawData_ !== opt_value) {
      this.rawData_ = opt_value;
      goog.dispose(this.parentViewToDispose_); // disposing a view created by the series if any;
      if (anychart.utils.instanceOf(opt_value, anychart.data.View))
        this.data_ = this.parentViewToDispose_ = opt_value.derive(); // deriving a view to avoid interference with other view users
      else if (anychart.utils.instanceOf(opt_value, anychart.data.Set))
        this.data_ = this.parentViewToDispose_ = opt_value.mapAs();
      else {
        this.data_ = (this.parentViewToDispose_ = new anychart.data.Set(
            (goog.isArray(opt_value) || goog.isString(opt_value)) ? opt_value : null, opt_settings)).mapAs();
      }
      this.data_.listenSignals(this.dataInvalidated_, this);
      this.invalidate(anychart.ConsistencyState.TAG_CLOUD_DATA | anychart.ConsistencyState.CHART_LABELS, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.data_;
};


/**
 * Listener for data invalidation.
 * @param {anychart.SignalEvent} event - Invalidation event.
 * @private
 */
anychart.tagCloudModule.Chart.prototype.dataInvalidated_ = function(event) {
  this.invalidate(anychart.ConsistencyState.TAG_CLOUD_DATA | anychart.ConsistencyState.CHART_LABELS, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Tags rotation angles.
 * @param {Array.<number>=} opt_value .
 * @return {Array.<number>|anychart.tagCloudModule.Chart}
 */
anychart.tagCloudModule.Chart.prototype.angles = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = goog.isArray(opt_value) ? goog.array.clone(opt_value) : null;
    if (this.angles_ != opt_value) {
      this.angles_ = opt_value;
      this.invalidate(anychart.ConsistencyState.TAG_CLOUD_TAGS | anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.angles_;
};


/**
 * Tags rotation angles.
 * @param {(anychart.enums.ScaleTypes|Object|anychart.scales.Base)=} opt_value .
 * @return {anychart.scales.Base|anychart.tagCloudModule.Chart}
 */
anychart.tagCloudModule.Chart.prototype.scale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var val = anychart.scales.Base.setupScale(this.scale_, opt_value, null,
        anychart.scales.Base.ScaleTypes.SCATTER, null, this.scaleInvalidated, this);
    if (val) {
      var dispatch = this.scale_ == val;
      this.scale_ = /** @type {anychart.scales.Linear} */(val);
      this.scale_.resumeSignalsDispatching(dispatch);
      if (!dispatch)
        this.invalidate(anychart.ConsistencyState.TAG_CLOUD_SCALE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.scale_;
};


/**
 * Chart xScale invalidation handler.
 * @param {anychart.SignalEvent} event Event.
 * @protected
 */
anychart.tagCloudModule.Chart.prototype.scaleInvalidated = function(event) {
  this.invalidate(anychart.ConsistencyState.TAG_CLOUD_SCALE, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Color scale.
 * @param {(anychart.colorScalesModule.Linear|anychart.colorScalesModule.Ordinal|Object|anychart.enums.ScaleTypes)=} opt_value Scale to set.
 * @return {anychart.colorScalesModule.Ordinal|anychart.colorScalesModule.Linear|anychart.tagCloudModule.Chart} Default chart color scale value or itself for
 * method chaining.
 */
anychart.tagCloudModule.Chart.prototype.colorScale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (goog.isNull(opt_value) && this.colorScale_) {
      this.colorScale_ = null;
      this.invalidate(anychart.ConsistencyState.TAG_CLOUD_COLOR_SCALE,
          anychart.Signal.NEEDS_REDRAW |
          anychart.Signal.NEED_UPDATE_COLOR_RANGE);
    } else {
      var val = anychart.scales.Base.setupScale(this.colorScale_, opt_value, null,
          anychart.scales.Base.ScaleTypes.COLOR_SCALES, null, this.colorScaleInvalidated_, this);
      if (val) {
        var dispatch = this.colorScale_ == val;
        this.colorScale_ = val;
        this.colorScale_.resumeSignalsDispatching(dispatch);
        if (!dispatch) {
          this.colorRange().removeLines();
          this.invalidate(anychart.ConsistencyState.TAG_CLOUD_COLOR_SCALE,
              anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEED_UPDATE_COLOR_RANGE);
        }
      }
    }
    return this;
  }
  return this.colorScale_;
};


/**
 * Chart scale invalidation handler.
 * @param {anychart.SignalEvent} event Event.
 * @private
 */
anychart.tagCloudModule.Chart.prototype.colorScaleInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_RECALCULATION | anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.TAG_CLOUD_COLOR_SCALE,
        anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEED_UPDATE_COLOR_RANGE);
  }
};


/**
 * Normal state settings.
 * @param {!Object=} opt_value .
 * @return {anychart.core.StateSettings|anychart.tagCloudModule.Chart}
 */
anychart.tagCloudModule.Chart.prototype.normal = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.normal_.setup(opt_value);
    return this;
  }
  return this.normal_;
};


/**
 * Hovered state settings.
 * @param {!Object=} opt_value .
 * @return {anychart.core.StateSettings|anychart.tagCloudModule.Chart}
 */
anychart.tagCloudModule.Chart.prototype.hovered = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.hovered_.setup(opt_value);
    return this;
  }
  return this.hovered_;
};


/**
 * Selected state settings.
 * @param {!Object=} opt_value .
 * @return {anychart.core.StateSettings|anychart.tagCloudModule.Chart}
 */
anychart.tagCloudModule.Chart.prototype.selected = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.selected_.setup(opt_value);
    return this;
  }
  return this.selected_;
};


//endregion
//region --- UI Elements
//----------------------------------------------------------------------------------------------------------------------
//
//  Color Range
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter/setter for color range.
 * @param {(Object|boolean)=} opt_value Color range settings to set.
 * @return {!(anychart.colorScalesModule.ui.ColorRange|anychart.tagCloudModule.Chart)} Return current chart markers palette or itself for chaining call.
 */
anychart.tagCloudModule.Chart.prototype.colorRange = function(opt_value) {
  if (!this.colorRange_) {
    this.colorRange_ = new anychart.colorScalesModule.ui.ColorRange();
    this.setupCreated('colorRange', this.colorRange_);
    this.colorRange_.listenSignals(this.colorRangeInvalidated_, this);
    this.invalidate(anychart.ConsistencyState.TAG_CLOUD_COLOR_RANGE | anychart.ConsistencyState.BOUNDS,
        anychart.Signal.NEEDS_REDRAW);
  }
  if (goog.isDef(opt_value)) {
    this.colorRange_.setup(opt_value);
    return this;
  } else {
    return this.colorRange_;
  }
};


/**
 * Internal marker palette invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.tagCloudModule.Chart.prototype.colorRangeInvalidated_ = function(event) {
  var state = 0;
  var signal = 0;
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    state |= anychart.ConsistencyState.TAG_CLOUD_COLOR_RANGE |
        anychart.ConsistencyState.BOUNDS;
    signal |= anychart.Signal.NEEDS_REDRAW;
  }
  if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    state |= anychart.ConsistencyState.BOUNDS;
    signal |= anychart.Signal.BOUNDS_CHANGED;
  }
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    state |= anychart.ConsistencyState.TAG_CLOUD_COLOR_RANGE;
    signal |= anychart.Signal.BOUNDS_CHANGED;
  }
  // if there are no signals, !state and nothing happens.
  this.invalidate(state, signal);
};


/** @inheritDoc */
anychart.tagCloudModule.Chart.prototype.checkIfColorRange = function(target) {
  return anychart.utils.checkIfParent(this.colorRange(), /** @type {goog.events.EventTarget} */(target));
};


/** @inheritDoc */
anychart.tagCloudModule.Chart.prototype.createLegendItemsProvider = function(sourceMode, itemsFormat) {
  var i, count;
  /**
   * @type {!Array.<anychart.core.ui.Legend.LegendItemProvider>}
   */
  var data = [];

  var series, scale;
  if (sourceMode == anychart.enums.LegendItemsSourceMode.CATEGORIES) {
    series = this;
    scale = anychart.utils.instanceOf(this.getColorScale(), anychart.colorScalesModule.Ordinal) ? this.getColorScale() : void 0;

    if (scale) {
      var ranges = scale.getProcessedRanges();
      for (i = 0, count = ranges.length; i < count; i++) {
        var range = ranges[i];
        if (range.name !== 'default') {
          data.push({
            'text': range.name,
            'iconEnabled': true,
            'iconType': anychart.enums.LegendItemIconType.SQUARE,
            'iconFill': range.color,
            'disabled': !this.enabled(),
            'sourceUid': goog.getUid(this),
            'sourceKey': i,
            'meta': {
              series: series,
              scale: scale,
              range: range
            }
          });
        }
      }
    }
  }
  return data;
};


/** @inheritDoc */
anychart.tagCloudModule.Chart.prototype.legendItemCanInteractInMode = function(mode) {
  return mode == anychart.enums.LegendItemsSourceMode.CATEGORIES;
};


/** @inheritDoc */
anychart.tagCloudModule.Chart.prototype.legendItemClick = function(item, event) {
  var meta = /** @type {Object} */(item.meta());
  var series;
  var sourceMode = /** @type {anychart.enums.LegendItemsSourceMode} */(this.legend().getOption('itemsSourceMode'));
  if (sourceMode == anychart.enums.LegendItemsSourceMode.CATEGORIES) {
    series = meta.series;
    var scale = meta.scale;

    if (scale && series) {
      var points = [];
      var range = meta.range;
      var iterator = series.getResetIterator();

      while (iterator.advance()) {
        var value = iterator.get('value');
        var category = iterator.meta('category');

        var pointValue = goog.isDef(category) ? category : value;
        if (range == scale.getRangeByValue(/** @type {string|number} */(pointValue))) {
          points.push(iterator.getIndex());
        }
      }

      if (this.interactivity().getOption('hoverMode') == anychart.enums.HoverMode.SINGLE) {
        event.points_ = {
          series: series,
          points: points
        };
      } else {
        event.points_ = [{
          series: series,
          points: points,
          lastPoint: points[points.length - 1],
          nearestPointToCursor: {index: points[points.length - 1], distance: 0}
        }];
      }
    }
  }
};


/** @inheritDoc */
anychart.tagCloudModule.Chart.prototype.legendItemOver = function(item, event) {
  var meta = /** @type {Object} */(item.meta());
  var series;

  var sourceMode = /** @type {anychart.enums.LegendItemsSourceMode} */(this.legend().getOption('itemsSourceMode'));
  if (sourceMode == anychart.enums.LegendItemsSourceMode.CATEGORIES) {
    series = /** @type {anychart.mapModule.Series} */(meta.series);
    var scale = meta.scale;
    if (scale && series) {
      var range = meta.range;
      var iterator = series.getResetIterator();

      var points = [];
      while (iterator.advance()) {
        var value = iterator.get('value');
        var category = iterator.meta('category');

        var pointValue = goog.isDef(category) ? category : value;
        if (range == scale.getRangeByValue(/** @type {string|number} */(pointValue))) {
          points.push(iterator.getIndex());
        }
      }

      var tag = anychart.utils.extractTag(event['domTarget']);
      if (tag) {
        if (this.interactivity().getOption('hoverMode') == anychart.enums.HoverMode.SINGLE) {
          tag.points_ = {
            series: series,
            points: points
          };
        } else {
          tag.points_ = [{
            series: series,
            points: points,
            lastPoint: points[points.length - 1],
            nearestPointToCursor: {index: points[points.length - 1], distance: 0}
          }];
        }
      }

      var colorRange = this.getCreated('colorRange');
      if (colorRange && colorRange.enabled() && colorRange.target()) {
        colorRange.showMarker(goog.isDef(range.equal) ? range.equal : (range.start + range.end) / 2);
      }
    }
  }
};


/** @inheritDoc */
anychart.tagCloudModule.Chart.prototype.legendItemOut = function(item, event) {
  var meta = /** @type {Object} */(item.meta());

  var sourceMode = /** @type {anychart.enums.LegendItemsSourceMode} */(this.legend().getOption('itemsSourceMode'));
  if (sourceMode == anychart.enums.LegendItemsSourceMode.CATEGORIES) {
    if (this.interactivity().getOption('hoverMode') == anychart.enums.HoverMode.SINGLE) {
      var tag = anychart.utils.extractTag(event['domTarget']);
      if (tag)
        tag.series = meta.series;
    }
    var colorRange = this.getCreated('colorRange');
    if (colorRange && colorRange.enabled() && colorRange.target()) {
      colorRange.hideMarker();
    }
  }
};


//endregion
//region --- Utils
/**
 * Calculating font size.
 * @param {Object} d Tag object.
 */
anychart.tagCloudModule.Chart.prototype.calculateMaxFontSize = function(d) {
  if (!d) return;

  var w = this.w / 3;
  var h = this.h / 3;

  var minFontSize = this.h / 50;
  var maxFontSize = ~~h;

  var evaluator = function(fontSize) {
    ///
    var bounds = acgraph.getRenderer().measure(d.text, {
      'fontStyle': d.style,
      'fontFamily': d.font,
      'fontSize': fontSize,
      'fontWeight': d.weight,
      'fontVariant': d.variant
    });

    var point = anychart.utils.getCoordinateByAnchor(bounds, /** @type {anychart.enums.Anchor} */('center'));
    var tx = goog.math.AffineTransform.getRotateInstance(goog.math.toRadians(d.rotate), point.x, point.y);

    var arr = bounds.toCoordinateBox() || [];
    tx.transform(arr, 0, arr, 0, 4);

    bounds = anychart.math.Rect.fromCoordinateBox(arr);
    ///

    var width = bounds.width;
    var height = bounds.height;
    var res;
    if (width > w || height > h) {
      res = -1;
    } else if (width == w || height == h) {
      res = 0;
    } else {
      res = 1;
    }
    return res;
  };

  var fonts = goog.array.range(minFontSize, maxFontSize + 1);
  var res = goog.array.binarySelect(fonts, evaluator);
  if (res < 0) {
    res = ~res - 1;
  }

  this.minFontSize = minFontSize;
  this.maxFontSize = fonts[goog.math.clamp(res, 0, fonts.length)];
};


/**
 * Creates cloud sprites.
 * @param {{context: CanvasRenderingContext2D, ratio: number}} contextAndRatio
 * @param {Object} d .
 * @param {Array.<Object>} data .
 * @param {number} di .
 */
anychart.tagCloudModule.Chart.prototype.cloudSprite = function(contextAndRatio, d, data, di) {
  if (d.sprite) return;
  var c = contextAndRatio.context,
      ratio = contextAndRatio.ratio;

  c.clearRect(0, 0, (this.cw << 5) / ratio, this.ch / ratio);
  var x = 0,
      y = 0,
      maxh = 0,
      n = data.length;
  --di;

  var padding = /** @type {number} */(this.getOption('textSpacing'));
  while (++di < n) {
    d = data[di];
    c.save();
    var font = '';
    if (d.style != 'normal')
      font += d.style + ' ';
    if (d.weight != 'normal')
      font += d.weight + ' ';
    if (d.variant != 'normal')
      font += d.variant + ' ';

    c.font = font + ~~ ((d.size + 1) / ratio) + 'px ' + d.font;

    var w = c.measureText(d.text).width * ratio,
        h = d.size << 1;

    if (d.rotate) {
      var sr = Math.sin(goog.math.toRadians(d.rotate)),
          cr = Math.cos(goog.math.toRadians(d.rotate)),
          wcr = w * cr,
          wsr = w * sr,
          hcr = h * cr,
          hsr = h * sr;
      w = (Math.max(Math.abs(wcr + hsr), Math.abs(wcr - hsr)) + 0x1f) >> 5 << 5;
      h = ~~Math.max(Math.abs(wsr + hcr), Math.abs(wsr - hcr));
    } else {
      w = (w + 0x1f) >> 5 << 5;
    }
    if (h > maxh) maxh = h;
    if (x + w >= (this.cw << 5)) {
      x = 0;
      y += maxh;
      maxh = 0;
    }
    if (y + h >= this.ch) break;
    c.translate((x + (w >> 1)) / ratio, (y + (h >> 1)) / ratio);
    if (d.rotate) c.rotate(goog.math.toRadians(d.rotate));
    c.fillText(d.text, 0, 0);
    if (padding) c.lineWidth = 2 * padding, c.strokeText(d.text, 0, 0);
    c.restore();
    d.width = w;
    d.height = h;
    d.xoff = x;
    d.yoff = y;
    d.x1 = w >> 1;
    d.y1 = h >> 1;
    d.x0 = -d.x1;
    d.y0 = -d.y1;
    d.hasText = true;
    x += w;
  }
  var pixels = c.getImageData(0, 0, (this.cw << 5) / ratio, this.ch / ratio).data,
      sprite = [];
  while (--di >= 0) {
    d = data[di];
    if (!d.hasText) continue;
    var w = d.width,
        w32 = w >> 5,
        h = d.y1 - d.y0;
    // Zero the buffer
    for (var i = 0; i < h * w32; i++) sprite[i] = 0;
    x = d.xoff;
    if (x == null) return;
    y = d.yoff;
    var seen = 0,
        seenRow = -1;
    for (var j = 0; j < h; j++) {
      for (var i = 0; i < w; i++) {
        var k = w32 * j + (i >> 5),
            m = pixels[((y + j) * (this.cw << 5) + (x + i)) << 2] ? 1 << (31 - (i % 32)) : 0;
        sprite[k] |= m;
        seen |= m;
      }
      if (seen) seenRow = j;
      else {
        d.y0++;
        h--;
        j--;
        y++;
      }
    }
    d.y1 = d.y0 + seenRow;
    d.sprite = sprite.slice(0, (d.y1 - d.y0) * w32);
  }
};


/**
 * @param {Object} tag .
 * @param {Array.<number>} board .
 * @param {number} sw .
 * @return {boolean}
 */
anychart.tagCloudModule.Chart.prototype.cloudCollide = function(tag, board, sw) {
  sw >>= 5;
  var sprite = tag.sprite,
      w = tag.width >> 5,
      lx = tag.x - (w << 4),
      sx = lx & 0x7f,
      msx = 32 - sx,
      h = tag.y1 - tag.y0,
      x = (tag.y + tag.y0) * sw + (lx >> 5),
      last;
  for (var j = 0; j < h; j++) {
    last = 0;
    for (var i = 0; i <= w; i++) {
      if (((last << msx) | (i < w ? (last = sprite[j * w + i]) >>> sx : 0)) & board[x + i]) return true;
    }
    x += sw;
  }
  return false;
};


/**
 * Cloud Bounds.
 * @param {Array.<Object>} bounds .
 * @param {Object} d .
 */
anychart.tagCloudModule.Chart.prototype.cloudBounds = function(bounds, d) {
  var b0 = bounds[0],
      b1 = bounds[1];
  if (d.x + d.x0 < b0.x) b0.x = d.x + d.x0;
  if (d.y + d.y0 < b0.y) b0.y = d.y + d.y0;
  if (d.x + d.x1 > b1.x) b1.x = d.x + d.x1;
  if (d.y + d.y1 > b1.y) b1.y = d.y + d.y1;
};


/**
 * Returns whether rects intersect.
 * @param {Object} a .
 * @param {Array.<Object>} b .
 * @return {boolean}
 */
anychart.tagCloudModule.Chart.prototype.collideRects = function(a, b) {
  return a.x + a.x1 > b[0].x && a.x + a.x0 < b[1].x && a.y + a.y1 > b[0].y && a.y + a.y0 < b[1].y;
};


/**
 * Returns function of archimedean spiral distribution.
 * @param {number} t .
 * @return {Array.<number>}
 */
anychart.tagCloudModule.Chart.prototype.archimedeanSpiral = function(t) {
  var x = (this.w / this.h) * (t *= .1) * Math.cos(t);
  var y = t * Math.sin(t);
  return [x, y];
};


/**
 * Returns function of rectangular spiral distribution.
 * @return {function(number):Array.<number>}
 */
anychart.tagCloudModule.Chart.prototype.rectangularSpiral = function() {
  var dy = 4,
      dx = dy * this.w / this.h,
      x = 0,
      y = 0;
  return function(t) {
    var sign = t < 0 ? -1 : 1;
    // See triangular numbers: T_n = n * (n + 1) / 2.
    switch ((Math.sqrt(1 + 4 * sign * t) - sign) & 3) {
      case 0:
        x += dx;
        break;
      case 1:
        y += dy;
        break;
      case 2:
        x -= dx;
        break;
      default:
        y -= dy;
        break;
    }
    return [x, y];
  };
};


/**
 * Returns array of zero .
 * @param {number} n .
 * @return {Array.<number>}
 */
anychart.tagCloudModule.Chart.prototype.zeroArray = function(n) {
  var a = [],
      i = -1;
  while (++i < n) a[i] = 0;
  return a;
};


/**
 * Returns canvas dom element.
 * @return {Element}
 */
anychart.tagCloudModule.Chart.prototype.cloudCanvas = function() {
  return this.canvas ? this.canvas : (this.canvas = document.createElement('canvas'));
};


/**
 * Returns canvas context and ratio.
 * @param {Element} canvas
 * @return {{context: CanvasRenderingContext2D, ratio: number}}
 */
anychart.tagCloudModule.Chart.prototype.getContext = function(canvas) {
  canvas.width = canvas.height = 1;
  var ratio = Math.sqrt(canvas.getContext('2d').getImageData(0, 0, 1, 1).data.length >> 2);
  canvas.width = (this.cw << 5) / ratio;
  canvas.height = this.ch / ratio;

  var context = canvas.getContext('2d');
  context.fillStyle = context.strokeStyle = 'red';
  context.textAlign = 'center';

  return {
    context: context,
    ratio: ratio
  };
};


/**
 * Placing tag to cloud.
 * @param {Array.<number>} board .
 * @param {Object} tag .
 * @param {Array.<Object>} bounds .
 * @param {number} maxDelta .
 * @return {boolean}
 */
anychart.tagCloudModule.Chart.prototype.place = function(board, tag, bounds, maxDelta) {
  var startX = tag.x,
      startY = tag.y,
      dt = 1, // dt = Math.random() < .5 ? 1 : -1
      t = 0,
      dxdy,
      dx,
      dy;

  while (dxdy = this.layoutFunc_(t)) {
    t += dt;
    dx = ~~dxdy[0];
    dy = ~~dxdy[1];

    if (Math.min(Math.abs(dx), Math.abs(dy)) >= maxDelta) break;

    tag.x = startX + dx;
    tag.y = startY + dy;

    if (tag.x + tag.x0 < 0 || tag.y + tag.y0 < 0 || tag.x + tag.x1 > this.w || tag.y + tag.y1 > this.h) continue;
    if (!bounds || !this.cloudCollide(tag, board, this.w)) {
      if (!bounds || this.collideRects(tag, bounds)) {
        var sprite = tag.sprite,
            w = tag.width >> 5,
            sw = this.w >> 5,
            lx = tag.x - (w << 4),
            sx = lx & 0x7f,
            msx = 32 - sx,
            h = tag.y1 - tag.y0,
            x = (tag.y + tag.y0) * sw + (lx >> 5),
            last;
        for (var j = 0; j < h; j++) {
          last = 0;
          for (var i = 0; i <= w; i++) {
            board[x + i] |= (last << msx) | (i < w ? (last = sprite[j * w + i]) >>> sx : 0);
          }
          x += sw;
        }
        delete tag.sprite;
        return true;
      }
    }
  }
  return false;
};


//endregion
//region --- Calculate
/**
 * Calculating scales.
 */
anychart.tagCloudModule.Chart.prototype.calcScale = function() {
  var iterator = this.getIterator();
  var colorScale = this.getColorScale();
  var scale = this.scale_;
  var autoColors = this.autoColors_;
  var value = parseFloat(iterator.get('value'));
  var category = iterator.get('category');
  var index = iterator.getIndex();

  if (anychart.utils.instanceOf(colorScale, anychart.colorScalesModule.Ordinal) && goog.isDef(category)) {
    var valueForScale = category;
    iterator.meta('category', category);

    var normalFill = this.normal_.getOption('fill');
    if (goog.isFunction(normalFill)) {
      var ctx = {
        'sourceColor': this.palette().itemAt(index),
        'category': category
      };
      normalFill = normalFill.call(ctx, ctx);
    }

    autoColors.push(acgraph.vector.normalizeFill(/** @type {acgraph.vector.Fill} */(normalFill)));
  } else if (this.colorScale_) {
    valueForScale = value;
  } else {
    iterator.meta('category', void 0);
    valueForScale = acgraph.vector.normalizeFill(/** @type {acgraph.vector.Fill} */(this.resolveProperty('fill', 0)));
    autoColors.push(valueForScale);
    valueForScale = goog.isObject(valueForScale) ? valueForScale.color : valueForScale;
    iterator.meta('category', valueForScale);
  }
  colorScale.extendDataRange(valueForScale);
  scale.extendDataRange(value);
};


/**
 * Calculating.
 */
anychart.tagCloudModule.Chart.prototype.calculate = function() {
  var scale = this.scale_;
  if (!scale)
    return;

  var anglesCount, fromAngle, toAngle, range, i, arrAngles, maxValue, value, category, key, index, item;
  var colorScale = this.getColorScale();
  var iterator;

  if (this.hasInvalidationState(anychart.ConsistencyState.TAG_CLOUD_ANGLES)) {
    anglesCount = /** @type {number} */(this.getOption('anglesCount'));
    fromAngle = /** @type {number} */(this.getOption('fromAngle'));
    toAngle = /** @type {number} */(this.getOption('toAngle'));

    range = (toAngle - fromAngle);

    this.calculatedAngles_ = [];
    for (i = 0; i < anglesCount; i++) {
      this.calculatedAngles_.push(fromAngle + (range / (anglesCount == 1 ? anglesCount : anglesCount - 1) * i));
    }

    if (!this.angles_)
      this.invalidate(anychart.ConsistencyState.TAG_CLOUD_TAGS | anychart.ConsistencyState.BOUNDS);

    this.markConsistent(anychart.ConsistencyState.TAG_CLOUD_ANGLES);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.TAG_CLOUD_DATA)) {
    iterator = this.getResetIterator();
    this.tagsPool = [];
    if (this.normalizedData) {
      this.normalizedData.forEach(function(d, i) {
        d.textEl.parent(null);
        d.eHandler.parent(null);
        d.eHandler.removeAllListeners();
        this.tagsPool[i] = d;
      }, this);
    }

    this.normalizedData = [];
    this.autoColors_ = [];
    scale.startAutoCalc();
    colorScale.startAutoCalc();

    while (iterator.advance()) {
      key = String(iterator.get('x')).toLowerCase();
      value = parseFloat(iterator.get('value'));
      category = iterator.get('category');
      index = iterator.getIndex();

      item = this.tagsPool[index] ? this.tagsPool[index] : {};
      item.rowIndex = index;
      item.text = key;
      item.value = value;
      item.drawed = false;
      item.category = category;
      this.normalizedData.push(item);
      iterator.meta('item', item);

      this.calcScale();
    }

    scale.finishAutoCalc();
    colorScale.finishAutoCalc();
    if (!this.colorScale_) {
      goog.array.removeDuplicates(this.autoColors_, void 0, function(item) {
        return goog.isObject(item) ? item.color + ' ' + item.opacity : item;
      });
      colorScale.setAutoColors(this.autoColors_);
    }

    goog.array.stableSort(this.normalizedData, (function(a, b) {
      return b.value - a.value;
    }));

    this.invalidate(anychart.ConsistencyState.TAG_CLOUD_TAGS | anychart.ConsistencyState.BOUNDS);
    this.markConsistent(anychart.ConsistencyState.TAG_CLOUD_DATA |
        anychart.ConsistencyState.TAG_CLOUD_COLOR_SCALE |
        anychart.ConsistencyState.TAG_CLOUD_SCALE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.TAG_CLOUD_COLOR_SCALE |
          anychart.ConsistencyState.TAG_CLOUD_SCALE)) {

    this.autoColors_ = [];
    iterator = this.getResetIterator();
    scale.startAutoCalc();
    colorScale.startAutoCalc();

    while (iterator.advance()) {
      this.calcScale();
    }

    colorScale.finishAutoCalc();
    if (!this.colorScale_) {
      goog.array.removeDuplicates(this.autoColors_, void 0, function(item) {
        return goog.isObject(item) ? item.color + ' ' + item.opacity : item;
      });
      colorScale.setAutoColors(this.autoColors_);
    }

    if (this.hasInvalidationState(anychart.ConsistencyState.TAG_CLOUD_COLOR_SCALE)) {
      this.invalidate(anychart.ConsistencyState.APPEARANCE |
          anychart.ConsistencyState.CHART_LEGEND |
          anychart.ConsistencyState.TAG_CLOUD_TAGS |
          anychart.ConsistencyState.TAG_CLOUD_COLOR_RANGE);
    }

    if (this.hasInvalidationState(anychart.ConsistencyState.TAG_CLOUD_SCALE)) {
      this.invalidate(anychart.ConsistencyState.TAG_CLOUD_TAGS |
          anychart.ConsistencyState.TAG_CLOUD_COLOR_RANGE |
          anychart.ConsistencyState.BOUNDS);
    }

    this.markConsistent(anychart.ConsistencyState.TAG_CLOUD_COLOR_SCALE |
        anychart.ConsistencyState.TAG_CLOUD_SCALE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.TAG_CLOUD_TAGS)) {
    arrAngles = this.angles_ ? this.angles_ : this.calculatedAngles_;
    var zeroAngleIndex = Math.max(goog.array.indexOf(arrAngles, 0), 0);
    anglesCount = /** @type {number} */(arrAngles.length);
    maxValue = this.normalizedData.length ? this.normalizedData[0].value : NaN;
    iterator = this.getIterator();

    var pointsCount = this.normalizedData.length;
    var sum = 0;

    this.normalizedData.forEach(function(t, i) {
      var state = anychart.core.utils.InteractivityState.clarifyState(this.state.getPointStateByIndex(t.rowIndex));
      iterator.select(t.rowIndex);

      var fontFamily = this.resolveProperty('fontFamily', state);
      var fontStyle = this.resolveProperty('fontStyle', state);
      var fontVariant = this.resolveProperty('fontVariant', state);
      var fontWeight = this.resolveProperty('fontWeight', state);
      var fill = acgraph.vector.normalizeFill(/** @type {acgraph.vector.Fill} */(this.resolveProperty('fill', state)));

      t.font = /** @type {string} */(fontFamily);
      t.style = /** @type {string} */(fontStyle);
      t.variant = /** @type {string} */(fontVariant);
      t.weight = /** @type {number|string} */(fontWeight);
      t.fill = fill;

      t.rotate = arrAngles[(i + zeroAngleIndex + anglesCount) % anglesCount];

      sum += t.value;
    }, this);

    this.statistics(anychart.enums.Statistics.SUM, sum);
    this.statistics(anychart.enums.Statistics.MAX, maxValue);
    this.statistics(anychart.enums.Statistics.MIN, this.normalizedData.length ? this.normalizedData[pointsCount - 1].value : NaN);
    this.statistics(anychart.enums.Statistics.AVERAGE, sum / pointsCount);
    this.statistics(anychart.enums.Statistics.POINTS_COUNT, pointsCount);

    this.markConsistent(anychart.ConsistencyState.TAG_CLOUD_TAGS);
  }
};


//endregion
//region --- Drawing
/** @inheritDoc */
anychart.tagCloudModule.Chart.prototype.beforeDraw = function() {
  this.calculate();
};


/** @inheritDoc */
anychart.tagCloudModule.Chart.prototype.drawContent = function(bounds) {
  var scale = this.scale();
  var colorRange = this.getCreated('colorRange');
  if (this.hasInvalidationState(anychart.ConsistencyState.TAG_CLOUD_COLOR_RANGE)) {
    if (colorRange) {
      colorRange.suspendSignalsDispatching();
      colorRange.scale(this.getColorScale());
      colorRange.target(this);
      colorRange.setParentEventTarget(this);
      colorRange.resumeSignalsDispatching(false);
      if (colorRange.enabled())
        this.invalidate(anychart.ConsistencyState.BOUNDS);
    }
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    if (colorRange && colorRange.enabled()) {
      colorRange.parentBounds(bounds.clone().round());
      this.internalBounds_ = colorRange.getRemainingBounds();
    } else {
      this.internalBounds_ = bounds.clone();
    }
    this.w = this.internalBounds_.width;
    this.h = this.internalBounds_.height;

    this.layoutFunc_ = this.getOption('mode') == anychart.enums.TagCloudMode.SPIRAL ?
        this.archimedeanSpiral :
        this.rectangularSpiral();

    var n = this.normalizedData.length,
        topTag = this.normalizedData[0],
        i = -1,
        cloudBounds = null,
        contextAndRatio = this.getContext(this.cloudCanvas()),
        board = this.zeroArray((this.w >> 5) * this.h),
        maxDelta = Math.sqrt(this.w * this.w + this.h * this.h);

    this.calculateMaxFontSize(topTag);

    this.normalizedData.forEach(function(d) {
      this.getIterator().select(d.rowIndex);
      delete d.size;
      delete d.sprite;
      var state = anychart.core.utils.InteractivityState.clarifyState(this.state.getPointStateByIndex(d.rowIndex));
      var fontSize = this.resolveProperty('fontSize', state);
      var ratio = goog.math.clamp(scale.transform(d.value), 0, 1);

      var autoFontSize = ~~(this.minFontSize + ratio * (this.maxFontSize - this.minFontSize));
      d.size = /** @type {number} */(goog.isDefAndNotNull(fontSize) ? anychart.utils.isPercent(fontSize) ? autoFontSize * parseFloat(fontSize) / 100 : fontSize : autoFontSize);
    }, this);

    while (++i < n) {
      var d = this.normalizedData[i];
      d.x = this.w >> 1;
      d.y = this.h >> 1;
      this.cloudSprite(contextAndRatio, d, this.normalizedData, i);
      if (d.hasText && this.place(board, d, cloudBounds, maxDelta)) {
        if (cloudBounds) this.cloudBounds(cloudBounds, d);
        else cloudBounds = [{x: d.x + d.x0, y: d.y + d.y0}, {x: d.x + d.x1, y: d.y + d.y1}];
        d.x -= this.w >> 1;
        d.y -= this.h >> 1;
      }
    }

    var scale_ = cloudBounds ?
        Math.min(
            this.w / Math.abs(cloudBounds[1].x - this.w / 2),
            this.w / Math.abs(cloudBounds[0].x - this.w / 2),
            this.h / Math.abs(cloudBounds[1].y - this.h / 2),
            this.h / Math.abs(cloudBounds[0].y - this.h / 2)) / 2 :
        1;

    if (!this.layer_) {
      this.layer_ = this.rootElement.layer();
    }

    var background = this.getCreated('background');
    if (background) {
      this.layer_.zIndex((background.zIndex() || 0) + 1);
    }

    if (!this.handlers_) {
      this.handlers_ = this.layer_.layer();
      this.bindHandlersToGraphics(this.handlers_);
    }

    if (!this.texts_) {
      this.texts_ = this.layer_.layer();
    }

    this.lCenterX_ = this.internalBounds_.left + (this.w >> 1);
    this.lCenterY_ = this.internalBounds_.top + (this.h >> 1);
    this.lScale_ = scale_;
    this.layer_
        .setTransformationMatrix(scale_, 0, 0, scale_, this.lCenterX_, this.lCenterY_);
    var tx = this.layer_.getSelfTransformation();


    this.normalizedData.forEach(function(t) {
      var arr = [t.x, t.y];
      tx.transform(arr, 0, arr, 0, 1);

      var outBounds = arr[0] + t.x0 < this.internalBounds_.left ||
          arr[0] + t.x1 > this.internalBounds_.getRight() ||
          arr[1] + t.y0 < this.internalBounds_.top ||
          arr[1] + t.y1 > this.internalBounds_.getBottom();

      if (outBounds) {
        if (t.drawed) {
          t.textEl.parent(null);
          t.eHandler.parent(null);
        }
        t.drawed = false;
        return;
      }

      if (!t.drawed) {
        t.textEl = t.textEl ? t.textEl.parent(this.texts_) : this.texts_.simpleText();
        t.textEl.attr('text-anchor', 'middle');
        t.textEl.disablePointerEvents(true);
        t.textEl.text(t.text.toLowerCase());
        t.textEl.cursor(acgraph.vector.Cursor.DEFAULT);

        t.eHandler = t.eHandler ? t.eHandler.parent(this.handlers_) : this.handlers_.simpleText();
        this.makeInteractive(t);
        t.eHandler.attr('fill', '#fff');
        t.eHandler.attr('opacity', 0.000001);
        t.eHandler.attr('text-anchor', 'middle');
        t.eHandler.text(t.text.toLowerCase());
        t.eHandler.cursor(acgraph.vector.Cursor.DEFAULT);

        t.drawed = true;
      }

      var state = anychart.core.utils.InteractivityState.clarifyState(this.state.getPointStateByIndex(t.rowIndex));

      this.getIterator().select(t.rowIndex);

      var fill = acgraph.vector.normalizeFill(/** @type {acgraph.vector.Fill} */(this.resolveProperty('fill', state)));
      var fontFamily = this.resolveProperty('fontFamily', state);
      var fontStyle = this.resolveProperty('fontStyle', state);
      var fontVariant = this.resolveProperty('fontVariant', state);
      var fontWeight = this.resolveProperty('fontWeight', state);
      var fontSize = this.resolveProperty('fontSize', state);

      this.applyFill(t.textEl, fill);
      t.textEl.attr('font-family', fontFamily);
      t.textEl.attr('font-style', fontStyle);
      t.textEl.attr('font-variant', fontVariant);
      t.textEl.attr('font-weight', fontWeight);
      t.textEl.attr('font-size', fontSize);
      t.textEl.attr('transform', 'translate(' + [t.x, t.y] + ')rotate(' + t.rotate + ')');
      t.textEl.zIndex(anychart.core.shapeManagers.FILL_SHAPES_ZINDEX);

      t.eHandler.attr('font-family', fontFamily);
      t.eHandler.attr('font-style', fontStyle);
      t.eHandler.attr('font-variant', fontVariant);
      t.eHandler.attr('font-weight', fontWeight);
      t.eHandler.attr('font-size', fontSize);
      t.eHandler.attr('transform', 'translate(' + [t.x, t.y] + ')rotate(' + t.rotate + ')');
      t.eHandler.zIndex(anychart.core.shapeManagers.FILL_SHAPES_ZINDEX);
    }, this);

    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.TAG_CLOUD_COLOR_RANGE)) {
    if (colorRange) {
      colorRange.suspendSignalsDispatching();
      colorRange.container(this.rootElement);
      colorRange.draw();
      colorRange.resumeSignalsDispatching(false);
    }
    this.markConsistent(anychart.ConsistencyState.TAG_CLOUD_COLOR_RANGE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    var iterator = this.getResetIterator();
    this.normalizedData.forEach(function(t) {
      var state = anychart.core.utils.InteractivityState.clarifyState(this.state.getPointStateByIndex(t.rowIndex));
      iterator.select(t.rowIndex);
      if (t.drawed && t.textEl)
        this.applyFill(t.textEl, acgraph.vector.normalizeFill(/** @type {acgraph.vector.Fill} */(this.resolveProperty('fill', state))));
    }, this);

    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }
};


//endregion
//region --- CSV
//------------------------------------------------------------------------------
//
//  CSV
//
//------------------------------------------------------------------------------
/** @inheritDoc */
anychart.tagCloudModule.Chart.prototype.getCsvGrouperColumn = function() {
  return ['x'];
};


/** @inheritDoc */
anychart.tagCloudModule.Chart.prototype.getCsvGrouperValue = function(iterator) {
  return iterator.get('x');
};


/** @inheritDoc */
anychart.tagCloudModule.Chart.prototype.getCsvGrouperAlias = function(iterator) {
  var res = iterator.get('name');
  return goog.isString(res) ? res : null;
};


/** @inheritDoc */
anychart.tagCloudModule.Chart.prototype.getCsvColumns = function(dataHolder) {
  return this.data().checkFieldExist('category') ? ['value', 'category'] : ['value'];
};


//endregion
//region --- No data
/** @inheritDoc */
anychart.tagCloudModule.Chart.prototype.isNoData = function() {
  var rowsCount = this.getIterator().getRowsCount();
  return (!rowsCount);
};


//endregion
//region --- Setup and Dispose
/**
 * Sets default settings.
 * @param {!Object} config
 */
anychart.tagCloudModule.Chart.prototype.setThemeSettings = function(config) {
  anychart.core.settings.copy(this.themeSettings, anychart.tagCloudModule.Chart.SIMPLE_PROPS_DESCRIPTORS, config);
};


/**
 * Create scale instance from config and return it.
 * @param {?(Object|string)} config
 * @return {?anychart.scales.Base} scale instance or null.
 * */
anychart.tagCloudModule.Chart.prototype.getScale = function(config) {
  var scale;
  if (goog.isString(config)) {
    scale = anychart.scales.Base.fromString(config, null);
    if (!scale)
      scale = null;
  } else if (goog.isObject(config)) {
    scale = anychart.scales.Base.fromString(config['type'], true);
    scale.setup(config);
  } else {
    scale = null;
  }
  return scale;
};


/**
 * Setup scale and color scale if in config.
 * @param {Object} config Json config or config from theme.
 * */
anychart.tagCloudModule.Chart.prototype.setupScales = function(config) {

  var scaleConfig = config['scale'];
  var scale = this.getScale(scaleConfig);
  if (scale)
    this.scale(scale);

  scaleConfig = config['colorScale'];
  scale = this.getScale(scaleConfig);
  if (scale)
    this.colorScale(/** @type {anychart.colorScalesModule.Linear|anychart.colorScalesModule.Ordinal} */(scale));
};


/** @inheritDoc */
anychart.tagCloudModule.Chart.prototype.setupByJSON = function(config, opt_default) {
  anychart.tagCloudModule.Chart.base(this, 'setupByJSON', config, opt_default);
  anychart.core.settings.deserialize(this, anychart.tagCloudModule.Chart.SIMPLE_PROPS_DESCRIPTORS, config, opt_default);

  this.setupScales(config);
  this.data(config['data']);
  this.angles(config['angles']);
  this.palette(config['palette']);
  this.colorRange().setupInternal(!!opt_default, config['colorRange']);
  this.normal_.setupInternal(!!opt_default, config);
  this.normal_.setupInternal(!!opt_default, config['normal']);
  this.hovered_.setupInternal(!!opt_default, config['hovered']);
  this.selected_.setupInternal(!!opt_default, config['selected']);
};


/** @inheritDoc */
anychart.tagCloudModule.Chart.prototype.serialize = function() {
  var json = anychart.tagCloudModule.Chart.base(this, 'serialize');

  anychart.core.settings.serialize(this, anychart.tagCloudModule.Chart.SIMPLE_PROPS_DESCRIPTORS, json);

  json['data'] = this.data().serialize();
  if (goog.isDef(this.angles_))
    json['angles'] = this.angles_;
  json['scale'] = this.scale().serialize();
  if (this.colorScale())
    json['colorScale'] = this.colorScale().serialize();
  json['colorRange'] = this.colorRange().serialize();
  json['palette'] = this.palette().serialize();
  json['normal'] = this.normal_.serialize();
  json['hovered'] = this.hovered_.serialize();
  json['selected'] = this.selected_.serialize();

  return {'chart': json};
};


/** @inheritDoc */
anychart.tagCloudModule.Chart.prototype.disposeInternal = function() {
  for (var i = 0; i < this.normalizedData.length; i++) {
    var item = this.normalizedData[i];
    goog.dispose(item.textEl);
    goog.dispose(item.eHandler);
    goog.dispose(item.sprite);
  }

  goog.disposeAll(
      this.texts_,
      this.handlers_,
      this.layer_,
      this.normal_,
      this.hovered_,
      this.selected_,
      this.colorRange_,
      this.state,
      this.palette_,
      this.data_,
      this.parentViewToDispose_);

  this.texts_ = null;
  this.handlers_ = null;
  this.layer_ = null;
  this.normal_ = null;
  this.hovered_ = null;
  this.selected_ = null;
  this.colorRange_ = null;
  this.colorScale_ = null;
  this.scale_ = null;
  this.state = null;
  this.palette_ = null;
  delete this.data_;
  this.parentViewToDispose_ = null;

  anychart.tagCloudModule.Chart.base(this, 'disposeInternal');
};


//endregion
//region --- Exports
//exports
(function() {
  var proto = anychart.tagCloudModule.Chart.prototype;
  // proto['mode'] = proto.mode;
  // proto['fromAngel'] = proto.fromAngle;
  // proto['toAngle'] = proto.toAngle;
  // proto['anglesCount'] = proto.anglesCount;
  // proto['textSpacing'] = proto.textSpacing;
  proto['getType'] = proto.getType;
  proto['data'] = proto.data;
  proto['angles'] = proto.angles;
  proto['scale'] = proto.scale;
  proto['colorScale'] = proto.colorScale;
  proto['colorRange'] = proto.colorRange;
  proto['palette'] = proto.palette;
  proto['normal'] = proto.normal;
  proto['hovered'] = proto.hovered;
  proto['selected'] = proto.selected;

  proto['hover'] = proto.hoverPoint;
  proto['unhover'] = proto.unhover;

  proto['select'] = proto.selectPoint;
  proto['unselect'] = proto.unselect;

  proto['getPoint'] = proto.getPoint;
})();
//exports
//endregion
