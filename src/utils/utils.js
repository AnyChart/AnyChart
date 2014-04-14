goog.provide('anychart.utils');
goog.provide('anychart.utils.Align');
goog.provide('anychart.utils.Sort');
goog.provide('anychart.utils.color');
goog.require('anychart.math');
goog.require('anychart.math.Coordinate');
goog.require('goog.color');
goog.require('goog.dom.xml');
goog.require('goog.json.hybrid');


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
  /**
   * Устанавливает выравнивание по центру.
   */
  CENTER: 'center',
  /**
   * Устанавливает выравнивание по левой стороне.
   */
  LEFT: 'left',
  /**
   * Устанавливает выравнивание по правой стороне.
   */
  RIGHT: 'right',
  /**
   * Устанавливает выравнивание сверху.
   */
  TOP: 'top',
  /**
   * Устанавливает выравнивание снизу.
   */
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
  /**
   * Устанавливает ориентацию по левой стороне.
   */
  LEFT: 'left',
  /**
   * Устанавливает ориентацию по правой стороне.
   */
  RIGHT: 'right',
  /**
   * Устанавливает ориентацию сверху.
   */
  TOP: 'top',
  /**
   * Устанавливает ориентацию снизу.
   */
  BOTTOM: 'bottom'
};


/**
 * Direction enumeration.
 * @enum {string}
 */
anychart.utils.Direction = {
  VERTICAL: 'vertical',
  HORIZONTAL: 'horizontal'
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
 * @illustration <t>simple</t>
 * var orange = '1 orange 1';
 * var star = stage.star5(stage.width()/2, stage.height()/3, stage.height()/4).fill('yellow', 0.5);
 * var pathBounds = star.getBounds();
 * stage.path().fill('none').stroke(orange)
 *     .moveTo(pathBounds.left, pathBounds.top)
 *     .lineTo(pathBounds.left + pathBounds.width, pathBounds.top)
 *     .lineTo(pathBounds.left + pathBounds.width, pathBounds.top + pathBounds.height)
 *     .lineTo(pathBounds.left, pathBounds.top + pathBounds.height)
 *     .close();
 * stage.text(pathBounds.left - 55, pathBounds.top - 15, 'LEFT_TOP');
 * stage.circle(pathBounds.left, pathBounds.top, 3).fill('blue');
 * stage.text(pathBounds.left - 78, pathBounds.top + pathBounds.height/2 - 8, 'LEFT_CENTER');
 * stage.circle(pathBounds.left, pathBounds.top + pathBounds.height/2, 3).fill('blue');
 * stage.text(pathBounds.left - 80, pathBounds.top + pathBounds.height, 'LEFT_BOTTOM');
 * stage.circle(pathBounds.left, pathBounds.top + pathBounds.height, 3).fill('blue');
 * stage.text(pathBounds.left  + pathBounds.width/2 - 10, pathBounds.top - 18, 'TOP');
 * stage.circle(pathBounds.left + pathBounds.width/2, pathBounds.top, 3).fill('blue');
 * stage.text(pathBounds.left + pathBounds.width/2 - 20, pathBounds.top + pathBounds.height/2 - 15, 'CENTER');
 * stage.circle(pathBounds.left + pathBounds.width/2, pathBounds.top + pathBounds.height/2, 3).fill('blue');
 * stage.text(pathBounds.left + pathBounds.width/2 - 23, pathBounds.top + pathBounds.height+ 2, 'BOTTOM');
 * stage.circle(pathBounds.left + pathBounds.width/2, pathBounds.top + pathBounds.height, 3).fill('blue');
 * stage.text(pathBounds.left + pathBounds.width + 5, pathBounds.top - 15, 'RIGHT_TOP');
 * stage.circle(pathBounds.left + pathBounds.width, pathBounds.top, 3).fill('blue');
 * stage.text(pathBounds.left + pathBounds.width + 5 , pathBounds.top + pathBounds.height/2 - 8, 'RIGHT_CENTER');
 * stage.circle(pathBounds.left + pathBounds.width, pathBounds.top + pathBounds.height/2, 3).fill('blue');
 * stage.text(pathBounds.left + pathBounds.width + 5, pathBounds.top + pathBounds.height, 'RIGHT_BOTTOM');
 * stage.circle(pathBounds.left + pathBounds.width, pathBounds.top + pathBounds.height, 3).fill('blue');
 * @enum {string}
 */
anychart.utils.NinePositions = {
  /**
   * Defines left-top position
   */
  LEFT_TOP: 'lefttop',
  /**
   * Defines top position
   */
  TOP: 'top',
  /**
   * Defines right-top position
   */
  RIGHT_TOP: 'righttop',
  /**
   * Defines left-center position
   */
  LEFT_CENTER: 'leftcenter',
  /**
   * Defines center position
   */
  CENTER: 'center',
  /**
   * Defines right-center position
   */
  RIGHT_CENTER: 'rightcenter',
  /**
   * Defines left-bottom position
   */
  LEFT_BOTTOM: 'leftbottom',
  /**
   * Defines bottom position
   */
  BOTTOM: 'bottom',
  /**
   * Defines right-bottom position
   */
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


/**
 * Пытается нормализовать anychart.math.Coordinate до acgraph.math.Coordinate.
 * @param {anychart.math.Coordinate} value anychart.math.Coordinate to normalize.
 * @return {acgraph.math.Coordinate} Normalized to acgraph.math.Coordinate value.
 */
anychart.utils.normalizeMathPosition = function(value) {
  if (value instanceof acgraph.math.Coordinate) {
    return /** @type {acgraph.math.Coordinate} */(value);
  } else {
    if (goog.isArray(value)) {
      return new acgraph.math.Coordinate(value[0], value[1]);
    } else if (goog.isObject(value)) {
      return new acgraph.math.Coordinate(value['x'], value['y']);
    }
  }
  return new acgraph.math.Coordinate(0, 0);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Sort.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Sort enumeration.
 * @enum {string}
 */
anychart.utils.Sort = {
  /**
   * Ascending sort.
   */
  ASC: 'asc',
  /**
   * Descending sort.
   */
  DESC: 'desc',
  /**
   * No sort.
   */
  NONE: 'none'
};


/**
 * Normalizes user input sort to its enumeration values. Also accepts null. Defaults to opt_default or 'none'.
 *
 * @param {string} sort Sort to normalize.
 * @param {anychart.utils.Sort=} opt_default Default value.
 * @return {anychart.utils.Sort} Normalized sort.
 */
anychart.utils.normalizeSort = function(sort, opt_default) {
  if (goog.isString(sort)) {
    sort = sort.toLowerCase();
    for (var i in anychart.utils.Sort) {
      if (sort == anychart.utils.Sort[i])
        return anychart.utils.Sort[i];
    }
  }
  return opt_default || anychart.utils.Sort.NONE;
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
 * @param {boolean=} opt_invert Counts the result from the right/bottom side of the container (supported if
 *    opt_containerSize is passed).
 * @return {number} Calculated percent value.
 */
anychart.utils.normalize = function(value, opt_containerSize, opt_invert) {
  var result = goog.isNumber(value) ?
      value :
      (!isNaN(opt_containerSize) && anychart.utils.isPercent(value) ?
          opt_containerSize * parseFloat(value) / 100 :
          parseFloat(value));
  return (opt_invert && !isNaN(opt_containerSize)) ? opt_containerSize - result : result;
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


/**
 * Returns the nearest number to the left from value that meets equation ((value - opt_base) mod interval === 0).
 * @param {number} value Value to align.
 * @param {number} interval Value to align by.
 * @param {number=} opt_base Optional base value to calc from. Defaults to 0.
 * @return {number} Aligned value.
 */
anychart.utils.alignLeft = function(value, interval, opt_base) {
  opt_base = opt_base || 0;
  var mod = anychart.math.round((value - opt_base) % interval, 7);
  if (mod < 0)
    mod += interval;
  if (mod >= interval) // ECMAScript float representation... try (0.5 % 0.1).
    mod -= interval;
  return anychart.math.round(value - mod, 7);
};


/**
 * Returns the nearest number to the right from value that meets equation ((value - opt_base) mod interval === 0).
 * @param {number} value Value to align.
 * @param {number} interval Value to align by.
 * @param {number=} opt_base Optional base value to calc from. Defaults to 0.
 * @return {number} Aligned value.
 */
anychart.utils.alignRight = function(value, interval, opt_base) {
  opt_base = opt_base || 0;
  var mod = anychart.math.round((value - opt_base) % interval, 7);
  if (mod >= interval) // ECMAScript float representation... try (0.5 % 0.1).
    mod -= interval;
  if (mod == 0)
    return anychart.math.round(value, 7);
  else if (mod < 0)
    mod += interval;
  return anychart.math.round(value + interval - mod, 7);
};


/**
 * Применение оффсета к переданной позиции в зависимости от якоря.
 * @param {acgraph.math.Coordinate} position Розиция к оторой будут применены оффсеты.
 * @param {anychart.utils.NinePositions} anchor Якорь.
 * @param {number} offsetX Оффсет по Х.
 * @param {number} offsetY Оффсет по Y.
 * @return {acgraph.math.Coordinate} Позиция с примененным оффсетом.
 */
anychart.utils.applyOffsetByAnchor = function(position, anchor, offsetX, offsetY) {
  switch (anchor) {
    case anychart.utils.NinePositions.CENTER:
    case anychart.utils.NinePositions.LEFT_CENTER:
    case anychart.utils.NinePositions.TOP:
    case anychart.utils.NinePositions.LEFT_TOP:
      position.x += offsetX;
      position.y += offsetY;
      break;

    case anychart.utils.NinePositions.LEFT_BOTTOM:
    case anychart.utils.NinePositions.BOTTOM:
      position.x += offsetX;
      position.y -= offsetY;
      break;

    case anychart.utils.NinePositions.RIGHT_CENTER:
    case anychart.utils.NinePositions.RIGHT_TOP:
      position.x -= offsetX;
      position.y += offsetY;
      break;

    case anychart.utils.NinePositions.RIGHT_BOTTOM:
      position.x -= offsetX;
      position.y -= offsetY;
      break;
  }
  return position;
};


/**
 * Does a recursive clone of the object.
 *
 * @param {*} obj Object to clone.
 * @return {*} Clone of the input object.
 */
anychart.utils.recursiveClone = function(obj) {
  var res;
  if (goog.isArray(obj)) {
    res = new Array(obj.length);
  } else if (goog.isObject(obj)) {
    res = {};
  } else
    return obj;
  for (var key in obj)
    res[key] = anychart.utils.recursiveClone(obj[key]);
  return res;
};


/**
 * Нормализует значение представленное в виде числа либо процента.
 * Если было число либо процент (строка с числом и знаком %) вернется это значение
 * иначе вернется значение opt_default либо 0.
 * @param {*} value Value to normalize.
 * @param {(number|string)=} opt_default Default value.
 * @return {(number|string)} Нормализованное значение.
 */
anychart.utils.normalizeNumberOrStringPercentValue = function(value, opt_default) {
  var ret = parseFloat(value);
  if (goog.isNumber(value) && !isNaN(value) || goog.isNumber(ret) && !isNaN(ret)) return (/** @type {(number|string)} */ (value));
  return opt_default || 0;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Color.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Helper for isValidHexColor_.
 * @type {RegExp}
 * @private
 */
anychart.utils.color.validHexColorRe_ = /^#(?:[0-9a-f]{3}){1,2}$/i;


/**
 * Regular expression for matching and capturing RGB style strings. Helper for
 * isValidRgbColor_.
 * @type {RegExp}
 * @private
 */
anychart.utils.color.rgbColorRe_ =
    /^(?:rgb)?\((0|[1-9]\d{0,2}),\s?(0|[1-9]\d{0,2}),\s?(0|[1-9]\d{0,2})\)$/i;


/**
 * Checks if a string is a valid rgb color.  We expect strings of the format
 * '(r, g, b)', or 'rgb(r, g, b)', where each color component is an int in
 * [0, 255].
 * @param {string} str String to check.
 * @return {!goog.color.Rgb} the rgb representation of the color if it is
 *     a valid color, or the empty array otherwise.
 * @private
 */
anychart.utils.color.isValidRgbColor_ = function(str) {
  // Each component is separate (rather than using a repeater) so we can
  // capture the match. Also, we explicitly set each component to be either 0,
  // or start with a non-zero, to prevent octal numbers from slipping through.
  var regExpResultArray = str.match(anychart.utils.color.rgbColorRe_);
  if (regExpResultArray) {
    var r = Number(regExpResultArray[1]);
    var g = Number(regExpResultArray[2]);
    var b = Number(regExpResultArray[3]);
    if (r >= 0 && r <= 255 &&
        g >= 0 && g <= 255 &&
        b >= 0 && b <= 255) {
      return [r, g, b];
    }
  }
  return [];
};


/**
 * Checks if a string is a valid hex color.  We expect strings of the format
 * #RRGGBB (ex: #1b3d5f) or #RGB (ex: #3CA == #33CCAA).
 * @param {string} str String to check.
 * @return {boolean} Whether the string is a valid hex color.
 * @private
 */
anychart.utils.color.isValidHexColor_ = function(str) {
  return anychart.utils.color.validHexColorRe_.test(str);
};


/**
 * Parses a color out of a string.
 * @param {string} str Color in some format.
 * @return {Object} Contains two properties: 'hex', which is a string containing
 *     a hex representation of the color, as well as 'type', which is a string
 *     containing the type of color format passed in ('hex', 'rgb', 'named').
 */
anychart.utils.color.parseColor = function(str) {
  var result = {};
  str = String(str);

  var maybeHex = goog.color.prependHashIfNecessaryHelper(str);
  if (anychart.utils.color.isValidHexColor_(maybeHex)) {
    result.hex = goog.color.normalizeHex(maybeHex);
    result.type = 'hex';
    return result;
  } else {
    var rgb = anychart.utils.color.isValidRgbColor_(str);
    if (rgb.length) {
      result.hex = goog.color.rgbArrayToHex(rgb);
      result.type = 'rgb';
      return result;
    } else if (goog.color.names) {
      var hex = goog.color.names[str.toLowerCase()];
      if (hex) {
        result.hex = hex;
        result.type = 'named';
        return result;
      }
    }
  }
  return null;
};


/**
 * Trims all whitespace from the left of the string.
 * @param {string} str source string.
 * @return {string} left trimmed string.
 */
anychart.utils.ltrim = function(str) {
  // Since IE doesn't include non-breaking-space (0xa0) in their \s character
  // class (as required by section 7.2 of the ECMAScript spec), we explicitly
  // include it in the regexp to enforce consistent cross-browser behavior.
  return str.replace(/^[\s\xa0]+/, '');
};


/**
 * Trims all whitespace from the right of the string.
 * @param {string} str source string.
 * @return {string} right trimmed string.
 */
anychart.utils.rtrim = function(str) {
  // Since IE doesn't include non-breaking-space (0xa0) in their \s character
  // class (as required by section 7.2 of the ECMAScript spec), we explicitly
  // include it in the regexp to enforce consistent cross-browser behavior.
  return str.replace(/[\s\xa0]+$/, '');
};


/**
 * Trims all whitespace from the both sides of the string.
 * @param {string} str source string.
 * @return {string} trimmed string.
 */
anychart.utils.trim = function(str) {
  // Since IE doesn't include non-breaking-space (0xa0) in their \s character
  // class (as required by section 7.2 of the ECMAScript spec), we explicitly
  // include it in the regexp to enforce consistent cross-browser behavior.
  return str.replace(/^[\s\xa0]+|[\s\xa0]+$/g, '');
};


//----------------------------------------------------------------------------------------------------------------------
//
//  XML <-> JSON
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Built-in XML node types enumeration.
 * @enum {number}
 */
anychart.utils.XmlNodeType = {
  ELEMENT_NODE: 1,
  ATTRIBUTE_NODE: 2,
  TEXT_NODE: 3,
  CDATA_SECTION_NODE: 4,
  ENTITY_REFERENCE_NODE: 5,
  ENTITY_NODE: 6,
  PROCESSING_INSTRUCTION_NODE: 7,
  COMMENT_NODE: 8,
  DOCUMENT_NODE: 9,
  DOCUMENT_TYPE_NODE: 10,
  DOCUMENT_FRAGMENT_NODE: 11,
  NOTATION_NODE: 12
};


/**
 * Public function that parses XML and returns JSON. It hides all errors in
 * Document structure, so the result may be not as strict as expected.
 * The function converts XML string or node to an object with attributes
 * introduced as same named string properties. All subnodes are also converted to
 * correspondingly named properties by the next rules:
 * - if there is only one child with this name, it is converted into an object
 *   an added just as an object property to the parent object.
 * - if there are multiple children with the same name, they are also converted
 *   to a separate objects and then added to the parent object as an array.
 * - if there is an attribute named just like the node(s), the node(s) will
 *   completely replace the attribute.
 * - if there is any text value or a CDATA node or any their combination in the
 *   node, that value is stored as a string in a property named "value" even in
 *   cases when there is a subnode named "value" (but the node with this name
 *   still can be found in "#children#" array mentioned below).
 * Also some service properties are added to an object representing a node:
 * - "#name#" property - the node name
 * - "#children#" array property - all node children listed in order they appear
 *   in the node
 * - mentioned above "value" string property - contains textual value of the
 *   node
 * Usage sample:
 * <code>
 *   var a = new XMLHttpRequest();
 *   a.open('GET', 'http://sample.com', false, "", "");
 *   a.send(null);
 *   // for example there was the next XML:
 *   // <root a="123">
 *   //   <child />
 *   //   <child>some text value<![CDATA[   and a CDATA   ]]></child>
 *   //   <child_other/>
 *   // </root>
 *   var json = anychart.utils.XML2JSON(a.responseXML);
 * </code>
 * json variable will have the following structure:
 * {
 *   #name#: "root",
 *   #children#: [
 *      {#name#: "child", #children#: []},
 *      {#name#: "child", #children#: [], value: "some text value   and a CDATA   "}
 *      {#name#: "child_other", #children#: []}
 *   ],
 *   a: "123",
 *   child: [
 *      {#name#: "child", #children#: []},
 *      {#name#: "child", #children#: [], value: "some text value   and a CDATA   "}
 *   ],
 *   child_other: {#name#: "child_other", #children#: []}
 * }
 * @param {string|Node} xml XML source string.
 * @return {Object|string} Transformation result JSON (may by null).
 */
anychart.utils.xml2json = function(xml) {
  var node;
  if (goog.isString(xml)) {
    node = goog.dom.xml.loadXml(xml);
  } else
    node = xml;

  if (!node) {
    return null;
  }

  // parsing node type
  switch (node.nodeType) {
    case anychart.utils.XmlNodeType.ELEMENT_NODE:
      var result = {};
      var i;

      var len = (node.attributes == null) ? 0 : node.attributes.length;
      var onlyText = !len;

      // collecting attributes
      for (i = 0; i < len; i++) {
        /** @type {Attr} */
        var attr = node.attributes[i];
        if (!(attr.nodeName in result)) {
          var val = attr.nodeValue;
          if (!isNaN(+val))
            result[attr.nodeName] = +val;
          else if (val == 'true')
            result[attr.nodeName] = true;
          else if (val == 'false')
            result[attr.nodeName] = false;
          else if (val == 'null')
            result[attr.nodeName] = null;
          else
            result[attr.nodeName] = val;
        }
      }

      len = node.childNodes.length;
      var textValue = '';
      // collecting subnodes
      for (i = 0; i < len; i++) {
        var childNode = node.childNodes[i];
        var subnode = anychart.utils.xml2json(childNode);
        var subNodeName = childNode.nodeName;
        if (subNodeName.charAt(0) == '#') {
          textValue += subnode;
        } else if (!goog.isNull(subnode)) {
          onlyText = false;
          var names;
          if (names = anychart.utils.getArrayPropName_(subNodeName)) {
            result[names[0]] = subnode[names[1]];
          } else if (subNodeName in result) {
            if (goog.isArray(result[subNodeName])) {
              result[subNodeName].push(subnode);
            } else {
              result[subNodeName] = [result[subNodeName], subnode];
            }
          } else {
            result[subNodeName] = subnode;
          }
        }
      }

      return onlyText ? textValue : result;
    case anychart.utils.XmlNodeType.TEXT_NODE:
      var value = anychart.utils.trim(node.nodeValue);
      return (value == '') ? null : value;
    case anychart.utils.XmlNodeType.CDATA_SECTION_NODE:
      return node.nodeValue;
    case anychart.utils.XmlNodeType.DOCUMENT_NODE:
      return anychart.utils.xml2json(node.documentElement);
    default:
      return null;
  }
};


/**
 * Converts JSON object to an XML Node tree or String (string by default).
 * @param {Object|string} json
 * @param {string=} opt_rootNodeName
 * @param {boolean=} opt_returnAsXmlNode
 * @return {string|Node}
 */
anychart.utils.json2xml = function(json, opt_rootNodeName, opt_returnAsXmlNode) {
  if (goog.isString(json)) {
    json = goog.json.hybrid.parse(json);
  }
  /** @type {Document} */
  var result = goog.dom.xml.createDocument();
  var root = anychart.utils.json2xml_(json, opt_rootNodeName || 'xml', result);
  if (root)
    result.appendChild(root);
  return opt_returnAsXmlNode ? result : goog.dom.xml.serialize(result);
};


/**
 * RegExp of what we allow to be serialized as an xml attribute.
 * @type {RegExp}
 * @private
 */
anychart.utils.ACCEPTED_BY_ATTRIBUTE_ = /^[A-Za-z0-9#_(),. -]*$/;


/**
 * Converts JSON object to an XML Node tree or String (string by default).
 * @param {Object|string} json
 * @param {string} rootNodeName
 * @param {Document} doc
 * @return {Node}
 * @private
 */
anychart.utils.json2xml_ = function(json, rootNodeName, doc) {
  if (goog.isNull(json)) return null;
  var root = doc.createElement(rootNodeName);
  if (goog.isString(json)) {
    root.appendChild(doc.createCDATASection(String(json)));
  } else {
    var j;
    for (var i in json) {
      if (json.hasOwnProperty(i)) {
        var child = json[i];
        if (goog.isArray(child)) {
          var nodeNames = anychart.utils.getNodeNames_(i);
          var grouper, itemName;
          if (nodeNames) {
            grouper = doc.createElement(nodeNames[0]);
            root.appendChild(grouper);
            itemName = nodeNames[1];
          } else {
            grouper = root;
            itemName = i;
          }
          for (j = 0; j < child.length; j++) {
            grouper.appendChild(anychart.utils.json2xml_(child[j], itemName, doc));
          }
        } else if (goog.isDefAndNotNull(child)) {
          if (goog.isObject(child) || !anychart.utils.ACCEPTED_BY_ATTRIBUTE_.test(child)) {
            root.appendChild(anychart.utils.json2xml_(child, i, doc));
          } else {
            root.setAttribute(i, child);
          }
        }
      }
    }
  }
  return root;
};


/**
 * Gets grouper and item node names for passed array property name.
 * @param {string} arrayPropName
 * @return {?Array.<string>} Array of [grouperName, itemName] or null.
 * @private
 */
anychart.utils.getNodeNames_ = function(arrayPropName) {
  switch (arrayPropName) {
    case 'series':
      return ['seriesList', 'series'];
    case 'keys':
      return ['keys', 'key'];
    case 'data':
      return ['data', 'point'];
  }
  return null;
};


/**
 * Checks if passed name is a grouper and returns correct property name if it is.
 * @param {string} nodeName
 * @return {?Array.<string>} Array of [propertyName, itemName] or null.
 * @private
 */
anychart.utils.getArrayPropName_ = function(nodeName) {
  switch (nodeName) {
    case 'seriesList':
      return ['series', 'series'];
    case 'keys':
      return ['keys', 'key'];
    case 'data':
      return ['data', 'point'];
  }
  return null;
};
