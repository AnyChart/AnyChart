goog.provide('anychart.stockModule.splitter.SplittersStorage');

//region -- Requirements.
goog.require('acgraph.vector.Path');
goog.require('anychart.stockModule.splitter.Dragger');
goog.require('goog.events.EventTarget');



//endregion
//region -- Constructor.
/**
 * Splitter factory-like storage.
 * @param {acgraph.vector.Layer} container - Container.
 * @param {anychart.stockModule.Chart} chart - Container.
 * @constructor
 * @extends {goog.events.EventTarget}
 */
anychart.stockModule.splitter.SplittersStorage = function(container, chart) {
  anychart.stockModule.splitter.SplittersStorage.base(this, 'constructor');

  /**
   * Splitters storage.
   * @type {Array.<acgraph.vector.Path>}
   * @private
   */
  this.splitters_ = [];

  /**
   * Visual splitters storage.
   * Visual splitter is undraggable entity right under the actual splitter.
   * @type {Array.<acgraph.vector.Path>}
   * @private
   */
  this.visualSplitters_ = [];

  this.chart_ = chart;

  /**
   * Draggers storage.
   * @type {Array.<anychart.stockModule.splitter.Dragger>}
   * @private
   */
  this.draggers_ = [];

  /**
   * Container.
   * @type {acgraph.vector.Layer}
   * @private
   */
  this.container_ = container;

  /**
   * Index of current to give.
   * @type {number}
   * @private
   */
  this.index_ = 0;

  /**
   *
   * @type {Array.<goog.math.Rect>}
   * @private
   */
  this.limitingBounds_ = [];

  /**
   * Upper plot height limits.
   * @type {Array.<number>}
   * @private
   */
  this.upperLimits_ = [];

  /**
   * Lower plot height limits.
   * @type {Array.<number>}
   * @private
   */
  this.lowerLimits_ = [];


  /**
   * Map of plots data related to splitter.
   * @type {Object.<anychart.stockModule.splitter.SplittersStorage.PlotsData>}
   * @private
   */
  this.plotsData_ = {};

  /**
   * Drag preview path.
   * @type {acgraph.vector.Path}
   * @private
   */
  // this.previewPath_ = /** @type {acgraph.vector.Path} */ (container.path().fill('black 0.1').stroke('none'));
  this.previewPath_ = /** @type {acgraph.vector.Path} */ (container.path().stroke('none'));

  /**
   *
   * @type {number}
   * @private
   */
  this.currentY_ = 0;
};
goog.inherits(anychart.stockModule.splitter.SplittersStorage, goog.events.EventTarget);


//endregion
//region -- Type definitions.
/**
 * @typedef {{
 *   upperPlot: anychart.stockModule.Plot,
 *   lowerPlot: anychart.stockModule.Plot
 * }}
 */
anychart.stockModule.splitter.SplittersStorage.PlotsData;


/**
 * @typedef {{
 *   actualSplitter: acgraph.vector.Path,
 *   visualSplitter: acgraph.vector.Path
 * }}
 */
anychart.stockModule.splitter.SplittersStorage.SplittersData;


//endregion
//region -- Dragging.
/**
 * Drag mouse down handler.
 * Initializes drag events.
 * @param {acgraph.events.BrowserEvent} e - Event.
 * @private
 */
anychart.stockModule.splitter.SplittersStorage.prototype.initDragger_ = function(e) {
  var el = e.target;
  var index = el.tag;

  var dragger = new anychart.stockModule.splitter.Dragger(/** @type {acgraph.vector.Path} */ (el), this.visualSplitters_[index]);
  dragger.setLimitingBounds(this.limitingBounds_[index]);
  dragger.listen(goog.fx.Dragger.EventType.START, this.dragStart_, false, this);
  dragger.listen(goog.fx.Dragger.EventType.DRAG, this.drag_, false, this);
  dragger.listen(goog.fx.Dragger.EventType.END, this.dragEnd_, false, this);
  this.draggers_[index] = dragger;

  dragger.startDrag(e.getOriginalEvent());
};


/**
 * Drag start handler.
 * @param {goog.fx.DragEvent} e - Event.
 * @private
 */
anychart.stockModule.splitter.SplittersStorage.prototype.dragStart_ = function(e) {
  this.dispatchEvent('dragStart');
};


/**
 * Drag handler.
 * @param {goog.fx.DragEvent} e - Event.
 * @private
 */
anychart.stockModule.splitter.SplittersStorage.prototype.drag_ = function(e) {
  var dragger = /** @type {anychart.stockModule.splitter.Dragger} */ (e.dragger);
  var path = dragger.actualSplitter;

  var startY = Number(path.attr('ac-top'));
  var left = dragger.limitingBounds.left;
  var right = dragger.limitingBounds.left + dragger.limitingBounds.width;

  this.currentY_ = dragger.currentY;

  this.previewPath_
      .fill(this.chart_.splitters().preview()['fill']())
      .clear()
      .moveTo(left, startY)
      .lineTo(right, startY)
      .lineTo(right, this.currentY_)
      .lineTo(left, this.currentY_)
      .close();

};


/**
 * Drag end handler.
 * @param {goog.fx.DragEvent} e - Event.
 * @private
 */
anychart.stockModule.splitter.SplittersStorage.prototype.dragEnd_ = function(e) {
  this.previewPath_.clear();

  this.dispatchEvent('dragEnd');

  var dragger = /** @type {anychart.stockModule.splitter.Dragger} */ (e.dragger);
  var path = dragger.actualSplitter;
  var index = Number(path.tag);
  var limitingBounds = dragger.limitingBounds;

  var upperHeightLimit = this.upperLimits_[index];
  var lowerHeightLimit = this.lowerLimits_[index];

  var upperRatio = (this.currentY_ - limitingBounds.top + upperHeightLimit) / (limitingBounds.height + upperHeightLimit + lowerHeightLimit);

  var plotData = this.plotsData_[index];

  var upperWeight = /** @type {number} */ (plotData.upperPlot.getOption('weight'));
  var lowerWeight = /** @type {number} */ (plotData.lowerPlot.getOption('weight'));
  var weightsSum = upperWeight + lowerWeight;
  var newUpperWeight = upperRatio * weightsSum;
  var newLowerWeight = weightsSum - newUpperWeight;
  this.chart_.autoRedraw(false);
  plotData.upperPlot['weight'](newUpperWeight);
  plotData.lowerPlot['weight'](newLowerWeight);
  this.chart_.autoRedraw(true);
};


//endregion
//region -- Splitter exchange.
/**
 * Resets splitters usage.
 */
anychart.stockModule.splitter.SplittersStorage.prototype.reset = function() {
  this.index_ = 0;
  for (var i = 0; i < this.splitters_.length; i++) {
    var splitter = this.splitters_[i];
    splitter.clear();
    splitter.setTransformationMatrix(1, 0, 0, 1, 0, 0);

    var visualSplitter = this.visualSplitters_[i];
    visualSplitter.clear();
    visualSplitter.setTransformationMatrix(1, 0, 0, 1, 0, 0);
  }
};


/**
 * Gets or generates next splitter element.
 * @return {anychart.stockModule.splitter.SplittersStorage.SplittersData}
 */
anychart.stockModule.splitter.SplittersStorage.prototype.add = function() {
  var actualSplitter = this.splitters_[this.index_];
  var visualSplitter = this.visualSplitters_[this.index_];
  if (!actualSplitter) {
    visualSplitter = this.container_.path();
    visualSplitter.zIndex(0);
    this.visualSplitters_.push(visualSplitter);

    actualSplitter = this.container_.path();
    actualSplitter.zIndex(1);
    actualSplitter.stroke(/** @type {acgraph.vector.Stroke} */ (anychart.color.TRANSPARENT_HANDLER), 10);
    // actualSplitter.stroke('10 blue 0.5');
    actualSplitter.cursor(acgraph.vector.Cursor.NS_RESIZE);
    this.splitters_.push(actualSplitter);
    actualSplitter.tag = this.index_;

    /*
      NOTE: dragger for el can't be created right here
      because it requires a real DOM-element.
      Dragger is being created on first real DOM element mouse down.
     */
    actualSplitter.listenOnce(acgraph.events.EventType.MOUSEDOWN, this.initDragger_, false, this);

    actualSplitter.listen(acgraph.events.EventType.MOUSEMOVE, this.splitterMouseMove_, false, this);
    actualSplitter.listen(acgraph.events.EventType.MOUSEOUT, this.splitterMouseOut_, false, this);
  }

  this.index_++;
  visualSplitter.stroke(this.chart_.splitters().normal()['stroke']());

  return /** @type {anychart.stockModule.splitter.SplittersStorage.SplittersData} */ ({
    actualSplitter: actualSplitter,
    visualSplitter: visualSplitter
  });
};


/**
 * Limits splitter dragging.
 * Sets bounds instead of plot with bounds.
 * @param {goog.math.Rect} limitingBounds - Limiting bounds.
 * @param {number} upperHeightLimit - Height limit for upper plot bounds.
 * @param {number} lowerHeightLimit - Height limit for lower plot bounds.
 */
anychart.stockModule.splitter.SplittersStorage.prototype.limit = function(limitingBounds, upperHeightLimit, lowerHeightLimit) {
  var i = this.index_ - 1; //this.index_ here is already incremented, that's why use this.index_ - 1.
  var dragger = this.draggers_[i];
  if (dragger)
    dragger.setLimitingBounds(limitingBounds);
  else {
    this.limitingBounds_[i] = limitingBounds;
  }
  this.upperLimits_[i] = upperHeightLimit;
  this.lowerLimits_[i] = lowerHeightLimit;
};


/**
 * Sets plot data.
 * @param {anychart.stockModule.Plot} upperPlot - Upper plot.
 * @param {anychart.stockModule.Plot} lowerPlot - Lower plot.
 */
anychart.stockModule.splitter.SplittersStorage.prototype.setPlots = function(upperPlot, lowerPlot) {
  var i = this.index_ - 1; //this.index_ here is already incremented, that's why use this.index_ - 1.
  this.plotsData_[i] = /** @type {anychart.stockModule.splitter.SplittersStorage.PlotsData} */ ({
    upperPlot: upperPlot,
    lowerPlot: lowerPlot
  });
};


/**
 * Hides remaining splitters.
 */
anychart.stockModule.splitter.SplittersStorage.prototype.clearRemaining = function() {
  for (var i = this.index_; i < this.splitters_.length; i++) {
    this.splitters_[i].clear();
    this.visualSplitters_[i].clear();
  }
};


//endregion
//region -- Additional splitter mouse events.
/**
 * Splitter mouse move handler.
 * @param {acgraph.events.BrowserEvent} e - Event.
 * @private
 */
anychart.stockModule.splitter.SplittersStorage.prototype.splitterMouseMove_ = function(e) {
  var splitter = e['target'];
  var index = Number(splitter.tag);
  var visualSplitter = this.visualSplitters_[index];
  visualSplitter.stroke(this.chart_.splitters().hovered()['stroke']());
};


/**
 * Splitter mouse out handler.
 * @param {acgraph.events.BrowserEvent} e - Event.
 * @private
 */
anychart.stockModule.splitter.SplittersStorage.prototype.splitterMouseOut_ = function(e) {
  var splitter = e['target'];
  var index = Number(splitter.tag);
  var visualSplitter = this.visualSplitters_[index];
  visualSplitter.stroke(this.chart_.splitters().normal()['stroke']());
};


//endregion
//region -- Disposing.
/**
 * @inheritDoc
 */
anychart.stockModule.splitter.SplittersStorage.prototype.disposeInternal = function() {
  this.container_ = null;
  goog.disposeAll(this.splitters_, this.draggers_, this.visualSplitters_);

  this.splitters_.length = 0;
  this.visualSplitters_.length = 0;
  this.draggers_.length = 0;
  this.plotsData_ = null;
  anychart.stockModule.splitter.SplittersStorage.base(this, 'disposeInternal');
};


//endregion


