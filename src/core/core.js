/**
 * Namespace anychart.core.
 * @namespace
 * @name anychart.core
 */

goog.provide('anychart.core.I3DProvider');
goog.provide('anychart.core.IChart');
goog.provide('anychart.core.IChartWithAnnotations');
goog.provide('anychart.core.IGroupingProvider');
goog.provide('anychart.core.IPlot');
goog.provide('anychart.core.IStandaloneBackend');
goog.require('goog.events.Listenable');
goog.forwardDeclare('anychart.core.series.TypeConfig');



//region IChart
//----------------------------------------------------------------------------------------------------------------------
//
//  IChart
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * @interface
 */
anychart.core.IChart = function() {};


/**
 * @return {anychart.core.Base}
 * @this {anychart.core.Base}
 */
anychart.core.IChart.prototype.suspendSignalsDispatching = function() {};


/**
 * @param {boolean} dispatch
 * @return {anychart.core.Base}
 * @this {anychart.core.Base}
 */
anychart.core.IChart.prototype.resumeSignalsDispatching = function(dispatch) {};


/**
 * @return {anychart.scales.IXScale|anychart.core.IChart}
 */
anychart.core.IChart.prototype.xScale = function() {};


/**
 * Returns normalized series type and a config for this series type.
 * @param {string} name
 * @return {?Array.<string|anychart.core.series.TypeConfig>}
 */
anychart.core.IChart.prototype.getConfigByType = function(name) {};


/**
 * Performs calculations before chart draw.
 * Also must include calculation of statistics.
 */
anychart.core.IChart.prototype.calculate = function() {};


/**
 * Ensures that all statistics is ready.
 */
anychart.core.IChart.prototype.ensureStatisticsReady = function() {};


/**
 * Whether IChart supports tooltip.
 * @return {boolean}
 */
anychart.core.IChart.prototype.supportsTooltip = function() {};


/**
 * Getter for an isVertical property.
 * @return {boolean}
 */
anychart.core.IChart.prototype.isVertical = function() {};

//endregion



//region IPlot
//----------------------------------------------------------------------------------------------------------------------
//
//  IPlot
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * @interface
 */
anychart.core.IPlot = function() {};


/**
 * @return {anychart.scales.Base|anychart.core.IPlot}
 */
anychart.core.IPlot.prototype.yScale = function() {};


/**
 * @return {!Array.<anychart.core.series.Base>}
 */
anychart.core.IPlot.prototype.getAllSeries = function() {};


/**
 * Getter/setter for series default settings.
 * @param {Object=} opt_value Object with default series settings.
 * @return {Object}
 */
anychart.core.IPlot.prototype.defaultSeriesSettings = function(opt_value) {};
//endregion



//region I3DProvider
//----------------------------------------------------------------------------------------------------------------------
//
//  I3DProvider
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * @interface
 */
anychart.core.I3DProvider = function() {};


/**
 * @param {number} seriesIndex
 * @param {boolean} seriesIsStacked
 * @return {number}
 */
anychart.core.I3DProvider.prototype.getX3DDistributionShift = function(seriesIndex, seriesIsStacked) {};


/**
 * @param {number} seriesIndex
 * @param {boolean} seriesIsStacked
 * @return {number}
 */
anychart.core.I3DProvider.prototype.getY3DDistributionShift = function(seriesIndex, seriesIsStacked) {};


/**
 * @param {boolean} seriesIsStacked
 * @return {number}
 */
anychart.core.I3DProvider.prototype.getX3DShift = function(seriesIsStacked) {};


/**
 * @param {boolean} seriesIsStacked
 * @return {number}
 */
anychart.core.I3DProvider.prototype.getY3DShift = function(seriesIsStacked) {};


/**
 * @return {number}
 */
anychart.core.I3DProvider.prototype.getX3DFullShift = function() {};


/**
 * @return {number}
 */
anychart.core.I3DProvider.prototype.getY3DFullShift = function() {};


/**
 * @param {number} seriesIndex
 * @param {boolean} seriesIsStacked
 * @param {string} scalesIds
 * @return {boolean}
 */
anychart.core.I3DProvider.prototype.shouldDrawTopSide = function(seriesIndex, seriesIsStacked, scalesIds) {};


/**
 * @return {boolean}
 */
anychart.core.I3DProvider.prototype.yInverted = function() {};


/**
 * @return {boolean}
 */
anychart.core.I3DProvider.prototype.xInverted = function() {};
//endregion



//region IGroupingProvider
//----------------------------------------------------------------------------------------------------------------------
//
//  IGroupingProvider
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * @interface
 * @extends {anychart.core.IChart}
 */
anychart.core.IGroupingProvider = function() {};


/**
 * @return {number}
 */
anychart.core.IGroupingProvider.prototype.getCurrentMinDistance = function() {};


/**
 * @return {anychart.core.IGroupingProvider|anychart.core.stock.Grouping}
 */
anychart.core.IGroupingProvider.prototype.grouping = function() {};
//endregion



//region IChartWithAnnotations
//----------------------------------------------------------------------------------------------------------------------
//
//  IChartWithAnnotations
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * @interface
 * @extends {anychart.core.IChart}
 * @extends {goog.events.Listenable}
 */
anychart.core.IChartWithAnnotations = function() {};


/**
 * Getter/setter for annotations default settings.
 * @param {Object=} opt_value
 * @return {Object}
 */
anychart.core.IChartWithAnnotations.prototype.defaultAnnotationSettings = function(opt_value) {};
//endregion



//region IStandaloneBackend
//----------------------------------------------------------------------------------------------------------------------
//
//  IStandaloneBackend
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * @interface
 */
anychart.core.IStandaloneBackend = function() {};


/**
 * Draw.
 * @return {anychart.core.IStandaloneBackend}
 */
anychart.core.IStandaloneBackend.prototype.draw = function() {};


/**
 * Sets consistency state to an element {@link anychart.ConsistencyState}.
 * @param {anychart.ConsistencyState|number} state State(s) to be set.
 * @param {(anychart.Signal|number)=} opt_signal Signal(s) to be sent to listener, if states have been set.
 * @return {number} Actually modified consistency states.
 */
anychart.core.IStandaloneBackend.prototype.invalidate = function(state, opt_signal) {};


/**
 * Invalidator for visual bounds.
 */
anychart.core.IStandaloneBackend.prototype.invalidateParentBounds = function() {};


/**
 * Whether element depends on container size.
 * @return {boolean} Depends or not.
 */
anychart.core.IStandaloneBackend.prototype.dependsOnContainerSize = function() {};


//endregion
//region Working with standalones
/**
 * Make class standalone.
 * @param {!Function} classConstructor
 * @param {!Function} parentConstructor
 */
anychart.core.makeStandalone = function(classConstructor, parentConstructor) {
  /**
   * @this {anychart.core.IStandaloneBackend}
   * @param {anychart.SignalEvent} e
   */
  function resizeHandler(e) {
    this.invalidateParentBounds();
  }

  /**
   * @this {anychart.core.IStandaloneBackend}
   */
  function signalHandler() {
    anychart.globalLock.onUnlock(this.draw, this);
  }

  classConstructor.prototype.draw = function() {
    parentConstructor.prototype.draw.call(this);

    var container = this.container();
    var stage = container ? container.getStage() : null;
    if (stage) {
      if (this.dependsOnContainerSize()) {
        stage.listen(
            acgraph.vector.Stage.EventType.STAGE_RESIZE,
            resizeHandler,
            false,
            this
        );
      } else {
        stage.unlisten(
            acgraph.vector.Stage.EventType.STAGE_RESIZE,
            resizeHandler,
            false,
            this
        );
      }
    }
    this.listenSignals(signalHandler, this);
    return this;
  };
};
//endregion
