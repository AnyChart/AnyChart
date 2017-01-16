goog.provide('anychart.core.ui.CrosshairLabel');
goog.require('acgraph.math');
goog.require('anychart.core.ui.LabelBase');
goog.require('anychart.math.Rect');
goog.require('goog.math.Coordinate');



/**
 * CrosshairLabel class.
 * @constructor
 * @extends {anychart.core.ui.LabelBase}
 */
anychart.core.ui.CrosshairLabel = function() {
  anychart.core.ui.CrosshairLabel.base(this, 'constructor');

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
  var parentBounds;
  if (!this.parentBounds()) {
    parentBounds = new anychart.math.Rect(0, 0, 0, 0);
    //calculate text width and outer width
    var textElementBounds = this.textElement.getBounds();
    parentBounds.width = this.padding().widenWidth(textElementBounds.width);
    parentBounds.height = this.padding().widenHeight(textElementBounds.height);
  } else {
    parentBounds = /** @type {anychart.math.Rect} */(this.parentBounds());
  }

  var parentWidth = parentBounds.width;
  var parentHeight = parentBounds.height;
  var backgroundBounds = new anychart.math.Rect(0, 0, this.backgroundWidth, this.backgroundHeight);

  // calculate position
  var position = new goog.math.Coordinate(0, 0);

  position.x = this.x_;
  position.y = this.y_;
  var anchor = /** @type {anychart.enums.Anchor} */(this.getFinalAnchor());

  var anchorCoordinate = anychart.utils.getCoordinateByAnchor(
      new anychart.math.Rect(0, 0, this.backgroundWidth, this.backgroundHeight),
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
    clip.shape(this.textX, this.textY, this.textWidth, this.textHeight);
  } else {
    clip = acgraph.clip(this.textX, this.textY, this.textWidth, this.textHeight);
    this.textElement.clip(clip);
  }

  return backgroundBounds;
};


/** @inheritDoc */
anychart.core.ui.CrosshairLabel.prototype.serialize = function() {
  var json = anychart.core.ui.CrosshairLabel.base(this, 'serialize');
  json['axisIndex'] = this.axisIndex_;
  return json;
};


/** @inheritDoc */
anychart.core.ui.CrosshairLabel.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.ui.CrosshairLabel.base(this, 'setupByJSON', config, opt_default);
  this.axisIndex(config['axisIndex']);
  this.anchor(config['anchor']);
  this.textFormatter(config['textFormatter']);
};


(function() {
  var proto = anychart.core.ui.CrosshairLabel.prototype;
  //exports
  proto['axisIndex'] = proto.axisIndex;
  proto['textFormatter'] = proto.textFormatter;
  proto['background'] = proto.background;
  proto['padding'] = proto.padding;
  proto['width'] = proto.width;
  proto['height'] = proto.height;
  proto['anchor'] = proto.anchor;
  proto['offsetX'] = proto.offsetX;
  proto['offsetY'] = proto.offsetY;
  proto['minFontSize'] = proto.minFontSize;
  proto['maxFontSize'] = proto.maxFontSize;
  proto['adjustFontSize'] = proto.adjustFontSize;
  proto['rotation'] = proto.rotation;
})();
