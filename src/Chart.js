goog.provide('anychart.Chart');

goog.require('anychart.elements.Background');
goog.require('anychart.elements.BaseWithBounds');
goog.require('anychart.utils.Margin');
goog.require('anychart.utils.ZIndexedLayer');



/**
 * Base chart.
 * @constructor
 * @extends {anychart.elements.BaseWithBounds}
 */
anychart.Chart = function() {
  //todo: этот суспенд можно заменить на флаг конкретно для чарта,если больше это нигде не понадобится.
  this.suspendInvalidationDispatching();
  goog.base(this);

  /**
   * @type {anychart.utils.ZIndexedLayer}
   * @protected
   */
  this.rootElement = new anychart.utils.ZIndexedLayer();

  /**
   * @type {anychart.elements.Background}
   * @private
   */
  this.background_ = null;


  /**
   * @type {anychart.utils.Margin}
   * @private
   */
  this.margin_ = null;


  this.bounds().set(0, 0, '100%', '100%');
  this.margin(10, 20, 10, 20);
  this.invalidate(anychart.utils.ConsistencyState.APPEARANCE);
  this.resumeInvalidationDispatching(false);
};
goog.inherits(anychart.Chart, anychart.elements.BaseWithBounds);


/**
 * Supported consistency states. Adds APPEARANCE to BaseWithBounds states.
 * @type {number}
 */
anychart.Chart.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.elements.BaseWithBounds.prototype.SUPPORTED_CONSISTENCY_STATES |
        anychart.utils.ConsistencyState.APPEARANCE;


//----------------------------------------------------------------------------------------------------------------------
//
//  Background.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Chart background.
 * @param {anychart.elements.Background=} opt_value Background object to set.
 * @return {anychart.Chart|anychart.elements.Background} Chart background or chart instance for chaining call.
 */
anychart.Chart.prototype.background = function(opt_value) {
  if (!this.background_) {
    this.background_ = new anychart.elements.Background();
    this.background_.cloneFrom(null);
    this.background_.listen(anychart.utils.Invalidatable.INVALIDATED, this.backgroundInvalidated_, false, this);
    this.registerDisposable(this.background_);
  }

  if (goog.isDef(opt_value)) {
    this.background_.cloneFrom(opt_value);
    return this;
  }
  return this.background_;
};


/**
 * Internal background invalidation handler.
 * @param {anychart.utils.InvalidatedStatesEvent} event Event object.
 * @private
 */
anychart.Chart.prototype.backgroundInvalidated_ = function(event) {
  if (event.invalidated(anychart.utils.ConsistencyState.APPEARANCE)) {
    this.invalidate(anychart.utils.ConsistencyState.APPEARANCE);
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Margin.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Chart margin.
 * Can accept other Space object or from 0 to 4 values (numbers or percent strings).
 * Space values are applied just as in CSS:
 * 1) set(25, 50, 75, 100):
 *    top space is 25
 *    right space is 50
 *    bottom space is 75
 *    left space is 100
 * 2) set(25, 50, 75):
 *    top space is 25
 *    right and left spaces are 50
 *    bottom space is 75
 * 3) set(25, 50):
 *    top and bottom spaces are 25
 *    right and left spaces are 50
 * 4) set(25):
 *    all four spaces are 25
 * 5) set():
 *    return current margin instance
 *
 * @param {(string|number|anychart.utils.Space)=} opt_spaceOrTopOrTopAndBottom Space object or top or top and bottom
 *    space.
 * @param {(string|number)=} opt_rightOrRightAndLeft Right or right and left space.
 * @param {(string|number)=} opt_bottom Bottom space.
 * @param {(string|number)=} opt_left Left space.
 * @return {anychart.Chart|anychart.utils.Margin} Current margin or chart instance for chaining call.
 */
anychart.Chart.prototype.margin = function(opt_spaceOrTopOrTopAndBottom, opt_rightOrRightAndLeft, opt_bottom, opt_left) {
  if (goog.isDef(opt_spaceOrTopOrTopAndBottom)) {
    if (!this.margin_) {
      this.margin_ = new anychart.utils.Margin();
      this.margin_.listen(anychart.utils.Invalidatable.INVALIDATED, this.marginInvalidated_, false, this);
      this.registerDisposable(this.margin_);
    }
    this.margin_.set(opt_spaceOrTopOrTopAndBottom, opt_rightOrRightAndLeft, opt_bottom, opt_left);
    return this;
  } else {
    return this.margin_;
  }
};


/**
 * Internal margin invalidation handler.
 * @param {anychart.utils.InvalidatedStatesEvent} event Event object.
 * @private
 */
anychart.Chart.prototype.marginInvalidated_ = function(event) {
  if (event.invalidated(anychart.utils.ConsistencyState.BOUNDS)) {
    this.invalidate(anychart.utils.ConsistencyState.APPEARANCE);
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Drawing.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Draw chart to specified container.
 * @return {anychart.Chart} Chart instance for chaining call.
 */
anychart.Chart.prototype.draw = function() {
  if (this.isConsistent()) return this;

  //suspend stage
  var stage = this.rootElement.getStage();
  var manualSuspend = stage && !stage.isSuspended();
  if (manualSuspend) stage.suspend();

  //total chart area bounds, do not override, it can be useful later.
  var totalBounds = /** @type {!anychart.math.Rect} */(this.pixelBounds());
  //chart area with applied margins.
  var boundsWithMargins = this.margin_ ?
      this.margin_.tightenBounds(totalBounds) :
      totalBounds;

  //clear appearance
  if (this.hasInvalidationState(anychart.utils.ConsistencyState.APPEARANCE)) {
    if (this.background_) {
      if (!this.background_.container()) this.background_.container(this.rootElement);
      this.background_.pixelBounds(boundsWithMargins);
      this.background_.draw();
    }
    this.markConsistent(anychart.utils.ConsistencyState.APPEARANCE);
  }

  //clear container
  if (this.hasInvalidationState(anychart.utils.ConsistencyState.CONTAINER)) {
    this.rootElement.parent(/** @type {acgraph.vector.ILayer} */(this.container()));
    this.rootElement.zIndex(/** @type {number} */(this.zIndex()));
    this.markConsistent(anychart.utils.ConsistencyState.CONTAINER);
  }

  //after all chart items drawn, we can clear other states
  this.markConsistent(anychart.utils.ConsistencyState.BOUNDS);
  this.markConsistent(anychart.utils.ConsistencyState.PIXEL_BOUNDS);

  if (manualSuspend) stage.resume();

  //todo(Anton Saukh): rework this shit!
  this.listen(anychart.utils.Invalidatable.INVALIDATED, this.invalidateHandler_, false, this);
  //end shit

  return this;
};


//todo(Anton Saukh): rework this shit!
/**
 * Internal invalidation event handler, redraw chart on all invalidate events.
 * @param {anychart.utils.InvalidatedStatesEvent} event Event object.
 * @private
 */
anychart.Chart.prototype.invalidateHandler_ = function(event) {
  if (event.invalidated(anychart.utils.ConsistencyState.PIXEL_BOUNDS)) {
    this.suspendInvalidationDispatching();
    this.invalidate(anychart.utils.ConsistencyState.APPEARANCE);
    this.resumeInvalidationDispatching(false);
  }
  this.draw();
};
//end shit
