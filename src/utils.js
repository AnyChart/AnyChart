goog.provide('anychart.utils');

goog.require('acgraph.vector.primitives');
goog.require('anychart.core.reporting');
goog.require('anychart.data.csv.Parser');
goog.require('anychart.enums');
goog.require('anychart.math');
goog.require('goog.array');
goog.require('goog.date.Interval');
goog.require('goog.date.UtcDateTime');
goog.require('goog.dom');
goog.require('goog.dom.xml');
goog.require('goog.i18n.DateTimeFormat');
goog.require('goog.json.hybrid');
goog.require('goog.object');


/**
 @namespace
 @name anychart.utils
 */


//----------------------------------------------------------------------------------------------------------------------
//
//  Utils functions.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * UID internal counter.
 * @type {number}
 * @private
 */
anychart.utils.UID_COUNTER_ = 0;


/**
 * Generates numeric UID.
 * @return {number}
 */
anychart.utils.getUid = function() {
  return ++anychart.utils.UID_COUNTER_;
};


/**
 * Settings in format [obj, mode, obj, mode,...]
 * Description 0 - plain object with settings, 1 -
 * @param {Array} settingsArray
 * @param {string=} opt_callProp
 * @return {Array}
 */
anychart.utils.extractSettings = function(settingsArray, opt_callProp) {
  var result = [];
  for (var i = 0; i < settingsArray.length; i += 2) {
    var obj = settingsArray[i];
    var res = undefined;
    var mode = settingsArray[i + 1];
    if (mode == anychart.utils.ExtractSettingModes.PLAIN_VALUE) {
      res = obj;
    } else if (obj) {
      switch (mode) {
        case anychart.utils.ExtractSettingModes.OWN_SETTINGS:
          obj = obj.ownSettings;
          break;
        case anychart.utils.ExtractSettingModes.THEME_SETTINGS:
          obj = obj.themeSettings;
          break;
        case anychart.utils.ExtractSettingModes.AUTO_SETTINGS:
          obj = obj.autoSettings;
          break;
      }
      if (opt_callProp) {
        if (mode == anychart.utils.ExtractSettingModes.I_ROW_INFO) {
          res = obj.get(opt_callProp);
        } else {
          res = obj[opt_callProp];
          if (mode == anychart.utils.ExtractSettingModes.CALL_METHOD)
            res = res ? res.call(obj) : undefined;
        }
      } else {
        res = obj;
      }
    }
    result.push(res);
  }
  return result;
};


/**
 * Returns new instance of constructor function with unknown parameters. Generic version of "new" operator.
 * @param {Function} ctor .
 * @param {...*} var_args .
 * @return {*}
 */
anychart.utils.construct = function(ctor, var_args) {
  var args = Array.prototype.slice.call(arguments, 1);

  /**
   * @return {*}
   * @constructor
   */
  var F = function() {
    return ctor.apply(this, args);
  };
  F.prototype = ctor.prototype;
  return new F();
};


/**
 * Extracting settings modes.
 * @enum {number}
 */
anychart.utils.ExtractSettingModes = {
  PLAIN_OBJECT: 0,
  OWN_SETTINGS: 1,
  THEME_SETTINGS: 2,
  AUTO_SETTINGS: 3,
  CALL_METHOD: 4,
  I_ROW_INFO: 5,
  PLAIN_VALUE: 6
};


/**
 * Gets or sets obj property, takes in account fields addresses.
 * Fields are first looked using mapping order, then - field order (e.g. mapping is empty).
 * If field can not be found - field is written.
 * If used as setter - previous value (or undefined) is returned.
 *
 * NOTE: The number of parameters is the only thing that matters in determining if it is a setter or a getter!
 *
 * @param {!Object} obj Object.
 * @param {string} field Field name.
 * @param {?Array.<string>} mapping Mapping.
 * @param {*=} opt_setValue Value to set.
 * @return {*} Current or previous value.
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
    obj[field] = opt_setValue;
    return result;
  }
  return obj[field];
};


/**
 * Default comparator. Can compare any two values including objects and values of
 * different type, setting a stable ordering in ascending order. NaNs are placed to the END of numbers list.
 * @param {*} a First value.
 * @param {*} b Second value.
 * @return {number} Comparison result.
 */
anychart.utils.compareAsc = function(a, b) {
  var aType = typeof a;
  var bType = typeof b;
  if (aType == 'number' && bType == 'number')
    return anychart.utils.compareNumericAsc(/** @type {number} */(a), /** @type {number} */(b));
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
 * Can compare any two values including objects and values of
 * different type, setting a stable ordering in descending order. NaNs are placed to the START of numbers list.
 * @param {*} a First value.
 * @param {*} b Second value.
 * @return {number} Comparison result.
 */
anychart.utils.compareDesc = function(a, b) {
  return -anychart.utils.compareAsc(a, b);
};


/**
 * Comparator for numbers, that resolves the case of NaNs. Maintains stable ASC ordering,
 * placing NaNs to the END of list.
 * @param {number} a First value.
 * @param {number} b Second value.
 * @return {number} Comparison result.
 */
anychart.utils.compareNumericAsc = function(a, b) {
  if (isNaN(a))
    return isNaN(b) ? 0 : 1;
  else
    return isNaN(b) ? -1 : (a - b);
};


/**
 * Comparator for numbers, that resolves the case of NaNs. Maintains stable DESC ordering,
 * placing NaNs to the END of list (not the same as -compareNumericAsc).
 * @param {number} a First value.
 * @param {number} b Second value.
 * @return {number} Comparison result.
 */
anychart.utils.compareNumericDesc = function(a, b) {
  if (isNaN(a))
    return isNaN(b) ? 0 : 1;
  else
    return isNaN(b) ? -1 : (b - a);
};


/**
 * Extracts tag from BrowserEvent target object. Used in interactivity.
 * @param {*} target
 * @return {*|undefined}
 */
anychart.utils.extractTag = function(target) {
  var tag;
  while (anychart.utils.instanceOf(target, acgraph.vector.Element)) {
    tag = target.tag;
    if (goog.isDef(tag)) {
      return tag;
    }
    target = target.parent();
  }
  return undefined;
};


/**
 * Checks if target is among parent child event targets.
 * @param {!goog.events.EventTarget} parent
 * @param {goog.events.EventTarget} target
 * @return {boolean}
 */
anychart.utils.checkIfParent = function(parent, target) {
  if (!parent) return false;
  while (anychart.utils.instanceOf(target, goog.events.EventTarget) && target != parent) {
    target = target.getParentEventTarget();
  }
  return target == parent;
};


/**
 * Default hashing function for all objects. Can distinguish any two objects.
 * @param {*} value Value to get hash of.
 * @return {string} Hash value.
 */
anychart.utils.hash = function(value) {
  // Prefix each type with a single character representing the type to
  // prevent conflicting keys (e.g. true and 'true').
  return goog.isObject(value) ? 'o' + goog.getUid(value) : (typeof value).charAt(0) + value;
};


/**
 * Normalizes number or string value and converts it to number.
 * Supports percent strings if opt_containerSize is defined and not NaN - calculates percentage in that case.
 * @param {string|number|null|undefined} value Value to normalize.
 * @param {number=} opt_containerSize Optional container dimension to support percent option.
 * @param {boolean=} opt_invert Counts the result from the right/bottom side of the container (supported if
 *    opt_containerSize is passed).
 * @return {number} Calculated percent value.
 */
anychart.utils.normalizeSize = function(value, opt_containerSize, opt_invert) {
  var result = goog.isNumber(value) ?
      value :
      (!isNaN(opt_containerSize) && anychart.utils.isPercent(value) ?
          opt_containerSize * parseFloat(value) / 100 :
          parseFloat(value));
  return (opt_invert && !isNaN(opt_containerSize)) ? opt_containerSize - result : result;
};


/**
 * Gets state string name.
 * @param {anychart.PointState|number} state - State.
 * @return {string}
 */
anychart.utils.pointStateToName = function(state) {
  switch (state) {
    case anychart.PointState.HOVER:
      return 'hovered';
    case anychart.PointState.SELECT:
      return 'selected';
    default:
      return 'normal';
  }
};


/**
 * Define whether value is set in percent.
 * @param {*} value Value to define.
 * @return {boolean} Is value set in percent.
 */
anychart.utils.isPercent = function(value) {
  return goog.isString(value) && goog.string.endsWith(value, '%') && !isNaN(parseFloat(value));
};


/**
 * Tries to convert incoming value to valid numeric or percent value.
 * @param {*} value - Value.
 * @param {(number|string|null)=} opt_default - Default value to be set.
 * @return {number|string|null} - Converted value.
 */
anychart.utils.normalizeNumberOrPercent = function(value, opt_default) {
  if (goog.isNull(value)) return null;
  value = goog.isDef(value) ? value : 0;
  opt_default = goog.isDef(opt_default) ? opt_default : 0;
  var isPercent = anychart.utils.isPercent(value);
  var parsed = parseFloat(value);
  return isNaN(parsed) ? opt_default : (isPercent ? /** @type {string} */(value) : parsed);
};


/**
 * Normalizes passed value to a percent format string.
 * @param {*} value Value to normalize.
 * @param {boolean=} opt_canReturnNaN Can return NaN or normalize to '0%'
 * @return {(string|number)} Normalized to percent format value. If source value doesn't like percent format then trying to
 * convert it. If convert was failed then returns default value ['0%'].
 */
anychart.utils.normalizeToPercent = function(value, opt_canReturnNaN) {
  if (anychart.utils.isPercent(value))
    return /** @type {string} */(value);

  if (!goog.isNumber(value))
    value = parseFloat(value);

  if (isNaN(value)) return opt_canReturnNaN ? NaN : '0%';
  return value + '%';
};


/**
 * Normalizes passed value to numeric ratio value.
 * @param {string|number} value Value to normalize. If is string, must be treated as percent.
 *  Numeric value is treated as ratio value anyway.
 * @return {number}
 */
anychart.utils.normalizeToRatio = function(value) {
  return anychart.utils.isPercent(value) ? parseFloat(value) / 100 : +value;
};


/**
 * Converts value of any type to number, according to these rules:
 * 1) number -> number
 * 2) string -> number only if it is a number (no parseFloat, just +)
 * 3) NaN -> NaN
 * 4) null -> NaN
 * 5) boolean -> NaN
 * 6) undefined -> NaN
 * 7) Object -> Object.valueOf
 * @param {*} value
 * @return {number}
 */
anychart.utils.toNumber = function(value) {
  if (!goog.isDefAndNotNull(value) || goog.isBoolean(value))
    return NaN;
  return +value;
};


/**
 * Converts value of any type to number or string, according to these rules:
 * 1) number -> number
 * 2) string -> leaved as is
 * 3) NaN -> NaN
 * 4) null -> NaN
 * 5) boolean -> NaN
 * 6) undefined -> NaN
 * 7) Object -> Object.valueOf
 * @param {*} value
 * @return {number|string}
 */
anychart.utils.toNumberOrString = function(value) {
  if (goog.isString(value))
    return value;
  return anychart.utils.toNumber(value);
};


/**
 * Converts value of any type to number or string, according to these rules:
 * 1) number -> number
 * 2) NaN -> null
 * 3) string -> leaved as is
 * 4) string containing only spaces -> null
 * 5) null -> null
 * 6) boolean -> null
 * 7) undefined -> null
 * 8) Object -> null
 * @param {*} value
 * @return {number|string|null}
 */
anychart.utils.toNumberOrStringOrNull = function(value) {
  return ((goog.isNumber(value) && !isNaN(value)) || (goog.isString(value) && goog.string.trim(value) != '')) ?
      value :
      null;
};


/**
 * Converts to number and checks if it is NaN.
 * @param {*} value
 * @return {boolean}
 */
anychart.utils.isNaN = function(value) {
  return isNaN(anychart.utils.toNumber(value));
};


/**
 * Normalizes passed value to a natural value (strictly-positive integer).
 * If a number-like value passed and if it is greater than 0.5, it is rounded.
 * If it is not a number or it is less than 1 it defaults to opt_default || 1.
 * @param {*} value Value to normalize.
 * @param {number=} opt_default Default value to return.
 * @param {boolean=} opt_allowZero
 * @return {number} Naturalized value.
 */
anychart.utils.normalizeToNaturalNumber = function(value, opt_default, opt_allowZero) {
  if (!goog.isNumber(value))
    value = parseFloat(value);
  value = Math.round(value);
  // value > 0 also checks for NaN, because NaN > 0 == false.
  return (!isNaN(value) && ((value > 0) || (opt_allowZero && !value))) ?
      value :
      (goog.isDef(opt_default) ? opt_default : opt_allowZero ? 0 : 1);
};


/**
 * Transforms data value to timestamp
 * @param {*} value
 * @return {number}
 */
anychart.utils.normalizeTimestamp = function(value) {
  var result;
  if (goog.isNumber(value)) {
    result = value;
  } else if (goog.isString(value)) {
    result = +new Date(value);
    if (isNaN(result))
      result = +value;
  } else if (!goog.isDefAndNotNull(value)) {
    result = NaN;
  } else { // also accepts Date
    result = Number(value);
  }
  return result;
};


/**
 * Gets anchor coordinates by bounds.
 * @param {anychart.math.Rect} bounds Bounds rectangle.
 * @param {?(anychart.enums.Anchor|string)} anchor Anchor.
 * @param {anychart.enums.Anchor=} opt_autoDefault
 * @return {{x: number, y: number}} Anchor coordinates as {x:number, y:number}.
 */
anychart.utils.getCoordinateByAnchor = function(bounds, anchor, opt_autoDefault) {
  var x = bounds.left;
  var y = bounds.top;
  var anchorVal = anychart.enums.normalizeAnchor(anchor);
  if (opt_autoDefault && anchorVal == anychart.enums.Anchor.AUTO)
    anchorVal = opt_autoDefault;
  switch (anchorVal) {
    case anychart.enums.Anchor.LEFT_TOP:
      break;
    case anychart.enums.Anchor.LEFT_CENTER:
      y += bounds.height / 2;
      break;
    case anychart.enums.Anchor.LEFT_BOTTOM:
      y += bounds.height;
      break;
    case anychart.enums.Anchor.CENTER_TOP:
      x += bounds.width / 2;
      break;
    case anychart.enums.Anchor.CENTER:
      x += bounds.width / 2;
      y += bounds.height / 2;
      break;
    case anychart.enums.Anchor.CENTER_BOTTOM:
      x += bounds.width / 2;
      y += bounds.height;
      break;
    case anychart.enums.Anchor.RIGHT_TOP:
      x += bounds.width;
      break;
    case anychart.enums.Anchor.RIGHT_CENTER:
      x += bounds.width;
      y += bounds.height / 2;
      break;
    case anychart.enums.Anchor.RIGHT_BOTTOM:
      x += bounds.width;
      y += bounds.height;
      break;
  }
  return {'x': x, 'y': y};
};


/**
 * Anchors set for anchors rotation.
 * @type {Array.<anychart.enums.Anchor>}
 */
anychart.utils.ANCHORS_SET = ([
  anychart.enums.Anchor.CENTER_TOP,
  anychart.enums.Anchor.RIGHT_TOP,
  anychart.enums.Anchor.RIGHT_CENTER,
  anychart.enums.Anchor.RIGHT_BOTTOM,
  anychart.enums.Anchor.CENTER_BOTTOM,
  anychart.enums.Anchor.LEFT_BOTTOM,
  anychart.enums.Anchor.LEFT_CENTER,
  anychart.enums.Anchor.LEFT_TOP
]);


/**
 * Returns anchor for angle.
 * @param {number} angle .
 * @return {anychart.enums.Anchor} .
 */
anychart.utils.getAnchorForAngle = function(angle) {
  angle = goog.math.standardAngle(angle);
  var turn = angle / 90;
  if (turn != ~~turn) {
    turn = Math.round(turn - 0.5) + 0.5;
  }
  turn = (turn + turn + 6) % 8;
  return anychart.utils.ANCHORS_SET[turn];
};


/**
 * Rotates anchor by position. CENTER_TOP position is 0 angle, clockwise.
 * @param {anychart.enums.Anchor} anchor
 * @param {anychart.enums.Position} position
 * @return {anychart.enums.Anchor} .
 */
anychart.utils.rotateAnchorByPosition = function(anchor, position) {
  var anchorIndex = goog.array.indexOf(anychart.utils.ANCHORS_SET, anchor);
  if (anchorIndex >= 0) {
    var positionIndex = goog.array.indexOf(anychart.utils.ANCHORS_SET, position);
    if (positionIndex >= 0) {
      anchorIndex = (anchorIndex + positionIndex) % 8;
      anchor = anychart.utils.ANCHORS_SET[anchorIndex];
    }
  }
  return anchor;
};


/**
 * Returns number representation of side position.
 * @param {anychart.enums.SidePosition} position
 * @return {number}
 */
anychart.utils.sidePositionToNumber = function(position) {
  //byPath value for polar xAxis only
  return position == anychart.enums.SidePosition.OUTSIDE || position == 'byPath' ?
      1 : position == anychart.enums.SidePosition.INSIDE ? -1 : 0;
};



/**
 * Returns ticks length that affects axis size calculation.
 * @param {!anychart.core.AxisTicks} ticks Ticks instance.
 * @param {number=} opt_side If value greater than 0 - calculates offset relative outside position,
 * less then 0 - relative inside position, equal to 0 - relative both sides.
 * @return {number} Ticks length.
 */
anychart.utils.getAffectBoundsTickLength = function(ticks, opt_side) {
  var length = 0;
  var side = goog.isDef(opt_side) ? opt_side : NaN;
  if (ticks.enabled()) {
    var position = /** @type {anychart.enums.SidePosition} */(ticks.getOption('position'));
    var ticksLength = /** @type {number} */(ticks.getOption('length'));

    if (position == anychart.enums.SidePosition.OUTSIDE) {
      length = side <= 0 ? 0 : ticksLength;
    } else if (position == anychart.enums.SidePosition.CENTER) {
      length = side * ticksLength / 2;
    } else if (position == anychart.enums.SidePosition.INSIDE) {
      length = side >= 0 ? 0 : -ticksLength;
    }
  }
  return /** @type {number} */(length);
};


/**
 * Returns an anchor for the position to keep the element outside of the body.
 * @param {anychart.enums.Position|anychart.enums.Anchor} anchor
 * @return {anychart.enums.Anchor}
 */
anychart.utils.flipAnchor = function(anchor) {
  return anychart.utils.rotateAnchor(anchor, 180);
};


/**
 * Rotates anchor by the angle.
 * @param {anychart.enums.Position|anychart.enums.Anchor} anchor
 * @param {number} angle
 * @return {anychart.enums.Anchor}
 */
anychart.utils.rotateAnchor = function(anchor, angle) {
  var turn = goog.math.standardAngle(-angle) / 90;
  if (turn) {
    var index = goog.array.indexOf(anychart.utils.ANCHORS_SET, anchor);
    if (index >= 0) {
      if (turn != ~~turn) {
        turn = Math.round(turn - 0.5) + 0.5;
      }
      index += turn + turn;
      anchor = anychart.utils.ANCHORS_SET[index % anychart.utils.ANCHORS_SET.length];
    }
  }
  return /** @type {anychart.enums.Anchor} */(anchor);
};


/**
 * Returns an anchor for the position to keep the element outside of the body.
 * @param {anychart.enums.Position|anychart.enums.Anchor} anchor
 * @return {anychart.enums.Anchor}
 */
anychart.utils.flipAnchorHorizontal = function(anchor) {
  var index = goog.array.indexOf(anychart.utils.ANCHORS_SET, anchor);
  if (index >= 0) {
    var len = anychart.utils.ANCHORS_SET.length;
    anchor = anychart.utils.ANCHORS_SET[(len - index) % len];
  }
  return /** @type {anychart.enums.Anchor} */(anchor);
};


/**
 * Returns an anchor for the position to keep the element outside of the body.
 * @param {anychart.enums.Position|anychart.enums.Anchor} anchor
 * @return {anychart.enums.Anchor}
 */
anychart.utils.flipAnchorVertical = function(anchor) {
  var index = goog.array.indexOf(anychart.utils.ANCHORS_SET, anchor);
  if (index >= 0) {
    var len = anychart.utils.ANCHORS_SET.length;
    anchor = anychart.utils.ANCHORS_SET[(len - index + 4) % len];
  }
  return /** @type {anychart.enums.Anchor} */(anchor);
};


/**
 * Returns true if the anchor is one of three top anchors.
 * @param {anychart.enums.Anchor} anchor
 * @return {boolean}
 */
anychart.utils.isTopAnchor = function(anchor) {
  return anchor == anychart.enums.Anchor.LEFT_TOP ||
      anchor == anychart.enums.Anchor.CENTER_TOP ||
      anchor == anychart.enums.Anchor.RIGHT_TOP;
};


/**
 * Returns true if the anchor is one of three bottom anchors.
 * @param {anychart.enums.Anchor} anchor
 * @return {boolean}
 */
anychart.utils.isBottomAnchor = function(anchor) {
  return anchor == anychart.enums.Anchor.LEFT_BOTTOM ||
      anchor == anychart.enums.Anchor.CENTER_BOTTOM ||
      anchor == anychart.enums.Anchor.RIGHT_BOTTOM;
};


/**
 * Returns true if the anchor is one of three left anchors.
 * @param {anychart.enums.Anchor} anchor
 * @return {boolean}
 */
anychart.utils.isLeftAnchor = function(anchor) {
  return anchor == anychart.enums.Anchor.LEFT_TOP ||
      anchor == anychart.enums.Anchor.LEFT_CENTER ||
      anchor == anychart.enums.Anchor.LEFT_BOTTOM;
};


/**
 * Returns true if the anchor is one of three right anchors.
 * @param {anychart.enums.Anchor} anchor
 * @return {boolean}
 */
anychart.utils.isRightAnchor = function(anchor) {
  return anchor == anychart.enums.Anchor.RIGHT_TOP ||
      anchor == anychart.enums.Anchor.RIGHT_CENTER ||
      anchor == anychart.enums.Anchor.RIGHT_BOTTOM;
};


/**
 * Returns the nearest number to the left from value that meets equation ((value - opt_base) mod interval === 0).
 * @param {number} value Value to align.
 * @param {number} interval Value to align by.
 * @param {number=} opt_base Optional base value to calculate from. Defaults to 0.
 * @param {number=} opt_precision - Precision. Defaults to 7, minimal value is 7.
 * @return {number} Aligned value.
 */
anychart.utils.alignLeft = function(value, interval, opt_base, opt_precision) {
  opt_base = opt_base || 0;
  var precision = opt_precision >= 7 ? opt_precision : 7;
  var times = Math.floor(anychart.math.round((value - opt_base) / interval, precision));
  return anychart.math.round(interval * times + opt_base, precision);
};


/**
 * Returns the nearest number to the right from value that meets equation ((value - opt_base) mod interval === 0).
 * @param {number} value Value to align.
 * @param {number} interval Value to align by.
 * @param {number=} opt_base Optional base value to calculate from. Defaults to 0.
 * @param {number=} opt_precision - Precision. Defaults to 7, minimal value is 7.
 * @return {number} Aligned value.
 */
anychart.utils.alignRight = function(value, interval, opt_base, opt_precision) {
  opt_base = opt_base || 0;
  var precision = opt_precision >= 7 ? opt_precision : 7;
  var times = Math.ceil(anychart.math.round((value - opt_base) / interval, precision));
  return anychart.math.round(interval * times + opt_base, precision);
};


/**
 * Aligns passed timestamp to the left according to the passed interval.
 * @param {number} date Date to align.
 * @param {goog.date.Interval} interval Interval to align by.
 * @param {number} flagDateValue Flag date to align within years scope.
 * @return {number} Aligned timestamp.
 */
anychart.utils.alignDateLeft = function(date, interval, flagDateValue) {
  var dateObj = new Date(date);

  var years = dateObj.getUTCFullYear();
  var months = dateObj.getUTCMonth();
  var days = dateObj.getUTCDate();
  var hours = dateObj.getUTCHours();
  var minutes = dateObj.getUTCMinutes();
  var seconds = dateObj.getUTCSeconds();
  var milliseconds = dateObj.getUTCMilliseconds();

  if (interval.years) {
    var flagDate = new Date(flagDateValue);
    var flagYear = flagDate.getUTCFullYear();
    years = anychart.utils.alignLeft(years, interval.years, flagYear);
    return Date.UTC(years, 0);
  } else if (interval.months) {
    months = anychart.utils.alignLeft(months, interval.months);
    return Date.UTC(years, months);
  } else if (interval.days && interval.days % 7 == 0) { // weeks
    var locale = anychart.format.getDateTimeLocale(anychart.format.outputLocale());
    var firstDay = locale ? locale['firstDayOfWeek'] : 0;
    return anychart.utils.alignLeft(dateObj.getTime(), interval.days * 1000 * 60 * 60 * 24, Date.UTC(2000, 0, 2 + firstDay));
  } else if (interval.days) {
    days = anychart.utils.alignLeft(days, interval.days);
    return Date.UTC(years, months, days);
  } else if (interval.hours) {
    hours = anychart.utils.alignLeft(hours, interval.hours);
    return Date.UTC(years, months, days, hours);
  } else if (interval.minutes) {
    minutes = anychart.utils.alignLeft(minutes, interval.minutes);
    return Date.UTC(years, months, days, hours, minutes);
  } else if (interval.seconds >= 1) {
    seconds = anychart.utils.alignLeft(seconds, interval.seconds);
    return Date.UTC(years, months, days, hours, minutes, seconds);
  } else if (interval.seconds) {
    milliseconds = anychart.utils.alignLeft(milliseconds, interval.seconds * 1000);
    return Date.UTC(years, months, days, hours, minutes, seconds, milliseconds);
  } else {
    return date;
  }
};


/**
 * Aligns passed timestamp to the left according to the passed unit and count.
 * @param {number} date Date to align.
 * @param {anychart.enums.Interval} unit
 * @param {number} count
 * @param {number} flagDateValue Flag date to align within years scope.
 * @return {number} Aligned timestamp.
 */
anychart.utils.alignDateLeftByUnit = function(date, unit, count, flagDateValue) {
  var dateObj = new Date(date);

  var years = dateObj.getUTCFullYear();
  var months = dateObj.getUTCMonth();
  var days = dateObj.getUTCDate();
  var hours = dateObj.getUTCHours();
  var minutes = dateObj.getUTCMinutes();
  var seconds = dateObj.getUTCSeconds();
  var milliseconds = dateObj.getUTCMilliseconds();

  switch (unit) {
    case anychart.enums.Interval.YEAR:
      var flagDate = new Date(flagDateValue);
      var flagYear = flagDate.getUTCFullYear();
      years = anychart.utils.alignLeft(years, count, flagYear);
      return Date.UTC(years, 0);
    case anychart.enums.Interval.SEMESTER:
      months = anychart.utils.alignLeft(months, count * 6);
      return Date.UTC(years, months);
    case anychart.enums.Interval.QUARTER:
      months = anychart.utils.alignLeft(months, count * 3);
      return Date.UTC(years, months);
    case anychart.enums.Interval.MONTH:
      months = anychart.utils.alignLeft(months, count);
      return Date.UTC(years, months);
    case anychart.enums.Interval.THIRD_OF_MONTH:
      return anychart.utils.alignLeft(dateObj.getTime(), count * 1000 * 60 * 60 * 24 * 10, Date.UTC(2000, 0, 2));
    case anychart.enums.Interval.WEEK:
      var locale = anychart.format.getDateTimeLocale(anychart.format.outputLocale());
      var firstDay = locale ? locale['firstDayOfWeek'] : 0;
      return anychart.utils.alignLeft(dateObj.getTime(), count * 1000 * 60 * 60 * 24 * 7, Date.UTC(2000, 0, 2 + firstDay));
    case anychart.enums.Interval.DAY:
      return anychart.utils.alignLeft(dateObj.getTime(), count * 1000 * 60 * 60 * 24, Date.UTC(2000, 0, 2));
    case anychart.enums.Interval.HOUR:
      hours = anychart.utils.alignLeft(hours, count);
      return Date.UTC(years, months, days, hours);
    case anychart.enums.Interval.MINUTE:
      minutes = anychart.utils.alignLeft(minutes, count);
      return Date.UTC(years, months, days, hours, minutes);
    case anychart.enums.Interval.SECOND:
      seconds = anychart.utils.alignLeft(seconds, count);
      return Date.UTC(years, months, days, hours, minutes, seconds);
    case anychart.enums.Interval.MILLISECOND:
      milliseconds = anychart.utils.alignLeft(milliseconds, count);
      return Date.UTC(years, months, days, hours, minutes, seconds, milliseconds);
  }
  return date;
};


/**
 * Turns passed calendar UTC-date to fiscal date.
 * @see https://en.wikipedia.org/wiki/Fiscal_year
 * @param {number} date - Calendar UTC timestamp.
 * @param {number} yearStartMonth - Number of month (1 - 12).
 *  DEV NOTE: provide correct clamping before passing this parameter here.
 * @return {number} - Shifted timestamp.
 */
anychart.utils.shiftFiscalDate = function(date, yearStartMonth) {
  if (yearStartMonth > 1) {
    var dateObj = new Date(date);

    var years = dateObj.getUTCFullYear();
    var months = dateObj.getUTCMonth();
    var days = dateObj.getUTCDate();
    var hours = dateObj.getUTCHours();
    var minutes = dateObj.getUTCMinutes();
    var seconds = dateObj.getUTCSeconds();
    var milliseconds = dateObj.getUTCMilliseconds();

    // Can't use just dateObj.setUTCMonth() because dateObj already contains timezone offset.
    return Date.UTC(years, months + yearStartMonth - 1, days, hours, minutes, seconds, milliseconds);
  }
  return date;
};


/**
 * Shifts incoming timestamp by units and count.
 *
 * @param {number} date - Timestamp to shift.
 * @param {anychart.enums.Interval} unit - Unit to create interval.
 * @param {number} count - Count of units to create interval.
 * @returns {number} - Shifted timestamp.
 */
anychart.utils.shiftDateByInterval = function(date, unit, count) {
  var interval = anychart.utils.getIntervalFromInfo(unit, count);
  var utcWrapper = new goog.date.UtcDateTime(new Date(date));
  utcWrapper.add(interval);
  return utcWrapper.getTime();
};


/**
 * Gets fiscal date.
 *
 * @see https://en.wikipedia.org/wiki/Fiscal_year
 * @param {number} date - Calendar UTC timestamp.
 * @param {number} yearStartMonth - Number of month (1 - 12).
 *  DEV NOTE: provide correct clamping before passing this parameter here.
 * @param {number=} opt_yearOffset - Actually is a fiscal year shift for DVF-4399. Another one strange feature.
 * @return {number} - Shifted timestamp.
 */
anychart.utils.getFiscalDate = function(date, yearStartMonth, opt_yearOffset) {
  if (yearStartMonth > 1) {
    opt_yearOffset = opt_yearOffset || 0;
    var dateObj = new Date(date);

    var years = dateObj.getUTCFullYear();
    var months = dateObj.getUTCMonth();
    var days = dateObj.getUTCDate();
    var hours = dateObj.getUTCHours();
    var minutes = dateObj.getUTCMinutes();
    var seconds = dateObj.getUTCSeconds();
    var milliseconds = dateObj.getUTCMilliseconds();

    months -= (yearStartMonth - 1);
    return Date.UTC(years + opt_yearOffset, months, days, hours, minutes, seconds, milliseconds);
  }
  return date;
};


/**
 * Check if month of passed timestamp falls into fiscal year range,
 * and if not, set timestamp's year value by previous year.
 *
 * @param {number} date - Calendar UTC timestamp.
 * @param {number} yearStartMonth - Number of month (1 - 12).
 * @return {number} - Timestamp with correct fiscal year value.
 */
anychart.utils.updateFiscalYear = function(date, yearStartMonth) {
  if (yearStartMonth > 1) {
    var dateObj = new Date(date);
    var month = dateObj.getUTCMonth();

    if (month < (yearStartMonth - 1)) {
      var year = dateObj.getUTCFullYear();
      dateObj.setUTCFullYear(year - 1);
    }

    return dateObj.getTime();
  }
  return date;
};


/**
 * Creates a goog interval from StockInterval and count.
 * @param {anychart.enums.Interval} unit
 * @param {number} count
 * @return {!goog.date.Interval}
 */
anychart.utils.getIntervalFromInfo = function(unit, count) {
  var u, c;
  switch (unit) {
    case anychart.enums.Interval.YEAR:
      u = goog.date.Interval.YEARS;
      c = count;
      break;
    case anychart.enums.Interval.SEMESTER:
      u = goog.date.Interval.MONTHS;
      c = count * 6;
      break;
    case anychart.enums.Interval.QUARTER:
      u = goog.date.Interval.MONTHS;
      c = count * 3;
      break;
    case anychart.enums.Interval.MONTH:
      u = goog.date.Interval.MONTHS;
      c = count;
      break;
    case anychart.enums.Interval.THIRD_OF_MONTH:
      // roughly
      u = goog.date.Interval.DAYS;
      c = count * 10;
      break;
    case anychart.enums.Interval.WEEK:
      u = goog.date.Interval.DAYS;
      c = count * 7;
      break;
    case anychart.enums.Interval.DAY:
      u = goog.date.Interval.DAYS;
      c = count;
      break;
    case anychart.enums.Interval.HOUR:
      u = goog.date.Interval.HOURS;
      c = count;
      break;
    case anychart.enums.Interval.MINUTE:
      u = goog.date.Interval.MINUTES;
      c = count;
      break;
    case anychart.enums.Interval.SECOND:
      u = goog.date.Interval.SECONDS;
      c = count;
      break;
    case anychart.enums.Interval.MILLISECOND:
      u = goog.date.Interval.SECONDS;
      c = count / 1000;
      break;
    default:
      u = goog.date.Interval.YEARS;
      c = count;
      break;
  }
  return new goog.date.Interval(u, c);
};


/**
 * Returns increased interval value.
 *
 * @example
 *  1) {unit: 'second', count: 1} -> {unit: 'second', count: 2}
 *  2) {unit: 'second', count: 59} -> {unit: 'minute', count: 1}
 *  3) {unit: 'hour', count: 23} -> {unit: 'day', count: 1}
 *  4) {unit: 'day', count: 29} -> {unit: 'month', count: 1}
 *  5) {unit: 'month', count: 11} -> {unit: 'year', count: 1}
 *
 * @param {anychart.enums.Interval} unit - Interval unit.
 * @param {number} count - Interval unit count.
 * @return {{unit: anychart.enums.Interval, count: number}} - Increased interval.
 */
anychart.utils.getIncreasedIntervalValue = function(unit, count) {
  switch (unit) {
    case  anychart.enums.Interval.MILLISECOND:
      // 1000 iterations will be a lot. Go to seconds.
      unit = anychart.enums.Interval.SECOND;
      count = 1;
      break;
    case  anychart.enums.Interval.SECOND:
      if (count < 59) {
        count++;
      } else {
        count = 1;
        unit = anychart.enums.Interval.MINUTE;
      }
      break;
    case  anychart.enums.Interval.MINUTE:
      if (count < 59) {
        count++;
      } else {
        count = 1;
        unit = anychart.enums.Interval.HOUR;
      }
      break;
    case  anychart.enums.Interval.HOUR:
      if (count < 23) {
        count++;
      } else {
        count = 1;
        unit = anychart.enums.Interval.DAY;
      }
      break;
    case  anychart.enums.Interval.DAY:
      if (count < 29) {
        count++;
      } else {
        count = 1;
        unit = anychart.enums.Interval.MONTH;
      }
      break;
    case  anychart.enums.Interval.MONTH:
      if (count < 11) {
        count++;
      } else {
        count = 1;
        unit = anychart.enums.Interval.YEAR;
      }
      break;
    default:
      count++;
      break;
  }

  return {
    unit: unit,
    count: count
  };
};


/**
 * Returns closest aligned pixel.
 * @param {number} value
 * @param {number|boolean} thickness
 * @param {boolean=} opt_invert
 * @return {number}
 */
anychart.utils.applyPixelShift = function(value, thickness, opt_invert) {
  var shift = (thickness & 1) / 2;
  if (value % 1 >= 0.5)
    return Math.ceil(value) - (opt_invert ? -shift : shift);
  else
    return Math.floor(value) + (opt_invert ? -shift : shift);
};


/**
 * Applies pixel shift to y coordinate in aim to align series bottom (or top in case of baseline being above start value) horizontal line to axis tick
 * @param {number} value Y coordinate to offset
 * @param {number=} opt_compareValue Value to compare with to decide which way to round value
 * @return {number}
 */
anychart.utils.applyPixelShiftToYCoodrinate = function(value, opt_compareValue) {
  value = anychart.utils.applyPixelShift(value, 1);
  value = (goog.isDef(opt_compareValue) && value < opt_compareValue) ? Math.floor(value) : Math.ceil(value);
  return value;
};


/**
 * Applies pixel shift to the rect.
 * @param {!anychart.math.Rect} rect
 * @param {number} thickness
 * @return {!anychart.math.Rect}
 */
anychart.utils.applyPixelShiftToRect = function(rect, thickness) {
  var right = rect.left + rect.width;
  var bottom = rect.top + rect.height;
  rect.left = anychart.utils.applyPixelShift(rect.left, thickness);
  rect.top = anychart.utils.applyPixelShift(rect.top, thickness);
  rect.width = anychart.utils.applyPixelShift(right, thickness) - rect.left;
  rect.height = anychart.utils.applyPixelShift(bottom, thickness) - rect.top;
  return rect;
};


/**
 * Apply offset to the position depending on an anchor.
 * @param {anychart.math.Coordinate} position Position to be modified.
 * @param {?anychart.enums.Anchor} anchor Anchor.
 * @param {number} offsetX X offset.
 * @param {number} offsetY Y offset.
 * @return {anychart.math.Coordinate} Modified position.
 */
anychart.utils.applyOffsetByAnchor = function(position, anchor, offsetX, offsetY) {
  switch (anchor) {
    case anychart.enums.Anchor.LEFT_TOP:
    case anychart.enums.Anchor.LEFT_CENTER:
    case anychart.enums.Anchor.CENTER_TOP:
    case anychart.enums.Anchor.CENTER:
      position.x += offsetX;
      position.y += offsetY;
      break;

    case anychart.enums.Anchor.LEFT_BOTTOM:
    case anychart.enums.Anchor.CENTER_BOTTOM:
      position.x += offsetX;
      position.y -= offsetY;
      break;

    case anychart.enums.Anchor.RIGHT_CENTER:
    case anychart.enums.Anchor.RIGHT_TOP:
      position.x -= offsetX;
      position.y += offsetY;
      break;

    case anychart.enums.Anchor.RIGHT_BOTTOM:
      position.x -= offsetX;
      position.y -= offsetY;
      break;

    default:
      break;
  }
  return position;
};


/**
 * Returns first defined argument.
 * @param {...*} var_args .
 * @return {*}
 */
anychart.utils.getFirstDefinedValue = function(var_args) {
  for (var i = 0, len = arguments.length; i < len; i++) {
    var a = arguments[i];
    if (goog.isDef(a)) return a;
  }
};


/**
 * Returns first not-null argument.
 * @param {...*} var_args .
 * @return {*}
 */
anychart.utils.getFirstNotNullValue = function(var_args) {
  for (var i = 0, len = arguments.length; i < len; i++) {
    var a = arguments[i];
    if (goog.isDefAndNotNull(a)) return a;
  }
};


/**
 * Returns first defined argument, recurse in arrays.
 * @param {...*} var_args .
 * @return {*}
 */
anychart.utils.getFirstDefinedValueRecursive = function(var_args) {
  for (var i = 0, len = arguments.length; i < len; i++) {
    var a = arguments[i];
    if (goog.isArray(a))
      a = anychart.utils.getFirstDefinedValueRecursive.apply(null, a);
    if (goog.isDefAndNotNull(a))
      return a;
  }
};


/**
 * Returns first not-null argument, recurse in arrays.
 * @param {...*} var_args .
 * @return {*}
 */
anychart.utils.getFirstNotNullValueRecursive = function(var_args) {
  for (var i = 0, len = arguments.length; i < len; i++) {
    var a = arguments[i];
    if (goog.isArray(a))
      a = anychart.utils.getFirstDefinedValueRecursive.apply(null, a);
    if (goog.isDefAndNotNull(a))
      return a;
  }
};


/**
 * Does a recursive clone of an object.
 *
 * @param {*} obj Object to clone.
 * @return {*} Clone of the input object.
 */
anychart.utils.recursiveClone = function(obj) {
  var res;
  var type = goog.typeOf(obj);
  if (type == 'array') {
    res = [];
    for (var i = 0; i < obj.length; i++) {
      if (i in obj)
        res[i] = anychart.utils.recursiveClone(obj[i]);
    }
  } else if (type == 'object') {
    res = {};
    for (var key in obj) {
      if (obj.hasOwnProperty(key))
        res[key] = anychart.utils.recursiveClone(obj[key]);
    }
  } else {
    return obj;
  }

  return res;
};


/**
 * Does a recursive clone of an object considering object to extend.
 * NOTE: ignores closure_uid generated to object with goog.getUid().
 *
 * @param {T} obj Object to clone.
 * @param {T=} opt_extendObj - Object to provide extend info.
 * @return {T} Clone of the input object merged with opt_extendObj.
 * @template T
 */
anychart.utils.recursiveExtend = function(obj, opt_extendObj) {
  var res, ext;
  var type = goog.typeOf(obj);
  if (type == 'array') {
    ext = (goog.typeOf(opt_extendObj) == 'array') ? opt_extendObj : [];
    res = [];
    var len = Math.max(obj.length, ext.length);
    for (var i = 0; i < len; i++) {
      res[i] = anychart.utils.recursiveExtend(obj[i], ext[i]);
    }
  } else if (type == 'object') {
    ext = (goog.typeOf(opt_extendObj) == 'object') ? opt_extendObj : {};
    res = {};
    var key;
    for (key in obj) {
      if (obj.hasOwnProperty(key) && !(goog.string.startsWith(key, 'closure_uid')))
        res[key] = anychart.utils.recursiveExtend(obj[key], ext[key]);
    }
    for (key in ext) {
      if (ext.hasOwnProperty(key) && !(key in res) && !(goog.string.startsWith(key, 'closure_uid')))
        //This case is possible when opt_extendObj has the field, but obj has not.
        res[key] = anychart.utils.recursiveClone(ext[key]);
    }
  } else {
    return goog.isDef(opt_extendObj) ? opt_extendObj : obj;
  }

  return res;
};


/**
 * Create and fills an array or object with value.
 * @param {Object|number} fieldsOrLength
 * @param {*} value
 * @param {boolean=} opt_forceObject
 * @return {!(Object|Array)}
 */
anychart.utils.getFilled = function(fieldsOrLength, value, opt_forceObject) {
  var i, target;
  if (goog.isNumber(fieldsOrLength)) {
    target = opt_forceObject ? {} : [];
    for (i = 0; i < fieldsOrLength; i++) {
      target[i] = value;
    }
  } else {
    target = {};
    for (i in fieldsOrLength) {
      target[i] = value;
    }
  }
  return target;
};


/**
 * Define if passed value fit to the none definition.
 * @param {*} value Value to define.
 * @return {boolean} Is passed value fit to the none definition.
 */
anychart.utils.isNone = function(value) {
  return value === null || (goog.isString(value) && value.toLowerCase() == 'none');
};


/**
 * Extracts thickness of stroke. Default is 1.
 * @param {acgraph.vector.Stroke|string} stroke - Stroke.
 * @return {number} - Thickness.
 */
anychart.utils.extractThickness = function(stroke) {
  var normalized = acgraph.vector.normalizeStroke(stroke);
  return anychart.utils.isNone(normalized) ? 0 :
      goog.isObject(normalized) ?
          acgraph.vector.getThickness(normalized) : 1;
};


/**
 * Anychart default formatter.
 * @this {{value: * }}
 * @return {*}
 */
anychart.utils.DEFAULT_FORMATTER = function() {
  return this['value'];
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


/**
 * Decapitalize string.
 * @param {string=} str
 * @return {string} Decapitalized string.
 */
anychart.utils.decapitalize = function(str) {
  return String(str.charAt(0)).toLowerCase() + String(str.substr(1));
};


/**
 * Checks whether separator is valid.
 * Throws an error if invalid.
 * @param {string} separator
 * @return {boolean}
 */
anychart.utils.checkSeparator = function(separator) {
  var res = true;
  if (separator.indexOf('\"') != -1) {
    anychart.core.reporting.error(anychart.enums.ErrorCode.CSV_DOUBLE_QUOTE_IN_SEPARATOR);
    res = false;
  }
  return res;
};


/**
 * Escapes values.
 * @param {Array} row Array of values.
 * @param {string} colSep
 * @param {string} rowSep
 * @param {number} length
 * @param {Array=} opt_headers - Array of headers.
 * @param {(Object.<string, function(*, *=):string>|function(*, *):string)=} opt_formats
 * @return {string}
 * @private
 */
anychart.utils.toCsvRow_ = function(row, colSep, rowSep, length, opt_headers, opt_formats) {
  for (var i = 0; i < length; i++) {
    var value = row[i];
    var header = opt_headers ? opt_headers[i] : void 0;

    if (opt_formats && header) {
      if (goog.isFunction(opt_formats)) {
        value = opt_formats(header, value);
      } else if (goog.typeOf(opt_formats) == 'object') {
        var headerProcessor = opt_formats[header];
        if (headerProcessor) {
          value = headerProcessor(value);
        }
      }
    }

    if (goog.isDefAndNotNull(value)) {
      if (!goog.isString(value))
        value = String(value);
      if (value.indexOf(colSep) != -1 || value.indexOf(rowSep) != -1) {
        value = value.split('"').join('""');
        value = '"' + value + '"';
      }
    } else {
      value = '';
    }
    row[i] = value;
  }
  return row.join(colSep);
};


/**
 * Serializes table to a CSV string.
 * @param {Array} headers
 * @param {Array.<Array>} data
 * @param {*} settings
 * @return {string}
 */
anychart.utils.serializeCsv = function(headers, data, settings) {
  var rowSep = (settings && settings['rowsSeparator']) || '\n';
  var colSep = (settings && settings['columnsSeparator']) || ',';
  var noHeader = (settings && settings['ignoreFirstRow']) || false;
  var formats = (settings && settings['formats']) || void 0;
  if (!data.length || !anychart.utils.checkSeparator(rowSep) || !anychart.utils.checkSeparator(colSep))
    return '';

  var strings = [];
  if (!noHeader) {
    strings.push(anychart.utils.toCsvRow_(headers, colSep, rowSep, headers.length));
  }

  for (var i = 0; i < data.length; i++) {
    strings.push(anychart.utils.toCsvRow_(data[i], colSep, rowSep, headers.length, headers, formats));
  }
  return strings.join(rowSep);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  XML <-> JSON
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Built-in XML node types enumeration.
 * @enum {number}
 * @private
 */
anychart.utils.XmlNodeType_ = {
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
  var node, val;
  if (goog.isString(xml)) {
    node = goog.dom.xml.loadXml(xml);
  } else
    node = xml;

  if (!node) {
    return null;
  }

  // parsing node type
  switch (node.nodeType) {
    case anychart.utils.XmlNodeType_.ELEMENT_NODE:
      var result = {};
      var resultIsArray = !!node.getAttribute(anychart.utils.ARRAY_IDENTIFIER_ATTR_NAME_);
      if (resultIsArray) {
        result = [];
      }
      var multiProp = {};
      var i, name, len, onlyText = true;

      len = node.childNodes.length;
      var textValue = '';
      // collecting subnodes
      for (i = 0; i < len; i++) {
        var childNode = node.childNodes[i];
        var subnode = anychart.utils.xml2json(childNode);
        var subNodeName = childNode.nodeName;
        if (subNodeName.charAt(0) == '#') {
          textValue += subnode;
        } else if (resultIsArray && subNodeName == 'item') {
          onlyText = false;
          val = subnode;
          if (val == '')
            result.push(val);
          else if (!goog.isArray(val) && !isNaN(+val))
            result.push(+val);
          else if (val == 'true')
            result.push(true);
          else if (val == 'false')
            result.push(false);
          else if (val == 'null')
            result.push(null);
          else
            result.push(val);
        } else if ((!goog.isNull(subnode) || anychart.utils.isNullNodeAllowed(subNodeName)) && !resultIsArray) {
          onlyText = false;
          var names;
          name = anychart.utils.toCamelCase(subNodeName, true);
          if (names = anychart.utils.getArrayPropName_(name)) {
            var element = subnode[names[1]];
            if (!goog.isArray(element)) {
              if (goog.isDef(element))
                element = [element];
              else
                element = [];
            }
            result[names[0]] = element;
          } else if (name in result) {
            if (multiProp[name]) {
              result[name].push(subnode);
            } else {
              result[name] = [result[name], subnode];
              multiProp[name] = true;
            }
          } else {
            result[name] = subnode;
          }
        }
      }

      len = (node.attributes == null) ? 0 : node.attributes.length;
      // collecting attributes
      for (i = 0; i < len; i++) {
        /** @type {Attr} */
        var attr = node.attributes[i];
        name = String(attr.nodeName).toLowerCase();

        /*
         This condition fixes the following case:
         If some text contains characters like '\n', it turns to xml node with CDATA, not attribute.
         Safari adds in every node empty attribute 'xmlns'.
         It means that node 'text' becomes an object after restoration, not just a text value, and title becomes '[object Object]'
         */
        if (name == 'xmlns' || name == anychart.utils.ARRAY_IDENTIFIER_ATTR_NAME_) continue;

        name = anychart.utils.toCamelCase(attr.nodeName, true);

        if (!(name in result)) {
          val = anychart.utils.unescapeString(attr.value);
          if (val == '')
            result[name] = val;
          else if (!isNaN(+val)) {
            /*If value has leading zero ('00' or '0x10') - treat it as string, DVF-3829.*/
            if (val.length > 1 && val.charAt(0) == '0' && (+val <= 0 || +val >= 1))
              result[name] = val;
            else
              result[name] = +val;
          }
          else if (val == 'true')
            result[name] = true;
          else if (val == 'false')
            result[name] = false;
          else if (val == 'null')
            result[name] = null;
          else
            result[name] = val;
          onlyText = false;
        }
      }

      return onlyText ? (textValue.length > 0 ? anychart.utils.unescapeString(textValue) : {}) : result;
    case anychart.utils.XmlNodeType_.TEXT_NODE:
      var value = anychart.utils.trim(node.nodeValue);
      return (value == '') ? null : value;
    case anychart.utils.XmlNodeType_.CDATA_SECTION_NODE:
      return node.nodeValue;
    case anychart.utils.XmlNodeType_.DOCUMENT_NODE:
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
  var root = anychart.utils.json2xml_(json, opt_rootNodeName || 'anychart', result);
  if (root) {
    if (!opt_rootNodeName)
      root.setAttribute('xmlns', 'http://anychart.com/schemas/8.7.1/xml-schema.xsd');
    result.appendChild(root);
  }
  return opt_returnAsXmlNode ? result : goog.dom.xml.serialize(result);
};


/**
 * RegExp of what we allow to be serialized as an xml attribute.
 * @type {RegExp}
 * @private
 */
anychart.utils.ACCEPTED_BY_ATTRIBUTE_ = /^[^<&"\n\r–]*$/;


/**
 * Name of attribute that specified xml node as array structure.
 * @type {string}
 * @private
 */
anychart.utils.ARRAY_IDENTIFIER_ATTR_NAME_ = 'treat_as_array';


/**
 * Converts JSON object to an XML Node tree or String (string by default).
 * @param {Object|string|number} json
 * @param {string} rootNodeName
 * @param {Document} doc
 * @return {!Node}
 * @private
 */
anychart.utils.json2xml_ = function(json, rootNodeName, doc) {
  rootNodeName = anychart.utils.toXmlCase(rootNodeName);
  var root = doc.createElement(rootNodeName);
  var i, j;
  if (goog.isString(json) || goog.isNumber(json)) {
    root.appendChild(doc.createCDATASection(goog.string.escapeString(String(json))));
  } else if (goog.isArray(json)) {
    root.setAttribute(anychart.utils.ARRAY_IDENTIFIER_ATTR_NAME_, 'true');
    for (i = 0; i < json.length; i++) {
      if (goog.isDef(json[i])) {
        root.appendChild(anychart.utils.json2xml_(json[i], 'item', doc));
      }
    }
  } else if (goog.isDefAndNotNull(json)) {
    for (i in json) {
      if (json.hasOwnProperty(i)) {
        var child = json[i];
        var nodeNames, grouper, itemName;
        if (goog.isArray(child) && (nodeNames = anychart.utils.getNodeNames_(i))) {
          grouper = doc.createElement(nodeNames[0]);
          root.appendChild(grouper);
          itemName = nodeNames[1];
          for (j = 0; j < child.length; j++) {
            grouper.appendChild(anychart.utils.json2xml_(child[j], itemName, doc));
          }
        } else if (goog.isDef(child)) {
          if (goog.isObject(child) || !anychart.utils.ACCEPTED_BY_ATTRIBUTE_.test(child)) {
            root.appendChild(anychart.utils.json2xml_(child, i, doc));
          } else {
            if (goog.isString(child))
              child = goog.string.escapeString(String(child));
            root.setAttribute(anychart.utils.toXmlCase(i), child);
          }
        }
      }
    }
  }
  return root;
};


/**
 * Unescapes strings escapes by goog.string.escapeString() method.
 * @param {string} str String to unescape.
 * @return {string} Unescaped string.
 */
anychart.utils.unescapeString = function(str) {
  return str.replace(/\\([0bfnrt"'\\]|x([0-9a-fA-F]{2})|u([0-9a-fA-F]{4}))/g, function(match, sym, hex, utf) {
    var c = sym.charAt(0);
    switch (c) {
      case '0':
        return '\0';
      case 'b':
        return '\b';
      case 'f':
        return '\f';
      case 'n':
        return '\n';
      case 'r':
        return '\r';
      case 't':
        return '\t';
      case '"':
        return '"';
      case '\'':
        return '\'';
      case '\\':
        return '\\';
      case 'x':
        return String.fromCharCode(parseInt(hex, 16));
      case 'u':
        return String.fromCharCode(parseInt(utf, 16));
    }
  });
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
      return ['series_list', 'series'];
    case 'annotationsList':
      return ['annotations_list', 'annotation'];
    case 'keys':
      return ['keys', 'key'];
    case 'data':
      return ['data', 'point'];
    case 'lineAxesMarkers':
      return ['line_axes_markers', 'line_axes_marker'];
    case 'rangeAxesMarkers':
      return ['range_axes_markers', 'range_axes_marker'];
    case 'textAxesMarkers':
      return ['text_axes_markers', 'text_axes_marker'];
    case 'xGrids':
      return ['x_grids', 'grid'];
    case 'yGrids':
      return ['y_grids', 'grid'];
    case 'xMinorGrids':
      return ['x_minor_grids', 'grid'];
    case 'yMinorGrids':
      return ['y_minor_grids', 'grid'];
    case 'xAxes':
      return ['x_axes', 'axis'];
    case 'yAxes':
      return ['y_axes', 'axis'];
    case 'axes':
      return ['axes', 'axis'];
    case 'bars':
      return ['bar_pointers', 'pointer'];
    case 'markers':
      return ['marker_pointers', 'pointer'];
    case 'needles':
      return ['needle_pointers', 'pointer'];
    case 'knobs':
      return ['knob_pointers', 'pointer'];
    case 'pointers':
      return ['pointers', 'pointer'];
    case 'scaleBars':
      return ['scale_bars', 'scale_bar'];
    case 'points':
      return ['points', 'point'];
    case 'scales':
      return ['scales', 'scale'];
    case 'colorScales':
      return ['color_scales', 'scale'];
    case 'explicit':
      return ['explicit', 'tick'];
    case 'values':
      return ['values', 'value'];
    case 'names':
      return ['names', 'name'];
    case 'ranges':
      return ['ranges', 'range'];
    case 'chartLabels':
      return ['chart_labels', 'label'];
    case 'items':
      return ['items', 'item'];
    case 'columns':
      return ['columns', 'column'];
    case 'colors':
      return ['colors', 'color'];
    case 'children':
      return ['children', 'data_item'];
    case 'index':
      return ['index', 'key'];
    case 'outliers':
      return ['outliers', 'outlier'];
    case 'inverted':
      return ['inverted_list', 'inverted'];
    case 'drillTo':
      return ['drill_to', 'item'];
    case 'extraClassNames':
      return ['extra_class_names', 'class_name'];
    case 'dependsOn':
      return ['depends_on', 'item'];
    case 'precision':
      return ['precision_list', 'precision'];
    case 'labels':
      return ['quarter_labels', 'label'];
    case 'weights':
      return ['weights', 'weight'];
    case 'angles':
      return ['angles', 'angle'];
    case 'levels':
      return ['levels', 'level'];
    case 'xLabels':
      return ['x_labels', 'item'];
    case 'yLabels':
      return ['y_labels', 'item'];
  }
  return null;
};


/**
 * Checks if passed name is a grouper and returns correct property name in case it is.
 * @param {string} nodeName
 * @return {?Array.<string>} Array of [propertyName, itemName] or null.
 * @private
 */
anychart.utils.getArrayPropName_ = function(nodeName) {
  switch (nodeName) {
    case 'seriesList':
      return ['series', 'series'];
    case 'annotationsList':
      return ['annotationsList', 'annotation'];
    case 'keys':
      return ['keys', 'key'];
    case 'data':
      return ['data', 'point'];
    case 'lineAxesMarkers':
      return ['lineAxesMarkers', 'lineAxesMarker'];
    case 'rangeAxesMarkers':
      return ['rangeAxesMarkers', 'rangeAxesMarker'];
    case 'textAxesMarkers':
      return ['textAxesMarkers', 'textAxesMarker'];
    case 'xGrids':
      return ['xGrids', 'grid'];
    case 'yGrids':
      return ['yGrids', 'grid'];
    case 'xMinorGrids':
      return ['xMinorGrids', 'grid'];
    case 'yMinorGrids':
      return ['yMinorGrids', 'grid'];
    case 'xAxes':
      return ['xAxes', 'axis'];
    case 'yAxes':
      return ['yAxes', 'axis'];
    case 'axes':
      return ['axes', 'axis'];
    case 'barPointers':
      return ['bars', 'pointer'];
    case 'markerPointers':
      return ['markers', 'pointer'];
    case 'needlePointers':
      return ['needles', 'pointer'];
    case 'knobPointers':
      return ['knobs', 'pointer'];
    case 'pointers':
      return ['pointers', 'pointer'];
    case 'scaleBars':
      return ['scaleBars', 'scaleBar'];
    case 'points':
      return ['points', 'point'];
    case 'scales':
      return ['scales', 'scale'];
    case 'explicit':
      return ['explicit', 'tick'];
    case 'values':
      return ['values', 'value'];
    case 'names':
      return ['names', 'name'];
    case 'ranges':
      return ['ranges', 'range'];
    case 'chartLabels':
      return ['chartLabels', 'label'];
    case 'items':
      return ['items', 'item'];
    case 'columns':
      return ['columns', 'column'];
    case 'colors':
      return ['colors', 'color'];
    case 'children':
      return ['children', 'dataItem'];
    case 'index':
      return ['index', 'key'];
    case 'outliers':
      return ['outliers', 'outlier'];
    case 'invertedList':
      return ['inverted', 'inverted'];
    case 'colorScales':
      return ['colorScales', 'scale'];
    case 'drillTo':
      return ['drillTo', 'item'];
    case 'extraClassNames':
      return ['extraClassNames', 'className'];
    case 'dependsOn':
      return ['dependsOn', 'item'];
    case 'precisionList':
      return ['precision', 'precision'];
    case 'quarterLabels':
      return ['labels', 'label'];
    case 'weights':
      return ['weights', 'weight'];
    case 'angles':
      return ['angles', 'angle'];
    case 'levels':
      return ['levels', 'level'];
    case 'xLabels':
      return ['xLabels', 'item'];
    case 'yLabels':
      return ['yLabels', 'item'];
  }
  return null;
};


/**
 * Returns true if the node with name should be kept in JSON even if it is empty in XML and false otherwise.
 * @param {string} name
 * @return {boolean}
 */
anychart.utils.isNullNodeAllowed = function(name) {
  return name == 'point';
};


/**
 * Converts a string from selector-case to camelCase (e.g. from
 * "multi-part-string" or "multi_part_string" to "multiPartString"), useful for converting
 * CSS selectors and HTML dataset keys to their equivalent JS properties.
 * @param {string} str The string in selector-case form.
 * @param {boolean=} opt_onlyUnderscores Remove only underscores. For xml attributes.
 * @return {string} The string in camelCase form.
 */
anychart.utils.toCamelCase = function(str, opt_onlyUnderscores) {
  var pattern = opt_onlyUnderscores ? /[_]([a-z])/g : /[-_]([a-z|\d])/g;
  return String(str).replace(pattern, function(all, match) {
    return match.toUpperCase();
  });
};


/**
 * Converts a string from camelCase to selector-case (e.g. from
 * "multiPartString" to "multi-part-string"), useful for converting JS
 * style and dataset properties to equivalent CSS selectors and HTML keys.
 * @param {string} str The string in camelCase form.
 * @return {string} The string in selector-case form.
 */
anychart.utils.toXmlCase = function(str) {
  return String(str).replace(/([A-Z])/g, '_$1').toLowerCase();
};


/**
 * CRC table.
 * @type {Array}
 * @private
 */
anychart.utils.crcTable_ = null;


/**
 * Creates crc32 table.
 * @return {Array} crc table.
 * @private
 */
anychart.utils.createCRCTable_ = function() {
  var c;
  var crcTable = [];
  for (var n = 0; n < 256; n++) {
    c = n;
    for (var k = 0; k < 8; k++) {
      c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
    }
    crcTable[n] = c;
  }
  return crcTable;
};


/**
 * Takes argument and returns it crc32 checksum.
 * @param {string} str Input string.
 * @return {string} crc32b.
 */
anychart.utils.crc32 = function(str) {
  if (!anychart.utils.crcTable_) anychart.utils.crcTable_ = anychart.utils.createCRCTable_();
  var crc = 0 ^ (-1), i = 0;
  while (i < str.length)
    crc = (crc >>> 8) ^ anychart.utils.crcTable_[(crc ^ str.charCodeAt(i++)) & 0xFF];
  return ((crc ^ (-1)) >>> 0).toString(16);
};


/**
 * Crypted salt
 * @type {Array.<number>}
 * @private
 */
anychart.utils.crc32Salt_ = [45, 113, 99, 117, 108, 106, 110, 124, 109, 118, 35, 120, 99, 111, 91, 123, 85];


/**
 * Decrypted salt.
 * @type {?string}
 * @private
 */
anychart.utils.decryptedSalt_ = null;


/**
 * Decrypt salt.
 * @return {string} Decrypted salt.
 */
anychart.utils.getSalt = function() {
  if (anychart.utils.decryptedSalt_) return anychart.utils.decryptedSalt_;
  var l = anychart.utils.crc32Salt_.length;
  var mod = l % 2 == 0 ? l / 2 : (l + 1 / 2);
  return anychart.utils.decryptedSalt_ = goog.array.map(goog.array.map(anychart.utils.crc32Salt_, function(v, i) {
    var sign = i % 2 ? -1 : 1;
    return v + sign * (i % mod);
  }), function(v) {
    return String.fromCharCode(v);
  }).join('');
};


/**
 * Caches of static datetime formatter.
 * @type {Object.<string, goog.i18n.DateTimeFormat>}
 * @private
 */
anychart.utils.formatDateTimeCache_ = {};


/**
 * Cache if zero timezone.
 * @type {!goog.i18n.TimeZone}
 * @private
 */
anychart.utils.UTCTimeZoneCache_;


/**
 * Global tooltips registry. Used to make anychart.utils.hideTooltips() work correctly.
 * @type {Object.<anychart.core.ui.Tooltip>}
 */
anychart.utils.tooltipsRegistry = {};


/**
 * Tooltip local containers registry.
 * @type {Object.<anychart.core.utils.LocalTooltipContainer>}
 */
anychart.utils.tooltipContainersRegistry = {};


/**
 * Hide all tooltips.
 * @param {boolean=} opt_force Ignore tooltips hide delay.
 */
anychart.utils.hideTooltips = function(opt_force) {
  for (var key in anychart.utils.tooltipsRegistry) {
    if (anychart.utils.tooltipsRegistry.hasOwnProperty(key)) {
      var tooltip = anychart.utils.tooltipsRegistry[key];
      if (!tooltip.isDisposed())
        tooltip.hide(opt_force);
    }
  }
};


/**
 * Install default html tooltip style.
 * DEV NOTE: this code is actually a modification of goog.style.installSafeStyleSheet().
 */
anychart.utils.installHtmlTooltipStyle = function() {
  if (!anychart.utils.htmlTooltipStyleIsInstalled_) {
    anychart.utils.htmlTooltipStyleIsInstalled_ = true;

    var dh = goog.dom.getDomHelper();
    var head = dh.getElementsByTagNameAndClass(goog.dom.TagName.HEAD)[0];

    // In opera documents are not guaranteed to have a head element, thus we
    // have to make sure one exists before using it.
    if (!head) {
      var body = dh.getElementsByTagNameAndClass(goog.dom.TagName.BODY)[0];
      head = dh.createDom(goog.dom.TagName.HEAD);
      body.parentNode.insertBefore(head, body);
    }
    var el = dh.createDom(goog.dom.TagName.STYLE);

    el.innerHTML = '.anychart-tooltip {' +
        'border-radius: 3px;' +
        'padding: 5px 10px;' +
        'background: rgba(33, 33, 33, 0.7);' +
        'border: none;' +
        'display: inline-block;' +
        'box-sizing: border-box;' +
        'letter-spacing: normal;' +
        'color: #fff;' +
        'font-family: Verdana, Helvetica, Arial, \'sans-serif\';' +
        'font-size: 12px;' +
        'position: absolute;' +
        'pointer-events: none;' +
        'margin: 10px 0px 10px 10px;' +
        '}' +
        '.anychart-tooltip-separator {' +
        'color: rgba(206, 206, 206, 0.3);' +
        'border: none;' +
        'height: 1px;' +
        'margin: 5px 0;' +
        '}' +
        '.anychart-tooltip-title{' +
        'font-size: 14px;' +
        '}';

    //Inserting as first node to prevent overrinding of css user inclusion.
    dh.insertChildAt(head, el, 0);
  }
};


/**
 * Returns the keys of the object/map/hash.
 *
 * @param {*} obj The object from which to get the keys.
 * @return {!Array<string>} Array of property keys.
 */
anychart.utils.getKeys = function(obj) {
  var res = [];
  var i = 0;
  for (var key in obj) {
    if (obj.hasOwnProperty(key))
      res[i++] = key;
  }
  return res;
};


/**
 * Returns interval range.
 * @param {anychart.enums.Interval} unit
 * @param {number} count
 * @return {number}
 */
anychart.utils.getIntervalRange = function(unit, count) {
  switch (unit) {
    case anychart.enums.Interval.YEAR:
      return count * 1000 * 60 * 60 * 24 * 365.25;
    case anychart.enums.Interval.SEMESTER:
      return count * 1000 * 60 * 60 * 24 * 365.25 / 2;
    case anychart.enums.Interval.QUARTER:
      return count * 1000 * 60 * 60 * 24 * 365.25 / 4;
    case anychart.enums.Interval.MONTH:
      return count * 1000 * 60 * 60 * 24 * 365.25 / 12;
    case anychart.enums.Interval.THIRD_OF_MONTH:
      return count * 1000 * 60 * 60 * 24 * 365.25 / 36;
    case anychart.enums.Interval.WEEK:
      return count * 1000 * 60 * 60 * 24 * 7;
    case anychart.enums.Interval.DAY:
      return count * 1000 * 60 * 60 * 24;
    case anychart.enums.Interval.HOUR:
      return count * 1000 * 60 * 60;
    case anychart.enums.Interval.MINUTE:
      return count * 1000 * 60;
    case anychart.enums.Interval.SECOND:
      return count * 1000;
    case anychart.enums.Interval.MILLISECOND:
    default:
      return count;
  }
};


/**
 * Interval estimations.
 * @type {Array.<{unit: anychart.enums.Interval, range: number, basic: boolean}>}
 */
anychart.utils.INTERVAL_ESTIMATIONS = [
  {unit: anychart.enums.Interval.YEAR, range: 1000 * 60 * 60 * 24 * 365, basic: true},
  {unit: anychart.enums.Interval.SEMESTER, range: 1000 * 60 * 60 * 24 * 365 / 2, basic: false},
  {unit: anychart.enums.Interval.QUARTER, range: 1000 * 60 * 60 * 24 * 365 / 4, basic: false},
  {unit: anychart.enums.Interval.MONTH, range: 1000 * 60 * 60 * 24 * 28, basic: true},
  {unit: anychart.enums.Interval.THIRD_OF_MONTH, range: 1000 * 60 * 60 * 24 * 365 / 36, basic: false},
  {unit: anychart.enums.Interval.WEEK, range: 1000 * 60 * 60 * 24 * 7, basic: false},
  {unit: anychart.enums.Interval.DAY, range: 1000 * 60 * 60 * 24, basic: true},
  {unit: anychart.enums.Interval.HOUR, range: 1000 * 60 * 60, basic: true},
  {unit: anychart.enums.Interval.MINUTE, range: 1000 * 60, basic: true},
  {unit: anychart.enums.Interval.SECOND, range: 1000, basic: true},
  {unit: anychart.enums.Interval.MILLISECOND, range: 1, basic: true}
];


/**
 *
 * @param {anychart.enums.Interval} unit
 * @param {number=} opt_count defaults to 1.
 * @return {anychart.enums.Interval}
 */
anychart.utils.getParentInterval = function(unit, opt_count) {
  opt_count = opt_count || 1;
  var i = 0;
  for (; i < anychart.utils.INTERVAL_ESTIMATIONS.length; i++) {
    if (anychart.utils.INTERVAL_ESTIMATIONS[i].unit == unit)
      break;
  }
  return anychart.utils.INTERVAL_ESTIMATIONS[goog.math.clamp(i - opt_count, 0, anychart.utils.INTERVAL_ESTIMATIONS.length)].unit;
};


/**
 * Returns an object of [unit: anychart.enums.Interval, count: number] with estimation of the data interval passed.
 * Interval must be a valid number (not a NaN).
 * @param {number} interval
 * @return {!{unit: anychart.enums.Interval, count: number}}
 */
anychart.utils.estimateInterval = function(interval) {
  interval = Math.floor(interval);
  var estimation, largestEstimation, unit, count = 1;
  if (interval) {
    for (var i = 0; i < anychart.utils.INTERVAL_ESTIMATIONS.length; i++) {
      estimation = anychart.utils.INTERVAL_ESTIMATIONS[i];
      var divResult = interval / estimation.range;
      // we add 1 percent for rounding errors
      if (Math.floor(divResult * 1.1) >= 1) {
        largestEstimation = largestEstimation || estimation;
        if (divResult - Math.floor(divResult) < 0.15) {
          count = Math.floor(divResult);
          break;
        }
      }
    }
    if (largestEstimation != estimation && largestEstimation.basic && count > 100) {
      estimation = largestEstimation;
      count = Math.round(20 * interval / estimation.range) / 20;
    }
  }
  if (!estimation) { // very unlikely that this is a case
    unit = anychart.enums.Interval.MILLISECOND;
  } else {
    unit = estimation.unit;
  }
  return {'unit': unit, 'count': count};
};


/**
 * Returns approximate interval duration in milliseconds.
 * @param {goog.date.Interval} interval
 * @return {number}
 */
anychart.utils.getIntervalApproxDuration = function(interval) {
  var result = interval.years; // years
  result = result * 365.25 + interval.months; // months
  result = result * 365.25 / 12 + interval.days; // days
  result = result * 24 + interval.hours; // hours
  result = result * 60 + interval.minutes; // minutes
  result = result * 60 + interval.seconds; // seconds
  return result * 1000; // milliseconds
};


/**
 * @type {Array.<number>}
 */
anychart.utils.PENTAGON_COS = [
  1 + Math.cos((2 / 5 - .5) * Math.PI),
  1 + Math.cos((4 / 5 - .5) * Math.PI),
  1 + Math.cos((6 / 5 - .5) * Math.PI),
  1 + Math.cos((8 / 5 - .5) * Math.PI),
  1 + Math.cos(1.5 * Math.PI)];


/**
 * @type {Array.<number>}
 */
anychart.utils.PENTAGON_SIN = [
  1 + Math.sin((2 / 5 - .5) * Math.PI),
  1 + Math.sin((4 / 5 - .5) * Math.PI),
  1 + Math.sin((6 / 5 - .5) * Math.PI),
  1 + Math.sin((8 / 5 - .5) * Math.PI),
  1 + Math.sin(1.5 * Math.PI)];


/**
 * Method to get marker drawer.
 * @param {*} type Marker type.
 * @return {function(!acgraph.vector.Path, number, number, number, number=):!acgraph.vector.Path} Marker drawer.
 */
anychart.utils.getMarkerDrawer = function(type) {
  type = (String(type)).toLowerCase();
  switch (type) {
    case 'arrowhead':
      return function(path, x, y, radius) {
        var p1x = x + radius / 2;
        var p1y = y;
        var p2x = x - radius / 2;
        var p2y = y - radius / 3;
        var p3x = x - radius / 2;
        var p3y = y + radius / 3;

        path
            .moveTo(p1x, p1y)
            .lineTo(p2x, p2y)
            .lineTo(p3x, p3y)
            .close();

        return path;
      };
    case 'star4':
      return acgraph.vector.primitives.star4;
    case 'star6':
      return acgraph.vector.primitives.star6;
    case 'star7':
      return acgraph.vector.primitives.star7;
    case 'star10':
      return acgraph.vector.primitives.star10;
    case 'diamond':
      return acgraph.vector.primitives.diamond;
    case 'triangle-up':
      return acgraph.vector.primitives.triangleUp;
    case 'triangle-down':
      return acgraph.vector.primitives.triangleDown;
    case 'triangle-right':
      return acgraph.vector.primitives.triangleRight;
    case 'triangle-left':
      return acgraph.vector.primitives.triangleLeft;
    case 'cross':
      return acgraph.vector.primitives.cross;
    case 'diagonal-cross':
      return acgraph.vector.primitives.diagonalCross;
    case 'circle':
      return function(path, x, y, radius) {
        return acgraph.vector.primitives.pie(path, x, y, radius, 0, 360);
      };
    case 'trapezium':
      return function(path, x, y, radius) {
        var d = radius / 3;
        var halfW = radius / 2;
        var halfL = radius / 2;
        var left = x - halfW;
        var top = y - halfL;

        path.moveTo(left + d, top + radius);
        path.lineTo(left + radius - d, top + radius);
        path.lineTo(left + radius, top);
        path.lineTo(left, top);
        path.close();

        return path;
      };
    case 'pentagon':
      return function(path, x, y, radius) {
        x -= radius;
        y -= radius;
        var pentagonCos = anychart.utils.PENTAGON_COS;
        var pentagonSin = anychart.utils.PENTAGON_SIN;
        path.moveTo(x + radius * pentagonCos[0], y + radius * pentagonSin[0]);
        for (var i = 1; i < 5; i++)
          path.lineTo(x + radius * pentagonCos[i], y + radius * pentagonSin[i]);
        path.lineTo(x + radius * pentagonCos[0], y + radius * pentagonSin[0]);
        path.close();

        return path;
      };
    case 'square':
      return (
          /**
           * @param {!acgraph.vector.Path} path
           * @param {number} x
           * @param {number} y
           * @param {number} size
           * @param {number=} opt_strokeThickness
           * @return {!acgraph.vector.Path}
           */
          (function(path, x, y, size, opt_strokeThickness) {
            var left = x - size;
            var top = y - size;
            var right = x + size;
            var bottom = y + size;

            if (goog.isDef(opt_strokeThickness)) {
              opt_strokeThickness = opt_strokeThickness || 0;
              left = anychart.utils.applyPixelShift(left, opt_strokeThickness);
              top = anychart.utils.applyPixelShift(top, opt_strokeThickness);
              right = anychart.utils.applyPixelShift(right, opt_strokeThickness);
              bottom = anychart.utils.applyPixelShift(bottom, opt_strokeThickness);
            }

            path
                .moveTo(left, top)
                .lineTo(right, top)
                .lineTo(right, bottom)
                .lineTo(left, bottom)
                .lineTo(left, top)
                .close();

            return path;
          }));
    case 'v-line':
    case 'line':
      return (
          /**
           * @param {!acgraph.vector.Path} path
           * @param {number} x
           * @param {number} y
           * @param {number} size
           * @param {number=} opt_strokeThickness
           * @return {!acgraph.vector.Path}
           */
          (function(path, x, y, size, opt_strokeThickness) {
            var height = size * 2;
            var width = height / 2;

            var halfW = width / 2;
            var halfL = height / 2;

            var left = x - halfW;
            var top = y - halfL;
            var right = left + width;
            var bottom = top + height;

            if (goog.isDef(opt_strokeThickness)) {
              opt_strokeThickness = opt_strokeThickness || 0;
              left = anychart.utils.applyPixelShift(left, opt_strokeThickness);
              top = anychart.utils.applyPixelShift(top, opt_strokeThickness);
              right = anychart.utils.applyPixelShift(right, opt_strokeThickness);
              bottom = anychart.utils.applyPixelShift(bottom, opt_strokeThickness);
            }

            path
                .moveTo(left, top)
                .lineTo(right, top)
                .lineTo(right, bottom)
                .lineTo(left, bottom)
                .lineTo(left, top)
                .close();

            return path;
          }));
    case 'arrow-up':
      return (
          /**
           * @param {!acgraph.vector.Path} path
           * @param {number} x
           * @param {number} y
           * @param {number} size
           * @param {number=} opt_strokeThickness
           * @return {!acgraph.vector.Path}
           */
          (function(path, x, y, size, opt_strokeThickness) {
            var halfSize = size / 2;
            var quarterSize = halfSize / 2;
            var xphs = x + halfSize;
            var xmhs = x - halfSize;
            var yphs = y + halfSize;
            var ymhs = y - halfSize;
            var xpqs = x + quarterSize;
            var xmqs = x - quarterSize;
            // var ypqs = y + quarterSize;
            // var ymqs = y - quarterSize;
            if (goog.isDef(opt_strokeThickness)) {
              opt_strokeThickness = opt_strokeThickness || 0;
              xphs = anychart.utils.applyPixelShift(xphs, opt_strokeThickness);
              xmhs = anychart.utils.applyPixelShift(xmhs, opt_strokeThickness);
              yphs = anychart.utils.applyPixelShift(yphs, opt_strokeThickness);
              ymhs = anychart.utils.applyPixelShift(ymhs, opt_strokeThickness);
              xpqs = anychart.utils.applyPixelShift(xpqs, opt_strokeThickness);
              xmqs = anychart.utils.applyPixelShift(xmqs, opt_strokeThickness);
              // ypqs = anychart.utils.applyPixelShift(ypqs, opt_strokeThickness);
              // ymqs = anychart.utils.applyPixelShift(ymqs, opt_strokeThickness);
              x = anychart.utils.applyPixelShift(x, opt_strokeThickness);
              y = anychart.utils.applyPixelShift(y, opt_strokeThickness);
            }
            path.moveTo(x, ymhs);
            path.lineTo(xphs, y,
                xpqs, y,
                xpqs, yphs,
                xmqs, yphs,
                xmqs, y,
                xmhs, y);
            path.close();
            return path;
          }));
    case 'arrow-down':
      return (
          /**
           * @param {!acgraph.vector.Path} path
           * @param {number} x
           * @param {number} y
           * @param {number} size
           * @param {number=} opt_strokeThickness
           * @return {!acgraph.vector.Path}
           */
          (function(path, x, y, size, opt_strokeThickness) {
            var halfSize = size / 2;
            var quarterSize = halfSize / 2;
            var xphs = x + halfSize;
            var xmhs = x - halfSize;
            var yphs = y + halfSize;
            var ymhs = y - halfSize;
            var xpqs = x + quarterSize;
            var xmqs = x - quarterSize;
            // var ypqs = y + quarterSize;
            // var ymqs = y - quarterSize;
            if (goog.isDef(opt_strokeThickness)) {
              opt_strokeThickness = opt_strokeThickness || 0;
              xphs = anychart.utils.applyPixelShift(xphs, opt_strokeThickness);
              xmhs = anychart.utils.applyPixelShift(xmhs, opt_strokeThickness);
              yphs = anychart.utils.applyPixelShift(yphs, opt_strokeThickness);
              ymhs = anychart.utils.applyPixelShift(ymhs, opt_strokeThickness);
              xpqs = anychart.utils.applyPixelShift(xpqs, opt_strokeThickness);
              xmqs = anychart.utils.applyPixelShift(xmqs, opt_strokeThickness);
              // ypqs = anychart.utils.applyPixelShift(ypqs, opt_strokeThickness);
              // ymqs = anychart.utils.applyPixelShift(ymqs, opt_strokeThickness);
              x = anychart.utils.applyPixelShift(x, opt_strokeThickness);
              y = anychart.utils.applyPixelShift(y, opt_strokeThickness);
            }
            path.moveTo(x, yphs);
            path.lineTo(xphs, y,
                xpqs, y,
                xpqs, ymhs,
                xmqs, ymhs,
                xmqs, y,
                xmhs, y);
            path.close();
            return path;
          }));
    case 'arrow-left':
      return (
          /**
           * @param {!acgraph.vector.Path} path
           * @param {number} x
           * @param {number} y
           * @param {number} size
           * @param {number=} opt_strokeThickness
           * @return {!acgraph.vector.Path}
           */
          (function(path, x, y, size, opt_strokeThickness) {
            var halfSize = size / 2;
            var quarterSize = halfSize / 2;
            var xphs = x + halfSize;
            var xmhs = x - halfSize;
            var yphs = y + halfSize;
            var ymhs = y - halfSize;
            // var xpqs = x + quarterSize;
            // var xmqs = x - quarterSize;
            var ypqs = y + quarterSize;
            var ymqs = y - quarterSize;
            if (goog.isDef(opt_strokeThickness)) {
              opt_strokeThickness = opt_strokeThickness || 0;
              xphs = anychart.utils.applyPixelShift(xphs, opt_strokeThickness);
              xmhs = anychart.utils.applyPixelShift(xmhs, opt_strokeThickness);
              yphs = anychart.utils.applyPixelShift(yphs, opt_strokeThickness);
              ymhs = anychart.utils.applyPixelShift(ymhs, opt_strokeThickness);
              // xpqs = anychart.utils.applyPixelShift(xpqs, opt_strokeThickness);
              // xmqs = anychart.utils.applyPixelShift(xmqs, opt_strokeThickness);
              ypqs = anychart.utils.applyPixelShift(ypqs, opt_strokeThickness);
              ymqs = anychart.utils.applyPixelShift(ymqs, opt_strokeThickness);
              x = anychart.utils.applyPixelShift(x, opt_strokeThickness);
              y = anychart.utils.applyPixelShift(y, opt_strokeThickness);
            }
            path.moveTo(xmhs, y);
            path.lineTo(x, yphs,
                x, ypqs,
                xphs, ypqs,
                xphs, ymqs,
                x, ymqs,
                x, ymhs);
            path.close();
            return path;
          }));
    case 'arrow-right':
      return (
          /**
           * @param {!acgraph.vector.Path} path
           * @param {number} x
           * @param {number} y
           * @param {number} size
           * @param {number=} opt_strokeThickness
           * @return {!acgraph.vector.Path}
           */
          (function(path, x, y, size, opt_strokeThickness) {
            var halfSize = size / 2;
            var quarterSize = halfSize / 2;
            var xphs = x + halfSize;
            var xmhs = x - halfSize;
            var yphs = y + halfSize;
            var ymhs = y - halfSize;
            // var xpqs = x + quarterSize;
            // var xmqs = x - quarterSize;
            var ypqs = y + quarterSize;
            var ymqs = y - quarterSize;
            if (goog.isDef(opt_strokeThickness)) {
              opt_strokeThickness = opt_strokeThickness || 0;
              xphs = anychart.utils.applyPixelShift(xphs, opt_strokeThickness);
              xmhs = anychart.utils.applyPixelShift(xmhs, opt_strokeThickness);
              yphs = anychart.utils.applyPixelShift(yphs, opt_strokeThickness);
              ymhs = anychart.utils.applyPixelShift(ymhs, opt_strokeThickness);
              // xpqs = anychart.utils.applyPixelShift(xpqs, opt_strokeThickness);
              // xmqs = anychart.utils.applyPixelShift(xmqs, opt_strokeThickness);
              ypqs = anychart.utils.applyPixelShift(ypqs, opt_strokeThickness);
              ymqs = anychart.utils.applyPixelShift(ymqs, opt_strokeThickness);
              x = anychart.utils.applyPixelShift(x, opt_strokeThickness);
              y = anychart.utils.applyPixelShift(y, opt_strokeThickness);
            }
            path.moveTo(xphs, y);
            path.lineTo(x, yphs,
                x, ypqs,
                xmhs, ypqs,
                xmhs, ymqs,
                x, ymqs,
                x, ymhs);
            path.close();
            return path;
          }));
    default:
      return acgraph.vector.primitives.star5;
  }
};


/**
 * Creates HTML Table by csv.
 * @param {string} csv - Source csv string.
 * @param {string=} opt_title - Title to be set.
 * @param {boolean=} opt_asString - Whether to represent table as string.
 * @param {Object=} opt_csvSettings - CSV settings.
 * @return {?Element} - HTML table instance or null if got some parse errors.
 */
anychart.utils.htmlTableFromCsv = function(csv, opt_title, opt_asString, opt_csvSettings) {
  var parser = new anychart.data.csv.Parser();
  var allowHeader = true;
  if (goog.isObject(opt_csvSettings)) {
    parser.rowsSeparator(/** @type {string|undefined} */(opt_csvSettings['rowsSeparator']));
    parser.columnsSeparator(/** @type {string|undefined} */(opt_csvSettings['columnsSeparator']));
    parser.ignoreTrailingSpaces(/** @type {boolean|undefined} */(opt_csvSettings['ignoreTrailingSpaces']));
    allowHeader = !(opt_csvSettings['ignoreFirstRow']);
    parser.ignoreFirstRow(allowHeader);
  }

  var result = parser.parse(csv);
  if (result) {
    var table = goog.dom.createDom('table');

    if (opt_title) {
      var caption = goog.dom.createDom('caption');
      goog.dom.append(caption, opt_title);
      goog.dom.appendChild(table, caption);
    }

    var thead, theadTr;
    if (allowHeader) {
      thead = goog.dom.createDom('thead');
      theadTr = goog.dom.createDom('tr');
      goog.dom.appendChild(thead, theadTr);
    }

    var tbody = goog.dom.createDom('tbody');

    for (var i = 0; i < result.length; i++) {
      var rows = result[i];
      var j, row;

      if (i || !allowHeader) {
        var tbodyTr = goog.dom.createDom('tr');
        for (j = 0; j < rows.length; j++) {
          row = rows[j];
          var el = goog.dom.createDom(j ? 'td' : 'th');
          goog.dom.append(el, row);
          goog.dom.appendChild(tbodyTr, el);
        }
        goog.dom.appendChild(tbody, tbodyTr);
      } else if (allowHeader) {
        for (j = 0; j < rows.length; j++) {
          row = rows[j];
          var theadTh = goog.dom.createDom('th');
          goog.dom.append(theadTh, row);
          goog.dom.appendChild(/** @type {!Element} */ (theadTr), theadTh);
        }
      }
    }

    if (allowHeader) goog.dom.appendChild(table, /** @type {!Element} */ (thead));
    goog.dom.appendChild(table, tbody);
    return table;
  }
  return null;
};


/**
 * It's super hidden name for isValidKey method.
 * @return {boolean}
 */
anychart.utils.printUtilsBoolean = function() {
  return anychart.isValidKey();
};


/**
 * Decomposes function arguments.
 * Converts list of arguments from mixed format, where first argument can be either simple option, or object with named options,
 * to array of arguments that can be applied with apply() function.
 * @param {Object} namedArguments Object that maps option names to function arguments.
 * <code>
 *   // Example
 *   {
 *   'paperSize': opt_paperSizeOrWidthOrOptions,
 *   'width': opt_paperSizeOrWidthOrOptions,
 *   'landscape': opt_landscapeOrHeight,
 *   'height': opt_landscapeOrHeight,
 *   'filename': opt_filename
 *   }
 * </code>
 * @param {(Object|*)=} opt_options Object of options (usually first argument of function).
 * @param {Object=} opt_defaults Default option values in the same format as 'namedArguments'.
 * @return {Object} Result arguments as object in the same format as 'namedArguments'.
 */
anychart.utils.decomposeArguments = function(namedArguments, opt_options, opt_defaults) {
  var result = {};
  opt_options = goog.typeOf(opt_options) == 'object' ? opt_options : null;

  goog.object.forEach(namedArguments, function(arg, name) {
    if (opt_options) {
      result[name] = goog.isDef(opt_options[name]) ? opt_options[name] : undefined;
    } else {
      result[name] = arg;
    }

    if (goog.isDef(opt_defaults)) {
      result[name] = goog.isDef(result[name]) ? result[name] : opt_defaults[name];
    }
  });

  return result;
};


/**
 * Safe instanceof.
 * @param {*} object
 * @param {*} constructor
 * @return {boolean}
 */
anychart.utils.instanceOf = acgraph.utils.instanceOf;


/**
 * Styling exceptions.
 * @type {Object.<string, string>}
 * @private
 */
anychart.utils.STYLE_EXCEPTIONS_ = {
  'decoration': 'text-decoration',
  'hAlign': 'text-anchor',
  'color': 'fill',
  'fontColor': 'fill'
};


/**
 * Converts style object to DOM-attribute style string.
 * @param {Object} obj - Settings object.
 * @return {string} - Style string.
 */
anychart.utils.toStyleString = function(obj) {
  var result = '';
  for (var key in obj) {
    var selCase = anychart.utils.STYLE_EXCEPTIONS_[key] || goog.string.toSelectorCase(key);
    result += (selCase + ': ' + obj[key] + ';');
  }
  return result;
};


/**
 *
 * @param {number} ratio - .
 * @param {number} opacity - .
 * @param {string} fontColor - .
 * @param {number=} opt_fadeStep - .
 * @param {acgraph.vector.Text.HAlign=} opt_hAlign - .
 * @return {!Array.<acgraph.vector.GradientKey>}
 */
anychart.utils.getFadeGradientKeys = function(ratio, opacity, fontColor, opt_fadeStep, opt_hAlign) {
  opt_hAlign = opt_hAlign || acgraph.vector.Text.HAlign.LEFT;
  opt_fadeStep = opt_fadeStep || 0.05;
  var result;
  switch (opt_hAlign) {
    case acgraph.vector.Text.HAlign.LEFT:
    case acgraph.vector.Text.HAlign.START:
      result = [
        {
          'offset': 0,
          'color': fontColor,
          'opacity': opacity
        },
        {
          'offset': Math.max(ratio - opt_fadeStep, 0),
          'color': fontColor,
          'opacity': opacity
        },
        {
          'offset': ratio,
          'color': fontColor,
          'opacity': 0
        },
        {
          'offset': 1,
          'color': fontColor,
          'opacity': 0
        }
      ];
      break;
    case acgraph.vector.Text.HAlign.CENTER:
      var r = ratio < 1 ? (1 - ratio) / 2 : 0;
      opt_fadeStep = ratio < 1 ? opt_fadeStep : 0;
      result = [
        {
          'offset': 0,
          'color': fontColor,
          'opacity': 0
        },
        {
          'offset': r,
          'color': fontColor,
          'opacity': 0
        },
        {
          'offset': r + opt_fadeStep,
          'color': fontColor,
          'opacity': opacity
        },
        {
          'offset': 1 - r - opt_fadeStep,
          'color': fontColor,
          'opacity': opacity
        },
        {
          'offset': 1 - r,
          'color': fontColor,
          'opacity': 0
        },
        {
          'offset': 1,
          'color': fontColor,
          'opacity': 0
        }
      ];
      break;
    case acgraph.vector.Text.HAlign.RIGHT:
    case acgraph.vector.Text.HAlign.END:
      ratio = 1 - ratio;
      result = [
        {
          'offset': 0,
          'color': fontColor,
          'opacity': 0
        },
        {
          'offset': ratio,
          'color': fontColor,
          'opacity': 0
        },
        {
          'offset': Math.max(ratio + opt_fadeStep, 0),
          'color': fontColor,
          'opacity': opacity
        },
        {
          'offset': 1,
          'color': fontColor,
          'opacity': 1
        }
      ];
      break;
  }
  return /** @type {!Array.<acgraph.vector.GradientKey>} */ (result);
};


/**
 *
 * @param {number} ratio - .
 * @param {number} opacity - .
 * @param {string} fontColor - .
 * @param {number=} opt_fadeStep - .
 * @param {acgraph.vector.Text.HAlign=} opt_hAlign - .
 * @return {!acgraph.vector.LinearGradientFill}
 */
anychart.utils.getFadeGradient = function(ratio, opacity, fontColor, opt_fadeStep, opt_hAlign) {
  return {
    'keys': anychart.utils.getFadeGradientKeys(ratio, opacity, fontColor, opt_fadeStep, opt_hAlign)
  };
};


/**
 * DOM-debug util method, gives 'data-ac-name' attribute to acgraph.vector.Element.
 *
 * @param {acgraph.vector.Element} element - Element to get DOM-debug name.
 * @param {string} name - 'data-ac-name' attribute value.
 */
anychart.utils.nameElement = function(element, name) {
  if (anychart.DEVELOP && element && name) {
    element.attr('data-ac-name', name);
  }
};


/**
 * Check if theme contains space object inside if contains normalize it otherwise do nothing.
 * @param {string} name - Name of space object margin or padding.
 * @param {Object} theme - Object that contains space object.
 */
anychart.utils.normalizeThemeSpaceObject = function(name, theme) {
  if (goog.isDef(theme[name])) {
    theme[name] = anychart.core.utils.Space.normalizeSpace(theme[name]);
  }
};


/**
 * Normalize theme items.
 * @param {Object} theme - Theme object.
 */
anychart.utils.normalizeTheme = function(theme) {
  // Normalize margins and paddings.
  anychart.utils.normalizeThemeSpaceObject('padding', theme);
  anychart.utils.normalizeThemeSpaceObject('margin', theme);
};


//region -- Async actions.
/**
 * Executes fn-function in next execution frame.
 * Be very careful in using anychart.utils.schedule
 * inside another anychart.utils.schedule, setTimeout really
 * moves function in the end of execution order:
 *
 *  <code>
 *    anychart.utils.schedule(function() {
 *      anychart.utils.schedule(function() {
 *        console.log(1);
 *      });
 *    });
 *
 *    anychart.utils.schedule(function() {
 *      console.log(2);
 *    });
 *
 *    //Output: 2, 1
 *  <code>
 *
 * @param {Function} fn - setTimeout callback.
 * @param {Function=} opt_complete - Complete callback.
 *  NOTE: Complete callback is synchronous! Do not preform any heavyweight operations here!
 * @param {Object=} opt_context - Callback context.
 * @return {number} - Timeout id.
 */
anychart.utils.schedule = function(fn, opt_complete, opt_context) {
  var tid = setTimeout(function() {
    fn.call(opt_context);
    if (opt_complete)
      opt_complete.call(opt_context);

    //This must prevent huge memory leak.
    clearTimeout(tid);
    fn = null;
    opt_complete = null;
    opt_context = null;
  }, 1); //setTimeout(function, 0) is unacceptable for IE.
  return tid;
};


//endregion


//exports
goog.exportSymbol('anychart.utils.printUtilsBoolean', anychart.utils.printUtilsBoolean);
goog.exportSymbol('anychart.utils.xml2json', anychart.utils.xml2json);
goog.exportSymbol('anychart.utils.json2xml', anychart.utils.json2xml);
goog.exportSymbol('anychart.utils.hideTooltips', anychart.utils.hideTooltips);
goog.exportSymbol('anychart.utils.htmlTableFromCsv', anychart.utils.htmlTableFromCsv);
goog.exportSymbol('anychart.utils.schedule', anychart.utils.schedule);
