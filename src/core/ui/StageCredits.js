goog.provide('anychart.core.ui.StageCredits');
goog.require('goog.Disposable');
goog.require('goog.dom');



/**
 * Credits class.
 * @param {acgraph.vector.Stage} stage Stage credits belongs to.
 * @param {boolean} disabledByDefault
 * @constructor
 * @extends {goog.Disposable}
 */
anychart.core.ui.StageCredits = function(stage, disabledByDefault) {
  anychart.core.ui.StageCredits.base(this, 'constructor');

  /**
   * Stage.
   * @type {acgraph.vector.Stage}
   * @private
   */
  this.stage_ = stage;

  /**
   * Chart type.
   * Used for the key validation and credits text.
   * @type {string}
   * @private
   */
  this.chartType_ = '';

  /**
   * Array of text strings used for trial/evaluation version credits.
   * These messages are displayed when using an unlicensed version of the product.
   * @type {Array.<string>}
   * @private
   */
  this.creditsText_ = anychart.core.ui.StageCredits.DEFAULT_CREDITS_TEXT;

  /**
   * URL used for trial/evaluation version credits.
   * This URL is opened when user clicks on the credits text.
   * @type {string}
   * @private
   */
  this.creditsUrl_ = anychart.core.ui.StageCredits.DEFAULT_CREDITS_URL;

  /**
   * Color used for trial/evaluation version credits text.
   * This color is used in the css installation process.
   * @type {string}
   * @private
   */
  this.creditsColor_ = anychart.core.ui.StageCredits.DEFAULT_CREDITS_COLOR;

  /**
   * Font weight used for trial/evaluation version credits text.
   * This font weight is used in the css installation process.
   * @type {string}
   * @private
   */
  this.creditsFontWeight_ = anychart.core.ui.StageCredits.DEFAULT_CREDITS_FONT_WEIGHT;

  /**
   * If the credits should be disabled by default.
   * @type {boolean}
   * @private
   */
  this.isDisabledByDefault_ = disabledByDefault;

  /**
   * If we are on anychart domain now.
   * @type {boolean}
   * @private
   */
  this.onAnyChartDomain_ = anychart.core.ui.StageCredits.DOMAIN_REGEXP.test(anychart.window.location.hostname);

  /**
   * Default enabled value is determined by the domain regexp and the constructor param.
   * @type {boolean}
   * @private
   */
  this.enabled_ = !(this.isDisabledByDefault_ || this.onAnyChartDomain_);

  /**
   * State.
   * @type {number}
   * @private
   */
  this.state_ = anychart.core.ui.StageCredits.States.ENABLED |
      anychart.core.ui.StageCredits.States.URL_ALT |
      anychart.core.ui.StageCredits.States.TEXT |
      anychart.core.ui.StageCredits.States.IMAGE;

  /**
   * Array of products included on the stage these credits belong to.
   * Used for validation and trial credits text.
   * @type {Array.<string>}
   * @private
   */
  this.unlicensedProducts_ = [];

  /**
   * Array of chart types included on the stage these credits belong to.
   * Used for adding parameter to the credits url.
   * @type {Array.<string>}
   * @private
   */
  this.chartTypes_ = [];

  /**
   * Flag that indicates if styles are installed.
   * Used to avoid uncontrollable installation of styles multiple times.
   * @type {boolean}
   * @private
   */
  this.installedStyles = false;

  /**
   * A variable that keeps style node.
   * 
   * It is used to reinstall styles if the stage has multiple charts and there is a discrepancy in 
   * validity between them.
   * @type {?Element}
   * @private
   */
  this.styleNode = null;
};
goog.inherits(anychart.core.ui.StageCredits, goog.Disposable);

/**
 * Array of text strings used as default credits messages for trial/evaluation version.
 * These messages are randomly displayed when using an unlicensed version of the product.
 * @type {Array.<string>}
 */
anychart.core.ui.StageCredits.DEFAULT_CREDITS_TEXT = [
  'AnyChart Trial Version',
  'AnyChart - Trial Use Only',
  'UNLICENSED: AnyChart Trial',
  'AnyChart | Evaluation Copy',
  'Trial Version of AnyChart'
];

/**
 * URL used for trial/evaluation version credits.
 * This URL is opened when user clicks on the credits text.
 * @type {string}
 */
anychart.core.ui.StageCredits.DEFAULT_CREDITS_URL = 'https://www.anychart.com/?utm_source=trial';

/**
 * Color used for trial/evaluation version credits text.
 * This color is used in the css installation process.
 * @type {string}
 */
anychart.core.ui.StageCredits.DEFAULT_CREDITS_COLOR = '#929292';

/**
 * Font weight used for trial/evaluation version credits text.
 * This font weight is used in the css installation process.
 * @type {string}
 */
anychart.core.ui.StageCredits.DEFAULT_CREDITS_FONT_WEIGHT = 'normal';

/**
 * Regular expression for domain check.
 * @type {RegExp}
 */
anychart.core.ui.StageCredits.DOMAIN_REGEXP = /^(.*\.)?anychart\.(com|stg|dev)$/i;


//region --- Styles
//------------------------------------------------------------------------------
//
//  Styles
//
//------------------------------------------------------------------------------
/**
 * Installing default css.
 * @private
 */
anychart.core.ui.StageCredits.prototype.installStyles_ = function() {
  var styles = '';
  var css = goog.dom.createDom(goog.dom.TagName.STYLE);

  var cssIdCredits = this.domElement_.id;
  var cssIdLogo = this.image_.id;
  var cssIdText = this.span_.id;

  var creditsColor = this.trialCreditsColor();
  var creditsFontWeight = this.trialCreditsFontWeight();
  css.type = 'text/css';

  styles += '#' + cssIdCredits + '{' +
      'position:absolute;' +
      'overflow:hidden;' +
      'right:9px;' +
      'bottom:6px;' +
      'height:10px;' +
      '}';

  styles += '#' + cssIdCredits + ' a {' +
      'text-decoration:none;' +
      '}';

  styles += '#' + cssIdLogo + '{' +
      'border:none;' +
      'margin-right:2px;' +
      'height:10px;' +
      'width:10px;' +
      'display:inline-block;' +
      'vertical-align:top;' +
      '}';

  styles += '#' + cssIdText + '{' +
      'font-size:10px;' +
      'line-height:9px;' +
      'display:inline-block;' +
      'vertical-align:top;' +
      'text-decoration:none;' +
      'font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;' +
      'color: ' + creditsColor + ';' +
      'font-weight: ' + creditsFontWeight + ';' +
      'height:10px;' +
      '}';

  if (css.styleSheet)
    css['styleSheet']['cssText'] = styles;
  else
    goog.dom.appendChild(css, goog.dom.createTextNode(styles));

  goog.dom.insertChildAt(
      goog.dom.getElementsByTagNameAndClass('head')[0],
      css, 0
  );
  this.styleNode = css;
  this.installedStyles = true;
};


//endregion
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
  return ('https:' == anychart.window.location.protocol ? 'https://' : 'http://') + url;
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
      if (this.isValid() || this.isDisabledByDefault_)
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
 * Getter/setter for image alt.
 * @param {string=} opt_value alt.
 * @return {string|anychart.core.ui.StageCredits} alt or self for chaining.
 */
anychart.core.ui.StageCredits.prototype.imgAlt = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.imgAlt_ != opt_value) {
      this.imgAlt_ = opt_value;
      if (this.isValid())
        this.invalidate(anychart.core.ui.StageCredits.States.URL_ALT, true);
    }
    return this;
  }
  return this.imgAlt_;
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
 * Gets or sets the chart type associated with these credits.
 * The chart type is used for license validation and determining appropriate credits text.
 * @param {(string)=} opt_value Optional chart type value to set. A string containing chart type information.
 * @return {(string|anychart.core.ui.StageCredits)} Current chart type if no parameter passed, or if value was set this instance for method chaining.
 * @private
 */
anychart.core.ui.StageCredits.prototype.chartType = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.chartType_ = opt_value;
    return this;
  }
  return this.chartType_;
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


/**
 * Gets or sets the array of text strings used for trial/evaluation version credits.
 * These messages are displayed when using an unlicensed version of the product.
 * @param {Array<string>=} opt_stringArray Optional array of credits text strings to set
 * @return {Array<string>} Current array of credits text strings
 * @private
 */
anychart.core.ui.StageCredits.prototype.trialCreditsText = function(opt_stringArray) {
  if (goog.isDefAndNotNull(opt_stringArray)) {
    this.creditsText_ = opt_stringArray;
    this.invalidate(anychart.core.ui.StageCredits.States.TEXT, false);
  }
  return this.creditsText_;
};


/**
 * Gets or sets the URL used for trial/evaluation version credits.
 * This URL is opened when user clicks on the credits text.
 * @param {string=} opt_url Optional URL to set.
 * @return {string} Current URL.
 */
anychart.core.ui.StageCredits.prototype.trialCreditsUrl = function(opt_url) {
  if (goog.isDefAndNotNull(opt_url)) {
    this.creditsUrl_ = opt_url;
    this.invalidate(anychart.core.ui.StageCredits.States.URL_ALT, false);
  }
  return this.creditsUrl_;
};


/**
 * Gets or sets the color used for trial/evaluation version credits text.
 * This color is used in the CSS installation process.
 * @param {string=} opt_color Optional color to set.
 * @return {string} Current color.
 */
anychart.core.ui.StageCredits.prototype.trialCreditsColor = function(opt_color) {
  if (goog.isDefAndNotNull(opt_color)) {
    this.creditsColor_ = opt_color;
    this.invalidate(anychart.core.ui.StageCredits.States.URL_ALT, false);
  }
  return this.creditsColor_;
};


/**
 * Gets or sets the font weight used for trial/evaluation version credits text.
 * This font weight is used in the CSS installation process.
 * @param {string=} opt_weight Optional font weight to set.
 * @return {string} Current font weight.
 */
anychart.core.ui.StageCredits.prototype.trialCreditsFontWeight = function(opt_weight) {
  if (goog.isDefAndNotNull(opt_weight)) {
    this.creditsFontWeight_ = opt_weight;
    this.invalidate(anychart.core.ui.StageCredits.States.URL_ALT, false);
  }
  return this.creditsFontWeight_;
};


//endregion
//region --- UTILS ---
//endregion
//region --- DRAWING ---
/**
 * Renders credits.
 * @return {anychart.core.ui.StageCredits} Self for chaining.
 */
anychart.core.ui.StageCredits.prototype.render = function() {
  var valid = this.isValid();

  if (valid && (goog.isDef(this.prevValidState) && !this.prevValidState)) {
    this.invalidate(
      anychart.core.ui.StageCredits.States.ENABLED |
      /*
       Text invalidation is needed here in case of a multiple charts per stage, and use of the new valid key that is
       licensed for all the charts on the stage.
       */
      anychart.core.ui.StageCredits.States.TEXT, 
      false
    );
  }
  this.prevValidState = valid;

  if (this.isConsistent() || this.isDisposed() || !this.stage_ || this.stage_.isSuspended())
    return this;

  if (!this.enabled() && (this.isDisabledByDefault_ || valid)) {
    if (this.hasInvalidationState(anychart.core.ui.StageCredits.States.ENABLED)) {
      goog.dom.removeNode(this.domElement_);
      this.markConsistent(anychart.core.ui.StageCredits.States.ENABLED);
    }
    return this;
  }

  // An array of decoy prefixes for dom element id.
  var cssIdPrefix = ['chart', 'layer', 'path'];

  if (!this.domElement_) {
    this.domElement_ = goog.dom.createDom(goog.dom.TagName.DIV);
    // A random prefix is used to make an id of the dom element less predictable.
    var domElementId = acgraph.utils.IdGenerator.getInstance().generateId(this.domElement_, cssIdPrefix[Math.floor(Math.random() * 3)]);
    this.domElement_.id = domElementId;
  }

  if (!this.a_) {
    this.a_ = goog.dom.createDom(goog.dom.TagName.A);
    this.span_ = goog.dom.createDom(goog.dom.TagName.SPAN);
    // A random prefix is used to make an id of the span less predictable.
    var spanId = acgraph.utils.IdGenerator.getInstance().generateId(this.span_, cssIdPrefix[Math.floor(Math.random() * 3)]);
    this.span_.id = spanId;

    this.image_ = goog.dom.createDom(goog.dom.TagName.IMG);
    // A random prefix is used to make an id of the image less predictable.
    var imageId = acgraph.utils.IdGenerator.getInstance().generateId(this.image_, cssIdPrefix[Math.floor(Math.random() * 3)]);
    this.image_.id = imageId;

    goog.dom.append(this.a_, this.span_);
    goog.dom.appendChild(this.domElement_, this.a_);
  }

  // As it is now an instance method, to avoid installing styles multiple times, the flag is used.
  if (!this.installedStyles) {
    this.installStyles_();
  }

  var containerElement = this.stage_.getDomWrapper();
  if (this.hasInvalidationState(anychart.core.ui.StageCredits.States.ENABLED)) {
    if (containerElement)
      // A random place is used to put the dom element inside the container.
      goog.dom.insertChildAt(containerElement, this.domElement_, Math.floor(Math.random() * 3));
    this.markConsistent(anychart.core.ui.StageCredits.States.ENABLED);
  }

  if (this.hasInvalidationState(anychart.core.ui.StageCredits.States.URL_ALT)) {
    var version = anychart.VERSION ?
        goog.string.subs.apply(null, [', v%s.%s.%s.%s'].concat(anychart.VERSION.split('.'))) :
        '';
    var defaultTitle = 'AnyChart - JavaScript Charts designed to be embedded and integrated{{anychart-version}}';
    var title = valid ? this.alt() : defaultTitle;
    goog.dom.setProperties(this.a_, {
      'href': valid ? this.url() : this.trialCreditsUrl(),
      'title': title.replace('{{anychart-version}}', version),
      'target': '_blank'
    });
    goog.dom.setProperties(this.image_, {
      'alt': valid ? this.imgAlt() : 'AnyChart - JavaScript Charts'
    });

    /*
     In case of multiple charts per stage, the styles are reinstalled as it is possible that the first chart will
     have a different validity from any of the rest.
     This reinstallation is done only if the styles are installed and color or font weight were changed.
     This can and will cause a repaint and a reflow, but since stage is drawn before most of the visible elements
     the impact is minimal.
     */
    if (this.installedStyles) {
      var selectorText = '#' + this.span_.id;
      var newFontWeight = this.trialCreditsFontWeight();
      var newColor = this.trialCreditsColor();
      if (this.styleNode) {
        var styleSheet = this.styleNode.sheet;
        var rules = styleSheet.cssRules;
        for (var i = 0; i < rules.length; i++) {
          var rule = rules[i];
          if (rule.selectorText && rule.selectorText.toLowerCase() === selectorText.toLowerCase()) {
            rule.style.setProperty('font-weight', newFontWeight);
            rule.style.setProperty('color', newColor);
          }
        }
      }
    }
    this.markConsistent(anychart.core.ui.StageCredits.States.URL_ALT);
  }

  if (this.hasInvalidationState(anychart.core.ui.StageCredits.States.TEXT)) {
    // The array is used to display trial version credits. It's backed up to ensure that credits will be shown.
    var lineVariants = this.trialCreditsText();
    // If the license key is valid, the text is not changed. If it isn't the random text from the array will be shown.
    var text = valid ? this.text() : lineVariants[Math.floor(Math.random() * lineVariants.length)];
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
 * Checks if credits should be displayed based on license validation.
 * For old license keys, displays a special old-key-credits.
 * For new license keys, checks if the current chart type is licensed. And displays a warning message if it isn't.
 * For stage that has multiple charts, displays a special message if there are unlicensed products.
 * Always omit credits on AnyChart domains.
 * @return {boolean} Whether credits should be displayed
 */
anychart.core.ui.StageCredits.prototype.isValid = function() {
  /*
   The old validation function can say if the key old and valid or new and valid yet it's limited in telling us which
   product is valid for the new key and which chart is displayed on a stage of these credits.
   */
  var isValidKey = anychart.isValidKey();
  var isLicensedProduct = false;
  /*
   There are credits in every stage meaning there are credits in the tooltip that are erroring out even if
   they aren't visible. For that case we need to check if the chartType_ was populated before using it.
   */
  var chartType = this.chartType_;
  if (isValidKey && chartType){
    var chartsProduct = anychart.CHART_PRODUCTS;
    var licensedProducts = anychart.licensedProducts();

    // For the trialCreditsUrl two URL parameters are needed, so they are prepared by encoding.
    var licenseKey = (/** @type {string} */(anychart.licenseKey()));
    var base64EncodedKey = btoa(licenseKey);
    var reversedBase64EncodedKey = base64EncodedKey.split('').reverse().join('');
    var finalEncodedURLKey = encodeURIComponent(reversedBase64EncodedKey);

    /*
     As there is a possibility that there are more than one chart per stage, the chartTypes_ array is used to store all
     chart types that are displayed on a stage of these credits.
     We don't need to validate chart of the recorded chartTypes_ as the chart type is used only in the case of
     valid old key, which expected to not have any product licenses in it.
     */
    if (this.chartTypes_.indexOf(chartType) === -1) {
      this.chartTypes_.push(chartType);
    }

    var chartTypesString = this.chartTypes_.join(', ');
    var base64EncodedChartType = btoa(chartTypesString);
    var reversedBase64EncodedChartType = base64EncodedChartType.split('').reverse().join('');
    var finalEncodedURLChartType = encodeURIComponent(reversedBase64EncodedChartType);

    if (Object.keys(licensedProducts).length === 0) {
      // If there are no licensed products and it is a valid license key it is an old key, show the old-key-credits.
      this.trialCreditsText(['License key is obsolete. Click to contact AnyChart.']);
      this.trialCreditsUrl('https://www.anychart.com/license/new?k=' + finalEncodedURLKey + '&m=' + finalEncodedURLChartType);
      this.trialCreditsFontWeight('bold');
    } else {
      /*
       If there are licensed products and it's a valid key, it's a new key, check if the chart that is displayed on
       a stage of these credits is licensed.
       */
      var product = '';
      for (var key in chartsProduct) {
        if (chartsProduct[key].indexOf(chartType) !== -1) {
          product = key;
          break;
        }
      }
      /*
       If the chart is licensed, check if there are unlicensed products on the stage. If there are, behave as if this
       chart is unlicensed, but don't add the product of this chart to the unlicensed list.
       */
      if (licensedProducts[product]) {
        isLicensedProduct = this.unlicensedProducts_.length === 0 ? true : false;
      } else {
        /*
         If there are unlicensed products, add products to a list in case of multiple charts per stage. Show the 
         unlicensed-products-credits.
         */
        if (this.unlicensedProducts_.indexOf(product) === -1) this.unlicensedProducts_.push(product);
        this.trialCreditsText(['Unlicensed module: ' + this.unlicensedProducts_.join(', ') + '. Click to get a license.']);
        this.trialCreditsUrl('https://www.anychart.com/license/modules?k=' + finalEncodedURLKey + '&m=' + finalEncodedURLChartType);
        this.trialCreditsColor('red');
        /*
         The change of enabled_ isn't done through the this.enabled(true) as it will create an endless loop.
         The change and invalidation are done here in case of multiple licensed and unlicensed charts displayed on the
         same stage.
         */
        this.enabled_ = !(this.isDisabledByDefault_ || this.onAnyChartDomain_);
        this.invalidate(anychart.core.ui.StageCredits.States.ENABLED, false);
      }
    }
  }

  /*
   Should be return isValidKey && isLicensedProduct || this.onAnyChartDomain_, but
   isLicensedProduct is always false if isValidKey is false,
   isLicensedProduct is true or false if the isValidKey is true.
   */
  return isLicensedProduct || this.onAnyChartDomain_;
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
  if (!this.isDisposed() && this.getFinalSrc() == src)
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
 * @param {*} config Config.
 */
anychart.core.ui.StageCredits.prototype.setup = function(config) {
  this.stage_.suspend();
  if (goog.isString(config)) {
    this.text(/** @type {string} */(config));
    this.enabled(true);
  } else if (goog.isBoolean(config) || goog.isNull(config)) {
    this.enabled(!!config);
  } else if (goog.isObject(config)) {
    this.url(config['url']);
    this.text(config['text']);
    this.alt(config['alt']);
    this.imgAlt(config['imgAlt']);
    this.logoSrc(config['logoSrc']);
    this.enabled(config['enabled']);
    this.chartType(config['chartType']);
  }
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
  json['imgAlt'] = this.imgAlt();
  json['text'] = this.text();
  json['logoSrc'] = this.logoSrc();
  json['enabled'] = this.enabled();
  return json;
};


/** @inheritDoc */
anychart.core.ui.StageCredits.prototype.disposeInternal = function() {
  if (acgraph.getRenderer().isImageLoader()) {
    var imageLoader = acgraph.getRenderer().getImageLoader();

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
(function() {
  var proto = anychart.core.ui.StageCredits.prototype;
  proto['text'] = proto.text;
  proto['url'] = proto.url;
  proto['alt'] = proto.alt;
  proto['imgAlt'] = proto.imgAlt;
  proto['logoSrc'] = proto.logoSrc;
  proto['enabled'] = proto.enabled;
})();
