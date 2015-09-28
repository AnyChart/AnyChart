goog.provide('anychart.core.stock.scrollerSeries.Line');
goog.require('acgraph');
goog.require('anychart.core.dataDrawers.Line');
goog.require('anychart.core.stock.scrollerSeries.Base');
goog.require('anychart.enums');



/**
 * Line series class.
 * @param {!anychart.core.stock.Scroller} scroller
 * @constructor
 * @extends {anychart.core.stock.scrollerSeries.Base}
 */
anychart.core.stock.scrollerSeries.Line = function(scroller) {
  goog.base(this, scroller);

  /**
   * Line series stroke.
   * @type {acgraph.vector.Stroke}
   * @private
   */
  this.stroke_ = 'rgb(204,120,50)';

  /**
   * Line series selected part stroke.
   * @type {acgraph.vector.Stroke}
   * @private
   */
  this.selectedStroke_ = 'rgb(165,194,92)';

  /**
   * Series path.
   * @type {acgraph.vector.Path}
   * @private
   */
  this.path_ = null;

  /**
   * Series selected path.
   * @type {acgraph.vector.Path}
   * @private
   */
  this.selectedPath_ = null;
};
goog.inherits(anychart.core.stock.scrollerSeries.Line, anychart.core.stock.scrollerSeries.Base);


// registering series type
anychart.core.stock.scrollerSeries.Base.SeriesTypesMap[anychart.enums.StockSeriesType.LINE] = anychart.core.stock.scrollerSeries.Line;


/** @inheritDoc */
anychart.core.stock.scrollerSeries.Line.prototype.getType = function() {
  return anychart.enums.StockSeriesType.LINE;
};


/**
 * Line stroke getter/setter.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line joint style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {anychart.core.stock.scrollerSeries.Line|acgraph.vector.Stroke} .
 */
anychart.core.stock.scrollerSeries.Line.prototype.stroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
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
 * Line stroke getter/setter.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line joint style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {anychart.core.stock.scrollerSeries.Line|acgraph.vector.Stroke} .
 */
anychart.core.stock.scrollerSeries.Line.prototype.selectedStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var stroke = acgraph.vector.normalizeStroke.apply(null, arguments);
    if (stroke != this.selectedStroke_) {
      this.selectedStroke_ = stroke;
      this.invalidate(anychart.ConsistencyState.STOCK_SERIES_COLOR, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.selectedStroke_;
};


/** @inheritDoc */
anychart.core.stock.scrollerSeries.Line.prototype.ensureVisualIsReady = function(container, selectedContainer) {
  goog.base(this, 'ensureVisualIsReady', container, selectedContainer);
  if (!this.path_)
    this.path_ = this.rootLayer.path();
  if (!this.selectedPath_)
    this.selectedPath_ = this.rootLayerSelected.path();
};


/** @inheritDoc */
anychart.core.stock.scrollerSeries.Line.prototype.startDrawing = function() {
  var drawer = /** @type {anychart.core.dataDrawers.Line} */(this.drawer);
  if (!drawer) {
    this.drawer = drawer = new anychart.core.dataDrawers.Line();
    this.selectedDrawer = new anychart.core.dataDrawers.Line();
  }
  var selectedDrawer = /** @type {anychart.core.dataDrawers.Line} */(this.selectedDrawer);
  drawer.setup(this.path_);
  selectedDrawer.setup(this.selectedPath_);
};


/** @inheritDoc */
anychart.core.stock.scrollerSeries.Line.prototype.colorizePoints = function() {
  this.path_.fill(null);
  this.path_.stroke(this.stroke_);
  this.selectedPath_.fill(null);
  this.selectedPath_.stroke(this.selectedStroke_);
};


/**
 * @inheritDoc
 */
anychart.core.stock.scrollerSeries.Line.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');
  json['stroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke}*/(this.stroke()));
  json['selectedStroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke}*/(this.selectedStroke()));
  return json;
};


/**
 * @inheritDoc
 */
anychart.core.stock.scrollerSeries.Line.prototype.setupByJSON = function(config) {
  goog.base(this, 'setupByJSON', config);
  this.stroke(config['stroke']);
  this.selectedStroke(config['selectedStroke']);
};


//exports
anychart.core.stock.scrollerSeries.Line.prototype['stroke'] = anychart.core.stock.scrollerSeries.Line.prototype.stroke;
anychart.core.stock.scrollerSeries.Line.prototype['selectedStroke'] = anychart.core.stock.scrollerSeries.Line.prototype.selectedStroke;
