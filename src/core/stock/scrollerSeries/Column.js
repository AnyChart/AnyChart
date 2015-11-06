goog.provide('anychart.core.stock.scrollerSeries.Column');
goog.require('anychart.core.dataDrawers.Column');
goog.require('anychart.core.stock.scrollerSeries.DiscreteBase');
goog.require('anychart.enums');



/**
 * Column series class.
 * @param {!anychart.core.stock.Scroller} scroller
 * @constructor
 * @extends {anychart.core.stock.scrollerSeries.DiscreteBase}
 */
anychart.core.stock.scrollerSeries.Column = function(scroller) {
  goog.base(this, scroller);

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
   * Series selected stroke.
   * @type {acgraph.vector.Stroke}
   * @private
   */
  this.selectedStroke_;

  /**
   * Series selected fill.
   * @type {acgraph.vector.Fill}
   * @private
   */
  this.selectedFill_;

  /**
   * If the edges should be crisp.
   * @type {boolean}
   * @private
   */
  this.crispEdges_ = true;
};
goog.inherits(anychart.core.stock.scrollerSeries.Column, anychart.core.stock.scrollerSeries.DiscreteBase);


// registering series type
anychart.core.stock.scrollerSeries.Base.SeriesTypesMap[anychart.enums.StockSeriesType.COLUMN] = anychart.core.stock.scrollerSeries.Column;


/** @inheritDoc */
anychart.core.stock.scrollerSeries.Column.prototype.getType = function() {
  return anychart.enums.StockSeriesType.COLUMN;
};


/**
 * @type {acgraph.vector.Path}
 * @private
 */
anychart.core.stock.scrollerSeries.Column.prototype.fillPath_;


/**
 * @type {acgraph.vector.Path}
 * @private
 */
anychart.core.stock.scrollerSeries.Column.prototype.strokePath_;


/**
 * @type {acgraph.vector.Path}
 * @private
 */
anychart.core.stock.scrollerSeries.Column.prototype.selectedFillPath_;


/**
 * @type {acgraph.vector.Path}
 * @private
 */
anychart.core.stock.scrollerSeries.Column.prototype.selectedStrokePath_;


/**
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line joint style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {anychart.core.stock.scrollerSeries.Column|acgraph.vector.Stroke} .
 */
anychart.core.stock.scrollerSeries.Column.prototype.stroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern,
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
 * @return {!(acgraph.vector.Fill|anychart.core.stock.scrollerSeries.Column)} .
 */
anychart.core.stock.scrollerSeries.Column.prototype.fill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy,
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


/**
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line joint style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {anychart.core.stock.scrollerSeries.Column|acgraph.vector.Stroke} .
 */
anychart.core.stock.scrollerSeries.Column.prototype.selectedStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern,
    opt_lineJoin, opt_lineCap) {
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


/**
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!anychart.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!anychart.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {!(acgraph.vector.Fill|anychart.core.stock.scrollerSeries.Column)} .
 */
anychart.core.stock.scrollerSeries.Column.prototype.selectedFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy,
    opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var val = acgraph.vector.normalizeFill.apply(null, arguments);
    if (val != this.selectedFill_) {
      this.selectedFill_ = val;
      this.invalidate(anychart.ConsistencyState.STOCK_SERIES_COLOR, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.selectedFill_;
};


/** @inheritDoc */
anychart.core.stock.scrollerSeries.Column.prototype.ensureVisualIsReady = function(container, selectedContainer) {
  goog.base(this, 'ensureVisualIsReady', container, selectedContainer);
  if (!this.fillPath_) {
    this.fillPath_ = this.rootLayer.path();
    this.strokePath_ = this.rootLayer.path();
    this.selectedFillPath_ = this.rootLayerSelected.path();
    this.selectedStrokePath_ = this.rootLayerSelected.path();
  }
};


/** @inheritDoc */
anychart.core.stock.scrollerSeries.Column.prototype.startDrawing = function() {
  var drawer = /** @type {anychart.core.dataDrawers.Column} */(this.drawer);
  if (!drawer) {
    this.drawer = drawer = new anychart.core.dataDrawers.Column();
    this.selectedDrawer = new anychart.core.dataDrawers.Column();
  }
  var selectedDrawer = /** @type {anychart.core.dataDrawers.Column} */(this.selectedDrawer);

  var catWidth = this.getSelectableData().getMinDistance() / (this.xScale.getMaximum() - this.xScale.getMinimum()) * this.pixelBoundsCache.width;
  var pointWidth = anychart.utils.normalizeSize(/** @type {(number|string)} */(this.pointWidth()), catWidth);
  var crispEdges = this.crispEdges_ && pointWidth < catWidth && (catWidth - pointWidth) > 2.5 && pointWidth > 10;

  drawer.setup(this.fillPath_, this.strokePath_, crispEdges, pointWidth, acgraph.vector.getThickness(this.stroke_));
  selectedDrawer.setup(this.selectedFillPath_, this.selectedStrokePath_, crispEdges, pointWidth, acgraph.vector.getThickness(this.selectedStroke_));
};


/**
 * If the edges should be crisp.
 * @param {boolean=} opt_value
 * @return {anychart.core.stock.scrollerSeries.Column|boolean}
 */
anychart.core.stock.scrollerSeries.Column.prototype.crispEdges = function(opt_value) {
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
anychart.core.stock.scrollerSeries.Column.prototype.colorizePoints = function() {
  this.fillPath_.fill(this.fill_);
  this.fillPath_.stroke(null);
  this.strokePath_.fill(null);
  this.strokePath_.stroke(this.stroke_);
  this.selectedFillPath_.fill(this.selectedFill_);
  this.selectedFillPath_.stroke(null);
  this.selectedStrokePath_.fill(null);
  this.selectedStrokePath_.stroke(this.selectedStroke_);
};


/**
 * @inheritDoc
 */
anychart.core.stock.scrollerSeries.Column.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');
  json['fill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.fill()));
  json['selectedFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.selectedFill()));
  json['stroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke}*/(this.stroke()));
  json['selectedStroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke}*/(this.selectedStroke()));
  return json;
};


/**
 * @inheritDoc
 */
anychart.core.stock.scrollerSeries.Column.prototype.setupByJSON = function(config) {
  goog.base(this, 'setupByJSON', config);
  this.fill(config['fill']);
  this.selectedFill(config['selectedFill']);
  this.stroke(config['stroke']);
  this.selectedStroke(config['selectedStroke']);
};


//anychart.core.stock.scrollerSeries.Column.prototype['crispEdges'] = anychart.core.stock.scrollerSeries.Column.prototype.crispEdges;

//exports
anychart.core.stock.scrollerSeries.Column.prototype['fill'] = anychart.core.stock.scrollerSeries.Column.prototype.fill;
anychart.core.stock.scrollerSeries.Column.prototype['stroke'] = anychart.core.stock.scrollerSeries.Column.prototype.stroke;
anychart.core.stock.scrollerSeries.Column.prototype['selectedFill'] = anychart.core.stock.scrollerSeries.Column.prototype.selectedFill;
anychart.core.stock.scrollerSeries.Column.prototype['selectedStroke'] = anychart.core.stock.scrollerSeries.Column.prototype.selectedStroke;
