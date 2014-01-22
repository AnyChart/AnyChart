goog.provide('anychart.elements.Background');

goog.require('anychart.elements.BaseWithBounds');
goog.require('goog.array');



/**
 * @param {anychart.elements.Background.CornerType=} opt_type Type of the background corners.
 * @param {...(number|string)} var_args Набор радиусов. Может быть задан одним числом - радиус для всех углов, 4-рми
 * числами - радиусы для каждого угла, строкой, в которой может быть через пробел указано 4 радиуса для каждого угла
 * соответственно, либо один радиус - радиус для всех углов. Если радиус - 0, то усечения у угла не будет.
 * @extends {anychart.elements.BaseWithBounds}
 * @constructor
 */
anychart.elements.Background = function(opt_type, var_args) {
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
  this.cornerType_ = opt_type || anychart.elements.Background.CornerType.ROUND;

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
  NONE: 'none',
  ROUND: 'round',
  CUT: 'cut',
  ROUND_INNER: 'roundInner'
};


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.elements.Background.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.elements.BaseWithBounds.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.utils.ConsistencyState.APPEARANCE;


/**
 * Устанавливает радиусы скривления углов различными способами.
 * @param {(number|string|Array.<number|string>)=} opt_value Набор радиусов. Может быть задан одним числом - радиус для всех углов, 4-рми
 * числами - радиусы для каждого угла, строкой, в которой может быть через пробел указано 4 радиуса для каждого угла
 * соответственно, либо один радиус - радиус для всех углов. Если радиус - 0, то усечения у угла не будет.
 * @return {(number|string|Array.<number|string>|!anychart.elements.Background)} Текущая настройка углов.
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
 * Setter/getter for corner type
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
 Getter.
 Пример: var fill = rect.fill();
 @return {!acgraph.vector.Fill} Текущая заливка (пустая заливка это всегда 'none').
 *//**
 Сеттер сложной заливки. Либо объекты типов acgraph.vector.LinearGradientFill, acgraph.vector.RadialGradientFill,
 acgraph.vector.Fill, либо цвет в виде строки. Причем одной строкой можно задать и прозрачность
 (в виде 'color opacity', например 'red .5').
 Примеры:
 rect.fill('red 0.5'); // если потом спросить rect.fill(), то вернется {color: 'red', opacity: 0.5}
 rect.fill('#ff0000 0.5'); // если потом спросить rect.fill(), то вернется {color: '#ff0000', opacity: 0.5}
 rect.fill({color: 'red', opacity: 0.5});
 rect.fill({keys:['red', 'green'], mode: true, angle: 45});
 @param {acgraph.vector.Fill} value Заливка в виде одного сложного объекта или строки.
 @return {!acgraph.vector.Shape} Self for chaining.
 *//**
 Заливка в виде цвета строкой и прозрачности. Если задан сложный цвет, например 'red .5', то он имеет больший
 приоритет, чем opt_opacity, т.е. в случае rect.fill('red 0.3', 0.7), прозрачность заливки будет 0.3.
 Пример:
 rect.fill('red', 0.5);
 rect.fill('#ff0000', 0.5);
 @param {string} color Цвет заливки в виде строки.
 @param {number=} opt_opacity Прозрачность заливки.
 @return {!acgraph.vector.Shape} Self for chaining.
 *//**
 Заливка линейным градиентом. Есть три режима работы:
 ObjectBoundingBox с сохранением угла, ObjectBoundingBox без сохранения угла и UserSpaceOnUse.
 <h4>Режимы:</h4>
 <b>ObjectBoundingBox с сохранением угла</b>
 Если передан параметр типа boolean, то он отвечает за поведение градиента относительно фигуры, в которую он
 вписывается, а точнее, определяет поведение угла наклона линии градиента. Если true - то это режим ObjectBoundingBox
 с сохранением угла. То есть в любой фигуре угол наклона градиента визуально будет соответствовать заданному.
 P.S. По умолчанию, вектор градиента, рассчитанный для заданного угла в фигуре с соотношением не 1:1, не будет в итоге
 визуально располагаться под этим углом. Браузер трансформирует угол в пропорции соотношения сторон. Поэтому
 сделан алгоритм, который приводит в соответствие конечный угол к заданному в любой фигуре.
 <b>ObjectBoundingBox без сохранения угла</b>
 Если параметр имеет значение false - это режим ObjectBoundingBox без сохранения угла. В этом случае будет применено
 поведение по умолчанию - вектор градиента будет расчитан под заданным углом, но в фигуре с соотношением сторон
 не 1:1 он будет измнен браузером (сжат пропорционально соотношению сторон) и визуально угол наклона вектора
 градиента не будет соответствовать заданному.
 <b>UserSpaceOnUse</b>
 Если параметр является объектом acgraph.math.Rect (прямоугольной фигурой), то это режим  UserSpaceOnUse.
 В данном режиме градиенту указываются собственные размеры и координаты. Фигуры, к которым этот градиент
 применяется, закрашиваются частью градиента в которую они попадают (фигура с такими же размерами и
 координатами как и градиент будет закращена всем градиентом полностью). Подробнее о этом режиме тут -
 <a href='http://www.w3.org/TR/SVG/pservers.html#LinearGradientElementGradientUnitsAttribute'>
 gradientUnits</a>. В этом режиме угол наклона вектора всегда сохраняется.
 Примеры:
 rect.fill(['red', 'green']);
 rect.fill(['red', 'green'], 45, true);
 rect.fill(['red', 'green'], 45, {left: 10, top: 10, width: 100, height: 100});
 rect.fill(['red', 'green'], 45, new acgraph.math.Rect(10, 10, 100, 100));
 rect.fill(['red 0.1', 'green', 'blue 0.1']);
 rect.fill(['red', {offset: 0.3, color: 'green', opacity: 0.55}, 'blue 0.1']);
 rect.fill(['red', {offset: 0.3, color: 'green'}, 'blue 0.1']);
 @param {!Array.<(acgraph.vector.GradientKey|string)>} keys Ключи градиента.
 @param {number=} opt_angle Угол градиента относительно горизонтали в градусах.
 @param {(boolean|!acgraph.vector.Rect|!{left:number,top:number,width:number,height:number})=} opt_mode Режим градиента.
 @param {number=} opt_opacity Общая прозрачность градиента.
 @return {!acgraph.vector.Shape} Self for chaining.
 *//**
 Radial gradient.
 @param {!Array.<(acgraph.vector.GradientKey|string)>} keys Color-stop gradient keys.
 @param {number} cx X ratio of center radial gradient.
 @param {number} cy Y ratio of center radial gradient.
 @param {acgraph.math.Rect=} opt_mode If defined then userSpaceOnUse mode else objectBoundingBox.
 @param {number=} opt_opacity Opacity of the gradient.
 @param {number=} opt_fx X ratio of focal point.
 @param {number=} opt_fy Y ratio of focal point.
 @return {!acgraph.vector.Shape} Self for chaining.
 *//**
 * @ignoreDoc
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {(!acgraph.vector.Fill|!anychart.elements.Background)} .
 */
anychart.elements.Background.prototype.fill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy,
    opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
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
 Getter
 @return {acgraph.vector.Stroke} .
 *//**
 Setter.
 First param can be set as follows:
 1) As a string of the format '[thickness ]color[ opacity]':
 a) 'color' - as a simple color, e.g. 'red'
 b) 'thickness color' - like a css border, e.g. '3 red' or '3px red'
 c) 'color opacity' - as a fill string, e.g. 'red 0.5'
 d) 'thickness color opacity' - as a complex string, e.g. '3px #00ff00 0.5'
 Note, that string parts order is significant and '3px red' is not the same as 'red 3px'.
 2) As an array of (acgraph.vector.GradientKey|string) - it will be treated as a linear gradient line.
 3) As an object of acgraph.vector.Stroke format.
 Attention: when stroke properties are set both by complex stroke object properties and by stroke() method params,
 object properties have more priority. E.g. setting
 shape.stroke('10 red', 5);
 as well as
 shape.stroke({color: 'red', thickness: 10}, 5);
 will result a red stroke with thickness 10px.
 @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)} value Стиль заливки.
 @param {number=} opt_thickness Толщина линии. Если не передано, будет установлено в 1.
 @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 Dash array contains a list of white space separated lengths and percentages that specify the
 lengths of alternating dashes and gaps. If an odd number of values is provided, then the list of values is
 repeated to yield an even number of values. Thus, stroke dashpattern: '5 3 2' is equivalent to dashpattern: '5 3 2 5 3 2'.
 @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Стиль (форма) соединения меду двумя линиями.
 @param {acgraph.vector.StrokeLineCap=} opt_lineCap Style of line cap.
 @return {acgraph.vector.Shape} Self.
 *//**
 * @ignoreDoc
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)=} opt_strokeOrFill Настройки заливки границ примитива,
 *    если используется как сеттер.
 * @param {number=} opt_thickness Толщина линии. Если не передано, будет установлено в 1.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 *    Dash array contains a list of comma and/or white space separated lengths and percentages that specify the
 *    lengths of alternating dashes and gaps. If an odd number of values is provided, then the list of values is
 *    repeated to yield an even number of values. Thus, stroke dashpattern: '5 3 2' is equivalent to dashpattern: '5 3 2 5 3 2'.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Стиль (форма) соединения меду двумя линиями.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Style of line cap.
 * @return {(!anychart.elements.Background|!acgraph.vector.Stroke)}
 *    Если используется как сеттер, то возвращает себя, для реализации цепного вызовы.
 *    Если используется как геттер, то возвращает текущую настройку линии.
 */
anychart.elements.Background.prototype.stroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin,
    opt_lineCap) {
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
 * Draws or updates the background.
 * @return {!anychart.elements.Background} Returns itself for chaining.
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

