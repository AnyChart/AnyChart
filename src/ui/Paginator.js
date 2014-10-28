goog.provide('anychart.ui.Paginator');
goog.require('acgraph');
goog.require('anychart.VisualBaseWithBounds');
goog.require('anychart.elements.Background');
goog.require('anychart.elements.Text');
goog.require('anychart.enums');
goog.require('anychart.math.Rect');
goog.require('anychart.ui.PaginatorButton');
goog.require('anychart.utils.Margin');
goog.require('anychart.utils.Padding');



/**
 * Paginator base class.
 * @constructor
 * @extends {anychart.elements.Text}
 */
anychart.ui.Paginator = function() {
  goog.base(this);

  /**
   * TODO(AntonKagakin): make it able to set?
   * Spacing between text and buttons.
   * @type {number}
   * @private
   */
  this.spacing_ = 10;

  /**
   * Bounds of the parent element.
   * @type {anychart.math.Rect}
   * @private
   */
  this.parentBounds_;

  /**
   * Margin of paginator.
   * @type {anychart.utils.Margin}
   * @private
   */
  this.margin_;

  /**
   * Padding of paginator.
   * @type {anychart.utils.Padding}
   * @private
   */
  this.padding_;

  /**
   * Background for paginator.
   * @type {anychart.elements.Background}
   * @private
   */
  this.background_;

  /**
   * Page of the paginator.
   * @type {number}
   * @private
   */
  this.currentPage_;

  /**
   * Total pages.
   * @type {number}
   * @private
   */
  this.pageCount_;

  /**
   * Layout of the items in the paginator.
   * @type {anychart.enums.Layout}
   * @private
   */
  this.layout_;


  /**
   * Paginator previous button.
   * @type {anychart.ui.Button}
   * @private
   */
  this.previousButton_;

  /**
   * Paginator next button.
   * @type {anychart.ui.Button}
   * @private
   */
  this.nextButton_;

  /**
   * Text in the paginator.
   * @type {acgraph.vector.Text}
   * @private
   */
  this.text_ = null;

  this.fontFamily('Verdana')
      .fontSize('10')
      .fontWeight('normal')
      .fontColor('rgb(35,35,35)')
      .orientation('right')
      .margin(0)
      .padding(2);

  this.background()
      .enabled(false)
      .stroke({
        'keys': [
          '0 #DDDDDD 1',
          '1 #D0D0D0 1'
        ],
        'angle' : '90'
      })
      .fill({
        'keys': [
          '0 #FFFFFF 1',
          '0.5 #F3F3F3 1',
          '1 #FFFFFF 1'
        ],
        'angle' : '90'
      });

  this.pageCount(1);
  this.currentPage(1);

  this.previousButton_ = new anychart.ui.PaginatorButton();
  this.previousButton_.padding(null);
  this.previousButton_.setOnClickListener(goog.bind(anychart.ui.Paginator.onClick_, this));
  this.registerDisposable(this.previousButton_);
  this.previousButton_.listenSignals(anychart.ui.Paginator.buttonInvalidated_, this.previousButton_);

  this.nextButton_ = new anychart.ui.PaginatorButton();
  this.nextButton_.padding(null);
  this.nextButton_.setOnClickListener(goog.bind(anychart.ui.Paginator.onClick_, this));
  this.registerDisposable(this.nextButton_);
  this.nextButton_.listenSignals(anychart.ui.Paginator.buttonInvalidated_, this.nextButton_);

  this.layout('horizontal');
};
goog.inherits(anychart.ui.Paginator, anychart.elements.Text);


/**
 * Supported signals.
 * @type {number}
 */
anychart.ui.Paginator.prototype.SUPPORTED_SIGNALS = anychart.elements.Text.prototype.SUPPORTED_SIGNALS;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.ui.Paginator.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.elements.Text.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.BACKGROUND;


/**
 * Bounds of paginator parent element. Need to calculate percent-values of width, height.
 * @param {anychart.math.Rect=} opt_value Parent bounds.
 * @return {(anychart.math.Rect|anychart.ui.Paginator)} Bounds of parent element or self for chaining.
 */
anychart.ui.Paginator.prototype.parentBounds = function(opt_value) {
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
 * Orientation of the paginator.
 * @param {(anychart.enums.Orientation|string)=} opt_value .
 * @return {!anychart.ui.Paginator|anychart.enums.Orientation} .
 */
anychart.ui.Paginator.prototype.orientation = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeOrientation(opt_value);
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
 * Paginator padding.
 * @param {(string|number|anychart.utils.Space)=} opt_spaceOrTopOrTopAndBottom Space object or top or top and bottom
 *    space.
 * @param {(string|number)=} opt_rightOrRightAndLeft Right or right and left space.
 * @param {(string|number)=} opt_bottom Bottom space.
 * @param {(string|number)=} opt_left Left space.
 * @return {!(anychart.ui.Paginator|anychart.utils.Padding)} Padding or self for chaining.
 */
anychart.ui.Paginator.prototype.padding = function(opt_spaceOrTopOrTopAndBottom, opt_rightOrRightAndLeft, opt_bottom, opt_left) {
  if (!this.padding_) {
    this.padding_ = new anychart.utils.Padding();
    this.registerDisposable(this.padding_);
    this.padding_.listenSignals(this.boundsInvalidated_, this);
  }
  if (goog.isDef(opt_spaceOrTopOrTopAndBottom)) {
    if (goog.isObject(opt_spaceOrTopOrTopAndBottom)) {
      this.padding_.deserialize(opt_spaceOrTopOrTopAndBottom);
    } else {
      this.padding_.set.apply(this.padding_, arguments);
    }
    return this;
  }
  return this.padding_;
};


/**
 * Paginator margin.
 * @param {(string|number|anychart.utils.Space)=} opt_spaceOrTopOrTopAndBottom Space object or top or top and bottom
 *    space.
 * @param {(string|number)=} opt_rightOrRightAndLeft Right or right and left space.
 * @param {(string|number)=} opt_bottom Bottom space.
 * @param {(string|number)=} opt_left Left space.
 * @return {!(anychart.ui.Paginator|anychart.utils.Margin)} Padding or self for chaining.
 */
anychart.ui.Paginator.prototype.margin = function(opt_spaceOrTopOrTopAndBottom, opt_rightOrRightAndLeft, opt_bottom, opt_left) {
  if (!this.margin_) {
    this.margin_ = new anychart.utils.Margin();
    this.registerDisposable(this.margin_);
    this.margin_.listenSignals(this.boundsInvalidated_, this);
  }
  if (goog.isDef(opt_spaceOrTopOrTopAndBottom)) {
    if (goog.isObject(opt_spaceOrTopOrTopAndBottom)) {
      this.margin_.deserialize(opt_spaceOrTopOrTopAndBottom);
    } else {
      this.margin_.set.apply(this.margin_, arguments);
    }
    return this;
  }
  return this.margin_;
};


/**
 * Listener for padding and margin invalidation.
 * @param {anychart.SignalEvent} event Invalidation event.
 * @private
 */
anychart.ui.Paginator.prototype.boundsInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.BOUNDS,
        anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
  }
};


/**
 * Paginator background.
 * @param {(anychart.elements.Background|Object|string|null)=} opt_value .
 * @return {!(anychart.ui.Paginator|anychart.elements.Background)} .
 */
anychart.ui.Paginator.prototype.background = function(opt_value) {
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
    this.background_.resumeSignalsDispatching(false);
    this.invalidate(anychart.ConsistencyState.BACKGROUND, anychart.Signal.NEEDS_REDRAW);
    return this;
  } else {
    return this.background_;
  }
};


/**
 * Listener for background invalidation.
 * @param {anychart.SignalEvent} event Invalidation event.
 * @private
 */
anychart.ui.Paginator.prototype.backgroundInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    this.invalidate(anychart.ConsistencyState.BACKGROUND, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Getter for paginator layout.
 * @return {anychart.enums.Layout} Current layout or self for chaining.
 *//**
 * Setter for paginator layout.
 * @param {(string|anychart.enums.Layout)=} opt_value Value to set.
 * @return {!anychart.ui.Paginator} An instance of the {@link anychart.ui.Paginator} class for method chaining.
 *//**
 * @ignoreDoc
 * TODO(AntonKagakin): create customDrawers flag, to avoid custom layout drawing bug.
 * @param {(string|anychart.enums.Layout)=} opt_value Layout value.
 * @return {(anychart.ui.Paginator|anychart.enums.Layout)} Current layout or self for chaining.
 */
anychart.ui.Paginator.prototype.layout = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeLayout(opt_value);
    if (this.layout_ != opt_value) {
      this.layout_ = opt_value;
      if (this.layout_ == anychart.enums.Layout.HORIZONTAL) {
        this.previousButton_.buttonDrawer(anychart.ui.Paginator.LEFT_ARROW_DRAWER_);
        this.nextButton_.buttonDrawer(anychart.ui.Paginator.RIGHT_ARROW_DRAWER_);
      } else {
        this.previousButton_.buttonDrawer(anychart.ui.Paginator.UP_ARROW_DRAWER_);
        this.nextButton_.buttonDrawer(anychart.ui.Paginator.DOWN_ARROW_DRAWER_);
      }
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.layout_;
};


/**
 * Getter for page count.
 * @return {number} Current page count.
 *//**
 * Setter for page count.
 * @param {(number|string)=} opt_value Value to set.
 * @return {!anychart.ui.Paginator} An instance of the {@link anychart.ui.Paginator} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(number|string)=} opt_value Paginator page count to set.
 * @return {(number|anychart.ui.Paginator)} Current page count or self for chaining.
 */
anychart.ui.Paginator.prototype.pageCount = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = Math.ceil(isNaN(parseFloat(opt_value)) ? 1 : +opt_value);
    if (this.pageCount_ != opt_value) {
      if (!goog.isDef(this.pageCount_)) {
        // initialization
        this.pageCount_ = opt_value;
      } else {
        if (opt_value > 0) {
          if (opt_value < this.currentPage_ + 1) {
            this.currentPage_ = opt_value - 1;
          }
          this.pageCount_ = opt_value;
        } else {
          throw Error('incorrect pageCount value!! Should be more than 0');
        }
      }
      this.invalidate(anychart.ConsistencyState.BOUNDS | anychart.ConsistencyState.APPEARANCE,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.pageCount_;
};


/**
 * Getter for active page.
 * @return {number} Current page.
 *//**
 * Setter for active page.
 * @param {(number|string)=} opt_value Value to set.
 * @return {!anychart.ui.Paginator} An instance of the {@link anychart.ui.Paginator} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(number|string)=} opt_value Paginator page count to set.
 * @return {(number|anychart.ui.Paginator)} Current page or self for chaining.
 */
anychart.ui.Paginator.prototype.currentPage = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = isNaN(parseFloat(opt_value)) ? 0 : +opt_value;
    opt_value -= 1;
    if (this.currentPage_ != opt_value) {
      if (opt_value >= 0 && opt_value < this.pageCount_) {
        this.currentPage_ = opt_value;
        this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
      } else {
        throw Error('incorrect currentPage value!!');
      }
    }
    return this;
  }
  return this.currentPage_ + 1;
};


/**
 * Creates text string for paginator text.
 * @return {string} Text string.
 * @private
 */
anychart.ui.Paginator.prototype.createTextString_ = function() {
  var currentPageStr = isNaN(this.currentPage_) ? '-' : String(this.currentPage_ + 1);
  var pageCountStr = isNaN(this.pageCount_) ? '-' : String(this.pageCount_);

  return currentPageStr + ' / ' + pageCountStr;
};


/**
 * @inheritDoc
 */
anychart.ui.Paginator.prototype.remove = function() {
  this.background().remove();
  if (this.previousButton_) this.previousButton_.remove();
  if (this.nextButton_) this.nextButton_.remove();
  if (this.text_) this.text_.parent(null);
};


/**
 * Draws paginator.
 * @return {anychart.ui.Paginator} Self or chaining.
 */
anychart.ui.Paginator.prototype.draw = function() {
  if (!this.checkDrawingNeeded())
    return this;

  var container = /** @type {acgraph.vector.ILayer} */ (this.container());
  var stage = container ? container.getStage() : null;
  var manualSuspend = stage && !stage.isSuspended();
  if (manualSuspend) stage.suspend();

  var isInitial;
  if (isInitial = !this.text_) {
    this.text_ = acgraph.text();
    this.registerDisposable(this.text_);
  }

  this.background().suspendSignalsDispatching();

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    this.calculatePaginatorBounds_();
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    this.background().container(container).draw();
    if (this.previousButton_) this.previousButton_.container(container);
    if (this.text_) this.text_.parent(container);
    if (this.nextButton_) this.nextButton_.container(container);
    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.BACKGROUND)) {
    this.background_.pixelBounds(new anychart.math.Rect(this.actualLeft_, this.actualTop_, this.backgroundWidth_, this.backgroundHeight_));
    this.background_.draw();
    this.markConsistent(anychart.ConsistencyState.BACKGROUND);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    var zIndex = /** @type {number} */ (this.zIndex());
    if (this.background_) this.background_.zIndex(zIndex);
    if (this.previousButton_) this.previousButton_.zIndex(zIndex);
    if (this.text_) this.text_.zIndex(zIndex);
    if (this.nextButton_) this.nextButton_.zIndex(zIndex);
    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    this.textSettings('text', this.createTextString_());
    this.applyTextSettings(this.text_, isInitial);
    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    var textBounds = this.text_.getBounds();
    var buttonSize = textBounds.height;
    var parentBounds = this.parentBounds();
    this.previousButton_.width(buttonSize).height(buttonSize).parentBounds(/** @type {anychart.math.Rect} */ (parentBounds ? parentBounds : stage.getBounds()));
    this.nextButton_.width(buttonSize).height(buttonSize).parentBounds(/** @type {anychart.math.Rect} */ (parentBounds ? parentBounds : stage.getBounds()));

    var prevButtonX;
    var prevButtonY;
    var textX;
    var textY;
    var nextButtonX;
    var nextButtonY;

    var padTop = anychart.utils.normalizeSize(/** @type {number|string} */ (this.padding().top()), this.backgroundHeight_);
    var padLeft = anychart.utils.normalizeSize(/** @type {number|string} */ (this.padding().left()), this.backgroundWidth_);

    var availWidth = this.padding().tightenWidth(this.backgroundWidth_);
    var availHeight = this.padding().tightenHeight(this.backgroundHeight_);

    textY = this.actualTop_ + padTop + (availHeight - textBounds.height) / 2;
    textX = this.actualLeft_ + padLeft + (availWidth - textBounds.width) / 2;

    switch (this.layout_) {
      case anychart.enums.Layout.HORIZONTAL:
        prevButtonY = nextButtonY = textY;
        prevButtonX = textX - this.spacing_ - buttonSize;
        nextButtonX = textX + textBounds.width + this.spacing_;
        break;
      case anychart.enums.Layout.VERTICAL:
        prevButtonY = textY - this.spacing_ - buttonSize;
        nextButtonY = textY + textBounds.height + this.spacing_;
        prevButtonX = nextButtonX = textX + (textBounds.width - buttonSize) / 2;
        break;
    }

    this.previousButton_.position({
      'x': prevButtonX,
      'y': prevButtonY});


    this.text_.setTransformationMatrix(1, 0, 0, 1, 0, 0);
    this.text_.translate(textX, textY);

    this.nextButton_.position({
      'x': nextButtonX,
      'y': nextButtonY
    });

    this.previousButton_.disabled(this.currentPage_ == 0);
    this.nextButton_.disabled(this.currentPage_ + 1 == this.pageCount_);

    this.previousButton_.draw();
    this.nextButton_.draw();

    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }

  this.background().resumeSignalsDispatching(false);

  if (manualSuspend) stage.resume();
  return this;
};


/** @inheritDoc */
anychart.ui.Paginator.prototype.applyTextSettings = function(textElement, isInitial) {
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
 * Measures maximum paginator height.
 * @private
 * @return {Array.<number, number>} Measured max width and height.
 */
anychart.ui.Paginator.prototype.measureMaxDimensions_ = function() {
  if (!this.boundsCache_) this.boundsCache_ = {};
  var reCache = false;
  for (var i in this.changedSettings) {
    if (!(this.changedSettings[i] in this.notCauseBoundsChange)) {
      reCache = true;
      break;
    }
  }
  var cacheIndex = this.pageCount_ + this.layout_.substr(0, 1);
  if (reCache || !this.boundsCache_[cacheIndex]) {
    var measureText = acgraph.text();
    var stngs = this.changedSettings;
    this.applyTextSettings(measureText, true);
    this.changedSettings = stngs;
    var textStr = this.pageCount_ + ' / ' + this.pageCount_;
    measureText.text(textStr);
    var bounds = measureText.getBounds();
    goog.dispose(measureText);

    var buttonSize = bounds.height;
    var maxWidth;
    var maxHeight;

    if (this.layout_ == anychart.enums.Layout.HORIZONTAL) {
      maxWidth = buttonSize * 2 + this.spacing_ * 2 + bounds.width;
      maxHeight = bounds.height;
    } else {
      maxWidth = Math.max(buttonSize, bounds.width);
      maxHeight = buttonSize * 2 + this.spacing_ * 2 + bounds.height;
    }
    return (this.boundsCache_[cacheIndex] = [maxWidth, maxHeight]);
  }
  return this.boundsCache_[cacheIndex];
};


/**
 * Calculates actual size of the paginator.
 * @private
 */
anychart.ui.Paginator.prototype.calculatePaginatorBounds_ = function() {
  var container = /** @type {acgraph.vector.ILayer} */ (this.container());
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
    parentWidth = parentBounds.width;
    parentHeight = parentBounds.height;
  } else {
    parentWidth = parentHeight = undefined;
  }

  var width, height;
  var measure = this.measureMaxDimensions_();
  width = measure[0];
  height = measure[1];

  this.backgroundWidth_ = padding.widenWidth(width);
  this.backgroundHeight_ = padding.widenHeight(height);

  if (parentBounds && parentWidth < this.backgroundWidth_) {
    this.backgroundWidth_ = margin.tightenWidth(this.backgroundWidth_);
  }

  if (parentBounds && parentHeight < this.backgroundHeight_) {
    this.backgroundHeight_ = margin.tightenHeight(this.backgroundHeight_);
  }

  var widthWithMargin = margin.widenWidth(this.backgroundWidth_);
  var heightWithMargin = margin.widenHeight(this.backgroundHeight_);
  var leftMargin = parentBounds ? anychart.utils.normalizeSize(/** @type {number} */(margin.left()), this.backgroundWidth_) : 0;
  var topMargin = parentBounds ? anychart.utils.normalizeSize(/** @type {number} */(margin.top()), this.backgroundHeight_) : 0;

  if (parentBounds) {
    switch (this.orientation_) {
      case anychart.enums.Orientation.TOP:
        this.actualLeft_ = parentBounds.getLeft() + (parentWidth - widthWithMargin) / 2 + leftMargin;
        this.actualTop_ = parentBounds.getTop() + topMargin;
        break;
      case anychart.enums.Orientation.RIGHT:
        this.actualLeft_ = parentBounds.getRight() - widthWithMargin + leftMargin;
        this.actualTop_ = parentBounds.getTop() + (parentHeight - heightWithMargin) / 2 + topMargin;
        break;
      case anychart.enums.Orientation.BOTTOM:
        this.actualLeft_ = parentBounds.getLeft() + (parentWidth - widthWithMargin) / 2 + leftMargin;
        this.actualTop_ = parentBounds.getBottom() - heightWithMargin + topMargin;
        break;
      case anychart.enums.Orientation.LEFT:
        this.actualLeft_ = parentBounds.getLeft() + leftMargin;
        this.actualTop_ = parentBounds.getTop() + (parentHeight - heightWithMargin) / 2 + topMargin;
        break;
    }
    this.pixelBounds_ = new anychart.math.Rect(
        this.actualLeft_ - leftMargin,
        this.actualTop_ - topMargin,
        widthWithMargin,
        heightWithMargin);

  } else {
    this.actualLeft_ = leftMargin;
    this.actualTop_ = topMargin;
    this.pixelBounds_ = new anychart.math.Rect(0, 0, widthWithMargin, heightWithMargin);
  }
};


/**
 * Return paginator pixel bounds.
 * @return {anychart.math.Rect} pixel bounds.
 */
anychart.ui.Paginator.prototype.getPixelBounds = function() {
  if (!this.pixelBounds_ || this.hasInvalidationState(anychart.ConsistencyState.BOUNDS))
    this.calculatePaginatorBounds_();
  return this.pixelBounds_;
};


/**
 * @return {!anychart.math.Rect} Parent bounds without the space used by the title.
 */
anychart.ui.Paginator.prototype.getRemainingBounds = function() {
  if (!this.pixelBounds_ || this.hasInvalidationState(anychart.ConsistencyState.BOUNDS))
    this.calculatePaginatorBounds_();
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

  if (!this.enabled()) return parentBounds;

  switch (this.orientation_) {
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
 * Button internal invalidation handler.
 * @param {anychart.SignalEvent} event Event.
 * @this {anychart.ui.Button}
 * @private
 */
anychart.ui.Paginator.buttonInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    this.draw();
  }
};


/**
 * Buttons onClick handler.
 * @param {anychart.ui.Button} button Button that was clicked.
 * @this {anychart.ui.Paginator}
 * @private
 */
anychart.ui.Paginator.onClick_ = function(button) {
  switch (button) {
    case this.previousButton_:
      this.currentPage(this.currentPage() - 1);
      break;
    case this.nextButton_:
      this.currentPage(this.currentPage() + 1);
      break;
    default:
      throw Error('Something wrong with onClickListener!');
  }
};


//----------------------------------------------------------------------------------------------------------------------
// DEFAULT BUTTON DRAWERS
//----------------------------------------------------------------------------------------------------------------------
/**
 * Default left arrow drawer.
 * @param {acgraph.vector.Path} path Path to draw to.
 * @param {anychart.math.Rect} buttonBounds Button size.
 * @private
 */
anychart.ui.Paginator.LEFT_ARROW_DRAWER_ = function(path, buttonBounds) {
  path
      .moveTo(buttonBounds.getRight(), buttonBounds.getTop())
      .lineTo(buttonBounds.getRight(), buttonBounds.getBottom())
      .lineTo(buttonBounds.getLeft(), buttonBounds.getTop() + buttonBounds.height / 2)
      .close();
};


/**
 * Default right arrow drawer.
 * @param {acgraph.vector.Path} path Path to draw to.
 * @param {anychart.math.Rect} buttonBounds Button size.
 * @private
 */
anychart.ui.Paginator.RIGHT_ARROW_DRAWER_ = function(path, buttonBounds) {
  path
      .moveTo(buttonBounds.getLeft(), buttonBounds.getTop())
      .lineTo(buttonBounds.getRight(), buttonBounds.getTop() + buttonBounds.height / 2)
      .lineTo(buttonBounds.getLeft(), buttonBounds.getBottom())
      .close();
};


/**
 * Default up arrow drawer.
 * @param {acgraph.vector.Path} path Path to draw to.
 * @param {anychart.math.Rect} buttonBounds Button size.
 * @private
 */
anychart.ui.Paginator.UP_ARROW_DRAWER_ = function(path, buttonBounds) {
  path
      .moveTo(buttonBounds.getLeft() + buttonBounds.width / 2, buttonBounds.getTop())
      .lineTo(buttonBounds.getRight(), buttonBounds.getBottom())
      .lineTo(buttonBounds.getLeft(), buttonBounds.getBottom())
      .close();
};


/**
 * Default down arrow drawer.
 * @param {acgraph.vector.Path} path Path to draw to.
 * @param {anychart.math.Rect} buttonBounds Button size.
 * @private
 */
anychart.ui.Paginator.DOWN_ARROW_DRAWER_ = function(path, buttonBounds) {
  path
      .moveTo(buttonBounds.getLeft(), buttonBounds.getTop())
      .lineTo(buttonBounds.getRight(), buttonBounds.getTop())
      .lineTo(buttonBounds.getLeft() + buttonBounds.width / 2, buttonBounds.getBottom())
      .close();
};


/**
 * @inheritDoc
 */
anychart.ui.Paginator.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');

  json['orientation'] = this.orientation();
  json['layout'] = this.layout();
  json['pageCount'] = this.pageCount();
  json['currentPage'] = this.currentPage();

  json['margin'] = this.margin().serialize();
  json['padding'] = this.padding().serialize();
  json['background'] = this.background().serialize();

  return json;
};


/**
 * @inheritDoc
 */
anychart.ui.Paginator.prototype.deserialize = function(config) {
  this.suspendSignalsDispatching();

  goog.base(this, 'deserialize', config);

  this.orientation(config['orientation']);
  this.layout(config['layout']);
  this.pageCount(config['pageCount']);
  this.currentPage(config['currentPage']);

  this.textSettings(config);

  this.margin(config['margin']);
  this.padding(config['padding']);
  this.background(config['background']);

  this.resumeSignalsDispatching(true);

  return this;
};


/**
 * Constructor function.
 * @return {!anychart.ui.Paginator}
 */
anychart.ui.paginator = function() {
  return new anychart.ui.Paginator();
};


//exports
goog.exportSymbol('anychart.ui.paginator', anychart.ui.paginator);
anychart.ui.Paginator.prototype['parentBounds'] = anychart.ui.Paginator.prototype.parentBounds;
anychart.ui.Paginator.prototype['background'] = anychart.ui.Paginator.prototype.background;
anychart.ui.Paginator.prototype['orientation'] = anychart.ui.Paginator.prototype.orientation;
anychart.ui.Paginator.prototype['padding'] = anychart.ui.Paginator.prototype.padding;
anychart.ui.Paginator.prototype['margin'] = anychart.ui.Paginator.prototype.margin;
anychart.ui.Paginator.prototype['layout'] = anychart.ui.Paginator.prototype.layout;
anychart.ui.Paginator.prototype['pageCount'] = anychart.ui.Paginator.prototype.pageCount;
anychart.ui.Paginator.prototype['currentPage'] = anychart.ui.Paginator.prototype.currentPage;
anychart.ui.Paginator.prototype['draw'] = anychart.ui.Paginator.prototype.draw;
