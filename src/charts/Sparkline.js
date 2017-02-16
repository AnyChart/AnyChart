goog.provide('anychart.charts.Sparkline');

goog.require('anychart'); // otherwise we can't use anychart.chartTypesMap object.
goog.require('anychart.core.Chart');
goog.require('anychart.core.axisMarkers.Line');
goog.require('anychart.core.axisMarkers.Range');
goog.require('anychart.core.axisMarkers.Text');
goog.require('anychart.core.reporting');
goog.require('anychart.core.sparkline.series.Base');
goog.require('anychart.core.ui.LabelsFactory');
goog.require('anychart.core.ui.MarkersFactory');
goog.require('anychart.core.utils.IInteractiveSeries');
goog.require('anychart.core.utils.InteractivityState');
goog.require('anychart.core.utils.PointContextProvider');
goog.require('anychart.data.Set');
goog.require('anychart.enums');
goog.require('anychart.scales');



/**
 * Sparkline chart class.<br/>
 * @param {?(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Value to set.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings here as a hash map.
 * @extends {anychart.core.Chart}
 * @implements {anychart.core.utils.IInteractiveSeries}
 * @constructor
 */
anychart.charts.Sparkline = function(opt_data, opt_csvSettings) {
  anychart.charts.Sparkline.base(this, 'constructor');

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
   * @type {anychart.core.sparkline.series.Base}
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
   * @type {boolean}
   * @protected
   */
  this.connectMissing;

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
  this.markersInternal_.positionFormatter(anychart.utils.DEFAULT_FORMATTER);
  this.markersInternal_.size(10);
  this.markersInternal_.anchor(anychart.enums.Anchor.CENTER);
  this.markersInternal_.offsetX(0);
  this.markersInternal_.offsetY(0);
  this.markersInternal_.rotation(0);
  this.markersInternal_.setParentEventTarget(this);
  this.markersInternal_.setAutoZIndex(anychart.charts.Sparkline.ZINDEX_MARKER);

  /**
   * @type {!anychart.core.ui.LabelsFactory}
   * @private
   */
  this.labelsInternal_ = new anychart.core.ui.LabelsFactory();
  // defaults that was deleted form LabelsFactory
  this.labelsInternal_.positionFormatter(anychart.utils.DEFAULT_FORMATTER);
  this.labelsInternal_.textFormatter(anychart.utils.DEFAULT_FORMATTER);
  this.labelsInternal_.background(null);
  this.labelsInternal_.rotation(0);
  this.labelsInternal_.width(null);
  this.labelsInternal_.height(null);
  this.labelsInternal_.fontSize(11);
  this.labelsInternal_.minFontSize(8);
  this.labelsInternal_.maxFontSize(72);
  this.labelsInternal_.setParentEventTarget(this);
  this.labelsInternal_.setAutoZIndex(anychart.charts.Sparkline.ZINDEX_LABEL);

  this.data(opt_data || null, opt_csvSettings);

  this.bindHandlersToComponent(this, this.handleMouseOverAndMove, this.handleMouseOut, null, this.handleMouseOverAndMove, null, this.handleMouseDown);
};
goog.inherits(anychart.charts.Sparkline, anychart.core.Chart);


/**
 * Link to incoming raw data.
 * Used to avoid data reapplication on same data sets.
 * NOTE: If is disposable entity, should be disposed from the source, not from this class.
 * @type {?(anychart.data.View|anychart.data.Set|Array|string)}
 * @private
 */
anychart.charts.Sparkline.prototype.rawData_;


/** @inheritDoc */
anychart.charts.Sparkline.prototype.getType = function() {
  return anychart.enums.ChartTypes.SPARKLINE;
};


/**
 * Supported consistency states. Adds AXES, AXES_MARKERS, GRIDS to anychart.core.Chart states.
 * @type {number}
 */
anychart.charts.Sparkline.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.Chart.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.SPARK_SCALES |
    anychart.ConsistencyState.SPARK_SERIES |
    anychart.ConsistencyState.SPARK_AXES_MARKERS;


/**
 * Series z-index in chart root layer.
 * @type {number}
 */
anychart.charts.Sparkline.ZINDEX_SERIES = 30;


/**
 * Marker z-index in chart root layer.
 * @type {number}
 */
anychart.charts.Sparkline.ZINDEX_MARKER = 40;


/**
 * Label z-index in chart root layer.
 * @type {number}
 */
anychart.charts.Sparkline.ZINDEX_LABEL = 40;


/** @inheritDoc */
anychart.charts.Sparkline.prototype.makeBrowserEvent = function(e) {
  //this method is invoked only for events from data layer
  var res = anychart.charts.Sparkline.base(this, 'makeBrowserEvent', e);
  res['pointIndex'] = this.getIndexByEvent_(res);
  return res;
};


/** @inheritDoc */
anychart.charts.Sparkline.prototype.unhover = function() {
  // do nothing
};


/** @inheritDoc */
anychart.charts.Sparkline.prototype.getSeriesStatus = function(event) {
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
  var indexes = this.data().findInUnsortedDataByX(anychart.utils.toNumber(value));
  index = indexes.length ? indexes[0] : NaN;

  var iterator = this.getIterator();

  if (iterator.select(/** @type {number} */ (index))) {
    var pixX = /** @type {number} */(iterator.meta('x'));
    var pixY = /** @type {number} */(iterator.meta('value'));
    var length = Math.sqrt(Math.pow(pixX - x, 2) + Math.pow(pixY - y, 2));

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
anychart.charts.Sparkline.prototype.selectionMode = function() {
  return anychart.enums.SelectionMode.NONE;
};


/**
 * Create base series format provider.
 * @return {Object} Object with info for labels formatting.
 * @protected
 */
anychart.charts.Sparkline.prototype.createFormatProvider = function() {
  if (!this.pointProvider_)
    this.pointProvider_ = new anychart.core.utils.PointContextProvider(this, ['x', 'value']);
  this.pointProvider_.applyReferenceValues();
  return this.pointProvider_;
};


/**
 * Creates tooltip format provider.
 * @return {Object}
 */
anychart.charts.Sparkline.prototype.createTooltipContextProvider = function() {
  return this.createFormatProvider();
};


/** @inheritDoc */
anychart.charts.Sparkline.prototype.useUnionTooltipAsSingle = function() {
  return true;
};


/**
 * @param {anychart.core.MouseEvent} event
 * @return {number}
 * @private
 */
anychart.charts.Sparkline.prototype.getIndexByEvent_ = function(event) {
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
anychart.charts.Sparkline.prototype.handleMouseEvent = function(event) {
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
anychart.charts.Sparkline.prototype.makePointEvent = function(event) {
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
 * @return {!anychart.charts.Sparkline}  {@link anychart.charts.Sparkline} instance for method chaining.
 */
anychart.charts.Sparkline.prototype.selectPoint = function(indexOrIndexes, opt_event) {
  return this;
};


/**
 * Hovers a point of the series by its index.
 * @param {number|Array<number>} index Index of the point to hover.
 * @param {anychart.core.MouseEvent=} opt_event Event that initiate point hovering.<br/>
 *    <b>Note:</b> Used only to display float tooltip.
 * @return {!anychart.charts.Sparkline}  {@link anychart.charts.Sparkline} instance for method chaining.
 */
anychart.charts.Sparkline.prototype.hoverPoint = function(index, opt_event) {
  return this;
};


/**
 * @inheritDoc
 */
anychart.charts.Sparkline.prototype.getAllSeries = function() {
  return [this];
};


/**
 * @inheritDoc
 */
anychart.charts.Sparkline.prototype.unselect = goog.nullFunction;


/**
 * @param {(anychart.enums.HoverMode|string)=} opt_value Hover mode.
 * @return {anychart.charts.Sparkline|anychart.enums.HoverMode} .
 */
anychart.charts.Sparkline.prototype.hoverMode = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeHoverMode(opt_value);
    if (opt_value != this.hoverMode_) {
      this.hoverMode_ = opt_value;
    }
    return this;
  }
  return /** @type {anychart.enums.HoverMode}*/(this.hoverMode_);
};


/** @inheritDoc */
anychart.charts.Sparkline.prototype.getPoint = function(index) {
  return null;
};


/** @inheritDoc */
anychart.charts.Sparkline.prototype.isDiscreteBased = function() {
  return false;
};


/** @inheritDoc */
anychart.charts.Sparkline.prototype.isSizeBased = function() {
  return false;
};


/** @inheritDoc */
anychart.charts.Sparkline.prototype.applyAppearanceToSeries = goog.nullFunction;


/** @inheritDoc */
anychart.charts.Sparkline.prototype.applyAppearanceToPoint = goog.nullFunction;


/** @inheritDoc */
anychart.charts.Sparkline.prototype.finalizePointAppearance = goog.nullFunction;


/**
 * Getter/setter for marker default settings.
 * @param {Object=} opt_value Object with default series settings.
 * @return {Object}
 */
anychart.charts.Sparkline.prototype.defaultMarkerSettings = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.defaultMarkerSettings_ = opt_value;
    return this;
  }
  return this.defaultMarkerSettings_ || {};
};


/**
 * Getter/setter for label default settings.
 * @param {Object=} opt_value Object with default series settings.
 * @return {Object}
 */
anychart.charts.Sparkline.prototype.defaultLabelSettings = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.defaultLabelSettings_ = opt_value;
    return this;
  }
  return this.defaultLabelSettings_ || {};
};


/**
 * Getter/setter for series default settings.
 * @param {Object=} opt_value Object with default series settings.
 * @return {Object}
 */
anychart.charts.Sparkline.prototype.defaultSeriesSettings = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.defaultSeriesSettings_ = opt_value;
    return this;
  }
  return this.defaultSeriesSettings_ || {};
};


/**
 * Getter/setter for line marker default settings.
 * @param {Object=} opt_value Object with line marker settings.
 * @return {Object}
 */
anychart.charts.Sparkline.prototype.defaultLineMarkerSettings = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.defaultLineMarkerSettings_ = opt_value;
    return this;
  }
  return this.defaultLineMarkerSettings_ || {};
};


/**
 * Getter/setter for text marker default settings.
 * @param {Object=} opt_value Object with text marker settings.
 * @return {Object}
 */
anychart.charts.Sparkline.prototype.defaultTextMarkerSettings = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.defaultTextMarkerSettings_ = opt_value;
    return this;
  }
  return this.defaultTextMarkerSettings_ || {};
};


/**
 * Getter/setter for range marker default settings.
 * @param {Object=} opt_value Object with range marker settings.
 * @return {Object}
 */
anychart.charts.Sparkline.prototype.defaultRangeMarkerSettings = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.defaultRangeMarkerSettings_ = opt_value;
    return this;
  }
  return this.defaultRangeMarkerSettings_ || {};
};


/**
 * Default hatch fill type.
 * @type {acgraph.vector.HatchFill.HatchFillType|string}
 */
anychart.charts.Sparkline.DEFAULT_HATCH_FILL_TYPE = acgraph.vector.HatchFill.HatchFillType.DIAGONAL_BRICK;


/**
 * Array of marker field names for merging.
 * @type {Array.<string>}
 * @private
 */
anychart.charts.Sparkline.MARKERS_FIELD_NAMES_FOR_MERGE_ = [
  'enabled', 'position', 'anchor', 'offsetX', 'offsetY', 'type', 'size', 'fill', 'stroke'];


/**
 * Array of labels field names for merging.
 * @type {Array.<string>}
 * @private
 */
anychart.charts.Sparkline.LABELS_FIELD_NAMES_FOR_MERGE_ = [
  'enabled', 'background', 'padding', 'position', 'anchor', 'offsetX', 'offsetY', 'rotation', 'width', 'height',
  'fontSize', 'fontFamily', 'fontColor', 'fontOpacity', 'fontDecoration', 'fontStyle', 'fontVariant', 'fontWeight',
  'letterSpacing', 'textDirection', 'lineHeight', 'textIndent', 'vAlign', 'hAlign', 'textWrap', 'textOverflow',
  'selectable', 'disablePointerEvents', 'useHtml'
];


/**
 * @type {!anychart.data.View}
 * @private
 */
anychart.charts.Sparkline.prototype.data_;


/**
 * Series type.
 * @type {string|anychart.enums.SparklineSeriesType}
 * @private
 */
anychart.charts.Sparkline.prototype.type_;


/**
 * @private
 * @type {(number|string|null)}
 */
anychart.charts.Sparkline.prototype.barWidth_ = '95%';


/**
 * @type {anychart.data.View}
 * @private
 */
anychart.charts.Sparkline.prototype.parentView_;


/**
 * @type {goog.Disposable}
 * @private
 */
anychart.charts.Sparkline.prototype.parentViewToDispose_;


/**
 * @type {!anychart.data.Iterator}
 * @private
 */
anychart.charts.Sparkline.prototype.iterator_;


//----------------------------------------------------------------------------------------------------------------------
//
//  Scales.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter/setter for xScale.
 * @param {(anychart.enums.ScaleTypes|anychart.scales.Base)=} opt_value X Scale to set.
 * @return {!(anychart.scales.Base|anychart.charts.Sparkline)} Default chart scale value or itself for method chaining.
 */
anychart.charts.Sparkline.prototype.xScale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (goog.isString(opt_value)) {
      opt_value = anychart.scales.Base.fromString(opt_value, true);
    }
    if (this.xScale_ != opt_value) {
      this.xScale_ = opt_value;
      this.invalidate(anychart.ConsistencyState.SPARK_SCALES, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    if (!this.xScale_) {
      this.xScale_ = new anychart.scales.Ordinal();
    }
    return this.xScale_;
  }
};


/**
 * Getter/setter for yScale.
 * @param {(anychart.enums.ScaleTypes|anychart.scales.Base)=} opt_value Y Scale to set.
 * @return {!(anychart.scales.Base|anychart.charts.Sparkline)} Default chart scale value or itself for method chaining.
 */
anychart.charts.Sparkline.prototype.yScale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (goog.isString(opt_value)) {
      opt_value = anychart.scales.Base.fromString(opt_value, false);
    }
    if (this.yScale_ != opt_value) {
      this.yScale_ = opt_value;
      this.invalidate(anychart.ConsistencyState.SPARK_SCALES, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    if (!this.yScale_) {
      this.yScale_ = new anychart.scales.Linear();
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
 * @return {!(anychart.core.axisMarkers.Line|anychart.charts.Sparkline)} Line marker instance by index or itself for method chaining.
 */
anychart.charts.Sparkline.prototype.lineMarker = function(opt_indexOrValue, opt_value) {
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
    lineMarker.setup(this.defaultLineMarkerSettings());
    this.lineAxesMarkers_[index] = lineMarker;
    this.registerDisposable(lineMarker);
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
 * @return {!(anychart.core.axisMarkers.Range|anychart.charts.Sparkline)} Range marker instance by index or itself for chaining call.
 */
anychart.charts.Sparkline.prototype.rangeMarker = function(opt_indexOrValue, opt_value) {
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
    rangeMarker.setup(this.defaultRangeMarkerSettings());
    this.rangeAxesMarkers_[index] = rangeMarker;
    this.registerDisposable(rangeMarker);
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
 * @return {!(anychart.core.axisMarkers.Text|anychart.charts.Sparkline)} Line marker instance by index or itself for chaining call.
 */
anychart.charts.Sparkline.prototype.textMarker = function(opt_indexOrValue, opt_value) {
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
    textMarker.setup(this.defaultTextMarkerSettings());
    this.textAxesMarkers_[index] = textMarker;
    this.registerDisposable(textMarker);
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
anychart.charts.Sparkline.prototype.onMarkersSignal_ = function(event) {
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
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings here as a hash map.
 * @return {(!anychart.charts.Sparkline|!anychart.data.View)} Returns itself if used as a setter or the mapping if used as a getter.
 */
anychart.charts.Sparkline.prototype.data = function(opt_value, opt_csvSettings) {
  if (goog.isDef(opt_value)) {
    if (this.rawData_ !== opt_value) {
      this.rawData_ = opt_value;
      goog.dispose(this.parentViewToDispose_); // disposing a view created by the series if any;
      if (opt_value instanceof anychart.data.View)
        this.parentView_ = this.parentViewToDispose_ = opt_value.derive(); // deriving a view to avoid interference with other view users
      else if (opt_value instanceof anychart.data.Set)
        this.parentView_ = this.parentViewToDispose_ = opt_value.mapAs();
      else
        this.parentView_ = (this.parentViewToDispose_ = new anychart.data.Set(
            (goog.isArray(opt_value) || goog.isString(opt_value)) ? opt_value : null, opt_csvSettings)).mapAs();
      this.registerDisposable(this.parentViewToDispose_);
      this.data_ = this.parentView_;
      this.data_.listenSignals(this.dataInvalidated_, this);
      if (this.series_)
        this.series_.invalidate(anychart.ConsistencyState.APPEARANCE,
            anychart.Signal.NEEDS_RECALCULATION | anychart.Signal.NEEDS_REDRAW | anychart.Signal.DATA_CHANGED);
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
anychart.charts.Sparkline.prototype.getReferenceScaleValues = function() {
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
anychart.charts.Sparkline.prototype.dataInvalidated_ = function(e) {
  if (e.hasSignal(anychart.Signal.DATA_CHANGED)) {
    this.dispatchSignal(anychart.Signal.NEEDS_RECALCULATION | anychart.Signal.DATA_CHANGED);
  }
};


/**
 * DO NOT PUBLISH.
 */
anychart.charts.Sparkline.prototype.resetCategorisation = function() {
  if (this.data_ != this.parentView_)
    goog.dispose(this.data_);
  this.data_ = /** @type {!anychart.data.View} */(this.parentView_);
};


/**
 * DO NOT PUBLISH.
 * @param {!Array.<*>|boolean} categories If Array - ordinal scale, if false - scatter scale with numbers,
 *    true - datetime scale.
 */
anychart.charts.Sparkline.prototype.categoriseData = function(categories) {
  this.data_ = this.parentView_.prepare('x', categories);
};


/**
 * Returns current mapping iterator.
 * @return {!anychart.data.Iterator} Current series iterator.
 */
anychart.charts.Sparkline.prototype.getIterator = function() {
  return this.iterator_ || this.getResetIterator();
};


/**
 * Returns new default iterator for the current mapping.
 * @return {!anychart.data.Iterator} New iterator.
 */
anychart.charts.Sparkline.prototype.getResetIterator = function() {
  return this.iterator_ = this.data().getIterator();
};


/**
 * @param {string|anychart.enums.SparklineSeriesType} type Series type.
 * @private
 * @return {anychart.core.sparkline.series.Base}
 */
anychart.charts.Sparkline.prototype.createSeriesByType_ = function(type) {
  var ctl = anychart.core.sparkline.series.Base.SeriesTypesMap[type];
  var instance;

  if (ctl) {
    instance = new ctl(this);
    this.registerDisposable(instance);

    this.series_ = instance;
    instance.setAutoZIndex(anychart.charts.Sparkline.ZINDEX_SERIES);
    instance.listenSignals(this.seriesInvalidated_, this);

    this.seriesDefaults_ = this.defaultSeriesSettings()[type] || this.series_.getDefaults();

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
anychart.charts.Sparkline.prototype.seriesInvalidated_ = function(event) {
  var state = 0;
  if (event.hasSignal(anychart.Signal.NEEDS_UPDATE_A11Y)) {
    state = anychart.ConsistencyState.A11Y;
  }
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    state = anychart.ConsistencyState.SPARK_SERIES;
  }
  if (event.hasSignal(anychart.Signal.DATA_CHANGED)) {
    state |= anychart.ConsistencyState.SPARK_SERIES;
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
 * Getter/setter for sparkline series type.
 * @param {(string|anychart.enums.SparklineSeriesType)=} opt_type Series type.
 * @return {string|anychart.enums.SparklineSeriesType|anychart.charts.Sparkline} .
 */
anychart.charts.Sparkline.prototype.type = function(opt_type) {
  if (goog.isDef(opt_type)) {
    opt_type = anychart.enums.normalizeSparklineSeriesType(opt_type);
    if (this.type_ != opt_type) {
      this.type_ = opt_type;
      if (this.series_) {
        this.series_.dispose();
        this.series_ = null;
      }
      this.invalidate(anychart.ConsistencyState.SPARK_SERIES, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.type_;
};


/**
 * Getter/setter for clip.
 * @param {(boolean|anychart.math.Rect)=} opt_value [False, if series is created manually.<br/>True, if created via chart] Enable/disable series clip.
 * @return {anychart.charts.Sparkline|boolean|anychart.math.Rect} .
 */
anychart.charts.Sparkline.prototype.clip = function(opt_value) {
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


/**
 * Getter/setter for pointWidth.
 * @param {(number|string|null)=} opt_value Point width pixel value.
 * @return {string|number|anychart.charts.Sparkline} Bar width pixel value or Bar instance for chaining call.
 */
anychart.charts.Sparkline.prototype.pointWidth = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.utils.normalizeNumberOrPercent(opt_value, '95%');
    if (this.barWidth_ != opt_value) {
      this.barWidth_ = opt_value;
      if (this.series_ && this.series_.isWidthBased())
        this.series_.invalidate(anychart.ConsistencyState.SERIES_HATCH_FILL | anychart.ConsistencyState.APPEARANCE,
            anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.barWidth_;
  }
};


/**
 * Getter/setter for connectMissingPoints.
 * @param {boolean=} opt_value The value to be set.
 * @return {!anychart.charts.Sparkline|boolean} The setting, or itself for method chaining.
 */
anychart.charts.Sparkline.prototype.connectMissingPoints = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = !!opt_value;
    if (this.connectMissing != opt_value) {
      this.connectMissing = opt_value;
      if (this.series_ && !this.series_.isWidthBased())
        this.series_.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.SERIES_HATCH_FILL,
            anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.connectMissing;
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
anychart.charts.Sparkline.prototype.normalizeColor = function(color, var_args) {
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


/**
 * Getter/setter for fill.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|Function|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!anychart.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!anychart.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.charts.Sparkline|Function} .
 */
anychart.charts.Sparkline.prototype.fill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var fill = goog.isFunction(opt_fillOrColorOrKeys) ?
        opt_fillOrColorOrKeys :
        acgraph.vector.normalizeFill.apply(null, arguments);
    if (fill != this.fill_) {
      this.fill_ = fill;
      if (this.series_)
        this.series_.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.fill_ || this.seriesDefaults_['fill'];
};


/**
 * Getter/setter for negativeFill.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|Function|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!anychart.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!anychart.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.charts.Sparkline|Function} .
 */
anychart.charts.Sparkline.prototype.negativeFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var fill = goog.isFunction(opt_fillOrColorOrKeys) ?
        opt_fillOrColorOrKeys :
        acgraph.vector.normalizeFill.apply(null, arguments);
    if (fill != this.negativeFill_) {
      this.negativeFill_ = fill;
      if (this.series_)
        this.series_.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.negativeFill_ || this.seriesDefaults_['negativeFill'];
};


/**
 * Getter/setter for firstFill.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|Function|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!anychart.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!anychart.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.charts.Sparkline|Function} .
 */
anychart.charts.Sparkline.prototype.firstFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var fill = goog.isFunction(opt_fillOrColorOrKeys) ?
        opt_fillOrColorOrKeys :
        acgraph.vector.normalizeFill.apply(null, arguments);
    if (fill != this.firstFill_) {
      this.firstFill_ = fill;
      if (this.series_)
        this.series_.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.firstFill_ || this.seriesDefaults_['firstFill'];
};


/**
 * Getter/setter for lastFill.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|Function|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!anychart.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!anychart.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.charts.Sparkline|Function} .
 */
anychart.charts.Sparkline.prototype.lastFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var fill = goog.isFunction(opt_fillOrColorOrKeys) ?
        opt_fillOrColorOrKeys :
        acgraph.vector.normalizeFill.apply(null, arguments);
    if (fill != this.lastFill_) {
      this.lastFill_ = fill;
      if (this.series_)
        this.series_.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.lastFill_ || this.seriesDefaults_['lastFill'];
};


/**
 * Getter/setter for maxFill.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|Function|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!anychart.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!anychart.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.charts.Sparkline|Function} .
 */
anychart.charts.Sparkline.prototype.maxFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var fill = goog.isFunction(opt_fillOrColorOrKeys) ?
        opt_fillOrColorOrKeys :
        acgraph.vector.normalizeFill.apply(null, arguments);
    if (fill != this.maxFill_) {
      this.maxFill_ = fill;
      if (this.series_)
        this.series_.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.maxFill_ || this.seriesDefaults_['maxFill'];
};


/**
 * Getter/setter for minFill.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|Function|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!anychart.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!anychart.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.charts.Sparkline|Function} .
 */
anychart.charts.Sparkline.prototype.minFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var fill = goog.isFunction(opt_fillOrColorOrKeys) ?
        opt_fillOrColorOrKeys :
        acgraph.vector.normalizeFill.apply(null, arguments);
    if (fill != this.minFill_) {
      this.minFill_ = fill;
      if (this.series_)
        this.series_.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.minFill_ || this.seriesDefaults_['minFill'];
};


/**
 * Method that gets final fill color for the current point, with all fallbacks taken into account.
 * @param {boolean} usePointSettings If point settings should count too (iterator questioning).
 * @return {!acgraph.vector.Fill} Final fill for the current row.
 */
anychart.charts.Sparkline.prototype.getFinalFill = function(usePointSettings) {
  var iterator = this.getIterator();
  var val = /** @type {number} */ (iterator.get('value'));
  var index = iterator.getIndex();

  var finalFill;
  if (usePointSettings && goog.isDef(iterator.get('fill'))) {
    //user settings defined
    finalFill = iterator.get('fill');
  } else if (index == iterator.getRowsCount() - 1 && goog.isDef(this.lastFill())) {
    //last point
    finalFill = this.lastFill();
  } else if (!index && goog.isDef(this.firstFill())) {
    //first point
    finalFill = this.firstFill();
  } else if (val == this.getStat(anychart.enums.Statistics.MAX) && goog.isDef(this.maxFill())) {
    //point have max value
    finalFill = this.maxFill();
  } else if (val == this.getStat(anychart.enums.Statistics.MIN) && goog.isDef(this.minFill())) {
    //point have min value
    finalFill = this.minFill();
  } else if (val < 0 && goog.isDef(this.negativeFill())) {
    //point have negative value
    finalFill = this.negativeFill();
  } else {
    //another case
    finalFill = this.fill();
  }

  var result = /** @type {!acgraph.vector.Fill} */(this.normalizeColor(/** @type {acgraph.vector.Fill|Function} */(finalFill)));
  return acgraph.vector.normalizeFill(result);
};


/**
 * Getter/setter for stroke.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line joint style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {anychart.charts.Sparkline|acgraph.vector.Stroke|Function} .
 */
anychart.charts.Sparkline.prototype.stroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var stroke = goog.isFunction(opt_strokeOrFill) ?
        opt_strokeOrFill :
        acgraph.vector.normalizeStroke.apply(null, arguments);
    if (stroke != this.stroke_) {
      this.stroke_ = stroke;
      if (this.series_)
        this.series_.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.stroke_ || this.seriesDefaults_['stroke'];
};


/**
 * Method that gets final line color for the current point, with all fallbacks taken into account.
 * @return {!acgraph.vector.Stroke} Final stroke for the current row.
 */
anychart.charts.Sparkline.prototype.getFinalStroke = function() {
  return acgraph.vector.normalizeStroke(/** @type {!acgraph.vector.Stroke} */(this.normalizeColor(/** @type {!acgraph.vector.Stroke} */(this.stroke()))));
};


// Fill and stroke settings are located here, but you should export them ONLY in series themselves.
/**
 * Gets final normalized pattern/hatch fill.
 * @param {acgraph.vector.HatchFill|acgraph.vector.PatternFill|Function|string|boolean} hatchFill Normal state hatch fill.
 * @return {acgraph.vector.HatchFill|acgraph.vector.PatternFill} Normalized hatch fill.
 */
anychart.charts.Sparkline.prototype.normalizeHatchFill = function(hatchFill) {
  var fill;
  var index = this.getIterator().getIndex();
  if (goog.isFunction(hatchFill)) {
    var sourceHatchFill = acgraph.vector.normalizeHatchFill(anychart.charts.Sparkline.DEFAULT_HATCH_FILL_TYPE);
    var scope = {
      'index': index,
      'sourceHatchFill': sourceHatchFill,
      'iterator': this.getIterator()
    };
    fill = acgraph.vector.normalizeHatchFill(hatchFill.call(scope));
  } else if (goog.isBoolean(hatchFill)) {
    fill = hatchFill ? acgraph.vector.normalizeHatchFill(anychart.charts.Sparkline.DEFAULT_HATCH_FILL_TYPE) : null;
  } else
    fill = acgraph.vector.normalizeHatchFill(hatchFill);
  return fill;
};


/**
 * Getter/setter for hatchFill.
 * @param {(acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function|acgraph.vector.HatchFill.HatchFillType|
 * string|boolean)=} opt_patternFillOrTypeOrState PatternFill or HatchFill instance or type or state of hatch fill.
 * @param {string=} opt_color Color.
 * @param {number=} opt_thickness Thickness.
 * @param {number=} opt_size Pattern size.
 * @return {acgraph.vector.PatternFill|acgraph.vector.HatchFill|anychart.charts.Sparkline|Function|boolean} Hatch fill.
 */
anychart.charts.Sparkline.prototype.hatchFill = function(opt_patternFillOrTypeOrState, opt_color, opt_thickness, opt_size) {
  if (goog.isDef(opt_patternFillOrTypeOrState)) {
    var hatchFill = goog.isFunction(opt_patternFillOrTypeOrState) || goog.isBoolean(opt_patternFillOrTypeOrState) ?
        opt_patternFillOrTypeOrState :
        acgraph.vector.normalizeHatchFill.apply(null, arguments);

    if (hatchFill != this.hatchFill_) {
      this.hatchFill_ = hatchFill;
      if (this.series_)
        this.series_.invalidate(anychart.ConsistencyState.SERIES_HATCH_FILL, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return goog.isDef(this.hatchFill_) ? this.hatchFill_ : this.seriesDefaults_['hatchFill'];
};


/**
 * Getter/setter for negativeHatchFill.
 * @param {(acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function|acgraph.vector.HatchFill.HatchFillType|
 * string|boolean)=} opt_patternFillOrTypeOrState PatternFill or HatchFill instance or type or state of hatch fill.
 * @param {string=} opt_color Color.
 * @param {number=} opt_thickness Thickness.
 * @param {number=} opt_size Pattern size.
 * @return {acgraph.vector.PatternFill|acgraph.vector.HatchFill|anychart.charts.Sparkline|Function|boolean} Hatch fill.
 */
anychart.charts.Sparkline.prototype.negativeHatchFill = function(opt_patternFillOrTypeOrState, opt_color, opt_thickness, opt_size) {
  if (goog.isDef(opt_patternFillOrTypeOrState)) {
    var hatchFill = goog.isFunction(opt_patternFillOrTypeOrState) || goog.isBoolean(opt_patternFillOrTypeOrState) ?
        opt_patternFillOrTypeOrState :
        acgraph.vector.normalizeHatchFill.apply(null, arguments);

    if (hatchFill != this.negativeHatchFill_) {
      this.negativeHatchFill_ = hatchFill;
      if (this.series_)
        this.series_.invalidate(anychart.ConsistencyState.SERIES_HATCH_FILL, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return goog.isDef(this.negativeHatchFill_) ? this.negativeHatchFill_ : this.seriesDefaults_['negativeHatchFill'];
};


/**
 * Getter/setter for firstHatchFill.
 * @param {(acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function|acgraph.vector.HatchFill.HatchFillType|
 * string|boolean)=} opt_patternFillOrTypeOrState PatternFill or HatchFill instance or type or state of hatch fill.
 * @param {string=} opt_color Color.
 * @param {number=} opt_thickness Thickness.
 * @param {number=} opt_size Pattern size.
 * @return {acgraph.vector.PatternFill|acgraph.vector.HatchFill|anychart.charts.Sparkline|Function|boolean} Hatch fill.
 */
anychart.charts.Sparkline.prototype.firstHatchFill = function(opt_patternFillOrTypeOrState, opt_color, opt_thickness, opt_size) {
  if (goog.isDef(opt_patternFillOrTypeOrState)) {
    var hatchFill = goog.isFunction(opt_patternFillOrTypeOrState) || goog.isBoolean(opt_patternFillOrTypeOrState) ?
        opt_patternFillOrTypeOrState :
        acgraph.vector.normalizeHatchFill.apply(null, arguments);

    if (hatchFill != this.firstHatchFill_) {
      this.firstHatchFill_ = hatchFill;
      if (this.series_)
        this.series_.invalidate(anychart.ConsistencyState.SERIES_HATCH_FILL, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.firstHatchFill_ || this.seriesDefaults_['firstHatchFill'];
};


/**
 * Getter/setter for lastHatchFill.
 * @param {(acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function|acgraph.vector.HatchFill.HatchFillType|
 * string|boolean)=} opt_patternFillOrTypeOrState PatternFill or HatchFill instance or type or state of hatch fill.
 * @param {string=} opt_color Color.
 * @param {number=} opt_thickness Thickness.
 * @param {number=} opt_size Pattern size.
 * @return {acgraph.vector.PatternFill|acgraph.vector.HatchFill|anychart.charts.Sparkline|Function|boolean} Hatch fill.
 */
anychart.charts.Sparkline.prototype.lastHatchFill = function(opt_patternFillOrTypeOrState, opt_color, opt_thickness, opt_size) {
  if (goog.isDef(opt_patternFillOrTypeOrState)) {
    var hatchFill = goog.isFunction(opt_patternFillOrTypeOrState) || goog.isBoolean(opt_patternFillOrTypeOrState) ?
        opt_patternFillOrTypeOrState :
        acgraph.vector.normalizeHatchFill.apply(null, arguments);

    if (hatchFill != this.lastHatchFill_) {
      this.lastHatchFill_ = hatchFill;
      if (this.series_)
        this.series_.invalidate(anychart.ConsistencyState.SERIES_HATCH_FILL, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.lastHatchFill_ || this.seriesDefaults_['lastHatchFill'];
};


/**
 * Getter/setter for maxHatchFill.
 * @param {(acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function|acgraph.vector.HatchFill.HatchFillType|
 * string|boolean)=} opt_patternFillOrTypeOrState PatternFill or HatchFill instance or type or state of hatch fill.
 * @param {string=} opt_color Color.
 * @param {number=} opt_thickness Thickness.
 * @param {number=} opt_size Pattern size.
 * @return {acgraph.vector.PatternFill|acgraph.vector.HatchFill|anychart.charts.Sparkline|Function|boolean} Hatch fill.
 */
anychart.charts.Sparkline.prototype.maxHatchFill = function(opt_patternFillOrTypeOrState, opt_color, opt_thickness, opt_size) {
  if (goog.isDef(opt_patternFillOrTypeOrState)) {
    var hatchFill = goog.isFunction(opt_patternFillOrTypeOrState) || goog.isBoolean(opt_patternFillOrTypeOrState) ?
        opt_patternFillOrTypeOrState :
        acgraph.vector.normalizeHatchFill.apply(null, arguments);

    if (hatchFill != this.maxHatchFill_) {
      this.maxHatchFill_ = hatchFill;
      if (this.series_)
        this.series_.invalidate(anychart.ConsistencyState.SERIES_HATCH_FILL, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.maxHatchFill_ || this.seriesDefaults_['maxHatchFill'];
};


/**
 * Getter/setter for minHatchFill.
 * @param {(acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function|acgraph.vector.HatchFill.HatchFillType|
 * string|boolean)=} opt_patternFillOrTypeOrState PatternFill or HatchFill instance or type or state of hatch fill.
 * @param {string=} opt_color Color.
 * @param {number=} opt_thickness Thickness.
 * @param {number=} opt_size Pattern size.
 * @return {acgraph.vector.PatternFill|acgraph.vector.HatchFill|anychart.charts.Sparkline|Function|boolean} Hatch fill.
 */
anychart.charts.Sparkline.prototype.minHatchFill = function(opt_patternFillOrTypeOrState, opt_color, opt_thickness, opt_size) {
  if (goog.isDef(opt_patternFillOrTypeOrState)) {
    var hatchFill = goog.isFunction(opt_patternFillOrTypeOrState) || goog.isBoolean(opt_patternFillOrTypeOrState) ?
        opt_patternFillOrTypeOrState :
        acgraph.vector.normalizeHatchFill.apply(null, arguments);

    if (hatchFill != this.minHatchFill_) {
      this.minHatchFill_ = hatchFill;
      if (this.series_)
        this.series_.invalidate(anychart.ConsistencyState.SERIES_HATCH_FILL, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.minHatchFill_ || this.seriesDefaults_['minHatchFill'];
};


/**
 * Method that gets the final hatch fill for a current point, with all fallbacks taken into account.
 * @param {boolean} usePointSettings If point settings should count too (iterator questioning).
 * @return {!(acgraph.vector.HatchFill|acgraph.vector.PatternFill)} Final hatch fill for the current row.
 */
anychart.charts.Sparkline.prototype.getFinalHatchFill = function(usePointSettings) {
  var iterator = this.getIterator();
  var val = /** @type {number} */ (iterator.get('value'));
  var index = iterator.getIndex();

  var finalHatchFill;
  if (usePointSettings && goog.isDef(iterator.get('hatchFill'))) {
    //user settings defined
    finalHatchFill = iterator.get('hatchFill');
  } else if (index == iterator.getRowsCount() - 1 && goog.isDef(this.lastHatchFill())) {
    //last point
    finalHatchFill = this.lastHatchFill();
  } else if (!index && goog.isDef(this.firstHatchFill())) {
    //first point
    finalHatchFill = this.firstHatchFill();
  } else if (val == this.getStat(anychart.enums.Statistics.MAX) && goog.isDef(this.maxHatchFill())) {
    //point have max value
    finalHatchFill = this.maxHatchFill();
  } else if (val == this.getStat(anychart.enums.Statistics.MIN) && goog.isDef(this.minHatchFill())) {
    //point have min value
    finalHatchFill = this.minHatchFill();
  } else if (val < 0 && goog.isDef(this.negativeHatchFill())) {
    //point have negative value
    finalHatchFill = this.negativeHatchFill();
  } else {
    //another case
    finalHatchFill = this.hatchFill();
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
anychart.charts.Sparkline.prototype.mergeFactorySettings_ = function(settings, fields) {
  var res = {};

  //var isDefinedEnabledState = false;
  for (var i = settings.length; i--;) {
    var setting = settings[i];
    if (setting) {
      var isJson = !(setting instanceof anychart.core.VisualBase);
      var enabled = isJson ? setting['enabled'] : setting['enabled']();
      //if (!isDefinedEnabledState) isDefinedEnabledState = goog.isBoolean(enabled);
      if (enabled /*|| (isDefinedEnabledState && !goog.isBoolean(enabled))*/) {
        for (var j = 0, fieldsCount = fields.length; j < fieldsCount; j++) {
          var field = fields[j];
          var value = isJson ? setting[field] : setting[field]();
          if (goog.isDef(value))
            res[field] = value instanceof anychart.core.Base ? value.serialize() : value;
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
anychart.charts.Sparkline.prototype.mergeFactorySettingsEasy_ = function(settings, fields) {
  var res = {};

  for (var i = settings.length; i--;) {
    var setting = settings[i];
    if (setting) {
      var isJson = !(setting instanceof anychart.core.VisualBase);
      for (var j = 0, fieldsCount = fields.length; j < fieldsCount; j++) {
        var field = fields[j];
        var value = isJson ? setting[field] : setting[field]();
        if (goog.isDef(value))
          res[field] = value instanceof anychart.core.Base ? value.serialize() : value;
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
 * @return {!(anychart.core.ui.MarkersFactory.Marker|anychart.charts.Sparkline)} Markers instance or itself for chaining call.
 */
anychart.charts.Sparkline.prototype.markers = function(opt_value) {
  if (!this.markers_) {
    this.markers_ = new anychart.core.ui.MarkersFactory.Marker();
    this.registerDisposable(this.markers_);
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
 * @return {!(anychart.core.ui.MarkersFactory.Marker|anychart.charts.Sparkline)} Markers instance or itself for chaining call.
 */
anychart.charts.Sparkline.prototype.negativeMarkers = function(opt_value) {
  if (!this.negativeMarkers_) {
    this.negativeMarkers_ = new anychart.core.ui.MarkersFactory.Marker();
    this.registerDisposable(this.negativeMarkers_);
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
 * @return {!(anychart.core.ui.MarkersFactory.Marker|anychart.charts.Sparkline)} Markers instance or itself for chaining call.
 */
anychart.charts.Sparkline.prototype.firstMarkers = function(opt_value) {
  if (!this.firstMarkers_) {
    this.firstMarkers_ = new anychart.core.ui.MarkersFactory.Marker();
    this.registerDisposable(this.firstMarkers_);
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
 * @return {!(anychart.core.ui.MarkersFactory.Marker|anychart.charts.Sparkline)} Markers instance or itself for chaining call.
 */
anychart.charts.Sparkline.prototype.lastMarkers = function(opt_value) {
  if (!this.lastMarkers_) {
    this.lastMarkers_ = new anychart.core.ui.MarkersFactory.Marker();
    this.registerDisposable(this.lastMarkers_);
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
 * @return {!(anychart.core.ui.MarkersFactory.Marker|anychart.charts.Sparkline)} Markers instance or itself for chaining call.
 */
anychart.charts.Sparkline.prototype.maxMarkers = function(opt_value) {
  if (!this.maxMarkers_) {
    this.maxMarkers_ = new anychart.core.ui.MarkersFactory.Marker();
    this.registerDisposable(this.maxMarkers_);
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
 * @return {!(anychart.core.ui.MarkersFactory.Marker|anychart.charts.Sparkline)} Markers instance or itself for chaining call.
 */
anychart.charts.Sparkline.prototype.minMarkers = function(opt_value) {
  if (!this.minMarkers_) {
    this.minMarkers_ = new anychart.core.ui.MarkersFactory.Marker();
    this.registerDisposable(this.minMarkers_);
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
anychart.charts.Sparkline.prototype.getMarkersInternal = function() {
  return this.markersInternal_;
};


/**
 * Method that gets final marker for the current point, with all fallbacks taken into account.
 * @param {boolean} usePointSettings If point settings should count too (iterator questioning).
 * @return {?anychart.core.ui.MarkersFactory.Marker} .
 */
anychart.charts.Sparkline.prototype.getFinalMarker = function(usePointSettings) {
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
  var finalDefaultSettings = this.mergeFactorySettingsEasy_(defaultSettings, anychart.charts.Sparkline.MARKERS_FIELD_NAMES_FOR_MERGE_);

  var settings = [customMarker, firstOrLastMarkers, maxOrMinMarkers, negativeMarkers, markers];

  var finalSettings = this.mergeFactorySettings_(settings, anychart.charts.Sparkline.MARKERS_FIELD_NAMES_FOR_MERGE_);

  finalSettings = this.mergeFactorySettingsEasy_([finalSettings, finalDefaultSettings],
      anychart.charts.Sparkline.MARKERS_FIELD_NAMES_FOR_MERGE_);

  var marker = this.markersInternal_.getMarker(index);
  var res = null;
  if (finalSettings['enabled']) {
    var position = finalSettings['position'] || this.markersInternal_.position();
    var positionProvider = this.series_.createPositionProvider(/** @type {anychart.enums.Position|string} */(position));

    if (marker) {
      marker.positionProvider(positionProvider);
    } else {
      marker = this.markersInternal_.add(positionProvider, index);
    }

    marker.resetSettings();
    marker.currentMarkersFactory(this.markersInternal_);
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
anychart.charts.Sparkline.prototype.markersInvalidated_ = function(event) {
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
 * @return {!(anychart.core.ui.LabelsFactory.Label|anychart.charts.Sparkline)} Markers instance or itself for chaining call.
 */
anychart.charts.Sparkline.prototype.labels = function(opt_value) {
  if (!this.labels_) {
    this.labels_ = new anychart.core.ui.LabelsFactory.Label();
    this.registerDisposable(this.labels_);
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
 * @return {!(anychart.core.ui.LabelsFactory.Label|anychart.charts.Sparkline)} Markers instance or itself for chaining call.
 */
anychart.charts.Sparkline.prototype.negativeLabels = function(opt_value) {
  if (!this.negativeLabels_) {
    this.negativeLabels_ = new anychart.core.ui.LabelsFactory.Label();
    this.registerDisposable(this.negativeLabels_);
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
 * @return {!(anychart.core.ui.LabelsFactory.Label|anychart.charts.Sparkline)} Markers instance or itself for chaining call.
 */
anychart.charts.Sparkline.prototype.firstLabels = function(opt_value) {
  if (!this.firstLabels_) {
    this.firstLabels_ = new anychart.core.ui.LabelsFactory.Label();
    this.registerDisposable(this.firstLabels_);
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
 * @return {!(anychart.core.ui.LabelsFactory.Label|anychart.charts.Sparkline)} Markers instance or itself for chaining call.
 */
anychart.charts.Sparkline.prototype.lastLabels = function(opt_value) {
  if (!this.lastLabels_) {
    this.lastLabels_ = new anychart.core.ui.LabelsFactory.Label();
    this.registerDisposable(this.lastLabels_);
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
 * @return {!(anychart.core.ui.LabelsFactory.Label|anychart.charts.Sparkline)} Markers instance or itself for chaining call.
 */
anychart.charts.Sparkline.prototype.maxLabels = function(opt_value) {
  if (!this.maxLabels_) {
    this.maxLabels_ = new anychart.core.ui.LabelsFactory.Label();
    this.registerDisposable(this.maxLabels_);
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
 * @return {!(anychart.core.ui.LabelsFactory.Label|anychart.charts.Sparkline)} Markers instance or itself for chaining call.
 */
anychart.charts.Sparkline.prototype.minLabels = function(opt_value) {
  if (!this.minLabels_) {
    this.minLabels_ = new anychart.core.ui.LabelsFactory.Label();
    this.registerDisposable(this.minLabels_);
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
anychart.charts.Sparkline.prototype.getLabelsInternal = function() {
  return this.labelsInternal_;
};


/**
 * Method that gets final label for the current point, with all fallbacks taken into account.
 * @param {boolean} usePointSettings If point settings should count too (iterator questioning).
 * @return {?anychart.core.ui.LabelsFactory.Label} .
 */
anychart.charts.Sparkline.prototype.getFinalLabel = function(usePointSettings) {
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
  var finalDefaultSettings = this.mergeFactorySettingsEasy_(defaultSettings, anychart.charts.Sparkline.LABELS_FIELD_NAMES_FOR_MERGE_);

  var settings = [customLabel, firstOrLastLabels, maxOrMinLabels, negativeLabels, labels];

  var finalSettings = this.mergeFactorySettings_(settings, anychart.charts.Sparkline.LABELS_FIELD_NAMES_FOR_MERGE_);

  finalSettings = this.mergeFactorySettingsEasy_([finalSettings, finalDefaultSettings],
      anychart.charts.Sparkline.LABELS_FIELD_NAMES_FOR_MERGE_);

  var label = this.labelsInternal_.getLabel(index);
  var res = null;
  if (finalSettings['enabled']) {
    var position = finalSettings['position'] || this.labelsInternal_.position();
    var positionProvider = this.series_.createPositionProvider(/** @type {anychart.enums.Position|string} */(position));
    var formatProvider = this.series_.createFormatProvider();

    if (label) {
      label.formatProvider(formatProvider);
      label.positionProvider(positionProvider);
    } else {
      label = this.labelsInternal_.add(formatProvider, positionProvider, index);
    }

    label.resetSettings();
    label.currentLabelsFactory(this.labelsInternal_);
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
anychart.charts.Sparkline.prototype.labelsInvalidated_ = function(event) {
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
anychart.charts.Sparkline.prototype.calculate = function() {
  /** @type {anychart.data.Iterator} */
  var iterator;
  /** @type {*} */
  var value;

  if (this.hasInvalidationState(anychart.ConsistencyState.SPARK_SCALES)) {
    this.statistics = {};
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

    this.statistics[anychart.enums.Statistics.MAX] = seriesMax;
    this.statistics[anychart.enums.Statistics.MIN] = seriesMin;
    this.statistics[anychart.enums.Statistics.SUM] = seriesSum;
    this.statistics[anychart.enums.Statistics.AVERAGE] = seriesAverage;
    this.statistics[anychart.enums.Statistics.POINTS_COUNT] = seriesPointsCount;

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
anychart.charts.Sparkline.prototype.drawContent = function(bounds) {
  if (this.hasInvalidationState(anychart.ConsistencyState.SPARK_SERIES)) {
    if (!this.series_)
      this.series_ = this.createSeriesByType_(this.type_);
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
anychart.charts.Sparkline.prototype.invalidateSeries_ = function() {
  if (this.series_)
    this.series_.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.SERIES_HATCH_FILL);
};


/** @inheritDoc */
anychart.charts.Sparkline.prototype.setupByJSON = function(config, opt_default) {
  anychart.charts.Sparkline.base(this, 'setupByJSON', config, opt_default);

  if ('defaultLabelSettings' in config)
    this.defaultLabelSettings(config['defaultLabelSettings']);

  if ('defaultMarkerSettings' in config)
    this.defaultMarkerSettings(config['defaultMarkerSettings']);

  if ('defaultSeriesSettings' in config)
    this.defaultSeriesSettings(config['defaultSeriesSettings']);

  if ('defaultLineMarkerSettings' in config)
    this.defaultLineMarkerSettings(config['defaultLineMarkerSettings']);

  if ('defaultTextMarkerSettings' in config)
    this.defaultTextMarkerSettings(config['defaultTextMarkerSettings']);

  if ('defaultRangeMarkerSettings' in config)
    this.defaultRangeMarkerSettings(config['defaultRangeMarkerSettings']);

  var i, json, scale;
  var lineAxesMarkers = config['lineAxesMarkers'];
  var rangeAxesMarkers = config['rangeAxesMarkers'];
  var textAxesMarkers = config['textAxesMarkers'];
  var scales = config['scales'];

  this.data(config['data']);

  this.type(config['seriesType']);
  this.clip(config['clip']);
  this.data(config['data']);
  this.connectMissingPoints(config['connectMissingPoints']);
  this.pointWidth(config['pointWidth']);

  var type = this.getType();

  var scalesInstances = {};
  if (goog.isArray(scales)) {
    for (i = 0; i < scales.length; i++) {
      json = scales[i];
      if (goog.isString(json)) {
        json = {'type': json};
      }
      json = anychart.themes.merging.mergeScale(json, i, type);
      scale = anychart.scales.Base.fromString(json['type'], false);
      scale.setup(json);
      scalesInstances[i] = scale;
    }
  } else if (goog.isObject(scales)) {
    for (i in scales) {
      if (!scales.hasOwnProperty(i)) continue;
      json = scales[i];
      if (goog.isString(json)) {
        json = {'type': json};
      }
      json = anychart.themes.merging.mergeScale(json, i, type);
      scale = anychart.scales.Base.fromString(json['type'], false);
      scale.setup(json);
      scalesInstances[i] = scale;
    }
  }

  json = config['xScale'];
  if (goog.isNumber(json)) {
    scale = scalesInstances[json];
  } else if (goog.isString(json)) {
    scale = anychart.scales.Base.fromString(json, null);
    if (!scale)
      scale = scalesInstances[json];
  } else if (goog.isObject(json)) {
    scale = anychart.scales.Base.fromString(json['type'], true);
    scale.setup(json);
  } else {
    scale = null;
  }
  if (scale)
    this.xScale(scale);

  json = config['yScale'];
  if (goog.isNumber(json)) {
    scale = scalesInstances[json];
  } else if (goog.isString(json)) {
    scale = anychart.scales.Base.fromString(json, null);
    if (!scale)
      scale = scalesInstances[json];
  } else if (goog.isObject(json)) {
    scale = anychart.scales.Base.fromString(json['type'], false);
    scale.setup(json);
  } else {
    scale = null;
  }
  if (scale)
    this.yScale(scale);

  if (goog.isArray(lineAxesMarkers)) {
    for (i = 0; i < lineAxesMarkers.length; i++) {
      json = lineAxesMarkers[i];
      this.lineMarker(i, json);
      if (goog.isObject(json) && 'scale' in json && json['scale'] > 1) this.lineMarker(i).scale(scalesInstances[json['scale']]);
    }
  }

  if (goog.isArray(rangeAxesMarkers)) {
    for (i = 0; i < rangeAxesMarkers.length; i++) {
      json = rangeAxesMarkers[i];
      this.rangeMarker(i, json);
      if (goog.isObject(json) && 'scale' in json && json['scale'] > 1) this.rangeMarker(i).scale(scalesInstances[json['scale']]);
    }
  }

  if (goog.isArray(textAxesMarkers)) {
    for (i = 0; i < textAxesMarkers.length; i++) {
      json = textAxesMarkers[i];
      this.textMarker(i, json);
      if (goog.isObject(json) && 'scale' in json && json['scale'] > 1) this.textMarker(i).scale(scalesInstances[json['scale']]);
    }
  }

  this.stroke(config['stroke']);

  this.lastFill(config['lastFill']);
  this.firstFill(config['firstFill']);
  this.maxFill(config['maxFill']);
  this.minFill(config['minFill']);
  this.negativeFill(config['negativeFill']);
  this.fill(config['fill']);
  this.lastHatchFill(config['lastHatchFill']);
  this.firstHatchFill(config['firstHatchFill']);
  this.maxHatchFill(config['maxHatchFill']);
  this.minHatchFill(config['minHatchFill']);
  this.negativeHatchFill(config['negativeHatchFill']);
  this.hatchFill(config['hatchFill']);
  if (config['lastMarkers']) this.lastMarkers().setupByJSON(config['lastMarkers']);
  if (config['firstMarkers']) this.firstMarkers().setupByJSON(config['firstMarkers']);
  if (config['maxMarkers']) this.maxMarkers().setupByJSON(config['maxMarkers']);
  if (config['minMarkers']) this.minMarkers().setupByJSON(config['minMarkers']);
  if (config['negativeMarkers']) this.negativeMarkers().setupByJSON(config['negativeMarkers']);
  if (config['markers']) this.markers().setupByJSON(config['markers']);
  if (config['firstLabels']) this.firstLabels().setupByJSON(config['firstLabels']);
  if (config['lastLabels']) this.lastLabels().setupByJSON(config['lastLabels']);
  if (config['maxLabels']) this.maxLabels().setupByJSON(config['maxLabels']);
  if (config['minLabels']) this.minLabels().setupByJSON(config['minLabels']);
  if (config['negativeLabels']) this.negativeLabels().setupByJSON(config['negativeLabels']);
  if (config['labels']) this.labels().setup(config['labels']);
};


/**
 * @inheritDoc
 */
anychart.charts.Sparkline.prototype.serialize = function() {
  var json = anychart.charts.Sparkline.base(this, 'serialize');
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
  json['type'] = anychart.enums.ChartTypes.SPARKLINE;

  json['seriesType'] = this.type();
  json['clip'] = (this.clip_ instanceof anychart.math.Rect) ? this.clip_.serialize() : this.clip_;
  json['data'] = this.data().serialize();
  json['connectMissingPoints'] = this.connectMissingPoints();
  json['pointWidth'] = this.pointWidth();


  if (goog.isFunction(this['lastFill'])) {
    if (goog.isFunction(this.lastFill())) {
      anychart.core.reporting.warning(anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION, null, ['Series last fill']);
    } else if (goog.isDef(this.lastFill())) {
      json['lastFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.lastFill()));
    }
  }
  if (goog.isFunction(this['lastHatchFill'])) {
    if (goog.isFunction(this.lastHatchFill())) {
      anychart.core.reporting.warning(anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION, null, ['Series last hatch fill']);
    } else if (goog.isDef(this.lastHatchFill())) {
      json['lastHatchFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.lastHatchFill()));
    }
  }
  json['lastMarkers'] = this.lastMarkers().serialize();
  json['lastLabels'] = this.lastLabels().serialize();
  if (goog.isFunction(this['firstFill'])) {
    if (goog.isFunction(this.firstFill())) {
      anychart.core.reporting.warning(anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION, null, ['Series first fill']);
    } else if (goog.isDef(this.firstFill())) {
      json['firstFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.firstFill()));
    }
  }
  if (goog.isFunction(this['firstHatchFill'])) {
    if (goog.isFunction(this.firstHatchFill())) {
      anychart.core.reporting.warning(anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION, null, ['Series first hatch fill']);
    } else if (goog.isDef(this.firstHatchFill())) {
      json['firstHatchFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.firstHatchFill()));
    }
  }
  json['firstMarkers'] = this.firstMarkers().serialize();
  json['firstLabels'] = this.firstLabels().serialize();
  if (goog.isFunction(this['maxFill'])) {
    if (goog.isFunction(this.maxFill())) {
      anychart.core.reporting.warning(anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION, null, ['Series max fill']);
    } else if (goog.isDef(this.maxFill())) {
      json['maxFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.maxFill()));
    }
  }
  if (goog.isFunction(this['maxHatchFill'])) {
    if (goog.isFunction(this.maxHatchFill())) {
      anychart.core.reporting.warning(anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION, null, ['Series max hatch fill']);
    } else if (goog.isDef(this.maxHatchFill())) {
      json['maxHatchFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.maxHatchFill()));
    }
  }
  json['maxMarkers'] = this.maxMarkers().serialize();
  json['maxLabels'] = this.maxLabels().serialize();
  if (goog.isFunction(this['minFill'])) {
    if (goog.isFunction(this.minFill())) {
      anychart.core.reporting.warning(anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION, null, ['Series min fill']);
    } else if (goog.isDef(this.minFill())) {
      json['minFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.minFill()));
    }
  }
  if (goog.isFunction(this['minHatchFill'])) {
    if (goog.isFunction(this.minHatchFill())) {
      anychart.core.reporting.warning(anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION, null, ['Series min hatch fill']);
    } else if (goog.isDef(this.minHatchFill())) {
      json['minHatchFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.minHatchFill()));
    }
  }
  json['minMarkers'] = this.minMarkers().serialize();
  json['minLabels'] = this.minLabels().serialize();
  if (goog.isFunction(this['negativeFill'])) {
    if (goog.isFunction(this.negativeFill())) {
      anychart.core.reporting.warning(anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION, null, ['Series negative fill']);
    } else if (goog.isDef(this.negativeFill())) {
      json['negativeFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.negativeFill()));
    }
  }
  if (goog.isFunction(this['negativeHatchFill'])) {
    if (goog.isFunction(this.negativeHatchFill())) {
      anychart.core.reporting.warning(anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION, null, ['Series negative hatch fill']);
    } else if (goog.isDef(this.negativeHatchFill())) {
      json['negativeHatchFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.negativeHatchFill()));
    }
  }
  json['negativeMarkers'] = this.negativeMarkers().serialize();
  json['negativeLabels'] = this.negativeLabels().serialize();
  if (goog.isFunction(this['fill'])) {
    if (goog.isFunction(this.fill())) {
      anychart.core.reporting.warning(anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION, null, ['Series fill']);
    } else if (goog.isDef(this.fill())) {
      json['fill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.fill()));
    }
  }
  if (goog.isFunction(this['hatchFill'])) {
    if (goog.isFunction(this.hatchFill())) {
      anychart.core.reporting.warning(anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION, null, ['Series hatch fill']);
    } else if (goog.isDef(this.hatchFill())) {
      json['hatchFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.hatchFill()));
    }
  }
  json['markers'] = this.markers().serialize();
  json['labels'] = this.labels().serialize();
  if (goog.isFunction(this['stroke'])) {
    if (goog.isFunction(this.stroke())) {
      anychart.core.reporting.warning(anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION, null, ['Series stroke']);
    } else if (goog.isDef(this.stroke())) {
      json['stroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke}*/(this.stroke()));
    }
  }

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


anychart.chartTypesMap[anychart.enums.ChartTypes.SPARKLINE] = anychart.sparkline;


//exports
(function() {
  var proto = anychart.charts.Sparkline.prototype;
  goog.exportSymbol('anychart.sparkline', anychart.sparkline);
  proto['xScale'] = proto.xScale;
  proto['yScale'] = proto.yScale;

  proto['lineMarker'] = proto.lineMarker;
  proto['rangeMarker'] = proto.rangeMarker;
  proto['textMarker'] = proto.textMarker;

  proto['type'] = proto.type;
  proto['data'] = proto.data;
  proto['clip'] = proto.clip;

  proto['connectMissingPoints'] = proto.connectMissingPoints;
  proto['pointWidth'] = proto.pointWidth;

  proto['lastFill'] = proto.lastFill;
  proto['lastHatchFill'] = proto.lastHatchFill;
  proto['lastMarkers'] = proto.lastMarkers;
  proto['lastLabels'] = proto.lastLabels;

  proto['firstFill'] = proto.firstFill;
  proto['firstHatchFill'] = proto.firstHatchFill;
  proto['firstMarkers'] = proto.firstMarkers;
  proto['firstLabels'] = proto.firstLabels;

  proto['maxFill'] = proto.maxFill;
  proto['maxHatchFill'] = proto.maxHatchFill;
  proto['maxMarkers'] = proto.maxMarkers;
  proto['maxLabels'] = proto.maxLabels;

  proto['minFill'] = proto.minFill;
  proto['minHatchFill'] = proto.minHatchFill;
  proto['minMarkers'] = proto.minMarkers;
  proto['minLabels'] = proto.minLabels;

  proto['negativeFill'] = proto.negativeFill;
  proto['negativeHatchFill'] = proto.negativeHatchFill;
  proto['negativeMarkers'] = proto.negativeMarkers;
  proto['negativeLabels'] = proto.negativeLabels;

  proto['fill'] = proto.fill;
  proto['hatchFill'] = proto.hatchFill;
  proto['markers'] = proto.markers;
  proto['labels'] = proto.labels;

  proto['stroke'] = proto.stroke;

  proto['getType'] = proto.getType;
})();
