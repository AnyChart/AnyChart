goog.provide('anychart.stockModule.splitter.Dragger');


//region -- Requirements.
goog.require('goog.fx.Dragger');



//endregion
/**
 * Splitters dragger.
 * @param {acgraph.vector.Path} actualSplitter - Actual splitter element.
 * @param {acgraph.vector.Path} visualSplitter - Visual splitter element.
 * @constructor
 * @extends {goog.fx.Dragger}
 */
anychart.stockModule.splitter.Dragger = function(actualSplitter, visualSplitter) {
  anychart.stockModule.splitter.Dragger.base(this, 'constructor', actualSplitter.domElement());

  /**
   * Actual splitter element.
   * @type {acgraph.vector.Path}
   */
  this.actualSplitter = actualSplitter;

  /**
   * Visual splitter element.
   * @type {acgraph.vector.Path}
   */
  this.visualSplitter = visualSplitter;

  /**
   *
   * @type {anychart.math.Rect}
   */
  this.limitingBounds = null;

  /**
   *
   * @type {number}
   */
  this.currentY = 0;
};
goog.inherits(anychart.stockModule.splitter.Dragger, goog.fx.Dragger);


//region -- Limiting.
/**
 *
 * @param {goog.math.Rect} limitingBounds - Upper limiting bounds.
 */
anychart.stockModule.splitter.Dragger.prototype.setLimitingBounds = function(limitingBounds) {
  this.limitingBounds = limitingBounds;
};


//endregion
//region -- Inherited overrides.
/**
 * @override
 */
anychart.stockModule.splitter.Dragger.prototype.computeInitialPosition = function() {
  this.deltaX = 0;
  this.deltaY = 0;
};


/**
 * @override
 */
anychart.stockModule.splitter.Dragger.prototype.defaultAction = function(x, y) {
  this.actualSplitter.setTransformationMatrix(1, 0, 0, 1, 0, y);
  this.visualSplitter.setTransformationMatrix(1, 0, 0, 1, 0, y);
};


/**
 * @override
 */
anychart.stockModule.splitter.Dragger.prototype.limitX = function(x) {
  return 0;
};


/**
 * @override
 */
anychart.stockModule.splitter.Dragger.prototype.limitY = function(y) {
  var max = this.limitingBounds.top + this.limitingBounds.height;
  var min = this.limitingBounds.top;
  var acTop = Number(this.actualSplitter.attr('ac-top'));
  var res = goog.math.clamp(y, min - acTop, max - acTop);
  this.currentY = res + acTop;
  return res;
};


//endregion
