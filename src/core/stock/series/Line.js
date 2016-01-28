goog.provide('anychart.core.stock.series.Line');
goog.require('anychart.core.dataDrawers.Line');
goog.require('anychart.core.stock.series.Base');
goog.require('anychart.enums');



/**
 * Line series class.
 * @param {!anychart.charts.Stock} chart
 * @param {!anychart.core.stock.Plot} plot
 * @constructor
 * @extends {anychart.core.stock.series.Base}
 */
anychart.core.stock.series.Line = function(chart, plot) {
  goog.base(this, chart, plot);

  /**
   * Line series stroke.
   * @type {acgraph.vector.Stroke}
   * @private
   */
  this.stroke_ = 'red';
};
goog.inherits(anychart.core.stock.series.Line, anychart.core.stock.series.Base);


// registering series type
anychart.core.stock.series.Base.SeriesTypesMap[anychart.enums.StockSeriesType.LINE] = anychart.core.stock.series.Line;


/** @inheritDoc */
anychart.core.stock.series.Line.prototype.getType = function() {
  return anychart.enums.StockSeriesType.LINE;
};


/**
 * @type {acgraph.vector.Path}
 * @private
 */
anychart.core.stock.series.Line.prototype.path_;


/**
 * Line stroke getter/setter.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line joint style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {anychart.core.stock.series.Line|acgraph.vector.Stroke} .
 */
anychart.core.stock.series.Line.prototype.stroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var stroke = acgraph.vector.normalizeStroke.apply(null, arguments);
    if (stroke != this.stroke_) {
      this.stroke_ = stroke;
      this.invalidate(anychart.ConsistencyState.STOCK_SERIES_COLOR, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.stroke_;
};


/** @inheritDoc */
anychart.core.stock.series.Line.prototype.ensureVisualIsReady = function(container) {
  goog.base(this, 'ensureVisualIsReady', container);
  if (!this.path_)
    this.path_ = this.rootLayer.path();
};


/** @inheritDoc */
anychart.core.stock.series.Line.prototype.startDrawing = function() {
  if (!this.drawer) {
    this.drawer = new anychart.core.dataDrawers.Line();
  }
  var drawer = /** @type {anychart.core.dataDrawers.Line} */(this.drawer);
  drawer.setup(this.path_);
};


/** @inheritDoc */
anychart.core.stock.series.Line.prototype.colorizePoints = function() {
  this.path_.fill(null);
  this.path_.stroke(this.stroke_);
};


/** @inheritDoc */
anychart.core.stock.series.Line.prototype.getLegendIconFill = function(context) {
  return this.stroke_;
};


/** @inheritDoc */
anychart.core.stock.series.Line.prototype.getLegendIconStroke = function(context) {
  return this.stroke_;
};


/**
 * @inheritDoc
 */
anychart.core.stock.series.Line.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');
  json['stroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke}*/(this.stroke()));
  return json;
};


/**
 * @inheritDoc
 */
anychart.core.stock.series.Line.prototype.setupByJSON = function(config) {
  goog.base(this, 'setupByJSON', config);
  this.stroke(config['stroke']);
};


//exports
anychart.core.stock.series.Line.prototype['stroke'] = anychart.core.stock.series.Line.prototype.stroke;
