goog.provide('anychart.core.ui.HTMLTooltip');

//region -- Requirements.
goog.require('anychart.math.Rect');
goog.require('goog.Disposable');
goog.require('goog.dom');



//endregion
//region -- Constructor.
/**
 * HTMLTooltip implementation.
 * @param {anychart.core.ui.Tooltip} tooltip - Related tooltip.
 * @constructor
 * @extends {goog.Disposable}
 */
anychart.core.ui.HTMLTooltip = function(tooltip) {
  anychart.core.ui.HTMLTooltip.base(this, 'constructor');

  /**
   * Related tooltip.
   * @type {anychart.core.ui.Tooltip}
   * @private
   */
  this.tooltip_ = tooltip;

  /**
   * DOM container.
   * @type {?Element}
   * @private
   */
  this.container_ = null;

  /**
   * Base tooltip div.
   * @type {?Element}
   * @private
   */
  this.baseDiv_ = null;

  /**
   * Tooltip title div.
   * @type {?Element}
   * @private
   */
  this.titleDiv_ = null;

  /**
   * Base tooltip div.
   * @type {?Element}
   * @private
   */
  this.hr_ = null;

  /**
   * Content span.
   * @type {?Element}
   * @private
   */
  this.contentDiv_ = null;

  /**
   * Title html-text.
   * @type {string}
   * @private
   */
  this.titleText_ = '';

  /**
   * Content html-text.
   * @type {string}
   * @private
   */
  this.contentText_ = '';

};
goog.inherits(anychart.core.ui.HTMLTooltip, goog.Disposable);


//endregion.
//region -- HTML treating.
/**
 * Treats anychart background as HTML div-element.
 * @param {anychart.core.ui.Background} background - Background.
 * @param {anychart.core.utils.Padding=} opt_padding - Padding.
 * @param {string=} opt_class - CSS class.
 * @return {!Element}
 */
anychart.core.ui.HTMLTooltip.prototype.treatBackgroundAsHtml = function(background, opt_padding, opt_class) {
  var props = {};
  if (opt_padding) {
    //TODO (A.Kudryavtsev): Add full background config merged with css!
    props['style'] = goog.string.subs('padding-left: %spx, padding-top: %spx, padding-right: %spx, padding-bottom: %spx',
        opt_padding.getOption('left'), opt_padding.getOption('top'), opt_padding.getOption('right'), opt_padding.getOption('bottom'));
  }

  var el = goog.dom.createDom(goog.dom.TagName.DIV, props);
  if (opt_class)
    el.className = opt_class;
  return el;
};


/**
 * Treats title as HTML div-element.
 * @param {anychart.core.ui.Title} title - Tooltip.
 * @param {string=} opt_class - Class. Default is 'anychart-tooltip'.
 * @return {!Element}
 */
anychart.core.ui.HTMLTooltip.prototype.treatTitleAsHtml = function(title, opt_class) {
  var titleElement = this.treatBackgroundAsHtml(/** @type {anychart.core.ui.Background} */ (title.background()));
  if (opt_class)
    titleElement.className = opt_class;
  return titleElement;
};


//endregion
//region -- DOM structure.
/**
 *
 * @return {Object}
 */
anychart.core.ui.HTMLTooltip.prototype.getContext = function() {
  return {
    'parentElement': this.baseDiv_,
    'titleElement': this.titleDiv_,
    'separatorElement': this.hr_,
    'contentElement': this.contentDiv_
  };
};


/**
 * Prepares DOM structure.
 * @private
 */
anychart.core.ui.HTMLTooltip.prototype.domReady_ = function() {
  if (!this.baseDiv_) {
    this.baseDiv_ = this.treatBackgroundAsHtml(/** @type {anychart.core.ui.Background} */ (this.tooltip_.background()));
    this.baseDiv_.className = 'anychart-tooltip';

    this.titleDiv_ = this.treatTitleAsHtml(/** @type {anychart.core.ui.Title} */ (this.tooltip_.title()),
        'anychart-tooltip-title');

    this.hr_ = goog.dom.createDom(goog.dom.TagName.HR);
    this.hr_.setAttribute('noshade', true);
    this.hr_.className = 'anychart-tooltip-separator';

    this.contentDiv_ = goog.dom.createDom(goog.dom.TagName.DIV);

    goog.dom.appendChild(this.baseDiv_, this.titleDiv_);
    goog.dom.appendChild(this.baseDiv_, this.hr_);
    goog.dom.appendChild(this.baseDiv_, this.contentDiv_);

    this.tooltip_.onDomReadyInternal(this.getContext());
  }
};


/**
 * Gets html-tooltip DOM element.
 * @return {!Element}
 */
anychart.core.ui.HTMLTooltip.prototype.getElement = function() {
  this.domReady_();
  return /** @type {!Element} */ (this.baseDiv_);
};


//endregion
//region -- Update.
/**
 * Updates content html text.
 * @param {string=} opt_value - Value to set.
 * @return {anychart.core.ui.HTMLTooltip|string}
 */
anychart.core.ui.HTMLTooltip.prototype.contentText = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.contentText_ != opt_value) {
      this.domReady_();
      this.contentText_ = opt_value;
      var cont = this.getContext();
      if (this.tooltip_.onBeforeContentChangeInternal(cont)) {
        this.contentDiv_.innerHTML = this.contentText_;
        this.tooltip_.onContentChangedInternal(cont);
      }
      return this;
    }
  }
  return this.contentText_;
};


/**
 * Updates title html text.
 * @param {string=} opt_value - Value to set.
 * @return {anychart.core.ui.HTMLTooltip|string}
 */
anychart.core.ui.HTMLTooltip.prototype.titleText = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.titleText_ != opt_value) {
      this.domReady_();
      this.titleText_ = opt_value;
      var cont = this.getContext();
      if (this.tooltip_.onBeforeTitleChangeInternal(cont)) {
        this.titleDiv_.innerHTML = this.titleText_;
        this.tooltip_.onTitleChangedInternal(cont);
      }
      return this;
    }
  }
  return this.titleText_;
};


/**
 * Updates tooltip position.
 * @return {anychart.core.ui.HTMLTooltip}
 */
anychart.core.ui.HTMLTooltip.prototype.updateTexts = function() {
  this.domReady_();
  this.titleText(/** @type {string} */ (this.tooltip_.title().autoText()));
  goog.style.setElementShown(this.titleDiv_, this.tooltip_.title()['enabled']());

  goog.style.setElementShown(this.hr_, this.tooltip_.separator()['enabled']());

  this.contentText(/** @type {string} */ (this.tooltip_.contentInternal().text()));
  goog.style.setElementShown(this.contentDiv_, this.tooltip_.contentInternal()['enabled']());

  return this;
};


/**
 * Updates tooltip position.
 * @return {anychart.core.ui.HTMLTooltip}
 */
anychart.core.ui.HTMLTooltip.prototype.updatePosition = function() {
  // goog.style.setPosition(this.getElement(),
  //     /** @type {number} */ (this.tooltip_.getOption('x')),
  //     /** @type {number} */ (this.tooltip_.getOption('y')));
  var mBox = this.getMarginBox();
  goog.style.setPosition(this.getElement(),
      this.tooltip_.instantPosition_.x - mBox.left,
      this.tooltip_.instantPosition_.y - mBox.top);
  return this;
};


//endregion
//region -- DOM placement.
/**
 * Gets/sets element visible state.
 * @param {boolean=} opt_value - Value to set.
 * @return {anychart.core.ui.HTMLTooltip|boolean}
 */
anychart.core.ui.HTMLTooltip.prototype.visible = function(opt_value) {
  if (goog.isDef(opt_value)) {
    goog.style.setElementShown(this.getElement(), !!opt_value);
    return this;
  }
  return goog.style.isElementShown(this.getElement());
};


/**
 * Sets pixel bounds.
 * @return {anychart.math.Rect}
 */
anychart.core.ui.HTMLTooltip.prototype.getBounds = function() {
  var s = goog.style.getSize(this.getElement());
  return new anychart.math.Rect(0, 0, s.width, s.height);
};


/**
 * Sets parent element.
 * @param {Element=} opt_value - Container.
 * @return {anychart.core.ui.HTMLTooltip|Element}
 */
anychart.core.ui.HTMLTooltip.prototype.container = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.container_ != opt_value) {
      if (goog.isNull(opt_value)) {
        this.remove();
      } else {
        this.container_ = /** @type {Element} */ (opt_value);
        goog.dom.appendChild(this.container_, this.getElement());
        return this;
      }
    }
  }
  return this.container_;
};


/**
 * Removes html tooltip from its dom parent.
 */
anychart.core.ui.HTMLTooltip.prototype.remove = function() {
  if (this.baseDiv_) {
    goog.dom.removeNode(this.baseDiv_);
    this.container_ = null;
  }
};


//endregion
//region -- Working with CSS.
/**
 * Gets html tooltip margins.
 * @return {!goog.math.Box}
 */
anychart.core.ui.HTMLTooltip.prototype.getMarginBox = function() {
  return goog.style.getMarginBox(this.getElement());
};


//endregion
//region -- Disposing.
/** @inheritDoc */
anychart.core.ui.HTMLTooltip.prototype.disposeInternal = function() {
  this.remove();
  this.tooltip_ = null;
  this.contentDiv_ = null;
  this.hr_ = null;
  this.titleDiv_ = null;
  this.baseDiv_ = null;
  anychart.core.ui.HTMLTooltip.base(this, 'disposeInternal');
};


//endregion
