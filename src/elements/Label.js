goog.provide('anychart.elements.Label');
goog.require('acgraph');
goog.require('anychart.elements.Background');
goog.require('anychart.elements.Text');
goog.require('anychart.enums');
goog.require('anychart.math.Rect');
goog.require('anychart.utils');
goog.require('anychart.utils.Padding');



/**
 * Label element class.<br/>
 * Label can be a part of another element (such as chart, legend, axis, etc) or it can
 * be used independently.<br/>
 * Label has a background and a large number of positioning options:
 * <ul>
 *   <li>{@link anychart.elements.Label#anchor}</li>
 *   <li>{@link anychart.elements.Label#position}</li>
 *   <li>{@link anychart.elements.Label#offsetX} and {@link anychart.elements.Label#offsetY}</li>
 *   <li>{@link anychart.elements.Label#parentBounds}</li>
 * </ul>
 * @example <c>Creating an autonomous label.</c><t>simple-h100</t>
 * anychart.elements.label()
 *     .text('My custom Label')
 *     .fontSize(27)
 *     .background(null)
 *     .container(stage)
 *     .draw();
 * @constructor
 * @extends {anychart.elements.Text}
 */
anychart.elements.Label = function() {
  goog.base(this);

  /**
   * Label background.
   * @type {anychart.elements.Background}
   * @private
   */
  this.background_ = null;

  /**
   * Label padding settings.
   * @type {anychart.utils.Padding}
   * @private
   */
  this.padding_ = null;

  /**
   * Label width settings.
   * @type {string|number|null}
   * @private
   */
  this.width_ = null;

  /**
   * Label width settings.
   * @type {string|number|null}
   * @private
   */
  this.height_ = null;

  /**
   * Parent bounds stored.
   * @type {anychart.math.Rect}
   * @private
   */
  this.parentBounds_ = null;

  /**
   * Label width settings.
   * @type {number}
   * @private
   */
  this.rotation_;

  /**
   * Label position.
   * @type {anychart.enums.Position}
   * @private
   */
  this.position_;

  /**
   * Label anchor settings.
   * @type {anychart.enums.Anchor}
   * @private
   */
  this.anchor_;

  /**
   * Offset by X coordinate from Label position.
   * @type {number|string}
   * @private
   */
  this.offsetX_;

  /**
   * Offset by Y coordinate from Label position.
   * @type {number|string}
   * @private
   */
  this.offsetY_;

  /**
   * Label text element.
   * @type {acgraph.vector.Text}
   * @private
   */
  this.textElement_ = null;

  /**
   * Adjust font size by width.
   * @type {boolean}
   * @private
   */
  this.adjustByWidth_ = false;

  /**
   * Adjust font size by height.
   * @type {boolean}
   * @private
   */
  this.adjustByHeight_ = false;

  /**
   * Minimimum font size for adjusting from.
   * @type {number}
   * @private
   */
  this.minFontSize_ = 8;

  /**
   * Maximum font size for adjusting to.
   * @type {number}
   * @private
   */
  this.maxFontSize_ = 72;

  this.restoreDefaults();
};
goog.inherits(anychart.elements.Label, anychart.elements.Text);


/**
 * Supported signals.
 * @type {number}
 */
anychart.elements.Label.prototype.SUPPORTED_SIGNALS = anychart.elements.Text.prototype.SUPPORTED_SIGNALS;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.elements.Label.prototype.SUPPORTED_CONSISTENCY_STATES =
    (anychart.elements.Text.prototype.SUPPORTED_CONSISTENCY_STATES |
        anychart.ConsistencyState.BACKGROUND);


//----------------------------------------------------------------------------------------------------------------------
//
//  Text.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Gets text content for a current label.
 * @return {string} Current text content of a label.
 *//**
 * Sets text content for a label.
 * @example <t>simple-h100</t>
 * anychart.elements.label()
 *      .text('My custom label Text')
 *      .container(stage)
 *      .background(null)
 *      .draw();
 * @param {string=} opt_value ['Label text'] Value to set.
 * @return {!anychart.elements.Label} {@link anychart.elements.Label} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {string=} opt_value .
 * @return {!anychart.elements.Label|string} .
 */
anychart.elements.Label.prototype.text = function(opt_value) {
  return /** @type {!anychart.elements.Label|string} */(this.textSettings('text', opt_value));
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Background.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter for the Label background settings.<br/>
 * <b>Note:</b> By default background is disabled. Set <b>enabled(true)</b> to start working with it.
 * @return {!anychart.elements.Background} Returns the background settings.
 *//**
 * Setter for Label background settings.
 * @example <t>simple-h100</t>
 * var bg = anychart.elements.background();
 * bg.fill(['rgb(255,250,250)', 'rgb(205,250,250)', 'rgb(255,250,250)']);
 * bg.stroke('1 lightgrey');
 * bg.cornerType('round').corners(10);
 * anychart.elements.label()
 *      .text('Label backgruond sample')
 *      .fontSize(12)
 *      .background(bg)
 *      .padding(10)
 *      .container(stage)
 *      .draw();
 * @param {anychart.elements.Background=} opt_value Value to set.
 * @return {!anychart.elements.Label} {@link anychart.elements.Label} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {anychart.elements.Background=} opt_value Background object to set.
 * @return {!(anychart.elements.Label|anychart.elements.Background)} Returns the background or itself for method chaining.
 */
anychart.elements.Label.prototype.background = function(opt_value) {
  if (!this.background_) {
    this.background_ = new anychart.elements.Background();
    this.registerDisposable(this.background_);
    this.background_.listenSignals(this.backgroundInvalidated_, this);
  }

  if (goog.isDef(opt_value)) {
    this.background_.suspendSignalsDispatching();
    if (opt_value instanceof anychart.elements.Background) {
      this.background_.deserialize(opt_value.serialize());
    } else if (goog.isObject(opt_value)) {
      this.background_.deserialize(opt_value);
    } else if (anychart.utils.isNone(opt_value)) {
      this.background_.enabled(false);
    }
    this.background_.resumeSignalsDispatching(true);
    return this;
  }
  return this.background_;
};


/**
 * Internal background invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.elements.Label.prototype.backgroundInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    this.invalidate(anychart.ConsistencyState.BACKGROUND,
        anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Getter for current label padding.<br/>
 * See how paddings work at {@link anychart.Chart#padding}.
 * @return {anychart.utils.Padding} Current label padding.
 *//**
 * Setter for label padding in pixels by one value.<br/>
 * @param {(string|number|anychart.utils.Space)=} opt_value [null] Value to set.
 * @return {anychart.elements.Label} {@link anychart.elements.Label} instance for method chaining.
 *//**
 * Setter for label padding in pixels.<br/>
 * @example <t>listingOnly</t>
 * // 1) top and bottom 10px, left and right 15px
 * label.padding(10, '15px');
 * // 2) top 10px, left and right 15px, bottom 5px
 * label.padding(10, '15px', 5);
 * // 3) top 10px, right 15px, bottom 5px, left 12px
 * label.padding(10, '15px', '5px', 12);
 * @param {(string|number)=} opt_value1 Top or top-bottom space.
 * @param {(string|number)=} opt_value2 Right or right-left space.
 * @param {(string|number)=} opt_value3 Bottom space.
 * @param {(string|number)=} opt_value4 Left space.
 * @return {anychart.elements.Label} {@link anychart.elements.Label} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(string|number|anychart.utils.Space)=} opt_spaceOrTopOrTopAndBottom .
 * @param {(string|number)=} opt_rightOrRightAndLeft .
 * @param {(string|number)=} opt_bottom .
 * @param {(string|number)=} opt_left .
 * @return {anychart.elements.Label|anychart.utils.Padding} .
 */
anychart.elements.Label.prototype.padding = function(opt_spaceOrTopOrTopAndBottom, opt_rightOrRightAndLeft, opt_bottom, opt_left) {
  if (!this.padding_) {
    this.padding_ = new anychart.utils.Padding();
    this.registerDisposable(this.padding_);
    this.padding_.listenSignals(this.boundsInvalidated_, this);
  }
  if (goog.isDef(opt_spaceOrTopOrTopAndBottom)) {
    this.padding_.set.apply(this.padding_, arguments);
    return this;
  }
  return this.padding_;
};


/**
 * Listener for bounds invalidation.
 * @param {anychart.SignalEvent} event Invalidation event.
 * @private
 */
anychart.elements.Label.prototype.boundsInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.BOUNDS,
        anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Width/Height.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter for label width.
 * @return {number|string|null} Current label width.
 *//**
 * Setter for label width.<br/>
 * <b>Note:</b> if <b>null</b> is passed, width is calculated automatically.
 * @example <t>simple-h100</t>
 * label = anychart.elements.label()
 *      .width(200);
 * // mark the area occupied by the label with a blue frame
 * label.background().enabled(true).fill('none').stroke('1 #00F');
 * label.container(stage).draw();
 * @param {(number|string|null)=} opt_value [null] Value to set.
 * @return {!anychart.elements.Label} {@link anychart.elements.Label} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(number|string|null)=} opt_value .
 * @return {!anychart.elements.Label|number|string|null} .
 */
anychart.elements.Label.prototype.width = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.width_ != opt_value) {
      this.width_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.width_;
};


/**
 * Getter for label height.
 * @return {number|string|null} Current label width.
 *//**
 * Setter for label height.<br/>
 * <b>Note:</b> if <b>null</b> is passed, height is calculated automatically.
 * @example <t>simple-h100</t>
 * label = anychart.elements.label()
 *      .height(90);
 * // mark the area occupied by the label with a blue frame
 * label.background().enabled(true).fill('none').stroke('1 #00F');
 * label.container(stage).draw();
 * @param {(number|string|null)=} opt_value [null] Value to set.
 * @return {!anychart.elements.Label} {@link anychart.elements.Label} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(number|string|null)=} opt_value .
 * @return {!anychart.elements.Label|number|string|null} .
 */
anychart.elements.Label.prototype.height = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.height_ != opt_value) {
      this.height_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.height_;
};


/**
 * Returns positioning bounds.
 * @return {anychart.math.Rect} Current parent bounds.
 *//**
 * Sets positioning bounds.<br/>
 * If width, height or offsets are set in percents - these are percents of these bounds.
 * @illustration <t>simple-h100</t>
 * var layer = stage.layer();
 * var stageBounds =  anychart.math.rect(0, 0, stage.width(), stage.height());
 * var layerBounds =  anychart.math.rect(100, 20, stage.width() / 3, stage.height() / 3);
 * layer.rect(1, 1, stage.width() - 2, stage.height() - 2)
 *      .stroke('2 red');
 * layer.text(2*stage.width()/3, 2, 'stageBounds');
 * var layer2 = stage.layer();
 * layer2.rect(layerBounds.left, layerBounds.top, layerBounds.width, layerBounds.height)
 *      .stroke('2 blue');
 * layer2.text(layerBounds.left, layerBounds.top+layerBounds.height, 'layerBounds');
 * anychart.elements.label()
 *     .container(layer2)
 *     .parentBounds(stageBounds)
 *     .background(null)
 *     .draw();
 * anychart.elements.label()
 *     .container(layer2)
 *     .background(null)
 *     .parentBounds(layerBounds)
 *     .fontColor('gray')
 *     .draw();
 * @illustrationDesc
 * Label is inside a layer (marked with blue), two positioning options are shown:<br/>
 *   a. Gray - inside parent container bounds.<br/>
 *   b. Black - when stage acts as a parent.
 * @example <t>listingOnly</t>
 * anychart.elements.label()
 *     .container(layer)
 *     .parentBounds(stageBounds)
 *     .background(null)
 *     .draw();
 * @param {anychart.math.Rect=} opt_value [null] Value to set.
 * @return {!anychart.elements.Label} {@link anychart.elements.Label} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {anychart.math.Rect=} opt_value .
 * @return {!anychart.elements.Label|anychart.math.Rect} .
 */
anychart.elements.Label.prototype.parentBounds = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.parentBounds_ != opt_value) {
      this.parentBounds_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.parentBounds_;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Position.
//
//----------------------------------------------------------------------------------------------------------------------
//todo: not implemented yet
/**
 * Gets or sets label rotation settings.
 * @param {(number)=} opt_value Label rotation settings.
 * @return {number|anychart.elements.Label} Label rotation settings or itself for method chaining.
 */
anychart.elements.Label.prototype.rotation = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.rotation_ = opt_value;
    this.invalidate(anychart.ConsistencyState.BOUNDS,
        anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    return this;
  } else {
    return this.rotation_;
  }
};


/**
 * Getter for label anchor settings.
 * @return {anychart.enums.Anchor} Current label anchor settings.
 *//**
 * Setter for label anchor settings.<br/>
 * <b>Note:</b> merges label positioning point ({@link anychart.elements.Label#position}) with an anchor.
 * @example <t>simple-h100</t>
 * // to the left
 * var parentBounds = stage.rect(5, 5, 100, 70).stroke('rgba(0,0,200,.4)');
 * var label = anychart.elements.label()
 *     .padding(5)
 *     .position(anychart.enums.Position.RIGHT_BOTTOM)
 *     .parentBounds(parentBounds.getBounds())
 *     .anchor(anychart.enums.Anchor.RIGHT_BOTTOM);
 * label.background().enabled(true).fill('none').stroke('1 #aaa');
 * label.container(stage).draw();
 * stage.circle(105, 75, 2).stroke('3 red');
 * // to the right
 * parentBounds = stage.rect(120, 5, 100, 70).stroke('rgba(0,0,200,.4)');
 * label = anychart.elements.label()
 *     .padding(5)
 *     .position(anychart.enums.Anchor.RIGHT_BOTTOM)
 *     .parentBounds(parentBounds.getBounds())
 *     .anchor(anychart.enums.Anchor.CENTER);
 * label.background().enabled(true).fill('none').stroke('1 #aaa');
 * label.container(stage).draw();
 * stage.circle(220, 75, 2).stroke('3 red');
 * @illustrationDesc
 * parentBounds are markerd with blue<br/>
 * Label position in Bottom Right.<br/>
 * Anchor is marked with red.<br/>
 * Left: anchor is Bottom Right<br/>
 * Right: anchor in Center<br/>
 * @param {(anychart.enums.Anchor|string)=} opt_value [{@link anychart.enums.Anchor}.LEFT_TOP] Value to set.
 * @return {!anychart.elements.Label} {@link anychart.elements.Label} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(anychart.enums.Anchor|string)=} opt_value .
 * @return {!anychart.elements.Label|anychart.enums.Anchor} .
 */
anychart.elements.Label.prototype.anchor = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeAnchor(opt_value);
    if (this.anchor_ != opt_value) {
      this.anchor_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.anchor_;
  }
};


/**
 * Getter for current label offsetX settings.
 * @return {number|string} Label offsetX value.
 *//**
 * Setter for label offsetX settings.
 * @illustration <t>simple</t>
 * var pathBounds = {
 *   left: stage.width() / 3,
 *   top: stage.height() / 8,
 *   width: 3 * stage.height() / 7,
 *   height: 3 * stage.height() / 7
 * };
 * stage.path().fill('none').stroke('1 grey .2')
 *     .moveTo(pathBounds.left, pathBounds.top)
 *     .lineTo(pathBounds.left + pathBounds.width, pathBounds.top)
 *     .lineTo(pathBounds.left + pathBounds.width, pathBounds.top + pathBounds.height)
 *     .lineTo(pathBounds.left, pathBounds.top + pathBounds.height)
 *     .close();
 * stage.text(pathBounds.left - 55, pathBounds.top - 15, 'LEFT_TOP');
 * stage.circle(pathBounds.left, pathBounds.top, 3).fill('blue');
 * stage.triangleUp(pathBounds.left + 15, pathBounds.top + 15, 5)
 *     .rotateByAnchor(25, acgraph.vector.Anchor.CENTER).fill('green');
 * stage.path().moveTo(pathBounds.left + 15, pathBounds.top + 15)
 *     .lineTo(pathBounds.left, pathBounds.top);
 * stage.text(pathBounds.left - 78, pathBounds.top + pathBounds.height / 2 - 8, 'LEFT_CENTER');
 * stage.circle(pathBounds.left, pathBounds.top + pathBounds.height / 2, 3).fill('blue');
 * stage.triangleUp(pathBounds.left + 15, pathBounds.top + pathBounds.height / 2 + 15, 5)
 *     .rotateByAnchor(25, acgraph.vector.Anchor.CENTER).fill('green');
 * stage.path().moveTo(pathBounds.left + 15, pathBounds.top + pathBounds.height / 2 + 15)
 *     .lineTo(pathBounds.left, pathBounds.top + pathBounds.height / 2);
 * stage.text(pathBounds.left - 80, pathBounds.top + pathBounds.height, 'LEFT_BOTTOM');
 * stage.circle(pathBounds.left, pathBounds.top + pathBounds.height, 3).fill('blue');
 * stage.triangleUp(pathBounds.left + 15, pathBounds.top + pathBounds.height - 15, 5)
 *     .rotateByAnchor(35, acgraph.vector.Anchor.CENTER).fill('green');
 * stage.path().moveTo(pathBounds.left + 15, pathBounds.top + pathBounds.height - 15)
 *     .lineTo(pathBounds.left, pathBounds.top + pathBounds.height);
 * stage.text(pathBounds.left + pathBounds.width / 2 - 10, pathBounds.top - 18, 'TOP');
 * stage.circle(pathBounds.left + pathBounds.width / 2, pathBounds.top, 3).fill('blue');
 * stage.triangleUp(pathBounds.left + pathBounds.width / 2 + 15, pathBounds.top + 15, 5)
 *     .rotateByAnchor(25, acgraph.vector.Anchor.CENTER).fill('green');
 * stage.path().moveTo(pathBounds.left + pathBounds.width / 2 + 15, pathBounds.top + 15)
 *     .lineTo(pathBounds.left + pathBounds.width / 2, pathBounds.top);
 * stage.text(pathBounds.left + pathBounds.width / 2 - 20, pathBounds.top + pathBounds.height / 2 - 15, 'CENTER');
 * stage.circle(pathBounds.left + pathBounds.width / 2, pathBounds.top + pathBounds.height / 2, 3).fill('blue');
 * stage.triangleUp(pathBounds.left + pathBounds.width / 2 + 15, pathBounds.top + pathBounds.height / 2 + 15, 5)
 *     .rotateByAnchor(25, acgraph.vector.Anchor.CENTER).fill('green');
 * stage.path().moveTo(pathBounds.left + pathBounds.width / 2 + 15, pathBounds.top + pathBounds.height / 2 + 15)
 *     .lineTo(pathBounds.left + pathBounds.width / 2, pathBounds.top + pathBounds.height / 2);
 * stage.text(pathBounds.left + pathBounds.width / 2 - 23, pathBounds.top + pathBounds.height + 2, 'BOTTOM');
 * stage.circle(pathBounds.left + pathBounds.width / 2, pathBounds.top + pathBounds.height, 3).fill('blue');
 * stage.triangleUp(pathBounds.left + pathBounds.width / 2 + 15, pathBounds.top + pathBounds.height - 15, 5)
 *     .rotateByAnchor(35, acgraph.vector.Anchor.CENTER).fill('green');
 * stage.path().moveTo(pathBounds.left + pathBounds.width / 2 + 15, pathBounds.top + pathBounds.height - 15)
 *     .lineTo(pathBounds.left + pathBounds.width / 2, pathBounds.top + pathBounds.height);
 * stage.text(pathBounds.left + pathBounds.width + 5, pathBounds.top - 15, 'RIGHT_TOP');
 * stage.circle(pathBounds.left + pathBounds.width, pathBounds.top, 3).fill('blue');
 * stage.triangleUp(pathBounds.left + pathBounds.width - 15, pathBounds.top + 15, 5)
 *     .rotateByAnchor(-25, acgraph.vector.Anchor.CENTER).fill('green');
 * stage.path().moveTo(pathBounds.left + pathBounds.width - 15, pathBounds.top + 15)
 *     .lineTo(pathBounds.left + pathBounds.width, pathBounds.top);
 * stage.text(pathBounds.left + pathBounds.width + 5, pathBounds.top + pathBounds.height / 2 - 8, 'RIGHT_CENTER');
 * stage.circle(pathBounds.left + pathBounds.width, pathBounds.top + pathBounds.height / 2, 3).fill('blue');
 * stage.triangleUp(pathBounds.left + pathBounds.width - 15, pathBounds.top + pathBounds.height / 2 + 15, 5)
 *     .rotateByAnchor(-25, acgraph.vector.Anchor.CENTER).fill('green');
 * stage.path().moveTo(pathBounds.left + pathBounds.width - 15, pathBounds.top + pathBounds.height / 2 + 15)
 *     .lineTo(pathBounds.left + pathBounds.width, pathBounds.top + pathBounds.height / 2);
 * stage.text(pathBounds.left + pathBounds.width + 5, pathBounds.top + pathBounds.height, 'RIGHT_BOTTOM');
 * stage.circle(pathBounds.left + pathBounds.width, pathBounds.top + pathBounds.height, 3).fill('blue');
 * stage.triangleUp(pathBounds.left + pathBounds.width - 15, pathBounds.top + pathBounds.height - 15, 5)
 *     .rotateByAnchor(85, acgraph.vector.Anchor.CENTER).fill('green');
 * stage.path().moveTo(pathBounds.left + pathBounds.width - 15, pathBounds.top + pathBounds.height - 15)
 *     .lineTo(pathBounds.left + pathBounds.width, pathBounds.top + pathBounds.height);
 * @illustrationDesc
 * Arrows show offsets layout.
 * @example <t>simple-h100</t>
 * var parentBounds = stage.rect(5, 5, 100, 70).stroke('rgba(0,0,200,.4)');
 * var label = anychart.elements.label()
 *     .padding(5)
 *     .parentBounds(parentBounds.getBounds())
 *     .offsetX(10)
 *     .offsetY(5);
 * label.background().enabled(true).fill('none').stroke('1 #aaa');
 * label.container(stage).draw();
 * stage.circle(5, 5, 2).stroke('3 red');
 * @param {(number|string)=} opt_value [0] Value to set.
 * @return {!anychart.elements.Label} {@link anychart.elements.Label} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(number|string)=} opt_value .
 * @return {number|string|anychart.elements.Label} .
 */
anychart.elements.Label.prototype.offsetX = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.offsetX_ = opt_value;
    this.invalidate(anychart.ConsistencyState.BOUNDS,
        anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    return this;
  } else {
    return this.offsetX_;
  }
};


/**
 * Getter for current label offsetY settings.
 * @return {number|string} Label offsetY value.
 *//**
 * Setter for label offsetY settings.
 * See illustration in {@link anychart.elements.Label#offsetX}.
 * @example <t>simple-h100</t>
 * var parentBounds = stage.rect(5, 5, 100, 70).stroke('rgba(0,0,200,.4)');
 * var label = anychart.elements.label()
 *     .padding(5)
 *     .parentBounds(parentBounds.getBounds())
 *     .offsetX(10)
 *     .offsetY(5);
 * label.background().enabled(true).fill('none').stroke('1 #aaa');
 * label.container(stage).draw();
 * stage.circle(5, 5, 2).stroke('3 red');
 * @param {(number|string)=} opt_value [0] Value to set.
 * @return {!anychart.elements.Label} {@link anychart.elements.Label} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(number|string)=} opt_value .
 * @return {number|string|anychart.elements.Label} .
 */
anychart.elements.Label.prototype.offsetY = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.offsetY_ = opt_value;
    this.invalidate(anychart.ConsistencyState.BOUNDS,
        anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    return this;
  } else {
    return this.offsetY_;
  }
};


/**
 * Getter for current label position settings.
 * @return {anychart.enums.Position} Current label position settings.
 *//**
 * Setter for label position settings.<br/>
 * <b>Note:</b> works only if {@link anychart.elements.Label#container} or {@link anychart.elements.Label#parentBounds} are explicitly set.
 * @illustration <t>simple-h100</t>
 * var rect = stage.rect(5, 5, 90, 90).stroke('1 blue');
 * var rectBounds = rect.getBounds();
 * var label = anychart.elements.label();
 * label.position(anychart.enums.Position.CENTER);
 * label.parentBounds(rectBounds);
 * label.container(stage).draw();
 * stage.circle(rectBounds.left + rectBounds.width / 2, rectBounds.top + rectBounds.height / 2, 2).stroke('3 red');
 * @illustrationDesc
 * Blue area is an area set in {@link anychart.elements.Label#parentBounds}.<br/>
 * Red dot marks the <i>CENTER</i> of this area.
 * @param {(anychart.enums.Position|string)=} opt_value [{@link anychart.enums.Position}.LEFT_TOP] Value to set.
 * @return {!anychart.elements.Label} {@link anychart.elements.Label} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(anychart.enums.Position|string)=} opt_value .
 * @return {!anychart.elements.Label|anychart.enums.Position} .
 */
anychart.elements.Label.prototype.position = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizePosition(opt_value);
    if (this.position_ != opt_value) {
      this.position_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.position_;
  }
};


/**
 * Helper method.
 * @private
 * @return {boolean} is adjustment enabled.
 */
anychart.elements.Label.prototype.adjustEnabled_ = function() {
  return (this.adjustByWidth_ || this.adjustByHeight_);
};


/**
 * Gets font size setting for adjust text from.
 * @return {number} Current value.
 *//**
 * Sets font size setting for adjust text from.<br/>
 * <b>Note:</b> works only when adjusting is enabled. Look {@link anychart.elements.Label#adjustFontSize}.
 * @param {(number|string)=} opt_value Value to set.
 * @return {anychart.elements.Label} {@link anychart.elements.Label} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(number|string)=} opt_value
 * @return {number|anychart.elements.Label}
 */
anychart.elements.Label.prototype.minFontSize = function(opt_value) {
  if (goog.isDef(opt_value) && !isNaN(+opt_value)) {
    if (this.minFontSize_ != +opt_value) {
      this.minFontSize_ = +opt_value;
      // we don't need to invalidate bounds if adjusting is not enabled
      if (this.adjustEnabled_())
        this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.minFontSize_;
};


/**
 * Gets font size setting for adjust text to.
 * @return {number} Current value.
 *//**
 * Sets font size setting for adjust text to.<br/>
 * <b>Note:</b> works only when adjusting is enabled. Look {@link anychart.elements.Label#adjustFontSize}.
 * @param {(number|string)=} opt_value Value to set.
 * @return {anychart.elements.Label} {@link anychart.elements.Label} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(number|string)=} opt_value
 * @return {number|anychart.elements.Label}
 */
anychart.elements.Label.prototype.maxFontSize = function(opt_value) {
  if (goog.isDef(opt_value) && !isNaN(+opt_value)) {
    if (this.maxFontSize_ != +opt_value) {
      this.maxFontSize_ = +opt_value;
      // we don't need to invalidate bounds if adjusting is not enabled
      if (this.adjustEnabled_())
        this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.maxFontSize_;
};


/**
 * Returns an array of two elements <b>[isAdjustByWidth, isAdjustByHeight]</b>.
 * <pre>
 *    [false, false] - do not adjust (adjust is off )
 *    [true, false] - adjust width
 *    [false, true] - adjust height
 *    [true, true] - adjust the first suitable value.
 * </pre>
 * @shortDescription Getter for current adjust font settings.
 * @return {Array.<boolean, boolean>} adjustFontSite setting or self for method chaining.
 *//**
 * Sets adjusting settings.<br/>
 * Minimal and maximal font sizes can be configured using:
 *  {@link anychart.elements.Label#minFontSize} and {@link anychart.elements.Label#maxFontSize}.<br/>
 * <b>Note:</b> Works only when {@link anychart.elements.Label#width} and {@link anychart.elements.Label#height} are set.<br/>
 * <b>Note: </b> {@link anychart.elements.Label#fontSize} does not work when adjusting is enabled.
 * @shortDescription Setter for the adjust font settings.
 * @example <t>listingOnly</t>
 * label.adjustFontSize(false);
 * // the same
 * label.adjustFontSize(false, false);
 * // the same
 * label.adjustFontSize([false, false]);
 * @example <t>simple-h100</t>
 * // to the right
 * var rect;
 * rect = stage.rect(5, 5, 190, 90).fill('none').stroke('1 grey');
 * anychart.elements.label()
 *     .text('Not adjusted text')
 *     .parentBounds(rect.getBounds())
 *     .container(stage).draw();
 * // to the right
 * rect = stage.rect(205, 5, 190, 90).fill('none').stroke('1 grey');
 * anychart.elements.label()
 *     .text('Adjusted text')
 *     .adjustFontSize(true, false)
 *     .width('100%')
 *     .height('100%')
 *     .parentBounds(rect.getBounds())
 *     .container(stage).draw();
 * @param {(boolean|Array.<boolean, boolean>)=} opt_bothOrByWidth If only one param is set,
 *   its value goes for another too (see source code).
 * @param {boolean=} opt_byHeight Is font needs to be adjusted by height.
 * @return {!anychart.elements.Label} {@link anychart.elements.Label} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(boolean|Array.<boolean, boolean>)=} opt_adjustOrAdjustByWidth Is font needs to be adjusted in case of 1 argument and adjusted by width in case of 2 arguments.
 * @param {boolean=} opt_adjustByHeight Is font needs to be adjusted by height.
 * @return {(Array.<boolean, boolean>|anychart.elements.Label)} adjustFontSite setting or self for method chaining.
 */
anychart.elements.Label.prototype.adjustFontSize = function(opt_adjustOrAdjustByWidth, opt_adjustByHeight) {
  // if values are set as an array ( [true, true] [true, false] [false, true] [false, false] ) rather than a set of two arguments, simply expand their
  if (goog.isArray(opt_adjustOrAdjustByWidth)) {
    return this.adjustFontSize.apply(this, opt_adjustOrAdjustByWidth);
  }
  var stateToInvalidate = 0;
  // if 2 params are set
  if (goog.isDef(opt_adjustByHeight)) {
    if (this.adjustByWidth_ != !!opt_adjustOrAdjustByWidth) {
      this.adjustByWidth_ = !!opt_adjustOrAdjustByWidth;
      stateToInvalidate |= anychart.ConsistencyState.BOUNDS;
    }
    if (this.adjustByHeight_ != !!opt_adjustByHeight) {
      this.adjustByHeight_ = !!opt_adjustByHeight;
      stateToInvalidate |= anychart.ConsistencyState.BOUNDS;
    }
    this.invalidate(stateToInvalidate, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    return this;
  // if only one param is set -  adjusting for the both
  } else if (goog.isDef(opt_adjustOrAdjustByWidth)) {
    if (!(this.adjustByWidth_ == this.adjustByHeight_ && this.adjustByWidth_ == opt_adjustOrAdjustByWidth)) {
      this.adjustByWidth_ = this.adjustByHeight_ = /** @type {boolean} */ (opt_adjustOrAdjustByWidth);
      this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return [this.adjustByWidth_, this.adjustByHeight_];
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Drawing.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Check
 * @param {number} width
 * @param {number} height
 * @param {number} originWidth
 * @param {number} originHeight
 * @return {number}
 * @private
 */
anychart.elements.Label.prototype.check_ = function(width, height, originWidth, originHeight) {
  if (this.adjustByWidth_ && this.adjustByHeight_) {
    if (width > originWidth || height > originHeight) {
      return 1;
    } else if (width < originWidth || height < originHeight) {
      return -1;
    }
  } else if (this.adjustByWidth_) {
    if (width < originWidth) {
      return -1;
    } else if (width > originWidth) {
      return 1;
    }
  } else if (this.adjustByHeight_) {
    if (height < originHeight) {
      return -1;
    } else if (height > originHeight) {
      return 1;
    }
  }

  return 0;
};


/**
 * Adjust font size by width/height.
 * @param {number} originWidth
 * @param {number} originHeight
 * @return {number}
 * @private
 */
anychart.elements.Label.prototype.calculateFontSize_ = function(originWidth, originHeight) {
  /** @type {number} */
  var fontSize = Math.round((this.maxFontSize_ + this.minFontSize_) / 2);

  /** @type {number} */
  var from = this.minFontSize_;

  /** @type {number} */
  var to = this.maxFontSize_;

  /** @type {number} */
  var checked;

  var settings = this.changedSettings;
  var text = acgraph.text();
  this.applyTextSettings(text, true);
  this.changedSettings = settings;

  // check if the maximal value is ok
  text.fontSize(this.maxFontSize_);
  if (this.check_(text.getBounds().width, text.getBounds().height, originWidth, originHeight) <= 0) {
    return this.maxFontSize_;
  }
  // set initial fontSize - that's half way between min and max
  text.fontSize(fontSize);
  // check sign
  var sign = checked = this.check_(text.getBounds().width, text.getBounds().height, originWidth, originHeight);

  // divide in half and iterate waiting for the sign to change
  while (from != to) {
    if (checked < 0) {
      from = Math.min(fontSize + 1, to);
      fontSize += Math.floor((to - fontSize) / 2);
    } else if (checked > 0) {
      to = Math.max(fontSize - 1, from);
      fontSize -= Math.ceil((fontSize - from) / 2);
    } else {
      break;
    }
    text.fontSize(fontSize);
    checked = this.check_(text.getBounds().width, text.getBounds().height, originWidth, originHeight);
    // sign chaneged if product is negative, 0 is an exit too
    if (sign * checked <= 0) {
      break;
    }
  }

  if (checked == 0) {
    // size is exactly ok for the bounds set
    goog.dispose(text);
    return fontSize;
  }

  // iterate increase/decrease font size until sign changes again
  do {
    fontSize += sign;
    text.fontSize(fontSize);
    checked = this.check_(text.getBounds().width, text.getBounds().height, originWidth, originHeight);
  } while (sign * checked < 0);

  goog.dispose(text);
  // decrease font size only if we've been increasing it - we are looking for size to fit in bounds
  if (sign > 0) fontSize -= sign;
  return fontSize;
};


/**
 * Calculate label bounds.
 * @private
 */
anychart.elements.Label.prototype.calculateLabelBounds_ = function() {
  /** @type {number} */
  var parentWidth;
  /** @type {number} */
  var parentHeight;
  var width;
  var height;
  var autoWidth;
  var autoHeight;

  // canAdjustBy = !auto
  if (this.parentBounds_) {
    parentWidth = this.parentBounds_.width;
    parentHeight = this.parentBounds_.height;
    if (goog.isDefAndNotNull(this.width_)) {
      this.backgroundWidth_ = width = anychart.utils.normalizeSize(/** @type {number|string} */(this.width_), parentWidth);
      autoWidth = false;
    } else {
      width = 0;
      autoWidth = true;
    }
    if (goog.isDefAndNotNull(this.height_)) {
      this.backgroundHeight_ = height = anychart.utils.normalizeSize(/** @type {number|string} */(this.height_), parentHeight);
      autoHeight = false;
    } else {
      height = 0;
      autoHeight = true;
    }
  } else {
    if (goog.isNumber(this.width_) && !isNaN(this.width_)) {
      autoWidth = false;
      this.backgroundWidth_ = width = this.width_;
    } else {
      autoWidth = true;
      width = 0;
    }
    if (goog.isNumber(this.height_) && !isNaN(this.height_)) {
      autoHeight = false;
      this.backgroundHeight_ = height = this.height_;
    } else {
      autoHeight = true;
      height = 0;
    }
  }

  var padding = this.padding();

  this.textElement_.width(null);
  this.textElement_.height(null);

  if (autoWidth) {
    width += this.textElement_.getBounds().width;
    this.textWidth_ = width;
    width = this.backgroundWidth_ = padding.widenWidth(width);
  } else {
    width = this.textWidth_ = padding.tightenWidth(width);
  }

  if (autoHeight) {
    height += this.textElement_.getBounds().height;
    this.textHeight_ = height;
    height = this.backgroundHeight_ = padding.widenHeight(height);
  } else {
    height = this.textHeight_ = padding.tightenHeight(height);
  }

  var canAdjustByWidth = !autoWidth;
  var canAdjustByHeight = !autoHeight;

  var needAdjust = ((canAdjustByWidth && this.adjustByWidth_) || (canAdjustByHeight && this.adjustByHeight_));

  if (needAdjust) {
    var calculatedFontSize = this.calculateFontSize_(width, height);
    this.suspendSignalsDispatching();
    this.fontSize(calculatedFontSize);
    this.textElement_.fontSize(calculatedFontSize);
    this.resumeSignalsDispatching(false);
  }

  this.textX_ = anychart.utils.normalizeSize(/** @type {number|string} */ (padding.left()), this.backgroundWidth_);
  this.textY_ = anychart.utils.normalizeSize(/** @type {number|string} */ (padding.top()), this.backgroundHeight_);
};


/**
 * Render label content.
 * @return {!anychart.elements.Label} {@link anychart.elements.Label} instance for method chaining.
 */
anychart.elements.Label.prototype.draw = function() {
  if (!this.checkDrawingNeeded())
    return this;

  var isInitial = this.createTextElement_();

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    this.applyTextSettings(/** @type {!acgraph.vector.Text} */(this.textElement_), isInitial);
    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    this.calculateLabelBounds_();

    //bounds
    var parentX = 0;
    var parentY = 0;
    var parentWidth = 0;
    var parentHeight = 0;
    var backgroundBounds = new anychart.math.Rect(0, 0, this.backgroundWidth_, this.backgroundHeight_);

    //define parent bounds
    if (this.parentBounds_) {
      parentX = this.parentBounds_.left;
      parentY = this.parentBounds_.top;
      parentWidth = this.parentBounds_.width;
      parentHeight = this.parentBounds_.height;
    }

    // calculate position
    var position = new acgraph.math.Coordinate(0, 0);

    if (this.parentBounds_) {
      switch (this.position_) {
        case anychart.enums.Position.LEFT_TOP:
          position.x = parentX;
          position.y = parentY;
          break;

        case anychart.enums.Position.LEFT_CENTER:
          position.x = parentX;
          position.y = parentY + parentHeight / 2;
          break;

        case anychart.enums.Position.LEFT_BOTTOM:
          position.x = parentX;
          position.y = parentY + parentHeight;
          break;

        case anychart.enums.Position.CENTER_TOP:
          position.x = parentX + parentWidth / 2;
          position.y = parentY;
          break;

        case anychart.enums.Position.CENTER:
          position.x = parentX + parentWidth / 2;
          position.y = parentY + parentHeight / 2;
          break;

        case anychart.enums.Position.CENTER_BOTTOM:
          position.x = parentX + parentWidth / 2;
          position.y = parentY + parentHeight;
          break;

        case anychart.enums.Position.RIGHT_TOP:
          position.x = parentX + parentWidth;
          position.y = parentY;
          break;

        case anychart.enums.Position.RIGHT_CENTER:
          position.x = parentX + parentWidth;
          position.y = parentY + parentHeight / 2;
          break;

        case anychart.enums.Position.RIGHT_BOTTOM:
          position.x = parentX + parentWidth;
          position.y = parentY + parentHeight;
          break;
      }
    } else {
      position.x = 0;
      position.y = 0;
    }

    var anchorCoordinate = anychart.utils.getCoordinateByAnchor(
        new acgraph.math.Rect(0, 0, this.backgroundWidth_, this.backgroundHeight_),
        this.anchor_);

    position.x -= anchorCoordinate.x;
    position.y -= anchorCoordinate.y;

    var offsetX = goog.isDef(this.offsetX_) ? anychart.utils.normalizeSize(this.offsetX_, parentWidth) : 0;
    var offsetY = goog.isDef(this.offsetY_) ? anychart.utils.normalizeSize(this.offsetY_, parentHeight) : 0;
    anychart.utils.applyOffsetByAnchor(position, this.anchor_, offsetX, offsetY);

    this.textX_ += position.x;
    this.textY_ += position.y;
    backgroundBounds.left = position.x;
    backgroundBounds.top = position.y;

    var container = /** @type {acgraph.vector.ILayer} */(this.container());

    this.textElement_.width(this.textWidth_);
    this.textElement_.height(this.textHeight_);

    this.textElement_.setTransformationMatrix(1, 0, 0, 1, 0, 0);
    this.textElement_.translate(/** @type {number} */(this.textX_), /** @type {number} */(this.textY_));
    var clipRect = new acgraph.math.Rect(0, 0, this.textWidth_, this.textHeight_);
    this.textElement_.clip(clipRect);

    this.invalidate(anychart.ConsistencyState.BACKGROUND);
    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }


  if (this.hasInvalidationState(anychart.ConsistencyState.BACKGROUND)) {
    if (this.background_) {
      this.background_.suspendSignalsDispatching();
      this.background_.pixelBounds(backgroundBounds);
      this.background_.draw();
      this.background_.resumeSignalsDispatching(false);
    }
    this.markConsistent(anychart.ConsistencyState.BACKGROUND);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    var zIndex = /** @type {number} */(this.zIndex());
    if (this.textElement_) this.textElement_.zIndex(zIndex);
    if (this.background_) this.background_.zIndex(zIndex);
    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    if (this.background_) this.background_.container(container).draw();
    if (this.textElement_) this.textElement_.parent(container);
    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }

  return this;
};


/** @inheritDoc */
anychart.elements.Label.prototype.remove = function() {
  if (this.textElement_) this.textElement_.parent(null);
  if (this.background_) this.background_.remove();
};


/** @inheritDoc */
anychart.elements.Label.prototype.applyTextSettings = function(textElement, isInitial) {
  if (isInitial || 'text' in this.changedSettings || 'useHtml' in this.changedSettings) {
    if (!!this.settingsObj['useHtml'])
      textElement.htmlText(this.settingsObj['text']);
    else
      textElement.text(this.settingsObj['text']);
  }
  goog.base(this, 'applyTextSettings', textElement, isInitial);
  this.changedSettings = {};
};


/**
 * Create text element if it does not exists yet. Return flag, if text element is created or not.
 * @return {boolean} Whether text element created or not.
 * @private
 */
anychart.elements.Label.prototype.createTextElement_ = function() {
  var isInitial;
  if (isInitial = !this.textElement_) {
    this.textElement_ = acgraph.text();

    this.registerDisposable(this.textElement_);
  }
  return isInitial;
};


/**
 * Return label content bounds.
 * @return {anychart.math.Rect} Label content bounds.
 */
anychart.elements.Label.prototype.getContentBounds = function() {
  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    var isInitial = this.createTextElement_();
    this.applyTextSettings(/** @type {!acgraph.vector.Text} */(this.textElement_), isInitial);
    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    this.calculateLabelBounds_();
  }

  return new anychart.math.Rect(0, 0, this.backgroundWidth_, this.backgroundHeight_);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Utils.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * @inheritDoc
 */
anychart.elements.Label.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');

  json['width'] = this.width();
  json['height'] = this.height();
  json['rotation'] = this.rotation();
  json['position'] = this.position();
  json['anchor'] = this.anchor();
  json['offsetX'] = this.offsetX();
  json['offsetY'] = this.offsetY();
  json['minFontSize'] = this.minFontSize();
  json['maxFontSize'] = this.maxFontSize();
  json['adjustFontSize'] = this.adjustFontSize();

  json['padding'] = this.padding().serialize();
  json['background'] = this.background().serialize();

  return json;
};


/**
 * @inheritDoc
 */
anychart.elements.Label.prototype.deserialize = function(config) {
  this.suspendSignalsDispatching();

  goog.base(this, 'deserialize', config);

  this.width(config['width']);
  this.height(config['height']);
  this.rotation(config['rotation']);
  this.position(config['position']);
  this.anchor(config['anchor']);
  this.offsetX(config['offsetX']);
  this.offsetY(config['offsetY']);
  this.minFontSize(config['minFontSize']);
  this.maxFontSize(config['maxFontSize']);
  this.adjustFontSize(config['adjustFontSize']);

  if ('padding' in config)
    this.padding().deserialize(config['padding']);
  if ('background' in config)
    this.background().deserialize(config['background']);

  this.resumeSignalsDispatching(true);

  return this;
};


/**
 * Restore label default settings.
 */
anychart.elements.Label.prototype.restoreDefaults = function() {
  this.zIndex(50);
  this.parentBounds(null);
  this.width(null);
  this.height(null);
  this.padding(0);
  this.background(null);
  this.position(anychart.enums.Position.LEFT_TOP);
  this.anchor(anychart.enums.Anchor.LEFT_TOP);
  this.offsetX(0);
  this.offsetY(0);
  this.rotation(0);
  this.adjustFontSize(false, false);
  this.minFontSize(8);
  this.maxFontSize(72);
  this.text('Label text');
  this.fontFamily('Tahoma');
  this.fontSize('11');
  this.fontWeight('bold');
  this.invalidate(anychart.ConsistencyState.ALL, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Disposing.
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.elements.Label.prototype.disposeInternal = function() {
  goog.base(this, 'disposeInternal');
  //we should dispose padding, background and textElement
  //they all disposed with registerDisposable call
};


/**
 * Constructor function.
 * @return {!anychart.elements.Label}
 */
anychart.elements.label = function() {
  return new anychart.elements.Label();
};


//exports
goog.exportSymbol('anychart.elements.label', anychart.elements.label);
anychart.elements.Label.prototype['background'] = anychart.elements.Label.prototype.background;//in docs/
anychart.elements.Label.prototype['padding'] = anychart.elements.Label.prototype.padding;//in docs/
anychart.elements.Label.prototype['width'] = anychart.elements.Label.prototype.width;//in docs/
anychart.elements.Label.prototype['height'] = anychart.elements.Label.prototype.height;//in docs/
anychart.elements.Label.prototype['parentBounds'] = anychart.elements.Label.prototype.parentBounds;//in docs/
anychart.elements.Label.prototype['anchor'] = anychart.elements.Label.prototype.anchor;//in docs/
anychart.elements.Label.prototype['offsetX'] = anychart.elements.Label.prototype.offsetX;//in docs/
anychart.elements.Label.prototype['offsetY'] = anychart.elements.Label.prototype.offsetY;//in docs/
anychart.elements.Label.prototype['position'] = anychart.elements.Label.prototype.position;//in docs/
anychart.elements.Label.prototype['text'] = anychart.elements.Label.prototype.text;//in docs/
anychart.elements.Label.prototype['draw'] = anychart.elements.Label.prototype.draw;//in docs/
anychart.elements.Label.prototype['minFontSize'] = anychart.elements.Label.prototype.minFontSize;//in docs/
anychart.elements.Label.prototype['maxFontSize'] = anychart.elements.Label.prototype.maxFontSize;//in docs/
anychart.elements.Label.prototype['adjustFontSize'] = anychart.elements.Label.prototype.adjustFontSize;//in docs/
anychart.elements.Label.prototype['rotation'] = anychart.elements.Label.prototype.rotation;
