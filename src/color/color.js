goog.provide('anychart.color');
goog.require('goog.color');
goog.require('goog.math');
goog.require('goog.string');



/**
 * Color utilities namespace.
 * @namespace
 * @name anychart.color
 */


/**
 * Blend two colors together, using the specified factor to indicate the weight given to the first color.
 * @example <t>stageOnly</t>
 * var color1 = [255, 0, 0];
 * var color2 = [0, 0, 255];
 * stage.rect(10, 10, stage.width() / 4, stage.height() - 20).fill('red');
 * stage.rect(3 * stage.width() / 4 - 10, 10, stage.width() / 4, stage.height() - 20).fill('blue');
 * var mixColor1 = anychart.color.blend(color1, color2, 0.2);
 * var mixColor2 = anychart.color.blend(color1, color2, 0.8);
 * stage.rect(stage.width() / 3 + 10, 10, stage.width() / 4, stage.height() / 2 - 10)
 *     .fill('rgb('+mixColor1.join(',')+')');
 * stage.rect(stage.width() / 3 + 10, stage.height() / 2 + 10, stage.width() / 4, stage.height() / 2 - 20)
 *     .fill('rgb('+mixColor2.join(',')+')');
 * @param {goog.color.Rgb} rgb1 The first color represented as RGB array of 3 numbers.
 * @param {goog.color.Rgb} rgb2 The second color represented as RGB array of 3 numbers.
 * @param {number} factor The weight of the first color over the second one rgb2. Values
 *     should be in the [0, 1] range. If set to a value less than 0, factor will be set to 0.
 *     If greater than 1, factor will be set to 1.
 * @return {!goog.color.Rgb} Combined color represented as RGB array.
 */
anychart.color.blend = function(rgb1, rgb2, factor) {
  return goog.color.blend(rgb1, rgb2, factor);
};


/**
 * Trying to convert given acgraph.vector.Fill or acgraph.vector.Stroke to its hex representation if can
 * @param {(acgraph.vector.Fill|acgraph.vector.Stroke)} fillOrStroke Fill or stroke to convert.
 * @return {(string|null)} Hex representation or null if can not be represented.
 * @private
 */
anychart.color.fillOrStrokeToHex_ = function(fillOrStroke) {
  // Если передается сложный объект, то мы должны спросить у него поле color, а иначе
  // это будут градиенты, имадж заливки - что нам не надо
  if (goog.isObject(fillOrStroke)) {
    // если есть color в объекте - наш случай, забираем и парсим
    if (fillOrStroke.color) {
      fillOrStroke = fillOrStroke.color;
    } else {
      // иначе(градиенты и тд) говорим что не смогли распарсить
      return null;
    }
  }
  // строка либо из поля color, либо цвет, либо hex-like цвет, либо 'none'
  if (goog.isString(fillOrStroke)) {
    // нужно потому как гуг выкидывает эррор
    try {
      // здесь распарсится любые строки вида
      // rgb(xxx,xxx,xxx), #xxxxxx, #xxx, color_name
      var parsedColorObject = goog.color.parse(fillOrStroke);
      return parsedColorObject.hex;
    } catch (e) {
      // если не получилось распарсить и был выкинут error значит эта строка 'none'
      // ретёрним null - как сигнал что не получилось распарсить
      return null;
    }
  }
  // если ничего из вышеперечисленного - то непонятно и отдаем null
  return null;
};


/**
 * Makes color lighter by a factor.
 * @example <t>stageOnly</t>
 * stage.rect(10, 10, stage.width() / 3 - 10, stage.height() - 20)
 *      .fill('red');
 * stage.rect(stage.width() / 3 + 10, 10, stage.width() / 3 - 20, stage.height() - 20)
 *      .fill( anychart.color.lighten('red'));
 * stage.rect(2*stage.width() / 3 + 10, 10, stage.width() / 3 - 30, stage.height() - 20)
 *      .fill( anychart.color.lighten('red', .8));
 * @param {(acgraph.vector.Fill|acgraph.vector.Stroke)} fillOrStroke Fill or stroke to be lightened.
 * @param {number=} opt_factor [0.3] White color blending factor.
 * @return {(string|acgraph.vector.Fill|acgraph.vector.Stroke)} Hex representation of the lightened color, or Color if color can not be lighten.
 */
anychart.color.lighten = function(fillOrStroke, opt_factor) {
  var hex;
  // if null is returned then we can't get a hex representation and return the initial color
  if (goog.isNull(hex = anychart.color.fillOrStrokeToHex_(fillOrStroke))) return fillOrStroke;

  // convert hex-color to goog.color.Rgb (RGB array that can be used by goog.color.lighten)
  var rgb = goog.color.hexToRgb(/** @type {string} */ (hex));
  if (!goog.isDefAndNotNull(opt_factor)) {
    opt_factor = 0.3;
  }
  return goog.color.rgbArrayToHex(goog.color.lighten(rgb, +opt_factor));
};


/**
 * Makes color darker by a factor.
 * @example <t>stageOnly</t>
 * stage.rect(10, 10, stage.width() / 3 - 10, stage.height() - 20)
 *      .fill('red');
 * stage.rect(stage.width() / 3 + 10, 10, stage.width() / 3 - 20, stage.height() - 20)
 *      .fill( anychart.color.darken('red'));
 * stage.rect(2*stage.width() / 3 + 10, 10, stage.width() / 3 - 30, stage.height() - 20)
 *      .fill( anychart.color.darken('red', .8));
 * @param {(acgraph.vector.Fill|acgraph.vector.Stroke)} fillOrStroke Fill or stroke to be darkened.
 * @param {number=} opt_factor [0.3] Black color blending factor.
 * @return {(string|acgraph.vector.Fill|acgraph.vector.Stroke)} Hex representation of the darkened color, or Color if color can't be darkened.
 */
anychart.color.darken = function(fillOrStroke, opt_factor) {
  var hex;
  // if null is returned then we can't get a hex representation and return the initial color
  if (goog.isNull(hex = anychart.color.fillOrStrokeToHex_(fillOrStroke))) return fillOrStroke;

  // convert hex-color to goog.color.Rgb (RGB array that can be used by goog.color.darken)
  var rgb = goog.color.hexToRgb(/** @type {string} */ (hex));
  if (!goog.isDefAndNotNull(opt_factor)) {
    opt_factor = 0.3;
  }
  return goog.color.rgbArrayToHex(goog.color.darken(rgb, +opt_factor));
};


/**
 * See fill() method for params description.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {!acgraph.vector.Fill} .
 */
anychart.color.normalizeFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  /** @type {acgraph.vector.Fill} */
  var newFill;
  /** @type {number} */
  var opacity;
  /** @type {!Array.<(acgraph.vector.GradientKey|string)>} */
  var keys;
  /** @type {acgraph.vector.GradientKey} */
  var key;
  /** @type {number} */
  var i;

  if (goog.isNull(opt_fillOrColorOrKeys)) { // Если первый параметр null, то считаем что это обнуление фила
    newFill = 'none';
  } else if (goog.isString(opt_fillOrColorOrKeys)) { // Разбираем вариант function(color, opt_opacity);
    newFill = anychart.color.parseColor_(opt_fillOrColorOrKeys, false);
    if (goog.isString(newFill) && goog.isDef(opt_opacityOrAngleOrCx)) { // Если передан простой цвет и задана прозрачность, e.g. fill('red', 0.5)
      opacity = parseFloat(opt_opacityOrAngleOrCx);
      newFill = {
        'color': opt_fillOrColorOrKeys,
        'opacity': isNaN(opacity) ? 1 : goog.math.clamp(opacity, 0, 1)
      };
    }
  } else if (goog.isArray(opt_fillOrColorOrKeys)) { // создается градиент (либо линейный, либо радиальный)
    keys = goog.array.slice(opt_fillOrColorOrKeys, 0);
    for (i = keys.length; i--;) { // перебираем ключи и нормализуем их на случай, если они заданы в виде простого цвета
      key = keys[i];
      if (goog.isString(key)) // ключ задан как простая строка - надо нормализовать
        key = anychart.color.parseKey_(key);
      if (isNaN(key['offset'])) // проверяет сразу все случаи невалидного смещения, включая неуказание
        key['offset'] = i / (keys.length - 1);
      keys[i] = /** @type {acgraph.vector.GradientKey} */(key);
    }
    if (goog.isNumber(opt_opacityOrAngleOrCx) && !isNaN(opt_opacityOrAngleOrCx) &&
        goog.isNumber(opt_modeOrCy) && !isNaN(opt_modeOrCy)) { // это радиальный градиент
      var cx = opt_opacityOrAngleOrCx || 0;
      var cy = opt_modeOrCy || 0;
      newFill = {
        'keys': keys,
        'cx': cx,
        'cy': cy,
        'mode': anychart.color.normalizeGradientMode_(opt_opacityOrMode), // Может принимать только прямоугольник
        'fx': isNaN(opt_fx) ? cx : +opt_fx,
        'fy': isNaN(opt_fy) ? cy : +opt_fy,
        'opacity': goog.math.clamp(goog.isDef(opt_opacity) ? opt_opacity : 1, 0, 1)
      };
    } else { // это линейный градиент
      newFill = {
        'keys': keys,
        'angle': (+opt_opacityOrAngleOrCx) || 0,
        'mode': anychart.color.normalizeGradientMode_(opt_modeOrCy) || !!opt_modeOrCy, // Может также принимать и boolean
        'opacity': goog.math.clamp(!isNaN(+opt_opacityOrMode) ? +opt_opacityOrMode : 1, 0, 1)
      };
    }
  } else if (goog.isObject(opt_fillOrColorOrKeys)) { // заливка задается готовым объектом
    if (opt_fillOrColorOrKeys instanceof acgraph.vector.PatternFill) {
      newFill = opt_fillOrColorOrKeys;
    } else if ('keys' in opt_fillOrColorOrKeys) { // gradient
      keys = goog.array.slice(opt_fillOrColorOrKeys['keys'], 0);
      for (i = keys.length; i--;) { // перебираем ключи и нормализуем их на случай, если они заданы в виде простого цвета
        key = keys[i];
        var newKey;
        if (goog.isString(key)) // ключ задан как простая строка - надо нормализовать
          newKey = anychart.color.parseKey_(key);
        else { // иначе копируем объект как можем
          newKey = {
            'offset': key['offset'],
            'color': goog.isString(key['color']) ? key['color'] : 'black'
          };
          if (!isNaN(key['opacity']))
            newKey['opacity'] = goog.math.clamp(key['opacity'], 0, 1);
        }
        if (isNaN(newKey['offset'])) // проверяет сразу все случаи невалидного смещения, включая неуказание
          newKey['offset'] = i / (keys.length - 1);
        keys[i] = /** @type {acgraph.vector.GradientKey} */(newKey);
      }
      opacity = goog.math.clamp(goog.isDef(opt_fillOrColorOrKeys['opacity']) ? opt_fillOrColorOrKeys['opacity'] : 1, 0, 1);
      var mode = anychart.color.normalizeGradientMode_(opt_fillOrColorOrKeys['mode']);
      cx = opt_fillOrColorOrKeys['cx'];
      cy = opt_fillOrColorOrKeys['cy'];
      if (goog.isNumber(cx) && !isNaN(cx) && goog.isNumber(cy) && !isNaN(cy)) { // treat as radial gradient
        newFill = {
          'keys': keys,
          'cx': +cx,
          'cy': +cy,
          'mode': mode, // Может принимать только прямоугольник
          'fx': isNaN(opt_fillOrColorOrKeys['fx']) ? +opt_fillOrColorOrKeys['cx'] : +opt_fillOrColorOrKeys['fx'],
          'fy': isNaN(opt_fillOrColorOrKeys['fy']) ? +opt_fillOrColorOrKeys['cy'] : +opt_fillOrColorOrKeys['fy'],
          'opacity': opacity
        };
      } else {
        newFill = {
          'keys': keys,
          'angle': +opt_fillOrColorOrKeys['angle'] || 0,
          'mode': mode || !!opt_fillOrColorOrKeys['mode'], // Может также принимать и boolean
          'opacity': opacity
        };
      }
    } else if ('src' in opt_fillOrColorOrKeys) {
      newFill = {
        'src': opt_fillOrColorOrKeys['src'],
        'mode': goog.isDef(opt_fillOrColorOrKeys['mode']) ? opt_fillOrColorOrKeys['mode'] : acgraph.vector.ImageFillMode.STRETCH
      };
    } else {
      var color = goog.isString(opt_fillOrColorOrKeys['color']) ? opt_fillOrColorOrKeys['color'] : 'black';
      if (isNaN(opt_fillOrColorOrKeys['opacity']))
        newFill = color;
      else
        newFill = {
          'color': color,
          'opacity': goog.math.clamp(opt_fillOrColorOrKeys['opacity'], 0, 1)
        };
    }
  }
  return newFill;
};


/**
 * Look at stroke() method for params.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)=} opt_strokeOrFill Настройки заливки границ примитива,
 *    если используется как сеттер.
 * @param {number=} opt_thickness Толщина линии. Если не передано, будет установлено в 1.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 *    Dash array contains a list of comma and/or white space separated lengths and percentages that specify the
 *    lengths of alternating dashes and gaps. If an odd number of values is provided, then the list of values is
 *    repeated to yield an even number of values. Thus, stroke dashpattern: 5,3,2 is equivalent to dashpattern: 5,3,2,5,3,2.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Стиль (форма) соединения меду двумя линиями.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Style of line cap.
 * @return {acgraph.vector.Stroke} .
 */
anychart.color.normalizeStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  var tmp;
  /** @type {acgraph.vector.Stroke} */
  var newStroke;
  if (goog.isNull(opt_strokeOrFill)) { // Если строук задан как null, тогда дальше парсить нечего
    newStroke = 'none';
  } else {
    if (goog.isString(opt_strokeOrFill)) { // если это строка, то может начинаться с толщины ('1 red 0.2')
      tmp = goog.string.splitLimit(opt_strokeOrFill, ' ', 1);
      var tmpThickness = parseFloat(tmp[0]);
      if (!isNaN(tmpThickness)) { // если строка и правда начинается с толщины, то у нее больший приоритет, чем у opt_thickness
        opt_strokeOrFill = tmp[1];
        opt_thickness = tmpThickness;
      }
    }
    var setAsComplexStroke = goog.isObject(opt_strokeOrFill);
    var thickness = parseFloat(
        (setAsComplexStroke && ('thickness' in opt_strokeOrFill)) ?
            opt_strokeOrFill['thickness'] :
            opt_thickness);
    if (thickness == 0) // Если задана каким-либо способом толщина и она равна нулю
      return 'none';

    var hasDash = setAsComplexStroke && ('dash' in opt_strokeOrFill);
    var hasJoin = setAsComplexStroke && ('lineJoin' in opt_strokeOrFill);
    var hasCap = setAsComplexStroke && ('lineCap' in opt_strokeOrFill);

    // Получаем нормализованный филл по всем правилам.
    tmp = anychart.color.normalizeFill(/** @type {(acgraph.vector.Fill|string|null)} */(opt_strokeOrFill));
    // К сожалению, мы не поддерживаем Pattern заливку для строуков :D
    // Тайпкаст тут, на самом деле, должен быть двойной, через ColoredFill. Но это многобукоф чистой метадаты, поэтому
    // сделано так.
    newStroke = (tmp instanceof acgraph.vector.PatternFill) ? 'black' : /** @type {acgraph.vector.Stroke} */(tmp);

    // Если ничего из этого нету, то можно смело использовать просто нормализованный филл в качестве строука,
    // он совместим. Иначе приходится дописывать в него свойства.
    if (!isNaN(thickness) || hasDash || hasJoin || hasCap ||
        goog.isDef(opt_dashpattern) || goog.isDef(opt_lineJoin) || goog.isDef(opt_lineCap)) {
      if (goog.isString(newStroke)) // Если же есть, а цвет задан строкой, то надо ее апгрейднуть до объекта
        newStroke = /** @type {acgraph.vector.Stroke} */({
          'color': newStroke
        });
      if (!isNaN(thickness))
        newStroke['thickness'] = thickness;
      if (hasDash)
        newStroke['dash'] = opt_strokeOrFill['dash'] || 'none';
      else if (goog.isDefAndNotNull(opt_dashpattern))
        newStroke['dash'] = opt_dashpattern || 'none';
      if (hasJoin)
        newStroke['lineJoin'] = opt_strokeOrFill['lineJoin'] || 'none';
      else if (goog.isDefAndNotNull(opt_lineJoin))
        newStroke['lineJoin'] = opt_lineJoin || 'none';
      if (hasCap)
        newStroke['lineCap'] = opt_strokeOrFill['lineCap'] || 'none';
      else if (goog.isDefAndNotNull(opt_lineCap))
        newStroke['lineCap'] = opt_lineCap || 'none';
    }
  }
  return newStroke;
};


/**
 * Приводит режим к прямоугольнику. Если не может (например это null или boolean), возвращает null.
 * @param {null|number|boolean|acgraph.math.Rect|{left:number,top:number,width:number,height:number}|undefined} mode Режим
 *    градиента, который нужно нормализовать.
 * @return {acgraph.math.Rect} Нормализованный прямоугольник градиента (лишних объектов не создается).
 * @private
 */
anychart.color.normalizeGradientMode_ = function(mode) {
  if (goog.isDefAndNotNull(mode)) { // задан mode
    if (mode instanceof acgraph.math.Rect)
      return mode;
    else if (goog.isObject(mode) && !isNaN(mode['left']) && !isNaN(mode['top']) && !isNaN(mode['width']) && !isNaN(mode['height']))
      return new acgraph.math.Rect(mode['left'], mode['top'], mode['width'], mode['height']);
  }
  return null;
};


/**
 * @param {string} color Цвет в форме 'red' или 'red 0.5'.
 * @param {boolean} forceObject Нужно ли всегда отдавать объект вида acgraph.vector.SolidFill или возвращать строку
 *    в случае простого цвета.
 * @return {string|acgraph.vector.SolidFill} Нормализованный цвет.
 * @private
 */
anychart.color.parseColor_ = function(color, forceObject) {
  // TODO (Anton Saukh): возможно дописать сюда trim и переделать на регэкспы
  /** @type {Array.<string>} */
  var tmp = color.split(' ', 2);
  /** @type {number} */
  var opacity;
  var result;
  if (tmp.length > 1) { // случай, когда color - это сложный цвет с прозрачностью, e.g. 'red 0.5'
    opacity = parseFloat(tmp[1]);
    result = {
      'color': tmp[0] // здесь всегда будет чистое первое слово из переданного fill
    };
    if (!isNaN(opacity))
      result['opacity'] = goog.math.clamp(opacity, 0, 1);
  } else if (forceObject) { // надо привести к виду объекта даже в случае простого цвета (например, для ключа градиента)
    result = {
      'color': color
    };
  } else { // простой цвет
    result = color;
  }
  return result;
};


/**
 * @param {string} key Ключ в форме '[offset ]color[ opacity]': 'red', 'red 0.5', '0.5 red' или '0.5 red 0.5'.
 * @return {acgraph.vector.GradientKey} Нормализованный ключ.
 * @private
 */
anychart.color.parseKey_ = function(key) {
  var tmp = goog.string.splitLimit(key, ' ', 1);
  var color;
  var offset = NaN;
  if (tmp.length > 1) {
    offset = parseFloat(tmp[0]);
    color = isNaN(offset) ? key : tmp[1];
  } else
    color = key;
  var result = anychart.color.parseColor_(color, true);
  if (!isNaN(offset))
    result['offset'] = goog.math.clamp(offset, 0, 1);
  return /** @type {acgraph.vector.GradientKey} */(result);
};
