goog.provide('anychart.ui.button.Base');

goog.require('goog.ui.Button');



/**
 * A button control.
 *
 * @param {goog.ui.ControlContent=} opt_content Text caption or existing DOM
 *    structure to display as the button's caption.
 * @param {goog.ui.ButtonRenderer=} opt_renderer Optional renderer used to
 *    render or decorate the button; defaults to
 *    {@link goog.ui.CustomButtonRenderer}.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper, used for
 *    document interaction.
 * @constructor
 * @extends {goog.ui.Button}
 */
anychart.ui.button.Base = function(opt_content, opt_renderer, opt_domHelper) {
  anychart.ui.button.Base.base(this, 'constructor', opt_content || '', opt_renderer, opt_domHelper);

  /**
   * @type {?string} Css name or null.
   * @private
   */
  this.iconClass_ = null;

  /**
   * @type {number}
   * @private
   */
  this.iconPositionIndex_ = 0;

  /**
   * @type {?string}
   * @private
   */
  this.fallbackSymbol_ = null;
};
goog.inherits(anychart.ui.button.Base, goog.ui.Button);


/**
 * CSS class name for fallback symbol element.
 * @type {string}
 */
anychart.ui.button.Base.FALLBACK_CSS_CLASS = goog.getCssName('ac-fallback-symbol');


/**
 * Set icon class to button.
 * @param {string} iconClass Class name or null.
 * @param {number=} opt_index
 */
anychart.ui.button.Base.prototype.setIcon = function(iconClass, opt_index) {
  this.iconClass_ = iconClass;

  if (goog.isDef(opt_index)) {
    this.iconPositionIndex_ = opt_index;
  }

  if (this.isInDocument()) {
    this.setIcon_();
  }
};


/**
 * Set symbol to be shown as an icon if special font symbols are not available.
 *
 * @param {?string} value
 */
anychart.ui.button.Base.prototype.setFallbackSymbol = function(value) {
  this.fallbackSymbol_ = value;
};


/**
 * Apply icon class to button.
 * @private
 */
anychart.ui.button.Base.prototype.setIcon_ = function() {
  var element = this.getElement();
  var renderer = /** @type {goog.ui.CustomButtonRenderer} */ (this.getRenderer());
  var contentElement = renderer.getContentElement(element);
  var iconElement = goog.dom.getElementsByTagNameAndClass(goog.dom.TagName.I, null, contentElement)[0];

  if (this.iconClass_) {
    if (iconElement) {
      goog.dom.classlist.set(iconElement, this.iconClass_);
      goog.style.setElementShown(iconElement, true);
    } else {
      iconElement = goog.dom.createDom(goog.dom.TagName.I, this.iconClass_);
      goog.a11y.aria.setState(iconElement, goog.a11y.aria.State.HIDDEN, true);
      goog.dom.insertChildAt(contentElement, iconElement, this.iconPositionIndex_);

      if (this.fallbackSymbol_) {
        var fallbackSymbolElement = goog.dom.createDom(goog.dom.TagName.SPAN, anychart.ui.button.Base.FALLBACK_CSS_CLASS, this.fallbackSymbol_);
        goog.dom.insertChildAt(contentElement, fallbackSymbolElement, this.iconPositionIndex_ + 1);
      }
    }
  } else {
    if (iconElement) goog.style.setElementShown(iconElement, false);
  }
};


/** @override */
anychart.ui.button.Base.prototype.createDom = function() {
  anychart.ui.button.Base.base(this, 'createDom');
  goog.dom.setProperties(this.getElement(), {'type': 'button'});
  this.setIcon_();
};
