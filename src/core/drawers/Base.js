goog.provide('anychart.core.drawers.Base');
goog.require('anychart.core.drawers');
goog.require('anychart.enums');
goog.require('anychart.opt');
goog.require('goog.Disposable');



/**
 * Data drawer base.
 * @param {anychart.core.series.Base} series An associated series.
 * @constructor
 * @extends {goog.Disposable}
 */
anychart.core.drawers.Base = function(series) {
  anychart.core.drawers.Base.base(this, 'constructor');
  /**
   * An associated series.
   * @type {anychart.core.series.Base}
   * @protected
   */
  this.series = series;
};
goog.inherits(anychart.core.drawers.Base, goog.Disposable);


/**
 * Type of the drawer.
 * @type {anychart.enums.SeriesDrawerTypes}
 */
anychart.core.drawers.Base.prototype.type = anychart.enums.SeriesDrawerTypes.BASE;


/**
 * List of drawer capabilities.
 * @type {number|anychart.core.drawers.Capabilities}
 */
anychart.core.drawers.Base.prototype.flags = (
    //anychart.core.drawers.Capabilities.NEEDS_ZERO |
    //anychart.core.drawers.Capabilities.IS_WIDTH_BASED |
    //anychart.core.drawers.Capabilities.NEEDS_SIZE_SCALE |
    //anychart.core.drawers.Capabilities.SUPPORTS_CONNECTING_MISSING |
    //anychart.core.drawers.Capabilities.SUPPORTS_STACK |
    //anychart.core.drawers.Capabilities.SUPPORTS_ERROR |
    //anychart.core.drawers.Capabilities.SUPPORTS_OUTLIERS |
    //anychart.core.drawers.Capabilities.IS_DISCRETE_BASED |
    //anychart.core.drawers.Capabilities.IS_BAR_BASED |
    //anychart.core.drawers.Capabilities.IS_AREA_BASED |
    //anychart.core.drawers.Capabilities.IS_LINE_BASED |
    //anychart.core.drawers.Capabilities.IS_3D_BASED |
    //anychart.core.drawers.Capabilities.USES_STROKE_AS_FILL |
    //anychart.core.drawers.Capabilities.IS_RANGE_BASED |
    0);


/**
 * Y values list that are required by this drawer.
 * @type {Array.<string>}
 */
anychart.core.drawers.Base.prototype.yValueNames = ([anychart.opt.VALUE]);


/**
 * This function is invoked before the drawing process starts.
 * @param {anychart.core.shapeManagers.Base} shapeManager
 */
anychart.core.drawers.Base.prototype.startDrawing = function(shapeManager) {
  /**
   * Shape manager provided by the series.
   * @type {anychart.core.shapeManagers.Base}
   * @protected
   */
  this.shapesManager = shapeManager;
  /**
   * If the prev point was not missing.
   * @type {boolean}
   * @protected
   */
  this.prevPointDrawn = false;
  /**
   * If the series should connect missing points.
   * @type {boolean}
   * @protected
   */
  this.connectMissing = !!(this.flags & anychart.core.drawers.Capabilities.SUPPORTS_CONNECTING_MISSING) &&
          !!this.series.getSeriesOption(anychart.opt.CONNECT_MISSING_POINTS);
  /**
   * Series state.
   * @type {anychart.PointState|number}
   * @protected
   */
  this.seriesState = this.series.getSeriesState();
  /**
   * Point width.
   * @type {number}
   * @protected
   */
  this.pointWidth = this.series.pointWidthCache;
  /**
   * If crisp edges should be applied if possible.
   * @type {boolean}
   * @protected
   */
  this.crispEdges = (this.series.categoryWidthCache - this.pointWidth) > 2.5 && this.pointWidth > 10;
};


/**
 * Draws passed point.
 * @param {anychart.data.IRowInfo} point
 * @param {anychart.PointState|number} state
 */
anychart.core.drawers.Base.prototype.drawPoint = function(point, state) {
  if (point.meta(anychart.opt.MISSING)) {
    this.drawMissingPoint(point, state | this.seriesState);
    this.prevPointDrawn = this.prevPointDrawn && this.connectMissing;
  } else {
    if (this.prevPointDrawn)
      this.drawSubsequentPoint(point, state | this.seriesState);
    else
      this.drawFirstPoint(point, state | this.seriesState);
    this.prevPointDrawn = true;
  }
};


/**
 * Finalizes series drawing.
 */
anychart.core.drawers.Base.prototype.finalizeDrawing = function() {
  this.finalizeSegment();
};


/**
 * Draws the first point in segment.
 * @param {anychart.data.IRowInfo} point
 * @param {anychart.PointState|number} state
 * @protected
 */
anychart.core.drawers.Base.prototype.drawFirstPoint = function(point, state) {
  this.drawSubsequentPoint(point, state);
};


/**
 * Draws subsequent point in segment.
 * @param {anychart.data.IRowInfo} point
 * @param {anychart.PointState|number} state
 * @protected
 */
anychart.core.drawers.Base.prototype.drawSubsequentPoint = function(point, state) {};


/**
 * Draws missing point. Usually it should do nothing for discrete series and should finalize segment for continuous.
 * @param {anychart.data.IRowInfo} point
 * @param {anychart.PointState|number} state
 * @protected
 */
anychart.core.drawers.Base.prototype.drawMissingPoint = function(point, state) {
  if (!this.connectMissing)
    this.finalizeSegment();
};


/**
 * Finalizes current segment.
 * @protected
 */
anychart.core.drawers.Base.prototype.finalizeSegment = function() {};


/**
 * Updates point.
 * @param {anychart.data.IRowInfo} point
 * @param {anychart.PointState|number} state
 */
anychart.core.drawers.Base.prototype.updatePoint = function(point, state) {};


/**
 * Updates point on animation.
 * @param {anychart.data.IRowInfo} point
 */
anychart.core.drawers.Base.prototype.updatePointOnAnimate = function(point) {};


/** @inheritDoc */
anychart.core.drawers.Base.prototype.disposeInternal = function() {
  this.series = null;
  this.shapesManager = null;
  anychart.core.drawers.Base.base(this, 'disposeInternal');
};
