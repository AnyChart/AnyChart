goog.provide('anychart.elements.Title');

goog.require('anychart.elements.Background');
goog.require('anychart.elements.Text');
goog.require('anychart.math.Rect');
goog.require('anychart.utils');
goog.require('anychart.utils.Margin');
goog.require('anychart.utils.Padding');



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
 * new anychart.elements.Title()
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
      .zIndex(80)
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
 * If the text width is constricted.
 * @type {boolean}
 * @private
 */
anychart.elements.Title.prototype.widthConstricted_ = false;


/**
 * If the text height is constricted.
 * @type {boolean}
 * @private
 */
anychart.elements.Title.prototype.heightConstricted_ = false;


/**
 * Title left position.
 * @type {number}
 * @private
 */
anychart.elements.Title.prototype.actualLeft_ = NaN;


/**
 * Title top position.
 * @type {number}
 * @private
 */
anychart.elements.Title.prototype.actualTop_ = NaN;


/**
 * Parent bounds stored.
 * @type {anychart.math.Rect}
 * @private
 */
anychart.elements.Title.prototype.parentBounds_ = null;


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
 * @type {anychart.utils.Orientation}
 * @private
 */
anychart.elements.Title.prototype.orientation_ = anychart.utils.Orientation.TOP;


/**
 * Title align.
 * @type {anychart.utils.Align}
 * @private
 */
anychart.elements.Title.prototype.align_ = anychart.utils.Align.CENTER;


/**
 * Returns bounds for positioning.
 * @return {anychart.math.Rect} Current parent bounds.
 *//**
 * Sets bound for positioning.
 * @illustration <t>simple</t>
 * var layer = stage.layer();
 * var stageBounds = new anychart.math.Rect(0, 0, stage.width(), stage.height());
 * var layerBounds = new anychart.math.Rect(0, 0, stage.width() / 3, stage.height() / 3);
 * layer.rect(1, 1, stage.width() - 2, stage.height() - 2)
 *      .stroke('2 red');
 * layer.text(2, 2, 'stageBounds');
 * var layer2 = stage.layer();
 * layer2.rect(0, 0, stage.width() / 3, stage.height() / 3)
 *      .stroke('2 blue');
 * layer2.text(2, -20, 'layerBounds');
 * layer2.translate(0, stage.height() / 4);
 * new anychart.elements.Title()
 *     .text('Title\n(stageBounds)')
 *     .container(layer2)
 *     .fontSize(14)
 *     .hAlign('center')
 *     .parentBounds(stageBounds)
 *     .draw();
 * new anychart.elements.Title()
 *     .text('Title\n(layerBounds)')
 *     .fontSize(14)
 *     .hAlign('center')
 *     .container(layer2)
 *     .parentBounds(layerBounds)
 *     .fontColor('gray')
 *     .draw();
 * @illustrationDesc
 * Title is inside a layer (marked with a blue frame), two title positioning options are shown:<br/>
 *   a. Gray - within the parent container.<br/>
 *   b. Black - when the stage bounds act as parent.
 * @example <t>listingOnly</t>
 * new anychart.elements.Title()
 *     .text('Title text')
 *     .container(layer2)
 *     .parentBounds(stageBounds)
 *     .draw();
 * @param {anychart.math.Rect=} opt_value [null] Value to set.
 * @return {!anychart.elements.Title} An instance of {@link anychart.elements.Title} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {anychart.math.Rect=} opt_value .
 * @return {!anychart.elements.Title|anychart.math.Rect} .
 */
anychart.elements.Title.prototype.parentBounds = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.parentBounds_ != opt_value) {
      this.parentBounds_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.parentBounds_;
};


/**
 * Gets the text content for the current title.
 * @return {string} The current text content of the title.
 *//**
 * Sets the text content for the title.
 * @example <t>simple-h100</t>
 * var title = new anychart.elements.Title();
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
 * var title = new anychart.elements.Title();
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
 * var myTitleBackground = new anychart.elements.Background()
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
 * new anychart.elements.Title()
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
 * @return {anychart.utils.Align} The current title align.
 *//**
 * Setter for the title align.
 * @example <t>simple-h100</t>
 * stage.rect(1, 1, stage.width()-2, stage.height()-10).stroke('1 blue');
 * new anychart.elements.Title()
 *     .text('Left align')
 *     .align('left')
 *     .container(stage)
 *     .draw();
 * new anychart.elements.Title()
 *     .text('Right align')
 *     .align('right')
 *     .container(stage)
 *     .draw();
 * @param {(anychart.utils.Align|string)=} opt_value [{@link anychart.utils.Align}.CENTER] Value to set.
 * @return {!anychart.elements.Title} An instance of {@link anychart.elements.Title} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(anychart.utils.Align|string)=} opt_value .
 * @return {!anychart.elements.Title|anychart.utils.Align} .
 */
anychart.elements.Title.prototype.align = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.utils.normalizeAlign(opt_value);
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
 * @return {anychart.utils.Orientation} The orientation or the title for method chaining.
 *//**
 * Setter for the title orientation.
 * @example <t>simple</t>
 * stage.rect(1, 1, stage.width()-2, stage.height()-10).stroke('1 blue');
 * new anychart.elements.Title()
 *     .text('Left title orientation')
 *     .orientation('left')
 *     .container(stage)
 *     .draw();
 * new anychart.elements.Title()
 *     .text('Right title orientation')
 *     .orientation('right')
 *     .container(stage)
 *     .draw();
 * @param {(anychart.utils.Orientation|string)=} opt_value [{@link anychart.utils.Orientation}.TOP] Value to set.
 * @return {!anychart.elements.Title} An instance of {@link anychart.elements.Title} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(anychart.utils.Orientation|string)=} opt_value .
 * @return {!anychart.elements.Title|anychart.utils.Orientation} .
 */
anychart.elements.Title.prototype.orientation = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.utils.normalizeOrientation(opt_value);
    if (this.orientation_ != opt_value) {
      this.orientation_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.orientation_;
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
      background.pixelBounds(new anychart.math.Rect(0, 0, this.backgroundWidth_, this.backgroundHeight_));
      background.draw();
      this.markConsistent(anychart.ConsistencyState.BACKGROUND);
    }
    // setting text bounds if needed.
    this.text_.width(this.widthConstricted_ ? this.textWidth_ : null);
    this.text_.height(this.heightConstricted_ ? this.textHeight_ : null);
    // settings text offset for
    this.text_.x(/** @type {number} */(this.padding().left()));
    this.text_.y(/** @type {number} */(this.padding().top()));

    needsPositionReset = true;
    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }

  if (needsPositionReset) {
    elementToPosition.setTransformationMatrix(1, 0, 0, 1, 0, 0);
    elementToPosition.translate(this.actualLeft_, this.actualTop_);
    elementToPosition.rotate(this.getRotation_(), this.actualLeft_, this.actualTop_);
  }

  // If background appearance changed, we should do something about that.
  if (this.hasInvalidationState(anychart.ConsistencyState.BACKGROUND)) {
    background.pixelBounds(new anychart.math.Rect(0, 0, this.backgroundWidth_, this.backgroundHeight_));
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
 * var title1 = new anychart.elements.Title()
 *     .text('First title')
 *     .container(stage)
 *     .draw();
 * // Placing the second title over the remaining part - under the first title.
 * new anychart.elements.Title()
 *     .text('Second title')
 *     .container(stage)
 *     .parentBounds(title1.getRemainingBounds())
 *     .draw();
 * @return {!anychart.math.Rect} Parent bounds without the space used by the title.
 */
anychart.elements.Title.prototype.getRemainingBounds = function() {
  /** @type {anychart.math.Rect} */
  var parentBounds;
  if (this.parentBounds_) {
    parentBounds = this.parentBounds_.clone();
  } else {
    var container = /** @type {acgraph.vector.ILayer} */(this.container());
    var stage = container ? container.getStage() : null;
    if (stage) {
      parentBounds = stage.getBounds(); // cloned already
    } else {
      return new anychart.math.Rect(0, 0, 0, 0);
    }
  }
  if (!this.enabled())
    return parentBounds;
  if (!this.pixelBounds_ || this.hasInvalidationState(anychart.ConsistencyState.BOUNDS))
    this.calcActualBounds_();
  switch (this.orientation_) {
    case anychart.utils.Orientation.TOP:
      parentBounds.top += this.pixelBounds_.height;
      parentBounds.height -= this.pixelBounds_.height;
      break;
    case anychart.utils.Orientation.RIGHT:
      parentBounds.width -= this.pixelBounds_.width;
      break;
    case anychart.utils.Orientation.BOTTOM:
      parentBounds.height -= this.pixelBounds_.height;
      break;
    case anychart.utils.Orientation.LEFT:
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
  switch (this.orientation_) {
    case anychart.utils.Orientation.LEFT:
      return -90;
    case anychart.utils.Orientation.RIGHT:
      return 90;
    //case anychart.utils.Orientation.TOP:
    //case anychart.utils.Orientation.BOTTOM:
    default:
      return 0;
  }
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
  var parentBounds;
  if (this.parentBounds_) {
    parentBounds = this.parentBounds_;
  } else if (stage) {
    parentBounds = stage.getBounds();
  } else {
    parentBounds = null;
  }

  var parentWidth, parentHeight;
  if (parentBounds) {
    if (this.orientation_ == anychart.utils.Orientation.TOP ||
        this.orientation_ == anychart.utils.Orientation.BOTTOM) {
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

  if (goog.isNull(this.width_)) {
    this.textWidth_ = NaN;
  } else {
    this.backgroundWidth_ = anychart.utils.normalize(this.width_, parentWidth);
    this.textWidth_ = padding.tightenWidth(this.backgroundWidth_);
    this.widthConstricted_ = true;
  }

  if (goog.isNull(this.height_)) {
    this.textHeight_ = NaN;
  } else {
    this.backgroundHeight_ = anychart.utils.normalize(this.height_, parentHeight);
    this.textHeight_ = padding.tightenHeight(this.backgroundHeight_);
    this.heightConstricted_ = true;
  }

  var textBounds;
  if (this.width_ == null || this.height_ == null) {
    this.text_.setTransformationMatrix(1, 0, 0, 1, 0, 0);
    this.text_.width(isNaN(this.textWidth_) ? null : this.textWidth_);
    this.text_.height(isNaN(this.textHeight_) ? null : this.textHeight_);
    textBounds = this.text_.getBounds();
  }

  if (goog.isNull(this.width_)) {
    this.textWidth_ = textBounds.width;
    this.backgroundWidth_ = padding.widenWidth(this.textWidth_);
    if (parentBounds && parentWidth < margin.widenWidth(this.backgroundWidth_)) {
      this.backgroundWidth_ = margin.tightenWidth(parentWidth);
      this.textWidth_ = padding.tightenWidth(this.backgroundWidth_);
      this.widthConstricted_ = true;
    } else {
      this.widthConstricted_ = false;
    }
  }

  if (goog.isNull(this.height_)) {
    this.textHeight_ = textBounds.height;
    this.backgroundHeight_ = padding.widenHeight(this.textHeight_);
    if (parentBounds && parentHeight < margin.widenHeight(this.backgroundHeight_)) {
      this.backgroundHeight_ = margin.tightenHeight(parentHeight);
      this.textHeight_ = padding.tightenHeight(this.backgroundHeight_);
      this.heightConstricted_ = true;
    } else {
      this.heightConstricted_ = false;
    }
  }

  var widthWithMargin = margin.widenWidth(this.backgroundWidth_);
  var heightWithMargin = margin.widenHeight(this.backgroundHeight_);
  var leftMargin = anychart.utils.normalize(/** @type {number} */(margin.left()), this.backgroundWidth_);
  var topMargin = anychart.utils.normalize(/** @type {number} */(margin.top()), this.backgroundWidth_);

  if (parentBounds) {
    switch (this.orientation_) {
      case anychart.utils.Orientation.TOP:
      case anychart.utils.Orientation.BOTTOM:
        switch (this.align_) {
          case anychart.utils.Align.LEFT:
            this.actualLeft_ = parentBounds.getLeft() + leftMargin;
            break;
          case anychart.utils.Align.RIGHT:
            this.actualLeft_ = parentBounds.getRight() - widthWithMargin + leftMargin;
            break;
          default:
            this.actualLeft_ = (parentBounds.getLeft() + parentBounds.getRight() - widthWithMargin) / 2 + leftMargin;
            break;
        }
        break;
      case anychart.utils.Orientation.LEFT:
        switch (this.align_) {
          case anychart.utils.Align.TOP:
          case anychart.utils.Align.RIGHT:
            this.actualTop_ = parentBounds.getTop() + widthWithMargin - leftMargin;
            break;
          case anychart.utils.Align.BOTTOM:
          case anychart.utils.Align.LEFT:
            this.actualTop_ = parentBounds.getBottom() - leftMargin;
            break;
          default:
            this.actualTop_ = (parentBounds.getTop() + parentBounds.getBottom() + widthWithMargin) / 2 - leftMargin;
            break;
        }
        break;
      case anychart.utils.Orientation.RIGHT:
        switch (this.align_) {
          case anychart.utils.Align.TOP:
          case anychart.utils.Align.LEFT:
            this.actualTop_ = parentBounds.getTop() + leftMargin;
            break;
          case anychart.utils.Align.BOTTOM:
          case anychart.utils.Align.RIGHT:
            this.actualTop_ = parentBounds.getBottom() - widthWithMargin + leftMargin;
            break;
          default:
            this.actualTop_ = (parentBounds.getTop() + parentBounds.getBottom() - widthWithMargin) / 2 + leftMargin;
            break;
        }
        break;
    }
    switch (this.orientation_) {
      case anychart.utils.Orientation.TOP:
        this.actualTop_ = parentBounds.getTop() + topMargin;
        this.pixelBounds_ = new anychart.math.Rect(
            this.actualLeft_ - leftMargin,
            parentBounds.getTop(),
            widthWithMargin,
            heightWithMargin);
        break;
      case anychart.utils.Orientation.RIGHT:
        this.actualLeft_ = parentBounds.getRight() - topMargin;
        this.pixelBounds_ = new anychart.math.Rect(
            parentBounds.getRight() - heightWithMargin,
            this.actualTop_ - leftMargin,
            heightWithMargin,
            widthWithMargin);
        break;
      case anychart.utils.Orientation.BOTTOM:
        this.actualTop_ = parentBounds.getBottom() - heightWithMargin + topMargin;
        this.pixelBounds_ = new anychart.math.Rect(
            this.actualLeft_ - leftMargin,
            parentBounds.getBottom() - heightWithMargin,
            widthWithMargin,
            heightWithMargin);
        break;
      case anychart.utils.Orientation.LEFT:
        this.actualLeft_ = parentBounds.getLeft() + topMargin;
        this.pixelBounds_ = new anychart.math.Rect(
            parentBounds.getLeft(),
            this.actualTop_ - widthWithMargin + leftMargin,
            heightWithMargin,
            widthWithMargin);
        break;
    }
  } else {
    this.actualLeft_ = leftMargin;
    this.actualTop_ = topMargin;
    this.pixelBounds_ = new anychart.math.Rect(0, 0, widthWithMargin, heightWithMargin);
  }
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
