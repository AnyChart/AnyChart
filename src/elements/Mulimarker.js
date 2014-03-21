goog.provide('anychart.elements.Multimarker');



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
 * @extends {anychart.elements.Base}
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

  this.restoreDefaults();
  this.silentlyInvalidate(anychart.utils.ConsistencyState.ALL);
};
goog.inherits(anychart.elements.Multimarker, anychart.elements.Base);


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.elements.Multimarker.prototype.DISPATCHED_CONSISTENCY_STATES =
    anychart.elements.Base.prototype.DISPATCHED_CONSISTENCY_STATES |
    anychart.utils.ConsistencyState.POSITION |
    anychart.utils.ConsistencyState.APPEARANCE |
    anychart.utils.ConsistencyState.DATA;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.elements.Multimarker.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.elements.Base.prototype.SUPPORTED_CONSISTENCY_STATES |
        anychart.utils.ConsistencyState.POSITION |
        anychart.utils.ConsistencyState.APPEARANCE |
        anychart.utils.ConsistencyState.DATA;


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
 *  обязательном порядке содержит поля <b>x</b> и <b>y</b>, учитывающие все настройки позиционирования (anchor, offsets,
 *  position).<br/>
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
    this.invalidate(anychart.utils.ConsistencyState.POSITION);
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
 * @param {string=} opt_value .
 * @return {anychart.elements.Multimarker|string} .
 */
anychart.elements.Multimarker.prototype.positionAt = function(index, opt_value) {
  if (!this.customMarkerSettings_[index]) this.customMarkerSettings_[index] = {};
  if (goog.isDef(opt_value)) {
    opt_value = anychart.utils.normalizePosition(opt_value);
    if (this.customMarkerSettings_[index].position != opt_value) {
      this.customMarkerSettings_[index].position = opt_value;
      this.positionStates_[index] = true;
      if (this.measureCache_) this.measureCache_[index] = null;
      this.invalidate(anychart.utils.ConsistencyState.POSITION);
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
 * @param {string=} opt_value [{@link anychart.utils.NinePositions}.CENTER] Value to set
 * @return {anychart.elements.Multimarker} Экземпляр класса {@link anychart.elements.Multimarker} для цепочного вызова.
 *//**
 * @ignoreDoc
 * @param {string=} opt_value .
 * @return {anychart.elements.Multimarker|string} .
 */
anychart.elements.Multimarker.prototype.position = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.utils.normalizePosition(opt_value);
    if (this.position_ != opt_value) {
      this.position_ = opt_value;
      this.measureCache_ = null;
      this.commonPositionState_ = true;
      this.invalidate(anychart.utils.ConsistencyState.POSITION);
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
 * @param {(anychart.utils.NinePositions|string)=} opt_value .
 * @return {anychart.elements.Multimarker|string} .
 */
anychart.elements.Multimarker.prototype.anchorAt = function(index, opt_value) {
  if (!this.customMarkerSettings_[index]) this.customMarkerSettings_[index] = {};
  if (goog.isDef(opt_value)) {
    opt_value = anychart.utils.normalizeNinePositions(opt_value);
    if (this.customMarkerSettings_[index].anchor != opt_value) {
      this.customMarkerSettings_[index].anchor = opt_value;
      this.positionStates_[index] = true;
      if (this.measureCache_) this.measureCache_[index] = null;
      this.invalidate(anychart.utils.ConsistencyState.POSITION);
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
 * @return {!anychart.elements.Multimarker|anychart.utils.NinePositions|string} .
 */
anychart.elements.Multimarker.prototype.anchor = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.utils.normalizePosition(opt_value);
    if (this.anchor_ != opt_value) {
      this.anchor_ = opt_value;
      this.measureCache_ = null;
      this.commonPositionState_ = true;
      this.invalidate(anychart.utils.ConsistencyState.POSITION);
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
      this.invalidate(anychart.utils.ConsistencyState.POSITION | anychart.utils.ConsistencyState.DATA);
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
      this.invalidate(anychart.utils.ConsistencyState.POSITION);
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
      this.invalidate(anychart.utils.ConsistencyState.POSITION);
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
 * @param {number=} opt_value [10] Value to set
 * @return {anychart.elements.Multimarker} Экземпляр класса {@link anychart.elements.Multimarker} для цепочного вызова.
 *//**
 * @ignoreDoc
 * @param {number=} opt_value .
 * @return {anychart.elements.Multimarker|number} .
 *//**
 * Gets or sets marker size settings.
 * @param {number=} opt_value Marker size.
 * @return {number|anychart.elements.Multimarker} Markers size settings or itself for chaining call.
 */
anychart.elements.Multimarker.prototype.size = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.size_ != opt_value) {
      this.size_ = opt_value;
      this.measureCache_ = null;
      this.commonPositionState_ = true;
      this.invalidate(anychart.utils.ConsistencyState.POSITION);
    }
    return this;
  } else {
    return this.size_;
  }
};


/**
 * Gets or sets marker offsetX settings for custom point.
 * @param {number} index Marker index.
 * @param {(number|string)=} opt_value OffsetX settings.
 * @return {number|string|anychart.elements.Multimarker} Marker offsetX value or itself for chaining call.
 */
anychart.elements.Multimarker.prototype.offsetXAt = function(index, opt_value) {
  if (!this.customMarkerSettings_[index]) this.customMarkerSettings_[index] = {};
  if (goog.isDef(opt_value)) {
    if (this.customMarkerSettings_[index].offsetX != opt_value) {
      this.customMarkerSettings_[index].offsetX = opt_value;
      this.positionStates_[index] = true;
      if (this.measureCache_) this.measureCache_[index] = null;
      this.invalidate(anychart.utils.ConsistencyState.POSITION);
    }
    return this;
  } else {
    return this.customMarkerSettings_[index].offsetX || this.offsetX_;
  }
};


/**
 * Gets or sets marker offsetX settings.
 * @param {(number|string)=} opt_value Marker offsetX settings to set.
 * @return {number|string|anychart.elements.Multimarker} Marker offsetX value or itself for chaining call.
 */
anychart.elements.Multimarker.prototype.offsetX = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.offsetX_ != opt_value) {
      this.offsetX_ = opt_value;
      this.measureCache_ = null;
      this.commonPositionState_ = true;
      this.invalidate(anychart.utils.ConsistencyState.POSITION);
    }
    return this;
  } else {
    return this.offsetX_;
  }
};


/**
 * Gets or sets marker offsetY settings for custom point.
 * @param {number} index Marker index.
 * @param {(number|string)=} opt_value OffsetY settings.
 * @return {number|string|anychart.elements.Multimarker} Marker offsetY value or itself for chaining call.
 */
anychart.elements.Multimarker.prototype.offsetYAt = function(index, opt_value) {
  if (!this.customMarkerSettings_[index]) this.customMarkerSettings_[index] = {};
  if (goog.isDef(opt_value)) {
    if (this.customMarkerSettings_[index].offsetY != opt_value) {
      this.customMarkerSettings_[index].offsetY = opt_value;
      this.positionStates_[index] = true;
      if (this.measureCache_) this.measureCache_[index] = null;
      this.invalidate(anychart.utils.ConsistencyState.POSITION);
    }
    return this;
  } else {
    return this.customMarkerSettings_[index].offsetY || this.offsetY_;
  }
};


/**
 * Gets or sets marker offsetY settings.
 * @param {(number|string)=} opt_value Marker offsetY settings to set.
 * @return {number|string|anychart.elements.Multimarker} Marker offsetY value or itself for chaining call.
 */
anychart.elements.Multimarker.prototype.offsetY = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.offsetY_ != opt_value) {
      this.offsetY_ = opt_value;
      this.measureCache_ = null;
      this.commonPositionState_ = true;
      this.invalidate(anychart.utils.ConsistencyState.POSITION);
    }
    return this;
  } else {
    return this.offsetY_;
  }
};


/**
 * Gets or sets marker fill settings for custom point.
 * @param {number} index Marker index.
 * @param {string|acgraph.vector.Fill=} opt_value Marker fill.
 * @return {string|acgraph.vector.Fill|anychart.elements.Multimarker}
 */
anychart.elements.Multimarker.prototype.fillAt = function(index, opt_value) {
  if (!this.customMarkerSettings_[index]) this.customMarkerSettings_[index] = {};
  if (goog.isDef(opt_value)) {
    if (this.customMarkerSettings_[index].fill != opt_value) {
      this.customMarkerSettings_[index].fill = opt_value;
      this.appearanceStates_[index] = true;
      this.invalidate(anychart.utils.ConsistencyState.APPEARANCE);
    }
    return this;
  } else {
    return this.customMarkerSettings_[index].fill || this.fill_;
  }
};


/**
 * Gets or sets marker fill settings.
 * @param {(string|acgraph.vector.Fill)=} opt_value Marker fill.
 * @return {string|acgraph.vector.Fill|anychart.elements.Multimarker} Markers fill settings or itself for chaining call.
 */
anychart.elements.Multimarker.prototype.fill = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.fill_ != opt_value) {
      this.fill_ = opt_value;
      this.commonAppearanceState_ = true;
      this.invalidate(anychart.utils.ConsistencyState.APPEARANCE);
    }
    return this;
  } else {
    return this.fill_;
  }
};


/**
 * Gets or sets marker stroke settings for custom point.
 * @param {number} index Marker index.
 * @param {(string|acgraph.vector.Stroke)=} opt_value Marker stroke.
 * @return {string|acgraph.vector.Stroke|anychart.elements.Multimarker}
 */
anychart.elements.Multimarker.prototype.strokeAt = function(index, opt_value) {
  if (!this.customMarkerSettings_[index]) this.customMarkerSettings_[index] = {};
  if (goog.isDef(opt_value)) {
    if (this.customMarkerSettings_[index].stroke != opt_value) {
      this.customMarkerSettings_[index].stroke = opt_value;
      this.appearanceStates_[index] = true;
      this.invalidate(anychart.utils.ConsistencyState.APPEARANCE);
    }
    return this;
  } else {
    return this.customMarkerSettings_[index].stroke || this.stroke_;
  }
};


/**
 * Gets or sets marker stroke settings.
 * @param {(string|acgraph.vector.Stroke)=} opt_value Marker stroke.
 * @return {string|acgraph.vector.Stroke|anychart.elements.Multimarker} Markers stroke settings or itself for chaining call.
 */
anychart.elements.Multimarker.prototype.stroke = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.stroke_ != opt_value) {
      this.stroke_ = opt_value;
      this.commonAppearanceState_ = true;
      this.invalidate(anychart.utils.ConsistencyState.APPEARANCE);
    }
    return this;
  } else {
    return this.stroke_;
  }
};


/**
 * Gets or sets marker enabled state for custom point.
 * @param {number} index Marker index.
 * @param {boolean=} opt_value Enabled state.
 * @return {boolean|anychart.elements.Multimarker} Marker enabled state or itself for chaining call.
 */
anychart.elements.Multimarker.prototype.enabledAt = function(index, opt_value) {
  if (!this.customMarkerSettings_[index]) this.customMarkerSettings_[index] = {};
  if (goog.isDef(opt_value)) {
    if (this.customMarkerSettings_[index].enabled != opt_value) {
      this.customMarkerSettings_[index].enabled = opt_value;
      this.invalidate(anychart.utils.ConsistencyState.ENABLED);
    }
    return this;
  } else {
    return this.customMarkerSettings_[index] && goog.isDef(this.customMarkerSettings_[index].enabled) ?
        this.customMarkerSettings_[index].enabled :
        this.enabled();
  }
};


/**
 * @inheritDoc
 */
anychart.elements.Multimarker.prototype.serialize = function() {
  //Вот так это должно быть:
  //var data = goog.base(this, 'serialize');
  //но пока что у base нету сериализации, поэтому делаю так:
  var data = {};
  data['position'] = this.position_;
  data['anchor'] = this.anchor_;
  data['type'] = this.type_;
  data['size'] = this.size_;
  data['offsetX'] = this.offsetX_;
  data['offsetY'] = this.offsetY_;
  data['fill'] = this.fill_;
  data['stroke'] = this.stroke_;
  data['customMarkerSettings'] = this.customMarkerSettings_;
  data['parentBounds'] = this.parentBounds_;

  return data;
};


/**
 * @inheritDoc
 */
anychart.elements.Multimarker.prototype.deserialize = function(data) {
  //goog.base(this, 'deserialize');
  this.position(data['position']);
  this.anchor(data['anchor']);
  this.type(data['type']);
  this.size(data['size']);
  this.offsetX(data['offsetX']);
  this.offsetY(data['offsetY']);
  this.fill(data['fill']);
  this.stroke(data['stroke']);
  this.customMarkerSettings_ = data['customMarkerSettings'];
  this.parentBounds(data['parentBounds']);
};


/**
 * Serialization marker at index.
 * @param {number} index Marker index.
 * @param {Object} data Data for marker.
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
  this.invalidate(anychart.utils.ConsistencyState.APPEARANCE);
  this.invalidate(anychart.utils.ConsistencyState.POSITION);
};


/**
 * Drop custom settings.
 */
anychart.elements.Multimarker.prototype.dropCustomSettings = function() {
  for (var i in this.customMarkerSettings_) {
    var index = parseInt(i, 0);
    this.customMarkerSettings_[index] = null;
    this.appearanceStates_[index] = true;
    this.positionStates_[index] = true;
  }
  this.customMarkerSettings_ = {};
  this.invalidate(anychart.utils.ConsistencyState.APPEARANCE);
};


/**
 * Drop custom settings.
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
 * Getter and setter for parent element bounds. Used to calculate offsets passed in percents.
 * @param {anychart.math.Rect=} opt_value Parent bounds to set.
 * @return {!anychart.elements.Multimarker|anychart.math.Rect} Marker or parent bounds.
 */
anychart.elements.Multimarker.prototype.parentBounds = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.parentBounds_ != opt_value) {
      this.parentBounds_ = opt_value;
      this.commonPositionState_ = true;
      this.invalidate(anychart.utils.ConsistencyState.POSITION);
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
 * Measure markers using positionProvider and returns markers bounds.
 * @param {*} positionProvider Object witch provide info for positionFormatter function.
 * @param {number=} opt_index Marker index to draw.
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

  var index = goog.isDef(opt_index) ? opt_index : 0;

  var type = goog.isDef(index) && this.customMarkerSettings_[index] && this.customMarkerSettings_[index].type ?
      this.customMarkerSettings_[index].type :
      this.type_;

  var size = goog.isDef(index) && this.customMarkerSettings_[index] && this.customMarkerSettings_[index].size ?
      this.customMarkerSettings_[index].size :
      this.size_;

  var anchor = goog.isDef(index) && this.customMarkerSettings_[index] && this.customMarkerSettings_[index].anchor ?
      this.customMarkerSettings_[index].anchor :
      this.anchor_;

  var offsetX = this.customMarkerSettings_[index] && this.customMarkerSettings_[index].offsetX ?
      this.customMarkerSettings_[index].offsetX :
      this.offsetX_;

  var offsetY = this.customMarkerSettings_[index] && this.customMarkerSettings_[index].offsetY ?
      this.customMarkerSettings_[index].offsetY :
      this.offsetY_;

  drawer = goog.isString(type) ?
      anychart.elements.Marker.getMarkerDrawer(/** @type {anychart.elements.Marker.Type}*/(type)) :
      type;
  this.measureMarkerElement_.clear();
  drawer.call(this, this.measureMarkerElement_, 0, 0, size);

  var markerBounds = /** @type {anychart.math.Rect} */(this.measureMarkerElement_.getBounds());
  var position = this.positionFormatter_.call(this, positionProvider, index);
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
 * End markers drawing.
 * Reset all counter so u can redraw markers.
 */
anychart.elements.Multimarker.prototype.end = function() {
  var isEmpty = !this.elementsRenderState_ || goog.object.isEmpty(this.elementsRenderState_);
  var i, index;

  if (!isEmpty) {
    for (i in this.elementsRenderState_) {
      index = parseInt(i, 0);
      if (!this.elementsRenderState_[index]) {
        var el = this.elementsPoll_[index];
        if (el) {
          el.dispose();
          this.elementsPoll_[index] = null;
          this.appearanceStates_[index] = false;
          this.positionStates_[index] = false;
        }
      }
      this.elementsRenderState_[index] = false;
    }
  }

  this.index_ = NaN;
  this.measureCache_ = null;
  this.commonPositionState_ = false;
  this.commonAppearanceState_ = false;
  this.markConsistent(anychart.utils.ConsistencyState.ALL);
};


/**
 * Draw markers using positionProvider.
 * @param {*} positionProvider Object witch provide info for textFormatter function.
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
  if (!this.layer_) this.layer_ = acgraph.layer();

  //suspend stage
  stage = this.layer_.getStage();
  manualSuspend = stage && !stage.isSuspended();
  if (manualSuspend) stage.suspend();

  if (!this.elementsPoll_) this.elementsPoll_ = {};
  if (!this.elementsRenderState_) this.elementsRenderState_ = {};

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

  if (this.hasInvalidationState(anychart.utils.ConsistencyState.Z_INDEX)) {
    this.layer_.zIndex(/** @type {number} */(this.zIndex()));
    this.markConsistent(anychart.utils.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.utils.ConsistencyState.CONTAINER)) {
    this.layer_.parent(/** @type {acgraph.vector.ILayer} */(this.container()));
    this.markConsistent(anychart.utils.ConsistencyState.CONTAINER);
  }

  if (incIndex) this.index_++;
  if (manualSuspend) stage.resume();

  return this;
};


/**
 * Restore marker default settings.
 */
anychart.elements.Multimarker.prototype.restoreDefaults = function() {
  this.positionFormatter_ = function(positionProvider, index) {
    return positionProvider;
  };

  this.customMarkerSettings_ = {};
  this.appearanceStates_ = {};
  this.positionStates_ = {};

  this.type(anychart.elements.Marker.Type.DIAGONAL_CROSS);
  this.size(10);
  this.fill('black');
  this.stroke('none');
  this.anchor(anychart.utils.NinePositions.CENTER);
  this.position(anychart.utils.NinePositions.CENTER);
  this.offsetX(0);
  this.offsetY(0);
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
