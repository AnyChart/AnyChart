goog.provide('anychart.elements.Multilabel');
goog.require('anychart.elements.Background');
goog.require('anychart.elements.Text');
goog.require('anychart.utils');
goog.require('anychart.utils.Margin');
goog.require('anychart.utils.Padding');



//todo: measure не считает позицию лейбла
//todo: не поддерживаются повороты
//todo: нет возможности поменять настройки для конкретного лейбла
/**
 * Этот класс предназначен для рисования множества лейблов с одинаковым набором настроек и последующего управления этими лейблами.
 * Настройки конкретного лейбла могут быть изменены после того, как все лейблы будут нарисованы.
 * @constructor
 * @extends {anychart.elements.Text}
 */
anychart.elements.Multilabel = function() {
  goog.base(this);

  /**
   * Labels width settings.
   * @type {string|number|null}
   * @private
   */
  this.width_ = null;

  /**
   * Labels width settings.
   * @type {string|number|null}
   * @private
   */
  this.height_ = null;

  /**
   * Labels width settings.
   * @type {number}
   * @private
   */
  this.rotation_;

  /**
   * Labels position settings.
   * @type {anychart.utils.NinePositions|string}
   * @private
   */
  this.position_;

  /**
   * Labels anchor settings.
   * @type {anychart.utils.NinePositions}
   * @private
   */
  this.anchor_;

  /**
   * Labels padding settings.
   * @type {anychart.utils.Padding}
   * @private
   */
  this.padding_ = null;

  /**
   * Offset by X coordinate from labels position.
   * @type {number|string}
   * @private
   */
  this.offsetX_;

  /**
   * Offset by Y coordinate from labels position.
   * @type {number|string}
   * @private
   */
  this.offsetY_;

  /**
   * Функция форматирующая текст лейбла, по умолчанию используем поле value формат провайдера.
   * @type {Function}
   * @private
   */
  this.textFormatter_ = null;

  /**
   * Функция форматирования позиции лейбла, по умолчанию она использует positionProvider для получения позиции.
   * @type {Function}
   * @private
   */
  this.positionFormatter_ = null;

  /**
   * Labels background settings.
   * @type {anychart.elements.Background}
   * @private
   */
  this.background_ = null;

  /**
   * Current labels drawing index.
   * @type {number}
   * @private
   */
  this.index_ = NaN;

  /**
   * Хеш мап в котором по индексу хранится текстовый элемент.
   * @type {Object.<string, acgraph.vector.Text>}
   * @private
   */
  this.textElementsMap_ = null;

  /**
   * Хеш мап в котором по индексу хранится фон.
   * @type {Object.<string, anychart.elements.Background>}
   * @private
   */
  this.backgroundsMap_ = null;


  /**
   * Labels layer.
   * @type {acgraph.vector.Layer}
   * @private
   */
  this.layer_ = null;

  /**
   * Parent bounds stored.
   * @type {anychart.math.Rect}
   * @private
   */
  this.parentBounds_ = null;

  /**
   * @type {acgraph.vector.Text}
   * @private
   */
  this.measureTextElement_ = null;

  /**
   * @type {Object.<string, anychart.math.Rect>}
   * @private
   */
  this.measureCache_ = null;

  /**
   * Список индексов по которым что-либо было нарисовано в текущей серии вызовов draw (текст, фон, текст и фон).
   * @type {Object.<string, boolean>}
   * @private
   */
  this.drawedIndexesMap_ = null;

  /**
   * Список индексов по которым что-либо было нарисовано в пред идущей серии вызовов draw (текст, фон, текст и фон).
   * @type {Object.<string, boolean>}
   * @private
   */
  this.previousDrawedIndexesMap_ = null;

  this.restoreDefaults();
  this.silentlyInvalidate(anychart.utils.ConsistencyState.ALL);
};
goog.inherits(anychart.elements.Multilabel, anychart.elements.Text);


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.elements.Multilabel.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.elements.Text.prototype.SUPPORTED_CONSISTENCY_STATES |
        anychart.utils.ConsistencyState.BACKGROUND_APPEARANCE |
        anychart.utils.ConsistencyState.TEXT_FORMAT |
        anychart.utils.ConsistencyState.POSITION;


//----------------------------------------------------------------------------------------------------------------------
//
//  Background.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Gets or sets the labels background settings.
 * @param {anychart.elements.Background=} opt_value Background object to set.
 * @return {!(anychart.elements.Multilabel|anychart.elements.Background)} Returns the background or itself for chaining.
 */
anychart.elements.Multilabel.prototype.background = function(opt_value) {
  if (!this.background_) {
    this.background_ = new anychart.elements.Background();
    this.background_.cloneFrom(null);
    this.registerDisposable(this.background_);
    this.invalidate(anychart.utils.ConsistencyState.BACKGROUND_APPEARANCE);
    this.background_.listen(anychart.utils.Invalidatable.INVALIDATED, this.backgroundInvalidated_, false, this);
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
anychart.elements.Multilabel.prototype.backgroundInvalidated_ = function(event) {
  if (event.invalidated(anychart.utils.ConsistencyState.APPEARANCE)) {
    this.invalidate(anychart.utils.ConsistencyState.BACKGROUND_APPEARANCE);
  }
};


/**
 * Labels padding.
 * @param {(string|number|anychart.utils.Space)=} opt_spaceOrTopOrTopAndBottom Space object or top or top and bottom
 *    space.
 * @param {(string|number)=} opt_rightOrRightAndLeft Right or right and left space.
 * @param {(string|number)=} opt_bottom Bottom space.
 * @param {(string|number)=} opt_left Left space.
 * @return {!(anychart.elements.Multilabel|anychart.utils.Padding)} Padding or Multilabel for chaining.
 */
anychart.elements.Multilabel.prototype.padding = function(opt_spaceOrTopOrTopAndBottom, opt_rightOrRightAndLeft, opt_bottom, opt_left) {
  if (!this.padding_) {
    this.padding_ = new anychart.utils.Padding();
    this.registerDisposable(this.padding_);
    this.padding_.listen(anychart.utils.Invalidatable.INVALIDATED, this.boundsInvalidated_, false, this);
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
anychart.elements.Multilabel.prototype.boundsInvalidated_ = function(event) {
  if (event.invalidated(anychart.utils.ConsistencyState.BOUNDS)) {
    this.invalidate(anychart.utils.ConsistencyState.PIXEL_BOUNDS |
        anychart.utils.ConsistencyState.BACKGROUND_APPEARANCE);
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Text formatter.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Gets or sets labels text formatter function.
 * @param {Function=} opt_value Labels text formatter function.
 * @return {Function|anychart.elements.Multilabel} Labels text formatter function or Labels instance for chaining call.
 */
anychart.elements.Multilabel.prototype.textFormatter = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.textFormatter_ = opt_value;
    this.invalidate(
        anychart.utils.ConsistencyState.PIXEL_BOUNDS |
            anychart.utils.ConsistencyState.BACKGROUND_APPEARANCE |
            anychart.utils.ConsistencyState.TEXT_FORMAT |
            anychart.utils.ConsistencyState.POSITION
    );
    return this;
  } else {
    return this.textFormatter_;
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Position.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Gets or sets labels position formatter function.
 * @param {Function=} opt_value Labels position formatter function.
 * @return {Function|anychart.elements.Multilabel} Labels position formatter function or Labels instance for chaining call.
 */
anychart.elements.Multilabel.prototype.positionFormatter = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.positionFormatter_ = opt_value;
    this.invalidate(
        anychart.utils.ConsistencyState.PIXEL_BOUNDS |
            anychart.utils.ConsistencyState.BACKGROUND_APPEARANCE |
            anychart.utils.ConsistencyState.POSITION
    );
    return this;
  } else {
    return this.positionFormatter_;
  }
};


/**
 * Gets or sets labels position settings.
 * @param {(anychart.utils.NinePositions|string)=} opt_value Labels position settings.
 * @return {anychart.elements.Multilabel|anychart.utils.NinePositions|string} Labels position settings or itself for chaining call.
 */
anychart.elements.Multilabel.prototype.position = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.utils.normalizePosition(opt_value);
    if (this.position_ != opt_value) {
      this.position_ = opt_value;
      this.invalidate(
          anychart.utils.ConsistencyState.PIXEL_BOUNDS |
              anychart.utils.ConsistencyState.BACKGROUND_APPEARANCE |
              anychart.utils.ConsistencyState.POSITION
      );
    }
    return this;
  } else {
    return this.position_;
  }
};


/**
 * Gets or sets labels anchor settings.
 * @param {(anychart.utils.NinePositions|string)=} opt_value Labels anchor settings.
 * @return {anychart.elements.Multilabel|anychart.utils.NinePositions} Labels anchor settings or itself for chaining call.
 */
anychart.elements.Multilabel.prototype.anchor = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.utils.normalizeNinePositions(opt_value);
    if (this.anchor_ != opt_value) {
      this.anchor_ = opt_value;
      this.invalidate(
          anychart.utils.ConsistencyState.PIXEL_BOUNDS |
              anychart.utils.ConsistencyState.BACKGROUND_APPEARANCE |
              anychart.utils.ConsistencyState.POSITION
      );
    }
    return this;
  } else {
    return this.anchor_;
  }
};


/**
 * Gets or sets labels offsetX settings.
 * @param {(number|string)=} opt_value Labels offsetX settings to set.
 * @return {number|string|anychart.elements.Multilabel} Labels offsetX value or itself for chaining call.
 */
anychart.elements.Multilabel.prototype.offsetX = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.offsetX_ = opt_value;
    this.invalidate(
        anychart.utils.ConsistencyState.PIXEL_BOUNDS |
            anychart.utils.ConsistencyState.BACKGROUND_APPEARANCE |
            anychart.utils.ConsistencyState.POSITION
    );
    return this;
  } else {
    return this.offsetX_;
  }
};


/**
 * Gets or sets labels offsetY settings.
 * @param {(number|string)=} opt_value Labels offsetY settings to set.
 * @return {number|string|anychart.elements.Multilabel} Labels offsetY value or itself for chaining call.
 */
anychart.elements.Multilabel.prototype.offsetY = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.offsetY_ = opt_value;
    this.invalidate(
        anychart.utils.ConsistencyState.PIXEL_BOUNDS |
            anychart.utils.ConsistencyState.BACKGROUND_APPEARANCE |
            anychart.utils.ConsistencyState.POSITION
    );
    return this;
  } else {
    return this.offsetY_;
  }
};


/**
 * Gets or sets labels rotation settings.
 * @param {(number)=} opt_value Labels rotation settings.
 * @return {number|anychart.elements.Multilabel} Labels rotation settings or itself for chaining call.
 */
anychart.elements.Multilabel.prototype.rotation = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.rotation_ = opt_value;
    this.invalidate(
        anychart.utils.ConsistencyState.PIXEL_BOUNDS |
            anychart.utils.ConsistencyState.BACKGROUND_APPEARANCE |
            anychart.utils.ConsistencyState.POSITION
    );
    return this;
  } else {
    return this.rotation_;
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Width/Height.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Multilabel width settings.
 * @param {(number|string|null)=} opt_value Width value to set.
 * @return {!anychart.elements.Multilabel|number|string|null} Multilabel width or itself for chaining call.
 */
anychart.elements.Multilabel.prototype.width = function(opt_value) {
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
 * Multilabel height settings.
 * @param {(number|string|null)=} opt_value Height value to set.
 * @return {!anychart.elements.Multilabel|number|string|null} Multilabel height or itself for chaining.
 */
anychart.elements.Multilabel.prototype.height = function(opt_value) {
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
 * @return {!anychart.elements.Multilabel|anychart.math.Rect} Multilabel or parent bounds.
 */
anychart.elements.Multilabel.prototype.parentBounds = function(opt_value) {
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
//  Measure.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Measure labels using formatProvider, positionProvider and returns labels bounds.
 * @param {*} formatProvider Object witch provide info for textFormatter function.
 * @param {*} positionProvider Object witch provide info for positionFormatter function.
 * @param {number=} opt_index Label index to draw.
 * @return {anychart.math.Rect} Labels bounds.
 */
anychart.elements.Multilabel.prototype.measure = function(formatProvider, positionProvider, opt_index) {
  //search for cache
  if (goog.isDef(opt_index)) {
    if (!this.measureCache_) this.measureCache_ = {};
    var cachedBounds = this.measureCache_[opt_index];
    if (cachedBounds) return cachedBounds;
  }

  if (!this.measureTextElement_) this.measureTextElement_ = acgraph.text();
  var text = this.textFormatter_.call(this, formatProvider, opt_index);
  this.measureTextElement_.text(text);
  this.applyTextSettings(this.measureTextElement_, true);

  var bounds = /**@type {anychart.math.Rect} */(this.measureTextElement_.getBounds());
  if (goog.isDef(opt_index)) this.measureCache_[opt_index] = bounds;

  return bounds;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Drawing.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Start multiple labels drawing.
 */
anychart.elements.Multilabel.prototype.reset = function() {
  this.index_ = 0;
  this.previousDrawedIndexesMap_ = this.drawedIndexesMap_;
  this.drawedIndexesMap_ = {};
  // на ресет мы должны инвалидейтить все поддерживаемые состояния кроме zIndex и container т.к они должны примениться
  // только один раз.
  this.silentlyInvalidate(anychart.utils.ConsistencyState.ALL & ~
      (anychart.utils.ConsistencyState.Z_INDEX |
          anychart.utils.ConsistencyState.CONTAINER));
};


/**
 * End labels drawing.
 * Reset all counter so u can redraw labels.
 */
anychart.elements.Multilabel.prototype.end = function() {
  var isEmptyPrevious = !this.previousDrawedIndexesMap_ || goog.object.isEmpty(this.previousDrawedIndexesMap_);
  var i;

  if (!isEmptyPrevious) {
    //если мы в новом проходе что-то нарисовали по какому либо индексу, то этот индекс чистить не надо
    for (i in this.drawedIndexesMap_) {
      goog.object.remove(this.previousDrawedIndexesMap_, i);
    }

    // уничтожаем все отрисованые и не обновленные в новом проходе лейблы
    for (i in this.previousDrawedIndexesMap_) {
      //remove text element
      var textElement = /** @type {acgraph.vector.Text} */(this.textElementsMap_[i]);
      if (textElement) {
        textElement.dispose();
        this.textElementsMap_[i] = null;
      }

      //remove background element
      var background = /** @type {anychart.elements.Background} */(this.backgroundsMap_[i]);
      if (background) {
        background.dispose();
        this.backgroundsMap_[i] = null;
      }
    }
  }

  this.index_ = NaN;
  this.measureCache_ = null;
  this.markConsistent(anychart.utils.ConsistencyState.ALL);
};


/**
 * Draw label using formatProvider and positionProvider and returns acgraph.vector.Text instance.
 * @param {*} formatProvider Object witch provide info for textFormatter function.
 * @param {*} positionProvider Object witch provide info for positionFormatter function.
 * @param {number=} opt_index Label index to draw.
 * @return {anychart.elements.Multilabel} Return self for chaining call.
 */
anychart.elements.Multilabel.prototype.draw = function(formatProvider, positionProvider, opt_index) {

  if (this.isConsistent()) return this;
  var isInitial;
  var isBackgroundInitial;
  var text;
  //index
  var index;
  var incIndex;
  //visual elements
  var textElement;
  var backgroundElement;
  //stage
  var stage;
  var manualSuspend;
  //bounds
  var textElementBounds;
  var textWidth;
  var textHeight;
  var textX;
  var textY;
  /** @type {anychart.math.Rect} */
  var outerBounds = new anychart.math.Rect(0, 0, 0, 0);
  var isWidthSet;
  var isHeightSet;
  var parentWidth;
  var parentHeight;

  //process labels index
  if (goog.isDef(opt_index)) {
    index = opt_index;
  } else {
    if (isNaN(this.index_)) this.index_ = 0;
    index = this.index_;
    incIndex = true;
  }

  this.drawedIndexesMap_[index.toString()] = true;

  //create internal elements only if draw ever called
  if (!this.layer_) this.layer_ = acgraph.layer();
  if (!this.textElementsMap_) this.textElementsMap_ = {};
  if (!this.backgroundsMap_) this.backgroundsMap_ = {};
  if (!this.drawedIndexesMap_) this.drawedIndexesMap_ = {};

  //suspend stage
  stage = this.layer_.getStage();
  manualSuspend = stage && !stage.isSuspended();
  if (manualSuspend) stage.suspend();

  //search for cached elements
  textElement = this.textElementsMap_[index];
  backgroundElement = this.backgroundsMap_[index];

  //is this the first drawing
  isInitial = !textElement;
  isBackgroundInitial = !backgroundElement;

  if (isInitial) {
    textElement = acgraph.text();
    textElement.parent(this.layer_);
    this.textElementsMap_[index] = textElement;
  }

  if (isInitial || this.hasInvalidationState(anychart.utils.ConsistencyState.TEXT_FORMAT)) {
    text = this.textFormatter_.call(this, formatProvider, index);
    textElement.text(text);
  }

  if (isInitial || this.hasInvalidationState(anychart.utils.ConsistencyState.APPEARANCE)) {
    this.applyTextSettings(textElement, isInitial);
  }

  //we should ask text element about bounds only after text format and text settings are applied
  textElementBounds = textElement.getBounds();

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


  if (isInitial || this.hasInvalidationState(anychart.utils.ConsistencyState.PIXEL_BOUNDS)) {
    if (goog.isDef(textWidth)) textElement.width(textWidth);
    if (goog.isDef(textHeight)) textElement.height(textHeight);
  }

  /** @type {anychart.elements.Background} */
  if (isBackgroundInitial || this.hasInvalidationState(anychart.utils.ConsistencyState.BACKGROUND_APPEARANCE)) {
    //we can decide that it is a initial stage, but background was just set to null, so we should check it
    if (this.background_) {
      if (!backgroundElement) {
        backgroundElement = new anychart.elements.Background();
        backgroundElement.cloneFrom(this.background_);
        backgroundElement.container(this.layer_);
        this.backgroundsMap_[index] = backgroundElement;
        //we should set background pixelBounds later then will know label position
      }
    } else {
      if (backgroundElement) {
        backgroundElement.dispose();
        backgroundElement = null;
        this.backgroundsMap_[index] = null;
      }
    }
  }

  if (isInitial || this.hasInvalidationState(anychart.utils.ConsistencyState.POSITION)) {
    var position = this.positionFormatter_.call(this, positionProvider, index);
    var anchorCoordinate = anychart.utils.getCoordinateByAnchor(
        new acgraph.math.Rect(0, 0, outerBounds.width, outerBounds.height),
        this.anchor_);
    position.x -= anchorCoordinate.x;
    position.y -= anchorCoordinate.y;

    var offsetX = goog.isDef(this.offsetX_) ? anychart.utils.normalize(this.offsetX_, parentWidth) : 0;
    var offsetY = goog.isDef(this.offsetY_) ? anychart.utils.normalize(this.offsetY_, parentHeight) : 0;

    anychart.utils.applyOffsetByAnchor(position, this.anchor_, offsetX, offsetY);

    //at this point, text position = textX, textY (moved by padding), outerPosition = 0, 0
    //we should apply provider position to outer position and text position
    textX += position.x;
    textY += position.y;
    outerBounds.left = position.x;
    outerBounds.top = position.y;

    textElement.setTransformationMatrix(1, 0, 0, 1, 0, 0);
    textElement.translate(textX, textY);
  }

  if (backgroundElement && (isInitial || this.hasInvalidationState(anychart.utils.ConsistencyState.BACKGROUND_APPEARANCE))) {
    backgroundElement.pixelBounds(outerBounds);
    backgroundElement.draw();
  }

  //we should clear only container depend consistency states in draw method,
  //other states should be cleaned only in "end" method
  //start clear container consistency states
  if (this.hasInvalidationState(anychart.utils.ConsistencyState.Z_INDEX)) {
    this.layer_.zIndex(/** @type {number} */(this.zIndex()));
    this.markConsistent(anychart.utils.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.utils.ConsistencyState.CONTAINER)) {
    this.layer_.parent(/** @type {acgraph.vector.ILayer} */(this.container()));
    this.markConsistent(anychart.utils.ConsistencyState.CONTAINER);
  }
  //end clear container consistency states

  if (incIndex) this.index_++;
  if (manualSuspend) stage.resume();

  return this;
};


/**
 * Restore labels default settings.
 */
anychart.elements.Multilabel.prototype.restoreDefaults = function() {
  goog.base(this, 'restoreDefaults');
  this.textFormatter_ = function(formatProvider, index) {
    return 'Label: ' + index;
  };
  this.positionFormatter_ = function(positionProvider, index) {
    return {x: 100 * index, y: 100};
  };
  this.anchor(anychart.utils.NinePositions.CENTER);
  this.padding(5, 10, 5, 10);
  this.rotation(0);
};


/**
 * Copies labels settings from the passed labels instance to itself.
 * @param {anychart.elements.Multilabel} labels Labels to copy settings from.
 * @return {!anychart.elements.Multilabel} Returns itself for chaining.
 */
anychart.elements.Multilabel.prototype.cloneFrom = function(labels) {
  if (goog.isDefAndNotNull(labels)) {
    this.width(labels.width_);
    this.height(labels.height_);
    this.rotation(labels.rotation_);
    this.position(labels.position_);
    this.anchor(labels.anchor_);
    this.padding(labels.padding_);
    this.offsetX(labels.offsetX_);
    this.offsetY(labels.offsetY_);
    this.textFormatter(labels.textFormatter_);
    this.positionFormatter(labels.positionFormatter_);
    this.background(labels.background_);
  } else {
    this.width(null);
    this.height(null);
    this.rotation(0);
    this.position(anychart.utils.NinePositions.LEFT_TOP);
    this.anchor(anychart.utils.NinePositions.CENTER);
    this.padding(0);
    this.offsetX(0);
    this.offsetY(0);
    this.textFormatter(null);
    this.positionFormatter(null);
    this.background(null);
  }
  return this;
};




