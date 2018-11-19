goog.provide('anychart.core.drawers.Base');
goog.require('anychart.core.drawers');
goog.require('anychart.enums');
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
 * Draws passed point.
 * @param {anychart.data.IRowInfo} point
 * @param {anychart.PointState|number} state
 */
anychart.core.drawers.Base.prototype.drawPoint;


/**
 * Updates passed point.
 * @param {anychart.data.IRowInfo} point
 * @param {anychart.PointState|number} state
 */
anychart.core.drawers.Base.prototype.updatePoint = goog.nullFunction;


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
    // anychart.core.drawers.Capabilities.NEEDS_ZERO |
    // anychart.core.drawers.Capabilities.NEEDS_SIZE_SCALE |
    // anychart.core.drawers.Capabilities.USES_CONTAINER_AS_ROOT |
    // anychart.core.drawers.Capabilities.USES_STROKE_AS_FILL |
    // anychart.core.drawers.Capabilities.SUPPORTS_CONNECTING_MISSING |
    // anychart.core.drawers.Capabilities.SUPPORTS_STACK |
    // anychart.core.drawers.Capabilities.SUPPORTS_COMPARISON |
    // anychart.core.drawers.Capabilities.SUPPORTS_ERROR |
    // anychart.core.drawers.Capabilities.SUPPORTS_OUTLIERS |
    // anychart.core.drawers.Capabilities.IS_DISCRETE_BASED |
    // anychart.core.drawers.Capabilities.IS_WIDTH_BASED |
    // anychart.core.drawers.Capabilities.IS_3D_BASED |
    // anychart.core.drawers.Capabilities.IS_MARKER_BASED |
    // anychart.core.drawers.Capabilities.IS_OHLC_BASED |
    // anychart.core.drawers.Capabilities.IS_LINE_BASED |
    // anychart.core.drawers.Capabilities.IS_RANGE_BASED |
    // anychart.core.drawers.Capabilities.SUPPORTS_DISTRIBUTION |
    0);


/**
 * Y values list that are required by this drawer.
 * @type {Array.<string>}
 */
anychart.core.drawers.Base.prototype.yValueNames = (function() { return ['value']; })();


/**
 * Field name of series main value.
 * @type {string}
 */
anychart.core.drawers.Base.prototype.valueFieldName = 'value';


/**
 * A set of shapes with types that are required by the drawer.
 * This is checked before on drawing start.
 * @type {Object.<string, anychart.enums.ShapeType>}
 */
anychart.core.drawers.Base.prototype.requiredShapes = (function() { return {}; })();


/**
 * @param {...*} var_args .
 * @return {Object.<string>}
 */
anychart.core.drawers.Base.prototype.getShapeNames = function(var_args) {
  var firstValue = /** @type {number} */(arguments[0]);
  var secondValue = /** @type {number} */(arguments[1]);

  var isLineBased = this.series.check(anychart.core.drawers.Capabilities.IS_LINE_BASED);
  var isRangeBased = this.series.check(anychart.core.drawers.Capabilities.IS_RANGE_BASED);
  var isStrokeUsedAsFill = this.series.check(anychart.core.drawers.Capabilities.USES_STROKE_AS_FILL);
  var isDiscreteBased = this.series.isDiscreteBased();

  var names = {}, hatchFillName = 'hatchFill', strokeName = 'stroke', fillName = 'fill';
  var pathName = isStrokeUsedAsFill ? 'stroke' : 'path';

 if (isRangeBased) {
   if (firstValue > secondValue) {
     if (this.hasHighColoring) {
       pathName = 'high';
       hatchFillName = 'highHatchFill';
     }
   } else {
     if (this.hasLowColoring) {
       pathName = 'low';
       hatchFillName = 'lowHatchFill';
     }
   }

   names.path = pathName;
   names.hatchFill = hatchFillName;
 } else if (isDiscreteBased) {
    if (!this.series.planIsStacked()) {
      if (this.hasNegativeColoring) {
        if (firstValue < this.baseline) {
          pathName = 'negative';
          hatchFillName = 'negativeHatchFill';
        }
      } else if (this.hasRisingFallingColoring) {
        if (firstValue > secondValue || isNaN(secondValue)) {
          pathName = 'rising';
          hatchFillName = 'risingHatchFill';
        } else if (firstValue < secondValue) {
          pathName = 'falling';
          hatchFillName = 'fallingHatchFill';
        }
      }
    }
    if (isStrokeUsedAsFill) {
      names.stroke = pathName;
    } else {
      names.path = pathName;
      names.hatchFill = hatchFillName;
    }
  } else {
    if (!this.series.planIsStacked()) {
      if (this.hasNegativeColoring) {
        if (firstValue < this.baseline) {
          strokeName = 'negativeStroke';
          fillName = 'negativeFill';
          hatchFillName = 'negativeHatchFill';
        }
      } else if (this.hasRisingFallingColoring) {
        if (firstValue > secondValue || isNaN(secondValue)) {
          strokeName = 'risingStroke';
          fillName = 'risingFill';
          hatchFillName = 'risingHatchFill';
        } else if (firstValue < secondValue) {
          strokeName = 'fallingStroke';
          fillName = 'fallingFill';
          hatchFillName = 'fallingHatchFill';
        }
      }
    }

    names.stroke = strokeName;
    if (!isLineBased) {
      names.fill = fillName;
      names.hatchFill = hatchFillName;
    }
  }

  return names;
};


/**
 * Returns y value names. Used for Y scale calculations.
 * @return {Array.<string>}
 */
anychart.core.drawers.Base.prototype.getYValueNames = function() {
  return this.yValueNames;
};


/**
 * @param {number} value .
 * @return {boolean}
 */
anychart.core.drawers.Base.prototype.isBaselineIntersect = function(value) {
  return ((this.prevValue - this.baseline) || 1) * ((value - this.baseline) || 1) < 0;
};


/**
 * Checks if any shape of the passed object intersects the rect.
 * @param {Object.<acgraph.vector.Element>} shapes
 * @param {number} left
 * @param {number} top
 * @param {number} width
 * @param {number} height
 * @return {boolean}
 */
anychart.core.drawers.Base.prototype.checkShapesInRect = function(shapes, left, top, width, height) {
  for (var shapeName in shapes) {
    var shape = /** @type {acgraph.vector.Element} */(shapes[shapeName]);
    if (anychart.utils.instanceOf(shape, acgraph.vector.Element)) {
      var bounds = shape.getBounds();
      if (bounds.left <= left + width && left <= bounds.left + bounds.width &&
          bounds.top <= top + height && top <= bounds.top + bounds.height) {
        return true;
      }
    }
  }
  return false;
};


/**
 * This function is invoked before the drawing process starts.
 * @param {anychart.core.shapeManagers.Base} shapeManager
 * @param {boolean=} opt_crispEdges Whether to use crisp edges.
 */
anychart.core.drawers.Base.prototype.startDrawing = function(shapeManager, opt_crispEdges) {
  if (this.series.rendering().needsCustomPointDrawer()) {
    this.drawPoint = this.drawPointCustom_;
    this.updatePoint = this.updatePointCustom_;
  } else if (shapeManager.checkRequirements(this.requiredShapes)) {
    this.drawPoint = this.drawPointInternal_;
    this.updatePoint = this.updatePointInternal;
  } else {
    anychart.core.reporting.error(anychart.enums.ErrorCode.WRONG_SHAPES_CONFIG, null, [this.series.name(), this.series.seriesType(), this.requiredShapes]);
    this.drawPoint = goog.nullFunction;
    return;
  }

  /**
   * Shape manager provided by the series.
   * @type {anychart.core.shapeManagers.Base}
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
          !!this.series.getOption('connectMissingPoints');
  /**
   * Series state.
   * @type {anychart.PointState|number}
   */
  this.seriesState = this.series.getSeriesState();

  /**
   * Point width.
   * @type {number}
   */
  this.pointWidth = this.series.pointWidthCache;

  /**
   * If the series has vertical X.
   * @type {boolean}
   */
  this.isVertical = /** @type {boolean} */(this.series.getOption('isVertical'));

  /**
   * If crisp edges should be applied if possible.
   * @type {boolean}
   * @protected
   */
  this.crispEdges = goog.isDef(opt_crispEdges) ? opt_crispEdges : ((this.series.categoryWidthCache - this.pointWidth) > 2.5 && this.pointWidth > 10);

  this.series.rendering().callStart(this.series);

  var plot = /** @type {anychart.stockModule.Plot|anychart.core.ChartWithSeries} */(this.series.plot);
  this.baseline = /** @type {number} */(plot.getOption('baseline'));

  /**
   * If each point has it's own width.
   * @type {boolean}
   * @private
   */
  this.individualPointWidths_ = Boolean(this.series.getXScale()) && this.series.getXScale().checkWeights();

  var normSettings = this.series.normal();
  /**
   * @type {boolean}
   */
  this.hasNegativeColoring = goog.isDef(normSettings.getOwnOption('negativeStroke')) ||
      goog.isDef(normSettings.getOwnOption('negativeFill'));

  /**
   * @type {boolean}
   */
  this.hasRisingFallingColoring = goog.isDef(normSettings.getOwnOption('risingStroke')) ||
      goog.isDef(normSettings.getOwnOption('fallingStroke')) ||
      goog.isDef(normSettings.getOwnOption('risingFill')) ||
      goog.isDef(normSettings.getOwnOption('fallingFill'));

  /**
   * @type {boolean}
   */
  this.hasHighFill = goog.isDef(normSettings.getOwnOption('highFill'));
  /**
   * @type {boolean}
   */
  this.hasLowFill = goog.isDef(normSettings.getOwnOption('lowFill'));
  /**
   * @type {boolean}
   */
  this.hasHighColoring = goog.isDef(normSettings.getOwnOption('highStroke')) || this.hasHighFill;
  /**
   * @type {boolean}
   */
  this.hasLowColoring = goog.isDef(normSettings.getOwnOption('lowStroke')) || this.hasLowFill;

  this.prevValue = NaN;
};


/**
 * Draws passed point using custom drawing function.
 * @param {anychart.data.IRowInfo} point
 * @param {anychart.PointState|number} state
 * @private
 */
anychart.core.drawers.Base.prototype.drawPointCustom_ = function(point, state) {
  this.series.rendering().callPoint(this.series, point, state);
};


/**
 * Draws passed point in non-custom way.
 * @param {anychart.data.IRowInfo} point
 * @param {anychart.PointState|number} state
 * @private
 */
anychart.core.drawers.Base.prototype.drawPointInternal_ = function(point, state) {
  if (point.meta('missing')) {
    this.drawMissingPoint(point, state | this.seriesState);
    this.prevPointDrawn = this.prevPointDrawn && this.connectMissing;
  } else {
    if (this.individualPointWidths_) {
      var i = goog.isDef(point.meta('category')) ? /** @type {number} */(point.meta('category')) : point.getIndex();
      this.pointWidth = this.series.getCategoryWidth(i);
    }

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
  if (this.drawPoint != goog.nullFunction) {
    if (!this.series.rendering().needsCustomPointDrawer())
      this.finalizeSegment();
    this.series.rendering().callFinish(this.series);
  }
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
 * @protected
 */
anychart.core.drawers.Base.prototype.updatePointInternal = function(point, state) {
  if (!this.series.isDiscreteBased()) {
    this.shapesManager.calcPointColors(state, /** @type {Object} */(point.meta('shapeNames')));
    this.shapesManager.updateMarkersColors(state, /** @type {Object} */(point.meta('shapeNames')));
  }
};


/**
 * Updates point.
 * @param {anychart.data.IRowInfo} point
 * @param {anychart.PointState|number} state
 * @private
 */
anychart.core.drawers.Base.prototype.updatePointCustom_ = function(point, state) {
  this.series.rendering().callUpdate(this.series, point, state);
};


/**
 * Updates point on animation.
 * @param {anychart.data.IRowInfo} point
 */
anychart.core.drawers.Base.prototype.updatePointOnAnimate = function(point) {};


/**
 * Updates all zIndexes.
 * @param {number} zIndex - new series zIndex
 */
anychart.core.drawers.Base.prototype.updateZIndex = function(zIndex) {};


/** @inheritDoc */
anychart.core.drawers.Base.prototype.disposeInternal = function() {
  this.series = null;
  this.shapesManager = null;
  anychart.core.drawers.Base.base(this, 'disposeInternal');
};
