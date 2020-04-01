goog.provide('anychart.stockModule.eventMarkers.Group');
goog.require('anychart.core.IShapeManagerUser');
goog.require('anychart.core.StateSettings');
goog.require('anychart.core.VisualBase');
goog.require('anychart.core.shapeManagers.PerPoint');
goog.require('anychart.core.ui.LabelsFactory');
goog.require('anychart.core.ui.Tooltip');
goog.require('anychart.enums');
goog.require('anychart.format.Context');
goog.require('anychart.stockModule.eventMarkers.Table');
goog.require('anychart.utils');



/**
 * Event markers group class.
 * @param {anychart.stockModule.Plot} plot
 * @param {number} index
 * @constructor
 * @extends {anychart.core.VisualBase}
 * @implements {anychart.core.IShapeManagerUser}
 */
anychart.stockModule.eventMarkers.Group = function(plot, index) {
  anychart.stockModule.eventMarkers.Group.base(this, 'constructor');

  /**
   * Stock plot reference.
   * @type {anychart.stockModule.Plot}
   */
  this.plot = plot;

  /**
   * Group index.
   * @type {number}
   */
  this.index = index;

  /**
   * Data table.
   * @type {anychart.stockModule.eventMarkers.Table}
   * @private
   */
  this.dataTable_ = new anychart.stockModule.eventMarkers.Table();

  /**
   * Shape manager instance.
   * @type {anychart.core.shapeManagers.PerPoint}
   * @private
   */
  this.shapeManager_ = new anychart.core.shapeManagers.PerPoint(this,
      [anychart.core.shapeManagers.pathFillStrokeConfig, anychart.core.shapeManagers.pathEventMarkerHandlerConfig], false);

  this.normal_ = new anychart.core.StateSettings(this,
      anychart.stockModule.eventMarkers.Group.STATE_DESCRIPTORS_META_NORMAL,
      anychart.PointState.NORMAL,
      anychart.stockModule.eventMarkers.Group.STATE_DESCRIPTORS_OVERRIDE);
  this.normal_.setOption(anychart.core.StateSettings.CONNECTOR_AFTER_INIT_CALLBACK, anychart.core.StateSettings.DEFAULT_CONNECTOR_AFTER_INIT_CALLBACK);

  this.hovered_ = new anychart.core.StateSettings(this,
      anychart.stockModule.eventMarkers.Group.STATE_DESCRIPTORS_META_STATE,
      anychart.PointState.NORMAL,
      anychart.stockModule.eventMarkers.Group.STATE_DESCRIPTORS_OVERRIDE);

  this.selected_ = new anychart.core.StateSettings(this,
      anychart.stockModule.eventMarkers.Group.STATE_DESCRIPTORS_META_STATE,
      anychart.PointState.NORMAL,
      anychart.stockModule.eventMarkers.Group.STATE_DESCRIPTORS_OVERRIDE);

  this.labels_ = new anychart.core.ui.LabelsFactory();
  this.labels_.setParentEventTarget(this);

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, anychart.stockModule.eventMarkers.Group.OWN_DESCRIPTORS_META);

  /**
   * Chain caches.
   * @type {Array.<Array>}
   * @private
   */
  this.partialChains_ = [];

  /**
   * @type {function(anychart.core.IShapeManagerUser, number, boolean=, boolean=): acgraph.vector.AnyColor}
   * @private
   */
  this.connectorStrokeResolver_ = anychart.color.getColorResolver('stroke', anychart.enums.ColorType.STROKE, true, true);
};
goog.inherits(anychart.stockModule.eventMarkers.Group, anychart.core.VisualBase);


//region --- Descriptors
//------------------------------------------------------------------------------
//
//  Descriptors
//
//------------------------------------------------------------------------------
/**
 * Properties.
 * @type {!Object.<anychart.core.settings.PropertyDescriptor>}
 */
anychart.stockModule.eventMarkers.Group.OWN_DESCRIPTORS = (function() {
  var map = {};
  anychart.core.settings.createDescriptors(map, [
    anychart.core.settings.descriptors.DIRECTION,
    anychart.core.settings.descriptors.EVENT_MARKERS_POSITION,
    anychart.core.settings.descriptors.SERIES_ID,
    anychart.core.settings.descriptors.FIELD_NAME,
    anychart.core.settings.descriptors.STICK_TO_LEFT
  ]);
  return map;
})();
anychart.core.settings.populate(anychart.stockModule.eventMarkers.Group, anychart.stockModule.eventMarkers.Group.OWN_DESCRIPTORS);


/**
 * Properties.
 * @const {!Array.<Array>}
 */
anychart.stockModule.eventMarkers.Group.OWN_DESCRIPTORS_META = ([
  ['direction',
    anychart.ConsistencyState.EVENT_MARKERS_DATA,
    anychart.Signal.NEEDS_REDRAW],
  ['position',
    anychart.ConsistencyState.EVENT_MARKERS_DATA,
    anychart.Signal.NEEDS_REDRAW],
  ['seriesId',
    anychart.ConsistencyState.EVENT_MARKERS_DATA,
    anychart.Signal.NEEDS_REDRAW],
  ['fieldName',
    anychart.ConsistencyState.EVENT_MARKERS_DATA,
    anychart.Signal.NEEDS_REDRAW],
  ['stickToLeft',
    anychart.ConsistencyState.EVENT_MARKERS_DATA,
    anychart.Signal.NEEDS_REDRAW]
]);


/**
 * @const {!Array.<Array>}
 */
anychart.stockModule.eventMarkers.Group.STATE_DESCRIPTORS_OVERRIDE = (function() {
  var res = anychart.core.settings.createTextPropertiesDescriptorsTemplate();
  res.push.apply(res, [
    anychart.core.settings.descriptors.EVENT_MARKER_TYPE,
    anychart.core.settings.descriptors.WIDTH,
    anychart.core.settings.descriptors.HEIGHT,
    anychart.core.settings.descriptors.FORMAT,
    anychart.core.settings.descriptors.FILL_FUNCTION,
    anychart.core.settings.descriptors.STROKE_FUNCTION,
    anychart.core.settings.descriptors.FONT_PADDING
  ]);
  return res;
})();


/**
 * @const {!Object.<anychart.core.settings.PropertyDescriptor>}
 */
anychart.stockModule.eventMarkers.Group.STATE_DESCRIPTORS = (function() {
  var map = {};
  anychart.core.settings.createDescriptors(map, anychart.stockModule.eventMarkers.Group.STATE_DESCRIPTORS_OVERRIDE);
  return map;
})();


/**
 * @const {!Array.<string>}
 */
anychart.stockModule.eventMarkers.Group.STATE_DESCRIPTORS_NAMES = (function() {
  var res = ['connector'];
  for (var i in anychart.stockModule.eventMarkers.Group.STATE_DESCRIPTORS) {
    res.push(i);
  }
  return res;
})();
anychart.core.settings.populateAliases(anychart.stockModule.eventMarkers.Group, anychart.stockModule.eventMarkers.Group.STATE_DESCRIPTORS_NAMES, 'normal');


/**
 * @const {!Object.<string, anychart.core.settings.PropertyDescriptorMeta>}
 */
anychart.stockModule.eventMarkers.Group.STATE_DESCRIPTORS_META_NORMAL = (function() {
  var res = {};
  anychart.core.settings.createDescriptorsMeta(res, [
    ['type',
      anychart.ConsistencyState.EVENT_MARKERS_DATA,
      anychart.Signal.NEEDS_REDRAW],
    ['width',
      anychart.ConsistencyState.EVENT_MARKERS_DATA,
      anychart.Signal.NEEDS_REDRAW],
    ['height',
      anychart.ConsistencyState.EVENT_MARKERS_DATA,
      anychart.Signal.NEEDS_REDRAW],
    ['fill',
      anychart.ConsistencyState.EVENT_MARKERS_DATA,
      anychart.Signal.NEEDS_REDRAW],
    ['stroke',
      anychart.ConsistencyState.EVENT_MARKERS_DATA,
      anychart.Signal.NEEDS_REDRAW],
    ['format',
      anychart.ConsistencyState.EVENT_MARKERS_DATA,
      anychart.Signal.NEEDS_REDRAW],
    ['fontPadding',
      anychart.ConsistencyState.EVENT_MARKERS_DATA,
      anychart.Signal.NEEDS_REDRAW],
    ['connector',
      anychart.ConsistencyState.EVENT_MARKERS_DATA,
      anychart.Signal.NEEDS_REDRAW]
  ]);
  anychart.core.settings.createTextPropertiesDescriptorsMeta(
      res,
      anychart.ConsistencyState.EVENT_MARKERS_DATA,
      anychart.ConsistencyState.EVENT_MARKERS_DATA,
      anychart.Signal.NEEDS_REDRAW,
      anychart.Signal.NEEDS_REDRAW);
  return res;
})();


/**
 * @const {!Object.<string, anychart.core.settings.PropertyDescriptorMeta>}
 */
anychart.stockModule.eventMarkers.Group.STATE_DESCRIPTORS_META_STATE = (function() {
  var res = {};
  anychart.core.settings.createDescriptorsMeta(res, [
    ['type', 0, 0],
    ['width', 0, 0],
    ['height', 0, 0],
    ['fill', 0, 0],
    ['stroke', 0, 0],
    ['format', 0, 0],
    ['fontPadding', 0, 0],
    ['connector', 0, 0]
  ]);
  anychart.core.settings.createTextPropertiesDescriptorsMeta(res, 0, 0, 0, 0);
  return res;
})();


//endregion
//region --- Infrastructure
//------------------------------------------------------------------------------
//
//  Infrastructure
//
//------------------------------------------------------------------------------
/**
 * @type {number}
 */
anychart.stockModule.eventMarkers.Group.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.VisualBase.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.APPEARANCE |
    anychart.ConsistencyState.EVENT_MARKERS_DATA;


/**
 * @type {number}
 */
anychart.stockModule.eventMarkers.Group.prototype.SUPPORTED_SIGNALS =
    anychart.core.VisualBase.prototype.SUPPORTED_SIGNALS |
    anychart.Signal.NEEDS_REDRAW;


/**
 * Connector invalidation signal.
 * @param {anychart.SignalEvent} e
 * @private
 */
anychart.stockModule.eventMarkers.Group.prototype.connectorInvalidated_ = function(e) {
  this.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.EVENT_MARKERS_DATA, anychart.Signal.NEEDS_REDRAW);
};


/** @inheritDoc */
anychart.stockModule.eventMarkers.Group.prototype.getParentState = function(state) {
  var controller = /** @type {anychart.stockModule.eventMarkers.PlotController} */(this.plot.eventMarkers());
  var result;
  if (!state) {
    result = controller.normal();
  } else if (state == 1) {
    result = controller.hovered();
  } else {
    result = controller.selected();
  }
  return /** @type {anychart.core.StateSettings} */(result);
};


//endregion
//region --- Methods
//------------------------------------------------------------------------------
//
//  Methods
//
//------------------------------------------------------------------------------
/**
 * @typedef {{
 *   data: Array.<(number|string|Date|{date:(number|string|Date)})>,
 *   dateTimePattern: (string|null|undefined),
 *   timeOffset: (number|null|undefined),
 *   baseDate: (number|Date|null|undefined),
 *   locale: (string|anychart.format.Locale|null|undefined)
 * }|Array.<(number|string|Date|{date:(number|string|Date)})>}
 */
anychart.stockModule.eventMarkers.Group.DataFormat;


/**
 * Gets and sets data for the series.
 * @param {*|anychart.stockModule.eventMarkers.Group.DataFormat=} opt_value
 * @return {anychart.stockModule.eventMarkers.Group|Array.<Object>}
 */
anychart.stockModule.eventMarkers.Group.prototype.data = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var dateTimePattern, timeOffset, baseDate, locale, data;
    if (goog.isObject(opt_value) && !goog.isArray(opt_value)) {
      dateTimePattern = opt_value['dateTimePattern'];
      timeOffset = opt_value['timeOffset'];
      baseDate = opt_value['baseDate'];
      locale = opt_value['locale'];
      data = opt_value['data'];
    } else {
      data = opt_value;
    }
    if (!goog.isArray(data))
      data = [];
    this.dataTable_.setData(data, dateTimePattern, timeOffset, baseDate, locale);
    this.invalidate(anychart.ConsistencyState.EVENT_MARKERS_DATA, anychart.Signal.NEEDS_REDRAW);
    return this;
  }
  return this.dataTable_.getData();
};


/**
 * Normal state settings.
 * @param {!Object=} opt_value
 * @return {anychart.core.StateSettings|anychart.stockModule.eventMarkers.Group}
 */
anychart.stockModule.eventMarkers.Group.prototype.normal = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.normal_.setup(opt_value);
    return this;
  }
  return this.normal_;
};


/**
 * Hovered state settings.
 * @param {!Object=} opt_value
 * @return {anychart.core.StateSettings|anychart.stockModule.eventMarkers.Group}
 */
anychart.stockModule.eventMarkers.Group.prototype.hovered = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.hovered_.setup(opt_value);
    return this;
  }
  return this.hovered_;
};


/**
 * Selected state settings.
 * @param {!Object=} opt_value
 * @return {anychart.core.StateSettings|anychart.stockModule.eventMarkers.Group}
 */
anychart.stockModule.eventMarkers.Group.prototype.selected = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.selected_.setup(opt_value);
    return this;
  }
  return this.selected_;
};


/**
 * Draws the group.
 * @return {anychart.stockModule.eventMarkers.Group}
 */
anychart.stockModule.eventMarkers.Group.prototype.draw = function() {
  if (!this.checkDrawingNeeded())
    return this;

  this.suspendSignalsDispatching();
  this.labels_.suspendSignalsDispatching();

  // resolving bounds
  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    this.pixelBoundsCache = /** @type {anychart.math.Rect} */(this.parentBounds());
    this.boundsWithoutAxes = this.axesLinesSpace_ ?
        this.axesLinesSpace_.tightenBounds(this.pixelBoundsCache) :
        this.pixelBoundsCache;
    this.invalidate(anychart.ConsistencyState.EVENT_MARKERS_DATA);
    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    this.partialChains_.length = 0;
    this.invalidate(anychart.ConsistencyState.EVENT_MARKERS_DATA);
    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.EVENT_MARKERS_DATA)) {
    this.iterator_ = null;
    this.shapeManager_.clearShapes();
    this.labels_.clear();
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    var container = /** @type {acgraph.vector.Layer} */(this.container());
    this.shapeManager_.setContainer(container);
    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.EVENT_MARKERS_DATA)) {
    var offsets = {};
    var controller = /** @type {anychart.stockModule.eventMarkers.PlotController} */(this.plot.eventMarkers());
    var iterator = this.getIterator();
    iterator.reset();
    while (iterator.advance()) {
      if (iterator.isFirstInStack()) {
        offsets = controller.getEventMarkerOffsets(iterator.getPointIndex());
      }
      var tuple = this.drawEventMarker(offsets);
      offsets[/** @type {string} */(tuple[0])] = /** @type {number} */(tuple[1]);
    }
    this.markConsistent(anychart.ConsistencyState.EVENT_MARKERS_DATA | anychart.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {

    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  this.normal_.connector().markConsistent(anychart.ConsistencyState.ALL);
  this.labels_.resumeSignalsDispatching(false);
  this.resumeSignalsDispatching(false);

  return this;
};


/**
 * Removes the group.
 */
anychart.stockModule.eventMarkers.Group.prototype.remove = function() {
  this.shapeManager_.clearShapes();
  this.invalidate(anychart.ConsistencyState.EVENT_MARKERS_DATA);
};


/**
 *
 * @param {anychart.data.IRowInfo} iterator
 * @param {string} hash
 * @param {number} offset
 */
anychart.stockModule.eventMarkers.Group.prototype.translateEventMarker = function(iterator, hash, offset) {
  if (iterator.meta('positionHash') == hash) {
    this.labels_.getLabel(iterator.getIndex()).getDomElement().translate(0, offset);
    iterator.meta('shapes')['path'].translate(0, offset);
    iterator.meta('shapes')['overlay'].translate(0, offset);
    iterator.meta('offset', Number(iterator.meta('offset')) - offset);
  }
};


/**
 * If opt_offsets is passed - draws the marker selected by iterator from scratch and returns a tuple of [positionHash: string, newOffsetInPosition: number].
 * Otherwise updates the event marker selected by the iterator expecting "offset", "shapes" and "totalHeight" meta values to be set and returns a tuple of
 * [positionHash: string, diffInNextOffsetInPosition: number].
 * @param {Object.<number>=} opt_offsets
 * @return {!Array.<string|number>}
 */
anychart.stockModule.eventMarkers.Group.prototype.drawEventMarker = function(opt_offsets) {
  var offset, totalHeightDiff, hash;
  var xScale = /** @type {anychart.stockModule.scales.Scatter} */(this.plot.getChart().xScale());
  var iterator = this.getIterator();
  var state = Number(iterator.meta('state')) || anychart.PointState.NORMAL;
  var zIndex = state ?
      (state == 1 ?
          anychart.stockModule.eventMarkers.PlotController.Z_INDEX_MARKERS_HOVERED :
          anychart.stockModule.eventMarkers.PlotController.Z_INDEX_MARKERS_SELECTED) :
      /** @type {number} */(this.zIndex()) + iterator.getIndex() * anychart.stockModule.eventMarkers.PlotController.Z_INDEX_MARKERS_MULTI;
  var type = /** @type {anychart.enums.EventMarkerType} */(this.resolveOption('type', state, iterator, anychart.enums.normalizeEventMarkerType, false));
  var drawer = this.SINGLE_MARKER_DRAWERS[type];
  var position = /** @type {anychart.enums.EventMarkerPosition} */(this.resolveOption('position', 0, iterator, anychart.enums.normalizeEventMarkerPosition, false, undefined, true));
  var y = NaN;
  var direction = /** @type {anychart.enums.Direction} */(this.resolveOption('direction', state, iterator, anychart.enums.normalizeDirection, false, undefined, true));
  var seriesId = '';
  var fieldName = '';
  if (position != anychart.enums.EventMarkerPosition.AXIS) {
    seriesId = /** @type {string} */(this.resolveOption('seriesId', 0, iterator, anychart.core.settings.stringNormalizer, false, undefined, true));
    var series = this.plot.getSeries(seriesId) || this.plot.getSeriesAt(0);
    var point, yValue;
    if (series && (point = series.getSelectableData().getAtIndex(iterator.getPointIndex())) && !point.meta('missing')) {
      if (position == anychart.enums.EventMarkerPosition.ZERO) {
        fieldName = 'zero';
        yValue = 0;
      } else {
        fieldName = /** @type {string} */(this.resolveOption('fieldName', 0, iterator, anychart.core.settings.stringNormalizer, false, undefined, true));
        yValue = Number(point.get(fieldName));
      }
      if (position == anychart.enums.EventMarkerPosition.SERIES_POSITIVE && yValue < 0 ||
          position == anychart.enums.EventMarkerPosition.SERIES_NEGATIVE && yValue > 0) {
        yValue = 0;
        y = Number(point.meta('zero'));
        if (isNaN(y)) {
          y = series.applyRatioToBounds(series.yScale().transform(0), false);
        }
        y = goog.math.clamp(y, this.pixelBoundsCache.top, this.pixelBoundsCache.top + this.pixelBoundsCache.height);
        position = (y == this.pixelBoundsCache.top + this.pixelBoundsCache.height) ?
            anychart.enums.EventMarkerPosition.AXIS :
            anychart.enums.EventMarkerPosition.ZERO;
      } else {
        y = Number(point.meta(fieldName));
        if (isNaN(y) && !isNaN(yValue)) {
          y = series.applyRatioToBounds(series.yScale().transform(yValue), false);
        }
        y = goog.math.clamp(y, this.pixelBoundsCache.top, this.pixelBoundsCache.top + this.pixelBoundsCache.height);
      }
      if (direction == anychart.enums.Direction.AUTO) {
        direction = (yValue < 0 || !yValue && position == anychart.enums.EventMarkerPosition.SERIES_NEGATIVE) ?
            anychart.enums.Direction.DOWN :
            anychart.enums.Direction.UP;
      }
    }
  }
  if (isNaN(y)) {
    y = this.pixelBoundsCache.top + this.pixelBoundsCache.height;
    position = anychart.enums.EventMarkerPosition.AXIS;
    direction = anychart.enums.Direction.UP;
  }
  var directionIsUp = direction != anychart.enums.Direction.DOWN;
  hash = this.getPositionHash_(position, seriesId, fieldName, directionIsUp);
  iterator.meta('positionHash', hash);
  var x = xScale.transform(iterator.getX(), 0.5) * this.pixelBoundsCache.width + this.pixelBoundsCache.left;
  offset = (opt_offsets ? opt_offsets[hash] : Number(iterator.meta('offset'))) || 0;
  iterator.meta('offset', offset);
  var connectorLen = 0;
  var connectorStroke = /** @type {acgraph.vector.Stroke} */(this.connectorStrokeResolver_(this, state));
  if (!offset && connectorStroke) {
    connectorLen = anychart.utils.normalizeSize(/** @type {number|string} */(this.resolveOption('length', state, iterator, anychart.core.settings.numberOrPercentNormalizer, true)), this.pixelBoundsCache.height);
    offset += connectorLen;
  }
  y += directionIsUp ? -offset : offset;
  var tag = {
    group: this,
    index: iterator.getIndex()
  };
  var shapes, path, overlay;
  if (opt_offsets) {
    shapes = this.shapeManager_.getShapesGroup(state, null, zIndex);
    path = /** @type {acgraph.vector.Path} */(shapes['path']);
    overlay = /** @type {acgraph.vector.Path} */(shapes['overlay']);
    iterator.meta('shapes', shapes);
  } else {
    shapes = /** @type {Object.<acgraph.vector.Path>} */(iterator.meta('shapes'));
    path = /** @type {acgraph.vector.Path} */(shapes['path']);
    overlay = /** @type {acgraph.vector.Path} */(shapes['overlay']);
    this.shapeManager_.updateColors(state, shapes);
    this.shapeManager_.updateZIndex(zIndex, shapes);
    path.parent(/** @type {acgraph.vector.Layer} */(this.container()));
    path.clear();
    path.setTransformationMatrix(1, 0, 0, 1, 0, 0);
    overlay.parent(/** @type {acgraph.vector.Layer} */(this.container()));
    overlay.clear();
    overlay.setTransformationMatrix(1, 0, 0, 1, 0, 0);
  }
  var thickness = acgraph.vector.getThickness(/** @type {acgraph.vector.Stroke} */(path.stroke()));
  x = anychart.utils.applyPixelShift(x, thickness);
  y = anychart.utils.applyPixelShift(y, thickness);
  path.tag = tag;
  overlay.tag = tag;
  if (connectorLen && connectorStroke) {
    var connectorPath = this.plot.eventMarkers().drawConnector(x, y, y - (directionIsUp ? -connectorLen : connectorLen), connectorStroke, opt_offsets ? undefined : /** @type {acgraph.vector.Path} */(iterator.meta('connectorPath')));
    connectorPath.tag = tag;
    iterator.meta('connectorPath', connectorPath);
  }
  var width = Math.round(anychart.utils.normalizeSize(/** @type {number|string} */(this.resolveOption('width', state, iterator, anychart.core.settings.numberOrPercentNormalizer, false)), this.pixelBoundsCache.width));
  var height = Math.round(anychart.utils.normalizeSize(/** @type {number|string} */(this.resolveOption('height', state, iterator, anychart.core.settings.numberOrPercentNormalizer, false)), this.pixelBoundsCache.height));
  drawer(path, x, y, width, height, directionIsUp);
  var label = this.drawLabel_(iterator, state, type, x, y, width, height, directionIsUp, zIndex + anychart.stockModule.eventMarkers.PlotController.Z_INDEX_LABELS_ADD, !opt_offsets);
  label.getDomElement().tag = tag;
  var overlayDrawer = this.SINGLE_MARKER_DRAWERS[type == anychart.enums.EventMarkerType.FLAG ? anychart.enums.EventMarkerType.FLAG : anychart.enums.EventMarkerType.RECT];
  overlayDrawer(overlay, x, y, width, height, directionIsUp);
  offset += height;
  totalHeightDiff = height + connectorLen - Number(iterator.meta('totalHeight') || 0);
  iterator.meta('totalHeight', height + connectorLen);
  return [hash, opt_offsets ? offset : (directionIsUp ? -totalHeightDiff : totalHeightDiff)];
};


/**
 *
 * @param {anychart.stockModule.eventMarkers.Table.Iterator} iterator
 * @param {anychart.PointState|number} state
 * @param {anychart.enums.EventMarkerType} markerType
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 * @param {boolean} directionIsUp
 * @param {number} zIndex
 * @param {boolean} isUpdate
 * @return {anychart.core.ui.LabelsFactory.Label}
 * @private
 */
anychart.stockModule.eventMarkers.Group.prototype.drawLabel_ = function(iterator, state, markerType, x, y, width, height, directionIsUp, zIndex, isUpdate) {
  var chain = this.getResolutionChain(iterator, state, false, false);
  var index = iterator.getIndex();
  var label;
  iterator.meta('symbol', (/** @type {string} */(this.resolveOptionFast(chain, 'format', anychart.core.settings.stringNormalizer))).charAt(0));
  var formatProvider = new anychart.format.Context(this.getContextProviderValues(iterator), iterator);
  formatProvider.propagate();
  var positionProvider = this.getTextPositionProvider_(markerType, x, y, width, height, directionIsUp);
  if (isUpdate) {
    label = /** @type {anychart.core.ui.LabelsFactory.Label} */(this.labels_.getLabel(index));
    label.formatProvider(formatProvider);
    label.positionProvider(positionProvider);
  } else {
    label = this.labels_.add(formatProvider, positionProvider, index);
  }
  label.zIndex(zIndex);
  var padding = /** @type {string|number} */(this.resolveOptionFast(chain, 'fontPadding', anychart.core.settings.numberOrPercentNormalizer));
  height = positionProvider['height'] || height;
  var labelChain = goog.array.concat({
    'positionFormatter': anychart.utils.DEFAULT_FORMATTER,
    'anchor': anychart.enums.Anchor.CENTER,
    'rotation': 0,
    'width': width - anychart.utils.normalizeSize(padding, width / 2) * 2,
    'height': height - anychart.utils.normalizeSize(padding, height / 2) * 2
  }, chain);
  label.stateOrder(/** @type {Array.<Object>} */(labelChain));
  label.container(/** @type {acgraph.vector.ILayer} */(this.container()));
  label.draw();
  return label;
};


/**
 *
 * @param {anychart.enums.EventMarkerPosition} position
 * @param {string} seriesId
 * @param {string} fieldName
 * @param {boolean} directionIsUp
 * @return {string}
 * @private
 */
anychart.stockModule.eventMarkers.Group.prototype.getPositionHash_ = function(position, seriesId, fieldName, directionIsUp) {
  return position + (position == anychart.enums.EventMarkerPosition.AXIS ? '' : (seriesId + fieldName) + (directionIsUp ? 'U' : 'D'));
};


/**
 * This method also has a side effect - it patches the original source event to maintain pointIndex support for
 * browser events.
 * @param {anychart.core.MouseEvent} event
 * @return {Object} An object of event to dispatch. If null - unrecognized type was found.
 */
anychart.stockModule.eventMarkers.Group.prototype.makePointEvent = function(event) {
  var type = event['type'];
  switch (type) {
    case acgraph.events.EventType.MOUSEOUT:
      type = anychart.enums.EventType.EVENT_MARKER_MOUSE_OUT;
      break;
    case acgraph.events.EventType.MOUSEOVER:
      type = anychart.enums.EventType.EVENT_MARKER_MOUSE_OVER;
      break;
    case acgraph.events.EventType.MOUSEMOVE:
      type = anychart.enums.EventType.EVENT_MARKER_MOUSE_MOVE;
      break;
    case acgraph.events.EventType.MOUSEDOWN:
      type = anychart.enums.EventType.EVENT_MARKER_MOUSE_DOWN;
      break;
    case acgraph.events.EventType.MOUSEUP:
      type = anychart.enums.EventType.EVENT_MARKER_MOUSE_UP;
      break;
    case acgraph.events.EventType.CLICK:
    case acgraph.events.EventType.TOUCHSTART:
      type = anychart.enums.EventType.EVENT_MARKER_CLICK;
      break;
    case acgraph.events.EventType.DBLCLICK:
      type = anychart.enums.EventType.EVENT_MARKER_DBLCLICK;
      break;
    default:
      return null;
  }

  var index;
  if ('eventMarkerIndex' in event) {
    index = event['eventMarkerIndex'];
  } else if ('labelIndex' in event) {
    index = event['labelIndex'] + this.getIterator().getFirstIndex();
  }
  event['eventMarkerIndex'] = index = anychart.utils.toNumber(index);

  return {
    'type': type,
    'target': this,
    'group': this,
    'index': index,
    'originalEvent': event,
    'eventMarker': this.getMarker(index)
  };
};


//endregion
//region --- IShapeManagerUser
//------------------------------------------------------------------------------
//
//  IShapeManagerUser
//
//------------------------------------------------------------------------------
/**
 * @return {boolean}
 */
anychart.stockModule.eventMarkers.Group.prototype.isDiscreteBased = function() {
  return true;
};


/**
 * @return {boolean}
 */
anychart.stockModule.eventMarkers.Group.prototype.supportsPointSettings = function() {
  return true;
};


/**
 * Returns color resolution context.
 * This context is used to resolve a fill or stroke set as a function for current point.
 * @param {(acgraph.vector.Fill|acgraph.vector.Stroke)=} opt_baseColor - .
 * @param {boolean=} opt_ignorePointSettings - Whether should take detached iterator.
 * @param {boolean=} opt_ignoreColorScale - Whether should use color scale.
 * @return {Object}
 */
anychart.stockModule.eventMarkers.Group.prototype.getColorResolutionContext = function(opt_baseColor, opt_ignorePointSettings, opt_ignoreColorScale) {
  var source = opt_baseColor || this.getOption('fill') || '#ccc';
  var iterator = this.getIterator();
  return {
    'index': iterator.getIndex(),
    'sourceColor': source,
    'iterator': iterator,
    'group': this,
    'chart': this.plot.getChart(),
    'plot': this.plot
  };
};


/**
 * @return {acgraph.vector.HatchFill}
 */
anychart.stockModule.eventMarkers.Group.prototype.getAutoHatchFill = function() {
  return null;
};


/**
 * @return {!anychart.stockModule.eventMarkers.Table.Iterator}
 */
anychart.stockModule.eventMarkers.Group.prototype.getIterator = function() {
  if (!this.iterator_) {
    this.iterator_ = this.getDetachedIterator();
  }
  return this.iterator_;
};


/**
 * @param {boolean=} opt_full
 * @return {!anychart.stockModule.eventMarkers.Table.Iterator}
 */
anychart.stockModule.eventMarkers.Group.prototype.getDetachedIterator = function(opt_full) {
  var stick = this.resolveOptionFast(this.getResolutionChain(null, 0, true, false), 'stickToLeft', anychart.core.settings.booleanNormalizer);
  var args = this.plot.getChart().getEventMarkersIteratorParams(opt_full);
  args.push(stick);
  return this.dataTable_.getIterator.apply(this.dataTable_, args);
};


/**
 * Returns hatch fill resolution context.
 * This context is used to resolve a hatch fill set as a function for current point.
 * @param {boolean=} opt_ignorePointSettings - Whether should take detached iterator.
 * @return {Object}
 */
anychart.stockModule.eventMarkers.Group.prototype.getHatchFillResolutionContext = function(opt_ignorePointSettings) {
  return null;
};


/**
 * Returns partial resolution chain for passed state and priority.
 * @param {anychart.data.IRowInfo} point
 * @param {anychart.PointState|number} state
 * @param {boolean} ignorePointSettings
 * @param {boolean} forConnector
 * @param {string=} opt_name
 * @return {Array.<*>}
 */
anychart.stockModule.eventMarkers.Group.prototype.getResolutionChain = function(point, state, ignorePointSettings, forConnector, opt_name) {
  var normalPointOverride,
      statePointOverride;
  if (ignorePointSettings) {
    normalPointOverride = statePointOverride = null;
  } else {
    normalPointOverride = point.get('normal');
    if (!goog.isDef(normalPointOverride) && (forConnector || opt_name)) {
      var propName = forConnector ? 'connector' : opt_name || '';
      normalPointOverride = {};
      normalPointOverride[propName] = point.get(propName);
    }
    statePointOverride = state ? (state == 1) ? point.get('hovered') : point.get('selected') : null;
  }
  state = Math.min(state, anychart.PointState.SELECT);
  var index = state * 2 + forConnector;
  if (forConnector) {
    if (goog.isObject(normalPointOverride))
      normalPointOverride = normalPointOverride['connector'];
    if (goog.isObject(statePointOverride))
      statePointOverride = statePointOverride['connector'];
  }
  var res = this.partialChains_[index];
  if (res) {
    // These magic numbers rely on the fact, that getPartialChain method of PlotController returns exactly 3 items
    if (state) {
      res[0] = statePointOverride;
      res[6] = normalPointOverride;
    } else {
      res[0] = normalPointOverride;
    }
  } else {
    var controller = /** @type {anychart.stockModule.eventMarkers.PlotController} */(this.plot.eventMarkers());
    var normalLowChain = controller.getPartialChain(anychart.PointState.NORMAL, true, forConnector);
    var normalHighChain = controller.getPartialChain(anychart.PointState.NORMAL, false, forConnector);
    var normalInstance = forConnector ? this.normal_.connector() : this.normal_;
    if (state) {
      var stateLowChain = controller.getPartialChain(state, true, forConnector);
      var stateHighChain = controller.getPartialChain(state, false, forConnector);
      var stateSettings = state == anychart.PointState.HOVER ? this.hovered_ : this.selected_;
      stateSettings = forConnector ? stateSettings.connector() : stateSettings;
      res = goog.array.concat(
          [statePointOverride], // 0 index - state point override
          stateSettings.ownSettings, // 1
          stateHighChain, // 2, 3, 4, 5
          [normalPointOverride], // 6 - normal point override
          normalInstance.ownSettings,
          forConnector ? null : this.ownSettings,
          normalHighChain,
          stateSettings.themeSettings,
          stateLowChain,
          normalInstance.themeSettings,
          forConnector ? null : this.themeSettings,
          normalLowChain);
    } else {
      res = goog.array.concat(
          [normalPointOverride], // 0 index - state point override
          normalInstance.ownSettings,
          forConnector ? null : this.ownSettings,
          normalHighChain,
          normalInstance.themeSettings,
          forConnector ? null : this.themeSettings,
          normalLowChain);
    }
    this.partialChains_[index] = res;
  }
  return res;
};


/**
 * Returns proper settings due to the state if point settings are supported by the IShapeManagerUser.
 * Doesn't support opt_seriesName and opt_ignorePointSettings.
 * @param {string} name
 * @param {number} state
 * @param {anychart.data.IRowInfo} point
 * @param {Function} normalizer
 * @param {boolean} scrollerSelected - used as a connector option selector.
 * @param {string=} opt_seriesName - series option name if differs from point names.
 * @param {boolean=} opt_ignorePointSettings
 * @return {*}
 */
anychart.stockModule.eventMarkers.Group.prototype.resolveOption = function(name, state, point, normalizer, scrollerSelected, opt_seriesName, opt_ignorePointSettings) {
  var chain = this.getResolutionChain(point, state, !!opt_ignorePointSettings, scrollerSelected, name);
  return this.resolveOptionFast(chain, name, normalizer);
};


/**
 * Resolves option from pre-fetched chain.
 * @param {Array} chain
 * @param {string} name
 * @param {Function} normalizer
 * @return {*}
 */
anychart.stockModule.eventMarkers.Group.prototype.resolveOptionFast = function(chain, name, normalizer) {
  for (var i = 0; i < chain.length; i++) {
    var obj = chain[i];
    if (goog.isObject(obj)) {
      var val = obj[name];
      if (goog.isDefAndNotNull(val)) {
        return normalizer(val);
      }
    }
  }
  return undefined;
};


//endregion
//region --- Shape drawers
//------------------------------------------------------------------------------
//
//  Shape drawers
//
//------------------------------------------------------------------------------
/**
 * Drawers for a single event marker.
 * @const {Object.<anychart.enums.EventMarkerType, function(acgraph.vector.Path,number,number,number,number,boolean)>}
 */
anychart.stockModule.eventMarkers.Group.prototype.SINGLE_MARKER_DRAWERS = (function() {
  var map = {};
  /**
   * CIRCLE shape drawer.
   * @param {acgraph.vector.Path} path
   * @param {number} x
   * @param {number} y
   * @param {number} width
   * @param {number} height
   * @param {boolean} directionIsUp
   */
  map[anychart.enums.EventMarkerType.CIRCLE] = function(path, x, y, width, height, directionIsUp) {
    var ry = height / 2;
    path.circularArc(x, y + (directionIsUp ? -ry : ry), width / 2, ry, 0, 360);
  };
  /**
   * RECT shape drawer.
   * @param {acgraph.vector.Path} path
   * @param {number} x
   * @param {number} y
   * @param {number} width
   * @param {number} height
   * @param {boolean} directionIsUp
   */
  map[anychart.enums.EventMarkerType.RECT] = function(path, x, y, width, height, directionIsUp) {
    if (directionIsUp)
      height = -height;
    drawPin(path, x, y, width, height, 0);
  };
  /**
   * PIN shape drawer.
   * @param {acgraph.vector.Path} path
   * @param {number} x
   * @param {number} y
   * @param {number} width
   * @param {number} height
   * @param {boolean} directionIsUp
   */
  map[anychart.enums.EventMarkerType.PIN] = function(path, x, y, width, height, directionIsUp) {
    if (directionIsUp)
      height = -height;
    var dh = height / 4;
    drawPin(path, x, y, width, height, dh);
  };
  /**
   * FLAG shape drawer.
   * @param {acgraph.vector.Path} path
   * @param {number} x
   * @param {number} y
   * @param {number} width
   * @param {number} height
   * @param {boolean} directionIsUp
   */
  map[anychart.enums.EventMarkerType.FLAG] = function(path, x, y, width, height, directionIsUp) {
    if (directionIsUp)
      height = -height;
    drawPin(path, x + width / 2, y, width, height, 0);
  };
  return map;

  function drawPin(path, x, y, width, height, dh) {
    var rx = width / 2;
    path.moveTo(x, y)
        .lineTo(
            x - rx, y + dh,
            x - rx, y + height,
            x + rx, y + height,
            x + rx, y + dh)
        .close();
  }
})();


/**
 * Returns text position provider due to shape properties.
 * @param {anychart.enums.EventMarkerType} type
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 * @param {boolean} directionIsUp
 * @return {Object}
 * @private
 */
anychart.stockModule.eventMarkers.Group.prototype.getTextPositionProvider_ = function(type, x, y, width, height, directionIsUp) {
  var res = {};
  if (directionIsUp)
    height = -height;
  if (type == anychart.enums.EventMarkerType.FLAG) {
    x += width / 2;
  }
  if (type == anychart.enums.EventMarkerType.PIN) {
    y += 3 * height / 5;
    res['height'] = Math.abs(height * 4 / 5);
  } else {
    y += height / 2;
  }
  res['value'] = {
    'x': x,
    'y': y
  };
  return res;
};

/**
 * @param {number} index
 * @return {anychart.format.Context}
 */
anychart.stockModule.eventMarkers.Group.prototype.getContextProvider = function(index) {
  var values;
  var iterator = this.getIterator();
  if (iterator.select(index)) {
    values = this.getContextProviderValues(iterator);
  } else {
    iterator = null;
  }
  var res = new anychart.format.Context(values, iterator);
  res.propagate();
  return res;
};


/**
 *
 * @param {anychart.stockModule.eventMarkers.Table.Iterator} iterator
 * @return {Object}
 */
anychart.stockModule.eventMarkers.Group.prototype.getContextProviderValues = function(iterator) {
  var grouping = this.plot.getChart().grouping().getCurrentDataInterval();
  return {
    'date': {
      value: iterator.getPreciseX(),
      type: anychart.enums.TokenType.DATE_TIME
    },
    'groupedDate': {
      value: iterator.getX(),
      type: anychart.enums.TokenType.DATE_TIME
    },
    'group': {
      value: this,
      type: anychart.enums.TokenType.UNKNOWN
    },
    'index': {
      value: iterator.getIndex(),
      type: anychart.enums.TokenType.NUMBER
    },
    'plot': {
      value: this.plot,
      type: anychart.enums.TokenType.UNKNOWN
    },
    'chart': {
      value: this.plot.getChart(),
      type: anychart.enums.TokenType.UNKNOWN
    },
    'title': {
      value: iterator.get('title') || '',
      type: anychart.enums.TokenType.STRING
    },
    'description': {
      value: iterator.get('description') || '',
      type: anychart.enums.TokenType.STRING
    },
    'symbol': {
      value: iterator.meta('symbol'),
      type: anychart.enums.TokenType.STRING
    },
    'dataIntervalUnit': {
      value: grouping['unit'],
      type: anychart.enums.TokenType.STRING
    },
    'dataIntervalUnitCount': {
      value: grouping['count'],
      type: anychart.enums.TokenType.NUMBER
    }
  };
};


/**
 *
 * @param {number} index
 * @return {anychart.format.Context}
 */
anychart.stockModule.eventMarkers.Group.prototype.getMarker = function(index) {
  var iterator = this.getDetachedIterator(true);
  if (iterator.select(index)) {
    var res = new anychart.format.Context(this.getContextProviderValues(iterator), iterator);
    res.propagate();
  } else {
    res = null;
  }
  return res;
};


//endregion
//region --- Tooltip
//------------------------------------------------------------------------------
//
//  Tooltip
//
//------------------------------------------------------------------------------
/**
 * Creates chart tooltip.
 * @param {(Object|boolean|null)=} opt_value
 * @return {!(anychart.core.ui.Tooltip|anychart.stockModule.eventMarkers.Group)}
 */
anychart.stockModule.eventMarkers.Group.prototype.tooltip = function(opt_value) {
  if (!this.tooltip_) {
    this.tooltip_ = new anychart.core.ui.Tooltip(0);
    this.tooltip_.dropThemes().parent(/** @type {anychart.core.ui.Tooltip} */(this.plot.eventMarkers().tooltip()));
    (/** @type {anychart.core.ui.Label} */(this.tooltip_.contentInternal()))['position']('leftTop');
    this.tooltip_.containerProvider(this.plot);
  }

  if (goog.isDef(opt_value)) {
    this.tooltip_.setup(opt_value);
    return this;
  } else {
    return this.tooltip_;
  }
};


//endregion
//region --- Ser/Deser/Disp
//------------------------------------------------------------------------------
//
//  Ser/Deser/Disp
//
//------------------------------------------------------------------------------
/** @inheritDoc */
anychart.stockModule.eventMarkers.Group.prototype.serialize = function() {
  var json = anychart.stockModule.eventMarkers.Group.base(this, 'serialize');

  anychart.core.settings.serialize(this, anychart.stockModule.eventMarkers.Group.OWN_DESCRIPTORS, json);
  json['normal'] = this.normal_.serialize();
  json['hovered'] = this.hovered_.serialize();
  json['selected'] = this.selected_.serialize();
  json['tooltip'] = this.tooltip().serialize();

  json['data'] = this.dataTable_.getData();

  return json;
};


/** @inheritDoc */
anychart.stockModule.eventMarkers.Group.prototype.setupSpecial = function(isDefault, var_args) {
  var arg0 = arguments[1];
  if (goog.isArray(arg0)) {
    this.data(arg0);
    return true;
  }
  return false;
};


/** @inheritDoc */
anychart.stockModule.eventMarkers.Group.prototype.setupByJSON = function(config, opt_default) {
  anychart.stockModule.eventMarkers.Group.base(this, 'setupByJSON', config, opt_default);
  if (goog.isDef(config['data']))
    this.data(/** @type {anychart.stockModule.eventMarkers.Group.DataFormat} */(config['data']));
  this.normal_.setupInternal(!!opt_default, config);
  this.normal_.setupInternal(!!opt_default, config['normal']);
  this.hovered_.setupInternal(!!opt_default, config['hovered']);
  this.selected_.setupInternal(!!opt_default, config['selected']);
  this.tooltip().setupInternal(!!opt_default, config['tooltip']);
  anychart.core.settings.deserialize(this, anychart.stockModule.eventMarkers.Group.OWN_DESCRIPTORS, config);
};


/** @inheritDoc */
anychart.stockModule.eventMarkers.Group.prototype.disposeInternal = function() {
  goog.disposeAll(this.shapeManager_, this.normal_, this.hovered_, this.selected_, this.tooltip_, this.labels_);
  this.normal_ = this.hovered_ = this.selected_ = this.shapeManager_ = this.plot = this.tooltip_ = this.labels_= null;
  anychart.stockModule.eventMarkers.Group.base(this, 'disposeInternal');
};


//endregion
//exports
(function() {
  var proto = anychart.stockModule.eventMarkers.Group.prototype;
  proto['data'] = proto.data;
  proto['tooltip'] = proto.tooltip;
  proto['getMarker'] = proto.getMarker;
  proto['normal'] = proto.normal;
  proto['hovered'] = proto.hovered;
  proto['selected'] = proto.selected;
})();
