goog.provide('anychart.elements.Multilabel');
goog.require('anychart.elements.Background');
goog.require('anychart.elements.Text');
goog.require('anychart.utils');
goog.require('anychart.utils.Margin');
goog.require('anychart.utils.Padding');



//todo: не поддерживаются повороты
/**
 * Этот класс предназначен для рисования множества лейблов с одинаковым набором настроек и последующего управления этими лейблами.
 * Настройки конкретного лейбла могут быть изменены после того, как все лейблы будут нарисованы.
 * @constructor
 * @extends {anychart.elements.Text}
 */
anychart.elements.Multilabel = function() {
  this.suspendSignalsDispatching();
  goog.base(this);

  /**
   * Settings for custom markers
   * @type {Object.<number, Object>}
   * @private
   */
  this.customLabelSettings_;

  /**
   * Appearance states for labels.
   * @type {Object.<number, boolean>}
   * @private
   */
  this.appearanceStates_;

  /**
   * Position states for labels.
   * @type {Object.<number, boolean>}
   * @private
   */
  this.positionStates_;

  /**
   * Common appearance state.
   * @type {boolean}
   * @private
   */
  this.commonAppearanceState_ = true;

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
   * @type {Object.<number, acgraph.vector.Text>}
   * @private
   */
  this.textElementsMap_ = null;

  /**
   * Хеш мап в котором по индексу хранится фон.
   * @type {Object.<number, anychart.elements.Background>}
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
   * @type {Object.<number, anychart.math.Rect>}
   * @private
   */
  this.measureCache_ = null;

  /**
   * Handlers to attach on next end().
   * @type {number}
   * @private
   */
  this.attachedEvents_ = 0;

  /**
   * One-off handlers to attach on next end().
   * @type {number}
   * @private
   */
  this.attachedOnceEvents_ = 0;

  this.zIndex(50);
  this.customLabelSettings_ = {};
  this.appearanceStates_ = {};
  this.positionStates_ = {};

  this.textFormatter_ = function(formatProvider) {
    return formatProvider;
  };
  this.positionFormatter_ = function(positionProvider) {
    return positionProvider;
  };

  this.background(null);
  this.anchor(anychart.utils.NinePositions.CENTER);
  this.padding(5, 10, 5, 10);
  this.rotation(0);
  this.width(null);
  this.height(null);
  this.invalidate(anychart.ConsistencyState.ALL);
  this.resumeSignalsDispatching(false);
};
goog.inherits(anychart.elements.Multilabel, anychart.elements.Text);


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.elements.Multilabel.prototype.SUPPORTED_SIGNALS = anychart.elements.Text.prototype.SUPPORTED_SIGNALS;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.elements.Multilabel.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.elements.Text.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.BACKGROUND |
    anychart.ConsistencyState.HANDLERS;


/**
 * Enumeration to handle composite event handlers attachment on DOM create.
 * @const {Object.<number>}
 * @private
 */
anychart.elements.Multilabel.HANDLED_EVENT_TYPES_ = {
  /** Вызывается когда по элементу кликнули. */
  'click': 0x01,

  /** Вызывается когда по элементу дважды кликнули. */
  'dblclick': 0x02,

  /** Fires when mouse downed on element */
  'mousedown': 0x04,

  /** Fires when mouse upped on element */
  'mouseup': 0x08,

  /** Вызывается когда на элемент навели указатель мыши. */
  'mouseover': 0x10,

  /** Вызывается когда с элемента увели указатель мыши. */
  'mouseout': 0x20,

  /** Fires when mouse moved on element */
  'mousemove': 0x40,

  /** Fires on touch start */
  'touchstart': 0x80,

  /** Fires on touch move */
  'touchmove': 0x100,

  /** Fires on touch end */
  'touchend': 0x200,

  /** Fires on touch cancel.
   * @see http://www.w3.org/TR/2011/WD-touch-events-20110505/#the-touchcancel-event
   */
  'touchcancel': 0x400

  //  /** Fires on tap (fast touchstart-touchend) */
  //  'tap': 0x800
};


/**
 * MAGIC NUMBERS!!! MAGIC NUMBERS!!!111
 * This is a lsh (<< - left shift) second argument to convert simple HANDLED_EVENT_TYPES code to a
 * CAPTURE HANDLED_EVENT_TYPES code! Tada!
 * @type {number}
 * @private
 */
anychart.elements.Multilabel.HANDLED_EVENT_TYPES_CAPTURE_SHIFT_ = 12;


//----------------------------------------------------------------------------------------------------------------------
//
//  Background.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Gets or sets labels background settings for custom point.
 * @param {number} index .
 * @param {(anychart.elements.Background|Object|null)=} opt_value Markers position settings.
 * @return {anychart.elements.Multilabel|anychart.elements.Background} .
 */
anychart.elements.Multilabel.prototype.backgroundAt = function(index, opt_value) {
  var customSettings = this.customLabelSettings_[index] ?
      this.customLabelSettings_[index] :
      this.customLabelSettings_[index] = {};

  if (goog.isDef(opt_value)) {
    if (!customSettings.background) {
      customSettings.background = new anychart.elements.Background();
      this.registerDisposable(customSettings.background);
      customSettings.background.listenSignals(this.customBackgroundInvalidated_, {index: index, context: this});
      customSettings.background.markConsistent(anychart.ConsistencyState.ALL);
    }
    var background = customSettings.background;

    if (opt_value instanceof anychart.elements.Background) {
      background.deserialize(opt_value.serialize());
    } else if (goog.isObject(opt_value)) {
      background.deserialize(opt_value);
    } else if (anychart.isNone(opt_value)) {
      background.enabled(false);
    }
    return this;
  } else {
    return this.customLabelSettings_[index].background || this.background_;
  }
};


/**
 * Internal background invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 * @this {{index: number, context: anychart.elements.Multilabel}}
 */
anychart.elements.Multilabel.prototype.customBackgroundInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    this.context.appearanceStates_[this.index] = true;
    this.context.invalidate(anychart.ConsistencyState.BACKGROUND, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Gets or sets the labels background settings.
 * @param {(anychart.elements.Background|Object|null)=} opt_value Background object to set.
 * @return {!(anychart.elements.Multilabel|anychart.elements.Background)} Returns the background or itself for chaining.
 */
anychart.elements.Multilabel.prototype.background = function(opt_value) {
  if (!this.background_) {
    this.background_ = new anychart.elements.Background();
    this.commonAppearanceState_ = true;
    this.registerDisposable(this.background_);
    this.background_.markConsistent(anychart.ConsistencyState.ALL);
    this.background_.listenSignals(this.backgroundInvalidated_, this);
  }

  if (goog.isDef(opt_value)) {
    this.background_.suspendSignalsDispatching();
    if (opt_value instanceof anychart.elements.Background) {
      this.background_.deserialize(opt_value.serialize());
    } else if (goog.isObject(opt_value)) {
      this.background_.deserialize(opt_value);
    } else if (anychart.isNone(opt_value)) {
      this.background_.enabled(false);
    }
    this.background_.resumeSignalsDispatching(true);
    return this;
  }
  return this.background_;
};


/**
 * Internal background invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.elements.Multilabel.prototype.backgroundInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    this.commonAppearanceState_ = true;
    this.background_.markConsistent(anychart.ConsistencyState.ALL);
    this.invalidate(anychart.ConsistencyState.BACKGROUND, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Gets or sets labels padding settings for custom point.
 * @param {number} index .
 * @param {(string|number|anychart.utils.Space)=} opt_spaceOrTopOrTopAndBottom Space object or top or top and bottom
 *    space.
 * @param {(string|number)=} opt_rightOrRightAndLeft Right or right and left space.
 * @param {(string|number)=} opt_bottom Bottom space.
 * @param {(string|number)=} opt_left Left space.
 * @return {!(anychart.elements.Multilabel|anychart.utils.Padding)} Padding or Multilabel for chaining.
 */
anychart.elements.Multilabel.prototype.paddingAt = function(index, opt_spaceOrTopOrTopAndBottom, opt_rightOrRightAndLeft, opt_bottom, opt_left) {
  var customSettings = this.customLabelSettings_[index] ?
      this.customLabelSettings_[index] :
      this.customLabelSettings_[index] = {};

  if (goog.isDef(opt_spaceOrTopOrTopAndBottom)) {
    if (!customSettings.padding) {
      customSettings.padding = new anychart.utils.Padding();
      this.registerDisposable(customSettings.padding);
      customSettings.padding.listenSignals(this.customPaddingInvalidated_, {index: index, context: this});
    }

    customSettings.padding.set.apply(customSettings.padding, arguments);
    return this;
  } else {
    return this.customLabelSettings_[index].padding || this.padding_;
  }
};


/**
 * Internal background invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 * @this {{index: number, context: anychart.elements.Multilabel}}
 */
anychart.elements.Multilabel.prototype.customPaddingInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.context.appearanceStates_[this.index] = true;
    this.context.positionStates_[this.index] = true;
    this.context.invalidate(anychart.ConsistencyState.BOUNDS,
        anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
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
    this.padding_.listenSignals(this.paddingInvalidated_, this);
  }
  if (goog.isDef(opt_spaceOrTopOrTopAndBottom)) {
    this.padding_.set.apply(this.padding_, arguments);
    return this;
  }
  return this.padding_;
};


/**
 * Listener for bounds invalidation.
 * @param {anychart.SignalEvent} event Invalidation event.
 * @private
 */
anychart.elements.Multilabel.prototype.paddingInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.BOUNDS,
        anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    this.commonAppearanceState_ = true;
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
    this.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.BOUNDS,
        anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
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
    this.invalidate(anychart.ConsistencyState.BOUNDS,
        anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    return this;
  } else {
    return this.positionFormatter_;
  }
};


/**
 * Gets or sets labels position settings for custom point.
 * @param {number} index Point index.
 * @param {(anychart.utils.NinePositions|string)=} opt_value Labels position settings.
 * @return {anychart.elements.Multilabel|anychart.utils.NinePositions|string} Labels position settings or itself for chaining call.
 */
anychart.elements.Multilabel.prototype.positionAt = function(index, opt_value) {
  if (!this.customLabelSettings_[index]) this.customLabelSettings_[index] = {};

  if (goog.isDef(opt_value)) {
    opt_value = anychart.utils.normalizePosition(opt_value);

    if (this.customLabelSettings_[index].position != opt_value) {
      this.customLabelSettings_[index].position = opt_value;
      this.positionStates_[index] = true;
      if (this.measureCache_) this.measureCache_[index] = null;
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.customLabelSettings_[index].position || this.position_;
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
      this.measureCache_ = null;
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.position_;
  }
};


/**
 * Gets or sets labels anchor settings for custom point.
 * @param {number} index Index of marker for setting its anchor settings.
 * @param {(anychart.utils.NinePositions|string)=} opt_value Labels anchor settings.
 * @return {anychart.elements.Multilabel|anychart.utils.NinePositions} Labels anchor settings or itself for chaining call.
 */
anychart.elements.Multilabel.prototype.anchorAt = function(index, opt_value) {
  if (!this.customLabelSettings_[index]) this.customLabelSettings_[index] = {};

  if (goog.isDef(opt_value)) {
    opt_value = anychart.utils.normalizeNinePositions(opt_value);
    if (this.customLabelSettings_[index].anchor != opt_value) {
      this.customLabelSettings_[index].anchor = opt_value;
      this.positionStates_[index] = true;
      if (this.measureCache_) this.measureCache_[index] = null;
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.customLabelSettings_[index].anchor || this.anchor_;
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
      this.measureCache_ = null;
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.anchor_;
  }
};


/**
 * Gets or sets labels offsetX settings for custom point.
 * @param {number} index Label index.
 * @param {(number|string)=} opt_value OffsetX settings.
 * @return {number|string|anychart.elements.Multilabel} Labels offsetX value or itself for chaining call.
 */
anychart.elements.Multilabel.prototype.offsetXAt = function(index, opt_value) {
  if (!this.customLabelSettings_[index]) this.customLabelSettings_[index] = {};

  if (goog.isDef(opt_value)) {
    if (this.customLabelSettings_[index].offsetX != opt_value) {
      this.customLabelSettings_[index].offsetX = opt_value;
      this.positionStates_[index] = true;
      if (this.measureCache_) this.measureCache_[index] = null;
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return goog.isDef(this.customLabelSettings_[index].offsetX) ? this.customLabelSettings_[index].offsetX : this.offsetX_;
  }
};


/**
 * Gets or sets labels offsetX settings.
 * @param {(number|string)=} opt_value Labels offsetX settings to set.
 * @return {number|string|anychart.elements.Multilabel} Labels offsetX value or itself for chaining call.
 */
anychart.elements.Multilabel.prototype.offsetX = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.offsetX_ != opt_value) {
      this.offsetX_ = opt_value;
      this.measureCache_ = null;
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.offsetX_;
  }
};


/**
 * Gets or sets labels offsetY settings for custom point.
 * @param {number} index Label index.
 * @param {(number|string)=} opt_value OffsetY settings.
 * @return {number|string|anychart.elements.Multilabel} Labels offsetX value or itself for chaining call.
 */
anychart.elements.Multilabel.prototype.offsetYAt = function(index, opt_value) {
  if (!this.customLabelSettings_[index]) this.customLabelSettings_[index] = {};

  if (goog.isDef(opt_value)) {
    if (this.customLabelSettings_[index].offsetY != opt_value) {
      this.customLabelSettings_[index].offsetY = opt_value;
      this.positionStates_[index] = true;
      if (this.measureCache_) this.measureCache_[index] = null;
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return goog.isDef(this.customLabelSettings_[index].offsetY) ?
        this.customLabelSettings_[index].offsetY :
        this.offsetY_;
  }
};


/**
 * Gets or sets labels offsetY settings.
 * @param {(number|string)=} opt_value Labels offsetY settings to set.
 * @return {number|string|anychart.elements.Multilabel} Labels offsetY value or itself for chaining call.
 */
anychart.elements.Multilabel.prototype.offsetY = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.offsetY_ != opt_value) {
      this.offsetY_ = opt_value;
      this.measureCache_ = null;
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.offsetY_;
  }
};


/**
 * Gets or sets labels rotation settings.
 * @param {number} index Label index.
 * @param {(number)=} opt_value Labels rotation settings.
 * @return {number|anychart.elements.Multilabel} Labels rotation settings or itself for chaining call.
 */
anychart.elements.Multilabel.prototype.rotationAt = function(index, opt_value) {
  if (!this.customLabelSettings_[index]) this.customLabelSettings_[index] = {};

  if (goog.isDef(opt_value)) {
    if (this.customLabelSettings_[index].rotation != opt_value) {
      this.customLabelSettings_[index].rotation = opt_value;
      this.positionStates_[index] = true;
      if (this.measureCache_) this.measureCache_[index] = null;
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return goog.isDef(this.customLabelSettings_[index].rotation) ?
        this.customLabelSettings_[index].rotation :
        this.rotation_;
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
    this.invalidate(anychart.ConsistencyState.BOUNDS,
        anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
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
 * Gets or sets labels width settings for custom point.
 * @param {number} index Label index.
 * @param {(number|string)=} opt_value Width settings.
 * @return {number|string|anychart.elements.Multilabel} Labels width value or itself for chaining call.
 */
anychart.elements.Multilabel.prototype.widthAt = function(index, opt_value) {
  if (!this.customLabelSettings_[index]) this.customLabelSettings_[index] = {};

  if (goog.isDef(opt_value)) {
    if (this.customLabelSettings_[index].width != opt_value) {
      this.customLabelSettings_[index].width = opt_value;
      this.positionStates_[index] = true;
      if (this.measureCache_) this.measureCache_[index] = null;
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return goog.isDef(this.customLabelSettings_[index].width) ? this.customLabelSettings_[index].width : this.width_;
  }
};


/**
 * Multilabel width settings.
 * @param {(number|string|null)=} opt_value Width value to set.
 * @return {!anychart.elements.Multilabel|number|string|null} Multilabel width or itself for chaining call.
 */
anychart.elements.Multilabel.prototype.width = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.width_ != opt_value) {
      this.width_ = opt_value;
      this.measureCache_ = null;
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.width_;
};


/**
 * Gets or sets labels height settings for custom point.
 * @param {number} index Label index.
 * @param {(number|string)=} opt_value Height settings.
 * @return {number|string|anychart.elements.Multilabel} Labels height value or itself for chaining call.
 */
anychart.elements.Multilabel.prototype.heightAt = function(index, opt_value) {
  if (!this.customLabelSettings_[index]) this.customLabelSettings_[index] = {};

  if (goog.isDef(opt_value)) {
    if (this.customLabelSettings_[index].height != opt_value) {
      this.customLabelSettings_[index].height = opt_value;
      this.positionStates_[index] = true;
      if (this.measureCache_) this.measureCache_[index] = null;
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return goog.isDef(this.customLabelSettings_[index].height) ? this.customLabelSettings_[index].height : this.height_;
  }
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
      this.measureCache_ = null;

      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.height_;
};


/**
 * Set/get text settings for custom label.
 * @param {number} index Index.
 * @param {(anychart.elements.Text|Object)=} opt_value Text object or text settings.
 * @return {anychart.elements.Text|anychart.elements.Multilabel} Custom label text settings or itself for chaining call.
 */
anychart.elements.Multilabel.prototype.textSettingsAt = function(index, opt_value) {
  var customSettings = this.customLabelSettings_[index] ?
      this.customLabelSettings_[index] :
      this.customLabelSettings_[index] = {};

  if (goog.isDef(opt_value)) {
    if (!customSettings.textSettings) {
      customSettings.textSettings = new anychart.elements.Text();
      this.registerDisposable(customSettings.textSettings);
      customSettings.textSettings.listenSignals(this.customTextSettingsInvalidated_, {index: index, context: this});
    }
    var textSettings = customSettings.textSettings;

    if (opt_value instanceof anychart.elements.Text) {
      textSettings.textSettings(opt_value.serialize());
    } else if (goog.isObject(opt_value)) {
      textSettings.textSettings(opt_value);
    }
    return this;
  } else {
    return this.customLabelSettings_[index].textSettings || this;
  }
};


/**
 * Internal textSettings invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 * @this {{index: number, context: anychart.elements.Multilabel}}
 */
anychart.elements.Multilabel.prototype.customTextSettingsInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    this.context.appearanceStates_[this.index] = true;
    this.context.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
  } else if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    this.context.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.BOUNDS,
        anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
  }
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
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
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
  var text;
  var textElementBounds;
  var textWidth;
  var textHeight;
  /** @type {anychart.math.Rect} */
  var outerBounds = new anychart.math.Rect(0, 0, 0, 0);
  var isWidthSet;
  var isHeightSet;
  var parentWidth;
  var parentHeight;

  if (!this.measureTextElement_) this.measureTextElement_ = acgraph.text();

  text = this.textFormatter_.call(this, formatProvider, opt_index);
  this.measureTextElement_.width(null);
  this.measureTextElement_.height(null);
  this.measureTextElement_.text(goog.isDef(text) ? text.toString() : null);

  //we should ask text element about bounds only after text format and text settings are applied

  //define parent bounds
  if (this.parentBounds_) {
    parentWidth = this.parentBounds_.width;
    parentHeight = this.parentBounds_.height;
  }

  var isIndexDef = goog.isDef(opt_index);
  var indexSettings = this.customLabelSettings_[opt_index || 0];
  var isIndexSettings = isIndexDef && goog.isDef(indexSettings);

  var padding = isIndexSettings && indexSettings.padding ?
      indexSettings.padding :
      this.padding();

  var widthSettings = isIndexSettings && goog.isDef(indexSettings.width) ?
      indexSettings.width :
      this.width();

  var heightSettings = isIndexSettings && goog.isDef(indexSettings.height) ?
      indexSettings.height :
      this.height();

  var offsetY = isIndexSettings && goog.isDef(indexSettings.offsetY) ?
      indexSettings.offsetY :
      this.offsetY();

  var offsetX = isIndexSettings && goog.isDef(indexSettings.offsetX) ?
      indexSettings.offsetX :
      this.offsetX();

  var anchor = isIndexSettings && indexSettings.anchor ?
      indexSettings.anchor :
      this.anchor();

  var rotation = isIndexSettings && indexSettings.rotation ?
      indexSettings.rotation :
      this.rotation();

  var textSettings = isIndexSettings && indexSettings.textSettings ?
      indexSettings.textSettings :
      this;

  textSettings.applyTextSettings(this.measureTextElement_, true);

  //define is width and height setted from settings
  isWidthSet = !goog.isNull(widthSettings);
  isHeightSet = !goog.isNull(heightSettings);

  textElementBounds = this.measureTextElement_.getBounds();

  //calculate text width and outer width
  var width;
  if (isWidthSet) {
    width = Math.ceil(anychart.utils.normalize(/** @type {number|string} */(widthSettings), parentWidth));
    if (padding) {
      textWidth = padding.tightenWidth(width);
    } else {
      textWidth = width;
    }
    outerBounds.width = width;
  } else {
    width = textElementBounds.width;
    if (padding) {
      outerBounds.width = padding.widenWidth(width);
    } else {
      outerBounds.width = width;
    }
  }

  if (goog.isDef(textWidth)) this.measureTextElement_.width(textWidth);

  textElementBounds = this.measureTextElement_.getBounds();

  //calculate text height and outer height
  var height;
  if (isHeightSet) {
    height = Math.ceil(anychart.utils.normalize(/** @type {number|string} */(heightSettings), parentHeight));
    if (padding) {
      textHeight = padding.tightenHeight(height);
    } else {
      textHeight = height;
    }
    outerBounds.height = height;
  } else {
    height = textElementBounds.height;
    if (padding) {
      outerBounds.height = padding.widenHeight(height);
    } else {
      outerBounds.height = height;
    }
  }

  if (goog.isDef(textHeight)) this.measureTextElement_.height(textHeight);

  var position = /** @type {acgraph.math.Coordinate} */(goog.object.clone(this.positionFormatter_.call(this, positionProvider, opt_index)));
  var anchorCoordinate = anychart.utils.getCoordinateByAnchor(
      new acgraph.math.Rect(0, 0, outerBounds.width, outerBounds.height),
      anchor);

  position.x -= anchorCoordinate.x;
  position.y -= anchorCoordinate.y;

  offsetX = goog.isDef(offsetX) ? anychart.utils.normalize(offsetX, parentWidth) : 0;
  offsetY = goog.isDef(offsetY) ? anychart.utils.normalize(offsetY, parentHeight) : 0;

  anychart.utils.applyOffsetByAnchor(position, anchor, offsetX, offsetY);

  outerBounds.left = position.x;
  outerBounds.top = position.y;

  return /**@type {anychart.math.Rect} */(outerBounds);
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
  var isEmpty = !this.elementsRenderState_ || goog.object.isEmpty(this.elementsRenderState_);
  var i, index;

  if (!isEmpty) {
    // уничтожаем все отрисованые и не обновленные в новом проходе лейблы
    for (i in this.elementsRenderState_) {
      index = parseInt(i, 0);
      if (!this.elementsRenderState_[index]) {
        //remove text element
        var textElement = /** @type {acgraph.vector.Text} */(this.textElementsMap_[index]);
        if (textElement) {
          textElement.dispose();
          this.textElementsMap_[index] = null;
          this.positionStates_[index] = false;
        }

        //remove background element
        var background = /** @type {anychart.elements.Background} */(this.backgroundsMap_[index]);
        if (background) {
          background.remove();
          this.backgroundsMap_[index] = null;
          this.appearanceStates_[index] = false;
        }
      } else if (this.hasInvalidationState(anychart.ConsistencyState.HANDLERS)) {
        for (var type in anychart.elements.Multilabel.HANDLED_EVENT_TYPES_) {
          var element = this.textElementsMap_[index];
          element['__tagIndex'] = index;
          var code = anychart.elements.Multilabel.HANDLED_EVENT_TYPES_[type];
          if (!!(this.attachedEvents_ & code))
            element.listen(type, this.handleBrowserEvent_, false, this);
          else if (!!(this.attachedOnceEvents_ & code))
            element.listenOnce(type, this.handleBrowserEvent_, false, this);
          else
            element.unlisten(type, this.handleBrowserEvent_, false, this);
          code = code << acgraph.vector.Element.HANDLED_EVENT_TYPES_CAPTURE_SHIFT;
          if (!!(this.attachedEvents_ & code))
            element.listen(type, this.handleBrowserEvent_, true, this);
          else if (!!(this.attachedOnceEvents_ & code))
            element.listenOnce(type, this.handleBrowserEvent_, true, this);
          else
            element.unlisten(type, this.handleBrowserEvent_, true, this);
        }
        this.attachedOnceEvents_ = 0x00;
      }
      this.elementsRenderState_[index] = false;
    }
  }

  this.index_ = NaN;
  this.measureCache_ = null;
  this.commonAppearanceState_ = false;
  this.markConsistent(anychart.ConsistencyState.ALL);
};


/**
 * Draw label using formatProvider and positionProvider and returns acgraph.vector.Text instance.
 * @param {*} formatProvider Object witch provide info for textFormatter function.
 * @param {*} positionProvider Object witch provide info for positionFormatter function.
 * @param {number=} opt_index Label index to draw.
 * @return {anychart.elements.Multilabel} Return self for chaining call.
 */
anychart.elements.Multilabel.prototype.draw = function(formatProvider, positionProvider, opt_index) {
  var isInitial = false;
  var background;
  var isBackgroundInitial = false;
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

  //create internal elements only if draw ever called
  if (!this.layer_) this.layer_ = acgraph.layer();


  if (!this.elementsRenderState_) this.elementsRenderState_ = {};
  if (!this.textElementsMap_) this.textElementsMap_ = {};
  if (!this.backgroundsMap_) this.backgroundsMap_ = {};
  if (!this.outerBoundsCache_) this.outerBoundsCache_ = {};

  var enabled = this.customLabelSettings_[index] && goog.isDef(this.customLabelSettings_[index].enabled) ?
      this.customLabelSettings_[index].enabled :
      this.enabled();
  this.markConsistent(anychart.ConsistencyState.ENABLED);

  if (!enabled) {
    //remove text element
    textElement = /** @type {acgraph.vector.Text} */(this.textElementsMap_[index]);
    if (textElement) {
      textElement.dispose();
      this.textElementsMap_[index] = null;
      this.positionStates_[index] = false;
    }

    //remove background element
    background = /** @type {anychart.elements.Background} */(this.backgroundsMap_[index]);
    if (background) {
      background.remove();
      this.backgroundsMap_[index] = null;
      this.appearanceStates_[index] = false;
    }
    this.elementsRenderState_[index] = false;
    if (incIndex) this.index_++;
    return this;
  }
  //suspend stage
  stage = this.layer_.getStage();
  manualSuspend = stage && !stage.isSuspended();
  if (manualSuspend) stage.suspend();

  //search for cached elements
  textElement = this.textElementsMap_[index];
  backgroundElement = this.backgroundsMap_[index];

  background = this.customLabelSettings_[index] && this.customLabelSettings_[index].background ?
      this.customLabelSettings_[index].background :
      this.background();

  if (!backgroundElement) {
    backgroundElement = new anychart.elements.Background();
    backgroundElement.zIndex(0);
    backgroundElement.container(this.layer_);
    this.backgroundsMap_[index] = backgroundElement;
    isBackgroundInitial = true;
  }
  backgroundElement.draw();

  var appearanceState = this.appearanceStates_[index];
  var updateAppearance = this.commonAppearanceState_ || appearanceState || isBackgroundInitial;
  if (updateAppearance) {
    backgroundElement.deserialize(background.serialize());
    backgroundElement.draw();
    this.markConsistent(anychart.ConsistencyState.BACKGROUND);
  }

  if (!textElement) {
    textElement = acgraph.text();
    textElement.zIndex(1);
    textElement.parent(this.layer_);
    this.textElementsMap_[index] = textElement;
    isInitial = true;
  }

  //define parent bounds
  if (this.parentBounds_) {
    parentWidth = this.parentBounds_.width;
    parentHeight = this.parentBounds_.height;
  }

  var indexSettings = this.customLabelSettings_[index];

  var padding = indexSettings && indexSettings.padding ?
      indexSettings.padding :
      this.padding();

  var widthSettings = indexSettings && goog.isDef(indexSettings.width) ?
      indexSettings.width :
      this.width();

  var heightSettings = indexSettings && goog.isDef(indexSettings.height) ?
      indexSettings.height :
      this.height();

  var offsetY = indexSettings && goog.isDef(indexSettings.offsetY) ?
      indexSettings.offsetY :
      this.offsetY();

  var offsetX = indexSettings && goog.isDef(indexSettings.offsetX) ?
      indexSettings.offsetX :
      this.offsetX();

  var anchor = indexSettings && indexSettings.anchor ?
      indexSettings.anchor :
      this.anchor();

  var rotation = indexSettings && indexSettings.rotation ?
      indexSettings.rotation :
      this.rotation();

  var textSettings = indexSettings && indexSettings.textSettings ?
      indexSettings.textSettings :
      this;

  text = this.textFormatter_.call(this, formatProvider, index);
  textElement.width(null);
  textElement.height(null);
  textElement.text(goog.isDef(text) ? text.toString() : null);
  textSettings.applyTextSettings(textElement, isInitial);

  //define is width and height setted from settings
  isWidthSet = !goog.isNull(widthSettings);
  isHeightSet = !goog.isNull(heightSettings);

  //we should ask text element about bounds only after text format and text settings are applied
  textElementBounds = textElement.getBounds();

  //calculate text width and outer width
  var width;
  if (isWidthSet) {
    width = Math.ceil(anychart.utils.normalize(/** @type {number|string} */(widthSettings), parentWidth));
    if (padding) {
      textX = padding.left();
      textWidth = padding.tightenWidth(width);
    } else {
      textX = 0;
      textWidth = width;
    }
    outerBounds.width = width;
  } else {
    width = textElementBounds.width;
    if (padding) {
      textX = padding.left();
      outerBounds.width = padding.widenWidth(width);
    } else {
      textX = 0;
      outerBounds.width = width;
    }
  }
  if (goog.isDef(textWidth)) textElement.width(textWidth);

  //we should ask text element about bounds only after text format and text settings are applied
  textElementBounds = textElement.getBounds();

  //calculate text height and outer height
  var height;
  if (isHeightSet) {
    height = Math.ceil(anychart.utils.normalize(/** @type {number|string} */(heightSettings), parentHeight));
    if (padding) {
      textY = padding.top();
      textHeight = padding.tightenHeight(height);
    } else {
      textY = 0;
      textHeight = height;
    }
    outerBounds.height = height;
  } else {
    height = textElementBounds.height;
    if (padding) {
      textY = padding.top();
      outerBounds.height = padding.widenHeight(height);
    } else {
      textY = 0;
      outerBounds.height = height;
    }
  }

  if (goog.isDef(textHeight)) textElement.height(textHeight);

  var position = /** @type {acgraph.math.Coordinate} */(goog.object.clone(this.positionFormatter_.call(this, positionProvider, index)));
  var anchorCoordinate = anychart.utils.getCoordinateByAnchor(
      new acgraph.math.Rect(0, 0, outerBounds.width, outerBounds.height),
      anchor);
  position.x -= anchorCoordinate.x;
  position.y -= anchorCoordinate.y;

  offsetX = goog.isDef(offsetX) ? anychart.utils.normalize(offsetX, parentWidth) : 0;
  offsetY = goog.isDef(offsetY) ? anychart.utils.normalize(offsetY, parentHeight) : 0;

  anychart.utils.applyOffsetByAnchor(position, anchor, offsetX, offsetY);

  textX += position.x;
  textY += position.y;
  outerBounds.left = position.x;
  outerBounds.top = position.y;

  textElement.x(textX).y(textY);

  backgroundElement.pixelBounds(outerBounds);
  backgroundElement.draw();

  this.markConsistent(anychart.ConsistencyState.BOUNDS);

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    this.layer_.zIndex(/** @type {number} */(this.zIndex()));
    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    this.layer_.parent(/** @type {acgraph.vector.ILayer} */(this.container()));
    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }

  textSettings.markConsistent(anychart.ConsistencyState.ALL);

  if (incIndex) this.index_++;
  if (manualSuspend) stage.resume();

  this.elementsRenderState_[index] = true;

  return this;
};


/**
 * Gets or sets marker enabled state for custom point.
 * @param {number} index Marker index.
 * @param {boolean=} opt_value Enabled state.
 * @return {boolean|anychart.elements.Multilabel} Marker enabled state or itself for chaining call.
 */
anychart.elements.Multilabel.prototype.enabledAt = function(index, opt_value) {
  if (!this.customLabelSettings_[index]) this.customLabelSettings_[index] = {};

  if (goog.isDef(opt_value)) {
    if (this.customLabelSettings_[index].enabled != opt_value) {
      this.customLabelSettings_[index].enabled = opt_value;
      this.invalidate(anychart.ConsistencyState.ENABLED,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return goog.isDef(this.customLabelSettings_[index].enabled) ?
        this.customLabelSettings_[index].enabled :
        this.enabled();
  }
};


/**
 * Serialization.
 * @param {boolean=} opt_withoutCustomSettings Serialize without custom point settings.
 * @return {Object} Serialized data.
 */
anychart.elements.Multilabel.prototype.serialize = function(opt_withoutCustomSettings) {
  var json = goog.base(this, 'serialize');

  var padding = this.padding();
  var background = this.background();

  json['textSettings'] = goog.base(this, 'serialize');
  json['width'] = this.width();
  json['height'] = this.height();
  json['rotation'] = this.rotation();
  json['position'] = this.position();
  json['anchor'] = this.anchor();
  json['offsetX'] = this.offsetX();
  json['offsetY'] = this.offsetY();

  if (padding) json['padding'] = padding.serialize();
  if (background) json['background'] = background.serialize();

  if (!opt_withoutCustomSettings) {
    json['customLabelSettings'] = [];
    for (var i in this.customLabelSettings_) {
      json['customLabelSettings'][i] = this.serializeAt(+i, true);
    }
  }

  return json;
};


/**
 * Serializes data at index.
 * @param {number} index Label index.
 * @param {boolean=} opt_includeCustomOnly If the method should only serialize settings that are custom for the point.
 * @return {Object} Serialized data.
 */
anychart.elements.Multilabel.prototype.serializeAt = function(index, opt_includeCustomOnly) {
  var data = {};
  var point = this.customLabelSettings_[index];
  if (point) {
    if (opt_includeCustomOnly) {
      if (goog.isDef(point.width))
        data['width'] = point.width;
      if (goog.isDef(point.height))
        data['height'] = point.height;
      if (goog.isDef(point.rotation))
        data['rotation'] = point.rotation;
      if (goog.isDef(point.position))
        data['position'] = point.position;
      if (goog.isDef(point.anchor))
        data['anchor'] = point.anchor;
      if (goog.isDef(point.offsetX))
        data['offsetX'] = point.offsetX;
      if (goog.isDef(point.offsetY))
        data['offsetY'] = point.offsetY;
      if (goog.isDef(point.textSettings))
        data['textSettings'] = point.textSettings.serialize();
      if (goog.isDef(point.padding))
        data['padding'] = point.padding.serialize();
      if (goog.isDef(point.background))
        data['background'] = point.background.serialize();
      if (goog.isDef(point.enabled))
        data['enabled'] = point.enabled;
    } else {
      data['width'] = goog.isDef(point.width) ? point.width : this.width_;
      data['height'] = goog.isDef(point.height) ? point.height : this.height_;
      data['rotation'] = goog.isDef(point.rotation) ? point.rotation : this.rotation_;
      data['position'] = goog.isDef(point.position) ? point.position : this.position_;
      data['anchor'] = goog.isDef(point.anchor) ? point.anchor : this.anchor_;
      data['offsetX'] = goog.isDef(point.offsetX) ? point.offsetX : this.offsetX_;
      data['offsetY'] = goog.isDef(point.offsetY) ? point.offsetY : this.offsetY_;
      data['padding'] = goog.isDef(point.padding) ? point.padding.serialize() : this.padding_.serialize();
      data['background'] = goog.isDef(point.background) ? point.background.serialize() : this.background_.serialize();
      data['enabled'] = goog.isDef(point.enabled) ? point.enabled : this.enabled();
      data['textSettings'] = goog.isDef(point.textSettings) ? point.textSettings.serialize : this.textSettings();
    }
  } else {
    data['width'] = this.width();
    data['height'] = this.height();
    data['rotation'] = this.rotation();
    data['position'] = this.position();
    data['anchor'] = this.anchor();
    data['offsetX'] = this.offsetX();
    data['offsetY'] = this.offsetY();
    data['padding'] = this.padding().serialize();
    data['background'] = this.background().serialize();
    data['textSettings'] = this.textSettings();
    data['enabled'] = this.enabled();
  }

  return data;
};


/** @inheritDoc */
anychart.elements.Multilabel.prototype.deserialize = function(config) {
  this.suspendSignalsDispatching();

  goog.base(this, 'deserialize', config);

  var padding = config['padding'];
  var background = config['background'];

  if (padding) {
    this.padding().deserialize(padding);
  }

  if (background) {
    this.background().deserialize(background);
  }

  this.width(config['width']);
  this.height(config['height']);
  this.rotation(config['rotation']);
  this.position(config['position']);
  this.anchor(config['anchor']);
  this.offsetX(config['offsetX']);
  this.offsetY(config['offsetY']);

  this.textSettings(config['textSettings']);

  this.customLabelSettings_ = config['customLabelSettings'] || {};
  for (var i in this.customLabelSettings_) {
    if (this.customLabelSettings_[i].textSettings) {
      this.customLabelSettings_[i].textSettings =
          (new anychart.elements.Text()).textSettings(this.customLabelSettings_[i].textSettings);
    }
  }

  this.resumeSignalsDispatching(true);

  return this;
};


/**
 * Deserializes data at index.
 * @param {number} index Label index.
 * @param {Object} data Data for labels.
 * @return {!anychart.elements.Multilabel}
 */
anychart.elements.Multilabel.prototype.deserializeAt = function(index, data) {
  this.suspendSignalsDispatching();

  if (!this.customLabelSettings_[index]) this.customLabelSettings_[index] = {};

  if (data['background']) this.backgroundAt(index, data['background']);
  if (data['padding']) this.paddingAt(index, data['padding']);
  if (data['position']) this.positionAt(data['position']);
  if (data['anchor']) this.anchorAt(data['anchor']);
  if (data['offsetX']) this.customLabelSettings_[index].offsetX = data['offsetX'];
  if (data['offsetY']) this.customLabelSettings_[index].offsetY = data['offsetY'];
  if (data['rotation']) this.customLabelSettings_[index].rotation = data['rotation'];
  if (data['width']) this.customLabelSettings_[index].width = data['width'];
  if (data['height']) this.customLabelSettings_[index].height = data['height'];
  if (goog.isDef(data['enabled'])) this.customLabelSettings_[index].enabled = data['enabled'];

  if (data['textSettings'])
    this.customLabelSettings_[index].textSettings = (new anychart.elements.Text()).textSettings(data['textSettings']);

  this.invalidate(anychart.ConsistencyState.ALL,
      anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);

  this.resumeSignalsDispatching(true);

  return this;
};


/** @inheritDoc */
anychart.elements.Multilabel.prototype.remove = function() {
  if (this.layer_) this.layer_.parent(null);
};


/**
 * Drop custom settings.
 * @param {number} index Index to drop custom settings for.
 */
anychart.elements.Multilabel.prototype.dropCustomSettingsAt = function(index) {
  if (this.customLabelSettings_ && index in this.customLabelSettings_) {
    delete this.customLabelSettings_[index];
    this.positionStates_[index] = true;
    if (this.measureCache_) this.measureCache_[index] = null;
    this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Events
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Adds an event listener. A listener can only be added once to an
 * object and if it is added again the key for the listener is
 * returned. Note that if the existing listener is a one-off listener
 * (registered via listenOnce), it will no longer be a one-off
 * listener after a call to listen().
 *
 * @param {string|!goog.events.EventId.<EVENTOBJ>} type The event type id.
 * @param {function(this:SCOPE, EVENTOBJ):(boolean|undefined)} listener Callback
 *     method.
 * @param {boolean=} opt_useCapture Whether to fire in capture phase
 *     (defaults to false).
 * @param {SCOPE=} opt_listenerScope Object in whose scope to call the
 *     listener.
 * @return {goog.events.ListenableKey} Unique key for the listener.
 * @template SCOPE,EVENTOBJ
 */
anychart.elements.Multilabel.prototype.listen = function(type, listener, opt_useCapture, opt_listenerScope) {
  var res = goog.base(this, 'listen', type, listener, opt_useCapture, opt_listenerScope);
  this.ensureHandler_('' + type, !!opt_useCapture, true, false);
  return res;
};


/**
 * Adds an event listener that is removed automatically after the
 * listener fired once.
 *
 * If an existing listener already exists, listenOnce will do
 * nothing. In particular, if the listener was previously registered
 * via listen(), listenOnce() will not turn the listener into a
 * one-off listener. Similarly, if there is already an existing
 * one-off listener, listenOnce does not modify the listeners (it is
 * still a once listener).
 *
 * @param {string|!goog.events.EventId.<EVENTOBJ>} type The event type id.
 * @param {function(this:SCOPE, EVENTOBJ):(boolean|undefined)} listener Callback
 *     method.
 * @param {boolean=} opt_useCapture Whether to fire in capture phase
 *     (defaults to false).
 * @param {SCOPE=} opt_listenerScope Object in whose scope to call the
 *     listener.
 * @return {goog.events.ListenableKey} Unique key for the listener.
 * @template SCOPE,EVENTOBJ
 */
anychart.elements.Multilabel.prototype.listenOnce = function(type, listener, opt_useCapture, opt_listenerScope) {
  var res = goog.base(this, 'listenOnce', type, listener, opt_useCapture, opt_listenerScope);
  this.ensureHandler_('' + type, !!opt_useCapture, true, true);
  return res;
};


/**
 * Removes an event listener which was added with listen() or listenOnce().
 *
 * @param {string|!goog.events.EventId.<EVENTOBJ>} type The event type id.
 * @param {function(this:SCOPE, EVENTOBJ):(boolean|undefined)} listener Callback
 *     method.
 * @param {boolean=} opt_useCapture Whether to fire in capture phase
 *     (defaults to false).
 * @param {SCOPE=} opt_listenerScope Object in whose scope to call
 *     the listener.
 * @return {boolean} Whether any listener was removed.
 * @template SCOPE,EVENTOBJ
 */
anychart.elements.Multilabel.prototype.unlisten = function(type, listener, opt_useCapture, opt_listenerScope) {
  var res = goog.base(this, 'unlisten', type, listener, opt_useCapture, opt_listenerScope);
  this.ensureHandler_('' + type, !!opt_useCapture, false, false);
  return res;
};


/**
 * Removes an event listener which was added with listen() by the key
 * returned by listen().
 *
 * @param {goog.events.ListenableKey} key The key returned by
 *     listen() or listenOnce().
 * @return {boolean} Whether any listener was removed.
 */
anychart.elements.Multilabel.prototype.unlistenByKey = function(key) {
  var res = goog.base(this, 'unlistenByKey', key);
  if (res)
    this.ensureHandler_(key.type, key.capture, false, false);
  return res;
};


/**
 * Removes all listeners from this listenable. If type is specified,
 * it will only remove listeners of the particular type. otherwise all
 * registered listeners will be removed.
 *
 * @param {string=} opt_type Type of event to remove, default is to
 *     remove all types.
 * @return {number} Number of listeners removed.
 */
anychart.elements.Multilabel.prototype.removeAllListeners = function(opt_type) {
  var res = goog.base(this, 'removeAllListeners', opt_type);
  if (res) {
    if (opt_type) {
      this.ensureHandler_(/** @type {string} */(opt_type), false, false, false);
      this.ensureHandler_(/** @type {string} */(opt_type), true, false, false);
    } else {
      this.removeAllHandlers_();
    }
  }
  return res;
};


/**
 * Synchronizes Element and DOM handlers. Should be called after all handler operations on the Element are finished.
 * @param {string} type Event type string.
 * @param {boolean} capture If event should be listened on capture.
 * @param {boolean} armed If this handler should be armed or not.
 * @param {boolean=} opt_once Use listenOnce.
 * @private
 */
anychart.elements.Multilabel.prototype.ensureHandler_ = function(type, capture, armed, opt_once) {
  opt_once = !!opt_once && armed;
  /** @type {number} */
  var eventTypeCode = acgraph.vector.Element.HANDLED_EVENT_TYPES[type] || 0;
  if (capture)
    eventTypeCode = eventTypeCode << acgraph.vector.Element.HANDLED_EVENT_TYPES_CAPTURE_SHIFT;
  if (eventTypeCode) {
    var changed = false;
    /** @type {boolean} */
    var eventAttached = !!(this.attachedEvents_ & eventTypeCode);
    if (opt_once) {
      eventAttached = !!(this.attachedOnceEvents_ & eventTypeCode);
      if (armed && !eventAttached) {
        this.attachedOnceEvents_ |= eventTypeCode;
        changed = true;
      }
    } else {
      if (armed && !eventAttached) {
        this.attachedEvents_ |= eventTypeCode;
        changed = true;
      } else if (!armed && eventAttached) {
        this.attachedEvents_ &= ~eventTypeCode;
        this.attachedOnceEvents_ &= ~eventTypeCode;
        changed = true;
      }
    }
    if (changed)
      this.invalidate(anychart.ConsistencyState.HANDLERS, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Synchronizes Element and DOM handlers. Should be called after all handler operations on the Element are finished.
 * @private
 */
anychart.elements.Multilabel.prototype.removeAllHandlers_ = function() {
  var changed = !!(this.attachedEvents_ | this.attachedOnceEvents_);
  this.attachedEvents_ = 0;
  this.attachedOnceEvents_ = 0;
  if (changed)
    this.invalidate(anychart.ConsistencyState.HANDLERS, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Handles most of browser events happened with underlying DOM element redirecting them to
 * Element event listeners. Event.target property value is replaced by this method.
 * @param {goog.events.BrowserEvent} e Mouse event to handle.
 * @private
 */
anychart.elements.Multilabel.prototype.handleBrowserEvent_ = function(e) {
  if (e instanceof goog.events.BrowserEvent) {
    e.stopPropagation();
    this.dispatchEvent(new anychart.elements.Multilabel.BrowserEvent(e, this));
  }
};



/**
 * Encapsulates browser event for acgraph.
 * @param {goog.events.BrowserEvent=} opt_e Normalized browser event to initialize this event.
 * @param {goog.events.EventTarget=} opt_target EventTarget to be set as a target of the event.
 * @constructor
 * @extends {goog.events.BrowserEvent}
 */
anychart.elements.Multilabel.BrowserEvent = function(opt_e, opt_target) {
  goog.base(this);
  if (opt_e)
    this.copyFrom(opt_e, opt_target);
};
goog.inherits(anychart.elements.Multilabel.BrowserEvent, goog.events.BrowserEvent);


/**
 * An override of BrowserEvent.event_ field to allow compiler to treat it properly.
 * @private
 * @type {goog.events.BrowserEvent}
 */
anychart.elements.Multilabel.BrowserEvent.prototype.event_;


/**
 * Marker index.
 * @type {Number}
 * @private
 */
anychart.elements.Multilabel.BrowserEvent.prototype['labelIndex'] = -1;


/**
 * Copies all info from a BrowserEvent to represent a new one, rearmed event, that can be redispatched.
 * @param {goog.events.BrowserEvent} e Normalized browser event to copy the event from.
 * @param {goog.events.EventTarget=} opt_target EventTarget to be set as a target of the event.
 */
anychart.elements.Multilabel.BrowserEvent.prototype.copyFrom = function(e, opt_target) {
  this.type = e.type;
  // TODO (Anton Saukh): this awful typecast must be removed when it is no longer needed.
  // In the BrowserEvent.init() method there is a TODO from Santos, asking to change typification
  // from Node to EventTarget, which would make more sense.
  /** @type {Node} */
  var target = /** @type {Node} */(/** @type {Object} */(opt_target));
  this.target = target || e.target;
  this.currentTarget = e.currentTarget || this.target;
  this.relatedTarget = e.relatedTarget || this.target;

  this['labelIndex'] = e.target && e.target['__tagIndex'];
  if (isNaN(this['labelIndex']))
    this['labelIndex'] = -1;

  this.offsetX = e.offsetX;
  this.offsetY = e.offsetY;

  this.clientX = e.clientX;
  this.clientY = e.clientY;

  this.screenX = e.screenX;
  this.screenY = e.screenY;

  this.button = e.button;

  this.keyCode = e.keyCode;
  this.charCode = e.charCode;
  this.ctrlKey = e.ctrlKey;
  this.altKey = e.altKey;
  this.shiftKey = e.shiftKey;
  this.metaKey = e.metaKey;
  this.platformModifierKey = e.platformModifierKey;
  this.state = e.state;

  this.event_ = e;
  delete this.propagationStopped_;
};
