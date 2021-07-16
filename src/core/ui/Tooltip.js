goog.provide('anychart.core.ui.Tooltip');

goog.require('acgraph.math');
goog.require('anychart.compatibility');
goog.require('anychart.core.VisualBase');
goog.require('anychart.core.settings');
goog.require('anychart.core.ui.Background');
goog.require('anychart.core.ui.HTMLTooltip');
goog.require('anychart.core.ui.Label');
goog.require('anychart.core.ui.Separator');
goog.require('anychart.core.ui.Title');
goog.require('anychart.core.utils.GlobalTooltipContainer');
goog.require('anychart.core.utils.InternalLabelsFormatters');
goog.require('anychart.core.utils.LocalTooltipContainer');
goog.require('anychart.core.utils.Padding');
goog.require('anychart.format.Context');
goog.require('anychart.math.Rect');

goog.require('goog.async.Delay');
goog.require('goog.math.Box');
goog.require('goog.math.Coordinate');
goog.require('goog.object');



/**
 * New tooltip implementation.
 * @param {number} capability - Tooltip capability. @see anychart.core.ui.Tooltip.Capabilities.
 *  DEV NOTE: Use this parameter in constructor function only!
 * @constructor
 * @extends {anychart.core.VisualBase}
 * @implements {anychart.core.settings.IResolvable}
 */
anychart.core.ui.Tooltip = function(capability) {
  anychart.core.ui.Tooltip.base(this, 'constructor');

  this.addThemes(anychart.themes.DefaultThemes['tooltip']);

  delete this.themeSettings['enabled'];

  /**
   * Tooltip's capability.
   * Used to separate chart's tooltip functionality from series' tooltip and from other.
   * @type {number}
   */
  this.capability = capability;

  /**
   * Pixel bounds cache.
   * @type {anychart.math.Rect}
   */
  this.pixelBoundsCache = new anychart.math.Rect(0, 0, 0, 0);

  /**
   * Parent tooltip.
   * @type {?anychart.core.ui.Tooltip}
   * @private
   */
  this.parent_ = null;

  /**
   * @type {Object.<string, anychart.core.ui.Tooltip>}
   */
  this.childTooltipsMap = {};

  /**
   * Root layer.
   * @type {acgraph.vector.Layer}
   */
  this.rootLayer_;

  /**
   * @type {anychart.core.ui.Title}
   * @private
   */
  this.title_;

  /**
   * @type {anychart.core.ui.Separator}
   * @private
   */
  this.separator_;

  /**
   * @type {anychart.core.ui.Label}
   * @private
   */
  this.content_;

  /**
   * @type {anychart.core.ui.Background}
   * @private
   */
  this.background_;

  /**
   * @type {anychart.core.utils.Padding}
   */
  this.padding_;

  /**
   * @type {anychart.math.Rect}
   * @private
   */
  this.contentBounds_;

  /**
   * Currently used tooltip&Needs to update tooltip position.
   * @type {anychart.core.ui.Tooltip}
   * @private
   */
  this.tooltipInUse_ = null;

  /**
   * Container provider;
   * @type {anychart.core.ui.Legend|anychart.core.VisualBaseWithBounds}
   * @private
   */
  this.containerProvider_ = null;

  /**
   * Resolution chain cache.
   * @type {?Array.<Object|null|undefined>}
   * @private
   */
  this.resolutionChainCache_ = null;

  /**
   * Tooltip container.
   * @type {anychart.core.utils.LocalTooltipContainer}
   * @private
   */
  this.tooltipContainer_ = null;

  /**
   * HTML-tooltip.
   * @type {anychart.core.ui.HTMLTooltip}
   */
  this.htmlTooltip = null;

  /**
   * Special flag.
   * By default, tooltip uses overridden this.needsForceSignalsDispatching() to decide whether
   * it is parent tooltip. It checks own capabilities and child tooltips map.
   * Flag this.predeclareAsParent allows to declare just created tooltip as parent without capabilities an children set.
   * If is set to 'true', needsForceSignalsDispatching() will return true. If set to 'false', will check
   * capabilities and child tooltips map (default behaviour).
   *
   * Use it like this:
   *
   * {code}
   *  var tooltip = anychart.core.ui.Tooltip(0); // No capabilities for this example.
   *  tooltip.predeclareAsParent = true; // Here we declare that this tooltip will definitely have children.
   *  tooltip.updateForceInvalidation(); // Will correctly set force invalidation requirements.
   * {code}
   *
   * @type {boolean}
   */
  this.predeclareAsParent = false;

  /**
   *
   * @type {{format: (string|Function|undefined), titleFormat: (string|Function|undefined)}}
   * @private
   */
  this.middleFormats_ = {
    'format': void 0,
    'titleFormat': void 0
  };

  anychart.utils.tooltipsRegistry[String(goog.getUid(this))] = this;

  anychart.core.settings.createTextPropertiesDescriptorsMeta(this.descriptorsMeta,
      anychart.core.ui.Tooltip.TOOLTIP_BOUNDS_STATE,
      anychart.ConsistencyState.TOOLTIP_CONTENT | anychart.ConsistencyState.TOOLTIP_TITLE,
      anychart.Signal.NEEDS_REDRAW,
      anychart.Signal.NEEDS_REDRAW,
      this.resetBoundsCache);
  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['useHtml', //this overrides 'useHtml' of TEXT_PROPERTY_DESCRIPTORS
      anychart.core.ui.Tooltip.TOOLTIP_BOUNDS_STATE | anychart.ConsistencyState.CONTAINER,
      anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEEDS_UPDATE_TOOLTIP,
      void 0,
      this.beforeUseHtmlHook
    ],
    ['width',
      anychart.core.ui.Tooltip.TOOLTIP_BOUNDS_STATE,
      anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['height',
      anychart.core.ui.Tooltip.TOOLTIP_BOUNDS_STATE,
      anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['titleFormat',
      anychart.core.ui.Tooltip.TOOLTIP_BOUNDS_STATE,
      anychart.Signal.NEEDS_REDRAW],
    ['format',
      anychart.core.ui.Tooltip.TOOLTIP_BOUNDS_STATE,
      anychart.Signal.NEEDS_REDRAW],
    ['unionFormat',
      anychart.core.ui.Tooltip.TOOLTIP_BOUNDS_STATE,
      anychart.Signal.NEEDS_REDRAW],
    ['valuePrefix',
      anychart.core.ui.Tooltip.TOOLTIP_BOUNDS_STATE,
      anychart.Signal.NEEDS_REDRAW],
    ['valuePostfix',
      anychart.core.ui.Tooltip.TOOLTIP_BOUNDS_STATE,
      anychart.Signal.NEEDS_REDRAW],
    ['position',
      anychart.ConsistencyState.TOOLTIP_POSITION,
      anychart.Signal.NEEDS_REDRAW],
    ['anchor',
      anychart.ConsistencyState.TOOLTIP_POSITION,
      anychart.Signal.NEEDS_REDRAW],
    ['offsetX',
      anychart.ConsistencyState.TOOLTIP_POSITION,
      anychart.Signal.NEEDS_REDRAW],
    ['offsetY',
      anychart.ConsistencyState.TOOLTIP_POSITION,
      anychart.Signal.NEEDS_REDRAW],
    ['x',
      anychart.ConsistencyState.TOOLTIP_POSITION,
      anychart.Signal.NEEDS_REDRAW],
    ['y',
      anychart.ConsistencyState.TOOLTIP_POSITION,
      anychart.Signal.NEEDS_REDRAW],
    //TODO (A.Kudryavtsev): Check consistency states and signals!!!
    ['allowLeaveScreen',
      anychart.ConsistencyState.CONTAINER,
      anychart.Signal.NEEDS_REDRAW],
    ['allowLeaveChart',
      anychart.ConsistencyState.CONTAINER,
      anychart.Signal.NEEDS_REDRAW],
    ['allowLeaveStage',
      anychart.ConsistencyState.CONTAINER,
      anychart.Signal.NEEDS_REDRAW],
    ['displayMode',
      anychart.ConsistencyState.TOOLTIP_MODE,
      anychart.Signal.NEEDS_REDRAW,
      anychart.core.ui.Tooltip.Capabilities.CAN_CHANGE_DISPLAY_MODE],
    ['positionMode',
      anychart.ConsistencyState.TOOLTIP_POSITION,
      anychart.Signal.NEEDS_REDRAW,
      anychart.core.ui.Tooltip.Capabilities.CAN_CHANGE_POSITION_MODE],
    ['onDomReady', 0, 0],
    ['onBeforeTitleChange', 0, 0],
    ['onTitleChanged', 0, 0],
    ['onBeforeContentChange', 0, 0],
    ['onContentChanged', 0, 0],
    ['hideDelay', 0, 0, 0, this.createDelayObject_]
  ]);
};
goog.inherits(anychart.core.ui.Tooltip, anychart.core.VisualBase);


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.ui.Tooltip.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.VisualBase.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.TOOLTIP_POSITION |
    anychart.ConsistencyState.TOOLTIP_TITLE |
    anychart.ConsistencyState.TOOLTIP_SEPARATOR |
    anychart.ConsistencyState.TOOLTIP_CONTENT |
    anychart.ConsistencyState.TOOLTIP_BACKGROUND |
    anychart.ConsistencyState.TOOLTIP_MODE;


/**
 * State that includes tooltip's states and bounds state.
 * @type {number}
 */
anychart.core.ui.Tooltip.TOOLTIP_BOUNDS_STATE =
    anychart.ConsistencyState.BOUNDS |
    anychart.ConsistencyState.TOOLTIP_POSITION |
    anychart.ConsistencyState.TOOLTIP_TITLE |
    anychart.ConsistencyState.TOOLTIP_SEPARATOR |
    anychart.ConsistencyState.TOOLTIP_CONTENT |
    anychart.ConsistencyState.TOOLTIP_BACKGROUND;


/**
 * Supported signals.
 * @type {number}
 */
anychart.core.ui.Tooltip.prototype.SUPPORTED_SIGNALS =
    anychart.core.VisualBase.prototype.SUPPORTED_SIGNALS |
    anychart.Signal.ENABLED_STATE_CHANGED |
    anychart.Signal.NEEDS_UPDATE_TOOLTIP; //This signal literally means that HTML-tooltip must be used.


/**
 * Capabilities.
 * @enum {number}
 */
anychart.core.ui.Tooltip.Capabilities = {
  CAN_CHANGE_DISPLAY_MODE: 1 << 0,
  CAN_CHANGE_POSITION_MODE: 1 << 1,
  /**
   * Combination of all states.
   */
  ANY: 0xFFFFFFFF
};


//region -- Optimized properties
//----------------------------------------------------------------------------------------------------------------------
//
//  OptimizedProperties
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Properties that should be defined in Tooltip2 prototype. Text methods.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.core.ui.Tooltip.prototype.TEXT_PROPERTY_DESCRIPTORS =
    anychart.core.settings.createTextPropertiesDescriptors();
anychart.core.settings.populate(anychart.core.ui.Tooltip, anychart.core.ui.Tooltip.prototype.TEXT_PROPERTY_DESCRIPTORS);


/**
 * Properties that should be defined in Tooltip2 prototype. Simple methods.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.core.ui.Tooltip.prototype.TOOLTIP_SIMPLE_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  anychart.core.settings.createDescriptors(map, [
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'width', anychart.core.settings.numberOrPercentNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'height', anychart.core.settings.numberOrPercentNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'titleFormat', anychart.core.settings.stringOrFunctionNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'format', anychart.core.settings.stringOrFunctionNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'unionFormat', anychart.core.settings.stringOrFunctionNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'valuePrefix', anychart.core.settings.stringNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'valuePostfix', anychart.core.settings.stringNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'position', anychart.enums.normalizePosition],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'anchor', anychart.enums.normalizeAnchor],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'offsetX', anychart.core.settings.numberNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'offsetY', anychart.core.settings.numberNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'x', anychart.core.settings.numberNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'y', anychart.core.settings.numberNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'allowLeaveScreen', anychart.core.settings.booleanNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'allowLeaveChart', anychart.core.settings.booleanNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'allowLeaveStage', anychart.core.settings.booleanNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'displayMode', anychart.enums.normalizeTooltipDisplayMode],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'positionMode', anychart.enums.normalizeTooltipPositionMode],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'onDomReady', anychart.core.settings.functionNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'onBeforeTitleChange', anychart.core.settings.functionNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'onTitleChanged', anychart.core.settings.functionNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'onBeforeContentChange', anychart.core.settings.functionNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'onContentChanged', anychart.core.settings.functionNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'hideDelay', anychart.core.settings.numberNormalizer]
  ]);

  return map;
})();
anychart.core.settings.populate(anychart.core.ui.Tooltip, anychart.core.ui.Tooltip.prototype.TOOLTIP_SIMPLE_DESCRIPTORS);


//endregion
//region -- API out of descriptors.
//----------------------------------------------------------------------------------------------------------------------
//
//  API out of descriptors.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Hide tooltips with delay (if specified {@see #hideDelay}).
 * @param {boolean=} opt_force - Ignore tooltips hide delay.
 * @param {anychart.core.MouseEvent=} opt_event
 * @return {boolean} Returns true if the tooltip was hidden.
 */
anychart.core.ui.Tooltip.prototype.hide = function(opt_force, opt_event) {
  for (var key in this.childTooltipsMap) {
    var childTooltip = this.childTooltipsMap[key];
    if (childTooltip)
      childTooltip.hide(opt_force, opt_event);
  }
  return this.hideSelf(opt_force, opt_event);
};


/**
 * Getter/Setter for the full text appearance settings.
 * @param {(Object|string)=} opt_objectOrName - Settings object or settings name or nothing to get complete object.
 * @param {(string|number|boolean)=} opt_value - Setting value if used as a setter.
 * @return {!(Object|string|number|boolean|anychart.core.ui.Tooltip)} - A copy of settings or the Text for chaining.
 */
anychart.core.ui.Tooltip.prototype.textSettings = function(opt_objectOrName, opt_value) {
  if (goog.isDef(opt_objectOrName)) {
    if (goog.isString(opt_objectOrName)) { //string
      if (goog.isDef(opt_value) && opt_objectOrName in this.TEXT_PROPERTY_DESCRIPTORS) {
        this[opt_objectOrName](opt_value);
      } else {
        return /** @type {!(Object|string|number|boolean)} */ (this.getOption(opt_objectOrName)); //TODO (A.Kudryavtsev): getOption or getOwnOption?
      }
    } else { //object
      this.suspendSignalsDispatching();
      for (var key in opt_objectOrName) {
        if (key in this.TEXT_PROPERTY_DESCRIPTORS)
          this[key](opt_objectOrName[key]);
      }
      this.resumeSignalsDispatching(true);
    }
    return this;
  } else {
    var result = {};
    for (var key in this.TEXT_PROPERTY_DESCRIPTORS) {
      var val = this.getOption(key);
      if (goog.isDef(val)) {
        result[key] = val;
      }
    }
    return result;
  }
};


/**
 * Tooltip padding.
 * @param {(string|number|Array.<number|string>|{top:(number|string),left:(number|string),bottom:(number|string),right:(number|string)})=} opt_spaceOrTopOrTopAndBottom
 * @param {(string|number)=} opt_rightOrRightAndLeft
 * @param {(string|number)=} opt_bottom
 * @param {(string|number)=} opt_left
 * @return {!(anychart.core.utils.Padding|anychart.core.ui.Tooltip)} - Padding instance or itself for method chaining.
 */
anychart.core.ui.Tooltip.prototype.padding = function(opt_spaceOrTopOrTopAndBottom, opt_rightOrRightAndLeft, opt_bottom, opt_left) {
  if (!this.padding_) {
    this.padding_ = new anychart.core.utils.Padding();
    this.padding_.listenSignals(this.onPaddingSignal_, this);

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
 * Internal title invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.core.ui.Tooltip.prototype.onPaddingSignal_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.resetBoundsCache();
    this.invalidate(anychart.core.ui.Tooltip.TOOLTIP_BOUNDS_STATE, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Tooltip background.
 * @param {(string|Object|null|boolean)=} opt_value Background settings.
 * @return {!(anychart.core.ui.Background|anychart.core.ui.Tooltip)} Background instance or itself for method chaining.
 */
anychart.core.ui.Tooltip.prototype.background = function(opt_value) {
  if (!this.background_) {
    this.background_ = new anychart.core.ui.Background();
    this.background_.listenSignals(this.backgroundInvalidated_, this);
    this.background_.setParentEventTarget(this);

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
 * Internal title invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.core.ui.Tooltip.prototype.backgroundInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    this.invalidate(anychart.ConsistencyState.TOOLTIP_BACKGROUND, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Tooltip title.
 * @param {(null|boolean|Object)=} opt_value Title settings.
 * @return {!(anychart.core.ui.Title|anychart.core.ui.Tooltip)} Title instance or itself for method chaining.
 */
anychart.core.ui.Tooltip.prototype.title = function(opt_value) {
  if (!this.title_) {
    this.title_ = new anychart.core.ui.Title();
    this.title_.listenSignals(this.onTitleSignal_, this);
    this.title_.setParentEventTarget(this);
    this.setupCreated('title', this.title_);
  }

  if (goog.isDef(opt_value)) {
    this.title_.setup(opt_value);
    return this;
  } else {
    return this.title_;
  }
};


/**
 * Internal title invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.core.ui.Tooltip.prototype.onTitleSignal_ = function(event) {
  if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    this.resetBoundsCache();
    this.invalidate(anychart.core.ui.Tooltip.TOOLTIP_BOUNDS_STATE, anychart.Signal.NEEDS_REDRAW);
  } else if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    this.invalidate(anychart.ConsistencyState.TOOLTIP_TITLE, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Tooltip separator.
 * @param {(Object|boolean|null)=} opt_value Separator settings.
 * @return {!(anychart.core.ui.Separator|anychart.core.ui.Tooltip)} Separator instance or itself for method chaining.
 */
anychart.core.ui.Tooltip.prototype.separator = function(opt_value) {
  if (!this.separator_) {
    this.separator_ = new anychart.core.ui.Separator();
    this.separator_.listenSignals(this.onSeparatorSignal_, this);
    this.separator_.setParentEventTarget(this);

    this.setupCreated('separator', this.separator_);
  }

  if (goog.isDef(opt_value)) {
    this.separator_.setup(opt_value);
    return this;
  } else {
    return this.separator_;
  }
};


/**
 * Internal separator invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.core.ui.Tooltip.prototype.onSeparatorSignal_ = function(event) {
  if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    this.resetBoundsCache();
    this.invalidate(anychart.core.ui.Tooltip.TOOLTIP_BOUNDS_STATE, anychart.Signal.NEEDS_REDRAW);
  } else if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    this.invalidate(anychart.ConsistencyState.TOOLTIP_SEPARATOR, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Gets current tooltip container.
 * @return {?anychart.core.utils.LocalTooltipContainer}
 */
anychart.core.ui.Tooltip.prototype.getTooltipContainer = function() {
  return this.tooltipContainer_;
};


//endregion
//region -- Internal public API (not exported).
/**
 * Draw tooltip.
 * @return {anychart.core.ui.Tooltip}
 */
anychart.core.ui.Tooltip.prototype.draw = function() {
  this.updateForceInvalidation();
  var useHtml = this.getOption('useHtml');
  if (useHtml) {
    if (this.isConsistent() || this.isDisposed())
      return this;

    if (!this.enabled()) {
      if (this.hasInvalidationState(anychart.ConsistencyState.ENABLED)) {
        this.remove();
        this.markConsistent(anychart.ConsistencyState.ENABLED);
        this.invalidate(anychart.ConsistencyState.CONTAINER);
      }
      return this;
    } else if (!this.htmlTooltip.container()) {
      this.remove(); // It should be removed if it was drawn.
      this.markConsistent(anychart.ConsistencyState.CONTAINER);
      return this;
    }
    this.markConsistent(anychart.ConsistencyState.ENABLED);
  } else if (!this.checkDrawingNeeded())
    return this;


  var background = /** @type {anychart.core.ui.Background} */(this.background());
  var title = this.title();
  var separator = /** @type {anychart.core.ui.Separator} */(this.separator());
  var content = /** @type {anychart.core.ui.Label} */(this.contentInternal());

  this.setContainerToTooltip_(this);

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    this.getRootLayer_().zIndex(/** @type {number} */(this.zIndex()));
    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    this.calculateContentBounds_();
    var cBounds = /** @type {!anychart.math.Rect} */ (this.contentBounds_);
    this.boundsWithoutPadding_ = this.padding().tightenBounds(cBounds);
    this.titleRemainingBounds_ = null;
    this.separatorRemainingBounds_ = null;
    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.TOOLTIP_POSITION)) {
    this.instantPosition_ = null;
    this.calculatePosition_();
    if (useHtml) {
      this.htmlTooltip.updatePosition();
    } else {
      this.getRootLayer_().setTransformationMatrix(1, 0, 0, 1, this.instantPosition_.x, this.instantPosition_.y);
    }
    this.markConsistent(anychart.ConsistencyState.TOOLTIP_POSITION);
  }

  if (useHtml) {
    this.htmlTooltip.updateTexts();
  } else {
    if (this.hasInvalidationState(anychart.ConsistencyState.TOOLTIP_BACKGROUND)) {
      background.suspendSignalsDispatching();
      background.parentBounds(this.contentBounds_);
      background.container(this.getRootLayer_());
      background.draw();
      background.resumeSignalsDispatching(false);

      this.markConsistent(anychart.ConsistencyState.TOOLTIP_BACKGROUND);
    }

    if (this.hasInvalidationState(anychart.ConsistencyState.TOOLTIP_TITLE)) {
      title.suspendSignalsDispatching();
      title.parentBounds(this.boundsWithoutPadding_);
      title.draw();
      title.resumeSignalsDispatching(false);

      // title bounds
      if (!this.titleRemainingBounds_ && title.enabled())
        this.titleRemainingBounds_ = title.getRemainingBounds();

      this.markConsistent(anychart.ConsistencyState.TOOLTIP_TITLE);
    }

    if (this.hasInvalidationState(anychart.ConsistencyState.TOOLTIP_SEPARATOR)) {
      separator.suspendSignalsDispatching();
      separator.parentBounds(this.titleRemainingBounds_ || this.boundsWithoutPadding_);
      separator.draw();
      separator.resumeSignalsDispatching(false);

      //separator bounds
      if (!this.separatorRemainingBounds_ && separator.enabled())
        this.separatorRemainingBounds_ = separator.getRemainingBounds();

      this.markConsistent(anychart.ConsistencyState.TOOLTIP_SEPARATOR);
    }

    if (this.hasInvalidationState(anychart.ConsistencyState.TOOLTIP_CONTENT)) {
      var remainingBounds = this.separatorRemainingBounds_ || this.titleRemainingBounds_ || this.boundsWithoutPadding_;
      content.suspendSignalsDispatching();
      this.applyTextSettings();
      content.parentBounds(remainingBounds);
      content.draw();
      content.resumeSignalsDispatching(false);
      this.markConsistent(anychart.ConsistencyState.TOOLTIP_CONTENT);
    }

    if (this.hasInvalidationState(anychart.ConsistencyState.TOOLTIP_MODE)) {
      this.markConsistent(anychart.ConsistencyState.TOOLTIP_MODE);
    }
  }

  return this;
};


/**
 *
 * @param {anychart.core.Chart=} opt_value
 * @return {anychart.core.Chart|anychart.core.ui.Tooltip}
 */
anychart.core.ui.Tooltip.prototype.chart = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.chart_ = opt_value;
    return this;
  } else {
    return this.chart_;
  }
};


/**
 * Sets format and titleFormat "in the middle".
 * Tooltip has the resolution chain that consists of highPriorityResolutionChain and lowPriorityResolutionChain.
 * In DVF-4244 we add independent tooltips for gantt timeline elements and tooltip gets new functionality in
 * its resolution chain building: it gets this.middleFormats_ object between high- and low-priority chains.
 *
 * This method allows to manipulate fields in this.middleFormats_ object to set the formats.
 * It allows to get timeline's elements tooltip formats and proxy it to datagrid's tooltip.
 * In this case, if datagrid's tooltip doesn't have own formats set, it will be taken from formats of timeline element's
 * tooltip.
 *
 * @param {(string|Function)=} opt_format - Middle tooltip content format.
 * @param {(string|Function)=} opt_titleFormat - Middle tooltip title format.
 */
anychart.core.ui.Tooltip.prototype.setMiddleFormats = function(opt_format, opt_titleFormat) {
  this.middleFormats_['format'] = opt_format;
  this.middleFormats_['titleFormat'] = opt_titleFormat;
};


/**
 * Shows as single.
 * @param {Array} points - Points.
 * @param {number} clientX - ClientX coordinate.
 * @param {number} clientY - ClientY coordinate.
 * @param {boolean=} opt_useUnionAsSingle - Whether to use union tooltip as single.
 * @param {Object=} opt_tooltipContextLoad
 * @private
 */
anychart.core.ui.Tooltip.prototype.showAsSingle_ = function(points, clientX, clientY, opt_useUnionAsSingle, opt_tooltipContextLoad) {
  var firstPoint = points[0];
  var firstSeries = firstPoint['series'];
  /** @type {anychart.core.ui.Tooltip} */
  this.tooltipInUse_ = opt_useUnionAsSingle ? this : firstSeries.tooltip();

  // the second condition is for compile_each (gantt, bullet)
  if (this.isTooltipDisabled_(this.tooltipInUse_, firstPoint) || !goog.isDef(firstSeries.createTooltipContextProvider))
    return;

  var contextProvider = /** @type {anychart.format.Context} */ (firstSeries.createTooltipContextProvider());
  if (opt_tooltipContextLoad) {
    goog.object.extend(contextProvider.contextValues(), opt_tooltipContextLoad);
    contextProvider.propagate();
  }
  contextProvider['clientX'] = clientX;
  contextProvider['clientY'] = clientY;
  this.tooltipInUse_.title().autoText(this.tooltipInUse_.getFormattedTitle(contextProvider));
  this.tooltipInUse_.contentInternal().text(this.tooltipInUse_.getFormattedContent_(contextProvider));

  // this.hideChildTooltips();
  if (this.tooltipInUse_ == this) {
    this.hideChildTooltips();
  } else {
    this.hideSelf();
    this.hideChildTooltips([this.tooltipInUse_]);
  }

  var isHtml = this.getOption('useHtml');
  if ((isHtml && !this.tooltipInUse_.htmlTooltip.container()) || !this.tooltipInUse_.getRootLayer_().parent()) {
    this.tooltipInUse_.invalidate(anychart.ConsistencyState.CONTAINER);
  }

  if (isHtml)
    this.tooltipInUse_.htmlTooltip.updateTexts();

  this.setContainerToTooltip_(this.tooltipInUse_);
  this.setPositionForSingle_(this.tooltipInUse_, clientX, clientY, firstSeries);
  this.tooltipInUse_.showForPosition_(clientX, clientY);
};


/**
 *
 * @param {anychart.core.ui.Tooltip} tooltip - Tooltip to process.
 * @param {number} x - X.
 * @param {number} y - Y.
 * @param {goog.math.Coordinate} stageOffset - Stage offset.
 * @param {goog.math.Rect} stageBounds - Stage bounds.
 * @param {goog.math.Rect} pixelBoundsInStage - Pixel bounds from bounds provider.
 * @private
 */
anychart.core.ui.Tooltip.prototype.limitPosition_ = function(tooltip, x, y, stageOffset, stageBounds, pixelBoundsInStage) {
  if (tooltip.enabled()) {
    var allowLeaveStage = tooltip.getOption('allowLeaveStage');
    var allowLeaveScreen = tooltip.getOption('allowLeaveScreen');
    var allowLeaveChart = tooltip.getOption('allowLeaveChart');
    var isHtml = tooltip.getOption('useHtml');
    var useGlobalCont = tooltip.useGlobalContainer_();

    var offsetX = isHtml ? 0 : /** @type {number} */ (tooltip.getOption('offsetX'));
    var offsetY = isHtml ? 0 : /** @type {number} */ (tooltip.getOption('offsetY'));

    var pixelBounds;

    if (!allowLeaveScreen) {
      // Set position for get actual pixel bounds.
      tooltip['x'](x);
      tooltip['y'](y);

      var addOffsetX = useGlobalCont ? 0 : stageOffset.x;
      var addOffsetY = useGlobalCont ? 0 : stageOffset.y;

      /*
        These bounds are always bounds in parent stage.
        Local stage has bounds equal to container,
        global stage has bounds of screen.
       */
      pixelBounds = tooltip.getPixelBounds();
      var windowBox = goog.dom.getViewportSize(anychart.window);

      if (pixelBounds.left - offsetX + addOffsetX < 0) {
        x -= pixelBounds.left - offsetX + addOffsetX;
      }

      if (pixelBounds.top - offsetY + addOffsetY < 0) {
        y -= pixelBounds.top - offsetY + addOffsetY;
      }

      if (pixelBounds.getRight() - offsetX + addOffsetX > windowBox.width) {
        x -= pixelBounds.getRight() - offsetX + addOffsetX - windowBox.width;
      }

      if (pixelBounds.getBottom() - offsetY + addOffsetY > windowBox.height) {
        y -= pixelBounds.getBottom() - offsetY + addOffsetY - windowBox.height;
      }
    }

    if (!allowLeaveStage) {
      // Set position for get actual pixel bounds.
      tooltip['x'](x);
      tooltip['y'](y);

      pixelBounds = tooltip.getPixelBounds();

      if (pixelBounds.left < offsetX) {
        x -= pixelBounds.left - offsetX;
      }

      if (pixelBounds.top < offsetY) {
        y -= pixelBounds.top - offsetY;
      }

      if (pixelBounds.getRight() > stageBounds.width + offsetX) {
        x -= pixelBounds.getRight() - stageBounds.width - offsetX;
      }

      if (pixelBounds.getBottom() > stageBounds.height + offsetY) {
        y -= pixelBounds.getBottom() - stageBounds.height - offsetY;
      }
    }

    if (!allowLeaveChart) {
      // Set position for get actual pixel bounds.
      tooltip['x'](x);
      tooltip['y'](y);

      pixelBounds = tooltip.getPixelBounds();

      if (pixelBounds.left < pixelBoundsInStage.left + offsetX) {
        x -= pixelBounds.left - offsetX - pixelBoundsInStage.left;
      }

      if (pixelBounds.top < pixelBoundsInStage.top + offsetY) {
        y -= pixelBounds.top - offsetY - pixelBoundsInStage.top;
      }

      if (pixelBounds.getRight() > pixelBoundsInStage.getRight() + offsetX) {
        x -= pixelBounds.getRight() - offsetX - pixelBoundsInStage.getRight();
      }

      if (pixelBounds.getBottom() > pixelBoundsInStage.getBottom() + offsetY) {
        y -= pixelBounds.getBottom() - offsetY - pixelBoundsInStage.getBottom();
      }
    }

    tooltip['x'](x);
    tooltip['y'](y);
  }
};


/**
 * Sets position for single tooltip.
 * @param {anychart.core.ui.Tooltip} tooltip - Tooltip.
 * @param {number} clientX - ClientX coordinate.
 * @param {number} clientY - ClientY coordinate.
 * @param {anychart.core.series.Base|anychart.treemapModule.Chart=} opt_series - Series.
 * @private
 */
anychart.core.ui.Tooltip.prototype.setPositionForSingle_ = function(tooltip, clientX, clientY, opt_series) {
  var manager = tooltip.parent() ? this.getTooltipParent_(tooltip) : this;

  var x, y, anchoredPositionCoordinate;
  var positionMode = manager.getOption('positionMode') || anychart.enums.TooltipPositionMode.FLOAT;

  var boundsProvider = manager.chart() || this.containerProvider();
  var pixelBoundsInStage = boundsProvider.getPixelBounds();
  var stage = boundsProvider.container().getStage();
  var stageOffset = stage.getClientPosition();
  var stageBounds = stage.getBounds();
  var useGlobalCont = tooltip.useGlobalContainer_();
  var position = /** @type {anychart.enums.Position} */(tooltip.getOption('position'));

  switch (positionMode) {
    case anychart.enums.TooltipPositionMode.FLOAT:
      x = useGlobalCont ? clientX : clientX - stageOffset.x;
      y = useGlobalCont ? clientY : clientY - stageOffset.y;
      break;

    case anychart.enums.TooltipPositionMode.POINT:
      var positionProvider;
      if (opt_series && opt_series.createPositionProvider) {
        positionProvider = opt_series.createPositionProvider(position, true)['value'];
      } else {
        positionProvider = {'x': clientX, 'y': clientY};
      }
      x = useGlobalCont ? positionProvider['x'] + stageOffset.x : positionProvider['x'];
      y = useGlobalCont ? positionProvider['y'] + stageOffset.y : positionProvider['y'];
      break;

    case anychart.enums.TooltipPositionMode.CHART:
      anchoredPositionCoordinate = anychart.utils.getCoordinateByAnchor(pixelBoundsInStage, position);
      x = anchoredPositionCoordinate.x + (useGlobalCont ? stageOffset.x : 0);
      y = anchoredPositionCoordinate.y + (useGlobalCont ? stageOffset.y : 0);
      break;
  }

  manager.limitPosition_(tooltip, x, y, stageOffset, stageBounds, pixelBoundsInStage);
};


/**
 * Show tooltip for uni.
 * @param {Array} points
 * @param {number} clientX
 * @param {number} clientY
 * @param {anychart.core.series.Base} hoveredSeries
 * @param {Object=} opt_tooltipContextLoad
 * @private
 */
anychart.core.ui.Tooltip.prototype.showAsUnion_ = function(points, clientX, clientY, hoveredSeries, opt_tooltipContextLoad) {
  if (this.check(anychart.core.ui.Tooltip.Capabilities.CAN_CHANGE_DISPLAY_MODE |
          anychart.core.ui.Tooltip.Capabilities.CAN_CHANGE_POSITION_MODE)) {

    this.tooltipInUse_ = hoveredSeries ? /** @type {anychart.core.ui.Tooltip} */ (hoveredSeries.tooltip()) : this;

    this.hideChildTooltips([this.tooltipInUse_]);

    if (!this.tooltipInUse_.enabled())
      return;

    var unionContext = {
      'clientX': {value: clientX, type: anychart.enums.TokenType.NUMBER},
      'clientY': {value: clientY, type: anychart.enums.TokenType.NUMBER},
      'formattedValues': {value: [], type: anychart.enums.TokenType.UNKNOWN},
      'points': {value: [], type: anychart.enums.TokenType.UNKNOWN}
    };

    var allPoints = [];

    for (var i = 0; i < points.length; i++) {
      var point = points[i];
      if (point) {
        var series = /** @type {anychart.core.series.Base} */ (point['series']);

        // for compile_each (gantt, bullet)
        if (!goog.isDef(series.createTooltipContextProvider))
          return;

        var tooltip = /** @type {anychart.core.ui.Tooltip} */ (series.tooltip());
        if (!series.enabled() || this.isTooltipDisabled_(tooltip, point))
          continue;

        var contextProvider = series.createTooltipContextProvider();
        unionContext['formattedValues'].value.push(tooltip.getFormattedContent_(contextProvider));
        unionContext['points'].value.push(contextProvider);
        if (!i) {
          unionContext['x'] = {value: contextProvider.dataSource().getX(), type: anychart.enums.TokenType.STRING};
          //TODO (A.Kudryavtsev): This fallback is added for http://jsfiddle.net/rLapmrgs/7/ .
          //TODO (A.Kudryavtsev): Probably the better way is to move this definition in opt_tooltipContextLoad for polar chart.
          unionContext['name'] = {value: contextProvider.getData('name'), type: anychart.enums.TokenType.STRING};
        }

        if (goog.isArray(point['points'])) {
          allPoints.push({
            'series': series,
            'points': goog.array.map(point['points'], function(pointIndex) {
              series.getIterator().select(pointIndex);
              return /** @type {{createTooltipContextProvider:Function}} */(series).createTooltipContextProvider(true);
            })
          });
        }
      }
    }

    if (allPoints.length == points.length) {
      unionContext['allPoints'] = {value: allPoints, type: anychart.enums.TokenType.UNKNOWN};
    }

    if (unionContext['formattedValues'].value.length) {
      var sep = this.tooltipInUse_.getOption('useHtml') ? '<br/>' : '\n';
      unionContext['joinedFormattedValues'] = {
        value: unionContext['formattedValues'].value.join(sep),
        type: anychart.enums.TokenType.STRING
      };
    } else {
      return;
    }

    if (opt_tooltipContextLoad)
      goog.object.extend(unionContext, opt_tooltipContextLoad);

    var chart = (hoveredSeries && hoveredSeries.getChart && hoveredSeries.getChart()) ||
        (points[0] && points[0]['series'] && points[0]['series'].getChart && points[0]['series'].getChart() || void 0);

    var statisticsSources = [];
    if (!hoveredSeries && points[0] && points[0]['series'])
      statisticsSources.push(points[0]['series']);
    if (hoveredSeries)
      statisticsSources.push(hoveredSeries);
    if (chart)
      statisticsSources.push(chart);

    var unionContextProvider = new anychart.format.Context(unionContext);
    unionContextProvider.statisticsSources(statisticsSources);
    if (hoveredSeries)
      unionContextProvider.dataSource(hoveredSeries.getIterator());
    unionContextProvider.propagate();

    this.tooltipInUse_.contentInternal().text(this.getFormattedContent_(unionContextProvider, true));
    this.tooltipInUse_.title().autoText(this.getFormattedTitle(unionContextProvider));

    this.tooltipInUse_.hideChildTooltips();
    if (this.tooltipInUse_.getOption('useHtml'))
      this.tooltipInUse_.htmlTooltip.updateTexts();

    if (!this.tooltipInUse_.getRootLayer_().parent()) {
      this.tooltipInUse_.invalidate(anychart.ConsistencyState.CONTAINER);
    }
    this.setContainerToTooltip_(this.tooltipInUse_);
    this.setPositionForSingle_(this.tooltipInUse_, clientX, clientY, hoveredSeries);
    this.tooltipInUse_.showForPosition_(clientX, clientY);
  }
};


/**
 * Shows separated tooltip
 * @param {Array} points - Points.
 * @param {number} clientX - ClientX coordinate.
 * @param {number} clientY - ClientY coordinate.
 * @private
 */
anychart.core.ui.Tooltip.prototype.showSeparatedChildren_ = function(points, clientX, clientY) {
  this.hideSelf();
  for (var i = 0; i < points.length; i++) {
    var point = points[i];
    var series = point['series'];

    // for compile_each (gantt, bullet)
    if (!goog.isDef(series.createTooltipContextProvider))
      return;

    var tooltip = /** @type {anychart.core.ui.Tooltip} */ (series.tooltip());

    if (this.isTooltipDisabled_(tooltip, point))
      continue;

    var contextProvider = /** @type {anychart.format.Context} */ (series.createTooltipContextProvider());
    contextProvider['clientX'] = clientX;
    contextProvider['clientY'] = clientY;
    tooltip.title().autoText(tooltip.getFormattedTitle(contextProvider));
    tooltip.contentInternal().text(tooltip.getFormattedContent_(contextProvider));

    if (!tooltip.getRootLayer_().parent()) {
      tooltip.invalidate(anychart.ConsistencyState.CONTAINER);
    }

    if (tooltip.getOption('useHtml'))
      tooltip.htmlTooltip.updateTexts();

    this.setContainerToTooltip_(tooltip);
    this.setPositionForSeparated_(tooltip, clientX, clientY, series);
    tooltip.showForPosition_(clientX, clientY);
  }
};


/**
 * Checks if the tooltips is disabled for this series or the point is missing.
 * @param {anychart.core.ui.Tooltip} tooltip
 * @param {Object} point - the current series point.
 * @return {boolean}
 * @private
 */
anychart.core.ui.Tooltip.prototype.isTooltipDisabled_ = function(tooltip, point) {
  return !tooltip.enabled() || point['nearestPointToCursor'] && !isFinite(point['nearestPointToCursor']['distance']);
};


/**
 * Show tooltip base on points on series.
 * @param {Array} points
 * @param {number} clientX
 * @param {number} clientY
 * @param {anychart.core.series.Base} hoveredSeries
 * @param {boolean=} opt_useUnionAsSingle
 * @param {Object=} opt_tooltipContextLoad
 */
anychart.core.ui.Tooltip.prototype.showForSeriesPoints = function(points, clientX, clientY, hoveredSeries, opt_useUnionAsSingle, opt_tooltipContextLoad) {
  if (!this.tooltipContainer_ || this.tooltipContainer_.isLocal() || !this.tooltipContainer_.selectable() ||
      this.check(anychart.core.ui.Tooltip.Capabilities.CAN_CHANGE_DISPLAY_MODE) || points.length) {
    this.updateForceInvalidation();

    var dispMode = this.getOption('displayMode');
    if (dispMode == anychart.enums.TooltipDisplayMode.SINGLE) {
      this.showAsSingle_(points, clientX, clientY, opt_useUnionAsSingle, opt_tooltipContextLoad);
    } else if (dispMode == anychart.enums.TooltipDisplayMode.UNION) {
      this.showAsUnion_(points, clientX, clientY, hoveredSeries, opt_tooltipContextLoad);
    } else if (dispMode == anychart.enums.TooltipDisplayMode.SEPARATED) {
      this.showSeparatedChildren_(points, clientX, clientY);
    }
  }
};


/**
 * Show tooltip in position.
 * @param {number} clientX - ClientX coordinate.
 * @param {number} clientY - ClientY coordinate.
 * @private
 */
anychart.core.ui.Tooltip.prototype.showForPosition_ = function(clientX, clientY) {
  if (!this.enabled()) {
    return;
  }

  this.updateForceInvalidation();

  if (!this.getRootLayer_().parent()) {
    this.invalidate(anychart.ConsistencyState.CONTAINER);
  }

  this.setContainerToTooltip_(this);

  if (this.delay_ && this.delay_.isActive()) this.delay_.stop();
  this.draw();

  var rootLayer = this.getRootLayer_();
  var domElement = rootLayer.domElement();

  // like selectable && enabled
  if (this.getOption('selectable') && domElement) {
    rootLayer.disablePointerEvents(false);

    this.createTriangle_(clientX, clientY);

    // bug fix (separated mode, the points are on top of one another)
    goog.events.unlisten(goog.dom.getDocument(), goog.events.EventType.MOUSEMOVE, this.movementOutsideThePoint_, false, this);

  } else if (domElement) {
    rootLayer.disablePointerEvents(true);
  }
};


/**
 * Show tooltip in position.
 * @param {number} clientX - ClientX coordinate.
 * @param {number} clientY - ClientY coordinate.
 * @param {anychart.format.Context=} opt_contextProvider - Context provider.
 */
anychart.core.ui.Tooltip.prototype.showFloat = function(clientX, clientY, opt_contextProvider) {
  this.updateForceInvalidation();
  this.tooltipInUse_ = this;
  if (opt_contextProvider) {
    opt_contextProvider['clientX'] = clientX;
    opt_contextProvider['clientY'] = clientY;
    this.title().autoText(this.getFormattedTitle(opt_contextProvider));
    this.contentInternal()['text'](this.getFormattedContent_(opt_contextProvider));
  }

  var isHtml = this.getOption('useHtml');
  if (isHtml && !this.tooltipInUse_.htmlTooltip.container()) {
    this.tooltipInUse_.invalidate(anychart.ConsistencyState.CONTAINER);
  }

  this.setContainerToTooltip_(this);
  this.setPositionForSingle_(this, clientX, clientY);
  this.showForPosition_(clientX, clientY);
};


/**
 * Update position (used for float position only)
 * @param {number} clientX
 * @param {number} clientY
 */
anychart.core.ui.Tooltip.prototype.updatePosition = function(clientX, clientY) {
  var displayMode = this.getOption('displayMode');
  if (displayMode == anychart.enums.TooltipDisplayMode.SINGLE) {
    this.setPositionForSingle_(this.tooltipInUse_, clientX, clientY);
    this.tooltipInUse_.showForPosition_(clientX, clientY);
  }
  if (displayMode == anychart.enums.TooltipDisplayMode.UNION) {
    this.setPositionForSingle_(this.tooltipInUse_, clientX, clientY);
    this.tooltipInUse_.showForPosition_(clientX, clientY);
  } else if (displayMode == anychart.enums.TooltipDisplayMode.SEPARATED) {
    for (var key in this.childTooltipsMap) {
      var childTooltip = this.childTooltipsMap[key];
      if (childTooltip) {
        this.setPositionForSeparated_(childTooltip, clientX, clientY);
        childTooltip.showForPosition_(clientX, clientY);
      }
    }
  }
};


/**
 * Get formatted title.
 * @param {anychart.format.Context} contextProvider
 * @return {string}
 */
anychart.core.ui.Tooltip.prototype.getFormattedTitle = function(contextProvider) {
  contextProvider.contextValues()['titleText'] = {value: this.title_.getOption('text'), type: anychart.enums.TokenType.STRING};
  contextProvider.propagate();
  var formatter = this.getOption('titleFormat');
  if (goog.isString(formatter))
    formatter = anychart.core.utils.TokenParser.getInstance().getFormat(formatter);

  return formatter.call(contextProvider, contextProvider);
};


/**
 * Get formatted content.
 * @param {anychart.format.Context} contextProvider
 * @param {boolean=} opt_useUnionFormatter - Whether to use tooltip's union text formatter.
 * @return {string}
 * @private
 */
anychart.core.ui.Tooltip.prototype.getFormattedContent_ = function(contextProvider, opt_useUnionFormatter) {
  contextProvider.contextValues()['valuePrefix'] = {
    value: this.getOption('valuePrefix') || '',
    type: anychart.enums.TokenType.STRING
  };
  contextProvider.contextValues()['valuePostfix'] = {
    value: this.getOption('valuePostfix') || '',
    type: anychart.enums.TokenType.STRING
  };
  contextProvider.propagate();
  var formatter = opt_useUnionFormatter ?
      this.getOption('unionFormat') :
      this.getOption('format');
  if (goog.isString(formatter))
    formatter = anychart.core.utils.TokenParser.getInstance().getFormat(formatter);

  var maxLength = /** @type {number|null} */(this.getOption('maxLength'));
  var text = formatter.call(contextProvider, contextProvider);

  text = anychart.core.utils.InternalLabelsFormatters.textLengthFormatter(text, maxLength);

  return text;
};


/**
 * Tooltip content.
 * @param {(Object|boolean|null|string)=} opt_value Content settings.
 * @return {!(anychart.core.ui.Label|anychart.core.ui.Tooltip)} Labels instance or itself for method chaining.
 */
anychart.core.ui.Tooltip.prototype.contentInternal = function(opt_value) {
  if (!this.content_) {
    this.content_ = new anychart.core.ui.Label();
    this.content_.listenSignals(this.onContentSignal_, this);
    this.content_.setParentEventTarget(this);

    //TODO (A.Kudryavtsev): Dirty hack.
    //TODO (A.Kudryavtsev): Can't avoid it because width_ and height_ values are hardcoded in LabelsBase.
    this.content_.width('100%').height('100%');

    this.setupCreated('contentInternal', this.content_);
  }

  if (goog.isDef(opt_value)) {
    this.content_.setup(opt_value);
    return this;
  } else {
    return this.content_;
  }
};


/**
 * Internal title invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.core.ui.Tooltip.prototype.onContentSignal_ = function(event) {
  if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    this.resetBoundsCache();
    this.invalidate(anychart.core.ui.Tooltip.TOOLTIP_BOUNDS_STATE, anychart.Signal.NEEDS_REDRAW);
  } else if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    this.invalidate(anychart.ConsistencyState.TOOLTIP_CONTENT, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Resets content bounds and position cache.
 */
anychart.core.ui.Tooltip.prototype.resetBoundsCache = function() {
  this.contentBounds_ = null;
  this.instantPosition_ = null;
};


/**
 * Hides tooltip itself with delay (if specified {@see #hideDelay}).
 * NOTE: Doesn't hide child tooltips if present.
 * @param {boolean=} opt_force - Ignore tooltips hide delay.
 * @param {anychart.core.MouseEvent=} opt_event
 * @return {boolean} Returns true if the tooltip was hidden.
 */
anychart.core.ui.Tooltip.prototype.hideSelf = function(opt_force, opt_event) {
  if (opt_force) {
    if (this.delay_) this.delay_.stop();
    this.remove();
    return true;
  }

  if (this.getOption('selectable') && opt_event) {
    var clientX = opt_event['originalEvent']['clientX'];
    var clientY = opt_event['originalEvent']['clientY'];
    var pixelBounds = this.getPixelBounds();
    var distance = pixelBounds.distance(new goog.math.Coordinate(clientX, clientY));
    var domElement = this.getRootLayer_().domElement();

    // cursor inside the tooltip
    if (domElement && !distance) {
      goog.events.listen(domElement, goog.events.EventType.MOUSELEAVE, this.hideSelectable_, false, this);
      this.triangle_ = null;
      return false;
    }

    if (this.isInTriangle_(clientX, clientY)) {
      goog.events.listen(goog.dom.getDocument(), goog.events.EventType.MOUSEMOVE, this.movementOutsideThePoint_, false, this);
      if (domElement) {
        goog.events.listen(this.getRootLayer_().domElement(), goog.events.EventType.MOUSEENTER, this.tooltipEnter_, false, this);
        goog.events.listen(this.getRootLayer_().domElement(), goog.events.EventType.MOUSELEAVE, this.tooltipLeave_, false, this);
      }
      return false;
    }

    this.triangle_ = null;
  }

  if (this.getOption('hideDelay')) {
    this.createDelayObject_();
    if (!this.delay_.isActive()) this.delay_.start();
    return false;
  } else {
    this.remove();
    return true;
  }
};


/** @inheritDoc */
anychart.core.ui.Tooltip.prototype.remove = function() {
  if (this.getOption('useHtml') && this.htmlTooltip) {
    this.htmlTooltip.remove();
  }
  this.getRootLayer_().parent(null);
};


/**
 * @inheritDoc
 */
anychart.core.ui.Tooltip.prototype.needsForceSignalsDispatching = function(opt_value) {
  return this.predeclareAsParent ||
      (this.check(anychart.core.ui.Tooltip.Capabilities.CAN_CHANGE_DISPLAY_MODE) && !goog.object.isEmpty(this.childTooltipsMap));
};


/**
 * Updates needsForceInvalidation state for complex properties like bg, title, etc.
 */
anychart.core.ui.Tooltip.prototype.updateForceInvalidation = function() {
  var forceInvalidation = /** @type {boolean} */ (this.needsForceSignalsDispatching());
  this.title().needsForceSignalsDispatching(forceInvalidation);
  this.separator().needsForceSignalsDispatching(forceInvalidation);
  this.background().needsForceSignalsDispatching(forceInvalidation);
  this.padding().needsForceSignalsDispatching(forceInvalidation);
};


/**
 * Return Tooltip pixel bounds.
 * @return {!anychart.math.Rect} Tooltip pixel bounds.
 */
anychart.core.ui.Tooltip.prototype.getPixelBounds = function() {
  this.instantPosition_ = null;
  this.calculatePosition_(); //also calculate content bounds, because it needs it.
  var isHtml = this.getOption('useHtml');
  var offsetX = isHtml ? 0 : /** @type {number} */ (this.getOption('offsetX'));
  var offsetY = isHtml ? 0 : /** @type {number} */ (this.getOption('offsetY'));

  return new anychart.math.Rect(
      /** @type {number} */ (this.instantPosition_.x) + offsetX,
      /** @type {number} */ (this.instantPosition_.y) + offsetY,
      this.contentBounds_.width, this.contentBounds_.height);
};


/**
 * Return Tooltip content bounds.
 * @return {anychart.math.Rect} Tooltip content bounds.
 */
anychart.core.ui.Tooltip.prototype.getContentBounds = function() {
  this.calculateContentBounds_();
  return this.contentBounds_;
};


/**
 * Applies text settings to text element.
 */
anychart.core.ui.Tooltip.prototype.applyTextSettings = function() {
  if (this.hasInvalidationState(anychart.ConsistencyState.TOOLTIP_CONTENT)) {
    this.contentInternal().suspendSignalsDispatching();
    for (var key in this.TEXT_PROPERTY_DESCRIPTORS) {
      var val = /** @type {Function|boolean|null|number|string|undefined} */ (this.getOption(key));
      if (goog.isDef(val)) {
        this.contentInternal().textSettings(key, val);
      }
    }
    this.contentInternal()['adjustFontSize'](/** @type {boolean} */ (this.getOption('adjustFontSize')));
    this.contentInternal()['minFontSize'](/** @type {number|string} */ (this.getOption('minFontSize')));
    this.contentInternal()['maxFontSize'](/** @type {number|string} */ (this.getOption('maxFontSize')));
    this.contentInternal().resumeSignalsDispatching(false);
  }
};


//endregion
//region -- Private methods.
//----------------------------------------------------------------------------------------------------------------------
//
//  Private methods.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Gets/creates root layer.
 * @return {!acgraph.vector.Layer}
 * @private
 */
anychart.core.ui.Tooltip.prototype.getRootLayer_ = function() {
  if (!this.rootLayer_) {
    this.rootLayer_ = acgraph.layer();
    this.bindHandlersToGraphics(this.rootLayer_);

    var background = /** @type {anychart.core.ui.Background} */(this.background());
    var title = this.title();
    var separator = /** @type {anychart.core.ui.Separator} */(this.separator());
    var content = /** @type {anychart.core.ui.Label} */(this.contentInternal());

    background.container(this.rootLayer_);
    title.container(this.rootLayer_);
    separator.container(this.rootLayer_);
    content.container(this.rootLayer_);
  }
  return this.rootLayer_;
};


/**
 * Gets/sets tooltip container provider.
 * @param {(anychart.core.ui.Legend|anychart.core.VisualBaseWithBounds)=} opt_value - Value to set.
 * @return {anychart.core.ui.Tooltip|anychart.core.ui.Legend|anychart.core.VisualBaseWithBounds} - Current value or itself for chaining.
 */
anychart.core.ui.Tooltip.prototype.containerProvider = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.containerProvider_ = opt_value;
    return this;
  }
  return this.containerProvider_;
};


/**
 * Defines whether to use global container instead of local one.
 * @return {boolean}
 * @private
 */
anychart.core.ui.Tooltip.prototype.useGlobalContainer_ = function() {
  return anychart.compatibility.ALLOW_GLOBAL_TOOLTIP_CONTAINER &&
      /** @type {boolean} */ (this.getOption('allowLeaveStage')) &&
      /** @type {boolean} */ (this.getOption('allowLeaveChart'));
};


/**
 * Create timer object for hiding with delay, if hiding process has already started,
 * mark timer to recreate after hiding process ends.
 * @private
 */
anychart.core.ui.Tooltip.prototype.createDelayObject_ = function() {
  // This wrapper with 'refreshDelay_' necessary to avoid memory leaks when changing hideDelay_ value.
  if (this.delay_ && this.delay_.isActive()) {
    this.refreshDelay_ = true;
  } else {
    goog.dispose(this.delay_);
    this.delay_ = new goog.async.Delay(function() {
      this.remove();
      if (this.refreshDelay_) {
        this.refreshDelay_ = false;
        this.createDelayObject_();
      }
    }, /** @type {number} */ (this.getOption('hideDelay')), this);
  }
};


/**
 * Hides child tooltips. Hide delay will be ignored.
 * @param {Array.<anychart.core.ui.Tooltip>=} opt_ignoreTooltips
 */
anychart.core.ui.Tooltip.prototype.hideChildTooltips = function(opt_ignoreTooltips) {
  opt_ignoreTooltips = opt_ignoreTooltips || [];
  for (var uid in this.childTooltipsMap) {
    var exclude = goog.array.some(opt_ignoreTooltips, function(tooltip) {
      return String(goog.getUid(tooltip)) == uid;
    });
    if (exclude) continue;
    this.childTooltipsMap[uid].hide(true);
  }
};


/**
 * Calculate tooltip all content bounds and cache it to this.contentBounds_.
 * @private
 */
anychart.core.ui.Tooltip.prototype.calculateContentBounds_ = function() {
  if (this.getOption('useHtml')) {
    this.contentBounds_ = this.htmlTooltip.getBounds();
  } else if (!this.contentBounds_) {
    this.contentInternal().suspendSignalsDispatching();
    this.applyTextSettings();
    this.contentInternal().resumeSignalsDispatching(false);

    var tooltipWidth = /** @type {(null|number|string|undefined)} */ (this.getOption('width'));
    var tooltipHeight = /** @type {(null|number|string|undefined)} */ (this.getOption('height'));

    var boundsProvider = this.chart_ || this.containerProvider();
    var pixelBounds = boundsProvider.getPixelBounds();

    var tooltipPixelWidth = anychart.utils.normalizeSize(tooltipWidth, pixelBounds.width);
    var tooltipPixelHeight = anychart.utils.normalizeSize(tooltipHeight, pixelBounds.height);

    var widthIsSet = !isNaN(tooltipPixelWidth);
    var heightIsSet = !isNaN(tooltipPixelHeight);

    var result = new anychart.math.Rect(0, 0, 0, 0);

    var separatorBounds;
    var tmpWidth = null;
    var tmpHeight = null;

    var title = /** @type {anychart.core.ui.Title} */(this.title());
    var separator = /** @type {anychart.core.ui.Separator} */(this.separator());
    var content = /** @type {anychart.core.ui.Label} */(this.contentInternal());

    title.suspendSignalsDispatching();
    separator.suspendSignalsDispatching();
    content.suspendSignalsDispatching();

    var tWidth, tHeight;
    if (!widthIsSet || !heightIsSet) { //auto width and height calculation.
      if (title.enabled()) {
        if (acgraph.type() == acgraph.StageType.SVG) {
          title.parentBounds(null);
        } else {
          title.parentBounds(this.chart_ && this.chart_.container() ? this.chart_.container().getStage().getBounds() : null);
        }
        var titleWidth = title.getOption('width');
        var titleHasOwnWidth = goog.isDefAndNotNull(title.getOwnOption('width'));
        var titleHeight = title.getOption('height');
        var titleHasOwnHeight = goog.isDefAndNotNull(title.getOwnOption('height'));

        if (anychart.utils.isPercent(titleWidth)) {
          tmpWidth = /** @type {number|string|null} */(titleWidth);
          if (widthIsSet) {
            tWidth = this.padding().tightenWidth(tooltipPixelWidth);
            title['width'](tWidth);
          } else {
            title['width'](null); //resetting title width.
          }
        }

        if (anychart.utils.isPercent(titleHeight)) {
          tmpHeight = /** @type {number|string|null} */(titleHeight);
          if (heightIsSet) {
            tHeight = this.padding().tightenHeight(tooltipPixelHeight);
            title['height'](tHeight);
          } else {
            title['height'](null);
          }
        }

        var titleBounds = title.getContentBounds();
        result.width = tooltipPixelWidth || Math.max(result.width, titleBounds.width);
        if (titleHasOwnWidth) {
          title['width'](tmpWidth);
        } else {
          delete title.ownSettings['width'];
        }
        if (titleHasOwnHeight) {
          title['height'](tmpHeight);
        } else {
          delete title.ownSettings['height'];
        }
        tmpWidth = null;
        tmpHeight = null;
        if (!heightIsSet)
          result.height += titleBounds.height;
      }

      if (content.enabled()) {
        var parentContent = this.parent_ ? this.parent_.contentInternal() : null;
        var parentContentWidth = parentContent ? parentContent.width() : void 0;
        var parentContentHeight = parentContent ? parentContent.height() : void 0;

        content.parentBounds(null);
        var contentWidth = content.width() || parentContentWidth;
        var contentHeight = content.height() || parentContentHeight;

        if (anychart.utils.isPercent(contentWidth)) {
          tmpWidth = /** @type {number|string|null} */(contentWidth);
          if (widthIsSet) {
            tWidth = this.padding().tightenWidth(tooltipPixelWidth);
            content.width(tWidth);
          } else {
            content.width(null); //resetting content width.
          }
        }

        if (anychart.utils.isPercent(contentHeight)) {
          tmpHeight = /** @type {number|string|null} */(contentHeight);
          if (heightIsSet) {
            tHeight = this.padding().tightenHeight(tooltipPixelHeight);
            content.height(tHeight);
          } else {
            content.height(null); //resetting content height.
          }
        }

        var contentBounds = content.getContentBounds();
        result.width = tooltipPixelWidth || Math.max(result.width, contentBounds.width);
        if (tmpWidth) {
          content.width(tmpWidth);
          tmpWidth = null;
        }
        if (tmpHeight) {
          content.height(tmpHeight);
          tmpHeight = null;
        }
        if (!heightIsSet)
          result.height += contentBounds.height;
      }

      // fix for title and content .width('100%');
      if (title.enabled()) {
        title.parentBounds(new anychart.math.Rect(0, 0, result.width, titleBounds.height));
      }
      if (content.enabled()) {
        content.parentBounds(new anychart.math.Rect(0, 0, result.width, contentBounds.height));
      }

      if (separator.enabled()) {
        separator.parentBounds((title.enabled() || content.enabled()) ? result : null);
        separatorBounds = separator.getContentBounds();
        result.width = tooltipPixelWidth || Math.max(result.width, separatorBounds.width);
        if (!heightIsSet)
          result.height += separatorBounds.height;
      }
    }

    result = this.padding().widenBounds(result);
    if (widthIsSet) {
      result.width = tooltipPixelWidth;
    }

    if (heightIsSet) {
      result.height = tooltipPixelHeight;
    }

    result.left = 0;
    result.top = 0;

    this.contentBounds_ = result;

    title.resumeSignalsDispatching(false);
    separator.resumeSignalsDispatching(false);
    content.resumeSignalsDispatching(false);
  }
};


/**
 * Calculate tooltip position and cache it to this.instantPosition_.
 * @private
 */
anychart.core.ui.Tooltip.prototype.calculatePosition_ = function() {
  this.calculateContentBounds_();

  if (!this.instantPosition_) {
    var anch = /** @type {anychart.enums.Anchor} */ (this.getOption('anchor'));
    var isHtml = this.getOption('useHtml');

    var offsetX = isHtml ? 0 : /** @type {number} */ (this.getOption('offsetX'));
    var offsetY = isHtml ? 0 : /** @type {number} */ (this.getOption('offsetY'));
    var mBox = isHtml ? this.htmlTooltip.getMarginBox() : new goog.math.Box(0, 0, 0, 0);

    var x = /** @type {number} */ (this.getOption('x'));
    var y = /** @type {number} */ (this.getOption('y'));

    var position = new goog.math.Coordinate(x, y);
    anychart.utils.applyOffsetByAnchor(position, anch, offsetX + mBox.left, offsetY + mBox.top);

    var anchor = anychart.utils.getCoordinateByAnchor(this.contentBounds_, anch);
    position.x -= anchor.x;
    position.y -= anchor.y;
    this.instantPosition_ = position;
  }
};


/**
 *
 * @param {anychart.core.ui.Tooltip} tooltip
 * @param {number} clientX
 * @param {number} clientY
 * @param {anychart.core.series.Base|anychart.treemapModule.Chart=} opt_series
 * @private
 */
anychart.core.ui.Tooltip.prototype.setPositionForSeparated_ = function(tooltip, clientX, clientY, opt_series) {
  var x = clientX;
  var y = clientY;

  var chartPixelBounds, position, anchoredPositionCoordinate;
  var positionMode = this.getOption('positionMode') || anychart.enums.TooltipPositionMode.FLOAT;

  var displayMode = this.getOption('displayMode');
  var boundsProvider = this.chart() || this.containerProvider();
  var pixelBoundsInStage = boundsProvider.getPixelBounds();

  var stage = this.containerProvider_.container().getStage();
  var stageBounds = stage.getBounds();
  var stageOffset = stage.getClientPosition();
  var useGlobalCont = tooltip.useGlobalContainer_();

  if (positionMode == anychart.enums.TooltipPositionMode.FLOAT) {
    x = useGlobalCont ? clientX : clientX - stageOffset.x;
    y = useGlobalCont ? clientY : clientY - stageOffset.y;
  } else if (positionMode == anychart.enums.TooltipPositionMode.POINT) {
    position = displayMode == anychart.enums.TooltipDisplayMode.UNION ? this.getOption('position') : tooltip.getOption('position');
    var positionProvider = opt_series.createPositionProvider(/** @type {anychart.enums.Position} */(position), true)['value'];
    x = useGlobalCont ? positionProvider['x'] + stageOffset.x : positionProvider['x'];
    y = useGlobalCont ? positionProvider['y'] + stageOffset.y : positionProvider['y'];
  } else if (positionMode == anychart.enums.TooltipPositionMode.CHART) {
    chartPixelBounds = this.chart().getPixelBounds();
    position = displayMode == anychart.enums.TooltipDisplayMode.UNION ? this.getOption('position') : tooltip.getOption('position');
    anchoredPositionCoordinate = anychart.utils.getCoordinateByAnchor(chartPixelBounds, /** @type {anychart.enums.Position} */(position));
    x = anchoredPositionCoordinate.x + (useGlobalCont ? stageOffset.x : 0);
    y = anchoredPositionCoordinate.y + (useGlobalCont ? stageOffset.y : 0);
  }

  this.limitPosition_(tooltip, x, y, stageOffset, stageBounds, pixelBoundsInStage);
};


/**
 * @param {anychart.core.ui.Tooltip} tooltip - .
 * @return {acgraph.vector.ILayer|anychart.core.VisualBase} - .
 * @private
 */
anychart.core.ui.Tooltip.prototype.getContainer_ = function(tooltip) {
  var container = null;
  if (tooltip.containerProvider()) {
    container = tooltip.containerProvider().container();
  } else if (tooltip.chart()) {
    container = tooltip.chart().container();
  } else if (tooltip.parent()) {
    tooltip = this.getTooltipParent_(tooltip);
    if (tooltip.containerProvider()) {
      container = tooltip.containerProvider().container();
    } else if (tooltip.chart()) {
      container = tooltip.chart().container();
    }
  }
  return container;
};


/**
 * @param {anychart.core.ui.Tooltip} tooltip
 * @return {anychart.core.ui.Tooltip}
 * @private
 */
anychart.core.ui.Tooltip.prototype.getTooltipParent_ = function(tooltip) {
  while (tooltip.parent()) {
    tooltip = tooltip.parent();
  }
  return tooltip;
};


/**
 * Correctly processes the tooltip's container setup also resolves bug with Safari 5.1.7
 * @param {anychart.core.ui.Tooltip} tooltip
 * @private
 */
anychart.core.ui.Tooltip.prototype.setContainerToTooltip_ = function(tooltip) {
  if (tooltip.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    var tc;
    if (tooltip.useGlobalContainer_() || acgraph.type() == acgraph.StageType.VML) {
      if (tooltip.getOption('useHtml')) {
        tooltip.htmlTooltip.container(anychart.document.body);
      } else {
        tc = anychart.core.utils.GlobalTooltipContainer.getInstance();
        if (this.tooltipContainer_ && this.tooltipContainer_.isLocal())
          tooltip.tooltipContainer_.container(null);
        tooltip.tooltipContainer_ = tc;
        tooltip.tooltipContainer_.container(goog.dom.getDocument().body);
        tc.allocTooltip(tooltip);
        tooltip.getRootLayer_().parent(/** @type {acgraph.vector.ILayer} */ (tooltip.container()));
      }
      tooltip.markConsistent(anychart.ConsistencyState.CONTAINER);
    } else {
      var container = this.getContainer_(tooltip);
      if (container) {
        var stage = container.getStage();
        var wrapper = stage.getDomWrapper();

        if (tooltip.getOption('useHtml')) {
          tooltip.htmlTooltip.container(wrapper);
        } else {
          var stageUid = tooltip.getCurrentStageUid_();
          tc = anychart.utils.tooltipContainersRegistry[stageUid];
          if (!tc) {
            tc = new anychart.core.utils.LocalTooltipContainer();
            anychart.utils.tooltipContainersRegistry[stageUid] = tc;
          }
          tooltip.tooltipContainer_ = tc;
          tooltip.getRootLayer_().parent(/** @type {acgraph.vector.ILayer} */ (tooltip.container()));
          tc.container(wrapper);
          tc.allocTooltip(tooltip);
        }
        tooltip.markConsistent(anychart.ConsistencyState.CONTAINER);
      }

    }
  }
};


/**
 * Create triangle trajectory for selectable.
 * @param {number} x3
 * @param {number} y3
 * @return {?Array.<number>}
 * @private
 */
anychart.core.ui.Tooltip.prototype.createTriangle_ = function(x3, y3) {
  var pixelBounds = this.getPixelBounds();
  var x1, x2, y1, y2;

  // shift for boundary position
  var shift = 2;

  if (x3 < pixelBounds.getLeft()) {
    if (y3 < pixelBounds.getTop()) {
      x1 = pixelBounds.getRight();
      x2 = pixelBounds.getLeft();
      y1 = pixelBounds.getTop();
      y2 = pixelBounds.getBottom();

      y3 -= shift;

    } else if (y3 > pixelBounds.getBottom()) {
      x1 = pixelBounds.getLeft();
      x2 = pixelBounds.getRight();
      y1 = pixelBounds.getTop();
      y2 = pixelBounds.getBottom();

      y3 += shift;

    } else {
      x1 = x2 = pixelBounds.getLeft() + shift;
      y1 = pixelBounds.getTop();
      y2 = pixelBounds.getBottom();

      x3 -= shift;
    }

  } else if (x3 > pixelBounds.getRight()) {
    if (y3 < pixelBounds.getTop()) {
      x1 = pixelBounds.getRight();
      x2 = pixelBounds.getLeft();
      y1 = pixelBounds.getBottom();
      y2 = pixelBounds.getTop();

      y3 -= shift;

    } else if (y3 > pixelBounds.getBottom()) {
      x1 = pixelBounds.getLeft();
      x2 = pixelBounds.getRight();
      y1 = pixelBounds.getBottom();
      y2 = pixelBounds.getTop();

      y3 += shift;

    } else {
      x1 = x2 = pixelBounds.getRight() - shift;
      y1 = pixelBounds.getTop();
      y2 = pixelBounds.getBottom();

      x3 += shift;
    }

  } else {
    if (y3 < pixelBounds.getTop()) {
      y1 = y2 = pixelBounds.getTop() + shift;
      x1 = pixelBounds.getRight();
      x2 = pixelBounds.getLeft();

      y3 -= shift;

    } else if (y3 > pixelBounds.getBottom()) {
      y1 = y2 = pixelBounds.getBottom() - shift;
      x1 = pixelBounds.getLeft();
      x2 = pixelBounds.getRight();

      y3 += shift;

    } else {
      return null;
    }
  }

  this.triangle_ = [x1, y1, x2, y2, x3, y3];
  return this.triangle_;
};


/**
 * @param {goog.events.BrowserEvent} event
 * @private
 */
anychart.core.ui.Tooltip.prototype.movementOutsideThePoint_ = function(event) {
  if (this.isInTriangle_(event['clientX'], event['clientY'])) {
    if (!this.tooltipContainer_.isLocal())
      this.tooltipContainer_.selectable(true);
  } else {
    goog.events.unlisten(goog.dom.getDocument(), goog.events.EventType.MOUSEMOVE, this.movementOutsideThePoint_, false, this);
    var domElement = this.getRootLayer_().domElement();
    if (domElement) {
      goog.events.unlisten(domElement, goog.events.EventType.MOUSEENTER, this.tooltipEnter_, false, this);
      goog.events.unlisten(domElement, goog.events.EventType.MOUSELEAVE, this.tooltipLeave_, false, this);
    }
    this.hideSelectable_(event);
  }
};


/**
 * Cursor is in triangle trajectory to tooltip.
 * @param {number} clientX
 * @param {number} clientY
 * @return {boolean}
 * @private
 */
anychart.core.ui.Tooltip.prototype.isInTriangle_ = function(clientX, clientY) {
  if (!this.triangle_) return false;

  var x1 = this.triangle_[0];
  var y1 = this.triangle_[1];
  var x2 = this.triangle_[2];
  var y2 = this.triangle_[3];
  var x3 = this.triangle_[4];
  var y3 = this.triangle_[5];

  var orientation1 = anychart.math.isPointOnLine(x1, y1, x2, y2, clientX, clientY);
  var orientation2 = anychart.math.isPointOnLine(x2, y2, x3, y3, clientX, clientY);
  var orientation3 = anychart.math.isPointOnLine(x3, y3, x1, y1, clientX, clientY);

  return (orientation1 == orientation2) && (orientation2 == orientation3);
};


/**
 * @private
 */
anychart.core.ui.Tooltip.prototype.tooltipEnter_ = function() {
  goog.events.unlisten(goog.dom.getDocument(), goog.events.EventType.MOUSEMOVE, this.movementOutsideThePoint_, false, this);
  if (this.getRootLayer_().domElement())
    goog.events.unlisten(this.getRootLayer_().domElement(), goog.events.EventType.MOUSEENTER, this.tooltipEnter_, false, this);
  this.triangle_ = null;
};


/**
 * @param {goog.events.BrowserEvent} event
 * @private
 */
anychart.core.ui.Tooltip.prototype.tooltipLeave_ = function(event) {
  if (this.getRootLayer_().domElement())
    goog.events.unlisten(this.getRootLayer_().domElement(), goog.events.EventType.MOUSELEAVE, this.tooltipLeave_, false, this);
  this.hideSelectable_(event);
};


/**
 * Hide the tooltip with delay (if specified). Used for selectable mode.
 * @param {goog.events.BrowserEvent} event
 * @return {boolean|undefined}
 * @private
 */
anychart.core.ui.Tooltip.prototype.hideSelectable_ = function(event) {
  var browserEvent = event.getBrowserEvent();
  // Right button - show context menu
  if (browserEvent.buttons == 2) {
    return true;
  }

  if (!this.tooltipContainer_.isLocal())
    this.tooltipContainer_.selectable(false);

  if (this.getRootLayer_().domElement())
    goog.events.unlisten(this.getRootLayer_().domElement(), goog.events.EventType.MOUSELEAVE, this.hideSelectable_, false, this);
  this.triangle_ = null;

  if (!this.getOption('hideDelay')) {
    this.hide(true);
  } else {
    this.createDelayObject_();
    if (!this.delay_.isActive()) this.delay_.start();
  }
};


/**
 * Gets current stage's uid.
 * @return {string}
 * @private
 */
anychart.core.ui.Tooltip.prototype.getCurrentStageUid_ = function() {
  var cont = this.getContainer_(this);
  var stage = cont.getStage();
  return 'stg' + goog.getUid(stage);
};


//endregion
//region -- Parental relations.
//----------------------------------------------------------------------------------------------------------------------
//
//  Parental relations.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Gets/sets parent tooltip.
 * @param {anychart.core.ui.Tooltip=} opt_value - Parent to set.
 * @return {anychart.core.ui.Tooltip}
 */
anychart.core.ui.Tooltip.prototype.parent = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.parent_ != opt_value) {
      var uid = String(goog.getUid(this));
      if (goog.isNull(opt_value)) { //removing parent tooltip.
        //this.parent_ is not null here.
        this.parent_.unlistenSignals(this.parentInvalidated_, this);
        this.title().parent(null);
        this.separator().parent(null);
        this.background().parent(null);
        this.padding().parent(null);
        this.contentInternal().parent(null);
        this.contentInternal().padding().parent(null);
        delete this.parent_.childTooltipsMap[uid];
        this.parent_ = null;
      } else {
        if (this.parent_)
          this.parent_.unlistenSignals(this.parentInvalidated_, this);
        this.parent_ = opt_value;
        this.title().dropThemes().parent(this.parent_.title());
        this.separator().dropThemes().parent(this.parent_.separator());
        this.background().dropThemes().parent(this.parent_.background());
        this.padding().parent(this.parent_.padding());
        this.contentInternal().parent(this.parent_.contentInternal());
        this.contentInternal().padding().parent(this.parent_.contentInternal().padding());
        this.parent_.childTooltipsMap[uid] = this;
        this.beforeUseHtmlHook();
        this.parent_.listenSignals(this.parentInvalidated_, this);
      }
      //TODO (A.Kudryavtsev): Do we really need this invalidation?
      // this.invalidate(anychart.core.ui.Tooltip.TOOLTIP_BOUNDS_STATE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.parent_;
};


/**
 * Parent invalidation handler.
 * @param {anychart.SignalEvent} e - Signal event.
 * @private
 */
anychart.core.ui.Tooltip.prototype.parentInvalidated_ = function(e) {
  var state = 0;
  var signal = 0;

  this.beforeUseHtmlHook();
  if (e.hasSignal(anychart.Signal.BOUNDS_CHANGED) || e.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    state |= anychart.core.ui.Tooltip.TOOLTIP_BOUNDS_STATE;
    signal |= anychart.Signal.BOUNDS_CHANGED;
    this.resetBoundsCache();
  }

  if (e.hasSignal(anychart.Signal.ENABLED_STATE_CHANGED)) {
    state |= anychart.ConsistencyState.ENABLED;
    signal |= anychart.Signal.NEEDS_REDRAW;
  }

  this.resolutionChainCache_ = null;
  this.invalidate(state, signal);
};


//endregion
//region -- IObjectWithSettings impl
//----------------------------------------------------------------------------------------------------------------------
//
//  IObjectWithSettings impl
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.ui.Tooltip.prototype.hasOwnOption = function(name) {
  return goog.isDefAndNotNull(this.ownSettings[name]);
};


/**
 * @override
 * @param {string} name
 * @return {*}
 */
anychart.core.ui.Tooltip.prototype.getOption = anychart.core.settings.getOption;


/** @inheritDoc */
anychart.core.ui.Tooltip.prototype.check = function(flags) {
  if (goog.isDef(flags)) {
    return !!(flags & this.capability);
  }
  return true;
};


//endregion
//region -- HTML treating.
/**
 * 'useHtml' before invalidation hook.
 */
anychart.core.ui.Tooltip.prototype.beforeUseHtmlHook = function() {
  if (this.getOption('useHtml')) {
    anychart.utils.installHtmlTooltipStyle();
    if (!this.htmlTooltip)
      this.htmlTooltip = new anychart.core.ui.HTMLTooltip(this);
  } else {
    if (this.htmlTooltip)
      this.htmlTooltip.remove();
  }
  for (var key in this.childTooltipsMap) {
    this.childTooltipsMap[key].beforeUseHtmlHook();
  }
  this.contentBounds_ = null;
  this.instantPosition_ = null;
};


/**
 * @param {Object} context
 */
anychart.core.ui.Tooltip.prototype.onDomReadyInternal = function(context) {
  var onDomReady = this.getOption('onDomReady');
  if (goog.isFunction(onDomReady)) {
    onDomReady.call(context);
  }
};


/**
 * @param {Object} context
 * @return {boolean}
 */
anychart.core.ui.Tooltip.prototype.onBeforeTitleChangeInternal = function(context) {
  var onBeforeTitleChange = this.getOption('onBeforeTitleChange');
  return goog.isFunction(onBeforeTitleChange) ? onBeforeTitleChange.call(context) : true;
};


/**
 * @param {Object} context
 */
anychart.core.ui.Tooltip.prototype.onTitleChangedInternal = function(context) {
  var onTitleChanged = this.getOption('onTitleChanged');
  if (goog.isFunction(onTitleChanged)) {
    onTitleChanged.call(context);
  }
};


/**
 * @param {Object} context
 * @return {boolean}
 */
anychart.core.ui.Tooltip.prototype.onBeforeContentChangeInternal = function(context) {
  var onBeforeContentChange = this.getOption('onBeforeContentChange');
  return goog.isFunction(onBeforeContentChange) ? onBeforeContentChange.call(context) : true;
};


/**
 * @param {Object} context
 */
anychart.core.ui.Tooltip.prototype.onContentChangedInternal = function(context) {
  var onContentChanged = this.getOption('onContentChanged');
  if (goog.isFunction(onContentChanged)) {
    onContentChanged.call(context);
  }
};


//endregion
//region -- IResolvable implementation
/** @inheritDoc */
anychart.core.ui.Tooltip.prototype.resolutionChainCache = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.resolutionChainCache_ = opt_value;
  }
  return this.resolutionChainCache_;
};


/** @inheritDoc */
anychart.core.ui.Tooltip.prototype.getResolutionChain = function() {
  /*
    This override allows to use this.middleFormats_ settings object (@see anychart.core.ui.Tooltip.prototype.setMiddleFormats).
   */
  var chain = this.resolutionChainCache();
  if (!chain) {
    chain = goog.array.concat(this.getHighPriorityResolutionChain(), [this.middleFormats_], this.getLowPriorityResolutionChain());
    this.resolutionChainCache(chain);
  }
  return chain;
};


/** @inheritDoc */
anychart.core.ui.Tooltip.prototype.getLowPriorityResolutionChain = function() {
  var sett = [this.themeSettings];
  if (this.parent_) {
    sett = goog.array.concat(sett, this.parent_.getLowPriorityResolutionChain());
  }
  return sett;
};


/** @inheritDoc */
anychart.core.ui.Tooltip.prototype.getHighPriorityResolutionChain = function() {
  var sett = [this.ownSettings];
  if (this.parent_) {
    sett = goog.array.concat(sett, this.parent_.getHighPriorityResolutionChain());
  }
  return sett;
};


//endregion
//region -- Serialization / Deserialization / Disposing
//----------------------------------------------------------------------------------------------------------------------
//
//  Serialization / Deserialization / Disposing
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Sets theme settings.
 * @param {!Object} config
 */
anychart.core.ui.Tooltip.prototype.setThemeSettings = function(config) {
  anychart.core.settings.copy(this.themeSettings, this.TEXT_PROPERTY_DESCRIPTORS, config);
  anychart.core.settings.copy(this.themeSettings, this.TOOLTIP_SIMPLE_DESCRIPTORS, config);
};


/** @inheritDoc */
anychart.core.ui.Tooltip.prototype.serialize = function() {
  var json = anychart.core.ui.Tooltip.base(this, 'serialize');

  anychart.core.settings.serialize(this, this.TEXT_PROPERTY_DESCRIPTORS, json, void 0, void 0, true);
  anychart.core.settings.serialize(this, this.TOOLTIP_SIMPLE_DESCRIPTORS, json, void 0, void 0, true);

  delete json['x'];
  delete json['y'];
  delete json['zIndex'];

  var titleConfig = this.title().serialize();
  if (!goog.object.isEmpty(titleConfig))
    json['title'] = titleConfig;

  var separatorConfig = this.separator().serialize();
  if (!goog.object.isEmpty(separatorConfig))
    json['separator'] = separatorConfig;

  var bgConfig = this.background().serialize();
  if (!goog.object.isEmpty(bgConfig))
    json['background'] = bgConfig;

  var paddingConfig = this.padding().ownSettings;
  if (!goog.object.isEmpty(paddingConfig))
    json['padding'] = paddingConfig;

  return json;
};


/** @inheritDoc */
anychart.core.ui.Tooltip.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.ui.Tooltip.base(this, 'setupByJSON', config, opt_default);

  anychart.core.settings.deserialize(this, this.TEXT_PROPERTY_DESCRIPTORS, config, opt_default);
  anychart.core.settings.deserialize(this, this.TOOLTIP_SIMPLE_DESCRIPTORS, config, opt_default);

  this.title().setupInternal(!!opt_default, config['title']);
  this.separator().setupInternal(!!opt_default, config['separator']);
  this.background().setupInternal(!!opt_default, config['background']);
  this.padding().setupInternal(!!opt_default, config['padding']);

  var contentConfig = config['contentInternal'] || {};
  contentConfig['position'] = contentConfig['position'] ? contentConfig['position'] : anychart.enums.Position.LEFT_TOP;
  contentConfig['anchor'] = contentConfig['anchor'] ? contentConfig['anchor'] : anychart.enums.Anchor.LEFT_TOP;
  this.contentInternal(contentConfig);
};


/** @inheritDoc */
anychart.core.ui.Tooltip.prototype.disposeInternal = function() {
  delete this.ownSettings;
  delete this.themeSettings;

  if (this.parent_) {
    var uid = String(goog.getUid(this));
    this.parent_.unlistenSignals(this.parentInvalidated_, this);
    delete this.parent_.childTooltipsMap[uid];
  }

  for (var key in this.childTooltipsMap) {
    var childTooltip = this.childTooltipsMap[key];
    if (childTooltip)
      goog.dispose(childTooltip);
  }

  if (this.tooltipContainer_ && !this.tooltipContainer_.isLocal())
    this.tooltipContainer_.release(this);

  goog.disposeAll(this.title_, this.separator_, this.content_, this.background_, this.padding_, this.rootLayer_, this.delay_, this.htmlTooltip);

  this.title_ = null;
  this.separator_ = null;
  this.content_ = null;
  this.background_ = null;
  this.padding_ = null;
  this.rootLayer_ = null;
  this.delay_ = null;
  this.htmlTooltip = null;

  if (this.tooltipContainer_ && this.tooltipContainer_.isLocal() && this.getContainer_(this)) {
    var allowDisposing = true;
    for (var key in anychart.utils.tooltipsRegistry) {
      if (anychart.utils.tooltipsRegistry.hasOwnProperty(key)) {
        var tooltip = anychart.utils.tooltipsRegistry[key];
        if (tooltip != this && this.tooltipContainer_ == tooltip.getTooltipContainer()) {
          allowDisposing = false;
          break;
        }
      }
    }

    if (allowDisposing) {
      var stageUid = this.getCurrentStageUid_();
      delete anychart.utils.tooltipContainersRegistry[stageUid];
      goog.dispose(this.tooltipContainer_);
    }
  }

  delete this.tooltipContainer_;

  delete anychart.utils.tooltipsRegistry[String(goog.getUid(this))];

  anychart.core.ui.Tooltip.base(this, 'disposeInternal');
};


//exports
(function() {
  var proto = anychart.core.ui.Tooltip.prototype;
  proto['title'] = proto.title;
  proto['separator'] = proto.separator;
  proto['background'] = proto.background;
  proto['padding'] = proto.padding;
  proto['hide'] = proto.hide;
  proto['textSettings'] = proto.textSettings;
  // auto generated
  // proto['useHtml'] = proto.useHtml;
  // proto['width'] = proto.width;
  // proto['height'] = proto.height;
  // proto['titleFormat'] = proto.titleFormat;
  // proto['format'] = proto.format;
  // proto['unionFormat'] = proto.unionFormat;
  // proto['valuePrefix'] = proto.valuePrefix;
  // proto['valuePostfix'] = proto.valuePostfix;
  // proto['position'] = proto.position;
  // proto['anchor'] = proto.anchor;
  // proto['offsetX'] = proto.offsetX;
  // proto['offsetY'] = proto.offsetY;
  // proto['allowLeaveScreen'] = proto.allowLeaveScreen;
  // proto['allowLeaveChart'] = proto.allowLeaveChart;
  // proto['allowLeaveStage'] = proto.allowLeaveStage;
  // proto['displayMode'] = proto.displayMode;
  // proto['positionMode'] = proto.positionMode;
  // proto['onDomReady'] = proto.onDomReady;
  // proto['onBeforeTitleChange'] = proto.onBeforeTitleChange;
  // proto['onTitleChanged'] = proto.onTitleChanged;
  // proto['onBeforeContentChange'] = proto.onBeforeContentChange;
  // proto['onContentChanged'] = proto.onContentChanged
  // proto['hideDelay'] = proto.hideDelay;
})();
//endregion
