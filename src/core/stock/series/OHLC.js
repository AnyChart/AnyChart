goog.provide('anychart.core.stock.series.OHLC');
goog.require('anychart.core.dataDrawers.OHLC');
goog.require('anychart.core.stock.series.DiscreteBase');
goog.require('anychart.enums');



/**
 * OHLC series class.
 * @param {!anychart.charts.Stock} chart
 * @param {!anychart.core.stock.Plot} plot
 * @constructor
 * @extends {anychart.core.stock.series.DiscreteBase}
 */
anychart.core.stock.series.OHLC = function(chart, plot) {
  goog.base(this, chart, plot);

  this.usedFields = ['open', 'high', 'low', 'close'];

  /**
   * Rising stroke.
   * @type {acgraph.vector.Stroke}
   * @private
   */
  this.risingStroke_;

  /**
   * Falling stroke.
   * @type {acgraph.vector.Stroke}
   * @private
   */
  this.fallingStroke_;

  /**
   * If the edges should be crisp.
   * @type {boolean}
   * @private
   */
  this.crispEdges_ = true;
};
goog.inherits(anychart.core.stock.series.OHLC, anychart.core.stock.series.DiscreteBase);


// registering series type
anychart.core.stock.series.Base.SeriesTypesMap[anychart.enums.StockSeriesType.OHLC] = anychart.core.stock.series.OHLC;


/** @inheritDoc */
anychart.core.stock.series.OHLC.prototype.getType = function() {
  return anychart.enums.StockSeriesType.OHLC;
};


/**
 * @type {acgraph.vector.Path}
 * @private
 */
anychart.core.stock.series.OHLC.prototype.fallingPath_;


/**
 * @type {acgraph.vector.Path}
 * @private
 */
anychart.core.stock.series.OHLC.prototype.risingPath_;


/**
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line joint style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {anychart.core.stock.series.OHLC|acgraph.vector.Stroke} .
 */
anychart.core.stock.series.OHLC.prototype.fallingStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern,
    opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var stroke = acgraph.vector.normalizeStroke.apply(null, arguments);
    if (stroke != this.fallingStroke_) {
      this.fallingStroke_ = stroke;
      this.invalidate(anychart.ConsistencyState.STOCK_SERIES_COLOR, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.fallingStroke_;
};


/**
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line joint style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {anychart.core.stock.series.OHLC|acgraph.vector.Stroke} .
 */
anychart.core.stock.series.OHLC.prototype.risingStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern,
    opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var stroke = acgraph.vector.normalizeStroke.apply(null, arguments);
    if (stroke != this.risingStroke_) {
      this.risingStroke_ = stroke;
      this.invalidate(anychart.ConsistencyState.STOCK_SERIES_COLOR, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.risingStroke_;
};


/** @inheritDoc */
anychart.core.stock.series.OHLC.prototype.ensureVisualIsReady = function(container) {
  goog.base(this, 'ensureVisualIsReady', container);
  if (!this.fallingPath_) {
    this.fallingPath_ = this.rootLayer.path();
    this.risingPath_ = this.rootLayer.path();
  }
};


/** @inheritDoc */
anychart.core.stock.series.OHLC.prototype.startDrawing = function() {
  if (!this.drawer) {
    this.drawer = new anychart.core.dataDrawers.OHLC();
  }
  var drawer = /** @type {anychart.core.dataDrawers.OHLC} */(this.drawer);
  drawer.setup(this.risingPath_, this.fallingPath_, this.crispEdges_, this.getPointWidth(),
      acgraph.vector.getThickness(this.risingStroke_), acgraph.vector.getThickness(this.fallingStroke_));
};


/**
 * If the edges should be crisp.
 * @param {boolean=} opt_value
 * @return {anychart.core.stock.series.OHLC|boolean}
 */
anychart.core.stock.series.OHLC.prototype.crispEdges = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = !!opt_value;
    if (this.crispEdges_ != opt_value) {
      this.crispEdges_ = opt_value;
      this.invalidate(anychart.ConsistencyState.STOCK_SERIES_POINTS, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.crispEdges_;
};


/** @inheritDoc */
anychart.core.stock.series.OHLC.prototype.colorizePoints = function() {
  this.fallingPath_.fill(null);
  this.fallingPath_.stroke(this.fallingStroke_);
  this.risingPath_.fill(null);
  this.risingPath_.stroke(this.risingStroke_);
};


/** @inheritDoc */
anychart.core.stock.series.OHLC.prototype.getLegendValue = function(format) {
  return anychart.utils.toNumber(format['close']).toFixed(2);
};


/** @inheritDoc */
anychart.core.stock.series.OHLC.prototype.getLegendIconType = function(context) {
  // here should up/down triangles be
  return anychart.enums.LegendItemIconType.SQUARE;
};


/** @inheritDoc */
anychart.core.stock.series.OHLC.prototype.getLegendIconFill = function(context) {
  return anychart.color.lighten(context['open'] < context['close'] ? this.risingStroke_ : this.fallingStroke_);
};


/** @inheritDoc */
anychart.core.stock.series.OHLC.prototype.getLegendIconStroke = function(context) {
  return context['open'] < context['close'] ? this.risingStroke_ : this.fallingStroke_;
};


/**
 * @inheritDoc
 */
anychart.core.stock.series.OHLC.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');
  json['risingStroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke}*/(this.risingStroke()));
  json['fallingStroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke}*/(this.fallingStroke()));
  return json;
};


/**
 * @inheritDoc
 */
anychart.core.stock.series.OHLC.prototype.setupByJSON = function(config) {
  goog.base(this, 'setupByJSON', config);
  this.risingStroke(config['risingStroke']);
  this.fallingStroke(config['fallingStroke']);
};


//exports
anychart.core.stock.series.OHLC.prototype['fallingStroke'] = anychart.core.stock.series.OHLC.prototype.fallingStroke;
anychart.core.stock.series.OHLC.prototype['risingStroke'] = anychart.core.stock.series.OHLC.prototype.risingStroke;
anychart.core.stock.series.OHLC.prototype['crispEdges'] = anychart.core.stock.series.OHLC.prototype.crispEdges;
