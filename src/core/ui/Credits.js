goog.provide('anychart.core.ui.Credits');
goog.require('anychart.core.VisualBase');
goog.require('anychart.math.Rect');
goog.require('goog.dom');
goog.require('goog.net.ImageLoader');
goog.require('goog.userAgent');



/**
 * Define class Credits.<br/>
 * <b>Note:</b> Use method {@link anychart.ui.credits} to create instance of this class.<br/>
 * <b>Note:</b> You can't customize credits without <u>your licence key</u>. To buy licence key go to
 * <a href="http://www.anychart.com/buy/">Buy page</a>.
 * @constructor
 * @extends {anychart.core.VisualBase}
 */
anychart.core.ui.Credits = function() {
  goog.base(this);

  /**
   * @type {string}
   * @private
   */
  this.logoSrc_ = this.addProtocol_('static.anychart.com/logo.png');

  /**
   * @type {Element}
   * @private
   */
  this.domElement_ = null;

  /**
   * Flag whether credits must be placed right in chart.
   * @type {boolean}
   * @private
   */
  this.inChart_ = false;

  //disable by default at anychart related domains
  this.enabled(!anychart.core.ui.Credits.DOMAIN_REGEXP.test(goog.dom.getWindow().location.hostname));
};
goog.inherits(anychart.core.ui.Credits, anychart.core.VisualBase);


/** @inheritDoc */
anychart.core.ui.Credits.prototype.SUPPORTED_SIGNALS = anychart.core.VisualBase.prototype.SUPPORTED_SIGNALS;


/**
 * Bottom position of credits dom element in px.
 * @type {number}
 * @const
 */
anychart.core.ui.Credits.BOTTOM = 6;


/**
 * RIGHT position of credits dom element in px.
 * @type {number}
 * @const
 */
anychart.core.ui.Credits.RIGHT = 0;


/**
 * Regular expression for domain check.
 * @type {RegExp}
 */
anychart.core.ui.Credits.DOMAIN_REGEXP = /^(.*\.)?anychart\.(com|stg|dev)$/i;


/**
 * @enum {string}
 * @private
 */
anychart.core.ui.Credits.CssClass_ = {
  CREDITS: goog.getCssName('anychart-credits'),
  LOGO: goog.getCssName('anychart-credits-logo'),
  TEXT: goog.getCssName('anychart-credits-text')
};


/** @inheritDoc */
anychart.core.ui.Credits.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.VisualBase.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.APPEARANCE |
    anychart.ConsistencyState.CREDITS_POSITION;


/**
 * Adds protocol to url.
 * @param {string} url Url.
 * @return {string} Url with protocol.
 * @private
 */
anychart.core.ui.Credits.prototype.addProtocol_ = function(url) {
  return ('https:' == goog.dom.getWindow().location.protocol ? 'https://' : 'http://') + url;
};


/**
 * Getter/setter for text.
 * @param {string=} opt_value Text value.
 * @return {anychart.core.ui.Credits|string} Credits text or itself for chaining call.
 */
anychart.core.ui.Credits.prototype.text = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.text_ != opt_value) {
      this.text_ = opt_value;
    }
    this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    return this;
  } else {
    return this.text_;
  }
};


/**
 * Getter/setter for url.
 * @param {string=} opt_value Url value.
 * @return {anychart.core.ui.Credits|string} Credits url or itself for chaining call.
 */
anychart.core.ui.Credits.prototype.url = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.url_ != opt_value) {
      this.url_ = opt_value;
    }
    this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    return this;
  } else {
    return this.url_;
  }
};


/**
 * Getter/setter for alt.
 * @param {string=} opt_value Title value.
 * @return {anychart.core.ui.Credits|string} Credits alt or itself for chaining call.
 */
anychart.core.ui.Credits.prototype.alt = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.alt_ != opt_value) {
      this.alt_ = opt_value;
    }
    this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    return this;
  } else {
    return this.alt_;
  }
};


/**
 * Getter/setter for logoSrc.
 * @param {string=} opt_value Logo src value.
 * @return {anychart.core.ui.Credits|string} Credits logo src or itself for chaining call.
 */
anychart.core.ui.Credits.prototype.logoSrc = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.logoSrc_ != opt_value) {
      this.logoSrc_ = opt_value;
    }
    this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    return this;
  } else {
    return this.logoSrc_;
  }
};


/**
 * Gets/sets 'in chart' flag. If is set to true, credits will be located right on a chart. Otherwise, credits will take
 * an area below the chart to be located.
 * @param {boolean=} opt_value - Value to be set.
 * @return {boolean|anychart.core.ui.Credits} - Current value or itself for method chaining.
 */
anychart.core.ui.Credits.prototype.inChart = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.inChart_ != opt_value) {
      this.inChart_ = opt_value;
      this.invalidate(anychart.ConsistencyState.CREDITS_POSITION, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.inChart_;
};


/** @inheritDoc */
anychart.core.ui.Credits.prototype.invalidateParentBounds = function() {
  this.invalidate(anychart.ConsistencyState.CREDITS_POSITION, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Draws svg logo.
 * @private
 */
anychart.core.ui.Credits.prototype.drawLogo_ = function() {
  var stage = acgraph.create(this.domElement_, '12px', '100%');
  acgraph.getRenderer().setAttribute_(stage.domElement(), 'class', anychart.core.ui.Credits.CssClass_.LOGO);
  var borderPath = stage.path();
  var columnPath = stage.path();

  // border
  borderPath
      .moveTo(.5, .5)
      .lineTo(19.4, .5)
      .lineTo(19.4, 19.4)
      .lineTo(.5, 19.4)
      .close()
      .fill(null)
      .stroke('#808080', 1.5)
      .scale(0.5, 0.5);
  columnPath
      .moveTo(4.5, 10) // 1 column
      .lineTo(6.5, 10)
      .lineTo(6.5, 16.5)
      .lineTo(4.5, 16.5)
      .lineTo(4.5, 10)
      .moveTo(9, 7.5) // 2 column
      .lineTo(11, 7.5)
      .lineTo(11, 16.5)
      .lineTo(9, 16.5)
      .lineTo(9, 7.5)
      .moveTo(13.5, 5) // 3 column
      .lineTo(15.5, 5)
      .lineTo(15.5, 16.5)
      .lineTo(13.5, 16.5)
      .lineTo(13.5, 5);
  columnPath
      .stroke('#808080 0.4')
      .fill('#808080', 0.9)
      .scale(0.5, 0.5);
};


/**
 * Draw credits.
 * @return {anychart.core.ui.Credits} Return itself for chaining call.
 */
anychart.core.ui.Credits.prototype.draw = function() {
  var valid = anychart.isValidKey() || anychart.core.ui.Credits.DOMAIN_REGEXP.test(goog.dom.getWindow().location.hostname);
  if (!valid && !this.enabled()) this.suspendSignalsDispatching().enabled(true).resumeSignalsDispatching(false);

  if (!this.checkDrawingNeeded())
    return this;

  var container = /** @type {acgraph.vector.ILayer} */(this.container());
  var stage = container ? container.getStage() : null;
  var parentBounds = /** @type {anychart.math.Rect} */(this.parentBounds());

  var containerElement;
  if (stage)
    containerElement = /** @type {Element} */(stage.container());
  else
    containerElement = null;

  if (!this.divElement_) {
    this.divElement_ = goog.dom.createDom(
        goog.dom.TagName.DIV,
        anychart.core.ui.Credits.CssClass_.CREDITS
        );
  }

  if (!this.domElement_) {
    this.domElement_ = goog.dom.createDom(goog.dom.TagName.A);
    goog.dom.setProperties(this.domElement_, {'style': 'float:right; margin-right:9px;'});
    goog.dom.appendChild(this.divElement_, this.domElement_);
  }

  if (!anychart.core.ui.Credits.creditsCss_) {
    anychart.core.ui.Credits.creditsCss_ = this.createCssElement_(valid);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    if (containerElement)
      goog.dom.appendChild(containerElement, this.divElement_);
    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    goog.dom.setProperties(this.domElement_, {
      'href': valid ? this.url_ : 'http://anychart.com',
      'title': valid ? this.alt_ : 'AnyChart.com',
      'target': '_blank'
    });

    // create span with text
    this.domElement_.innerHTML = this.getHTMLString_(valid, false);

    var imageLoader = new goog.net.ImageLoader();
    goog.events.listen(imageLoader, goog.events.EventType.LOAD, function() {
      // append image
      if (!this.isDisposed())
        this.domElement_.innerHTML += this.getHTMLString_(valid, true);
    }, false, this);

    // image not loaded - should draw logo by framework
    goog.events.listen(imageLoader, goog.net.EventType.ERROR, function() {
      if (this.enabled() && !this.isDisposed())
        this.drawLogo_();
    }, false, this);

    // all work is done
    goog.events.listen(imageLoader, goog.net.EventType.COMPLETE, function() {
      goog.dispose(imageLoader);
    }, false, this);

    imageLoader.addImage('logo', this.addProtocol_('static.anychart.com/logo.png'));
    imageLoader.start();

    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CREDITS_POSITION)) {
    var containerSize = containerElement ? goog.style.getBorderBoxSize(containerElement) : stage ? stage.getBounds() : new anychart.math.Rect(0, 0, 0, 0);

    var right = anychart.core.ui.Credits.RIGHT + (containerSize.width - parentBounds.width - parentBounds.left);
    var bottom = anychart.core.ui.Credits.BOTTOM + (containerSize.height - parentBounds.height - parentBounds.top);

    this.setPosition_(right, bottom);
    this.markConsistent(anychart.ConsistencyState.CREDITS_POSITION);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    //we should ignore zIndex property for html elements
    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  return this;
};


/**
 * Set credits dom element right and bottom values.
 * @param {number} right Right value.
 * @param {number} bottom Bottom value.
 * @private
 */
anychart.core.ui.Credits.prototype.setPosition_ = function(right, bottom) {
  // see goog.style.setPosition method
  var buggyGeckoSubPixelPos = goog.userAgent.GECKO &&
      (goog.userAgent.MAC || goog.userAgent.X11) &&
      goog.userAgent.isVersionOrHigher('1.9');

  // Round to the nearest pixel for buggy sub-pixel support.
  this.divElement_.style.right = (buggyGeckoSubPixelPos ? Math.round(right) : right) + 'px';
  this.divElement_.style.bottom = (buggyGeckoSubPixelPos ? Math.round(bottom) : bottom) + 'px';
};


/**
 * @return {!anychart.math.Rect} Bounds that remain after credits.
 */
anychart.core.ui.Credits.prototype.getRemainingBounds = function() {
  var parentBounds = /** @type {anychart.math.Rect} */(this.parentBounds()) || new anychart.math.Rect(0, 0, 0, 0);

  if (!this.enabled()) return parentBounds;

  if (!this.inChart_) {
    var creditsSize = goog.style.getBorderBoxSize(this.divElement_);
    // chart height - credits height - bottom
    parentBounds.height = parentBounds.height - creditsSize.height - anychart.core.ui.Credits.BOTTOM;
  }

  return parentBounds;
};


/**
 * @param {boolean} valid Is license key valid.
 * @param {boolean} appendImage Whether ro return string with image tag.
 * @return {string}
 * @private
 */
anychart.core.ui.Credits.prototype.getHTMLString_ = function(valid, appendImage) {
  if (appendImage) {
    return '<img class="' + anychart.core.ui.Credits.CssClass_.LOGO + '" src="' + (valid ? this.logoSrc_ : this.addProtocol_('static.anychart.com/logo.png')) + '">';
  }
  return '<span class="' + anychart.core.ui.Credits.CssClass_.TEXT + '">' + (valid ? this.text() : 'AnyChart Trial Version') + '</span>';
};


/**
 * Style node created in dom.
 * Need to prevent creating of multiple style nodes.
 * @type {Element}
 * @private
 */
anychart.core.ui.Credits.creditsCss_ = null;


/**
 * @private
 * @param {boolean} valid Is license key valid.
 * @return {Element} Credits css element.
 */
anychart.core.ui.Credits.prototype.createCssElement_ = function(valid) {
  var styles = '';
  var css = goog.dom.createDom(goog.dom.TagName.STYLE);
  css.type = 'text/css';

  styles += '.' + anychart.core.ui.Credits.CssClass_.CREDITS + '{' +
      'position:absolute;' +
      'width:100%;' +
      'overflow:hidden;' +
      'height:10px;' +
      '}';

  styles += '.' + anychart.core.ui.Credits.CssClass_.LOGO + '{' +
      'float:right;' +
      'border:none;' +
      'margin-right:2px;' +
      'height:10px;' +
      'width:10px;' +
      '}';

  styles += '.' + anychart.core.ui.Credits.CssClass_.TEXT + '{' +
      'float:right;' +
      'font-size:10px;' +
      'line-height:9px;' +
      'padding-bottom:1px;' +
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


/** @inheritDoc */
anychart.core.ui.Credits.prototype.remove = function() {
  goog.dom.removeNode(this.divElement_);
};


/** @inheritDoc */
anychart.core.ui.Credits.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');
  json['text'] = this.text();
  json['url'] = this.url();
  json['alt'] = this.alt();
  json['logoSrc'] = this.logoSrc();
  json['inChart'] = this.inChart();
  return json;
};


/** @inheritDoc */
anychart.core.ui.Credits.prototype.setupSpecial = function(var_args) {
  var args = arguments;
  if (goog.isString(args[0])) {
    this.text(args[0]);
    this.enabled(true);
    return true;
  }
  return anychart.core.VisualBase.prototype.setupSpecial.apply(this, args);
};


/** @inheritDoc */
anychart.core.ui.Credits.prototype.setupByJSON = function(config) {
  goog.base(this, 'setupByJSON', config);
  this.text(config['text']);
  this.url(config['url']);
  this.alt(config['alt']);
  this.logoSrc(config['logoSrc']);
  this.inChart(config['inChart']);
};


/** @inheritDoc */
anychart.core.ui.Credits.prototype.disposeInternal = function() {
  goog.dom.removeNode(this.divElement_);
  this.divElement_ = null;

  goog.base(this, 'disposeInternal');
};


//exports
anychart.core.ui.Credits.prototype['text'] = anychart.core.ui.Credits.prototype.text;//doc|ex
anychart.core.ui.Credits.prototype['url'] = anychart.core.ui.Credits.prototype.url;//doc|ex
anychart.core.ui.Credits.prototype['alt'] = anychart.core.ui.Credits.prototype.alt;//doc|ex
anychart.core.ui.Credits.prototype['logoSrc'] = anychart.core.ui.Credits.prototype.logoSrc;//doc|ex
anychart.core.ui.Credits.prototype['inChart'] = anychart.core.ui.Credits.prototype.inChart;
