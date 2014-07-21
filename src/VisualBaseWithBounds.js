goog.provide('anychart.VisualBaseWithBounds');

goog.require('anychart.VisualBase');
goog.require('anychart.utils.Bounds');



/**
 * An extended base element that understands bounds settings and can handle percent values in it.
 * @constructor
 * @extends {anychart.VisualBase}
 */
anychart.VisualBaseWithBounds = function() {
  goog.base(this);
};
goog.inherits(anychart.VisualBaseWithBounds, anychart.VisualBase);


/**
 * Stores user settings for element bounds.
 * @type {anychart.utils.Bounds}
 * @private
 */
anychart.VisualBaseWithBounds.prototype.bounds_;


/**
 * Stores normalized bounds.
 * @type {acgraph.math.Rect}
 * @private
 */
anychart.VisualBaseWithBounds.prototype.pixelBounds_;


/**
 * Supported consistency states. Adds BOUNDS and PIXEL_BOUNDS to Base states.
 * @type {number}
 */
anychart.VisualBaseWithBounds.prototype.SUPPORTED_SIGNALS = anychart.VisualBase.prototype.SUPPORTED_SIGNALS;


/**
 * Supported consistency states. Adds BOUNDS and PIXEL_BOUNDS to Base states.
 * @type {number}
 */
anychart.VisualBaseWithBounds.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.VisualBase.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.BOUNDS;


/**
 * Getter for the element bounds settings.
 * @return {!anychart.utils.Bounds} Current bounds of the element.
 *//**
 * Sets bounds of the element using one parameter.<br/>
 * @example <t>listingOnly</t>
 * element.bounds( new anychart.math.Rect(0, 0, 100, 100) );
 * @param {(anychart.utils.RectObj|anychart.math.Rect|anychart.utils.Bounds)=} opt_value Bounds of element.
 * @return {!anychart.VisualBase} An instance of {@link anychart.VisualBase} class for method chaining.
 *//**
 * Setter for the element bounds settings.
 * @example <t>listingOnly</t>
 * element.bounds(0, 100, '50%', '400px');
 * @param {(number|string)=} opt_x X-coordinate.
 * @param {(number|string)=} opt_y Y-coordinate.
 * @param {(number|string)=} opt_width Width.
 * @param {(number|string)=} opt_height Height.
 * @return {!anychart.VisualBase} An instance of {@link anychart.VisualBase} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(number|string|null|anychart.utils.RectObj|anychart.math.Rect|anychart.utils.Bounds)=} opt_boundsOrX .
 * @param {(number|string|null)=} opt_y .
 * @param {(number|string|null)=} opt_width .
 * @param {(number|string|null)=} opt_height .
 * @return {(!anychart.VisualBase|!anychart.utils.Bounds)} .
 */
anychart.VisualBaseWithBounds.prototype.bounds = function(opt_boundsOrX, opt_y, opt_width, opt_height) {
  if (!this.bounds_) {
    this.bounds_ = new anychart.utils.Bounds();
    this.registerDisposable(this.bounds_);
    this.bounds_.listenSignals(this.boundsInvalidated_, this);
  }
  if (goog.isDef(opt_boundsOrX)) {
    this.bounds_.set.apply(this.bounds_, arguments);
    return this;
  }
  return this.bounds_;
};


/**
 * Getter for element left bound settings.
 * @return {number|string|undefined} Current element's left bound settings.
 *//**
 * Sets element left.<br/>
 * @example <t>listingOnly</t>
 * element.left(100);
 * element.left('50%');
 * @param {(number|string|null)=} opt_value Left bound settings for the element.
 * @return {!anychart.VisualBaseWithBounds} Returns self for method chaining.
 *//**
 * @ignoreDoc
 * @param {(number|string|null)=} opt_value .
 * @return {(!anychart.VisualBase|number|string|null)} .
 */
anychart.VisualBaseWithBounds.prototype.left = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.bounds().left(opt_value);
    return this;
  }
  return /** @type {number|string|null} */(this.bounds().left());
};


/**
 * Getter for element right bound settings.
 * @return {number|string|undefined} Current element's right bound settings.
 *//**
 * Sets element right.<br/>
 * @example <t>listingOnly</t>
 * element.right(700);
 * element.right('80%');
 * @param {(number|string|null)=} opt_value Right bound settings for the element.
 * @return {!anychart.VisualBaseWithBounds} Returns self for method chaining.
 *//**
 * @ignoreDoc
 * @param {(number|string|null)=} opt_value .
 * @return {(!anychart.VisualBase|number|string|null)} .
 */
anychart.VisualBaseWithBounds.prototype.right = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.bounds().right(opt_value);
    return this;
  }
  return /** @type {number|string|null} */(this.bounds().right());
};


/**
 * Getter for element top bound settings.
 * @return {number|string|undefined} Current element's top bound settings.
 *//**
 * Sets element top.<br/>
 * @example <t>listingOnly</t>
 * element.top(100);
 * element.top('50%');
 * @param {(number|string|null)=} opt_value Top bound settings for the element.
 * @return {!anychart.VisualBaseWithBounds} Returns self for method chaining.
 *//**
 * @ignoreDoc
 * @param {(number|string|null)=} opt_value .
 * @return {(!anychart.VisualBase|number|string|null)} .
 */
anychart.VisualBaseWithBounds.prototype.top = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.bounds().top(opt_value);
    return this;
  }
  return /** @type {number|string|null} */(this.bounds().top());
};


/**
 * Getter for element bottom bound settings.
 * @return {number|string|undefined} Current element's bottom bound settings.
 *//**
 * Sets element bottom.<br/>
 * @example <t>listingOnly</t>
 * element.bottom(700);
 * element.bottom('80%');
 * @param {(number|string|null)=} opt_value Bottom bound settings for the element.
 * @return {!anychart.VisualBaseWithBounds} Returns self for method chaining.
 *//**
 * @ignoreDoc
 * @param {(number|string|null)=} opt_value .
 * @return {(!anychart.VisualBase|number|string|null)} .
 */
anychart.VisualBaseWithBounds.prototype.bottom = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.bounds().bottom(opt_value);
    return this;
  }
  return /** @type {number|string|null} */(this.bounds().bottom());
};


/**
 * Getter for element width settings.
 * @return {number|string|undefined} Current element's width settings.
 *//**
 * Sets element width.<br/>
 * @example <t>listingOnly</t>
 * element.width(500);
 * element.width('80%');
 * @param {(number|string|null)=} opt_value Width settings for the element.
 * @return {!anychart.VisualBaseWithBounds} Returns self for method chaining.
 *//**
 * @ignoreDoc
 * @param {(number|string|null)=} opt_value .
 * @return {(!anychart.VisualBase|number|string|null)} .
 */
anychart.VisualBaseWithBounds.prototype.width = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.bounds().width(opt_value);
    return this;
  }
  return /** @type {number|string|null} */(this.bounds().width());
};


/**
 * Getter for element height settings.
 * @return {number|string|undefined} Current element's height settings.
 *//**
 * Sets element height.<br/>
 * @example <t>listingOnly</t>
 * element.height(500);
 * element.height('80%');
 * @param {(number|string|null)=} opt_value Height settings for the element.
 * @return {!anychart.VisualBaseWithBounds} Returns self for method chaining.
 *//**
 * @ignoreDoc
 * @param {(number|string|null)=} opt_value .
 * @return {(!anychart.VisualBase|number|string|null)} .
 */
anychart.VisualBaseWithBounds.prototype.height = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.bounds().height(opt_value);
    return this;
  }
  return /** @type {number|string|null} */(this.bounds().height());
};


/**
 * Returns the current bounds.<br/>
 * <b>Note:</b> If the width and/or height were set in percents using {@link anychart.VisualBaseWithBounds#bounds} method,
 * we may have problems with autocalculation (size has never been never passed in pixels for any of the
 * nesting containers). In such case we need to pass pixel size of the container
 * using <b>containerWidth</b> and <b>containerHeight</b>. In any other case you
 * <b>don't need to set them!</b><br/>
 * <b>Note:</b> If this method was used as a setter then no matter what parameters set you
 * get those passed to setter.
 * @shortDescription Returns the current bounds.
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
 * element.pixelBounds(); // returns the value of variable rect.
 * element.pixelBounds(400, 100); // returns the value of variable rect.
 * @param {number=} opt_containerWidth The width of a container in pixels.
 * @param {number=} opt_containerHeight Height of a container in pixels.
 * @return {!anychart.math.Rect} Returns the rect with determined pixel bounds.
 *//**
 * Sets exact pixel bounds of the element.<br/>
 * <b>Note:</b> If you pass <b>null</b> then previous value is reset
 * and bounds are autocalculated.
 * @example <t>listingOnly</t>
 * element.pixelBounds( new anychart.math.Rect( 0, 0, 100, 100) );
 * @param {(!anychart.math.Rect|null)=} opt_value Value to set.
 * @return {!anychart.VisualBase} An instance of {@link anychart.VisualBase} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(!anychart.math.Rect|null|number)=} opt_valueOrContainerWidth .
 * @param {number=} opt_containerHeight .
 * @return {(!anychart.VisualBase|!anychart.math.Rect)} .
 */
anychart.VisualBaseWithBounds.prototype.pixelBounds = function(opt_valueOrContainerWidth, opt_containerHeight) {
  if ((opt_valueOrContainerWidth instanceof anychart.math.Rect) || goog.isNull(opt_valueOrContainerWidth)) {
    if (this.pixelBounds_ != opt_valueOrContainerWidth) {
      this.pixelBounds_ = opt_valueOrContainerWidth;
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  if (this.pixelBounds_)
    return (/** @type {!anychart.math.Rect} */(this.pixelBounds_)).clone();
  // TODO(Anton Saukh): Refactor when we implement bounds for layers in graphics.
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
 * Listener for the bounds invalidation.
 * @param {anychart.SignalEvent} event Invalidation event.
 * @private
 */
anychart.VisualBaseWithBounds.prototype.boundsInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION))
    this.invalidate(anychart.ConsistencyState.BOUNDS,
        anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
};


/** @inheritDoc */
anychart.VisualBaseWithBounds.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');

  json['bounds'] = this.bounds().serialize();
  if (this.pixelBounds_) // we need it in config only if it is explicitly set.
    json['pixelBounds'] = this.pixelBounds_.serialize();

  return json;
};


/** @inheritDoc */
anychart.VisualBaseWithBounds.prototype.deserialize = function(config) {
  goog.base(this, 'deserialize', config);

  this.bounds().deserialize(config['bounds'] || {});
  if ('pixelBounds' in config) // we need to set it only if it is explicitly set in config.
    this.pixelBounds(anychart.math.Rect.deserialize(config['pixelBounds']));

  return this;
};


//exports
anychart.VisualBaseWithBounds.prototype['bounds'] = anychart.VisualBaseWithBounds.prototype.bounds;//in docs/final
anychart.VisualBaseWithBounds.prototype['top'] = anychart.VisualBaseWithBounds.prototype.top;//in docs/
anychart.VisualBaseWithBounds.prototype['right'] = anychart.VisualBaseWithBounds.prototype.right;//in docs/
anychart.VisualBaseWithBounds.prototype['bottom'] = anychart.VisualBaseWithBounds.prototype.bottom;//in docs/
anychart.VisualBaseWithBounds.prototype['left'] = anychart.VisualBaseWithBounds.prototype.left;//in docs/
anychart.VisualBaseWithBounds.prototype['width'] = anychart.VisualBaseWithBounds.prototype.width;//in docs/
anychart.VisualBaseWithBounds.prototype['height'] = anychart.VisualBaseWithBounds.prototype.height;//in docs/
anychart.VisualBaseWithBounds.prototype['pixelBounds'] = anychart.VisualBaseWithBounds.prototype.pixelBounds;//in docs/final
