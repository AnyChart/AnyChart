goog.provide('anychart.core.stock.series.Column');
goog.require('anychart.core.dataDrawers.Column');
goog.require('anychart.core.stock.series.DiscreteBase');
goog.require('anychart.enums');



/**
 * Column series class.
 * @param {!anychart.charts.Stock} chart
 * @param {!anychart.core.stock.Plot} plot
 * @constructor
 * @extends {anychart.core.stock.series.DiscreteBase}
 */
anychart.core.stock.series.Column = function(chart, plot) {
  goog.base(this, chart, plot);

  /**
   * Series stroke.
   * @type {acgraph.vector.Stroke}
   * @private
   */
  this.stroke_;

  /**
   * Series fill.
   * @type {acgraph.vector.Fill}
   * @private
   */
  this.fill_;

  /**
   * If the edges should be crisp.
   * @type {boolean}
   * @private
   */
  this.crispEdges_ = true;

  this.pointWidth('75%');
};
goog.inherits(anychart.core.stock.series.Column, anychart.core.stock.series.DiscreteBase);


// registering series type
anychart.core.stock.series.Base.SeriesTypesMap[anychart.enums.StockSeriesType.COLUMN] = anychart.core.stock.series.Column;


/** @inheritDoc */
anychart.core.stock.series.Column.prototype.getType = function() {
  return anychart.enums.StockSeriesType.COLUMN;
};


/**
 * @type {acgraph.vector.Path}
 * @private
 */
anychart.core.stock.series.Column.prototype.fillPath_;


/**
 * @type {acgraph.vector.Path}
 * @private
 */
anychart.core.stock.series.Column.prototype.strokePath_;


/**
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line joint style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {anychart.core.stock.series.Column|acgraph.vector.Stroke} .
 */
anychart.core.stock.series.Column.prototype.stroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern,
    opt_lineJoin, opt_lineCap) {
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


/**
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!anychart.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!anychart.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {!(acgraph.vector.Fill|anychart.core.stock.series.Column)} .
 */
anychart.core.stock.series.Column.prototype.fill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy,
    opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var val = acgraph.vector.normalizeFill.apply(null, arguments);
    if (val != this.fill_) {
      this.fill_ = val;
      this.invalidate(anychart.ConsistencyState.STOCK_SERIES_COLOR, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.fill_;
};


/** @inheritDoc */
anychart.core.stock.series.Column.prototype.ensureVisualIsReady = function(container) {
  goog.base(this, 'ensureVisualIsReady', container);
  if (!this.fillPath_)
    this.fillPath_ = this.rootLayer.path();
  if (!this.strokePath_)
    this.strokePath_ = this.rootLayer.path();
};


/** @inheritDoc */
anychart.core.stock.series.Column.prototype.startDrawing = function() {
  if (!this.drawer) {
    this.drawer = new anychart.core.dataDrawers.Column();
  }

  var catWidth = this.getCategoryWidth();
  var pointWidth = anychart.utils.normalizeSize(/** @type {(number|string)} */(this.pointWidth()), catWidth);
  var crispEdges = this.crispEdges_ && pointWidth < catWidth && (catWidth - pointWidth) > 2.5 && pointWidth > 10;

  var drawer = /** @type {anychart.core.dataDrawers.Column} */(this.drawer);
  drawer.setup(this.fillPath_, this.strokePath_, crispEdges, pointWidth, acgraph.vector.getThickness(this.stroke_));
};


/**
 * If the edges should be crisp.
 * @param {boolean=} opt_value
 * @return {anychart.core.stock.series.Column|boolean}
 */
anychart.core.stock.series.Column.prototype.crispEdges = function(opt_value) {
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
anychart.core.stock.series.Column.prototype.colorizePoints = function() {
  this.fillPath_.fill(this.fill_);
  this.fillPath_.stroke(null);
  this.strokePath_.fill(null);
  this.strokePath_.stroke(this.stroke_);
};


/** @inheritDoc */
anychart.core.stock.series.Column.prototype.getLegendIconFill = function(context) {
  return this.fill_;
};


/** @inheritDoc */
anychart.core.stock.series.Column.prototype.getLegendIconStroke = function(context) {
  return this.stroke_;
};


/**
 * @inheritDoc
 */
anychart.core.stock.series.Column.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');
  json['fill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.fill()));
  json['stroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke}*/(this.stroke()));
  return json;
};


/**
 * @inheritDoc
 */
anychart.core.stock.series.Column.prototype.setupByJSON = function(config) {
  goog.base(this, 'setupByJSON', config);
  this.fill(config['fill']);
  this.stroke(config['stroke']);
};


//anychart.core.stock.series.Column.prototype['crispEdges'] = anychart.core.stock.series.Column.prototype.crispEdges;

//exports
anychart.core.stock.series.Column.prototype['fill'] = anychart.core.stock.series.Column.prototype.fill;
anychart.core.stock.series.Column.prototype['stroke'] = anychart.core.stock.series.Column.prototype.stroke;
