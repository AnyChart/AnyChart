goog.provide('anychart.core.ui.NewButton');
goog.require('anychart.core.StateSettings');
goog.require('anychart.core.VisualBase');
goog.require('anychart.core.ui.Background');
goog.require('anychart.core.utils.Padding');
goog.require('anychart.math.Rect');



/**
 * Button class.
 * @constructor
 * @extends {anychart.core.VisualBase}
 */
anychart.core.ui.NewButton = function() {
  anychart.core.ui.NewButton.base(this, 'constructor');

  this.addThemes('defaultButtonSettings');

  /**
   * @type {anychart.SettingsState}
   * @private
   */
  this.state_ = anychart.SettingsState.NORMAL;

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, anychart.core.ui.NewButton.OWN_DESCRIPTORS_META);

  this.createStateSettings();
  this.createResolveChainMap();
};
goog.inherits(anychart.core.ui.NewButton, anychart.core.VisualBase);


//region --- States/Signals
/** @inheritDoc */
anychart.core.ui.NewButton.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.VisualBase.prototype.SUPPORTED_CONSISTENCY_STATES | //ENABLED CONTAINER BOUNDS Z_INDEX
    anychart.ConsistencyState.APPEARANCE |
    anychart.ConsistencyState.BUTTON_BACKGROUND |
    anychart.ConsistencyState.BUTTON_CURSOR;


/** @inheritDoc */
anychart.core.ui.NewButton.prototype.SUPPORTED_SIGNALS =
    anychart.core.VisualBase.prototype.SUPPORTED_SIGNALS;


//endregion
//region --- Style states
/**
 * Normal state settings.
 * @param {Object=} opt_value
 * @return {anychart.core.StateSettings|anychart.core.ui.NewButton}
 */
anychart.core.ui.NewButton.prototype.normal = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.normal_.setup(opt_value);
    return this;
  }
  return this.normal_;
};


/**
 * Hovered state settings.
 * @param {Object=} opt_value
 * @return {anychart.core.StateSettings|anychart.core.ui.NewButton}
 */
anychart.core.ui.NewButton.prototype.hovered = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.hovered_.setup(opt_value);
    return this;
  }
  return this.hovered_;
};


/**
 * Pushed state settings.
 * @param {Object=} opt_value
 * @return {anychart.core.StateSettings|anychart.core.ui.NewButton}
 */
anychart.core.ui.NewButton.prototype.selected = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.selected_.setup(opt_value);
    return this;
  }
  return this.selected_;
};


//endregion
//region --- Interactivity / Event handling
/**
 * @param {anychart.SettingsState=} opt_value
 * @return {anychart.core.ui.NewButton|anychart.SettingsState|number}
 */
anychart.core.ui.NewButton.prototype.state = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.state_ != opt_value) {
      this.state_ = opt_value;
      this.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.state_;
};


/**
 * Helper that checks hovered state.
 * @return {boolean}
 */
anychart.core.ui.NewButton.prototype.isHovered = function() {
  return this.state_ == anychart.SettingsState.HOVERED;
};


/**
 * Helper that checks selected state.
 * @return {boolean}
 */
anychart.core.ui.NewButton.prototype.isSelected = function() {
  return this.state_ == anychart.SettingsState.SELECTED;
};


/**
 * Handler for mouse over.
 * @param {acgraph.events.BrowserEvent} event Event
 */
anychart.core.ui.NewButton.prototype.handleMouseOver = function(event) {
  if (!this.isSelected() && this.handleBrowserEvent(event))
    this.state(anychart.SettingsState.HOVERED);
};


/**
 * Handler for mouse out.
 * @param {acgraph.events.BrowserEvent} event Event
 */
anychart.core.ui.NewButton.prototype.handleMouseOut = function(event) {
  if (!this.isSelected() && this.handleBrowserEvent(event))
    this.state(anychart.SettingsState.NORMAL);
};


/**
 * Handler for mouse click.
 * @param {acgraph.events.BrowserEvent} event Event
 */
anychart.core.ui.NewButton.prototype.handleMouseClick = function(event) {
  if (this.handleBrowserEvent(event)) {
    this.toggleButtonState();
  }
};


/**
 * Toggles button state between SELECTED and NORMAL (HOVERED, cause after click mouse will be on button);
 */
anychart.core.ui.NewButton.prototype.toggleButtonState = function() {
  this.isSelected() ? this.state(anychart.SettingsState.HOVERED) : this.state(anychart.SettingsState.SELECTED);
};


//endregion
//region --- Properties
/**
 * Button padding.
 * @param {(string|number|Array.<number|string>|{top:(number|string),left:(number|string),bottom:(number|string),right:(number|string)})=} opt_spaceOrTopOrTopAndBottom Space object or top or top and bottom
 *    space.
 * @param {(string|number)=} opt_rightOrRightAndLeft Right or right and left space.
 * @param {(string|number)=} opt_bottom Bottom space.
 * @param {(string|number)=} opt_left Left space.
 * @return {!(anychart.core.ui.NewButton|anychart.core.utils.Padding)} Padding or self for method chaining.
 */
anychart.core.ui.NewButton.prototype.padding = function(opt_spaceOrTopOrTopAndBottom, opt_rightOrRightAndLeft, opt_bottom, opt_left) {
  if (!this.padding_) {
    this.padding_ = new anychart.core.utils.Padding();
    this.padding_.listenSignals(this.paddingInvalidated_, this);
  }
  if (goog.isDef(opt_spaceOrTopOrTopAndBottom)) {
    this.padding_.setup.apply(this.padding_, arguments);
    return this;
  }
  return this.padding_;
};


/**
 * Padding invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.core.ui.NewButton.prototype.paddingInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.BOUNDS,
        anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
  }
};


/**
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.core.ui.NewButton.OWN_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  anychart.core.settings.createDescriptors(map, [
    anychart.core.settings.descriptors.CURSOR,
    anychart.core.settings.descriptors.WIDTH,
    anychart.core.settings.descriptors.HEIGHT
  ]);

  return map;
})();
anychart.core.settings.populate(anychart.core.ui.NewButton, anychart.core.ui.NewButton.OWN_DESCRIPTORS);


/**
 * @const {!Array.<Array>}
 */
anychart.core.ui.NewButton.OWN_DESCRIPTORS_META = ([
  ['cursor', anychart.ConsistencyState.BUTTON_CURSOR, anychart.Signal.NEEDS_REDRAW],
  ['width', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW],
  ['height', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW]
]);


/**
 * @const {!Array.<Array>}
 */
anychart.core.ui.NewButton.STATE_DESCRIPTORS_OVERRIDE = anychart.core.settings.createTextPropertiesDescriptorsTemplate();


/**
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptorMeta>}
 */
anychart.core.ui.NewButton.STATE_DESCRIPTORS_META_NORMAL = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptorMeta>} */
  var map = {};
  anychart.core.settings.createDescriptorsMeta(map, [
    ['background', 0, 0],// anychart.ConsistencyState.BUTTON_BACKGROUND, anychart.Signal.NEEDS_REDRAW],
    ['content', anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW]
  ]);
  anychart.core.settings.createTextPropertiesDescriptorsMeta(
      map,
      anychart.ConsistencyState.BOUNDS | anychart.ConsistencyState.APPEARANCE,
      anychart.ConsistencyState.APPEARANCE,
      anychart.Signal.NEEDS_REDRAW,
      anychart.Signal.NEEDS_REDRAW);
  return map;
})();
anychart.core.settings.populateAliases(anychart.core.ui.NewButton, goog.object.getKeys(anychart.core.ui.NewButton.STATE_DESCRIPTORS_META_NORMAL), 'normal');


//endregion
//region --- Drawing
/**
 * Prepare drawable entities.
 */
anychart.core.ui.NewButton.prototype.prepareDrawable = function() {
  if (!this.rootLayer) {
    this.rootLayer = acgraph.layer();

    // drawable background
    this.background_ = new anychart.core.ui.Background();
    this.background_.setupInternal(true, this.resolveOption('background'));
    this.background_.zIndex(0);
    this.background_.container(this.rootLayer);
    this.background_.setParentEventTarget(this);

    // rect for intercepting events
    this.hoverRect_ = this.rootLayer.rect()
        .stroke(null)
        .fill(anychart.color.TRANSPARENT_HANDLER)
        .zIndex(999);

    this.bindHandlersToGraphics(/** @type {acgraph.vector.Rect} */ (this.hoverRect_),
        this.handleMouseOver,   // mouse over handler
        this.handleMouseOut,    // mouse out handler
        this.handleMouseClick,  // mouse click handler
        null);                  // mouse move handler
  }

  if (!this.textElement_)
    this.textElement_ = /** @type {acgraph.vector.Text} */(acgraph.text().zIndex(1));
  if (!this.element_)
    this.element_ = /** @type {acgraph.vector.Path} */ (acgraph.path().zIndex(1).stroke(null).fill(null));

  var content = this.resolveOption('content');
  this.isTextContent = goog.isString(content) || goog.isNumber(content);
  this.isFunction = goog.isFunction(content);

  // there is only one drawable - this.textElement_ or this.element_
  // remove content from button root layer
  this.element_.parent(null);
  this.textElement_.parent(null);

  // set parent for element depending on content type
  if (this.isTextContent) {
    this.textElement_.parent(this.rootLayer);
  } else if (this.isFunction) {
    this.drawFunction = content;
    this.element_.parent(this.rootLayer);
  }
};


/** @inheritDoc */
anychart.core.ui.NewButton.prototype.remove = function() {
  if (this.rootLayer)
    this.rootLayer.parent(null);
};


/**
 * Draws button.
 * @return {anychart.core.ui.NewButton}
 */
anychart.core.ui.NewButton.prototype.draw = function() {
  if (!this.checkDrawingNeeded())
    return this;

  this.suspendSignalsDispatching();

  this.prepareDrawable();

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    this.rootLayer.parent(/** @type {acgraph.vector.ILayer} */(this.container()));
    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    this.rootLayer.zIndex(/** @type {number} */(this.zIndex()));
    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.BUTTON_CURSOR)) {
    this.hoverRect_.cursor(this.getOption('cursor'));
    this.markConsistent(anychart.ConsistencyState.BUTTON_CURSOR);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    if (this.isTextContent)
      this.applyTextSettings();
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    this.calculateBounds();
    this.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.BUTTON_BACKGROUND);
    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    if (this.isTextContent)
      this.drawText();
    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.BUTTON_BACKGROUND)) {
    this.drawBackground();
    this.markConsistent(anychart.ConsistencyState.BUTTON_BACKGROUND);
  }
  this.resumeSignalsDispatching(false);
  return this;
};


/**
 * Check the dimensions.
 * Return values are:
 * -1 means that bounds are smaller that compareBounds
 *  0 means that bounds are the same as compareBounds
 *  1 means that bounds are greater that compareBounds
 * @param {number} width
 * @param {number} height
 * @param {number} compareWidth
 * @param {number} compareHeight
 * @return {number}
 * @private
 */
anychart.core.ui.NewButton.prototype.check_ = function(width, height, compareWidth, compareHeight) {
  var adjustFontSize = this.resolveOption('adjustFontSize');
  if (adjustFontSize) {
    if (adjustFontSize.width && adjustFontSize.height) {
      if (width > compareWidth || height > compareHeight) {
        return 1;
      } else if (width < compareWidth || height < compareHeight) {
        return -1;
      }
    } else if (adjustFontSize.width) {
      if (width > compareWidth) {
        return 1;
      } else if (width < compareWidth) {
        return -1;
      }
    } else if (adjustFontSize.height) {
      if (height > compareHeight) {
        return 1;
      } else if (height < compareHeight) {
        return -1;
      }
    }
  }

  return 0;
};


/**
 * Adjust font size by width/height.
 * @param {number} compareWidth
 * @param {number} compareHeight
 * @return {number}
 * @private
 */
anychart.core.ui.NewButton.prototype.calculateFontSize_ = function(compareWidth, compareHeight) {
  var minFontSize = /** @type {number} */ (this.resolveOption('minFontSize'));
  var maxFontSize = /** @type {number} */ (this.resolveOption('maxFontSize'));
  /** @type {number} */
  var fontSize = Math.round((maxFontSize + minFontSize) / 2);

  /** @type {number} */
  var from = minFontSize;

  /** @type {number} */
  var to = maxFontSize;

  /** @type {number} */
  var checked;

  var textBounds;

  var text = acgraph.text();
  text.attr('aria-hidden', 'true');
  this.applyTextSettings(text);

  // check if the maximal value is ok
  text.fontSize(/** @type {number} */ (maxFontSize));
  textBounds = text.getBounds();

  checked = this.check_(textBounds.width, textBounds.height, compareWidth, compareHeight);
  if (checked <= 0) {
    return /** @type {number} */ (maxFontSize);
  }

  // set initial fontSize - that's half way between min and max
  text.fontSize(fontSize);
  textBounds = text.getBounds();

  // check sign
  var sign = checked = this.check_(textBounds.width, textBounds.height, compareWidth, compareHeight);

  // divide in half and iterate waiting for the sign to change
  while (from != to) {
    if (checked < 0) {
      from = Math.min(fontSize + 1, to);
      fontSize += Math.floor((to - fontSize) / 2);
    } else if (checked > 0) {
      to = Math.max(fontSize - 1, from);
      fontSize -= Math.ceil((fontSize - from) / 2);
    } else {
      break;
    }

    text.fontSize(fontSize);
    textBounds = text.getBounds();

    checked = this.check_(textBounds.width, textBounds.height, compareWidth, compareHeight);
    // sign changed if product is negative, 0 is an exit too
    if (sign * checked <= 0) {
      break;
    }
  }

  if (!checked) {
    // size is exactly ok for the bounds set
    goog.dispose(text);
    return fontSize;
  }

  // iterate increase/decrease font size until sign changes again
  do {
    fontSize += sign;
    text.fontSize(fontSize);
    textBounds = text.getBounds();
    checked = this.check_(textBounds.width, textBounds.height, compareWidth, compareHeight);
  } while (sign * checked < 0);

  goog.dispose(text);
  // decrease font size only if we've been increasing it - we are looking for size to fit in bounds
  // if (sign > 0) fontSize -= sign;
  return fontSize;
};


/**
 * Whether adjust font size enabled.
 * @return {boolean} is adjustment enabled.
 */
anychart.core.ui.NewButton.prototype.adjustEnabled = function() {
  var adjustFontSize = this.resolveOption('adjustFontSize');
  return /** @type {boolean} */ ((adjustFontSize && (adjustFontSize.width || adjustFontSize.height)));
};


/**
 *  Draws text.
 */
anychart.core.ui.NewButton.prototype.drawText = function() {
  if (this.adjustEnabled()) {
    var fontSize = this.calculateFontSize_(this.backgroundWidth, this.backgroundHeight);
    this.textElement_.fontSize(fontSize);
  }
  this.textElement_.x(this.textX);
  // if font size presented and it odd we deduct from y for better look of the text
  // this.textElement_.y(this.textY - (fontSize ? (fontSize % 2) ? 1 : 0 : 0));
  this.textElement_.y(this.textY - 1);
  this.textElement_.clip(this.backgroundBounds);
};


/**
 * Draws background.
 */
anychart.core.ui.NewButton.prototype.drawBackground = function() {
  this.background_.suspendSignalsDispatching();
  this.background_.parentBounds(this.backgroundBounds);
  this.background_.setupInternal(false, this.resolveOption('background'));
  this.background_.draw();
  this.background_.resumeSignalsDispatching(false);
};


//endregion
//region --- Infrastructure
/**
 * Listener for background invalidation.
 * @param {anychart.SignalEvent} event Invalidation event.
 * @private
 */
anychart.core.ui.NewButton.prototype.backgroundInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    var bg = /** @type {anychart.core.ui.Background} */(event.target);
    bg.markConsistent(anychart.ConsistencyState.ALL);
    this.dispatchSignal(anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 *  Create state settings.
 *  @protected
 */
anychart.core.ui.NewButton.prototype.createStateSettings = function() {
  /**
   * @type {Object.<anychart.core.StateSettings>}
   */
  this.stateToObjectMap = {};

  this.normal_ = new anychart.core.StateSettings(
      this,
      anychart.core.ui.NewButton.STATE_DESCRIPTORS_META_NORMAL,
      anychart.SettingsState.NORMAL,
      anychart.core.ui.NewButton.STATE_DESCRIPTORS_OVERRIDE);

  this.hovered_ = new anychart.core.StateSettings(
      this,
      anychart.core.ui.NewButton.STATE_DESCRIPTORS_META_NORMAL,
      anychart.SettingsState.HOVERED,
      anychart.core.ui.NewButton.STATE_DESCRIPTORS_OVERRIDE);

  this.selected_ = new anychart.core.StateSettings(
      this,
      anychart.core.ui.NewButton.STATE_DESCRIPTORS_META_NORMAL,
      anychart.SettingsState.SELECTED,
      anychart.core.ui.NewButton.STATE_DESCRIPTORS_OVERRIDE);

  this.stateToObjectMap[anychart.SettingsState.NORMAL] = this.normal_;
  this.stateToObjectMap[anychart.SettingsState.HOVERED] = this.hovered_;
  this.stateToObjectMap[anychart.SettingsState.SELECTED] = this.selected_;
};


/**
 * Creates chains to resolve options.
 */
anychart.core.ui.NewButton.prototype.createResolveChainMap = function() {
  var normal = this.stateToObjectMap[anychart.SettingsState.NORMAL];
  var hovered = this.stateToObjectMap[anychart.SettingsState.HOVERED];
  var selected = this.stateToObjectMap[anychart.SettingsState.SELECTED];

  /**
   * Object that contains resolution chains for simple properties depends on state.
   * @type {Object.<anychart.SettingsState, Array>}
   */
  this.stateToChainMap = {};

  this.stateToChainMap[anychart.SettingsState.NORMAL] = [
    normal.ownSettings,
    normal.themeSettings
  ];
  this.stateToChainMap[anychart.SettingsState.HOVERED] = [
    hovered.ownSettings,
    hovered.themeSettings,
    normal.ownSettings,
    normal.themeSettings
  ];
  this.stateToChainMap[anychart.SettingsState.SELECTED] = [
    selected.ownSettings,
    selected.themeSettings,
    normal.ownSettings,
    normal.themeSettings
  ];

  /**
   * Object that contains resolution chains for background property depends on state.
   * @type {Object.<anychart.SettingsState, Array>}
   */
  this.backgroundStateToChainMap = {};

  var normalBackground = normal['background']();
  var hoveredBackground = hovered['background']();
  var selectedBackground = selected['background']();

  this.backgroundStateToChainMap[anychart.SettingsState.NORMAL] = [
    normalBackground.themeSettings,
    normalBackground.ownSettings
  ];
  this.backgroundStateToChainMap[anychart.SettingsState.HOVERED] = [
    normalBackground.themeSettings,
    normalBackground.ownSettings,
    hoveredBackground.themeSettings,
    hoveredBackground.ownSettings
  ];
  this.backgroundStateToChainMap[anychart.SettingsState.SELECTED] = [
    normalBackground.themeSettings,
    normalBackground.ownSettings,
    selectedBackground.themeSettings,
    selectedBackground.ownSettings
  ];
};


/**
 * Called when anychart.core.settings.getOption method is called.
 * @return {Array} Resolution chain for current button state.
 */
anychart.core.ui.NewButton.prototype.getResolutionChain = function() {
  return this.stateToChainMap[this.state_];
};


/**
 * @param {string} name
 * @return {*}
 */
anychart.core.ui.NewButton.prototype.resolveOption = function(name) {
  var rv;
  if (name == 'background') {
    // Object that will contain final background settings.
    // Always create new one because goog.object.extend
    // modifies extendable object.
    rv = {};
    var chain = goog.array.concat(rv, this.backgroundStateToChainMap[this.state_]);
    goog.object.extend.apply(null, chain);
  } else {
    // this method exists for IResolvable interfaces,
    // but we use it without implementation because of
    // it's convenience. That's why so dirty-hack typecast - to fool compiler (^_^').
    // It will call getResolutionChain method that we implemented above.
    rv = anychart.core.settings.getOption.call(/** @type {anychart.core.settings.IResolvable} */ (this), name);
  }
  return rv;
};


/**
 * Applies text settings for text element.
 * @param {acgraph.vector.Text=} opt_textElement
 */
anychart.core.ui.NewButton.prototype.applyTextSettings = function(opt_textElement) {
  var textElement = opt_textElement || this.textElement_;
  textElement.color(this.resolveOption('fontColor'));
  textElement.opacity(this.resolveOption('fontOpacity'));
  textElement.selectable(/** @type {boolean} */ (this.resolveOption('selectable')));
  textElement.disablePointerEvents(/** @type {boolean} */ (this.resolveOption('disablePointerEvents')));

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS) || opt_textElement) {
    var text = this.resolveOption('content');
    var useHtml = this.resolveOption('useHtml');

    if (goog.isDef(text)) {
      if (useHtml) {
        textElement.htmlText(text);
      } else {
        textElement.text(text);
      }
    }

    textElement.fontFamily(/** @type {string} */ (this.resolveOption('fontFamily')));
    textElement.fontStyle(/** @type {string} */ (this.resolveOption('fontStyle')));
    textElement.fontVariant(/** @type {string} */ (this.resolveOption('fontVariant')));
    textElement.fontWeight(/** @type {number|string} */ (this.resolveOption('fontWeight')));
    textElement.fontSize(/** @type {number|string} */ (this.resolveOption('fontSize')));
    textElement.decoration(/** @type {string} */ (this.resolveOption('fontDecoration')));
    textElement.direction(/** @type {string} */ (this.resolveOption('textDirection')));
    textElement.wordBreak(/** @type {string} */ (this.resolveOption('wordBreak')));
    textElement.wordWrap(/** @type {string} */ (this.resolveOption('wordWrap')));
    textElement.letterSpacing(/** @type {number|string} */ (this.resolveOption('letterSpacing')));
    textElement.lineHeight(/** @type {number|string} */ (this.resolveOption('lineHeight')));
    textElement.textIndent(/** @type {number} */ (this.resolveOption('textIndent')));
    textElement.textShadow(/** @type {string} */ (this.resolveOption('textShadow')));
    textElement.vAlign(/** @type {string} */ (this.resolveOption('vAlign')));
    textElement.hAlign(/** @type {string} */ (this.resolveOption('hAlign')));
    textElement.textOverflow(/** @type {string} */ (this.resolveOption('textOverflow')));
  }
};


/**
 * Calculates button bounds.
 */
anychart.core.ui.NewButton.prototype.calculateBounds = function() {
  var parentBounds = /** @type {anychart.math.Rect} */(this.parentBounds());
  /** @type {number} */
  var parentWidth;
  /** @type {number} */
  var parentHeight;
  var width;
  var height;
  var autoWidth;
  var autoHeight;

  var w = /** @type {number} */(this.getOption('width'));
  var h = /** @type {number} */(this.getOption('height'));
  var textWidth = 0;
  var textHeight = 0;
  if (parentBounds) {
    parentWidth = parentBounds.width;
    parentHeight = parentBounds.height;
    if (goog.isDefAndNotNull(w)) {
      this.backgroundWidth = width = anychart.utils.normalizeSize(w, parentWidth);
      textWidth = Math.abs(width);
      autoWidth = false;
    } else {
      width = 0;
      autoWidth = true;
    }
    if (goog.isDefAndNotNull(h)) {
      this.backgroundHeight = height = anychart.utils.normalizeSize(h, parentHeight);
      textHeight = Math.abs(height);
      autoHeight = false;
    } else {
      height = 0;
      autoHeight = true;
    }
  } else {
    if (!anychart.utils.isNaN(w)) {
      autoWidth = false;
      this.backgroundWidth = width = anychart.utils.toNumber(w);
      textWidth = Math.abs(width);
    } else {
      autoWidth = true;
      width = 0;
    }
    if (!anychart.utils.isNaN(h)) {
      autoHeight = false;
      this.backgroundHeight = height = anychart.utils.toNumber(h);
      textHeight = Math.abs(height);
    } else {
      autoHeight = true;
      height = 0;
    }
  }

  var position = anychart.math.normalizeCoordinate(this.position_);
  position.x = parentWidth ? anychart.utils.normalizeSize(position.x, parentWidth) : 0;
  position.y = parentHeight ? anychart.utils.normalizeSize(position.y, parentHeight) : 0;

  if (this.isTextContent) {
    var padding = this.padding();
    this.textElement_.width(null);
    this.textElement_.height(null);

    if (autoWidth) {
      width += this.textElement_.getBounds().width;
      this.textWidth = width;
      this.backgroundWidth = padding.widenWidth(width);
    } else {
      this.textWidth = padding.tightenWidth(textWidth);
    }

    this.textElement_.width(this.textWidth);

    if (autoHeight) {
      height += this.textElement_.getBounds().height;
      this.textHeight = height;
      this.backgroundHeight = padding.widenHeight(height);
    } else {
      this.textHeight = padding.tightenHeight(textHeight);
    }

    this.textElement_.height(this.textHeight);

    this.textX = anychart.utils.normalizeSize(/** @type {number|string} */(padding.getOption('left')), this.backgroundWidth);
    this.textY = anychart.utils.normalizeSize(/** @type {number|string} */(padding.getOption('top')), this.backgroundHeight);

    this.textX += position.x;
    this.textY += position.y;
  }

  if (this.isFunction) {
    var ctx = {
      'path': this.element_,
      'width': w,
      'height': h,
      'state': this.isSelected() ? 'selected' : this.isHovered() ? 'hovered' : 'normal'
    };
    this.drawFunction.call(ctx, this.element_);
    var bounds = this.element_.getBounds();
    if (autoWidth) {
      this.backgroundWidth = bounds.left + bounds.width;
    }
    if (autoHeight) {
      this.backgroundHeight = bounds.top + bounds.height;
    }
    this.element_.setTransformationMatrix(1, 0, 0, 1, position.x, position.y);
  }

  this.backgroundBounds = new anychart.math.Rect(position.x, position.y, this.backgroundWidth, this.backgroundHeight);
  this.hoverRect_.setBounds(this.backgroundBounds);
};


/**
 * Getter/setter for position.
 * @param {anychart.math.Coordinate=} opt_value Button position.
 * @return {(anychart.math.Coordinate|anychart.core.ui.NewButton)} Button position or self for method chaining.
 */
anychart.core.ui.NewButton.prototype.position = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.position_ = opt_value;
    this.invalidate(anychart.ConsistencyState.BOUNDS,
        anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    return this;
  } else {
    return this.position_;
  }
};


//endregion
//region --- Serialization / Deserialization / Disposing
/** @inheritDoc */
anychart.core.ui.NewButton.prototype.serialize = function() {
  var json = anychart.core.ui.NewButton.base(this, 'serialize');

  anychart.core.settings.serialize(this, anychart.core.ui.NewButton.OWN_DESCRIPTORS, json, 'Button');
  this.serializeStates(json);
  json['padding'] = this.padding().serialize();

  return json;
};


/**
 *  Serialize states objects.
 *  @param {Object} json
 */
anychart.core.ui.NewButton.prototype.serializeStates = function(json) {
  json['normal'] = this.normal_.serialize();
  json['hovered'] = this.hovered_.serialize();
  json['selected'] = this.selected_.serialize();
};


/** @inheritDoc */
anychart.core.ui.NewButton.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.ui.NewButton.base(this, 'setupByJSON', config, opt_default);
  anychart.core.settings.deserialize(this, anychart.core.ui.NewButton.OWN_DESCRIPTORS, config, opt_default);

  this.padding().setupInternal(!!opt_default, config['padding']);

  this.normal_.setupInternal(!!opt_default, config['normal']);
  this.hovered_.setupInternal(!!opt_default, config['hovered']);
  this.selected_.setupInternal(!!opt_default, config['selected']);
};


/**
 * Dispose settings created by createStateSettings().
 */
anychart.core.ui.NewButton.prototype.disposeStateSettings = function() {
  goog.disposeAll(this.normal_, this.hovered_, this.selected_);
  this.normal_ = null;
  this.hovered_ = null;
  this.selected_ = null;
};


/** @inheritDoc */
anychart.core.ui.NewButton.prototype.disposeInternal = function() {
  goog.disposeAll(
      this.hoverRect_,
      this.textElement_,
      this.element_,
      this.background_,
      this.rootLayer,
      this.padding_);
  this.hoverRect_ = null;
  this.textElement_ = null;
  this.element_ = null;
  this.background_ = null;
  this.rootLayer = null;
  this.padding_ = null;
  this.disposeStateSettings();
  anychart.core.ui.NewButton.base(this, 'disposeInternal');
};


//endregion
//region --- Exports
// exports
(function() {
  var proto = anychart.core.ui.NewButton.prototype;
  proto['normal'] = proto.normal;
  proto['hovered'] = proto.hovered;
  proto['selected'] = proto.selected;
  proto['padding'] = proto.padding;
  // proto['position'] = proto.position;
})();
//endregion
