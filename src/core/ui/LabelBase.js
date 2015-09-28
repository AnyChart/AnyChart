goog.provide('anychart.core.ui.LabelBase');
goog.require('acgraph');
goog.require('anychart.core.Text');
goog.require('anychart.core.ui.Background');
goog.require('anychart.core.utils.Padding');
goog.require('anychart.enums');
goog.require('anychart.math.Rect');
goog.require('anychart.utils');



/**
 * LabelBase class.
 * @constructor
 * @extends {anychart.core.Text}
 */
anychart.core.ui.LabelBase = function() {
  goog.base(this);

  /**
   * Label background.
   * @type {anychart.core.ui.Background}
   * @private
   */
  this.background_ = null;

  /**
   * Label padding settings.
   * @type {anychart.core.utils.Padding}
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
   * @protected
   */
  this.textElement = null;

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
  this.minFontSize_ = NaN;

  /**
   * Maximum font size for adjusting to.
   * @type {number}
   * @private
   */
  this.maxFontSize_ = NaN;

  /**
   * Root layer to listen events on.
   * @type {!acgraph.vector.Layer}
   * @private
   */
  this.rootLayer_ = acgraph.layer();
  this.bindHandlersToGraphics(this.rootLayer_);
};
goog.inherits(anychart.core.ui.LabelBase, anychart.core.Text);


/**
 * Supported signals.
 * @type {number}
 */
anychart.core.ui.LabelBase.prototype.SUPPORTED_SIGNALS = anychart.core.Text.prototype.SUPPORTED_SIGNALS;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.ui.LabelBase.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.Text.prototype.SUPPORTED_CONSISTENCY_STATES |
        anychart.ConsistencyState.LABEL_BACKGROUND;


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
 * anychart.ui.label()
 *      .text('My custom label Text')
 *      .container(stage)
 *      .background(null)
 *      .draw();
 * @param {string=} opt_value ['Label text'] Value to set.
 * @return {!anychart.core.ui.LabelBase} {@link anychart.core.ui.LabelBase} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {string=} opt_value .
 * @return {!anychart.core.ui.LabelBase|string} .
 */
anychart.core.ui.LabelBase.prototype.text = function(opt_value) {
  if (goog.isDef(opt_value)) opt_value = goog.string.makeSafe(opt_value);
  return /** @type {!anychart.core.ui.LabelBase|string} */(this.textSettings('text', opt_value));
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Background.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter for the Label background settings.<br/>
 * <b>Note:</b> By default background is disabled. Set <b>enabled(true)</b> to start working with it.
 * @return {!anychart.core.ui.Background} Returns the background settings.
 *//**
 * Setter for Label background settings.
 * @example <t>simple-h100</t>
 * var label = anychart.ui.label()
 *      .text('Label backgruond sample')
 *      .fontSize(12)
 *      .padding(10);
 * label.background()
 *          .fill(['rgb(255,250,250)', 'rgb(205,250,250)', 'rgb(255,250,250)'])
 *          .stroke('1 lightgrey')
 *          .cornerType('round')
 *          .corners(10);
 * label.container(stage).draw();
 * @param {(string|Object|null|boolean)=} opt_value Value to set.
 * @return {!anychart.core.ui.LabelBase} {@link anychart.core.ui.LabelBase} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(string|Object|null|boolean)=} opt_value Background object to set.
 * @return {!(anychart.core.ui.LabelBase|anychart.core.ui.Background)} Returns the background or itself for method chaining.
 */
anychart.core.ui.LabelBase.prototype.background = function(opt_value) {
  if (!this.background_) {
    this.background_ = new anychart.core.ui.Background();
    this.registerDisposable(this.background_);
    this.background_.listenSignals(this.backgroundInvalidated_, this);
  }

  if (goog.isDef(opt_value)) {
    this.background_.setup(opt_value);
    return this;
  }
  return this.background_;
};


/**
 * Internal background invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.core.ui.LabelBase.prototype.backgroundInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    this.invalidate(anychart.ConsistencyState.LABEL_BACKGROUND,
        anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Getter for current label padding.<br/>
 * See how paddings work at {@link anychart.core.Chart#padding}.
 * @return {!anychart.core.utils.Padding} Current label padding.
 *//**
 * Setter for label padding in pixels by one value.<br/>
 * @param {(Array.<number|string>|{top:(number|string),left:(number|string),bottom:(number|string),right:(number|string)})=} opt_value [null] Value to set.
 * @return {!anychart.core.ui.LabelBase} {@link anychart.core.ui.LabelBase} instance for method chaining.
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
 * @return {!anychart.core.ui.LabelBase} {@link anychart.core.ui.LabelBase} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(string|number|Array.<number|string>|{top:(number|string),left:(number|string),bottom:(number|string),right:(number|string)})=} opt_spaceOrTopOrTopAndBottom .
 * @param {(string|number)=} opt_rightOrRightAndLeft .
 * @param {(string|number)=} opt_bottom .
 * @param {(string|number)=} opt_left .
 * @return {anychart.core.ui.LabelBase|anychart.core.utils.Padding} .
 */
anychart.core.ui.LabelBase.prototype.padding = function(opt_spaceOrTopOrTopAndBottom, opt_rightOrRightAndLeft, opt_bottom, opt_left) {
  if (!this.padding_) {
    this.padding_ = new anychart.core.utils.Padding();
    this.registerDisposable(this.padding_);
    this.padding_.listenSignals(this.boundsInvalidated_, this);
  }
  if (goog.isDef(opt_spaceOrTopOrTopAndBottom)) {
    this.padding_.setup.apply(this.padding_, arguments);
    return this;
  }
  return this.padding_;
};


/**
 * Listener for bounds invalidation.
 * @param {anychart.SignalEvent} event Invalidation event.
 * @private
 */
anychart.core.ui.LabelBase.prototype.boundsInvalidated_ = function(event) {
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
 * label = anychart.ui.label()
 *      .width(200);
 * // mark the area occupied by the label with a blue frame
 * label.background().enabled(true).fill('none').stroke('1 #00F');
 * label.container(stage).draw();
 * @param {(number|string|null)=} opt_value [null] Value to set.
 * @return {!anychart.core.ui.LabelBase} {@link anychart.core.ui.LabelBase} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(number|string|null)=} opt_value .
 * @return {!anychart.core.ui.LabelBase|number|string|null} .
 */
anychart.core.ui.LabelBase.prototype.width = function(opt_value) {
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
 * label = anychart.ui.label()
 *      .height(90);
 * // mark the area occupied by the label with a blue frame
 * label.background().enabled(true).fill('none').stroke('1 #00F');
 * label.container(stage).draw();
 * @param {(number|string|null)=} opt_value [null] Value to set.
 * @return {!anychart.core.ui.LabelBase} {@link anychart.core.ui.LabelBase} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(number|string|null)=} opt_value .
 * @return {!anychart.core.ui.LabelBase|number|string|null} .
 */
anychart.core.ui.LabelBase.prototype.height = function(opt_value) {
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


//----------------------------------------------------------------------------------------------------------------------
//
//  Position.
//
//----------------------------------------------------------------------------------------------------------------------
//todo: not implemented yet
/**
 * Gets or sets label rotation settings.
 * @param {(number)=} opt_value Label rotation settings.
 * @return {number|anychart.core.ui.LabelBase} Label rotation settings or itself for method chaining.
 */
anychart.core.ui.LabelBase.prototype.rotation = function(opt_value) {
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
 * <b>Note:</b> merges label positioning point ({@link anychart.core.ui.LabelBase#position}) with an anchor.
 * @example <t>simple-h100</t>
 * // to the left
 * var parentBounds = stage.rect(5, 5, 100, 70).stroke('rgba(0,0,200,.4)');
 * var label = anychart.ui.label()
 *     .padding(5)
 *     .position(anychart.enums.Position.RIGHT_BOTTOM)
 *     .parentBounds(parentBounds.getBounds())
 *     .anchor(anychart.enums.Anchor.RIGHT_BOTTOM);
 * label.background().enabled(true).fill('none').stroke('1 #aaa');
 * label.container(stage).draw();
 * stage.circle(105, 75, 2).stroke('3 red');
 * // to the right
 * parentBounds = stage.rect(120, 5, 100, 70).stroke('rgba(0,0,200,.4)');
 * label = anychart.ui.label()
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
 * @return {!anychart.core.ui.LabelBase} {@link anychart.core.ui.LabelBase} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(anychart.enums.Anchor|string)=} opt_value .
 * @return {!anychart.core.ui.LabelBase|anychart.enums.Anchor} .
 */
anychart.core.ui.LabelBase.prototype.anchor = function(opt_value) {
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
 * var label = anychart.ui.label()
 *     .padding(5)
 *     .parentBounds(parentBounds.getBounds())
 *     .offsetX(10)
 *     .offsetY(5);
 * label.background().enabled(true).fill('none').stroke('1 #aaa');
 * label.container(stage).draw();
 * stage.circle(5, 5, 2).stroke('3 red');
 * @param {(number|string)=} opt_value [0] Value to set.
 * @return {!anychart.core.ui.LabelBase} {@link anychart.core.ui.LabelBase} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(number|string)=} opt_value .
 * @return {number|string|anychart.core.ui.LabelBase} .
 */
anychart.core.ui.LabelBase.prototype.offsetX = function(opt_value) {
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
 * See illustration in {@link anychart.core.ui.LabelBase#offsetX}.
 * @example <t>simple-h100</t>
 * var parentBounds = stage.rect(5, 5, 100, 70).stroke('rgba(0,0,200,.4)');
 * var label = anychart.ui.label()
 *     .padding(5)
 *     .parentBounds(parentBounds.getBounds())
 *     .offsetX(10)
 *     .offsetY(5);
 * label.background().enabled(true).fill('none').stroke('1 #aaa');
 * label.container(stage).draw();
 * stage.circle(5, 5, 2).stroke('3 red');
 * @param {(number|string)=} opt_value [0] Value to set.
 * @return {!anychart.core.ui.LabelBase} {@link anychart.core.ui.LabelBase} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(number|string)=} opt_value .
 * @return {number|string|anychart.core.ui.LabelBase} .
 */
anychart.core.ui.LabelBase.prototype.offsetY = function(opt_value) {
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
 * <b>Note:</b> works only if {@link anychart.core.ui.LabelBase#container} or {@link anychart.core.ui.LabelBase#parentBounds} are explicitly set.
 * @illustration <t>simple-h100</t>
 * var rect = stage.rect(5, 5, 90, 90).stroke('1 blue');
 * var rectBounds = rect.getBounds();
 * var label = anychart.ui.label();
 * label.position(anychart.enums.Position.CENTER);
 * label.parentBounds(rectBounds);
 * label.container(stage).draw();
 * stage.circle(rectBounds.left + rectBounds.width / 2, rectBounds.top + rectBounds.height / 2, 2).stroke('3 red');
 * @illustrationDesc
 * Blue area is an area set in {@link anychart.core.ui.LabelBase#parentBounds}.<br/>
 * Red dot marks the <i>CENTER</i> of this area.
 * @param {(anychart.enums.Position|string)=} opt_value [{@link anychart.enums.Position}.LEFT_TOP] Value to set.
 * @return {!anychart.core.ui.LabelBase} {@link anychart.core.ui.LabelBase} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(anychart.enums.Position|string)=} opt_value .
 * @return {!anychart.core.ui.LabelBase|anychart.enums.Position} .
 */
anychart.core.ui.LabelBase.prototype.position = function(opt_value) {
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
anychart.core.ui.LabelBase.prototype.adjustEnabled_ = function() {
  return (this.adjustByWidth_ || this.adjustByHeight_);
};


/**
 * Gets font size setting for adjust text from.
 * @return {number} Current value.
 *//**
 * Sets font size setting for adjust text from.<br/>
 * <b>Note:</b> works only when adjusting is enabled. Look {@link anychart.core.ui.LabelBase#adjustFontSize}.
 * @param {(number|string)=} opt_value Value to set.
 * @return {anychart.core.ui.LabelBase} {@link anychart.core.ui.LabelBase} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(number|string)=} opt_value
 * @return {number|anychart.core.ui.LabelBase}
 */
anychart.core.ui.LabelBase.prototype.minFontSize = function(opt_value) {
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
 * <b>Note:</b> works only when adjusting is enabled. Look {@link anychart.core.ui.LabelBase#adjustFontSize}.
 * @param {(number|string)=} opt_value Value to set.
 * @return {anychart.core.ui.LabelBase} {@link anychart.core.ui.LabelBase} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(number|string)=} opt_value
 * @return {number|anychart.core.ui.LabelBase}
 */
anychart.core.ui.LabelBase.prototype.maxFontSize = function(opt_value) {
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
 *  {@link anychart.core.ui.LabelBase#minFontSize} and {@link anychart.core.ui.LabelBase#maxFontSize}.<br/>
 * <b>Note:</b> Works only when {@link anychart.core.ui.LabelBase#width} and {@link anychart.core.ui.LabelBase#height} are set.<br/>
 * <b>Note: </b> {@link anychart.core.ui.LabelBase#fontSize} does not work when adjusting is enabled.
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
 * anychart.ui.label()
 *     .text('Not adjusted text')
 *     .parentBounds(rect.getBounds())
 *     .container(stage).draw();
 * // to the right
 * rect = stage.rect(205, 5, 190, 90).fill('none').stroke('1 grey');
 * anychart.ui.label()
 *     .text('Adjusted text')
 *     .adjustFontSize(true, false)
 *     .width('100%')
 *     .height('100%')
 *     .parentBounds(rect.getBounds())
 *     .container(stage).draw();
 * @param {(boolean|Array.<boolean, boolean>|{width:boolean,height:boolean})=} opt_bothOrByWidth If only one param is set,
 *   its value goes for another too (see source code).
 * @param {boolean=} opt_byHeight Is font needs to be adjusted by height.
 * @return {!anychart.core.ui.LabelBase} {@link anychart.core.ui.LabelBase} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(boolean|Array.<boolean, boolean>|{width:boolean,height:boolean})=} opt_adjustOrAdjustByWidth Is font needs to be adjusted in case of 1 argument and adjusted by width in case of 2 arguments.
 * @param {boolean=} opt_adjustByHeight Is font needs to be adjusted by height.
 * @return {({width:boolean,height:boolean}|anychart.core.ui.LabelBase)} adjustFontSite setting or self for method chaining.
 */
anychart.core.ui.LabelBase.prototype.adjustFontSize = function(opt_adjustOrAdjustByWidth, opt_adjustByHeight) {
  // if values are set as an array ( [true, true] [true, false] [false, true] [false, false] ) rather than a set of two arguments, simply expand their
  if (goog.isArray(opt_adjustOrAdjustByWidth)) {
    return this.adjustFontSize.apply(this, opt_adjustOrAdjustByWidth);
  } else if (goog.isObject(opt_adjustOrAdjustByWidth)) {
    this.adjustFontSize(opt_adjustOrAdjustByWidth['width'], opt_adjustOrAdjustByWidth['height']);
    return this;
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
  return {'width': this.adjustByWidth_, 'height': this.adjustByHeight_};
};


/**
 * @inheritDoc
 */
anychart.core.ui.LabelBase.prototype.disablePointerEvents = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = !!opt_value;
    if (opt_value != this.disablePointerEvents_) {
      this.disablePointerEvents_ = opt_value;
      goog.base(this, 'disablePointerEvents', opt_value);
      this.background().disablePointerEvents(opt_value);
    }
    return this;
  } else {
    return this.disablePointerEvents_;
  }
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
anychart.core.ui.LabelBase.prototype.check_ = function(width, height, originWidth, originHeight) {
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
anychart.core.ui.LabelBase.prototype.calculateFontSize_ = function(originWidth, originHeight) {
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
anychart.core.ui.LabelBase.prototype.calculateLabelBounds_ = function() {
  var parentBounds = /** @type {anychart.math.Rect} */(this.parentBounds());
  /** @type {number} */
  var parentWidth;
  /** @type {number} */
  var parentHeight;
  var width;
  var height;
  var autoWidth;
  var autoHeight;

  //TODO(AntonKagakin): need to rework autoWidth/autoHeight logic
  //and crop size if width/height is more than parentBounds
  //1) if no width/height but paretnBounds, width/height = parentBounds
  //2) if no bounds but adjustByWidth||Height => calculate to minFontSize
  //3) ...

  // canAdjustBy = !auto
  if (parentBounds) {
    parentWidth = parentBounds.width;
    parentHeight = parentBounds.height;
    if (goog.isDefAndNotNull(this.width_)) {
      this.backgroundWidth = width = anychart.utils.normalizeSize(/** @type {number|string} */(this.width_), parentWidth);
      autoWidth = false;
    } else {
      width = 0;
      autoWidth = true;
    }
    if (goog.isDefAndNotNull(this.height_)) {
      this.backgroundHeight = height = anychart.utils.normalizeSize(/** @type {number|string} */(this.height_), parentHeight);
      autoHeight = false;
    } else {
      height = 0;
      autoHeight = true;
    }
  } else {
    if (!anychart.utils.isNaN(this.width_)) {
      autoWidth = false;
      this.backgroundWidth = width = anychart.utils.toNumber(this.width_);
    } else {
      autoWidth = true;
      width = 0;
    }
    if (!anychart.utils.isNaN(this.height_)) {
      autoHeight = false;
      this.backgroundHeight = height = anychart.utils.toNumber(this.height_);
    } else {
      autoHeight = true;
      height = 0;
    }
  }

  var padding = this.padding();

  this.textElement.width(null);
  this.textElement.height(null);

  if (autoWidth) {
    width += this.textElement.getBounds().width;
    this.textWidth = width;
    this.backgroundWidth = padding.widenWidth(width);
  } else {
    width = this.textWidth = padding.tightenWidth(width);
  }

  this.textElement.width(this.textWidth);

  if (autoHeight) {
    height += this.textElement.getBounds().height;
    this.textHeight = height;
    this.backgroundHeight = padding.widenHeight(height);
  } else {
    height = this.textHeight = padding.tightenHeight(height);
  }

  this.textElement.height(this.textHeight);

  var canAdjustByWidth = !autoWidth;
  var canAdjustByHeight = !autoHeight;

  var needAdjust = ((canAdjustByWidth && this.adjustByWidth_) || (canAdjustByHeight && this.adjustByHeight_));

  this.suspendSignalsDispatching();
  if (needAdjust) {
    var calculatedFontSize = this.calculateFontSize_(width, height);
    this.fontSize(calculatedFontSize);
    this.textElement.fontSize(calculatedFontSize);
    if (autoWidth) {
      this.textElement.width(null);
      this.textWidth = this.textElement.getBounds().width;
      this.textElement.width(this.textWidth);
      this.backgroundWidth = padding.widenWidth(this.textWidth);
    }
    if (autoHeight) {
      this.textElement.height(null);
      this.textHeight = this.textElement.getBounds().height;
      this.textElement.height(this.textHeight);
      this.backgroundHeight = padding.widenHeight(this.textHeight);
    }
  } else if (this.adjustByWidth_ || this.adjustByHeight_) {
    this.fontSize(this.minFontSize_);
    this.textElement.fontSize(this.minFontSize_);
    if (autoWidth) {
      this.textElement.width(null);
      this.textWidth = this.textElement.getBounds().width;
      this.textElement.width(this.textWidth);
      this.backgroundWidth = padding.widenWidth(this.textWidth);
    }
    if (autoHeight) {
      this.textElement.height(null);
      this.textHeight = this.textElement.getBounds().height;
      this.textElement.height(this.textHeight);
      this.backgroundHeight = padding.widenHeight(this.textHeight);
    }
  }
  this.resumeSignalsDispatching(false);

  this.textX = anychart.utils.normalizeSize(/** @type {number|string} */ (padding.left()), this.backgroundWidth);
  this.textY = anychart.utils.normalizeSize(/** @type {number|string} */ (padding.top()), this.backgroundHeight);
};


/**
 * Label drawing.
 * @return {anychart.math.Rect}
 * @protected
 */
anychart.core.ui.LabelBase.prototype.drawLabel = function() {
  //bounds
  var parentBounds = /** @type {anychart.math.Rect} */(this.parentBounds()) || anychart.math.rect(0, 0, 0, 0);
  var parentX = parentBounds.left;
  var parentY = parentBounds.top;
  var parentWidth = parentBounds.width;
  var parentHeight = parentBounds.height;
  var backgroundBounds = new anychart.math.Rect(0, 0, this.backgroundWidth, this.backgroundHeight);

  // calculate position
  var position = new acgraph.math.Coordinate(0, 0);

  if (this.parentBounds()) {
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
      new acgraph.math.Rect(0, 0, this.backgroundWidth, this.backgroundHeight),
      this.anchor_);

  position.x -= anchorCoordinate.x;
  position.y -= anchorCoordinate.y;

  var offsetX = goog.isDef(this.offsetX_) ? anychart.utils.normalizeSize(this.offsetX_, parentWidth) : 0;
  var offsetY = goog.isDef(this.offsetY_) ? anychart.utils.normalizeSize(this.offsetY_, parentHeight) : 0;
  anychart.utils.applyOffsetByAnchor(position, this.anchor_, offsetX, offsetY);

  this.textX += position.x;
  this.textY += position.y;
  backgroundBounds.left = position.x;
  backgroundBounds.top = position.y;

  this.textElement.x(/** @type {number} */(this.textX)).y(/** @type {number} */(this.textY));
  //var clip = this.textElement.clip();
  //if (clip) {
  //  clip.bounds(this.textX, this.textY, this.textWidth, this.textHeight);
  //} else {
  //  clip = acgraph.clip(this.textX, this.textY, this.textWidth, this.textHeight);
  //  this.textElement.clip(clip);
  //}

  return backgroundBounds;
};


/**
 * Render label content.
 * @return {!anychart.core.ui.LabelBase} {@link anychart.core.ui.LabelBase} instance for method chaining.
 */
anychart.core.ui.LabelBase.prototype.draw = function() {
  if (!this.checkDrawingNeeded())
    return this;

  var isInitial = this.createTextElement_();

  var container = /** @type {acgraph.vector.ILayer} */(this.container());

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    this.applyTextSettings(/** @type {!acgraph.vector.Text} */(this.textElement), isInitial);
    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    if (this.background_) this.background_.container(this.rootLayer_).draw();
    if (this.textElement) this.textElement.parent(this.rootLayer_);
    this.rootLayer_.parent(container);
    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    this.rootLayer_.zIndex(/** @type {number} */(this.zIndex()));
    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    this.calculateLabelBounds_();

    var backgroundBounds = this.drawLabel();

    this.invalidate(anychart.ConsistencyState.LABEL_BACKGROUND);
    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }


  if (this.hasInvalidationState(anychart.ConsistencyState.LABEL_BACKGROUND)) {
    if (this.background_) {
      this.background_.suspendSignalsDispatching();
      this.background_.parentBounds(backgroundBounds);
      this.background_.draw();
      this.background_.resumeSignalsDispatching(false);
    }
    this.markConsistent(anychart.ConsistencyState.LABEL_BACKGROUND);
  }

  return this;
};


/** @inheritDoc */
anychart.core.ui.LabelBase.prototype.remove = function() {
  this.rootLayer_.parent(null);
};


/** @inheritDoc */
anychart.core.ui.LabelBase.prototype.applyTextSettings = function(textElement, isInitial) {
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
anychart.core.ui.LabelBase.prototype.createTextElement_ = function() {
  var isInitial;
  if (isInitial = !this.textElement) {
    this.textElement = acgraph.text();
    this.registerDisposable(this.textElement);
  }
  return isInitial;
};


/**
 * Return label content bounds.
 * @return {anychart.math.Rect} Label content bounds.
 */
anychart.core.ui.LabelBase.prototype.getContentBounds = function() {
  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    var isInitial = this.createTextElement_();
    this.applyTextSettings(/** @type {!acgraph.vector.Text} */(this.textElement), isInitial);
    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    this.calculateLabelBounds_();
  }

  return new anychart.math.Rect(0, 0, this.backgroundWidth, this.backgroundHeight);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Utils.
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.ui.LabelBase.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');
  json['background'] = this.background().serialize();
  json['padding'] = this.padding().serialize();
  json['width'] = this.width();
  json['height'] = this.height();
  json['anchor'] = this.anchor();
  json['offsetX'] = this.offsetX();
  json['offsetY'] = this.offsetY();
  json['text'] = this.text();
  json['minFontSize'] = this.minFontSize();
  json['maxFontSize'] = this.maxFontSize();
  json['adjustFontSize'] = this.adjustFontSize();
  json['rotation'] = this.rotation();
  return json;
};


/** @inheritDoc */
anychart.core.ui.LabelBase.prototype.setupSpecial = function(var_args) {
  var args = arguments;
  if (goog.isString(args[0])) {
    this.text(args[0]);
    this.enabled(true);
    return true;
  }
  return anychart.core.Text.prototype.setupSpecial.apply(this, args);
};


/** @inheritDoc */
anychart.core.ui.LabelBase.prototype.setupByJSON = function(config) {
  goog.base(this, 'setupByJSON', config);
  this.background(config['background']);
  this.padding(config['padding']);
  this.width(config['width']);
  this.height(config['height']);
  this.anchor(config['anchor']);
  this.offsetX(config['offsetX']);
  this.offsetY(config['offsetY']);
  this.text(config['text']);
  this.minFontSize(config['minFontSize']);
  this.maxFontSize(config['maxFontSize']);
  this.adjustFontSize(config['adjustFontSize']);
  this.rotation(config['rotation']);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Disposing.
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.ui.LabelBase.prototype.disposeInternal = function() {
  goog.base(this, 'disposeInternal');
  //we should dispose padding, background and textElement
  //they all disposed with registerDisposable call
};
