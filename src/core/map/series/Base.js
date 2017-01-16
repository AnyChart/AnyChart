//region --- Requiring and Providing
goog.provide('anychart.core.map.series.Base');
goog.require('anychart.core.SeriesBase');
goog.require('anychart.core.map.geom');
goog.require('anychart.core.utils.MapPointContextProvider');
goog.require('anychart.enums');
goog.require('goog.math.AffineTransform');
//endregion



/**
 * Choropleth series. Read more about choropleth <a href='http://en.wikipedia.org/wiki/Choropleth_map'>here</a>.
 * @param {?(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Data to set.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings here as a hash map.
 * @constructor
 * @extends {anychart.core.SeriesBase}
 */
anychart.core.map.series.Base = function(opt_data, opt_csvSettings) {
  this.suspendSignalsDispatching();

  anychart.core.map.series.Base.base(this, 'constructor', opt_data, opt_csvSettings);

  this.geoData = [];
  this.needSelfLayer = true;
  this.seriesPoints = [];

  this.resumeSignalsDispatching(false);
};
goog.inherits(anychart.core.map.series.Base, anychart.core.SeriesBase);


//region --- Class const
/**
 * Supported signals.
 * @type {number}
 */
anychart.core.map.series.Base.prototype.SUPPORTED_SIGNALS =
    anychart.core.SeriesBase.prototype.SUPPORTED_SIGNALS |
    anychart.Signal.DATA_CHANGED |
    anychart.Signal.NEEDS_RECALCULATION |
    anychart.Signal.NEED_UPDATE_LEGEND |
    anychart.Signal.NEED_UPDATE_OVERLAP;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.map.series.Base.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.SeriesBase.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.SERIES_HATCH_FILL |
    anychart.ConsistencyState.APPEARANCE |
    anychart.ConsistencyState.SERIES_LABELS |
    anychart.ConsistencyState.SERIES_DATA |
    anychart.ConsistencyState.MAP_GEO_DATA_INDEX;


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


//endregion
//region --- Class prop
/**
 * Map of series constructors by type.
 * @type {Object.<string, Function>}
 */
anychart.core.map.series.Base.SeriesTypesMap = {};


/**
 * If the series inflicts Map appearance update on series update.
 * @return {boolean}
 */
anychart.core.map.series.Base.prototype.needsUpdateMapAppearance = function() {
  return false;
};


/**
 * Returns middle point position. Needed here for compatibility with the Choropleth.
 * @return {Object}
 */
anychart.core.map.series.Base.prototype.getMiddlePoint = function() {
  return {'value': {'x': 0, 'y': 0}};
};


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


/**
 * @type {?boolean}
 * @private
 */
anychart.core.map.series.Base.prototype.overlapMode_ = null;


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
 * @type {Array.<string>}
 */
anychart.core.map.series.Base.prototype.seriesPoints;


//endregion
//region --- Coloring
/**
 * Color scale.
 * @param {(anychart.scales.LinearColor|anychart.scales.OrdinalColor)=} opt_value Scale to set.
 * @return {anychart.scales.OrdinalColor|anychart.scales.LinearColor|anychart.core.map.series.Base} Default chart color scale value or itself for
 * method chaining.
 */
anychart.core.map.series.Base.prototype.colorScale = function(opt_value) {
  return null;
};


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


//endregion
//region --- Geo properties
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
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEEDS_RECALCULATION);
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
 * Internal method. Sets link to parent chart.
 * @param {anychart.charts.Map} map .
 */
anychart.core.map.series.Base.prototype.setMap = function(map) {
  /**
   * @type {anychart.charts.Map}
   */
  this.map = map;
};


/**
 * Internal method. Sets link to geo data.
 * @param {!Array.<anychart.core.map.geom.Point|anychart.core.map.geom.Line|anychart.core.map.geom.Polygon|anychart.core.map.geom.Collection>} geoData Geo data to set.
 */
anychart.core.map.series.Base.prototype.setGeoData = function(geoData) {
  this.geoData = geoData;
};


//endregion
//region --- Labels
/**
 * Returns label bounds.
 * @param {number} index Point index.
 * @param {number=} opt_pointState Point state.
 * @return {Array.<number>}
 */
anychart.core.map.series.Base.prototype.getLabelBounds = function(index, opt_pointState) {
  var iterator = this.getIterator();
  iterator.select(index);
  var pointState = goog.isDef(opt_pointState) ? opt_pointState : this.state.getPointStateByIndex(index);

  var selected = this.state.isStateContains(pointState, anychart.PointState.SELECT);
  var hovered = !selected && this.state.isStateContains(pointState, anychart.PointState.HOVER);
  var isDraw, pointLabel, stateLabel, labelEnabledState, stateLabelEnabledState;

  pointLabel = iterator.get('label');
  labelEnabledState = pointLabel && goog.isDef(pointLabel['enabled']) ? pointLabel['enabled'] : null;
  var parentLabelsFactory = this.labels();
  var currentLabelsFactory = null;
  if (selected) {
    stateLabel = iterator.get('selectLabel');
    stateLabelEnabledState = stateLabel && goog.isDef(stateLabel['enabled']) ? stateLabel['enabled'] : null;
    currentLabelsFactory = /** @type {anychart.core.ui.LabelsFactory} */(this.selectLabels());
  } else if (hovered) {
    stateLabel = iterator.get('hoverLabel');
    stateLabelEnabledState = stateLabel && goog.isDef(stateLabel['enabled']) ? stateLabel['enabled'] : null;
    currentLabelsFactory = /** @type {anychart.core.ui.LabelsFactory} */(this.hoverLabels());
  } else {
    stateLabel = null;
  }

  if (selected || hovered) {
    isDraw = goog.isNull(stateLabelEnabledState) ?
        goog.isNull(currentLabelsFactory.enabled()) ?
            goog.isNull(labelEnabledState) ?
                parentLabelsFactory.enabled() :
                labelEnabledState :
            currentLabelsFactory.enabled() :
        stateLabelEnabledState;
  } else {
    isDraw = goog.isNull(labelEnabledState) ?
        parentLabelsFactory.enabled() :
        labelEnabledState;
  }

  if (isDraw) {
    var position = this.getLabelsPosition(pointState);

    var positionProvider = this.createLabelsPositionProvider(/** @type {anychart.enums.Position|string} */(position));
    var formatProvider = this.createFormatProvider(true);

    var settings = {};

    if (pointLabel)
      goog.object.extend(settings, /** @type {Object} */(pointLabel));
    if (currentLabelsFactory)
      goog.object.extend(settings, currentLabelsFactory.getChangedSettings());
    if (stateLabel)
      goog.object.extend(settings, /** @type {Object} */(stateLabel));

    var anchor = settings['anchor'];
    if (!goog.isDef(anchor) || goog.isNull(anchor)) {
      settings['anchor'] = this.getIterator().meta('labelAnchor');
    }

    return parentLabelsFactory.measure(formatProvider, positionProvider, settings, index).toCoordinateBox();
  } else {
    return null;
  }
};


/** @inheritDoc */
anychart.core.map.series.Base.prototype.configureLabel = function(pointState, opt_reset) {
  var label = /** @type {anychart.core.ui.LabelsFactory.Label} */(anychart.core.map.series.Base.base(this, 'configureLabel', pointState, opt_reset));
  if (label) {
    var anchor = /** @type {anychart.enums.Anchor} */(label.getMergedSettings()['anchor']);
    if (!goog.isDef(anchor) || goog.isNull(anchor)) {
      var autoAnchor = {'anchor': /** @type {anychart.enums.Anchor} */(this.getIterator().meta('labelAnchor'))};
      label.setSettings(autoAnchor, autoAnchor);
    }
  }

  return label;
};


/**
 * Anchor for angle of label
 * @param {number} angle Label angle.
 * @return {anychart.enums.Anchor}
 * @protected
 */
anychart.core.map.series.Base.prototype.getAnchorForLabel = function(angle) {
  angle = goog.math.standardAngle(angle);
  var anchor = anychart.enums.Anchor.CENTER;
  if (!angle) {
    anchor = anychart.enums.Anchor.CENTER_BOTTOM;
  } else if (angle < 90) {
    anchor = anychart.enums.Anchor.LEFT_BOTTOM;
  } else if (angle == 90) {
    anchor = anychart.enums.Anchor.LEFT_CENTER;
  } else if (angle < 180) {
    anchor = anychart.enums.Anchor.LEFT_TOP;
  } else if (angle == 180) {
    anchor = anychart.enums.Anchor.CENTER_TOP;
  } else if (angle < 270) {
    anchor = anychart.enums.Anchor.RIGHT_TOP;
  } else if (angle == 270) {
    anchor = anychart.enums.Anchor.RIGHT_CENTER;
  } else if (angle > 270) {
    anchor = anychart.enums.Anchor.RIGHT_BOTTOM;
  }
  return anchor;
};


/**
 * Defines show label if it don't intersect with other anyone label or not show.
 * @param {(anychart.enums.LabelsOverlapMode|string|boolean)=} opt_value .
 * @return {anychart.enums.LabelsOverlapMode|anychart.core.map.series.Base} .
 */
anychart.core.map.series.Base.prototype.overlapMode = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var val = goog.isNull(opt_value) ? opt_value : anychart.enums.normalizeLabelsOverlapMode(opt_value) == anychart.enums.LabelsOverlapMode.ALLOW_OVERLAP;
    if (this.overlapMode_ != val) {
      this.overlapMode_ = val;
      this.invalidate(anychart.ConsistencyState.SERIES_LABELS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEED_UPDATE_OVERLAP);
    }
    return this;
  }
  return goog.isNull(this.overlapMode_) ?
      /** @type {anychart.enums.LabelsOverlapMode} */(this.map.overlapMode()) :
      this.overlapMode_ ?
          anychart.enums.LabelsOverlapMode.ALLOW_OVERLAP :
          anychart.enums.LabelsOverlapMode.NO_OVERLAP;
};


//endregion
//region --- Check functions
/** @inheritDoc */
anychart.core.map.series.Base.prototype.hasOwnLayer = function() {
  return this.needSelfLayer;
};


/**
 * Tester if the series has markers() method.
 * @return {boolean}
 */
anychart.core.map.series.Base.prototype.supportsMarkers = function() {
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


//endregion
//region --- Statistics
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

  this.statistics(anychart.enums.Statistics.SERIES_MAX, seriesMax);
  this.statistics(anychart.enums.Statistics.SERIES_MIN, seriesMin);
  this.statistics(anychart.enums.Statistics.SERIES_SUM, seriesSum);
  this.statistics(anychart.enums.Statistics.SERIES_AVERAGE, seriesAverage);
  this.statistics(anychart.enums.Statistics.SERIES_POINTS_COUNT, seriesPointsCount);
  this.statistics(anychart.enums.Statistics.SERIES_POINT_COUNT, seriesPointsCount);
};


//endregion
//region --- Interactivity
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

  return this;
};


/**
 * Applying zoom and move transformations to marker element.
 * @param {anychart.core.ui.LabelsFactory.Label} label .
 * @param {number} pointState .
 */
anychart.core.map.series.Base.prototype.applyZoomMoveTransformToLabel = function(label, pointState) {
  var domElement, prevPos, newPos, trX, trY, selfTx;

  domElement = label.getDomElement();
  var iterator = this.getIterator();

  var position = this.getLabelsPosition(pointState);
  var positionProvider = this.createPositionProvider(position);

  var labelRotation = label.getFinalSettings('rotation');

  var labelAnchor = label.getFinalSettings('anchor');
  if (!goog.isDef(labelAnchor) || goog.isNull(labelAnchor)) {
    labelAnchor = iterator.meta('labelAnchor');
  }

  if (goog.isDef(labelRotation))
    domElement.rotateByAnchor(-labelRotation, /** @type {anychart.enums.Anchor} */(labelAnchor));

  prevPos = label.positionProvider()['value'];
  newPos = positionProvider['value'];

  selfTx = domElement.getSelfTransformation();

  trX = -selfTx.getTranslateX() + newPos['x'] - prevPos['x'];
  trY = -selfTx.getTranslateY() + newPos['y'] - prevPos['y'];

  domElement.translate(trX, trY);


  var connectorElement = label.getConnectorElement();
  if (connectorElement && iterator.meta('positionMode') != anychart.enums.MapPointOutsidePositionMode.OFFSET) {
    var scale, dx, dy;
    var prevTx = this.map.mapTx;
    var tx = this.map.getMapLayer().getFullTransformation().clone();

    if (prevTx) {
      tx.concatenate(prevTx.createInverse());
    }

    scale = tx.getScaleX();
    dx = tx.getTranslateX();
    dy = tx.getTranslateY();

    tx = new goog.math.AffineTransform(scale, 0, 0, scale, dx, dy);
    tx.preConcatenate(domElement.getSelfTransformation().createInverse());

    scale = tx.getScaleX();
    if (!anychart.math.roughlyEqual(scale, 1, 0.000001)) {
      dx = tx.getTranslateX();
      dy = tx.getTranslateY();
    } else {
      dx = 0;
      dy = 0;
    }
    connectorElement.setTransformationMatrix(scale, 0, 0, scale, dx, dy);
  }


  if (goog.isDef(labelRotation))
    domElement.rotateByAnchor(/** @type {number}*/(labelRotation), /** @type {anychart.enums.Anchor} */(labelAnchor));
};


/**
 * Applying zoom and move transformations to series elements for improve performans.
 */
anychart.core.map.series.Base.prototype.applyZoomMoveTransform = function() {
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
      this.applyZoomMoveTransformToLabel(label, pointState);
    }
  }
};


//endregion
//region --- Drawing
/**
 * Calculation before draw.
 */
anychart.core.map.series.Base.prototype.calculate = function() {
  if (this.hasInvalidationState(anychart.ConsistencyState.MAP_GEO_DATA_INDEX)) {
    var iterator = this.getResetIterator();
    var index = this.map.getIndexedGeoData()[this.geoIdField()];
    while (iterator.advance()) {
      var name = iterator.get('id');
      if (!name || !(goog.isString(name) || goog.isArray(name)))
        continue;
      name = goog.isArray(name) ? name : [name];

      iterator.meta('features', undefined);
      var features = [];
      for (var j = 0, len_ = name.length; j < len_; j++) {
        var id = name[j];
        var point = index[id];
        if (point) {
          features.push(point);
        }
      }
      iterator.meta('features', features);
    }
    this.markConsistent(anychart.ConsistencyState.MAP_GEO_DATA_INDEX);
  }
};


/**
 * Draws series into the current container.
 * @return {anychart.core.map.series.Base} An instance of {@link anychart.core.map.series.Base} class for method chaining.
 */
anychart.core.map.series.Base.prototype.draw = function() {
  if (!this.checkDrawingNeeded())
    return this;

  this.calculate();

  this.suspendSignalsDispatching();

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
      this.rootLayer = /** @type {acgraph.vector.ILayer} */ (this.container());
    }
  }

  this.checkDrawingNeeded();

  this.labels().suspendSignalsDispatching();
  this.hoverLabels().suspendSignalsDispatching();
  this.selectLabels().suspendSignalsDispatching();

  this.labels().clear();

  this.labels().parentBounds(/** @type {anychart.math.Rect} */(this.container().getBounds()));

  this.drawA11y();
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
  this.labels().container(/** @type {acgraph.vector.ILayer} */(this.rootLayer));
  this.labels().draw();

  this.labels().resumeSignalsDispatching(false);
  this.hoverLabels().resumeSignalsDispatching(false);
  this.selectLabels().resumeSignalsDispatching(false);

  this.labels().markConsistent(anychart.ConsistencyState.ALL);
  this.hoverLabels().markConsistent(anychart.ConsistencyState.ALL);
  this.selectLabels().markConsistent(anychart.ConsistencyState.ALL);
};


//endregion
//region --- Legend
/** @inheritDoc */
anychart.core.map.series.Base.prototype.getLegendItemData = function(itemsTextFormatter) {
  var legendItem = this.legendItem();
  legendItem.markAllConsistent();
  var json = legendItem.serialize();
  var iconFill, iconStroke, iconHatchFill;
  var ctx = {
    'sourceColor': this.color()
  };
  if (goog.isFunction(legendItem.iconFill())) {
    json['iconFill'] = legendItem.iconFill().call(ctx, ctx);
  }
  if (goog.isFunction(legendItem.iconStroke())) {
    json['iconStroke'] = legendItem.iconStroke().call(ctx, ctx);
  }
  if (goog.isFunction(legendItem.iconHatchFill())) {
    ctx['sourceColor'] = this.autoHatchFill;
    json['iconHatchFill'] = legendItem.iconHatchFill().call(ctx, ctx);
  }
  var itemText;
  if (goog.isFunction(itemsTextFormatter)) {
    var format = this.createLegendContextProvider();
    itemText = itemsTextFormatter.call(format, format);
  }
  if (!goog.isString(itemText))
    itemText = goog.isDef(this.name()) ? this.name() : 'Series: ' + this.index();

  this.updateLegendItemMarker(json);

  json['iconType'] = this.getLegendIconType(json['iconType']);

  var ret = {
    'text': /** @type {string} */ (itemText),
    'iconEnabled': true,
    'iconStroke': void 0,
    'iconFill': /** @type {acgraph.vector.Fill} */ (this.color()),
    'iconHatchFill': void 0,
    'disabled': !this.enabled()
  };
  goog.object.extend(ret, json);
  return ret;
};


//endregion
//region --- Position and Formating
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


/** @inheritDoc */
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

  var features = iterator.meta('features');
  var feature = features && features.length ? features[0] : null;
  var pointGeoProp = /** @type {Object}*/(feature ? feature['properties'] : null);

  var midX = iterator.get('middle-x');
  var midY = iterator.get('middle-y');
  var middleX = /** @type {number} */(goog.isDef(midX) ? midX : pointGeoProp && goog.isDef(pointGeoProp['middle-x']) ? pointGeoProp['middle-x'] : .5);
  var middleY = /** @type {number} */(goog.isDef(midY) ? midY : pointGeoProp && goog.isDef(pointGeoProp['middle-y']) ? pointGeoProp['middle-y'] : .5);

  var shape = feature ? feature.domElement : null;
  var positionProvider;
  if (shape) {
    var bounds = shape.getAbsoluteBounds();
    positionProvider = {'value': {'x': bounds.left + bounds.width * middleX, 'y': bounds.top + bounds.height * middleY}};
  } else {
    positionProvider = {'value': {'x': 0, 'y': 0}};
  }
  return positionProvider;
};


//endregion
//region --- Base methods
/**
 * Gets an array of reference 'y' fields from the row iterator points to.
 * Reference fields are defined using referenceValueNames and referenceValueMeanings.
 * If there is only one field - a value is returned.
 * If there are several - array.
 * If any of the two is undefined - returns null.
 *
 * @return {?Array.<*>} Fetches significant scale values from current data row.
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


/** @inheritDoc */
anychart.core.map.series.Base.prototype.remove = function() {
  if (this.rootLayer && this.needSelfLayer)
    this.rootLayer.remove();

  this.labels().container(null);
  this.labels().draw();

  anychart.core.map.series.Base.base(this, 'remove');
};


/** @inheritDoc */
anychart.core.map.series.Base.prototype.getEnableChangeSignals = function() {
  return anychart.core.map.series.Base.base(this, 'getEnableChangeSignals') | anychart.Signal.DATA_CHANGED |
      anychart.Signal.NEEDS_RECALCULATION | anychart.Signal.NEED_UPDATE_LEGEND;
};


/**
 * Returns series point by id.
 * @param {string} value Point id.
 * @return {anychart.core.Point} Wrapped point.
 */
anychart.core.map.series.Base.prototype.getPointById = function(value) {
  var index = goog.array.indexOf(this.seriesPoints, value);
  return index != -1 ? this.getPoint(index) : null;
};


//endregion
//region --- Setup
/** @inheritDoc */
anychart.core.map.series.Base.prototype.serialize = function() {
  var json = anychart.core.map.series.Base.base(this, 'serialize');

  json['seriesType'] = this.getType();
  json['overlapMode'] = this.overlapMode_;

  if (goog.isDef(this.geoIdField_))
    json['geoIdField'] = this.geoIdField_;

  return json;
};


/** @inheritDoc */
anychart.core.map.series.Base.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.map.series.Base.base(this, 'setupByJSON', config, opt_default);

  this.overlapMode(config['overlapMode']);
  this.geoIdField(config['geoIdField']);
};


//endregion
//region --- Exports
//exports
(function() {
  var proto = anychart.core.map.series.Base.prototype;
  proto['color'] = proto.color;

  proto['selectFill'] = proto.selectFill;
  proto['hoverFill'] = proto.hoverFill;
  proto['fill'] = proto.fill;

  proto['selectStroke'] = proto.selectStroke;
  proto['hoverStroke'] = proto.hoverStroke;
  proto['stroke'] = proto.stroke;

  proto['selectHatchFill'] = proto.selectHatchFill;
  proto['hoverHatchFill'] = proto.hoverHatchFill;
  proto['hatchFill'] = proto.hatchFill;

  proto['geoIdField'] = proto.geoIdField;
  proto['overlapMode'] = proto.overlapMode;
  proto['transformXY'] = proto.transformXY;
})();
//endregion
