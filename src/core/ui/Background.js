goog.provide('anychart.core.ui.Background');
goog.require('acgraph');
goog.require('anychart.color');
goog.require('anychart.core.VisualBaseWithBounds');
goog.require('anychart.enums');
goog.require('anychart.math.Rect');
goog.require('goog.array');



/**
 * Background element class.<br/>
 * Background can be a part of another complex element (chart, legend, title and so on),
 * or used separately.<br/>
 * Background has a fill, a border and corner shape settings.<br/>
 * <b>Note:</b> Always specify display bounds if you use Background separately.
 * @extends {anychart.core.VisualBaseWithBounds}
 * @constructor
 */
anychart.core.ui.Background = function() {
  this.suspendSignalsDispatching();
  goog.base(this);

  /**
   * Graphics element that represents background path.
   * @type {acgraph.vector.Rect}
   * @private
   */
  this.rect_ = null;

  /**
   * @type {anychart.enums.BackgroundCornersType}
   * @private
   */
  this.cornerType_ = anychart.enums.BackgroundCornersType.ROUND;

  /**
   * @type {!Array}
   * @private
   */
  this.corners_ = [0];

  /**
   * Fill settings.
   * @type {acgraph.vector.Fill}
   * @private
   */
  this.fill_ = acgraph.vector.normalizeFill('#000 0.5');

  /**
   * Stroke settings.
   * @type {acgraph.vector.Stroke}
   * @private
   */
  this.stroke_ = '#000';

  this.resumeSignalsDispatching(false);
};
goog.inherits(anychart.core.ui.Background, anychart.core.VisualBaseWithBounds);


/**
 * Supported signals.
 * @type {number}
 */
anychart.core.ui.Background.prototype.SUPPORTED_SIGNALS =
    anychart.core.VisualBaseWithBounds.prototype.SUPPORTED_SIGNALS;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.ui.Background.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.VisualBaseWithBounds.prototype.SUPPORTED_CONSISTENCY_STATES |
        anychart.ConsistencyState.APPEARANCE;


//----------------------------------------------------------------------------------------------------------------------
//
//  Corners.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Normalizes user input corners type to its enumeration values. Also accepts null. Defaults to opt_default or 'round'.
 *
 * @param {string} type Type to normalize.
 * @param {anychart.enums.BackgroundCornersType=} opt_default Default type.
 * @return {anychart.enums.BackgroundCornersType} Normalized type.
 */
anychart.core.ui.Background.normalizeCornerType = function(type, opt_default) {
  if (goog.isString(type)) {
    type = type.toLowerCase();
    for (var i in anychart.enums.BackgroundCornersType) {
      if (type == anychart.enums.BackgroundCornersType[i])
        return anychart.enums.BackgroundCornersType[i];
    }
  }
  return opt_default || anychart.enums.BackgroundCornersType.NONE;
};


/**
 * Getter for current corner radius.
 * @return {Array.<number>} Current corner settings.
 *//** topLeft, topRight, bottomRight, bottomLeft
 * Setter for corner's radius by one value.
 * @example <c>One for all.</c><t>simple-h100</t>
 * anychart.ui.background()
 *   .cornerType(anychart.enums.BackgroundCornersType.CUT)
 *   .corners(10) // same .corners('10px')
 *   .bounds(10, 10, stage.width() - 20, stage.height() - 20)
 *   .stroke('#000 2').fill('none').container(stage).draw();
 * @example <c>One for all.</c><t>simple-h100</t>
 * anychart.ui.background()
 *   .cornerType(anychart.enums.BackgroundCornersType.CUT)
 *   .corners([5, 7, 12, 7])
 *    // same .corners('5 7 12 7')
 *    // same .corners('5px 7px 12px 7px')
 *   .bounds(10, 10, stage.width() - 20, stage.height() - 20)
 *   .stroke('#000 2').fill('none').container(stage).draw();
 * @param {(number|string|Array.<number>)=} opt_value ['0px'] Value to set.<br/><b>Note:</b> If array has less than 4 elements
 *  (or string provide less than 4 values), the first value is set for all four corners.
 * @return {!anychart.core.ui.Background} {@link anychart.core.ui.Background} instance for method chaining.
 *//**
 * Setter for corner radius by each value.
 * @example <t>simple-h100</t>
 * anychart.ui.background()
 *   .cornerType(anychart.enums.BackgroundCornersType.CUT)
 *   .corners(15, 7, 12, 7)
 *   .bounds( anychart.math.rect(10, 10, stage.width()-20, stage.height() - 20) )
 *   .stroke('#000 2').fill('none').container(stage).draw();
 * @param {(number|string)=} opt_topLeft Top left corner value.
 * @param {(number|string)=} opt_topRight Top right corner value.
 * @param {(number|string)=} opt_bottomRight Bottom left corner value.
 * @param {(number|string)=} opt_bottomLeft Bottom right corner value.
 * @return {!anychart.core.ui.Background} {@link anychart.core.ui.Background} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(number|string|Array.<number|string>)=} opt_value .
 * @return {(Array.<number|string>|!anychart.core.ui.Background)} .
 */
anychart.core.ui.Background.prototype.corners = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var val;
    if (goog.isArray(opt_value)) {
      val = opt_value;
    } else if (goog.isObject(opt_value)) {
      val = [
        anychart.utils.toNumber(opt_value['leftTop']) || 0,
        anychart.utils.toNumber(opt_value['rightTop']) || 0,
        anychart.utils.toNumber(opt_value['rightBottom']) || 0,
        anychart.utils.toNumber(opt_value['leftBottom']) || 0
      ];
    } else {
      val = goog.array.slice(arguments, 0);
    }
    if (!goog.array.equals(val, this.corners_)) {
      this.corners_ = val;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.corners_;
  }
};


/**
 * Getter for current corner type.
 * @return {anychart.enums.BackgroundCornersType} Corners type.
 *//**
 * Setter for corner type.
 * @example <t>simple-h100</t>
 * anychart.ui.background()
 *   .cornerType(anychart.enums.BackgroundCornersType.ROUND_INNER)
 *   .corners(10)
 *   .stroke('#000 2')
 *   .bounds(anychart.math.rect(10, 10, stage.width()-20, stage.height() - 20) )
 *   .fill('none').container(stage).draw();
 * @param {anychart.enums.BackgroundCornersType=} opt_value [{@link anychart.enums.BackgroundCornersType}.ROUND] Value to set.
 * @return {!anychart.core.ui.Background} {@link anychart.core.ui.Background} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(anychart.enums.BackgroundCornersType|string)=} opt_value Corner type.
 * @return {anychart.enums.BackgroundCornersType|!anychart.core.ui.Background} Corners type or self for method chaining.
 */
anychart.core.ui.Background.prototype.cornerType = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.core.ui.Background.normalizeCornerType(opt_value);
    if (opt_value != this.cornerType_) {
      this.cornerType_ = opt_value;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.cornerType_;
  }
};


/**
 * Returns current fill.
 * @return {!acgraph.vector.Fill} Current fill settings (empty fill is always 'none').
 *//**
 * Sets fill settings using an object or a string.<br/>
 * Accepts:
 * <ul>
 * <li>{@link acgraph.vector.LinearGradientFill}</li>
 * <li>{@link acgraph.vector.RadialGradientFill}</li>
 * <li>{@link acgraph.vector.Fill}</li>
 * <li>{@link acgraph.vector.ImageFill}</li>
 * </ul>
 * or a color as a string, along with opacity, if needed, format is '<b>Color Opacity</b>',
 * e.g. 'red .5'.
 * @shortDescription Sets fill settings using an object or a string.
 * @example <c>Solid Fill</c><t>simple-h100</t>
 * var bg = anychart.ui.background();
 * // Set fill
 *   bg.fill('red 0.1');
 * // the same
 * // bg.fill('#ff0000 0.1');
 * // or
 * // bg.fill({color: 'red', opacity: 0.1});
 * // or
 * // bg.fill('#ff0000 0.1');
 * // then draw
 * bg.container(stage)
 *   .bounds( anychart.math.rect(10, 10, stage.width()-20, stage.height()-20) )
 *   .draw();
 * @example <c>Gradient Fill</c><t>simple-h100</t>
 * var bg = anychart.ui.background();
 * // Set fill
 *   bg.fill({keys:['red .1', 'orange'], mode: true, angle: 45});
 * bg.container(stage)
 *   .bounds( anychart.math.rect(10, 10, stage.width()-20, stage.height()-20) )
 *   .draw();
 * @example <c>Image Fill</c><t>simple-h100</t>
 * anychart.ui.background()
 *    .bounds( anychart.math.rect(10, 10, stage.width()-20, stage.height() - 20) )
 *    .stroke('#000 2').fill({
 *        src: 'http://static.anychart.com/rainbow.png',
 *        mode: acgraph.vector.ImageFillMode.TILE
 *     }).container(stage).draw();
 * @param {acgraph.vector.Fill} value ['#000 0.5'] Fill as an object or a string.
 * @return {!acgraph.vector.Shape} {@link acgraph.vector.Shape} instance for method chaining.
 * *//**
 * Fill as a color with opacity.<br/>
 * <b>Note:</b> If color is set as a string (e.g. 'red .5') it has a priority over opt_opacity, which
 * means: <b>fill</b> set like this <b>rect.fill('red 0.3', 0.7)</b> will have 0.3 opacity.
 * @shortDescription Fill as a string or an object.
 * @example <t>simple-h100</t>
 * var bg = anychart.ui.background();
 * // Set fill
 *   bg.fill('red', 0.1);
 * bg.container(stage)
 *   .bounds( anychart.math.rect(10, 10, stage.width()-20, stage.height()-20) )
 *   .draw();
 * @param {string} color Fill as a string.
 * @param {number=} opt_opacity Fill opacity.
 * @return {!anychart.core.ui.Background} {@link anychart.core.ui.Background} instance for method chaining.
 *//**
 * Linear gradient fill.<br/>
 * There are three modes:
 * <ul>
 *  <li>ObjectBoundingBox preserving an angle</li>
 *  <li>ObjectBoundingBox no angle preservation</li>
 *  <li>UserSpaceOnUse</li>
 * </ul>
 * <h4>Modes:</h4>
 * <p><b>ObjectBoundingBox preserving an angle</b><br/>
 * If boolean is passed it says how gradient behaves, specificaly
 * how gradient line angle behaves. If true - it is ObjectBoundingBox
 * with angle preservation. If angle is preserved, in any shape angle looks as one expects it to see.<br/>
 * <b>Note:</b> By default gradient vector for any shape, which sides are not in 1:1 proportions, will not
 * look as expected, because browser transforms this angle.</p>
 * <p><b>ObjectBoundingBox no angle preservation</b><br/>
 * If false is passed - that's ObjectBoundingBox no angle preservation. In this case default
 * behaviour comes up - gradient vector is calculated for a shape with 1:1 side proportions.</p>
 * <p><b>UserSpaceOnUse</b><br/>
 * If acgraph.math.Rect is passed - that'sUserSpaceOnUse mode.
 * In this mode gradient gets its own size and coordinates. Shapes with such gradient will be colored
 * only in those parts, which are covered by this custom gradient. Read more about this mode at
 * <a href='http://www.w3.org/TR/SVG/pservers.html#LinearGradientElementGradientUnitsAttribute'>
 * gradientUnits</a>. Angle is always preserved in this mode.</p>
 * @shortDescription Linear gradient fill.
 * @illustration <t>simple</t>
 * stage.text(0*stage.width()/6+3, 0, 'a');
 * anychart.ui.background()
 *   .fill(['0.2 black', 'white'], 45)
 *   .bounds( anychart.math.rect(0*stage.width()/6+3, 13, stage.width()/7-6, stage.height()-20) )
 *   .container(stage).draw();
 * stage.text(1*stage.width()/6-5, 0, 'b');
 * anychart.ui.background()
 *   .fill(['0.2 black', 'white'], 45, true)
 *   .bounds( anychart.math.rect(1*stage.width()/6-5, 13, stage.width()/7-6, stage.height()-20) )
 *   .container(stage).draw();
 * stage.text(2*stage.width()/6+3, 0, 'c');
 * anychart.ui.background()
 *   .fill(['red', 'blue'], 45, {left: 10, top: 20, width: 100, height: 100})
 *   .bounds( anychart.math.rect(2*stage.width()/6+3, 13, stage.width()/7-6, stage.height()-20) )
 *   .container(stage).draw();
 * anychart.ui.background()
 *   .fill(['red', 'blue'], 45, anychart.math.rect(10, 20, 100, 100))
 *   .bounds( anychart.math.rect(3*stage.width()/6-5, 13, stage.width()/7-6, stage.height()-20) )
 *   .container(stage).draw();
 * stage.text(4*stage.width()/6+3, 0, 'd');
 * anychart.ui.background()
 *   .fill(['red 0.1', 'orange', 'red 0.1'])
 *   .bounds( anychart.math.rect(4*stage.width()/6+3, 13, stage.width()/7-6, stage.height()-20) )
 *   .container(stage).draw();
 * anychart.ui.background()
 *   .fill(['red', {offset: 0.3, color: 'orange'}, 'red 0.1'])
 *   .bounds( anychart.math.rect(5*stage.width()/6-5, 13, stage.width()/7-6, stage.height()-20) )
 *   .container(stage).draw();
 * @illustrationDesc
 *  a) ObjectBoundingBox no angle preservation.<br/>
 *  b) ObjectBoundingBox preserving an angle.<br/>
 *  c) UserSpaceOnUse.<br/>
 *  d) Three step gradients.<br/>
 * @param {!Array.<(acgraph.vector.GradientKey|string)>} keys Gradient keys.
 * @param {number=} opt_angle Gradient angle.
 * @param {(boolean|!acgraph.vector.Rect|!{left:number,top:number,width:number,height:number})=} opt_mode Gradient mode.
 * @param {number=} opt_opacity Gradient opacity.
 * @return {!anychart.core.ui.Background} {@link anychart.core.ui.Background} instance for method chaining.
 *//**
 * Radial gradient fill.
 * @example <t>simple-h100</t>
 * var bg = anychart.ui.background();
 * // set fill
 *   bg.fill(['black', 'white'], .5, .5, null, .9, 0.3, 0.81)
 * bg.container(stage)
 *   .bounds( anychart.math.rect(10, 10, 90, 90) )
 *   .draw();
 * @param {!Array.<(acgraph.vector.GradientKey|string)>} keys Color-stop gradient keys.
 * @param {number} cx X ratio of center radial gradient.
 * @param {number} cy Y ratio of center radial gradient.
 * @param {acgraph.math.Rect=} opt_mode If defined then userSpaceOnUse mode, else objectBoundingBox.
 * @param {number=} opt_opacity Opacity of the gradient.
 * @param {number=} opt_fx X ratio of focal point.
 * @param {number=} opt_fy Y ratio of focal point.
 * @return {!anychart.core.ui.Background} {@link anychart.core.ui.Background} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {!(acgraph.vector.Fill|anychart.core.ui.Background)} .
 */
anychart.core.ui.Background.prototype.fill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var val = acgraph.vector.normalizeFill.apply(null, arguments);
    if (!anychart.color.equals(this.fill_, val)) {
      this.fill_ = val;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.fill_ || 'none';
  }
};


/**
 * Returns current stroke.
 * @return {acgraph.vector.Stroke} Returns current stroke.
 *//**
 * Sets stroke settings using one parameter.<br/>
 * Accepts:
 * <ul>
 * <li>String formatted as '[thickness ]color[ opacity]':
 * <ol>
 * <li><b>'color'</b> - {@link http://www.w3schools.com/html/html_colors.asp}.</li>
 * <li><b>'thickness color'</b> - like a css border, e.g. '3 red' or '3px red'</li>
 * <li><b>'color opacity'</b> - as a fill string, e.g. '#fff 0.5'</li>
 * <li><b>'thickness color opacity'</b> - as a complex string, e.g. '3px #00ff00 0.5'</li>
 * </ol>
 * </li>
 * <li>{@link acgraph.vector.Stroke} object</li>
 * <li>{@link acgraph.vector.GradientKey} keys array</li>
 * <li><b>null</b> resets current stroke settings</li>
 * </ul>
 * <b>Note:</b> String parts order is significant and '3px red' is not the same as 'red 3px'.
 * @shortDescription Sets stroke settings using one parameter.
 * @example <c>String</c>
 * anychart.ui.background()
 *   .bounds( anychart.math.rect(stage.width()/2-8, 5, 16, stage.height()-10) )
 *   .fill('none').container(stage).draw();
 * anychart.ui.background()
 *   .stroke('red')
 *   .bounds( anychart.math.rect(30, 0.4*stage.height()/4, stage.width()-60, stage.height()/4 - 30) )
 *   .fill('none').container(stage).draw();
 * anychart.ui.background()
 *   .stroke('4px ORANGE')
 *   .bounds( anychart.math.rect(30, 1.4*stage.height()/4, stage.width()-60, stage.height()/4 - 30) )
 *   .fill('none').container(stage).draw();
 * anychart.ui.background()
 *   .stroke('#0f0 0.7')
 *   .bounds( anychart.math.rect(30, 2.4*stage.height()/4, stage.width()-60, stage.height()/4 - 30) )
 *   .fill('none').container(stage).draw();
 * anychart.ui.background()
 *   .stroke('4 #0000FF 0.3')
 *   .bounds( anychart.math.rect(30, 3.4*stage.height()/4, stage.width()-60, stage.height()/4 - 35) )
 *   .fill('none').container(stage).draw();
 * @example <c>Object or array</c>
 * anychart.ui.background()
 *   .stroke({color: '#f00', thickness: 2, opacity: 0.9})
 *   .bounds( anychart.math.rect(30, 0.3*stage.height()/2, stage.width()-60, stage.height()/2 - 50) )
 *   .fill('none').container(stage).draw();
 * anychart.ui.background()
 *   .stroke(['red', 'green', 'blue'])
 *   .bounds( anychart.math.rect(30, 1.3*stage.height()/2, stage.width()-60, stage.height()/2 - 50) )
 *   .fill('none').container(stage).draw();
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)} value ['#000'] Fill formatted as '[thickness ]color[ opacity]'.
 * @return {!anychart.core.ui.Background} {@link anychart.core.ui.Background} class for method chaining.
 *//**
 * Sets stroke settings.<br/>
 * <b>Note:</b> When stroke properties are set both by complex stroke object properties and by stroke() method params,
 * object properties have priority. E.g. setting <b>shape.stroke('10 red', 5);</b> (or <b>shape.stroke({color: 'red',
 * thickness: 10}, 5);</b> will result in a red stroke with thickness 10px.
 * @shortDescription Sets stroke settings.
 * @example
 * anychart.ui.background()
 *   .stroke('red .5', 4)
 *   .bounds( anychart.math.rect(30, 0.4*stage.height()/4, stage.width()-60, stage.height()/4 - 30) )
 *   .fill('none').container(stage).draw();
 * anychart.ui.background()
 *   .stroke('5 orange .5', 1)
 *   .bounds( anychart.math.rect(30, 1.2*stage.height()/4, stage.width()-60, 0.6*stage.height()/4) )
 *   .fill('none').container(stage).draw();
 * anychart.ui.background()
 *   .stroke(['red', 'green', 'blue'], 5, '5 2')
 *   .bounds( anychart.math.rect(30, 2.2*stage.height()/4, stage.width()-60, 0.6*stage.height()/4) )
 *   .fill('none').container(stage).draw();
 * anychart.ui.background()
 *   .stroke({color: '#00B'}, 10, '', acgraph.vector.StrokeLineJoin.ROUND, acgraph.vector.StrokeLineCap.SQUARE)
 *   .bounds( anychart.math.rect(30, 3.2*stage.height()/4, stage.width()-60, 0.6*stage.height()/4 -5) )
 *   .fill('none').container(stage).draw();
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string)} value Fill settings.
 * @param {number=} opt_thickness Line thickness. Defaults to 1 of not set.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths. Dash array contains a
 * list of white space separated lengths and percentages that specify the lengths of alternating dashes and gaps. If an
 * odd number of values is provided, then the list of values is repeated to yield an even number of values. Thus, stroke
 * dashpattern: '5 3 2' is equivalent to dashpattern: '5 3 2 5 3 2'.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line join style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {!anychart.core.ui.Background} {@link anychart.core.ui.Background} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)=} opt_strokeOrFill .
 * @param {number=} opt_thickness .
 * @param {string=} opt_dashpattern .
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin .
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap .
 * @return {(!anychart.core.ui.Background|acgraph.vector.Stroke)} .
 */
anychart.core.ui.Background.prototype.stroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var val = acgraph.vector.normalizeStroke.apply(null, arguments);
    if (!anychart.color.equals(val, this.stroke_)) {
      this.stroke_ = val;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.stroke_ || 'none';
  }
};


/**
 * Render background.
 * @return {!anychart.core.ui.Background} {@link anychart.core.ui.Background} instance for method chaining.
 */
anychart.core.ui.Background.prototype.draw = function() {
  if (!this.checkDrawingNeeded())
    return this;

  if (!this.rect_) {
    this.rect_ = acgraph.rect();
    this.registerDisposable(this.rect_);
  }

  var stage = this.container() ? this.container().getStage() : null;
  var manualSuspend = stage && !stage.isSuspended();
  if (manualSuspend) stage.suspend();

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    var bounds = this.getPixelBounds();
    var thicknessHalf = this.rect_.strokeThickness() / 2;
    //TODO(Anton Saukh): remove this fix when graphics is fixed.
    if (isNaN(thicknessHalf)) thicknessHalf = .5;
    bounds.left += thicknessHalf;
    bounds.top += thicknessHalf;
    bounds.width -= thicknessHalf + thicknessHalf;
    bounds.height -= thicknessHalf + thicknessHalf;
    this.rect_.setBounds(bounds);
    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    this.rect_.fill(this.fill_);
    this.rect_.stroke(this.stroke_);
    switch (this.cornerType_) {
      case anychart.enums.BackgroundCornersType.ROUND:
        this.rect_.round.apply(this.rect_, this.corners_);
        break;
      case anychart.enums.BackgroundCornersType.CUT:
        this.rect_.cut.apply(this.rect_, this.corners_);
        break;
      case anychart.enums.BackgroundCornersType.ROUND_INNER:
        this.rect_.roundInner.apply(this.rect_, this.corners_);
        break;
      default:
        this.rect_.cut(0);
        break;
    }
    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    this.rect_.zIndex(/** @type {number} */(this.zIndex()));
    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    this.rect_.parent(/** @type {acgraph.vector.ILayer} */(this.container()));
    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }

  if (manualSuspend) stage.resume();

  return this;
};


/** @inheritDoc */
anychart.core.ui.Background.prototype.remove = function() {
  if (this.rect_) this.rect_.parent(null);
};


/** @inheritDoc */
anychart.core.ui.Background.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');
  json['fill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill} */(this.fill()));
  json['stroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke} */(this.stroke()));
  json['cornerType'] = this.cornerType();
  var corners = /** @type {Array} */(this.corners());
  if (corners.length >= 4) {
    corners = {
      'leftTop': corners[0],
      'rightTop': corners[1],
      'rightBottom': corners[2],
      'leftBottom': corners[3]
    };
  } else {
    corners = corners[0];
  }
  json['corners'] = corners;
  return json;
};


/** @inheritDoc */
anychart.core.ui.Background.prototype.setupSpecial = function(var_args) {
  var args = arguments;
  if (goog.isString(args[0])) {
    this.fill(args[0]);
    this.stroke(null);
    this.enabled(true);
    return true;
  }
  return anychart.core.VisualBaseWithBounds.prototype.setupSpecial.apply(this, arguments);
};


/** @inheritDoc */
anychart.core.ui.Background.prototype.setupByJSON = function(config) {
  goog.base(this, 'setupByJSON', config);
  this.fill(config['fill']);
  this.stroke(config['stroke']);
  this.cornerType(config['cornerType']);
  this.corners(config['corners']);
};


//exports
anychart.core.ui.Background.prototype['fill'] = anychart.core.ui.Background.prototype.fill;//in docs/final
anychart.core.ui.Background.prototype['stroke'] = anychart.core.ui.Background.prototype.stroke;//in docs/final
anychart.core.ui.Background.prototype['cornerType'] = anychart.core.ui.Background.prototype.cornerType;//in docs/final
anychart.core.ui.Background.prototype['corners'] = anychart.core.ui.Background.prototype.corners;//in docs/final
