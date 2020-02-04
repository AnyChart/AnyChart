goog.provide('anychart.core.ui.Scroller');
goog.provide('anychart.standalones.Scroller');
goog.require('acgraph');
goog.require('anychart.core.Base');
goog.require('anychart.core.IStandaloneBackend');
goog.require('anychart.core.StateSettings');
goog.require('anychart.core.VisualBase');
goog.require('anychart.core.utils.Padding');
goog.require('anychart.enums');
goog.require('anychart.math.Rect');
goog.require('goog.fx.Dragger');
goog.require('goog.style');



/**
 * Scroller ui element
 * @constructor
 * @extends {anychart.core.VisualBase}
 * @implements {anychart.core.IStandaloneBackend}
 * @param {boolean=} opt_usesAbsolutePadding
 */
anychart.core.ui.Scroller = function(opt_usesAbsolutePadding) {
  anychart.core.ui.Scroller.base(this, 'constructor');

  this.addThemes(anychart.themes.DefaultThemes['scroller']);

  /**
   * If thumbs are shown. Cache to avoid children search.
   * @type {boolean}
   * @private
   */
  this.thumbsShown_ = false;

  /**
   * Root layer element.
   * @type {acgraph.vector.Layer}
   * @protected
   */
  this.rootLayer = null;

  /**
   * Left thumb. Always left - they swap on crossing.
   * @type {acgraph.vector.Path}
   * @private
   */
  this.startThumb_ = null;

  /**
   * Right thumb. We cannot call them left and right, because they can swap.
   * @type {acgraph.vector.Path}
   * @private
   */
  this.endThumb_ = null;

  /**
   * Selected range outline path.
   * @type {acgraph.vector.Path}
   * @private
   */
  this.selectedRangeOutline_ = null;

  /**
   * Non selected background rect.
   * @type {acgraph.vector.Rect}
   * @private
   */
  this.nonSelectedBackground_ = null;

  /**
   * Selected background rect.
   * @type {acgraph.vector.Rect}
   * @private
   */
  this.selectedBackground_ = null;

  /**
   * Non-selected range clip.
   * @type {acgraph.vector.Clip}
   * @protected
   */
  this.nonSelectedClipRect = null;

  /**
   * Selected range clip.
   * @type {acgraph.vector.Clip}
   * @protected
   */
  this.selectedClipRect = null;

  /**
   * Start ratio in range [0..anychart.core.ui.Scroller.MAX_RATIO]
   * @type {number}
   * @private
   */
  this.startRatio_ = 0;

  /**
   * End ratio in range [0..anychart.core.ui.Scroller.MAX_RATIO]
   * @type {number}
   * @private
   */
  this.endRatio_ = anychart.core.ui.Scroller.MAX_RATIO;

  /**
   * Cache of pixel bounds, where the scroller is drawn (without paddings). Updated in updateBounds_().
   * @type {!anychart.math.Rect}
   * @protected
   */
  this.pixelBoundsCache = new anychart.math.Rect(0, 0, 0, 0);

  /**
   * Cache of pixel bounds with paddings. Updated in updateBounds_().
   * @type {!anychart.math.Rect}
   * @protected
   */
  this.fullPixelBoundsCache = new anychart.math.Rect(0, 0, 0, 0);

  /**
   * Left thumb dragger.
   * @type {anychart.core.ui.Scroller.Dragger}
   * @private
   */
  this.startThumbDragger_ = null;

  /**
   * Right thumb dragger.
   * @type {anychart.core.ui.Scroller.Dragger}
   * @private
   */
  this.endThumbDragger_ = null;

  /**
   * Selected range dragger.
   * @type {anychart.core.ui.Scroller.Dragger}
   * @private
   */
  this.selectedRangeDragger_ = null;

  /**
   * Indicates if the scroller is in dragging action. Used to avoid thumbs hiding in drag. Not a boolean due to a
   * small possibility to get multiple drag on touch devices.
   * @type {number}
   * @private
   */
  this.isDragging_ = 0;

  /**
   * Indicates that the mouse is over the scroller. Used to control thumbs hiding.
   * @type {boolean}
   * @private
   */
  this.mouseOnScroller_ = false;

  /**
   * Whether the left thumb is hovered.
   * @type {boolean}
   * @private
   */
  this.startThumbHovered_ = false;

  /**
   * Whether the right thumb is hovered.
   * @type {boolean}
   * @private
   */
  this.endThumbHovered_ = false;

  /**
   * Thumbs settings reference.
   * @type {anychart.core.ui.Scroller.Thumbs}
   * @private
   */
  this.thumbs_ = null;

  /**
   * Padding.
   * @type {anychart.core.utils.Padding}
   * @private
   */
  this.padding_ = null;

  /**
   * If the padding should be applied without accordance to orientation.
   * @type {boolean}
   * @private
   */
  this.absolutePadding_ = !!opt_usesAbsolutePadding;

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['height', anychart.ConsistencyState.BOUNDS, anychart.Signal.BOUNDS_CHANGED | anychart.Signal.NEEDS_REDRAW],
    ['minHeight', anychart.ConsistencyState.BOUNDS, anychart.Signal.BOUNDS_CHANGED | anychart.Signal.NEEDS_REDRAW],
    ['maxHeight', anychart.ConsistencyState.BOUNDS, anychart.Signal.BOUNDS_CHANGED | anychart.Signal.NEEDS_REDRAW],
    ['orientation', anychart.ConsistencyState.BOUNDS |
         anychart.ConsistencyState.SCROLLER_ORIENTATION |
         anychart.ConsistencyState.SCROLLER_THUMBS_SHAPE,
      anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED
    ],
    ['inverted', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW],
    ['autoHide', anychart.ConsistencyState.SCROLLER_AUTO_HIDE, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['fill', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW],
    ['selectedFill', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW],
    ['outlineStroke', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW],
    ['allowRangeChange', 0, 0]
  ]);
};
goog.inherits(anychart.core.ui.Scroller, anychart.core.VisualBase);


/**
 * Scroller uses internal ratio in range [0..anychart.core.ui.Scroller.MAX_RATIO] to lower floating point errors influence.
 * @type {number}
 */
anychart.core.ui.Scroller.MAX_RATIO = 1000000;


/**
 * @typedef {{
 *   type: string,
 *   startRatio: number,
 *   endRatio: number,
 *   source: string
 * }}
 */
anychart.core.ui.Scroller.ScrollerChangeEvent;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.ui.Scroller.prototype.SUPPORTED_SIGNALS = anychart.core.VisualBase.prototype.SUPPORTED_SIGNALS;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.ui.Scroller.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.VisualBase.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.APPEARANCE |
    anychart.ConsistencyState.SCROLLER_ORIENTATION |
    anychart.ConsistencyState.SCROLLER_AUTO_HIDE |
    anychart.ConsistencyState.SCROLLER_THUMBS_SHAPE;


/**
 * Scroller min height.
 * @type {number|string|null}
 * @private
 */
anychart.core.ui.Scroller.prototype.minHeight_;


/**
 * Scroller max height.
 * @type {number|string|null}
 * @private
 */
anychart.core.ui.Scroller.prototype.maxHeight_;


/**
 * Scroller height.
 * @type {number|string}
 * @private
 */
anychart.core.ui.Scroller.prototype.height_;


/**
 * Thumbs settings getter/setter.
 * @param {(boolean|Object|null)=} opt_value
 * @return {anychart.core.ui.Scroller.Thumbs|anychart.core.ui.Scroller}
 */
anychart.core.ui.Scroller.prototype.thumbs = function(opt_value) {
  if (!this.thumbs_) {
    this.thumbs_ = new anychart.core.ui.Scroller.Thumbs(this);

    this.setupCreated('thumbs', this.thumbs_);
  }
  if (goog.isDef(opt_value)) {
    this.thumbs_.setup(opt_value);
    return this;
  }
  return this.thumbs_;
};


/**
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.core.ui.Scroller.PROPERTY_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  /**
   * Height, minHeight and maxHeight normalizer
   * @param {string} field Which field to be normalized
   * @return {function(this:anychart.core.ui.Scroller, *):(number|string|null)} Normalizer function
   */
  var heightNormalizer = function(field) {
    return function(val) {
      var normalized = anychart.utils.normalizeNumberOrPercent(val, null);
      return goog.isNull(val) ? /** @type {number|string|null} */ (this.getThemeOption(field)) :
          (goog.isNull(normalized) ? /** @type {number|string|null} */ (this.getOption(field)) : normalized);
    };
  };

  anychart.core.settings.createDescriptors(map, [
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'height', heightNormalizer('height')],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'minHeight', heightNormalizer('minHeight')],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'maxHeight', heightNormalizer('maxHeight')],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'orientation', anychart.core.settings.orientationNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'inverted', anychart.core.settings.booleanNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'autoHide', anychart.core.settings.booleanNormalizer],
    [anychart.enums.PropertyHandlerType.MULTI_ARG, 'fill', anychart.core.settings.fillNormalizer],
    [anychart.enums.PropertyHandlerType.MULTI_ARG, 'selectedFill', anychart.core.settings.fillNormalizer],
    [anychart.enums.PropertyHandlerType.MULTI_ARG, 'outlineStroke', anychart.core.settings.strokeNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'allowRangeChange', anychart.core.settings.booleanNormalizer]
  ]);

  return map;
})();
anychart.core.settings.populate(anychart.core.ui.Scroller, anychart.core.ui.Scroller.PROPERTY_DESCRIPTORS);


/**
 * Padding getter/setter.
 * @param {(string|number|Array.<number|string>|{top:(number|string),left:(number|string),bottom:(number|string),right:(number|string)})=} opt_spaceOrTopOrTopAndBottom .
 * @param {(string|number)=} opt_rightOrRightAndLeft .
 * @param {(string|number)=} opt_bottom .
 * @param {(string|number)=} opt_left .
 * @return {!(anychart.core.ui.Scroller|anychart.core.utils.Padding)} .
 */
anychart.core.ui.Scroller.prototype.padding = function(opt_spaceOrTopOrTopAndBottom, opt_rightOrRightAndLeft, opt_bottom,
    opt_left) {
  if (!this.padding_) {
    this.padding_ = new anychart.core.utils.Padding();
    this.padding_.listenSignals(this.paddingInvalidated_, this);

    this.setupCreated('padding', this.padding_);
  }

  if (goog.isDef(opt_spaceOrTopOrTopAndBottom)) {
    this.padding_.setup.apply(this.padding_, arguments);
    return this;
  } else {
    return this.padding_;
  }
};


/**
 * Internal padding invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.core.ui.Scroller.prototype.paddingInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION))
    this.invalidate(anychart.ConsistencyState.BOUNDS,
        anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
};


/**
 * If the scroller orientation is horizontal.
 * @return {boolean}
 */
anychart.core.ui.Scroller.prototype.isHorizontal = function() {
  return this.getOption('orientation') == anychart.enums.Orientation.BOTTOM ||
      this.getOption('orientation') == anychart.enums.Orientation.TOP;
};


/**
 * Cursor getter.
 * @return {acgraph.vector.Cursor}
 * @private
 */
anychart.core.ui.Scroller.prototype.getCursor_ = function() {
  return this.isHorizontal() ? acgraph.vector.Cursor.EW_RESIZE : acgraph.vector.Cursor.NS_RESIZE;
};


/**
 * Applies cursor to static entities.
 * @private
 */
anychart.core.ui.Scroller.prototype.applyStaticCursor_ = function() {
  this.startThumb_.cursor(this.getCursor_());
  this.endThumb_.cursor(this.getCursor_());
  this.selectedBackground_.cursor(this.getCursor_());
};


/** @inheritDoc */
anychart.core.ui.Scroller.prototype.remove = function() {
  if (this.rootLayer)
    this.rootLayer.remove();
};


/**
 * Returns true if the scroller is visible.
 * @return {boolean}
 */
anychart.core.ui.Scroller.prototype.isVisible = function() {
  return /** @type {boolean} */(this.enabled()) &&
      (!this.getOption('autoHide') ||
      /** @type {boolean} */ (this.getOption('allowRangeChange')) ||
      this.startRatio_ != 0 ||
      this.endRatio_ != anychart.core.ui.Scroller.MAX_RATIO);
};


/**
 * Draws the scroller.
 * @return {anychart.core.ui.Scroller}
 */
anychart.core.ui.Scroller.prototype.draw = function() {
  if (!this.checkDrawingNeeded())
    return this;

  this.markConsistent(anychart.ConsistencyState.SCROLLER_AUTO_HIDE);

  if (!this.isVisible()) {
    this.remove();
    this.invalidate(anychart.ConsistencyState.CONTAINER);
    return this;
  }
  if (this.isConsistent())
    return this;

  if (!this.rootLayer) {
    this.rootLayer = acgraph.layer();

    this.startThumb_ = acgraph.path();
    this.startThumb_.zIndex(100);

    this.endThumb_ = acgraph.path();
    this.endThumb_.zIndex(100);

    this.nonSelectedBackground_ = this.rootLayer.rect();
    this.nonSelectedBackground_.zIndex(1);

    this.nonSelectedClipRect = acgraph.clip();
    this.nonSelectedBackground_.clip(this.nonSelectedClipRect);

    this.selectedBackground_ = this.rootLayer.rect();
    this.selectedBackground_.zIndex(50);

    this.selectedClipRect = acgraph.clip();
    this.selectedBackground_.clip(this.selectedClipRect);

    this.selectedRangeOutline_ = this.rootLayer.path();
    this.selectedRangeOutline_.zIndex(99);

    this.bindHandlersToGraphics(this.rootLayer, this.mouseOver_, this.mouseOut_);

    this.eventsHandler.listen(this.startThumb_, acgraph.events.EventType.MOUSEOVER, this.thumbMouseOver_);
    this.eventsHandler.listen(this.startThumb_, acgraph.events.EventType.MOUSEOUT, this.thumbMouseOut_);
    this.eventsHandler.listenOnce(this.startThumb_, acgraph.events.EventType.MOUSEDOWN, this.thumbOrRangeMouseDown_);
    this.eventsHandler.listenOnce(this.startThumb_, acgraph.events.EventType.TOUCHSTART, this.thumbOrRangeMouseDown_);

    this.eventsHandler.listen(this.endThumb_, acgraph.events.EventType.MOUSEOVER, this.thumbMouseOver_);
    this.eventsHandler.listen(this.endThumb_, acgraph.events.EventType.MOUSEOUT, this.thumbMouseOut_);
    this.eventsHandler.listenOnce(this.endThumb_, acgraph.events.EventType.MOUSEDOWN, this.thumbOrRangeMouseDown_);
    this.eventsHandler.listenOnce(this.endThumb_, acgraph.events.EventType.TOUCHSTART, this.thumbOrRangeMouseDown_);

    this.eventsHandler.listenOnce(this.selectedBackground_, acgraph.events.EventType.MOUSEDOWN,
        this.thumbOrRangeMouseDown_);
    this.eventsHandler.listenOnce(this.selectedBackground_, acgraph.events.EventType.TOUCHSTART,
        this.thumbOrRangeMouseDown_);

    this.eventsHandler.listen(this.nonSelectedBackground_, acgraph.events.EventType.CLICK, this.nonSelectedRangeClick_);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    this.rootLayer.parent(/** @type {acgraph.vector.ILayer} */(this.container()));
    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    this.rootLayer.zIndex(/** @type {number} */(this.zIndex()));
    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.SCROLLER_ORIENTATION)) {
    this.applyStaticCursor_();
    this.invalidate(
        anychart.ConsistencyState.BOUNDS |
        anychart.ConsistencyState.SCROLLER_THUMBS_SHAPE |
        anychart.ConsistencyState.APPEARANCE);
    this.markConsistent(anychart.ConsistencyState.SCROLLER_ORIENTATION);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    this.updateBoundsCache();
    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.SCROLLER_THUMBS_SHAPE)) {
    this.prepareThumbs_();
    this.invalidate(anychart.ConsistencyState.APPEARANCE);
    this.markConsistent(anychart.ConsistencyState.SCROLLER_THUMBS_SHAPE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    // a bit redundant, but allows clearing BOUNDS state without initializing visual components (see getRemainingBounds())
    this.nonSelectedBackground_.setBounds(this.pixelBoundsCache);
    this.selectedBackground_.setBounds(this.pixelBoundsCache);

    this.nonSelectedClipRect.shape(this.pixelBoundsCache);

    var fill = /** @type {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)} */ (this.getOption('fill'));
    this.nonSelectedBackground_.fill(fill == 'none' ?
        anychart.color.TRANSPARENT_HANDLER : fill).stroke(null);

    var selectedFill = /** @type {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)} */ (this.getOption('selectedFill'));
    this.selectedBackground_.fill(selectedFill == 'none' ?
        anychart.color.TRANSPARENT_HANDLER : selectedFill).stroke(null);
    this.selectedRangeOutline_.stroke(/** @type {acgraph.vector.Stroke} */ (this.getOption('outlineStroke'))).fill(null);

    this.colorizeThumb_(this.startThumb_, this.startThumbHovered_);
    this.colorizeThumb_(this.endThumb_, this.endThumbHovered_);

    switch (this.getOption('orientation')) {
      case anychart.enums.Orientation.TOP:
        this.drawTop_();
        break;
      case anychart.enums.Orientation.RIGHT:
        this.drawRight_();
        break;
      case anychart.enums.Orientation.BOTTOM:
        this.drawBottom_();
        break;
      case anychart.enums.Orientation.LEFT:
        this.drawLeft_();
        break;
    }

    if (!this.thumbs().getOption('autoHide'))
      this.showThumbs_();

    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }

  return this;
};


/**
 * Draws bottom orientation.
 * @private
 */
anychart.core.ui.Scroller.prototype.drawBottom_ = function() {
  var bounds = this.pixelBoundsCache;
  var startRatio = this.startRatio_;
  var endRatio = this.endRatio_;
  if (this.getOption('inverted')) {
    startRatio = anychart.core.ui.Scroller.MAX_RATIO - startRatio;
    endRatio = anychart.core.ui.Scroller.MAX_RATIO - endRatio;
  }
  var startX = bounds.left + bounds.width * this.fromInternalRatio_(startRatio);
  var endX = bounds.left + bounds.width * this.fromInternalRatio_(endRatio);

  this.startThumb_.setTransformationMatrix(1, 0, 0, 1, startX, 0);
  this.endThumb_.setTransformationMatrix(1, 0, 0, 1, endX, 0);

  var leftX = Math.min(startX, endX);
  var rightX = Math.max(startX, endX);

  this.selectedClipRect.shape(leftX, bounds.top, rightX - leftX, bounds.height);

  leftX = anychart.utils.applyPixelShift(leftX, 1);
  rightX = anychart.utils.applyPixelShift(rightX, 1);
  var top = anychart.utils.applyPixelShift(bounds.top, 1);
  var bottom = anychart.utils.applyPixelShift(bounds.top + bounds.height, 1);

  this.selectedRangeOutline_
      .clear()
      .moveTo(bounds.left, top)
      .lineTo(leftX, top)
      .lineTo(leftX, bottom)
      .lineTo(rightX, bottom)
      .lineTo(rightX, top)
      .lineTo(bounds.left + bounds.width, top);
};


/**
 * Draws left orientation.
 * @private
 */
anychart.core.ui.Scroller.prototype.drawLeft_ = function() {
  var bounds = this.pixelBoundsCache;
  var startRatio = this.startRatio_;
  var endRatio = this.endRatio_;
  if (!this.getOption('inverted')) {
    startRatio = anychart.core.ui.Scroller.MAX_RATIO - startRatio;
    endRatio = anychart.core.ui.Scroller.MAX_RATIO - endRatio;
  }
  var startX = bounds.top + bounds.height * this.fromInternalRatio_(startRatio);
  var endX = bounds.top + bounds.height * this.fromInternalRatio_(endRatio);

  this.startThumb_.setTransformationMatrix(1, 0, 0, 1, 0, startX);
  this.endThumb_.setTransformationMatrix(1, 0, 0, 1, 0, endX);

  var topX = Math.min(startX, endX);
  var bottomX = Math.max(startX, endX);

  this.selectedClipRect.shape(bounds.left, topX, bounds.width, bottomX - topX);

  this.selectedRangeOutline_
      .clear()
      .moveTo(bounds.left + bounds.width, bounds.top)
      .lineTo(bounds.left + bounds.width, topX)
      .lineTo(bounds.left, topX)
      .lineTo(bounds.left, bottomX)
      .lineTo(bounds.left + bounds.width, bottomX)
      .lineTo(bounds.left + bounds.width, bounds.top + bounds.height);
};


/**
 * Draws top orientation.
 * @private
 */
anychart.core.ui.Scroller.prototype.drawTop_ = function() {
  var bounds = this.pixelBoundsCache;
  var startRatio = this.startRatio_;
  var endRatio = this.endRatio_;
  if (this.getOption('inverted')) {
    startRatio = anychart.core.ui.Scroller.MAX_RATIO - startRatio;
    endRatio = anychart.core.ui.Scroller.MAX_RATIO - endRatio;
  }
  var startX = bounds.left + bounds.width * this.fromInternalRatio_(startRatio);
  var endX = bounds.left + bounds.width * this.fromInternalRatio_(endRatio);

  this.startThumb_.setTransformationMatrix(1, 0, 0, 1, startX, 0);
  this.endThumb_.setTransformationMatrix(1, 0, 0, 1, endX, 0);

  var leftX = Math.min(startX, endX);
  var rightX = Math.max(startX, endX);

  this.selectedClipRect.shape(leftX, bounds.top, rightX - leftX, bounds.height);

  leftX = anychart.utils.applyPixelShift(leftX, 1);
  rightX = anychart.utils.applyPixelShift(rightX, 1);
  var top = anychart.utils.applyPixelShift(bounds.top, 1);
  var bottom = anychart.utils.applyPixelShift(bounds.top + bounds.height, 1);

  this.selectedRangeOutline_
      .clear()
      .moveTo(bounds.left, top)
      .lineTo(leftX, top)
      .lineTo(leftX, bottom)
      .lineTo(rightX, bottom)
      .lineTo(rightX, top)
      .lineTo(bounds.left + bounds.width, top);
};


/**
 * Draws right orientation.
 * @private
 */
anychart.core.ui.Scroller.prototype.drawRight_ = function() {
  var bounds = this.pixelBoundsCache;
  var startRatio = this.startRatio_;
  var endRatio = this.endRatio_;
  if (!this.getOption('inverted')) {
    startRatio = anychart.core.ui.Scroller.MAX_RATIO - startRatio;
    endRatio = anychart.core.ui.Scroller.MAX_RATIO - endRatio;
  }
  var startX = bounds.top + bounds.height * this.fromInternalRatio_(startRatio);
  var endX = bounds.top + bounds.height * this.fromInternalRatio_(endRatio);

  this.startThumb_.setTransformationMatrix(1, 0, 0, 1, 0, startX);
  this.endThumb_.setTransformationMatrix(1, 0, 0, 1, 0, endX);

  var topX = Math.min(startX, endX);
  var bottomX = Math.max(startX, endX);

  this.selectedClipRect.shape(bounds.left, topX, bounds.width, bottomX - topX);

  this.selectedRangeOutline_
      .clear()
      .moveTo(bounds.left, bounds.top)
      .lineTo(bounds.left, topX)
      .lineTo(bounds.left + bounds.width, topX)
      .lineTo(bounds.left + bounds.width, bottomX)
      .lineTo(bounds.left, bottomX)
      .lineTo(bounds.left, bounds.top + bounds.height);
};


/**
 * Sets range and invalidates what is needed to be invalidated.
 * @param {number} startRatio
 * @param {number} endRatio
 */
anychart.core.ui.Scroller.prototype.setRangeInternal = function(startRatio, endRatio) {
  startRatio = this.toInternalRatio_(startRatio);
  endRatio = this.toInternalRatio_(endRatio);
  if (startRatio > endRatio) {
    var tmp = startRatio;
    startRatio = endRatio;
    endRatio = tmp;
  }
  if (startRatio != this.startRatio_ || endRatio != this.endRatio_) {
    this.startRatio_ = startRatio;
    this.endRatio_ = endRatio;
    this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * @return {number}
 */
anychart.core.ui.Scroller.prototype.getStartRatio = function() {
  return this.startRatio_ / anychart.core.ui.Scroller.MAX_RATIO;
};


/**
 * @return {number}
 */
anychart.core.ui.Scroller.prototype.getEndRatio = function() {
  return this.endRatio_ / anychart.core.ui.Scroller.MAX_RATIO;
};


/**
 * Returns new rect with bounds remaining after scroller placement.
 * @return {anychart.math.Rect}
 */
anychart.core.ui.Scroller.prototype.getRemainingBounds = function() {
  var parentBounds = /** @type {anychart.math.Rect} */(this.parentBounds());
  if (parentBounds)
    parentBounds = parentBounds.clone();
  else
    parentBounds = anychart.math.rect(0, 0, 0, 0);

  if (this.isVisible()) {
    if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
      this.updateBoundsCache();
      this.markConsistent(anychart.ConsistencyState.BOUNDS);
    }
    if (this.isHorizontal()) {
      parentBounds.height -= this.fullPixelBoundsCache.height;
      if (this.getOption('orientation') == anychart.enums.Orientation.TOP)
        parentBounds.top += this.fullPixelBoundsCache.height;
    } else {
      parentBounds.width -= this.fullPixelBoundsCache.width;
      if (this.getOption('orientation') == anychart.enums.Orientation.LEFT)
        parentBounds.left += this.fullPixelBoundsCache.width;
    }
  }
  return parentBounds;
};


/**
 * Updates this.pixelBoundsCache to match current settings.
 * @protected
 */
anychart.core.ui.Scroller.prototype.updateBoundsCache = function() {
  var parentBounds = this.parentBounds();
  var parentSize = this.isHorizontal() ? parentBounds.height : parentBounds.width;

  var height = anychart.utils.normalizeSize(/** @type {number|string} */(this.getOption('height')), parentSize);
  var maxHeight = anychart.utils.normalizeSize(/** @type {number|string} */(this.getOption('maxHeight')), parentSize);
  var minHeight = anychart.utils.normalizeSize(/** @type {number|string} */(this.getOption('minHeight')), parentSize);

  var size = height;
  if (!isNaN(minHeight))
    size = Math.max(size, minHeight);
  if (!isNaN(maxHeight))
    size = Math.min(height, maxHeight);

  if (this.isHorizontal()) {
    size = this.padding().widenHeight(size);
  } else {
    size = this.padding().widenWidth(size);
  }
  this.fullPixelBoundsCache.left = parentBounds.left;
  this.fullPixelBoundsCache.top = parentBounds.top;

  var orientation = this.getOption('orientation');
  if (this.isHorizontal()) {
    this.fullPixelBoundsCache.width = parentBounds.width;
    this.fullPixelBoundsCache.height = size;
    if (orientation == anychart.enums.Orientation.BOTTOM) {
      this.fullPixelBoundsCache.top += parentBounds.height - size;
    }
  } else {
    this.fullPixelBoundsCache.width = size;
    this.fullPixelBoundsCache.height = parentBounds.height;
    if (orientation == anychart.enums.Orientation.RIGHT) {
      this.fullPixelBoundsCache.left += parentBounds.width - size;
    }
  }

  var left, right, top, bottom;
  if (this.absolutePadding_ || this.isHorizontal()) {
    this.pixelBoundsCache = this.padding().tightenBounds(this.fullPixelBoundsCache);
  } else {
    var padding = this.padding();
    if (orientation == anychart.enums.Orientation.LEFT) {
      top = anychart.utils.normalizeSize(/** @type {number|string} */(padding.getOption('left')), this.fullPixelBoundsCache.width);
      right = anychart.utils.normalizeSize(/** @type {number|string} */(padding.getOption('top')), this.fullPixelBoundsCache.height);
      bottom = anychart.utils.normalizeSize(/** @type {number|string} */(padding.getOption('right')), this.fullPixelBoundsCache.width);
      left = anychart.utils.normalizeSize(/** @type {number|string} */(padding.getOption('bottom')), this.fullPixelBoundsCache.height);
    } else {
      top = anychart.utils.normalizeSize(/** @type {number|string} */(padding.getOption('right')), this.fullPixelBoundsCache.width);
      right = anychart.utils.normalizeSize(/** @type {number|string} */(padding.getOption('bottom')), this.fullPixelBoundsCache.height);
      bottom = anychart.utils.normalizeSize(/** @type {number|string} */(padding.getOption('left')), this.fullPixelBoundsCache.width);
      left = anychart.utils.normalizeSize(/** @type {number|string} */(padding.getOption('top')), this.fullPixelBoundsCache.height);

    }
    this.pixelBoundsCache.left = this.fullPixelBoundsCache.left + left;
    this.pixelBoundsCache.top = this.fullPixelBoundsCache.top + top;
    this.pixelBoundsCache.width = this.fullPixelBoundsCache.width - left - right;
    this.pixelBoundsCache.height = this.fullPixelBoundsCache.height - top - bottom;
  }

  this.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.SCROLLER_THUMBS_SHAPE);
};


/**
 * MouseOver handler.
 * @param {acgraph.events.BrowserEvent} e
 * @private
 */
anychart.core.ui.Scroller.prototype.mouseOver_ = function(e) {
  e.stopWrapperPropagation();
  if (!anychart.utils.checkIfParent(/** @type {!goog.events.EventTarget} */(this.rootLayer), e['relatedTarget']) &&
      this.handleBrowserEvent(e)) {
    this.mouseOnScroller_ = true;
    this.showThumbs_();
  }
};


/**
 * MouseOut handler.
 * @param {acgraph.events.BrowserEvent} e
 * @private
 */
anychart.core.ui.Scroller.prototype.mouseOut_ = function(e) {
  e.stopWrapperPropagation();
  if (!anychart.utils.checkIfParent(/** @type {!goog.events.EventTarget} */(this.rootLayer), e['relatedTarget']) &&
      this.handleBrowserEvent(e)) {
    this.mouseOnScroller_ = false;
    this.maybeHideThumbs_();
  }
};


/**
 * Thumb mouseover handler.
 * @param {acgraph.events.BrowserEvent} e
 * @private
 */
anychart.core.ui.Scroller.prototype.thumbMouseOver_ = function(e) {
  var target = e['target'];
  if (anychart.utils.instanceOf(target, acgraph.vector.Path)) {
    if (target == this.startThumb_) {
      this.colorizeThumb_(this.startThumb_, this.startThumbHovered_ = true);
    } else if (target == this.endThumb_) {
      this.colorizeThumb_(this.endThumb_, this.endThumbHovered_ = true);
    }
  }
};


/**
 * Thumb mouseout handler.
 * @param {acgraph.events.BrowserEvent} e
 * @private
 */
anychart.core.ui.Scroller.prototype.thumbMouseOut_ = function(e) {
  var target = e['target'];
  if (anychart.utils.instanceOf(target, acgraph.vector.Path)) {
    if (target == this.startThumb_) {
      this.colorizeThumb_(this.startThumb_, this.startThumbHovered_ = false);
    } else if (target == this.endThumb_) {
      this.colorizeThumb_(this.endThumb_, this.endThumbHovered_ = false);
    }
  }
};


/**
 * Thumbs and range mousedown handler.
 * @param {acgraph.events.BrowserEvent} e
 * @private
 */
anychart.core.ui.Scroller.prototype.thumbOrRangeMouseDown_ = function(e) {
  if (anychart.utils.instanceOf(e.currentTarget, acgraph.vector.Element)) {
    var target = (/** @type {acgraph.vector.Element} */(e.currentTarget));
    var dragger;
    if (target == this.startThumb_ && !this.startThumbDragger_) {
      this.startThumbDragger_ = dragger = new anychart.core.ui.Scroller.Dragger(this, this.startThumb_, true);
    } else if (target == this.endThumb_ && !this.endThumbDragger_) {
      this.endThumbDragger_ = dragger = new anychart.core.ui.Scroller.Dragger(this, this.endThumb_, true);
    } else if (target == this.selectedBackground_ && !this.selectedRangeDragger_) {
      this.selectedRangeDragger_ = dragger = new anychart.core.ui.Scroller.Dragger(this, this.selectedBackground_, false);
    }
    if (dragger) {
      this.eventsHandler.listen(dragger, goog.fx.Dragger.EventType.START, this.dragStartHandler_);
      this.eventsHandler.listen(dragger, goog.fx.Dragger.EventType.END, this.dragEndHandler_);
      dragger.startDrag(e.getOriginalEvent());
    }
  }
};


/**
 * Handler for clicks on scroller out of the selected range.
 * @param {acgraph.events.BrowserEvent} e
 * @private
 */
anychart.core.ui.Scroller.prototype.nonSelectedRangeClick_ = function(e) {
  // assume we have a stage here
  var root = this.rootLayer.getStage().getClientPosition();
  var position;
  if (this.isHorizontal())
    position = e['clientX'] - root.x;
  else
    position = e['clientY'] - root.y;
  if (this.dispatchRangeChange_(anychart.enums.ScrollerRangeChangeSource.BACKGROUND_CLICK,
      anychart.enums.EventType.SCROLLER_CHANGE_START)) {
    this.moveHandleTo_(false, position);
    this.dispatchRangeChange_(anychart.enums.ScrollerRangeChangeSource.BACKGROUND_CLICK,
        anychart.enums.EventType.SCROLLER_CHANGE_FINISH);
  }
};


/**
 * Drag start handler.
 * @param {goog.fx.DragEvent} e
 * @return {boolean}
 * @private
 */
anychart.core.ui.Scroller.prototype.dragStartHandler_ = function(e) {
  var cursor, source;
  if (!this.getOption('allowRangeChange') || e.dragger == this.selectedRangeDragger_) {
    cursor = this.getCursor_();
    source = anychart.enums.ScrollerRangeChangeSource.SELECTED_RANGE_DRAG;
  } else {
    cursor = this.getCursor_();
    source = anychart.enums.ScrollerRangeChangeSource.THUMB_DRAG;
  }
  var res = this.dispatchRangeChange_(source, anychart.enums.EventType.SCROLLER_CHANGE_START);
  if (res) {
    this.isDragging_++;
    this.startThumb_.cursor(null);
    this.endThumb_.cursor(null);
    this.selectedBackground_.cursor(null);
    goog.style.setStyle(document['body'], 'cursor', cursor);
  }
  return res;
};


/**
 * Drag end handler.
 * @param {goog.fx.DragEvent} e
 * @private
 */
anychart.core.ui.Scroller.prototype.dragEndHandler_ = function(e) {
  this.isDragging_ = Math.max(this.isDragging_ - 1, 0);
  this.maybeHideThumbs_();
  this.startThumb_.cursor(this.getCursor_());
  this.endThumb_.cursor(this.getCursor_());
  this.selectedBackground_.cursor(this.getCursor_());
  goog.style.setStyle(document['body'], 'cursor', '');
  var source;
  if (!this.getOption('allowRangeChange') || e.dragger == this.selectedRangeDragger_) {
    source = anychart.enums.ScrollerRangeChangeSource.SELECTED_RANGE_DRAG;
  } else {
    source = anychart.enums.ScrollerRangeChangeSource.THUMB_DRAG;
  }
  this.dispatchRangeChange_(source, anychart.enums.EventType.SCROLLER_CHANGE_FINISH);
};


/**
 * Shows thumbs if necessary.
 * @private
 */
anychart.core.ui.Scroller.prototype.showThumbs_ = function() {
  if (!this.thumbsShown_) {
    this.rootLayer.addChild(/** @type {!acgraph.vector.Path} */(this.startThumb_));
    this.rootLayer.addChild(/** @type {!acgraph.vector.Path} */(this.endThumb_));
    this.thumbsShown_ = true;
  }
};


/**
 * Hides thumbs if necessary.
 * @private
 */
anychart.core.ui.Scroller.prototype.maybeHideThumbs_ = function() {
  if (this.thumbsShown_ && this.thumbs().getOption('autoHide') && !this.isDragging_ && !this.mouseOnScroller_) {
    this.rootLayer.removeChild(/** @type {!acgraph.vector.Path} */(this.startThumb_));
    this.rootLayer.removeChild(/** @type {!acgraph.vector.Path} */(this.endThumb_));
    this.thumbsShown_ = false;
  }
};


/**
 * Prepares thumbs according to current bounds. Thumb X positioning is made by transformation.
 * @private
 */
anychart.core.ui.Scroller.prototype.prepareThumbs_ = function() {
  var thicknessHalf = (Math.max(acgraph.vector.getThickness(/** @type {acgraph.vector.Stroke} */(this.getOption('outlineStroke'))), 5) - 1) / 2;
  if (this.isHorizontal()) {
    var top = this.pixelBoundsCache.top;
    if (this.thumbs().getOption('enabled')) {
      var y = top + this.pixelBoundsCache.height / 2;
      this.startThumb_.clear()
          .moveTo(-4, y - 6)
          .lineTo(-2, y - 8)
          .lineTo(2, y - 8)
          .lineTo(4, y - 6)
          .lineTo(4, y + 6)
          .lineTo(2, y + 8)
          .lineTo(-2, y + 8)
          .lineTo(-4, y + 6)
          .close()
          .moveTo(-1, y - 5)
          .lineTo(-1, y + 5)
          .moveTo(1, y - 5)
          .lineTo(1, y + 5);
      this.endThumb_.clear()
          .moveTo(-4, y - 6)
          .lineTo(-2, y - 8)
          .lineTo(2, y - 8)
          .lineTo(4, y - 6)
          .lineTo(4, y + 6)
          .lineTo(2, y + 8)
          .lineTo(-2, y + 8)
          .lineTo(-4, y + 6)
          .close()
          .moveTo(-1, y - 5)
          .lineTo(-1, y + 5)
          .moveTo(1, y - 5)
          .lineTo(1, y + 5);
    } else {
      var bottom = top + this.pixelBoundsCache.height;
      this.startThumb_.clear()
          .moveTo(-thicknessHalf, top)
          .lineTo(thicknessHalf, top)
          .lineTo(thicknessHalf, bottom)
          .lineTo(-thicknessHalf, bottom)
          .close();
      this.endThumb_.clear()
          .moveTo(-thicknessHalf, top)
          .lineTo(thicknessHalf, top)
          .lineTo(thicknessHalf, bottom)
          .lineTo(-thicknessHalf, bottom)
          .close();
    }
  } else {
    var left = this.pixelBoundsCache.left;
    if (this.thumbs().getOption('enabled')) {
      var x = left + this.pixelBoundsCache.width / 2;
      this.startThumb_.clear()
          .moveTo(x - 6, -4)
          .lineTo(x - 8, -2)
          .lineTo(x - 8, 2)
          .lineTo(x - 6, 4)
          .lineTo(x + 6, 4)
          .lineTo(x + 8, 2)
          .lineTo(x + 8, -2)
          .lineTo(x + 6, -4)
          .close()
          .moveTo(x - 5, -1)
          .lineTo(x + 5, -1)
          .moveTo(x - 5, 1)
          .lineTo(x + 5, 1);
      this.endThumb_.clear()
          .moveTo(x - 6, -4)
          .lineTo(x - 8, -2)
          .lineTo(x - 8, 2)
          .lineTo(x - 6, 4)
          .lineTo(x + 6, 4)
          .lineTo(x + 8, 2)
          .lineTo(x + 8, -2)
          .lineTo(x + 6, -4)
          .close()
          .moveTo(x - 5, -1)
          .lineTo(x + 5, -1)
          .moveTo(x - 5, 1)
          .lineTo(x + 5, 1);
    } else {
      var right = left + this.pixelBoundsCache.height;
      this.startThumb_.clear()
          .moveTo(left, -thicknessHalf)
          .lineTo(left, thicknessHalf)
          .lineTo(right, thicknessHalf)
          .lineTo(right, -thicknessHalf)
          .close();
      this.endThumb_.clear()
          .moveTo(left, -thicknessHalf)
          .lineTo(left, thicknessHalf)
          .lineTo(right, thicknessHalf)
          .lineTo(right, -thicknessHalf)
          .close();
    }
  }
};


/**
 * Colorizes passed thumb.
 * @param {acgraph.vector.Path} thumb
 * @param {boolean} isHovered
 * @private
 */
anychart.core.ui.Scroller.prototype.colorizeThumb_ = function(thumb, isHovered) {
  var thumbs = this.thumbs();
  var fill, stroke;
  if (thumbs.getOption('enabled')) {
    if (isHovered) {
      fill = /** @type {acgraph.vector.Fill} */(thumbs.hovered().getOption('fill'));
      stroke = /** @type {acgraph.vector.Stroke} */(thumbs.hovered().getOption('stroke'));
    } else {
      fill = /** @type {acgraph.vector.Fill} */(thumbs.normal().getOption('fill'));
      stroke = /** @type {acgraph.vector.Stroke} */(thumbs.normal().getOption('stroke'));
    }
  } else {
    fill = anychart.color.TRANSPARENT_HANDLER;
    stroke = 'none';
  }
  thumb.fill(fill);
  thumb.stroke(stroke);
};


/**
 * Transforms [0..1] ratio to internal ratio.
 * @param {number} ratio
 * @return {number}
 * @private
 */
anychart.core.ui.Scroller.prototype.toInternalRatio_ = function(ratio) {
  return goog.math.clamp(Math.round(ratio * anychart.core.ui.Scroller.MAX_RATIO), 0,
      anychart.core.ui.Scroller.MAX_RATIO);
};


/**
 * Transforms internal ratio to [0..1] ratio. Internal ratio keeps distances but rounds them:
 * this.fromInternalRatio_(this.toInternalRatio_(a) - this.toInternalRatio_(b)) = a - b;
 * @param {number} internalRatio
 * @return {number}
 * @private
 */
anychart.core.ui.Scroller.prototype.fromInternalRatio_ = function(internalRatio) {
  return internalRatio / anychart.core.ui.Scroller.MAX_RATIO;
};


/**
 * Makes range change event. An extending point.
 * @param {string} type
 * @param {number} startRatio
 * @param {number} endRatio
 * @param {string} source
 * @return {goog.events.EventLike}
 * @protected
 */
anychart.core.ui.Scroller.prototype.makeRangeChangeEvent = function(type, startRatio, endRatio, source) {
  return {
    'type': type,
    'startRatio': startRatio,
    'endRatio': endRatio,
    'source': source
  };
};


/**
 * Dispatches SCROLLER_CHANGE event.
 * @param {string} source
 * @param {anychart.enums.EventType} type
 * @param {number=} opt_start IN INTERNAL RATIO TERMS.
 * @param {number=} opt_end IN INTERNAL RATIO TERMS.
 * @return {boolean}
 * @private
 */
anychart.core.ui.Scroller.prototype.dispatchRangeChange_ = function(source, type, opt_start, opt_end) {
  var start = this.fromInternalRatio_(goog.isDef(opt_start) ? opt_start : this.startRatio_);
  var end = this.fromInternalRatio_(goog.isDef(opt_end) ? opt_end : this.endRatio_);
  return this.dispatchEvent(this.makeRangeChangeEvent(type, start, end, source));
};


/**
 * Moves the thumb. Considered internal.
 * @param {acgraph.vector.Element|boolean} handle true - selectedRange, false - background, element - corresponding thumb.
 * @param {number} position
 * @private
 */
anychart.core.ui.Scroller.prototype.moveHandleTo_ = function(handle, position) {
  position = this.limitPosition_(handle, position);
  var bounds = this.pixelBoundsCache;
  var ratio;
  switch (this.getOption('orientation')) {
    case anychart.enums.Orientation.RIGHT:
    case anychart.enums.Orientation.LEFT:
      ratio = (bounds.top + bounds.height - position) / bounds.height;
      break;
    case anychart.enums.Orientation.TOP:
    case anychart.enums.Orientation.BOTTOM:
    default:
      ratio = (position - bounds.left) / bounds.width;
      break;
  }
  if (this.getOption('inverted')) ratio = 1 - ratio;
  /** @type {number} */
  var startRatio;
  /** @type {number} */
  var endRatio;
  var source;
  var allowRangeChange = this.getOption('allowRangeChange');
  if (allowRangeChange && handle == this.startThumb_) {
    startRatio = ratio;
    endRatio = this.fromInternalRatio_(this.endRatio_);
    source = anychart.enums.ScrollerRangeChangeSource.THUMB_DRAG;
  } else if (allowRangeChange && handle == this.endThumb_) {
    startRatio = this.fromInternalRatio_(this.startRatio_);
    endRatio = ratio;
    source = anychart.enums.ScrollerRangeChangeSource.THUMB_DRAG;
  } else {
    var halfRange = this.fromInternalRatio_(this.endRatio_ - this.startRatio_) / 2;
    startRatio = ratio - halfRange;
    endRatio = ratio + halfRange;
    source = handle === true ?
        anychart.enums.ScrollerRangeChangeSource.SELECTED_RANGE_DRAG :
        anychart.enums.ScrollerRangeChangeSource.BACKGROUND_CLICK;
  }
  startRatio = this.toInternalRatio_(startRatio);
  endRatio = this.toInternalRatio_(endRatio);
  if (startRatio == endRatio) {
    endRatio += endRatio < anychart.core.ui.Scroller.MAX_RATIO ? 1 : -1;
  }
  if (startRatio > endRatio) {
    var tmp = this.startThumb_;
    this.startThumb_ = this.endThumb_;
    this.endThumb_ = tmp;
    // we should also swap draggers to properly initialize them
    tmp = this.startThumbDragger_;
    this.startThumbDragger_ = this.endThumbDragger_;
    this.endThumbDragger_ = tmp;
    tmp = startRatio;
    startRatio = endRatio;
    endRatio = tmp;
  }
  if ((startRatio != this.startRatio_ || endRatio != this.endRatio_) &&
      this.dispatchRangeChange_(source, anychart.enums.EventType.SCROLLER_CHANGE, startRatio, endRatio)) {
    this.startRatio_ = startRatio;
    this.endRatio_ = endRatio;
    this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Limits possible X position of the handle. Handle may be scroller.startThumb_ path, scroller.endThumb_ path or true
 * for selected range center. It is supposed to be false for nonSelectedBackground.
 * @param {acgraph.vector.Element|boolean} handle
 * @param {number} position
 * @return {number}
 * @private
 */
anychart.core.ui.Scroller.prototype.limitPosition_ = function(handle, position) {
  var bounds = this.pixelBoundsCache;
  var diff;
  var horz = this.isHorizontal();
  if (goog.isBoolean(handle) || !this.getOption('allowRangeChange')) {
    diff = this.fromInternalRatio_(this.endRatio_ - this.startRatio_) * (horz ? bounds.width : bounds.height) / 2;
  } else {
    diff = 0;
  }
  if (horz)
    return goog.math.clamp(position, bounds.left + diff, bounds.left + bounds.width - diff);
  else
    return goog.math.clamp(position, bounds.top + diff, bounds.top + bounds.height - diff);
};


/**
 * Returns current position of a handle. Handle may be scroller.startThumb_ path, scroller.endThumb_ path or null for
 * selected range center.
 * @param {?acgraph.vector.Element} handle
 * @return {number}
 * @private
 */
anychart.core.ui.Scroller.prototype.getCurrentPosition_ = function(handle) {
  var ratio;
  var allowRangeChange = this.getOption('allowRangeChange');
  if (allowRangeChange && handle == this.startThumb_) {
    ratio = this.startRatio_;
  } else if (allowRangeChange && handle == this.endThumb_) {
    ratio = this.endRatio_;
  } else {
    ratio = (this.startRatio_ + this.endRatio_) / 2;
  }
  ratio = this.fromInternalRatio_(ratio);
  if (this.getOption('inverted')) ratio = 1 - ratio;
  var bounds = this.pixelBoundsCache;
  if (this.isHorizontal())
    return bounds.left + bounds.width * ratio;
  else // vertical scroller
    return bounds.top + bounds.height * (1 - ratio);
};


/** @inheritDoc */
anychart.core.ui.Scroller.prototype.disposeInternal = function() {
  goog.dispose(this.rootLayer);
  this.rootLayer = null;
  this.startThumb_ = null;
  this.endThumb_ = null;
  this.selectedRangeOutline_ = null;
  this.nonSelectedBackground_ = null;
  this.selectedBackground_ = null;

  goog.dispose(this.startThumbDragger_);
  this.startThumbDragger_ = null;
  goog.dispose(this.endThumbDragger_);
  this.endThumbDragger_ = null;
  goog.dispose(this.selectedRangeDragger_);
  this.selectedRangeDragger_ = null;

  goog.dispose(this.thumbs_);
  this.thumbs_ = null;

  goog.dispose(this.padding_);
  this.padding_ = null;

  anychart.core.ui.Scroller.base(this, 'disposeInternal');
};


/** @inheritDoc */
anychart.core.ui.Scroller.prototype.serialize = function() {
  var json = anychart.core.ui.Scroller.base(this, 'serialize');

  anychart.core.settings.serialize(this, anychart.core.ui.Scroller.PROPERTY_DESCRIPTORS, json, 'Scroller');

  json['thumbs'] = this.thumbs().serialize();
  return json;
};


/** @inheritDoc */
anychart.core.ui.Scroller.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.ui.Scroller.base(this, 'setupByJSON', config, opt_default);
  anychart.core.settings.deserialize(this, anychart.core.ui.Scroller.PROPERTY_DESCRIPTORS, config, opt_default);

  if ('thumbs' in config)
   this.thumbs().setupInternal(!!opt_default, config['thumbs']);
};



/**
 * Dragger for scroller thumbs.
 * @param {anychart.core.ui.Scroller} scroller
 * @param {acgraph.vector.Element} target
 * @param {boolean} isThumb
 * @constructor
 * @extends {goog.fx.Dragger}
 */
anychart.core.ui.Scroller.Dragger = function(scroller, target, isThumb) {
  anychart.core.ui.Scroller.Dragger.base(this, 'constructor', target.domElement());

  /**
   * Scroller reference.
   * @type {anychart.core.ui.Scroller}
   * @private
   */
  this.scroller_ = scroller;

  /**
   * If the target is thumb, stores the target thumb. Or null otherwise.
   * @type {acgraph.vector.Element}
   * @private
   */
  this.targetThumb_ = isThumb ? target : null;

  /**
   * @type {number|undefined}
   * @private
   */
  this.frame_ = undefined;

  /**
   * @type {!function(number)}
   * @private
   */
  this.frameAction_ = goog.bind(function(time) {
    this.frame_ = undefined;
    this.scroller_.moveHandleTo_(
        this.targetThumb_ || true,
        this.lastCoord_);
  }, this);

  this.setHysteresis(3);

  this.listen(goog.fx.Dragger.EventType.END, this.dragEndHandler_);
};
goog.inherits(anychart.core.ui.Scroller.Dragger, goog.fx.Dragger);


/**
 * Drag end handler.
 * @param {goog.fx.DragEvent} e
 * @private
 */
anychart.core.ui.Scroller.Dragger.prototype.dragEndHandler_ = function(e) {
  if (goog.isDef(this.frame_)) {
    anychart.window.cancelAnimationFrame(this.frame_);
    this.frameAction_(0);
  }
};


/**
 * @type {number}
 * @private
 */
anychart.core.ui.Scroller.Dragger.prototype.lastCoord_;


/** @inheritDoc */
anychart.core.ui.Scroller.Dragger.prototype.computeInitialPosition = function() {
  if (this.scroller_.isHorizontal()) {
    this.deltaX = this.scroller_.getCurrentPosition_(this.targetThumb_);
    this.deltaY = 0;
  } else {
    this.deltaX = 0;
    this.deltaY = this.scroller_.getCurrentPosition_(this.targetThumb_);
  }
};


/** @inheritDoc */
anychart.core.ui.Scroller.Dragger.prototype.defaultAction = function(x, y) {
  this.lastCoord_ = this.scroller_.isHorizontal() ? x : y;
  if (!goog.isDef(this.frame_))
    this.frame_ = anychart.window.requestAnimationFrame(this.frameAction_);
};


/** @inheritDoc */
anychart.core.ui.Scroller.Dragger.prototype.limitX = function(x) {
  return this.scroller_.isHorizontal() ? this.scroller_.limitPosition_(this.targetThumb_, x) : 0;
};


/** @inheritDoc */
anychart.core.ui.Scroller.Dragger.prototype.limitY = function(y) {
  return this.scroller_.isHorizontal() ? 0 : this.scroller_.limitPosition_(this.targetThumb_, y);
};



/**
 * Thumbs settings. Doesn't draw anything, just contains settings and notifies the scroller about their change.
 * @param {!anychart.core.ui.Scroller} scroller
 * @constructor
 * @extends {anychart.core.Base}
 */
anychart.core.ui.Scroller.Thumbs = function(scroller) {
  anychart.core.ui.Scroller.Thumbs.base(this, 'constructor');

  this.addThemes(anychart.themes.DefaultThemes['thumbs']);

  /**
   * @type {!anychart.core.ui.Scroller}
   * @private
   */
  this.scroller_ = scroller;

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['enabled', anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.SCROLLER_THUMBS_SHAPE, anychart.Signal.NEEDS_REDRAW],
    ['autoHide', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW]
  ]);

  var descriptorsMeta = {};
  anychart.core.settings.createDescriptorsMeta(descriptorsMeta, [
    ['fill', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW],
    ['stroke', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW]
  ]);

  this.normal_ = new anychart.core.StateSettings(this, descriptorsMeta, anychart.PointState.NORMAL);
  this.setupCreated('normal', this.normal_);
  this.hovered_ = new anychart.core.StateSettings(this, descriptorsMeta, anychart.PointState.HOVER);
  this.setupCreated('hovered', this.hovered_);
};
goog.inherits(anychart.core.ui.Scroller.Thumbs, anychart.core.Base);
anychart.core.settings.populateAliases(anychart.core.ui.Scroller.Thumbs, ['fill', 'stroke'], 'normal');


/** @inheritDoc */
anychart.core.ui.Scroller.Thumbs.prototype.invalidate = function(state, opt_signal) {
  return this.scroller_.invalidate(state, opt_signal);
};


/**
 * Normal state settings.
 * @param {!Object=} opt_value
 * @return {anychart.core.StateSettings|anychart.core.ui.Scroller.Thumbs}
 */
anychart.core.ui.Scroller.Thumbs.prototype.normal = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.normal_.setup(opt_value);
    return this;
  }
  return this.normal_;
};


/**
 * Hovered state settings.
 * @param {!Object=} opt_value
 * @return {anychart.core.StateSettings|anychart.core.ui.Scroller.Thumbs}
 */
anychart.core.ui.Scroller.Thumbs.prototype.hovered = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.hovered_.setup(opt_value);
    return this;
  }
  return this.hovered_;
};


/**
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.core.ui.Scroller.Thumbs.PROPERTY_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  anychart.core.settings.createDescriptors(map, [
    // chart properties
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'enabled', anychart.core.settings.asIsNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'autoHide', anychart.core.settings.asIsNormalizer]
  ]);

  return map;
})();
anychart.core.settings.populate(anychart.core.ui.Scroller.Thumbs, anychart.core.ui.Scroller.Thumbs.PROPERTY_DESCRIPTORS);


/** @inheritDoc */
anychart.core.ui.Scroller.Thumbs.prototype.serialize = function() {
  var json = {};
  json['normal'] = this.normal().serialize();
  json['hovered'] = this.hovered().serialize();
  anychart.core.settings.serialize(this, anychart.core.ui.Scroller.Thumbs.PROPERTY_DESCRIPTORS, json, 'Scroller thumbs');
  return json;
};


/** @inheritDoc */
anychart.core.ui.Scroller.Thumbs.prototype.setupByJSON = function(config, opt_default) {
  this.normal_.setupInternal(!!opt_default, config);
  this.normal_.setupInternal(!!opt_default, config['normal']);
  this.hovered_.setupInternal(!!opt_default, config['hovered']);
  anychart.core.settings.deserialize(this, anychart.core.ui.Scroller.Thumbs.PROPERTY_DESCRIPTORS, config);
};


/** @inheritDoc */
anychart.core.ui.Scroller.Thumbs.prototype.resolveSpecialValue = function(var_args) {
  var arg0 = arguments[0];
  if (goog.isBoolean(arg0) || goog.isNull(arg0)) {
    return {'enabled': !!arg0};
  }
  return null;
};


/** @inheritDoc */
anychart.core.ui.Scroller.Thumbs.prototype.setupSpecial = function(isDefault, var_args) {
  var resolvedValue = this.resolveSpecialValue(arguments[1]);
  if (resolvedValue) {
    this.enabled(resolvedValue['enabled']);
    return true;
  }
  return false;
};


/** @inheritDoc */
anychart.core.ui.Scroller.Thumbs.prototype.disposeInternal = function() {
  goog.disposeAll(this.normal_, this.hovered_);
  this.normal_ = null;
  this.hovered_ = null;
  anychart.core.ui.Scroller.Thumbs.base(this, 'disposeInternal');
};



//region --- Standalone
//------------------------------------------------------------------------------
//
//  Standalone
//
//------------------------------------------------------------------------------
/**
 * Scroller standalone class.
 * @constructor
 * @extends {anychart.core.ui.Scroller}
 */
anychart.standalones.Scroller = function() {
  anychart.standalones.Scroller.base(this, 'constructor');
};
goog.inherits(anychart.standalones.Scroller, anychart.core.ui.Scroller);
anychart.core.makeStandalone(anychart.standalones.Scroller, anychart.core.ui.Scroller);


/**
 * Changes current selected range to the passed one.
 * @param {number} startRatio Clamped to [0..1].
 * @param {number} endRatio Clamped to [0..1].
 * @return {anychart.standalones.Scroller}
 */
anychart.standalones.Scroller.prototype.setRange = function(startRatio, endRatio) {
  this.setRangeInternal(startRatio, endRatio);
  return this;
};


/**
 * Getter and setter for starting ratio. Note that it is always less than the endRatio.
 * @param {number=} opt_value
 * @return {anychart.standalones.Scroller|number}
 */
anychart.standalones.Scroller.prototype.startRatio = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.setRangeInternal(opt_value, this.getEndRatio());
    return this;
  }
  return this.getStartRatio();
};


/**
 * Getter and setter for ending ratio. Note that it is always greater than the startRatio.
 * @param {number=} opt_value
 * @return {anychart.standalones.Scroller|number}
 */
anychart.standalones.Scroller.prototype.endRatio = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.setRangeInternal(this.getStartRatio(), opt_value);
    return this;
  }
  return this.getEndRatio();
};


/**
 * Scroller standalone constructor.
 * @return {anychart.standalones.Scroller}
 */
anychart.standalones.scroller = function() {
  var scroller = new anychart.standalones.Scroller();
  scroller.setup(anychart.getFullTheme('standalones.scroller'));
  return scroller;
};


//endregion
//exports
(function() {
  var proto = anychart.core.ui.Scroller.prototype;
  proto['thumbs'] = proto.thumbs;
  // auto generated
  // proto['height'] = proto.height;
  // proto['minHeight'] = proto.minHeight;
  // proto['maxHeight'] = proto.maxHeight;
  // proto['orientation'] = proto.orientation;
  // proto['autoHide'] = proto.autoHide;
  // proto['fill'] = proto.fill;
  // proto['selectedFill'] = proto.selectedFill;
  // proto['outlineStroke'] = proto.outlineStroke;
  // proto['allowRangeChange'] = proto.allowRangeChange;
  // proto['inverted'] = proto.inverted;

  proto = anychart.core.ui.Scroller.Thumbs.prototype;
  proto['normal'] = proto.normal;
  proto['hovered'] = proto.hovered;
  // auto generated
  // proto['fill'] = proto.fill;
  // proto['stroke'] = proto.stroke;

  proto = anychart.standalones.Scroller.prototype;
  goog.exportSymbol('anychart.standalones.scroller', anychart.standalones.scroller);
  proto['setRange'] = proto.setRange;
  proto['startRatio'] = proto.startRatio;
  proto['endRatio'] = proto.endRatio;
  proto['parentBounds'] = proto.parentBounds;
  proto['getRemainingBounds'] = proto.getRemainingBounds;
  proto['container'] = proto.container;
  proto['padding'] = proto.padding;
  proto['draw'] = proto.draw;
})();
