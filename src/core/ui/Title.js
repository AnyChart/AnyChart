goog.provide('anychart.core.ui.Title');
goog.require('acgraph');
goog.require('anychart.core.Text');
goog.require('anychart.core.ui.Background');
goog.require('anychart.core.utils.Margin');
goog.require('anychart.core.utils.Padding');
goog.require('anychart.enums');
goog.require('anychart.math.Rect');
goog.require('anychart.utils');
goog.require('goog.graphics.AffineTransform');



/**
 * Title element class.<br/>
 * Title can be a part of an other complex element, such as a chart, a legend or an axis,
 * as well a self-sufficient element.<br/>
 * A title have a positione, text alignment and a background.
 * @illustration <t>simple</t>
 * var layer1= stage.layer();
 * layer1.rect(1,1,stage.width()/2-4, stage.height()-2).stroke('1 black');
 * layer1.rect(1,1,stage.width()/2-4, 50).fill('orange 0.1');
 * layer1.text(stage.width()/4 - 30, 10, 'Title').fontSize(17);
 * var layer2= stage.layer().translate(stage.width()/2 ,0);
 * layer2.rect(2,1,stage.width()/2-2, stage.height()-2).stroke('1 black');
 * layer2.rect(2,1, 50, stage.height()-2).fill('orange 0.1');
 * layer2.text(10, stage.height() /2 +20, 'Title').fontSize(17).rotateByAnchor(-90, 'center');
 * @illustrationDesc
 * Title occupies the whole part of a container (depending on the orientation by the width or the height).
 * @example <c>Self-sufficient title.</c><t>simple-h100</t>
 * anychart.ui.title()
 *     .text('My custom Title')
 *     .fontSize(27)
 *     .height('100')
 *     .vAlign('middle')
 *     .container(stage)
 *     .draw();
 * @constructor
 * @extends {anychart.core.Text}
 */
anychart.core.ui.Title = function() {
  this.suspendSignalsDispatching();
  goog.base(this);

  this.resumeSignalsDispatching(false);
};
goog.inherits(anychart.core.ui.Title, anychart.core.Text);


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.ui.Title.prototype.SUPPORTED_SIGNALS = anychart.core.Text.prototype.SUPPORTED_SIGNALS;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.ui.Title.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.Text.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.TITLE_BACKGROUND;


/**
 * Text element.
 * @type {!acgraph.vector.Text}
 * @private
 */
anychart.core.ui.Title.prototype.text_;


/**
 * Background element (if any).
 * @type {anychart.core.ui.Background}
 * @private
 */
anychart.core.ui.Title.prototype.background_ = null;


/**
 * Layer element (if background is visible).
 * @type {acgraph.vector.Layer}
 * @private
 */
anychart.core.ui.Title.prototype.layer_ = null;


/**
 * Width settings for the title.
 * @type {number|string|null}
 * @private
 */
anychart.core.ui.Title.prototype.width_ = null;


/**
 * Height settings for the title.
 * @type {number|string|null}
 * @private
 */
anychart.core.ui.Title.prototype.height_ = null;


/**
 * Width settings for the title.
 * @type {number|string|null}
 * @private
 */
anychart.core.ui.Title.prototype.autoWidth_ = null;


/**
 * Actual width of the title.
 * @type {number}
 * @private
 */
anychart.core.ui.Title.prototype.backgroundWidth_ = NaN;


/**
 * Actual height of the title.
 * @type {number}
 * @private
 */
anychart.core.ui.Title.prototype.backgroundHeight_ = NaN;


/**
 * Text width of the title.
 * @type {number}
 * @private
 */
anychart.core.ui.Title.prototype.textWidth_ = NaN;


/**
 * Text height of the title.
 * @type {number}
 * @private
 */
anychart.core.ui.Title.prototype.textHeight_ = NaN;


/**
 * Pixel bounds due to orientation, align, margins, padding, etc.
 * @type {anychart.math.Rect}
 * @private
 */
anychart.core.ui.Title.prototype.pixelBounds_ = null;


/**
 * Title margin.
 * @type {anychart.core.utils.Margin}
 * @private
 */
anychart.core.ui.Title.prototype.margin_ = null;


/**
 * Title text padding.
 * @type {anychart.core.utils.Padding}
 * @private
 */
anychart.core.ui.Title.prototype.padding_ = null;


/**
 * Title orientation.
 * @type {anychart.enums.Orientation}
 * @private
 */
anychart.core.ui.Title.prototype.orientation_;


/**
 * Title default orientation.
 * @type {anychart.enums.Orientation}
 * @private
 */
anychart.core.ui.Title.prototype.defaultOrientation_ = anychart.enums.Orientation.TOP;


/**
 * Title align.
 * @type {anychart.enums.Align}
 * @private
 */
anychart.core.ui.Title.prototype.align_ = anychart.enums.Align.CENTER;


/**
 * Title rotation. Value null states to autorotation due to orientation.
 * @type {number|undefined}
 * @private
 */
anychart.core.ui.Title.prototype.rotation_;


/**
 * @type {number}
 * @private
 */
anychart.core.ui.Title.prototype.defaultRotation_;


/**
 * Title transformation matrix.
 * @type {goog.graphics.AffineTransform}
 * @private
 */
anychart.core.ui.Title.prototype.transformation_ = null;


/**
 * Gets the text content for the current title.
 * @return {string} The current text content of the title.
 *//**
 * Sets the text content for the title.
 * @example <t>simple-h100</t>
 * var title = anychart.ui.title();
 * title.text('My custom Text');
 * title.container(stage)
 *      .draw();
 * @param {string=} opt_value ['Title text'] Value to set.
 * @return {!anychart.core.ui.Title} An instance of {@link anychart.core.ui.Title} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {string=} opt_value .
 * @return {!anychart.core.ui.Title|string} .
 */
anychart.core.ui.Title.prototype.text = function(opt_value) {
  if (goog.isDef(opt_value)) opt_value = goog.string.makeSafe(opt_value);
  return /** @type {!anychart.core.ui.Title|string} */(this.textSettings('text', opt_value));
};


/**
 * Set/get auto text.
 * Used for tooltip.
 * @param {string=} opt_value
 * @return {!anychart.core.ui.Title|string}
 */
anychart.core.ui.Title.prototype.autoText = function(opt_value) {
  if (goog.isDef(opt_value)) opt_value = goog.string.makeSafe(opt_value);
  return /** @type {!anychart.core.ui.Title|string} */(this.textSettings('autoText', opt_value));
};


/**
 * Getter for the title background.
 * @example <t>simple-h100</t>
 * var title = anychart.ui.title();
 * title.text('\' Simple text \'')
 *      .background()
 *          .stroke('1 rgb(36,102,177) 0.4')
 *          .corners(2);
 * title.container(stage)
 *      .draw()
 * @return {!anychart.core.ui.Background} Returns the current background.
 *//**
 * Setter for the title background.
 * @example <t>simple-h100</t>
 * anychart.ui.title()
 *     .text('Title text')
 *     .padding(5)
 *     .background({
 *        fill: {
 *           keys: [
 *             "rgb(255,255,255) 1",
 *             "rgb(223,223,223) 1",
 *             "rgb(255,255,255) 1"
 *           ],
 *           angle: -90
 *         },
 *         corners: 2,
 *         stroke: '1 rgb(36,102,177) 0.4'
 *     })
 *     .container(stage)
 *     .draw();
 * @param {(string|Object|null|boolean)=} opt_value [null] Value to set.
 * @return {!anychart.core.ui.Title} An instance of {@link anychart.core.ui.Title} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(string|Object|null|boolean)=} opt_value .
 * @return {!(anychart.core.ui.Title|anychart.core.ui.Background)} .
 */
anychart.core.ui.Title.prototype.background = function(opt_value) {
  if (!this.background_) {
    this.background_ = new anychart.core.ui.Background();
    this.registerDisposable(this.background_);
    this.background_.listenSignals(this.backgroundInvalidated_, this);
  }

  if (goog.isDef(opt_value)) {
    this.background_.setup(opt_value);
    return this;
  }
  return this.background_;
};


/**
 * Getter for the title width.
 * @return {number|string|null} The current title width.
 *//**
 * Setter for the title width.<br/>
 * <b>Note:</b> If <b>null</b> is passed the width is calcualted automatically.
 * @example <t>listingOnly</t>
 * title.width('200px');
 * @param {(number|string|null)=} opt_value [null] Value to set.
 * @return {!anychart.core.ui.Title} An instance of {@link anychart.core.ui.Title} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(number|string|null)=} opt_value .
 * @return {!anychart.core.ui.Title|number|string|null} .
 */
anychart.core.ui.Title.prototype.width = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.width_ != opt_value) {
      this.width_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.width_;
};


/**
 * Getter for the title height.
 * @return {number|string|null} The current title width.
 *//**
 * Setter for the title height.<br/>
 * <b>Note:</b> If <b>null</b> is passed the height is calcualted automatically.
 * @example <t>listingOnly</t>
 * title.height('200px');
 * @param {(number|string|null)=} opt_value [null] Value to set.
 * @return {!anychart.core.ui.Title} An instance of {@link anychart.core.ui.Title} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(number|string|null)=} opt_value .
 * @return {!anychart.core.ui.Title|number|string|null} .
 */
anychart.core.ui.Title.prototype.height = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.height_ != opt_value) {
      this.height_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.height_;
};


/**
 * @param {number|string|null} width
 */
anychart.core.ui.Title.prototype.setAutoWidth = function(width) {
  this.autoWidth_ = width;
};


/**
 * Getter for the current title margin.<br/>
 * Learn more about margins at {@link anychart.core.Chart#margin}.
 * @return {!anychart.core.utils.Margin} The current title margin.
 *//**
 * Setter for the title margin in pixels using one complex value.<br/>
 * @param {(Array.<number|string>|{top:(number|string),left:(number|string),bottom:(number|string),right:(number|string)})=} opt_allValues Value to set.
 * @return {!anychart.core.ui.Title} An instance of {@link anychart.core.ui.Title} class for method chaining.
 *//**
 * Setter for the title margin in pixels using several numbers.<br/>
 * @example <t>listingOnly</t>
 * // 1) all 10px
 * title.margin(10);
 * // 2) top and bottom 10px, left and right 15px
 * title.margin(10, '15px');
 * // 3) top 10px, left and right 15px, bottom 5px
 * title.margin(10, '15px', 5);
 * // 4) top 10px, right 15px, bottom 5px, left 12px
 * title.margin(10, '15px', '5px', 12);
 * @param {(string|number)=} opt_value1 [0] Top or top-bottom space.
 * @param {(string|number)=} opt_value2 [0] Right or right-left space.
 * @param {(string|number)=} opt_value3 [10] Bottom space.
 * @param {(string|number)=} opt_value4 [0] Left space.
 * @return {!anychart.core.ui.Title} An instance of {@link anychart.core.ui.Title} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(string|number|Array.<number|string>|{top:(number|string),left:(number|string),bottom:(number|string),right:(number|string)})=} opt_spaceOrTopOrTopAndBottom .
 * @param {(string|number)=} opt_rightOrRightAndLeft .
 * @param {(string|number)=} opt_bottom .
 * @param {(string|number)=} opt_left .
 * @return {!(anychart.core.ui.Title|anychart.core.utils.Margin)} .
 */
anychart.core.ui.Title.prototype.margin = function(opt_spaceOrTopOrTopAndBottom, opt_rightOrRightAndLeft, opt_bottom, opt_left) {
  if (!this.margin_) {
    this.margin_ = new anychart.core.utils.Margin();
    this.registerDisposable(this.margin_);
    this.margin_.listenSignals(this.boundsInvalidated_, this);
  }
  if (goog.isDef(opt_spaceOrTopOrTopAndBottom)) {
    this.margin_.setup.apply(this.margin_, arguments);
    return this;
  }
  return this.margin_;
};


/**
 * Getter for the current title padding.<br/>
 * Learn more about paddings at {@link anychart.core.Chart#padding}.
 * @return {!anychart.core.utils.Padding} The current title padding.
 *//**
 * Setter for the title padding in pixels using single value.<br/>
 * @param {(string|number|anychart.core.utils.Space)=} opt_value [null] Value to set.
 * @return {!anychart.core.ui.Title} An instance of {@link anychart.core.ui.Title} class for method chaining.
 *//**
 * Setter for the title padding in pixels using several numbers.<br/>
 * @example <t>listingOnly</t>
 * // 1) top and bottom 10px, left and right 15px
 * title.padding(10, '15px');
 * // 2) top 10px, left and right 15px, bottom 5px
 * title.padding(10, '15px', 5);
 * // 3) top 10px, right 15px, bottom 5px, left 12px
 * title.padding(10, '15px', '5px', 12);
 * @param {(string|number)=} opt_value1 Top or top-bottom space.
 * @param {(string|number)=} opt_value2 Right or right-left space.
 * @param {(string|number)=} opt_value3 Bottom space.
 * @param {(string|number)=} opt_value4 Left space.
 * @return {anychart.core.ui.Title} An instance of {@link anychart.core.ui.Title} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(string|number|Array.<number|string>|{top:(number|string),left:(number|string),bottom:(number|string),right:(number|string)})=} opt_spaceOrTopOrTopAndBottom .
 * @param {(string|number)=} opt_rightOrRightAndLeft .
 * @param {(string|number)=} opt_bottom .
 * @param {(string|number)=} opt_left .
 * @return {!(anychart.core.ui.Title|anychart.core.utils.Padding)} .
 */
anychart.core.ui.Title.prototype.padding = function(opt_spaceOrTopOrTopAndBottom, opt_rightOrRightAndLeft, opt_bottom, opt_left) {
  if (!this.padding_) {
    this.padding_ = new anychart.core.utils.Padding();
    this.registerDisposable(this.padding_);
    this.padding_.listenSignals(this.boundsInvalidated_, this);
  }
  if (goog.isDef(opt_spaceOrTopOrTopAndBottom)) {
    this.padding_.setup.apply(this.padding_, arguments);
    return this;
  }
  return this.padding_;
};


/**
 * Getter for the title align.
 * @return {anychart.enums.Align} The current title align.
 *//**
 * Setter for the title align.
 * @example <t>simple-h100</t>
 * stage.rect(1, 1, stage.width()-2, stage.height()-10).stroke('1 blue');
 * anychart.ui.title()
 *     .text('Left align')
 *     .align('left')
 *     .container(stage)
 *     .draw();
 * anychart.ui.title()
 *     .text('Right align')
 *     .align('right')
 *     .container(stage)
 *     .draw();
 * @param {(anychart.enums.Align|string)=} opt_value [{@link anychart.enums.Align}.CENTER] Value to set.
 * @return {!anychart.core.ui.Title} An instance of {@link anychart.core.ui.Title} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(anychart.enums.Align|string)=} opt_value .
 * @return {!anychart.core.ui.Title|anychart.enums.Align} .
 */
anychart.core.ui.Title.prototype.align = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeAlign(opt_value);
    if (this.align_ != opt_value) {
      this.align_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.align_;
};


/**
 * Getter for the title orientation.
 * @return {anychart.enums.Orientation} The orientation or the title for method chaining.
 *//**
 * Setter for the title orientation.
 * @example
 * stage.rect(1, 1, stage.width()-2, stage.height()-10).stroke('1 blue');
 * anychart.ui.title()
 *     .text('Left title orientation')
 *     .orientation('left')
 *     .container(stage)
 *     .draw();
 * anychart.ui.title()
 *     .text('Right title orientation')
 *     .orientation('right')
 *     .container(stage)
 *     .draw();
 * @param {(anychart.enums.Orientation|string)=} opt_value [{@link anychart.enums.Orientation}.TOP] Value to set.
 * @return {!anychart.core.ui.Title} An instance of {@link anychart.core.ui.Title} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(anychart.enums.Orientation|string)=} opt_value .
 * @return {!anychart.core.ui.Title|anychart.enums.Orientation} .
 */
anychart.core.ui.Title.prototype.orientation = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeOrientation(opt_value);
    if (this.orientation_ != opt_value) {
      this.orientation_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.orientation_ || this.defaultOrientation_;
};


/**
 * @param {anychart.enums.Orientation} value .
 */
anychart.core.ui.Title.prototype.setDefaultOrientation = function(value) {
  var needInvalidate = !this.orientation_ && this.defaultOrientation_ != value;
  this.defaultOrientation_ = value;
  if (needInvalidate)
    this.invalidate(anychart.ConsistencyState.BOUNDS);
};


/**
 * Title rotation. Set null or NaN to automatic rotation due to title orientation.
 * @param {number=} opt_value
 * @return {anychart.core.ui.Title|number}
 */
anychart.core.ui.Title.prototype.rotation = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.utils.toNumber(opt_value);
    if (isNaN(opt_value)) opt_value = undefined;
    if (this.rotation_ != opt_value) {
      this.rotation_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return goog.isDef(this.rotation_) ? this.rotation_ : this.defaultRotation_;
};


/**
 * @param {number} value .
 */
anychart.core.ui.Title.prototype.setDefaultRotation = function(value) {
  var needInvalidate = !this.rotation_ && this.defaultRotation_ != value;
  this.defaultRotation_ = value;
  if (needInvalidate)
    this.invalidate(anychart.ConsistencyState.BOUNDS);
};


/**
 * Render the title content.
 * @return {!anychart.core.ui.Title} An instance of {@link anychart.core.ui.Title} class for method chaining.
 */
anychart.core.ui.Title.prototype.draw = function() {
  if (!this.checkDrawingNeeded())
    return this;

  // We will need the text element anyway, so we should create it if it is missing.
  var isInitial;
  if (isInitial = !this.layer_) {
    this.layer_ = acgraph.layer();
    this.text_ = this.layer_.text();
    this.text_.zIndex(1);
    this.registerDisposable(this.layer_);
    this.bindHandlersToGraphics(this.layer_);
  }
  // Getting the stage and suspending it to make the change.
  var container = /** @type {acgraph.vector.ILayer} */(this.container());
  var stage = container ? container.getStage() : null;
  var manualSuspend = stage && !stage.isSuspended();
  if (manualSuspend) stage.suspend();

  // Checking APPEARANCE state. It excludes text width and height inconsistency that will be checked later.
  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    // Applying text settings if needed.
    this.applyTextSettings(this.text_, isInitial);
    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }

  // Checking BOUNDS state. If it is inconsistent, we need to recalculate title bounds.
  // But we don't need to mark it consistent here, because we don't know where to apply that new bounds yet.
  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    this.calcActualBounds_();
    // settings text offset for
    this.text_.x(anychart.utils.normalizeSize(/** @type {number|string} */(this.padding().left()), this.backgroundWidth_));
    this.text_.y(anychart.utils.normalizeSize(/** @type {number|string} */(this.padding().top()), this.backgroundHeight_));

    this.layer_.setTransformationMatrix(
        this.transformation_.getScaleX(),
        this.transformation_.getShearY(),
        this.transformation_.getShearX(),
        this.transformation_.getScaleY(),
        this.transformation_.getTranslateX(),
        this.transformation_.getTranslateY());
    this.invalidate(anychart.ConsistencyState.TITLE_BACKGROUND);
    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }

  // If background appearance changed, we should do something about that.
  if (this.hasInvalidationState(anychart.ConsistencyState.TITLE_BACKGROUND)) {
    var background = this.background();
    background.suspendSignalsDispatching();
    background.parentBounds(0, 0, this.backgroundWidth_, this.backgroundHeight_);
    background.container(this.layer_);
    background.zIndex(0);
    background.draw();
    background.resumeSignalsDispatching(false);
    this.markConsistent(anychart.ConsistencyState.TITLE_BACKGROUND);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    this.layer_.zIndex(/** @type {number} */(this.zIndex()));
    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    this.layer_.parent(container);
    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }


  if (manualSuspend) stage.resume();
  return this;
};


/** @inheritDoc */
anychart.core.ui.Title.prototype.remove = function() {
  if (this.layer_) {
    this.layer_.parent(null);
  } else if (this.text_) {
    this.text_.parent(null);
  }
};


/**
 * Returns the remaining (after title placement) part of the container.
 * @example <t>simple-h100</t>
 * // Placing the first title on the top of the Stage.
 * var title1 = anychart.ui.title()
 *     .text('First title')
 *     .container(stage)
 *     .draw();
 * // Placing the second title over the remaining part - under the first title.
 * anychart.ui.title()
 *     .text('Second title')
 *     .container(stage)
 *     .parentBounds(title1.getRemainingBounds())
 *     .draw();
 * @return {!anychart.math.Rect} Parent bounds without the space used by the title.
 */
anychart.core.ui.Title.prototype.getRemainingBounds = function() {
  var parentBounds = /** @type {anychart.math.Rect} */(this.parentBounds());
  if (parentBounds)
    parentBounds = parentBounds.clone();
  else
    parentBounds = anychart.math.rect(0, 0, 0, 0);

  if (!this.enabled())
    return parentBounds;
  if (!this.pixelBounds_ || this.hasInvalidationState(anychart.ConsistencyState.BOUNDS))
    this.calcActualBounds_();
  switch (this.orientation()) {
    case anychart.enums.Orientation.TOP:
      parentBounds.top += this.pixelBounds_.height;
      parentBounds.height -= this.pixelBounds_.height;
      break;
    case anychart.enums.Orientation.RIGHT:
      parentBounds.width -= this.pixelBounds_.width;
      break;
    case anychart.enums.Orientation.BOTTOM:
      parentBounds.height -= this.pixelBounds_.height;
      break;
    case anychart.enums.Orientation.LEFT:
      parentBounds.left += this.pixelBounds_.width;
      parentBounds.width -= this.pixelBounds_.width;
      break;
  }
  return parentBounds;
};


/**
 * Gets bounds of pure styled text of title. Ignores all another bounds like width and height set or parentBounds.
 * NOTE: Gets original text's left and top, doesn't apply any currently calculated positioning to text.
 * @return {?anychart.math.Rect} - Original bounds of text.
 */
anychart.core.ui.Title.prototype.getOriginalBounds = function() {
  return this.text_ ? this.text_.getOriginalBounds() : null;
};


/**
 * Return the title content bounds.
 * @return {anychart.math.Rect} Content bounds.
 */
anychart.core.ui.Title.prototype.getContentBounds = function() {
  if (!this.enabled())
    return new anychart.math.Rect(0, 0, 0, 0);
  if (!this.pixelBounds_ || this.hasInvalidationState(anychart.ConsistencyState.BOUNDS))
    this.calcActualBounds_();
  return this.pixelBounds_;
};


/** @inheritDoc */
anychart.core.ui.Title.prototype.applyTextSettings = function(textElement, isInitial) {
  if (isInitial || 'text' in this.changedSettings || 'autoText' in this.changedSettings || 'useHtml' in this.changedSettings) {
    var text = !this.settingsObj['text'] && goog.isDef(this.settingsObj['autoText']) ? this.settingsObj['autoText'] : this.settingsObj['text'];

    if (!!this.settingsObj['useHtml']) {
      textElement.htmlText(text);
    } else {
      textElement.text(text);
    }
  }
  goog.base(this, 'applyTextSettings', textElement, isInitial);
  this.changedSettings = {};
};


/**
 * Internal getter for the title rotation (orientation wise).
 * @return {number} Rotation degree.
 */
anychart.core.ui.Title.prototype.getRotation = function() {
  var rotation = /** @type {number} */(this.rotation());
  if (!goog.isDef(rotation)) {
    switch (this.orientation()) {
      case anychart.enums.Orientation.LEFT:
        return -90;
      case anychart.enums.Orientation.RIGHT:
        return 90;
      //case anychart.enums.Orientation.TOP:
      //case anychart.enums.Orientation.BOTTOM:
      default:
        return 0;
    }
  } else
    return rotation;
};


/**
 * Calculates the actual size of the title for the different sizing cases.
 * @private
 */
anychart.core.ui.Title.prototype.calcActualBounds_ = function() {
  var container = /** @type {acgraph.vector.ILayer} */(this.container());
  var stage = container ? container.getStage() : null;

  var padding = this.padding();
  var margin = this.margin();
  /** @type {anychart.math.Rect} */
  var parentBounds = /** @type {anychart.math.Rect} */(this.parentBounds());

  var parentWidth, parentHeight;
  var orientation = this.orientation();

  var isRLYHorizontal = this.getRotation() % 180 == 0;
  if (parentBounds) {
    if (orientation == anychart.enums.Orientation.TOP ||
        orientation == anychart.enums.Orientation.BOTTOM ||
        isRLYHorizontal) {
      parentWidth = parentBounds.width;
      parentHeight = parentBounds.height;
    } else {
      parentWidth = parentBounds.height;
      parentHeight = parentBounds.width;
    }
  } else {
    parentWidth = parentHeight = undefined;
  }

  var isInitial;
  if (isInitial = !this.layer_) {
    this.layer_ = acgraph.layer();
    this.text_ = this.layer_.text();
    this.text_.zIndex(1);
    this.registerDisposable(this.layer_);
    this.bindHandlersToGraphics(this.layer_);
  }
  if (isInitial || this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    this.applyTextSettings(this.text_, isInitial);
    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }
  var textBounds;
  this.text_.width(null);
  this.text_.height(null);
  // need to set transformation to drop text bounds cache
  this.text_.setTransformationMatrix(1, 0, 0, 1, 0, 0);
  textBounds = this.text_.getBounds();

  var width = goog.isNull(this.width_) ? (this.autoWidth_ || null) : this.width_;
  if (goog.isNull(width)) {
    this.textWidth_ = textBounds.width;
    this.backgroundWidth_ = padding.widenWidth(this.textWidth_);
  } else {
    this.backgroundWidth_ = anychart.utils.normalizeSize(/** @type {number|string} */(width), parentWidth);
    this.textWidth_ = padding.tightenWidth(this.backgroundWidth_);
  }

  if (parentBounds && parentWidth < margin.widenWidth(this.backgroundWidth_)) {
    this.backgroundWidth_ = margin.tightenWidth(parentWidth);
    this.textWidth_ = padding.tightenWidth(this.backgroundWidth_);
    this.text_.width(this.textWidth_);
  } else if (!goog.isNull(width))
    this.text_.width(this.textWidth_);

  // need to set transformation to drop text bounds cache
  this.text_.setTransformationMatrix(1, 0, 0, 1, 0, 0);
  textBounds = this.text_.getBounds();

  if (goog.isNull(this.height_)) {
    this.textHeight_ = textBounds.height;
    this.backgroundHeight_ = padding.widenHeight(this.textHeight_);
  } else {
    this.backgroundHeight_ = anychart.utils.normalizeSize(/** @type {number|string} */(this.height_), parentHeight);
    this.textHeight_ = padding.tightenHeight(this.backgroundHeight_);
  }

  if (parentBounds && parentHeight < margin.widenHeight(this.backgroundHeight_)) {
    this.backgroundHeight_ = margin.tightenHeight(parentHeight);
    this.textHeight_ = padding.tightenHeight(this.backgroundHeight_);
    this.text_.height(this.textHeight_);
  } else if (!goog.isNull(this.height_))
    this.text_.height(this.textHeight_);

  this.pixelBounds_ = new anychart.math.Rect(-this.backgroundWidth_ / 2, -this.backgroundHeight_ / 2, this.backgroundWidth_, this.backgroundHeight_);
  var transform = goog.graphics.AffineTransform.getRotateInstance(goog.math.toRadians(this.getRotation()), 0, 0);
  /** @type {!anychart.math.Rect} */
  var bounds = acgraph.math.getBoundsOfRectWithTransform(this.pixelBounds_, transform);

  var leftMargin = anychart.utils.normalizeSize(/** @type {number} */(margin.left()), this.backgroundWidth_);
  var rightMargin = anychart.utils.normalizeSize(/** @type {number} */(margin.right()), this.backgroundWidth_);
  var topMargin = anychart.utils.normalizeSize(/** @type {number} */(margin.top()), this.backgroundHeight_);
  var bottomMargin = anychart.utils.normalizeSize(/** @type {number} */(margin.bottom()), this.backgroundHeight_);

  var wHalf = bounds.width / 2;
  var hHalf = bounds.height / 2;

  // initialized for case when there are no parentBounds;
  var x = leftMargin + wHalf;
  var y = topMargin + hHalf;

  var isHorizontal = orientation == anychart.enums.Orientation.TOP || orientation == anychart.enums.Orientation.BOTTOM;
  if (parentBounds) {
    if (isHorizontal || isRLYHorizontal) {
      if (isHorizontal) {
        switch (this.align_) {
          case anychart.enums.Align.LEFT:
            x = parentBounds.getLeft() + leftMargin + wHalf;
            break;
          case anychart.enums.Align.RIGHT:
            x = parentBounds.getRight() - rightMargin - wHalf;
            break;
          default:
            x = (parentBounds.getLeft() + parentBounds.getRight() + leftMargin - rightMargin) / 2;
            break;
        }
        if (orientation == anychart.enums.Orientation.TOP) {
          y = parentBounds.getTop() + topMargin + hHalf;
        } else if (orientation == anychart.enums.Orientation.BOTTOM) {
          y = parentBounds.getBottom() - bottomMargin - hHalf;
        }
      } else {
        if (orientation == anychart.enums.Orientation.RIGHT) {
          x = parentBounds.getRight() - rightMargin - wHalf;
        } else if (orientation == anychart.enums.Orientation.LEFT) {
          x = parentBounds.getLeft() + leftMargin + wHalf;
        }
        switch (this.align_) {
          case anychart.enums.Align.TOP:
          case anychart.enums.Align.LEFT:
            y = parentBounds.getTop() + topMargin + hHalf;
            break;
          case anychart.enums.Align.BOTTOM:
          case anychart.enums.Align.RIGHT:
            y = parentBounds.getBottom() - bottomMargin - hHalf;
            break;
          default:
            y = (parentBounds.getTop() + parentBounds.getBottom() + topMargin - bottomMargin) / 2;
            break;
        }
      }
    } else if (orientation == anychart.enums.Orientation.LEFT) {
      switch (this.align_) {
        case anychart.enums.Align.TOP:
        case anychart.enums.Align.RIGHT:
          y = parentBounds.getTop() + rightMargin + hHalf;
          break;
        case anychart.enums.Align.BOTTOM:
        case anychart.enums.Align.LEFT:
          y = parentBounds.getBottom() - leftMargin - hHalf;
          break;
        default:
          y = (parentBounds.getTop() + parentBounds.getBottom() - leftMargin + rightMargin) / 2;
          break;
      }
      x = parentBounds.getLeft() + topMargin + wHalf;
    } else {
      switch (this.align_) {
        case anychart.enums.Align.TOP:
        case anychart.enums.Align.LEFT:
          y = parentBounds.getTop() + leftMargin + hHalf;
          break;
        case anychart.enums.Align.BOTTOM:
        case anychart.enums.Align.RIGHT:
          y = parentBounds.getBottom() - rightMargin - hHalf;
          break;
        default:
          y = (parentBounds.getTop() + parentBounds.getBottom() + leftMargin - rightMargin) / 2;
          break;
      }
      x = parentBounds.getRight() - topMargin - wHalf;
    }
  }
  this.transformation_ = this.helperPlacer_(transform, x, y);
  this.pixelBounds_ = acgraph.math.getBoundsOfRectWithTransform(this.pixelBounds_, this.transformation_);
  this.transformation_.translate(-this.backgroundWidth_ / 2, -this.backgroundHeight_ / 2);

  if (orientation == anychart.enums.Orientation.TOP || orientation == anychart.enums.Orientation.BOTTOM || isRLYHorizontal) {
    this.pixelBounds_.left -= leftMargin;
    this.pixelBounds_.top -= topMargin;
    this.pixelBounds_.width += leftMargin + rightMargin;
    this.pixelBounds_.height += topMargin + bottomMargin;
  } else {
    this.pixelBounds_.left -= topMargin;
    this.pixelBounds_.top -= rightMargin;
    this.pixelBounds_.width += topMargin + bottomMargin;
    this.pixelBounds_.height += leftMargin + rightMargin;
  }
};


/**
 * Helper function for title positioning.
 * @param {goog.graphics.AffineTransform} tx
 * @param {number} x
 * @param {number} y
 * @return {goog.graphics.AffineTransform}
 * @private
 */
anychart.core.ui.Title.prototype.helperPlacer_ = function(tx, x, y) {
  var arr = [x, y, 0, 0];
  tx.createInverse().transform(arr, 0, arr, 0, 2);
  return tx.translate(arr[0] - arr[2], arr[1] - arr[3]);
};


/**
 * Internal background invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.core.ui.Title.prototype.backgroundInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    this.invalidate(anychart.ConsistencyState.TITLE_BACKGROUND, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Listener for bounds invalidation.
 * @param {anychart.SignalEvent} event Invalidation event.
 * @private
 */
anychart.core.ui.Title.prototype.boundsInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.BOUNDS,
        anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
  }
};


/**
 * Clear title.
 */
anychart.core.ui.Title.prototype.clear = function() {
  this.layer_.removeChildren();
};


/** @inheritDoc */
anychart.core.ui.Title.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');
  json['margin'] = this.margin().serialize();
  json['padding'] = this.padding().serialize();
  json['background'] = this.background().serialize();
  json['text'] = this.text();
  if (goog.isDef(this.rotation())) json['rotation'] = this.rotation();
  json['width'] = this.width();
  json['height'] = this.height();
  json['align'] = this.align();
  if (goog.isDef(this.orientation_)) json['orientation'] = this.orientation();
  return json;
};


/** @inheritDoc */
anychart.core.ui.Title.prototype.setupSpecial = function(var_args) {
  var args = arguments;
  if (goog.isString(args[0])) {
    this.text(args[0]);
    this.enabled(true);
    return true;
  }
  return anychart.core.Text.prototype.setupSpecial.apply(this, args);
};


/** @inheritDoc */
anychart.core.ui.Title.prototype.setupByJSON = function(config) {
  goog.base(this, 'setupByJSON', config);
  this.margin(config['margin']);
  this.padding(config['padding']);
  this.background(config['background']);
  this.text(config['text']);
  this.rotation(config['rotation']);
  this.width(config['width']);
  this.height(config['height']);
  this.align(config['align']);
  this.orientation(config['orientation']);
};


//exports
anychart.core.ui.Title.prototype['text'] = anychart.core.ui.Title.prototype.text;//in docs/final
anychart.core.ui.Title.prototype['background'] = anychart.core.ui.Title.prototype.background;//in docs/final
anychart.core.ui.Title.prototype['rotation'] = anychart.core.ui.Title.prototype.rotation;//in docs/final
anychart.core.ui.Title.prototype['width'] = anychart.core.ui.Title.prototype.width;//in docs/final
anychart.core.ui.Title.prototype['height'] = anychart.core.ui.Title.prototype.height;//in docs/final
anychart.core.ui.Title.prototype['margin'] = anychart.core.ui.Title.prototype.margin;//in docs/final
anychart.core.ui.Title.prototype['padding'] = anychart.core.ui.Title.prototype.padding;//in docs/final
anychart.core.ui.Title.prototype['align'] = anychart.core.ui.Title.prototype.align;//in docs/final
anychart.core.ui.Title.prototype['orientation'] = anychart.core.ui.Title.prototype.orientation;//in docs/final
anychart.core.ui.Title.prototype['getRemainingBounds'] = anychart.core.ui.Title.prototype.getRemainingBounds;//in docs/final
