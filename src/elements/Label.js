goog.provide('anychart.elements.Label');
goog.require('anychart.elements.Background');
goog.require('anychart.elements.Text');
goog.require('anychart.math.Coordinate');
goog.require('anychart.utils.Padding');
goog.require('anychart.utils.ZIndexedLayer');



/**
 * Этот класс предназначен для рисования лейблов по абсолютным координатам в конкретный конейнер.
 * @constructor
 * @extends {anychart.elements.Text}
 */
anychart.elements.Label = function() {
  goog.base(this);

  /**
   * Label background.
   * @type {anychart.elements.Background}
   * @private
   */
  this.background_ = null;

  /**
   * Label padding settings.
   * @type {anychart.utils.Padding}
   * @private
   */
  this.padding_ = null;

  /**
   * Label width settings.
   * @type {string|number|null}
   * @private
   */
  this.width_ = null;

  /**
   * Label width settings.
   * @type {string|number|null}
   * @private
   */
  this.height_ = null;

  /**
   * Parent bounds stored.
   * @type {anychart.math.Rect}
   * @private
   */
  this.parentBounds_ = null;

  /**
   * Label width settings.
   * @type {number}
   * @private
   */
  this.rotation_;

  /**
   * Label position.
   * @type {anychart.math.Coordinate}
   * @private
   */
  this.position_;

  /**
   * Label anchor settings.
   * @type {anychart.utils.NinePositions}
   * @private
   */
  this.anchor_;

  /**
   * Offset by X coordinate from Label position.
   * @type {number|string}
   * @private
   */
  this.offsetX_;

  /**
   * Offset by Y coordinate from Label position.
   * @type {number|string}
   * @private
   */
  this.offsetY_;

  /**
   * Label text element.
   * @type {acgraph.vector.Text}
   * @private
   */
  this.textElement_ = null;

  this.restoreDefaults();
};
goog.inherits(anychart.elements.Label, anychart.elements.Text);


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.elements.Label.prototype.DISPATCHED_CONSISTENCY_STATES =
    anychart.elements.Text.prototype.DISPATCHED_CONSISTENCY_STATES |
        anychart.utils.ConsistencyState.BACKGROUND_APPEARANCE |
        anychart.utils.ConsistencyState.TEXT_FORMAT;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.elements.Label.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.elements.Text.prototype.SUPPORTED_CONSISTENCY_STATES |
        anychart.utils.ConsistencyState.BACKGROUND_APPEARANCE |
        anychart.utils.ConsistencyState.TEXT_FORMAT;


//----------------------------------------------------------------------------------------------------------------------
//
//  Text.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Label text value.
 * @param {string=} opt_value Value to set if used as a setter.
 * @return {!anychart.elements.Label|string} Asked value or itself for chaining.
 */
anychart.elements.Label.prototype.text = function(opt_value) {
  if (goog.isDef(opt_value) && this.textSettings('text') != opt_value) {
    //we use silently invalidate because it will dispatch at this.textSettings method
    this.silentlyInvalidate(anychart.utils.ConsistencyState.TEXT_FORMAT);
  }
  return /** @type {!anychart.elements.Label|string} */(this.textSettings('text', opt_value));
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Background.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Gets or sets the Label background settings.
 * @param {anychart.elements.Background=} opt_value Background object to set.
 * @return {!(anychart.elements.Label|anychart.elements.Background)} Returns the background or itself for chaining.
 */
anychart.elements.Label.prototype.background = function(opt_value) {
  if (!this.background_) {
    this.background_ = new anychart.elements.Background();
    this.background_.cloneFrom(null);
    this.registerDisposable(this.background_);
    this.invalidate(anychart.utils.ConsistencyState.BACKGROUND_APPEARANCE);
    this.background_.listenInvalidation(this.backgroundInvalidated_, this);
  }

  if (goog.isDef(opt_value)) {
    this.background_.suspendInvalidationDispatching();
    this.background_.cloneFrom(opt_value);
    this.background_.resumeInvalidationDispatching(true);
    return this;
  }
  return this.background_;
};


/**
 * Internal background invalidation handler.
 * @param {anychart.utils.InvalidatedStatesEvent} event Event object.
 * @private
 */
anychart.elements.Label.prototype.backgroundInvalidated_ = function(event) {
  if (event.invalidated(anychart.utils.ConsistencyState.APPEARANCE)) {
    this.invalidate(anychart.utils.ConsistencyState.BACKGROUND_APPEARANCE);
  }
};


/**
 * Label padding.
 * @param {(string|number|anychart.utils.Space)=} opt_spaceOrTopOrTopAndBottom Space object or top or top and bottom
 *    space.
 * @param {(string|number)=} opt_rightOrRightAndLeft Right or right and left space.
 * @param {(string|number)=} opt_bottom Bottom space.
 * @param {(string|number)=} opt_left Left space.
 * @return {!(anychart.elements.Label|anychart.utils.Padding)} Padding or Label for chaining.
 */
anychart.elements.Label.prototype.padding = function(opt_spaceOrTopOrTopAndBottom, opt_rightOrRightAndLeft, opt_bottom, opt_left) {
  if (!this.padding_) {
    this.padding_ = new anychart.utils.Padding();
    this.registerDisposable(this.padding_);
    this.padding_.listenInvalidation(this.boundsInvalidated_, this);
  }
  if (goog.isDef(opt_spaceOrTopOrTopAndBottom)) {
    this.padding_.set.apply(this.padding_, arguments);
    return this;
  }
  return this.padding_;
};


/**
 * Listener for bounds invalidation.
 * @param {anychart.utils.InvalidatedStatesEvent} event Invalidation event.
 * @private
 */
anychart.elements.Label.prototype.boundsInvalidated_ = function(event) {
  if (event.invalidated(anychart.utils.ConsistencyState.BOUNDS)) {
    this.invalidate(anychart.utils.ConsistencyState.PIXEL_BOUNDS |
        anychart.utils.ConsistencyState.BACKGROUND_APPEARANCE);
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Width/Height.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Label width settings.
 * @param {(number|string|null)=} opt_value Width value to set.
 * @return {!anychart.elements.Label|number|string|null} Label width or itself for chaining call.
 */
anychart.elements.Label.prototype.width = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.width_ != opt_value) {
      this.width_ = opt_value;
      this.invalidate(
          anychart.utils.ConsistencyState.PIXEL_BOUNDS |
              anychart.utils.ConsistencyState.BACKGROUND_APPEARANCE |
              anychart.utils.ConsistencyState.APPEARANCE);
    }
    return this;
  }
  return this.width_;
};


/**
 * Label height settings.
 * @param {(number|string|null)=} opt_value Height value to set.
 * @return {!anychart.elements.Label|number|string|null} Label height or itself for chaining.
 */
anychart.elements.Label.prototype.height = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.height_ != opt_value) {
      this.height_ = opt_value;
      this.invalidate(
          anychart.utils.ConsistencyState.PIXEL_BOUNDS |
              anychart.utils.ConsistencyState.BACKGROUND_APPEARANCE |
              anychart.utils.ConsistencyState.APPEARANCE);
    }
    return this;
  }
  return this.height_;
};


/**
 * Getter and setter for parent element bounds. Used to calculate width, height, offsets passed in percents.
 * @param {anychart.math.Rect=} opt_value Parent bounds to set.
 * @return {!anychart.elements.Label|anychart.math.Rect} Label or parent bounds.
 */
anychart.elements.Label.prototype.parentBounds = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.parentBounds_ != opt_value) {
      this.parentBounds_ = opt_value;
      this.invalidate(
          anychart.utils.ConsistencyState.PIXEL_BOUNDS |
              anychart.utils.ConsistencyState.BACKGROUND_APPEARANCE |
              anychart.utils.ConsistencyState.APPEARANCE);
    }
    return this;
  }
  return this.parentBounds_;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Position.
//
//----------------------------------------------------------------------------------------------------------------------
//todo: not implemented yet
/**
 * Gets or sets label rotation settings.
 * @param {(number)=} opt_value Label rotation settings.
 * @return {number|anychart.elements.Label} Label rotation settings or itself for chaining call.
 */
anychart.elements.Label.prototype.rotation = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.rotation_ = opt_value;
    this.invalidate(
        anychart.utils.ConsistencyState.PIXEL_BOUNDS |
            anychart.utils.ConsistencyState.BACKGROUND_APPEARANCE
    );
    return this;
  } else {
    return this.rotation_;
  }
};


/**
 * Gets or sets Label anchor settings.
 * @param {(anychart.utils.NinePositions|string)=} opt_value Label anchor settings.
 * @return {anychart.elements.Label|anychart.utils.NinePositions} Label anchor settings or itself for chaining call.
 */
anychart.elements.Label.prototype.anchor = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.utils.normalizeNinePositions(opt_value);
    if (this.anchor_ != opt_value) {
      this.anchor_ = opt_value;
      this.invalidate(
          anychart.utils.ConsistencyState.PIXEL_BOUNDS |
              anychart.utils.ConsistencyState.BACKGROUND_APPEARANCE
      );
    }
    return this;
  } else {
    return this.anchor_;
  }
};


/**
 * Gets or sets Label offsetX settings.
 * @param {(number|string)=} opt_value Label offsetX settings to set.
 * @return {number|string|anychart.elements.Label} Label offsetX value or itself for chaining call.
 */
anychart.elements.Label.prototype.offsetX = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.offsetX_ = opt_value;
    this.invalidate(
        anychart.utils.ConsistencyState.PIXEL_BOUNDS |
            anychart.utils.ConsistencyState.BACKGROUND_APPEARANCE
    );
    return this;
  } else {
    return this.offsetX_;
  }
};


/**
 * Gets or sets Label offsetY settings.
 * @param {(number|string)=} opt_value Label offsetY settings to set.
 * @return {number|string|anychart.elements.Label} Label offsetY value or itself for chaining call.
 */
anychart.elements.Label.prototype.offsetY = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.offsetY_ = opt_value;
    this.invalidate(
        anychart.utils.ConsistencyState.PIXEL_BOUNDS |
            anychart.utils.ConsistencyState.BACKGROUND_APPEARANCE
    );
    return this;
  } else {
    return this.offsetY_;
  }
};


/**
 * Gets or sets Label position settings.
 * @param {anychart.math.Coordinate=} opt_value New label position.
 * @return {anychart.math.Coordinate|anychart.elements.Label} Current label position settings or itself for chaining.
 */
anychart.elements.Label.prototype.position = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.position_ = opt_value;
    this.invalidate(
        anychart.utils.ConsistencyState.PIXEL_BOUNDS |
            anychart.utils.ConsistencyState.BACKGROUND_APPEARANCE
    );
    return this;
  } else {
    return this.position_;
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Drawing.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Draw label with specified setting.
 * @return {anychart.elements.Label} Returns itself for chaining call.
 */
anychart.elements.Label.prototype.draw = function() {
  if (this.isConsistent()) return this;

  this.resolveEnabledState();

  var text = /** @type {string} */(this.text());
  var isInitial = false;

  // We will need the text element any way, so we should create it if missing.
  if (this.hasInvalidationState(anychart.utils.ConsistencyState.TEXT_FORMAT)) {
    if (text == '') {
      goog.dispose(this.textElement_);
    } else {
      isInitial = isInitial || this.createTextElement_();
      this.textElement_.text(text);
    }
    this.markConsistent(anychart.utils.ConsistencyState.TEXT_FORMAT);
  }

  if (this.hasInvalidationState(anychart.utils.ConsistencyState.APPEARANCE)) {
    isInitial = isInitial || this.createTextElement_();
    this.applyTextSettings(/** @type {!acgraph.vector.Text} */(this.textElement_), isInitial);
    this.markConsistent(anychart.utils.ConsistencyState.APPEARANCE);
  }

  //bounds
  var textElementBounds;
  var textWidth;
  var textHeight;
  var textX;
  var textY;
  var parentWidth;
  var parentHeight;
  var isWidthSet;
  var isHeightSet;
  var outerBounds = new anychart.math.Rect(0, 0, 0, 0);

  //we should ask text element about bounds only after text format and text settings are applied
  textElementBounds = this.textElement_.getBounds();

  //define is width and height setted from settings
  isWidthSet = !goog.isNull(this.width_);
  isHeightSet = !goog.isNull(this.height_);

  //define parent bounds
  if (this.parentBounds_) {
    parentWidth = this.parentBounds_.width;
    parentHeight = this.parentBounds_.height;
  }

  //calculate text width and outer width
  var width;
  if (isWidthSet) {
    width = Math.ceil(anychart.utils.normalize(/** @type {number|string} */(this.width_), parentWidth));
    if (this.padding_) {
      textX = this.padding_.left();
      textWidth = this.padding_.tightenWidth(width);
    } else {
      textX = 0;
      textWidth = width;
    }
    outerBounds.width = width;
  } else {
    width = textElementBounds.width;
    if (this.padding_) {
      textX = this.padding_.left();
      outerBounds.width = this.padding_.widenWidth(width);
    } else {
      textX = 0;
      outerBounds.width = width;
    }
  }

  //calculate text height and outer height
  var height;
  if (isHeightSet) {
    height = Math.ceil(anychart.utils.normalize(/** @type {number|string} */(this.height_), parentHeight));
    if (this.padding_) {
      textY = this.padding_.top();
      textHeight = this.padding_.tightenHeight(height);
    } else {
      textY = 0;
      textHeight = height;
    }
    outerBounds.height = height;
  } else {
    height = textElementBounds.height;
    if (this.padding_) {
      textY = this.padding_.top();
      outerBounds.height = this.padding_.widenHeight(height);
    } else {
      textY = 0;
      outerBounds.height = height;
    }
  }

  var position = anychart.utils.normalizeMathPosition(this.position_);
  position.x = anychart.utils.normalize(position.x, parentWidth);
  position.y = anychart.utils.normalize(position.y, parentHeight);

  var anchorCoordinate = anychart.utils.getCoordinateByAnchor(
      new acgraph.math.Rect(0, 0, outerBounds.width, outerBounds.height),
      this.anchor_);

  position.x -= anchorCoordinate.x;
  position.y -= anchorCoordinate.y;

  var offsetX = goog.isDef(this.offsetX_) ? anychart.utils.normalize(this.offsetX_, parentWidth) : 0;
  var offsetY = goog.isDef(this.offsetY_) ? anychart.utils.normalize(this.offsetY_, parentHeight) : 0;
  anychart.utils.applyOffsetByAnchor(position, this.anchor_, offsetX, offsetY);

  textX += position.x;
  textY += position.y;
  outerBounds.left = position.x;
  outerBounds.top = position.y;

  var container = /** @type {acgraph.vector.ILayer} */(this.container());

  if (this.hasInvalidationState(anychart.utils.ConsistencyState.PIXEL_BOUNDS)) {
    if (goog.isDef(textWidth)) this.textElement_.width(textWidth);
    if (goog.isDef(textHeight)) this.textElement_.height(textHeight);

    this.textElement_.setTransformationMatrix(1, 0, 0, 1, 0, 0);
    this.textElement_.translate(/** @type {number} */(textX), /** @type {number} */(textY));
    this.markConsistent(anychart.utils.ConsistencyState.PIXEL_BOUNDS);
  }

  if (this.hasInvalidationState(anychart.utils.ConsistencyState.BACKGROUND_APPEARANCE)) {
    if (!this.background_.container()) this.background_.container(container);
    this.background_.pixelBounds(outerBounds);
    this.background_.draw();
  }

  if (this.hasInvalidationState(anychart.utils.ConsistencyState.Z_INDEX)) {
    var zIndex = /** @type {number} */(this.zIndex());
    if (this.textElement_) this.textElement_.zIndex(zIndex);
    if (this.background_) this.background_.zIndex(zIndex);
    this.markConsistent(anychart.utils.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.utils.ConsistencyState.CONTAINER)) {
    if (this.textElement_) this.textElement_.parent(container);
    if (this.background_) this.background_.container(container);
    this.markConsistent(anychart.utils.ConsistencyState.CONTAINER);
  }

  return this;
};


/** @inheritDoc */
anychart.elements.Label.prototype.restore = function() {
  if (this.textElement_ && this.enabled()) this.textElement_.parent(/** @type {acgraph.vector.ILayer} */(this.container()));
  if (this.background_) {
    this.background_.container(/** @type {acgraph.vector.ILayer} */(this.container()));
    this.background_.restore();
  }
};


/** @inheritDoc */
anychart.elements.Label.prototype.remove = function() {
  if (this.textElement_) this.textElement_.parent(null);
  if (this.background_) this.background_.remove();
};


/**
 * Create text element if it not exists yet. Return flag, was text element created or not.
 * @return {boolean} Was text element really created or not.
 * @private
 */
anychart.elements.Label.prototype.createTextElement_ = function() {
  var isInitial;
  if (isInitial = !this.textElement_) {
    this.textElement_ = acgraph.text();

    this.registerDisposable(this.textElement_);
  }
  return isInitial;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Utils.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Copies settings from the passed label to itself.
 * @param {anychart.elements.Label} label Label to copy settings from.
 * @return {!anychart.elements.Label} Returns itself for chaining.
 */
anychart.elements.Label.prototype.cloneFrom = function(label) {
  if (goog.isDefAndNotNull(label)) {
    this.settingsObj = label.settingsObj;
    this.background_ = label.background_;
    this.padding_ = label.padding_;
    this.width_ = label.width_;
    this.height_ = label.height_;
    this.parentBounds_ = label.parentBounds_;
    this.rotation_ = label.rotation_;
    this.position_ = label.position_;
    this.anchor_ = label.anchor_;
    this.offsetX_ = label.offsetX_;
    this.offsetY_ = label.offsetY_;
  } else {
    this.restoreDefaults();
    this.background_ = null;
    this.settingsObj['text'] = '';
  }
  this.silentlyInvalidate(anychart.utils.ConsistencyState.ALL);
  return this;
};


/**
 * Restore label default settings.
 */
anychart.elements.Label.prototype.restoreDefaults = function() {
  goog.base(this, 'restoreDefaults');
  this.settingsObj['text'] = 'Label text';
  this.padding_ = null;
  this.width_ = null;
  this.height_ = null;
  this.background_ = null;
  this.parentBounds_ = null;
  this.rotation_ = 0;
  this.position_ = {x: 0, y: 0};
  this.anchor_ = anychart.utils.NinePositions.LEFT_TOP;
  this.offsetX_ = 0;
  this.offsetY_ = 0;
  this.silentlyInvalidate(anychart.utils.ConsistencyState.ALL);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Disposing.
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.elements.Label.prototype.disposeInternal = function() {
  goog.base(this, 'disposeInternal');
  //we should dispose padding, background and textElement
  //they all disposed with registerDisposable call
};




