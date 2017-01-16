goog.provide('anychart.color');
goog.require('acgraph');
goog.require('goog.color');
goog.require('goog.math');



/**
 * Color utilities namespace.
 * @namespace
 * @name anychart.color
 */


/**
 * Transparent fill color, that still can handle events.
 * @type {acgraph.vector.Fill}
 */
anychart.color.TRANSPARENT_HANDLER = {'color': '#fff', 'opacity': 0.00001};


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
 * Single-hue progressions.
 *
 * Single-hue progressions fade from a dark shade of the chosen color to a very light or white shade of relatively
 * the same hue. This is a common method used to map magnitude. The darkest hue represents the greatest number in
 * the data set and the lightest shade representing the least number.
 *
 * Two variables may be shown through the use of two overprinted single color scales. The hues typically used are from
 * red to white for the first data set and blue to white for the second, they are then overprinted to produce
 * varying hues. These type of maps show the magnitude of the values in relation to each other.
 *
 * This realisation of single hue progression based on progression of lightness (intensity) of HSL (HSI) model.
 *
 * @param {?string=} opt_color [black] Color in rgb, named or hex string representation like 'rgb(255, 0, 0)', 'red' or
 * '#ff0000' accordingly.
 * @param {?number=} opt_count [7] Count of progression colors.
 * @param {?number=} opt_startOrTargetLightness [0.95] Source lightness. Number in [0, 1]. 1 - very light (white),
 * 0 - vere dark (black). If opt_startOrTargetLightness and opt_endLightness don't defined, then lightness progression
 * starts from 0.95 and ends to lightness of passed color.
 * @param {number=} opt_endLightness [from passed color] Target lightness. Number in [0, 1]. 1 - very light (white), 0 - vere dark (black).
 * @return {Array.<string>} Single heu progression. Array of colors.
 */
anychart.color.singleHueProgression = function(opt_color, opt_count, opt_startOrTargetLightness, opt_endLightness) {
  var color = opt_color || '#000';
  var count = goog.isDefAndNotNull(opt_count) && !isNaN(+opt_count) ? +opt_count : 7;
  var endLightness = goog.isDefAndNotNull(opt_endLightness) ? goog.math.clamp(opt_endLightness, 0, 1) : NaN;
  var startLightness;
  var hue, saturation, lightness;
  var lightnessStep, hsvColor;

  hsvColor = goog.color.hexToHsl(anychart.color.parseColor(color).hex);
  hue = hsvColor[0];
  saturation = hsvColor[1];
  lightness = hsvColor[2];

  if (isNaN(endLightness)) {
    endLightness = lightness;
    startLightness = goog.isDefAndNotNull(opt_startOrTargetLightness) ? goog.math.clamp(opt_startOrTargetLightness, 0, 1) : 0.95;
  } else {
    startLightness = goog.isDefAndNotNull(opt_startOrTargetLightness) ? goog.math.clamp(opt_startOrTargetLightness, 0, 1) : lightness;
  }

  if (count > 1)
    lightnessStep = Math.abs(endLightness - startLightness) / (count - 1);
  else
    lightnessStep = 0;


  var progression = [];
  var direction = startLightness < endLightness ? 1 : -1;
  for (var i = 0; i < count; i++) {
    progression.push(goog.color.hslToHex(hue, saturation, startLightness + direction * lightnessStep * i));
  }
  return progression;
};


/**
 * Multiple bipolar heu progression.
 *
 * In contrast to uni-polar data, bipolar data consist of a natural, meaningful division-point that splits the
 * thematic information into two groups of poles. Such bipolar maps for example describe features that range from
 * negative to positive, as well as from below to above a certain average point. Moreover we may use it to express a
 * qualitative value from "negative" to "positive".
 *
 * For bipolar data we recommend colour schemes in which two hues diverge away from a common light/white hue.
 * For maps with a bipolar progression we usually choose two complementary colour hues of the common colour circle
 * like blue and yellow or red and green.
 *
 * @param {?string=} opt_color1 [blue] Color in rgb, named or hex string representation like 'rgb(255, 0, 0)', 'red' or
 * '#ff0000' accordingly.
 * @param {?string=} opt_color2 [red] Color in rgb, named or hex string representation like 'rgb(255, 0, 0)', 'red' or
 * '#ff0000' accordingly.
 * @param {number=} opt_count [7] Count of progression colors.
 * @return {Array.<string>} Multiple bipolar heu progression. Array of colors.
 */
anychart.color.bipolarHueProgression = function(opt_color1, opt_color2, opt_count) {
  var count = goog.isDef(opt_count) ? opt_count : 7;
  var arr1 = anychart.color.singleHueProgression(opt_color1 || 'blue', Math.floor(count / 2) + 1, null, 1);
  var arr2 = anychart.color.singleHueProgression(opt_color2 || 'red', Math.floor(count / 2) + 1, 1);

  if (count % 2 == 0)
    goog.array.splice(arr1, arr1.length - 1, 1);
  goog.array.splice(arr2, 0, 1);

  return arr1.concat(arr2);
};


/**
 * Multiple blended heu progression.
 *
 * Blended hue progressions use related hues to blend together the two end point hues. This type of color progression
 * is typically used to show elevation changes. For example from yellow through orange to brown.
 *
 * Magnitude variations are often represented by a progression of related hues, from which at least one hue is not
 * part of the visible spectrum, which means that it is a so called "impure mixed colour", which is brown. These hues
 * must blend smoothly and change uniformly in hue, brightness, and saturation between the chosen endpoint hues.
 *
 * @param {?string=} opt_color1 [blue] Color in rgb, named or hex string representation like 'rgb(255, 0, 0)', 'red' or
 * '#ff0000' accordingly.
 * @param {?string=} opt_color2 [red] Color in rgb, named or hex string representation like 'rgb(255, 0, 0)', 'red' or
 * '#ff0000' accordingly.
 * @param {number=} opt_count [7] Count of progression colors.
 * @return {Array.<string>} Multiple blended heu progression. Array of colors.
 */
anychart.color.blendedHueProgression = function(opt_color1, opt_color2, opt_count) {
  var count = goog.isDef(opt_count) ? opt_count : 7;
  var color1 = goog.color.hexToRgb(anychart.color.parseColor(opt_color1 || 'yellow').hex);
  var color2 = goog.color.hexToRgb(anychart.color.parseColor(opt_color2 || 'brown').hex);

  var progression = [goog.color.rgbToHex.apply(null, color1)];
  var step = 1 / count;
  for (var i = 1; i < count - 1; i++) {
    progression.push(goog.color.rgbToHex.apply(null, anychart.color.blend(color2, color1, step * i)));
  }
  progression.push(goog.color.rgbToHex.apply(null, color2));
  return progression;
};


/**
 * Trying to convert given acgraph.vector.Fill or acgraph.vector.Stroke to its hex representation if can
 * @param {(acgraph.vector.Fill|acgraph.vector.Stroke)} fillOrStroke Fill or stroke to convert.
 * @return {?(string)} Hex representation or null if can not be represented.
 * @private
 */
anychart.color.fillOrStrokeToHex_ = function(fillOrStroke) {
  // If a complex object is passed - we ask for a color field
  // or it's a gradient, an image - not the thing we need
  if (goog.isObject(fillOrStroke)) {
    // if there is a color in object  - it's a case, we read it and parse it
    if (fillOrStroke.color) {
      fillOrStroke = fillOrStroke.color;
    } else {
      // there is no color - return null to show parsing failure
      return null;
    }
  }
  // string from color field, or color, or hex-like color, or 'none'
  if (goog.isString(fillOrStroke)) {
    // we need it becaouse goog throws error
    try {
      // here we can parse any strings like
      // rgb(xxx,xxx,xxx), #xxxxxx, #xxx, color_name
      var parsedColorObject = goog.color.parse(fillOrStroke);
      return parsedColorObject.hex;
    } catch (e) {
      // if we can't parse and error is thrown that's a 'none' string
      // return null to show parsing failure
      return null;
    }
  }
  // if none of the above - return null too
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
  if (goog.isObject(fillOrStroke) && goog.isDef(fillOrStroke['keys'])) {
    var newFillOrStroke = /** @type {acgraph.vector.Fill} */ (goog.object.clone(fillOrStroke));
    var keys = newFillOrStroke['keys'];
    var newKeys = [];
    for (var i = 0, len = keys.length; i < len; i++) {
      var key = goog.object.clone(keys[i]);
      key['color'] = anychart.color.lighten(key['color']);
      newKeys.push(key);
    }
    newFillOrStroke['keys'] = newKeys;
    return newFillOrStroke;

  } else {
    var hex;
    // if null is returned then we can't get a hex representation and return the initial color
    if (goog.isNull(hex = anychart.color.fillOrStrokeToHex_(fillOrStroke))) return fillOrStroke;

    // convert hex-color to goog.color.Rgb (RGB array that can be used by goog.color.lighten)
    var rgb = goog.color.hexToRgb(/** @type {string} */ (hex));
    if (!goog.isDefAndNotNull(opt_factor)) {
      opt_factor = 0.3;
    }

    return goog.color.rgbArrayToHex(goog.color.lighten(rgb, +opt_factor));
  }
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
  if (goog.isObject(fillOrStroke) && goog.isDef(fillOrStroke['keys'])) {
    var newFillOrStroke = /** @type {acgraph.vector.Fill} */ (goog.object.clone(fillOrStroke));
    var keys = newFillOrStroke['keys'];
    var newKeys = [];
    for (var i = 0, len = keys.length; i < len; i++) {
      var key = goog.object.clone(keys[i]);
      key['color'] = anychart.color.darken(key['color']);
      newKeys.push(key);
    }
    newFillOrStroke['keys'] = newKeys;
    return newFillOrStroke;

  } else {
    var hex;
    // if null is returned then we can't get a hex representation and return the initial color
    if (goog.isNull(hex = anychart.color.fillOrStrokeToHex_(fillOrStroke))) return fillOrStroke;

    // convert hex-color to goog.color.Rgb (RGB array that can be used by goog.color.darken)
    var rgb = goog.color.hexToRgb(/** @type {string} */ (hex));
    if (!goog.isDefAndNotNull(opt_factor)) {
      opt_factor = 0.3;
    }

    return goog.color.rgbArrayToHex(goog.color.darken(rgb, +opt_factor));
  }
};


/**
 * Tests colors equality. Can test a fill against stroke also.
 * @param {acgraph.vector.Fill|acgraph.vector.Stroke} color1 First color.
 * @param {acgraph.vector.Fill|acgraph.vector.Stroke} color2 Second color.
 * @return {boolean} Comparison result.
 */
anychart.color.equals = function(color1, color2) {
  // TODO(Anton Saukh): Fix it.
  return color1 == color2;
};


/**
 * Serializes fill or stroke.
 * @param {acgraph.vector.Fill|acgraph.vector.Stroke} color
 * @return {Object|string|boolean}
 */
anychart.color.serialize = function(color) {
  var result;
  if (color instanceof acgraph.vector.HatchFill) {
    var hf = /** @type {acgraph.vector.HatchFill} */(color);
    result = {
      'type': hf.type,
      'color': anychart.color.serialize(hf.color),
      'thickness': hf.thickness,
      'size': hf.size
    };
  } else if (color instanceof acgraph.vector.PatternFill) {
    result = color.serialize();
  } else if (goog.isObject(color)) {
    result = /** @type {Object} */(anychart.utils.recursiveClone(color));
  } else if (goog.isBoolean(color)) {
    result = color;
  } else {
    result = String(color || 'none');
  }
  return result;
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
anychart.color.validHexColorRe_ = /^#(?:[0-9a-f]{3}){1,2}$/i;


/**
 * Regular expression for matching and capturing RGB style strings. Helper for
 * isValidRgbColor_.
 * @type {RegExp}
 * @private
 */
anychart.color.rgbColorRe_ =
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
anychart.color.isValidRgbColor_ = function(str) {
  // Each component is separate (rather than using a repeater) so we can
  // capture the match. Also, we explicitly set each component to be either 0,
  // or start with a non-zero, to prevent octal numbers from slipping through.
  var regExpResultArray = str.match(anychart.color.rgbColorRe_);
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
anychart.color.isValidHexColor_ = function(str) {
  return anychart.color.validHexColorRe_.test(str);
};


/**
 * Parses a color out of a string.
 * @param {string} str Color in some format.
 * @return {Object} Contains two properties: 'hex', which is a string containing
 *     a hex representation of the color, as well as 'type', which is a string
 *     containing the type of color format passed in ('hex', 'rgb', 'named').
 */
anychart.color.parseColor = function(str) {
  var result = {};
  str = String(str);

  var maybeHex = goog.color.prependHashIfNecessaryHelper(str);
  if (anychart.color.isValidHexColor_(maybeHex)) {
    result.hex = goog.color.normalizeHex(maybeHex);
    result.type = 'hex';
    return result;
  } else {
    var rgb = anychart.color.isValidRgbColor_(str);
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
 * Sets opacity to stroke or fill.
 * @param {(acgraph.vector.Stroke|acgraph.vector.Fill)} strokeOrFill Stroke or fill.
 * @param {number} opacity Opacity to set.
 * @param {boolean=} opt_isFill is it fill or not. If emit the param - it would be stroke.
 * @return {(acgraph.vector.Stroke|acgraph.vector.Fill)} Normalized color with new opacity.
 */
anychart.color.setOpacity = function(strokeOrFill, opacity, opt_isFill) {
  var norm;
  if (!!opt_isFill) {
    norm = acgraph.vector.normalizeFill(/** @type {acgraph.vector.Fill} */(strokeOrFill));
  } else {
    norm = acgraph.vector.normalizeStroke(/** @type {acgraph.vector.Stroke} */(strokeOrFill));
  }
  if (goog.isString(norm)) {
    norm = {'color': norm, 'opacity': opacity};
  } else if (goog.isObject(norm)) {
    norm['opacity'] = opacity;
  }
  return norm;
};


/**
 * Gets opacity from stroke or fill.
 * @param {(acgraph.vector.Stroke|acgraph.vector.Fill)} color Normalized color with new opacity.
 * @return {number} opacity Opacity to set.
 */
anychart.color.getOpacity = function(color) {
  var opacity = 1;
  if (goog.isString(color)) {
    opacity = color == 'none' ? 0 : 1;
  } else if (goog.isObject(color)) {
    opacity = goog.isNumber(color['opacity']) ? color['opacity'] : 1;
  }
  return opacity;
};


/**
 * Sets opacity to stroke or fill.
 * @param {acgraph.vector.Stroke} stroke Stroke.
 * @param {number} thickness Thickness to set.
 * @param {number=} opt_opacity optional opacity to set.
 * @return {acgraph.vector.Stroke} Normalized color with new thickness.
 */
anychart.color.setThickness = function(stroke, thickness, opt_opacity) {
  /** @type {string|acgraph.vector.Stroke} */
  var norm = acgraph.vector.normalizeStroke(stroke);
  if (goog.isString(norm)) {
    norm = /** @type {acgraph.vector.Stroke} */ ({'color': norm, 'thickness': thickness});
  } else if (goog.isObject(norm)) {
    norm['thickness'] = thickness;
  }
  if (opt_opacity)
    norm['opacity'] = opt_opacity;
  return norm;
};


//exports
goog.exportSymbol('anychart.color.blend', anychart.color.blend);//in docs/final
goog.exportSymbol('anychart.color.lighten', anychart.color.lighten);//in docs/final
goog.exportSymbol('anychart.color.darken', anychart.color.darken);//in docs/final
goog.exportSymbol('anychart.color.setThickness', anychart.color.setThickness);
goog.exportSymbol('anychart.color.setOpacity', anychart.color.setOpacity);
goog.exportSymbol('anychart.color.singleHueProgression', anychart.color.singleHueProgression);
goog.exportSymbol('anychart.color.bipolarHueProgression', anychart.color.bipolarHueProgression);
goog.exportSymbol('anychart.color.blendedHueProgression', anychart.color.blendedHueProgression);
