goog.provide('anychart.color');
goog.require('acgraph');
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
 * @return {Object|string}
 */
anychart.color.serialize = function(color) {
  var result;
  if (color instanceof acgraph.vector.HatchFill) {
    result = {
      'type': 'hatchFill',
      'hatchType': color['type'],
      'color': color['color'],
      'thickness': color['thickness'],
      'size': color['size']
    };
  } else if (color instanceof acgraph.vector.PatternFill) {
    result = color.serialize();
  } else if (goog.isObject(color)) {
    result = /** @type {Object} */(anychart.utils.recursiveClone(color));
  } else {
    result = color || 'none';
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


//exports
goog.exportSymbol('anychart.color.blend', anychart.color.blend);//in docs/final
goog.exportSymbol('anychart.color.lighten', anychart.color.lighten);//in docs/final
goog.exportSymbol('anychart.color.darken', anychart.color.darken);//in docs/final
