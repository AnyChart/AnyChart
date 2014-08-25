goog.provide('anychart.cartesian.series.Marker');
goog.require('acgraph');
goog.require('anychart.cartesian.series.Base');
goog.require('anychart.elements.MarkersFactory');
goog.require('anychart.enums');



/**
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @constructor
 * @extends {anychart.cartesian.series.Base}
 */
anychart.cartesian.series.Marker = function(data, opt_csvSettings) {
  goog.base(this, data, opt_csvSettings);
  /**
   * @type {anychart.elements.MarkersFactory}
   * @private
   */
  this.marker_ = new anychart.elements.MarkersFactory();
  this.marker_.listen(acgraph.events.EventType.MOUSEOVER, this.handleMouseOver_, false, this);
  this.marker_.listen(acgraph.events.EventType.MOUSEOUT, this.handleMouseOut_, false, this);
  this.marker_.enabled(true);
  this.registerDisposable(this.marker_);

  this.hoverMarker_ = new anychart.elements.MarkersFactory();
  this.registerDisposable(this.marker_);

  /**
   * @type {(string|anychart.enums.MarkerType|function(acgraph.vector.Path, number, number, number):acgraph.vector.Path)}
   * @private
   */
  this.type_;

  /**
   * @type {number}
   * @private
   */
  this.size_ = 10;

  /**
   * @type {(string|anychart.enums.MarkerType|function(acgraph.vector.Path, number, number, number):acgraph.vector.Path)}
   * @private
   */
  this.hoverType_;

  /**
   * @type {number}
   * @private
   */
  this.hoverSize_ = 12;

  // Define reference points for a series
  this.referenceValueNames = ['x', 'value'];
  this.referenceValueMeanings = ['x', 'y'];
  this.referenceValuesSupportStack = true;
};
goog.inherits(anychart.cartesian.series.Marker, anychart.cartesian.series.Base);
anychart.cartesian.series.seriesTypesMap[anychart.cartesian.series.Type.MARKER] = anychart.cartesian.series.Marker;


/**
 * Getter for current marker type settings.
 * @return {string|anychart.enums.MarkerType|function(acgraph.vector.Path, number, number, number):acgraph.vector.Path}
 *  Markers type settings.
 *//**
 * Setter for marker type settings.
 * @example <c>By Enum value.</c>
 * chart = anychart.cartesian.chart();
 * var markerSeries = chart.marker([10, 11, 17, 7, 21]);
 * markerSeries
 *    .type('star4')
 *    .hoverType('star6');
 * @example <c>By custom function.</c>
 * chart = anychart.cartesian.chart();
 * var markerSeries = chart.marker([10, 11, 17, 7, 21]);
 * markerSeries
 *    .type(function(path, x, y, size) {
 *      var point1 = {x: x + 1.2 * size, y: y - 0.4 * size};
 *      var point2 = {x: x - 0.5*size, y: y -0.5*size};
 *      path.moveTo(point1.x, point1.y)
 *          .arcToByEndPoint(point2.x, point2.y, size, size, true, true)
 *          .arcToByEndPoint(point1.x, point1.y, size / 3, size / 3, false, false)
 *          .moveTo(point1.x, point1.y)
 *          .close();
 *      return path;
 *    });
 * @param {(string|anychart.enums.MarkerType|
 *  function(acgraph.vector.Path, number, number, number):acgraph.vector.Path)=} opt_value
 *  [{@link anychart.enums.MarkerType}.STAR5] Type or custom drawer. Function for a custom
 *  marker should look like this: <code>function(path, x, y, size){
 *    // path - acgraph.vector.Path
 *    // x, y - marker position
 *    // size - marker size
 *    ... //do something
 *    return path;
 *  }</code>.
 * @return {!anychart.cartesian.series.Marker} {@link anychart.cartesian.series.Marker} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(string|anychart.enums.MarkerType|
 *          function(acgraph.vector.Path, number, number, number):acgraph.vector.Path)=} opt_value .
 * @return {!anychart.cartesian.series.Marker|anychart.enums.MarkerType|string|
 *          function(acgraph.vector.Path, number, number, number):acgraph.vector.Path} .
 */
anychart.cartesian.series.Marker.prototype.type = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.type_ != opt_value) {
      this.type_ = opt_value;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.type_;
  }
};


/**
 * Getter for current hovered marker type settings.
 * @return {string|anychart.enums.MarkerType|function(acgraph.vector.Path, number, number, number):acgraph.vector.Path}
 *  Markers type settings.
 *//**
 * Setter for hovered marker type settings.
 * @example <c>By Enum value.</c>
 * chart = anychart.cartesian.chart();
 * var markerSeries = chart.marker([10, 11, 17, 7, 21]);
 * markerSeries
 *    .type('star4')
 *    .hoverType('star6');
 * @example <c>By custom function.</c>
 * chart = anychart.cartesian.chart();
 * var markerSeries = chart.marker([10, 11, 17, 7, 21]);
 * markerSeries
 *    .size(20)
 *    .hoverSize(20)
 *    .hoverType(function(path, x, y, size) {
 *      var point1 = {x: x + 1.2 * size, y: y - 0.4 * size};
 *      var point2 = {x: x - 0.5*size, y: y -0.5*size};
 *      path.moveTo(point1.x, point1.y)
 *          .arcToByEndPoint(point2.x, point2.y, size, size, true, true)
 *          .arcToByEndPoint(point1.x, point1.y, size / 3, size / 3, false, false)
 *          .moveTo(point1.x, point1.y)
 *          .close();
 *      return path;
 *    });
 * @param {(string|anychart.enums.MarkerType|
 *  function(acgraph.vector.Path, number, number, number):acgraph.vector.Path)=} opt_value
 *  [{@link anychart.enums.MarkerType}.STAR5] Type or custom drawer. Function for a custom
 *  marker should look like this: <code>function(path, x, y, size){
 *    // path - acgraph.vector.Path
 *    // x, y - marker position
 *    // size - marker size
 *    ... //do something
 *    return path;
 *  }</code>.
 * @return {!anychart.cartesian.series.Marker} {@link anychart.cartesian.series.Marker} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(string|anychart.enums.MarkerType|
 *          function(acgraph.vector.Path, number, number, number):acgraph.vector.Path)=} opt_value .
 * @return {!anychart.cartesian.series.Marker|anychart.enums.MarkerType|string|
 *          function(acgraph.vector.Path, number, number, number):acgraph.vector.Path} .
 */
anychart.cartesian.series.Marker.prototype.hoverType = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.hoverType_ != opt_value) {
      this.hoverType_ = opt_value;
    }
    return this;
  } else {
    return this.hoverType_;
  }
};


/**
 * Getter for marker size
 * @return {number} Current marker size.
 *//**
 * Setter for marker size.
 * @example
 * chart = anychart.cartesian.chart();
 * var markerSeries = chart.marker([10, 11, 17, 7, 21]);
 * markerSeries
 *     .size(14);
 * @param {number=} opt_value [10] Value to set.
 * @return {anychart.cartesian.series.Marker} {@link anychart.cartesian.series.Marker} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {number=} opt_value .
 * @return {anychart.cartesian.series.Marker|number} .
 */
anychart.cartesian.series.Marker.prototype.size = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.size_ != opt_value) {
      this.size_ = opt_value;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.size_;
  }
};


/**
 * Getter for hovered marker size
 * @return {number} Current hovered marker size.
 *//**
 * Setter for hovered marker size.
 * @example
 * chart = anychart.cartesian.chart();
 * var markerSeries = chart.marker([10, 11, 17, 7, 21]);
 * markerSeries
 *     .size(10)
 *     .hoverSize(20);
 * @param {number=} opt_value [12] Value to set.
 * @return {anychart.cartesian.series.Marker} {@link anychart.cartesian.series.Marker} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {number=} opt_value .
 * @return {anychart.cartesian.series.Marker|number} .
 */
anychart.cartesian.series.Marker.prototype.hoverSize = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.hoverSize_ != opt_value) {
      this.hoverSize_ = opt_value;
    }
    return this;
  } else {
    return this.hoverSize_;
  }
};


/** @inheritDoc */
anychart.cartesian.series.Marker.prototype.drawSubsequentPoint = function() {
  var referenceValues = this.getReferenceCoords();
  if (!referenceValues)
    return false;

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    var x = referenceValues[0];
    var y = referenceValues[1];

    this.getIterator().meta('x', x).meta('y', y);

    this.drawMarker_(false);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.HATCH_FILL)) {
    this.applyHatchFill(false);
  }
  return true;
};


/** @inheritDoc */
anychart.cartesian.series.Marker.prototype.remove = function() {
  this.marker_.suspendSignalsDispatching();
  this.marker_.container(null);
  this.marker_.clear();
  this.invalidate(anychart.ConsistencyState.CONTAINER);
  this.marker_.resumeSignalsDispatching(false);
};


/** @inheritDoc */
anychart.cartesian.series.Marker.prototype.createPositionProvider = function(position) {
  var iterator = this.getIterator();
  return {'value': {'x': iterator.meta('x'), 'y': iterator.meta('y')}};
};


/** @inheritDoc */
anychart.cartesian.series.Marker.prototype.startDrawing = function() {
  goog.base(this, 'startDrawing');
  this.marker_.suspendSignalsDispatching();
  this.marker_.clear();

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    this.marker_.zIndex(/** @type {number} */(this.zIndex()));
    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    this.marker_.fill(this.getFinalFill(false, false));
    this.marker_.stroke(this.getFinalStroke(false, false));
    this.marker_.type(/** @type {anychart.enums.MarkerType} */(this.type_));
    this.marker_.size(this.size_);

    this.hoverMarker_.fill(this.getFinalFill(false, true));
    this.hoverMarker_.stroke(this.getFinalStroke(false, true));
    this.hoverMarker_.type(/** @type {anychart.enums.MarkerType} */(this.hoverType_));
    this.hoverMarker_.size(this.hoverSize_);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    this.marker_.container(/** @type {acgraph.vector.ILayer} */(this.container()));
    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }


  if (this.hasInvalidationState(anychart.ConsistencyState.HATCH_FILL)) {
    var fill = this.getFinalHatchFill(false, false);
    if (!this.hatchFillElement_ && !anychart.utils.isNone(fill)) {
      this.hatchFillElement_ = new anychart.elements.MarkersFactory();
      this.hatchFillElement_.container(/** @type {acgraph.vector.ILayer} */(this.container()));
      this.hatchFillElement_.zIndex(/** @type {number} */(this.zIndex() + 1));
      this.hatchFillElement_.disablePointerEvents(true);
    }

    if (this.hatchFillElement_) {
      this.hatchFillElement_.suspendSignalsDispatching();
    }
  }
};


/** @inheritDoc */
anychart.cartesian.series.Marker.prototype.finalizeDrawing = function() {
  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    this.marker_.draw();
    this.marker_.resumeSignalsDispatching(false);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.HATCH_FILL)) {
    if (this.hatchFillElement_) {
      this.hatchFillElement_.draw();
      this.hatchFillElement_.resumeSignalsDispatching(false);
    }
  }
  goog.base(this, 'finalizeDrawing');
};


/**
 * @inheritDoc
 * @return {!anychart.cartesian.series.Marker} {@link anychart.cartesian.series.Marker} instance for method chaining.
 */
anychart.cartesian.series.Marker.prototype.hoverSeries = function() {
  this.unhover();
  return this;
};


/**
 * @inheritDoc
 * @return {!anychart.cartesian.series.Marker} {@link anychart.cartesian.series.Marker} instance for method chaining.
 */
anychart.cartesian.series.Marker.prototype.hoverPoint = function(index, event) {
  if (this.hoverStatus == index) {
    this.showTooltip(event);
    return this;
  }
  this.unhover();
  if (this.getResetIterator().select(index)) {
    this.drawMarker_(true, true);
    this.applyHatchFill(true);
    this.drawLabel(true);
    this.showTooltip(event);
  }
  this.hoverStatus = index;
  return this;
};


/**
 * @inheritDoc
 * @return {!anychart.cartesian.series.Marker} {@link anychart.cartesian.series.Marker} instance for method chaining.
 */
anychart.cartesian.series.Marker.prototype.unhover = function() {
  if (isNaN(this.hoverStatus)) return this;
  if (this.getResetIterator().select(this.hoverStatus)) {
    this.drawMarker_(false, true);
    this.applyHatchFill(false);
    this.drawLabel(false);
    this.hideTooltip();
  }
  this.hoverStatus = NaN;
  return this;
};


/**
 * Draws marker for the point.
 * @param {boolean} hovered If it is a hovered marker drawing.
 * @param {boolean=} opt_updateMarker Redraw marker.
 * @private
 */
anychart.cartesian.series.Marker.prototype.drawMarker_ = function(hovered, opt_updateMarker) {
  var pointType = this.getIterator().get('type');
  var pointSize = this.getIterator().get('markerSize');
  var pointFill = this.getIterator().get('fill');
  var pointStroke = this.getIterator().get('stroke');
  var pointHoverType = this.getIterator().get('hoverType');
  var pointHoverSize = this.getIterator().get('hoverMarkerSize');
  var pointHoverFill = this.getIterator().get('hoverFill');
  var pointHoverStroke = this.getIterator().get('hoverStroke');
  var markersFactory = /** @type {anychart.elements.MarkersFactory} */(hovered ? this.hoverMarker_ : this.marker_);

  var settings = {'type': pointType, 'size': pointSize, 'fill': pointFill, 'stroke': pointStroke};
  var settingsHover = {'type': pointHoverType, 'size': pointHoverSize, 'fill': pointHoverFill, 'stroke': pointHoverStroke};

  var index = this.getIterator().getIndex();

  var positionProvider = this.createPositionProvider(anychart.enums.Position.CENTER);

  var marker = this.marker_.add(positionProvider, index);
  marker.resetSettings();
  marker.currentMarkersFactory(markersFactory);
  marker.setSettings(settings, settingsHover);

  if (opt_updateMarker) marker.draw();
};


/**
 * Apply hatch fill to shape in accordance to current point colorization settings.
 * Shape is get from current meta 'hatchFillShape'.
 * @param {boolean} hovered If the point is hovered.
 * @protected
 */
anychart.cartesian.series.Marker.prototype.applyHatchFill = function(hovered) {
  var iterator = this.getIterator();
  var index = iterator.getIndex();

  if (this.hatchFillElement_) {
    var markersFactory = /** @type {anychart.elements.MarkersFactory} */(hovered ? this.hoverMarker_ : this.marker_);
    var hatchFill = this.hatchFillElement_.add(this.createPositionProvider(anychart.enums.Position.CENTER), index);

    hatchFill.resetSettings();
    hatchFill.parentMarkersFactory(markersFactory);

    var fill = this.getFinalHatchFill(true, hovered);

    hatchFill.fill(fill);
    hatchFill.stroke(null);

    hatchFill.draw();
  }
};


/**
 * @param {anychart.elements.MarkersFactory.BrowserEvent} event .
 * @private
 */
anychart.cartesian.series.Marker.prototype.handleMouseOver_ = function(event) {
  if (event && goog.isDef(event['markerIndex'])) {
    this.hoverPoint(event['markerIndex'], event);
    var markerElement = this.marker_.getMarker(event['markerIndex']).getDomElement();
    acgraph.events.listen(markerElement, acgraph.events.EventType.MOUSEMOVE, this.handleMouseMove_, false, this);
  } else
    this.unhover();
};


/**
 * @param {acgraph.events.Event} event .
 * @private
 */
anychart.cartesian.series.Marker.prototype.handleMouseOut_ = function(event) {
  var markerElement = this.marker_.getMarker(event['markerIndex']).getDomElement();
  acgraph.events.unlisten(markerElement, acgraph.events.EventType.MOUSEMOVE, this.handleMouseMove_, false, this);
  this.unhover();
};


/**
 * @param {acgraph.events.Event} event .
 * @private
 */
anychart.cartesian.series.Marker.prototype.handleMouseMove_ = function(event) {
  if (event && goog.isDef(event.target['__tagIndex']))
    this.hoverPoint(event.target['__tagIndex'], event);
};


/**
 * @inheritDoc
 */
anychart.cartesian.series.Marker.prototype.getType = function() {
  return anychart.cartesian.series.Type.MARKER;
};


/**
 * @inheritDoc
 */
anychart.cartesian.series.Marker.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');
  json['seriesType'] = this.getType();

  if (goog.isFunction(this.type())) {
    if (window.console) {
      window.console.log('Warning: We can not serialize type function, please reset it manually.');
    }
  } else {
    json['type'] = this.type();
  }

  if (goog.isFunction(this.hoverType())) {
    if (window.console) {
      window.console.log('Warning: We can not serialize hoverType function, please reset it manually.');
    }
  } else {
    json['hoverType'] = this.hoverType();
  }

  json['size'] = this.size();
  json['hoverSize'] = this.hoverSize();
  return json;
};


/** @inheritDoc */
anychart.cartesian.series.Marker.prototype.restoreDefaults = function() {
  var res = goog.base(this, 'restoreDefaults');

  var type = this.autoMarkerType || anychart.enums.MarkerType.STAR5;

  this.type_ = type;
  this.hoverType_ = type;

  var tooltip = /** @type {anychart.elements.Tooltip} */(this.tooltip());
  tooltip.contentFormatter(function() {
    return parseFloat(this.value).toFixed(2);
  });

  return res;
};


/**
 * @inheritDoc
 */
anychart.cartesian.series.Marker.prototype.deserialize = function(config) {
  this.suspendSignalsDispatching();
  goog.base(this, 'deserialize', config);
  this.size(config['size']);
  this.hoverSize(config['hoverSize']);
  this.type(config['type']);
  this.hoverType(config['hoverType']);
  this.resumeSignalsDispatching(true);
  return this;
};


/**
 * Constructor function.
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @return {!anychart.cartesian.series.Marker}
 */
anychart.cartesian.series.marker = function(data, opt_csvSettings) {
  return new anychart.cartesian.series.Marker(data, opt_csvSettings);
};


//exports
goog.exportSymbol('anychart.cartesian.series.marker', anychart.cartesian.series.marker);
anychart.cartesian.series.Marker.prototype['stroke'] = anychart.cartesian.series.Marker.prototype.stroke;//in docs/
anychart.cartesian.series.Marker.prototype['hoverStroke'] = anychart.cartesian.series.Marker.prototype.hoverStroke;//in docs/
anychart.cartesian.series.Marker.prototype['fill'] = anychart.cartesian.series.Marker.prototype.fill;//in docs/
anychart.cartesian.series.Marker.prototype['hoverFill'] = anychart.cartesian.series.Marker.prototype.hoverFill;//in docs/
anychart.cartesian.series.Marker.prototype['size'] = anychart.cartesian.series.Marker.prototype.size;//in docs/
anychart.cartesian.series.Marker.prototype['hoverSize'] = anychart.cartesian.series.Marker.prototype.hoverSize;//in docs/
anychart.cartesian.series.Marker.prototype['type'] = anychart.cartesian.series.Marker.prototype.type;//in docs/
anychart.cartesian.series.Marker.prototype['hoverType'] = anychart.cartesian.series.Marker.prototype.hoverType;//in docs/
anychart.cartesian.series.Marker.prototype['startDrawing'] = anychart.cartesian.series.Marker.prototype.startDrawing;//in docs/
anychart.cartesian.series.Marker.prototype['finalizeDrawing'] = anychart.cartesian.series.Marker.prototype.finalizeDrawing;//in docs/
anychart.cartesian.series.Marker.prototype['hoverSeries'] = anychart.cartesian.series.Marker.prototype.hoverSeries;//in docs/
anychart.cartesian.series.Marker.prototype['hoverPoint'] = anychart.cartesian.series.Marker.prototype.hoverPoint;//in docs/
anychart.cartesian.series.Marker.prototype['unhover'] = anychart.cartesian.series.Marker.prototype.unhover;//in docs/
anychart.cartesian.series.Marker.prototype['hatchFill'] = anychart.cartesian.series.Marker.prototype.hatchFill;
anychart.cartesian.series.Marker.prototype['hoverHatchFill'] = anychart.cartesian.series.Marker.prototype.hoverHatchFill;
