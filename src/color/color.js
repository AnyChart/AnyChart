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
 * Normalize hatch fill.
 * @param {(!acgraph.vector.HatchFill|!acgraph.vector.PatternFill|acgraph.vector.HatchFill.HatchFillType|string|
 * null)=} opt_patternFillOrType
 * @param {string=} opt_color
 * @param {(string|number)=} opt_thickness
 * @param {(string|number)=} opt_size
 * @return {acgraph.vector.PatternFill|acgraph.vector.HatchFill}
 */
anychart.color.normalizeHatchFill = function(opt_patternFillOrType, opt_color, opt_thickness, opt_size) {
  var newFill = null;
  if (anychart.utils.isNone(opt_patternFillOrType)) {
    newFill = null;
  } else if (goog.isString(opt_patternFillOrType) || goog.isNumber(opt_patternFillOrType)) {
    var type = goog.object.containsValue(acgraph.vector.HatchFill.HatchFillType, opt_patternFillOrType) ?
        opt_patternFillOrType :
        acgraph.vector.HatchFill.HatchFillType.BACKWARD_DIAGONAL;
    newFill = acgraph.hatchFill(
        /** @type {acgraph.vector.HatchFill.HatchFillType} */(type),
        opt_color,
        goog.isDef(opt_thickness) ? parseFloat(opt_thickness) : undefined,
        goog.isDef(opt_size) ? parseFloat(opt_size) : undefined);
  } else if (opt_patternFillOrType instanceof acgraph.vector.PatternFill) {
    newFill = opt_patternFillOrType;
  }
  return newFill;
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

  if (goog.isNull(opt_fillOrColorOrKeys)) { // If the first paraneter is null, we treat this as fill removal
    newFill = 'none';
  } else if (goog.isString(opt_fillOrColorOrKeys)) { // that's function(color, opt_opacity); option
    newFill = anychart.color.parseColor_(opt_fillOrColorOrKeys, false);
    if (goog.isString(newFill) && goog.isDef(opt_opacityOrAngleOrCx)) { // If that's a simple color with an opacity, e.g. fill('red', 0.5)
      opacity = parseFloat(opt_opacityOrAngleOrCx);
      newFill = {
        'color': opt_fillOrColorOrKeys,
        'opacity': isNaN(opacity) ? 1 : goog.math.clamp(opacity, 0, 1)
      };
    }
  } else if (goog.isArray(opt_fillOrColorOrKeys)) { // creating gradient  (linear or radial)
    keys = goog.array.slice(opt_fillOrColorOrKeys, 0);
    for (i = keys.length; i--;) { // iterate keys and normalize them, if color set as a simple color
      key = keys[i];
      if (goog.isString(key)) // key is a simple string - normailize it
        key = anychart.color.parseKey_(key);
      if (isNaN(key['offset'])) // checking all cases on invalid offset, including empty case
        key['offset'] = i / (keys.length - 1);
      keys[i] = /** @type {acgraph.vector.GradientKey} */(key);
    }
    if (goog.isNumber(opt_opacityOrAngleOrCx) && !isNaN(opt_opacityOrAngleOrCx) &&
        goog.isNumber(opt_modeOrCy) && !isNaN(opt_modeOrCy)) { // it is a radial gradient
      var cx = opt_opacityOrAngleOrCx || 0;
      var cy = opt_modeOrCy || 0;
      newFill = {
        'keys': keys,
        'cx': cx,
        'cy': cy,
        'mode': anychart.color.normalizeGradientMode_(opt_opacityOrMode), // accepts only a rectangle
        'fx': isNaN(opt_fx) ? cx : +opt_fx,
        'fy': isNaN(opt_fy) ? cy : +opt_fy,
        'opacity': goog.math.clamp(goog.isDef(opt_opacity) ? opt_opacity : 1, 0, 1)
      };
    } else { // it is a linear gradient
      newFill = {
        'keys': keys,
        'angle': (+opt_opacityOrAngleOrCx) || 0,
        'mode': anychart.color.normalizeGradientMode_(opt_modeOrCy) || !!opt_modeOrCy, // also accepts boolean
        'opacity': goog.math.clamp(!isNaN(+opt_opacityOrMode) ? +opt_opacityOrMode : 1, 0, 1)
      };
    }
  } else if (goog.isObject(opt_fillOrColorOrKeys)) { // fill is set as an object
    if (opt_fillOrColorOrKeys instanceof acgraph.vector.PatternFill) {
      newFill = opt_fillOrColorOrKeys;
    } else if ('keys' in opt_fillOrColorOrKeys) { // gradient
      keys = goog.array.slice(opt_fillOrColorOrKeys['keys'], 0);
      for (i = keys.length; i--;) { // iterate keys and normalize them, if color set as a simple color
        key = keys[i];
        var newKey;
        if (goog.isString(key)) // key is a simple string - normailize it
          newKey = anychart.color.parseKey_(key);
        else { // or just copy object
          newKey = {
            'offset': key['offset'],
            'color': goog.isString(key['color']) ? key['color'] : 'black'
          };
          if (!isNaN(key['opacity']))
            newKey['opacity'] = goog.math.clamp(key['opacity'], 0, 1);
        }
        if (isNaN(newKey['offset'])) // checking all cases on invalid offset, including empty case
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
          'mode': mode, // accepts only a rectangle
          'fx': isNaN(opt_fillOrColorOrKeys['fx']) ? +opt_fillOrColorOrKeys['cx'] : +opt_fillOrColorOrKeys['fx'],
          'fy': isNaN(opt_fillOrColorOrKeys['fy']) ? +opt_fillOrColorOrKeys['cy'] : +opt_fillOrColorOrKeys['fy'],
          'opacity': opacity
        };
      } else {
        newFill = {
          'keys': keys,
          'angle': +opt_fillOrColorOrKeys['angle'] || 0,
          'mode': mode || !!opt_fillOrColorOrKeys['mode'], // also accepts boolean
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
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)=} opt_strokeOrFill Border fill settings,
 *    if used as a setter.
 * @param {number=} opt_thickness Line thickness. Set to 1 if it is not passed.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 *    Dash array contains a list of comma and/or white space separated lengths and percentages that specify the
 *    lengths of alternating dashes and gaps. If an odd number of values is provided, then the list of values is
 *    repeated to yield an even number of values. Thus, stroke dashpattern: 5,3,2 is equivalent to dashpattern: 5,3,2,5,3,2.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line join shape.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Style of line cap.
 * @return {acgraph.vector.Stroke} .
 */
anychart.color.normalizeStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  var tmp;
  /** @type {acgraph.vector.Stroke} */
  var newStroke;
  if (goog.isNull(opt_strokeOrFill)) { // If stroke set as null there is no need to parse more
    newStroke = 'none';
  } else {
    if (goog.isString(opt_strokeOrFill)) { // If it is a string it can start with thickness ('1 red 0.2')
      tmp = goog.string.splitLimit(opt_strokeOrFill, ' ', 1);
      var tmpThickness = parseFloat(tmp[0]);
      if (!isNaN(tmpThickness)) { // if string starts with thickness it has priority over opt_thickness
        opt_strokeOrFill = tmp[1];
        opt_thickness = tmpThickness;
      }
    }
    var setAsComplexStroke = goog.isObject(opt_strokeOrFill);
    var thickness = parseFloat(
        (setAsComplexStroke && ('thickness' in opt_strokeOrFill)) ?
            opt_strokeOrFill['thickness'] :
            opt_thickness);
    if (thickness == 0) // If thickness is set and equals zero
      return 'none';

    var hasDash = setAsComplexStroke && ('dash' in opt_strokeOrFill);
    var hasJoin = setAsComplexStroke && ('lineJoin' in opt_strokeOrFill);
    var hasCap = setAsComplexStroke && ('lineCap' in opt_strokeOrFill);

    // Get normalized fill.
    tmp = anychart.color.normalizeFill(/** @type {(acgraph.vector.Fill|string|null)} */(opt_strokeOrFill));
    // Unfortunately we don't support Pattern fill for strokes.
    // We should have double typecast here, through ColoredFill,
    //  but we'll go an easy way for now.
    newStroke = (tmp instanceof acgraph.vector.PatternFill) ? 'black' : /** @type {acgraph.vector.Stroke} */(tmp);

    // If none of the above, we can use normalized fill as a stroke,
    // it is compatible. In other case we have to add properties.
    if (!isNaN(thickness) || hasDash || hasJoin || hasCap ||
        goog.isDef(opt_dashpattern) || goog.isDef(opt_lineJoin) || goog.isDef(opt_lineCap)) {
      if (goog.isString(newStroke)) // If it is here and color set as string, we need to upgrade it to object
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


/**
 * Brings mode to a rectangle. If it is not possible (it is null or boolean), returns null.
 * @param {null|number|boolean|acgraph.math.Rect|{left:number,top:number,width:number,height:number}|undefined} mode Gradient
 *    mode to normalize.
 * @return {acgraph.math.Rect} Normalized gradient rectangle (no redundant objects created).
 * @private
 */
anychart.color.normalizeGradientMode_ = function(mode) {
  if (goog.isDefAndNotNull(mode)) {
    if (mode instanceof acgraph.math.Rect)
      return mode;
    else if (goog.isObject(mode) && !isNaN(mode['left']) && !isNaN(mode['top']) && !isNaN(mode['width']) && !isNaN(mode['height']))
      return new acgraph.math.Rect(mode['left'], mode['top'], mode['width'], mode['height']);
  }
  return null;
};


/**
 * @param {string} color Color as 'red' or 'red 0.5'.
 * @param {boolean} forceObject Whether we need to return  acgraph.vector.SolidFill or return
 *    string in case of a simple color.
 * @return {string|acgraph.vector.SolidFill} Normalized color.
 * @private
 */
anychart.color.parseColor_ = function(color, forceObject) {
  // TODO (Anton Saukh): we can add trim and change to regular expressions
  /** @type {Array.<string>} */
  var tmp = color.split(' ', 2);
  /** @type {number} */
  var opacity;
  var result;
  if (tmp.length > 1) { // it's a case when color is a complex string with opacity, e.g. 'red 0.5'
    opacity = parseFloat(tmp[1]);
    result = {
      'color': tmp[0] // here we always have a "clear" first word from fill received
    };
    if (!isNaN(opacity))
      result['opacity'] = goog.math.clamp(opacity, 0, 1);
  } else if (forceObject) { // bring to object even if it is a simple color (e.g. for gradient key)
    result = {
      'color': color
    };
  } else { // simple color
    result = color;
  }
  return result;
};


/**
 * @param {string} key Key as '[offset ]color[ opacity]': 'red', 'red 0.5', '0.5 red' or '0.5 red 0.5'.
 * @return {acgraph.vector.GradientKey} Normalized key.
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
