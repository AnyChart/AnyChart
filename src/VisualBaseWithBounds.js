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
 * @example <t>lineChart</t>
 * chart.line([1, 1.8, 1.2, 2.8]);
 * chart.bounds( anychart.math.rect(10, 10, 350, 250) );
 * @param {(anychart.utils.RectObj|anychart.math.Rect|anychart.utils.Bounds)=} opt_value Bounds of element.
 * @return {!anychart.VisualBase} An instance of {@link anychart.VisualBase} class for method chaining.
 *//**
 * Setter for the element bounds settings.
 * @example <t>lineChart</t>
 * chart.spline([1, 1.8, 1.2, 2.8]);
 * chart.bounds(0, 50, '50%', '250px');
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
 * Sets element left.
 * @example <t>lineChart</t>
 * chart.spline([1, 1.8, 1.2, 2.8]);
 * chart.left('20%');
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
 * Sets element right.
 * @example <t>lineChart</t>
 * chart.spline([1, 1.8, 1.2, 2.8]);
 * chart.right('20%');
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
 * Sets element top.
 * @example <t>lineChart</t>
 * chart.spline([1, 1.8, 1.2, 2.8]);
 * chart.top('20%');
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
 * Sets element bottom.
 * @example <t>lineChart</t>
 * chart.spline([1, 1.8, 1.2, 2.8]);
 * chart.bottom('20%');
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
 * Sets element width.
 * @example <t>lineChart</t>
 * chart.spline([1, 1.8, 1.2, 2.8]);
 * chart.width('80%');
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
 * Sets element height.
 * @example <t>lineChart</t>
 * chart.spline([1, 1.8, 1.2, 2.8]);
 * chart.height('80%');
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
 * Returns pixel bounds of the element due to parent bounds and self bounds settings.
 * @return {(!anychart.math.Rect)} .
 */
anychart.VisualBaseWithBounds.prototype.getPixelBounds = function() {
  return this.bounds().toRect(/** @type {anychart.math.Rect} */(this.parentBounds()));
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

  return json;
};


/** @inheritDoc */
anychart.VisualBaseWithBounds.prototype.deserialize = function(config) {
  goog.base(this, 'deserialize', config);

  this.bounds().deserialize(config['bounds'] || {});

  return this;
};


//exports
anychart.VisualBaseWithBounds.prototype['bounds'] = anychart.VisualBaseWithBounds.prototype.bounds;//doc|ex
anychart.VisualBaseWithBounds.prototype['top'] = anychart.VisualBaseWithBounds.prototype.top;//doc|ex
anychart.VisualBaseWithBounds.prototype['right'] = anychart.VisualBaseWithBounds.prototype.right;//doc|ex
anychart.VisualBaseWithBounds.prototype['bottom'] = anychart.VisualBaseWithBounds.prototype.bottom;//doc|ex
anychart.VisualBaseWithBounds.prototype['left'] = anychart.VisualBaseWithBounds.prototype.left;//doc|ex
anychart.VisualBaseWithBounds.prototype['width'] = anychart.VisualBaseWithBounds.prototype.width;//doc|ex
anychart.VisualBaseWithBounds.prototype['height'] = anychart.VisualBaseWithBounds.prototype.height;//doc|ex
anychart.VisualBaseWithBounds.prototype['getPixelBounds'] = anychart.VisualBaseWithBounds.prototype.getPixelBounds;
