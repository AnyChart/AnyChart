goog.provide('anychart.core.series.StockScroller');
goog.require('anychart.core.series.Stock');
goog.require('anychart.core.shapeManagers.PerPoint');
goog.require('anychart.core.shapeManagers.PerSeries');
goog.require('anychart.opt');



/**
 * Class that represents a series for the user.
 * @param {!anychart.core.stock.Scroller} scroller
 * @param {string} type
 * @param {anychart.core.series.TypeConfig} config
 * @constructor
 * @extends {anychart.core.series.Stock}
 */
anychart.core.series.StockScroller = function(scroller, type, config) {
  /**
   * Second container for the selected copy of the series.
   * @type {acgraph.vector.ILayer}
   * @private
   */
  this.secondaryContainer_ = null;

  /**
   * Selected shape manager.
   * @type {anychart.core.shapeManagers.Base}
   * @private
   */
  this.secondaryShapeManager_ = null;

  /**
   * Selected drawer.
   * @type {anychart.core.drawers.Base}
   * @private
   */
  this.secondaryDrawer_ = null;

  /**
   * Selected root layer.
   * @type {acgraph.vector.Layer}
   * @private
   */
  this.secondaryRootLayer_ = null;

  anychart.core.series.StockScroller.base(this, 'constructor', scroller, scroller, type, config);
};
goog.inherits(anychart.core.series.StockScroller, anychart.core.series.Stock);


//region Legacy
//----------------------------------------------------------------------------------------------------------------------
//
//  Legacy
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * @type {Function}
 */
anychart.core.series.StockScroller.prototype[anychart.opt.SELECTED_FILL] = anychart.core.series.Base.prototype[anychart.opt.SELECT_FILL];


/**
 * @type {Function}
 */
anychart.core.series.StockScroller.prototype[anychart.opt.SELECTED_STROKE] = anychart.core.series.Base.prototype[anychart.opt.SELECT_STROKE];


/**
 * @type {Function}
 */
anychart.core.series.StockScroller.prototype[anychart.opt.SELECTED_RISING_STROKE] = anychart.core.series.Base.prototype[anychart.opt.SELECT_RISING_STROKE];


/**
 * @type {Function}
 */
anychart.core.series.StockScroller.prototype[anychart.opt.SELECTED_FALLING_STROKE] = anychart.core.series.Base.prototype[anychart.opt.SELECT_FALLING_STROKE];
//endregion


//region Config
//----------------------------------------------------------------------------------------------------------------------
//
//  Config
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.series.StockScroller.prototype.applyConfig = function(config) {
  // Scroller series MUST have a secondaryShapesConfig and MUST NOT use container as root.
  if (goog.isNull(config.secondaryShapesConfig) ||
      !!(config.capabilities & anychart.core.drawers.Capabilities.USES_CONTAINER_AS_ROOT))
    throw Error('Wrong config for scroller series');

  goog.dispose(this.secondaryDrawer_);
  goog.dispose(this.secondaryShapeManager_);

  this.secondaryDrawer_ = /** @type {!anychart.core.drawers.Base} */(new anychart.core.drawers.AvailableDrawers[config.drawerType](this));
  var interactive = !!(config.capabilities & anychart.core.series.Capabilities.ALLOW_INTERACTIVITY);
  var smc = (config.shapeManagerType == anychart.enums.ShapeManagerTypes.PER_POINT) ?
      anychart.core.shapeManagers.PerPoint :
      anychart.core.shapeManagers.PerSeries;
  this.secondaryShapeManager_ = new smc(this,
      /** @type {!Array.<anychart.core.shapeManagers.ShapeConfig>} */(config.secondaryShapesConfig),
      interactive, anychart.opt.SECONDARY_SHAPES, config.postProcessor);

  anychart.core.series.StockScroller.base(this, 'applyConfig', config);
};
//endregion


//region Infrastructure
//----------------------------------------------------------------------------------------------------------------------
//
//  Infrastructure
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Container for the second, selected replica of the series.
 * @param {(acgraph.vector.ILayer|string|Element)=} opt_value .
 * @return {(acgraph.vector.ILayer|!anychart.core.series.Stock)} .
 */
anychart.core.series.StockScroller.prototype.secondaryContainer = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.secondaryContainer_ != opt_value) {
      var containerBounds = this.secondaryContainer_ && this.secondaryContainer_.getStage() && this.secondaryContainer_.getStage().getBounds();
      if (goog.isString(opt_value) || goog.dom.isElement(opt_value)) {
        // Should we use registerDisposable in this case?
        // TODO(Anton Saukh): fix type cast to {Element|string} when this will be fixed in graphics.
        this.secondaryContainer_ = acgraph.create();
        this.registerDisposable(this.secondaryContainer_);
        this.secondaryContainer_.container(/** @type {Element} */(opt_value));

        //if graphics engine can't recognize passed container
        //we should destroy stage to avoid uncontrolled behaviour
        if (!this.secondaryContainer_.container()) {
          this.secondaryContainer_.dispose();
          this.secondaryContainer_ = null;
          return this;
        }
      } else {
        this.secondaryContainer_ = /** @type {acgraph.vector.ILayer} */(opt_value);
      }

      var state = anychart.ConsistencyState.CONTAINER;
      var newContainerBounds = this.secondaryContainer_ && this.secondaryContainer_.getStage() && this.secondaryContainer_.getStage().getBounds();
      if (!goog.math.Rect.equals(containerBounds, newContainerBounds))
        state |= anychart.ConsistencyState.BOUNDS;

      this.invalidate(state, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.secondaryContainer_;
};


/** @inheritDoc */
anychart.core.series.StockScroller.prototype.registerDataSource = function() {
  this.getMainChart().registerSource(/** @type {!anychart.data.TableSelectable} */(this.getSelectableData()), true);
};


/** @inheritDoc */
anychart.core.series.StockScroller.prototype.getPreFirstPoint = function() {
  return null;
};


/** @inheritDoc */
anychart.core.series.StockScroller.prototype.getPostLastPoint = function() {
  return null;
};


/**
 * Getter for the main stock chart.
 * @return {anychart.charts.Stock}
 */
anychart.core.series.StockScroller.prototype.getMainChart = function() {
  return (/** @type {anychart.core.stock.Scroller} */(this.chart)).getChart();
};


/** @inheritDoc */
anychart.core.series.StockScroller.prototype.getDetachedIterator = function() {
  return this.getSelectableData().getIteratorInternal(true, true);
};
//endregion


//region Drawing
//----------------------------------------------------------------------------------------------------------------------
//
//  Drawing
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.series.StockScroller.prototype.remove = function() {
  if (this.secondaryRootLayer_) {
    this.secondaryRootLayer_.remove();
  }
  anychart.core.series.StockScroller.base(this, 'remove');
};


/** @inheritDoc */
anychart.core.series.StockScroller.prototype.startDrawing = function() {
  anychart.core.series.StockScroller.base(this, 'startDrawing');
  this.secondaryDrawer_.startDrawing(this.secondaryShapeManager_);
};


/** @inheritDoc */
anychart.core.series.StockScroller.prototype.drawPoint = function(point, state) {
  anychart.core.series.StockScroller.base(this, 'drawPoint', point, state);
  this.secondaryDrawer_.drawPoint(point, state);
};


/** @inheritDoc */
anychart.core.series.StockScroller.prototype.finalizeDrawing = function() {
  anychart.core.series.StockScroller.base(this, 'finalizeDrawing');
  this.secondaryDrawer_.finalizeDrawing();
};


/** @inheritDoc */
anychart.core.series.StockScroller.prototype.prepareRootLayer = function() {
  anychart.core.series.StockScroller.base(this, 'prepareRootLayer');

  if (!this.secondaryRootLayer_) {
    this.secondaryRootLayer_ = acgraph.layer();
  }
  this.secondaryRootLayer_.zIndex(/** @type {number} */(this.zIndex()));
  this.secondaryRootLayer_.parent(this.secondaryContainer_);

  // we should clear shape manager before changing container, because it would cause a big overhead in that case.
  if (this.hasInvalidationState(anychart.ConsistencyState.SERIES_POINTS))
    this.secondaryShapeManager_.clearShapes();

  this.secondaryShapeManager_.setContainer(this.secondaryRootLayer_);
};


/** @inheritDoc */
anychart.core.series.StockScroller.prototype.applyZIndex = function() {
  var zIndex = /** @type {number} */(this.zIndex());
  this.rootLayer.zIndex(zIndex);
  this.secondaryRootLayer_.zIndex(zIndex);
};


/** @inheritDoc */
anychart.core.series.StockScroller.prototype.updateColors = function() {
  if (this.shapeManager instanceof anychart.core.shapeManagers.PerPoint) {
    var iterator = this.getResetIterator();
    while (iterator.advance()) {
      this.shapeManager.updateColors(this.getPointState(iterator.getIndex()),
          /** @type {Object.<string, acgraph.vector.Shape>} */(iterator.meta(anychart.opt.SHAPES)));
    }
  } else {
    this.shapeManager.updateColors(this.getSeriesState());
  }
};
//endregion


//region Serialization/Deserialization
//----------------------------------------------------------------------------------------------------------------------
//
//  Serialization/Deserialization
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * @inheritDoc
 */
anychart.core.series.StockScroller.prototype.setupByJSON = function(config, opt_default) {
  goog.base(this, 'setupByJSON', config, opt_default);

  // Legacy
  this[anychart.opt.SELECTED_FILL](config[anychart.opt.SELECT_FILL]);
  this[anychart.opt.SELECTED_STROKE](config[anychart.opt.SELECT_STROKE]);
  this[anychart.opt.SELECTED_RISING_STROKE](config[anychart.opt.SELECT_RISING_STROKE]);
  this[anychart.opt.SELECTED_FALLING_STROKE](config[anychart.opt.SELECT_FALLING_STROKE]);
};
//endregion
