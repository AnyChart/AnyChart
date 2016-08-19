goog.provide('anychart.core.ui.ChartCredits');
goog.require('anychart.core.Base');



/**
 * Define class Credits.<br/>
 * <b>Note:</b> Use method {@link anychart.ui.credits} to create instance of this class.<br/>
 * <b>Note:</b> You can't customize credits without <u>your licence key</u>. To buy licence key go to
 * <a href="http://www.anychart.com/buy/">Buy page</a>.
 * @param {!anychart.core.ChartWithCredits} chart Chart.
 * @constructor
 * @extends {anychart.core.Base}
 */
anychart.core.ui.ChartCredits = function(chart) {
  /**
   * Stage gredits.
   * @type {anychart.core.ChartWithCredits}
   * @private
   */
  this.chart_ = chart;

  goog.base(this);
};
goog.inherits(anychart.core.ui.ChartCredits, anychart.core.Base);


/** @inheritDoc */
anychart.core.ui.ChartCredits.prototype.SUPPORTED_SIGNALS = anychart.Signal.NEEDS_REAPPLICATION;


/**
 * @type {string}
 * @private
 */
anychart.core.ui.ChartCredits.prototype.text_;


/**
 * @type {string}
 * @private
 */
anychart.core.ui.ChartCredits.prototype.url_;


/**
 * @type {string}
 * @private
 */
anychart.core.ui.ChartCredits.prototype.alt_;


/**
 * @type {string}
 * @private
 */
anychart.core.ui.ChartCredits.prototype.logoSrc_;


/**
 * @type {?boolean}
 * @private
 */
anychart.core.ui.ChartCredits.prototype.enabled_;


/**
 * Universal credits properties setter.
 * @param {string} field
 * @param {(string|boolean|null)=} opt_value
 * @return {string|boolean|null|anychart.core.ui.ChartCredits}
 * @private
 */
anychart.core.ui.ChartCredits.prototype.getStageCreditsValue_ = function(field, opt_value) {
  var stageCredits = this.chart_.container() ? this.chart_.container().getStage().credits() : null;
  if (stageCredits) {
    if (goog.isDef(opt_value)) {
      stageCredits[field](opt_value);
      return this;
    }
    return stageCredits[field]();
  } else {
    if (goog.isDef(opt_value)) {
      if (this[field + '_'] != opt_value) {
        this[field + '_'] = opt_value;
      }
      this.invalidate(anychart.Signal.NEEDS_REAPPLICATION);
      return this;
    } else {
      return this[field + '_'];
    }
  }
};


/**
 * Getter/setter for text.
 * @param {string=} opt_value Text value.
 * @return {anychart.core.ui.ChartCredits|string} Credits text or itself for chaining call.
 */
anychart.core.ui.ChartCredits.prototype.text = function(opt_value) {
  return /** @type {anychart.core.ui.ChartCredits|string} */(this.getStageCreditsValue_('text', opt_value));
};


/**
 * Getter/setter for url.
 * @param {string=} opt_value Url value.
 * @return {anychart.core.ui.ChartCredits|string} Credits url or itself for chaining call.
 */
anychart.core.ui.ChartCredits.prototype.url = function(opt_value) {
  return /** @type {anychart.core.ui.ChartCredits|string} */(this.getStageCreditsValue_('url', opt_value));
};


/**
 * Getter/setter for alt.
 * @param {string=} opt_value Title value.
 * @return {anychart.core.ui.ChartCredits|string} Credits alt or itself for chaining call.
 */
anychart.core.ui.ChartCredits.prototype.alt = function(opt_value) {
  return /** @type {anychart.core.ui.ChartCredits|string} */(this.getStageCreditsValue_('alt', opt_value));
};


/**
 * Getter/setter for logoSrc.
 * @param {string=} opt_value Logo src value.
 * @return {anychart.core.ui.ChartCredits|string} Credits logo src or itself for chaining call.
 */
anychart.core.ui.ChartCredits.prototype.logoSrc = function(opt_value) {
  return /** @type {anychart.core.ui.ChartCredits|string} */(this.getStageCreditsValue_('logoSrc', opt_value));
};


/**
 * Getter/setter for enabled.
 * @param {?boolean=} opt_value Value to set.
 * @return {!anychart.core.ui.ChartCredits|boolean|null} .
 */
anychart.core.ui.ChartCredits.prototype.enabled = function(opt_value) {
  return /** @type {anychart.core.ui.ChartCredits|boolean|null} */(this.getStageCreditsValue_('enabled', opt_value));
};


/**
 * Drops self settings.
 */
anychart.core.ui.ChartCredits.prototype.dropSettings = function() {
  delete this['text_'];
  delete this['url_'];
  delete this['alt_'];
  delete this['logoSrc_'];
  delete this['enabled_'];
};


/** @inheritDoc */
anychart.core.ui.ChartCredits.prototype.serialize = function() {
  var json = {};
  var text = goog.isDef(this['text_']) ? this['text_'] : this.text();
  var url = goog.isDef(this['url_']) ? this['url_'] : this.url();
  var alt = goog.isDef(this['alt_']) ? this['alt_'] : this.alt();
  var logoSrc = goog.isDef(this['logoSrc_']) ? this['logoSrc_'] : this.logoSrc();
  var enabled = goog.isDef(this['enabled_']) ? this['enabled_'] : this.enabled();

  if (goog.isDef(text)) json['text'] = text;
  if (goog.isDef(url)) json['url'] = url;
  if (goog.isDef(alt)) json['alt'] = alt;
  if (goog.isDef(logoSrc)) json['logoSrc'] = logoSrc;
  if (goog.isDef(enabled)) json['enabled'] = enabled;
  return json;
};


/** @inheritDoc */
anychart.core.ui.ChartCredits.prototype.setupSpecial = function(var_args) {
  var arg0 = arguments[0];
  if (goog.isString(arg0)) {
    this.text(arg0);
    this.enabled(true);
    return true;
  } else if (goog.isBoolean(arg0) || goog.isNull(arg0)) {
    this.enabled(!!arg0);
    return true;
  }
  return anychart.core.Base.prototype.setupSpecial.apply(this, arguments);
};


/** @inheritDoc */
anychart.core.ui.ChartCredits.prototype.setupByJSON = function(config) {
  this.suspendSignalsDispatching();
  this.text(config['text']);
  this.url(config['url']);
  this.alt(config['alt']);
  this.logoSrc(config['logoSrc']);
  this.enabled(config['enabled']);
  this.resumeSignalsDispatching(true);
};


//exports
anychart.core.ui.ChartCredits.prototype['text'] = anychart.core.ui.ChartCredits.prototype.text;//doc|ex
anychart.core.ui.ChartCredits.prototype['url'] = anychart.core.ui.ChartCredits.prototype.url;//doc|ex
anychart.core.ui.ChartCredits.prototype['alt'] = anychart.core.ui.ChartCredits.prototype.alt;//doc|ex
anychart.core.ui.ChartCredits.prototype['logoSrc'] = anychart.core.ui.ChartCredits.prototype.logoSrc;//doc|ex
anychart.core.ui.ChartCredits.prototype['enabled'] = anychart.core.ui.ChartCredits.prototype.enabled;//doc|ex
