goog.provide('anychart.core.ui.StageCredits');
goog.require('goog.Disposable');
goog.require('goog.dom');



/**
 * Credits class.
 * @param {acgraph.vector.Stage} stage Stage credits belongs to.
 * @constructor
 * @extends {goog.Disposable}
 */
anychart.core.ui.StageCredits = function(stage) {
  anychart.core.ui.StageCredits.base(this, 'constructor');

  /**
   * Stage.
   * @type {acgraph.vector.Stage}
   * @private
   */
  this.stage_ = stage;

  /**
   * State.
   * @type {number}
   * @private
   */
  this.state_ = anychart.core.ui.StageCredits.States.ENABLED |
      anychart.core.ui.StageCredits.States.URL_ALT |
      anychart.core.ui.StageCredits.States.TEXT |
      anychart.core.ui.StageCredits.States.IMAGE;
};
goog.inherits(anychart.core.ui.StageCredits, goog.Disposable);


/**
 * Regular expression for domain check.
 * @type {RegExp}
 */
anychart.core.ui.StageCredits.DOMAIN_REGEXP = /^(.*\.)?anychart\.(com|stg|dev)$/i;


//region --- WORKING WITH STATES ---
/**
 * States enum
 * @enum {number}
 */
anychart.core.ui.StageCredits.States = {
  ENABLED: 1 << 0,
  URL_ALT: 1 << 1,
  TEXT: 1 << 2,
  IMAGE: 1 << 3,
  ALL: 0xF
};


/**
 * Whether credits is consistent.
 * @return {boolean}
 */
anychart.core.ui.StageCredits.prototype.isConsistent = function() {
  return !this.state_;
};


/**
 * Checks invalidation state.
 * @param {number} state State to check.
 * @return {boolean} Has state or not.
 */
anychart.core.ui.StageCredits.prototype.hasInvalidationState = function(state) {
  return !!(this.state_ & state);
};


/**
 * Clears consistency state.
 * @param {anychart.core.ui.StageCredits.States|number} state State(s) to be cleared.
 */
anychart.core.ui.StageCredits.prototype.markConsistent = function(state) {
  this.state_ &= ~state;
};


/**
 * Invalidates credits with given state.
 * @param {anychart.core.ui.StageCredits.States|number} state State to invalidate.
 * @param {boolean=} opt_dispatch Whether to rerender.
 */
anychart.core.ui.StageCredits.prototype.invalidate = function(state, opt_dispatch) {
  var effective = state & ~this.state_;
  this.state_ |= effective;
  if (!this.isDisposed() && !this.stage_.isSuspended() && !!effective && !!opt_dispatch)
    this.stage_.render();
};
//endregion


//region --- OWN API ---
/**
 * Adds protocol to url.
 * @param {string} url Url.
 * @return {string} Url with protocol.
 * @private
 */
anychart.core.ui.StageCredits.prototype.addProtocol_ = function(url) {
  return ('https:' == goog.dom.getWindow().location.protocol ? 'https://' : 'http://') + url;
};


/**
 * Getter/setter for enabled.
 * @param {boolean=} opt_value enabled.
 * @return {boolean|anychart.core.ui.StageCredits} enabled or self for chaining.
 */
anychart.core.ui.StageCredits.prototype.enabled = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.enabled_ != opt_value) {
      this.enabled_ = opt_value;
      if (this.isValid())
        this.invalidate(anychart.core.ui.StageCredits.States.ENABLED, true);
    }
    return this;
  }
  return this.enabled_;
};


/**
 * Getter/setter for text.
 * @param {string=} opt_value text.
 * @return {string|anychart.core.ui.StageCredits} text or self for chaining.
 */
anychart.core.ui.StageCredits.prototype.text = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.text_ != opt_value) {
      this.text_ = opt_value;
      if (this.isValid())
        this.invalidate(anychart.core.ui.StageCredits.States.TEXT, true);
    }
    return this;
  }
  return this.text_;
};


/**
 * Getter/setter for url.
 * @param {string=} opt_value url.
 * @return {string|anychart.core.ui.StageCredits} url or self for chaining.
 */
anychart.core.ui.StageCredits.prototype.url = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.url_ != opt_value) {
      this.url_ = opt_value;
      if (this.isValid())
        this.invalidate(anychart.core.ui.StageCredits.States.URL_ALT, true);
    }
    return this;
  }
  return this.url_;
};


/**
 * Getter/setter for alt.
 * @param {string=} opt_value alt.
 * @return {string|anychart.core.ui.StageCredits} alt or self for chaining.
 */
anychart.core.ui.StageCredits.prototype.alt = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.alt_ != opt_value) {
      this.alt_ = opt_value;
      if (this.isValid())
        this.invalidate(anychart.core.ui.StageCredits.States.URL_ALT, true);
    }
    return this;
  }
  return this.alt_;
};


/**
 * Getter/setter for logoSrc.
 * @param {string=} opt_value logoSrc.
 * @return {string|anychart.core.ui.StageCredits} logoSrc or self for chaining.
 */
anychart.core.ui.StageCredits.prototype.logoSrc = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.logoSrc_ != opt_value) {
      this.logoSrc_ = opt_value;
      if (this.isValid())
        this.invalidate(anychart.core.ui.StageCredits.States.IMAGE, true);
    }
    return this;
  }
  return this.logoSrc_;
};


/**
 * Stage.
 * @return {acgraph.vector.Stage} Stage.
 */
anychart.core.ui.StageCredits.prototype.getStage = function() {
  return this.stage_;
};


/**
 * Returns dom element.
 * @return {Element} Dom element.
 */
anychart.core.ui.StageCredits.prototype.domElement = function() {
  return this.domElement_;
};
//endregion


//region --- UTILS ---
/**
 * @enum {string}
 * @private
 */
anychart.core.ui.StageCredits.CssClass_ = {
  CREDITS: goog.getCssName('anychart-credits'),
  LOGO: goog.getCssName('anychart-credits-logo'),
  TEXT: goog.getCssName('anychart-credits-text')
};


/**
 * Creates and return style node.
 * @return {!Element}
 * @private
 */
anychart.core.ui.StageCredits.prototype.createCssElement_ = function() {
  var styles = '';
  var css = goog.dom.createDom(goog.dom.TagName.STYLE);
  css.type = 'text/css';

  styles += '.' + anychart.core.ui.StageCredits.CssClass_.CREDITS + '{' +
      'position:absolute;' +
      'overflow:hidden;' +
      'right:6px;' +
      'bottom:6px;' +
      '}';

  styles += '.' + anychart.core.ui.StageCredits.CssClass_.CREDITS + ' a {' +
      'text-decoration:none;' +
      '}';

  styles += '.' + anychart.core.ui.StageCredits.CssClass_.LOGO + '{' +
      'border:none;' +
      'margin-right:2px;' +
      'height:10px;' +
      'width:10px;' +
      '}';

  styles += '.' + anychart.core.ui.StageCredits.CssClass_.TEXT + '{' +
      'font-size:10px;' +
      'text-decoration:none;' +
      'font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;' +
      'color:#929292;' +
      '}';

  if (css.styleSheet)
    css['styleSheet']['cssText'] = styles;
  else
    goog.dom.appendChild(css, goog.dom.createTextNode(styles));

  goog.dom.insertChildAt(
      goog.dom.getElementsByTagNameAndClass('head')[0],
      css, 0
  );
  return css;
};
//endregion


//region --- DRAWING ---
/**
 * Renders credits.
 * @return {anychart.core.ui.StageCredits} Self for chaining.
 */
anychart.core.ui.StageCredits.prototype.render = function() {
  var valid = this.isValid();

  if (valid && (goog.isDef(this.prevValidState) && !this.prevValidState)) {
    this.invalidate(anychart.core.ui.StageCredits.States.ENABLED, false);
  }
  this.prevValidState = valid;

  if (this.isConsistent() || this.isDisposed() || !this.stage_ || this.stage_.isSuspended())
    return this;

  if (valid && !this.enabled()) {
    if (this.hasInvalidationState(anychart.core.ui.StageCredits.States.ENABLED)) {
      goog.dom.removeNode(this.domElement_);
      this.markConsistent(anychart.core.ui.StageCredits.States.ENABLED);
    }
    return this;
  }

  if (!anychart.core.ui.StageCredits.creditsCss_) {
    anychart.core.ui.StageCredits.creditsCss_ = this.createCssElement_();
  }

  if (!this.domElement_) {
    this.domElement_ = goog.dom.createDom(goog.dom.TagName.DIV, anychart.core.ui.StageCredits.CssClass_.CREDITS);
  }

  if (!this.a_) {
    this.a_ = goog.dom.createDom(goog.dom.TagName.A);
    this.span_ = goog.dom.createDom(goog.dom.TagName.SPAN, anychart.core.ui.StageCredits.CssClass_.TEXT);
    this.image_ = goog.dom.createDom(goog.dom.TagName.IMG, anychart.core.ui.StageCredits.CssClass_.LOGO);
    goog.dom.append(this.a_, this.span_);
    goog.dom.appendChild(this.domElement_, this.a_);
  }

  var containerElement = /** @type {Element} */(this.stage_.container());
  if (this.hasInvalidationState(anychart.core.ui.StageCredits.States.ENABLED)) {
    if (containerElement)
      goog.dom.appendChild(containerElement, this.domElement_);
    this.markConsistent(anychart.core.ui.StageCredits.States.ENABLED);
  }

  if (this.hasInvalidationState(anychart.core.ui.StageCredits.States.URL_ALT)) {
    goog.dom.setProperties(this.a_, {
      'href': valid ? this.url() : 'http://anychart.com',
      'title': valid ? this.alt() : 'AnyChart',
      'target': '_blank'
    });
    this.markConsistent(anychart.core.ui.StageCredits.States.URL_ALT);
  }

  if (this.hasInvalidationState(anychart.core.ui.StageCredits.States.TEXT)) {
    var text = valid ? this.text() : 'AnyChart Trial Version';
    goog.dom.setTextContent(this.span_, /** @type {string} */ (text));
    this.markConsistent(anychart.core.ui.StageCredits.States.TEXT);
  }

  if (this.hasInvalidationState(anychart.core.ui.StageCredits.States.IMAGE)) {
    var src = this.getFinalSrc();
    if (src) {
      this.tagetSrc = src;
      var imageLoader = acgraph.getRenderer().getImageLoader();
      if (imageLoader) {
        goog.events.listen(imageLoader, goog.net.EventType.COMPLETE, this.onImageCompleteHandler_, false, this);
        goog.events.listen(imageLoader, goog.events.EventType.LOAD, this.onImageLoadHandler_, false, this);
        goog.events.listen(imageLoader, goog.net.EventType.ERROR, this.onImageErrorHandler_, false, this);

        if (this.isLoading_) {
          imageLoader.removeImage(src);
          this.isLoading_ = false;
        }
        imageLoader.addImage(src, src);
        this.isLoading_ = true;
        imageLoader.start();
      }
    } else {
      goog.dom.removeNode(this.image_);
    }

    this.markConsistent(anychart.core.ui.StageCredits.States.IMAGE);
  }

  return this;
};


/**
 *
 * @return {boolean}
 */
anychart.core.ui.StageCredits.prototype.isValid = function() {
  return anychart.isValidKey() || anychart.core.ui.StageCredits.DOMAIN_REGEXP.test(goog.dom.getWindow().location.hostname);
};


/**
 * Returns final src value.
 * @return {string}
 */
anychart.core.ui.StageCredits.prototype.getFinalSrc = function() {
  return /** @type {string} */ (this.isValid() ? this.logoSrc() : this.addProtocol_('static.anychart.com/logo.png'));
};


/**
 * Image load handler.
 * @param {goog.events.Event} e Event.
 * @private
 */
anychart.core.ui.StageCredits.prototype.onImageLoadHandler_ = function(e) {
  var src = this.tagetSrc;
  if (e.target.id != src) return;
  if (!this.isDisposed())
    if (!this.image_.parentNode)
      goog.dom.insertChildAt(this.a_, this.image_, 0);
    goog.dom.setProperties(this.image_, {'src': src});
  this.isLoading_ = false;
};


/**
 * Image complete handler.
 * @param {goog.events.Event} e Event.
 * @private
 */
anychart.core.ui.StageCredits.prototype.onImageCompleteHandler_ = function(e) {
  if (e.target.id != this.tagetSrc) return;
  this.isLoading_ = false;
};


/**
 * Image error hadler.
 * @param {goog.events.Event} e Event.
 * @private
 */
anychart.core.ui.StageCredits.prototype.onImageErrorHandler_ = function(e) {
  if (e.target.id != this.tagetSrc) return;
  goog.dom.removeNode(this.image_);
};
//endregion


//region --- SETUP/DISPOSE ---
/**
 * Setup.
 * @param {Object|null|boolean|string} config Config.
 */
anychart.core.ui.StageCredits.prototype.setupByJSON = function(config) {
  if (goog.isString(config)) {
    this.text(/** @type {string} */(config));
    this.enabled(true);
    return;
  } else if (goog.isBoolean(config) || goog.isNull(config)) {
    this.enabled(!!config);
    return;
  }
  this.stage_.suspend();
  this.url(config['url']);
  this.text(config['text']);
  this.alt(config['alt']);
  this.logoSrc(config['logoSrc']);
  this.enabled(config['enabled']);
  this.stage_.resume();
};


/**
 * Serializes credits.
 * @return {Object} Json object.
 */
anychart.core.ui.StageCredits.prototype.serialize = function() {
  var json = {};
  json['url'] = this.url();
  json['alt'] = this.alt();
  json['text'] = this.text();
  json['logoSrc'] = this.logoSrc();
  json['enabled'] = this.enabled();
  return json;
};


/** @inheritDoc */
anychart.core.ui.StageCredits.prototype.disposeInternal = function() {
  var imageLoader = acgraph.getRenderer().getImageLoader();
  if (imageLoader) {
    goog.events.unlisten(imageLoader, goog.events.EventType.LOAD, this.onImageLoadHandler_, false, this);
    goog.events.unlisten(imageLoader, goog.net.EventType.COMPLETE, this.onImageCompleteHandler_, false, this);
    goog.events.unlisten(imageLoader, goog.net.EventType.ERROR, this.onImageErrorHandler_, false, this);
  }

  goog.dom.removeNode(this.span_);
  goog.dom.removeNode(this.image_);
  goog.dom.removeNode(this.a_);
  goog.dom.removeNode(this.domElement_);
  this.span_ = null;
  this.image_ = null;
  this.a_ = null;
  this.domElement_ = null;
  this.stage_ = null;
  anychart.core.ui.StageCredits.base(this, 'disposeInternal');
};
//endregion


//exports
anychart.core.ui.StageCredits.prototype['text'] = anychart.core.ui.StageCredits.prototype.text;
anychart.core.ui.StageCredits.prototype['url'] = anychart.core.ui.StageCredits.prototype.url;
anychart.core.ui.StageCredits.prototype['alt'] = anychart.core.ui.StageCredits.prototype.alt;
anychart.core.ui.StageCredits.prototype['logoSrc'] = anychart.core.ui.StageCredits.prototype.logoSrc;
anychart.core.ui.StageCredits.prototype['enabled'] = anychart.core.ui.StageCredits.prototype.enabled;
