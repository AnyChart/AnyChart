goog.provide('anychart.stockModule.ScrollerSeries');
goog.require('anychart.core.shapeManagers.PerPoint');
goog.require('anychart.core.shapeManagers.PerSeries');
goog.require('anychart.stockModule.Series');



/**
 * Class that represents a series for the user.
 * @param {!anychart.stockModule.Scroller} scroller
 * @param {string} type
 * @param {anychart.core.series.TypeConfig} config
 * @constructor
 * @extends {anychart.stockModule.Series}
 */
anychart.stockModule.ScrollerSeries = function(scroller, type, config) {
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

  anychart.stockModule.ScrollerSeries.base(this, 'constructor', scroller, scroller, type, config);
};
goog.inherits(anychart.stockModule.ScrollerSeries, anychart.stockModule.Series);


//region Config
//----------------------------------------------------------------------------------------------------------------------
//
//  Config
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.stockModule.ScrollerSeries.prototype.applyConfig = function(config, opt_reapplyClip) {
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

  anychart.stockModule.ScrollerSeries.base(this, 'applyConfig', config, opt_reapplyClip);
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
 * @return {(acgraph.vector.ILayer|!anychart.stockModule.Series)} .
 */
anychart.stockModule.ScrollerSeries.prototype.secondaryContainer = function(opt_value) {
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
anychart.stockModule.ScrollerSeries.prototype.registerDataSource = function() {
  this.getMainChart().registerSource(/** @type {!anychart.stockModule.data.TableSelectable} */(this.getSelectableData()), true);
};


/** @inheritDoc */
anychart.stockModule.ScrollerSeries.prototype.getPreFirstPoint = function() {
  return null;
};


/** @inheritDoc */
anychart.stockModule.ScrollerSeries.prototype.getPostLastPoint = function() {
  return null;
};


/**
 * Getter for the main stock chart.
 * @return {anychart.stockModule.Chart}
 */
anychart.stockModule.ScrollerSeries.prototype.getMainChart = function() {
  return (/** @type {anychart.stockModule.Scroller} */(this.chart)).getChart();
};


/** @inheritDoc */
anychart.stockModule.ScrollerSeries.prototype.getDetachedIterator = function() {
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
anychart.stockModule.ScrollerSeries.prototype.getPointState = function(index) {
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
anychart.stockModule.ScrollerSeries.prototype.remove = function() {
  if (this.secondaryRootLayer_) {
    this.secondaryRootLayer_.remove();
  }
  anychart.stockModule.ScrollerSeries.base(this, 'remove');
};


/** @inheritDoc */
anychart.stockModule.ScrollerSeries.prototype.startDrawing = function() {
  anychart.stockModule.ScrollerSeries.base(this, 'startDrawing');
  this.secondaryDrawer_.startDrawing(this.secondaryShapeManager_);
};


/** @inheritDoc */
anychart.stockModule.ScrollerSeries.prototype.drawPoint = function(point, state) {
  anychart.stockModule.ScrollerSeries.base(this, 'drawPoint', point, state);
  this.secondaryDrawer_.drawPoint(point, state);
};


/** @inheritDoc */
anychart.stockModule.ScrollerSeries.prototype.finalizeDrawing = function() {
  anychart.stockModule.ScrollerSeries.base(this, 'finalizeDrawing');
  this.secondaryDrawer_.finalizeDrawing();
};


/** @inheritDoc */
anychart.stockModule.ScrollerSeries.prototype.prepareRootLayer = function() {
  anychart.stockModule.ScrollerSeries.base(this, 'prepareRootLayer');

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
anychart.stockModule.ScrollerSeries.prototype.applyZIndex = function() {
  var zIndex = /** @type {number} */(this.zIndex());
  this.rootLayer.zIndex(zIndex);
  this.secondaryRootLayer_.zIndex(zIndex);
};


/** @inheritDoc */
anychart.stockModule.ScrollerSeries.prototype.disposeInternal = function() {
  this.remove();
  goog.disposeAll(this.secondaryDrawer_, this.secondaryShapeManager_);
  this.secondaryDrawer_ = null;
  this.secondaryShapeManager_ = null;
  anychart.stockModule.ScrollerSeries.base(this, 'disposeInternal');
};


//endregion
