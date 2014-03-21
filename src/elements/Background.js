goog.provide('anychart.elements.Background');

goog.require('anychart.elements.BaseWithBounds');
goog.require('goog.array');



/**
 * Background element class.<br/>
 * Background can be self-sufficient element or be a part of other complex element,
 * such as as a chart, a legend, a title.<br/>
 * Background has the fill, the border and the corner settings.<br/>
 * <b>Note:</b> If you want to use Background as a self-sufficient element
 *  you need to set the bounds where it should be displayed.
 * @example <t>simple-h100</t>
 * new anychart.elements.Background()
 *   .bounds( new anychart.math.Rect(10, 10, stage.width()-20, stage.height() - 20) )
 *   .container(stage).draw();
 * @param {anychart.elements.Background.CornerType=} opt_cornerType [anychart.elements.Background.CornerType.ROUND] Type
 *  of the background corners.
 * @param {...(number|string)} var_args The set of radii (similar to {@link anychart.elements.Background#corners} but
 * without an array.
 * @extends {anychart.elements.BaseWithBounds}
 * @constructor
 */
anychart.elements.Background = function(opt_cornerType, var_args) {
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
  this.cornerType_ = opt_cornerType || anychart.elements.Background.CornerType.ROUND;

  /**
   * @type {!Array}
   * @private
   */
  this.corners_ = goog.array.slice(arguments, 1, 5);

  /**
   * Fill settings. Contains an array of arguments that were passed to the fill() method to support all
   * acgraph.vector.Shape.fill() overloads.
   * @type {!Array}
   * @private
   */
  this.fill_ = ['#000', 0.5]; // if we remove the creation of an array from here, we should not forget to remove "apply" from "copyFrom"

  /**
   * Stroke settings. Contains an array of arguments that were passed to the stroke() method to support all
   * acgraph.vector.Shape.stroke() overloads.
   * @type {!Array}
   * @private
   */
  this.stroke_ = ['#000']; // if we remove the creation of an array from here, we should not forget to remove "apply" from "copyFrom"

  this.invalidate(anychart.utils.ConsistencyState.ALL);
};
goog.inherits(anychart.elements.Background, anychart.elements.BaseWithBounds);


/**
 * Types of the corner.
 * @enum {string}
 */
anychart.elements.Background.CornerType = {
  /**
   * @illustration
   * stage.width(200).height(30);
   * stage.text(35, 10, 'Square corners').fontSize(12);
   * stage.path()
   *   .moveTo(5, 25)
   *   .lineTo(5, 10)
   *   .lineTo(20, 10)
   *   .stroke('3 #F00')
   * stage.path()
   *   .moveTo(5,30)
   *   .lineTo(5,25)
   *   .moveTo(20, 10)
   *   .lineTo(25, 10)
   *   .stroke('3 #666')
   */
  NONE: 'none',
  /**
   * @illustration
   * stage.width(200).height(30);
   * stage.text(35, 10, 'Round corners')
   * stage.path()
   *   .moveTo(5, 25)
   *   .arcToByEndPoint(20, 10, 15, 15, false, true)
   *   .stroke('3 #F00')
   *  stage.path()
   *   .moveTo(5,30)
   *   .lineTo(5,25)
   *   .moveTo(20, 10)
   *   .lineTo(25, 10)
   *   .stroke('3 #666')
   */
  ROUND: 'round',
  /**
   * @illustration
   * stage.width(200).height(30);
   * stage.text(35, 10, 'Cut corners')
   * stage.path()
   *   .moveTo(5, 25)
   *   .lineTo(20, 10)
   *   .stroke('3 #F00')
   *  stage.path()
   *   .moveTo(5,30)
   *   .lineTo(5,25)
   *   .moveTo(20, 10)
   *   .lineTo(25, 10)
   *   .stroke('3 #666')
   */
  CUT: 'cut',
  /**
   * @illustration
   * stage.width(200).height(30);
   * stage.text(35, 10, 'Round-inner corners')
   * stage.path()
   *   .moveTo(5, 25)
   *   .arcToByEndPoint(20, 10, 15, 15, false, false)
   *   .stroke('3 #F00')
   *  stage.path()
   *   .moveTo(5,30)
   *   .lineTo(5,25)
   *   .moveTo(20, 10)
   *   .lineTo(25, 10)
   *   .stroke('3 #666')
   */
  ROUND_INNER: 'roundInner'
};


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.elements.Background.prototype.DISPATCHED_CONSISTENCY_STATES =
    anychart.elements.BaseWithBounds.prototype.DISPATCHED_CONSISTENCY_STATES |
        anychart.utils.ConsistencyState.APPEARANCE;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.elements.Background.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.elements.BaseWithBounds.prototype.SUPPORTED_CONSISTENCY_STATES |
        anychart.utils.ConsistencyState.APPEARANCE;


/**
 * Getter for the current corners radius.
 * @return {(number|string|Array.<number>)} Current corner settings.
 *//** topLeft, topRight, bottomRight, bottomLeft
 * Setter for corner radius using one value.
 * @example <c>One for all.</c><t>simple-h100</t>
 * new anychart.elements.Background()
 *   .cornerType(anychart.elements.Background.CornerType.CUT)
 *   .corners(10) // same .corners('10px')
 *   .bounds( new anychart.math.Rect(10, 10, stage.width()-20, stage.height() - 20) )
 *   .stroke('#000 2').fill('none').container(stage).draw();
 * @example <c>One for all.</c><t>simple-h100</t>
 * new anychart.elements.Background()
 *   .cornerType(anychart.elements.Background.CornerType.CUT)
 *   .corners([5, 7, 12, 7])
 *    // same .corners('5 7 12 7')
 *    // same .corners('5px 7px 12px 7px')
 *   .bounds( new anychart.math.Rect(10, 10, stage.width()-20, stage.height() - 20) )
 *   .stroke('#000 2').fill('none').container(stage).draw();
 * @param {(number|string|Array.<number>)=} opt_value ['0px'] The value to set.<br/><b>Note:</b> If there is less than 4 elements
 *  (or space delimited string has less than 4 values) then the first value is set for all 4 corners.
 * @return {!anychart.elements.Background} An instance of the {@link anychart.elements.Background} class for method chaining.
 *//**
 * Setter for corner radius using several values.
 * @example <t>simple-h100</t>
 * new anychart.elements.Background()
 *   .cornerType(anychart.elements.Background.CornerType.CUT)
 *   .corners(15, 7, 12, 7)
 *   .bounds( new anychart.math.Rect(10, 10, stage.width()-20, stage.height() - 20) )
 *   .stroke('#000 2').fill('none').container(stage).draw();
 * @param {(number|string)=} opt_topLeft Top left corner value.
 * @param {(number|string)=} opt_topRight Top right corner value.
 * @param {(number|string)=} opt_bottomRight Bottom left corner value.
 * @param {(number|string)=} opt_bottomLeft Bottom right corner value.
 * @return {!anychart.elements.Background} An instance of the {@link anychart.elements.Background} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(number|string|Array.<number>)=} opt_value .
 * @return {(number|string|Array.<number>|!anychart.elements.Background)} .
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
 * Getter for current corner type.
 * @return {anychart.elements.Background.CornerType} Corners type or self for chaining.
 *//**
 * Setter for corner type.
 * @example <t>simple-h100</t>
 * new anychart.elements.Background()
 *   .cornerType(anychart.elements.Background.CornerType.ROUND_INNER)
 *   .corners(10)
 *   .stroke('#000 2')
 *   .bounds( new anychart.math.Rect(10, 10, stage.width()-20, stage.height() - 20) )
 *   .fill('none').container(stage).draw();
 * @param {anychart.elements.Background.CornerType=} opt_value [{@link anychart.elements.Background.CornerType}.ROUND] Value to set.
 * @return {!anychart.elements.Background} An instance of the {@link anychart.elements.Background} class for method chaining.
 *//**
 * @ignoreDoc
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
 * Returns the current fill.
 * @return {!acgraph.vector.Fill} The parameters of the current fill (empty fill is 'none').
 *//**
 * Sets fill settings using an object or a string.<br/>
 * It accepts the following types of objects:
 * <ul>
 * <li>{@link acgraph.vector.LinearGradientFill}</li>
 * <li>{@link acgraph.vector.RadialGradientFill}</li>
 * <li>{@link acgraph.vector.Fill}</li>
 * <li>{@link acgraph.vector.ImageFill}</li>
 * </ul>
 * Or you can simply pass a color as string, along with opacity (like this: '<b>Color Opacity</b>',
 * e.g. 'red .5').
 * @shortDescription Sets fill settings using an object or a string.
 * @example <c>Solid Fill</c><t>simple-h100</t>
 * var bg = new anychart.elements.Background();
 * // Setting fill
 *   bg.fill('red 0.1');
 * // the same
 * // bg.fill('#ff0000 0.1');
 * // or
 * // bg.fill({color: 'red', opacity: 0.1});
 * // or
 * // bg.fill('#ff0000 0.1');
 * // then draw
 * bg.container(stage)
 *   .bounds( new anychart.math.Rect(10, 10, stage.width()-20, stage.height()-20) )
 *   .draw();
 * @example <c>Gradient Fill</c><t>simple-h100</t>
 * var bg = new anychart.elements.Background();
 * // Setting fill
 *   bg.fill({keys:['red .1', 'orange'], mode: true, angle: 45});
 * bg.container(stage)
 *   .bounds( new anychart.math.Rect(10, 10, stage.width()-20, stage.height()-20) )
 *   .draw();
 * @example <c>Image Fill</c><t>simple-h100</t>
 * new anychart.elements.Background()
 *    .bounds( new anychart.math.Rect(10, 10, stage.width()-20, stage.height() - 20) )
 *    .stroke('#000 2').fill({
 *        src: 'styles/images/rainbow.png',
 *        mode: acgraph.vector.ImageFillMode.TILE
 *     }).container(stage).draw();
 * @param {acgraph.vector.Fill} value ['#000 0.5'] Fill as an object or a string.
 * @return {!acgraph.vector.Shape} An instance of the {@link acgraph.vector.Shape} class for method chaining.
 * *//**
 * Fill as a color with an opacity.<br/>
 * <b>Note:</b> If color is set as a string (e.g. 'red .5'), it has priority over opt_opacity parameter, so when
 *<b>fill</b> is set as <b>rect.fill('red 0.3', 0.7)</b> the opacity will be 0.3, not 0.7.
 * @shortDescription Fill as a string of a color with an opacity.
 * @example <t>simple-h100</t>
 * var bg = new anychart.elements.Background();
 * // Setting fill
 *   bg.fill('red', 0.1);
 * bg.container(stage)
 *   .bounds( new anychart.math.Rect(10, 10, stage.width()-20, stage.height()-20) )
 *   .draw();
 * @param {string} color Color of the fill as a string
 * @param {number=} opt_opacity Opacity of the fill.
 * @return {!anychart.elements.Background} An instance of the {@link anychart.elements.Background} class for method chaining.
 *//**
 * Gradient fill.<br/>
 * There are three modes:
 * <ul>
 *  <li>ObjectBoundingBox preserving an angle</li>
 *  <li>ObjectBoundingBox without preserving an angle</li>
 *  <li>UserSpaceOnUse</li>
 * </ul>
 * <h4>Modes:</h4>
 * <p><b>ObjectBoundingBox preserving an angle</b><br/>
 * If boolean is passed then angle control is enabled
 * to be precise: you can define how gradient angle behaves. Is set to true - it is ObjectBoundingBox mode
 * preserving an angle, which means that in any shape the gradient angle is preserved.<br/>
 * <b>Note:</b> By default the gradient angle for all shapes which sides are not in 1:1 ratio will not look
 * as it should: browsers transform the angle depending on dimensions ratio. That's why an algorithm
 * to keep an angle is created.</p>
 * <p><b>ObjectBoundingBox without preserving an angle</b><br/>
 * If set to false - ObjectBoundingBox without preserving an angle mode works. In this case default behaviour
 * is enabled - gradient vector is calculated as it should be, but for all shapes which sides are not in
 * 1:1 rato it will be changes by a browser (skewed according to sides ratio) and it will not look like
 * the angles set.</p>
 * <p><b>UserSpaceOnUse</b><br/>
 * If acgraph.math.Rect object is passed - UserSpaceOnUse mode is enabled.
 * In this case gradient gets its own size and coordinatesы. Shapes that are colored using this gradient
 * are colored with a part of the gradient (if sizes math - shape will be colored entirely).
 * Learn more about this mode at:
 * <a href='http://www.w3.org/TR/SVG/pservers.html#LinearGradientElementGradientUnitsAttribute'>
 * gradientUnits</a>. In this case gradient angle is always preserved.</p>
 * @shortDescription Line gradient fill.
 * @illustration <t>simple</t>
 * stage.text(0*stage.width()/6+3, 0, 'a');
 * new anychart.elements.Background()
 *   .fill(['0.2 black', 'white'], 45)
 *   .bounds( new anychart.math.Rect(0*stage.width()/6+3, 13, stage.width()/7-6, stage.height()-20) )
 *   .container(stage).draw();
 * stage.text(1*stage.width()/6-5, 0, 'b');
 * new anychart.elements.Background()
 *   .fill(['0.2 black', 'white'], 45, true)
 *   .bounds( new anychart.math.Rect(1*stage.width()/6-5, 13, stage.width()/7-6, stage.height()-20) )
 *   .container(stage).draw();
 * stage.text(2*stage.width()/6+3, 0, 'c');
 * new anychart.elements.Background()
 *   .fill(['red', 'blue'], 45, {left: 10, top: 20, width: 100, height: 100})
 *   .bounds( new anychart.math.Rect(2*stage.width()/6+3, 13, stage.width()/7-6, stage.height()-20) )
 *   .container(stage).draw();
 * new anychart.elements.Background()
 *   .fill(['red', 'blue'], 45, new anychart.math.Rect(10, 20, 100, 100))
 *   .bounds( new anychart.math.Rect(3*stage.width()/6-5, 13, stage.width()/7-6, stage.height()-20) )
 *   .container(stage).draw();
 * stage.text(4*stage.width()/6+3, 0, 'd');
 * new anychart.elements.Background()
 *   .fill(['red 0.1', 'orange', 'red 0.1'])
 *   .bounds( new anychart.math.Rect(4*stage.width()/6+3, 13, stage.width()/7-6, stage.height()-20) )
 *   .container(stage).draw();
 * new anychart.elements.Background()
 *   .fill(['red', {offset: 0.3, color: 'orange'}, 'red 0.1'])
 *   .bounds( new anychart.math.Rect(5*stage.width()/6-5, 13, stage.width()/7-6, stage.height()-20) )
 *   .container(stage).draw();
 * @illustrationDesc
 *  a) ObjectBoundingBox without preserving an angle.<br/>
 *  b) ObjectBoundingBox preserving an angle.<br/>
 *  c) UserSpaceOnUse.<br/>
 *  d) Three-stop gradients.<br/>
 * @param {!Array.<(acgraph.vector.GradientKey|string)>} keys Gradient keys.
 * @param {number=} opt_angle Gradient angle, set in degrees, relative to horizontal line.
 * @param {(boolean|!acgraph.vector.Rect|!{left:number,top:number,width:number,height:number})=} opt_mode Gradient mode.
 * @param {number=} opt_opacity Gradient opacity.
 * @return {!anychart.elements.Background} An instance of the {@link anychart.elements.Background} class for method chaining.
 *//**
 * Radial gradient fill.
 * @example <t>simple-h100</t>
 * var bg = new anychart.elements.Background();
 * // Устанавливаем fill
 *   bg.fill(['black', 'white'], .5, .5, null, .9, 0.3, 0.81)
 * bg.container(stage)
 *   .bounds( new anychart.math.Rect(10, 10, 90, 90) )
 *   .draw();
 * @param {!Array.<(acgraph.vector.GradientKey|string)>} keys Gradient keys.
 * @param {number} cx The X ratio of the center radial gradient.
 * @param {number} cy The Y ratio of the center radial gradient.
 * @param {acgraph.math.Rect=} opt_mode If set then userSpaceOnUse mode else objectBoundingBox.
 * @param {number=} opt_opacity The opacity of the gradient.
 * @param {number=} opt_fx The X ratio of the focal point.
 * @param {number=} opt_fy The Y ratio of the focal point.
 * @return {!anychart.elements.Background} An instance of the {@link anychart.elements.Background} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {!(acgraph.vector.Fill|anychart.elements.Background)} .
 */
anychart.elements.Background.prototype.fill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
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
 * Returns the current stroke.
 * @return {acgraph.vector.Stroke} Returns the curren line settings.
 *//**
 * Sets stroke settings using one parameter.<br/>
 * The following ways are acceptable:
 * <ul>
 * <li>String formatted as '[thickness ]color[ opacity]':
 * <ol>
 * <li><b>'color'</b> - {@link http://www.w3schools.com/html/html_colors.asp}.</li>
 * <li><b>'thickness color'</b> - like a css border, e.g. '3 red' or '3px red'</li>
 * <li><b>'color opacity'</b> - the same as color settings in fill, e.g. '#fff 0.5'</li>
 * <li><b>'thickness color opacity'</b> - as a complex string, e.g. '3px #00ff00 0.5'</li>
 * </ol>
 * </li>
 * <li>{@link acgraph.vector.Stroke} object</li>
 * <li>Keys array {@link acgraph.vector.GradientKey}</li>
 * <li><b>null</b> resets stroke settings.</li>
 * </ul>
 * <b>Note:</b> Order in string is significant and '3px red' is not the same as 'red 3px'.
 * @shortDescription Sets stroke settings using a single parameter.
 * @example <c>Settings using a string</c><t>simple</t>
 * new anychart.elements.Background()
 *   .bounds( new anychart.math.Rect(stage.width()/2-8, 5, 16, stage.height()-10) )
 *   .fill('none').container(stage).draw();
 * new anychart.elements.Background()
 *   .stroke('red')
 *   .bounds( new anychart.math.Rect(30, 0.4*stage.height()/4, stage.width()-60, stage.height()/4 - 30) )
 *   .fill('none').container(stage).draw();
 * new anychart.elements.Background()
 *   .stroke('4px ORANGE')
 *   .bounds( new anychart.math.Rect(30, 1.4*stage.height()/4, stage.width()-60, stage.height()/4 - 30) )
 *   .fill('none').container(stage).draw();
 * new anychart.elements.Background()
 *   .stroke('#0f0 0.7')
 *   .bounds( new anychart.math.Rect(30, 2.4*stage.height()/4, stage.width()-60, stage.height()/4 - 30) )
 *   .fill('none').container(stage).draw();
 * new anychart.elements.Background()
 *   .stroke('4 #0000FF 0.3')
 *   .bounds( new anychart.math.Rect(30, 3.4*stage.height()/4, stage.width()-60, stage.height()/4 - 35) )
 *   .fill('none').container(stage).draw();
 * @example <c>Settings using an object or an array</c><t>simple</t>
 * new anychart.elements.Background()
 *   .stroke({color: '#f00', thickness: 2, opacity: 0.9})
 *   .bounds( new anychart.math.Rect(30, 0.3*stage.height()/2, stage.width()-60, stage.height()/2 - 50) )
 *   .fill('none').container(stage).draw();
 * new anychart.elements.Background()
 *   .stroke(['red', 'green', 'blue'])
 *   .bounds( new anychart.math.Rect(30, 1.3*stage.height()/2, stage.width()-60, stage.height()/2 - 50) )
 *   .fill('none').container(stage).draw();
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)} value ['#000'] Stroke settings in '[thickness ]color[ opacity]' format.
 * @return {anychart.elements.Background} An instance of the {@link anychart.elements.Background} class for method chaining.
 *//**
 * Sets stroke settings.<br/>
 * <b>Note:</b> When stroke properties are set both by a complex stroke object properties and by stroke() method params,
 * object properties have a priority. E.g. setting <b>shape.stroke('10 red', 5);</b> (or <b>shape.stroke({color: 'red',
 * thickness: 10}, 5);</b> will result in a red stroke with a thickness of 10px.
 * @shortDescription Setting stroke settings.
 * @example <t>simple</t>
 * new anychart.elements.Background()
 *   .stroke('red .5', 4)
 *   .bounds( new anychart.math.Rect(30, 0.4*stage.height()/4, stage.width()-60, stage.height()/4 - 30) )
 *   .fill('none').container(stage).draw();
 * new anychart.elements.Background()
 *   .stroke('5 orange .5', 1)
 *   .bounds( new anychart.math.Rect(30, 1.2*stage.height()/4, stage.width()-60, 0.6*stage.height()/4) )
 *   .fill('none').container(stage).draw();
 * new anychart.elements.Background()
 *   .stroke(['red', 'green', 'blue'], 5, '5 2')
 *   .bounds( new anychart.math.Rect(30, 2.2*stage.height()/4, stage.width()-60, 0.6*stage.height()/4) )
 *   .fill('none').container(stage).draw();
 * new anychart.elements.Background()
 *   .stroke({color: '#00B'}, 10, '', acgraph.vector.StrokeLineJoin.ROUND, acgraph.vector.StrokeLineCap.SQUARE)
 *   .bounds( new anychart.math.Rect(30, 3.2*stage.height()/4, stage.width()-60, 0.6*stage.height()/4 -5) )
 *   .fill('none').container(stage).draw();
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string)} value Stroke settings as described above.
 * @param {number=} opt_thickness Stroke thickness. Default is 1.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used for stroke paths. Dash array contains a
 * list of white spaces separated lengths and percentages that specify the lengths of alternating dashes and gaps. If an
 * odd number of values is provided, then the list of the values is repeated to yield an even number of values. Thus, stroke
 * dashpattern: '5 3 2' is equivalent to dashpattern: '5 3 2 5 3 2'.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line joining style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Style of line cap.
 * @return {anychart.elements.Background} An instance of the {@link anychart.elements.Background} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)=} opt_strokeOrFill .
 * @param {number=} opt_thickness .
 * @param {string=} opt_dashpattern .
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin .
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap .
 * @return {(!anychart.elements.Background|acgraph.vector.Stroke)} .
 */
anychart.elements.Background.prototype.stroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
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
 * Render background.
 * @return {!anychart.elements.Background} An instance of {@link anychart.elements.Background} class for method chaining.
 */
anychart.elements.Background.prototype.draw = function() {
  // we don't have a ConsistencyState for this, because it would be redundant.
  if (!this.rect_) {
    this.rect_ = acgraph.rect();
    this.registerDisposable(this.rect_);
  }

  if (this.isConsistent())
    return this;

  this.resolveEnabledState();

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


/** @inheritDoc */
anychart.elements.Background.prototype.restore = function() {
  if (this.rect_ && this.enabled()) this.rect_.parent(/** @type {acgraph.vector.ILayer} */(this.container()));
};


/** @inheritDoc */
anychart.elements.Background.prototype.remove = function() {
  if (this.rect_) this.rect_.parent(null);
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


/**
 * @inheritDoc
 */
anychart.elements.Background.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');

  var corners = this.corners();
  var cornerType = this.cornerType();

  var fill = this.fill();
  var stroke = this.stroke();

  if (fill) {
    var fillData, tmpFill, tmpStroke;
    if (fill instanceof acgraph.vector.HatchFill) {
      fillData = {
        'type': 'hatchFill',
        'hatchType': fill.type,
        'color': fill.color,
        'thickness': fill.thickness,
        'size': fill.size
      };
    } else if (fill instanceof acgraph.vector.PatternFill) {
      fillData = fill.serialize();
    } else if (goog.isObject(fill) && ('keys' in fill)) {
      if (('cx' in fill) && ('cy' in fill)) {
        tmpFill = anychart.utils.recursiveClone(fill);
        tmpFill['type'] = 'RadialGradientFill';
        fillData = tmpFill;
      } else {
        tmpFill = anychart.utils.recursiveClone(fill);
        tmpFill['type'] = 'LinearGradientFill';
        fillData = tmpFill;
      }
    } else {
      fillData = fill;
    }
    if (fillData) json['fill'] = fillData;
  } else {
    if (fill == null) json['fill'] = fill;
  }

  if (stroke || stroke == null) {
    json['stroke'] = stroke;
  } else if (goog.isObject(stroke) && ('keys' in stroke)) {
    if (('cx' in stroke) && ('cy' in stroke)) {
      tmpStroke = anychart.utils.recursiveClone(stroke);
      tmpStroke['type'] = 'RadialGradientFill';
      json['stroke'] = tmpStroke;
    } else {
      tmpStroke = anychart.utils.recursiveClone(stroke);
      tmpStroke['type'] = 'LinearGradientFill';
      json['stroke'] = tmpStroke;
    }
  }

  if (corners) json['corners'] = corners;
  if (cornerType) json['cornerType'] = cornerType;

  return json;
};


/**
 * Deserializes data from config.
 * @param {Object} config Json config.
 */
anychart.elements.Background.prototype.deserialize = function(config) {
  this.fill(config['fill']);
  this.stroke(config['stroke']);
  this.corners(config['corners']);
  this.cornerType(config['cornerType']);
};

