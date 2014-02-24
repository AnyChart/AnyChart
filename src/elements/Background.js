goog.provide('anychart.elements.Background');

goog.require('anychart.elements.BaseWithBounds');
goog.require('goog.array');



/**
 * Класс, описывающий элемент визуализации Background.<br/>
 * Background может быть как частью другого, более сложного, элемента (чарт, легенда, заголовок и тд), так и самостоятельным
 * элементом визаулизации.<br/>
 * Background можно назначить заливку, бордер, а также сглаживание углов.<br/>
 * <b>Note:</b> Если хотите использовать Background как самостоятельный элемент, то ему обязательно необходимо указывать
 *  bounds, в которые отрисовываться.
 * @example <t>simple-h100</t>
 * new anychart.elements.Background()
 *   .bounds( new anychart.math.Rect(10, 10, stage.width()-20, stage.height() - 20) )
 *   .container(stage).draw();
 * @param {anychart.elements.Background.CornerType=} opt_cornerType [anychart.elements.Background.CornerType.ROUND] Type
 *  of the background corners.
 * @param {...(number|string)} var_args Набор радиусов (аналогично {@link anychart.elements.Background#corners} только
 *  без массива.
 * @extends {anychart.elements.BaseWithBounds}
 * @constructor
 */
anychart.elements.Background = function(opt_cornerType, var_args) {
  goog.base(this);

  /**
   * Graphics element that represents background path.
   * @type {acgraph.vector.Rect}
   * @private
   */
  this.rect_ = null;

  /**
   * @type {anychart.elements.Background.CornerType}
   * @private
   */
  this.cornerType_ = opt_cornerType || anychart.elements.Background.CornerType.ROUND;

  /**
   * @type {!Array}
   * @private
   */
  this.corners_ = goog.array.slice(arguments, 1, 5);

  /**
   * Fill settings. Contains array of arguments that were passed to the fill() method to support all
   * acgraph.vector.Shape.fill() overloads.
   * @type {!Array}
   * @private
   */
  this.fill_ = ['#000', 0.5]; //если убирать отсюда создание массива, то нужно не забыть убрать apply из copyFrom

  /**
   * Stroke settings. Contains array of arguments that were passed to the stroke() method to support all
   * acgraph.vector.Shape.stroke() overloads.
   * @type {!Array}
   * @private
   */
  this.stroke_ = ['#000']; //если убирать отсюда создание массива, то нужно не забыть убрать apply из copyFrom

  this.invalidate(anychart.utils.ConsistencyState.ALL);
};
goog.inherits(anychart.elements.Background, anychart.elements.BaseWithBounds);


/**
 * Types of the corner.
 * @enum {string}
 */
anychart.elements.Background.CornerType = {
  /**
   * @illustration
   * stage.width(200).height(30);
   * stage.text(35, 10, 'Square corners').fontSize(12);
   * stage.path()
   *   .moveTo(5, 25)
   *   .lineTo(5, 10)
   *   .lineTo(20, 10)
   *   .stroke('3 #F00')
   * stage.path()
   *   .moveTo(5,30)
   *   .lineTo(5,25)
   *   .moveTo(20, 10)
   *   .lineTo(25, 10)
   *   .stroke('3 #666')
   */
  NONE: 'none',
  /**
   * @illustration
   * stage.width(200).height(30);
   * stage.text(35, 10, 'Round corners')
   * stage.path()
   *   .moveTo(5, 25)
   *   .arcToByEndPoint(20, 10, 15, 15, false, true)
   *   .stroke('3 #F00')
   *  stage.path()
   *   .moveTo(5,30)
   *   .lineTo(5,25)
   *   .moveTo(20, 10)
   *   .lineTo(25, 10)
   *   .stroke('3 #666')
   */
  ROUND: 'round',
  /**
   * @illustration
   * stage.width(200).height(30);
   * stage.text(35, 10, 'Cut corners')
   * stage.path()
   *   .moveTo(5, 25)
   *   .lineTo(20, 10)
   *   .stroke('3 #F00')
   *  stage.path()
   *   .moveTo(5,30)
   *   .lineTo(5,25)
   *   .moveTo(20, 10)
   *   .lineTo(25, 10)
   *   .stroke('3 #666')
   */
  CUT: 'cut',
  /**
   * @illustration
   * stage.width(200).height(30);
   * stage.text(35, 10, 'Round-inner corners')
   * stage.path()
   *   .moveTo(5, 25)
   *   .arcToByEndPoint(20, 10, 15, 15, false, false)
   *   .stroke('3 #F00')
   *  stage.path()
   *   .moveTo(5,30)
   *   .lineTo(5,25)
   *   .moveTo(20, 10)
   *   .lineTo(25, 10)
   *   .stroke('3 #666')
   */
  ROUND_INNER: 'roundInner'
};


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.elements.Background.prototype.DISPATCHED_CONSISTENCY_STATES =
    anychart.elements.BaseWithBounds.prototype.DISPATCHED_CONSISTENCY_STATES |
    anychart.utils.ConsistencyState.APPEARANCE;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.elements.Background.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.elements.BaseWithBounds.prototype.SUPPORTED_CONSISTENCY_STATES |
        anychart.utils.ConsistencyState.APPEARANCE;


/**
 * Getter for current corner's radius.
 * @return {(number|string|Array.<number>)} Текущая настройка углов.
 *//** topLeft, topRight, bottomRight, bottomLeft
 * Setter for corner's radius by one value.
 * @example <c>One for all.</c><t>simple-h100</t>
 * new anychart.elements.Background()
 *   .cornerType(anychart.elements.Background.CornerType.CUT)
 *   .corners(10) // same .corners('10px')
 *   .bounds( new anychart.math.Rect(10, 10, stage.width()-20, stage.height() - 20) )
 *   .stroke('#000 2').fill('none').container(stage).draw();
 * @example <c>One for all.</c><t>simple-h100</t>
 * new anychart.elements.Background()
 *   .cornerType(anychart.elements.Background.CornerType.CUT)
 *   .corners([5, 7, 12, 7])
 *    // same .corners('5 7 12 7')
 *    // same .corners('5px 7px 12px 7px')
 *   .bounds( new anychart.math.Rect(10, 10, stage.width()-20, stage.height() - 20) )
 *   .stroke('#000 2').fill('none').container(stage).draw();
 * @param {(number|string|Array.<number>)=} opt_value ['0px'] Value to set.<br/><b>Note:</b> Если в массиве менее 4 значений
 *  (или в строке через пробел менее четырех значений), то берется первое значение и оно устанавливается всем.
 * @return {!anychart.elements.Background} An instance of the {@link anychart.elements.Background} class for method chaining.
 *//**
 * Setter for corner's radius by each value.
 * @example <t>simple-h100</t>
 * new anychart.elements.Background()
 *   .cornerType(anychart.elements.Background.CornerType.CUT)
 *   .corners(15, 7, 12, 7)
 *   .bounds( new anychart.math.Rect(10, 10, stage.width()-20, stage.height() - 20) )
 *   .stroke('#000 2').fill('none').container(stage).draw();
 * @param {(number|string)=} opt_topLeft Top left corner value.
 * @param {(number|string)=} opt_topRight Top right corner value.
 * @param {(number|string)=} opt_bottomRight Bottom left corner value.
 * @param {(number|string)=} opt_bottomLeft Bottom right corner value.
 * @return {!anychart.elements.Background} An instance of the {@link anychart.elements.Background} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(number|string|Array.<number>)=} opt_value .
 * @return {(number|string|Array.<number>|!anychart.elements.Background)} .
 */
anychart.elements.Background.prototype.corners = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var val;
    if (goog.isArray(opt_value)) {
      val = opt_value;
    } else {
      val = goog.array.slice(arguments, 0);
    }
    if (!goog.array.equals(val, this.corners_)) {
      this.corners_ = val;
      this.invalidate(anychart.utils.ConsistencyState.APPEARANCE);
    }
    return this;
  } else {
    return this.corners_;
  }
};


/**
 * Getter for current corner type.
 * @return {anychart.elements.Background.CornerType} Corners type or self for chaining.
 *//**
 * Setter for corner type.
 * @example <t>simple-h100</t>
 * new anychart.elements.Background()
 *   .cornerType(anychart.elements.Background.CornerType.ROUND_INNER)
 *   .corners(10)
 *   .stroke('#000 2')
 *   .bounds( new anychart.math.Rect(10, 10, stage.width()-20, stage.height() - 20) )
 *   .fill('none').container(stage).draw();
 * @param {anychart.elements.Background.CornerType=} opt_value [{@link anychart.elements.Background.CornerType}.ROUND] Value to set.
 * @return {!anychart.elements.Background} An instance of the {@link anychart.elements.Background} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {anychart.elements.Background.CornerType=} opt_value Corner type.
 * @return {anychart.elements.Background.CornerType|anychart.elements.Background} Corners type or self for chaining.
 */
anychart.elements.Background.prototype.cornerType = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (opt_value != this.cornerType_) {
      this.cornerType_ = opt_value;
      this.invalidate(anychart.utils.ConsistencyState.APPEARANCE);
    }
    return this;
  } else {
    return this.cornerType_;
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
 * var bg = new anychart.elements.Background();
 * // Устанавливаем fill
 *   bg.fill('red 0.1');
 * // the same
 * // bg.fill('#ff0000 0.1');
 * // or
 * // bg.fill({color: 'red', opacity: 0.1});
 * // or
 * // bg.fill('#ff0000 0.1');
 * // than draw
 * bg.container(stage)
 *   .bounds( new anychart.math.Rect(10, 10, stage.width()-20, stage.height()-20) )
 *   .draw();
 * @example <c>Gradient Fill</c><t>simple-h100</t>
 * var bg = new anychart.elements.Background();
 * // Устанавливаем fill
 *   bg.fill({keys:['red .1', 'orange'], mode: true, angle: 45});
 * bg.container(stage)
 *   .bounds( new anychart.math.Rect(10, 10, stage.width()-20, stage.height()-20) )
 *   .draw();
 * @example <c>Image Fill</c><t>simple-h100</t>
 * new anychart.elements.Background()
 *    .bounds( new anychart.math.Rect(10, 10, stage.width()-20, stage.height() - 20) )
 *    .stroke('#000 2').fill({
 *        src: 'styles/images/rainbow.png',
 *        mode: acgraph.vector.ImageFillMode.TILE
 *     }).container(stage).draw();
 * @param {acgraph.vector.Fill} value ['#000 0.5'] Заливка в виде одного сложного объекта или строки.
 * @return {!acgraph.vector.Shape} An instance of the {@link acgraph.vector.Shape} class for method chaining.
 * *//**
 * Заливка в виде цвета строкой и прозрачности.<br/>
 * <b>Note:</b> Если цвет задан в виде строки, например 'red .5', то он имеет больший приоритет, чем opt_opacity, т.е. в случае
 * когда <b>fill</b> задан <b>rect.fill('red 0.3', 0.7)</b>, итоговая прозрачность заливки будет 0.3.
 * @shortDescription Заливка в виде цвета строкой и прозрачности.
 * @example <t>simple-h100</t>
 * var bg = new anychart.elements.Background();
 * // Устанавливаем fill
 *   bg.fill('red', 0.1);
 * bg.container(stage)
 *   .bounds( new anychart.math.Rect(10, 10, stage.width()-20, stage.height()-20) )
 *   .draw();
 * @param {string} color Цвет заливки в виде строки.
 * @param {number=} opt_opacity Прозрачность заливки.
 * @return {!anychart.elements.Background} An instance of the {@link anychart.elements.Background} class for method chaining.
 *//**
 * Заливка линейным градиентом.<br/>
 * Есть три режима работы:
 * <ul>
 *  <li>ObjectBoundingBox с сохранением угла</li>
 *  <li>ObjectBoundingBox без сохранения угла</li>
 *  <li>UserSpaceOnUse</li>
 * </ul>
 * <h4>Режимы:</h4>
 * <p><b>ObjectBoundingBox с сохранением угла</b><br/>
 * Если передан параметр типа boolean, то он отвечает за поведение градиента относительно фигуры, в которую он
 * вписывается, а точнее, определяет поведение угла наклона линии градиента. Если true - то это режим ObjectBoundingBox
 * с сохранением угла. То есть в любой фигуре угол наклона градиента визуально будет соответствовать заданному.<br/>
 * <b>Note:</b> По умолчанию, вектор градиента, рассчитанный для заданного угла в фигуре с соотношением не 1:1, не будет в итоге
 * визуально располагаться под этим углом. Браузер трансформирует угол в пропорции соотношения сторон. Поэтому
 * сделан алгоритм, который приводит в соответствие конечный угол к заданному в любой фигуре.</p>
 * <p><b>ObjectBoundingBox без сохранения угла</b><br/>
 * Если параметр имеет значение false - это режим ObjectBoundingBox без сохранения угла. В этом случае будет применено
 * поведение по умолчанию - вектор градиента будет расчитан под заданным углом, но в фигуре с соотношением сторон
 * не 1:1 он будет измнен браузером (сжат пропорционально соотношению сторон) и визуально угол наклона вектора
 * градиента не будет соответствовать заданному.</p>
 * <p><b>UserSpaceOnUse</b><br/>
 * Если параметр является объектом acgraph.math.Rect (прямоугольной фигурой), то это режим  UserSpaceOnUse.
 * В данном режиме градиенту указываются собственные размеры и координаты. Фигуры, к которым этот градиент
 * применяется, закрашиваются частью градиента в которую они попадают (фигура с такими же размерами и
 * координатами как и градиент будет закращена всем градиентом полностью). Подробнее о этом режиме тут -
 * <a href='http://www.w3.org/TR/SVG/pservers.html#LinearGradientElementGradientUnitsAttribute'>
 * gradientUnits</a>. В этом режиме угол наклона вектора всегда сохраняется.</p>
 * @shortDescription Заливка линейным градиентом.
 * @illustration <t>simple</t>
 * stage.text(0*stage.width()/6+3, 0, 'a');
 * new anychart.elements.Background()
 *   .fill(['0.2 black', 'white'], 45)
 *   .bounds( new anychart.math.Rect(0*stage.width()/6+3, 13, stage.width()/7-6, stage.height()-20) )
 *   .container(stage).draw();
 * stage.text(1*stage.width()/6-5, 0, 'b');
 * new anychart.elements.Background()
 *   .fill(['0.2 black', 'white'], 45, true)
 *   .bounds( new anychart.math.Rect(1*stage.width()/6-5, 13, stage.width()/7-6, stage.height()-20) )
 *   .container(stage).draw();
 * stage.text(2*stage.width()/6+3, 0, 'c');
 * new anychart.elements.Background()
 *   .fill(['red', 'blue'], 45, {left: 10, top: 20, width: 100, height: 100})
 *   .bounds( new anychart.math.Rect(2*stage.width()/6+3, 13, stage.width()/7-6, stage.height()-20) )
 *   .container(stage).draw();
 * new anychart.elements.Background()
 *   .fill(['red', 'blue'], 45, new anychart.math.Rect(10, 20, 100, 100))
 *   .bounds( new anychart.math.Rect(3*stage.width()/6-5, 13, stage.width()/7-6, stage.height()-20) )
 *   .container(stage).draw();
 * stage.text(4*stage.width()/6+3, 0, 'd');
 * new anychart.elements.Background()
 *   .fill(['red 0.1', 'orange', 'red 0.1'])
 *   .bounds( new anychart.math.Rect(4*stage.width()/6+3, 13, stage.width()/7-6, stage.height()-20) )
 *   .container(stage).draw();
 * new anychart.elements.Background()
 *   .fill(['red', {offset: 0.3, color: 'orange'}, 'red 0.1'])
 *   .bounds( new anychart.math.Rect(5*stage.width()/6-5, 13, stage.width()/7-6, stage.height()-20) )
 *   .container(stage).draw();
 * @illustrationDesc
 *  a) ObjectBoundingBox без сохранением угла.<br/>
 *  b) ObjectBoundingBox с сохранением угла.<br/>
 *  c) UserSpaceOnUse.<br/>
 *  d) Трехстопные градиенты.<br/>
 * @param {!Array.<(acgraph.vector.GradientKey|string)>} keys Ключи градиента.
 * @param {number=} opt_angle Угол градиента относительно горизонтали в градусах.
 * @param {(boolean|!acgraph.vector.Rect|!{left:number,top:number,width:number,height:number})=} opt_mode Режим градиента.
 * @param {number=} opt_opacity Общая прозрачность градиента.
 * @return {!anychart.elements.Background} An instance of the {@link anychart.elements.Background} class for method chaining.
 *//**
 * Заливка радиальным градиентом.
 * @example <t>simple-h100</t>
 * var bg = new anychart.elements.Background();
 * // Устанавливаем fill
 *   bg.fill(['black', 'white'], .5, .5, null, .9, 0.3, 0.81)
 * bg.container(stage)
 *   .bounds( new anychart.math.Rect(10, 10, 90, 90) )
 *   .draw();
 * @param {!Array.<(acgraph.vector.GradientKey|string)>} keys Color-stop gradient keys.
 * @param {number} cx X ratio of center radial gradient.
 * @param {number} cy Y ratio of center radial gradient.
 * @param {acgraph.math.Rect=} opt_mode If defined then userSpaceOnUse mode else objectBoundingBox.
 * @param {number=} opt_opacity Opacity of the gradient.
 * @param {number=} opt_fx X ratio of focal point.
 * @param {number=} opt_fy Y ratio of focal point.
 * @return {!anychart.elements.Background} An instance of the {@link anychart.elements.Background} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {!(acgraph.vector.Fill|anychart.elements.Background)} .
 */
anychart.elements.Background.prototype.fill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var val = goog.array.slice(arguments, 0);
    if (!goog.array.equals(val, this.fill_)) {
      this.fill_ = val;
      this.invalidate(anychart.utils.ConsistencyState.APPEARANCE);
    }
    return this;
  } else {
    return this.fill_[0] || null;
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
 * new anychart.elements.Background()
 *   .bounds( new anychart.math.Rect(stage.width()/2-8, 5, 16, stage.height()-10) )
 *   .fill('none').container(stage).draw();
 * new anychart.elements.Background()
 *   .stroke('red')
 *   .bounds( new anychart.math.Rect(30, 0.4*stage.height()/4, stage.width()-60, stage.height()/4 - 30) )
 *   .fill('none').container(stage).draw();
 * new anychart.elements.Background()
 *   .stroke('4px ORANGE')
 *   .bounds( new anychart.math.Rect(30, 1.4*stage.height()/4, stage.width()-60, stage.height()/4 - 30) )
 *   .fill('none').container(stage).draw();
 * new anychart.elements.Background()
 *   .stroke('#0f0 0.7')
 *   .bounds( new anychart.math.Rect(30, 2.4*stage.height()/4, stage.width()-60, stage.height()/4 - 30) )
 *   .fill('none').container(stage).draw();
 * new anychart.elements.Background()
 *   .stroke('4 #0000FF 0.3')
 *   .bounds( new anychart.math.Rect(30, 3.4*stage.height()/4, stage.width()-60, stage.height()/4 - 35) )
 *   .fill('none').container(stage).draw();
 * @example <c>Настроки объектом или массивом</c><t>simple</t>
 * new anychart.elements.Background()
 *   .stroke({color: '#f00', thickness: 2, opacity: 0.9})
 *   .bounds( new anychart.math.Rect(30, 0.3*stage.height()/2, stage.width()-60, stage.height()/2 - 50) )
 *   .fill('none').container(stage).draw();
 * new anychart.elements.Background()
 *   .stroke(['red', 'green', 'blue'])
 *   .bounds( new anychart.math.Rect(30, 1.3*stage.height()/2, stage.width()-60, stage.height()/2 - 50) )
 *   .fill('none').container(stage).draw();
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)} value ['#000'] Стиль заливки в формате '[thickness ]color[ opacity]'.
 * @return {anychart.elements.Background} An instance of the {@link anychart.elements.Background} class for method chaining.
 *//**
 * Устанавливает настройки stroke в общем виде.<br/>
 * <b>Note:</b> When stroke properties are set both by complex stroke object properties and by stroke() method params,
 * object properties have more priority. E.g. setting <b>shape.stroke('10 red', 5);</b> (or <b>shape.stroke({color: 'red',
 * thickness: 10}, 5);</b> will result a red stroke with thickness 10px.
 * @shortDescription Устанавливает настройки stroke в общем виде.
 * @example <t>simple</t>
 * new anychart.elements.Background()
 *   .stroke('red .5', 4)
 *   .bounds( new anychart.math.Rect(30, 0.4*stage.height()/4, stage.width()-60, stage.height()/4 - 30) )
 *   .fill('none').container(stage).draw();
 * new anychart.elements.Background()
 *   .stroke('5 orange .5', 1)
 *   .bounds( new anychart.math.Rect(30, 1.2*stage.height()/4, stage.width()-60, 0.6*stage.height()/4) )
 *   .fill('none').container(stage).draw();
 * new anychart.elements.Background()
 *   .stroke(['red', 'green', 'blue'], 5, '5 2')
 *   .bounds( new anychart.math.Rect(30, 2.2*stage.height()/4, stage.width()-60, 0.6*stage.height()/4) )
 *   .fill('none').container(stage).draw();
 * new anychart.elements.Background()
 *   .stroke({color: '#00B'}, 10, '', acgraph.vector.StrokeLineJoin.ROUND, acgraph.vector.StrokeLineCap.SQUARE)
 *   .bounds( new anychart.math.Rect(30, 3.2*stage.height()/4, stage.width()-60, 0.6*stage.height()/4 -5) )
 *   .fill('none').container(stage).draw();
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string)} value Стиль заливки, как описан выше.
 * @param {number=} opt_thickness Толщина линии. Если не передано, будет установлено в 1.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths. Dash array contains a
 * list of white space separated lengths and percentages that specify the lengths of alternating dashes and gaps. If an
 * odd number of values is provided, then the list of values is repeated to yield an even number of values. Thus, stroke
 * dashpattern: '5 3 2' is equivalent to dashpattern: '5 3 2 5 3 2'.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Стиль (форма) соединения меду двумя линиями.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Style of line cap.
 * @return {anychart.elements.Background} An instance of the {@link anychart.elements.Background} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)=} opt_strokeOrFill .
 * @param {number=} opt_thickness .
 * @param {string=} opt_dashpattern .
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin .
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap .
 * @return {(!anychart.elements.Background|acgraph.vector.Stroke)} .
 */
anychart.elements.Background.prototype.stroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var val = goog.array.slice(arguments, 0);
    if (!goog.array.equals(val, this.stroke_)) {
      this.stroke_ = val;
      this.invalidate(anychart.utils.ConsistencyState.APPEARANCE);
    }
    return this;
  } else {
    return this.stroke_[0] || null;
  }
};


/**
 * Render background.
 * @return {!anychart.elements.Background} Экземпляр класса {@link anychart.elements.Background} для цепочного вызова.
 */
anychart.elements.Background.prototype.draw = function() {
  // we don't have a ConsistencyState for this, because it would be redundant.
  if (!this.rect_) {
    this.rect_ = acgraph.rect();
    this.registerDisposable(this.rect_);
  }
  if (this.isConsistent())
    return this;
  var stage = this.rect_.getStage();
  var manualSuspend = stage && !stage.isSuspended();
  if (manualSuspend) stage.suspend();

  if (this.hasInvalidationState(anychart.utils.ConsistencyState.PIXEL_BOUNDS)) {
    var bounds = this.pixelBounds().clone();
    var thicknessHalf = this.rect_.strokeThickness() / 2;
    //TODO(Anton Saukh): remove this fix when graphics is fixed.
    if (isNaN(thicknessHalf)) thicknessHalf = .5;
    bounds.left += thicknessHalf;
    bounds.top += thicknessHalf;
    bounds.width -= thicknessHalf + thicknessHalf;
    bounds.height -= thicknessHalf + thicknessHalf;
    this.rect_.setBounds(bounds);
    this.markConsistent(anychart.utils.ConsistencyState.PIXEL_BOUNDS);
  }

  if (this.hasInvalidationState(anychart.utils.ConsistencyState.APPEARANCE)) {
    this.rect_.fill.apply(this.rect_, this.fill_);
    this.fill_ = [this.rect_.fill()];
    this.rect_.stroke.apply(this.rect_, this.stroke_);
    this.stroke_ = [this.rect_.stroke()];
    switch (this.cornerType_) {
      case anychart.elements.Background.CornerType.ROUND:
        this.rect_.round.apply(this.rect_, this.corners_);
        break;
      case anychart.elements.Background.CornerType.CUT:
        this.rect_.cut.apply(this.rect_, this.corners_);
        break;
      case anychart.elements.Background.CornerType.ROUND_INNER:
        this.rect_.roundInner.apply(this.rect_, this.corners_);
        break;
      default:
        this.rect_.cut(0);
        break;
    }
    this.markConsistent(anychart.utils.ConsistencyState.APPEARANCE);
  }


  if (this.hasInvalidationState(anychart.utils.ConsistencyState.CONTAINER)) {
    this.rect_.parent(/** @type {acgraph.vector.ILayer} */(this.container()));
    this.markConsistent(anychart.utils.ConsistencyState.CONTAINER);
  }

  if (manualSuspend) stage.resume();

  return this;
};


/**
 * Copies fill, stroke and corner settings from the passed background to itself.
 * @param {anychart.elements.Background} background Background to copy settings from.
 * @return {!anychart.elements.Background} Returns itself for chaining.
 */
anychart.elements.Background.prototype.cloneFrom = function(background) {
  if (goog.isDefAndNotNull(background)) {
    this.fill.apply(this, background.fill_);
    this.stroke.apply(this, background.stroke_);
    this.corners.apply(this, background.corners_);
    this.cornerType(background.cornerType_);
  } else {
    this.fill(null).stroke(null).corners(0);
  }
  return this;
};

