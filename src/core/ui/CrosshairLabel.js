goog.provide('anychart.core.ui.CrosshairLabel');
goog.require('anychart.core.ui.LabelBase');



/**
 * CrosshairLabel class.
 * @constructor
 * @extends {anychart.core.ui.LabelBase}
 */
anychart.core.ui.CrosshairLabel = function() {
  goog.base(this);

  /**
   * @type {number}
   * @private
   */
  this.axisIndex_ = 0;

  /**
   * @type {number}
   * @private
   */
  this.x_ = NaN;

  /**
   * @type {number}
   * @private
   */
  this.y_ = NaN;

  /**
   * Label text formatting function, by default we use value field of the format provider.
   * @type {Function}
   * @private
   */
  this.textFormatter_ = null;
};
goog.inherits(anychart.core.ui.CrosshairLabel, anychart.core.ui.LabelBase);


/**
 * Supported signals.
 * @type {number}
 */
anychart.core.ui.CrosshairLabel.prototype.SUPPORTED_SIGNALS =
    anychart.core.ui.LabelBase.prototype.SUPPORTED_SIGNALS |
    anychart.Signal.NEEDS_REAPPLICATION;


/**
 * Gets/Sets axis index.
 * @param {number=} opt_value
 * @return {!(number|anychart.core.ui.CrosshairLabel)}
 */
anychart.core.ui.CrosshairLabel.prototype.axisIndex = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.axisIndex_ != opt_value) {
      this.axisIndex_ = opt_value;
      this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
    }
    return this;
  } else {
    return this.axisIndex_;
  }
};


/**
 * Gets/Sets format provider.
 * @param {*=} opt_value Format provider.
 * @return {*} Format provider or self for chaining.
 */
anychart.core.ui.CrosshairLabel.prototype.formatProvider = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.formatProvider_ != opt_value) {
      this.formatProvider_ = opt_value;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.formatProvider_;
  }
};


/**
 * Gets or sets labels text formatter function.
 * @param {Function=} opt_value Labels text formatter function.
 * @return {Function|anychart.core.ui.CrosshairLabel} Labels text formatter function or Labels instance for chaining call.
 */
anychart.core.ui.CrosshairLabel.prototype.textFormatter = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.textFormatter_ = opt_value;
    this.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.BOUNDS,
        anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    return this;
  } else {
    return this.textFormatter_;
  }
};


/**
 * Sets X coord.
 * @param {number} value
 * @return {anychart.core.ui.CrosshairLabel}
 */
anychart.core.ui.CrosshairLabel.prototype.x = function(value) {
  if (goog.isDef(value)) {
    if (this.x_ != value) {
      this.x_ = value;
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
  }
  return this;
};


/**
 * Sets Y coord.
 * @param {number} value
 * @return {anychart.core.ui.CrosshairLabel}
 */
anychart.core.ui.CrosshairLabel.prototype.y = function(value) {
  if (goog.isDef(value)) {
    if (this.y_ != value) {
      this.y_ = value;
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
  }
  return this;
};


/**
 * Label drawing.
 * @return {anychart.math.Rect}
 * @protected
 */
anychart.core.ui.CrosshairLabel.prototype.drawLabel = function() {
  //bounds
  var parentBounds = /** @type {anychart.math.Rect} */(this.parentBounds()) || anychart.math.rect(0, 0, 0, 0);
  var parentWidth = parentBounds.width;
  var parentHeight = parentBounds.height;
  var backgroundBounds = new anychart.math.Rect(0, 0, this.backgroundWidth, this.backgroundHeight);

  // calculate position
  var position = new acgraph.math.Coordinate(0, 0);

  position.x = this.x_;
  position.y = this.y_;
  var anchor = /** @type {anychart.enums.Anchor} */(this.getFinalAnchor());

  var anchorCoordinate = anychart.utils.getCoordinateByAnchor(
      new acgraph.math.Rect(0, 0, this.backgroundWidth, this.backgroundHeight),
      anchor);

  position.x -= anchorCoordinate.x;
  position.y -= anchorCoordinate.y;

  var rawOffsetX = /** @type {number|string} */(this.offsetX());
  var rawOffsetY = /** @type {number|string} */(this.offsetY());

  var offsetX = goog.isDef(rawOffsetX) ? anychart.utils.normalizeSize(rawOffsetX, parentWidth) : 0;
  var offsetY = goog.isDef(rawOffsetY) ? anychart.utils.normalizeSize(rawOffsetY, parentHeight) : 0;
  anychart.utils.applyOffsetByAnchor(position, anchor, offsetX, offsetY);

  this.textX += position.x;
  this.textY += position.y;
  backgroundBounds.left = position.x;
  backgroundBounds.top = position.y;

  this.textElement.x(/** @type {number} */(this.textX)).y(/** @type {number} */(this.textY));
  var clip = this.textElement.clip();
  if (clip) {
    clip.bounds(this.textX, this.textY, this.textWidth, this.textHeight);
  } else {
    clip = new acgraph.vector.Clip(null, this.textX, this.textY, this.textWidth, this.textHeight);
    this.textElement.clip(clip);
  }

  return backgroundBounds;
};


/** @inheritDoc */
anychart.core.ui.CrosshairLabel.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');
  json['axisIndex'] = this.axisIndex_;
  return json;
};


/** @inheritDoc */
anychart.core.ui.CrosshairLabel.prototype.setupByJSON = function(config) {
  goog.base(this, 'setupByJSON', config);
  this.axisIndex(config['axisIndex']);
  this.anchor(config['anchor']);
  this.textFormatter(config['textFormatter']);
};


//exports
anychart.core.ui.CrosshairLabel.prototype['axisIndex'] = anychart.core.ui.CrosshairLabel.prototype.axisIndex;
anychart.core.ui.CrosshairLabel.prototype['textFormatter'] = anychart.core.ui.CrosshairLabel.prototype.textFormatter;
anychart.core.ui.CrosshairLabel.prototype['background'] = anychart.core.ui.CrosshairLabel.prototype.background;
anychart.core.ui.CrosshairLabel.prototype['padding'] = anychart.core.ui.CrosshairLabel.prototype.padding;
anychart.core.ui.CrosshairLabel.prototype['width'] = anychart.core.ui.CrosshairLabel.prototype.width;
anychart.core.ui.CrosshairLabel.prototype['height'] = anychart.core.ui.CrosshairLabel.prototype.height;
anychart.core.ui.CrosshairLabel.prototype['anchor'] = anychart.core.ui.CrosshairLabel.prototype.anchor;
anychart.core.ui.CrosshairLabel.prototype['offsetX'] = anychart.core.ui.CrosshairLabel.prototype.offsetX;
anychart.core.ui.CrosshairLabel.prototype['offsetY'] = anychart.core.ui.CrosshairLabel.prototype.offsetY;
anychart.core.ui.CrosshairLabel.prototype['minFontSize'] = anychart.core.ui.CrosshairLabel.prototype.minFontSize;
anychart.core.ui.CrosshairLabel.prototype['maxFontSize'] = anychart.core.ui.CrosshairLabel.prototype.maxFontSize;
anychart.core.ui.CrosshairLabel.prototype['adjustFontSize'] = anychart.core.ui.CrosshairLabel.prototype.adjustFontSize;
anychart.core.ui.CrosshairLabel.prototype['rotation'] = anychart.core.ui.CrosshairLabel.prototype.rotation;
