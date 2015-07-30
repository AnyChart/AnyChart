goog.provide('anychart.core.map.series.Choropleth');
goog.require('anychart.core.map.scale.LinearColor');
goog.require('anychart.core.map.series.BaseWithMarkers');



/**
 * Choropleth series. Read more about choropleth <a href='http://en.wikipedia.org/wiki/Choropleth_map'>here</a>.
 * @param {?(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Data to set.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings here as a hash map.
 * @constructor
 * @extends {anychart.core.map.series.BaseWithMarkers}
 */
anychart.core.map.series.Choropleth = function(opt_data, opt_csvSettings) {
  goog.base(this, opt_data, opt_csvSettings);

  // Define reference fields for a series
  this.referenceValueNames = ['id', 'value'];
  this.referenceValueMeanings = ['x', 'y'];
  this.needSelfLayer = false;

  /**
   * @type {Array}
   * @private
   */
  this.points_ = [];
};
goog.inherits(anychart.core.map.series.Choropleth, anychart.core.map.series.BaseWithMarkers);
anychart.core.map.series.Base.SeriesTypesMap[anychart.enums.MapSeriesType.CHOROPLETH] = anychart.core.map.series.Choropleth;


/** @inheritDoc */
anychart.core.map.series.Choropleth.prototype.getType = function() {
  return anychart.enums.MapSeriesType.CHOROPLETH;
};


/**
 * @type {anychart.core.utils.TypedLayer}
 * @protected
 */
anychart.core.map.series.Choropleth.prototype.hatchFillRootElement = null;


/**
 * Colorizes shape in accordance to current point colorization settings.
 * Shape is get from current meta 'shape'.
 * @param {anychart.enums.AnyMapPointState} pointState If the point is hovered or selected.
 * @protected
 */
anychart.core.map.series.Choropleth.prototype.colorizeShape = function(pointState) {
  var shape = /** @type {acgraph.vector.Shape} */(this.getIterator().meta('shape'));
  if (goog.isDef(shape)) {
    shape.visible(true);
    shape.stroke(this.getFinalStroke(true, pointState));
    shape.fill(this.getFinalFill(true, pointState));
  }
};


/**
 * Apply hatch fill to shape in accordance to current point colorization settings.
 * Shape is get from current meta 'hatchFillShape'.
 * @param {anychart.enums.AnyMapPointState} pointState If the point is hovered or selected.
 * @protected
 */
anychart.core.map.series.Choropleth.prototype.applyHatchFill = function(pointState) {
  var hatchFillShape = /** @type {acgraph.vector.Shape} */(this.getIterator().meta('hatchFillShape'));
  if (goog.isDefAndNotNull(hatchFillShape)) {
    hatchFillShape
        .stroke(null)
        .fill(this.getFinalHatchFill(true, pointState));
  }
};


/** @inheritDoc */
anychart.core.map.series.Choropleth.prototype.remove = function() {
  this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
  goog.base(this, 'remove');
};


/** @inheritDoc */
anychart.core.map.series.Choropleth.prototype.rootTypedLayerInitializer = function() {
  return acgraph.path();
};


/** @inheritDoc */
anychart.core.map.series.Choropleth.prototype.startDrawing = function() {
  goog.base(this, 'startDrawing');

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    this.points_.length = 0;
  }
};


/** @inheritDoc */
anychart.core.map.series.Choropleth.prototype.drawPoint = function(pointState) {
  var iterator = this.getIterator();
  var shape;

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    shape = /** @type {acgraph.vector.Shape} */(iterator.meta('shape'));
    if (goog.isDef(shape)) {
      this.colorizeShape(pointState);
      this.makeInteractive(/** @type {acgraph.vector.Element} */(iterator.meta('shape')), /** @type {Object} */(iterator.meta('properties')));
    }
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.SERIES_HATCH_FILL)) {
    var hatchFillShape = this.hatchFillRootElement ?
        /** @type {!acgraph.vector.Rect} */(this.hatchFillRootElement.genNextChild()) :
        null;
    iterator.meta('hatchFillShape', hatchFillShape);
    shape = /** @type {acgraph.vector.Shape} */(iterator.meta('shape'));
    if (goog.isDef(shape) && hatchFillShape) {
      hatchFillShape.deserialize(shape.serialize());
    }
    this.applyHatchFill(pointState);
  }

  goog.base(this, 'drawPoint', pointState);
};


/** @inheritDoc */
anychart.core.map.series.Choropleth.prototype.hoverSeries = function() {
  if (!this.enabled())
    return this;

  var iterator = this.getResetIterator();
  while (iterator.advance()) {
    var index = iterator.getIndex();
    var selected = goog.array.indexOf(this.selectStatus, index) != -1;
    var hovered = goog.array.indexOf(this.hoverStatus, index) != -1;
    if (!(selected || hovered)) {
      this.colorizeShape(anychart.enums.AnyMapPointState.HOVER);
      this.applyHatchFill(anychart.enums.AnyMapPointState.HOVER);
      this.drawMarker(anychart.enums.AnyMapPointState.HOVER);
      this.drawLabel(anychart.enums.AnyMapPointState.HOVER);
      this.hoverStatus.push(index);
    }
  }
  return this;
};


/** @inheritDoc */
anychart.core.map.series.Choropleth.prototype.hoverPoint = function(index, opt_event, opt_showTooltip) {
  if (!this.enabled())
    return this;

  var showTooltip = goog.isDef(opt_showTooltip) ? opt_showTooltip : true;
  var selected = goog.array.indexOf(this.selectStatus, index) != -1;
  var hovered = goog.array.indexOf(this.hoverStatus, index) != -1;
  if (hovered) {
    if (this.getIterator().select(index) && showTooltip)
      this.showTooltip(opt_event);
    return this;
  }
  if (!selected) {
    if (this.getIterator().select(index)) {
      this.colorizeShape(anychart.enums.AnyMapPointState.HOVER);
      this.applyHatchFill(anychart.enums.AnyMapPointState.HOVER);
      this.drawMarker(anychart.enums.AnyMapPointState.HOVER);
      this.drawLabel(anychart.enums.AnyMapPointState.HOVER);
      if (showTooltip) this.showTooltip(opt_event);
    }
  } else if (showTooltip) {
    this.showTooltip(opt_event);
  }
  this.hoverStatus.push(index);
  return this;
};


/** @inheritDoc */
anychart.core.map.series.Choropleth.prototype.selectPoint = function(index, opt_event, opt_showTooltip) {
  if (!this.enabled() || !this.getFinalAllowPointsSelect())
    return this;

  var iterator = this.getIterator();
  if (iterator.select(index)) {
    var showTooltip = goog.isDef(opt_showTooltip) ? opt_showTooltip : true;
    var selectedIndex = goog.array.indexOf(this.selectStatus, index);
    var selected = selectedIndex != -1;
    var hoveredIndex = goog.array.indexOf(this.hoverStatus, index);
    var hovered = hoveredIndex != -1;

    if (selected) {
      goog.array.splice(this.selectStatus, selectedIndex, 1);
      if (hovered) {
        goog.array.splice(this.hoverStatus, hoveredIndex, 1);
        this.hoverPoint(index, opt_event);
      } else {
        this.colorizeShape(anychart.enums.AnyMapPointState.NORMAL);
        this.drawLabel(anychart.enums.AnyMapPointState.NORMAL);
        this.drawMarker(anychart.enums.AnyMapPointState.NORMAL);
        this.applyHatchFill(anychart.enums.AnyMapPointState.NORMAL);
      }
    } else {
      this.colorizeShape(anychart.enums.AnyMapPointState.SELECT);
      this.drawLabel(anychart.enums.AnyMapPointState.SELECT);
      this.drawMarker(anychart.enums.AnyMapPointState.SELECT);
      this.applyHatchFill(anychart.enums.AnyMapPointState.SELECT);
      this.selectStatus.push(index);
    }

    if (showTooltip)
      this.showTooltip(opt_event);
  }
  return this;
};


/** @inheritDoc */
anychart.core.map.series.Choropleth.prototype.unselect = function(opt_event) {
  if (!this.enabled())
    return this;

  var event = opt_event;
  var iterator, index, i, len;
  if (goog.isDef(event)) {
    var evt = this.makePointEvent(/** @type {anychart.core.MouseEvent}*/ (opt_event));
    if (evt && ((anychart.utils.checkIfParent(this, event['relatedTarget'])) || this.dispatchEvent(evt))) {
      var series;
      if (event['target'] instanceof anychart.core.ui.MarkersFactory) {
        if (this.isMarkersInit() && this.markers() == event['target']) {
          series = this;
        }
      } else if (event['target'] instanceof anychart.core.ui.LabelsFactory) {
        series = event['target'].getParentEventTarget();
      } else {
        var tag = anychart.utils.extractTag(event['domTarget']);
        series = tag && tag.series;
      }

      var isCurrentSeries = series && !series.isDisposed() && series == this;
      iterator = this.getIterator();
      for (i = 0, len = this.selectStatus.length; i < len; i++) {
        index = this.selectStatus[i];
        if (!(isCurrentSeries && index == evt['pointIndex'])) {
          if (iterator.select(index)) {
            this.colorizeShape(anychart.enums.AnyMapPointState.NORMAL);
            this.drawLabel(anychart.enums.AnyMapPointState.NORMAL);
            this.drawMarker(anychart.enums.AnyMapPointState.NORMAL);
            this.applyHatchFill(anychart.enums.AnyMapPointState.NORMAL);
          }
        }
      }

      if (isCurrentSeries && goog.array.indexOf(this.selectStatus, evt['pointIndex']) != -1) {
        this.selectStatus.length = 0;
        this.selectStatus.push(evt['pointIndex']);
      } else {
        this.selectStatus.length = 0;
      }
    }
    this.dispatchEvent(this.makeSelectPointEvent(event));
  } else {
    iterator = this.getIterator();
    for (i = 0, len = this.selectStatus.length; i < len; i++) {
      index = this.selectStatus[i];
      if (iterator.select(index)) {
        this.colorizeShape(anychart.enums.AnyMapPointState.NORMAL);
        this.drawLabel(anychart.enums.AnyMapPointState.NORMAL);
        this.drawMarker(anychart.enums.AnyMapPointState.NORMAL);
        this.applyHatchFill(anychart.enums.AnyMapPointState.NORMAL);
      }
    }
    this.selectStatus.length = 0;
  }
  return this;
};


/** @inheritDoc */
anychart.core.map.series.Choropleth.prototype.unhover = function() {
  if (this.hoverStatus.length == 0 || !this.enabled())
    return this;

  for (var i = 0, len = this.hoverStatus.length; i < len; i++) {
    var hoveredIndex = this.hoverStatus[i];
    var selected = goog.array.indexOf(this.selectStatus, hoveredIndex) != -1;
    if (!selected) {
      if (this.getIterator().select(hoveredIndex)) {
        var shape = /** @type {acgraph.vector.Rect} */(this.getIterator().meta('shape'));
        if (goog.isDef(shape)) {
          this.colorizeShape(anychart.enums.AnyMapPointState.NORMAL);
          this.applyHatchFill(anychart.enums.AnyMapPointState.NORMAL);
          this.drawMarker(anychart.enums.AnyMapPointState.NORMAL);
          this.drawLabel(anychart.enums.AnyMapPointState.NORMAL);
        }
      }
    }
  }
  this.hideTooltip();
  this.hoverStatus.length = 0;
  return this;
};


//exports
anychart.core.map.series.Choropleth.prototype['unhover'] = anychart.core.map.series.Choropleth.prototype.unhover;
anychart.core.map.series.Choropleth.prototype['unselect'] = anychart.core.map.series.Choropleth.prototype.unselect;
