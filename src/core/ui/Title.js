goog.provide('anychart.core.ui.Title');
goog.require('anychart.core.IStandaloneBackend');
goog.require('anychart.core.VisualBase');
goog.require('anychart.core.settings');
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
 * @extends {anychart.core.VisualBase}
 * @implements {anychart.core.settings.IObjectWithSettings}
 * @implements {anychart.core.settings.IResolvable}
 * @implements {anychart.core.IStandaloneBackend}
 */
anychart.core.ui.Title = function() {
  anychart.core.ui.Title.base(this, 'constructor');

  /**
   * Text element.
   * @type {!acgraph.vector.Text}
   * @private
   */
  this.text_;

  /**
   * Background element (if any).
   * @type {anychart.core.ui.Background}
   * @private
   */
  this.background_ = null;


  /**
   * Layer element (if background is visible).
   * @type {acgraph.vector.Layer}
   * @private
   */
  this.layer_ = null;


  /**
   * Width settings for the title.
   * @type {number|string|null}
   * @private
   */
  this.autoWidth_ = null;


  /**
   * Actual width of the title.
   * @type {number}
   * @private
   */
  this.backgroundWidth_ = NaN;


  /**
   * Actual height of the title.
   * @type {number}
   * @private
   */
  this.backgroundHeight_ = NaN;


  /**
   * Text width of the title.
   * @type {number}
   * @private
   */
  this.textWidth_ = NaN;


  /**
   * Text height of the title.
   * @type {number}
   * @private
   */
  this.textHeight_ = NaN;


  /**
   * Pixel bounds due to orientation, align, margins, padding, etc.
   * @type {anychart.math.Rect}
   * @private
   */
  this.pixelBounds_ = null;


  /**
   * Title margin.
   * @type {anychart.core.utils.Margin}
   * @private
   */
  this.margin_ = null;


  /**
   * Title text padding.
   * @type {anychart.core.utils.Padding}
   * @private
   */
  this.padding_ = null;


  /**
   * Title default orientation.
   * @type {anychart.enums.Orientation}
   * @private
   */
  this.defaultOrientation_ = anychart.enums.Orientation.TOP;


  /**
   * @type {number}
   * @private
   */
  this.defaultRotation_;


  /**
   * Title transformation matrix.
   * @type {goog.graphics.AffineTransform}
   * @private
   */
  this.transformation_ = null;


  /**
   * Theme settings.
   * @type {Object}
   */
  this.themeSettings = {};


  /**
   * Own settings (Settings set by user with API).
   * @type {Object}
   */
  this.ownSettings = {};


  /**
   * Parent title.
   * @type {anychart.core.ui.Title}
   * @private
   */
  this.parent_ = null;


  /**
   * @type {boolean}
   */
  this.forceInvalidate = false;

  /**
   * Auto text.
   * @type {string}
   * @private
   */
  this.autoText_;

  /**
   * Resolution chain cache.
   * @type {Array.<Object|null|undefined>|null}
   * @private
   */
  this.resolutionChainCache_ = null;
};
goog.inherits(anychart.core.ui.Title, anychart.core.VisualBase);


//region -- Consistency states and Signals
/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.ui.Title.prototype.SUPPORTED_SIGNALS =
    anychart.core.VisualBase.prototype.SUPPORTED_SIGNALS |
    anychart.Signal.ENABLED_STATE_CHANGED;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.ui.Title.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.VisualBase.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.APPEARANCE |
    anychart.ConsistencyState.TITLE_BACKGROUND;
//endregion


//region -- Optimized props descriptors
/**
 * Text descriptors.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.core.ui.Title.prototype.TEXT_DESCRIPTORS =
    anychart.core.settings.createTextPropertiesDescriptors(
        anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.BOUNDS,
        anychart.ConsistencyState.APPEARANCE,
        anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED,
        anychart.Signal.NEEDS_REDRAW
    );
anychart.core.settings.populate(anychart.core.ui.Title, anychart.core.ui.Title.prototype.TEXT_DESCRIPTORS);


/**
 * Simple properties descriptors.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.core.ui.Title.prototype.SIMPLE_PROPS_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  map[anychart.opt.WIDTH] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      anychart.opt.WIDTH,
      anychart.core.settings.asIsNormalizer,
      anychart.ConsistencyState.BOUNDS,
      anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);

  map[anychart.opt.HEIGHT] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      anychart.opt.HEIGHT,
      anychart.core.settings.asIsNormalizer,
      anychart.ConsistencyState.BOUNDS,
      anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);

  map[anychart.opt.ALIGN] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      anychart.opt.ALIGN,
      anychart.enums.normalizeAlign,
      anychart.ConsistencyState.BOUNDS,
      anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);

  map[anychart.opt.ORIENTATION] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      anychart.opt.ORIENTATION,
      anychart.enums.normalizeOrientation,
      anychart.ConsistencyState.BOUNDS,
      anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);

  map[anychart.opt.ROTATION] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      anychart.opt.ROTATION,
      anychart.core.settings.numberNormalizer,
      anychart.ConsistencyState.BOUNDS,
      anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);

  map[anychart.opt.TEXT] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      anychart.opt.TEXT,
      anychart.core.settings.stringNormalizer,
      anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.BOUNDS,
      anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);

  return map;
})();
anychart.core.settings.populate(anychart.core.ui.Title, anychart.core.ui.Title.prototype.SIMPLE_PROPS_DESCRIPTORS);
//endregion


//region -- IResolvable implementation
/** @inheritDoc */
anychart.core.ui.Title.prototype.resolutionChainCache = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.resolutionChainCache_ = opt_value;
  }
  return this.resolutionChainCache_;
};


/** @inheritDoc */
anychart.core.ui.Title.prototype.getResolutionChain = anychart.core.settings.getResolutionChain;


/** @inheritDoc */
anychart.core.ui.Title.prototype.getLowPriorityResolutionChain = function() {
  var sett = [this.themeSettings];
  if (this.parent_) {
    sett = goog.array.concat(sett, this.parent_.getLowPriorityResolutionChain());
  }
  return sett;
};


/** @inheritDoc */
anychart.core.ui.Title.prototype.getHighPriorityResolutionChain = function() {
  var sett = [this.ownSettings];
  if (this.parent_) {
    sett = goog.array.concat(sett, this.parent_.getHighPriorityResolutionChain());
  }
  return sett;
};
//endregion


//region -- IObjectWithSettings implementation
/** @inheritDoc */
anychart.core.ui.Title.prototype.getOwnOption = function(name) {
  return this.ownSettings[name];
};


/** @inheritDoc */
anychart.core.ui.Title.prototype.hasOwnOption = function(name) {
  return goog.isDefAndNotNull(this.ownSettings[name]);
};


/** @inheritDoc */
anychart.core.ui.Title.prototype.getThemeOption = function(name) {
  return this.themeSettings[name];
};


/** @inheritDoc */
anychart.core.ui.Title.prototype.getOption = anychart.core.settings.getOption;


/** @inheritDoc */
anychart.core.ui.Title.prototype.setOption = function(name, value) {
  this.ownSettings[name] = value;
};


/** @inheritDoc */
anychart.core.ui.Title.prototype.check = function(flags) {
  return true;
};
//endregion


//region -- Parental relations
/**
 * Gets/sets new parent title.
 * @param {anychart.core.ui.Title=} opt_value - Value to set.
 * @return {anychart.core.ui.Title} - Current value or itself for method chaining.
 */
anychart.core.ui.Title.prototype.parent = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.parent_ != opt_value) {
      if (this.parent_)
        this.parent_.unlistenSignals(this.parentInvalidated_, this);
      this.parent_ = opt_value;
      if (this.parent_) {
        this.parent_.listenSignals(this.parentInvalidated_, this);
        this.background().parent(this.parent_.background());
        this.padding().parent(this.parent_.padding());
        this.margin().parent(this.parent_.margin());
      } else {
        this.background().parent(null);
        this.padding().parent(null);
        this.margin().parent(null);
      }
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
anychart.core.ui.Title.prototype.parentInvalidated_ = function(e) {
  var state = 0;
  var signal = 0;

  if (e.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    state |= anychart.ConsistencyState.APPEARANCE;
    signal |= anychart.Signal.NEEDS_REDRAW;
  }

  if (e.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    state |= anychart.ConsistencyState.BOUNDS;
    signal |= anychart.Signal.BOUNDS_CHANGED;
  }

  if (e.hasSignal(anychart.Signal.ENABLED_STATE_CHANGED)) {
    state |= anychart.ConsistencyState.ENABLED;
    signal |= anychart.Signal.ENABLED_STATE_CHANGED | anychart.Signal.NEEDS_REDRAW;
  }

  this.resolutionChainCache_ = null;

  this.invalidate(state, signal);
};
//endregion


//region -- Other methods
/**
 * Getter/setter for background.
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
 * @param {number|string|null} width
 */
anychart.core.ui.Title.prototype.setAutoWidth = function(width) {
  // in the context of DVF-2184
  // Anton Kagakin:
  // cause in case of negative width and without own width option
  // background will draw in the negative coords
  this.autoWidth_ = width < 0 ? null : width;
};


/**
 * Getter/setter for margin.
 * @param {(string|number|Array.<number|string>|anychart.core.utils.Space.NormalizedSpace)=} opt_spaceOrTopOrTopAndBottom .
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
 * Getter/setter for padding.
 * @param {(string|number|Array.<number|string>|anychart.core.utils.Space.NormalizedSpace)=} opt_spaceOrTopOrTopAndBottom .
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
 *
 * @param {anychart.enums.Orientation=} opt_value .
 * @return {anychart.core.ui.Title|anychart.enums.Orientation}
 */
anychart.core.ui.Title.prototype.defaultOrientation = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var needInvalidate = !this.getOption(anychart.opt.ORIENTATION) && this.defaultOrientation_ != opt_value;
    this.defaultOrientation_ = opt_value;
    if (needInvalidate)
      this.invalidate(anychart.ConsistencyState.BOUNDS);
    return this;
  }
  return this.defaultOrientation_;
};


/**
 * @param {number} value .
 */
anychart.core.ui.Title.prototype.setDefaultRotation = function(value) {
  var needInvalidate = !this.getOption(anychart.opt.ROTATION) && this.defaultRotation_ != value;
  this.defaultRotation_ = value;
  if (needInvalidate)
    this.invalidate(anychart.ConsistencyState.BOUNDS);
};


/**
 * Getter/setter for textSettings.
 * @param {(Object|string)=} opt_objectOrName Settings object or settings name or nothing to get complete object.
 * @param {(string|number|boolean|Function)=} opt_value Setting value if used as a setter.
 * @return {!(anychart.core.ui.Title|Object|string|number|boolean)} A copy of settings or the title for chaining.
 */
anychart.core.ui.Title.prototype.textSettings = function(opt_objectOrName, opt_value) {
  if (goog.isDef(opt_objectOrName)) {
    if (goog.isString(opt_objectOrName)) {
      if (goog.isDef(opt_value)) {
        if (opt_objectOrName in this.TEXT_DESCRIPTORS) {
          this[opt_objectOrName](opt_value);
        }
        return this;
      } else {
        return /** @type {!(Object|boolean|number|string)} */ (this.getOwnOption(opt_objectOrName));
      }
    } else if (goog.isObject(opt_objectOrName)) {
      for (var item in opt_objectOrName) {
        if (item in this.TEXT_DESCRIPTORS)
          this[item](opt_objectOrName[item]);
      }
    }
    return this;
  }

  var res = {};
  for (var key in this.ownSettings) {
    if (key in this.TEXT_DESCRIPTORS)
      res[key] = this.ownSettings[key];
  }
  return res;
};


/**
 * Gets/sets auto text.
 * @param {string=} opt_value - Value to set.
 * @return {anychart.core.ui.Title|string} - Current value or itself for chaining.
 */
anychart.core.ui.Title.prototype.autoText = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var val = goog.string.makeSafe(opt_value);
    if (this.autoText_ != val) {
      this.autoText_ = val;
      this.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.autoText_;
};


/**
 * @inheritDoc
 */
anychart.core.ui.Title.prototype.invalidate = function(state, opt_signal) {
  var effective = anychart.core.ui.Title.base(this, 'invalidate', state, opt_signal);
  if (!effective && this.needsForceInvalidation())
    this.dispatchSignal(opt_signal || 0);
  return effective;
};


/**
 * Whether needs force invalidation.
 * @return {boolean}
 */
anychart.core.ui.Title.prototype.needsForceInvalidation = function() {
  return this.forceInvalidate;
};
//endregion


//region -- Draw, remove
/**
 * Initializes DOM structure.
 * @return {boolean} - Whether is initial DOM creation.
 * @private
 */
anychart.core.ui.Title.prototype.initDom_ = function() {
  var isInitial = false;
  if (!this.layer_) {
    isInitial = true;
    this.layer_ = acgraph.layer();
    this.background().container(this.layer_);
    this.text_ = this.layer_.text();
    this.text_.zIndex(.1);
    this.text_.attr('aria-hidden', 'true');
    this.registerDisposable(this.layer_);
    this.bindHandlersToGraphics(this.layer_);
  }
  return isInitial;
};


/**
 * Render the title content.
 * @return {!anychart.core.ui.Title} An instance of {@link anychart.core.ui.Title} class for method chaining.
 */
anychart.core.ui.Title.prototype.draw = function() {
  if (!this.checkDrawingNeeded())
    return this;

  var isInitial = this.initDom_();

  var container = /** @type {acgraph.vector.ILayer} */(this.container());

  this.suspendSignalsDispatching();

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    this.layer_.parent(container);
    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    this.layer_.zIndex(/** @type {number} */(this.zIndex()));
    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  // Checking APPEARANCE state. It excludes text width and height inconsistency that will be checked later.
  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    // Applying text settings if needed.
    this.applyTextSettings(isInitial);
    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }

  // Checking BOUNDS state. If it is inconsistent, we need to recalculate title bounds.
  // But we don't need to mark it consistent here, because we don't know where to apply that new bounds yet.
  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    this.calcActualBounds_();
    // settings text offset for
    this.text_.x(anychart.utils.normalizeSize(/** @type {number|string} */(this.padding().getOption(anychart.opt.LEFT)), this.backgroundWidth_));
    this.text_.y(anychart.utils.normalizeSize(/** @type {number|string} */(this.padding().getOption(anychart.opt.TOP)), this.backgroundHeight_));

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
    background.draw();
    background.resumeSignalsDispatching(false);
    this.markConsistent(anychart.ConsistencyState.TITLE_BACKGROUND);
  }

  this.resumeSignalsDispatching(false);
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
//endregion


//region -- Util functions
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
  var orient = this.getOption(anychart.opt.ORIENTATION) || this.defaultOrientation_;
  switch (orient) {
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


/**
 * Applies text settings to text element.
 * @param {boolean} isInitial - Whether is initial operation.
 */
anychart.core.ui.Title.prototype.applyTextSettings = function(isInitial) {
  var textVal = this.getOption(anychart.opt.TEXT);
  var autoText = /** @type {string} */ (this.autoText());
  var useHtml = this.getOption(anychart.opt.USE_HTML);

  if (isInitial || goog.isDef(textVal) || goog.isDef(autoText) || goog.isDef(useHtml)) {
    var text = /** @type {string} */ (!textVal && goog.isDef(autoText) ? autoText : textVal);
    if (useHtml) {
      this.text_.htmlText(text);
    } else {
      this.text_.text(text);
    }
  }
  this.text_.fontSize(/** @type {number|string} */ (this.getOption(anychart.opt.FONT_SIZE)));
  this.text_.fontFamily(/** @type {string} */ (this.getOption(anychart.opt.FONT_FAMILY)));
  this.text_.color(/** @type {string} */ (this.getOption(anychart.opt.FONT_COLOR)));
  this.text_.direction(/** @type {string} */ (this.getOption(anychart.opt.TEXT_DIRECTION)));
  this.text_.textWrap(/** @type {string} */ (this.getOption(anychart.opt.TEXT_WRAP)));
  this.text_.opacity(/** @type {number} */ (this.getOption(anychart.opt.FONT_OPACITY)));
  this.text_.decoration(/** @type {string} */ (this.getOption(anychart.opt.FONT_DECORATION)));
  this.text_.fontStyle(/** @type {string} */ (this.getOption(anychart.opt.FONT_STYLE)));
  this.text_.fontVariant(/** @type {string} */ (this.getOption(anychart.opt.FONT_VARIANT)));
  this.text_.fontWeight(/** @type {number|string} */ (this.getOption(anychart.opt.FONT_WEIGHT)));
  this.text_.letterSpacing(/** @type {number|string} */ (this.getOption(anychart.opt.LETTER_SPACING)));
  this.text_.lineHeight(/** @type {number|string} */ (this.getOption(anychart.opt.LINE_HEIGHT)));
  this.text_.textIndent(/** @type {number} */ (this.getOption(anychart.opt.TEXT_INDENT)));
  this.text_.vAlign(/** @type {string} */ (this.getOption(anychart.opt.V_ALIGN)));
  this.text_.hAlign(/** @type {string} */ (this.getOption(anychart.opt.H_ALIGN)));
  this.text_.textOverflow(/** @type {string} */ (this.getOption(anychart.opt.TEXT_OVERFLOW)));
  this.text_.selectable(/** @type {boolean} */ (this.getOption(anychart.opt.SELECTABLE)));
  this.text_.disablePointerEvents(/** @type {boolean} */ (this.getOption(anychart.opt.DISABLE_POINTER_EVENTS)));
};


/**
 * Internal getter for the title rotation (orientation wise).
 * @return {number} Rotation degree.
 */
anychart.core.ui.Title.prototype.getRotation = function() {
  var ownRotation = this.getOwnOption(anychart.opt.ROTATION);
  var rotation = goog.isDef(ownRotation) ? ownRotation : this.getOption(anychart.opt.ROTATION);
  if (!goog.isDef(rotation)) {
    var orientation = this.getOption(anychart.opt.ORIENTATION) || this.defaultOrientation_;
    switch (orientation) {
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
    return /** @type {number} */ (rotation);
};


/**
 * Calculates the actual size of the title for the different sizing cases.
 * @private
 */
anychart.core.ui.Title.prototype.calcActualBounds_ = function() {
  var padding = this.padding();
  var margin = this.margin();
  /** @type {anychart.math.Rect} */
  var parentBounds = /** @type {anychart.math.Rect} */(this.parentBounds());

  var parentWidth, parentHeight;
  var orientation = this.getOption(anychart.opt.ORIENTATION) || this.defaultOrientation_;

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

  var isInitial = this.initDom_();

  if (isInitial || this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    this.applyTextSettings(isInitial);
    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }
  var textBounds;
  this.text_.width(null);
  this.text_.height(null);
  // need to set transformation to drop text bounds cache
  this.text_.setTransformationMatrix(1, 0, 0, 1, 0, 0);
  textBounds = this.text_.getBounds();


  var width = this.hasOwnOption(anychart.opt.WIDTH) ? this.getOwnOption(anychart.opt.WIDTH) : (this.autoWidth_ || null);
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

  if (this.hasOwnOption(anychart.opt.HEIGHT)) {
    this.backgroundHeight_ = anychart.utils.normalizeSize(/** @type {number|string} */(this.getOwnOption(anychart.opt.HEIGHT)), parentHeight);
    this.textHeight_ = padding.tightenHeight(this.backgroundHeight_);
  } else {
    this.textHeight_ = textBounds.height;
    this.backgroundHeight_ = padding.widenHeight(this.textHeight_);
  }

  if (parentBounds && parentHeight < margin.widenHeight(this.backgroundHeight_)) {
    this.backgroundHeight_ = margin.tightenHeight(parentHeight);
    this.textHeight_ = padding.tightenHeight(this.backgroundHeight_);
    this.text_.height(this.textHeight_);
  } else if (this.hasOwnOption(anychart.opt.HEIGHT))
    this.text_.height(this.textHeight_);

  this.pixelBounds_ = new anychart.math.Rect(-this.backgroundWidth_ / 2, -this.backgroundHeight_ / 2, this.backgroundWidth_, this.backgroundHeight_);
  var transform = goog.graphics.AffineTransform.getRotateInstance(goog.math.toRadians(this.getRotation()), 0, 0);
  /** @type {!anychart.math.Rect} */
  var bounds = acgraph.math.getBoundsOfRectWithTransform(this.pixelBounds_, transform);

  var leftMargin = anychart.utils.normalizeSize(/** @type {number|string} */(margin.getOption(anychart.opt.LEFT)), this.backgroundWidth_);
  var rightMargin = anychart.utils.normalizeSize(/** @type {number|string} */(margin.getOption(anychart.opt.RIGHT)), this.backgroundWidth_);
  var topMargin = anychart.utils.normalizeSize(/** @type {number|string} */(margin.getOption(anychart.opt.TOP)), this.backgroundHeight_);
  var bottomMargin = anychart.utils.normalizeSize(/** @type {number|string} */(margin.getOption(anychart.opt.BOTTOM)), this.backgroundHeight_);

  var wHalf = bounds.width / 2;
  var hHalf = bounds.height / 2;

  // initialized for case when there are no parentBounds;
  var x = leftMargin + wHalf;
  var y = topMargin + hHalf;

  var isHorizontal = orientation == anychart.enums.Orientation.TOP || orientation == anychart.enums.Orientation.BOTTOM;
  if (parentBounds) {
    if (isHorizontal || isRLYHorizontal) {
      if (isHorizontal) {
        switch (this.getOption(anychart.opt.ALIGN)) {
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
        switch (this.getOption(anychart.opt.ALIGN)) {
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
      switch (this.getOption(anychart.opt.ALIGN)) {
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
      switch (this.getOption(anychart.opt.ALIGN)) {
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

  var arr = [x, y, 0, 0];
  transform.createInverse().transform(arr, 0, arr, 0, 2);
  this.transformation_ = transform.translate(arr[0] - arr[2], arr[1] - arr[3]);

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
  if (this.layer_) this.layer_.removeChildren();
};
//endregion


//region -- Serialization
/** @inheritDoc */
anychart.core.ui.Title.prototype.enabled = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.ownSettings[anychart.opt.ENABLED] != opt_value) {
      this.ownSettings[anychart.opt.ENABLED] = opt_value;
      this.invalidate(anychart.ConsistencyState.ENABLED,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED | anychart.Signal.ENABLED_STATE_CHANGED);
      if (this.ownSettings[anychart.opt.ENABLED]) {
        this.doubleSuspension = false;
        this.resumeSignalsDispatching(true);
      } else {
        if (isNaN(this.suspendedDispatching)) {
          this.suspendSignalsDispatching();
        } else {
          this.doubleSuspension = true;
        }
      }
    }
    return this;
  } else {
    return /** @type {boolean} */(this.getOption(anychart.opt.ENABLED));
  }
};


/**
 * Sets default settings.
 * @param {!Object} config
 */
anychart.core.ui.Title.prototype.setThemeSettings = function(config) {
  for (var name in this.TEXT_DESCRIPTORS) {
    var val = config[name];
    if (goog.isDef(val))
      this.themeSettings[name] = val;
  }
  for (var name in this.SIMPLE_PROPS_DESCRIPTORS) {
    var val = config[name];
    if (goog.isDef(val))
      this.themeSettings[name] = val;
  }
  if (anychart.opt.ENABLED in config) this.themeSettings[anychart.opt.ENABLED] = config[anychart.opt.ENABLED];
  if (anychart.opt.Z_INDEX in config) this.themeSettings[anychart.opt.Z_INDEX] = config[anychart.opt.Z_INDEX];
};


/** @inheritDoc */
anychart.core.ui.Title.prototype.serialize = function() {
  var json = {};

  var zIndex;
  if (this.hasOwnOption(anychart.opt.Z_INDEX)) {
    zIndex = this.getOwnOption(anychart.opt.Z_INDEX);
  }
  if (!goog.isDef(zIndex)) {
    zIndex = this.getThemeOption(anychart.opt.Z_INDEX);
  }
  if (goog.isDef(zIndex)) json['zIndex'] = zIndex;

  var enabled;
  if (this.hasOwnOption(anychart.opt.ENABLED)) {
    enabled = this.getOwnOption(anychart.opt.ENABLED);
  }
  if (!goog.isDef(enabled)) {
    enabled = this.getThemeOption(anychart.opt.ENABLED);
  }
  if (goog.isDef(enabled))
    json['enabled'] = enabled;

  anychart.core.settings.serialize(this, this.TEXT_DESCRIPTORS, json, 'Title text');
  anychart.core.settings.serialize(this, this.SIMPLE_PROPS_DESCRIPTORS, json, 'Title props');

  var val = this.margin().serialize();
  if (!goog.object.isEmpty(val))
    json['margin'] = val;
  val = this.padding().serialize();
  if (!goog.object.isEmpty(val))
    json['padding'] = val;
  val = this.background().serialize();
  if (!goog.object.isEmpty(val))
    json['background'] = val;

  return json;
};


/** @inheritDoc */
anychart.core.ui.Title.prototype.specialSetupByVal = function(value, opt_default) {
  if (goog.isString(value)) {
    if (opt_default) {
      this.themeSettings[anychart.opt.TEXT] = value;
      this.themeSettings[anychart.opt.ENABLED] = true;
    } else {
      this[anychart.opt.TEXT](value);
      this.enabled(true);
    }
    return true;
  } else if (goog.isBoolean(value) || goog.isNull(value)) {
    if (opt_default)
      this.themeSettings[anychart.opt.ENABLED] = !!value;
    else
      this.enabled(!!value);
    return true;
  }
  return false;
};


/** @inheritDoc */
anychart.core.ui.Title.prototype.setupByJSON = function(config, opt_default) {
  if (opt_default) {
    this.setThemeSettings(config);
  } else {
    anychart.core.settings.deserialize(this, this.TEXT_DESCRIPTORS, config);
    anychart.core.settings.deserialize(this, this.SIMPLE_PROPS_DESCRIPTORS, config);
    anychart.core.ui.Title.base(this, 'setupByJSON', config);
  }

  if (anychart.opt.BACKGROUND in config)
    this.background(config[anychart.opt.BACKGROUND]);

  if (anychart.opt.PADDING in config)
    this.padding(config[anychart.opt.PADDING]);

  if (anychart.opt.MARGIN in config)
    this.margin(config[anychart.opt.MARGIN]);
};
//endregion

//exports
anychart.core.ui.Title.prototype['enabled'] = anychart.core.ui.Title.prototype.enabled;

// anychart.core.ui.Title.prototype['fontSize'] = anychart.core.ui.Title.prototype.fontSize;
// anychart.core.ui.Title.prototype['fontFamily'] = anychart.core.ui.Title.prototype.fontFamily;
// anychart.core.ui.Title.prototype['fontColor'] = anychart.core.ui.Title.prototype.fontColor;
// anychart.core.ui.Title.prototype['fontOpacity'] = anychart.core.ui.Title.prototype.fontOpacity;
// anychart.core.ui.Title.prototype['fontDecoration'] = anychart.core.ui.Title.prototype.fontDecoration;
// anychart.core.ui.Title.prototype['fontStyle'] = anychart.core.ui.Title.prototype.fontStyle;
// anychart.core.ui.Title.prototype['fontVariant'] = anychart.core.ui.Title.prototype.fontVariant;
// anychart.core.ui.Title.prototype['fontWeight'] = anychart.core.ui.Title.prototype.fontWeight;
// anychart.core.ui.Title.prototype['letterSpacing'] = anychart.core.ui.Title.prototype.letterSpacing;
// anychart.core.ui.Title.prototype['textDirection'] = anychart.core.ui.Title.prototype.textDirection;
// anychart.core.ui.Title.prototype['lineHeight'] = anychart.core.ui.Title.prototype.lineHeight;
// anychart.core.ui.Title.prototype['textIndent'] = anychart.core.ui.Title.prototype.textIndent;
// anychart.core.ui.Title.prototype['vAlign'] = anychart.core.ui.Title.prototype.vAlign;
// anychart.core.ui.Title.prototype['hAlign'] = anychart.core.ui.Title.prototype.hAlign;
// anychart.core.ui.Title.prototype['textWrap'] = anychart.core.ui.Title.prototype.textWrap;
// anychart.core.ui.Title.prototype['textOverflow'] = anychart.core.ui.Title.prototype.textOverflow;
// anychart.core.ui.Title.prototype['selectable'] = anychart.core.ui.Title.prototype.selectable;
// anychart.core.ui.Title.prototype['disablePointerEvents'] = anychart.core.ui.Title.prototype.disablePointerEvents;
// anychart.core.ui.Title.prototype['useHtml'] = anychart.core.ui.Title.prototype.useHtml;
anychart.core.ui.Title.prototype['textSettings'] = anychart.core.ui.Title.prototype.textSettings;

// anychart.core.ui.Title.prototype['text'] = anychart.core.ui.Title.prototype.text;
anychart.core.ui.Title.prototype['background'] = anychart.core.ui.Title.prototype.background;
anychart.core.ui.Title.prototype['rotation'] = anychart.core.ui.Title.prototype.rotation;
anychart.core.ui.Title.prototype['width'] = anychart.core.ui.Title.prototype.width;
anychart.core.ui.Title.prototype['height'] = anychart.core.ui.Title.prototype.height;
anychart.core.ui.Title.prototype['margin'] = anychart.core.ui.Title.prototype.margin;
anychart.core.ui.Title.prototype['padding'] = anychart.core.ui.Title.prototype.padding;
// anychart.core.ui.Title.prototype['align'] = anychart.core.ui.Title.prototype.align;
// anychart.core.ui.Title.prototype['orientation'] = anychart.core.ui.Title.prototype.orientation;
anychart.core.ui.Title.prototype['getRemainingBounds'] = anychart.core.ui.Title.prototype.getRemainingBounds;
