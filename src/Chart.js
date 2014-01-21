goog.provide('anychart.Chart');

goog.require('anychart.elements.Background');
goog.require('anychart.elements.BaseWithBounds');
goog.require('anychart.elements.Title');
goog.require('anychart.utils.Margin');
goog.require('anychart.utils.Padding');
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

  /**
   * @type {anychart.elements.Title}
   * @private
   */
  this.title_ = null;

  /**
   * @type {anychart.utils.Padding}
   * @private
   */
  this.padding_ = null;


  this.bounds().set(0, 0, '100%', '100%');
  this.margin(10, 20, 10, 20);
  this.padding(10, 20, 10, 20);
  this.title('Chart title');
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
        anychart.utils.ConsistencyState.APPEARANCE |
        anychart.utils.ConsistencyState.BACKGROUND_APPEARANCE |
        anychart.utils.ConsistencyState.TITLE_APPEARANCE;


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
  if (!this.margin_) {
    this.margin_ = new anychart.utils.Margin();
    this.margin_.listen(anychart.utils.Invalidatable.INVALIDATED, this.marginInvalidated_, false, this);
    this.registerDisposable(this.margin_);
  }

  if (goog.isDef(opt_spaceOrTopOrTopAndBottom)) {
    this.margin_.set(opt_spaceOrTopOrTopAndBottom, opt_rightOrRightAndLeft, opt_bottom, opt_left);
    return this;
  }
  return this.margin_;
};


/**
 * Internal margin invalidation handler.
 * @param {anychart.utils.InvalidatedStatesEvent} event Event object.
 * @private
 */
anychart.Chart.prototype.marginInvalidated_ = function(event) {
  //что бы не поменялось в марджинах, оно влияет на размер чарта, значит нужно перерисовывать все
  this.invalidate(anychart.utils.ConsistencyState.APPEARANCE);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Padding.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Chart padding.
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
 * @return {anychart.Chart|anychart.utils.Padding} Current margin or chart instance for chaining call.
 */
anychart.Chart.prototype.padding = function(opt_spaceOrTopOrTopAndBottom, opt_rightOrRightAndLeft, opt_bottom, opt_left) {
  if (!this.padding_) {
    this.padding_ = new anychart.utils.Padding();
    this.padding_.listen(anychart.utils.Invalidatable.INVALIDATED, this.paddingInvalidated_, false, this);
    this.registerDisposable(this.padding_);
  }

  if (goog.isDef(opt_spaceOrTopOrTopAndBottom)) {
    this.padding_.set(opt_spaceOrTopOrTopAndBottom, opt_rightOrRightAndLeft, opt_bottom, opt_left);
    return this;
  }
  return this.padding_;
};


/**
 * Internal padding invalidation handler.
 * @param {anychart.utils.InvalidatedStatesEvent} event Event object.
 * @private
 */
anychart.Chart.prototype.paddingInvalidated_ = function(event) {
  //что бы не поменялось в паддингах, оно влияет на размер чарта, значит нужно перерисовывать все
  this.invalidate(anychart.utils.ConsistencyState.APPEARANCE);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Background.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Chart background.
 * @param {(anychart.elements.Background)=} opt_value Background object to set.
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
  // что бы не изменилось в фоне, мы перерисовываем только фон.
  // он никак не может повлиять на остальные елементы
  this.invalidate(anychart.utils.ConsistencyState.BACKGROUND_APPEARANCE);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Title.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Chart title.
 * @param {(string|anychart.elements.Title)=} opt_value Chart title text or title instance for copy settings from.
 * @return {anychart.elements.Title|anychart.Chart} Chart title or chart instance for chaining call.
 */
anychart.Chart.prototype.title = function(opt_value) {
  if (!this.title_) {
    this.title_ = new anychart.elements.Title();
    this.title_.listen(anychart.utils.Invalidatable.INVALIDATED, this.titleInvalidated_, false, this);
    this.registerDisposable(this.title_);
  }

  if (goog.isDef(opt_value)) {
    if (goog.isString(opt_value)) {
      this.title_.text(opt_value);
    } else if (opt_value instanceof anychart.elements.Title) {
      this.title_.cloneFrom(opt_value);
    }
    return this;
  }
  return this.title_;
};


/**
 * Internal title invalidation handler.
 * @param {anychart.utils.InvalidatedStatesEvent} event Event object.
 * @private
 */
anychart.Chart.prototype.titleInvalidated_ = function(event) {
  //Если у тайтла поменялись размеры, то это влияет на весь график и нужно перерисовывать все
  if (event.invalidated(anychart.utils.ConsistencyState.PIXEL_BOUNDS)) {
    this.invalidate(anychart.utils.ConsistencyState.APPEARANCE);
  } else {
    //Если размер не поменялся, то все остальное (цвет текста или фона) на график не влияет
    this.invalidate(anychart.utils.ConsistencyState.TITLE_APPEARANCE);
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

  //total chart area bounds, do not override, it can be useful later.
  var totalBounds;
  //chart area with applied margin.
  var boundsWithoutMargin;
  //chart area with applied margin and padding
  var boundsWithoutPadding;
  // chart area with applied margin, padding and title
  var boundsWithoutTitle;
  //chart content bounds, allocated space for all chart appearance items.
  var contentAreaBounds;

  //suspend stage
  var stage = this.rootElement.getStage();
  var manualSuspend = stage && !stage.isSuspended();
  if (manualSuspend) stage.suspend();

  totalBounds = /** @type {!anychart.math.Rect} */(this.pixelBounds());
  boundsWithoutMargin = this.margin_ ?
      this.margin_.tightenBounds(totalBounds) :
      totalBounds;

  //start clear appearance states
  if (this.shouldDrawBackground()) {
    this.background_.suspendInvalidationDispatching();
    if (!this.background_.container()) this.background_.container(this.rootElement);
    this.background_.pixelBounds(boundsWithoutMargin);
    this.background_.resumeInvalidationDispatching(false);
    this.background_.draw();
    this.markConsistent(anychart.utils.ConsistencyState.BACKGROUND_APPEARANCE);
  }

  boundsWithoutPadding = this.padding_ ?
      this.padding_.tightenBounds(boundsWithoutMargin) :
      boundsWithoutMargin;

  if (this.shouldDrawTitle()) {
    this.title_.suspendInvalidationDispatching();
    if (!this.title_.container()) this.title_.container(this.rootElement);
    this.title_.parentBounds(boundsWithoutPadding);
    this.title_.resumeInvalidationDispatching(false);
    this.title_.draw();
    this.markConsistent(anychart.utils.ConsistencyState.TITLE_APPEARANCE);
  }

  boundsWithoutTitle = this.title_ ?
      this.title_.getRemainingBounds() :
      boundsWithoutPadding;

  contentAreaBounds = boundsWithoutTitle.clone();
  this.drawContent(contentAreaBounds);

  this.markConsistent(anychart.utils.ConsistencyState.APPEARANCE);
  //end clear appearance states

  //start clear container depend states
  if (this.hasInvalidationState(anychart.utils.ConsistencyState.Z_INDEX)) {
    this.rootElement.zIndex(/** @type {number} */(this.zIndex()));
    this.markConsistent(anychart.utils.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.utils.ConsistencyState.CONTAINER)) {
    this.rootElement.parent(/** @type {acgraph.vector.ILayer} */(this.container()));
    this.markConsistent(anychart.utils.ConsistencyState.CONTAINER);
  }
  //end clear container depend states

  //after all chart items drawn, we can clear other states
  this.markConsistent(anychart.utils.ConsistencyState.BOUNDS);
  this.markConsistent(anychart.utils.ConsistencyState.PIXEL_BOUNDS);

  if (manualSuspend) stage.resume();

  //todo(Anton Saukh): rework this shit!
  this.listen(anychart.utils.Invalidatable.INVALIDATED, this.invalidateHandler_, false, this);
  //end shit

  return this;
};


/**
 * Extension point do draw chart content.
 * @param {acgraph.math.Rect} bounds Chart content area bounds.
 */
anychart.Chart.prototype.drawContent = goog.nullFunction;


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


/**
 * Define, should we draw background or not.
 * @return {boolean} Should we draw background or not.
 */
anychart.Chart.prototype.shouldDrawBackground = function() {
  return !!(this.background_ && (
      this.hasInvalidationState(anychart.utils.ConsistencyState.APPEARANCE) ||
          this.hasInvalidationState(anychart.utils.ConsistencyState.BACKGROUND_APPEARANCE)));
};


/**
 * Define, should we draw background or not.
 * @return {boolean} Should we draw background or not.
 */
anychart.Chart.prototype.shouldDrawTitle = function() {
  return !!(this.title_ && (
      this.hasInvalidationState(anychart.utils.ConsistencyState.APPEARANCE) ||
          this.hasInvalidationState(anychart.utils.ConsistencyState.TITLE_APPEARANCE)));
};

