goog.provide('anychart.elements.Label');
goog.require('anychart.elements.Background');
goog.require('anychart.elements.Text');
goog.require('anychart.math.Coordinate');
goog.require('anychart.math.Rect');
goog.require('anychart.utils');
goog.require('anychart.utils.Padding');



/**
 * Класс, описывающий элемент - лейбл.<br/>
 * Лейбл может быть как частью другого, более сложного, элемента (чарт, легенда, ось и тд), так и самостоятельным
 * элементом визаулизации.<br/>
 * Лейблу можно задать background, а также его можно спозиционировать широким набором инструментов:
 * <ul>
 *   <li>{@link anychart.elements.Label#anchor}</li>
 *   <li>{@link anychart.elements.Label#position}</li>
 *   <li>{@link anychart.elements.Label#offsetX} и {@link anychart.elements.Label#offsetY}</li>
 *   <li>{@link anychart.elements.Label#parentBounds}</li>
 * </ul>
 * @example <c>Создание самостоятельного заголовка.</c><t>simple-h100</t>
 * new anychart.elements.Label()
 *     .text('My custom Label')
 *     .fontSize(27)
 *     .background(null)
 *     .container(stage)
 *     .draw();
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
   * @type {anychart.utils.NinePositions}
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

  /**
   * Adjust font size by width.
   * @type {boolean}
   * @private
   */
  this.adjustByWidth_ = false;

  /**
   * Adjust font size by height.
   * @type {boolean}
   * @private
   */
  this.adjustByHeight_ = false;

  /**
   * Min font size for adjusting from.
   * @type {number}
   * @private
   */
  this.minFontSize_ = 8;

  /**
   * Max font size for adjusting to.
   * @type {number}
   * @private
   */
  this.maxFontSize_ = 72;

  this.restoreDefaults();
};
goog.inherits(anychart.elements.Label, anychart.elements.Text);


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.elements.Label.prototype.SUPPORTED_SIGNALS = anychart.elements.Text.prototype.SUPPORTED_SIGNALS;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.elements.Label.prototype.SUPPORTED_CONSISTENCY_STATES =
    (anychart.elements.Text.prototype.SUPPORTED_CONSISTENCY_STATES |
        anychart.ConsistencyState.BACKGROUND);


//----------------------------------------------------------------------------------------------------------------------
//
//  Text.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Gets text content for current label.
 * @return {string} Current text content of label.
 *//**
 * Sets text content for label.
 * @example <t>simple-h100</t>
 * new anychart.elements.Label()
 *      .text('My custom label Text')
 *      .container(stage)
 *      .background(null)
 *      .draw();
 * @param {string=} opt_value ['Label text'] Value to set.
 * @return {!anychart.elements.Label} Экземпляр класса {@link anychart.elements.Label} для цепочного вызова.
 *//**
 * @ignoreDoc
 * @param {string=} opt_value .
 * @return {!anychart.elements.Label|string} .
 */
anychart.elements.Label.prototype.text = function(opt_value) {
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
    this.registerDisposable(this.background_);
    this.background_.listenSignals(this.backgroundInvalidated_, this);
  }

  if (goog.isDef(opt_value)) {
    this.background_.suspendSignalsDispatching();
    if (opt_value instanceof anychart.elements.Background) {
      this.background_.deserialize(opt_value.serialize());
    } else if (goog.isObject(opt_value)) {
      this.background_.deserialize(opt_value);
    } else if (anychart.utils.isNone(opt_value)) {
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
anychart.elements.Label.prototype.backgroundInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    this.invalidate(anychart.ConsistencyState.BACKGROUND,
        anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Getter for current label padding.<br/>
 * Иллюстрацию работы с margins см тут {@link anychart.Chart#padding}.
 * @return {anychart.utils.Padding} Current label padding.
 *//**
 * Setter for label padding in pixels by one value.<br/>
 * @param {(string|number|anychart.utils.Space)=} opt_value [null] Value to set.
 * @return {anychart.elements.Label} Экземпляр класса {@link anychart.elements.Label} для цепочного вызова.
 *//**
 * Setter for label padding in pixels by few numbers.<br/>
 * @example <t>listingOnly</t>
 * // 1) top and bottom 10px, left and right 15px
 * label.padding(10, '15px');
 * // 2) top 10px, left and right 15px, bottom 5px
 * label.padding(10, '15px', 5);
 * // 3) top 10px, right 15px, bottom 5px, left 12px
 * label.padding(10, '15px', '5px', 12);
 * @param {(string|number)=} opt_value1 Top or top-bottom space.
 * @param {(string|number)=} opt_value2 Right or right-left space.
 * @param {(string|number)=} opt_value3 Bottom space.
 * @param {(string|number)=} opt_value4 Left space.
 * @return {anychart.elements.Label} Экземпляр класса {@link anychart.elements.Label} для цепочного вызова.
 *//**
 * @ignoreDoc
 * @param {(string|number|anychart.utils.Space)=} opt_spaceOrTopOrTopAndBottom .
 * @param {(string|number)=} opt_rightOrRightAndLeft .
 * @param {(string|number)=} opt_bottom .
 * @param {(string|number)=} opt_left .
 * @return {anychart.elements.Label|anychart.utils.Padding} .
 */
anychart.elements.Label.prototype.padding = function(opt_spaceOrTopOrTopAndBottom, opt_rightOrRightAndLeft, opt_bottom, opt_left) {
  if (!this.padding_) {
    this.padding_ = new anychart.utils.Padding();
    this.registerDisposable(this.padding_);
    this.padding_.listenSignals(this.boundsInvalidated_, this);
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
anychart.elements.Label.prototype.boundsInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.BOUNDS,
        anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Width/Height.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter for label width.
 * @return {number|string|null} Current label width.
 *//**
 * Setter for label width.<br/>
 * <b>Note:</b> Если будет переданно <b>null</b>, то ширина будет рассчитываться автоматически.
 * @example <t>simple-h100</t>
 * label = new anychart.elements.Label()
 *      .width('200px');
 * // отметим область, занимаемую лейблом, синей рамкой.
 * label.background().stroke('1 #00F')
 * label.container(stage).draw();
 * @param {(number|string|null)=} opt_value [null] Value to set.
 * @return {!anychart.elements.Label} Экземпляр класса {@link anychart.elements.Label} для цепочного вызова.
 *//**
 * @ignoreDoc
 * @param {(number|string|null)=} opt_value .
 * @return {!anychart.elements.Label|number|string|null} .
 */
anychart.elements.Label.prototype.width = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.width_ != opt_value) {
      this.width_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.width_;
};


/**
 * Getter for label height.
 * @return {number|string|null} Current label width.
 *//**
 * Setter for label height.<br/>
 * <b>Note:</b> Если будет переданно <b>null</b>, то высота будет рассчитываться автоматически.
 * @example <t>simple-h100</t>
 * label = new anychart.elements.Label()
 *      .height('90px');
 * // отметим область, занимаемую лейблом, синей рамкой.
 * label.background().stroke('1 #00F')
 * label.container(stage).draw();
 * @param {(number|string|null)=} opt_value [null] Value to set.
 * @return {!anychart.elements.Label} Экземпляр класса {@link anychart.elements.Label} для цепочного вызова.
 *//**
 * @ignoreDoc
 * @param {(number|string|null)=} opt_value .
 * @return {!anychart.elements.Label|number|string|null} .
 */
anychart.elements.Label.prototype.height = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.height_ != opt_value) {
      this.height_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.height_;
};


/**
 * Возвращает баунды отностительно которых идут рассчеты позиционирования элемента.
 * @return {anychart.math.Rect} Current parent bounds.
 *//**
 * Устанавливает баунды отностительно которых идут рассчеты позиционирования элемента.<br/>
 * Width, height, offsets заданные в проуентах считаются относительно этих заданных баундов.
 * @illustration <t>simple-h100</t>
 * var layer = stage.layer();
 * var stageBounds = new anychart.math.Rect(0, 0, stage.width(), stage.height());
 * var layerBounds = new anychart.math.Rect(100, 20, stage.width() / 3, stage.height() / 3);
 * layer.rect(1, 1, stage.width() - 2, stage.height() - 2)
 *      .stroke('2 red');
 * layer.text(2*stage.width()/3, 2, 'stageBounds');
 * var layer2 = stage.layer();
 * layer2.rect(layerBounds.left, layerBounds.top, layerBounds.width, layerBounds.height)
 *      .stroke('2 blue');
 * layer2.text(layerBounds.left, layerBounds.top+layerBounds.height, 'layerBounds');
 * new anychart.elements.Label()
 *     .container(layer2)
 *     .parentBounds(stageBounds)
 *     .background(null)
 *     .draw();
 * new anychart.elements.Label()
 *     .container(layer2)
 *     .background(null)
 *     .parentBounds(layerBounds)
 *     .fontColor('gray')
 *     .draw();
 * @illustrationDesc
 * Label находится внутри layer (обозначенного синей рамкой) и показаны два варианта рассчета позиции label:<br/>
 *   a. Серым - рассчет внутри баунов родительского кнтейнера.<br/>
 *   b. Черным - когда в качестве родительских заданы баунды stage.
 * @example <t>listingOnly</t>
 * new anychart.elements.Label()
 *     .container(layer)
 *     .parentBounds(stageBounds)
 *     .background(null)
 *     .draw();
 * @param {anychart.math.Rect=} opt_value [null] Value to set.
 * @return {!anychart.elements.Label} Экземпляр класса {@link anychart.elements.Label} для цепочного вызова.
 *//**
 * @ignoreDoc
 * @param {anychart.math.Rect=} opt_value .
 * @return {!anychart.elements.Label|anychart.math.Rect} .
 */
anychart.elements.Label.prototype.parentBounds = function(opt_value) {
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
    this.invalidate(anychart.ConsistencyState.BOUNDS,
        anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    return this;
  } else {
    return this.rotation_;
  }
};


/**
 * Getter for label anchor settings.
 * @return {anychart.utils.NinePositions} Current label anchor settings.
 *//**
 * Setter for label anchor settings.<br/>
 * <b>Note:</b> Совмещает точку позиционирования лейбла ({@link anychart.elements.Label#position}) с указанным якорем.
 * @example <t>simple-h100</t>
 * var label = new anychart.elements.Label()
 *     .padding(5)
 *     .position([100, 50])
 *     .anchor(anychart.utils.NinePositions.LEFT_BOTTOM);
 * label.background().stroke('1 #aaa')
 * label.container(stage).draw();
 * // обозначим красным точку поционирования лейбла.
 * stage.circle(100, 50, 2).stroke('3 red')
 * @param {(anychart.utils.NinePositions|string)=} opt_value [{@link anychart.utils.NinePositions}.LEFT_TOP] Value to set.
 * @return {!anychart.elements.Label} Экземпляр класса {@link anychart.elements.Label} для цепочного вызова.
 *//**
 * @ignoreDoc
 * @param {(anychart.utils.NinePositions|string)=} opt_value .
 * @return {!anychart.elements.Label|anychart.utils.NinePositions} .
 */
anychart.elements.Label.prototype.anchor = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.utils.normalizeNinePositions(opt_value);
    if (this.anchor_ != opt_value) {
      this.anchor_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.anchor_;
  }
};


/**
 * Getter for current label offsetX settings.
 * @return {number|string} Label offsetX value.
 *//**
 * Setter for label offsetX settings.
 * @illustration <t>simple</t>
 * var pathBounds = {
 *   left: stage.width() / 3,
 *   top: stage.height() / 8,
 *   width: 3 * stage.height() / 7,
 *   height: 3 * stage.height() / 7
 * };
 * stage.path().fill('none').stroke('1 grey .2')
 *     .moveTo(pathBounds.left, pathBounds.top)
 *     .lineTo(pathBounds.left + pathBounds.width, pathBounds.top)
 *     .lineTo(pathBounds.left + pathBounds.width, pathBounds.top + pathBounds.height)
 *     .lineTo(pathBounds.left, pathBounds.top + pathBounds.height)
 *     .close();
 * stage.text(pathBounds.left - 55, pathBounds.top - 15, 'LEFT_TOP');
 * stage.circle(pathBounds.left, pathBounds.top, 3).fill('blue');
 * stage.triangleUp(pathBounds.left + 15, pathBounds.top + 15, 5)
 *     .rotateByAnchor(25, acgraph.vector.Anchor.CENTER).fill('green');
 * stage.path().moveTo(pathBounds.left + 15, pathBounds.top + 15)
 *     .lineTo(pathBounds.left, pathBounds.top);
 * stage.text(pathBounds.left - 78, pathBounds.top + pathBounds.height / 2 - 8, 'LEFT_CENTER');
 * stage.circle(pathBounds.left, pathBounds.top + pathBounds.height / 2, 3).fill('blue');
 * stage.triangleUp(pathBounds.left + 15, pathBounds.top + pathBounds.height / 2 + 15, 5)
 *     .rotateByAnchor(25, acgraph.vector.Anchor.CENTER).fill('green');
 * stage.path().moveTo(pathBounds.left + 15, pathBounds.top + pathBounds.height / 2 + 15)
 *     .lineTo(pathBounds.left, pathBounds.top + pathBounds.height / 2);
 * stage.text(pathBounds.left - 80, pathBounds.top + pathBounds.height, 'LEFT_BOTTOM');
 * stage.circle(pathBounds.left, pathBounds.top + pathBounds.height, 3).fill('blue');
 * stage.triangleUp(pathBounds.left + 15, pathBounds.top + pathBounds.height - 15, 5)
 *     .rotateByAnchor(35, acgraph.vector.Anchor.CENTER).fill('green');
 * stage.path().moveTo(pathBounds.left + 15, pathBounds.top + pathBounds.height - 15)
 *     .lineTo(pathBounds.left, pathBounds.top + pathBounds.height);
 * stage.text(pathBounds.left + pathBounds.width / 2 - 10, pathBounds.top - 18, 'TOP');
 * stage.circle(pathBounds.left + pathBounds.width / 2, pathBounds.top, 3).fill('blue');
 * stage.triangleUp(pathBounds.left + pathBounds.width / 2 + 15, pathBounds.top + 15, 5)
 *     .rotateByAnchor(25, acgraph.vector.Anchor.CENTER).fill('green');
 * stage.path().moveTo(pathBounds.left + pathBounds.width / 2 + 15, pathBounds.top + 15)
 *     .lineTo(pathBounds.left + pathBounds.width / 2, pathBounds.top);
 * stage.text(pathBounds.left + pathBounds.width / 2 - 20, pathBounds.top + pathBounds.height / 2 - 15, 'CENTER');
 * stage.circle(pathBounds.left + pathBounds.width / 2, pathBounds.top + pathBounds.height / 2, 3).fill('blue');
 * stage.triangleUp(pathBounds.left + pathBounds.width / 2 + 15, pathBounds.top + pathBounds.height / 2 + 15, 5)
 *     .rotateByAnchor(25, acgraph.vector.Anchor.CENTER).fill('green');
 * stage.path().moveTo(pathBounds.left + pathBounds.width / 2 + 15, pathBounds.top + pathBounds.height / 2 + 15)
 *     .lineTo(pathBounds.left + pathBounds.width / 2, pathBounds.top + pathBounds.height / 2);
 * stage.text(pathBounds.left + pathBounds.width / 2 - 23, pathBounds.top + pathBounds.height + 2, 'BOTTOM');
 * stage.circle(pathBounds.left + pathBounds.width / 2, pathBounds.top + pathBounds.height, 3).fill('blue');
 * stage.triangleUp(pathBounds.left + pathBounds.width / 2 + 15, pathBounds.top + pathBounds.height - 15, 5)
 *     .rotateByAnchor(35, acgraph.vector.Anchor.CENTER).fill('green');
 * stage.path().moveTo(pathBounds.left + pathBounds.width / 2 + 15, pathBounds.top + pathBounds.height - 15)
 *     .lineTo(pathBounds.left + pathBounds.width / 2, pathBounds.top + pathBounds.height);
 * stage.text(pathBounds.left + pathBounds.width + 5, pathBounds.top - 15, 'RIGHT_TOP');
 * stage.circle(pathBounds.left + pathBounds.width, pathBounds.top, 3).fill('blue');
 * stage.triangleUp(pathBounds.left + pathBounds.width - 15, pathBounds.top + 15, 5)
 *     .rotateByAnchor(-25, acgraph.vector.Anchor.CENTER).fill('green');
 * stage.path().moveTo(pathBounds.left + pathBounds.width - 15, pathBounds.top + 15)
 *     .lineTo(pathBounds.left + pathBounds.width, pathBounds.top);
 * stage.text(pathBounds.left + pathBounds.width + 5, pathBounds.top + pathBounds.height / 2 - 8, 'RIGHT_CENTER');
 * stage.circle(pathBounds.left + pathBounds.width, pathBounds.top + pathBounds.height / 2, 3).fill('blue');
 * stage.triangleUp(pathBounds.left + pathBounds.width - 15, pathBounds.top + pathBounds.height / 2 + 15, 5)
 *     .rotateByAnchor(-25, acgraph.vector.Anchor.CENTER).fill('green');
 * stage.path().moveTo(pathBounds.left + pathBounds.width - 15, pathBounds.top + pathBounds.height / 2 + 15)
 *     .lineTo(pathBounds.left + pathBounds.width, pathBounds.top + pathBounds.height / 2);
 * stage.text(pathBounds.left + pathBounds.width + 5, pathBounds.top + pathBounds.height, 'RIGHT_BOTTOM');
 * stage.circle(pathBounds.left + pathBounds.width, pathBounds.top + pathBounds.height, 3).fill('blue');
 * stage.triangleUp(pathBounds.left + pathBounds.width - 15, pathBounds.top + pathBounds.height - 15, 5)
 *     .rotateByAnchor(85, acgraph.vector.Anchor.CENTER).fill('green');
 * stage.path().moveTo(pathBounds.left + pathBounds.width - 15, pathBounds.top + pathBounds.height - 15)
 *     .lineTo(pathBounds.left + pathBounds.width, pathBounds.top + pathBounds.height);
 * @illustrationDesc
 * Стрелочками обозначено направление положительно заданных офсетов относительно якоря в котором спозиционирован лейбл.
 * @example <t>simple-h100</t>
 * var label = new anychart.elements.Label()
 *     .padding(5)
 *     .position([100, 50])
 *     // выставляем оффсеты по 10px.
 *     .offsetX(10)
 *     .offsetY(10)
 *     .anchor(anychart.utils.NinePositions.RIGHT_BOTTOM);
 * label.background().stroke('1 #aaa')
 * label.container(stage).draw();
 * // обозначим красным точку поционирования лейбла.
 * stage.circle(100, 50, 2).stroke('3 red')
 * @param {(number|string)=} opt_value [0] Value to set.
 * @return {!anychart.elements.Label} Экземпляр класса {@link anychart.elements.Label} для цепочного вызова.
 *//**
 * @ignoreDoc
 * @param {(number|string)=} opt_value .
 * @return {number|string|anychart.elements.Label} .
 */
anychart.elements.Label.prototype.offsetX = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.offsetX_ = opt_value;
    this.invalidate(anychart.ConsistencyState.BOUNDS,
        anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    return this;
  } else {
    return this.offsetX_;
  }
};


/**
 * Getter for current label offsetY settings.
 * @return {number|string} Label offsetY value.
 *//**
 * Setter for label offsetY settings.
 * See illustration in {@link anychart.elements.Label#offsetX}.
 * @example <t>simple-h100</t>
 * var label = new anychart.elements.Label()
 *     .padding(5)
 *     .position([100, 50])
 *     // выставляем оффсеты по 10px.
 *     .offsetX(10)
 *     .offsetY(10)
 *     .anchor(anychart.utils.NinePositions.RIGHT_BOTTOM);
 * label.background().stroke('1 #aaa')
 * label.container(stage).draw();
 * // обозначим красным точку поционирования лейбла.
 * stage.circle(100, 50, 2).stroke('3 red')
 * @param {(number|string)=} opt_value [0] Value to set.
 * @return {!anychart.elements.Label} Экземпляр класса {@link anychart.elements.Label} для цепочного вызова.
 *//**
 * @ignoreDoc
 * @param {(number|string)=} opt_value .
 * @return {number|string|anychart.elements.Label} .
 */
anychart.elements.Label.prototype.offsetY = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.offsetY_ = opt_value;
    this.invalidate(anychart.ConsistencyState.BOUNDS,
        anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    return this;
  } else {
    return this.offsetY_;
  }
};


/**
 * Getter for current label position settings.
 * @return {anychart.math.Coordinate} Current label position settings.
 *//**
 * Setter for label position settings.
 * @example <t>simple-h100</t>
 * var label = new anychart.elements.Label()
 *     .padding(5)
 *     .position([100, 50])
 * label.background().stroke('1 #aaa')
 * label.container(stage).draw();
 * // обозначим красным точку поционирования лейбла.
 * stage.circle(100, 50, 2).stroke('3 red')
 * @param {anychart.math.Coordinate=} opt_value [{x: 0, y: 0} относительно заанных баундов] Value to set.
 * @return {!anychart.elements.Label} Экземпляр класса {@link anychart.elements.Label} для цепочного вызова.
 *//**
 * @ignoreDoc
 * @param {(anychart.utils.NinePositions|string)=} opt_value .
 * @return {!anychart.elements.Label|anychart.utils.NinePositions} .
 */
anychart.elements.Label.prototype.position = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.utils.normalizeNinePositions(opt_value);
    if (this.position_ != opt_value) {
      this.position_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.position_;
  }
};


/**
 * Helper method.
 * @private
 * @return {boolean} is adjustment enabled.
 */
anychart.elements.Label.prototype.adjustEnabled_ = function() {
  return (this.adjustByWidth_ || this.adjustByHeight_);
};


/**
 * Min font size setting for adjust text from.
 * @param {(number|string)=} opt_value
 * @return {number|anychart.elements.Label}
 */
anychart.elements.Label.prototype.minFontSize = function(opt_value) {
  if (goog.isDef(opt_value) && !isNaN(+opt_value)) {
    if (this.minFontSize_ != +opt_value) {
      this.minFontSize_ = +opt_value;
      // незачем инвалидейтить лишний раз баунды, если аджастинг не включен
      if (this.adjustEnabled_())
        this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.minFontSize_;
};


/**
 * Max font size setting for adjust text to.
 * @param {(number|string)=} opt_value
 * @return {number|anychart.elements.Label}
 */
anychart.elements.Label.prototype.maxFontSize = function(opt_value) {
  if (goog.isDef(opt_value) && !isNaN(+opt_value)) {
    if (this.maxFontSize_ != +opt_value) {
      this.maxFontSize_ = +opt_value;
      // незачем инвалидейтить лишний раз баунды, если аджастинг не включен
      if (this.adjustEnabled_())
        this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.maxFontSize_;
};


/**
 * Getter.
 * всегда возвращает массив состоящий их 2х элементов
 *   this.adjustByWidth_, который означает, что аджастинг будет/не будет по ширине и
 *   this.adjustByHeight_, который означает, что аджастинг будет/не будет по высоте
 *   таким образом имеем 4 массива на выходе:
 *     [false, false] - не аджастить (выключен аджаст)
 *     [false, true] - аджастить по ширине
 *     [true, false] - аджастить по высоте
 *     [true, true] - аджастить по ближайшему попавшему значению.
 * @return {Array.<boolean, boolean>} adjustFontSite setting or self for chaining.
 *//**
 * Setter
 * Как сеттер он работает в 3х режимах:
 *   1) первый аргумент - массив, значит что он ожидает настройки [this.adjustByWidth_, this.adjustByHeight_]
 *   2) переданный аргумент - единственный - значит что настройку нужно применить и к this.adjustByWidth_ и к this.adjustByHeight_.
 *      в таком случае изменение произойдёт и label счейнится только в том случае если какая-либо из найстроек реально поменялась.
 *      это значит что если они обе выключены и прийдет false - ничего не произойдет, если обе включены и пришло true - тоже, в
 *      остальных случаях изменения сработают.
 *   3) передано 2 аргумента - стандартный сеттер 2х аргументов: если значение одной из настроек изменилось - произойдет инвалидация
 *      иначе ничего не случится, но при этом чейнинг сработает (если было true true и передать true true - вернется лейбл, а не массив значений)
 * @param {(boolean|Array.<boolean, boolean>)=} opt_adjustOrAdjustByWidth Is font need to be adjusted in case of 1 argument and adjusted by width in case of 2 arguments.
 * @param {boolean=} opt_adjustBeHeight Is font need to be adjusted by height.
 * @return {!anychart.elements.Label} adjustFontSite setting or self for chaining.
 *//**
 * @ignoreDoc
 * @param {(boolean|Array.<boolean, boolean>)=} opt_adjustOrAdjustByWidth Is font need to be adjusted in case of 1 argument and adjusted by width in case of 2 arguments.
 * @param {boolean=} opt_adjustBeHeight Is font need to be adjusted by height.
 * @return {(Array.<boolean, boolean>|anychart.elements.Label)} adjustFontSite setting or self for chaining.
 */
anychart.elements.Label.prototype.adjustFontSize = function(opt_adjustOrAdjustByWidth, opt_adjustBeHeight) {
  // Если значения заданы массивом ( [true, true] [true, false] [false, true] [false, false]  )а не набором 2х агументов просто развернем их
  if (goog.isArray(opt_adjustOrAdjustByWidth)) {
    return this.adjustFontSize.apply(this, opt_adjustOrAdjustByWidth);
  }
  var stateToInvalidate = 0;
  // если просто задано 2 аргумента
  if (goog.isDef(opt_adjustBeHeight)) {
    if (this.adjustByWidth_ != !!opt_adjustOrAdjustByWidth) {
      this.adjustByWidth_ = !!opt_adjustOrAdjustByWidth;
      stateToInvalidate |= anychart.ConsistencyState.BOUNDS;
    }
    if (this.adjustByHeight_ != !!opt_adjustBeHeight) {
      this.adjustByHeight_ = !!opt_adjustBeHeight;
      stateToInvalidate |= anychart.ConsistencyState.BOUNDS;
    }
    this.invalidate(stateToInvalidate, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    return this;
  // если задан только один аргумент - значит это просто adjusting для обеих величин
  } else if (goog.isDef(opt_adjustOrAdjustByWidth)) {
    if (!(this.adjustByWidth_ == this.adjustByHeight_ && this.adjustByWidth_ == opt_adjustOrAdjustByWidth)) {
      this.adjustByWidth_ = this.adjustByHeight_ = /** @type {boolean} */ (opt_adjustOrAdjustByWidth);
      this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
      return this;
    }
  }
  return [this.adjustByWidth_, this.adjustByHeight_];
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Drawing.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Check
 * @param {number} width
 * @param {number} height
 * @param {number} originWidth
 * @param {number} originHeight
 * @return {number}
 * @private
 */
anychart.elements.Label.prototype.check_ = function(width, height, originWidth, originHeight) {
  if (this.adjustByWidth_ && this.adjustByHeight_) {
    if (width > originWidth || height > originHeight) {
      return 1;
    } else if (width < originWidth || height < originHeight) {
      return -1;
    }
  } else if (this.adjustByWidth_) {
    if (width < originWidth) {
      return -1;
    } else if (width > originWidth) {
      return 1;
    }
  } else if (this.adjustByHeight_) {
    if (height < originHeight) {
      return -1;
    } else if (height > originHeight) {
      return 1;
    }
  }

  return 0;
};


/**
 * Adjust font size by width/height.
 * @param {number} originWidth
 * @param {number} originHeight
 * @return {number}
 * @private
 */
anychart.elements.Label.prototype.calculateFontSize_ = function(originWidth, originHeight) {
  /** @type {number} */
  var fontSize = Math.round(this.maxFontSize_ - this.minFontSize_);

  /** @type {number} */
  var from = this.minFontSize_;

  /** @type {number} */
  var to = this.maxFontSize_;

  /** @type {number} */
  var checked;

  var settings = this.changedSettings;
  var text = acgraph.text();
  this.applyTextSettings(text, true);
  this.changedSettings = settings;

  while (from != to) {
    text.fontSize(fontSize);
    checked = this.check_(text.getBounds().width, text.getBounds().height, originWidth, originHeight);
    if (checked < 0) {
      from = Math.min(fontSize + 1, to);
      fontSize += Math.floor((to - fontSize) / 2);
    } else if (checked > 0) {
      to = Math.max(fontSize - 1, from);
      fontSize -= Math.ceil((fontSize - from) / 2);
    } else {
      break;
    }
  }

  goog.dispose(text);
  return fontSize;
};


/**
 * Calculate label bounds.
 * @private
 */
anychart.elements.Label.prototype.calculateLabelBounds_ = function() {
  /** @type {number} */
  var parentWidth;
  /** @type {number} */
  var parentHeight;
  var width;
  var height;
  var autoWidth;
  var autoHeight;

  // canAdjustBy = !auto
  if (this.parentBounds_) {
    parentWidth = this.parentBounds_.width;
    parentHeight = this.parentBounds_.height;
    if (goog.isDefAndNotNull(this.width_)) {
      this.backgroundWidth_ = width = anychart.utils.normalize(/** @type {number|string} */(this.width_), parentWidth);
      autoWidth = false;
    } else {
      width = 0;
      autoWidth = true;
    }
    if (goog.isDefAndNotNull(this.height_)) {
      this.backgroundHeight_ = height = anychart.utils.normalize(/** @type {number|string} */(this.height_), parentHeight);
      autoHeight = false;
    } else {
      height = 0;
      autoHeight = true;
    }
  } else {
    if (goog.isNumber(this.width_) && !isNaN(this.width_)) {
      autoWidth = false;
      this.backgroundWidth_ = width = this.width_;
    } else {
      autoWidth = true;
      width = 0;
    }
    if (goog.isNumber(this.height_) && !isNaN(this.height_)) {
      autoHeight = false;
      this.backgroundHeight_ = height = this.height_;
    } else {
      autoHeight = true;
      height = 0;
    }
  }

  var padding = this.padding();

  if (autoWidth) {
    width += this.textElement_.getBounds().width;
    this.textWidth_ = width;
    width = this.backgroundWidth_ = padding.widenWidth(width);
  } else {
    width = this.textWidth_ = padding.tightenWidth(width);
  }

  if (autoHeight) {
    height += this.textElement_.getBounds().height;
    this.textHeight_ = height;
    height = this.backgroundHeight_ = padding.widenHeight(height);
  } else {
    height = this.textHeight_ = padding.tightenHeight(height);
  }

  var canAdjustByWidth = !autoWidth;
  var canAdjustByHeight = !autoHeight;

  var needAdjust = ((canAdjustByWidth && this.adjustByWidth_) || (canAdjustByHeight && this.adjustByHeight_));

  if (needAdjust) {
    var calculatedFontSize = this.calculateFontSize_(width, height);
    this.suspendSignalsDispatching();
    this.fontSize(calculatedFontSize);
    this.textElement_.fontSize(calculatedFontSize);
    this.resumeSignalsDispatching(false);
  }

  this.textX_ = anychart.utils.normalize(/** @type {number|string} */ (padding.left()), this.backgroundWidth_);
  this.textY_ = anychart.utils.normalize(/** @type {number|string} */ (padding.top()), this.backgroundHeight_);
};


/**
 * Render label content.
 * @return {!anychart.elements.Label} Экземпляр класса {@link anychart.elements.Label} для цепочного вызова.
 */
anychart.elements.Label.prototype.draw = function() {
  if (!this.checkDrawingNeeded())
    return this;

  var isInitial = this.createTextElement_();

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    this.applyTextSettings(/** @type {!acgraph.vector.Text} */(this.textElement_), isInitial);
    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    this.calculateLabelBounds_();

    //bounds
    var parentX = 0;
    var parentY = 0;
    var parentWidth = 0;
    var parentHeight = 0;
    var backgroundBounds = new anychart.math.Rect(0, 0, this.backgroundWidth_, this.backgroundHeight_);

    //define parent bounds
    if (this.parentBounds_) {
      parentX = this.parentBounds_.left;
      parentY = this.parentBounds_.top;
      parentWidth = this.parentBounds_.width;
      parentHeight = this.parentBounds_.height;
    }

    // calculate position
    var position = new acgraph.math.Coordinate(0, 0);

    if (this.parentBounds_) {
      switch (this.position_) {
        case anychart.utils.NinePositions.LEFT_TOP:
          position.x = parentX;
          position.y = parentY;
          break;

        case anychart.utils.NinePositions.LEFT_CENTER:
          position.x = parentX;
          position.y = parentY + parentHeight / 2;
          break;

        case anychart.utils.NinePositions.LEFT_BOTTOM:
          position.x = parentX;
          position.y = parentY + parentHeight;
          break;

        case anychart.utils.NinePositions.TOP:
          position.x = parentX + parentWidth / 2;
          position.y = parentY;
          break;

        case anychart.utils.NinePositions.CENTER:
          position.x = parentX + parentWidth / 2;
          position.y = parentY + parentHeight / 2;
          break;

        case anychart.utils.NinePositions.BOTTOM:
          position.x = parentX + parentWidth / 2;
          position.y = parentY + parentHeight;
          break;

        case anychart.utils.NinePositions.RIGHT_TOP:
          position.x = parentX + parentWidth;
          position.y = parentY;
          break;

        case anychart.utils.NinePositions.RIGHT_CENTER:
          position.x = parentX + parentWidth;
          position.y = parentY + parentHeight / 2;
          break;

        case anychart.utils.NinePositions.RIGHT_BOTTOM:
          position.x = parentX + parentWidth;
          position.y = parentY + parentHeight;
          break;
      }
    } else {
      position.x = 0;
      position.y = 0;
    }

    var anchorCoordinate = anychart.utils.getCoordinateByAnchor(
        new acgraph.math.Rect(0, 0, this.backgroundWidth_, this.backgroundHeight_),
        this.anchor_);

    position.x -= anchorCoordinate.x;
    position.y -= anchorCoordinate.y;

    var offsetX = goog.isDef(this.offsetX_) ? anychart.utils.normalize(this.offsetX_, parentWidth) : 0;
    var offsetY = goog.isDef(this.offsetY_) ? anychart.utils.normalize(this.offsetY_, parentHeight) : 0;
    anychart.utils.applyOffsetByAnchor(position, this.anchor_, offsetX, offsetY);

    this.textX_ += position.x;
    this.textY_ += position.y;
    backgroundBounds.left = position.x;
    backgroundBounds.top = position.y;

    var container = /** @type {acgraph.vector.ILayer} */(this.container());

    this.textElement_.width(this.textWidth_);
    this.textElement_.height(this.textHeight_);

    this.textElement_.setTransformationMatrix(1, 0, 0, 1, 0, 0);
    this.textElement_.translate(/** @type {number} */(this.textX_), /** @type {number} */(this.textY_));
    var clipRect = new acgraph.math.Rect(0, 0, this.textWidth_, this.textHeight_);
    this.textElement_.clip(clipRect);

    this.invalidate(anychart.ConsistencyState.BACKGROUND);
    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }


  if (this.hasInvalidationState(anychart.ConsistencyState.BACKGROUND)) {
    if (this.background_) {
      this.background_.suspendSignalsDispatching();
      this.background_.pixelBounds(backgroundBounds);
      this.background_.draw();
      this.background_.resumeSignalsDispatching(false);
    }
    this.markConsistent(anychart.ConsistencyState.BACKGROUND);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    var zIndex = /** @type {number} */(this.zIndex());
    if (this.textElement_) this.textElement_.zIndex(zIndex);
    if (this.background_) this.background_.zIndex(zIndex);
    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    if (this.background_) this.background_.container(container).draw();
    if (this.textElement_) this.textElement_.parent(container);
    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }

  return this;
};


/** @inheritDoc */
anychart.elements.Label.prototype.remove = function() {
  if (this.textElement_) this.textElement_.parent(null);
  if (this.background_) this.background_.remove();
};


/** @inheritDoc */
anychart.elements.Label.prototype.applyTextSettings = function(textElement, isInitial) {
  if (isInitial || 'text' in this.changedSettings || 'useHtml' in this.changedSettings) {
    if (!!this.settingsObj['useHtml'])
      textElement.htmlText(this.settingsObj['text']);
    else
      textElement.text(this.settingsObj['text']);
  }
  goog.base(this, 'applyTextSettings', textElement, isInitial);
  this.changedSettings = {};
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


/**
 * Return label content bounds.
 * @return {anychart.math.Rect} Label content bounds.
 */
anychart.elements.Label.prototype.getContentBounds = function() {
  var isInitial = false;

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    this.createTextElement_();
    this.applyTextSettings(/** @type {!acgraph.vector.Text} */(this.textElement_), isInitial);
    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    this.calculateLabelBounds_();
  }

  return new anychart.math.Rect(0, 0, this.backgroundWidth_, this.backgroundHeight_);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Utils.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * @inheritDoc
 */
anychart.elements.Label.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');

  json['width'] = this.width();
  json['height'] = this.height();
  json['rotation'] = this.rotation();
  json['position'] = this.position();
  json['anchor'] = this.anchor();
  json['offsetX'] = this.offsetX();
  json['offsetY'] = this.offsetY();
  json['minFontSize'] = this.minFontSize();
  json['maxFontSize'] = this.maxFontSize();
  json['adjustFontSize'] = this.adjustFontSize();

  json['padding'] = this.padding().serialize();
  json['background'] = this.background().serialize();

  return json;
};


/**
 * @inheritDoc
 */
anychart.elements.Label.prototype.deserialize = function(config) {
  this.suspendSignalsDispatching();

  goog.base(this, 'deserialize', config);

  this.width(config['width']);
  this.height(config['height']);
  this.rotation(config['rotation']);
  this.position(config['position']);
  this.anchor(config['anchor']);
  this.offsetX(config['offsetX']);
  this.offsetY(config['offsetY']);
  this.minFontSize(config['minFontSize']);
  this.maxFontSize(config['maxFontSize']);
  this.adjustFontSize(config['adjustFontSize']);

  if ('padding' in config)
    this.padding().deserialize(config['padding']);
  if ('background' in config)
    this.background().deserialize(config['background']);

  this.resumeSignalsDispatching(true);

  return this;
};


/**
 * Restore label default settings.
 */
anychart.elements.Label.prototype.restoreDefaults = function() {
  this.zIndex(50);
  this.parentBounds(null);
  this.width(null);
  this.height(null);
  this.padding(0);
  this.background(null);
  this.position(anychart.utils.NinePositions.LEFT_TOP);
  this.anchor(anychart.utils.NinePositions.LEFT_TOP);
  this.offsetX(0);
  this.offsetY(0);
  this.rotation(0);
  this.adjustFontSize(false, false);
  this.minFontSize(8);
  this.maxFontSize(72);
  this.text('Label text');
  this.fontFamily('Tahoma');
  this.fontSize('11');
  this.fontWeight('bold');
  this.invalidate(anychart.ConsistencyState.ALL, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
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
