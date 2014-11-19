goog.provide('anychart.elements.Title');
goog.require('acgraph');
goog.require('anychart.elements.Background');
goog.require('anychart.elements.Text');
goog.require('anychart.enums');
goog.require('anychart.math.Rect');
goog.require('anychart.utils');
goog.require('anychart.utils.Margin');
goog.require('anychart.utils.Padding');
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
 * anychart.elements.title()
 *     .text('My custom Title')
 *     .fontSize(27)
 *     .height('100')
 *     .vAlign('middle')
 *     .container(stage)
 *     .draw();
 * @constructor
 * @extends {anychart.elements.Text}
 */
anychart.elements.Title = function() {
  this.suspendSignalsDispatching();
  goog.base(this);

  this.text('Title text')
      .fontFamily('Tahoma')
      .fontSize('11')
      .fontWeight('bold')
      .fontColor('rgb(34,34,34)')
      .margin(5, 5, 5, 5)
      .padding(5)
      .background(null);

  this.resumeSignalsDispatching(false);
};
goog.inherits(anychart.elements.Title, anychart.elements.Text);


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.elements.Title.prototype.SUPPORTED_SIGNALS = anychart.elements.Text.prototype.SUPPORTED_SIGNALS;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.elements.Title.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.elements.Text.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.BACKGROUND;


/**
 * Text element.
 * @type {acgraph.vector.Text}
 * @private
 */
anychart.elements.Title.prototype.text_ = null;


/**
 * Background element (if any).
 * @type {anychart.elements.Background}
 * @private
 */
anychart.elements.Title.prototype.background_ = null;


/**
 * Layer element (if background is visible).
 * @type {acgraph.vector.Layer}
 * @private
 */
anychart.elements.Title.prototype.layer_ = null;


/**
 * Width settings for the title.
 * @type {number|string|null}
 * @private
 */
anychart.elements.Title.prototype.width_ = null;


/**
 * Height settings for the title.
 * @type {number|string|null}
 * @private
 */
anychart.elements.Title.prototype.height_ = null;


/**
 * Actual width of the title.
 * @type {number}
 * @private
 */
anychart.elements.Title.prototype.backgroundWidth_ = NaN;


/**
 * Actual height of the title.
 * @type {number}
 * @private
 */
anychart.elements.Title.prototype.backgroundHeight_ = NaN;


/**
 * Text width of the title.
 * @type {number}
 * @private
 */
anychart.elements.Title.prototype.textWidth_ = NaN;


/**
 * Text height of the title.
 * @type {number}
 * @private
 */
anychart.elements.Title.prototype.textHeight_ = NaN;


/**
 * Pixel bounds due to orientation, align, margins, padding, etc.
 * @type {anychart.math.Rect}
 * @private
 */
anychart.elements.Title.prototype.pixelBounds_ = null;


/**
 * Title margin.
 * @type {anychart.utils.Margin}
 * @private
 */
anychart.elements.Title.prototype.margin_ = null;


/**
 * Title text padding.
 * @type {anychart.utils.Padding}
 * @private
 */
anychart.elements.Title.prototype.padding_ = null;


/**
 * Title orientation.
 * @type {anychart.enums.Orientation}
 * @private
 */
anychart.elements.Title.prototype.orientation_;


/**
 * Title default orientation.
 * @type {anychart.enums.Orientation}
 * @private
 */
anychart.elements.Title.prototype.defaultOrientation_ = anychart.enums.Orientation.TOP;


/**
 * Title align.
 * @type {anychart.enums.Align}
 * @private
 */
anychart.elements.Title.prototype.align_ = anychart.enums.Align.CENTER;


/**
 * Title rotation. Value null states to autorotation due to orientation.
 * @type {number|undefined}
 * @private
 */
anychart.elements.Title.prototype.rotation_;


/**
 * @type {number}
 * @private
 */
anychart.elements.Title.prototype.defaultRotation_;


/**
 * Title transformation matrix.
 * @type {goog.graphics.AffineTransform}
 * @private
 */
anychart.elements.Title.prototype.transformation_ = null;


/**
 * Gets the text content for the current title.
 * @return {string} The current text content of the title.
 *//**
 * Sets the text content for the title.
 * @example <t>simple-h100</t>
 * var title = anychart.elements.title();
 * title.text('My custom Text');
 * title.container(stage)
 *      .draw();
 * @param {string=} opt_value ['Title text'] Value to set.
 * @return {!anychart.elements.Title} An instance of {@link anychart.elements.Title} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {string=} opt_value .
 * @return {!anychart.elements.Title|string} .
 */
anychart.elements.Title.prototype.text = function(opt_value) {
  return /** @type {!anychart.elements.Title|string} */(this.textSettings('text', opt_value));
};


/**
 * Getter for the title background.
 * @example <t>simple-h100</t>
 * var title = anychart.elements.title();
 * title.text('\' Simple text \'')
 *      .background()
 *          .stroke('1 rgb(36,102,177) 0.4')
 *          .corners(2);
 * title.container(stage)
 *      .draw()
 * @return {!anychart.elements.Background} Returns the current background.
 *//**
 * Setter for the title background.
 * @example <t>simple-h100</t>
 * var myTitleBackground = anychart.elements.background()
 *         .stroke('1 rgb(36,102,177) 0.4')
 *         .corners(2)
 *         .fill({
 *           keys: [
 *             "rgb(255,255,255) 1",
 *             "rgb(223,223,223) 1",
 *             "rgb(255,255,255) 1"
 *           ],
 *           angle: -90
 *         });
 * anychart.elements.title()
 *     .text('Title text')
 *     .padding(5)
 *     .background( myTitleBackground )
 *     .container(stage)
 *     .draw();
 * @param {anychart.elements.Background=} opt_value [null] Value to set.
 * @return {!anychart.elements.Title} An instance of {@link anychart.elements.Title} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {anychart.elements.Background=} opt_value .
 * @return {!(anychart.elements.Title|anychart.elements.Background)} .
 */
anychart.elements.Title.prototype.background = function(opt_value) {
  if (!this.background_) {
    this.background_ = new anychart.elements.Background();
    this.registerDisposable(this.background_);
    this.background_.listenSignals(this.backgroundInvalidated_, this);
  }

  if (goog.isDef(opt_value)) {
    this.background_.suspendSignalsDispatching();
    if (opt_value instanceof anychart.elements.Background) {
      this.background_.deserialize(opt_value.serialize());
    } else if (goog.isObject(opt_value)) {
      this.background_.deserialize(opt_value);
    } else if (anychart.utils.isNone(opt_value)) {
      this.background_.enabled(false);
    }
    this.background_.resumeSignalsDispatching(true);
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
 * @return {!anychart.elements.Title} An instance of {@link anychart.elements.Title} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(number|string|null)=} opt_value .
 * @return {!anychart.elements.Title|number|string|null} .
 */
anychart.elements.Title.prototype.width = function(opt_value) {
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
 * @return {!anychart.elements.Title} An instance of {@link anychart.elements.Title} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(number|string|null)=} opt_value .
 * @return {!anychart.elements.Title|number|string|null} .
 */
anychart.elements.Title.prototype.height = function(opt_value) {
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
 * Getter for the current title margin.<br/>
 * Learn more about margins at {@link anychart.Chart#margin}.
 * @return {anychart.utils.Margin} The current title margin.
 *//**
 * Setter for the title margin in pixels using one value.<br/>
 * @param {(string|number|anychart.utils.Space)=} opt_allValues Value to set.
 * @return {anychart.elements.Title} An instance of {@link anychart.elements.Title} class for method chaining.
 *//**
 * Setter for the title margin in pixels using several numbers.<br/>
 * @example <t>listingOnly</t>
 * // 1) top and bottom 10px, left and right 15px
 * title.margin(10, '15px');
 * // 2) top 10px, left and right 15px, bottom 5px
 * title.margin(10, '15px', 5);
 * // 3) top 10px, right 15px, bottom 5px, left 12px
 * title.margin(10, '15px', '5px', 12);
 * @param {(string|number)=} opt_value1 [0] Top or top-bottom space.
 * @param {(string|number)=} opt_value2 [0] Right or right-left space.
 * @param {(string|number)=} opt_value3 [10] Bottom space.
 * @param {(string|number)=} opt_value4 [0] Left space.
 * @return {anychart.elements.Title} An instance of {@link anychart.elements.Title} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(string|number|anychart.utils.Space)=} opt_spaceOrTopOrTopAndBottom .
 * @param {(string|number)=} opt_rightOrRightAndLeft .
 * @param {(string|number)=} opt_bottom .
 * @param {(string|number)=} opt_left .
 * @return {anychart.elements.Title|anychart.utils.Margin} .
 */
anychart.elements.Title.prototype.margin = function(opt_spaceOrTopOrTopAndBottom, opt_rightOrRightAndLeft, opt_bottom, opt_left) {
  if (!this.margin_) {
    this.margin_ = new anychart.utils.Margin();
    this.registerDisposable(this.margin_);
    this.margin_.listenSignals(this.boundsInvalidated_, this);
  }
  if (goog.isDef(opt_spaceOrTopOrTopAndBottom)) {
    this.margin_.set.apply(this.margin_, arguments);
    return this;
  }
  return this.margin_;
};


/**
 * Getter for the current title padding.<br/>
 * Learn more about paddings at {@link anychart.Chart#padding}.
 * @return {anychart.utils.Padding} The current title padding.
 *//**
 * Setter for the title padding in pixels using single value.<br/>
 * @param {(string|number|anychart.utils.Space)=} opt_value [null] Value to set.
 * @return {anychart.elements.Title} An instance of {@link anychart.elements.Title} class for method chaining.
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
 * @return {anychart.elements.Title} An instance of {@link anychart.elements.Title} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(string|number|anychart.utils.Space)=} opt_spaceOrTopOrTopAndBottom .
 * @param {(string|number)=} opt_rightOrRightAndLeft .
 * @param {(string|number)=} opt_bottom .
 * @param {(string|number)=} opt_left .
 * @return {anychart.elements.Title|anychart.utils.Padding} .
 */
anychart.elements.Title.prototype.padding = function(opt_spaceOrTopOrTopAndBottom, opt_rightOrRightAndLeft, opt_bottom, opt_left) {
  if (!this.padding_) {
    this.padding_ = new anychart.utils.Padding();
    this.registerDisposable(this.padding_);
    this.padding_.listenSignals(this.boundsInvalidated_, this);
  }
  if (goog.isDef(opt_spaceOrTopOrTopAndBottom)) {
    this.padding_.set.apply(this.padding_, arguments);
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
 * anychart.elements.title()
 *     .text('Left align')
 *     .align('left')
 *     .container(stage)
 *     .draw();
 * anychart.elements.title()
 *     .text('Right align')
 *     .align('right')
 *     .container(stage)
 *     .draw();
 * @param {(anychart.enums.Align|string)=} opt_value [{@link anychart.enums.Align}.CENTER] Value to set.
 * @return {!anychart.elements.Title} An instance of {@link anychart.elements.Title} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(anychart.enums.Align|string)=} opt_value .
 * @return {!anychart.elements.Title|anychart.enums.Align} .
 */
anychart.elements.Title.prototype.align = function(opt_value) {
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
 * anychart.elements.title()
 *     .text('Left title orientation')
 *     .orientation('left')
 *     .container(stage)
 *     .draw();
 * anychart.elements.title()
 *     .text('Right title orientation')
 *     .orientation('right')
 *     .container(stage)
 *     .draw();
 * @param {(anychart.enums.Orientation|string)=} opt_value [{@link anychart.enums.Orientation}.TOP] Value to set.
 * @return {!anychart.elements.Title} An instance of {@link anychart.elements.Title} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(anychart.enums.Orientation|string)=} opt_value .
 * @return {!anychart.elements.Title|anychart.enums.Orientation} .
 */
anychart.elements.Title.prototype.orientation = function(opt_value) {
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
anychart.elements.Title.prototype.setDefaultOrientation = function(value) {
  this.defaultOrientation_ = value;
};


/**
 * Title rotation. Set null or NaN to automatic rotation due to title orientation.
 * @param {number=} opt_value
 * @return {anychart.elements.Title|number}
 */
anychart.elements.Title.prototype.rotation = function(opt_value) {
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
anychart.elements.Title.prototype.setDefaultRotation = function(value) {
  this.defaultRotation_ = value;
};


/**
 * Render the title content.
 * @return {!anychart.elements.Title} An instance of {@link anychart.elements.Title} class for method chaining.
 */
anychart.elements.Title.prototype.draw = function() {
  if (!this.checkDrawingNeeded())
    return this;

  // We will need the text element anyway, so we should create it if it is missing.
  var isInitial;
  if (isInitial = !this.text_) {
    this.text_ = acgraph.text();
    this.registerDisposable(this.text_);
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

  var background = this.background();
  // Checking if we have to draw background. We don't draw it if it is totally transparent.
  var hasBackground = background.enabled() && (background.fill() != 'none' || background.stroke() != 'none');

  background.suspendSignalsDispatching();

  var needsPositionReset = false;

  // We should render a layer that has a background path and a text element in it.
  // So checking if there is a layer
  if (hasBackground && !this.layer_) {
    // and creating it if there is not.
    this.layer_ = acgraph.layer();
    // super-silently resetting background container to the newly created layer and drawing it to have the background go first
    background.container(this.layer_).draw();
    // settings text parent
    this.text_.parent(this.layer_);
    this.text_.setTransformationMatrix(1, 0, 0, 1, 0, 0);
    this.registerDisposable(this.layer_);
    this.invalidate(anychart.ConsistencyState.CONTAINER);
    needsPositionReset = true;
  } else if (!hasBackground && this.layer_) {
    // Else we should render only the text element, so if there is a layer then we should remove the background
    // from it and dispose the layer. And also silently invalidate the CONTAINER to rerender the text to the proper
    // container later in this method
    if (background.container() == this.layer_)
      background.container(null).draw();
    this.text_.parent(container);
    goog.dispose(this.layer_);
    this.layer_ = null;
    this.invalidate(anychart.ConsistencyState.CONTAINER);
    needsPositionReset = true;
  }

  var elementToPosition = hasBackground ? this.layer_ : this.text_;

  // Checking BOUNDS state. If it is inconsistent, we need to recalculate title bounds.
  // But we don't need to mark it consistent here, because we don't know where to apply that new bounds yet.
  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    this.calcActualBounds_();
    if (background) {
      // settings proper bounds to the background
      background.parentBounds(0, 0, this.backgroundWidth_, this.backgroundHeight_);
      background.draw();
      this.markConsistent(anychart.ConsistencyState.BACKGROUND);
    }
    // settings text offset for
    this.text_.x(anychart.utils.normalizeSize(/** @type {number|string} */(this.padding().left()), this.backgroundWidth_));
    this.text_.y(anychart.utils.normalizeSize(/** @type {number|string} */(this.padding().top()), this.backgroundHeight_));

    needsPositionReset = true;
    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }

  if (needsPositionReset) {
    elementToPosition.setTransformationMatrix(
        this.transformation_.getScaleX(),
        this.transformation_.getShearY(),
        this.transformation_.getShearX(),
        this.transformation_.getScaleY(),
        this.transformation_.getTranslateX(),
        this.transformation_.getTranslateY());
  }

  // If background appearance changed, we should do something about that.
  if (this.hasInvalidationState(anychart.ConsistencyState.BACKGROUND)) {
    background.parentBounds(0, 0, this.backgroundWidth_, this.backgroundHeight_);
    background.draw();
    this.markConsistent(anychart.ConsistencyState.BACKGROUND);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    elementToPosition.zIndex(/** @type {number} */(this.zIndex()));
    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    if (hasBackground)
      this.layer_.parent(container);
    else
      this.text_.parent(container);
    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }

  if (background)
    background.resumeSignalsDispatching(false);

  if (manualSuspend) stage.resume();
  return this;
};


/** @inheritDoc */
anychart.elements.Title.prototype.remove = function() {
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
 * var title1 = anychart.elements.title()
 *     .text('First title')
 *     .container(stage)
 *     .draw();
 * // Placing the second title over the remaining part - under the first title.
 * anychart.elements.title()
 *     .text('Second title')
 *     .container(stage)
 *     .parentBounds(title1.getRemainingBounds())
 *     .draw();
 * @return {!anychart.math.Rect} Parent bounds without the space used by the title.
 */
anychart.elements.Title.prototype.getRemainingBounds = function() {
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
 * Return the title content bounds.
 * @return {anychart.math.Rect} Content bounds.
 */
anychart.elements.Title.prototype.getContentBounds = function() {
  if (!this.enabled())
    return new anychart.math.Rect(0, 0, 0, 0);
  if (!this.pixelBounds_ || this.hasInvalidationState(anychart.ConsistencyState.BOUNDS))
    this.calcActualBounds_();
  return this.pixelBounds_;
};


/** @inheritDoc */
anychart.elements.Title.prototype.applyTextSettings = function(textElement, isInitial) {
  if (isInitial || 'text' in this.changedSettings || 'useHtml' in this.changedSettings) {
    if (!!this.settingsObj['useHtml'])
      textElement.htmlText(this.settingsObj['text']);
    else
      textElement.text(this.settingsObj['text']);
  }
  goog.base(this, 'applyTextSettings', textElement, isInitial);
  this.changedSettings = {};
};


/**
 * Internal getter for the title rotation (orientation wise).
 * @return {number} Rotation degree.
 * @private
 */
anychart.elements.Title.prototype.getRotation_ = function() {
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
anychart.elements.Title.prototype.calcActualBounds_ = function() {
  var container = /** @type {acgraph.vector.ILayer} */(this.container());
  var stage = container ? container.getStage() : null;

  var padding = this.padding();
  var margin = this.margin();
  /** @type {anychart.math.Rect} */
  var parentBounds = /** @type {anychart.math.Rect} */(this.parentBounds());

  var parentWidth, parentHeight;
  var orientation = this.orientation();
  if (parentBounds) {
    if (orientation == anychart.enums.Orientation.TOP ||
        orientation == anychart.enums.Orientation.BOTTOM ||
        this.rotation() % 180 == 0) {
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
  if (isInitial = !this.text_) {
    this.text_ = acgraph.text();
    this.registerDisposable(this.text_);
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

  if (goog.isNull(this.width_)) {
    this.textWidth_ = textBounds.width;
    this.backgroundWidth_ = padding.widenWidth(this.textWidth_);
  } else {
    this.backgroundWidth_ = anychart.utils.normalizeSize(/** @type {number|string} */(this.width_), parentWidth);
    this.textWidth_ = padding.tightenWidth(this.backgroundWidth_);
  }

  if (parentBounds && parentWidth < margin.widenWidth(this.backgroundWidth_)) {
    this.backgroundWidth_ = margin.tightenWidth(parentWidth);
    this.textWidth_ = padding.tightenWidth(this.backgroundWidth_);
    this.text_.width(this.textWidth_);
  } else if (!goog.isNull(this.width_))
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
  var transform = goog.graphics.AffineTransform.getRotateInstance(goog.math.toRadians(this.getRotation_()), 0, 0);
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

  if (parentBounds) {
    switch (orientation) {
      case anychart.enums.Orientation.TOP:
      case anychart.enums.Orientation.BOTTOM:
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
        break;
      case anychart.enums.Orientation.LEFT:
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
        break;
      case anychart.enums.Orientation.RIGHT:
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
        break;
    }
    switch (orientation) {
      case anychart.enums.Orientation.TOP:
        y = parentBounds.getTop() + topMargin + hHalf;
        break;
      case anychart.enums.Orientation.RIGHT:
        x = parentBounds.getRight() - topMargin - wHalf;
        break;
      case anychart.enums.Orientation.BOTTOM:
        y = parentBounds.getBottom() - bottomMargin - hHalf;
        break;
      case anychart.enums.Orientation.LEFT:
        x = parentBounds.getLeft() + topMargin + wHalf;
        break;
    }
  }
  this.transformation_ = this.helperPlacer_(transform, x, y);
  this.pixelBounds_ = acgraph.math.getBoundsOfRectWithTransform(this.pixelBounds_, this.transformation_);
  this.transformation_.translate(-this.backgroundWidth_ / 2, -this.backgroundHeight_ / 2);
  switch (orientation) {
    case anychart.enums.Orientation.TOP:
      this.pixelBounds_.left -= leftMargin;
      this.pixelBounds_.top -= topMargin;
      this.pixelBounds_.width += leftMargin + rightMargin;
      this.pixelBounds_.height += topMargin + bottomMargin;
      break;
    case anychart.enums.Orientation.RIGHT:
      this.pixelBounds_.left -= bottomMargin;
      this.pixelBounds_.top -= leftMargin;
      this.pixelBounds_.width += topMargin + bottomMargin;
      this.pixelBounds_.height += leftMargin + rightMargin;
      break;
    case anychart.enums.Orientation.BOTTOM:
      this.pixelBounds_.left -= leftMargin;
      this.pixelBounds_.top -= topMargin;
      this.pixelBounds_.width += leftMargin + rightMargin;
      this.pixelBounds_.height += topMargin + bottomMargin;
      break;
    case anychart.enums.Orientation.LEFT:
      this.pixelBounds_.left -= topMargin;
      this.pixelBounds_.top -= rightMargin;
      this.pixelBounds_.width += topMargin + bottomMargin;
      this.pixelBounds_.height += leftMargin + rightMargin;
      break;
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
anychart.elements.Title.prototype.helperPlacer_ = function(tx, x, y) {
  var arr = [x, y, 0, 0];
  tx.createInverse().transform(arr, 0, arr, 0, 2);
  return tx.translate(arr[0] - arr[2], arr[1] - arr[3]);
};


/**
 * Internal background invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.elements.Title.prototype.backgroundInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    this.invalidate(anychart.ConsistencyState.BACKGROUND, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Listener for bounds invalidation.
 * @param {anychart.SignalEvent} event Invalidation event.
 * @private
 */
anychart.elements.Title.prototype.boundsInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.BOUNDS,
        anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
  }
};


/**
 * Clear title.
 */
anychart.elements.Title.prototype.clear = function() {
  this.layer_.removeChildren();
};


/**
 * @inheritDoc
 */
anychart.elements.Title.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');

  var align = this.align();
  var orientation = this.orientation();
  var width = this.width();
  var height = this.height();
  var text = this.text();

  var background = this.background_;
  var margin = this.margin_;
  var padding = this.padding_;

  json['align'] = align;
  json['orientation'] = orientation;
  json['width'] = width;
  json['height'] = height;
  json['text'] = text;

  if (background) json['background'] = background.serialize();
  if (margin) json['margin'] = margin.serialize();
  if (padding) json['padding'] = padding.serialize();

  return json;
};


/** @inheritDoc */
anychart.elements.Title.prototype.deserialize = function(config) {
  this.suspendSignalsDispatching();

  goog.base(this, 'deserialize', config);

  if ('padding' in config) {
    this.padding().deserialize(config['padding']);
  }

  if ('margin' in config) {
    this.margin().deserialize(config['margin']);
  }

  this.background(config['background']);
  this.textSettings(config);
  this.align(config['align']);
  this.orientation(config['orientation']);
  this.width(config['width']);
  this.height(config['height']);
  this.text(config['text']);

  this.resumeSignalsDispatching(true);

  return this;
};


/**
 * Constructor function.
 * @return {!anychart.elements.Title}
 */
anychart.elements.title = function() {
  return new anychart.elements.Title();
};


//exports
goog.exportSymbol('anychart.elements.title', anychart.elements.title);
anychart.elements.Title.prototype['text'] = anychart.elements.Title.prototype.text;//in docs/final
anychart.elements.Title.prototype['background'] = anychart.elements.Title.prototype.background;//in docs/final
anychart.elements.Title.prototype['rotation'] = anychart.elements.Title.prototype.rotation;//in docs/final
anychart.elements.Title.prototype['width'] = anychart.elements.Title.prototype.width;//in docs/final
anychart.elements.Title.prototype['height'] = anychart.elements.Title.prototype.height;//in docs/final
anychart.elements.Title.prototype['margin'] = anychart.elements.Title.prototype.margin;//in docs/final
anychart.elements.Title.prototype['padding'] = anychart.elements.Title.prototype.padding;//in docs/final
anychart.elements.Title.prototype['align'] = anychart.elements.Title.prototype.align;//in docs/final
anychart.elements.Title.prototype['orientation'] = anychart.elements.Title.prototype.orientation;//in docs/final
anychart.elements.Title.prototype['draw'] = anychart.elements.Title.prototype.draw;//in docs/final
anychart.elements.Title.prototype['getRemainingBounds'] = anychart.elements.Title.prototype.getRemainingBounds;//in docs/final
