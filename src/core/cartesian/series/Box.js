goog.provide('anychart.core.cartesian.series.Box');
goog.require('anychart.core.cartesian.series.WidthBased');
goog.require('anychart.math');
goog.require('anychart.utils');



/**
 * Series for box/whisker chart.
 * @param {(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @constructor
 * @extends {anychart.core.cartesian.series.WidthBased}
 */
anychart.core.cartesian.series.Box = function(opt_data, opt_csvSettings) {
  goog.base(this, opt_data, opt_csvSettings);

  this.outlierMarkers().listen(acgraph.events.EventType.MOUSEOVER, this.handleOutlierMarkerMouseOver_, false, this);
  this.outlierMarkers().listen(acgraph.events.EventType.MOUSEOUT, this.handleOutlierMarkerMouseOut_, false, this);
  this.outlierMarkers().listen(acgraph.events.EventType.CLICK, this.handleOutlierMarkerBrowserEvents_, false, this);
  this.outlierMarkers().listen(acgraph.events.EventType.DBLCLICK, this.handleOutlierMarkerBrowserEvents_, false, this);
  this.outlierMarkers().anchor(anychart.enums.Position.CENTER);

  // Define reference fields for a series
  this.referenceValueNames = ['x', 'lowest', 'q1', 'median', 'q3', 'highest', 'outliers'];
  this.referenceValueMeanings = ['x', 'y', 'y', 'y', 'y', 'y', 'a'];
  this.referenceValuesSupportStack = false;

  /**
   * Dictionary of outlier markers indexes by point index.
   * Need to identify what outliers belongs to point when hover/unhover it.
   * @type {Object.<number, !Array.<number>>}
   * @private
   */
  this.indexToMarkerIndexes_ = {};

  /**
   * Width setting for whisker.
   * @type {(number|string)}
   * @private
   */
  this.whiskerWidth_ = '20%';

  /**
   * Hover width setting for whisker.
   * @type {(number|string)}
   * @private
   */
  this.hoverWhiskerWidth_ = '20%';

  this.fill(function() {
    return anychart.color.lighten(anychart.color.lighten(this['sourceColor']));
  });

  /**
   * Median stroke setting.
   * @type {acgraph.vector.Stroke|Function}
   * @private
   */
  this.medianStroke_ = (function() {
    return this['sourceColor'];
  });

  /**
   * Hover median stroke setting.
   * @type {acgraph.vector.Stroke|Function}
   * @private
   */
  this.hoverMedianStroke_ = (function() {
    return anychart.color.darken(this['sourceColor']);
  });

  /**
   * Stem stroke setting.
   * @type {acgraph.vector.Stroke|Function}
   * @private
   */
  this.stemStroke_ = (function() {
    return this['sourceColor'];
  });

  /**
   * Hover stem stroke setting.
   * @type {acgraph.vector.Stroke|Function}
   * @private
   */
  this.hoverStemStroke_ = (function() {
    return anychart.color.darken(this['sourceColor']);
  });

  /**
   * Whisker stroke setting.
   * @type {acgraph.vector.Stroke|Function}
   * @private
   */
  this.whiskerStroke_ = (function() {
    return this['sourceColor'];
  });

  /**
   * Hover whisker stroke setting.
   * @type {acgraph.vector.Stroke|Function}
   * @private
   */
  this.hoverWhiskerStroke_ = (function() {
    return anychart.color.darken(this['sourceColor']);
  });
};
goog.inherits(anychart.core.cartesian.series.Box, anychart.core.cartesian.series.WidthBased);
anychart.core.cartesian.series.Base.SeriesTypesMap[anychart.enums.CartesianSeriesType.BOX] = anychart.core.cartesian.series.Box;


/** @inheritDoc */
anychart.core.cartesian.series.Box.prototype.rootTypedLayerInitializer = function() {
  return acgraph.path();
};


/** @inheritDoc */
anychart.core.cartesian.series.Box.prototype.getReferenceScaleValues = function() {
  if (!this.enabled()) return null;
  var res = [];
  var iterator = this.getIterator();
  var yScale = this.yScale();
  var val;
  for (var i = 0, len = this.referenceValueNames.length; i < len; i++) {
    var meaning = this.referenceValueMeanings[i];

    if (meaning == 'a') {
      val = iterator.get(this.referenceValueNames[i]);
      if (goog.isDefAndNotNull(val) && goog.isArray(val)) {
        for (var j = 0; j < val.length; j++) {
          if (!yScale.isMissing(val[j]))
            res.push(val[j]);
        }
      }
    }

    if (meaning != 'y') continue;
    val = iterator.get(this.referenceValueNames[i]);
    if (yScale.isMissing(val)) return null;
    res.push(val);
  }
  return res;
};


/** @inheritDoc */
anychart.core.cartesian.series.Box.prototype.getReferenceCoords = function() {
  if (!this.enabled()) return null;
  var res = [];
  var xScale = /** @type {anychart.scales.Base} */(this.xScale());
  var yScale = /** @type {anychart.scales.Base} */(this.yScale());
  var iterator = this.getIterator();
  var fail = false;

  for (var i = 0, len = this.referenceValueNames.length; i < len; i++) {
    var meaning = this.referenceValueMeanings[i];
    var val = iterator.get(this.referenceValueNames[i]);

    if (!goog.isDef(val) && meaning != 'a') {
      return null;
    }

    var pix;

    switch (meaning) {
      case 'a':
        var values = [];
        if (goog.isDefAndNotNull(val) && goog.isArray(val)) {
          for (var j = 0; j < val.length; j++) {
            if (!yScale.isMissing(val[j])) {
              pix = this.applyRatioToBounds(yScale.transform(val[j], 0.5), false);
              if (!isNaN(pix))
                values.push(pix);
            }
          }
        }
        res.push(values);
        break;
      case 'x':
        pix = xScale.isMissing(val) ? NaN : this.applyRatioToBounds(
            xScale.transform(val, /** @type {number} */(this.xPointPosition())),
            true);
        if (isNaN(pix)) fail = true;
        res.push(pix);
        break;
      case 'y':
        if (yScale.isMissing(val))
          val = NaN;
        pix = this.applyRatioToBounds(yScale.transform(val, 0.5), false);
        if (isNaN(pix)) fail = true;
        res.push(pix);
        break;
    }
  }
  return fail ? null : res;
};


/** @inheritDoc */
anychart.core.cartesian.series.Box.prototype.drawSubsequentPoint = function() {
  var referenceValues = this.getReferenceCoords();
  if (!referenceValues)
    return false;

  var iterator = this.getIterator();

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    var x = referenceValues[0];
    var low = referenceValues[1];
    var q1 = referenceValues[2];
    var median = referenceValues[3];
    var q3 = referenceValues[4];
    var high = referenceValues[5];
    var outliers = referenceValues[6];

    /** @type {!acgraph.vector.Path} */
    var path = /** @type {!acgraph.vector.Path} */(this.rootElement.genNextChild());
    var medianPath = /** @type {!acgraph.vector.Path} */(this.rootElement.genNextChild());
    var stemPath = /** @type {!acgraph.vector.Path} */(this.rootElement.genNextChild());
    var whiskerPath = /** @type {!acgraph.vector.Path} */(this.rootElement.genNextChild());

    iterator
      .meta('x', x)
      .meta('low', low)
      .meta('q1', q1)
      .meta('median', median)
      .meta('q3', q3)
      .meta('high', high)
      .meta('outliers', outliers)
      .meta('shape', path)
      .meta('medianPath', medianPath)
      .meta('stemPath', stemPath)
      .meta('whiskerPath', whiskerPath);

    var pointWidth = this.getPointWidth();

    this.drawBox_(path, x, q1, q3, pointWidth / 2);
    this.drawMedian_(medianPath, x, median, pointWidth / 2);
    this.drawStem_(stemPath, x, low, high, q1, q3);
    this.drawWhisker_(false);

    this.colorizeShape(false);

    this.makeHoverable(path);
    this.makeHoverable(medianPath);
    this.makeHoverable(stemPath);
    this.makeHoverable(whiskerPath);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.SERIES_MARKERS)) {
    this.drawOutlierMarkers_(false);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.SERIES_HATCH_FILL)) {
    var hatchFillShape = this.hatchFillRootElement ?
        /** @type {!acgraph.vector.Rect} */(this.hatchFillRootElement.genNextChild()) :
        null;
    iterator.meta('hatchFillShape', hatchFillShape);
    var shape = /** @type {acgraph.vector.Shape} */(iterator.meta('shape'));
    if (goog.isDef(shape) && hatchFillShape) {
      hatchFillShape.deserialize(shape.serialize());
    }
    this.applyHatchFill(false);
  }

  return true;
};


/**
 * Draws box.
 * @param {acgraph.vector.Path} path
 * @param {number} x
 * @param {number} q1
 * @param {number} q3
 * @param {number} halfPointWidth
 * @private
 */
anychart.core.cartesian.series.Box.prototype.drawBox_ = function(path, x, q1, q3, halfPointWidth) {
  path
    .clear()
    .moveTo(x - halfPointWidth, q1)
    .lineTo(x + halfPointWidth, q1)
    .lineTo(x + halfPointWidth, q3)
    .lineTo(x - halfPointWidth, q3)
    .close();
};


/**
 * Draws median.
 * @param {acgraph.vector.Path} path
 * @param {number} x
 * @param {number} median
 * @param {number} halfPointWidth
 * @private
 */
anychart.core.cartesian.series.Box.prototype.drawMedian_ = function(path, x, median, halfPointWidth) {
  path
    .clear()
    .moveTo(x - halfPointWidth, median)
    .lineTo(x + halfPointWidth, median);
};


/**
 * Draws stem.
 * @param {acgraph.vector.Path} path
 * @param {number} x
 * @param {number} low
 * @param {number} high
 * @param {number} q1
 * @param {number} q3
 * @private
 */
anychart.core.cartesian.series.Box.prototype.drawStem_ = function(path, x, low, high, q1, q3) {
  path
    .clear()
    .moveTo(x, low)
    .lineTo(x, q1)
    .moveTo(x, q3)
    .lineTo(x, high);
};


/**
 * Draws whisker.
 * @param {boolean} hover Whether whisker is hovered.
 * @private
 */
anychart.core.cartesian.series.Box.prototype.drawWhisker_ = function(hover) {
  var iterator = this.getIterator();
  var path = iterator.meta('whiskerPath');
  if (!goog.isDef(path))
    return;
  var x = /** @type {number} */ (iterator.meta('x'));
  var low = anychart.math.round(anychart.utils.toNumber(iterator.meta('low')), 0);
  var high = anychart.math.round(anychart.utils.toNumber(iterator.meta('high')), 0);
  var whiskerWidthValue = this.getWhiskerWidth(hover);

  if (isNaN(whiskerWidthValue) || isNaN(low) || isNaN(high))
    return;

  var shift = path.strokeThickness() % 2 / 2;

  path
    .clear()
    .moveTo(x - whiskerWidthValue, low + shift)
    .lineTo(x + whiskerWidthValue, low + shift)
    .moveTo(x - whiskerWidthValue, high - shift)
    .lineTo(x + whiskerWidthValue, high - shift);
};


/** @inheritDoc */
anychart.core.cartesian.series.Box.prototype.colorizeShape = function(hover) {
  var iterator = this.getIterator();

  var shape = /** @type {acgraph.vector.Path} */(iterator.meta('shape'));
  if (goog.isDef(shape)) {
    shape.stroke(this.getFinalStroke(true, hover));
    shape.fill(this.getFinalFill(true, hover));
  }

  var medianPath = /** @type {acgraph.vector.Path} */(iterator.meta('medianPath'));
  if (goog.isDef(medianPath)) {
    medianPath.stroke(this.getFinalMedianStroke_(hover));
    medianPath.fill('none');
  }

  var stemPath = /** @type {acgraph.vector.Path} */(iterator.meta('stemPath'));
  if (goog.isDef(stemPath)) {
    stemPath.stroke(this.getFinalStemStroke_(hover));
    stemPath.fill('none');
  }

  var whiskerPath = /** @type {acgraph.vector.Path} */(iterator.meta('whiskerPath'));
  if (goog.isDef(whiskerPath)) {
    whiskerPath.stroke(this.getFinalWhiskerStroke_(hover));
    whiskerPath.fill('none');
  }
};


/** @inheritDoc */
anychart.core.cartesian.series.Box.prototype.remove = function() {
  this.outlierMarkers().container(null);
  goog.base(this, 'remove');
};


/** @inheritDoc */
anychart.core.cartesian.series.Box.prototype.startDrawing = function() {
  this.indexToMarkerIndexes_ = {};
  goog.base(this, 'startDrawing');

  var outlierMarkers = this.outlierMarkers();
  var hoverOutlierMarkers = this.hoverOutlierMarkers();

  outlierMarkers.suspendSignalsDispatching();
  hoverOutlierMarkers.suspendSignalsDispatching();

  var fillColor = this.getOutlierMarkerFill();
  outlierMarkers.setAutoFill(fillColor);

  var strokeColor = /** @type {acgraph.vector.Stroke} */(this.getOutlierMarkerStroke());
  outlierMarkers.setAutoStroke(strokeColor);

  outlierMarkers.clear();
  outlierMarkers.container(/** @type {acgraph.vector.ILayer} */(this.container()));
  outlierMarkers.parentBounds(this.pixelBoundsCache);
};


/** @inheritDoc */
anychart.core.cartesian.series.Box.prototype.finalizeDrawing = function() {
  this.outlierMarkers().draw();

  if (this.clip()) {
    var bounds = /** @type {!anychart.math.Rect} */(goog.isBoolean(this.clip()) ? this.pixelBoundsCache : this.clip());
    var markerDOM = this.outlierMarkers().getDomElement();
    if (markerDOM) markerDOM.clip(/** @type {acgraph.math.Rect} */(bounds));
  }

  this.outlierMarkers().resumeSignalsDispatching(false);
  this.hoverOutlierMarkers().resumeSignalsDispatching(false);

  this.outlierMarkers().markConsistent(anychart.ConsistencyState.ALL);
  this.hoverOutlierMarkers().markConsistent(anychart.ConsistencyState.ALL);

  goog.base(this, 'finalizeDrawing');
};


/**
 * Find pointIndex by marker index.
 * @param {number} markerIndex
 * @return {number}
 * @private
 */
anychart.core.cartesian.series.Box.prototype.getPointIndexByMarkerIndex_ = function(markerIndex) {
  return +(goog.object.findKey(this.indexToMarkerIndexes_, function(val) {
    return goog.array.some(val, function(value) {
      return value == markerIndex;
    });
  }));
};


/**
 * @param {acgraph.events.Event} event .
 * @private
 */
anychart.core.cartesian.series.Box.prototype.handleOutlierMarkerMouseOver_ = function(event) {
  if (this.dispatchEvent(new anychart.core.cartesian.series.Base.BrowserEvent(this, event))) {
    if (event && goog.isDef(event['markerIndex'])) {
      var pointIndex = this.getPointIndexByMarkerIndex_(event['markerIndex']);
      this.hoverPoint(pointIndex, event);
      var markerElement = this.outlierMarkers().getMarker(event['markerIndex']).getDomElement();
      acgraph.events.listen(markerElement, acgraph.events.EventType.MOUSEMOVE, this.handleOutlierMarkerMouseMove_, false, this);
    } else
      this.unhover();
  }
};


/**
 * @param {acgraph.events.Event} event .
 * @private
 */
anychart.core.cartesian.series.Box.prototype.handleOutlierMarkerMouseMove_ = function(event) {
  if (event && goog.isDef(event.target['__tagIndex'])) {
    var pointIndex = this.getPointIndexByMarkerIndex_(event.target['__tagIndex']);
    this.hoverPoint(pointIndex, event);
  }
};


/**
 * @param {acgraph.events.Event} event .
 * @private
 */
anychart.core.cartesian.series.Box.prototype.handleOutlierMarkerMouseOut_ = function(event) {
  if (this.dispatchEvent(new anychart.core.cartesian.series.Base.BrowserEvent(this, event))) {
    var markerElement = this.outlierMarkers().getMarker(event['markerIndex']).getDomElement();
    acgraph.events.unlisten(markerElement, acgraph.events.EventType.MOUSEMOVE, this.handleOutlierMarkerMouseMove_, false, this);
    this.unhover();
  }
};


/**
 * @param {acgraph.events.Event} event .
 * @private
 */
anychart.core.cartesian.series.Box.prototype.handleOutlierMarkerBrowserEvents_ = function(event) {
  this.dispatchEvent(new anychart.core.cartesian.series.Base.BrowserEvent(this, event));
};


/** @inheritDoc */
anychart.core.cartesian.series.Box.prototype.createPositionProvider = function(position) {
  var iterator = this.getIterator();
  var shape = iterator.meta('shape');
  if (shape) {
    var shapeBounds = shape.getBounds();
    shapeBounds.top = iterator.meta('high');
    shapeBounds.height = Math.abs(/** @type {number} */ (iterator.meta('high')) - /** @type {number} */ (iterator.meta('low')));
    position = anychart.enums.normalizeAnchor(position);
    return {'value': anychart.utils.getCoordinateByAnchor(shapeBounds, position)};
  } else {
    return {'value': {'x': iterator.meta('x'), 'y': iterator.meta('high')}};
  }
};


/**
 * Draws outliers markers for the point.
 * @param {boolean} hovered If it is a hovered marker drawing.
 * @private
 */
anychart.core.cartesian.series.Box.prototype.drawOutlierMarkers_ = function(hovered) {
  var iterator = this.getIterator();
  var outliers = iterator.meta('outliers');
  var len = outliers.length;

  if (!goog.isDefAndNotNull(outliers) || !goog.isArray(outliers) || len == 0)
    return;

  for (var i = 0; i < len; i++) {
    var pointMarker = iterator.get('outlierMarker');
    var hoverPointMarker = iterator.get('hoverOutlierMarker');
    var index = iterator.getIndex();
    var markersFactory = /** @type {anychart.core.ui.MarkersFactory} */(hovered ? this.hoverOutlierMarkers() : this.outlierMarkers());

    if (!this.indexToMarkerIndexes_[index])
      this.indexToMarkerIndexes_[index] = [];

    var markerIndex = this.indexToMarkerIndexes_[index][i];

    var marker = this.outlierMarkers().getMarker(markerIndex);

    var markerEnabledState = pointMarker && goog.isDef(pointMarker['enabled']) ? pointMarker['enabled'] : null;
    var markerHoverEnabledState = hoverPointMarker && goog.isDef(hoverPointMarker['enabled']) ? hoverPointMarker['enabled'] : null;

    var isDraw = hovered ?
        goog.isNull(markerHoverEnabledState) ?
            goog.isNull(this.hoverOutlierMarkers().enabled()) ?
                goog.isNull(markerEnabledState) ?
                    this.outlierMarkers().enabled() :
                    markerEnabledState :
                this.hoverOutlierMarkers().enabled() :
            markerHoverEnabledState :
        goog.isNull(markerEnabledState) ?
            this.outlierMarkers().enabled() :
            markerEnabledState;

    if (isDraw) {
      var markerPosition = pointMarker && pointMarker['position'] ? pointMarker['position'] : null;
      var markerHoverPosition = hoverPointMarker && hoverPointMarker['position'] ? hoverPointMarker['position'] : null;
      var position = (hovered && (markerHoverPosition || this.hoverOutlierMarkers().position())) || markerPosition || this.outlierMarkers().position();

      var positionProvider = {'value': {'x': iterator.meta('x'), 'y': outliers[i]}};
      if (marker) {
        marker.positionProvider(positionProvider);
      } else {
        marker = this.outlierMarkers().add(positionProvider);
        this.indexToMarkerIndexes_[index][i] = marker.getIndex();
      }

      marker.resetSettings();
      marker.currentMarkersFactory(markersFactory);
      marker.setSettings(/** @type {Object} */(pointMarker), /** @type {Object} */(hoverPointMarker));
      marker.draw();
    } else if (marker) {
      marker.clear();
    }
  }
};


/**
 * @inheritDoc
 */
anychart.core.cartesian.series.Box.prototype.getType = function() {
  return anychart.enums.CartesianSeriesType.BOX;
};


/** @inheritDoc */
anychart.core.cartesian.series.Box.prototype.hasOutlierMarkers = function() {
  return true;
};


/** @inheritDoc */
anychart.core.cartesian.series.Box.prototype.isErrorAvailable = function() {
  return false;
};


/**
 * Setter/getter the median stroke setting
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line joint style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {anychart.core.cartesian.series.Box|acgraph.vector.Stroke|Function} .
 */
anychart.core.cartesian.series.Box.prototype.medianStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var stroke = goog.isFunction(opt_strokeOrFill) ?
        opt_strokeOrFill :
        acgraph.vector.normalizeStroke.apply(null, arguments);
    if (stroke != this.medianStroke_) {
      this.medianStroke_ = stroke;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.medianStroke_;
};


/**
 * Getter/setter for hover median stroke setting.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Hover stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line joint style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {anychart.core.cartesian.series.Box|acgraph.vector.Stroke|Function} .
 */
anychart.core.cartesian.series.Box.prototype.hoverMedianStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    this.hoverMedianStroke_ = goog.isFunction(opt_strokeOrFill) ?
        opt_strokeOrFill :
        acgraph.vector.normalizeStroke.apply(null, arguments);
    return this;
  }
  return this.hoverMedianStroke_;
};


/**
 * Method that gets final color of the median line, all fallbacks are taken into account.
 * @param {boolean} hover If the stroke should be a hover stroke.
 * @return {!acgraph.vector.Stroke} Final hover stroke for the current row.
 * @private
 */
anychart.core.cartesian.series.Box.prototype.getFinalMedianStroke_ = function(hover) {
  var iterator = this.getIterator();
  var normalColor = /** @type {acgraph.vector.Stroke|Function} */(
      iterator.get('medianStroke') ||
      this.medianStroke());
  return /** @type {!acgraph.vector.Stroke} */(hover ?
      this.normalizeColor(
      /** @type {acgraph.vector.Stroke|Function} */(
      iterator.get('hoverMedianStroke') ||
      this.hoverMedianStroke() ||
      normalColor),
      normalColor) :
      this.normalizeColor(normalColor));
};


/**
 * Setter/getter the median stroke setting
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line joint style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {anychart.core.cartesian.series.Box|acgraph.vector.Stroke|Function} .
 */
anychart.core.cartesian.series.Box.prototype.stemStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var stroke = goog.isFunction(opt_strokeOrFill) ?
        opt_strokeOrFill :
        acgraph.vector.normalizeStroke.apply(null, arguments);
    if (stroke != this.stemStroke_) {
      this.stemStroke_ = stroke;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.stemStroke_;
};


/**
 * Getter/setter for hover median stroke setting.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Hover stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line joint style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {anychart.core.cartesian.series.Box|acgraph.vector.Stroke|Function} .
 */
anychart.core.cartesian.series.Box.prototype.hoverStemStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    this.hoverStemStroke_ = goog.isFunction(opt_strokeOrFill) ?
        opt_strokeOrFill :
        acgraph.vector.normalizeStroke.apply(null, arguments);
    return this;
  }
  return this.hoverStemStroke_;
};


/**
 * Method that gets final color of the median line, all fallbacks are taken into account.
 * @param {boolean} hover If the stroke should be a hover stroke.
 * @return {!acgraph.vector.Stroke} Final hover stroke for the current row.
 * @private
 */
anychart.core.cartesian.series.Box.prototype.getFinalStemStroke_ = function(hover) {
  var iterator = this.getIterator();
  var normalColor = /** @type {acgraph.vector.Stroke|Function} */(
      iterator.get('stemStroke') ||
      this.stemStroke());
  return /** @type {!acgraph.vector.Stroke} */(hover ?
      this.normalizeColor(
      /** @type {acgraph.vector.Stroke|Function} */(
      iterator.get('hoverStemStroke') ||
      this.hoverStemStroke() ||
      normalColor),
      normalColor) :
      this.normalizeColor(normalColor));
};


/**
 * Setter/getter the median stroke setting
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line joint style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {anychart.core.cartesian.series.Box|acgraph.vector.Stroke|Function} .
 */
anychart.core.cartesian.series.Box.prototype.whiskerStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var stroke = goog.isFunction(opt_strokeOrFill) ?
        opt_strokeOrFill :
        acgraph.vector.normalizeStroke.apply(null, arguments);
    if (stroke != this.whiskerStroke_) {
      this.whiskerStroke_ = stroke;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.whiskerStroke_;
};


/**
 * Getter/setter for hover median stroke setting.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Hover stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line joint style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {anychart.core.cartesian.series.Box|acgraph.vector.Stroke|Function} .
 */
anychart.core.cartesian.series.Box.prototype.hoverWhiskerStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    this.hoverWhiskerStroke_ = goog.isFunction(opt_strokeOrFill) ?
        opt_strokeOrFill :
        acgraph.vector.normalizeStroke.apply(null, arguments);
    return this;
  }
  return this.hoverWhiskerStroke_;
};


/**
 * Method that gets final color of the median line, all fallbacks are taken into account.
 * @param {boolean} hover If the stroke should be a hover stroke.
 * @return {!acgraph.vector.Stroke} Final hover stroke for the current row.
 * @private
 */
anychart.core.cartesian.series.Box.prototype.getFinalWhiskerStroke_ = function(hover) {
  var iterator = this.getIterator();
  var normalColor = /** @type {acgraph.vector.Stroke|Function} */(
      iterator.get('whiskerStroke') ||
      this.whiskerStroke());
  return /** @type {!acgraph.vector.Stroke} */(hover ?
      this.normalizeColor(
          /** @type {acgraph.vector.Stroke|Function} */(
          iterator.get('hoverWhiskerStroke') ||
          this.hoverWhiskerStroke() ||
          normalColor),
          normalColor) :
      this.normalizeColor(normalColor));
};


/**
 * Getter/setter for whisker width settings.
 * @param {(number|string)=} opt_value Whisker width.
 * @return {(anychart.core.cartesian.series.Box|number|string)} Whisker width setting or self for chaining.
 */
anychart.core.cartesian.series.Box.prototype.whiskerWidth = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.whiskerWidth_ != opt_value) {
      this.whiskerWidth_ = opt_value;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.whiskerWidth_;
};


/**
 * Getter/setter for whisker width settings.
 * @param {(number|string)=} opt_value Whisker width.
 * @return {(anychart.core.cartesian.series.Box|number|string)} Whisker width setting or self for chaining.
 */
anychart.core.cartesian.series.Box.prototype.hoverWhiskerWidth = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.hoverWhiskerWidth_ != opt_value) {
      this.hoverWhiskerWidth_ = opt_value;
    }
    return this;
  }
  return this.hoverWhiskerWidth_;
};


/**
 * Get whisker width in px.
 * @param {boolean} hover
 * @return {number} Whisker width pixel value.
 */
anychart.core.cartesian.series.Box.prototype.getWhiskerWidth = function(hover) {
  var iterator = this.getIterator();
  var whiskerWidth = hover ? (iterator.get('hoverWhiskerWidth') || this.hoverWhiskerWidth()) :
      (iterator.get('whiskerWidth') || this.whiskerWidth());
  var pointWidth = this.getPointWidth();
  return anychart.utils.normalizeSize(/** @type {(number|string)} */ (whiskerWidth), pointWidth) / 2;
};


/**
 * Getter for series outlier markers.
 * @return {!anychart.core.ui.MarkersFactory} Markers instance.
 *//**
 * Setter for series outlier markers.<br/>
 * @param {(Object|boolean|null|string)=} opt_value Series outlier markers settings.
 * @return {!anychart.core.cartesian.series.Box} {@link anychart.core.cartesian.series.Box} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(Object|boolean|null|string)=} opt_value Series data markers settings.
 * @return {!(anychart.core.ui.MarkersFactory|anychart.core.cartesian.series.Box)} Markers instance or itself for chaining call.
 */
anychart.core.cartesian.series.Box.prototype.outlierMarkers = function(opt_value) {
  if (!this.outlierMarkers_) {
    this.outlierMarkers_ = new anychart.core.ui.MarkersFactory();
    this.registerDisposable(this.outlierMarkers_);
    this.outlierMarkers_.listenSignals(this.outlierMarkersInvalidated_, this);
  }

  if (goog.isDef(opt_value)) {
    this.outlierMarkers_.setup(opt_value);
    return this;
  }
  return this.outlierMarkers_;
};


/**
 * Getter for series outlier markers on hover.
 * @return {!anychart.core.ui.MarkersFactory} Markers instance.
 *//**
 * Setter for series data markers on hover.<br/>
 * @param {(Object|boolean|null|string)=} opt_value Series outlier hover markers settings.
 * @return {!anychart.core.cartesian.series.Box} {@link anychart.core.cartesian.series.Box} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(Object|boolean|null|string)=} opt_value Series outliers hover markers settings.
 * @return {!(anychart.core.ui.MarkersFactory|anychart.core.cartesian.series.Box)} Markers instance or itself for chaining call.
 */
anychart.core.cartesian.series.Box.prototype.hoverOutlierMarkers = function(opt_value) {
  if (!this.hoverOutlierMarkers_) {
    this.hoverOutlierMarkers_ = new anychart.core.ui.MarkersFactory();
    this.registerDisposable(this.hoverOutlierMarkers_);
  }

  if (goog.isDef(opt_value)) {
    this.hoverOutlierMarkers_.setup(opt_value);
    return this;
  }
  return this.hoverOutlierMarkers_;
};


/**
 * Listener for markers invalidation.
 * @param {anychart.SignalEvent} event Invalidation event.
 * @private
 */
anychart.core.cartesian.series.Box.prototype.outlierMarkersInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    this.invalidate(anychart.ConsistencyState.SERIES_MARKERS, anychart.Signal.NEEDS_REDRAW);
  }
};


/** @inheritDoc */
anychart.core.cartesian.series.Box.prototype.hoverPoint = function(index, event) {
  if (this.hoverStatus == index) {
    if (this.getIterator().select(index))
      this.showTooltip(event);
    return this;
  }
  this.unhover();
  if (this.getIterator().select(index)) {
    this.colorizeShape(true);
    this.applyHatchFill(true);
    this.drawMarker(true);
    this.drawOutlierMarkers_(true);
    this.drawLabel(true);
    this.drawWhisker_(true);
    this.showTooltip(event);
  }
  this.hoverStatus = index;
  return this;
};


/** @inheritDoc */
anychart.core.cartesian.series.Box.prototype.unhover = function() {
  if (isNaN(this.hoverStatus)) return this;
  if (this.getIterator().select(this.hoverStatus)) {
    var rect = /** @type {acgraph.vector.Rect} */(this.getIterator().meta('shape'));
    if (goog.isDef(rect)) {
      this.colorizeShape(false);
      this.applyHatchFill(false);
      this.drawMarker(false);
      this.drawOutlierMarkers_(false);
      this.drawLabel(false);
      this.drawWhisker_(false);
    }
    this.hideTooltip();
  }
  this.hoverStatus = NaN;
  return this;
};


/**
 * @inheritDoc
 */
anychart.core.cartesian.series.Box.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');
  if (goog.isFunction(this.medianStroke())) {
    anychart.utils.warning(
        anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
        null,
        ['Box Series  medianStroke']
    );
  } else {
    json['medianStroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke}*/(this.medianStroke()));
  }

  if (goog.isFunction(this.hoverMedianStroke())) {
    anychart.utils.warning(
        anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
        null,
        ['Box Series  hoverMedianStroke']
    );
  } else {
    json['hoverMedianStroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke}*/(this.hoverMedianStroke()));
  }

  if (goog.isFunction(this.stemStroke())) {
    anychart.utils.warning(
        anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
        null,
        ['Box Series  stemStroke']
    );
  } else {
    json['stemStroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke}*/(this.stemStroke()));
  }

  if (goog.isFunction(this.hoverStemStroke())) {
    anychart.utils.warning(
        anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
        null,
        ['Box Series  hoverStemStroke']
    );
  } else {
    json['hoverStemStroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke}*/(this.hoverStemStroke()));
  }

  if (goog.isFunction(this.whiskerStroke())) {
    anychart.utils.warning(
        anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
        null,
        ['Box Series  whiskerStroke']
    );
  } else {
    json['whiskerStroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke}*/(this.whiskerStroke()));
  }

  if (goog.isFunction(this.hoverWhiskerStroke())) {
    anychart.utils.warning(
        anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
        null,
        ['Box Series  hoverWhiskerStroke']
    );
  } else {
    json['hoverWhiskerStroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke}*/(this.hoverWhiskerStroke()));
  }

  json['whiskerWidth'] = this.whiskerWidth_ || null;
  json['hoverWhiskerWidth'] = this.hoverWhiskerWidth_ || null;

  json['outlierMarkers'] = this.outlierMarkers().serialize();
  json['hoverOutlierMarkers'] = this.hoverOutlierMarkers().serialize();

  return json;
};


/**
 * @inheritDoc
 */
anychart.core.cartesian.series.Box.prototype.setupByJSON = function(config) {
  goog.base(this, 'setupByJSON', config);
  this.medianStroke(config['medianStroke']);
  this.hoverMedianStroke(config['hoverMedianStroke']);
  this.stemStroke(config['stemStroke']);
  this.hoverStemStroke(config['hoverStemStroke']);
  this.whiskerStroke(config['whiskerStroke']);
  this.hoverWhiskerStroke(config['hoverWhiskerStroke']);
  this.whiskerWidth(config['whiskerWidth']);
  this.hoverWhiskerWidth(config['hoverWhiskerWidth']);
  this.outlierMarkers(config['outlierMarkers']);
  this.hoverOutlierMarkers(config['hoverOutlierMarkers']);
};


/**
 * Return outlier marker color for series.
 * @return {!acgraph.vector.Fill} Marker color for series.
 */
anychart.core.cartesian.series.Box.prototype.getOutlierMarkerFill = function() {
  return this.getFinalFill(false, false);
};


/**
 * Return outlier marker color for series.
 * @return {(string|acgraph.vector.Fill|acgraph.vector.Stroke)} Marker color for series.
 */
anychart.core.cartesian.series.Box.prototype.getOutlierMarkerStroke = function() {
  return anychart.color.darken(this.outlierMarkers().fill());
};


/** @inheritDoc */
anychart.core.cartesian.series.Box.prototype.restoreDefaults = function() {
  var result = goog.base(this, 'restoreDefaults');

  var tooltip = /** @type {anychart.core.ui.Tooltip} */(this.tooltip());
  tooltip.content().hAlign('left');
  tooltip.contentFormatter(function() {
    return 'lowest: ' + parseFloat(this['lowest']).toFixed(2) + '\n' +
        'q1: ' + parseFloat(this['q1']).toFixed(2) + '\n' +
        'median: ' + parseFloat(this['median']).toFixed(2) + '\n' +
        'q3: ' + parseFloat(this['q3']).toFixed(2) + '\n' +
        'highest: ' + parseFloat(this['highest']).toFixed(2) + '\n';
  });

  var labels = /** @type {anychart.core.ui.LabelsFactory} */(this.labels());
  labels.textFormatter(function() {
    return this['x'];
  });

  this.markers(false);

  var outlierMarkers = /** @type {anychart.core.ui.MarkersFactory} */(this.outlierMarkers());
  outlierMarkers.suspendSignalsDispatching();
  outlierMarkers.enabled(true);
  outlierMarkers.size(4);
  outlierMarkers.resumeSignalsDispatching(false);

  var hoverOutlierMarkers = (/** @type {anychart.core.ui.MarkersFactory} */(this.hoverOutlierMarkers()));
  hoverOutlierMarkers.suspendSignalsDispatching();
  hoverOutlierMarkers.size(6);
  hoverOutlierMarkers.resumeSignalsDispatching(false);

  return result;
};

//exports
anychart.core.cartesian.series.Box.prototype['fill'] = anychart.core.cartesian.series.Box.prototype.fill;//inherited
anychart.core.cartesian.series.Box.prototype['stroke'] = anychart.core.cartesian.series.Box.prototype.stroke;//inherited
anychart.core.cartesian.series.Box.prototype['hoverFill'] = anychart.core.cartesian.series.Box.prototype.hoverFill;//inherited
anychart.core.cartesian.series.Box.prototype['hoverStroke'] = anychart.core.cartesian.series.Box.prototype.hoverStroke;//inherited
anychart.core.cartesian.series.Box.prototype['hatchFill'] = anychart.core.cartesian.series.Box.prototype.hatchFill;//inherited
anychart.core.cartesian.series.Box.prototype['hoverHatchFill'] = anychart.core.cartesian.series.Box.prototype.hoverHatchFill;//inherited

anychart.core.cartesian.series.Box.prototype['medianStroke'] = anychart.core.cartesian.series.Box.prototype.medianStroke;
anychart.core.cartesian.series.Box.prototype['hoverMedianStroke'] = anychart.core.cartesian.series.Box.prototype.hoverMedianStroke;

anychart.core.cartesian.series.Box.prototype['stemStroke'] = anychart.core.cartesian.series.Box.prototype.stemStroke;
anychart.core.cartesian.series.Box.prototype['hoverStemStroke'] = anychart.core.cartesian.series.Box.prototype.hoverStemStroke;

anychart.core.cartesian.series.Box.prototype['whiskerStroke'] = anychart.core.cartesian.series.Box.prototype.whiskerStroke;
anychart.core.cartesian.series.Box.prototype['hoverWhiskerStroke'] = anychart.core.cartesian.series.Box.prototype.hoverWhiskerStroke;

anychart.core.cartesian.series.Box.prototype['whiskerWidth'] = anychart.core.cartesian.series.Box.prototype.whiskerWidth;
anychart.core.cartesian.series.Box.prototype['hoverWhiskerWidth'] = anychart.core.cartesian.series.Box.prototype.hoverWhiskerWidth;

anychart.core.cartesian.series.Box.prototype['outlierMarkers'] = anychart.core.cartesian.series.Box.prototype.outlierMarkers;
anychart.core.cartesian.series.Box.prototype['hoverOutlierMarkers'] = anychart.core.cartesian.series.Box.prototype.hoverOutlierMarkers;
