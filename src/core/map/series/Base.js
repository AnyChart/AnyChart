goog.provide('anychart.core.map.series.Base');
goog.require('anychart.core.SeriesBase');
goog.require('anychart.core.map.geom');
goog.require('anychart.core.utils.MapPointContextProvider');
goog.require('anychart.enums');



/**
 * Choropleth series. Read more about choropleth <a href='http://en.wikipedia.org/wiki/Choropleth_map'>here</a>.
 * @param {?(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Data to set.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings here as a hash map.
 * @constructor
 * @extends {anychart.core.SeriesBase}
 */
anychart.core.map.series.Base = function(opt_data, opt_csvSettings) {
  this.suspendSignalsDispatching();

  goog.base(this, opt_data, opt_csvSettings);

  this.geoData = [];
  this.needSelfLayer = true;

  this.resumeSignalsDispatching(false);
};
goog.inherits(anychart.core.map.series.Base, anychart.core.SeriesBase);


/**
 * Map of series constructors by type.
 * @type {Object.<string, Function>}
 */
anychart.core.map.series.Base.SeriesTypesMap = {};


/**
 * Supported signals.
 * @type {number}
 */
anychart.core.map.series.Base.prototype.SUPPORTED_SIGNALS =
    anychart.core.VisualBaseWithBounds.prototype.SUPPORTED_SIGNALS |
    anychart.Signal.DATA_CHANGED |
    anychart.Signal.NEEDS_RECALCULATION |
    anychart.Signal.NEED_UPDATE_LEGEND;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.map.series.Base.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.VisualBaseWithBounds.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.SERIES_HATCH_FILL |
    anychart.ConsistencyState.APPEARANCE |
    anychart.ConsistencyState.SERIES_LABELS |
    anychart.ConsistencyState.SERIES_DATA;


/**
 * Default hatch fill type.
 * @type {acgraph.vector.HatchFill.HatchFillType|string}
 */
anychart.core.map.series.Base.DEFAULT_HATCH_FILL_TYPE = acgraph.vector.HatchFill.HatchFillType.DIAGONAL_BRICK;


/**
 * Series element z-index in series root layer.
 * @type {number}
 */
anychart.core.map.series.Base.ZINDEX_SERIES = 1;


/**
 * Hatch fill z-index in series root layer.
 * @type {number}
 */
anychart.core.map.series.Base.ZINDEX_HATCH_FILL = 2;


/**
 * @type {boolean}
 * @protected
 */
anychart.core.map.series.Base.prototype.needSelfLayer;


/**
 * @type {anychart.charts.Map}
 */
anychart.core.map.series.Base.prototype.map;


/**
 * Field names certain type of series needs from data set.
 * For example ['x', 'value']. Must be created in constructor. getReferenceCoords() doesn't work without this.
 * @type {!Array.<string>}
 */
anychart.core.map.series.Base.prototype.referenceValueNames;


/**
 * Attributes names list from referenceValueNames. Must be the same length as referenceValueNames.
 * For example ['x', 'y']. Must be created in constructor. getReferenceCoords() doesn't work without this.
 * Possible values:
 *    'x' - transforms through xScale,
 *    'y' - transforms through yScale,
 *    'z' - gets as zero Y.
 * NOTE: if we need zeroY, you need to ask for it prior toall 'y' values.
 * @type {!Array.<string>}
 */
anychart.core.map.series.Base.prototype.referenceValueMeanings;


/**
 * Calculates size scale for the series. If opt_minMax is passed, also compares with opt_minMax members.
 * @param {Array.<number>=} opt_minMax Array of two values: [min, max].
 */
anychart.core.map.series.Base.prototype.calculateSizeScale = goog.nullFunction;


/**
 * @param {number} min .
 * @param {number} max .
 * @param {number|string} minSize
 * @param {number|string} maxSize
 */
anychart.core.map.series.Base.prototype.setAutoSizeScale = goog.nullFunction;


//----------------------------------------------------------------------------------------------------------------------
//
//  Color scale.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Color scale.
 * @param {(anychart.scales.LinearColor|anychart.scales.OrdinalColor)=} opt_value Scale to set.
 * @return {anychart.scales.OrdinalColor|anychart.scales.LinearColor|anychart.core.map.series.Base} Default chart color scale value or itself for
 * method chaining.
 */
anychart.core.map.series.Base.prototype.colorScale = function(opt_value) {
  return null;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Geo data.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * @type {?string}
 * @private
 */
anychart.core.map.series.Base.prototype.geoIdField_;


/**
 * Geo data internal view.
 * @type {!Array.<anychart.core.map.geom.Point|anychart.core.map.geom.Line|anychart.core.map.geom.Polygon|anychart.core.map.geom.Collection>}
 * @protected
 */
anychart.core.map.series.Base.prototype.geoData;


/**
 * Sets/gets geo id field.
 * @param {?string=} opt_value Geo id.
 * @return {null|string|anychart.core.map.series.Base}
 */
anychart.core.map.series.Base.prototype.geoIdField = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (opt_value != this.geoIdField_) {
      this.geoIdField_ = opt_value;
      this.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.SERIES_DATA,
          anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.geoIdField_ || this.geoAutoGeoIdField_;
};


/**
 * Sets auto geo id for series.
 * @param {string} value
 */
anychart.core.map.series.Base.prototype.setAutoGeoIdField = function(value) {
  if (this.geoAutoGeoIdField_ != value) {
    this.geoAutoGeoIdField_ = value;
    if (!this.geoIdField_)
      this.invalidate(anychart.ConsistencyState.SERIES_DATA, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Returns final geo id for series.
 * @return {string}
 */
anychart.core.map.series.Base.prototype.getFinalGeoIdField = function() {
  return this.geoIdField_ || this.geoAutoGeoIdField_;
};


/**
 * Internal method. Sets link to geo data.
 * @param {anychart.charts.Map} map .
 * @param {!Array.<anychart.core.map.geom.Point|anychart.core.map.geom.Line|anychart.core.map.geom.Polygon|anychart.core.map.geom.Collection>} geoData Geo data to set.
 */
anychart.core.map.series.Base.prototype.setGeoData = function(map, geoData) {
  this.map = map;
  this.geoData = geoData;
  this.calculate();
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Sufficient properties
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Tester if the series has markers() method.
 * @return {boolean}
 */
anychart.core.map.series.Base.prototype.hasMarkers = function() {
  return false;
};


/**
 * Tester if the series is size based (bubble).
 * @return {boolean}
 */
anychart.core.map.series.Base.prototype.isChoropleth = function() {
  return false;
};


/**
 * Whether draw hatch fill.
 * @return {boolean}
 */
anychart.core.map.series.Base.prototype.needDrawHatchFill = function() {
  return false;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Statistics
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.map.series.Base.prototype.calculateStatistics = function() {
  var seriesMax = -Infinity;
  var seriesMin = Infinity;
  var seriesSum = 0;
  var seriesPointsCount = 0;

  var iterator = this.getResetIterator();

  while (iterator.advance()) {
    var values = this.getReferenceScaleValues();

    if (values) {
      var y = anychart.utils.toNumber(values[0]);
      if (!isNaN(y)) {
        seriesMax = Math.max(seriesMax, y);
        seriesMin = Math.min(seriesMin, y);
        seriesSum += y;
      }
    }
    seriesPointsCount++;
  }
  var seriesAverage = seriesSum / seriesPointsCount;

  this.statistics('seriesMax', seriesMax);
  this.statistics('seriesMin', seriesMin);
  this.statistics('seriesSum', seriesSum);
  this.statistics('seriesAverage', seriesAverage);
  this.statistics('seriesPointsCount', seriesPointsCount);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Drawing.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Calculation before draw.
 */
anychart.core.map.series.Base.prototype.calculate = function() {
  if (this.hasInvalidationState(anychart.ConsistencyState.SERIES_DATA)) {
    var iterator = this.getResetIterator();
    while (iterator.advance()) {
      var name = iterator.get('id');
      if (!name || !goog.isString(name))
        continue;

      iterator.meta('regionShape', undefined).meta('regionProperties', undefined);
      for (var i = 0, len = this.geoData.length; i < len; i++) {
        var geom = this.geoData[i];
        if (!geom) continue;
        var prop = geom['properties'];
        if (prop[this.getFinalGeoIdField()] == name) {
          iterator.meta('regionShape', geom.domElement).meta('regionProperties', prop);
          break;
        }
      }
    }
  }
};


/**
 * Update series elements on zoom or move map interactivity.
 * p.s. There is should be logic for series that does some manipulation with series elements. Now it is just series redrawing.
 * @return {anychart.core.map.series.Base}
 */
anychart.core.map.series.Base.prototype.updateOnZoomOrMove = function() {
  var iterator = this.getResetIterator();

  var stage = this.container() ? this.container().getStage() : null;
  var manualSuspend = stage && !stage.isSuspended();
  if (manualSuspend) stage.suspend();

  while (iterator.advance() && this.enabled()) {
    this.applyZoomMoveTransform();
  }

  if (manualSuspend)
    stage.resume();

  this.markConsistent(anychart.ConsistencyState.ALL);

  return this;
};


/**
 * Applying zoom and move transformations to series elements for improve performans.
 */
anychart.core.map.series.Base.prototype.applyZoomMoveTransform = function() {
  var domElement, prevPos, newPos, trX, trY, selfTx;

  var iterator = this.getIterator();
  var index = iterator.getIndex();
  var pointState = this.state.getPointStateByIndex(index);
  var selected = this.state.isStateContains(pointState, anychart.PointState.SELECT);
  var hovered = !selected && this.state.isStateContains(pointState, anychart.PointState.HOVER);

  var isDraw, labelsFactory, pointLabel, stateLabel, labelEnabledState, stateLabelEnabledState;

  pointLabel = iterator.get('label');
  labelEnabledState = pointLabel && goog.isDef(pointLabel['enabled']) ? pointLabel['enabled'] : null;
  if (selected) {
    stateLabel = iterator.get('selectLabel');
    stateLabelEnabledState = stateLabel && goog.isDef(stateLabel['enabled']) ? stateLabel['enabled'] : null;
    labelsFactory = /** @type {anychart.core.ui.LabelsFactory} */(this.selectLabels());
  } else if (hovered) {
    stateLabel = iterator.get('hoverLabel');
    stateLabelEnabledState = stateLabel && goog.isDef(stateLabel['enabled']) ? stateLabel['enabled'] : null;
    labelsFactory = /** @type {anychart.core.ui.LabelsFactory} */(this.hoverLabels());
  } else {
    stateLabel = null;
    labelsFactory = this.labels();
  }

  if (selected || hovered) {
    isDraw = goog.isNull(stateLabelEnabledState) ?
        goog.isNull(labelsFactory.enabled()) ?
            goog.isNull(labelEnabledState) ?
                this.labels().enabled() :
                labelEnabledState :
            labelsFactory.enabled() :
        stateLabelEnabledState;
  } else {
    isDraw = goog.isNull(labelEnabledState) ?
        this.labels().enabled() :
        labelEnabledState;
  }

  if (isDraw) {
    var label = this.labels().getLabel(index);
    if (label && label.getDomElement() && label.positionProvider()) {

      var position = this.getLabelsPosition(pointState);
      var positionProvider = this.createPositionProvider(position);

      prevPos = label.positionProvider()['value'];
      newPos = positionProvider['value'];

      domElement = label.getDomElement();
      selfTx = domElement.getSelfTransformation();

      trX = -selfTx.getTranslateX() + newPos['x'] - prevPos['x'];
      trY = -selfTx.getTranslateY() + newPos['y'] - prevPos['y'];

      domElement.translate(trX, trY);
    }
  }
};


/**
 * Draws series into the current container.
 * @return {anychart.core.map.series.Base} An instance of {@link anychart.core.map.series.Base} class for method chaining.
 */
anychart.core.map.series.Base.prototype.draw = function() {
  this.suspendSignalsDispatching();
  this.calculate();

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS))
    this.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.SERIES_HATCH_FILL);

  var iterator = this.getResetIterator();

  this.startDrawing();
  while (iterator.advance() && this.enabled()) {
    var index = iterator.getIndex();
    if (iterator.get('selected') && this.hasInvalidationState(anychart.ConsistencyState.SERIES_DATA))
      this.state.setPointState(anychart.PointState.SELECT, index);

    this.drawPoint(this.state.getPointStateByIndex(index));
  }
  this.finalizeDrawing();

  this.resumeSignalsDispatching(false);
  this.markConsistent(anychart.ConsistencyState.ALL & ~anychart.ConsistencyState.CONTAINER);

  return this;
};


/**
 * Initializes sereis draw.<br/>
 * If scale is not explicitly set - creates a default one.
 */
anychart.core.map.series.Base.prototype.startDrawing = function() {
  if (!this.rootLayer) {
    if (this.needSelfLayer) {
      this.rootLayer = acgraph.layer();
      this.bindHandlersToGraphics(this.rootLayer);
    } else {
      this.rootLayer = this.container();
    }
  }

  this.checkDrawingNeeded();

  this.labels().suspendSignalsDispatching();
  this.hoverLabels().suspendSignalsDispatching();
  this.selectLabels().suspendSignalsDispatching();

  this.labels().clear();

  this.labels().parentBounds(/** @type {anychart.math.Rect} */(this.container().getBounds()));
};


/**
 * Cconstructs children by this initializer.
 * @return {!acgraph.vector.Element} Returns new instance of an element.
 * @protected
 */
anychart.core.map.series.Base.prototype.rootTypedLayerInitializer = goog.abstractMethod;


/**
 * Draws a point iterator points to.
 * @param {anychart.PointState|number} pointState Point state.
 */
anychart.core.map.series.Base.prototype.drawPoint = function(pointState) {
  this.drawLabel(pointState);
};


/**
 * Finishes series draw.
 * @example <t>listingOnly</t>
 * series.startDrawing();
 * while(series.getIterator().advance())
 *   series.drawPoint();
 * series.finalizeDrawing();
 */
anychart.core.map.series.Base.prototype.finalizeDrawing = function() {
  this.labels().container(/** @type {acgraph.vector.ILayer} */(this.container()));
  this.labels().draw();

  this.labels().resumeSignalsDispatching(false);
  this.hoverLabels().resumeSignalsDispatching(false);
  this.selectLabels().resumeSignalsDispatching(false);

  this.labels().markConsistent(anychart.ConsistencyState.ALL);
  this.hoverLabels().markConsistent(anychart.ConsistencyState.ALL);
  this.selectLabels().markConsistent(anychart.ConsistencyState.ALL);
};


/**
 * Gets an array of reference 'y' fields from the row iterator points to.
 * Reference fields are defined using referenceValueNames and referenceValueMeanings.
 * If there is only one field - a value is returned.
 * If there are several - array.
 * If any of the two is undefined - returns null.
 *
 * @return {Array.<*>|null} Fetches significant scale values from current data row.
 */
anychart.core.map.series.Base.prototype.getReferenceScaleValues = function() {
  if (!this.enabled()) return null;
  var res = [];
  var iterator = this.getIterator();
  for (var i = 0, len = this.referenceValueNames.length; i < len; i++) {
    if (this.referenceValueMeanings[i] != 'y') continue;
    var val = iterator.get(this.referenceValueNames[i]);
    if (anychart.utils.isNaN(val)) return null;
    res.push(val);
  }
  return res;
};


/**
 * Transform coords to pix values.
 * @param {number} xCoord X coordinate.
 * @param {number} yCoord Y coordinate.
 * @return {Object.<string, number>} Object with pix values.
 */
anychart.core.map.series.Base.prototype.transformXY = function(xCoord, yCoord) {
  var values = this.getChart().scale().transform(xCoord, yCoord);
  return {'x': values[0], 'y': values[1]};
};


/**
 * Create base series format provider.
 * @param {boolean=} opt_force create context provider forcibly.
 * @return {Object} Object with info for labels formatting.
 * @protected
 */
anychart.core.map.series.Base.prototype.createFormatProvider = function(opt_force) {
  if (!this.pointProvider || opt_force)
    this.pointProvider = new anychart.core.utils.MapPointContextProvider(this, this.referenceValueNames);
  this.pointProvider.applyReferenceValues();

  return this.pointProvider;
};


/**
 * Returns position relative bounded region.
 * @return {Object} Object with info for labels formatting.
 */
anychart.core.map.series.Base.prototype.getPositionByRegion = function() {
  var iterator = this.getIterator();
  var pointGeoProp = /** @type {Object}*/(iterator.meta('regionProperties'));

  var midX = iterator.get('middle-x');
  var midY = iterator.get('middle-y');
  var middleX = /** @type {number}*/(goog.isDef(midX) ? midX : pointGeoProp ? pointGeoProp['middle-x'] : .5);
  var middleY = /** @type {number}*/(goog.isDef(midY) ? midY : pointGeoProp ? pointGeoProp['middle-y'] : .5);

  var shape = iterator.meta('regionShape');
  var positionProvider;
  if (shape) {
    var bounds = shape.getAbsoluteBounds();
    positionProvider = {'value': {'x': bounds.left + bounds.width * middleX, 'y': bounds.top + bounds.height * middleY}};
  } else {
    positionProvider = {'value': {'x': 0, 'y': 0}};
  }
  return positionProvider;
};


/**
 * Create series position provider.
 * @param {string} position Understands anychart.enums.Position and some additional values.
 * @return {Object} Object with info for labels formatting.
 * @protected
 */
anychart.core.map.series.Base.prototype.createPositionProvider = function(position) {
  var iterator = this.getIterator();
  var shape = iterator.meta('shape');
  if (shape) {
    var shapeBounds = shape.getBounds();
    position = anychart.enums.normalizeAnchor(position);
    return {'value': anychart.utils.getCoordinateByAnchor(shapeBounds, position)};
  } else {
    return {'value': {'x': iterator.meta('x'), 'y': iterator.meta('value')}};
  }
};


/** @inheritDoc */
anychart.core.map.series.Base.prototype.remove = function() {
  if (this.rootLayer && this.needSelfLayer)
    this.rootLayer.remove();

  this.labels().container(null);

  goog.base(this, 'remove');
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Coloring
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.map.series.Base.prototype.normalizeColor = function(color, var_args) {
  var fill;
  if (goog.isFunction(color)) {
    var sourceColor = arguments.length > 1 ?
        this.normalizeColor.apply(this, goog.array.slice(arguments, 1)) :
        this.color();
    var scope = {
      'index': this.getIterator().getIndex(),
      'sourceColor': sourceColor,
      'iterator': this.getIterator(),
      'referenceValueNames': this.referenceValueNames
    };
    fill = color.call(scope);
  } else
    fill = color;
  return fill;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Legend
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.map.series.Base.prototype.getLegendItemData = function(itemsTextFormatter) {
  var legendItem = this.legendItem();
  legendItem.markAllConsistent();
  var json = legendItem.serialize();
  var iconFill, iconStroke, iconHatchFill;
  if (goog.isFunction(legendItem.iconFill())) {
    iconFill = legendItem.iconFill().call(this.color());
  }
  if (goog.isFunction(legendItem.iconStroke())) {
    iconStroke = legendItem.iconStroke().call(this.color());
  }
  if (goog.isFunction(legendItem.iconHatchFill())) {
    iconHatchFill = legendItem.iconHatchFill().call(this.autoHatchFill);
  }
  var itemText;
  if (goog.isFunction(itemsTextFormatter)) {
    var format = this.createLegendContextProvider();
    itemText = itemsTextFormatter.call(format, format);
  }
  if (!goog.isString(itemText))
    itemText = goog.isDef(this.name()) ? this.name() : 'Series: ' + this.index();

  var ret = {
    'text': /** @type {string} */ (itemText),
    'iconEnabled': true,
    'iconType': this.getLegendIconType(),
    'iconStroke': iconStroke,
    'iconFill': iconFill || this.color(),
    'iconHatchFill': iconHatchFill,
    'disabled': !this.enabled()
  };
  goog.object.extend(ret, json);
  return ret;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Series default settings.
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.map.series.Base.prototype.getEnableChangeSignals = function() {
  return goog.base(this, 'getEnableChangeSignals') | anychart.Signal.DATA_CHANGED |
      anychart.Signal.NEEDS_RECALCULATION | anychart.Signal.NEED_UPDATE_LEGEND;
};


/**
 * Returns type of current series.
 * @return {anychart.enums.MapSeriesType} Series type.
 */
anychart.core.map.series.Base.prototype.getType = goog.abstractMethod;


//----------------------------------------------------------------------------------------------------------------------
//
//  Setup.
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.map.series.Base.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');

  json['seriesType'] = this.getType();

  if (goog.isDef(this.geoIdField_))
    json['geoIdField'] = this.geoIdField_;

  return json;
};


/** @inheritDoc */
anychart.core.map.series.Base.prototype.setupByJSON = function(config) {
  goog.base(this, 'setupByJSON', config);

  this.geoIdField(config['geoIdField']);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Exports.
//
//----------------------------------------------------------------------------------------------------------------------
//exports
anychart.core.map.series.Base.prototype['color'] = anychart.core.map.series.Base.prototype.color;

anychart.core.map.series.Base.prototype['selectFill'] = anychart.core.map.series.Base.prototype.selectFill;
anychart.core.map.series.Base.prototype['hoverFill'] = anychart.core.map.series.Base.prototype.hoverFill;
anychart.core.map.series.Base.prototype['fill'] = anychart.core.map.series.Base.prototype.fill;

anychart.core.map.series.Base.prototype['selectStroke'] = anychart.core.map.series.Base.prototype.selectStroke;
anychart.core.map.series.Base.prototype['hoverStroke'] = anychart.core.map.series.Base.prototype.hoverStroke;
anychart.core.map.series.Base.prototype['stroke'] = anychart.core.map.series.Base.prototype.stroke;

anychart.core.map.series.Base.prototype['selectHatchFill'] = anychart.core.map.series.Base.prototype.selectHatchFill;
anychart.core.map.series.Base.prototype['hoverHatchFill'] = anychart.core.map.series.Base.prototype.hoverHatchFill;
anychart.core.map.series.Base.prototype['hatchFill'] = anychart.core.map.series.Base.prototype.hatchFill;

anychart.core.map.series.Base.prototype['geoIdField'] = anychart.core.map.series.Base.prototype.geoIdField;
anychart.core.map.series.Base.prototype['transformXY'] = anychart.core.map.series.Base.prototype.transformXY;
