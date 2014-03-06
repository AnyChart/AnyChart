goog.provide('anychart.elements.Label');
goog.require('anychart.elements.Background');
goog.require('anychart.elements.Text');
goog.require('anychart.math.Coordinate');
goog.require('anychart.utils.Padding');
goog.require('anychart.utils.ZIndexedLayer');



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
 * Getter for label background.
 * @example <t>simple-h100</t>
 * var label = new anychart.elements.Label();
 * label.text('\' Simple text \'')
 *      .background()
 *          .stroke('1 rgb(36,102,177) 0.4')
 *          .corners(2);
 * label.container(stage)
 *      .draw();
 * @return {!anychart.elements.Background} Returns current background.
 *//**
 * Setter for label background.
 * @example <t>simple-h100</t>
 * var myLableBackground = new anychart.elements.Background()
 *         .stroke('1 rgb(36,102,177) 0.4')
 *         .corners(2)
 *         .fill({
 *           keys: [
 *             "rgb(255,255,255) 1",
 *             "rgb(223,223,223) 1",
 *             "rgb(255,255,255) 1"
 *           ],
 *           angle: -90
 *         });
 * new anychart.elements.Label()
 *     .padding(5)
 *     .background( myLableBackground )
 *     .container(stage)
 *     .draw();
 * @param {anychart.elements.Background=} opt_value [null] Value to set.
 * @return {!anychart.elements.Label} Экземпляр класса {@link anychart.elements.Label} для цепочного вызова.
 *//**
 * @ignoreDoc
 * @param {anychart.elements.Background=} opt_value .
 * @return {!(anychart.elements.Label|anychart.elements.Background)} .
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
 * @param {anychart.math.Coordinate=} opt_value .
 * @return {!anychart.elements.Label|anychart.math.Coordinate} .
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
 * Render label content.
 * @return {!anychart.elements.Label} Экземпляр класса {@link anychart.elements.Label} для цепочного вызова.
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




