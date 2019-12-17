goog.provide('anychart.core.ui.Paginator');
goog.require('acgraph');
goog.require('anychart.core.Text');
goog.require('anychart.core.reporting');
goog.require('anychart.core.ui.Background');
goog.require('anychart.core.ui.PaginatorButton');
goog.require('anychart.core.utils.Margin');
goog.require('anychart.core.utils.Padding');
goog.require('anychart.enums');
goog.require('anychart.math.Rect');



/**
 * Paginator base class.
 * @constructor
 * @extends {anychart.core.Text}
 */
anychart.core.ui.Paginator = function() {
  anychart.core.ui.Paginator.base(this, 'constructor');

  this.addThemes(anychart.themes.DefaultThemes['paginator']);

  /**
   * TODO(AntonKagakin): make it able to set?
   * Spacing between text and buttons.
   * @type {number}
   * @private
   */
  this.spacing_ = 10;

  /**
   * Margin of paginator.
   * @type {anychart.core.utils.Margin}
   * @private
   */
  this.margin_;

  /**
   * Padding of paginator.
   * @type {anychart.core.utils.Padding}
   * @private
   */
  this.padding_;

  /**
   * Background for paginator.
   * @type {anychart.core.ui.Background}
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
   * Paginator previous button.
   * @type {anychart.core.ui.Button}
   * @private
   */
  this.previousButton_;

  /**
   * Paginator next button.
   * @type {anychart.core.ui.Button}
   * @private
   */
  this.nextButton_;

  /**
   * Text in the paginator.
   * @type {acgraph.vector.Text}
   * @private
   */
  this.text_ = null;

  /**
   * Paginator text DOM element.
   * @type {Element}
   * @private
   */
  this.paginatorTextEl_ = null;

  /**
   *
   * @type {goog.math.Rect}
   * @private
   */
  this.predefinedTextBounds_ = null;

  this.pageCount(1);
  this.currentPage(1);

  this.previousButton_ = new anychart.core.ui.PaginatorButton();
  this.previousButton_.padding(null);
  this.previousButton_.enabled(true);
  this.previousButton_.setOnClickListener(goog.bind(anychart.core.ui.Paginator.onClick_, this));
  this.previousButton_.listenSignals(anychart.core.ui.Paginator.buttonInvalidated_, this.previousButton_);

  this.nextButton_ = new anychart.core.ui.PaginatorButton();
  this.nextButton_.padding(null);
  this.nextButton_.enabled(true);
  this.nextButton_.setOnClickListener(goog.bind(anychart.core.ui.Paginator.onClick_, this));
  this.nextButton_.listenSignals(anychart.core.ui.Paginator.buttonInvalidated_, this.nextButton_);

  //TODO(AntonKagakin): create customDrawers flag, to avoid custom layout drawing bug.
  var self = this;
  var layoutBeforeInvalidationHook = function() {
    if (this.getOption('layout') == anychart.enums.Layout.HORIZONTAL) {
      self.previousButton_.buttonDrawer(anychart.core.ui.Paginator.LEFT_ARROW_DRAWER_);
      self.nextButton_.buttonDrawer(anychart.core.ui.Paginator.RIGHT_ARROW_DRAWER_);
    } else {
      self.previousButton_.buttonDrawer(anychart.core.ui.Paginator.UP_ARROW_DRAWER_);
      self.nextButton_.buttonDrawer(anychart.core.ui.Paginator.DOWN_ARROW_DRAWER_);
    }
  };
  this.previousButton_.buttonDrawer(anychart.core.ui.Paginator.LEFT_ARROW_DRAWER_);
  this.nextButton_.buttonDrawer(anychart.core.ui.Paginator.RIGHT_ARROW_DRAWER_);

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['text', anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['orientation', anychart.ConsistencyState.BOUNDS,
      anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['layout', anychart.ConsistencyState.BOUNDS,
      anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED, 0, layoutBeforeInvalidationHook]
  ]);
};
goog.inherits(anychart.core.ui.Paginator, anychart.core.Text);


/**
 * @type {!Object<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.core.ui.Paginator.PROPERTY_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  anychart.core.settings.createDescriptors(map, [
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'orientation', anychart.enums.normalizeOrientation],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'layout', anychart.enums.normalizeLayout]
  ]);

  return map;
})();
anychart.core.settings.populate(anychart.core.ui.Paginator, anychart.core.Text.TEXT_DESCRIPTORS);
anychart.core.settings.populate(anychart.core.ui.Paginator, anychart.core.ui.Paginator.PROPERTY_DESCRIPTORS);


/**
 * Supported signals.
 * @type {number}
 */
anychart.core.ui.Paginator.prototype.SUPPORTED_SIGNALS = anychart.core.Text.prototype.SUPPORTED_SIGNALS;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.ui.Paginator.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.Text.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.PAGINATOR_BACKGROUND;


/**
 * Paginator padding.
 * @param {(string|number|Array.<number|string>|{top:(number|string),left:(number|string),bottom:(number|string),right:(number|string)})=} opt_spaceOrTopOrTopAndBottom Space object or top or top and bottom
 *    space.
 * @param {(string|number)=} opt_rightOrRightAndLeft Right or right and left space.
 * @param {(string|number)=} opt_bottom Bottom space.
 * @param {(string|number)=} opt_left Left space.
 * @return {!(anychart.core.ui.Paginator|anychart.core.utils.Padding)} Padding or self for chaining.
 */
anychart.core.ui.Paginator.prototype.padding = function(opt_spaceOrTopOrTopAndBottom, opt_rightOrRightAndLeft, opt_bottom, opt_left) {
  if (!this.padding_) {
    this.padding_ = new anychart.core.utils.Padding();
    this.padding_.listenSignals(this.boundsInvalidated_, this);

    this.setupCreated('padding', this.padding_);
  }
  if (goog.isDef(opt_spaceOrTopOrTopAndBottom)) {
    this.padding_.setup.apply(this.padding_, arguments);
    return this;
  }
  return this.padding_;
};


/**
 * Paginator margin.
 * @param {(string|number|Array.<number|string>|{top:(number|string),left:(number|string),bottom:(number|string),right:(number|string)})=} opt_spaceOrTopOrTopAndBottom Space object or top or top and bottom
 *    space.
 * @param {(string|number)=} opt_rightOrRightAndLeft Right or right and left space.
 * @param {(string|number)=} opt_bottom Bottom space.
 * @param {(string|number)=} opt_left Left space.
 * @return {!(anychart.core.ui.Paginator|anychart.core.utils.Margin)} Padding or self for chaining.
 */
anychart.core.ui.Paginator.prototype.margin = function(opt_spaceOrTopOrTopAndBottom, opt_rightOrRightAndLeft, opt_bottom, opt_left) {
  if (!this.margin_) {
    this.margin_ = new anychart.core.utils.Margin();
    this.margin_.listenSignals(this.boundsInvalidated_, this);

    this.setupCreated('margin', this.margin_);
  }
  if (goog.isDef(opt_spaceOrTopOrTopAndBottom)) {
    this.margin_.setup.apply(this.margin_, arguments);
    return this;
  }
  return this.margin_;
};


/**
 * Listener for padding and margin invalidation.
 * @param {anychart.SignalEvent} event Invalidation event.
 * @private
 */
anychart.core.ui.Paginator.prototype.boundsInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.BOUNDS,
        anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
  }
};


/**
 * Paginator background.
 * @param {(string|Object|null|boolean)=} opt_value .
 * @return {!(anychart.core.ui.Paginator|anychart.core.ui.Background)} .
 */
anychart.core.ui.Paginator.prototype.background = function(opt_value) {
  if (!this.background_) {
    this.background_ = new anychart.core.ui.Background();
    this.background_.listenSignals(this.backgroundInvalidated_, this);

    this.setupCreated('background', this.background_);
  }

  if (goog.isDef(opt_value)) {
    this.background_.setup(opt_value);
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
anychart.core.ui.Paginator.prototype.backgroundInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    this.invalidate(anychart.ConsistencyState.PAGINATOR_BACKGROUND, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Getter/setter for paginator text DOM element.
 * Required for calculating bounds on draw paginator.
 * @param {Element=} opt_value Paginator text DOM element.
 * @return {anychart.core.ui.Paginator|Element}
 */
anychart.core.ui.Paginator.prototype.paginatorTextElement = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (!this.paginatorTextEl_)
      this.paginatorTextEl_ = opt_value;

    return this;
  }
  return this.paginatorTextEl_;
};


/**
 * Getter/setter for pageCount.
 * @param {(number|string)=} opt_value Paginator page count to set.
 * @return {(number|anychart.core.ui.Paginator)} Current page count or self for chaining.
 */
anychart.core.ui.Paginator.prototype.pageCount = function(opt_value) {
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
 * Returns current paginator pages count.
 * @return {number}
 */
anychart.core.ui.Paginator.prototype.getPagesCount = function() {
  return this.pageCount_;
};


/**
 * Getter/setter for currentPage.
 * @param {(number|string)=} opt_value Paginator page count to set.
 * @return {(number|anychart.core.ui.Paginator)} Current page or self for chaining.
 */
anychart.core.ui.Paginator.prototype.currentPage = function(opt_value) {
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
anychart.core.ui.Paginator.prototype.createTextString_ = function() {
  var currentPageStr = isNaN(this.currentPage_) ? '-' : String(this.currentPage_ + 1);
  var pageCountStr = isNaN(this.pageCount_) ? '-' : String(this.pageCount_);

  return currentPageStr + ' / ' + pageCountStr;
};


/**
 * @inheritDoc
 */
anychart.core.ui.Paginator.prototype.remove = function() {
  var background = this.getCreated('background');
  if (background)
    background.remove();

  if (this.previousButton_) {
    this.previousButton_.remove();
    this.previousButton_.invalidate(anychart.ConsistencyState.CONTAINER);
  }
  if (this.nextButton_) {
    this.nextButton_.remove();
    this.nextButton_.invalidate(anychart.ConsistencyState.CONTAINER);
  }
  if (this.text_) this.text_.parent(null);
};


/**
 * This method is used in the legend for to automatically showing paginator.
 * @param {?boolean=} opt_value
 * @return {!anychart.core.ui.Paginator|boolean|null}
 */
anychart.core.ui.Paginator.prototype.autoEnabled = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.autoEnabled_ != opt_value) {
      this.autoEnabled_ = opt_value;
      this.invalidate(anychart.ConsistencyState.ENABLED, this.getEnableChangeSignals());
    }
    return this;
  } else {
    return this.autoEnabled_;
  }
};


/**
 * The method gives the possibility to disable paginator manually.
 * @return {(anychart.core.VisualBase|boolean|null)}
 */
anychart.core.ui.Paginator.prototype.getFinalEnabled = function() {
  return this.enabled() ? this.autoEnabled() : false;
};


/**
 * @inheritDoc
 */
anychart.core.ui.Paginator.prototype.checkDrawingNeeded = function() {
  if (this.isConsistent())
    return false;

  if (!this.getFinalEnabled()) {
    if (this.hasInvalidationState(anychart.ConsistencyState.ENABLED)) {
      this.remove();
      this.markConsistent(anychart.ConsistencyState.ENABLED);
      this.invalidate(anychart.ConsistencyState.CONTAINER);
    }
    return false;
  } else if (!this.container()) {
    this.remove(); // It should be removed if it was drawn.
    this.invalidate(anychart.ConsistencyState.CONTAINER);
    anychart.core.reporting.error(anychart.enums.ErrorCode.CONTAINER_NOT_SET);
    return false;
  }
  this.markConsistent(anychart.ConsistencyState.ENABLED);
  return true;
};


/**
 * Draws paginator.
 * @return {anychart.core.ui.Paginator} Self or chaining.
 */
anychart.core.ui.Paginator.prototype.draw = function() {
  if (!this.checkDrawingNeeded())
    return this;

  var container = /** @type {acgraph.vector.ILayer} */ (this.container());
  var stage = container ? container.getStage() : null;
  var manualSuspend = stage && !stage.isSuspended();
  if (manualSuspend) stage.suspend();

  var isInitial;
  if (isInitial = !this.text_) {
    this.text_ = acgraph.text();
    this.text_.attr('aria-hidden', 'true');
  }

  var background = this.getCreated('background');
  if (background)
    background.suspendSignalsDispatching();

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    this.calculatePaginatorBounds_();
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    if (background)
      background.container(container).draw();

    if (this.previousButton_) this.previousButton_.container(container);
    if (this.text_) this.text_.parent(container);
    if (this.nextButton_) this.nextButton_.container(container);
    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.PAGINATOR_BACKGROUND)) {
    if (background) {
      background.parentBounds(this.actualLeft_, this.actualTop_, this.backgroundWidth_, this.backgroundHeight_);
      background.draw();
    }
    this.markConsistent(anychart.ConsistencyState.PAGINATOR_BACKGROUND);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    var zIndex = /** @type {number} */ (this.zIndex());
    if (background)
      background.zIndex(zIndex);
    if (this.previousButton_) this.previousButton_.zIndex(zIndex);
    if (this.text_) this.text_.zIndex(zIndex);
    if (this.nextButton_) this.nextButton_.zIndex(zIndex);
    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    this.suspendSignalsDispatching();
    this.setOption('text', this.createTextString_());
    this.resumeSignalsDispatching(false);
    this.applyTextSettings(this.text_, isInitial);
    this.invalidate(anychart.ConsistencyState.BOUNDS);
    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    // get current paginator text
    this.paginatorTextEl_.textContent = this.createTextString_();
    // get measured bounds
    var textBounds = this.paginatorTextEl_['getBBox']();

    var buttonSize = textBounds.height;
    var parentBounds = /** @type {anychart.math.Rect} */(this.parentBounds());
    this.previousButton_.width(buttonSize).height(buttonSize).parentBounds(parentBounds);
    this.nextButton_.width(buttonSize).height(buttonSize).parentBounds(parentBounds);

    var prevButtonX;
    var prevButtonY;
    var textX;
    var textY;
    var nextButtonX;
    var nextButtonY;

    var padTop = anychart.utils.normalizeSize(/** @type {number|string} */ (this.padding().getOption('top')), this.backgroundHeight_);
    var padLeft = anychart.utils.normalizeSize(/** @type {number|string} */ (this.padding().getOption('left')), this.backgroundWidth_);

    var availWidth = this.padding().tightenWidth(this.backgroundWidth_);
    var availHeight = this.padding().tightenHeight(this.backgroundHeight_);

    textY = this.actualTop_ + padTop + (availHeight - textBounds.height) / 2;
    textX = this.actualLeft_ + padLeft + (availWidth - textBounds.width) / 2;

    switch (this.getOption('layout')) {
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
      'y': prevButtonY
    });


    this.text_.setTransformationMatrix(1, 0, 0, 1, 0, 0);
    this.text_.translate(textX, textY);

    this.nextButton_.position({
      'x': nextButtonX,
      'y': nextButtonY
    });

    this.previousButton_.disabled(!this.currentPage_);
    this.nextButton_.disabled(this.currentPage_ + 1 == this.pageCount_);

    this.previousButton_.draw();
    this.nextButton_.draw();

    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }

  if (background)
    background.resumeSignalsDispatching(false);

  if (manualSuspend) stage.resume();
  return this;
};


/**
 *
 * @param {goog.math.Rect=} opt_value - .
 * @return {anychart.core.ui.Paginator|goog.math.Rect}
 */
anychart.core.ui.Paginator.prototype.predefinedTextBounds = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.predefinedTextBounds_ = opt_value;
    return this;
  }
  return this.predefinedTextBounds_;
};


/**
 * Measures maximum paginator height.
 * @private
 * @param {number=} opt_pageCount Pages count.
 * @return {Array.<number>} Measured max width and height.
 */
anychart.core.ui.Paginator.prototype.measureMaxDimensionsSlow_ = function(opt_pageCount) {
  if (!this.boundsCache_) this.boundsCache_ = {};
  var pageCount = goog.isDef(opt_pageCount) ? opt_pageCount : this.pageCount_;
  var cacheIndex = pageCount + this.getOption('layout').substr(0, 1);
  if (!this.boundsCache_[cacheIndex]) {
    var measureText = acgraph.text();
    measureText.attr('aria-hidden', 'true');
    this.applyTextSettings(measureText, true);
    var textStr = pageCount + ' / ' + pageCount;
    measureText.text(textStr);
    var bounds = measureText.getBounds();
    goog.dispose(measureText);

    var buttonSize = bounds.height;
    var maxWidth;
    var maxHeight;

    if (this.getOption('layout') == anychart.enums.Layout.HORIZONTAL) {
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
 * Measures maximum paginator height.
 * @private
 * @param {number=} opt_pageCount Pages count.
 * @return {Array.<number>} Measured max width and height.
 */
anychart.core.ui.Paginator.prototype.measureMaxDimensions_ = function(opt_pageCount) {
  if (!this.predefinedTextBounds_)
    return this.measureMaxDimensionsSlow_(opt_pageCount);

  var buttonSize = this.predefinedTextBounds_.height;
  var maxWidth;
  var maxHeight;

  if (this.getOption('layout') == anychart.enums.Layout.HORIZONTAL) {
    maxWidth = buttonSize * 2 + this.spacing_ * 2 + this.predefinedTextBounds_.width;
    maxHeight = this.predefinedTextBounds_.height;
  } else {
    maxWidth = Math.max(buttonSize, this.predefinedTextBounds_.width);
    maxHeight = buttonSize * 2 + this.spacing_ * 2 + this.predefinedTextBounds_.height;
  }

  return [maxWidth, maxHeight];
};


/**
 * Calculates actual size of the paginator.
 * @private
 * @param {number=} opt_pageCount
 */
anychart.core.ui.Paginator.prototype.calculatePaginatorBounds_ = function(opt_pageCount) {
  var padding = this.padding();
  var margin = this.margin();

  var parentWidth, parentHeight;
  var parentBounds = /** @type {anychart.math.Rect} */(this.parentBounds());
  if (parentBounds) {
    parentWidth = parentBounds.width;
    parentHeight = parentBounds.height;
  }

  var width, height;
  var measure = this.measureMaxDimensions_(opt_pageCount);
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
  var leftMargin = parentBounds ? anychart.utils.normalizeSize(/** @type {number|string} */(margin.getOption('left')), this.backgroundWidth_) : 0;
  var topMargin = parentBounds ? anychart.utils.normalizeSize(/** @type {number|string} */(margin.getOption('top')), this.backgroundHeight_) : 0;

  if (parentBounds) {
    switch (this.getOption('orientation')) {
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
anychart.core.ui.Paginator.prototype.getPixelBounds = function() {
  return this.getPixelBoundsInternal();
};


/**
 * Calculates pixel bounds for paginator with predefined page count.
 * @param {number=} opt_pageCount
 * @return {anychart.math.Rect} pixel bounds.
 */
anychart.core.ui.Paginator.prototype.getPixelBoundsInternal = function(opt_pageCount) {
  if (!this.pixelBounds_ || this.hasInvalidationState(anychart.ConsistencyState.BOUNDS))
    this.calculatePaginatorBounds_(opt_pageCount);
  return this.pixelBounds_;
};


/**
 * @return {!anychart.math.Rect} Parent bounds without the space used by the title.
 */
anychart.core.ui.Paginator.prototype.getRemainingBounds = function() {
  if (!this.pixelBounds_ || this.hasInvalidationState(anychart.ConsistencyState.BOUNDS))
    this.calculatePaginatorBounds_();
  var parentBounds = /** @type {anychart.math.Rect} */(this.parentBounds());
  if (parentBounds)
    parentBounds = parentBounds.clone();
  else
    parentBounds = anychart.math.rect(0, 0, 0, 0);

  if (!this.enabled()) return parentBounds;

  switch (this.getOption('orientation')) {
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
 * @this {anychart.core.ui.Button}
 * @private
 */
anychart.core.ui.Paginator.buttonInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    this.draw();
  }
};


/**
 * Buttons onClick handler.
 * @param {anychart.core.ui.Button} button Button that was clicked.
 * @this {anychart.core.ui.Paginator}
 * @private
 */
anychart.core.ui.Paginator.onClick_ = function(button) {
  var currentPage = this.currentPage();
  var pagesCount = this.getPagesCount();

  switch (button) {
    case this.previousButton_:
      if (currentPage > 0)
        this.currentPage(currentPage - 1);
      break;
    case this.nextButton_:
      if (currentPage < pagesCount)
        this.currentPage(currentPage + 1);
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
anychart.core.ui.Paginator.LEFT_ARROW_DRAWER_ = function(path, buttonBounds) {
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
anychart.core.ui.Paginator.RIGHT_ARROW_DRAWER_ = function(path, buttonBounds) {
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
anychart.core.ui.Paginator.UP_ARROW_DRAWER_ = function(path, buttonBounds) {
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
anychart.core.ui.Paginator.DOWN_ARROW_DRAWER_ = function(path, buttonBounds) {
  path
      .moveTo(buttonBounds.getLeft(), buttonBounds.getTop())
      .lineTo(buttonBounds.getRight(), buttonBounds.getTop())
      .lineTo(buttonBounds.getLeft() + buttonBounds.width / 2, buttonBounds.getBottom())
      .close();
};


/** @inheritDoc */
anychart.core.ui.Paginator.prototype.serialize = function() {
  var json = anychart.core.ui.Paginator.base(this, 'serialize');

  anychart.core.settings.serialize(this, anychart.core.ui.Paginator.PROPERTY_DESCRIPTORS, json);
  json['background'] = this.background().serialize();
  json['padding'] = this.padding().serialize();
  json['margin'] = this.margin().serialize();
  return json;
};


/** @inheritDoc */
anychart.core.ui.Paginator.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.ui.Paginator.base(this, 'setupByJSON', config, opt_default);

  anychart.core.settings.deserialize(this, anychart.core.ui.Paginator.PROPERTY_DESCRIPTORS, config, opt_default);

  if ('padding' in config)
    this.padding().setupInternal(!!opt_default, config['padding']);

  if ('margin' in config)
    this.margin().setupInternal(!!opt_default, config['margin']);

  if ('background' in config)
    this.background().setupInternal(!!opt_default, config['background']);
};


/** @inheritDoc */
anychart.core.ui.Paginator.prototype.disposeInternal = function() {
  goog.disposeAll(
      this.previousButton_,
      this.nextButton_,
      this.padding_,
      this.margin_,
      this.background_,
      this.text_
  );

  this.previousButton_ = null;
  this.nextButton_ = null;
  this.padding_ = null;
  this.margin_ = null;
  this.background_ = null;
  this.text_ = null;

  anychart.core.ui.Paginator.base(this, 'disposeInternal');
};

//proto['pageCount'] = proto.pageCount;
//proto['draw'] = proto.draw;

//exports
(function() {
  var proto = anychart.core.ui.Paginator.prototype;
  // auto generated
  // proto['orientation'] = proto.orientation;
  // proto['layout'] = proto.layout;
  proto['background'] = proto.background;
  proto['padding'] = proto.padding;
  proto['margin'] = proto.margin;
  proto['currentPage'] = proto.currentPage;
  proto['getPagesCount'] = proto.getPagesCount;
  // auto from anychart.core.Text
  // proto['text'] = proto.text;
})();
