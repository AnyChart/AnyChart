goog.provide('anychart.core.series.StockScroller');
goog.require('anychart.core.series.Stock');
goog.require('anychart.core.shapeManagers.PerPoint');
goog.require('anychart.core.shapeManagers.PerSeries');



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
anychart.core.series.StockScroller.prototype['selectedFill'] = anychart.core.series.Base.prototype['selectFill'];


/**
 * @type {Function}
 */
anychart.core.series.StockScroller.prototype['selectedStroke'] = anychart.core.series.Base.prototype['selectStroke'];


/**
 * @type {Function}
 */
anychart.core.series.StockScroller.prototype['selectedRisingStroke'] = anychart.core.series.Base.prototype['selectRisingStroke'];


/**
 * @type {Function}
 */
anychart.core.series.StockScroller.prototype['selectedFallingStroke'] = anychart.core.series.Base.prototype['selectFallingStroke'];
//endregion


//region Config
//----------------------------------------------------------------------------------------------------------------------
//
//  Config
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.series.StockScroller.prototype.applyConfig = function(config, opt_default) {
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
      interactive, 'secondaryShapes', config.postProcessor);

  anychart.core.series.StockScroller.base(this, 'applyConfig', config, opt_default);
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
 * @param {acgraph.vector.ILayer=} opt_value .
 * @return {(acgraph.vector.ILayer|!anychart.core.series.Stock)} .
 */
anychart.core.series.StockScroller.prototype.secondaryContainer = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.secondaryContainer_ != opt_value) {
      this.secondaryContainer_ = opt_value;
      this.invalidate(anychart.ConsistencyState.CONTAINER, anychart.Signal.NEEDS_REDRAW);
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


//region Interactivity
//----------------------------------------------------------------------------------------------------------------------
//
//  Interactivity
//
//----------------------------------------------------------------------------------------------------------------------


/** @inheritDoc */
anychart.core.series.StockScroller.prototype.getPointState = function(index) {
  return anychart.PointState.NORMAL;
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
  anychart.core.series.StockScroller.base(this, 'setupByJSON', config, opt_default);

  // Legacy
  this['selectedFill'](config['selectFill']);
  this['selectedStroke'](config['selectStroke']);
  this['selectedRisingStroke'](config['selectRisingStroke']);
  this['selectedFallingStroke'](config['selectFallingStroke']);
};
//endregion
