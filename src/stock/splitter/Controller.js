goog.provide('anychart.stockModule.splitter.Controller');


//region -- Requirements.
goog.require('anychart.core.Base');
goog.require('anychart.stockModule.splitter.SplittersStorage');



//endregion
//region -- Constructor.
/**
 *
 * @param {anychart.stockModule.Chart} chart - Related stock chart.
 * @constructor
 * @extends {anychart.core.Base}
 */
anychart.stockModule.splitter.Controller = function(chart) {
  anychart.stockModule.splitter.Controller.base(this, 'constructor');

  this.chart = chart;

  /**
   * Splitters container.
   * @type {acgraph.vector.Layer}
   * @private
   */
  this.layer_ = this.chart.getRootElement().layer();
  this.layer_.attr('data-name', 'stock-splitters-layer');
  this.layer_.zIndex(1e5); //Top of all.

  /**
   * Splitters storage.
   * @type {anychart.stockModule.splitter.SplittersStorage}
   * @private
   */
  this.splitters_ = new anychart.stockModule.splitter.SplittersStorage(this.layer_, this.chart);
  this.splitters_.listen('dragStart', function(e) {
    this.dragging_ = true;
  }, void 0, this);

  this.splitters_.listen('dragEnd', function(e) {
    this.dragging_ = false;
  }, void 0, this);

  /**
   * Flag whether controller is in dragging process.
   * @type {boolean}
   * @private
   */
  this.dragging_ = false;

};
goog.inherits(anychart.stockModule.splitter.Controller, anychart.core.Base);


//endregion
//region -- Sync.
/**
 * Synchronizes plot bounds for splitter settings.
 */
anychart.stockModule.splitter.Controller.prototype.sync = function() {
  this.splitters_.reset();

  if (!this.chart.isPlotsManualBounds() && !this.dragging_) {
    var plots = this.chart.getEnabledPlots();

    var i, plot, hasExpandedPlot = false;
    for (i = 0; i < plots.length; i++) {
      plot = plots[i];
      if (plot.isExpanded()) {
        hasExpandedPlot = true;
        break;
      }
    }

    if (!hasExpandedPlot && this.chart.splitters()['enabled']()) {
      for (i = 0; i < plots.length; i++) {
        plot = plots[i];

        if (!plot.isFirstPlot()) {
          var bounds = plot.getPixelBounds();
          var prevPlot = this.chart.getPrevPlot(plot);
          var prevPlotBounds = prevPlot.getPixelBounds();

          var splittersData = /** @type {anychart.stockModule.splitter.SplittersStorage.SplittersData} */ (this.splitters_.add());
          var splitter = splittersData.actualSplitter;
          splitter
              .moveTo(bounds.left, bounds.top)
              .lineTo(bounds.left + bounds.width, bounds.top)
              // .lineTo(bounds.left + bounds.width, bounds.top + bounds.height)
              // .lineTo(bounds.left, bounds.top + bounds.height)
              // .close()
              .attr('ac-top', bounds.top);

          var visualSplitter = splittersData.visualSplitter;
          visualSplitter
              .moveTo(bounds.left, bounds.top + 0.5)
              .lineTo(bounds.left + bounds.width, bounds.top + 0.5);

          this.splitters_.setPlots(prevPlot, plot);


          var plotArea = plot.getPlotBounds();
          var prevPlotArea = prevPlot.getPlotBounds();
          var upperDelta = prevPlotBounds.height - prevPlotArea.height + 20;
          var lowerDelta = bounds.height - plotArea.height + 20;
          var limitingRect = goog.math.Rect.boundingRect(prevPlotBounds, bounds);
          limitingRect.top += upperDelta;
          limitingRect.height -= (upperDelta + lowerDelta);
          // console.log(limitingRect);
          //
          // var r = this.layer_.rect();
          // r.setBounds(limitingRect);
          // r.stroke('red');

          this.splitters_.limit(limitingRect, upperDelta, lowerDelta);
        }
      }
      this.splitters_.clearRemaining();
    }
  }
};


//endregion
//region -- Disposing.
/**
 * @inheritDoc
 */
anychart.stockModule.splitter.Controller.prototype.disposeInternal = function() {
  this.chart = null;

  goog.disposeAll(this.layer_, this.splitters_);

  this.layer_ = null;
  this.splitters_ = null;
  anychart.stockModule.splitter.Controller.base(this, 'disposeInternal');
};


//endregion

