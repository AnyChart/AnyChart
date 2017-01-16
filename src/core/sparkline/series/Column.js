goog.provide('anychart.core.sparkline.series.Column');
goog.require('acgraph');
goog.require('anychart.core.sparkline.series.Base');
goog.require('anychart.core.utils.TypedLayer');



/**
 * @param {!anychart.charts.Sparkline} chart Chart.
 * @constructor
 * @extends {anychart.core.sparkline.series.Base}
 */
anychart.core.sparkline.series.Column = function(chart) {
  anychart.core.sparkline.series.Column.base(this, 'constructor', chart);
};
goog.inherits(anychart.core.sparkline.series.Column, anychart.core.sparkline.series.Base);
anychart.core.sparkline.series.Base.SeriesTypesMap[anychart.enums.SparklineSeriesType.COLUMN] = anychart.core.sparkline.series.Column;


/**
 * @type {anychart.core.utils.TypedLayer}
 * @protected
 */
anychart.core.sparkline.series.Column.prototype.rootElement = null;


/**
 * @type {anychart.core.utils.TypedLayer}
 * @protected
 */
anychart.core.sparkline.series.Column.prototype.hatchFillRootElement = null;


/** @inheritDoc */
anychart.core.sparkline.series.Column.prototype.isWidthBased = function() {
  return true;
};


/**
 * Fix bounds special for sparkline discrete base series.
 * @param {anychart.math.Rect} bounds Bounds to fix.
 * @return {anychart.math.Rect} Returns fixed bounds.
 */
anychart.core.sparkline.series.Column.prototype.fixBounds = function(bounds) {
  var pointsCount = this.getResetIterator().getRowsCount();
  var pointWidth = this.getPixelPointWidth(bounds);

  var expectedSpaceCount = pointsCount - 1;
  var currentSpaceCount = bounds.width - pointsCount * pointWidth;
  var excess = currentSpaceCount % expectedSpaceCount;

  if (bounds.height % 2 != 0) {
    bounds.height -= 1;
  }

  if (excess != 0) {
    bounds.left += Math.floor(excess / 2);
    bounds.width -= excess;
  }

  return bounds;
};


/**
 * Discrete-pointed series are based on a typed layer, that constructs children by this initializer.
 * @return {!acgraph.vector.Element} Returns new instance of an element.
 * @protected
 */
anychart.core.sparkline.series.Column.prototype.rootTypedLayerInitializer = function() {
  return acgraph.rect();
};


/**
 * @param {anychart.math.Rect=} opt_bounds Temp bounds for calculation bounds shift.
 * @return {number} Point width in pixels.
 * @protected
 */
anychart.core.sparkline.series.Column.prototype.getPixelPointWidth = function(opt_bounds) {
  var bounds = opt_bounds || this.pixelBoundsCache;
  // todo(Anton Saukh): fix for linear scale case.
  var categoryWidth = Math.floor((this.chart.xScale().getPointWidthRatio() || (1 / this.getIterator().getRowsCount())) *
      bounds.width);

  var pointWidthPix = Math.floor(
      anychart.utils.normalizeSize(/** @type {(number|string)} */(this.chart.pointWidth()), categoryWidth));

  if (pointWidthPix < 1) pointWidthPix = 1;

  return pointWidthPix;
};


/** @inheritDoc */
anychart.core.sparkline.series.Column.prototype.startDrawing = function() {
  anychart.core.sparkline.series.Column.base(this, 'startDrawing');

  /** @type {anychart.scales.Base} */
  var scale = /** @type {anychart.scales.Base} */(this.chart.yScale());
  var res = scale.transform(0);
  if (isNaN(res))
    res = 0;

  this.zeroY = this.applyRatioToBounds(goog.math.clamp(res, 0, 1), false);

  if (this.isConsistent() || !this.enabled()) return;

  if (!this.rootElement) {
    this.rootElement = new anychart.core.utils.TypedLayer(
        this.rootTypedLayerInitializer,
        goog.nullFunction);
    this.rootElement.zIndex(anychart.core.sparkline.series.Base.ZINDEX_SERIES);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    /** @type {acgraph.vector.Element} */(this.rootLayer).zIndex(/** @type {number} */(this.zIndex()));
    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    var clip = /** @type {!anychart.math.Rect} */(goog.isBoolean(this.chart.clip()) ?
        this.chart.clip() ?
            this.pixelBoundsCache :
            'none' :
        this.chart.clip());

    this.rootLayer.clip(/** @type {!anychart.math.Rect} */(clip));
    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE))
    this.rootElement.clear();

  if (this.hasInvalidationState(anychart.ConsistencyState.SERIES_HATCH_FILL)) {
    if (!this.hatchFillRootElement) {
      this.hatchFillRootElement = new anychart.core.utils.TypedLayer(
          this.rootTypedLayerInitializer,
          goog.nullFunction);

      this.hatchFillRootElement.parent(/** @type {acgraph.vector.ILayer} */(this.rootLayer));
      this.hatchFillRootElement.zIndex(anychart.core.sparkline.series.Base.ZINDEX_HATCH_FILL);
      this.hatchFillRootElement.disablePointerEvents(true);
    }
    this.hatchFillRootElement.clear();
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    this.rootLayer.parent(/** @type {acgraph.vector.ILayer} */(this.container()));
    this.rootElement.parent(/** @type {acgraph.vector.ILayer} */(this.rootLayer));
    if (this.hatchFillRootElement)
      this.hatchFillRootElement.parent(/** @type {acgraph.vector.ILayer} */(this.rootLayer));
    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }
};


/**
 * Colorizes shape in accordance to current point colorization settings.
 * Shape is get from current meta 'shape'.
 * @protected
 */
anychart.core.sparkline.series.Column.prototype.colorizeShape = function() {
  var shape = /** @type {acgraph.vector.Shape} */(this.getIterator().meta('shape'));
  if (goog.isDef(shape)) {
    shape.fill(this.chart.getFinalFill(true));
    shape.stroke(null);
  }
};


/**
 * Apply hatch fill to shape in accordance to current point colorization settings.
 * Shape is get from current meta 'hatchFillShape'.
 * @protected
 */
anychart.core.sparkline.series.Column.prototype.applyHatchFill = function() {
  var hatchFillShape = /** @type {acgraph.vector.Shape} */(this.getIterator().meta('hatchFillShape'));
  if (goog.isDefAndNotNull(hatchFillShape)) {
    hatchFillShape
        .stroke(null)
        .fill(this.chart.getFinalHatchFill(true));
  }
};


/** @inheritDoc */
anychart.core.sparkline.series.Column.prototype.drawSubsequentPoint = function() {
  var valuePoint = this.getReferenceCoords();
  if (!valuePoint)
    return false;

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    var xPos = valuePoint[0];
    var yPos = valuePoint[1];
    yPos = yPos < this.zeroY ? Math.ceil(yPos) : Math.floor(yPos);

    /** @type {!acgraph.vector.Rect} */
    var rect = /** @type {!acgraph.vector.Rect} */(this.rootElement.genNextChild());
    var barWidth = this.getPixelPointWidth();
    var pixelShift = barWidth % 2 == 0 ? 0 : .5;

    this.getIterator().meta('x', xPos).meta('value', yPos).meta('shape', rect);

    var x = Math.ceil(xPos + pixelShift - barWidth / 2);
    var y = Math.min(this.zeroY, yPos);
    var width = barWidth;
    var height = Math.abs(this.zeroY - yPos);

    rect.setX(x).setY(y).setWidth(width).setHeight(height);

    this.colorizeShape();
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.SERIES_HATCH_FILL)) {
    var iterator = this.getIterator();
    var hatchFillShape = this.hatchFillRootElement ?
        /** @type {!acgraph.vector.Rect} */(this.hatchFillRootElement.genNextChild()) :
        null;
    iterator.meta('hatchFillShape', hatchFillShape);
    var shape = /** @type {acgraph.vector.Shape} */(iterator.meta('shape'));
    if (goog.isDef(shape) && hatchFillShape) {
      hatchFillShape.deserialize(shape.serialize());
    }
    this.applyHatchFill();
  }

  return true;
};


/** @inheritDoc */
anychart.core.sparkline.series.Column.prototype.getDefaults = function() {
  var settings = anychart.core.sparkline.series.Column.base(this, 'getDefaults');

  if (!settings['markers']) settings['markers'] = {};
  settings['markers']['position'] = anychart.enums.Position.CENTER_TOP;

  if (!settings['labels']) settings['labels'] = {};
  settings['labels']['position'] = anychart.enums.Position.CENTER_TOP;
  settings['labels']['anchor'] = anychart.enums.Position.CENTER_BOTTOM;

  if (!settings['negativeMarkers']) settings['negativeMarkers'] = {};
  settings['negativeMarkers']['position'] = anychart.enums.Position.CENTER_BOTTOM;

  if (!settings['negativeLabels']) settings['negativeLabels'] = {};
  settings['negativeLabels']['position'] = anychart.enums.Position.CENTER_BOTTOM;
  settings['negativeLabels']['anchor'] = anychart.enums.Position.CENTER_TOP;

  settings['stroke'] = {
    'color': '#64b5f6',
    'thickness': 1.5
  };
  settings['fill'] = {
    'color': '#64b5f6',
    'opacity': 0.7
  };
  settings['negativeFill'] = {
    'color': '#ef6c00',
    'opacity': 0.7
  };

  return settings;
};

