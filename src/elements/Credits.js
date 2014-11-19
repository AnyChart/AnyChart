goog.provide('anychart.elements.Credits');
goog.require('anychart.VisualBase');
goog.require('goog.dom');



/**
 * Define class Credits.<br/>
 * <b>Note:</b> Use method {@link anychart.elements.credits} to create instance of this class.<br/>
 * <b>Note:</b> You can't customize credits without <u>your licence key</u>. To buy licence key go to
 * <a href="http://www.anychart.com/buy/">Buy page</a>.
 * @constructor
 * @extends {anychart.VisualBase}
 */
anychart.elements.Credits = function() {
  goog.base(this);

  /**
   * @type {string}
   * @private
   */
  this.text_ = 'AnyChart';

  /**
   * @type {string}
   * @private
   */
  this.url_ = 'http://anychart.com';

  /**
   * @type {string}
   * @private
   */
  this.alt_ = 'AnyChart.com';

  /**
   * @type {string}
   * @private
   */
  this.logoSrc_ = 'http://static.anychart.com/logo.png';


  /**
   * @type {Element}
   * @private
   */
  this.domElement_ = null;

  //disable by default at anychart related domains
  this.enabled(!anychart.elements.Credits.DOMAIN_REGEXP.test(goog.dom.getWindow().location.hostname));
};
goog.inherits(anychart.elements.Credits, anychart.VisualBase);


/** @inheritDoc */
anychart.elements.Credits.prototype.SUPPORTED_SIGNALS = anychart.Signal.NEEDS_REDRAW;


/**
 * Bottom position of credits dom element in px.
 * @type {number}
 * @const
 */
anychart.elements.Credits.BOTTOM = 6;


/**
 * RIGHT position of credits dom element in px.
 * @type {number}
 * @const
 */
anychart.elements.Credits.RIGHT = 10;


/**
 * Regular expression for domain check.
 * @type {RegExp}
 */
anychart.elements.Credits.DOMAIN_REGEXP = /^(.*\.)?anychart\.(com|stg|dev)$/i;


/**
 * @enum {string}
 * @private
 */
anychart.elements.Credits.CssClass_ = {
  CREDITS: goog.getCssName('anychart-credits'),
  LOGO: goog.getCssName('anychart-credits-logo'),
  TEXT: goog.getCssName('anychart-credits-text')
};


/** @inheritDoc */
anychart.elements.Credits.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.VisualBase.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.APPEARANCE |
    anychart.ConsistencyState.POSITION;


/**
 * Getter for credits text value.
 * @return {string} Current credits text.
 *//**
 * Setter for credits text value.<br/>
 * <b>Note:</b> You can't customize credits without <u>your licence key</u>. To buy licence key go to
 * <a href="http://www.anychart.com/buy/">Buy page</a>.
 * @example
 * var chart = anychart.lineChart([10, 1, 7, 10]);
 * chart.credits(true);
 * chart.credits().text('Changed credits');
 * chart.container(stage).draw();
 * @param {string=} opt_value Text value.
 * @return {anychart.elements.Credits} {@link anychart.elements.Credits} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {string=} opt_value Text value.
 * @return {anychart.elements.Credits|string} Credits text or itself for chaining call.
 */
anychart.elements.Credits.prototype.text = function(opt_value) {
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
 * Getter for credits url.
 * @return {string} Current credits url.
 *//**
 * Setter for credits url.<br/>
 * <b>Note:</b> You can't customize credits without <u>your licence key</u>. To buy licence key go to
 * <a href="http://www.anychart.com/buy/">Buy page</a>.
 * @example
 * var chart = anychart.lineChart([10, 1, 7, 10]);
 * chart.credits(true);
 * chart.credits().url('http://www.anychart.com/buy/');
 * chart.container(stage).draw();
 * @param {string=} opt_value Url value.
 * @return {anychart.elements.Credits} {@link anychart.elements.Credits} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {string=} opt_value Url value.
 * @return {anychart.elements.Credits|string} Credits url or itself for chaining call.
 */
anychart.elements.Credits.prototype.url = function(opt_value) {
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
 * Getter for credits alt.
 * @return {string} Current credits alternative text.
 *//**
 * Setter for credits alt.<br/>
 * <b>Note:</b> You can't customize credits without <u>your licence key</u>. To buy licence key go to
 * <a href="http://www.anychart.com/buy/">Buy page</a>.
 * @example
 * var chart = anychart.lineChart([10, 1, 7, 10]);
 * chart.credits(true);
 * chart.credits().alt('Custom alternative text.');
 * chart.container(stage).draw();
 * @param {string=} opt_value Title value.
 * @return {anychart.elements.Credits} {@link anychart.elements.Credits} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {string=} opt_value Title value.
 * @return {anychart.elements.Credits|string} Credits alt or itself for chaining call.
 */
anychart.elements.Credits.prototype.alt = function(opt_value) {
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
 * Getter for credits logo src value.
 * @return {string} Current credits logo source.
 *//**
 * Setter for credits logo src value.<br/>
 * <b>Note:</b> You can't customize credits without <u>your licence key</u>. To buy licence key go to
 * <a href="http://www.anychart.com/buy/">Buy page</a>.
 * @example
 * var chart = anychart.lineChart([10, 1, 7, 10]);
 * chart.credits(true);
 * chart.credits().logoSrc(null);
 * chart.container(stage).draw();
 * @param {string=} opt_value Logo source value.
 * @return {anychart.elements.Credits} {@link anychart.elements.Credits} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {string=} opt_value Logo src value.
 * @return {anychart.elements.Credits|string} Credits logo src or itself for chaining call.
 */
anychart.elements.Credits.prototype.logoSrc = function(opt_value) {
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


/** @inheritDoc */
anychart.elements.Credits.prototype.invalidateParentBounds = function() {
  this.invalidate(anychart.ConsistencyState.POSITION, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Draws svg logo.
 * @param {Element} element Container for logo.
 * @private
 */
anychart.elements.Credits.prototype.drawLogo_ = function(element) {
  var stage = acgraph.create(element, '100%', '100%');
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
 * @return {anychart.elements.Credits} Return itself for chaining call.
 */
anychart.elements.Credits.prototype.draw = function() {
  var valid = anychart.isValidKey() || anychart.elements.Credits.DOMAIN_REGEXP.test(goog.dom.getWindow().location.hostname);
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

  if (!this.domElement_) {
    this.domElement_ = goog.dom.createDom(
        goog.dom.TagName.A,
        anychart.elements.Credits.CssClass_.CREDITS
        );
  }

  if (!anychart.elements.Credits.creditsCss_) {
    anychart.elements.Credits.creditsCss_ = this.createCssElement_(valid);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    if (containerElement)
      goog.dom.appendChild(containerElement, this.domElement_);
    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    goog.dom.setProperties(this.domElement_, {
      'href': valid ? this.url_ : 'http://anychart.com',
      'title': valid ? this.alt_ : 'AnyChart.com',
      'target': '_blank'
    });
    this.domElement_.innerHTML = this.getHTMLString_(valid);
    // get image dom element to check for an error
    var img = goog.dom.getElementByClass('anychart-credits-logo', this.domElement_);
    var self = this;
    img.onerror = function(e) {
      // draws logo instead of loading image
      self.drawLogo_(self.domElement_);
      // remove <img /> element
      goog.dom.removeNode(img);
    };
    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.POSITION)) {
    var containerSize = containerElement ? goog.style.getBorderBoxSize(containerElement) : stage ? stage.getBounds() : new anychart.math.Rect(0, 0, 0, 0);

    var right = anychart.elements.Credits.RIGHT + (containerSize.width - parentBounds.width - parentBounds.left);
    var bottom = anychart.elements.Credits.BOTTOM + (containerSize.height - parentBounds.height - parentBounds.top);

    this.setPosition_(right, bottom);
    this.markConsistent(anychart.ConsistencyState.POSITION);
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
anychart.elements.Credits.prototype.setPosition_ = function(right, bottom) {
  // see goog.style.setPosition method
  var buggyGeckoSubPixelPos = goog.userAgent.GECKO &&
      (goog.userAgent.MAC || goog.userAgent.X11) &&
      goog.userAgent.isVersionOrHigher('1.9');

  // Round to the nearest pixel for buggy sub-pixel support.
  this.domElement_.style.right = (buggyGeckoSubPixelPos ? Math.round(right) : right) + 'px';
  this.domElement_.style.bottom = (buggyGeckoSubPixelPos ? Math.round(bottom) : bottom) + 'px';
};


/**
 * @return {!anychart.math.Rect} Bounds that remain after credits.
 */
anychart.elements.Credits.prototype.getRemainingBounds = function() {
  var parentBounds = /** @type {anychart.math.Rect} */(this.parentBounds()) || new anychart.math.Rect(0, 0, 0, 0);

  if (!this.enabled()) return parentBounds;

  var creditsSize = goog.style.getBorderBoxSize(this.domElement_);
  // chart height - credits height - bottom
  parentBounds.height = parentBounds.height - creditsSize.height - anychart.elements.Credits.BOTTOM;

  return parentBounds;
};


/**
 * @param {boolean} valid Is license key valid.
 * @return {string}
 * @private
 */
anychart.elements.Credits.prototype.getHTMLString_ = function(valid) {
  return '<img class="' + anychart.elements.Credits.CssClass_.LOGO + '" src="' + (valid ? this.logoSrc_ : 'http://static.anychart.com/logo.png') + '">' +
      '<span class="' + anychart.elements.Credits.CssClass_.TEXT + '">' + (valid ? this.text_ : 'AnyChart Trial Version') + '</span>';
};


/**
 * Style node created in dom.
 * Need to prevent creating of multiple style nodes.
 * @type {Element}
 * @private
 */
anychart.elements.Credits.creditsCss_ = null;


/**
 * @private
 * @param {boolean} valid Is license key valid.
 * @return {Element} Credits css element.
 */
anychart.elements.Credits.prototype.createCssElement_ = function(valid) {
  var styles = '';
  var css = goog.dom.createDom(goog.dom.TagName.STYLE);
  css.type = 'text/css';

  styles += '.' + anychart.elements.Credits.CssClass_.CREDITS + '{' +
      'position:absolute;' +
      'width:' + (valid ? '55px;' : '120px;') +
      'height:10px;' +
      '}';

  styles += '.' + anychart.elements.Credits.CssClass_.LOGO + '{' +
      'position:absolute;' +
      'top:0;' +
      'left:0;' +
      'height:10px;' +
      'width:10px;' +
      '}';

  styles += '.' + anychart.elements.Credits.CssClass_.TEXT + '{' +
      'position:absolute;' +
      'left: 12px;' +
      'top:0;' +
      'font-size:10px;' +
      'line-height:10px;' +
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
anychart.elements.Credits.prototype.remove = function() {
  goog.dom.removeNode(this.domElement_);
};


/**
 * @inheritDoc
 */
anychart.elements.Credits.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');
  json['text'] = this.text();
  json['url'] = this.url();
  json['alt'] = this.alt();
  json['logoSrc'] = this.logoSrc();
  return json;
};


/**
 * @inheritDoc
 */
anychart.elements.Credits.prototype.deserialize = function(config) {
  this.text(config['text']);
  this.url(config['url']);
  this.alt(config['alt']);
  this.logoSrc(config['logoSrc']);

  return goog.base(this, 'deserialize', config);
};


/** @inheritDoc */
anychart.elements.Credits.prototype.disposeInternal = function() {
  goog.dom.removeNode(this.domElement_);
  this.domElement_ = null;

  goog.base(this, 'disposeInternal');
};


/**
 * Create instance of {@link anychart.elements.Credits}.<br/>
 * <b>Note:</b> You can't customize credits without <u>your licence key</u>. To buy licence key go to
 * <a href="http://www.anychart.com/buy/">Buy page</a>.
 * @example
 * var chart = anychart.lineChart([10, 1, 7, 10]);
 * chart.credits(
 *     anychart.elements.credits().enabled(true).text('Custom credits')
 * );
 * chart.container(stage).draw();
 * @return {anychart.elements.Credits}
 */
anychart.elements.credits = function() {
  return new anychart.elements.Credits();
};


//exports
goog.exportSymbol('anychart.elements.credits', anychart.elements.credits);//doc|ex
anychart.elements.Credits.prototype['text'] = anychart.elements.Credits.prototype.text;//doc|ex
anychart.elements.Credits.prototype['url'] = anychart.elements.Credits.prototype.url;//doc|ex
anychart.elements.Credits.prototype['alt'] = anychart.elements.Credits.prototype.alt;//doc|ex
anychart.elements.Credits.prototype['logoSrc'] = anychart.elements.Credits.prototype.logoSrc;//doc|ex
