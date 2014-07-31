goog.provide('anychart.elements.Credits');
goog.require('anychart.VisualBase');
goog.require('goog.dom');



/**
 * @constructor
 * @extends {anychart.VisualBase}
 */
anychart.elements.Credits = function() {
  goog.base(this);

  /**
   * @type {string}
   * @private
   */
  this.text_ = 'AnyChart.com';

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
  this.logoSrc_ = 'http://static.anychart.com/logo_grey.png';

  /**
   * @type {Element}
   * @private
   */
  this.creditsCss_ = null;


  /**
   * @type {Element}
   * @private
   */
  this.domElement_ = null;
};
goog.inherits(anychart.elements.Credits, anychart.VisualBase);
goog.addSingletonGetter(anychart.elements.Credits);


/** @inheritDoc */
anychart.elements.Credits.prototype.SUPPORTED_SIGNALS = anychart.Signal.NEEDS_REDRAW;


/**
 * @enum {string}
 */
anychart.elements.Credits.CssClass = {
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
 * Sets or gets credits text value.
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
 * Sets or gets credits url.
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
 * Sets or gets credits alt.
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
 * Sets or gets credits logo src value.
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


/**
 * Draw credits.
 * @return {anychart.elements.Credits} Return itself for chaining call.
 */
anychart.elements.Credits.prototype.draw = function() {
  if (!this.checkDrawingNeeded())
    return this;

  var container = /** @type {acgraph.vector.ILayer} */(this.container());
  var containerElement = /** @type {Element} */(container.getStage().container());

  if (!this.domElement_) {
    this.domElement_ = goog.dom.createDom(
        goog.dom.TagName.A,
        anychart.elements.Credits.CssClass.CREDITS
        );
  }

  if (!this.creditsCss_) {
    this.creditsCss_ = this.createCssElement_();
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    goog.dom.appendChild(containerElement, this.domElement_);
    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    goog.dom.setProperties(this.domElement_, {
      'href': this.url_,
      'title': this.alt_,
      'target': '_blank'
    });
    this.domElement_.innerHTML = this.getHTMLString_();
    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.POSITION)) {
    var box = goog.style.getBorderBoxSize(containerElement);
    var creditSize = goog.style.getBorderBoxSize(this.domElement_);

    goog.style.setPosition(
        this.domElement_,
        box.width - creditSize.width - 10, //fixed offsets
        box.height - creditSize.height - 6
    );
    this.markConsistent(anychart.ConsistencyState.POSITION);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    //we should ignore zIndex property for html elements
    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  return this;
};


/**
 * @return {string}
 * @private
 */
anychart.elements.Credits.prototype.getHTMLString_ = function() {
  return '<img class="' + anychart.elements.Credits.CssClass.LOGO + '" src="' + this.logoSrc_ + '">' +
      '<span class="' + anychart.elements.Credits.CssClass.TEXT + '">' + this.text_ + '</span>';
};


/**
 * @private
 * @return {Element} Credits css element.
 */
anychart.elements.Credits.prototype.createCssElement_ = function() {
  var styles = '';
  var css = goog.dom.createDom(goog.dom.TagName.STYLE);
  css.type = 'text/css';

  styles += '.' + anychart.elements.Credits.CssClass.CREDITS + '{' +
      'position:absolute;' +
      'width:76px;' +
      'height:10px;' +
      '}';

  styles += '.' + anychart.elements.Credits.CssClass.LOGO + '{' +
      'position:absolute;' +
      'top:0;' +
      'left:0;' +
      'height:10px;' +
      'width:10px;' +
      '}';

  styles += '.' + anychart.elements.Credits.CssClass.TEXT + '{' +
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

  goog.dom.appendChild(
      goog.dom.getElementsByTagNameAndClass('head')[0],
      css
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
 * Create credits instance.
 * @return {anychart.elements.Credits}
 */
anychart.elements.credits = function() {
  return new anychart.elements.Credits();
};


//exports
goog.exportSymbol('anychart.elements.credits', anychart.elements.credits);
anychart.elements.Credits.prototype['text'] = anychart.elements.Credits.prototype.text;
anychart.elements.Credits.prototype['url'] = anychart.elements.Credits.prototype.url;
anychart.elements.Credits.prototype['alt'] = anychart.elements.Credits.prototype.alt;
anychart.elements.Credits.prototype['logoSrc'] = anychart.elements.Credits.prototype.logoSrc;
