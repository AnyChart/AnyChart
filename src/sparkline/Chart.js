goog.provide('anychart.sparklineModule.Chart');

goog.require('anychart'); // otherwise we can't use anychart.chartTypesMap object.
goog.require('anychart.core.Chart');
goog.require('anychart.core.axisMarkers.Line');
goog.require('anychart.core.axisMarkers.Range');
goog.require('anychart.core.axisMarkers.Text');
goog.require('anychart.core.reporting');
goog.require('anychart.core.settings');
goog.require('anychart.core.ui.LabelsFactory');
goog.require('anychart.core.ui.MarkersFactory');
goog.require('anychart.core.utils.IInteractiveSeries');
goog.require('anychart.core.utils.InteractivityState');
goog.require('anychart.data.Set');
goog.require('anychart.enums');
goog.require('anychart.format.Context');
goog.require('anychart.scales');
goog.require('anychart.sparklineModule.series.Base');



/**
 * Sparkline chart class.<br/>
 * @param {?(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Value to set.
 * @param {(anychart.enums.TextParsingMode|anychart.data.TextParsingSettings)=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings here as a hash map.
 * @extends {anychart.core.Chart}
 * @implements {anychart.core.utils.IInteractiveSeries}
 * @constructor
 */
anychart.sparklineModule.Chart = function(opt_data, opt_csvSettings) {
  anychart.sparklineModule.Chart.base(this, 'constructor');

  this.addThemes('sparkline');

  this.getCsvExportRow = this.getCsvExportRowScatter;

  /**
   * Interactivity state.
   * @type {anychart.core.utils.InteractivityState}
   */
  this.state = new anychart.core.utils.InteractivityState(this);

  /**
   * @type {anychart.scales.Base}
   * @private
   */
  this.xScale_ = null;

  /**
   * @type {anychart.scales.Base}
   * @private
   */
  this.yScale_ = null;

  /**
   * @type {anychart.sparklineModule.series.Base}
   * @private
   */
  this.series_ = null;

  /**
   * @type {Array.<anychart.core.axisMarkers.Line>}
   * @private
   */
  this.lineAxesMarkers_ = [];

  /**
   * @type {Array.<anychart.core.axisMarkers.Range>}
   * @private
   */
  this.rangeAxesMarkers_ = [];

  /**
   * @type {Array.<anychart.core.axisMarkers.Text>}
   * @private
   */
  this.textAxesMarkers_ = [];

  /**
   * Cache of chart data bounds.
   * @type {anychart.math.Rect}
   * @private
   */
  this.dataBounds_ = null;

  /**
   * Series clip.
   * @type {boolean|anychart.math.Rect}
   * @private
   */
  this.clip_;

  /**
   * Series default settings.
   * @type {Object}
   * @private
   */
  this.seriesDefaults_ = {};

  /** @inheritDoc */
  this.allowCreditsDisabling = true;

  /**
   * @type {!anychart.core.ui.MarkersFactory}
   * @private
   */
  this.markersInternal_ = new anychart.core.ui.MarkersFactory();
  // defaults that was deleted form MarkersFactory
  this.markersInternal_.setOption('positionFormatter', anychart.utils.DEFAULT_FORMATTER);
  this.markersInternal_.setOption('size', 10);
  this.markersInternal_.setOption('anchor', anychart.enums.Anchor.CENTER);
  this.markersInternal_.setOption('offsetX', 0);
  this.markersInternal_.setOption('offsetY', 0);
  this.markersInternal_.setOption('rotation', 0);
  this.markersInternal_.setParentEventTarget(this);
  this.markersInternal_.setAutoZIndex(anychart.sparklineModule.Chart.ZINDEX_MARKER);

  /**
   * @type {!anychart.core.ui.LabelsFactory}
   * @private
   */
  this.labelsInternal_ = new anychart.core.ui.LabelsFactory();
  // defaults that was deleted form LabelsFactory
  this.labelsInternal_['positionFormatter'](anychart.utils.DEFAULT_FORMATTER);
  this.labelsInternal_['format'](anychart.utils.DEFAULT_FORMATTER);
  this.labelsInternal_.background(null);
  this.labelsInternal_['rotation'](0);
  this.labelsInternal_['width'](null);
  this.labelsInternal_['height'](null);
  this.labelsInternal_['fontSize'](11);
  this.labelsInternal_['minFontSize'](8);
  this.labelsInternal_['maxFontSize'](72);
  this.labelsInternal_.setParentEventTarget(this);
  this.labelsInternal_.setAutoZIndex(anychart.sparklineModule.Chart.ZINDEX_LABEL);

  this.data(opt_data || null, opt_csvSettings);

  this.bindHandlersToComponent(this, this.handleMouseOverAndMove, this.handleMouseOut, null, this.handleMouseOverAndMove, null, this.handleMouseDown);

  //region Init descriptors meta
  /**
   * @this {anychart.sparklineModule.Chart}
   */
  function typeBeforeInvalidation() {
    if (this.series_) {
      goog.dispose(this.series_);
      this.series_ = null;
    }
  }

  /**
   * @this {anychart.sparklineModule.Chart}
   */
  function pointWidthBeforeInvalidation() {
    if (this.series_ && this.series_.isWidthBased())
      this.series_.invalidate(anychart.ConsistencyState.SERIES_HATCH_FILL | anychart.ConsistencyState.APPEARANCE,
          anychart.Signal.NEEDS_REDRAW);
  }

  /**
   * @this {anychart.sparklineModule.Chart}
   */
  function connectMissingBeforeInvalidation() {
    if (this.series_ && !this.series_.isWidthBased())
      this.series_.invalidate(anychart.ConsistencyState.SERIES_HATCH_FILL | anychart.ConsistencyState.APPEARANCE,
          anychart.Signal.NEEDS_REDRAW);
  }

  /**
   * @this {anychart.sparklineModule.Chart}
   */
  function invalidateSeriesAppearance() {
    if (this.series_)
      this.series_.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
  }

  /**
   * @this {anychart.sparklineModule.Chart}
   */
  function invalidateSeriesHatchFill() {
    if (this.series_)
      this.series_.invalidate(anychart.ConsistencyState.SERIES_HATCH_FILL, anychart.Signal.NEEDS_REDRAW);
  }

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['seriesType', anychart.ConsistencyState.SPARK_SERIES, anychart.Signal.NEEDS_REDRAW, 0, typeBeforeInvalidation],
    ['pointWidth', 0, 0, 0, pointWidthBeforeInvalidation],
    ['connectMissingPoints', 0, 0, 0, connectMissingBeforeInvalidation],
    ['fill', 0, 0, 0, invalidateSeriesAppearance, this],
    ['negativeFill', 0, 0, 0, invalidateSeriesAppearance, this],
    ['firstFill', 0, 0, 0, invalidateSeriesAppearance, this],
    ['lastFill', 0, 0, 0, invalidateSeriesAppearance, this],
    ['maxFill', 0, 0, 0, invalidateSeriesAppearance, this],
    ['minFill', 0, 0, 0, invalidateSeriesAppearance, this],
    ['stroke', 0, 0, 0, invalidateSeriesAppearance, this],
    ['hatchFill', 0, 0, 0, invalidateSeriesHatchFill, this],
    ['firstHatchFill', 0, 0, 0, invalidateSeriesHatchFill, this],
    ['lastHatchFill', 0, 0, 0, invalidateSeriesHatchFill, this],
    ['maxHatchFill', 0, 0, 0, invalidateSeriesHatchFill, this],
    ['minHatchFill', 0, 0, 0, invalidateSeriesHatchFill, this],
    ['negativeHatchFill', 0, 0, 0, invalidateSeriesHatchFill, this]
  ]);

  //We need create tootlip here because now we don't call setupByJson method.
  this.tooltip();
  //endregion
};
goog.inherits(anychart.sparklineModule.Chart, anychart.core.Chart);


/**
 * Link to incoming raw data.
 * Used to avoid data reapplication on same data sets.
 * NOTE: If is disposable entity, should be disposed from the source, not from this class.
 * @type {?(anychart.data.View|anychart.data.Set|Array|string)}
 * @private
 */
anychart.sparklineModule.Chart.prototype.rawData_;


/** @inheritDoc */
anychart.sparklineModule.Chart.prototype.getType = function() {
  return anychart.enums.ChartTypes.SPARKLINE;
};


/**
 * Supported consistency states. Adds AXES, AXES_MARKERS, GRIDS to anychart.core.Chart states.
 * @type {number}
 */
anychart.sparklineModule.Chart.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.Chart.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.SPARK_SCALES |
    anychart.ConsistencyState.SPARK_SERIES |
    anychart.ConsistencyState.SPARK_AXES_MARKERS;


/**
 * Series z-index in chart root layer.
 * @type {number}
 */
anychart.sparklineModule.Chart.ZINDEX_SERIES = 30;


/**
 * Marker z-index in chart root layer.
 * @type {number}
 */
anychart.sparklineModule.Chart.ZINDEX_MARKER = 40;


/**
 * Label z-index in chart root layer.
 * @type {number}
 */
anychart.sparklineModule.Chart.ZINDEX_LABEL = 40;


/** @inheritDoc */
anychart.sparklineModule.Chart.prototype.makeBrowserEvent = function(e) {
  //this method is invoked only for events from data layer
  var res = anychart.sparklineModule.Chart.base(this, 'makeBrowserEvent', e);
  res['pointIndex'] = this.getIndexByEvent_(res);
  return res;
};


/** @inheritDoc */
anychart.sparklineModule.Chart.prototype.unhover = function() {
  // do nothing
};


/** @inheritDoc */
anychart.sparklineModule.Chart.prototype.getSeriesStatus = function(event) {
  var bounds = (this.series_ && this.series_.pixelBoundsCache) || anychart.math.rect(0, 0, 0, 0);

  var clientX = event['clientX'];
  var clientY = event['clientY'];
  var value, index;

  var containerOffset = this.container().getStage().getClientPosition();

  var x = clientX - containerOffset.x;
  var y = clientY - containerOffset.y;

  var minX = bounds.left;
  var minY = bounds.top;
  var rangeX = bounds.width;
  var rangeY = bounds.height;

  if (x < minX || x > minX + rangeX || y < minY || y > minY + rangeY) {
    return null;
  }

  var points = [];

  var ratio = (x - minX) / rangeX;
  value = this.xScale().inverseTransform(ratio);
  var indexes = this.data().findClosestByX(value, anychart.utils.instanceOf(this.xScale(), anychart.scales.Ordinal));
  index = indexes.length ? indexes[0] : NaN;

  var iterator = this.getIterator();

  if (iterator.select(/** @type {number} */ (index))) {
    var pixX = /** @type {number} */(iterator.meta('x'));
    var pixY = /** @type {number} */(iterator.meta('value'));
    var length = anychart.math.vectorLength(pixX, pixY, x, y);

    if (!isNaN(pixX) && !isNaN(pixY)) {
      points.push({
        series: this,
        points: [index],
        lastPoint: index,
        nearestPointToCursor: {index: index, distance: length}
      });
    }
  }

  return /** @type {Array.<Object>} */(points);
};


/**
 * Selection mode dummy.
 * @return {anychart.enums.SelectionMode|string}
 */
anychart.sparklineModule.Chart.prototype.selectionMode = function() {
  return anychart.enums.SelectionMode.NONE;
};


/**
 * Create base series format provider.
 * @return {Object} Object with info for labels formatting.
 * @protected
 */
anychart.sparklineModule.Chart.prototype.createFormatProvider = function() {
  if (!this.pointProvider_)
    this.pointProvider_ = new anychart.format.Context();

  var iterator = this.getIterator();
  this.pointProvider_
      .dataSource(iterator)
      .statisticsSources([this]);

  var values = {
    'x': {value: iterator.get('x'), type: anychart.enums.TokenType.STRING},
    'value': {value: iterator.get('value'), type: anychart.enums.TokenType.NUMBER},
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
anychart.sparklineModule.Chart.prototype.createTooltipContextProvider = function() {
  return this.createFormatProvider();
};


/** @inheritDoc */
anychart.sparklineModule.Chart.prototype.useUnionTooltipAsSingle = function() {
  return true;
};


/**
 * @param {anychart.core.MouseEvent} event
 * @return {number}
 * @private
 */
anychart.sparklineModule.Chart.prototype.getIndexByEvent_ = function(event) {
  var bounds = (this.series_ && this.series_.pixelBoundsCache) || anychart.math.rect(0, 0, 0, 0);
  var x = event['clientX'];
  var min, range;
  var value, index;

  min = bounds.left + this.container().getStage().getClientPosition().x;
  range = bounds.width;
  var ratio = (x - min) / range;
  value = this.xScale().inverseTransform(ratio);

  index = this.data().find('x', value);

  if (index < 0) index = NaN;

  return /** @type {number} */(index);
};


/** @inheritDoc */
anychart.sparklineModule.Chart.prototype.handleMouseEvent = function(event) {
  var evt = this.makePointEvent(event);
  if (evt)
    this.dispatchEvent(evt);
};


/**
 * This method also has a side effect - it patches the original source event to maintain pointIndex support for
 * browser events.
 * @param {anychart.core.MouseEvent} event
 * @return {Object} An object of event to dispatch. If null - unrecognized type was found.
 */
anychart.sparklineModule.Chart.prototype.makePointEvent = function(event) {
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

  var iter = this.data().getIterator();
  if (!iter.select(pointIndex))
    iter.reset();

  return {
    'type': type,
    'actualTarget': event['target'],
    'pie': this,
    'iterator': iter,
    'sliceIndex': pointIndex,
    'pointIndex': pointIndex,
    'target': this,
    'originalEvent': event
  };
};


/**
 * Select a point of the series by its index.
 * @param {number|Array<number>} indexOrIndexes Index of the point to hover.
 * @param {anychart.core.MouseEvent=} opt_event Event that initiate point hovering.<br/>
 *    <b>Note:</b> Used only to display float tooltip.
 * @return {!anychart.sparklineModule.Chart}  {@link anychart.sparklineModule.Chart} instance for method chaining.
 */
anychart.sparklineModule.Chart.prototype.selectPoint = function(indexOrIndexes, opt_event) {
  return this;
};


/**
 * Hovers a point of the series by its index.
 * @param {number|Array<number>} index Index of the point to hover.
 * @param {anychart.core.MouseEvent=} opt_event Event that initiate point hovering.<br/>
 *    <b>Note:</b> Used only to display float tooltip.
 * @return {!anychart.sparklineModule.Chart}  {@link anychart.sparklineModule.Chart} instance for method chaining.
 */
anychart.sparklineModule.Chart.prototype.hoverPoint = function(index, opt_event) {
  return this;
};


/**
 * @inheritDoc
 */
anychart.sparklineModule.Chart.prototype.getAllSeries = function() {
  return [this];
};


/**
 * @inheritDoc
 */
anychart.sparklineModule.Chart.prototype.unselect = goog.nullFunction;


/**
 * @param {(anychart.enums.HoverMode|string)=} opt_value Hover mode.
 * @return {anychart.sparklineModule.Chart|anychart.enums.HoverMode} .
 */
anychart.sparklineModule.Chart.prototype.hoverMode = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeHoverMode(opt_value);
    if (opt_value != this.hoverMode_) {
      this.hoverMode_ = opt_value;
    }
    return this;
  }
  return /** @type {anychart.enums.HoverMode} */(this.hoverMode_);
};


/** @inheritDoc */
anychart.sparklineModule.Chart.prototype.getPoint = function(index) {
  return null;
};


/** @inheritDoc */
anychart.sparklineModule.Chart.prototype.isDiscreteBased = function() {
  return false;
};


/** @inheritDoc */
anychart.sparklineModule.Chart.prototype.isSizeBased = function() {
  return false;
};


/** @inheritDoc */
anychart.sparklineModule.Chart.prototype.applyAppearanceToSeries = goog.nullFunction;


/** @inheritDoc */
anychart.sparklineModule.Chart.prototype.applyAppearanceToPoint = goog.nullFunction;


/** @inheritDoc */
anychart.sparklineModule.Chart.prototype.finalizePointAppearance = goog.nullFunction;


/** @inheritDoc */
anychart.sparklineModule.Chart.prototype.getStartValueForAppearanceReduction = goog.nullFunction;


/**
 * Getter/setter for series default settings.
 * @param {Object=} opt_value Object with default series settings.
 * @return {Object}
 */
anychart.sparklineModule.Chart.prototype.defaultSeriesSettings = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.defaultSeriesSettings_ = opt_value;
    return this;
  }
  if (!this.defaultSeriesSettings_) {
    this.defaultSeriesSettings_ = {};
  }

  var seriesType = anychart.utils.toCamelCase(/** @type {string} */(this.getOption('seriesType')));
  if (!this.defaultSeriesSettings_[seriesType]) { //append default theme for current series type if not exists
    this.defaultSeriesSettings_[seriesType] = goog.object.clone(this.series_.themeSettings);
  }

  return this.defaultSeriesSettings_;
};


/**
 * Default hatch fill type.
 * @type {acgraph.vector.HatchFill.HatchFillType|string}
 */
anychart.sparklineModule.Chart.DEFAULT_HATCH_FILL_TYPE = acgraph.vector.HatchFill.HatchFillType.DIAGONAL_BRICK;


/**
 * Array of marker field names for merging.
 * @type {Array.<string>}
 * @private
 */
anychart.sparklineModule.Chart.MARKERS_FIELD_NAMES_FOR_MERGE_ = [
  'enabled', 'position', 'anchor', 'offsetX', 'offsetY', 'type', 'size', 'fill', 'stroke'];


/**
 * Array of labels field names for merging.
 * @type {Array.<string>}
 * @private
 */
anychart.sparklineModule.Chart.LABELS_FIELD_NAMES_FOR_MERGE_ = [
  'enabled', 'background', 'padding', 'position', 'anchor', 'offsetX', 'offsetY', 'rotation', 'width', 'height',
  'fontSize', 'fontFamily', 'fontColor', 'fontOpacity', 'fontDecoration', 'fontStyle', 'fontVariant', 'fontWeight',
  'letterSpacing', 'textDirection', 'lineHeight', 'textIndent', 'vAlign', 'hAlign', 'wordWrap', 'wordBreak', 'textOverflow',
  'selectable', 'disablePointerEvents', 'useHtml'
];


/**
 * @type {!anychart.data.View}
 * @private
 */
anychart.sparklineModule.Chart.prototype.data_;


/**
 * @type {anychart.data.View}
 * @private
 */
anychart.sparklineModule.Chart.prototype.parentView_;


/**
 * @type {goog.Disposable}
 * @private
 */
anychart.sparklineModule.Chart.prototype.parentViewToDispose_;


/**
 * @type {!anychart.data.Iterator}
 * @private
 */
anychart.sparklineModule.Chart.prototype.iterator_;


//----------------------------------------------------------------------------------------------------------------------
//
//  Scales.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter/setter for xScale.
 * @param {(anychart.enums.ScaleTypes|Object|anychart.scales.Base)=} opt_value X Scale to set.
 * @return {!(anychart.scales.Base|anychart.sparklineModule.Chart)} Default chart scale value or itself for method chaining.
 */
anychart.sparklineModule.Chart.prototype.xScale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var val = anychart.scales.Base.setupScale(this.xScale_, opt_value, null, anychart.scales.Base.ScaleTypes.ALL_DEFAULT);
    if (val) {
      this.xScale_ = val;
      this.xScale_.resumeSignalsDispatching(false);
      this.invalidate(anychart.ConsistencyState.SPARK_SCALES, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    if (!this.xScale_) {
      this.xScale_ = anychart.scales.ordinal();
    }
    return this.xScale_;
  }
};


/**
 * Getter/setter for yScale.
 * @param {(anychart.enums.ScaleTypes|Object|anychart.scales.Base)=} opt_value Y Scale to set.
 * @return {!(anychart.scales.Base|anychart.sparklineModule.Chart)} Default chart scale value or itself for method chaining.
 */
anychart.sparklineModule.Chart.prototype.yScale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var val = anychart.scales.Base.setupScale(this.yScale_, opt_value, null, anychart.scales.Base.ScaleTypes.ALL_DEFAULT);
    if (val) {
      this.yScale_ = val;
      this.yScale_.resumeSignalsDispatching(false);
      this.invalidate(anychart.ConsistencyState.SPARK_SCALES, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    if (!this.yScale_) {
      this.yScale_ = anychart.scales.linear();
    }
    return this.yScale_;
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Axes markers.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter/setter for lineMarker.
 * @param {(Object|boolean|null|number)=} opt_indexOrValue Chart line marker settings to set.
 * @param {(Object|boolean|null)=} opt_value Chart line marker settings to set.
 * @return {!(anychart.core.axisMarkers.Line|anychart.sparklineModule.Chart)} Line marker instance by index or itself for method chaining.
 */
anychart.sparklineModule.Chart.prototype.lineMarker = function(opt_indexOrValue, opt_value) {
  var index, value;
  index = anychart.utils.toNumber(opt_indexOrValue);
  if (isNaN(index)) {
    index = 0;
    value = opt_indexOrValue;
  } else {
    index = /** @type {number} */(opt_indexOrValue);
    value = opt_value;
  }
  var lineMarker = this.lineAxesMarkers_[index];
  if (!lineMarker) {
    lineMarker = new anychart.core.axisMarkers.Line();
    this.setupCreated('lineMarker', lineMarker);
    this.lineAxesMarkers_[index] = lineMarker;
    lineMarker.listenSignals(this.onMarkersSignal_, this);
    this.invalidate(anychart.ConsistencyState.SPARK_AXES_MARKERS, anychart.Signal.NEEDS_REDRAW);
  }

  if (goog.isDef(value)) {
    lineMarker.setup(value);
    return this;
  } else {
    return lineMarker;
  }
};


/**
 * Getter/setter for rangeMarker.
 * @param {(Object|boolean|null|number)=} opt_indexOrValue Chart range marker settings to set.
 * @param {(Object|boolean|null)=} opt_value Chart range marker settings to set.
 * @return {!(anychart.core.axisMarkers.Range|anychart.sparklineModule.Chart)} Range marker instance by index or itself for chaining call.
 */
anychart.sparklineModule.Chart.prototype.rangeMarker = function(opt_indexOrValue, opt_value) {
  var index, value;
  index = anychart.utils.toNumber(opt_indexOrValue);
  if (isNaN(index)) {
    index = 0;
    value = opt_indexOrValue;
  } else {
    index = /** @type {number} */(opt_indexOrValue);
    value = opt_value;
  }
  var rangeMarker = this.rangeAxesMarkers_[index];
  if (!rangeMarker) {
    rangeMarker = new anychart.core.axisMarkers.Range();
    this.rangeAxesMarkers_[index] = rangeMarker;
    rangeMarker.listenSignals(this.onMarkersSignal_, this);
    this.invalidate(anychart.ConsistencyState.SPARK_AXES_MARKERS, anychart.Signal.NEEDS_REDRAW);
  }

  if (goog.isDef(value)) {
    rangeMarker.setup(value);
    return this;
  } else {
    return rangeMarker;
  }
};


/**
 * Getter/setter for textMarker.
 * @param {(Object|boolean|null|number)=} opt_indexOrValue Chart line marker settings to set.
 * @param {(Object|boolean|null)=} opt_value Chart line marker settings to set.
 * @return {!(anychart.core.axisMarkers.Text|anychart.sparklineModule.Chart)} Line marker instance by index or itself for chaining call.
 */
anychart.sparklineModule.Chart.prototype.textMarker = function(opt_indexOrValue, opt_value) {
  var index, value;
  index = anychart.utils.toNumber(opt_indexOrValue);
  if (isNaN(index)) {
    index = 0;
    value = opt_indexOrValue;
  } else {
    index = /** @type {number} */(opt_indexOrValue);
    value = opt_value;
  }
  var textMarker = this.textAxesMarkers_[index];
  if (!textMarker) {
    textMarker = new anychart.core.axisMarkers.Text();
    this.setupCreated('textMarker', textMarker);
    this.textAxesMarkers_[index] = textMarker;
    textMarker.listenSignals(this.onMarkersSignal_, this);
    this.invalidate(anychart.ConsistencyState.SPARK_AXES_MARKERS, anychart.Signal.NEEDS_REDRAW);
  }

  if (goog.isDef(value)) {
    textMarker.setup(value);
    return this;
  } else {
    return textMarker;
  }
};


/**
 * Listener for markers invalidation.
 * @param {anychart.SignalEvent} event Invalidation event.
 * @private
 */
anychart.sparklineModule.Chart.prototype.onMarkersSignal_ = function(event) {
  this.invalidate(anychart.ConsistencyState.SPARK_AXES_MARKERS, anychart.Signal.NEEDS_REDRAW);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Data
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter/setter for data.
 * @param {?(anychart.data.View|anychart.data.Set|Array|string)=} opt_value Value to set.
 * @param {(anychart.enums.TextParsingMode|anychart.data.TextParsingSettings)=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings here as a hash map.
 * @return {(!anychart.sparklineModule.Chart|!anychart.data.View)} Returns itself if used as a setter or the mapping if used as a getter.
 */
anychart.sparklineModule.Chart.prototype.data = function(opt_value, opt_csvSettings) {
  if (goog.isDef(opt_value)) {
    if (this.rawData_ !== opt_value) {
      this.rawData_ = opt_value;
      goog.dispose(this.parentViewToDispose_); // disposing a view created by the series if any;
      if (anychart.utils.instanceOf(opt_value, anychart.data.View))
        this.parentView_ = this.parentViewToDispose_ = opt_value.derive(); // deriving a view to avoid interference with other view users
      else if (anychart.utils.instanceOf(opt_value, anychart.data.Set))
        this.parentView_ = this.parentViewToDispose_ = opt_value.mapAs();
      else
        this.parentView_ = (this.parentViewToDispose_ = new anychart.data.Set(
            (goog.isArray(opt_value) || goog.isString(opt_value)) ? opt_value : null, opt_csvSettings)).mapAs();
      this.data_ = this.parentView_;
      this.data_.listenSignals(this.dataInvalidated_, this);
      if (this.series_)
        this.series_.invalidate(anychart.ConsistencyState.APPEARANCE,
            anychart.Signal.NEEDS_RECALCULATION | anychart.Signal.NEEDS_REDRAW | anychart.Signal.DATA_CHANGED);
      this.invalidate(anychart.ConsistencyState.CHART_LABELS, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.data_;
};


/**
 * Gets an array of reference 'y' fields from the row iterator points to.
 * Reference fields are defined using referenceValueNames and referenceValueMeanings.
 * If there is only one field - a value is returned.
 * If there are several - array.
 * If any of the two is undefined - returns null.
 *
 * @return {*} Fetches significant scale values from current data row.
 */
anychart.sparklineModule.Chart.prototype.getReferenceScaleValues = function() {
  var iterator = this.getIterator();
  var yScale = this.yScale();

  var val = iterator.get('value');
  if (yScale.isMissing(val)) return null;

  return val;
};


/**
 * Listens to data invalidation.
 * @param {anychart.SignalEvent} e
 * @private
 */
anychart.sparklineModule.Chart.prototype.dataInvalidated_ = function(e) {
  if (e.hasSignal(anychart.Signal.DATA_CHANGED)) {
    if (this.series_)
      this.series_.invalidate(anychart.ConsistencyState.APPEARANCE,
          anychart.Signal.NEEDS_RECALCULATION | anychart.Signal.NEEDS_REDRAW | anychart.Signal.DATA_CHANGED);
    this.invalidate(anychart.ConsistencyState.CHART_LABELS, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Returns current mapping iterator.
 * @return {!anychart.data.Iterator} Current series iterator.
 */
anychart.sparklineModule.Chart.prototype.getIterator = function() {
  return this.iterator_ || this.getResetIterator();
};


/**
 * Returns new default iterator for the current mapping.
 * @return {!anychart.data.Iterator} New iterator.
 */
anychart.sparklineModule.Chart.prototype.getResetIterator = function() {
  return this.iterator_ = this.data().getIterator();
};


/**
 * @param {string|anychart.enums.SparklineSeriesType} type Series type.
 * @private
 * @return {anychart.sparklineModule.series.Base}
 */
anychart.sparklineModule.Chart.prototype.createSeriesByType_ = function(type) {
  var ctl = anychart.sparklineModule.series.Base.SeriesTypesMap[type];
  var instance;

  if (ctl) {
    instance = new ctl(this);
    type = anychart.utils.toCamelCase(type);
    instance.addThemes('chart.defaultSeriesSettings.base.normal');
    instance.addThemes('chart.defaultSeriesSettings.' + type + '.normal');
    var pathForTheme = this.themeSettings['defaultSeriesSettings'];
    if (pathForTheme)
      instance.addThemes(pathForTheme['base']);
    if (pathForTheme[type])
      instance.addThemes(pathForTheme[type]);

    this.series_ = instance;
    instance.setAutoZIndex(anychart.sparklineModule.Chart.ZINDEX_SERIES);
    instance.listenSignals(this.seriesInvalidated_, this);

    this.seriesDefaults_ = this.defaultSeriesSettings()[anychart.utils.toCamelCase(type)] || this.series_.getDefaults();

    this.invalidate(anychart.ConsistencyState.SPARK_SERIES | anychart.ConsistencyState.SPARK_SCALES,
        anychart.Signal.NEEDS_REDRAW);

  } else {
    anychart.core.reporting.error(anychart.enums.ErrorCode.NO_FEATURE_IN_MODULE, null, [type + ' series']);
    instance = null;
  }

  return instance;
};


/**
 * Series signals handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.sparklineModule.Chart.prototype.seriesInvalidated_ = function(event) {
  var state = 0;
  if (event.hasSignal(anychart.Signal.ENABLED_STATE_CHANGED)) {
    state |= anychart.ConsistencyState.CHART_LABELS;
  }
  if (event.hasSignal(anychart.Signal.NEEDS_UPDATE_A11Y)) {
    state = anychart.ConsistencyState.A11Y;
  }
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    state = anychart.ConsistencyState.SPARK_SERIES;
  }
  if (event.hasSignal(anychart.Signal.DATA_CHANGED)) {
    state |= anychart.ConsistencyState.SPARK_SERIES | anychart.ConsistencyState.CHART_LABELS;
    this.invalidateSeries_();
  }
  if (event.hasSignal(anychart.Signal.NEEDS_RECALCULATION)) {
    state |= anychart.ConsistencyState.SPARK_SCALES;
  }
  this.invalidate(state, anychart.Signal.NEEDS_REDRAW);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Series specific settings
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.sparklineModule.Chart.PROPERTY_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  function pointWidthNormalizer(opt_value) {
    return anychart.utils.normalizeNumberOrPercent(opt_value, /** @type {number|string} */ (this.getOption('pointWidth')));
  }

  anychart.core.settings.createDescriptors(map, [
    anychart.core.settings.descriptors.FILL_FUNCTION,
    anychart.core.settings.descriptors.NEGATIVE_FILL,
    anychart.core.settings.descriptors.STROKE_FUNCTION,
    anychart.core.settings.descriptors.NEGATIVE_HATCH_FILL,
    anychart.core.settings.descriptors.HATCH_FILL_FUNCTION,
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'seriesType', anychart.enums.normalizeSparklineSeriesType],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'pointWidth', pointWidthNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'connectMissingPoints', anychart.core.settings.booleanNormalizer],
    [anychart.enums.PropertyHandlerType.MULTI_ARG, 'firstFill', anychart.core.settings.fillOrFunctionNormalizer],
    [anychart.enums.PropertyHandlerType.MULTI_ARG, 'lastFill', anychart.core.settings.fillOrFunctionNormalizer],
    [anychart.enums.PropertyHandlerType.MULTI_ARG, 'maxFill', anychart.core.settings.fillOrFunctionNormalizer],
    [anychart.enums.PropertyHandlerType.MULTI_ARG, 'minFill', anychart.core.settings.fillOrFunctionNormalizer],
    [anychart.enums.PropertyHandlerType.MULTI_ARG, 'lastHatchFill', anychart.core.settings.hatchFillOrFunctionNormalizer],
    [anychart.enums.PropertyHandlerType.MULTI_ARG, 'firstHatchFill', anychart.core.settings.hatchFillOrFunctionNormalizer],
    [anychart.enums.PropertyHandlerType.MULTI_ARG, 'maxHatchFill', anychart.core.settings.hatchFillOrFunctionNormalizer],
    [anychart.enums.PropertyHandlerType.MULTI_ARG, 'minHatchFill', anychart.core.settings.hatchFillOrFunctionNormalizer]
  ]);

  return map;
})();
anychart.core.settings.populate(anychart.sparklineModule.Chart, anychart.sparklineModule.Chart.PROPERTY_DESCRIPTORS);


/**
 * Getter/setter for clip.
 * @param {(boolean|anychart.math.Rect)=} opt_value [False, if series is created manually.<br/>True, if created via chart] Enable/disable series clip.
 * @return {anychart.sparklineModule.Chart|boolean|anychart.math.Rect} .
 */
anychart.sparklineModule.Chart.prototype.clip = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (goog.isNull(opt_value)) opt_value = false;
    if (this.clip_ != opt_value) {
      this.clip_ = opt_value;
      if (this.series_)
        this.series_.invalidate(anychart.ConsistencyState.BOUNDS,
            anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.clip_;
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Coloring
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Gets final normalized fill or stroke color.
 * @param {acgraph.vector.Fill|acgraph.vector.Stroke|Function} color Normal state color.
 * @param {...(acgraph.vector.Fill|acgraph.vector.Stroke|Function)} var_args .
 * @return {!(acgraph.vector.Fill|acgraph.vector.Stroke)} Normalized color.
 */
anychart.sparklineModule.Chart.prototype.normalizeColor = function(color, var_args) {
  var fill;
  if (goog.isFunction(color)) {
    var sourceColor = arguments.length > 1 ?
        this.normalizeColor.apply(this, goog.array.slice(arguments, 1)) :
        this.seriesDefaults_['color'];
    var scope = {
      'index': this.getIterator().getIndex(),
      'sourceColor': sourceColor,
      'iterator': this.getIterator()
    };
    fill = color.call(scope);
  } else
    fill = color;
  return fill;
};


/** @inheritDoc */
anychart.sparklineModule.Chart.prototype.getOption = function(name) {
  var val = anychart.sparklineModule.Chart.base(this, 'getOption', name);
  if (!val) {
    switch (name) {
      case 'fill':
      case 'negativeFill':
      case 'firstFill':
      case 'lastFill':
      case 'maxFill':
      case 'minFill':
      case 'stroke':
      case 'lastHatchFill':
      case 'firstHatchFill':
      case 'maxHatchFill':
      case 'minHatchFill':
        val = this.seriesDefaults_[name];
        break;
      case 'hatchFill':
      case 'negativeHatchFill':
        val = goog.isDef(val) ? val : this.seriesDefaults_[name];
        break;
    }
  }
  return val;
};


/**
 * Method that gets final fill color for the current point, with all fallbacks taken into account.
 * @param {boolean} usePointSettings If point settings should count too (iterator questioning).
 * @return {!acgraph.vector.Fill} Final fill for the current row.
 */
anychart.sparklineModule.Chart.prototype.getFinalFill = function(usePointSettings) {
  var iterator = this.getIterator();
  var val = /** @type {number} */ (iterator.get('value'));
  var index = iterator.getIndex();

  var finalFill;
  if (usePointSettings && goog.isDef(iterator.get('fill'))) {
    //user settings defined
    finalFill = iterator.get('fill');
  } else if (index == iterator.getRowsCount() - 1 && goog.isDef(this.getOption('lastFill'))) {
    //last point
    finalFill = this.getOption('lastFill');
  } else if (!index && goog.isDef(this.getOption('firstFill'))) {
    //first point
    finalFill = this.getOption('firstFill');
  } else if (val == this.getStat(anychart.enums.Statistics.MAX) && goog.isDef(this.getOption('maxFill'))) {
    //point have max value
    finalFill = this.getOption('maxFill');
  } else if (val == this.getStat(anychart.enums.Statistics.MIN) && goog.isDef(this.getOption('minFill'))) {
    //point have min value
    finalFill = this.getOption('minFill');
  } else if (val < 0 && goog.isDef(this.getOption('negativeFill'))) {
    //point have negative value
    finalFill = this.getOption('negativeFill');
  } else {
    //another case
    finalFill = this.getOption('fill');
  }

  var result = /** @type {!acgraph.vector.Fill} */(this.normalizeColor(/** @type {acgraph.vector.Fill|Function} */(finalFill)));
  return acgraph.vector.normalizeFill(result);
};


/**
 * Method that gets final line color for the current point, with all fallbacks taken into account.
 * @return {!acgraph.vector.Stroke} Final stroke for the current row.
 */
anychart.sparklineModule.Chart.prototype.getFinalStroke = function() {
  return acgraph.vector.normalizeStroke(/** @type {!acgraph.vector.Stroke} */(this.normalizeColor(/** @type {!acgraph.vector.Stroke} */(this.getOption('stroke')))));
};


// Fill and stroke settings are located here, but you should export them ONLY in series themselves.
/**
 * Gets final normalized pattern/hatch fill.
 * @param {acgraph.vector.HatchFill|acgraph.vector.PatternFill|Function|string|boolean} hatchFill Normal state hatch fill.
 * @return {acgraph.vector.HatchFill|acgraph.vector.PatternFill} Normalized hatch fill.
 */
anychart.sparklineModule.Chart.prototype.normalizeHatchFill = function(hatchFill) {
  var fill;
  var index = this.getIterator().getIndex();
  if (goog.isFunction(hatchFill)) {
    var sourceHatchFill = acgraph.vector.normalizeHatchFill(anychart.sparklineModule.Chart.DEFAULT_HATCH_FILL_TYPE);
    var scope = {
      'index': index,
      'sourceHatchFill': sourceHatchFill,
      'iterator': this.getIterator()
    };
    fill = acgraph.vector.normalizeHatchFill(hatchFill.call(scope));
  } else if (goog.isBoolean(hatchFill)) {
    fill = hatchFill ? acgraph.vector.normalizeHatchFill(anychart.sparklineModule.Chart.DEFAULT_HATCH_FILL_TYPE) : null;
  } else
    fill = acgraph.vector.normalizeHatchFill(hatchFill);
  return fill;
};


/**
 * Method that gets the final hatch fill for a current point, with all fallbacks taken into account.
 * @param {boolean} usePointSettings If point settings should count too (iterator questioning).
 * @return {!(acgraph.vector.HatchFill|acgraph.vector.PatternFill)} Final hatch fill for the current row.
 */
anychart.sparklineModule.Chart.prototype.getFinalHatchFill = function(usePointSettings) {
  var iterator = this.getIterator();
  var val = /** @type {number} */ (iterator.get('value'));
  var index = iterator.getIndex();

  var finalHatchFill;
  if (usePointSettings && goog.isDef(iterator.get('hatchFill'))) {
    //user settings defined
    finalHatchFill = iterator.get('hatchFill');
  } else if (index == iterator.getRowsCount() - 1 && goog.isDef(this.getOption('lastHatchFill'))) {
    //last point
    finalHatchFill = this.getOption('lastHatchFill');
  } else if (!index && goog.isDef(this.getOption('firstHatchFill'))) {
    //first point
    finalHatchFill = this.getOption('firstHatchFill');
  } else if (val == this.getStat(anychart.enums.Statistics.MAX) && goog.isDef(this.getOption('maxHatchFill'))) {
    //point have max value
    finalHatchFill = this.getOption('maxHatchFill');
  } else if (val == this.getStat(anychart.enums.Statistics.MIN) && goog.isDef(this.getOption('minHatchFill'))) {
    //point have min value
    finalHatchFill = this.getOption('minHatchFill');
  } else if (val < 0 && goog.isDef(this.getOption('negativeHatchFill'))) {
    //point have negative value
    finalHatchFill = this.getOption('negativeHatchFill');
  } else {
    //another case
    finalHatchFill = this.getOption('hatchFill');
  }

  return /** @type {!(acgraph.vector.HatchFill|acgraph.vector.PatternFill)} */(
      this.normalizeHatchFill(
          /** @type {acgraph.vector.HatchFill|acgraph.vector.PatternFill|Function|boolean|string} */(finalHatchFill)));
};


/**
 * Merge factory settings.
 * @param {Array.<anychart.core.ui.MarkersFactory|anychart.core.ui.MarkersFactory.Marker|
 * anychart.core.ui.LabelsFactory|anychart.core.ui.LabelsFactory.Label|Object>} settings Array of marker settings.
 * @param {Array.<string>} fields Entries fields to merge.
 * @return {Object} Object with merged settings.
 * @private
 */
anychart.sparklineModule.Chart.prototype.mergeFactorySettings_ = function(settings, fields) {
  var res = {};

  //var isDefinedEnabledState = false;
  for (var i = settings.length; i--;) {
    var setting = settings[i];
    if (setting) {
      var isJson = !(anychart.utils.instanceOf(setting, anychart.core.VisualBase));
      var enabled = isJson ? setting['enabled'] : setting['enabled']();
      //if (!isDefinedEnabledState) isDefinedEnabledState = goog.isBoolean(enabled);
      if (enabled /*|| (isDefinedEnabledState && !goog.isBoolean(enabled))*/) {
        for (var j = 0, fieldsCount = fields.length; j < fieldsCount; j++) {
          var field = fields[j];
          var value = isJson ? setting[field] : setting[field]();
          if (goog.isDef(value))
            res[field] = anychart.utils.instanceOf(value, anychart.core.Base) ? value.serialize() : value;
        }
      }
    }
  }

  return res;
};


/**
 * Merge factory settings.
 * @param {Array.<anychart.core.ui.MarkersFactory|anychart.core.ui.MarkersFactory.Marker|
 * anychart.core.ui.LabelsFactory|anychart.core.ui.LabelsFactory.Label|Object>} settings Array of marker settings.
 * @param {Array.<string>} fields Entries fields to merge.
 * @return {Object} Object with merged settings.
 * @private
 */
anychart.sparklineModule.Chart.prototype.mergeFactorySettingsEasy_ = function(settings, fields) {
  var res = {};

  for (var i = settings.length; i--;) {
    var setting = settings[i];
    if (setting) {
      var isJson = !(anychart.utils.instanceOf(setting, anychart.core.VisualBase));
      for (var j = 0, fieldsCount = fields.length; j < fieldsCount; j++) {
        var field = fields[j];
        var value = isJson ? setting[field] : setting[field]();
        if (goog.isDef(value))
          res[field] = anychart.utils.instanceOf(value, anychart.core.Base) ? value.serialize() : value;
      }
    }
  }

  return res;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Markers.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter/setter for markers.
 * @param {(Object|boolean|null|string)=} opt_value Series data markers settings.
 * @return {!(anychart.core.ui.MarkersFactory.Marker|anychart.sparklineModule.Chart)} Markers instance or itself for chaining call.
 */
anychart.sparklineModule.Chart.prototype.markers = function(opt_value) {
  if (!this.markers_) {
    this.markers_ = new anychart.core.ui.MarkersFactory.Marker();
    this.setupCreated('markers', this.markers_);
    this.markers_.listenSignals(this.markersInvalidated_, this);
  }

  if (goog.isDef(opt_value)) {
    if (goog.isObject(opt_value) && !('enabled' in opt_value))
      opt_value['enabled'] = true;
    this.markers_.setup(opt_value);
    return this;
  }
  return this.markers_;
};


/**
 * Getter/setter for negativeMarkers.
 * @param {(Object|boolean|null|string)=} opt_value Data negative markers settings.
 * @return {!(anychart.core.ui.MarkersFactory.Marker|anychart.sparklineModule.Chart)} Markers instance or itself for chaining call.
 */
anychart.sparklineModule.Chart.prototype.negativeMarkers = function(opt_value) {
  if (!this.negativeMarkers_) {
    this.negativeMarkers_ = new anychart.core.ui.MarkersFactory.Marker();
    this.setupCreated('negativeMarkers', this.negativeMarkers_);
    this.negativeMarkers_.listenSignals(this.markersInvalidated_, this);
  }

  if (goog.isDef(opt_value)) {
    if (goog.isObject(opt_value) && !('enabled' in opt_value))
      opt_value['enabled'] = true;
    this.negativeMarkers_.setup(opt_value);
    return this;
  }
  return this.negativeMarkers_;
};


/**
 * Getter/setter for firstMarkers.
 * @param {(Object|boolean|null|string)=} opt_value Data first markers settings.
 * @return {!(anychart.core.ui.MarkersFactory.Marker|anychart.sparklineModule.Chart)} Markers instance or itself for chaining call.
 */
anychart.sparklineModule.Chart.prototype.firstMarkers = function(opt_value) {
  if (!this.firstMarkers_) {
    this.firstMarkers_ = new anychart.core.ui.MarkersFactory.Marker();
    this.setupCreated('firstMarkers', this.firstMarkers_);
    this.firstMarkers_.listenSignals(this.markersInvalidated_, this);
  }

  if (goog.isDef(opt_value)) {
    if (goog.isObject(opt_value) && !('enabled' in opt_value))
      opt_value['enabled'] = true;
    this.firstMarkers_.setup(opt_value);
    return this;
  }
  return this.firstMarkers_;
};


/**
 * Getter/setter for lastMarkers.
 * @param {(Object|boolean|null|string)=} opt_value Data last markers settings.
 * @return {!(anychart.core.ui.MarkersFactory.Marker|anychart.sparklineModule.Chart)} Markers instance or itself for chaining call.
 */
anychart.sparklineModule.Chart.prototype.lastMarkers = function(opt_value) {
  if (!this.lastMarkers_) {
    this.lastMarkers_ = new anychart.core.ui.MarkersFactory.Marker();
    this.setupCreated('lastMarkers', this.lastMarkers_);
    this.lastMarkers_.listenSignals(this.markersInvalidated_, this);
  }

  if (goog.isDef(opt_value)) {
    if (goog.isObject(opt_value) && !('enabled' in opt_value))
      opt_value['enabled'] = true;
    this.lastMarkers_.setup(opt_value);
    return this;
  }
  return this.lastMarkers_;
};


/**
 * Getter/setter for maxMarkers.
 * @param {(Object|boolean|null|string)=} opt_value Data max markers settings.
 * @return {!(anychart.core.ui.MarkersFactory.Marker|anychart.sparklineModule.Chart)} Markers instance or itself for chaining call.
 */
anychart.sparklineModule.Chart.prototype.maxMarkers = function(opt_value) {
  if (!this.maxMarkers_) {
    this.maxMarkers_ = new anychart.core.ui.MarkersFactory.Marker();
    this.setupCreated('maxMarkers', this.maxMarkers_);
    this.maxMarkers_.listenSignals(this.markersInvalidated_, this);
  }

  if (goog.isDef(opt_value)) {
    if (goog.isObject(opt_value) && !('enabled' in opt_value))
      opt_value['enabled'] = true;
    this.maxMarkers_.setup(opt_value);
    return this;
  }
  return this.maxMarkers_;
};


/**
 * Getter/setter for minMarkers.
 * @param {(Object|boolean|null|string)=} opt_value Data min markers settings.
 * @return {!(anychart.core.ui.MarkersFactory.Marker|anychart.sparklineModule.Chart)} Markers instance or itself for chaining call.
 */
anychart.sparklineModule.Chart.prototype.minMarkers = function(opt_value) {
  if (!this.minMarkers_) {
    this.minMarkers_ = new anychart.core.ui.MarkersFactory.Marker();
    this.setupCreated('minMarkers', this.minMarkers_);
    this.minMarkers_.listenSignals(this.markersInvalidated_, this);
  }

  if (goog.isDef(opt_value)) {
    if (goog.isObject(opt_value) && !('enabled' in opt_value))
      opt_value['enabled'] = true;
    this.minMarkers_.setup(opt_value);
    return this;
  }
  return this.minMarkers_;
};


/**
 * Returns markers factory.
 * @return {!anychart.core.ui.MarkersFactory}
 */
anychart.sparklineModule.Chart.prototype.getMarkersInternal = function() {
  return this.markersInternal_;
};


/**
 * Method that gets final marker for the current point, with all fallbacks taken into account.
 * @param {boolean} usePointSettings If point settings should count too (iterator questioning).
 * @return {?anychart.core.ui.MarkersFactory.Marker} .
 */
anychart.sparklineModule.Chart.prototype.getFinalMarker = function(usePointSettings) {
  var iterator = this.getIterator();
  var val = /** @type {number} */ (iterator.get('value'));
  var index = iterator.getIndex();

  var customMarker;
  if (usePointSettings) {
    //user settings defined
    customMarker = iterator.get('marker');
  }

  var firstOrLastMarkers;
  var defaultFirstOrLastMarkers;
  if (index == iterator.getRowsCount() - 1) {
    //last point
    firstOrLastMarkers = this.lastMarkers();
    defaultFirstOrLastMarkers = this.seriesDefaults_['lastMarkers'];
  } else if (!index) {
    //first point
    firstOrLastMarkers = this.firstMarkers();
    defaultFirstOrLastMarkers = this.seriesDefaults_['firstMarkers'];
  }

  var maxOrMinMarkers;
  var defaultMaxOrMinMarkers;
  if (val == this.getStat(anychart.enums.Statistics.MAX)) {
    //point have max value
    maxOrMinMarkers = this.maxMarkers();
    defaultMaxOrMinMarkers = this.seriesDefaults_['maxMarkers'];
  } else if (val == this.getStat(anychart.enums.Statistics.MIN)) {
    //point have min value
    maxOrMinMarkers = this.minMarkers();
    defaultMaxOrMinMarkers = this.seriesDefaults_['minMarkers'];
  }

  var negativeMarkers;
  var defaultNegativeMarkers;
  if (val < 0) {
    //point have negative value
    negativeMarkers = this.negativeMarkers();
    defaultNegativeMarkers = this.seriesDefaults_['negativeMarkers'];
  }

  //another case
  var markers = this.markers();
  var defaultMarkers = this.seriesDefaults_['markers'];

  var autoFill = this.getFinalFill(true);
  var autoColor = {'fill': autoFill, 'stroke': anychart.color.darken(autoFill)};

  var defaultSettings = [defaultFirstOrLastMarkers, defaultMaxOrMinMarkers, defaultNegativeMarkers, defaultMarkers, autoColor];
  var finalDefaultSettings = this.mergeFactorySettingsEasy_(defaultSettings, anychart.sparklineModule.Chart.MARKERS_FIELD_NAMES_FOR_MERGE_);

  var settings = [customMarker, firstOrLastMarkers, maxOrMinMarkers, negativeMarkers, markers];

  var finalSettings = this.mergeFactorySettings_(settings, anychart.sparklineModule.Chart.MARKERS_FIELD_NAMES_FOR_MERGE_);

  finalSettings = this.mergeFactorySettingsEasy_([finalSettings, finalDefaultSettings],
      anychart.sparklineModule.Chart.MARKERS_FIELD_NAMES_FOR_MERGE_);

  var marker = this.getMarkersInternal().getMarker(index);
  var res = null;
  if (finalSettings['enabled']) {
    var position = finalSettings['position'] || this.getMarkersInternal().getOption('position');
    var positionProvider = this.series_.createPositionProvider(/** @type {anychart.enums.Position|string} */(position));

    if (marker) {
      marker.positionProvider(positionProvider);
    } else {
      marker = this.getMarkersInternal().add(positionProvider, index);
    }

    marker.resetSettings();
    marker.currentMarkersFactory(this.getMarkersInternal());
    marker.setSettings(/** @type {Object} */(finalSettings));
    res = marker;
  } else if (marker) {
    marker.clear();
  }

  return res;
};


/**
 * Listener for markers invalidation.
 * @param {anychart.SignalEvent} event Invalidation event.
 * @private
 */
anychart.sparklineModule.Chart.prototype.markersInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    if (this.series_) this.series_.invalidate(anychart.ConsistencyState.SERIES_MARKERS, anychart.Signal.NEEDS_REDRAW);
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Labels.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter/setter for labels.
 * @param {(Object|boolean|null|string)=} opt_value Series data markers settings.
 * @return {!(anychart.core.ui.LabelsFactory.Label|anychart.sparklineModule.Chart)} Markers instance or itself for chaining call.
 */
anychart.sparklineModule.Chart.prototype.labels = function(opt_value) {
  if (!this.labels_) {
    this.labels_ = new anychart.core.ui.LabelsFactory.Label();
    this.setupCreated('labels', this.labels_);
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
 * Getter/setter for negativeLabels.
 * @param {(Object|boolean|null|string)=} opt_value Data negative labels settings.
 * @return {!(anychart.core.ui.LabelsFactory.Label|anychart.sparklineModule.Chart)} Markers instance or itself for chaining call.
 */
anychart.sparklineModule.Chart.prototype.negativeLabels = function(opt_value) {
  if (!this.negativeLabels_) {
    this.negativeLabels_ = new anychart.core.ui.LabelsFactory.Label();
    this.setupCreated('negativeLabels', this.negativeLabels_);
    this.negativeLabels_.listenSignals(this.labelsInvalidated_, this);
  }

  if (goog.isDef(opt_value)) {
    if (goog.isObject(opt_value) && !('enabled' in opt_value))
      opt_value['enabled'] = true;
    this.negativeLabels_.setup(opt_value);
    return this;
  }
  return this.negativeLabels_;
};


/**
 * Getter/setter for firstLabels.
 * @param {(Object|boolean|null|string)=} opt_value Data first labels settings.
 * @return {!(anychart.core.ui.LabelsFactory.Label|anychart.sparklineModule.Chart)} Markers instance or itself for chaining call.
 */
anychart.sparklineModule.Chart.prototype.firstLabels = function(opt_value) {
  if (!this.firstLabels_) {
    this.firstLabels_ = new anychart.core.ui.LabelsFactory.Label();
    this.setupCreated('firstLabels', this.firstLabels_);
    this.firstLabels_.listenSignals(this.labelsInvalidated_, this);
  }

  if (goog.isDef(opt_value)) {
    if (goog.isObject(opt_value) && !('enabled' in opt_value))
      opt_value['enabled'] = true;
    this.firstLabels_.setup(opt_value);
    return this;
  }
  return this.firstLabels_;
};


/**
 * Getter/setter for lastLabels.
 * @param {(Object|boolean|null|string)=} opt_value Data last labels settings.
 * @return {!(anychart.core.ui.LabelsFactory.Label|anychart.sparklineModule.Chart)} Markers instance or itself for chaining call.
 */
anychart.sparklineModule.Chart.prototype.lastLabels = function(opt_value) {
  if (!this.lastLabels_) {
    this.lastLabels_ = new anychart.core.ui.LabelsFactory.Label();
    this.setupCreated('lastLabels', this.lastLabels_);
    this.lastLabels_.listenSignals(this.labelsInvalidated_, this);
  }

  if (goog.isDef(opt_value)) {
    if (goog.isObject(opt_value) && !('enabled' in opt_value))
      opt_value['enabled'] = true;
    this.lastLabels_.setup(opt_value);
    return this;
  }
  return this.lastLabels_;
};


/**
 * Getter/setter for maxLabels.
 * @param {(Object|boolean|null|string)=} opt_value Data max labels settings.
 * @return {!(anychart.core.ui.LabelsFactory.Label|anychart.sparklineModule.Chart)} Markers instance or itself for chaining call.
 */
anychart.sparklineModule.Chart.prototype.maxLabels = function(opt_value) {
  if (!this.maxLabels_) {
    this.maxLabels_ = new anychart.core.ui.LabelsFactory.Label();
    this.setupCreated('maxLabels', this.maxLabels_);
    this.maxLabels_.listenSignals(this.labelsInvalidated_, this);
  }

  if (goog.isDef(opt_value)) {
    if (goog.isObject(opt_value) && !('enabled' in opt_value))
      opt_value['enabled'] = true;
    this.maxLabels_.setup(opt_value);
    return this;
  }
  return this.maxLabels_;
};


/**
 * Getter/setter for minLabels.
 * @param {(Object|boolean|null|string)=} opt_value Data min labels settings.
 * @return {!(anychart.core.ui.LabelsFactory.Label|anychart.sparklineModule.Chart)} Markers instance or itself for chaining call.
 */
anychart.sparklineModule.Chart.prototype.minLabels = function(opt_value) {
  if (!this.minLabels_) {
    this.minLabels_ = new anychart.core.ui.LabelsFactory.Label();
    this.setupCreated('minLabels', this.minLabels_);
    this.minLabels_.listenSignals(this.labelsInvalidated_, this);
  }

  if (goog.isDef(opt_value)) {
    if (goog.isObject(opt_value) && !('enabled' in opt_value))
      opt_value['enabled'] = true;
    this.minLabels_.setup(opt_value);
    return this;
  }
  return this.minLabels_;
};


/**
 * Returns labels factory.
 * @return {!anychart.core.ui.LabelsFactory}
 */
anychart.sparklineModule.Chart.prototype.getLabelsInternal = function() {
  return this.labelsInternal_;
};


/**
 * Method that gets final label for the current point, with all fallbacks taken into account.
 * @param {boolean} usePointSettings If point settings should count too (iterator questioning).
 * @return {?anychart.core.ui.LabelsFactory.Label} .
 */
anychart.sparklineModule.Chart.prototype.getFinalLabel = function(usePointSettings) {
  var iterator = this.getIterator();
  var val = /** @type {number} */ (iterator.get('value'));
  var index = iterator.getIndex();

  var customLabel;
  if (usePointSettings) {
    //user settings defined
    customLabel = iterator.get('label');
  }

  var firstOrLastLabels;
  var defaultFirstOrLastLabels;
  if (index == iterator.getRowsCount() - 1) {
    //last point
    firstOrLastLabels = this.lastLabels();
    defaultFirstOrLastLabels = this.seriesDefaults_['lastLabels'];
  } else if (!index) {
    //first point
    firstOrLastLabels = this.firstLabels();
    defaultFirstOrLastLabels = this.seriesDefaults_['firstLabels'];
  }

  var maxOrMinLabels;
  var defaultMaxOrMinLabels;
  if (val == this.getStat(anychart.enums.Statistics.MAX)) {
    //point have max value
    maxOrMinLabels = this.maxLabels();
    defaultMaxOrMinLabels = this.seriesDefaults_['maxLabels'];
  } else if (val == this.getStat(anychart.enums.Statistics.MIN)) {
    //point have min value
    maxOrMinLabels = this.minLabels();
    defaultMaxOrMinLabels = this.seriesDefaults_['minLabels'];
  }

  var negativeLabels;
  var defaultNegativeLabels;
  if (val < 0) {
    //point have negative value
    negativeLabels = this.negativeLabels();
    defaultNegativeLabels = this.seriesDefaults_['negativeLabels'];
  }

  //another case
  var labels = this.labels();
  var defaultLabels = this.seriesDefaults_['labels'];

  var defaultSettings = [defaultFirstOrLastLabels, defaultMaxOrMinLabels, defaultNegativeLabels, defaultLabels];
  var finalDefaultSettings = this.mergeFactorySettingsEasy_(defaultSettings, anychart.sparklineModule.Chart.LABELS_FIELD_NAMES_FOR_MERGE_);

  var settings = [customLabel, firstOrLastLabels, maxOrMinLabels, negativeLabels, labels];

  var finalSettings = this.mergeFactorySettings_(settings, anychart.sparklineModule.Chart.LABELS_FIELD_NAMES_FOR_MERGE_);

  finalSettings = this.mergeFactorySettingsEasy_([finalSettings, finalDefaultSettings],
      anychart.sparklineModule.Chart.LABELS_FIELD_NAMES_FOR_MERGE_);

  var label = this.getLabelsInternal().getLabel(index);
  var res = null;
  if (finalSettings['enabled']) {
    var position = finalSettings['position'] || this.getLabelsInternal().getOption('position');
    var positionProvider = this.series_.createPositionProvider(/** @type {anychart.enums.Position|string} */(position));
    var formatProvider = this.series_.createFormatProvider();

    if (label) {
      label.formatProvider(formatProvider);
      label.positionProvider(positionProvider);
    } else {
      label = this.getLabelsInternal().add(formatProvider, positionProvider, index);
    }

    label.resetSettings();
    // label.currentLabelsFactory(this.labelsInternal_);
    label.setSettings(/** @type {Object} */(finalSettings));
    res = label;
  } else if (label) {
    label.clear();
  }
  return res;
};


/**
 * Listener for markers invalidation.
 * @param {anychart.SignalEvent} event Invalidation event.
 * @private
 */
anychart.sparklineModule.Chart.prototype.labelsInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    if (this.series_) this.series_.invalidate(anychart.ConsistencyState.SERIES_LABELS, anychart.Signal.NEEDS_REDRAW);
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Calculation.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * @inheritDoc
 */
anychart.sparklineModule.Chart.prototype.calculate = function() {
  /** @type {anychart.data.Iterator} */
  var iterator;
  /** @type {*} */
  var value;

  if (this.hasInvalidationState(anychart.ConsistencyState.SPARK_SCALES)) {
    this.resetStatistics();
    var x, y;
    var xScale = /** @type {anychart.scales.Base} */ (this.xScale());
    var yScale = /** @type {anychart.scales.Base} */ (this.yScale());
    if (xScale.needsAutoCalc()) xScale.startAutoCalc();
    if (yScale.needsAutoCalc()) yScale.startAutoCalc();

    iterator = this.getResetIterator();

    while (iterator.advance()) {
      x = iterator.get('x');
      y = iterator.get('value');
      if (goog.isDef(x))
        xScale.extendDataRange(x);
      if (goog.isDef(y))
        yScale.extendDataRange(y);
    }

    var scalesChanged = false;
    if (xScale.needsAutoCalc()) scalesChanged |= xScale.finishAutoCalc();
    if (yScale.needsAutoCalc()) scalesChanged |= yScale.finishAutoCalc();

    if (scalesChanged)
      this.invalidateSeries_();

    //calc statistics
    var seriesMax = -Infinity;
    var seriesMin = Infinity;
    var seriesSum = 0;
    var seriesPointsCount = 0;

    iterator = this.getResetIterator();

    while (iterator.advance()) {
      value = this.getReferenceScaleValues();
      if (value) {
        y = anychart.utils.toNumber(value);
        if (!isNaN(y)) {
          seriesMax = Math.max(seriesMax, y);
          seriesMin = Math.min(seriesMin, y);
          seriesSum += y;
        }
      }
      seriesPointsCount++;
    }
    var seriesAverage = seriesSum / seriesPointsCount;

    this.statistics(anychart.enums.Statistics.MAX, seriesMax);
    this.statistics(anychart.enums.Statistics.MIN, seriesMin);
    this.statistics(anychart.enums.Statistics.SUM, seriesSum);
    this.statistics(anychart.enums.Statistics.AVERAGE, seriesAverage);
    this.statistics(anychart.enums.Statistics.POINTS_COUNT, seriesPointsCount);

    this.markConsistent(anychart.ConsistencyState.SPARK_SCALES);
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Drawing.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Draw sparkline chart content items.
 * @param {anychart.math.Rect} bounds Bounds of sparkline content area.
 */
anychart.sparklineModule.Chart.prototype.drawContent = function(bounds) {
  if (this.hasInvalidationState(anychart.ConsistencyState.SPARK_SERIES)) {
    if (!this.series_)
      this.series_ = this.createSeriesByType_(/** @type {anychart.enums.SparklineSeriesType} */ (this.getOption('seriesType')));
  }

  this.calculate();
  if (this.isConsistent())
    return;

  anychart.core.Base.suspendSignalsDispatching(this.series_);

  //calculate axes space first, the result is data bounds
  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    //bounds of data area
    this.dataBounds_ = bounds.clone().round();
    if (this.series_.isWidthBased())
      this.series_.fixBounds(this.dataBounds_);

    this.invalidateSeries_();
    this.invalidate(anychart.ConsistencyState.SPARK_AXES_MARKERS |
        anychart.ConsistencyState.SPARK_SERIES);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.SPARK_AXES_MARKERS)) {
    var markers = goog.array.concat(
        this.lineAxesMarkers_,
        this.rangeAxesMarkers_,
        this.textAxesMarkers_);

    for (var i = 0, count = markers.length; i < count; i++) {
      var axesMarker = markers[i];
      if (axesMarker) {
        axesMarker.suspendSignalsDispatching();
        if (axesMarker.isHorizontal()) {
          axesMarker.scale(/** @type {anychart.scales.Base} */(this.yScale()));
        } else {
          axesMarker.scale(/** @type {anychart.scales.Base} */(this.xScale()));
        }
        axesMarker.parentBounds(this.dataBounds_);
        axesMarker.container(this.rootElement);
        axesMarker.draw();
        axesMarker.resumeSignalsDispatching(false);
      }
    }
    this.markConsistent(anychart.ConsistencyState.SPARK_AXES_MARKERS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.SPARK_SERIES)) {
    var series = this.series_;
    if (series) {
      series.container(this.rootElement);
      series.parentBounds(this.dataBounds_);

      this.series_.startDrawing();

      var iterator = this.getResetIterator();
      while (iterator.advance()) {
        this.series_.drawPoint();
      }

      this.series_.finalizeDrawing();

      this.markers().markConsistent(anychart.ConsistencyState.ALL);
      this.minMarkers().markConsistent(anychart.ConsistencyState.ALL);
      this.maxMarkers().markConsistent(anychart.ConsistencyState.ALL);
      this.negativeMarkers().markConsistent(anychart.ConsistencyState.ALL);
      this.firstMarkers().markConsistent(anychart.ConsistencyState.ALL);
      this.lastMarkers().markConsistent(anychart.ConsistencyState.ALL);

      this.labels().markConsistent(anychart.ConsistencyState.ALL);
      this.minLabels().markConsistent(anychart.ConsistencyState.ALL);
      this.maxLabels().markConsistent(anychart.ConsistencyState.ALL);
      this.negativeLabels().markConsistent(anychart.ConsistencyState.ALL);
      this.firstLabels().markConsistent(anychart.ConsistencyState.ALL);
      this.lastLabels().markConsistent(anychart.ConsistencyState.ALL);
    }
    this.markConsistent(anychart.ConsistencyState.SPARK_SERIES);
  }

  anychart.core.Base.resumeSignalsDispatchingFalse(this.series_);
};


/**
 * Invalidates APPEARANCE for all width-based series.
 * @private
 */
anychart.sparklineModule.Chart.prototype.invalidateSeries_ = function() {
  if (this.series_)
    this.series_.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.SERIES_HATCH_FILL);
};


//region --- CSV
//------------------------------------------------------------------------------
//
//  CSV
//
//------------------------------------------------------------------------------
/** @inheritDoc */
anychart.sparklineModule.Chart.prototype.getCsvGrouperColumn = function() {
  return ['x'];
};


/** @inheritDoc */
anychart.sparklineModule.Chart.prototype.getCsvGrouperValue = function(iterator) {
  return iterator.get('x');
};


/** @inheritDoc */
anychart.sparklineModule.Chart.prototype.getCsvGrouperAlias = function(iterator) {
  var res = iterator.get('name');
  return goog.isString(res) ? res : null;
};


//endregion
//region --- No data label
/**
 * Is there no data on the chart.
 * @return {boolean}
 */
anychart.sparklineModule.Chart.prototype.isNoData = function() {
  var rowsCount = this.getIterator().getRowsCount();
  return (!rowsCount || !(this.series_ && this.series_.enabled()));
};


//endregion

//region Elements setup
/**
 * Returns scale instances.
 * @param {(Array.<(string|Object)>|Object)} scalesConfig
 * @return {Object}
 * */
anychart.sparklineModule.Chart.prototype.getScaleInstances = function(scalesConfig) {
  var i, json, scale, type = this.getType();

  var scalesInstances = {};
  if (goog.isArray(scalesConfig)) {
    for (i = 0; i < scalesConfig.length; i++) {
      json = scalesConfig[i];
      if (goog.isString(json)) {
        json = {'type': json};
      }
      json = anychart.themes.merging.mergeScale(json, i, type, anychart.enums.ScaleTypes.LINEAR);
      scale = anychart.scales.Base.fromString(json['type'], false);
      scale.setup(json);
      scalesInstances[i] = scale;
    }
  } else if (goog.isObject(scalesConfig)) {
    for (i in scalesConfig) {
      if (!scalesConfig.hasOwnProperty(i)) continue;
      json = scalesConfig[i];
      if (goog.isString(json)) {
        json = {'type': json};
      }
      json = anychart.themes.merging.mergeScale(json, i, type, anychart.enums.ScaleTypes.LINEAR);
      scale = anychart.scales.Base.fromString(json['type'], false);
      scale.setup(json);
      scalesInstances[i] = scale;
    }
  }
  return scalesInstances;
};


/**
 * Setup scale for chart.
 * @param {(number|string|Object)} scaleConfig
 * @param {Object} scalesInstances
 * @param {string} scaleType
 * */
anychart.sparklineModule.Chart.prototype.setupScale = function(scaleConfig, scalesInstances, scaleType) {
  var scale;
  if (goog.isNumber(scaleConfig)) {
    scale = scalesInstances[scaleConfig];
  } else if (goog.isString(scaleConfig)) {
    scale = anychart.scales.Base.fromString(scaleConfig, null);
    if (!scale)
      scale = scalesInstances[scaleConfig];
  } else if (goog.isObject(scaleConfig)) {
    scale = anychart.scales.Base.fromString(scaleConfig['type'], true);
    scale.setup(scaleConfig);
  } else {
    scale = null;
  }
  if (scale)
    this[scaleType](scale);
};


/**
 * Setup marker with scale.
 * @param {Array.<Object>} markerConfig
 * @param {Object} scalesInstances
 * @param {string} markerType
 * */
anychart.sparklineModule.Chart.prototype.setupMarker = function(markerConfig, scalesInstances, markerType) {
  var json;
  if (goog.isArray(markerConfig)) {
    for (var i = 0; i < markerConfig.length; i++) {
      json = markerConfig[i];
      this[markerType](i, json);
      if (goog.isObject(json) && 'scale' in json && json['scale'] > 1) this[markerType](i).scale(scalesInstances[json['scale']]);
    }
  }
};


/**
 * Setup elements that we need setup.
 * */
anychart.sparklineModule.Chart.prototype.setupElements = function() {
  this.setupScaleForElements(this.themeSettings);
};


/**
 * Setup scale and scales for markers.
 * @param {Object} config Config with settings.
 * */
anychart.sparklineModule.Chart.prototype.setupScaleForElements = function(config) {
  var scalesInstances = this.getScaleInstances(config['scales']);
  this.setupScale(config['xScale'], scalesInstances, 'xScale');
  this.setupScale(config['yScale'], scalesInstances, 'yScale');
  this.setupMarker(config['lineAxesMarkers'], scalesInstances, 'lineMarker');
  this.setupMarker(config['rangeAxesMarkers'], scalesInstances, 'rangeMarker');
  this.setupMarker(config['textAxesMarkers'], scalesInstances, 'textMarker');
};

//endregion

/** @inheritDoc */
anychart.sparklineModule.Chart.prototype.setupByJSON = function(config, opt_default) {
  anychart.sparklineModule.Chart.base(this, 'setupByJSON', config, opt_default);

  if ('defaultSeriesSettings' in config)
    this.defaultSeriesSettings(config['defaultSeriesSettings']);

  this.data(config['data']);

  anychart.core.settings.deserialize(this, anychart.sparklineModule.Chart.PROPERTY_DESCRIPTORS, config);
  this.clip(config['clip']);
  this.data(config['data']);

  this.setupScaleForElements(config);

  if (config['lastMarkers']) this.lastMarkers().setupInternal(!!opt_default, config['lastMarkers']);
  if (config['firstMarkers']) this.firstMarkers().setupInternal(!!opt_default, config['firstMarkers']);
  if (config['maxMarkers']) this.maxMarkers().setupInternal(!!opt_default, config['maxMarkers']);
  if (config['minMarkers']) this.minMarkers().setupInternal(!!opt_default, config['minMarkers']);
  if (config['negativeMarkers']) this.negativeMarkers().setupInternal(!!opt_default, config['negativeMarkers']);
  if (config['markers']) this.markers().setupInternal(!!opt_default, config['markers']);
  if (config['firstLabels']) this.firstLabels().setupInternal(!!opt_default, config['firstLabels']);
  if (config['lastLabels']) this.lastLabels().setupInternal(!!opt_default, config['lastLabels']);
  if (config['maxLabels']) this.maxLabels().setupInternal(!!opt_default, config['maxLabels']);
  if (config['minLabels']) this.minLabels().setupInternal(!!opt_default, config['minLabels']);
  if (config['negativeLabels']) this.negativeLabels().setupInternal(!!opt_default, config['negativeLabels']);
  if (config['labels']) this.labels().setupInternal(!!opt_default, config['labels']);
};


/**
 * @inheritDoc
 */
anychart.sparklineModule.Chart.prototype.serialize = function() {
  var json = anychart.sparklineModule.Chart.base(this, 'serialize');
  anychart.core.settings.serialize(this, anychart.sparklineModule.Chart.PROPERTY_DESCRIPTORS, json);
  var i;
  var scalesIds = {};
  var scales = [];
  var scale;
  var config;
  var objId;

  scalesIds[goog.getUid(this.xScale())] = this.xScale().serialize();
  scales.push(scalesIds[goog.getUid(this.xScale())]);
  json['xScale'] = scales.length - 1;
  if (this.xScale() != this.yScale()) {
    scalesIds[goog.getUid(this.yScale())] = this.yScale().serialize();
    scales.push(scalesIds[goog.getUid(this.yScale())]);
  }
  json['yScale'] = scales.length - 1;
  json['clip'] = (anychart.utils.instanceOf(this.clip_, anychart.math.Rect)) ? this.clip_.serialize() : this.clip_;
  json['data'] = this.data().serialize();
  json['lastMarkers'] = this.lastMarkers().serialize();
  json['lastLabels'] = this.lastLabels().serialize();
  json['firstMarkers'] = this.firstMarkers().serialize();
  json['firstLabels'] = this.firstLabels().serialize();
  json['maxMarkers'] = this.maxMarkers().serialize();
  json['maxLabels'] = this.maxLabels().serialize();
  json['minMarkers'] = this.minMarkers().serialize();
  json['minLabels'] = this.minLabels().serialize();
  json['negativeMarkers'] = this.negativeMarkers().serialize();
  json['negativeLabels'] = this.negativeLabels().serialize();
  json['markers'] = this.markers().serialize();
  json['labels'] = this.labels().serialize();

  var lineAxesMarkers = [];
  for (i = 0; i < this.lineAxesMarkers_.length; i++) {
    var lineAxesMarker = this.lineAxesMarkers_[i];
    if (lineAxesMarker) {
      config = lineAxesMarker.serialize();
      scale = lineAxesMarker.scale();
      if (scale) {
        objId = goog.getUid(scale);
        if (!scalesIds[objId]) {
          scalesIds[objId] = scale.serialize();
          scales.push(scalesIds[objId]);
          config['scale'] = scales.length - 1;
        } else {
          config['scale'] = goog.array.indexOf(scales, scalesIds[objId]);
        }
      }
      lineAxesMarkers.push(config);
    }
  }
  if (lineAxesMarkers.length) json['lineAxesMarkers'] = lineAxesMarkers;

  var rangeAxesMarkers = [];
  for (i = 0; i < this.rangeAxesMarkers_.length; i++) {
    var rangeAxesMarker = this.rangeAxesMarkers_[i];
    if (rangeAxesMarker) {
      config = rangeAxesMarker.serialize();
      scale = rangeAxesMarker.scale();
      if (scale) {
        objId = goog.getUid(scale);
        if (!scalesIds[objId]) {
          scalesIds[objId] = scale.serialize();
          scales.push(scalesIds[objId]);
          config['scale'] = scales.length - 1;
        } else {
          config['scale'] = goog.array.indexOf(scales, scalesIds[objId]);
        }
      }
      rangeAxesMarkers.push(config);
    }
  }
  if (rangeAxesMarkers.length) json['rangeAxesMarkers'] = rangeAxesMarkers;

  var textAxesMarkers = [];
  for (i = 0; i < this.textAxesMarkers_.length; i++) {
    var textAxesMarker = this.textAxesMarkers_[i];
    if (textAxesMarker) {
      config = textAxesMarker.serialize();
      scale = textAxesMarker.scale();
      if (scale) {
        objId = goog.getUid(scale);
        if (!scalesIds[objId]) {
          scalesIds[objId] = scale.serialize();
          scales.push(scalesIds[objId]);
          config['scale'] = scales.length - 1;
        } else {
          config['scale'] = goog.array.indexOf(scales, scalesIds[objId]);
        }
      }
      textAxesMarkers.push(config);
    }
  }
  if (textAxesMarkers.length) json['textAxesMarkers'] = textAxesMarkers;

  json['scales'] = scales;
  return {'chart': json};
};


/** @inheritDoc */
anychart.sparklineModule.Chart.prototype.disposeInternal = function() {
  goog.disposeAll(
      this.lineAxesMarkers_,
      this.rangeAxesMarkers_,
      this.textAxesMarkers_,
      this.parentViewToDispose_,
      this.parentView_,
      this.data_,
      this.series_,
      this.markers_,
      this.negativeMarkers_,
      this.firstMarkers_,
      this.lastMarkers_,
      this.maxMarkers_,
      this.minMarkers_,
      this.labels_,
      this.negativeLabels_,
      this.firstLabels_,
      this.lastLabels_,
      this.maxLabels_,
      this.minLabels_);
  this.lineAxesMarkers_.length = 0;
  this.rangeAxesMarkers_.length = 0;
  this.textAxesMarkers_.length = 0;
  this.parentViewToDispose_ = null;
  this.parentView_ = null;
  delete this.data_;
  delete this.iterator_;
  this.series_ = null;
  this.markers_ = null;
  this.negativeMarkers_ = null;
  this.firstMarkers_ = null;
  this.lastMarkers_ = null;
  this.maxMarkers_ = null;
  this.minMarkers_ = null;
  this.labels_ = null;
  this.negativeLabels_ = null;
  this.firstLabels_ = null;
  this.lastLabels_ = null;
  this.maxLabels_ = null;
  this.minLabels_ = null;
  this.seriesDefaults_ = null;
  anychart.sparklineModule.Chart.base(this, 'disposeInternal');
};


anychart.chartTypesMap[anychart.enums.ChartTypes.SPARKLINE] = anychart.sparkline;


//exports
(function() {
  var proto = anychart.sparklineModule.Chart.prototype;
  goog.exportSymbol('anychart.sparkline', anychart.sparkline);
  proto['xScale'] = proto.xScale;
  proto['yScale'] = proto.yScale;

  proto['lineMarker'] = proto.lineMarker;
  proto['rangeMarker'] = proto.rangeMarker;
  proto['textMarker'] = proto.textMarker;

  // auto generated
  // proto['type'] = proto.type;
  // proto['connectMissingPoints'] = proto.connectMissingPoints;
  // proto['pointWidth'] = proto.pointWidth;
  // proto['lastFill'] = proto.lastFill;
  // proto['firstFill'] = proto.firstFill;
  // proto['maxFill'] = proto.maxFill;
  // proto['minFill'] = proto.minFill;
  // proto['negativeFill'] = proto.negativeFill;
  // proto['fill'] = proto.fill;
  // proto['stroke'] = proto.stroke;
  // proto['lastHatchFill'] = proto.lastHatchFill;
  // proto['firstHatchFill'] = proto.firstHatchFill;
  // proto['maxHatchFill'] = proto.maxHatchFill;
  // proto['minHatchFill'] = proto.minHatchFill;
  // proto['hatchFill'] = proto.hatchFill;
  // proto['negativeHatchFill'] = proto.negativeHatchFill;

  proto['data'] = proto.data;
  proto['clip'] = proto.clip;

  proto['lastMarkers'] = proto.lastMarkers;
  proto['lastLabels'] = proto.lastLabels;

  proto['firstMarkers'] = proto.firstMarkers;
  proto['firstLabels'] = proto.firstLabels;

  proto['maxMarkers'] = proto.maxMarkers;
  proto['maxLabels'] = proto.maxLabels;

  proto['minMarkers'] = proto.minMarkers;
  proto['minLabels'] = proto.minLabels;

  proto['negativeMarkers'] = proto.negativeMarkers;
  proto['negativeLabels'] = proto.negativeLabels;

  proto['markers'] = proto.markers;
  proto['labels'] = proto.labels;

  proto['getType'] = proto.getType;
  proto['noData'] = proto.noData;
})();
