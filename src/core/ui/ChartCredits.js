goog.provide('anychart.core.ui.ChartCredits');
goog.require('anychart.core.Base');



/**
 * Define class Credits.<br/>
 * <b>Note:</b> Use method {@link anychart.ui.credits} to create instance of this class.<br/>
 * <b>Note:</b> You can't customize credits without <u>your licence key</u>. To buy licence key go to
 * <a href="http://www.anychart.com/buy/">Buy page</a>.
 * @param {!anychart.core.Chart} chart Chart.
 * @constructor
 * @extends {anychart.core.Base}
 */
anychart.core.ui.ChartCredits = function(chart) {
  /**
   * Stage gredits.
   * @type {anychart.core.Chart}
   * @private
   */
  this.chart_ = chart;

  anychart.core.ui.ChartCredits.base(this, 'constructor');
};
goog.inherits(anychart.core.ui.ChartCredits, anychart.core.Base);


/** @inheritDoc */
anychart.core.ui.ChartCredits.prototype.SUPPORTED_CONSISTENCY_STATES = anychart.ConsistencyState.APPEARANCE;


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
      if (this[field + '_'] !== opt_value) {
        this[field + '_'] = opt_value;
      }
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REAPPLICATION);
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
 * Getter/setter for image alt.
 * @param {string=} opt_value Alt value.
 * @return {anychart.core.ui.ChartCredits|string} Credits img alt or itself for chaining call.
 */
anychart.core.ui.ChartCredits.prototype.imgAlt = function(opt_value) {
  return /** @type {anychart.core.ui.ChartCredits|string} */(this.getStageCreditsValue_('imgAlt', opt_value));
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
  delete this['imgAlt_'];
  delete this['logoSrc_'];
  delete this['enabled_'];
};


/** @inheritDoc */
anychart.core.ui.ChartCredits.prototype.serialize = function() {
  var json = {};
  var text = this.text();
  var url = this.url();
  var alt = this.alt();
  var imgAlt = this.imgAlt();
  var logoSrc = this.logoSrc();
  var enabled = this.enabled();

  if (goog.isDef(text)) json['text'] = text;
  if (goog.isDef(url)) json['url'] = url;
  if (goog.isDef(alt)) json['alt'] = alt;
  if (goog.isDef(imgAlt)) json['imgAlt'] = imgAlt;
  if (goog.isDef(logoSrc)) json['logoSrc'] = logoSrc;
  if (goog.isDef(enabled)) json['enabled'] = enabled;
  return json;
};


/**
 * Serializes only values that are not passed to stage credits yet.
 * @return {Object}
 */
anychart.core.ui.ChartCredits.prototype.serializeDiff = function() {
  var json = {};
  var text = this['text_'];
  var url = this['url_'];
  var alt = this['alt_'];
  var imgAlt = this['imgAlt_'];
  var logoSrc = this['logoSrc_'];
  var enabled = this['enabled_'];

  if (goog.isDef(text)) json['text'] = text;
  if (goog.isDef(url)) json['url'] = url;
  if (goog.isDef(alt)) json['alt'] = alt;
  if (goog.isDef(imgAlt)) json['imgAlt'] = imgAlt;
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
  this.imgAlt(config['imgAlt']);
  this.logoSrc(config['logoSrc']);
  this.enabled(config['enabled']);
  this.resumeSignalsDispatching(true);
};


//exports
(function() {
  var proto = anychart.core.ui.ChartCredits.prototype;
  proto['text'] = proto.text;//doc|ex
  proto['url'] = proto.url;//doc|ex
  proto['alt'] = proto.alt;//doc|ex
  proto['imgAlt'] = proto.imgAlt;
  proto['logoSrc'] = proto.logoSrc;//doc|ex
  proto['enabled'] = proto.enabled;//doc|ex
})();
