goog.provide('anychart.ui.Preloader');

goog.require('goog.ui.Component');



/**
 * Preloader.
 * @constructor
 * @extends {goog.ui.Component}
 */
anychart.ui.Preloader = function() {
  anychart.ui.Preloader.base(this, 'constructor');
};
goog.inherits(anychart.ui.Preloader, goog.ui.Component);


/** @type {string} */
anychart.ui.Preloader.CSS_CLASS = goog.getCssName('anychart-loader');


/**
 * Whether the preloader is visible.
 * @type {boolean}
 * @private
 */
anychart.ui.Preloader.prototype.visible_ = false;


/**
 * Sets the visibility of the preloader.
 * Lazily renders the component if needed.
 * @param {boolean=} opt_value Whether the preloader should be visible.
 * @return {boolean|!anychart.ui.Preloader}
 */
anychart.ui.Preloader.prototype.visible = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (opt_value == this.visible_) {
      return this;
    }

    if (opt_value) {
      if (!this.isInDocument()) {
        this.render();
      }
      this.show_();
    } else {
      this.hide_();
    }

    return this;
  }

  return this.visible_;
};


/**
 * Show preloader.
 * @private
 */
anychart.ui.Preloader.prototype.show_ = function() {
  this.visible_ = true;
  goog.style.setElementShown(this.getElement(), this.visible_);
};


/**
 * Hide preloader.
 * @private
 */
anychart.ui.Preloader.prototype.hide_ = function() {
  this.visible_ = false;
  goog.style.setElementShown(this.getElement(), this.visible_);
};


/**
 * Create logo.
 * @param {Element=} opt_element
 * @private
 */
anychart.ui.Preloader.prototype.createLogo_ = function(opt_element) {
  var dom = this.getDomHelper();
  var element = opt_element || this.getElement();
  var className = anychart.ui.Preloader.CSS_CLASS;
  goog.dom.classlist.add(element, className);

  var rotatingCover = dom.createDom(
      goog.dom.TagName.DIV,
      goog.getCssName(className, 'rotating-cover'),
      dom.createDom(
          goog.dom.TagName.DIV,
          goog.getCssName(className, 'rotating-plane'),
          dom.createDom(
              goog.dom.TagName.DIV,
              goog.getCssName(className, 'chart-row'),
              dom.createDom(
                  goog.dom.TagName.DIV,
                  [
                    goog.getCssName(className, 'chart-col'),
                    goog.getCssName(className, 'green')
                  ]),
              dom.createDom(
                  goog.dom.TagName.DIV,
                  [
                    goog.getCssName(className, 'chart-col'),
                    goog.getCssName(className, 'orange')
                  ]),
              dom.createDom(
                  goog.dom.TagName.DIV,
                  [
                    goog.getCssName(className, 'chart-col'),
                    goog.getCssName(className, 'red')
                  ])
          )
      ));

  this.hide_();
  goog.dom.appendChild(element, rotatingCover);
};


/** @override */
anychart.ui.Preloader.prototype.createDom = function() {
  anychart.ui.Preloader.base(this, 'createDom');
  this.createLogo_();
};


/** @override */
anychart.ui.Preloader.prototype.decorateInternal = function(element) {
  anychart.ui.Preloader.base(this, 'decorateInternal', element);
  this.createLogo_(element);
};


/** @override */
anychart.ui.Preloader.prototype.enterDocument = function() {
  anychart.ui.Preloader.base(this, 'enterDocument');
};


/** @override */
anychart.ui.Preloader.prototype.exitDocument = function() {
  anychart.ui.Preloader.base(this, 'exitDocument');
};


/** @override */
anychart.ui.Preloader.prototype.disposeInternal = function() {
  anychart.ui.Preloader.base(this, 'disposeInternal');
};


/**
 * Constructor function for preloader.
 * @return {anychart.ui.Preloader}
 */
anychart.ui.preloader = function() {
  return new anychart.ui.Preloader();
};


//exports
(function() {
  var proto = anychart.ui.Preloader.prototype;
  goog.exportSymbol('anychart.ui.preloader', anychart.ui.preloader);
  proto['render'] = proto.render;
  proto['decorate'] = proto.decorate;
  proto['visible'] = proto.visible;
})();
