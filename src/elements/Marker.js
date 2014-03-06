goog.provide('anychart.elements.Marker');



/**
 * Класс, описывающий элемент - маркер.<br/>
 * Маркер - это самостоятельный элемент визаулизации, которому можно задать тип (предопределенный или свой), размер и
 * заливку, а также можно спозиционировать широким набором инструментов:
 * <ul>
 *   <li>{@link anychart.elements.Marker#anchor}</li>
 *   <li>{@link anychart.elements.Marker#position}</li>
 *   <li>{@link anychart.elements.Marker#offsetX} и {@link anychart.elements.Marker#offsetY}</li>
 *   <li>{@link anychart.elements.Marker#parentBounds}</li>
 * </ul>
 * @example <t>simple-h100</t>
 * new anychart.elements.Marker()
 *     .type('star5')
 *     .size(27)
 *     .position([ 100, 50])
 *     .container(stage)
 *     .draw();
 * @constructor
 * @extends {anychart.elements.Base}
 */
anychart.elements.Marker = function() {
  goog.base(this);

  /**
   * Type of marker.
   * @type {(anychart.elements.Marker.Type|function(acgraph.vector.Path, number, number, number):acgraph.vector.Path)}
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
   * @type {acgraph.vector.Fill}
   * @private
   */
  this.fill_;

  /**
   * Marker stroke settings.
   * @type {acgraph.vector.Stroke}
   * @private
   */
  this.stroke_;

  /**
   * Marker anchor settings.
   * @type {anychart.utils.NinePositions}
   * @private
   */
  this.anchor_;

  /**
   * Marker position
   * @type {anychart.math.Coordinate}
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
   * @type {acgraph.vector.Path}
   * @private
   */
  this.markerElement_;

  /**
   * Parent bounds stored.
   * @type {anychart.math.Rect}
   * @private
   */
  this.parentBounds_;
  this.restoreDefaults();
  this.silentlyInvalidate(anychart.utils.ConsistencyState.ALL);
};
goog.inherits(anychart.elements.Marker, anychart.elements.Base);


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.elements.Marker.prototype.DISPATCHED_CONSISTENCY_STATES =
    anychart.elements.Base.prototype.DISPATCHED_CONSISTENCY_STATES |
    anychart.utils.ConsistencyState.POSITION |
    anychart.utils.ConsistencyState.APPEARANCE |
    anychart.utils.ConsistencyState.DATA;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.elements.Marker.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.elements.Base.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.utils.ConsistencyState.POSITION |
    anychart.utils.ConsistencyState.APPEARANCE |
    anychart.utils.ConsistencyState.DATA;


/**
 * Markers type.
 * @enum {string}
 */
anychart.elements.Marker.Type = {
  /**
   * @illustration
   * stage.width(200)
   *      .height(30)
   *      .star4(stage.width()/2, stage.height()/2, stage.height()/2-5);
   */
  STAR4: 'star4',
  /**
   * @illustration
   * stage.width(200)
   *      .height(30)
   *      .star5(stage.width()/2, stage.height()/2, stage.height()/2-5);
   */
  STAR5: 'star5',
  /**
   * @illustration
   * stage.width(200)
   *      .height(30)
   *      .star6(stage.width()/2, stage.height()/2, stage.height()/2-5);
   */
  STAR6: 'star6',
  /**
   * @illustration
   * stage.width(200)
   *      .height(30)
   *      .star7(stage.width()/2, stage.height()/2, stage.height()/2-5);
   */
  STAR7: 'star7',
  /**
   * @illustration
   * stage.width(200)
   *      .height(30)
   *      .star10(stage.width()/2, stage.height()/2, stage.height()/2-5);
   */
  STAR10: 'star10',
  /**
   * @illustration
   * stage.width(200)
   *      .height(30)
   *      .triangleUp(stage.width()/2, stage.height()/2, stage.height()/2-5);
   */
  TRIANGLE_UP: 'triangleup',
  /**
   * @illustration
   * stage.width(200)
   *      .height(30)
   *      .triangleDown(stage.width()/2, stage.height()/2, stage.height()/2-5);
   */
  TRIANGLE_DOWN: 'triangledown',
  /**
   * @illustration
   * stage.width(200)
   *      .height(30)
   *      .cross(stage.width()/2, stage.height()/2, stage.height()/2-5);
   */
  CROSS: 'cross',
  /**
   * @illustration
   * stage.width(200)
   *      .height(30)
   *      .diamond(stage.width()/2, stage.height()/2, stage.height()/2-5);
   */
  DIAMOND: 'diamond',
  /**
   * @illustration
   * stage.width(200)
   *      .height(30)
   *      .diagonalCross(stage.width()/2, stage.height()/2, stage.height()/2-5);
   */
  DIAGONAL_CROSS: 'diagonalcross',
  /**
   * @illustration
   * stage.width(200)
   *      .height(30)
   *      .circle(stage.width()/2, stage.height()/2, stage.height()/2-5);
   */
  CIRCLE: 'circle',
  /**
   * @illustration
   * stage.width(200)
   *      .height(30);
   * var side = stage.height()/2-5;
   * stage.path()
   *        .moveTo(stage.width()/2 - side, stage.height()/2 - side)
   *        .lineTo(stage.width()/2 + side, stage.height()/2 - side)
   *        .lineTo(stage.width()/2 + side, stage.height()/2 + side)
   *        .lineTo(stage.width()/2 - side, stage.height()/2 + side)
   *        .close()
   */
  SQUARE: 'square'
};


/**
 * Method to get marker drawer.
 * @param {anychart.elements.Marker.Type} type Marker type.
 * @return {function(acgraph.vector.Path, number, number, number):acgraph.vector.Path} Marker drawer.
 */
anychart.elements.Marker.getMarkerDrawer = function(type) {
  // default drawer
  var drawer = acgraph.vector.primitives.star5;
  switch (type) {
    case 'star4':
      drawer = acgraph.vector.primitives.star4;
      break;
    case 'star6':
      drawer = acgraph.vector.primitives.star6;
      break;
    case 'star7':
      drawer = acgraph.vector.primitives.star7;
      break;
    case 'star10':
      drawer = acgraph.vector.primitives.star10;
      break;
    case 'diamond':
      drawer = acgraph.vector.primitives.diamond;
      break;
    case 'triangleup':
      drawer = acgraph.vector.primitives.triangleUp;
      break;
    case 'triangledown':
      drawer = acgraph.vector.primitives.triangleDown;
      break;
    case 'cross':
      drawer = acgraph.vector.primitives.cross;
      break;
    case 'diagonalcross':
      drawer = acgraph.vector.primitives.diagonalCross;
      break;
    case 'circle':
      drawer = function(path, x, y, radius) {
        return acgraph.vector.primitives.pie(path, x, y, radius, 0, 360);
      };
      break;
    case 'square':
      drawer = function(path, x, y, size) {
        var left = x - size;
        var top = y - size;
        var right = left + size * 2;
        var bottom = top + size * 2;

        path
            .moveTo(left, top)
            .lineTo(right, top)
            .lineTo(right, bottom)
            .lineTo(left, bottom)
            .lineTo(left, top)
            .close();

        return path;
      };
      break;
  }
  return drawer;
};


/**
 * Getter for current marker position settings.
 * @return {anychart.math.Coordinate} Current marker position settings.
 *//**
 * Setter for marker position settings.
 * @example <t>simple-h100</t>
 * var marker = new anychart.elements.Marker()
 *     .position([100, 50])
 * marker.container(stage).draw();
 * // обозначим красным точку поционирования лейбла.
 * stage.circle(100, 50, 2).stroke('3 red')
 * @param {anychart.math.Coordinate=} opt_value [{x: 0, y: 0} относительно заанных баундов] Value to set.
 * @return {!anychart.elements.Marker} Экземпляр класса {@link anychart.elements.Marker} для цепочного вызова.
 *//**
 * @ignoreDoc
 * @param {anychart.math.Coordinate=} opt_value .
 * @return {!anychart.elements.Marker|anychart.math.Coordinate} .
 */
anychart.elements.Marker.prototype.position = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.position_ != opt_value) {
      this.position_ = opt_value;
      this.invalidate(anychart.utils.ConsistencyState.POSITION);
    }
    return this;
  } else {
    return this.position_;
  }
};


/**
 * Getter for marker anchor settings.
 * @return {anychart.utils.NinePositions} Current marker anchor settings.
 *//**
 * Setter for marker anchor settings.<br/>
 * <b>Note:</b> Совмещает точку позиционирования лейбла ({@link anychart.elements.Marker#position}) с указанным якорем.
 * @example <t>simple-h100</t>
 * var marker = new anychart.elements.Marker()
 *     .position([100, 50])
 *     .anchor(anychart.utils.NinePositions.RIGHT_BOTTOM);
 * marker.container(stage).draw();
 * // обозначим красным точку поционирования лейбла.
 * stage.circle(100, 50, 2).stroke('3 red')
 * @param {(anychart.utils.NinePositions|string)=} opt_value [{@link anychart.utils.NinePositions}.CENTER] Value to set.
 * @return {!anychart.elements.Marker} Экземпляр класса {@link anychart.elements.Marker} для цепочного вызова.
 *//**
 * @ignoreDoc
 * @param {(anychart.utils.NinePositions|string)=} opt_value .
 * @return {!anychart.elements.Marker|anychart.utils.NinePositions} .
 */
anychart.elements.Marker.prototype.anchor = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.utils.normalizeNinePositions(opt_value);
    if (this.anchor_ != opt_value) {
      this.anchor_ = opt_value;
      this.invalidate(anychart.utils.ConsistencyState.POSITION);
    }
    return this;
  } else {
    return this.anchor_;
  }
};


/**
 * Getter for current marker type settings.
 * @return {anychart.elements.Marker.Type|function(acgraph.vector.Path, number, number, number):acgraph.vector.Path}
 *  Markers type settings.
 *//**
 * Setter for marker type settings.
 * @example <c>By Enum value.</c><t>simple-h100</t>
 * var marker = new anychart.elements.Marker()
 *     .position([100, 50])
 *     .type(anychart.elements.Marker.Type.STAR5);
 * marker.container(stage).draw();
 * @example <c>By custom function.</c><t>simple-h100</t>
 * new anychart.elements.Marker()
 *     .position([100, 50])
 *     .size(20)
 *     .type(function(path, x, y, size) {
 *       var point1 = {x: x + 1.7 * size, y: y + 0.6 * size};
 *       var point2 = {x: x, y: y + size / 2};
 *       path.moveTo(point1.x, point1.y)
 *           .arcToByEndPoint(point2.x, point2.y, size, size, true, true)
 *           .arcToByEndPoint(point1.x, point1.y, size / 3, size / 3, false, false)
 *           .moveTo(point1.x, point1.y)
 *           .close();
 *       path.rotate(16).translate(-10, -40);
 *       return path;
 *     })
 *     .container(stage)
 *     .draw();
 * @param {(anychart.elements.Marker.Type|
 *  function(acgraph.vector.Path, number, number, number):acgraph.vector.Path)=} opt_value
 *  [{@link anychart.elements.Marker.Type}.DIAGONAL_CROSS] Type or custom drawer.
 * @return {!anychart.elements.Marker} Экземпляр класса {@link anychart.elements.Marker} для цепочного вызова.
 *//**
 * @ignoreDoc
 * @param {(anychart.elements.Marker.Type|
 *          function(acgraph.vector.Path, number, number, number):acgraph.vector.Path)=} opt_value .
 * @return {!anychart.elements.Marker|anychart.elements.Marker.Type|
 *          function(acgraph.vector.Path, number, number, number):acgraph.vector.Path} .
 */
anychart.elements.Marker.prototype.type = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.type_ != opt_value) {
      this.type_ = opt_value;
      this.invalidate(anychart.utils.ConsistencyState.DATA | anychart.utils.ConsistencyState.POSITION);
    }
    return this;
  } else {
    return this.type_;
  }
};


/**
 * Getter for current marker size settings.
 * @return {number} Current markers size.
 *//**
 * Setter for marker size in pixels.
 * @example <t>simple-h100</t>
 * // size 5
 * new anychart.elements.Marker()
 *     .position([stage.width() / 4, stage.height() / 2])
 *     .size(5)
 *     .container(stage)
 *     .draw();
 * // size 10
 * new anychart.elements.Marker()
 *     .position([2 * stage.width() / 4, stage.height() / 2])
 *     .size(10)
 *     .container(stage)
 *     .draw();
 * // size 20
 * new anychart.elements.Marker()
 *     .position([3 * stage.width() / 4 , stage.height() / 2])
 *     .size(20)
 *     .container(stage)
 *     .draw();
 * @param {number=} opt_value [10] Value to set.
 * @return {!anychart.elements.Marker} Экземпляр класса {@link anychart.elements.Marker} для цепочного вызова.
 *//**
 * @ignoreDoc
 * @param {number=} opt_value .
 * @return {number|anychart.elements.Marker} .
 */
anychart.elements.Marker.prototype.size = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.size_ != opt_value) {
      this.size_ = opt_value;
      this.invalidate(
          anychart.utils.ConsistencyState.POSITION | anychart.utils.ConsistencyState.DATA
      );
    }
    return this;
  } else {
    return this.size_;
  }
};


/**
 * Возвращает текущий fill.
 * @return {!acgraph.vector.Fill} Параметры текущей заливки (пустая заливка это всегда 'none').
 *//**
 * Устанавливает настройки заливки через объект или одной строкой.<br/>
 * Принимает объекты типов:
 * <ul>
 * <li>{@link acgraph.vector.LinearGradientFill}</li>
 * <li>{@link acgraph.vector.RadialGradientFill}</li>
 * <li>{@link acgraph.vector.Fill}</li>
 * <li>{@link acgraph.vector.ImageFill}</li>
 * </ul>
 * Либо цвет в виде строки. Причем, одной строкой можно задать и прозрачность (в виде '<b>Color Opacity</b>',
 * например 'red .5').
 * @shortDescription Устанавливает настройки заливки через объект или одной строкой.
 * @example <c>Solid Fill</c><t>simple-h100</t>
 * var marker = new anychart.elements.Marker();
 * // Устанавливаем fill
 *   marker.fill('red 0.1');
 * // the same
 * // marker.fill('#ff0000 0.1');
 * // or
 * // marker.fill({color: 'red', opacity: 0.1});
 * // or
 * // marker.fill('#ff0000 0.1');
 * // then draw
 * marker
 *    .position([100, 50])
 *    .size(45)
 *    .container(stage)
 *    .draw();
 * @example <c>Gradient Fill</c><t>simple-h100</t>
 * var marker = new anychart.elements.Marker();
 *   // Устанавливаем fill
 *   marker.fill({keys:['red .1', 'orange'], mode: true, angle: 45});
 * marker
 *   .position([100, 50])
 *   .size(45)
 *   .container(stage)
 *   .draw();
 * @example <c>Image Fill</c><t>simple-h100</t>
 * new anychart.elements.Marker()
 *    .fill({
 *        src: 'styles/images/rainbow.png',
 *        mode: acgraph.vector.ImageFillMode.STRETCH
 *     })
 *     .stroke('1 #000')
 *     .position([100, 50])
 *     .size(45)
 *     .container(stage)
 *     .draw();
 * @param {acgraph.vector.Fill} value ['#000'] Заливка в виде одного сложного объекта или строки.
 * @return {!anychart.elements.Marker} An instance of the {@link anychart.elements.Marker} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(!acgraph.vector.Fill)=} opt_value .
 * @return {!(acgraph.vector.Fill|anychart.elements.Marker)} .
 */
anychart.elements.Marker.prototype.fill = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.fill_ != opt_value) {
      this.fill_ = opt_value;
      this.invalidate(anychart.utils.ConsistencyState.APPEARANCE);
    }
    return this;
  } else {
    return this.fill_;
  }
};


/**
 * Возаращает текущий stroke.
 * @return {acgraph.vector.Stroke} Возвращает текущую настройку линии.
 *//**
 * Устанавливает настройки stroke одним параметром.<br/>
 * Допустимы следующие варианты:
 * <ul>
 * <li>Строкой в формате '[thickness ]color[ opacity]':
 * <ol>
 * <li><b>'color'</b> - {@link http://www.w3schools.com/html/html_colors.asp}.</li>
 * <li><b>'thickness color'</b> - like a css border, e.g. '3 red' or '3px red'</li>
 * <li><b>'color opacity'</b> - as a fill string, e.g. '#fff 0.5'</li>
 * <li><b>'thickness color opacity'</b> - as a complex string, e.g. '3px #00ff00 0.5'</li>
 * </ol>
 * </li>
 * <li>Объект {@link acgraph.vector.Stroke}</li>
 * <li>Массив ключей {@link acgraph.vector.GradientKey}</li>
 * <li><b>null</b> - сбросит текущие настройки stroke.</li>
 * </ul>
 * <b>Note:</b> String parts order is significant and '3px red' is not the same as 'red 3px'.
 * @shortDescription Устанавливает настройки stroke одним параметром.
 * @example <c>Настроки строкой</c><t>simple</t>
 * new anychart.elements.Marker()
 *   .stroke('red')
 *   .position([ stage.width()/5, 50]).size(stage.width()/10)
 *   .fill('none').container(stage).draw();
 * new anychart.elements.Marker()
 *   .stroke('4px ORANGE')
 *   .position([ 2*stage.width()/5, 50]).size(stage.width()/10)
 *   .fill('none').container(stage).draw();
 * new anychart.elements.Marker()
 *   .stroke('#0f0 0.7')
 *   .position([ 3*stage.width()/5, 50]).size(stage.width()/10)
 *   .fill('none').container(stage).draw();
 * new anychart.elements.Marker()
 *   .stroke('4 #0000FF 0.3')
 *   .position([ 4*stage.width()/5, 50]).size(stage.width()/10)
 *   .fill('none').container(stage).draw();
 * @example <c>Настроки объектом или массивом</c><t>simple</t>
 * new anychart.elements.Marker()
 *   .stroke({color: '#f00', thickness: 2, opacity: 0.9})
 *   .position([100, 50]).size(45)
 *   .fill('none').container(stage).draw();
 * new anychart.elements.Marker()
 *   .stroke(['red', 'green', 'blue'])
 *   .position([200, 50]).size(45)
 *   .fill('none').container(stage).draw();
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)} value ['none'] Стиль заливки в формате '[thickness ]color[ opacity]'.
 * @return {anychart.elements.Marker} An instance of the {@link anychart.elements.Marker} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(acgraph.vector.Stroke)=} opt_value .
 * @return {(!anychart.elements.Marker|acgraph.vector.Stroke)} .
 */
anychart.elements.Marker.prototype.stroke = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.stroke_ != opt_value) {
      this.stroke_ = opt_value;
      this.invalidate(anychart.utils.ConsistencyState.APPEARANCE);
    }
    return this;
  } else {
    return this.stroke_;
  }
};


/**
 * Getter for current marker offsetX settings.
 * @return {number|string} Marker offsetX value.
 *//**
 * Setter for marker offsetX settings.
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
 * var marker = new anychart.elements.Marker()
 *     .position([100, 50])
 *     // выставляем оффсеты по 10px.
 *     .offsetX(10)
 *     .offsetY(10)
 *     .anchor(anychart.utils.NinePositions.RIGHT_BOTTOM);
 * marker.container(stage).draw();
 * // обозначим красным точку поционирования лейбла.
 * stage.circle(100, 50, 2).stroke('3 red')
 * @param {(number|string)=} opt_value [0] Value to set.
 * @return {!anychart.elements.Marker} Экземпляр класса {@link anychart.elements.Marker} для цепочного вызова.
 *//**
 * @ignoreDoc
 * @param {(number|string)=} opt_value .
 * @return {!anychart.elements.Marker|number|string} .
 */
anychart.elements.Marker.prototype.offsetX = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.offsetX_ != opt_value) {
      this.offsetX_ = opt_value;
      this.invalidate(anychart.utils.ConsistencyState.POSITION);
    }
    return this;
  } else {
    return this.offsetX_;
  }
};


/**
 * Getter for current marker offsetY settings.
 * @return {number|string} Marker offsetY value.
 *//**
 * Setter for marker offsetY settings.
 * See illustration in {@link anychart.elements.Marker#offsetX}.
 * @example <t>simple-h100</t>
 * var marker = new anychart.elements.Marker()
 *     .position([100, 50])
 *     // выставляем оффсеты по 10px.
 *     .offsetX(10)
 *     .offsetY(10)
 *     .anchor(anychart.utils.NinePositions.RIGHT_BOTTOM);
 * marker.container(stage).draw();
 * // обозначим красным точку поционирования лейбла.
 * stage.circle(100, 50, 2).stroke('3 red')
 * @param {(number|string)=} opt_value [0] Value to set.
 * @return {!anychart.elements.Marker} Экземпляр класса {@link anychart.elements.Marker} для цепочного вызова.
 *//**
 * @ignoreDoc
 * @param {(number|string)=} opt_value .
 * @return {!anychart.elements.Marker|number|string} .
 */
anychart.elements.Marker.prototype.offsetY = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.offsetY_ != opt_value) {
      this.offsetY_ = opt_value;
      this.invalidate(anychart.utils.ConsistencyState.POSITION);
    }
    return this;
  } else {
    return this.offsetY_;
  }
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
 * new anychart.elements.Marker()
 *     .container(layer2)
 *     .parentBounds(stageBounds)
 *     .draw();
 * new anychart.elements.Marker()
 *     .container(layer2)
 *     .parentBounds(layerBounds)
 *     .stroke('grey')
 *     .draw();
 * @illustrationDesc
 * Marker находится внутри layer (обозначенного синей рамкой) и показаны два варианта рассчета позиции marker:<br/>
 *   a. Серым - рассчет внутри баунов родительского кнтейнера.<br/>
 *   b. Черным - когда в качестве родительских заданы баунды stage.
 * @example <t>listingOnly</t>
 * new anychart.elements.Marker()
 *     .container(layer)
 *     .parentBounds(stageBounds)
 *     .draw();
 * @param {anychart.math.Rect=} opt_value [null] Value to set.
 * @return {!anychart.elements.Marker} Экземпляр класса {@link anychart.elements.Marker} для цепочного вызова.
 *//**
 * @ignoreDoc
 * @param {anychart.math.Rect=} opt_value .
 * @return {!anychart.elements.Marker|anychart.math.Rect} .
 */
anychart.elements.Marker.prototype.parentBounds = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.parentBounds_ != opt_value) {
      this.parentBounds_ = opt_value;
      this.invalidate(anychart.utils.ConsistencyState.POSITION);
    }
    return this;
  }
  return this.parentBounds_;
};


/**
 * Render marker.
 * @return {!anychart.elements.Marker} Экземпляр класса {@link anychart.elements.Marker} для цепочного вызова.
 */
anychart.elements.Marker.prototype.draw = function() {
  if (this.isConsistent()) return this;

  if (!this.markerElement_) {
    this.markerElement_ = acgraph.path();
    this.registerDisposable(this.markerElement_);
  }

  if (this.hasInvalidationState(anychart.utils.ConsistencyState.POSITION) ||
      this.hasInvalidationState(anychart.utils.ConsistencyState.DATA)) {
    var drawer = goog.isString(this.type_) ? anychart.elements.Marker.getMarkerDrawer(this.type_) : this.type_;

    var parentWidth, parentHeight;
    //define parent bounds
    if (this.parentBounds_) {
      parentWidth = this.parentBounds_.width;
      parentHeight = this.parentBounds_.height;
    }

    var position = anychart.utils.normalizeMathPosition(this.position_);
    position.x = anychart.utils.normalize(position.x, parentWidth);
    position.y = anychart.utils.normalize(position.y, parentHeight);

    this.markerElement_.clear();
    drawer.call(this, this.markerElement_, position.x, position.y, this.size_);

    var markerBounds = this.markerElement_.getBounds();

    var anchorCoordinate = anychart.utils.getCoordinateByAnchor(
        new acgraph.math.Rect(0, 0, markerBounds.width, markerBounds.height),
        this.anchor_);

    position.x -= anchorCoordinate.x;
    position.y -= anchorCoordinate.y;

    var offsetX = goog.isDef(this.offsetX_) ? anychart.utils.normalize(this.offsetX_, parentWidth) : 0;
    var offsetY = goog.isDef(this.offsetY_) ? anychart.utils.normalize(this.offsetY_, parentHeight) : 0;

    anychart.utils.applyOffsetByAnchor(position, this.anchor_, offsetX, offsetY);

    markerBounds.left = position.x;
    markerBounds.top = position.y;

    this.markerElement_.clear();
    drawer.call(this, this.markerElement_, markerBounds.left + markerBounds.width / 2, markerBounds.top + markerBounds.height / 2, this.size_);
    this.markConsistent(anychart.utils.ConsistencyState.POSITION);
    this.markConsistent(anychart.utils.ConsistencyState.DATA);
  }

  if (this.hasInvalidationState(anychart.utils.ConsistencyState.APPEARANCE)) {
    this.markerElement_.fill(this.fill_).stroke(this.stroke_);
    this.markConsistent(anychart.utils.ConsistencyState.APPEARANCE);
  }

  if (this.hasInvalidationState(anychart.utils.ConsistencyState.Z_INDEX)) {
    var zIndex = /** @type {number} */(this.zIndex());
    this.markerElement_.zIndex(zIndex);
    this.markConsistent(anychart.utils.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.utils.ConsistencyState.CONTAINER)) {
    this.markerElement_.parent(/** @type {acgraph.vector.ILayer} */(this.container()));
    this.markConsistent(anychart.utils.ConsistencyState.CONTAINER);
  }

  return this;
};


/**
 * Restore marker default settings.
 */
anychart.elements.Marker.prototype.restoreDefaults = function() {
  this.type(anychart.elements.Marker.Type.DIAGONAL_CROSS);
  this.size(10);
  this.fill('black');
  this.stroke('none');
  this.anchor(anychart.utils.NinePositions.CENTER);
  this.position({x: 0, y: 0});
  this.offsetX(0);
  this.offsetY(0);
};


/**
 * Copies marker settings from the passed marker instance to itself.
 * @param {anychart.elements.Marker} marker Marker to copy settings from.
 * @return {!anychart.elements.Marker} Returns itself for chaining.
 */
anychart.elements.Marker.prototype.cloneFrom = function(marker) {
  if (goog.isDefAndNotNull(marker)) {
    this.type(marker.type_);
    this.size(marker.size_);
    this.fill(marker.fill_);
    this.stroke(marker.stroke_);
    this.anchor(marker.anchor_);
    this.position(marker.position_);
    this.offsetX(marker.offsetX_);
    this.offsetY(marker.offsetY_);
    this.parentBounds(marker.parentBounds_);
  } else {
    this.restoreDefaults();
  }
  return this;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Disposing.
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.elements.Marker.prototype.disposeInternal = function() {
  delete this.type_;
  delete this.fill_;
  delete this.stroke_;
  goog.base(this, 'disposeInternal');
};
