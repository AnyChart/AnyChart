goog.provide('anychart.core.utils.QuarterSettings');
goog.require('anychart.core.Base');
goog.require('anychart.core.utils.Quarter');



/**
 * Quarter settings class.
 * @param {anychart.core.ChartWithAxes} chart
 * @extends {anychart.core.Base}
 * @constructor
 */
anychart.core.utils.QuarterSettings = function(chart) {
  anychart.core.utils.QuarterSettings.base(this, 'constructor');

  this.addThemes('chart.defaultQuarterSettings');

  this.chart_ = chart;

  /**
   * Right top quarter.
   * @type {anychart.core.utils.Quarter}
   * @private
   */
  this.rightTop_ = null;

  /**
   * Left top quarter.
   * @type {anychart.core.utils.Quarter}
   * @private
   */
  this.leftTop_ = null;

  /**
   * Left bottom quarter.
   * @type {anychart.core.utils.Quarter}
   * @private
   */
  this.leftBottom_ = null;

  /**
   * Right bottom quarter.
   * @type {anychart.core.utils.Quarter}
   * @private
   */
  this.rightBottom_ = null;

  /**
   * @type {Array.<anychart.core.utils.Quarter>}
   * @private
   */
  this.quarters_ = [];
};
goog.inherits(anychart.core.utils.QuarterSettings, anychart.core.Base);


//region --- Own API
/**
 * Getter for items.
 * @return {Array.<anychart.core.utils.Quarter>}
 */
anychart.core.utils.QuarterSettings.prototype.getItems = function() {
  if (!this.rightTop_) this.getCreated('rightTop');
  if (!this.leftBottom_) this.getCreated('leftBottom');
  if (!this.rightBottom_) this.getCreated('rightBottom');
  if (!this.leftTop_) this.getCreated('leftTop');

  return this.quarters_;
};


//endregion
//region --- Common quarter settings


//endregion
//region --- Quarter getters/setters
/**
 * Getter/setter for right top quarter.
 * @param {Object=} opt_value Quarter settings.
 * @return {anychart.core.utils.Quarter|anychart.core.utils.QuarterSettings} Quarter or quarter settings.
 */
anychart.core.utils.QuarterSettings.prototype.rightTop = function(opt_value) {
  if (!this.rightTop_) {
    this.rightTop_ = new anychart.core.utils.Quarter();
    this.rightTop_.listenSignals(this.chart_.quarterInvalidated, this.chart_);
    this.quarters_[0] = this.rightTop_;
    this.setupCreated('rightTop', this.rightTop_);
  }
  if (goog.isDef(opt_value)) {
    this.rightTop_.setup(opt_value);
    return this;
  }
  return this.rightTop_;
};


/**
 * Getter/setter for left top quarter.
 * @param {Object=} opt_value Quarter settings.
 * @return {anychart.core.utils.Quarter|anychart.core.utils.QuarterSettings} Quarter or quarter settings.
 */
anychart.core.utils.QuarterSettings.prototype.leftTop = function(opt_value) {
  if (!this.leftTop_) {
    this.leftTop_ = new anychart.core.utils.Quarter();
    this.leftTop_.listenSignals(this.chart_.quarterInvalidated, this.chart_);
    this.quarters_[1] = this.leftTop_;
    this.setupCreated('leftTop', this.leftTop_);
  }
  if (goog.isDef(opt_value)) {
    this.leftTop_.setup(opt_value);
    return this;
  }
  return this.leftTop_;
};


/**
 * Getter/setter for left bottom quarter.
 * @param {Object=} opt_value Quarter settings.
 * @return {anychart.core.utils.Quarter|anychart.core.utils.QuarterSettings} Quarter or quarter settings.
 */
anychart.core.utils.QuarterSettings.prototype.leftBottom = function(opt_value) {
  if (!this.leftBottom_) {
    this.leftBottom_ = new anychart.core.utils.Quarter();
    this.leftBottom_.listenSignals(this.chart_.quarterInvalidated, this.chart_);
    this.quarters_[2] = this.leftBottom_;
    this.setupCreated('leftBottom', this.leftBottom_);
  }
  if (goog.isDef(opt_value)) {
    this.leftBottom_.setup(opt_value);
    return this;
  }
  return this.leftBottom_;
};


/**
 * Getter/setter for right bottom quarter.
 * @param {Object=} opt_value Quarter settings.
 * @return {anychart.core.utils.Quarter|anychart.core.utils.QuarterSettings} Quarter or quarter settings.
 */
anychart.core.utils.QuarterSettings.prototype.rightBottom = function(opt_value) {
  if (!this.rightBottom_) {
    this.rightBottom_ = new anychart.core.utils.Quarter();
    this.rightBottom_.listenSignals(this.chart_.quarterInvalidated, this.chart_);
    this.quarters_[3] = this.rightBottom_;
    this.setupCreated('rightBottom', this.rightBottom_);
  }
  if (goog.isDef(opt_value)) {
    this.rightBottom_.setup(opt_value);
    return this;
  }
  return this.rightBottom_;
};


//endregion
//region --- Setup/dispose
/** @inheritDoc */
anychart.core.utils.QuarterSettings.prototype.serialize = function() {
  var json = anychart.core.utils.QuarterSettings.base(this, 'serialize');
  if (this.rightTop_)
    json['rightTop'] = this.rightTop_.serialize();
  if (this.leftTop_)
    json['leftTop'] = this.leftTop_.serialize();
  if (this.leftBottom_)
    json['leftBottom'] = this.leftBottom_.serialize();
  if (this.rightBottom_)
    json['rightBottom'] = this.rightBottom_.serialize();
  return json;
};


/** @inheritDoc */
anychart.core.utils.QuarterSettings.prototype.setupByJSON = function(config) {
  anychart.core.utils.QuarterSettings.base(this, 'setupByJSON', config);
  this.rightTop(config['rightTop']);
  this.leftTop(config['leftTop']);
  this.leftBottom(config['leftBottom']);
  this.rightBottom(config['rightBottom']);
};


/** @inheritDoc */
anychart.core.utils.QuarterSettings.prototype.disposeInternal = function() {
  goog.disposeAll(this.rightTop_, this.leftTop_, this.leftBottom_, this.rightBottom_);
  this.rightTop_ = null;
  this.leftTop_ = null;
  this.leftBottom_ = null;
  this.rightBottom_ = null;
  this.quarters_.length = 0;
  anychart.core.utils.QuarterSettings.base(this, 'disposeInternal');
};
//endregion
//region --- Exports
(function() {
  var proto = anychart.core.utils.QuarterSettings.prototype;
  proto['rightTop'] = proto.rightTop;
  proto['leftTop'] = proto.leftTop;
  proto['leftBottom'] = proto.leftBottom;
  proto['rightBottom'] = proto.rightBottom;
})();
//endregion
