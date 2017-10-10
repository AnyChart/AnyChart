//region --- Requiring and Providing
goog.provide('anychart.charts.TagCloud');
goog.require('acgraph.vector.SimpleText');
goog.require('anychart.core.Point');
goog.require('anychart.core.SeparateChart');
goog.require('anychart.core.TagCloudStateSettings');
goog.require('anychart.core.settings');
goog.require('anychart.core.ui.ColorRange');
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
 * @implements {anychart.core.settings.IObjectWithSettings}
 * @implements {anychart.core.settings.IResolvable}
 */
anychart.charts.TagCloud = function(opt_data, opt_settings) {
  anychart.charts.TagCloud.base(this, 'constructor');

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

  /**
   * Theme settings.
   * @type {Object}
   */
  this.themeSettings = {};

  /**
   * Own settings (Settings set by user with API).
   * @type {Object}
   */
  this.ownSettings = {};

  /**
   * @type {anychart.core.TagCloudStateSettings}
   * @private
   */
  this.normal_ = new anychart.core.TagCloudStateSettings();
  this.normal_.listenSignals(this.normalStateListener_, this);

  /**
   * @type {anychart.core.TagCloudStateSettings}
   * @private
   */
  this.hovered_ = new anychart.core.TagCloudStateSettings();
  this.hovered_.listenSignals(this.normalStateListener_, this);

  /**
   * @type {anychart.core.TagCloudStateSettings}
   * @private
   */
  this.selected_ = new anychart.core.TagCloudStateSettings();
  this.selected_.listenSignals(this.normalStateListener_, this);

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
   * @type {Array.<anychart.charts.TagCloud.Tag>}
   */
  this.normalizedData;

  this.data(opt_data || null, opt_settings);
};
goog.inherits(anychart.charts.TagCloud, anychart.core.SeparateChart);


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.charts.TagCloud.prototype.SUPPORTED_CONSISTENCY_STATES =
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
 *   hasText: boolean
 * }}
 */
anychart.charts.TagCloud.Tag;


//region --- IResolvable implementation
/** @inheritDoc */
anychart.charts.TagCloud.prototype.resolutionChainCache = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.resolutionChainCache_ = opt_value;
  }
  return this.resolutionChainCache_;
};


/**
 * Resolution chain getter.
 * @return {Array.<Object|null|undefined>} - Chain of settings.
 */
anychart.charts.TagCloud.prototype.getResolutionChain = function() {
  var chain = this.resolutionChainCache();
  if (!chain) {
    chain = goog.array.concat(this.getHighPriorityResolutionChain(), this.getLowPriorityResolutionChain());
    this.resolutionChainCache(chain);
  }
  return chain;
};


/** @inheritDoc */
anychart.charts.TagCloud.prototype.getLowPriorityResolutionChain = function() {
  var sett = [this.themeSettings];
  if (this.parent_) {
    sett = goog.array.concat(sett, this.parent_.getLowPriorityResolutionChain());
  }
  return sett;
};


/** @inheritDoc */
anychart.charts.TagCloud.prototype.getHighPriorityResolutionChain = function() {
  var sett = [this.ownSettings];
  if (this.parent_) {
    sett = goog.array.concat(sett, this.parent_.getHighPriorityResolutionChain());
  }
  return sett;
};


//endregion
//region --- IObjectWithSettings implementation
/** @inheritDoc */
anychart.charts.TagCloud.prototype.getOwnOption = function(name) {
  return this.ownSettings[name];
};


/** @inheritDoc */
anychart.charts.TagCloud.prototype.hasOwnOption = function(name) {
  return goog.isDefAndNotNull(this.ownSettings[name]);
};


/** @inheritDoc */
anychart.charts.TagCloud.prototype.getThemeOption = function(name) {
  return this.themeSettings[name];
};


/** @inheritDoc */
anychart.charts.TagCloud.prototype.getOption = anychart.core.settings.getOption;


/** @inheritDoc */
anychart.charts.TagCloud.prototype.setOption = function(name, value) {
  this.ownSettings[name] = value;
};


/** @inheritDoc */
anychart.charts.TagCloud.prototype.check = function(flags) {
  return true;
};


//endregion
//region --- Descriptors
/**
 * Simple properties descriptors.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.charts.TagCloud.prototype.SIMPLE_PROPS_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'mode',
      anychart.enums.normalizeTagCloudMode,
      anychart.ConsistencyState.BOUNDS,
      anychart.Signal.NEEDS_REDRAW);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'fromAngle',
      anychart.core.settings.numberNormalizer,
      anychart.ConsistencyState.TAG_CLOUD_ANGLES,
      anychart.Signal.NEEDS_REDRAW);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'toAngle',
      anychart.core.settings.numberNormalizer,
      anychart.ConsistencyState.TAG_CLOUD_ANGLES,
      anychart.Signal.NEEDS_REDRAW);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'anglesCount',
      anychart.core.settings.numberNormalizer,
      anychart.ConsistencyState.TAG_CLOUD_ANGLES,
      anychart.Signal.NEEDS_REDRAW);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'textSpacing',
      anychart.core.settings.numberNormalizer,
      anychart.ConsistencyState.BOUNDS,
      anychart.Signal.NEEDS_REDRAW);

  return map;
})();
anychart.core.settings.populate(anychart.charts.TagCloud, anychart.charts.TagCloud.prototype.SIMPLE_PROPS_DESCRIPTORS);


//endregion
//region --- Chart Infrastructure Overrides
//------------------------------------------------------------------------------
//
//  Chart Infrastructure Overrides
//
//------------------------------------------------------------------------------
/** @inheritDoc */
anychart.charts.TagCloud.prototype.getType = function() {
  return anychart.enums.ChartTypes.TAG_CLOUD;
};


/**
 * Returns chart.
 * @return {anychart.charts.TagCloud}
 */
anychart.charts.TagCloud.prototype.getChart = function() {
  return this;
};


/**
 * Tester if the series is discrete based.
 * @return {boolean}
 */
anychart.charts.TagCloud.prototype.isDiscreteBased = function() {
  return true;
};


/**
 * Tester if the series is discrete based.
 * @return {boolean}
 */
anychart.charts.TagCloud.prototype.isSizeBased = function() {
  return false;
};


/**
 * @inheritDoc
 */
anychart.charts.TagCloud.prototype.isSeries = function() {
  return true;
};


/** @inheritDoc */
anychart.charts.TagCloud.prototype.getAllSeries = function() {
  return [this];
};


/** @inheritDoc */
anychart.charts.TagCloud.prototype.getPoint = function(index) {
  var iterator = this.getIterator();
  iterator.select(index);

  return new anychart.core.Point(this, index);
};


/** @inheritDoc */
anychart.charts.TagCloud.prototype.getSeriesStatus = function() {
  return null;
};


/**
 * Returns current view iterator.
 * @return {!anychart.data.Iterator} Current chart view iterator.
 */
anychart.charts.TagCloud.prototype.getIterator = function() {
  return this.iterator_ || (this.iterator_ = this.data_.getIterator());
};


/**
 * Returns new default iterator for the current mapping.
 * @return {!anychart.data.Iterator} New iterator.
 */
anychart.charts.TagCloud.prototype.getResetIterator = function() {
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
anychart.charts.TagCloud.prototype.rawData_;


/**
 * View to dispose on next data set, if any.
 * @type {goog.Disposable}
 * @private
 */
anychart.charts.TagCloud.prototype.parentViewToDispose_;


/**
 * Chart data.
 * @type {!anychart.data.View}
 * @private
 */
anychart.charts.TagCloud.prototype.data_;


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
 * @return {!(anychart.palettes.RangeColors|anychart.palettes.DistinctColors|anychart.charts.TagCloud)} .
 */
anychart.charts.TagCloud.prototype.palette = function(opt_value) {
  if (acgraph.utils.instanceOf(opt_value, anychart.palettes.RangeColors)) {
    this.setupPalette_(anychart.palettes.RangeColors, /** @type {anychart.palettes.RangeColors} */(opt_value));
    return this;
  } else if (acgraph.utils.instanceOf(opt_value, anychart.palettes.DistinctColors)) {
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
anychart.charts.TagCloud.prototype.setupPalette_ = function(cls, opt_cloneFrom) {
  if (acgraph.utils.instanceOf(this.palette_, cls)) {
    if (opt_cloneFrom)
      this.palette_.setup(opt_cloneFrom);
  } else {
    // we dispatch only if we replace existing palette.
    var doDispatch = !!this.palette_;
    goog.dispose(this.palette_);
    this.palette_ = new cls();
    if (opt_cloneFrom)
      this.palette_.setup(opt_cloneFrom);
    this.palette_.listenSignals(this.paletteInvalidated_, this);
    this.registerDisposable(this.palette_);
    if (doDispatch)
      this.invalidate(anychart.ConsistencyState.CHART_LEGEND, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Internal palette invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.charts.TagCloud.prototype.paletteInvalidated_ = function(event) {
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
anychart.charts.TagCloud.prototype.getColorResolutionContext = function(opt_baseColor) {
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
    var valueForScale = acgraph.utils.instanceOf(colorScale, anychart.scales.OrdinalColor) && goog.isDef(category) ?
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
anychart.charts.TagCloud.prototype.applyFill = function(element, fill) {
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
 * @return {anychart.scales.OrdinalColor|anychart.scales.LinearColor}
 */
anychart.charts.TagCloud.prototype.getColorScale = function() {
  return this.colorScale_ || this.autoColorScale_ || (this.autoColorScale_ = anychart.scales.ordinalColor());
};


//endregion
//region --- Interactivity
/**
 * Create chart label/tooltip format provider.
 * @return {Object} Object with info for labels/tooltip formatting.
 * @protected
 */
anychart.charts.TagCloud.prototype.createFormatProvider = function() {
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
anychart.charts.TagCloud.prototype.createTooltipContextProvider = function() {
  return this.createFormatProvider();
};


/**
 * Apply appearance to series.
 * @param {anychart.PointState|number} pointState .
 */
anychart.charts.TagCloud.prototype.applyAppearanceToSeries = function(pointState) {};


/**
 * Apply appearance to point.
 * @param {anychart.PointState|number} pointState
 */
anychart.charts.TagCloud.prototype.applyAppearanceToPoint = function(pointState) {
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
};


/** @inheritDoc */
anychart.charts.TagCloud.prototype.doAdditionActionsOnMouseOverAndMove = function(index, series) {
  var colorRange = this.colorRange();
  index = goog.isArray(index) ? index.length ? index[0] : NaN : index;
  if (colorRange && colorRange.target() && !isNaN(index)) {
    var target = /** @type {anychart.core.series.Map} */(colorRange.target());
    var iterator = target.getIterator();
    iterator.select(index);
    var colorScale = this.getColorScale();
    var value;
    if (acgraph.utils.instanceOf(colorScale, anychart.scales.OrdinalColor)) {
      value = iterator.meta(this.categoryFieldName);
    } else {
      value = iterator.get(this.referenceValueNames[1]);
    }
    colorRange.showMarker(/** @type {number} */(value));
  }
};


/** @inheritDoc */
anychart.charts.TagCloud.prototype.doAdditionActionsOnMouseOut = function() {
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
anychart.charts.TagCloud.prototype.getItemProp = function(item, propName) {
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
anychart.charts.TagCloud.prototype.resolveProperty = function(propName, state) {
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
anychart.charts.TagCloud.prototype.makeInteractive = function(item) {
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
anychart.charts.TagCloud.prototype.makePointEvent = function(event) {
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
anychart.charts.TagCloud.prototype.makeBrowserEvent = function(e) {
  var res = {
    'type': e['type'],
    'target': this,
    'relatedTarget': this.getOwnerElement(e['relatedTarget']) || e['relatedTarget'],
    'domTarget': e['target'],
    'relatedDomTarget': e['relatedTarget'],
    'offsetX': e['offsetX'],
    'offsetY': e['offsetY'],
    'clientX': e['clientX'],
    'clientY': e['clientY'],
    'screenX': e['screenX'],
    'screenY': e['screenY'],
    'button': e['button'],
    'keyCode': e['keyCode'],
    'charCode': e['charCode'],
    'ctrlKey': e['ctrlKey'],
    'altKey': e['altKey'],
    'shiftKey': e['shiftKey'],
    'metaKey': e['metaKey'],
    'platformModifierKey': e['platformModifierKey'],
    'state': e['state']
  };

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
anychart.charts.TagCloud.prototype.finalizePointAppearance = function() {};


/**
 * Internal dummy getter/setter for Resource chart hover mode.
 * @param {anychart.enums.HoverMode=} opt_value Hover mode.
 * @return {anychart.charts.TagCloud|anychart.enums.HoverMode} .
 */
anychart.charts.TagCloud.prototype.hoverMode = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeHoverMode(opt_value);
    if (opt_value != this.hoverMode_) {
      this.hoverMode_ = opt_value;
    }
    return this;
  }
  return /** @type {anychart.enums.HoverMode}*/(this.hoverMode_);
};


/**
 * @param {(anychart.enums.SelectionMode|string)=} opt_value Selection mode.
 * @return {anychart.charts.TagCloud|anychart.enums.SelectionMode} .
 */
anychart.charts.TagCloud.prototype.selectionMode = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.interactivity().selectionMode(opt_value);
    return this;
  } else {
    return /** @type {anychart.enums.SelectionMode} */(this.interactivity().selectionMode());
  }
};


/**
 * Selects a point of the series by its index.
 * @param {number|Array<number>} indexOrIndexes Index of the point to select.
 * @param {anychart.core.MouseEvent=} opt_event Event that initiate point selecting.
 * @return {!anychart.charts.TagCloud} {@link anychart.charts.TagCloud} instance for method chaining.
 */
anychart.charts.TagCloud.prototype.selectPoint = function(indexOrIndexes, opt_event) {
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
anychart.charts.TagCloud.prototype.unselect = function(opt_indexOrIndexes) {
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
 * @return {!anychart.charts.TagCloud}  {@link anychart.charts.TagCloud} instance for method chaining.
 */
anychart.charts.TagCloud.prototype.hoverPoint = function(index) {
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
anychart.charts.TagCloud.prototype.unhover = function(opt_indexOrIndexes) {
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
 * @return {(!anychart.charts.TagCloud|!anychart.data.View)} Returns itself if used as a setter or the mapping if used as a getter.
 */
anychart.charts.TagCloud.prototype.data = function(opt_value, opt_settings) {
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
      if (acgraph.utils.instanceOf(opt_value, anychart.data.View))
        this.data_ = this.parentViewToDispose_ = opt_value.derive(); // deriving a view to avoid interference with other view users
      else if (acgraph.utils.instanceOf(opt_value, anychart.data.Set))
        this.data_ = this.parentViewToDispose_ = opt_value.mapAs();
      else {
        this.data_ = (this.parentViewToDispose_ = new anychart.data.Set(
            (goog.isArray(opt_value) || goog.isString(opt_value)) ? opt_value : null, opt_settings)).mapAs();
      }
      this.data_.listenSignals(this.dataInvalidated_, this);
      this.invalidate(anychart.ConsistencyState.TAG_CLOUD_DATA, anychart.Signal.NEEDS_REDRAW);
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
anychart.charts.TagCloud.prototype.dataInvalidated_ = function(event) {
  this.invalidate(anychart.ConsistencyState.TAG_CLOUD_DATA, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Tags rotation angles.
 * @param {Array.<number>=} opt_value .
 * @return {Array.<number>|anychart.charts.TagCloud}
 */
anychart.charts.TagCloud.prototype.angles = function(opt_value) {
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
 * @param {(anychart.enums.ScaleTypes|anychart.scales.Base)=} opt_value .
 * @return {anychart.scales.Base|anychart.charts.TagCloud}
 */
anychart.charts.TagCloud.prototype.scale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (goog.isString(opt_value)) {
      opt_value = anychart.scales.Base.fromString(opt_value, false);
    }
    if (acgraph.utils.instanceOf(opt_value, anychart.scales.Linear) && this.scale_ != opt_value) {
      if (this.scale_)
        this.scale_.unlistenSignals(this.scaleInvalidated, this);
      this.scale_ = /** @type {anychart.scales.Linear} */(opt_value);
      if (this.scale_)
        this.scale_.listenSignals(this.scaleInvalidated, this);

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
anychart.charts.TagCloud.prototype.scaleInvalidated = function(event) {
  this.invalidate(anychart.ConsistencyState.TAG_CLOUD_SCALE, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Color scale.
 * @param {(anychart.scales.LinearColor|anychart.scales.OrdinalColor)=} opt_value Scale to set.
 * @return {anychart.scales.OrdinalColor|anychart.scales.LinearColor|anychart.charts.TagCloud} Default chart color scale value or itself for
 * method chaining.
 */
anychart.charts.TagCloud.prototype.colorScale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.colorScale_ != opt_value) {
      if (this.colorScale_)
        this.colorScale_.unlistenSignals(this.colorScaleInvalidated_, this);
      this.colorScale_ = opt_value;
      if (this.colorScale_)
        this.colorScale_.listenSignals(this.colorScaleInvalidated_, this);

      this.invalidate(anychart.ConsistencyState.TAG_CLOUD_COLOR_SCALE,
          anychart.Signal.NEEDS_REDRAW |
          anychart.Signal.NEED_UPDATE_COLOR_RANGE);
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
anychart.charts.TagCloud.prototype.colorScaleInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_RECALCULATION | anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.TAG_CLOUD_COLOR_SCALE,
        anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEED_UPDATE_COLOR_RANGE);
  }
};


/**
 * Normal state settings.
 * @param {!Object=} opt_value .
 * @return {anychart.core.TagCloudStateSettings|anychart.charts.TagCloud}
 */
anychart.charts.TagCloud.prototype.normal = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.normal_.setupByJSON(opt_value);
    return this;
  }
  return this.normal_;
};


/**
 * Internal normal state invalidation handler.
 * @param {anychart.SignalEvent} e Event object.
 * @private
 */
anychart.charts.TagCloud.prototype.normalStateListener_ = function(e) {
  var state = 0;
  var signal = anychart.Signal.NEEDS_REDRAW;

  if (e.hasSignal(anychart.Signal.BOUNDS_CHANGED))
    state |= anychart.ConsistencyState.TAG_CLOUD_TAGS | anychart.ConsistencyState.BOUNDS;

  if (e.hasSignal(anychart.Signal.NEEDS_REDRAW_APPEARANCE))
    state |= anychart.ConsistencyState.APPEARANCE;

  this.invalidate(state, signal);
};


/**
 * Hovered state settings.
 * @param {!Object=} opt_value .
 * @return {anychart.core.TagCloudStateSettings|anychart.charts.TagCloud}
 */
anychart.charts.TagCloud.prototype.hovered = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.hovered_.setupByJSON(opt_value);
    return this;
  }
  return this.hovered_;
};


/**
 * Selected state settings.
 * @param {!Object=} opt_value .
 * @return {anychart.core.TagCloudStateSettings|anychart.charts.TagCloud}
 */
anychart.charts.TagCloud.prototype.selected = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.selected_.setupByJSON(opt_value);
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
 * @return {!(anychart.core.ui.ColorRange|anychart.charts.TagCloud)} Return current chart markers palette or itself for chaining call.
 */
anychart.charts.TagCloud.prototype.colorRange = function(opt_value) {
  if (!this.colorRange_) {
    this.colorRange_ = new anychart.core.ui.ColorRange();
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
anychart.charts.TagCloud.prototype.colorRangeInvalidated_ = function(event) {
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
anychart.charts.TagCloud.prototype.checkIfColorRange = function(target) {
  return anychart.utils.checkIfParent(this.colorRange(), /** @type {goog.events.EventTarget} */(target));
};


/** @inheritDoc */
anychart.charts.TagCloud.prototype.createLegendItemsProvider = function(sourceMode, itemsFormat) {
  var i, count;
  /**
   * @type {!Array.<anychart.core.ui.Legend.LegendItemProvider>}
   */
  var data = [];

  var series, scale;
  if (sourceMode == anychart.enums.LegendItemsSourceMode.CATEGORIES) {
    series = this;
    scale = acgraph.utils.instanceOf(this.getColorScale(), anychart.scales.OrdinalColor) ? this.getColorScale() : void 0;

    if (scale) {
      var ranges = scale.getProcessedRanges();
      for (i = 0, count = ranges.length; i < count; i++) {
        var range = ranges[i];
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
  return data;
};


/** @inheritDoc */
anychart.charts.TagCloud.prototype.legendItemCanInteractInMode = function(mode) {
  return mode == anychart.enums.LegendItemsSourceMode.CATEGORIES;
};


/** @inheritDoc */
anychart.charts.TagCloud.prototype.legendItemClick = function(item, event) {
  var meta = /** @type {Object} */(item.meta());
  var series;
  var sourceMode = this.legend().itemsSourceMode();
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

      if (this.interactivity().hoverMode() == anychart.enums.HoverMode.SINGLE) {
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
anychart.charts.TagCloud.prototype.legendItemOver = function(item, event) {
  var meta = /** @type {Object} */(item.meta());
  var series;

  var sourceMode = this.legend().itemsSourceMode();
  if (sourceMode == anychart.enums.LegendItemsSourceMode.CATEGORIES) {
    series = /** @type {anychart.core.series.Map} */(meta.series);
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
        if (this.interactivity().hoverMode() == anychart.enums.HoverMode.SINGLE) {
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

      if (this.colorRange_ && this.colorRange_.enabled() && this.colorRange_.target()) {
        this.colorRange_.showMarker(goog.isDef(range.equal) ? range.equal : (range.start + range.end) / 2);
      }
    }
  }
};


/** @inheritDoc */
anychart.charts.TagCloud.prototype.legendItemOut = function(item, event) {
  var meta = /** @type {Object} */(item.meta());
  var series;

  var sourceMode = this.legend().itemsSourceMode();
  if (sourceMode == anychart.enums.LegendItemsSourceMode.CATEGORIES) {
    if (this.interactivity().hoverMode() == anychart.enums.HoverMode.SINGLE) {
      var tag = anychart.utils.extractTag(event['domTarget']);
      if (tag)
        tag.series = meta.series;
    }
    if (this.colorRange_ && this.colorRange_.enabled() && this.colorRange_.target()) {
      this.colorRange_.hideMarker();
    }
  }
};


//endregion
//region --- Utils
/**
 * Calculating font size.
 * @param {Object} d Tag object.
 */
anychart.charts.TagCloud.prototype.calculateMaxFontSize = function(d) {
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
anychart.charts.TagCloud.prototype.cloudSprite = function(contextAndRatio, d, data, di) {
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
anychart.charts.TagCloud.prototype.cloudCollide = function(tag, board, sw) {
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
anychart.charts.TagCloud.prototype.cloudBounds = function(bounds, d) {
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
anychart.charts.TagCloud.prototype.collideRects = function(a, b) {
  return a.x + a.x1 > b[0].x && a.x + a.x0 < b[1].x && a.y + a.y1 > b[0].y && a.y + a.y0 < b[1].y;
};


/**
 * Returns function of archimedean spiral distribution.
 * @param {number} t .
 * @return {Array.<number>}
 */
anychart.charts.TagCloud.prototype.archimedeanSpiral = function(t) {
  var x = (this.w / this.h) * (t *= .1) * Math.cos(t);
  var y = t * Math.sin(t);
  return [x, y];
};


/**
 * Returns function of rectangular spiral distribution.
 * @return {function(number):Array.<number>}
 */
anychart.charts.TagCloud.prototype.rectangularSpiral = function() {
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
  }
};


/**
 * Returns array of zero .
 * @param {number} n .
 * @return {Array.<number>}
 */
anychart.charts.TagCloud.prototype.zeroArray = function(n) {
  var a = [],
      i = -1;
  while (++i < n) a[i] = 0;
  return a;
};


/**
 * Returns canvas dom element.
 * @return {Element}
 */
anychart.charts.TagCloud.prototype.cloudCanvas = function() {
  return this.canvas ? this.canvas : (this.canvas = document.createElement('canvas'));
};


/**
 * Returns canvas context and ratio.
 * @param {Element} canvas
 * @return {{context: CanvasRenderingContext2D, ratio: number}}
 */
anychart.charts.TagCloud.prototype.getContext = function(canvas) {
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
anychart.charts.TagCloud.prototype.place = function(board, tag, bounds, maxDelta) {
  var startX = tag.x,
      startY = tag.y,
      dt = 1, // dt = Math.random() < .5 ? 1 : -1
      t = -dt,
      dxdy,
      dx,
      dy;

  while (dxdy = this.layoutFunc_(t += dt)) {
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
anychart.charts.TagCloud.prototype.calcScale = function() {
  var iterator = this.getIterator();
  var colorScale = this.getColorScale();
  var scale = this.scale_;
  var autoColors = this.autoColors_;
  var value = parseFloat(iterator.get('value'));
  var category = iterator.get('category');
  var index = iterator.getIndex();

  if (acgraph.utils.instanceOf(colorScale, anychart.scales.OrdinalColor) && goog.isDef(category)) {
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
anychart.charts.TagCloud.prototype.calculate = function() {
  var scale = this.scale_;
  if (!scale)
    return;

  var anglesCount, fromAngle, toAngle, range, i, arrAngles, maxValue, value, category, key, index, item, valueForScale;
  var iterator = this.getResetIterator();
  var colorScale = this.getColorScale();

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
    anglesCount = /** @type {number} */(arrAngles.length);
    maxValue = this.normalizedData.length ? this.normalizedData[0].value : NaN;

    var pointsCount = this.normalizedData.length;
    var sum = 0;

    this.normalizedData.forEach(function(t) {
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

      t.rotate = arrAngles[t.value % anglesCount];
      t.sizeRatio = t.value / maxValue;

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
anychart.charts.TagCloud.prototype.beforeDraw = function() {
  this.calculate();
};


/** @inheritDoc */
anychart.charts.TagCloud.prototype.drawContent = function(bounds) {
  var scale = this.scale_;

  if (this.hasInvalidationState(anychart.ConsistencyState.TAG_CLOUD_COLOR_RANGE)) {
    if (this.colorRange_) {
      this.colorRange_.suspendSignalsDispatching();
      this.colorRange_.scale(this.getColorScale());
      this.colorRange_.target(this);
      this.colorRange_.setParentEventTarget(this);
      this.colorRange_.resumeSignalsDispatching(false);
      if (this.colorRange_.enabled())
        this.invalidate(anychart.ConsistencyState.BOUNDS);
    }
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    if (this.colorRange_ && this.colorRange_.enabled()) {
      this.colorRange_.parentBounds(bounds.clone().round());
      this.internalBounds_ = this.colorRange_.getRemainingBounds();
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
      this.layer_ = this.container().layer();
    }

    if (!this.handlers_) {
      this.handlers_ = this.layer_.layer();
      this.bindHandlersToGraphics(this.handlers_);
    }

    if (!this.texts_) {
      this.texts_ = this.layer_.layer();
    }

    this.layer_
        .setTransformationMatrix(scale_, 0, 0, scale_, this.internalBounds_.left + (this.w >> 1), this.internalBounds_.top + (this.h >> 1));
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
    if (this.colorRange_) {
      this.colorRange_.suspendSignalsDispatching();
      this.colorRange_.container(this.rootElement);
      this.colorRange_.draw();
      this.colorRange_.resumeSignalsDispatching(false);
    }
    this.markConsistent(anychart.ConsistencyState.TAG_CLOUD_COLOR_RANGE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    var iterator = this.getResetIterator();
    this.normalizedData.forEach(function(t) {
      var state = anychart.core.utils.InteractivityState.clarifyState(this.state.getPointStateByIndex(t.rowIndex));
      iterator.select(t.rowIndex);
      if (t.drawed)
        this.applyFill(t.textEl, acgraph.vector.normalizeFill(/** @type {acgraph.vector.Fill} */(this.resolveProperty('fill', state))));
    }, this);

    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }
};


//endregion
//region --- Setup and Dispose
/**
 * Sets default settings.
 * @param {!Object} config
 */
anychart.charts.TagCloud.prototype.setThemeSettings = function(config) {
  for (var name in this.SIMPLE_PROPS_DESCRIPTORS) {
    var val = config[name];
    if (goog.isDef(val))
      this.themeSettings[name] = val;
  }
};


/** @inheritDoc */
anychart.charts.TagCloud.prototype.setupByJSON = function(config, opt_default) {
  anychart.charts.TagCloud.base(this, 'setupByJSON', config);

  if (opt_default) {
    this.setThemeSettings(config);
  } else {
    anychart.core.settings.deserialize(this, this.SIMPLE_PROPS_DESCRIPTORS, config);
  }

  var scale;
  var scaleConfig = config['scale'];
  if (goog.isString(scaleConfig)) {
    scale = anychart.scales.Base.fromString(scaleConfig, null);
    if (!scale)
      scale = null;
  } else if (goog.isObject(scaleConfig)) {
    scale = anychart.scales.Base.fromString(scaleConfig['type'], true);
    scale.setup(scaleConfig);
  } else {
    scale = null;
  }
  if (scale)
    this.scale(scale);

  scaleConfig = config['colorScale'];
  if (goog.isString(scaleConfig)) {
    scale = anychart.scales.Base.fromString(scaleConfig, null);
    if (!scale)
      scale = null;
  } else if (goog.isObject(scaleConfig)) {
    scale = anychart.scales.Base.fromString(scaleConfig['type'], true);
    scale.setup(scaleConfig);
  } else {
    scale = null;
  }
  if (scale)
    this.colorScale(/** @type {anychart.scales.LinearColor|anychart.scales.OrdinalColor} */(scale));

  this.data(config['data']);
  this.angles(config['angles']);
  this.palette(config['palette']);
  this.colorRange().setupInternal(!!opt_default, config['colorRange']);
  if (config['normal'])
    this.normal_.setupByJSON(config['normal'], opt_default);
  if (config['hovered'])
    this.hovered_.setupByJSON(config['hovered'], opt_default);
  if (config['selected'])
    this.selected_.setupByJSON(config['selected'], opt_default);
};


/** @inheritDoc */
anychart.charts.TagCloud.prototype.serialize = function() {
  var json = anychart.charts.TagCloud.base(this, 'serialize');

  anychart.core.settings.serialize(this, this.SIMPLE_PROPS_DESCRIPTORS, json);

  json['type'] = this.getType();
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
anychart.charts.TagCloud.prototype.disposeInternal = function() {
  goog.array.forEach(this.normalizedData, function(t) {
    goog.disposeAll(
        t.textEl,
        t.eHandler,
        t.sprite);
  });

  goog.disposeAll(
      this.layer_,
      this.texts_,
      this.handlers_,
      this.normal_,
      this.hovered_,
      this.selected_,
      this.colorRange_,
      this.colorScale_,
      this.scale_,
      this.state);

  anychart.charts.TagCloud.base(this, 'disposeInternal');
};


//endregion
//region --- Exports
//exports
(function() {
  var proto = anychart.charts.TagCloud.prototype;
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
