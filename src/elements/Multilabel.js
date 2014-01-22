goog.provide('anychart.elements.Multilabel');
goog.require('anychart.elements.Text');
goog.require('anychart.utils.Margin');
goog.require('anychart.utils.Padding');



/**
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

  //todo (Roman Lubushkin): rotation is not supported yet
  /**
   * Labels width settings.
   * @type {number?}
   * @private
   */
  this.rotation_ = null;

  /**
   * Labels position settings.
   * @type {anychart.utils.NinePositions|string}
   * @private
   */
  this.position_ = null;

  /**
   * Labels anchor settings.
   * @type {anychart.utils.NinePositions}
   * @private
   */
  this.anchor_ = null;

  //todo (Roman Lubushkin): padding is not supported yet
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
  this.offsetX_ = null;

  /**
   * Offset by Y coordinate from labels position.
   * @type {number|string}
   * @private
   */
  this.offsetY_ = null;

  /**
   * Labels text formatter function.
   * @type {Function}
   * @private
   */
  this.textFormatter_ = null;

  /**
   * Labels position formatter function.
   * @type {Function}
   * @private
   */
  this.positionFormatter_ = null;

  //todo (Roman Lubushkin): background is not supported yet
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
   * @type {Object.<string, acgraph.vector.Text>}
   * @private
   */
  this.textElementsMap_ = null;

  /**
   * @type {Array.<number>}
   * @private
   */
  this.drawedIndexesList_ = null;

  /**
   * Labels layer.
   * @type {acgraph.vector.Layer}
   * @private
   */
  this.layer_ = null;

  /**
   * @type {boolean}
   * @private
   */
  this.end_ = true;

  this.restoreDefaults();
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
 * @return {!anychart.elements.Title|!anychart.elements.Background} Returns the background or itself for chaining.
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
            anychart.utils.ConsistencyState.TEXT_FORMAT
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
            anychart.utils.ConsistencyState.POSITION
    );
    return this;
  } else {
    return this.textFormatter_;
  }
};


/**
 * Gets or sets labels position settings.
 * @param {(anychart.utils.NinePositions|string)=} opt_value Labels position settings.
 * @return {anychart.elements.Multilabel|anychart.utils.NinePositions|string} Labels position settings or itself for chaining call.
 */
anychart.elements.Multilabel.prototype.position = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.utils.normalizePosition(opt_value, null);
    if (this.position_ != opt_value) {
      this.position_ = opt_value;
      this.invalidate(
          anychart.utils.ConsistencyState.PIXEL_BOUNDS |
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
              anychart.utils.ConsistencyState.POSITION
      );
    }
    return this;
  } else {
    return this.anchor_;
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


//----------------------------------------------------------------------------------------------------------------------
//
//  Drawing.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * End labels drawing.
 * Reset all counter so u can redraw labels.
 */
anychart.elements.Multilabel.prototype.end = function() {
  if (this.end_) return;
  this.end_ = true;

  var isNotEmpty = !goog.object.isEmpty(this.textElementsMap_);
  var i, count;

  //!Удаляем не нужные лейблы!
  //Если у нас есть список отрисованых в прошлый раз лейблов
  if (this.drawedIndexesList_) {
    if (isNotEmpty) {
      //удаляем из списка отрисованых в прошлый раз лейблов индексы новых
      var indexes = goog.object.getKeys(this.textElementsMap_);
      for (i = 0, count = indexes.length; i < count; i++) {
        goog.array.remove(this.drawedIndexesList_, indexes[i]);
      }
    }

    //уничтожаем все отрисованые в прошлый раз лейблы
    for (i = 0, count = this.drawedIndexesList_.length; i < count; i++) {
      /** @type {number} */
      var index = this.drawedIndexesList_[i];
      this.textElementsMap_[index].dispose();
    }
  }

  //сохраняем индексы только что отрисованых лейблов
  if (!goog.object.isEmpty(this.textElementsMap_))
    this.drawedIndexesList_ = goog.object.getKeys(this.textElementsMap_);

  this.index_ = NaN;
  this.silentlyInvalidate(anychart.utils.ConsistencyState.ALL);
};


/**
 * Measure labels using formatProvider, positionProvider and returns labels bounds.
 * @param {*} formatProvider Text format provider.
 * @param {*} positionProvider Position provider.
 * @param {number=} opt_index Labels index.
 * @return {acgraph.math.Rect} Labels bounds.
 */
anychart.elements.Multilabel.prototype.measure = function(formatProvider, positionProvider, opt_index) {
  return null;
};


/**
 * Draw label using formatProvider and positionProvider and returns acgraph.vector.Text instance.
 * @param {*} formatProvider Text format provider.
 * @param {*} positionProvider Position provider.
 * @param {number=} opt_index Labels index.
 * @return {acgraph.vector.Text} Label acgraph.vector.Text instance.
 */
anychart.elements.Multilabel.prototype.draw = function(formatProvider, positionProvider, opt_index) {
  var index, incIndex;
  this.end_ = false;

  //process labels index
  if (goog.isDef(opt_index)) {
    index = opt_index;
  } else {
    if (isNaN(this.index_)) this.index_ = 0;
    index = this.index_;
    incIndex = true;
  }

  //create internal elements only if draw ever called
  if (!this.layer_) this.layer_ = acgraph.layer();
  if (!this.textElementsMap_) this.textElementsMap_ = {};

  //suspend stage
  var stage = this.layer_.getStage();
  var manualSuspend = stage && !stage.isSuspended();
  if (manualSuspend) stage.suspend();

  //search for text element in cache
  var textElement = this.textElementsMap_[index];
  var isInitial = !textElement;

  //if no text element in cache, then we should apply all settings to text element
  //except container settings and it should not affect consistency states
  if (isInitial) {
    textElement = acgraph.text();
    textElement.parent(this.layer_);
    this.textElementsMap_[index] = textElement;
  }

  //start clear text element consistency states
  if (isInitial || this.hasInvalidationState(anychart.utils.ConsistencyState.TEXT_FORMAT)) {
    var text = this.textFormatter_.call(this, formatProvider, index);
    textElement.text(text);
    this.markConsistent(anychart.utils.ConsistencyState.TEXT_FORMAT);
  }

  if (isInitial || anychart.utils.ConsistencyState.POSITION) {
    var position = this.positionFormatter_.call(this, positionProvider, index);
    textElement.setTransformationMatrix(1, 0, 0, 1, 0, 0);
    textElement.translate(position.x, position.y);
    this.markConsistent(anychart.utils.ConsistencyState.POSITION);
  }

  if (isInitial || this.hasInvalidationState(anychart.utils.ConsistencyState.APPEARANCE)) {
    this.applyTextSettings(textElement, true);
    this.markConsistent(anychart.utils.ConsistencyState.APPEARANCE);
  }
  //end clear text element consistency states

  if (incIndex) this.index_++;

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

  if (manualSuspend) stage.resume();

  return null;
};


/**
 * Restore labels default settings.
 */
anychart.elements.Multilabel.prototype.restoreDefaults = function() {
  goog.base(this, 'restoreDefaults');

  this.textFormatter_ = function(formatProvider, index) {
    return 'Label #' + index;
  };
  this.positionFormatter_ = function(positionProvider, index) {
    return {x: 80 * index, y: 0};
  };
  this.end();
  this.background(null);
};




