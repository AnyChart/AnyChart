goog.provide('anychart.utils');
goog.provide('anychart.utils.Align');

/**
 @namespace
 @name anychart.utils
 */
//----------------------------------------------------------------------------------------------------------------------
//
//  Align.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Align enumeration.
 * @enum {string}
 */
anychart.utils.Align = {
  CENTER: 'center',
  LEFT: 'left',
  RIGHT: 'right',
  TOP: 'top',
  BOTTOM: 'bottom'
};


/**
 * Normalizes user input align to its enumeration values. Also accepts 'middle' and null. Defaults to opt_default or
 * 'center'.
 *
 * @param {string} align Align to normalize.
 * @param {anychart.utils.Align=} opt_default Align to normalize.
 * @return {anychart.utils.Align} Normalized align.
 */
anychart.utils.normalizeAlign = function(align, opt_default) {
  if (goog.isString(align)) {
    align = align.toLowerCase();
    if (align == 'middle') return anychart.utils.Align.CENTER;
    for (var i in anychart.utils.Align) {
      if (align == anychart.utils.Align[i])
        return anychart.utils.Align[i];
    }
  }
  return opt_default || anychart.utils.Align.CENTER;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Orientation.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Orientation enumeration.
 * @enum {string}
 */
anychart.utils.Orientation = {
  LEFT: 'left',
  RIGHT: 'right',
  TOP: 'top',
  BOTTOM: 'bottom'
};


/**
 * Normalizes user input orientation to its enumeration values. Also accepts null. Defaults to opt_default or 'top'.
 *
 * @param {string} orientation Orientation to normalize.
 * @param {anychart.utils.Orientation=} opt_default Orientation to normalize.
 * @return {anychart.utils.Orientation} Normalized orientation.
 */
anychart.utils.normalizeOrientation = function(orientation, opt_default) {
  if (goog.isString(orientation)) {
    orientation = orientation.toLowerCase();
    for (var i in anychart.utils.Orientation) {
      if (orientation == anychart.utils.Orientation[i])
        return anychart.utils.Orientation[i];
    }
  }
  return opt_default || anychart.utils.Orientation.TOP;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Nine position.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Nine positions enumeration.
 * @enum {string}
 */
anychart.utils.NinePositions = {
  LEFT_TOP: 'lefttop',
  TOP: 'top',
  RIGHT_TOP: 'righttop',
  LEFT_CENTER: 'leftcenter',
  CENTER: 'center',
  RIGHT_CENTER: 'rightcenter',
  LEFT_BOTTOM: 'leftbottom',
  BOTTOM: 'bottom',
  RIGHT_BOTTOM: 'rightbottom'
};


/**
 * Normalizes user input to NinePositions enumeration values.  Defaults to opt_default or 'center'.
 *
 * @param {*} position One of nine positions to normalize.
 * @param {anychart.utils.NinePositions=} opt_default Default position value.
 * @return {anychart.utils.NinePositions} Normalized position.
 */
anychart.utils.normalizeNinePositions = function(position, opt_default) {
  if (goog.isString(position)) {
    position = position.toLowerCase();
    if (goog.object.contains(anychart.utils.NinePositions, position))
      return /** @type {anychart.utils.NinePositions} */(position);
  }
  return goog.isDef(opt_default) ? opt_default : anychart.utils.NinePositions.CENTER;
};


/**
 * Like normalizeNinePositions method but allow to return custom position string value (inside, outside, custom, etc).
 *
 * @param {*} position One of nine positions to normalize.
 * @param {anychart.utils.NinePositions|string=} opt_default Default position value.
 * @return {anychart.utils.NinePositions|string} Normalized position.
 */
anychart.utils.normalizePosition = function(position, opt_default) {
  if (goog.isString(position)) {
    position = position.toLowerCase();
    for (var i in anychart.utils.NinePositions) {
      if (position == anychart.utils.NinePositions[i])
        return anychart.utils.NinePositions[i];
    }
    return position;
  }
  return goog.isDef(opt_default) ? opt_default : anychart.utils.NinePositions.CENTER;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Utils functions.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Получает или устанавливает свойство объекта obj, с учетом переданного способа адресации полей.
 * Поиск поля для чтения или записи производится по порядку элементов в mapping, затем field (mapping может быть пуст).
 * Если поле не найдено, то будет записано поле field.
 * Если используется как сетер, то возвращает предыдущее значение поля (или undefined).
 *
 * NOTE: The number of parameters is the only thing that matters in determining if it is a setter or a getter!
 *
 * @param {!Object} obj Объект, который нужно отобразить.
 * @param {string} field Оригинальное имя поля, которое мы ищем.
 * @param {?Array.<string>} mapping Порядок предпочтения имен полей объекта.
 * @param {*=} opt_setValue Значение, которое нужно установить.
 * @return {*} Текущее, либо предыдущее значение поля.
 */
anychart.utils.mapObject = function(obj, field, mapping, opt_setValue) {
  if (mapping) {
    for (var i = 0; i < mapping.length; i++) {
      var propName = mapping[i];
      if (propName in obj) {
        field = propName;
        break;
      }
    }
  }
  if (arguments.length > 3) {
    var result = obj[field];
    obj[mapping ? mapping[0] : field] = opt_setValue;
    return result;
  }
  return obj[field];
};


/**
 * Default comparator. Can compare any two values including objects and values of
 * different type, settings a stable ordering.
 * @param {*} a First value.
 * @param {*} b Second value.
 * @return {number} Comparison result.
 */
anychart.utils.compare = function(a, b) {
  var aType = typeof a;
  var bType = typeof b;
  if (aType == 'number' && bType == 'number')
    return (/** @type {number} */(a) - /** @type {number} */(b)) || 0; // in case of NaN
  a = anychart.utils.hash(a);
  b = anychart.utils.hash(b);
  if (a > b)
    return 1;
  else if (a == b)
    return 0;
  else
    return -1;
};


/**
 * Default hashing function for all objects. Can distinguish any two objects.
 * @param {*} value Value to get hash of.
 * @return {string} Hash value.
 */
anychart.utils.hash = function(value) {
  // Prefix each type with a single character representing the type to
  // prevent conflicting keys (e.g. true and 'true').
  return goog.isObject(value) ?
      'o' + goog.getUid(value) :
      (typeof value).charAt(0) + value;
};


/**
 * Normalizes number or string value and converts it to number.
 * Supports percent strings if opt_containerSize is defined and not NaN - calculates percentage in that case.
 * @param {string|number} value Value to normalize.
 * @param {number=} opt_containerSize Optional container dimension to support percent option.
 * @return {!number} Calculated percent value.
 */
anychart.utils.normalize = function(value, opt_containerSize) {
  return goog.isNumber(value) ?
      value :
      (!isNaN(opt_containerSize) && anychart.utils.isPercent(value) ?
          opt_containerSize * parseFloat(value) / 100 :
          parseFloat(value));
};


/**
 * Define whenever value is set in percent.
 * @param {*} value Value to define.
 * @return {boolean} Is value set in percent.
 */
anychart.utils.isPercent = function(value) {
  return goog.isString(value) && goog.string.endsWith(value, '%');
};


/**
 * Define whenever value is set in percent.
 * @param {*} value Value to define.
 * @return {boolean} Is value set in percent.
 */
anychart.utils.isUnit = function(value) {
  return goog.isString(value) && value.charAt(value.length - 1).toLowerCase() == 'u';
};


/**
 * Получает координаты якоря на границе.
 * @param {acgraph.math.Rect} bounds Прямоугольник границ.
 * @param {anychart.utils.NinePositions} anchor Якорь, координаты которого нужно получить.
 * @return {Object.<string, number>} Координаты якоря в виде [x, y].
 */
anychart.utils.getCoordinateByAnchor = function(bounds, anchor) {
  var x = bounds.left;
  var y = bounds.top;
  switch (anchor) {
    case anychart.utils.NinePositions.LEFT_TOP:
      break;
    case anychart.utils.NinePositions.LEFT_CENTER:
      y += bounds.height / 2;
      break;
    case anychart.utils.NinePositions.LEFT_BOTTOM:
      y += bounds.height;
      break;
    case anychart.utils.NinePositions.TOP:
      x += bounds.width / 2;
      break;
    case anychart.utils.NinePositions.CENTER:
      x += bounds.width / 2;
      y += bounds.height / 2;
      break;
    case anychart.utils.NinePositions.BOTTOM:
      x += bounds.width / 2;
      y += bounds.height;
      break;
    case anychart.utils.NinePositions.RIGHT_TOP:
      x += bounds.width;
      break;
    case anychart.utils.NinePositions.RIGHT_CENTER:
      x += bounds.width;
      y += bounds.height / 2;
      break;
    case anychart.utils.NinePositions.RIGHT_BOTTOM:
      x += bounds.width;
      y += bounds.height;
      break;
  }
  return {x: x, y: y};
};
