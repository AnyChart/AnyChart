goog.provide('anychart.elements.BaseWithBounds');

goog.require('anychart.elements.Base');



/**
 * An extended base element that understands bounds settings and can handle percent values in it.
 * @constructor
 * @extends {anychart.elements.Base}
 */
anychart.elements.BaseWithBounds = function() {
  goog.base(this);
  this.invalidate(anychart.utils.ConsistencyState.BOUNDS);
  this.invalidate(anychart.utils.ConsistencyState.PIXEL_BOUNDS);
};
goog.inherits(anychart.elements.BaseWithBounds, anychart.elements.Base);


/**
 * Stores user settings about element bounds.
 * @type {anychart.utils.Bounds}
 * @private
 */
anychart.elements.BaseWithBounds.prototype.bounds_;


/**
 * Stores normalized bounds.
 * @type {acgraph.math.Rect}
 * @private
 */
anychart.elements.BaseWithBounds.prototype.pixelBounds_;


/**
 * Supported consistency states. Adds BOUNDS and PIXEL_BOUNDS to Base states.
 * @type {number}
 */
anychart.elements.BaseWithBounds.prototype.DISPATCHED_CONSISTENCY_STATES =
    anychart.elements.Base.prototype.DISPATCHED_CONSISTENCY_STATES |
    anychart.utils.ConsistencyState.BOUNDS |
    anychart.utils.ConsistencyState.PIXEL_BOUNDS;


/**
 * Supported consistency states. Adds BOUNDS and PIXEL_BOUNDS to Base states.
 * @type {number}
 */
anychart.elements.BaseWithBounds.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.elements.Base.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.utils.ConsistencyState.BOUNDS |
    anychart.utils.ConsistencyState.PIXEL_BOUNDS;


/**
 * Getter for element bounds settings.
 * @return {!anychart.utils.Bounds} Current element's bounds.
 *//**
 * Устанавливает значения bound эоемента одним параметром.<br/>
 * @example <t>listingOnly</t>
 * element.bounds( new anychart.math.Rect(0, 0, 100, 100) );
 * @param {(anychart.utils.RectObj|anychart.math.Rect|anychart.utils.Bounds)=} opt_value Bounds of element.
 * @return {!anychart.elements.Base} Экземпляр класса {@link anychart.elements.Base} для цепочного вызова.
 *//**
 * Setter for element bounds settings.
 * @example <t>listingOnly</t>
 * element.bounds(0, 100, '50%', '400px');
 * @param {(number|string)=} opt_x X-coordinate.
 * @param {(number|string)=} opt_y Y-coordinate.
 * @param {(number|string)=} opt_width Width.
 * @param {(number|string)=} opt_height Height.
 * @return {!anychart.elements.Base} Экземпляр класса {@link anychart.elements.Base} для цепочного вызова.
 *//**
 * @ignoreDoc
 * @param {(number|string|anychart.utils.RectObj|anychart.math.Rect|anychart.utils.Bounds)=} opt_boundsOrX .
 * @param {(number|string)=} opt_y .
 * @param {(number|string)=} opt_width .
 * @param {(number|string)=} opt_height .
 * @return {(!anychart.elements.Base|!anychart.utils.Bounds)} .
 */
anychart.elements.BaseWithBounds.prototype.bounds = function(opt_boundsOrX, opt_y, opt_width, opt_height) {
  if (!this.bounds_) {
    this.bounds_ = new anychart.utils.Bounds();
    this.registerDisposable(this.bounds_);
    this.bounds_.listenInvalidation(this.boundsInvalidated, this);
  }
  if (goog.isDef(opt_boundsOrX)) {
    this.bounds_.set.apply(this.bounds_, arguments);
    return this;
  }
  return this.bounds_;
};


/**
 * Возвращает текущее точное значение баундов.<br/>
 * <b>Note:</b> Если методом {@link anychart.elements.BaseWithBounds#bounds} ширина и/или высота была задана в процентах,
 * то при автокалькуляции могут возникнуть проблемы, если нигде по цепочке родительских контейнеров нет конкретныхх
 * пиксельных значений, в таком случае для корректного вычисления точных значений необходимо передать параметры
 * контейнера в ручную с помощью параметров <b>containerWidth</b> и <b>containerHeight</b>. В противном случае они
 * <b>не нужны!</b><br/>
 * <b>Note:</b> Если данный метод вызывался как сеттер, то вне зависимости от параметров геттера вернется значение
 * переданное в сеттер.
 * @shortDescription Возвращает текущее точное значение баундов.
 * @example <t>listingOnly</t>
 * // simple usage
 * element.bounds(0, 10, 200, 300);
 * element.pixelBounds(); // returns Rect with size: 200x300
 * // container size: 400 x 100
 * element.bounds(0, 10, '50%', '57%');
 * element.pixelBounds(400, 100); // returns Rect with size: 200x57
 * @example <c>Using setter</c><t>listingOnly</t>
 * var rect = new anychart.math.Rect( 0, 0, 100, 100);
 * element.pixelBounds(rect);
 * element.pixelBounds(); // returns value of variable rect.
 * element.pixelBounds(400, 100); // returns value of variable rect.
 * @param {number=} opt_containerWidth Width of container in pixels.
 * @param {number=} opt_containerHeight Height of container in pixels.
 * @return {!anychart.math.Rect} Returns the rect with determined pixel bounds.
 *//**
 * Sets definitive pixel bounds of the element.<br/>
 * <b>Note:</b> Если передать в качестве параметра <b>null</b>, то предыдущее значение сбросится и применится
 * авторассчет bounds элемента.
 * @example <t>listingOnly</t>
 * element.pixelBounds( new anychart.math.Rect( 0, 0, 100, 100) );
 * @param {(!anychart.math.Rect|null)=} opt_value Value to set.
 * @return {!anychart.elements.Base} Экземпляр класса {@link anychart.elements.Base} для цепочного вызова.
 *//**
 * @ignoreDoc
 * @param {(!anychart.math.Rect|null|number)=} opt_valueOrContainerWidth .
 * @param {number=} opt_containerHeight .
 * @return {(!anychart.elements.Base|!anychart.math.Rect)} .
 */
anychart.elements.BaseWithBounds.prototype.pixelBounds = function(opt_valueOrContainerWidth, opt_containerHeight) {
  if ((opt_valueOrContainerWidth instanceof anychart.math.Rect) || goog.isNull(opt_valueOrContainerWidth)) {
    if (this.pixelBounds_ != opt_valueOrContainerWidth) {
      this.pixelBounds_ = opt_valueOrContainerWidth;
      this.invalidate(anychart.utils.ConsistencyState.PIXEL_BOUNDS);
    }
    return this;
  }
  if (this.pixelBounds_)
    return /** @type {!anychart.math.Rect} */(this.pixelBounds_);
  // TODO(Anton Saukh): Переделать, когда в graphics появится возможность задавать границы слоям.
  var stage = this.container();
  if (stage)
    stage = stage.getStage();
  if (stage) {
    opt_valueOrContainerWidth = goog.isDef(opt_valueOrContainerWidth) ?
        opt_valueOrContainerWidth :
        /** @type {number} */(stage.width());
    opt_containerHeight = goog.isDef(opt_containerHeight) ?
        opt_containerHeight :
        /** @type {number} */(stage.height());
  }
  return this.bounds().toRect(opt_valueOrContainerWidth, opt_containerHeight);
};


/**
 * Listener for bounds invalidation.
 * @param {anychart.utils.InvalidatedStatesEvent} event Invalidation event.
 * @protected
 */
anychart.elements.BaseWithBounds.prototype.boundsInvalidated = function(event) {
  if (event.invalidated(anychart.utils.ConsistencyState.BOUNDS)) {
    this.suspendInvalidationDispatching();
    this.invalidate(anychart.utils.ConsistencyState.BOUNDS);
    if (!this.pixelBounds_)
      this.invalidate(anychart.utils.ConsistencyState.PIXEL_BOUNDS);
    this.resumeInvalidationDispatching(true);
  }
};
