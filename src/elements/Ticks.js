goog.provide('anychart.elements.Ticks');

goog.require('anychart.Base');
goog.require('anychart.color');
goog.require('anychart.utils');
goog.require('anychart.utils.Bounds');



/**
 * Axis ticks class.<br/>
 * You can change position, lenght and line features.
 * @constructor
 * @extends {anychart.VisualBase}
 */
anychart.elements.Ticks = function() {
  goog.base(this);

  /**
   * Ticks length.
   * @type {number}
   * @private
   */
  this.length_;

  /**
   * Ticks stroke.
   * @type {acgraph.vector.Stroke|string}
   * @private
   */
  this.stroke_;

  /**
   * Ticks position.
   * @type {anychart.elements.Ticks.Position|string}
   * @private
   */
  this.position_;

  /**
   * Ticks enabled.
   * @type {anychart.utils.Orientation}
   * @private
   */
  this.orientation_;

  /**
   * Path with ticks.
   * @type {!acgraph.vector.Path}
   * @private
   */
  this.path_ = acgraph.path();
  this.registerDisposable(this.path_);

  this.restoreDefaults();
};
goog.inherits(anychart.elements.Ticks, anychart.VisualBase);


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.elements.Ticks.prototype.SUPPORTED_SIGNALS = anychart.VisualBase.prototype.SUPPORTED_SIGNALS;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.elements.Ticks.prototype.SUPPORTED_CONSISTENCY_STATES = anychart.VisualBase.prototype.SUPPORTED_CONSISTENCY_STATES; // ENABLED CONTAINER Z_INDEX


//----------------------------------------------------------------------------------------------------------------------
//
//  Enums.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Ticks position (inside ot outside).
 * @enum {string}
 */
anychart.elements.Ticks.Position = {
  /**
   * Inside a chart, no matter where an axis is.
   */
  INSIDE: 'inside',
  /**
   * Outside of a chart, no matter where an axis is.
   */
  OUTSIDE: 'outside'
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Properties.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter for current ticks length.
 * @return {number} Length of ticks.
 *//**
 * Setter for ticks length.
 * @illustration <t>simple-h100</t>
 * stage.text(10,0, 'axis');
 * stage.text(10,40, 'tick');
 * stage.path()
 *     .moveTo(0, 15)
 *     .lineTo(stage.width(), 15)
 *     .stroke('5 black');
 * stage.path()
 *     .moveTo(stage.width()/5-stage.width()/10, 15)
 *     .lineTo(stage.width()/5-stage.width()/10, 55)
 *     .moveTo(2*stage.width()/5-stage.width()/10, 15)
 *     .lineTo(2*stage.width()/5-stage.width()/10, 55)
 *     .moveTo(3*stage.width()/5-stage.width()/10, 15)
 *     .lineTo(3*stage.width()/5-stage.width()/10, 55)
 *     .moveTo(4*stage.width()/5-stage.width()/10, 15)
 *     .lineTo(4*stage.width()/5-stage.width()/10, 55)
 *     .moveTo(5*stage.width()/5-stage.width()/10, 15)
 *     .lineTo(5*stage.width()/5-stage.width()/10, 55);
 * stage.path()
 *     .moveTo(stage.width()/5, 15)
 *     .lineTo(stage.width()/5, 55)
 *     .lineTo(stage.width()/5-5, 55)
 *     .lineTo(stage.width()/5+5, 55)
 *     .stroke('1 grey 1');
 * stage.triangleUp(stage.width()/5, 20, 3).stroke('1 grey 1');
 * stage.triangleDown(stage.width()/5, 50, 3).stroke('1 grey 1');
 * stage.text(stage.width()/5, 57, 'length');
 * @param {number=} opt_value Value to set.
 * @return {anychart.elements.Ticks} An instance of the {@link anychart.elements.Ticks} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {number=} opt_value .
 * @return {(number|!anychart.elements.Ticks)} .
 */
anychart.elements.Ticks.prototype.length = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.length_ = opt_value;
    this.dispatchSignal(anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    return this;
  } else
    return this.length_;
};


/**
 * Returns a current stroke settings.
 * @return {acgraph.vector.Stroke} Returns the current stroke settings.
 *//**
 * Sets stroke settings via single parameter.<br/>
 * The following options are acceptable:
 * <ul>
 *  <li>String formatted as '[thickness ]color[ opacity]':
 *    <ol>
 *      <li><b>'color'</b> - {@link http://www.w3schools.com/html/html_colors.asp}.</li>
 *      <li><b>'thickness color'</b> - like a css border, e.g. '3 red' or '3px red'</li>
 *      <li><b>'color opacity'</b> - as a fill string, e.g. '#fff 0.5'</li>
 *      <li><b>'thickness color opacity'</b> - as a complex string, e.g. '3px #00ff00 0.5'</li>
 *    </ol>
 *  </li>
 *  <li>{@link acgraph.vector.Stroke} object</li>
 *  <li>Keys array {@link acgraph.vector.GradientKey}</li>
 *  <li><b>null</b> - reset current stroke settings.</li>
 * </ul>
 * <b>Note:</b> String parts order is significant and '3px red' is not the same as 'red 3px'.
 * @shortDescription Sets stroke settings.
 * @illustration <t>simple-h100</t>
 * stage.text(10,0, 'axis');
 * stage.text(10,40, 'tick');
 * stage.path()
 *     .moveTo(0, 15)
 *     .lineTo(stage.width(), 15)
 *     .stroke('5 black');
 * stage.path()
 *     .moveTo(stage.width()/5-stage.width()/10, 15)
 *     .lineTo(stage.width()/5-stage.width()/10, 55)
 *     .moveTo(2*stage.width()/5-stage.width()/10, 15)
 *     .lineTo(2*stage.width()/5-stage.width()/10, 55)
 *     .moveTo(3*stage.width()/5-stage.width()/10, 15)
 *     .lineTo(3*stage.width()/5-stage.width()/10, 55)
 *     .moveTo(4*stage.width()/5-stage.width()/10, 15)
 *     .lineTo(4*stage.width()/5-stage.width()/10, 55)
 *     .moveTo(5*stage.width()/5-stage.width()/10, 15)
 *     .lineTo(5*stage.width()/5-stage.width()/10, 55)
 *     .stroke('2 blue .7');
 * @example <t>listingOnly</t>
 *  ticks.stroke('2 blue .7');
 * @param {(acgraph.vector.Stroke)=} opt_value ['black'] Fill style as '[thickness ]color[ opacity]'.
 * @return {anychart.elements.Ticks} An instance of the {@link anychart.elements.Ticks} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(acgraph.vector.Stroke)=} opt_value .
 * @return {(!anychart.elements.Ticks|acgraph.vector.Stroke)} .
 */
anychart.elements.Ticks.prototype.stroke = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.stroke_ = opt_value;
    this.dispatchSignal(anychart.Signal.NEEDS_REDRAW);
    return this;
  } else
    return this.stroke_;
};


/**
 * Getter for the current ticks position.
 * @return {(anychart.elements.Ticks.Position|string)} Current position.
 *//**
 * Setter for ticks position.<br/>
 * You can set ticks inside of a chart area or outside its position.
 * @illustration <t>simple</t>
 * stage.text(10,40, 'axis');
 * stage.text(10,2, 'tick');
 * stage.path()
 *     .moveTo(0, 55)
 *     .lineTo(stage.width(), 55)
 *     .stroke('5 black');
 * stage.path()
 *     .moveTo(stage.width()/5-stage.width()/10, 15)
 *     .lineTo(stage.width()/5-stage.width()/10, 90)
 *     .moveTo(2*stage.width()/5-stage.width()/10, 15)
 *     .lineTo(2*stage.width()/5-stage.width()/10, 90)
 *     .moveTo(3*stage.width()/5-stage.width()/10, 15)
 *     .lineTo(3*stage.width()/5-stage.width()/10, 90)
 *     .moveTo(4*stage.width()/5-stage.width()/10, 15)
 *     .lineTo(4*stage.width()/5-stage.width()/10, 90)
 *     .moveTo(5*stage.width()/5-stage.width()/10, 15)
 *     .lineTo(5*stage.width()/5-stage.width()/10, 90);
 * stage.text(stage.width()/5, 92, 'inside position');
 * stage.text(stage.width()/5, 2, 'outside position');
 * stage.text(3*stage.width()/5, 92, 'Chart Area');
 * stage.rect(0, 55, stage.width(), 95).fill('orange 0.1').stroke('0 0')
 * @param {(anychart.elements.Ticks.Position|string)=} opt_value [{@link anychart.elements.Ticks.Position}.OUTSIDE]
 *  Value to set.
 * @return {anychart.elements.Ticks} An instance of the {@link anychart.elements.Ticks} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(anychart.elements.Ticks.Position|string)=} opt_value .
 * @return {(anychart.elements.Ticks.Position|string|!anychart.elements.Ticks)} .
 */
anychart.elements.Ticks.prototype.position = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.position_ = anychart.utils.normalizePosition(opt_value);
    this.dispatchSignal(anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    return this;
  } else
    return this.position_;
};


/**
 * Internal use.
 * Change orientation and set drawer to null.
 * @param {(string|anychart.utils.Orientation)=} opt_value Orientation.
 * @return {anychart.elements.Ticks|anychart.utils.Orientation} Orientation or self for chaining.
 */
anychart.elements.Ticks.prototype.orientation = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.utils.normalizeOrientation(opt_value);
    if (this.orientation_ != opt_value) {
      this.orientation_ = opt_value;
      this.drawer_ = null;
      //todo а при смене ориентации ничего диспачится не должно? (blackart)
    }
    return this;
  } else {
    return this.orientation_;
  }
};


/**
 * Restore labels default settings.
 */
anychart.elements.Ticks.prototype.restoreDefaults = function() {
  this.orientation(anychart.utils.Orientation.TOP);
  this.position(anychart.elements.Ticks.Position.OUTSIDE);
  this.length(5);
  this.stroke('black');

  this.dispatchSignal(anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
};


/** @inheritDoc */
anychart.elements.Ticks.prototype.remove = function() {
  if (this.path_) this.path_.parent(null);
};


/**
 * Renders ticks.
 * @return {!anychart.elements.Ticks} An instance of {@link anychart.elements.Ticks} class for method chaining.
 */
anychart.elements.Ticks.prototype.draw = function() {
  this.path_.clear();
  this.path_.stroke(this.stroke_);

  if (!this.checkDrawingNeeded())
    return this;

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    this.path_.zIndex(/** @type {number} */ (this.zIndex()));
    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    this.path_.parent(/** @type {acgraph.vector.ILayer} */ (this.container()));
    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }

  return this;
};


/**
 * Get drawer depends on orientation
 * @return {Function}
 */
anychart.elements.Ticks.prototype.getTicksDrawer = function() {
  if (!this.drawer_) {
    switch (this.orientation_) {
      case anychart.utils.Orientation.TOP:
        this.drawer_ = this.drawTopTick_;
        break;
      case anychart.utils.Orientation.RIGHT:
        this.drawer_ = this.drawRightTick_;
        break;
      case anychart.utils.Orientation.BOTTOM:
        this.drawer_ = this.drawBottomTick_;
        break;
      case anychart.utils.Orientation.LEFT:
        this.drawer_ = this.drawLeftTick_;
        break;
    }
  }
  return this.drawer_;
};


/**
 * Axis ticks drawer for top orientation.
 * @param {number} ratio Scale ratio.
 * @param {anychart.utils.Bounds} bounds Axis bounds.
 * @param {anychart.math.Rect} lineBounds Axis line bounds.
 * @param {number} lineThickness Axis line thickness.
 * @param {number} pixelShift Полупиксельный сдвиг для четкого отображения элементов графики.
 * @private
 */
anychart.elements.Ticks.prototype.drawTopTick_ = function(ratio, bounds, lineBounds, lineThickness, pixelShift) {
  /** @type {number} */
  var x = Math.round(bounds.left() + ratio * (bounds.width()));
  /** @type {number} */
  var y = lineBounds.top;
  /** @type {number} */
  var dy;

  if (ratio == 1) x += pixelShift;
  else x -= pixelShift;

  if (this.position_ == anychart.elements.Ticks.Position.OUTSIDE) {
    y -= lineThickness / 2;
    dy = /** @type {number} */(-this.length_);
  } else {
    y += lineThickness / 2;
    dy = /** @type {number} */(this.length_);
  }

  this.path_.moveTo(x, y);
  this.path_.lineTo(x, y + dy);
};


/**
 * Axis ticks drawer for right orientation.
 * @param {number} ratio Scale ratio.
 * @param {anychart.utils.Bounds} bounds Axis bounds.
 * @param {anychart.math.Rect} lineBounds Axis line bounds.
 * @param {number} lineThickness Axis line thickness.
 * @param {number} pixelShift Полупиксельный сдвиг для четкого отображения элементов графики.
 * @private
 */
anychart.elements.Ticks.prototype.drawRightTick_ = function(ratio, bounds, lineBounds, lineThickness, pixelShift) {
  /** @type {number} */
  var x = lineBounds.left;
  /** @type {number} */
  var y = Math.round(bounds.top() + bounds.height() - ratio * (bounds.height()));
  /** @type {number} */
  var dx;

  if (ratio == 1) y -= pixelShift;
  else y += pixelShift;

  if (this.position_ == anychart.elements.Ticks.Position.OUTSIDE) {
    x += lineThickness / 2;
    dx = /** @type {number} */(this.length_);
  } else {
    x -= lineThickness / 2;
    dx = /** @type {number} */(-this.length_);
  }

  this.path_.moveTo(x, y);
  this.path_.lineTo(x + dx, y);
};


/**
 * Axis ticks drawer for bottom orientation.
 * @param {number} ratio Scale ratio.
 * @param {anychart.utils.Bounds} bounds Axis bounds.
 * @param {anychart.math.Rect} lineBounds Axis line bounds.
 * @param {number} lineThickness Axis line thickness.
 * @param {number} pixelShift Полупиксельный сдвиг для четкого отображения элементов графики.
 * @private
 */
anychart.elements.Ticks.prototype.drawBottomTick_ = function(ratio, bounds, lineBounds, lineThickness, pixelShift) {
  /** @type {number} */
  var x = Math.round(bounds.left() + ratio * (bounds.width()));
  /** @type {number} */
  var y = lineBounds.top;
  /** @type {number} */
  var dy;

  if (ratio == 1) x += pixelShift;
  else x -= pixelShift;

  if (this.position_ == anychart.elements.Ticks.Position.OUTSIDE) {
    y += lineThickness / 2;
    dy = /** @type {number} */(this.length_);
  } else {
    y -= lineThickness / 2;
    dy = /** @type {number} */(-this.length_);
  }

  this.path_.moveTo(x, y);
  this.path_.lineTo(x, y + dy);
};


/**
 * Axis ticks drawer for left orientation.
 * @param {number} ratio Scale ratio.
 * @param {anychart.utils.Bounds} bounds Axis bounds.
 * @param {anychart.math.Rect} lineBounds Axis line bounds.
 * @param {number} lineThickness Axis line thickness.
 * @param {number} pixelShift Полупиксельный сдвиг для четкого отображения элементов графики.
 * @private
 */
anychart.elements.Ticks.prototype.drawLeftTick_ = function(ratio, bounds, lineBounds, lineThickness, pixelShift) {
  /** @type {number} */
  var x = lineBounds.left;
  /** @type {number} */
  var y = Math.round(bounds.top() + bounds.height() - ratio * (bounds.height()));
  /** @type {number} */
  var dx;

  if (ratio == 1) y -= pixelShift;
  else y += pixelShift;

  if (this.position_ == anychart.elements.Ticks.Position.OUTSIDE) {
    x -= lineThickness / 2;
    dx = /** @type {number} */(-this.length_);
  } else {
    x += lineThickness / 2;
    dx = /** @type {number} */(this.length_);
  }

  this.path_.moveTo(x, y);
  this.path_.lineTo(x + dx, y);
};


/**
 * Ticks serialization.
 * @return {Object} Serialized axis data.
 */
anychart.elements.Ticks.prototype.serialize = function() {
  var data = {};
  data['length'] = this.length();
  data['position'] = this.position();
  data['stroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke} */(this.stroke()));

  return data;
};


/** @inheritDoc */
anychart.elements.Ticks.prototype.deserialize = function(value) {
  this.suspendSignalsDispatching();

  this.length(value['length']);
  this.position(value['position']);
  this.stroke(value['stroke']);

  this.resumeSignalsDispatching(true);

  return this;
};


//exports
anychart.elements.Ticks.prototype['length'] = anychart.elements.Ticks.prototype.length;//in docs/
anychart.elements.Ticks.prototype['stroke'] = anychart.elements.Ticks.prototype.stroke;//in docs/
anychart.elements.Ticks.prototype['position'] = anychart.elements.Ticks.prototype.position;//in docs/
goog.exportSymbol('anychart.elements.Ticks.Position.INSIDE', anychart.elements.Ticks.Position.INSIDE);//in docs/
goog.exportSymbol('anychart.elements.Ticks.Position.OUTSIDE', anychart.elements.Ticks.Position.OUTSIDE);//in docs/
