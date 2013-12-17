goog.provide('anychart.utils');


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
