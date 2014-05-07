goog.provide('anychart.elements.Multimarker');
goog.provide('anychart.elements.Multimarker.BrowserEvent');
goog.require('anychart.VisualBase');
goog.require('anychart.color');
goog.require('anychart.elements.Marker.Type');
goog.require('anychart.utils');
goog.require('goog.events.BrowserEvent');



/**
 * Класс, описывающий элемент - множественные маркеры.<br/>
 * Множественные маркеры - это набор маркеров, которым можно задать обзие настройки, такие как тип (предопределенный или
 * свой), размер и заливку, а также можно спозиционировать широким набором инструментов:
 * <ul>
 *   <li>{@link anychart.elements.Multimarker#anchor}</li>
 *   <li>{@link anychart.elements.Multimarker#position}</li>
 *   <li>{@link anychart.elements.Multimarker#offsetX} и {@link anychart.elements.Multimarker#offsetY}</li>
 *   <li>{@link anychart.elements.Multimarker#parentBounds}</li>
 * </ul>
 * Кроме того, можно получить доступ к отдельному маркеру в текущем множестве и изменить его индивидуальные настройки.
 * @example <t>simple-h100</t>
 * var MMarker = new anychart.elements.Multimarker()
 *     .type('star5')
 *     .size(27)
 *     .fill('blue')
 *     .anchor('leftTop')
 *     .stroke('1px #000')
 *     .container(stage);
 *  MMarker.draw({x: 100, y: 30});
 *  MMarker.draw({x: 200, y: 50});
 * @constructor
 * @extends {anychart.VisualBase}
 */
anychart.elements.Multimarker = function() {
  goog.base(this);
  /**
   * Marker position formatter function.
   * @type {Function}
   * @private
   */
  this.positionFormatter_ = null;

  /**
   * Current marker drawing index.
   * @type {number}
   * @private
   */
  this.index_ = NaN;

  /**
   * Settings for custom markers
   * @type {Object.<number, Object>}
   * @private
   */
  this.customMarkerSettings_;

  /**
   * Elements pool.
   * @type {Object.<number, acgraph.vector.Path>}
   * @private
   */
  this.elementsPoll_;

  /**
   * Elements render state
   * @type {Object.<number, boolean>}
   * @private
   */
  this.elementsRenderState_;

  /**
   * Appearance states for markers.
   * @type {Object.<number, boolean>}
   * @private
   */
  this.appearanceStates_;

  /**
   * Position states for markers.
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
   * Common position state.
   * @type {boolean}
   * @private
   */
  this.commonPositionState_ = true;

  /**
   * Cache markers bounds.
   * @type {Object.<number, anychart.math.Rect>}
   * @private
   */
  this.measureCache_;

  /**
   * Element for measurement.
   * @type {acgraph.vector.Path}
   * @private
   */
  this.measureMarkerElement_;

  /**
   * Markers layer.
   * @type {acgraph.vector.Layer}
   * @private
   */
  this.layer_ = null;

  /**
   * Type of marker.
   * @type {(string|anychart.elements.Marker.Type|function(acgraph.vector.Path, number, number, number):acgraph.vector.Path)}
   * @private
   */
  this.type_;

  /**
   * Marker size.
   * @type {number}
   * @private
   */
  this.size_;

  /**
   * Marker fill settings.
   * @type {string|acgraph.vector.Fill}
   * @private
   */
  this.fill_;

  /**
   * Marker stroke settings.
   * @type {string|acgraph.vector.Stroke}
   * @private
   */
  this.stroke_;

  /**
   * Marker anchor settings.
   * @type {anychart.utils.NinePositions|string}
   * @private
   */
  this.anchor_;

  /**
   * Marker position settings.
   * @type {anychart.utils.NinePositions|string}
   * @private
   */
  this.position_;

  /**
   * Offset by X coordinate from Marker position.
   * @type {number|string}
   * @private
   */
  this.offsetX_;

  /**
   * Offset by Y coordinate from Marker position.
   * @type {number|string}
   * @private
   */
  this.offsetY_;

  /**
   * Parent bounds stored.
   * @type {anychart.math.Rect}
   * @private
   */
  this.parentBounds_;

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

  this.restoreDefaults();
  this.invalidate(anychart.ConsistencyState.ALL);
};
goog.inherits(anychart.elements.Multimarker, anychart.VisualBase);


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.elements.Multimarker.prototype.SUPPORTED_SIGNALS = anychart.VisualBase.prototype.SUPPORTED_SIGNALS;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.elements.Multimarker.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.VisualBase.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.APPEARANCE |
    anychart.ConsistencyState.HANDLERS;


/**
 * Enumeration to handle composite event handlers attachment on DOM create.
 * @const {Object.<number>}
 * @private
 */
anychart.elements.Multimarker.HANDLED_EVENT_TYPES_ = {
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
anychart.elements.Multimarker.HANDLED_EVENT_TYPES_CAPTURE_SHIFT_ = 12;


//----------------------------------------------------------------------------------------------------------------------
//
//  Position.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter for current position formatter function of all markers.
 * @return {Function} Marker position formatter function.
 *//**
 * Setter for position formatter function of all markers.<br/>
 * <b>Note:</b> в positionProvider может быть передана любая информация, через метод
 * {@link anychart.elements.Multimarker#draw}, что расширяет возможности по позиционированию
 * @param {function(*,number):anychart.math.CoordinateObject=} opt_value [function(positionProvider, index) {
 *  return {x: 80 * index, y: 0};
 * }] Функция определяющая позиционирование маркеров в зависимости от индекса и контекста. Функция должна иметь вид:
 * <code>function(positionProvider, index) {
 *    ... //do somthing
 *    return {x: smth, y: smth};
 * }</code>
 * Параметры данной функции:<br/>
 * <b>positionProvider</b> - объект, содержащий информацию о позиционировании маркера с текщим индеком, который в
 *  обязательном порядке содержит поля <b>x</b> и <b>y</b>, не учитывающие настройки позиционирования offsets.<br/>
 * <b>index</b> - текущий индекс маркера.
 * @example <t>simple</t>
 * var marker = new anychart.elements.Multimarker()
 *     .container(stage)
 *     .size(25)
 *     .positionFormatter(function(positionProvider, index) {
 *       return {x: 60 * (1 + index), y: 100 * Math.random() + 60};
 *     })
 *     .anchor('center');
 * for (var i = 0; i < 5; i++)
 *   marker.draw();
 * @return {anychart.elements.Multimarker} Экземпляр класса {@link anychart.elements.Multimarker} для цепочного вызова.
 *//**
 * @ignoreDoc
 * @param {Function=} opt_value .
 * @return {Function|anychart.elements.Multimarker} .
*/
anychart.elements.Multimarker.prototype.positionFormatter = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.positionFormatter_ = opt_value;
    this.measureCache_ = null;
    this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    return this;
  } else {
    return this.positionFormatter_;
  }
};


/**
 * Getter for markers's position settings by index.
 * @param {number} index Index of marker.
 * @return {string} Current markers's position settings.
 *//**
 * Setter for markers's position settings by index.<br/>
 * See example at {@link anychart.elements.Multimarker#position}.<br/>
 * <b>Note:</b> Принцип работы position описан в статье
 * {@link http://docs.anychart.com/v1.0/reference-articles/elements-positioning#m-position}
 * @param {number} index Index of marker.
 * @param {string=} opt_value Value to set.
 * @return {anychart.elements.Multimarker} Экземпляр класса {@link anychart.elements.Multimarker} для цепочного вызова.
 *//**
 * @ignoreDoc
 * @param {number} index
* @param {(anychart.utils.NinePositions|string)=} opt_value Markers position settings.
* @return {anychart.elements.Multimarker|anychart.utils.NinePositions|string} .
*/
anychart.elements.Multimarker.prototype.positionAt = function(index, opt_value) {
  if (!this.customMarkerSettings_[index]) this.customMarkerSettings_[index] = {};
  if (goog.isDef(opt_value)) {
    opt_value = anychart.utils.normalizePosition(opt_value);
    if (this.customMarkerSettings_[index].position != opt_value) {
      this.customMarkerSettings_[index].position = opt_value;
      this.positionStates_[index] = true;
      if (this.measureCache_) this.measureCache_[index] = null;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.customMarkerSettings_[index].position || this.position_;
  }
};


/**
 * Getter for current position settings of all markers.
 * @return {string} Markres position settings.
 *//**
 * Setter for position settings of all markers.<br/>
 * <b>Note:</b> Принцип работы position описан в статье
 * {@link http://docs.anychart.com/v1.0/reference-articles/elements-positioning#m-position}.
 * @example <t>simple</t>
 * // create objects for multimarkers
 * var bars = [];
 * bars.push(
 *     stage.rect(10, 30, 75, 125).stroke('1 #aaa').fill('#eee'),
 *     stage.rect(110, 10, 75, 125).stroke('1 #aaa').fill('#eee'),
 *     stage.rect(210, 50, 75, 125).stroke('1 #aaa').fill('#eee'),
 *     stage.rect(310, 30, 75, 125).stroke('1 #aaa').fill('#eee')
 * );
 * // sets global settings
 * var MMarker = new anychart.elements.Multimarker()
 *     .type('star4')
 *     .position('center')
 *     .container(stage);
 * // sets custom positions
 * MMarker
 *     .positionAt(0, 'leftTop')
 *     .positionAt(3, 'rightbottom');
 * // connecting markers and objects
 * for (i in bars) {
 *   var barBounds = bars[i].getBounds();
 *   var positionProvider = {
 *     x: barBounds.left,
 *     y: barBounds.top
 *   };
 *   // calculate position
 *   switch (MMarker.positionAt(i) || MMarker.position()) {
 *     case 'center':
 *       positionProvider.x += barBounds.width / 2;
 *       positionProvider.y += barBounds.height / 2;
 *       break;
 *     case 'rightbottom':
 *       positionProvider.x += barBounds.width;
 *       positionProvider.y += barBounds.height;
 *       break;
 *   }
 *   MMarker.draw(positionProvider);
 * }
 * @param {string=} opt_value [{@link anychart.utils.NinePositions}.CENTER] Value to set.
 * @return {anychart.elements.Multimarker} Экземпляр класса {@link anychart.elements.Multimarker} для цепочного вызова.
 *//**
 * @ignoreDoc
 * @param {(anychart.utils.NinePositions|string)=} opt_value Markers position settings.
 * @return {anychart.elements.Multimarker|anychart.utils.NinePositions|string} Markres position settings or itself for chaining call.
 */
anychart.elements.Multimarker.prototype.position = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.utils.normalizePosition(opt_value);
    if (this.position_ != opt_value) {
      this.position_ = opt_value;
      this.measureCache_ = null;
      this.commonPositionState_ = true;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.position_;
  }
};


/**
 * Getter for markers's anchor settings by index.
 * @param {number} index Index of marker.
 * @return {(anychart.utils.NinePositions|string)} Current markers's anchor settings.
 *//**
 * Setter for markers's anchor settings by index.<br/>
 * See example at {@link anychart.elements.Multimarker#anchor}.<br/>
 * <b>Note:</b> Принцип работы position описан в статье
 * {@link http://docs.anychart.com/v1.0/reference-articles/elements-positioning#m-anchor}
 * @param {number} index Index of marker.
 * @param {(anychart.utils.NinePositions|string)=} opt_value Value to set.
 * @return {anychart.elements.Multimarker} Экземпляр класса {@link anychart.elements.Multimarker} для цепочного вызова.
 *//**
 * @ignoreDoc
 * @param {number} index
 * @param {anychart.utils.NinePositions=} opt_value .
 * @return {!(anychart.utils.NinePositions|anychart.elements.Multimarker)} .
 */
anychart.elements.Multimarker.prototype.anchorAt = function(index, opt_value) {
  if (!this.customMarkerSettings_[index]) this.customMarkerSettings_[index] = {};
  if (goog.isDef(opt_value)) {
    opt_value = anychart.utils.normalizeNinePositions(opt_value);
    if (this.customMarkerSettings_[index].anchor != opt_value) {
      this.customMarkerSettings_[index].anchor = opt_value;
      this.positionStates_[index] = true;
      if (this.measureCache_) this.measureCache_[index] = null;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.customMarkerSettings_[index].anchor || this.anchor_;
  }
};


/**
 * Getter for anchor settings of all markers.
 * @return {anychart.utils.NinePositions} Current marker anchor settings.
 *//**
 * Setter for anchor settings of all markers.<br/>
 * <b>Note:</b> Принцип работы position описан в статье
 * {@link http://docs.anychart.com/v1.0/reference-articles/elements-positioning#m-anchor}
 * @example <t>simple-h100</t>
 * // create objects for multimarkers
 * var bars = [];
 * bars.push(
 *     stage.rect(10, 30, 75, 125).stroke('1 #aaa').fill('#eee'),
 *     stage.rect(110, 30, 75, 125).stroke('1 #aaa').fill('#eee'),
 *     stage.rect(210, 30, 75, 125).stroke('1 #aaa').fill('#eee'),
 *     stage.rect(310, 30, 75, 125).stroke('1 #aaa').fill('#eee')
 * );
 * // sets global settings
 * var MMarker = new anychart.elements.Multimarker()
 *     .type('star4')
 *     .fill('blue')
 *     .anchor(anychart.utils.NinePositions.RIGHT_BOTTOM)
 *     .container(stage);
 * // sets custom anchor
 * MMarker
 *     .anchorAt(0, anychart.utils.NinePositions.LEFT_TOP)
 *     .anchorAt(3, anychart.utils.NinePositions.RIGHT_TOP);
 * // connecting markers and objects
 * for (i in bars) {
 *   var barBounds = bars[i].getBounds();
 *   var positionProvider = {
 *     x: barBounds.left,
 *     y: barBounds.top
 *   };
 *   // обозначим красным точку поционирования лейбла.
 *   stage.circle(positionProvider.x, positionProvider.y, 2).stroke('3 red');
 *   MMarker.draw(positionProvider);
 * }
 * @param {(anychart.utils.NinePositions|string)=} opt_value [{@link anychart.utils.NinePositions}.CENTER] Value to set.
 * @return {!anychart.elements.Multimarker} Экземпляр класса {@link anychart.elements.Multimarker} для цепочного вызова.
 *//**
 * @ignoreDoc
 * @param {(anychart.utils.NinePositions|string)=} opt_value .
 * @return {!(anychart.elements.Multimarker|anychart.utils.NinePositions|string)} .
 */
anychart.elements.Multimarker.prototype.anchor = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.utils.normalizePosition(opt_value);
    if (this.anchor_ != opt_value) {
      this.anchor_ = opt_value;
      this.measureCache_ = null;
      this.commonPositionState_ = true;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.anchor_;
  }
};


/**
 * Getter for markers's type settings by index.
 * @param {number} index Index of marker.
 * @return {anychart.elements.Marker.Type|function(acgraph.vector.Path, number, number, number):acgraph.vector.Path}
 *  Markers type settings.
 *//**
 * Setter for markers's type settings by index.<br/>
 * See example at {@link anychart.elements.Multimarker#type}.
 * @param {number} index Index of marker.
 * @param {(anychart.elements.Marker.Type|
 *  function(acgraph.vector.Path, number, number, number):acgraph.vector.Path)=} opt_value
 *  [{@link anychart.elements.Marker.Type}.DIAGONAL_CROSS] Type or custom drawer. Функция, задающее произвольно
 *  нарисованный маркер, в общем виде выглядит как: <code>function(path, x, y, size){
 *    // path - это acgraph.vector.Path
 *    // x, y - текущее позиционирование маркера
 *    // size - размер маркера
 *    ... //do smth
 *    return path;
 *  }</code>.
 * @return {!anychart.elements.Multimarker} Экземпляр класса {@link anychart.elements.Multimarker} для цепочного вызова.
 *//**
 * @ignoreDoc
 * @param {number} index
 * @ignoreDoc
 * @param {(anychart.elements.Marker.Type|
 *          function(acgraph.vector.Path, number, number, number):acgraph.vector.Path)=} opt_value .
 * @return {!anychart.elements.Multimarker|anychart.elements.Marker.Type|
 *          function(acgraph.vector.Path, number, number, number):acgraph.vector.Path} .
 */
anychart.elements.Multimarker.prototype.typeAt = function(index, opt_value) {
  if (!this.customMarkerSettings_[index]) this.customMarkerSettings_[index] = {};
  if (goog.isDef(opt_value)) {
    if (this.customMarkerSettings_[index].type != opt_value) {
      this.customMarkerSettings_[index].type = opt_value;
      this.positionStates_[index] = true;
      if (this.measureCache_) this.measureCache_[index] = null;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.customMarkerSettings_[index].type || this.type_;
  }
};


/**
 * Getter for current type settings of all markers.
 * @return {anychart.elements.Marker.Type|function(acgraph.vector.Path, number, number, number):acgraph.vector.Path}
 *  Markers type settings.
 *//**
 * Setter for type settings of all markers.
 * @example <t>simple-h100</t>
 * // create objects for multimarkers
 * var bars = [];
 * bars.push(
 *     stage.rect(10, 30, 75, 125).stroke('1 #aaa').fill('#eee'),
 *     stage.rect(110, 30, 75, 125).stroke('1 #aaa').fill('#eee'),
 *     stage.rect(210, 30, 75, 125).stroke('1 #aaa').fill('#eee'),
 *     stage.rect(310, 30, 75, 125).stroke('1 #aaa').fill('#eee')
 * );
 * // sets global settings
 * var MMarker = new anychart.elements.Multimarker()
 *     .type('star4')
 *     .container(stage);
 * // sets custom positions
 * MMarker
 *     .typeAt(0, anychart.elements.Marker.Type.CIRCLE)
 *     .typeAt(3, function(path, x, y, size) {
 *       var point1 = {x: x + 1.7 * size, y: y + 0.6 * size};
 *       var point2 = {x: x, y: y + size / 2};
 *       path.moveTo(point1.x, point1.y)
 *           .arcToByEndPoint(point2.x, point2.y, size, size, true, true)
 *           .arcToByEndPoint(point1.x, point1.y, size / 3, size / 3, false, false)
 *           .moveTo(point1.x, point1.y)
 *           .close();
 *       path.rotate(16);
 *       path.setPosition(x, y).translate(-size, -size);
 *       return path;
 *     });
 * // connecting markers and objects
 * for (i in bars) {
 *   var barBounds = bars[i].getBounds();
 *   var positionProvider = {
 *     x: barBounds.left,
 *     y: barBounds.top
 *   };
 *   MMarker.draw(positionProvider);
 * }
 * @param {(anychart.elements.Marker.Type|
 *  function(acgraph.vector.Path, number, number, number):acgraph.vector.Path)=} opt_value
 *  [{@link anychart.elements.Marker.Type}.DIAGONAL_CROSS] Type or custom drawer. Функция, задающее произвольно
 *  нарисованный маркер, в общем виде выглядит как: <code>function(path, x, y, size){
 *    // path - это acgraph.vector.Path
 *    // x, y - текущее позиционирование маркера
 *    // size - размер маркера
 *    ... //do smth
 *    return path;
 *  }</code>.
 * @return {!anychart.elements.Multimarker} Экземпляр класса {@link anychart.elements.Multimarker} для цепочного вызова.
 *//**
 * @ignoreDoc
 * @param {(anychart.elements.Marker.Type|function(acgraph.vector.Path, number, number, number):acgraph.vector.Path)=} opt_value .
 * @return {!anychart.elements.Multimarker|anychart.elements.Marker.Type|function(acgraph.vector.Path, number, number, number):acgraph.vector.Path|string} .
 */
anychart.elements.Multimarker.prototype.type = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.type_ != opt_value) {
      this.type_ = opt_value;
      this.measureCache_ = null;
      this.commonPositionState_ = true;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.type_;
  }
};


/**
 * Getter for markers's size settings by index.
 * @param {number} index Index of marker.
 * @return {number} Current markers's size settings.
 *//**
 * Setter for markers's size settings by index.<br/>
 * See example at {@link anychart.elements.Multimarker#size}.
 * @param {number} index Index of marker.
 * @param {number=} opt_value Value to set.
 * @return {anychart.elements.Multimarker} Экземпляр класса {@link anychart.elements.Multimarker} для цепочного вызова.
 *//**
 * @ignoreDoc
 * @param {number} index
 * @param {number=} opt_value .
 * @return {anychart.elements.Multimarker|number} .
 */
anychart.elements.Multimarker.prototype.sizeAt = function(index, opt_value) {
  if (!this.customMarkerSettings_[index]) this.customMarkerSettings_[index] = {};
  if (goog.isDef(opt_value)) {
    if (this.customMarkerSettings_[index].size != opt_value) {
      this.customMarkerSettings_[index].size = opt_value;
      this.positionStates_[index] = true;
      if (this.measureCache_) this.measureCache_[index] = null;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.customMarkerSettings_[index].size || this.size_;
  }
};


/**
 * Getter for current size settings of all markers.
 * @return {number} Markres size settings.
 *//**
 * Setter for size settings of all markers.
 * @example <t>simple</t>
 * // create objects for multimarkers
 * var bars = [];
 * bars.push(
 *     stage.rect(10, 30, 75, 125).stroke('1 #aaa').fill('#eee'),
 *     stage.rect(110, 30, 75, 125).stroke('1 #aaa').fill('#eee'),
 *     stage.rect(210, 30, 75, 125).stroke('1 #aaa').fill('#eee'),
 *     stage.rect(310, 30, 75, 125).stroke('1 #aaa').fill('#eee')
 * );
 * // sets global settings
 * var MMarker = new anychart.elements.Multimarker()
 *     .size(15)
 *     .container(stage);
 * // sets custom positions
 * MMarker
 *     .sizeAt(0, 5)
 *     .sizeAt(3, 10);
 * // connecting markers and objects
 * for (i in bars) {
 *   var barBounds = bars[i].getBounds();
 *   var positionProvider = {
 *     x: barBounds.left,
 *     y: barBounds.top
 *   };
 *   MMarker.draw(positionProvider);
 * }
 * @param {number=} opt_value [10] Value to set.
 * @return {anychart.elements.Multimarker} Экземпляр класса {@link anychart.elements.Multimarker} для цепочного вызова.
 *//**
 * @ignoreDoc
 * @param {number=} opt_value .
 * @return {anychart.elements.Multimarker|number} .
 */
anychart.elements.Multimarker.prototype.size = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.size_ != opt_value) {
      this.size_ = opt_value;
      this.measureCache_ = null;
      this.commonPositionState_ = true;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.size_;
  }
};


/**
 * Getter for current offsetX settings by index.
 * @param {number} index Index of marker.
 * @return {number|string} Markres offsetXAt settings.
 *//**
 * Setter for offsetX settings by index.<br/>
 * <b>Note:</b> Принцип работы offsetXAt описан в статье
 * {@link http://docs.anychart.com/v1.0/reference-articles/elements-positioning#m-offsets}.<br/>
 * See example at {@link anychart.elements.Multimarker#offsetX}.
 * @param {number} index Index of marker.
 * @param {(number|string)=} opt_value Value to set.
 * @return {!anychart.elements.Multimarker} Экземпляр класса {@link anychart.elements.Multimarker} для цепочного вызова.
 *//**
 * @ignoreDoc
 * @param {number} index
 * @param {(number|string)=} opt_value .
 * @return {number|string|anychart.elements.Multimarker} .
 */
anychart.elements.Multimarker.prototype.offsetXAt = function(index, opt_value) {
  if (!this.customMarkerSettings_[index]) this.customMarkerSettings_[index] = {};
  if (goog.isDef(opt_value)) {
    if (this.customMarkerSettings_[index].offsetX != opt_value) {
      this.customMarkerSettings_[index].offsetX = opt_value;
      this.positionStates_[index] = true;
      if (this.measureCache_) this.measureCache_[index] = null;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.customMarkerSettings_[index].offsetX || this.offsetX_;
  }
};


/**
 * Getter for current offsetX settings of all markers.
 * @return {number|string} Markres offsetX settings.
 *//**
 * Setter for offsetX settings of all markers.<br/>
 * <b>Note:</b> Принцип работы offsetX описан в статье
 * {@link http://docs.anychart.com/v1.0/reference-articles/elements-positioning#m-offsets}
 * @example <t>simple-h100</t>
 * // create objects for multimarkers
 * var bars = [];
 * bars.push(
 *     stage.rect(10, 30, 75, 125).stroke('1 #aaa').fill('#eee'),
 *     stage.rect(110, 30, 75, 125).stroke('1 #aaa').fill('#eee'),
 *     stage.rect(210, 30, 75, 125).stroke('1 #aaa').fill('#eee'),
 *     stage.rect(310, 30, 75, 125).stroke('1 #aaa').fill('#eee')
 * );
 * // sets global settings
 * var MMarker = new anychart.elements.Multimarker()
 *     .type('star4')
 *     .fill('blue')
 *     .offsetX(15)
 *     .container(stage);
 * // sets custom anchor
 * MMarker
 *     .offsetXAt(0, -5);
 * // connecting markers and objects
 * for (i in bars) {
 *   var barBounds = bars[i].getBounds();
 *   var positionProvider = {
 *     x: barBounds.left+barBounds.width/2,
 *     y: barBounds.top
 *   };
 *   // обозначим красным точку поционирования маркера.
 *   stage.circle(positionProvider.x, positionProvider.y, 2).stroke('3 red');
 *   MMarker.draw(positionProvider);
 * }
 * @param {(number|string)=} opt_value [0] Value to set.
 * @return {!anychart.elements.Multimarker} Экземпляр класса {@link anychart.elements.Multimarker} для цепочного вызова.
 *//**
 * @ignoreDoc
 * @param {(number|string)=} opt_value .
 * @return {number|string|anychart.elements.Multimarker} .
 */
anychart.elements.Multimarker.prototype.offsetX = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.offsetX_ != opt_value) {
      this.offsetX_ = opt_value;
      this.measureCache_ = null;
      this.commonPositionState_ = true;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.offsetX_;
  }
};


/**
 * Getter for current offsetY settings by index.
 * @param {number} index Index of marker.
 * @return {number|string} Markres offsetYAt settings.
 *//**
 * Setter for offsetY settings by index.<br/>
 * <b>Note:</b> Принцип работы offsetYAt описан в статье
 * {@link http://docs.anychart.com/v1.0/reference-articles/elements-positioning#m-offsets}.<br/>
 * See example at {@link anychart.elements.Multimarker#offsetY}.
 * @param {number} index Index of marker.
 * @param {(number|string)=} opt_value Value to set.
 * @return {!anychart.elements.Multimarker} Экземпляр класса {@link anychart.elements.Multimarker} для цепочного вызова.
 *//**
 * @ignoreDoc
 * @param {number} index
 * @param {(number|string)=} opt_value .
 * @return {number|string|anychart.elements.Multimarker} .
 */
anychart.elements.Multimarker.prototype.offsetYAt = function(index, opt_value) {
  if (!this.customMarkerSettings_[index]) this.customMarkerSettings_[index] = {};
  if (goog.isDef(opt_value)) {
    if (this.customMarkerSettings_[index].offsetY != opt_value) {
      this.customMarkerSettings_[index].offsetY = opt_value;
      this.positionStates_[index] = true;
      if (this.measureCache_) this.measureCache_[index] = null;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.customMarkerSettings_[index].offsetY || this.offsetY_;
  }
};


/**
 * Getter for current offsetY settings of all markers.
 * @return {number|string} Markres offsetY settings.
 *//**
 * Setter for offsetY settings of all markers.<br/>
 * <b>Note:</b> Принцип работы offsetY описан в статье
 * {@link http://docs.anychart.com/v1.0/reference-articles/elements-positioning#m-offsets}
 * @example <t>simple-h100</t>
 * // create objects for multimarkers
 * var bars = [];
 * bars.push(
 *     stage.rect(10, 30, 75, 125).stroke('1 #aaa').fill('#eee'),
 *     stage.rect(110, 30, 75, 125).stroke('1 #aaa').fill('#eee'),
 *     stage.rect(210, 30, 75, 125).stroke('1 #aaa').fill('#eee'),
 *     stage.rect(310, 30, 75, 125).stroke('1 #aaa').fill('#eee')
 * );
 * // sets global settings
 * var MMarker = new anychart.elements.Multimarker()
 *     .type('star4')
 *     .fill('blue')
 *     .offsetY(15)
 *     .container(stage);
 * // sets custom anchor
 * MMarker
 *     .offsetYAt(0, -5);
 * // connecting markers and objects
 * for (i in bars) {
 *   var barBounds = bars[i].getBounds();
 *   var positionProvider = {
 *     x: barBounds.left+barBounds.width/2,
 *     y: barBounds.top
 *   };
 *   // обозначим красным точку поционирования маркера.
 *   stage.circle(positionProvider.x, positionProvider.y, 2).stroke('3 red');
 *   MMarker.draw(positionProvider);
 * }
 * @param {(number|string)=} opt_value [0] Value to set.
 * @return {!anychart.elements.Multimarker} Экземпляр класса {@link anychart.elements.Multimarker} для цепочного вызова.
 *//**
 * @ignoreDoc
 * @param {(number|string)=} opt_value .
 * @return {number|string|anychart.elements.Multimarker} .
 */
anychart.elements.Multimarker.prototype.offsetY = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.offsetY_ != opt_value) {
      this.offsetY_ = opt_value;
      this.measureCache_ = null;
      this.commonPositionState_ = true;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.offsetY_;
  }
};


/**
 * Getter for current fill settings by index.
 * @param {number} index Index of marker.
 * @return {acgraph.vector.Fill|string} Markres fillAt settings.
 *//**
 * Setter for fill settings by index.<br/>
 * <b>Note:</b> Принцип работы fillAt описан в статье
 * {@link http://docs.anychart.com/v1.0/reference-articles/elements-fill}.<br/>
 * See example at {@link anychart.elements.Multimarker#fill}.
 * @param {number} index Index of marker.
 * @param {(acgraph.vector.Fill|string)=} opt_value Value to set.
 * @return {!anychart.elements.Multimarker} Экземпляр класса {@link anychart.elements.Multimarker} для цепочного вызова.
 *//**
 * @ignoreDoc
 * @param {number} index
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|string|anychart.elements.Multimarker} .
 */
anychart.elements.Multimarker.prototype.fillAt = function(index, opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx,
    opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (!this.customMarkerSettings_[index]) this.customMarkerSettings_[index] = {};
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var color = anychart.color.normalizeFill.apply(arguments, goog.array.slice(arguments, 1));
    if (this.customMarkerSettings_[index].fill != color) {
      this.customMarkerSettings_[index].fill = color;
      this.appearanceStates_[index] = true;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.customMarkerSettings_[index].fill || this.fill_;
  }
};


/**
 * Getter for current fill settings of all markers.
 * @return {acgraph.vector.Fill|string} Markres fill settings.
 *//**
 * Setter for fill settings of all markers.<br/>
 * <b>Note:</b> Принцип работы fill описан в статье
 * {@link http://docs.anychart.com/v1.0/reference-articles/elements-fill}
 * @example <t>simple-h100</t>
 * // create objects for multimarkers
 * var bars = [];
 * bars.push(
 *     stage.rect(10, 30, 75, 125).stroke('1 #aaa').fill('#eee'),
 *     stage.rect(110, 30, 75, 125).stroke('1 #aaa').fill('#eee'),
 *     stage.rect(210, 30, 75, 125).stroke('1 #aaa').fill('#eee'),
 *     stage.rect(310, 30, 75, 125).stroke('1 #aaa').fill('#eee')
 * );
 * // sets global settings
 * var MMarker = new anychart.elements.Multimarker()
 *     .type('star4')
 *     .fill('green')
 *     .size('14')
 *     .container(stage);
 * // sets custom anchor
 * MMarker
 *     .fillAt(0, ['red', 'orange']);
 * // connecting markers and objects
 * for (i in bars) {
 *   var barBounds = bars[i].getBounds();
 *   var positionProvider = {
 *     x: barBounds.left+barBounds.width/2,
 *     y: barBounds.top
 *   };
 *   MMarker.draw(positionProvider);
 * }
 * @param {(acgraph.vector.Fill|string)=} opt_value ['black'] Value to set.
 * @return {!anychart.elements.Multimarker} Экземпляр класса {@link anychart.elements.Multimarker} для цепочного вызова.
 *//**
 * @ignoreDoc
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|string|anychart.elements.Multimarker} .
 */
anychart.elements.Multimarker.prototype.fill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy,
    opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var color = anychart.color.normalizeFill.apply(null, arguments);
    if (this.fill_ != color) {
      this.fill_ = color;
      this.commonAppearanceState_ = true;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.fill_;
  }
};


/**
 * Getter for current stroke settings by index.
 * @param {number} index Index of marker.
 * @return {acgraph.vector.Stroke|string} Markres strokeAt settings.
 *//**
 * Setter for stroke settings by index.<br/>
 * <b>Note:</b> Принцип работы strokeAt описан в статье
 * {@link http://docs.anychart.com/v1.0/reference-articles/elements-fill}.<br/>
 * See example at {@link anychart.elements.Multimarker#fill}.
 * @param {number} index Index of marker.
 * @param {(acgraph.vector.Stroke|string)=} opt_value Value to set.
 * @return {!anychart.elements.Multimarker} Экземпляр класса {@link anychart.elements.Multimarker} для цепочного вызова.
 *//**
 * @ignoreDoc
 * @param {number} index
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)=} opt_strokeOrFill Настройки заливки границ примитива,
 *    если используется как сеттер.
 * @param {number=} opt_thickness Толщина линии. Если не передано, будет установлено в 1.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 *    Dash array contains a list of comma and/or white space separated lengths and percentages that specify the
 *    lengths of alternating dashes and gaps. If an odd number of values is provided, then the list of values is
 *    repeated to yield an even number of values. Thus, stroke dashpattern: 5,3,2 is equivalent to dashpattern: 5,3,2,5,3,2.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Стиль (форма) соединения меду двумя линиями.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Style of line cap.
 * @return {acgraph.vector.Stroke|string|anychart.elements.Multimarker} .
 */
anychart.elements.Multimarker.prototype.strokeAt = function(index, opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (!this.customMarkerSettings_[index]) this.customMarkerSettings_[index] = {};
  if (goog.isDef(opt_strokeOrFill)) {
    var color = anychart.color.normalizeStroke.apply(null, goog.array.slice(arguments, 1));
    if (this.customMarkerSettings_[index].stroke != color) {
      this.customMarkerSettings_[index].stroke = color;
      this.appearanceStates_[index] = true;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.customMarkerSettings_[index].stroke || this.stroke_;
  }
};


/**
 * Getter for current stroke settings of all markers.
 * @return {acgraph.vector.Stroke|string} Markres fill settings.
 *//**
 * Setter for stroke settings of all markers.<br/>
 * <b>Note:</b> Принцип работы stroke описан в статье
 * {@link http://docs.anychart.com/v1.0/reference-articles/elements-fill}
 * @example <t>simple-h100</t>
 * // create objects for multimarkers
 * var bars = [];
 * bars.push(
 *     stage.rect(10, 30, 75, 125).stroke('1 #aaa').fill('#eee'),
 *     stage.rect(110, 30, 75, 125).stroke('1 #aaa').fill('#eee'),
 *     stage.rect(210, 30, 75, 125).stroke('1 #aaa').fill('#eee'),
 *     stage.rect(310, 30, 75, 125).stroke('1 #aaa').fill('#eee')
 * );
 * // sets global settings
 * var MMarker = new anychart.elements.Multimarker()
 *     .type('star4')
 *     .fill('none')
 *     .stroke('4px green .5')
 *     .size('14')
 *     .container(stage);
 * // sets custom anchor
 * MMarker
 *     .strokeAt(0, ['red', 'orange']);
 * // connecting markers and objects
 * for (i in bars) {
 *   var barBounds = bars[i].getBounds();
 *   var positionProvider = {
 *     x: barBounds.left+barBounds.width/2,
 *     y: barBounds.top
 *   };
 *   MMarker.draw(positionProvider);
 * }
 * @param {(acgraph.vector.Stroke|string)=} opt_value ['black'] Value to set.
 * @return {!anychart.elements.Multimarker} Экземпляр класса {@link anychart.elements.Multimarker} для цепочного вызова.
 *//**
 * @ignoreDoc
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)=} opt_strokeOrFill Настройки заливки границ примитива,
 *    если используется как сеттер.
 * @param {number=} opt_thickness Толщина линии. Если не передано, будет установлено в 1.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 *    Dash array contains a list of comma and/or white space separated lengths and percentages that specify the
 *    lengths of alternating dashes and gaps. If an odd number of values is provided, then the list of values is
 *    repeated to yield an even number of values. Thus, stroke dashpattern: 5,3,2 is equivalent to dashpattern: 5,3,2,5,3,2.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Стиль (форма) соединения меду двумя линиями.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Style of line cap.
 * @return {acgraph.vector.Stroke|string|anychart.elements.Multimarker} .
 */
anychart.elements.Multimarker.prototype.stroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var color = anychart.color.normalizeStroke.apply(null, arguments);
    if (this.stroke_ != color) {
      this.stroke_ = color;
      this.commonAppearanceState_ = true;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.stroke_;
  }
};


/**
 * Getter for current enabled state by index.
 * @param {number} index Index of marker.
 * @return {boolean} Marker enabled state.
 *//**
 * Setter for enabled state by index.<br/>
 * @param {number} index Index of marker.
 * @param {boolean=} opt_value Value to set.
 * @return {!anychart.elements.Multimarker} Экземпляр класса {@link anychart.elements.Multimarker} для цепочного вызова.
 *//**
 * @ignoreDoc
 * @param {number} index
 * @param {boolean=} opt_value .
 * @return {boolean|anychart.elements.Multimarker} .
 */
anychart.elements.Multimarker.prototype.enabledAt = function(index, opt_value) {
  if (!this.customMarkerSettings_[index]) this.customMarkerSettings_[index] = {};
  if (goog.isDef(opt_value)) {
    if (this.customMarkerSettings_[index].enabled != opt_value) {
      this.customMarkerSettings_[index].enabled = opt_value;
      this.invalidate(anychart.ConsistencyState.ENABLED, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.customMarkerSettings_[index] && goog.isDef(this.customMarkerSettings_[index].enabled) ?
        this.customMarkerSettings_[index].enabled :
        this.enabled();
  }
};


/**
 * Multimarker serialization.
 * @param {boolean=} opt_withoutCustomSettings Serialize without custom point settings.
 * @return {Object} Serialized data.
 */
anychart.elements.Multimarker.prototype.serialize = function(opt_withoutCustomSettings) {
  var data = goog.base(this, 'serialize');

  data['position'] = this.position();
  data['anchor'] = this.anchor();
  data['type'] = this.type();
  data['size'] = this.size();
  data['offsetX'] = this.offsetX();
  data['offsetY'] = this.offsetY();
  data['fill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill} */(this.fill()));
  data['stroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke} */(this.stroke()));
  if (!opt_withoutCustomSettings)
    data['customMarkerSettings'] = this.customMarkerSettings_;

  return data;
};


/**
 * Multimarker point serialization.
 * @param {number} index Marker index.
 * @param {boolean=} opt_includeCustomOnly If the method should only serialize settings that are custom for the point.
 * @return {Object} Serialized data.
 */
anychart.elements.Multimarker.prototype.serializeAt = function(index, opt_includeCustomOnly) {
  //Вот так это должно быть:
  //var data = goog.base(this, 'serialize');
  //но пока что у base нету сериализации, поэтому делаю так:
  var data = {};
  if (this.customMarkerSettings_[index]) {
    var point = this.customMarkerSettings_[index];
    if (opt_includeCustomOnly) {
      if (goog.isDef(point.position))
        data['position'] = point.position;
      if (goog.isDef(point.anchor))
        data['anchor'] = point.anchor;
      if (goog.isDef(point.type))
        data['type'] = point.type;
      if (goog.isDef(point.size))
        data['size'] = point.size;
      if (goog.isDef(point.offsetX))
        data['offsetX'] = point.offsetX;
      if (goog.isDef(point.offsetY))
        data['offsetY'] = point.offsetY;
      if (goog.isDef(point.fill))
        data['fill'] = point.fill;
      if (goog.isDef(point.stroke))
        data['stroke'] = point.stroke;
      if (goog.isDef(point.enabled))
        data['enabled'] = point.enabled;
    } else {
      data['position'] = goog.isDef(point.position) ? point.position : this.position_;
      data['anchor'] = goog.isDef(point.anchor) ? point.anchor : this.anchor_;
      data['type'] = goog.isDef(point.type) ? point.type : this.type_;
      data['size'] = goog.isDef(point.size) ? point.size : this.size_;
      data['offsetX'] = goog.isDef(point.offsetX) ? point.offsetX : this.offsetX_;
      data['offsetY'] = goog.isDef(point.offsetY) ? point.offsetY : this.offsetY_;
      data['fill'] = goog.isDef(point.fill) ? anychart.color.serialize(point.fill) : anychart.color.serialize(this.fill_);
      data['stroke'] = goog.isDef(point.stroke) ? anychart.color.serialize(point.stroke) : anychart.color.serialize(this.stroke_);
      data['enabled'] = goog.isDef(point.enabled) ? point.enabled : this.enabled();
    }
  } else if (!opt_includeCustomOnly) {
    data['position'] = this.position_;
    data['anchor'] = this.anchor_;
    data['type'] = this.type_;
    data['size'] = this.size_;
    data['offsetX'] = this.offsetX_;
    data['offsetY'] = this.offsetY_;
    data['fill'] = anychart.color.serialize(this.fill_);
    data['stroke'] = anychart.color.serialize(this.stroke_);
    data['enabled'] = this.enabled();
  }

  return data;
};


/**
 * @inheritDoc
 */
anychart.elements.Multimarker.prototype.deserialize = function(data) {
  this.suspendSignalsDispatching();

  goog.base(this, 'deserialize', data);

  this.position(data['position']);
  this.anchor(data['anchor']);
  this.type(data['type']);
  this.size(data['size']);
  this.offsetX(data['offsetX']);
  this.offsetY(data['offsetY']);
  this.fill(data['fill']);
  this.stroke(data['stroke']);
  this.customMarkerSettings_ = data['customMarkerSettings'] || {};

  this.resumeSignalsDispatching(true);

  return this;
};


/**
 * Serialization marker at index.
 * @param {number} index Marker index.
 * @param {Object} data Data for marker.
 * @return {!anychart.elements.Multimarker}
 */
anychart.elements.Multimarker.prototype.deserializeAt = function(index, data) {
  if (!this.customMarkerSettings_[index]) this.customMarkerSettings_[index] = {};
  if (data['position']) this.customMarkerSettings_[index].position = data['position'];
  if (data['anchor']) this.customMarkerSettings_[index].anchor = data['anchor'];
  if (data['type']) this.customMarkerSettings_[index].type = data['type'];
  if (data['size']) this.customMarkerSettings_[index].size = data['size'];
  if (data['offsetX']) this.customMarkerSettings_[index].offsetX = data['offsetX'];
  if (data['offsetY']) this.customMarkerSettings_[index].offsetY = data['offsetY'];
  if (data['fill']) this.customMarkerSettings_[index].fill = data['fill'];
  if (data['stroke']) this.customMarkerSettings_[index].stroke = data['stroke'];
  if (goog.isDef(data['enabled'])) this.customMarkerSettings_[index].enabled = data['enabled'];

  this.appearanceStates_[index] = true;
  this.positionStates_[index] = true;
  this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
  return this;
};


/**
 * Сбрасывает все настройки, которые были заданый маркерам по их индексам, с помощью таких методов
 * как {@link anychart.elements.Multimarker#fillAt},
 * {@link anychart.elements.Multimarker#strokeAt},
 * {@link anychart.elements.Multimarker#anchorAt} и тд.
 */
anychart.elements.Multimarker.prototype.dropCustomSettings = function() {
  for (var i in this.customMarkerSettings_) {
    var index = parseInt(i, 10);
    this.customMarkerSettings_[index] = null;
    this.appearanceStates_[index] = true;
    this.positionStates_[index] = true;
  }
  this.customMarkerSettings_ = {};
  this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Drop custom settings.
 * @param {number} index Index to drop custom settings for.
 */
anychart.elements.Multimarker.prototype.dropCustomSettingsAt = function(index) {
  if (this.customMarkerSettings_ && index in this.customMarkerSettings_) {
    delete this.customMarkerSettings_[index];
    this.positionStates_[index] = true;
    if (this.measureCache_) this.measureCache_[index] = null;
    this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Удаляет всю последовательность маркеров.
 */
anychart.elements.Multimarker.prototype.clear = function() {
  var i, index;
  for (i in this.elementsPoll_) {
    index = parseInt(i, 0);
    var el = this.elementsPoll_[index];
    if (el) {
      el.dispose();
      this.elementsPoll_[index] = null;
      this.appearanceStates_[index] = false;
      this.positionStates_[index] = false;
    }
    this.elementsRenderState_[index] = false;
  }

};


/**
 * Возвращает баунды отностительно которых идут рассчеты позиционирования элемента.
 * @return {anychart.math.Rect} Current parent bounds.
 *//**
 * Устанавливает баунды отностительно которых идут рассчеты offsets, если они заданы в процентах.
 * @param {anychart.math.Rect=} opt_value [null] Value to set.
 * @return {!anychart.elements.Multimarker} Экземпляр класса {@link anychart.elements.Multimarker} для цепочного вызова.
 *//**
 * @ignoreDoc
 * @param {anychart.math.Rect=} opt_value .
 * @return {!anychart.elements.Multimarker|anychart.math.Rect} .
 */
anychart.elements.Multimarker.prototype.parentBounds = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.parentBounds_ != opt_value) {
      this.parentBounds_ = opt_value;
      this.commonPositionState_ = true;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
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
 * Рассчитывает баунды для текущего маркера, которые можно использовать, например, для проверки overlap.
 * @param {*} positionProvider Объект, содержащий информацию о позиционировании маркера с текщим индеком, который в
 *  обязательном порядке содержит поля <b>x</b> и <b>y</b>, не учитывающие настройки позиционирования offsets. Также
 *  может содержать любую иную информацию, которую Вы сами можете обрабатывать.
 * @param {number=} opt_index Marker index to calculate.
 * @return {anychart.math.Rect} Markers bounds.
 */
anychart.elements.Multimarker.prototype.measure = function(positionProvider, opt_index) {
  //search for cache
  if (goog.isDef(opt_index)) {
    if (!this.measureCache_) this.measureCache_ = {};
    var cachedBounds = this.measureCache_[opt_index];
    if (cachedBounds) return cachedBounds;
  }

  var parentWidth, parentHeight, drawer;

  if (!this.measureMarkerElement_) this.measureMarkerElement_ = acgraph.path();

  //define parent bounds
  if (this.parentBounds_) {
    parentWidth = this.parentBounds_.width;
    parentHeight = this.parentBounds_.height;
  }

  var indexSettings = this.customMarkerSettings_[opt_index || 0];
  var isIndexSettings = goog.isDef(opt_index) && indexSettings;

  var type = isIndexSettings && indexSettings.type ?
      indexSettings.type :
      this.type_;

  var size = isIndexSettings && indexSettings.size ?
      indexSettings.size :
      this.size_;

  var anchor = isIndexSettings && indexSettings.anchor ?
      indexSettings.anchor :
      this.anchor_;

  var offsetX = isIndexSettings && indexSettings.offsetX ?
      indexSettings.offsetX :
      this.offsetX_;

  var offsetY = isIndexSettings && indexSettings.offsetY ?
      indexSettings.offsetY :
      this.offsetY_;

  drawer = goog.isString(type) ?
      anychart.elements.Marker.getMarkerDrawer(/** @type {anychart.elements.Marker.Type}*/(type)) :
      type;
  this.measureMarkerElement_.clear();
  drawer.call(this, this.measureMarkerElement_, 0, 0, size);

  var markerBounds = /** @type {anychart.math.Rect} */(this.measureMarkerElement_.getBounds());
  var position = this.positionFormatter_.call(this, positionProvider, opt_index);
  var anchorCoordinate = anychart.utils.getCoordinateByAnchor(
      new acgraph.math.Rect(0, 0, markerBounds.width, markerBounds.height),
      anchor);

  position.x -= anchorCoordinate.x;
  position.y -= anchorCoordinate.y;

  var offsetXNorm = goog.isDef(this.offsetX_) ? anychart.utils.normalize(offsetX, parentWidth) : 0;
  var offsetYNorm = goog.isDef(this.offsetY_) ? anychart.utils.normalize(offsetY, parentHeight) : 0;

  anychart.utils.applyOffsetByAnchor(position, anchor, offsetXNorm, offsetYNorm);

  markerBounds.left = position.x;
  markerBounds.top = position.y;

  return markerBounds;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Drawing.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Заканчивает последовательность маркеров, сбрасывая все внутренние счетчики.<br/>
 * То есть, последующие вызовы метода {@link anychart.elements.Multimarker#draw} будут перерисовывать текущие
 * маркеры, а не рисовать новые.
 * @example <t>simple-h100</t>
 * // sets global settings
 * var MMarker = new anychart.elements.Multimarker()
 *    .type('star5')
 *    .fill('none')
 *    .stroke('3px black .7')
 *    .size('24')
 *    .container(stage);
 * for (var i=0; i<9; i++) {
 *  // нарисуем 6 звезд, а не 9
 *  if (i==6){
 *     MMarker.end();
 *     // первые звезды перерисуются с новым филом.
 *     MMarker.fill('blue');
 *  }
 *  var positionProvider = {
 *    x: 35 + i*65,
 *    y: 50
 *  };
 *  MMarker.draw(positionProvider);
 * }
 */
anychart.elements.Multimarker.prototype.end = function() {
  var isEmpty = !this.elementsRenderState_ || goog.object.isEmpty(this.elementsRenderState_);
  var i, index;

  if (!isEmpty) {
    for (i in this.elementsRenderState_) {
      index = parseInt(i, 10);
      if (!this.elementsRenderState_[index]) {
        var el = this.elementsPoll_[index];
        if (el) {
          el.dispose();
          this.elementsPoll_[index] = null;
          this.appearanceStates_[index] = false;
          this.positionStates_[index] = false;
        }
      } else if (this.hasInvalidationState(anychart.ConsistencyState.HANDLERS)) {
        for (var type in anychart.elements.Multimarker.HANDLED_EVENT_TYPES_) {
          var element = this.elementsPoll_[index];
          element['__tagIndex'] = index;
          var code = anychart.elements.Multimarker.HANDLED_EVENT_TYPES_[type];
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
  this.commonPositionState_ = false;
  this.commonAppearanceState_ = false;
  this.markConsistent(anychart.ConsistencyState.ALL);
};


/**
 * Рисует новый маркер и добавляет в последовательность с учетом positionProvider.<br/>
 * <b>Note:</b> В случае, если был вызван метод {@link anychart.elements.Multimarker.end}, то перерисовывает
 * очередной в поседовательности маркер.
 * @example <t>simple-h100</t>
 * // sets global settings
 * var MMarker = new anychart.elements.Multimarker()
 *    .type('star5')
 *    .fill('none')
 *    .stroke('3px black .7')
 *    .size('24')
 *    .container(stage);
 * for (var i=0; i<6; i++) {
 *  var positionProvider = {
 *    x: 35 + i*65,
 *    y: 50
 *  };
 *  MMarker.draw(positionProvider);
 * }
 * @param {*} positionProvider Объект, содержащий информацию о позиционировании маркера с текщим индеком, который в
 *  обязательном порядке содержит поля <b>x</b> и <b>y</b>, не учитывающие настройки позиционирования offsets. Также
 *  может содержать любую иную информацию, которую Вы сами можете обрабатывать.
 * @param {number=} opt_index Marker index to draw.
 * @return {!anychart.elements.Multimarker} Return self for chaining call.
 */
anychart.elements.Multimarker.prototype.draw = function(positionProvider, opt_index) {
  //index
  var initDraw;
  var index;
  var incIndex;
  //visual elements
  var markerElement;
  //stage
  var stage;
  var manualSuspend;
  //bounds
  var parentWidth;
  var parentHeight;
  var drawer;

  //process marker index
  if (goog.isDef(opt_index)) {
    index = opt_index;
  } else {
    if (isNaN(this.index_)) this.index_ = 0;
    index = this.index_;
    incIndex = true;
  }

  var enabled = this.customMarkerSettings_[index] && goog.isDef(this.customMarkerSettings_[index].enabled) ?
      this.customMarkerSettings_[index].enabled : this.enabled();

  if (!this.elementsPoll_) this.elementsPoll_ = {};
  if (!this.elementsRenderState_) this.elementsRenderState_ = {};

  if (!enabled) {
    var el = this.elementsPoll_[index];
    if (el) {
      el.dispose();
      this.elementsPoll_[index] = null;
      this.appearanceStates_[index] = false;
      this.positionStates_[index] = false;
    }
    this.elementsRenderState_[index] = false;
    if (incIndex) this.index_++;
    return this;
  }

  //create internal elements only if draw ever called
  if (!this.layer_) {
    this.layer_ = acgraph.layer();
    this.invalidate(anychart.ConsistencyState.CONTAINER | anychart.ConsistencyState.Z_INDEX);
  }

  //suspend stage
  stage = this.layer_.getStage();
  manualSuspend = stage && !stage.isSuspended();
  if (manualSuspend) stage.suspend();

  markerElement = this.elementsPoll_[index];


  if (!markerElement) {
    markerElement = acgraph.path();
    markerElement.parent(this.layer_);
    this.elementsPoll_[index] = markerElement;
    initDraw = true;
  }

  this.elementsRenderState_[index] = true;

  //define parent bounds
  if (this.parentBounds_) {
    parentWidth = this.parentBounds_.width;
    parentHeight = this.parentBounds_.height;
  }

  var appearanceState = this.appearanceStates_[index];
  var updateAppearance = this.commonAppearanceState_ || appearanceState || initDraw;

  if (updateAppearance) {
    var fill = this.customMarkerSettings_[index] && this.customMarkerSettings_[index].fill ?
        this.customMarkerSettings_[index].fill :
        this.fill_;
    markerElement.fill(fill);
    var stroke = this.customMarkerSettings_[index] && this.customMarkerSettings_[index].stroke ?
        this.customMarkerSettings_[index].stroke :
        this.stroke_;
    markerElement.stroke(stroke);
    this.appearanceStates_[index] = false;
  }

  var positionState = this.positionStates_[index];
  var updatePosition = this.commonPositionState_ || positionState || initDraw;

  if (updatePosition) {
    var type = this.customMarkerSettings_[index] && this.customMarkerSettings_[index].type ?
        this.customMarkerSettings_[index].type :
        this.type_;

    var size = this.customMarkerSettings_[index] && this.customMarkerSettings_[index].size ?
        this.customMarkerSettings_[index].size :
        this.size_;

    var anchor = this.customMarkerSettings_[index] && this.customMarkerSettings_[index].anchor ?
        this.customMarkerSettings_[index].anchor :
        this.anchor_;

    var offsetX = this.customMarkerSettings_[index] && this.customMarkerSettings_[index].offsetX ?
        this.customMarkerSettings_[index].offsetX :
        this.offsetX_;

    var offsetY = this.customMarkerSettings_[index] && this.customMarkerSettings_[index].offsetY ?
        this.customMarkerSettings_[index].offsetY :
        this.offsetY_;

    drawer = goog.isString(type) ?
        anychart.elements.Marker.getMarkerDrawer(/** @type {anychart.elements.Marker.Type} */(type)) :
        type;

    markerElement.clear();
    markerElement.setTransformationMatrix(1, 0, 0, 1, 0, 0);
    drawer.call(this, markerElement, 0, 0, size);
    var markerBounds = markerElement.getBounds();

    var position = this.positionFormatter_.call(this, positionProvider, index);
    var anchorCoordinate = anychart.utils.getCoordinateByAnchor(
        new acgraph.math.Rect(0, 0, markerBounds.width, markerBounds.height),
        anchor);

    position.x -= anchorCoordinate.x;
    position.y -= anchorCoordinate.y;

    var offsetXNorm = goog.isDef(offsetX) ? anychart.utils.normalize(offsetX, parentWidth) : 0;
    var offsetYNorm = goog.isDef(offsetY) ? anychart.utils.normalize(offsetY, parentHeight) : 0;

    anychart.utils.applyOffsetByAnchor(position, anchor, offsetXNorm, offsetYNorm);

    markerBounds.left = position.x + markerBounds.width / 2;
    markerBounds.top = position.y + markerBounds.height / 2;

    markerElement.clear();
    drawer.call(this, markerElement, markerBounds.left, markerBounds.top, size);
    if (positionState) this.positionStates_[index] = false;
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    this.layer_.zIndex(/** @type {number} */(this.zIndex()));
    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    this.layer_.parent(/** @type {acgraph.vector.ILayer} */(this.container()));
    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }

  if (incIndex) this.index_++;
  if (manualSuspend) stage.resume();

  return this;
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
 * @param {!goog.events.EventId.<EVENTOBJ>|string} type The event type id.
 * @param {function(this:SCOPE, EVENTOBJ):(boolean|undefined)} listener Callback
 *     method.
 * @param {boolean=} opt_useCapture Whether to fire in capture phase
 *     (defaults to false).
 * @param {SCOPE=} opt_listenerScope Object in whose scope to call the
 *     listener.
 * @return {goog.events.ListenableKey} Unique key for the listener.
 * @template SCOPE,EVENTOBJ
 */
anychart.elements.Multimarker.prototype.listen = function(type, listener, opt_useCapture, opt_listenerScope) {
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
 * @param {!goog.events.EventId.<EVENTOBJ>|string} type The event type id.
 * @param {function(this:SCOPE, EVENTOBJ):(boolean|undefined)} listener Callback
 *     method.
 * @param {boolean=} opt_useCapture Whether to fire in capture phase
 *     (defaults to false).
 * @param {SCOPE=} opt_listenerScope Object in whose scope to call the
 *     listener.
 * @return {goog.events.ListenableKey} Unique key for the listener.
 * @template SCOPE,EVENTOBJ
 */
anychart.elements.Multimarker.prototype.listenOnce = function(type, listener, opt_useCapture, opt_listenerScope) {
  var res = goog.base(this, 'listenOnce', type, listener, opt_useCapture, opt_listenerScope);
  this.ensureHandler_('' + type, !!opt_useCapture, true, true);
  return res;
};


/**
 * Removes an event listener which was added with listen() or listenOnce().
 *
 * @param {!goog.events.EventId.<EVENTOBJ>|string} type The event type id.
 * @param {function(this:SCOPE, EVENTOBJ):(boolean|undefined)} listener Callback
 *     method.
 * @param {boolean=} opt_useCapture Whether to fire in capture phase
 *     (defaults to false).
 * @param {SCOPE=} opt_listenerScope Object in whose scope to call
 *     the listener.
 * @return {boolean} Whether any listener was removed.
 * @template SCOPE,EVENTOBJ
 */
anychart.elements.Multimarker.prototype.unlisten = function(type, listener, opt_useCapture, opt_listenerScope) {
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
anychart.elements.Multimarker.prototype.unlistenByKey = function(key) {
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
anychart.elements.Multimarker.prototype.removeAllListeners = function(opt_type) {
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
anychart.elements.Multimarker.prototype.ensureHandler_ = function(type, capture, armed, opt_once) {
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
anychart.elements.Multimarker.prototype.removeAllHandlers_ = function() {
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
anychart.elements.Multimarker.prototype.handleBrowserEvent_ = function(e) {
  if (e instanceof goog.events.BrowserEvent) {
    e.stopPropagation();
    this.dispatchEvent(new anychart.elements.Multimarker.BrowserEvent(e, this));
  }
};


/**
 * Restore marker default settings.
 */
anychart.elements.Multimarker.prototype.restoreDefaults = function() {
  this.suspendSignalsDispatching();
  this.positionFormatter_ = function(positionProvider, index) {
    return positionProvider;
  };

  this.customMarkerSettings_ = {};
  this.appearanceStates_ = {};
  this.positionStates_ = {};

  this.zIndex(70);
  this.type(anychart.elements.Marker.Type.DIAGONAL_CROSS);
  this.size(10);
  this.fill('black');
  this.stroke('none');
  this.anchor(anychart.utils.NinePositions.CENTER);
  this.position(anychart.utils.NinePositions.CENTER);
  this.offsetX(0);
  this.offsetY(0);
  this.resumeSignalsDispatching(true);
};


/**
 * Disposing.
 */
anychart.elements.Multimarker.prototype.disposeInternal = function() {
  if (this.layer_) this.layer_.dispose();
  this.elementsPoll_ = null;
  this.layer_ = null;
  this.elementsRenderState_ = null;
  this.customMarkerSettings_ = null;
  this.appearanceStates_ = null;
  this.positionStates_ = null;
  this.measureCache_ = null;
  this.positionFormatter_ = null;
  this.measureMarkerElement_ = null;

  goog.base(this, 'disposeInternal');
};



/**
 * Encapsulates browser event for acgraph.
 * @param {goog.events.BrowserEvent=} opt_e Normalized browser event to initialize this event.
 * @param {goog.events.EventTarget=} opt_target EventTarget to be set as a target of the event.
 * @constructor
 * @extends {goog.events.BrowserEvent}
 */
anychart.elements.Multimarker.BrowserEvent = function(opt_e, opt_target) {
  goog.base(this);
  if (opt_e)
    this.copyFrom(opt_e, opt_target);
};
goog.inherits(anychart.elements.Multimarker.BrowserEvent, goog.events.BrowserEvent);


/**
 * An override of BrowserEvent.event_ field to allow compiler to treat it properly.
 * @private
 * @type {goog.events.BrowserEvent}
 */
anychart.elements.Multimarker.BrowserEvent.prototype.event_;


/**
 * Marker index.
 * @type {Number}
 * @private
 */
anychart.elements.Multimarker.BrowserEvent.prototype['markerIndex'] = -1;


/**
 * Copies all info from a BrowserEvent to represent a new one, rearmed event, that can be redispatched.
 * @param {goog.events.BrowserEvent} e Normalized browser event to copy the event from.
 * @param {goog.events.EventTarget=} opt_target EventTarget to be set as a target of the event.
 */
anychart.elements.Multimarker.BrowserEvent.prototype.copyFrom = function(e, opt_target) {
  this.type = e.type;
  // TODO (Anton Saukh): this awful typecast must be removed when it is no longer needed.
  // In the BrowserEvent.init() method there is a TODO from Santos, asking to change typification
  // from Node to EventTarget, which would make more sense.
  /** @type {Node} */
  var target = /** @type {Node} */(/** @type {Object} */(opt_target));
  this.target = target || e.target;
  this.currentTarget = e.currentTarget || this.target;
  this.relatedTarget = e.relatedTarget || this.target;

  this['markerIndex'] = e.target && e.target['__tagIndex'];
  if (isNaN(this['markerIndex']))
    this['markerIndex'] = -1;

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
