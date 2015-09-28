goog.provide('anychart.core.stock.scrollerSeries.OHLC');
goog.require('anychart.core.dataDrawers.OHLC');
goog.require('anychart.core.stock.scrollerSeries.DiscreteBase');
goog.require('anychart.enums');



/**
 * OHLC series class.
 * @param {!anychart.core.stock.Scroller} scroller
 * @constructor
 * @extends {anychart.core.stock.scrollerSeries.DiscreteBase}
 */
anychart.core.stock.scrollerSeries.OHLC = function(scroller) {
  goog.base(this, scroller);

  this.usedFields = ['open', 'high', 'low', 'close'];

  /**
   * Rising stroke.
   * @type {acgraph.vector.Stroke}
   * @private
   */
  this.risingStroke_ = 'rgb(165,194,92)';

  /**
   * Falling stroke.
   * @type {acgraph.vector.Stroke}
   * @private
   */
  this.fallingStroke_ = 'rgb(204,120,50)';

  /**
   * Rising stroke.
   * @type {acgraph.vector.Stroke}
   * @private
   */
  this.selectedRisingStroke_ = 'rgb(165,194,92)';

  /**
   * Falling stroke.
   * @type {acgraph.vector.Stroke}
   * @private
   */
  this.selectedFallingStroke_ = 'rgb(204,120,50)';

  /**
   * If the edges should be crisp.
   * @type {boolean}
   * @private
   */
  this.crispEdges_ = true;
};
goog.inherits(anychart.core.stock.scrollerSeries.OHLC, anychart.core.stock.scrollerSeries.DiscreteBase);


// registering series type
anychart.core.stock.scrollerSeries.Base.SeriesTypesMap[anychart.enums.StockSeriesType.OHLC] = anychart.core.stock.scrollerSeries.OHLC;


/** @inheritDoc */
anychart.core.stock.scrollerSeries.OHLC.prototype.getType = function() {
  return anychart.enums.StockSeriesType.OHLC;
};


/**
 * @type {acgraph.vector.Path}
 * @private
 */
anychart.core.stock.scrollerSeries.OHLC.prototype.fallingPath_;


/**
 * @type {acgraph.vector.Path}
 * @private
 */
anychart.core.stock.scrollerSeries.OHLC.prototype.risingPath_;


/**
 * @type {acgraph.vector.Path}
 * @private
 */
anychart.core.stock.scrollerSeries.OHLC.prototype.selectedFallingPath_;


/**
 * @type {acgraph.vector.Path}
 * @private
 */
anychart.core.stock.scrollerSeries.OHLC.prototype.selectedRisingPath_;


/**
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line joint style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {anychart.core.stock.scrollerSeries.OHLC|acgraph.vector.Stroke} .
 */
anychart.core.stock.scrollerSeries.OHLC.prototype.fallingStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern,
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
 * @return {anychart.core.stock.scrollerSeries.OHLC|acgraph.vector.Stroke} .
 */
anychart.core.stock.scrollerSeries.OHLC.prototype.risingStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern,
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


/**
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line joint style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {anychart.core.stock.scrollerSeries.OHLC|acgraph.vector.Stroke} .
 */
anychart.core.stock.scrollerSeries.OHLC.prototype.selectedFallingStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern,
    opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var stroke = acgraph.vector.normalizeStroke.apply(null, arguments);
    if (stroke != this.selectedFallingStroke_) {
      this.selectedFallingStroke_ = stroke;
      this.invalidate(anychart.ConsistencyState.STOCK_SERIES_COLOR, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.selectedFallingStroke_;
};


/**
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line joint style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {anychart.core.stock.scrollerSeries.OHLC|acgraph.vector.Stroke} .
 */
anychart.core.stock.scrollerSeries.OHLC.prototype.selectedRisingStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern,
    opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var stroke = acgraph.vector.normalizeStroke.apply(null, arguments);
    if (stroke != this.selectedRisingStroke_) {
      this.selectedRisingStroke_ = stroke;
      this.invalidate(anychart.ConsistencyState.STOCK_SERIES_COLOR, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.selectedRisingStroke_;
};


/** @inheritDoc */
anychart.core.stock.scrollerSeries.OHLC.prototype.ensureVisualIsReady = function(container, selectedContainer) {
  goog.base(this, 'ensureVisualIsReady', container, selectedContainer);
  if (!this.fallingPath_) {
    this.fallingPath_ = this.rootLayer.path();
    this.risingPath_ = this.rootLayer.path();
    this.selectedFallingPath_ = this.rootLayerSelected.path();
    this.selectedRisingPath_ = this.rootLayerSelected.path();
  }
};


/** @inheritDoc */
anychart.core.stock.scrollerSeries.OHLC.prototype.startDrawing = function() {
  var drawer = /** @type {anychart.core.dataDrawers.OHLC} */(this.drawer);
  if (!drawer) {
    this.drawer = drawer = new anychart.core.dataDrawers.OHLC();
    this.selectedDrawer = new anychart.core.dataDrawers.OHLC();
  }
  var selectedDrawer = /** @type {anychart.core.dataDrawers.OHLC} */(this.selectedDrawer);
  drawer.setup(this.risingPath_, this.fallingPath_, this.crispEdges_, this.getPointWidth(),
      acgraph.vector.getThickness(this.risingStroke_), acgraph.vector.getThickness(this.fallingStroke_));
  selectedDrawer.setup(this.selectedRisingPath_, this.selectedFallingPath_, this.crispEdges_, this.getPointWidth(),
      acgraph.vector.getThickness(this.selectedRisingStroke_), acgraph.vector.getThickness(this.selectedFallingStroke_));
};


/**
 * If the edges should be crisp.
 * @param {boolean=} opt_value
 * @return {anychart.core.stock.scrollerSeries.OHLC|boolean}
 */
anychart.core.stock.scrollerSeries.OHLC.prototype.crispEdges = function(opt_value) {
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
anychart.core.stock.scrollerSeries.OHLC.prototype.colorizePoints = function() {
  this.fallingPath_.fill(null);
  this.fallingPath_.stroke(this.fallingStroke_);
  this.risingPath_.fill(null);
  this.risingPath_.stroke(this.risingStroke_);
  this.selectedFallingPath_.fill(null);
  this.selectedFallingPath_.stroke(this.selectedFallingStroke_);
  this.selectedRisingPath_.fill(null);
  this.selectedRisingPath_.stroke(this.selectedRisingStroke_);
};


/**
 * @inheritDoc
 */
anychart.core.stock.scrollerSeries.OHLC.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');
  json['risingStroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke}*/(this.risingStroke()));
  json['selectedRisingStroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke}*/(this.selectedRisingStroke()));
  json['fallingStroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke}*/(this.fallingStroke()));
  json['selectedFallingStroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke}*/(this.selectedFallingStroke()));
  return json;
};


/**
 * @inheritDoc
 */
anychart.core.stock.scrollerSeries.OHLC.prototype.setupByJSON = function(config) {
  goog.base(this, 'setupByJSON', config);
  this.risingStroke(config['risingStroke']);
  this.selectedRisingStroke(config['selectedRisingStroke']);
  this.fallingStroke(config['fallingStroke']);
  this.selectedFallingStroke(config['selectedFallingStroke']);
};


//anychart.core.stock.scrollerSeries.OHLC.prototype['crispEdges'] = anychart.core.stock.scrollerSeries.OHLC.prototype.crispEdges;

//exports
anychart.core.stock.scrollerSeries.OHLC.prototype['fallingStroke'] = anychart.core.stock.scrollerSeries.OHLC.prototype.fallingStroke;
anychart.core.stock.scrollerSeries.OHLC.prototype['risingStroke'] = anychart.core.stock.scrollerSeries.OHLC.prototype.risingStroke;
anychart.core.stock.scrollerSeries.OHLC.prototype['selectedFallingStroke'] = anychart.core.stock.scrollerSeries.OHLC.prototype.selectedFallingStroke;
anychart.core.stock.scrollerSeries.OHLC.prototype['selectedRisingStroke'] = anychart.core.stock.scrollerSeries.OHLC.prototype.selectedRisingStroke;
