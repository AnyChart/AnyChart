/**
 * @fileoverview anychart.core.Chart file.
 * @suppress {extraRequire}
 * todo: anychart.core.utils.InteractivityState should be excluded from requires
 */
goog.provide('anychart.core.Chart');
goog.require('acgraph');
goog.require('anychart.core.VisualBaseWithBounds');
goog.require('anychart.core.ui.Background');
goog.require('anychart.core.ui.ChartTooltip');
goog.require('anychart.core.ui.Credits');
goog.require('anychart.core.ui.Label');
goog.require('anychart.core.ui.Legend');
goog.require('anychart.core.ui.Title');
goog.require('anychart.core.utils.Animation');
goog.require('anychart.core.utils.Interactivity');
goog.require('anychart.core.utils.InteractivityState');
goog.require('anychart.core.utils.Margin');
goog.require('anychart.core.utils.Padding');
goog.require('anychart.themes.merging');
goog.require('anychart.utils');
goog.require('goog.json.hybrid');



/**
 * Base class for all charts, contains the margins, the background and the title.
 * @constructor
 * @extends {anychart.core.VisualBaseWithBounds}
 */
anychart.core.Chart = function() {
  //todo: this suspend can be replaced with a flag for the chart if it will not be needed anywhere else.
  this.suspendSignalsDispatching();
  goog.base(this);

  /**
   * @type {acgraph.vector.Layer}
   * @protected
   */
  this.rootElement = null;

  /**
   * @type {anychart.core.ui.Background}
   * @private
   */
  this.background_ = null;

  /**
   * @type {acgraph.vector.Rect}
   * @private
   */
  this.shadowRect_;

  /**
   * @type {anychart.core.utils.Margin}
   * @private
   */
  this.margin_ = null;

  /**
   * @type {anychart.core.ui.Title}
   * @private
   */
  this.title_ = null;

  /**
   * @type {anychart.core.utils.Padding}
   * @private
   */
  this.padding_ = null;

  /**
   * @type {Array.<anychart.core.ui.Label>}
   * @private
   */
  this.chartLabels_ = [];

  /**
   * @type {boolean}
   * @private
   */
  this.autoRedraw_ = true;

  /**
   * @type {anychart.core.utils.Animation}
   * @private
   */
  this.animation_ = null;

  /**
   * Dirty state for autoRedraw_ field. Used to avoid similar checking through multiple this.listenSignal calls.
   * @type {boolean}
   * @private
   */
  this.autoRedrawIsSet_ = false;

  this.invalidate(anychart.ConsistencyState.ALL);
  this.resumeSignalsDispatching(false);
};
goog.inherits(anychart.core.Chart, anychart.core.VisualBaseWithBounds);


/**
 * Supported consistency states. Adds APPEARANCE to BaseWithBounds states.
 * @type {number}
 */
anychart.core.Chart.prototype.SUPPORTED_SIGNALS = anychart.core.VisualBaseWithBounds.prototype.SUPPORTED_SIGNALS;


/**
 * Supported consistency states. Adds BACKGROUND and TITLE to BaseWithBounds states.
 * @type {number}
 */
anychart.core.Chart.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.VisualBaseWithBounds.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.CHART_LABELS |
    anychart.ConsistencyState.CHART_BACKGROUND |
    anychart.ConsistencyState.CHART_TITLE |
    anychart.ConsistencyState.CHART_ANIMATION;


/**
 * A temporary crutch to suppress base interactivity support in Stock.
 * @protected
 * @type {boolean}
 */
anychart.core.Chart.prototype.supportsBaseHighlight = true;


//----------------------------------------------------------------------------------------------------------------------
//
//  Methods to set defaults for multiple entities.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter/setter for axis default settings.
 * @param {Object=} opt_value Object with x-axis settings.
 * @return {Object}
 */
anychart.core.Chart.prototype.defaultLabelSettings = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (!this.defaultLabelSettings_)
      this.defaultLabelSettings_ = goog.object.clone(opt_value);
    else
      goog.object.extend(this.defaultLabelSettings_, opt_value);
    return this;
  }
  return this.defaultLabelSettings_ || {};
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Margin.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter for the current chart margin.
 * @illustration <t>simple</t>
 * var margins = 20;
 * stage.rect(0, 0, stage.width(), stage.height()).fill('orange 0.1');
 * stage.text(stage.width() / 3, 0, 'margins');
 * //arrows
 * stage.path()
 *     .moveTo(stage.width() / 2, 0)
 *     .lineTo(stage.width() / 2, margins);
 * stage.triangleUp(stage.width() / 2, 3, 3);
 * stage.triangleDown(stage.width() / 2, margins - 3, 3);
 * stage.path()
 *     .moveTo(stage.width() / 2, stage.height() - margins)
 *     .lineTo(stage.width() / 2, stage.height());
 * stage.triangleUp(stage.width() / 2, stage.height() - margins + 3, 3);
 * stage.triangleDown(stage.width() / 2, stage.height() - 3, 3);
 * stage.path()
 *     .moveTo(0, stage.height() / 2)
 *     .lineTo(margins, stage.height() / 2);
 * stage.triangleUp(3, stage.height() / 2 + 5.5, 3).rotateByAnchor(-90, 'center');
 * stage.triangleDown(margins - 3, stage.height() / 2 + 4, 3).rotateByAnchor(-90, 'center');
 * stage.path()
 *     .moveTo(stage.width(), stage.height() / 2)
 *     .lineTo(stage.width() - margins, stage.height() / 2);
 * stage.triangleUp(stage.width() - margins + 3, stage.height() / 2 + 5.5, 3).rotateByAnchor(-90, 'center');
 * stage.triangleDown(stage.width() - 3, stage.height() / 2 + 4, 3).rotateByAnchor(-90, 'center');
 * //content area
 * stage.rect(margins, margins, stage.width() - 2 * margins, stage.height() - 2 * margins).fill('white 1');
 * stage.text(stage.width() / 4, stage.height() / 2 - margins, 'Chart Content Area').fontSize(21);
 * @return {!anychart.core.utils.Margin} The current chart margin.
 *//**
 * Setter for the chart margin in pixels using a single complex object.<br/>
 * @example <t>listingOnly</t>
 * // all margins 15px
 * chart.margin(15);
 * // all margins 15px
 * chart.margin('15px');
 * // top and bottom 5px ,right and left 15px
 * chart.margin(anychart.utils.space(5,15) );
 * @example <t>lineChart</t>
 * chart.margin(35);
 * chart.line([6, 2, 12]);
 * @param {(Array.<number|string>|{top:(number|string),left:(number|string),bottom:(number|string),right:(number|string)})=} opt_value Value to set.
 * @return {!anychart.core.Chart} An instance of {@link anychart.core.Chart} class for method chaining.
 *//**
 * Setter for the chart margin in pixels using several simple values.<br/>
 * @example <t>listingOnly</t>
 * // 1) all 10px
 * chart.margin(10);
 * // 2) top and bottom 10px, left and right 15px
 * chart.margin(10, '15px');
 * // 3) top 10px, left and right 15px, bottom 5px
 * chart.margin(10, '15px', 5);
 * // 4) top 10px, right 15px, bottom 5px, left 12px
 * chart.margin(10, '15px', '5px', 12);
 * @example <t>lineChart</t>
 * chart.margin(10, '15px', '5px', 12);
 * chart.spline([6, 2, 12]);
 * @param {(string|number)=} opt_value1 Top or top-bottom space.
 * @param {(string|number)=} opt_value2 Right or right-left space.
 * @param {(string|number)=} opt_value3 Bottom space.
 * @param {(string|number)=} opt_value4 Left space.
 * @return {!anychart.core.Chart} An instance of {@link anychart.core.Chart} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(string|number|Array.<number|string>|{top:(number|string),left:(number|string),bottom:(number|string),right:(number|string)})=} opt_spaceOrTopOrTopAndBottom .
 * @param {(string|number)=} opt_rightOrRightAndLeft .
 * @param {(string|number)=} opt_bottom .
 * @param {(string|number)=} opt_left .
 * @return {!(anychart.core.Chart|anychart.core.utils.Margin)} .
 */
anychart.core.Chart.prototype.margin = function(opt_spaceOrTopOrTopAndBottom, opt_rightOrRightAndLeft, opt_bottom,
    opt_left) {
  if (!this.margin_) {
    this.margin_ = new anychart.core.utils.Margin();
    this.margin_.listenSignals(this.marginInvalidated_, this);
    this.registerDisposable(this.margin_);
  }

  if (goog.isDef(opt_spaceOrTopOrTopAndBottom)) {
    this.margin_.setup.apply(this.margin_, arguments);
    return this;
  } else {
    return this.margin_;
  }
};


/**
 * Internal margin invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.core.Chart.prototype.marginInvalidated_ = function(event) {
  // whatever has changed in margins affects chart size, so we need to redraw everything
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION))
    this.invalidate(anychart.ConsistencyState.BOUNDS,
        anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Padding.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter for the current chart padding.
 * @illustration <t>simple</t>
 * //margins
 * var margins = 20;
 * stage.rect(0, 0, stage.width(), stage.height()).fill('orange 0.1');
 * stage.text(stage.width() / 3, 0, 'margins');
 * //arrows
 * stage.path()
 *     .moveTo(stage.width() / 2, 0)
 *     .lineTo(stage.width() / 2, margins);
 * stage.triangleUp(stage.width() / 2, 3, 3);
 * stage.triangleDown(stage.width() / 2, margins - 3, 3);
 * stage.path()
 *     .moveTo(stage.width() / 2, stage.height() - margins)
 *     .lineTo(stage.width() / 2, stage.height());
 * stage.triangleUp(stage.width() / 2, stage.height() - margins + 3, 3);
 * stage.triangleDown(stage.width() / 2, stage.height() - 3, 3);
 * stage.path()
 *     .moveTo(0, stage.height() / 2)
 *     .lineTo(margins, stage.height() / 2);
 * stage.triangleUp(3, stage.height() / 2 + 5.5, 3).rotateByAnchor(-90, 'center');
 * stage.triangleDown(margins - 3, stage.height() / 2 + 4, 3).rotateByAnchor(-90, 'center');
 * stage.path()
 *     .moveTo(stage.width(), stage.height() / 2)
 *     .lineTo(stage.width() - margins, stage.height() / 2);
 * stage.triangleUp(stage.width() - margins + 3, stage.height() / 2 + 5.5, 3).rotateByAnchor(-90, 'center');
 * stage.triangleDown(stage.width() - 3, stage.height() / 2 + 4, 3).rotateByAnchor(-90, 'center');
 * //paddings
 * var paddings = 20;
 * stage.rect(margins, margins, stage.width() - 2 * margins, stage.height() - 2 * margins).fill('blue 0.1');
 * stage.text(stage.width() / 3, margins, 'paddings');
 * //arrows
 * stage.path()
 *     .moveTo(stage.width() / 2, 0 + margins)
 *     .lineTo(stage.width() / 2, paddings + margins);
 * stage.triangleUp(stage.width() / 2, 3 + margins, 3);
 * stage.triangleDown(stage.width() / 2, paddings - 3 + margins, 3);
 * stage.path()
 *     .moveTo(stage.width() / 2, stage.height() - paddings - margins)
 *     .lineTo(stage.width() / 2, stage.height() - margins);
 * stage.triangleUp(stage.width() / 2, stage.height() - paddings + 3 - margins, 3);
 * stage.triangleDown(stage.width() / 2, stage.height() - 3 - margins, 3);
 * stage.path()
 *     .moveTo(margins, stage.height() / 2)
 *     .lineTo(margins + paddings, stage.height() / 2);
 * stage.triangleUp(margins + 3, stage.height() / 2 + 5.5, 3).rotateByAnchor(-90, 'center');
 * stage.triangleDown(margins + paddings - 3, stage.height() / 2 + 4, 3).rotateByAnchor(-90, 'center');
 * stage.path()
 *     .moveTo(stage.width() - margins, stage.height() / 2)
 *     .lineTo(stage.width() - margins - paddings, stage.height() / 2);
 * stage.triangleUp(stage.width() - margins - paddings + 3, stage.height() / 2 + 5.5, 3).rotateByAnchor(-90, 'center');
 * stage.triangleDown(stage.width() - margins - 3, stage.height() / 2 + 4, 3).rotateByAnchor(-90, 'center');
 * //content area
 * stage.rect(paddings + margins, paddings + margins, stage.width() - 2 * (paddings + margins), stage.height() - 2 * (paddings + margins)).fill('white 1');
 * stage.text(stage.width() / 4, stage.height() / 2 - paddings, 'Chart Content Area').fontSize(21);
 * @return {!anychart.core.utils.Padding} Current chart padding.
 *//**
 * Setter for the chart paddings in pixels using a single value.<br/>
 * @example <t>listingOnly</t>
 * chart.padding([5, 15]);
 * @example <t>listingOnly</t>
 * chart.padding({left: 10, top: 20, bottom: 30, right: '40%'}});
 * @example <t>lineChart</t>
 * chart.padding(20);
 * chart.line([6, 2, 12]);
 * @param {(Array.<number|string>|{top:(number|string),left:(number|string),bottom:(number|string),right:(number|string)})=} opt_value Value to set.
 * @return {!anychart.core.Chart} An instance of {@link anychart.core.Chart} class for method chaining.
 *//**
 * Setter for the chart paddings in pixels using several numbers.<br/>
 * @example <t>listingOnly</t>
 * // 1) all 10px
 * chart.padding(10);
 * // 2) top and bottom 10px, left and right 15px
 * chart.padding(10, '15px');
 * // 3) top 10px, left and right 15px, bottom 5px
 * chart.padding(10, '15px', 5);
 * // 4) top 10px, right 15%, bottom 5px, left 12px
 * chart.padding(10, '15%', '5px', 12);
 * @example <t>lineChart</t>
 * chart.padding(10, '15px', '5px', 12);
 * chart.spline([6, 2, 12]);
 * @param {(string|number)=} opt_value1 Top or top-bottom space.
 * @param {(string|number)=} opt_value2 Right or right-left space.
 * @param {(string|number)=} opt_value3 Bottom space.
 * @param {(string|number)=} opt_value4 Left space.
 * @return {!anychart.core.Chart} An instance of {@link anychart.core.Chart} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(string|number|Array.<number|string>|{top:(number|string),left:(number|string),bottom:(number|string),right:(number|string)})=} opt_spaceOrTopOrTopAndBottom .
 * @param {(string|number)=} opt_rightOrRightAndLeft .
 * @param {(string|number)=} opt_bottom .
 * @param {(string|number)=} opt_left .
 * @return {!(anychart.core.Chart|anychart.core.utils.Padding)} .
 */
anychart.core.Chart.prototype.padding = function(opt_spaceOrTopOrTopAndBottom, opt_rightOrRightAndLeft, opt_bottom,
    opt_left) {
  if (!this.padding_) {
    this.padding_ = new anychart.core.utils.Padding();
    this.padding_.listenSignals(this.paddingInvalidated_, this);
    this.registerDisposable(this.padding_);
  }

  if (goog.isDef(opt_spaceOrTopOrTopAndBottom)) {
    this.padding_.setup.apply(this.padding_, arguments);
    return this;
  } else {
    return this.padding_;
  }
};


/**
 * Internal padding invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.core.Chart.prototype.paddingInvalidated_ = function(event) {
  // whatever has changed in paddings affects chart size, so we need to redraw everything
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION))
    this.invalidate(anychart.ConsistencyState.BOUNDS,
        anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Background.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter for the current chart background.
 * @example <t>lineChart</t>
 * chart.line([1.1, 1.4, 1.2, 1.6]);
 * chart.background()
 *    .stroke('2 rgb(36,102,177)')
 *    .corners(10)
 *    .fill({
 *           keys: [
 *             "rgb(255,255,255) 1",
 *             "rgb(233,133,233) 1",
 *             "rgb(255,255,255) 1"
 *           ],
 *           angle: -90
 *         });
 * @return {!anychart.core.ui.Background} The current chart background.
 *//**
 * Setter for the chart background.
 * @example <t>lineChart</t>
 * chart.line([1.1, 1.4, 1.2, 1.6]);
 * chart.background(null);
 * @param {Object=} opt_value Background object to set.
 * @return {!anychart.core.Chart} An instance of {@link anychart.core.Chart} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(string|Object|null|boolean)=} opt_value .
 * @return {anychart.core.Chart|anychart.core.ui.Background} .
 */
anychart.core.Chart.prototype.background = function(opt_value) {
  if (!this.background_) {
    this.background_ = new anychart.core.ui.Background();
    this.background_.listenSignals(this.backgroundInvalidated_, this);
    this.registerDisposable(this.background_);
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
anychart.core.Chart.prototype.backgroundInvalidated_ = function(event) {
  // whatever has changed in background we redraw only background
  // because it doesn't affect other elements
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    this.invalidate(anychart.ConsistencyState.CHART_BACKGROUND, anychart.Signal.NEEDS_REDRAW);
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Title.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter for chart title.
 * @example <c>Title instance</c><t>lineChart</t>
 * chart.title()
 *      .fontColor('red')
 *      .text('Red Chart title');
 * @return {!anychart.core.ui.Title} The current chart title.
 *//**
 * Setter for the chart title.
 * @example <c>Simple string</c><t>lineChart</t>
 * chart.line([1.1, 1.4, 1.2, 1.6]);
 * chart.title().text('Conqueror of Naxxramas');
 * @example <c>Disabling title</c><t>lineChart</t>
 * chart.line([1.1, 1.4, 1.2, 1.6]);
 * chart.title(false);
 * @param {(null|boolean|Object|string)=} opt_value Chart title text or title instance for copy settings from.
 * @return {!anychart.core.Chart} An instance of {@link anychart.core.Chart} for method chaining.
 *//**
 * @ignoreDoc
 * @param {(null|boolean|Object|string)=} opt_value .
 * @return {!(anychart.core.ui.Title|anychart.core.Chart)} .
 */
anychart.core.Chart.prototype.title = function(opt_value) {
  if (!this.title_) {
    this.title_ = new anychart.core.ui.Title();
    this.title_.setParentEventTarget(this);
    this.title_.listenSignals(this.onTitleSignal_, this);
    this.registerDisposable(this.title_);
  }

  if (goog.isDef(opt_value)) {
    this.title_.setup(opt_value);
    return this;
  } else {
    return this.title_;
  }
};


/**
 * Internal title invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.core.Chart.prototype.onTitleSignal_ = function(event) {
  var state = 0;
  var signal = 0;
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    state |= anychart.ConsistencyState.CHART_TITLE;
    signal |= anychart.Signal.NEEDS_REDRAW;
  }
  if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    state |= anychart.ConsistencyState.BOUNDS;
    signal |= anychart.Signal.BOUNDS_CHANGED;
  }
  // If there are no signals – state == 0 and nothing will happen.
  this.invalidate(state, signal);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Labels.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter for chart label.
 * @example <t>lineChart</t>
 * chart.line([1, 2, 1.3, 2.9]);
 * chart.label().text('custom text');
 * @param {(string|number)=} opt_index [0] Index of instance.
 * @return {!anychart.core.ui.Label} An instance of {@link anychart.core.ui.Label} for method chaining.
 *//**
 * Setter for chart label.
 * @example <t>lineChart</t>
 * chart.line([1, 2, 1.3, 2.9]);
 * chart.label({text: 'custom text'});
 * @param {(null|boolean|Object|string)=} opt_value Chart label instance to add by index 0.
 * @return {!anychart.core.Chart} An instance of {@link anychart.core.Chart} for method chaining.
 *//**
 * Setter for chart label.
 * @example <t>lineChart</t>
 * chart.line([1, 2, 1.3, 2.9]);
 * chart.label(0, {text: 'text'});
 * chart.label(1, {position: 'righttop', text: 'another text'});
 * chart.container(stage).draw();
 * @param {(string|number)=} opt_index Index of instance.
 * @param {(null|boolean|Object|string)=} opt_value  Chart label instance.
 * @return {!anychart.core.Chart} An instance of {@link anychart.core.Chart} for method chaining.
 *//**
 * @ignoreDoc
 * @param {(null|boolean|Object|string|number)=} opt_indexOrValue Chart label instance to add.
 * @param {(null|boolean|Object|string)=} opt_value Chart label instance.
 * @return {!(anychart.core.ui.Label|anychart.core.Chart)} Chart label instance or itself for chaining call.
 */
anychart.core.Chart.prototype.label = function(opt_indexOrValue, opt_value) {
  var index, value;
  if (goog.isNumber(opt_indexOrValue) || (goog.isString(opt_indexOrValue) && !isNaN(+opt_indexOrValue))) {
    index = +opt_indexOrValue;
    value = opt_value;
  } else {
    index = 0;
    value = opt_indexOrValue;
  }
  var label = this.chartLabels_[index];
  if (!label) {
    label = this.createChartLabel();
    label.setParentEventTarget(this);
    label.setup(this.defaultLabelSettings());
    this.chartLabels_[index] = label;
    this.registerDisposable(label);
    label.listenSignals(this.onLabelSignal_, this);
    this.invalidate(anychart.ConsistencyState.CHART_LABELS, anychart.Signal.NEEDS_REDRAW);
  }

  if (goog.isDef(value)) {
    label.setup(value);
    return this;
  } else {
    return label;
  }
};


/**
 * Internal title invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.core.Chart.prototype.onLabelSignal_ = function(event) {
  this.invalidate(anychart.ConsistencyState.CHART_LABELS, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Creates chart label.
 * @return {anychart.core.ui.Label} Label instance.
 * @protected
 */
anychart.core.Chart.prototype.createChartLabel = function() {
  return new anychart.core.ui.Label();
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Tooltip.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Creates chart tooltip.
 * @param {(Object|boolean|null)=} opt_value
 * @return {!(anychart.core.ui.ChartTooltip|anychart.core.ui.Tooltip|anychart.core.Chart)}
 */
anychart.core.Chart.prototype.tooltip = function(opt_value) {
  if (!this.tooltip_) {
    this.tooltip_ = this.createTooltip();
  }

  if (goog.isDef(opt_value)) {
    this.tooltip_.setup(opt_value);
    return this;
  } else {
    return this.tooltip_;
  }
};


/**
 * Creates tooltip.
 * @protected
 * @return {!anychart.core.ui.ChartTooltip}
 */
anychart.core.Chart.prototype.createTooltip = function() {
  var tooltip = new anychart.core.ui.ChartTooltip();
  this.registerDisposable(tooltip);
  tooltip.chart(this);

  this.listen(anychart.enums.EventType.POINTS_HOVER, this.showTooltip_);
  return tooltip;
};


/**
 * @param {anychart.core.MouseEvent} event
 * @private
 */
anychart.core.Chart.prototype.showTooltip_ = function(event) {
  if (event.forbidTooltip) return;
  // summary
  // Tooltip Mode   | Interactivity mode
  // Single + Single - draw one tooltip.
  // Union + Single - draw one tooltip at the hovered point, content from all points by index of hovered point.
  // Separated + Single  - draw all tooltips for hovered points.

  // Single + byX - draw one tooltip at nearest point to cursor.
  // Union + byX - draw one tooltip at nearest point to cursor (in point position), content from all hovered points.
  // Separated + byX - draw all tooltips for hovered points.

  // For bySpot as for byX

  var toShowSeriesStatus = [];
  goog.array.forEach(event['seriesStatus'], function(status) {
    if (goog.array.isEmpty(status['points'])) {
      if (this.tooltip_.positionMode() == anychart.enums.TooltipPositionMode.FLOAT) {
        this.unlisten(goog.events.EventType.MOUSEMOVE, this.updateTooltip_);
      }
      this.tooltip_.hide(event);

    } else if (status['series'].enabled()) {
      toShowSeriesStatus.push(status);
    }
  }, this);

  if (!goog.array.isEmpty(toShowSeriesStatus)) {
    if (this.tooltip_.positionMode() == anychart.enums.TooltipPositionMode.FLOAT) {
      this.listen(goog.events.EventType.MOUSEMOVE, this.updateTooltip_);
    }

    var interactivity = this.interactivity();
    if (interactivity.hoverMode() == anychart.enums.HoverMode.SINGLE) {
      var points = [];
      if (this.tooltip_.displayMode() == anychart.enums.TooltipDisplayMode.SINGLE) {
        points = event['seriesStatus'];
      } else {
        var pointIndex = event['seriesStatus'][0]['points'][0];
        // improve maps support (separated & point modes)
        if (goog.isDef(pointIndex['index'])) pointIndex = pointIndex['index'];

        // condition for compile_each
        if (this.series_) {
          // get points from all series by point index
          points = goog.array.map(this.series_, function(series) {
            series.getIterator().select(pointIndex);
            return {
              'series': series,
              'points': [pointIndex]
            };
          });
        }

        // filter missing
        points = goog.array.filter(points, function(point) {
          var series = point['series'];
          var iterator = series.getIterator();
          return !anychart.utils.isNaN(iterator.get('value'));
        });
      }

      this.tooltip_.show(points,
          event['originalEvent']['clientX'],
          event['originalEvent']['clientY'],
          event['seriesStatus'][0]['series'],
          this.useUnionTooltipAsSingle());

    // byX, bySpot
    } else {
      var nearestSeriesStatus = toShowSeriesStatus[0];
      toShowSeriesStatus[0]['series'].getIterator().select(toShowSeriesStatus[0]['nearestPointToCursor']['index']);

      goog.array.forEach(toShowSeriesStatus, function(status) {
        if (nearestSeriesStatus['nearestPointToCursor']['distance'] > status['nearestPointToCursor']['distance']) {
          status['series'].getIterator().select(status['nearestPointToCursor']['index']);
          nearestSeriesStatus = status;
        }
      });

      if (this.tooltip_.displayMode() == anychart.enums.TooltipDisplayMode.SINGLE) {
        // show nearest hovered point to cursor
        this.tooltip_.show([nearestSeriesStatus],
            event['originalEvent']['clientX'],
            event['originalEvent']['clientY'],
            nearestSeriesStatus['series'],
            this.useUnionTooltipAsSingle());

      } else {
        // show all hovered points, in union mode position will be to nearest hovered point to cursor
        this.tooltip_.show(toShowSeriesStatus,
            event['originalEvent']['clientX'],
            event['originalEvent']['clientY'],
            nearestSeriesStatus['series'],
            this.useUnionTooltipAsSingle());
      }
    }
  }
};


/**
 * Used in sparklines.
 * @return {boolean}
 */
anychart.core.Chart.prototype.useUnionTooltipAsSingle = function() {
  return false;
};


/**
 * Update tooltip position. (for float)
 * @param {anychart.core.MouseEvent} event
 * @private
 */
anychart.core.Chart.prototype.updateTooltip_ = function(event) {
  this.tooltip_.updatePosition(event['clientX'], event['clientY']);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Drawing.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Calculate chart content bounds.
 * @param {!anychart.math.Rect} totalBounds Total chart area bounds, do not override, it can be useful later.
 * @return {!anychart.math.Rect} Chart content bounds, allocated space for all chart appearance items.
 */
anychart.core.Chart.prototype.calculateContentAreaSpace = function(totalBounds) {
  //chart area with applied margin
  var boundsWithoutMargin;
  //chart area with applied margin and padding
  var boundsWithoutPadding;
  // chart area with applied margin, padding and title
  var boundsWithoutTitle;
  //
  var boundsWithoutBackgroundThickness;

  boundsWithoutMargin = this.margin().tightenBounds(totalBounds).round();

  var background = this.background();
  if (this.hasInvalidationState(anychart.ConsistencyState.CHART_BACKGROUND | anychart.ConsistencyState.BOUNDS)) {
    background.suspendSignalsDispatching();
    if (!background.container()) background.container(this.rootElement);
    background.parentBounds(boundsWithoutMargin);
    background.resumeSignalsDispatching(false);
    background.draw();
    this.markConsistent(anychart.ConsistencyState.CHART_BACKGROUND);
  }

  boundsWithoutBackgroundThickness = background.enabled() ? background.getRemainingBounds() : boundsWithoutMargin;
  boundsWithoutPadding = this.padding().tightenBounds(boundsWithoutBackgroundThickness);

  var title = this.title();
  if (this.hasInvalidationState(anychart.ConsistencyState.CHART_TITLE | anychart.ConsistencyState.BOUNDS)) {
    title.suspendSignalsDispatching();
    if (!title.container()) title.container(this.rootElement);
    title.parentBounds(boundsWithoutPadding);
    title.resumeSignalsDispatching(false);
    title.draw();
    this.markConsistent(anychart.ConsistencyState.CHART_TITLE);
  }
  boundsWithoutTitle = title.enabled() ? title.getRemainingBounds() : boundsWithoutPadding;
  return boundsWithoutTitle.clone().round();
};


/**
 * Sets chart label settings.
 * @param {anychart.core.ui.Label} label Label for tuning.
 * @param {anychart.math.Rect} bounds Label parent bounds.
 * @protected
 */
anychart.core.Chart.prototype.setLabelSettings = function(label, bounds) {
  label.parentBounds(bounds);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Animations.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Setter/getter for animation setting.
 * @param {(boolean|Object)=} opt_enabledOrJson Whether to enable animation.
 * @param {number=} opt_duration A Duration in milliseconds.
 * @return {anychart.core.utils.Animation|anychart.core.Chart} Animations settings object or self for chaining.
 */
anychart.core.Chart.prototype.animation = function(opt_enabledOrJson, opt_duration) {
  if (!this.animation_) {
    this.animation_ = new anychart.core.utils.Animation();
    this.animation_.listenSignals(this.onAnimationSignal_, this);
  }
  if (goog.isDef(opt_enabledOrJson)) {
    this.animation_.setup.apply(this.animation_, arguments);
    return this;
  } else {
    return this.animation_;
  }
};


/**
 * Animation enabled change handler.
 * @private
 */
anychart.core.Chart.prototype.onAnimationSignal_ = function() {
  this.invalidate(anychart.ConsistencyState.CHART_ANIMATION, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Animate chart.
 */
anychart.core.Chart.prototype.doAnimation = goog.nullFunction;


/**
 * Starts the rendering of the chart into the container.
 * @return {anychart.core.Chart} An instance of {@link anychart.core.Chart} class for method chaining.
 */
anychart.core.Chart.prototype.draw = function() {
  if (!this.autoRedrawIsSet_) {
    if (this.autoRedraw_)
      this.listenSignals(this.invalidateHandler_, this);
    else
      this.unlistenSignals(this.invalidateHandler_, this);
    this.autoRedrawIsSet_ = true;
  }

  if (!this.checkDrawingNeeded())
    return this;

  var startTime;
  if (anychart.DEVELOP) {
    startTime = anychart.utils.relativeNow();
  }

  this.suspendSignalsDispatching();

  //create root element only if draw is called
  if (!this.rootElement) {
    this.rootElement = acgraph.layer();
    this.bindHandlersToGraphics(this.rootElement);
    this.registerDisposable(this.rootElement);
  }

  //suspend stage
  var stage = this.container() ? this.container().getStage() : null;
  var manualSuspend = stage && !stage.isSuspended();
  if (manualSuspend) stage.suspend();

  //start clear container consistency states
  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    this.rootElement.zIndex(/** @type {number} */(this.zIndex()));
    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    if (this.enabled()) {
      this.rootElement.parent(/** @type {acgraph.vector.ILayer} */(this.container()));
    }

    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }
  //end clear container consistency states

  // DVF-1648
  this.beforeDraw();

  //total chart area bounds, do not override, it can be useful later
  var totalBounds = /** @type {!anychart.math.Rect} */(this.getPixelBounds());
  var contentBounds = this.calculateContentAreaSpace(totalBounds);
  this.drawContent(contentBounds);

  // used for crosshair
  var background = this.background();
  var fill = background.fill();
  if ((!background.enabled() || !fill || fill == 'none')) {
    if (!this.shadowRect_) {
      this.shadowRect_ = this.rootElement.rect();
      this.shadowRect_.fill(anychart.color.TRANSPARENT_HANDLER).stroke(null);
    }
    this.shadowRect_.setBounds(contentBounds);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CHART_LABELS | anychart.ConsistencyState.BOUNDS)) {
    for (var i = 0, count = this.chartLabels_.length; i < count; i++) {
      var label = this.chartLabels_[i];
      if (label) {
        label.suspendSignalsDispatching();
        if (!label.container() && label.enabled()) label.container(this.rootElement);
        this.setLabelSettings(label, totalBounds);
        label.resumeSignalsDispatching(false);
        label.draw();
      }
    }
    this.markConsistent(anychart.ConsistencyState.CHART_LABELS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    //can be null if you add chart to tooltip container on hover (Vitalya :) )
    if (this.container() && this.container().getStage()) {
      //listen resize event
      stage = this.container().getStage();
      stage.resize(stage.originalWidth, stage.originalHeight);
      this.container().getStage().listen(
          acgraph.vector.Stage.EventType.STAGE_RESIZE,
          this.resizeHandler,
          false,
          this
      );
    }
  }

  //after all chart items drawn, we can clear other states
  this.markConsistent(anychart.ConsistencyState.BOUNDS);

  if (this.hasInvalidationState(anychart.ConsistencyState.CHART_ANIMATION)) {
    this.markConsistent(anychart.ConsistencyState.CHART_ANIMATION);
    if (this.animation().enabled()) this.doAnimation();
  }

  this.resumeSignalsDispatching(false);

  if (manualSuspend) stage.resume();

  this.dispatchDetachedEvent({
    'type': anychart.enums.EventType.CHART_DRAW,
    'chart': this
  });

  if (anychart.DEVELOP) {
    var msg = 'Chart rendering time: ' + anychart.math.round((anychart.utils.relativeNow() - startTime), 4);
    anychart.utils.info(msg);
  }


  if (this.supportsBaseHighlight)
    this.onInteractivitySignal_();

  return this;
};


/**
 * Extension point do before draw chart content.
 */
anychart.core.Chart.prototype.beforeDraw = goog.nullFunction;


/**
 * Extension point do draw chart content.
 * @param {anychart.math.Rect} bounds Chart content area bounds.
 */
anychart.core.Chart.prototype.drawContent = goog.nullFunction;


//----------------------------------------------------------------------------------------------------------------------
//
//  Resize.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Define auto resize settings. В таком  виде это экспортить нельзя.
 * @param {boolean=} opt_value
 * @return {!(boolean|anychart.core.Chart)} Auto resize settings or itself for chaining call.
 */
anychart.core.Chart.prototype.autoRedraw = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.autoRedraw_ != opt_value) {
      this.autoRedraw_ = opt_value;
      this.autoRedrawIsSet_ = false;
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.autoRedraw_;
  }
};


/**
 * @param {goog.events.Event} evt
 * @protected
 */
anychart.core.Chart.prototype.resizeHandler = function(evt) {
  if (this.bounds().dependsOnContainerSize()) {
    this.invalidate(anychart.ConsistencyState.ALL & ~anychart.ConsistencyState.CHART_ANIMATION,
        anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Remove/Restore.
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.Chart.prototype.remove = function() {
  if (this.rootElement) this.rootElement.parent(null);
};


//todo(Anton Saukh): refactor this mess!
/**
 * Internal invalidation event handler, redraw chart on all invalidate events.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.core.Chart.prototype.invalidateHandler_ = function(event) {
  anychart.globalLock.onUnlock(this.draw, this);
};
//end mess


//----------------------------------------------------------------------------------------------------------------------
//  JSON/XML.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Return chart configuration as JSON object or string.
 * Note for documentation writers!: Google compiler thinks that "Object" has "toJSON" method that must accept string and return *.
 * To avoid this we have to put in the "wrong" params.
 * In external documentation parameter must be boolean, and method must return Object|string.
 * For the moment we have no way around this "nice feature" of the compiler.
 * @param {boolean=} opt_stringify Return as JSON as string.
 *  Note: stringifying ignores this flag.
 * @param {boolean=} opt_includeTheme If the current theme properties should be included into the result.
 * @return {*} Chart JSON.
 */
anychart.core.Chart.prototype.toJson = function(opt_stringify, opt_includeTheme) {
  var data = this.isDisposed() ? {} : this.serialize();
  if (!opt_includeTheme) {
    data = /** @type {!Object} */(anychart.themes.merging.demerge(
        data, this.getDefaultThemeObj())) || {};
  }
  return opt_stringify ?
      goog.json.hybrid.stringify(data) :
      data;
};


/**
 * Return chart configuration as XML string or XMLNode.
 * @param {boolean=} opt_asXmlNode Return XML as XMLNode.
 * @param {boolean=} opt_includeTheme If the current theme properties should be included into the result.
 * @return {string|Node} Chart configuration.
 */
anychart.core.Chart.prototype.toXml = function(opt_asXmlNode, opt_includeTheme) {
  var data = this.isDisposed() ? {} : this.serialize();
  if (!opt_includeTheme) {
    data = /** @type {!Object} */(anychart.themes.merging.demerge(
        data, this.getDefaultThemeObj())) || {};
  }
  return anychart.utils.json2xml(data, '', opt_asXmlNode);
};


/**
 * Returns default theme object.
 * @return {Object}
 */
anychart.core.Chart.prototype.getDefaultThemeObj = function() {
  return {'chart': anychart.getFullTheme()[this.getType()]};
};


/** @inheritDoc */
anychart.core.Chart.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');
  json['title'] = this.title().serialize();
  json['background'] = this.background().serialize();
  json['margin'] = this.margin().serialize();
  json['padding'] = this.padding().serialize();
  var labels = [];
  for (var i = 0; i < this.chartLabels_.length; i++) {
    labels.push(this.chartLabels_[i].serialize());
  }
  if (labels.length > 0)
    json['chartLabels'] = labels;
  // from VisualBaseWithBounds
  json['bounds'] = this.bounds().serialize();
  json['animation'] = this.animation().serialize();
  json['tooltip'] = this.tooltip().serialize();
  return json;
};


/** @inheritDoc */
anychart.core.Chart.prototype.setupByJSON = function(config) {
  goog.base(this, 'setupByJSON', config);

  if ('defaultLabelSettings' in config)
    this.defaultLabelSettings(config['defaultLabelSettings']);

  this.title(config['title']);
  this.background(config['background']);
  this.margin(config['margin']);
  this.padding(config['padding']);

  var labels = config['chartLabels'];
  if (goog.isArray(labels)) {
    for (var i = 0; i < labels.length; i++)
      this.label(i, labels[i]);
  }

  // from VisualBase
  if (goog.isString(config['container']))
    this.container(config['container']);

  // from VisualBaseWithBounds
  this.bounds(config['bounds']);
  this.left(config['left']);
  this.top(config['top']);
  this.width(config['width']);
  this.height(config['height']);
  this.right(config['right']);
  this.bottom(config['bottom']);
  this.animation(config['animation']);
  this.tooltip(config['tooltip']);
};


/** @inheritDoc */
anychart.core.Chart.prototype.disposeInternal = function() {
  if (this.animation_) {
    goog.dispose(this.animation_);
    this.animation_ = null;
  }

  goog.base(this, 'disposeInternal');
};


/**
 * @ignoreDoc
 * @param {(Object|boolean|null)=} opt_value Legend settings.
 * @return {anychart.core.Chart|anychart.core.ui.Legend} Chart legend instance of itself for chaining call.
 */
anychart.core.Chart.prototype.legend = function(opt_value) {
  anychart.utils.error(anychart.enums.ErrorCode.NO_LEGEND_IN_CHART);
  return goog.isDef(opt_value) ? this : null;
};


/**
 * @ignoreDoc
 * @param {(Object|boolean|null)=} opt_value
 * @return {anychart.core.Chart|anychart.core.ui.Credits}
 */
anychart.core.Chart.prototype.credits = function(opt_value) {
  anychart.utils.error(anychart.enums.ErrorCode.NO_CREDITS_IN_CHART);
  return goog.isDef(opt_value) ? this : null;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Events.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Internal public method. Returns all chart series.
 * @return {!Array.<anychart.core.SeriesBase>}
 */
anychart.core.Chart.prototype.getAllSeries = goog.abstractMethod;


/**
 * Getter series by index.
 * @param {number} index .
 * @return {anychart.core.SeriesBase}
 */
anychart.core.Chart.prototype.getSeries = function(index) {
  return null;
};


/**
 * Tester if it is series.
 * @return {boolean}
 */
anychart.core.Chart.prototype.isSeries = function() {
  return false;
};


/**
 * Tester if it is chart.
 * @return {boolean}
 */
anychart.core.Chart.prototype.isChart = function() {
  return true;
};


/** @inheritDoc */
anychart.core.Chart.prototype.handleMouseEvent = function(event) {
  var series;

  var tag = anychart.utils.extractTag(event['domTarget']);
  var index;

  if (event['target'] instanceof anychart.core.ui.LabelsFactory || event['target'] instanceof anychart.core.ui.MarkersFactory) {
    var parent = event['target'].getParentEventTarget();
    if (parent.isSeries && parent.isSeries())
      series = parent;
    index = tag;
  } else if (event['target'] instanceof anychart.core.ui.Legend) {
    if (tag) {
      series = tag.series;
      index = tag.index;
    }
  } else {
    series = tag && tag.series;
    index = goog.isNumber(tag.index) ? tag.index : event['pointIndex'];
  }

  if (series && !series.isDisposed() && series.enabled() && goog.isFunction(series.makePointEvent)) {
    if (!goog.isDef(event['pointIndex']))
      event['pointIndex'] = goog.isArray(index) ? index[index.length - 1] : index;

    var evt = series.makePointEvent(event);
    if (evt)
      series.dispatchEvent(evt);
  }
};


/** @inheritDoc */
anychart.core.Chart.prototype.makeBrowserEvent = function(e) {
  //this method is invoked only for events from data layer
  var res = goog.base(this, 'makeBrowserEvent', e);
  var tag = anychart.utils.extractTag(res['relatedDomTarget']);

  var series = tag && tag.series;
  if (series && !series.isDisposed() && series.enabled()) {
    return series.makeBrowserEvent(e);
  }
  return res;
};


/**
 * Creates series status objects for event.
 * @param {Array.<Object>} seriesStatus .
 * @param {boolean=} opt_empty .
 * @return {Array.<Object>}
 * @protected
 */
anychart.core.Chart.prototype.createEventSeriesStatus = function(seriesStatus, opt_empty) {
  var eventSeriesStatus = [];
  for (var i = 0, len = seriesStatus.length; i < len; i++) {
    var status = seriesStatus[i];
    var nearestPointToCursor = status.nearestPointToCursor;
    var nearestPointToCursor_;
    if (nearestPointToCursor) {
      nearestPointToCursor_ = {
        'index': status.nearestPointToCursor.index,
        'distance': status.nearestPointToCursor.distance
      };
    } else {
      nearestPointToCursor_ = {
        'index': NaN,
        'distance': NaN
      };
    }
    eventSeriesStatus.push({
      'series': status.series,
      'points': opt_empty ? [] : status.points ? goog.array.clone(status.points) : [],
      'nearestPointToCursor': nearestPointToCursor_
    });
  }
  return eventSeriesStatus;
};


/**
 * Makes current point for events.
 * @param {Object} seriesStatus .
 * @param {string} event .
 * @param {boolean=} opt_empty .
 * @return {Object}
 * @protected
 */
anychart.core.Chart.prototype.makeCurrentPoint = function(seriesStatus, event, opt_empty) {
  var series, pointIndex, pointStatus, minDistance = Infinity;
  for (var i = 0, len = seriesStatus.length; i < len; i++) {
    var status = seriesStatus[i];
    if (status.nearestPointToCursor) {
      var nearestPoint = status.nearestPointToCursor;
      if (minDistance > nearestPoint.distance) {
        series = status.series;
        pointIndex = nearestPoint.index;
        pointStatus = goog.array.contains(status.points, nearestPoint.index);
        minDistance = nearestPoint.distance;
      }
    }
  }
  var currentPoint = {
    'index': pointIndex,
    'series': series
  };

  currentPoint[event] = opt_empty ? !pointStatus : pointStatus;

  return currentPoint;
};


/**
 * This method also has a side effect - it patches the original source event to maintain seriesStatus support for
 * browser events.
 * @param {string} type Type of the interactivity point event.
 * @param {Object} event Event object.
 * @param {Array.<Object>} seriesStatus Array of series statuses.
 * @param {boolean=} opt_empty .
 * @param {boolean=} opt_forbidTooltip
 * @return {Object} An object of event to dispatch. If null - unrecognized type was found.
 */
anychart.core.Chart.prototype.makeInteractivityPointEvent = function(type, event, seriesStatus, opt_empty, opt_forbidTooltip) {
  var currentPoint = this.makeCurrentPoint(seriesStatus, type, opt_empty);
  var wrappedPoints = [];
  /** @type {anychart.core.SeriesBase} */
  var series;
  for (var i = 0; i < seriesStatus.length; i++) {
    var status = seriesStatus[i];
    series = status.series;
    for (var j = 0; j < status.points.length; j++)
      wrappedPoints.push(series.getPoint(status.points[j]));
  }
  series = currentPoint['series'];
  var res = {
    'type': (type == 'hovered') ? anychart.enums.EventType.POINTS_HOVER : anychart.enums.EventType.POINTS_SELECT,
    'seriesStatus': this.createEventSeriesStatus(seriesStatus, opt_empty),
    'currentPoint': currentPoint,
    'actualTarget': event['target'],
    'target': this,
    'originalEvent': event,
    'point': series.getPoint(currentPoint['index']),
    'points': wrappedPoints
  };
  if (opt_forbidTooltip)
    res.forbidTooltip = true;
  return res;
};


/**
 * Gets chart point by index.
 * @param {number} index Point index.
 * @return {anychart.core.Point} Chart point.
 */
anychart.core.Chart.prototype.getPoint = goog.abstractMethod;


/**
 * Returns points by event.
 * @param {anychart.core.MouseEvent} event
 * @return {?Array.<{series: anychart.core.SeriesBase, points: Array.<number>, lastPoint: number, nearestPointToCursor: Object.<number>}>}
 */
anychart.core.Chart.prototype.getSeriesStatus = goog.abstractMethod;


/**
 * Some action on mouse over and move.
 * @param {Array.<number>|number} index Point index or indexes.
 * @param {anychart.core.SeriesBase} series Series.
 */
anychart.core.Chart.prototype.doAdditionActionsOnMouseOverAndMove = goog.nullFunction;


/**
 * Some action on mouse out.
 */
anychart.core.Chart.prototype.doAdditionActionsOnMouseOut = goog.nullFunction;


/**
 * Handler for mouseMove and mouseOver events.
 * @param {anychart.core.MouseEvent} event Event object.
 */
anychart.core.Chart.prototype.handleMouseOverAndMove = function(event) {
  var series, i, j, len;
  var interactivity = this.interactivity();

  var tag = anychart.utils.extractTag(event['domTarget']);
  var index;
  var forbidTooltip = false;

  if (event['target'] instanceof anychart.core.ui.LabelsFactory || event['target'] instanceof anychart.core.ui.MarkersFactory) {
    var parent = event['target'].getParentEventTarget();
    if (parent.isSeries && parent.isSeries())
      series = parent;
    index = tag;
  } else if (event['target'] instanceof anychart.core.ui.Legend) {
    if (tag) {
      if (tag.points) {
        series = tag.points.series;
        index = tag.points.points;
      } else {
        series = tag.series;
        index = tag.index;
      }
      forbidTooltip = true;
    }
  } else {
    series = tag && tag.series;
    index = goog.isNumber(tag.index) ? tag.index : event['pointIndex'];
  }

  if (series && !series.isDisposed() && series.enabled() && goog.isFunction(series.makePointEvent)) {
    var evt = series.makePointEvent(event);
    if (evt && ((anychart.utils.checkIfParent(/** @type {!goog.events.EventTarget} */(series), event['relatedTarget'])) || series.dispatchEvent(evt))) {
      if (interactivity.hoverMode() == anychart.enums.HoverMode.SINGLE) {

        if (goog.isArray(index) || (!series.state.hasPointStateByPointIndex(anychart.PointState.HOVER, index) && !isNaN(index))) {
          if (goog.isFunction(series.hoverPoint))
            series.hoverPoint(/** @type {number} */ (index), event);

          this.doAdditionActionsOnMouseOverAndMove(/** @type {number|Array.<number>} */(index), /** @type {!anychart.core.SeriesBase} */(series));

          var alreadyHoveredPoints = series.state.getIndexByPointState(anychart.PointState.HOVER);
          var eventSeriesStatus = [];
          if (alreadyHoveredPoints.length)
            eventSeriesStatus.push({
              series: series,
              points: alreadyHoveredPoints,
              nearestPointToCursor: {index: index, distance: 0}
            });

          this.dispatchEvent(this.makeInteractivityPointEvent('hovered', event, eventSeriesStatus, false, forbidTooltip));
        }
      }
    }
  }

  if (interactivity.hoverMode() != anychart.enums.HoverMode.SINGLE) {
    var seriesStatus = this.getSeriesStatus(event);
    var dispatchEvent = false;

    if (seriesStatus && seriesStatus.length) {
      series = this.getAllSeries();
      for (i = 0; i < series.length; i++) {
        var contains = false;
        for (j = 0; j < seriesStatus.length; j++) {
          contains = contains || series[i] == seriesStatus[j].series;
        }
        if (!contains && series[i].state.getIndexByPointState(anychart.PointState.HOVER).length) {
          seriesStatus.push({series: series[i], points: []});
          series[i].unhover();
          dispatchEvent = true;
        }
      }

      for (i = 0, len = seriesStatus.length; i < len; i++) {
        var seriesStatus_ = seriesStatus[i];
        series = seriesStatus_.series;
        var points = seriesStatus_.points;

        var hoveredPoints = series.state.getIndexByPointState(anychart.PointState.HOVER);
        dispatchEvent = dispatchEvent || !goog.array.equals(points, hoveredPoints);
        if (!series.state.isStateContains(series.state.getSeriesState(), anychart.PointState.HOVER)) {
          series.hoverPoint(seriesStatus_.points);
        }
      }
      if (dispatchEvent) {
        this.dispatchEvent(this.makeInteractivityPointEvent('hovered', event, seriesStatus, false, forbidTooltip));
        this.prevHoverSeriesStatus = seriesStatus.length ? seriesStatus : null;
      }
    } else {
      if (!(event['target'] instanceof anychart.core.ui.Legend)) {
        this.unhover();
        if (this.prevHoverSeriesStatus)
          this.dispatchEvent(this.makeInteractivityPointEvent('hovered', event, this.prevHoverSeriesStatus, true));
        this.prevHoverSeriesStatus = null;
      }
    }
  }
};


/**
 * Handler for mouseOut event.
 * @param {anychart.core.MouseEvent} event Event object.
 */
anychart.core.Chart.prototype.handleMouseOut = function(event) {
  var hoverMode = this.interactivity().hoverMode();

  var tag = anychart.utils.extractTag(event['domTarget']);
  var forbidTooltip = false;

  var series, index;
  if (event['target'] instanceof anychart.core.ui.LabelsFactory || event['target'] instanceof anychart.core.ui.MarkersFactory) {
    var parent = event['target'].getParentEventTarget();
    if (parent.isSeries && parent.isSeries())
      series = parent;
    index = tag;
  } else if (event['target'] instanceof anychart.core.ui.Legend) {
    if (tag) {
      if (tag.points) {
        series = tag.points.series;
        index = tag.points.points;
      } else {
        series = tag.series;
        index = tag.index;
      }
    }
    forbidTooltip = true;
  } else {
    series = tag && tag.series;
    index = goog.isNumber(tag.index) ? tag.index : event['pointIndex'];
  }

  if (series && !series.isDisposed() && series.enabled() &&
      goog.isFunction(series.makePointEvent)) {
    var evt = series.makePointEvent(event);
    var prevTag = anychart.utils.extractTag(event['relatedDomTarget']);
    var prevIndex = anychart.utils.toNumber(goog.isObject(prevTag) ? prevTag.index : prevTag);

    var ifParent = anychart.utils.checkIfParent(/** @type {!goog.events.EventTarget} */(series), event['relatedTarget']);

    if ((!ifParent || (prevIndex != index)) && series.dispatchEvent(evt)) {
      if (hoverMode == anychart.enums.HoverMode.SINGLE && (!isNaN(index) || goog.isArray(index))) {
        series.unhover();
        this.dispatchEvent(this.makeInteractivityPointEvent('hovered', event, [{
          series: series,
          points: [],
          nearestPointToCursor: {index: index, distance: 0}
        }], false, forbidTooltip));
      }
    }
  }

  if (hoverMode != anychart.enums.HoverMode.SINGLE) {
    if (!anychart.utils.checkIfParent(this, event['relatedTarget'])) {
      this.unhover();
      this.doAdditionActionsOnMouseOut();
      if (this.prevHoverSeriesStatus)
        this.dispatchEvent(this.makeInteractivityPointEvent('hovered', event, this.prevHoverSeriesStatus, true, forbidTooltip));
      this.prevHoverSeriesStatus = null;
    }
  }

};


/**
 * Handler for mouseClick event.
 * @param {anychart.core.MouseEvent} event Event object.
 */
anychart.core.Chart.prototype.handleMouseDown = function(event) {
  var interactivity = this.interactivity();

  var seriesStatus, eventSeriesStatus, allSeries, alreadySelectedPoints, i;
  var controlKeyPressed = event.ctrlKey || event.metaKey;
  var clickWithControlOnSelectedSeries, equalsSelectedPoints;

  var tag = anychart.utils.extractTag(event['domTarget']);

  var series, s, index;
  if (event['target'] instanceof anychart.core.ui.LabelsFactory || event['target'] instanceof anychart.core.ui.MarkersFactory) {
    var parent = event['target'].getParentEventTarget();
    if (parent.isSeries && parent.isSeries())
      series = parent;
    index = tag;
  } else if (event['target'] instanceof anychart.core.ui.Legend) {
    if (tag) {
      if (tag.points) {
        series = tag.points.series;
        index = tag.points.points;
      } else {
        series = tag.series;
        index = tag.index;
      }
    }
  } else {
    series = tag && tag.series;
    index = goog.isNumber(tag.index) ? tag.index : event['pointIndex'];
  }

  if (series && !series.isDisposed() && series.enabled() && goog.isFunction(series.makePointEvent)) {
    var evt = series.makePointEvent(event);
    if (evt && ((anychart.utils.checkIfParent(/** @type {!goog.events.EventTarget} */(series), event['relatedTarget'])) || series.dispatchEvent(evt))) {
      if (interactivity.hoverMode() == anychart.enums.HoverMode.SINGLE) {
        if (interactivity.selectionMode() == anychart.enums.SelectionMode.NONE || series.selectionMode() == anychart.enums.SelectionMode.NONE)
          return;

        alreadySelectedPoints = series.state.getIndexByPointState(anychart.PointState.SELECT);
        equalsSelectedPoints = alreadySelectedPoints.length == 1 && alreadySelectedPoints[0] == index;

        if (!(controlKeyPressed || event.shiftKey) && equalsSelectedPoints)
          return;

        clickWithControlOnSelectedSeries = (controlKeyPressed || event.shiftKey) && series.state.isStateContains(series.state.getSeriesState(), anychart.PointState.SELECT);
        var unselect = clickWithControlOnSelectedSeries ||
            !(controlKeyPressed || event.shiftKey) ||
            ((controlKeyPressed || event.shiftKey) && interactivity.selectionMode() != anychart.enums.SelectionMode.MULTI_SELECT);

        if (unselect) {
          this.unselect();
          if (this.prevSelectSeriesStatus)
            this.dispatchEvent(this.makeInteractivityPointEvent('selected', event, this.prevSelectSeriesStatus, true));
        } else if (series.selectionMode() == anychart.enums.SelectionMode.SINGLE_SELECT) {
          if (this.prevSelectSeriesStatus)
            this.dispatchEvent(this.makeInteractivityPointEvent('selected', event, this.prevSelectSeriesStatus, true));
          series.unselect();
          if (goog.isArray(index))
            index = index[index.length - 1];
        }

        if (goog.isFunction(series.selectPoint))
          series.selectPoint(/** @type {number} */ (index), event);

        allSeries = this.getAllSeries();
        eventSeriesStatus = [];
        for (i = 0; i < allSeries.length; i++) {
          s = allSeries[i];
          if (!s) continue;
          alreadySelectedPoints = s.state.getIndexByPointState(anychart.PointState.SELECT);
          if (alreadySelectedPoints.length) {
            eventSeriesStatus.push({
              series: s,
              points: alreadySelectedPoints,
              nearestPointToCursor: {index: index, distance: 0}
            });
          }
        }

        if (!eventSeriesStatus.length) {
          eventSeriesStatus.push({
            series: series,
            points: [],
            nearestPointToCursor: {index: index, distance: 0}
          });
        }

        this.dispatchEvent(this.makeInteractivityPointEvent('selected', evt, eventSeriesStatus));

        if (equalsSelectedPoints)
          this.prevSelectSeriesStatus = null;
        else
          this.prevSelectSeriesStatus = eventSeriesStatus;
      }
    }
  } else if (interactivity.hoverMode() == anychart.enums.HoverMode.SINGLE) {
    this.unselect();
    if (this.prevSelectSeriesStatus)
      this.dispatchEvent(this.makeInteractivityPointEvent('selected', event, this.prevSelectSeriesStatus, true));
    this.prevSelectSeriesStatus = null;
  }

  if (interactivity.hoverMode() != anychart.enums.HoverMode.SINGLE) {
    if (interactivity.selectionMode() == anychart.enums.SelectionMode.NONE)
      return;

    var j, len;
    seriesStatus = this.getSeriesStatus(event);

    if (seriesStatus && seriesStatus.length) {
      var dispatchEvent = false;
      eventSeriesStatus = [];
      var contains, seriesStatus_;

      if (interactivity.selectionMode() == anychart.enums.SelectionMode.SINGLE_SELECT) {
        var nearest;
        for (i = 0, len = seriesStatus.length; i < len; i++) {
          seriesStatus_ = seriesStatus[i];
          series = seriesStatus_.series;

          if (series.selectionMode() == anychart.enums.SelectionMode.NONE)
            continue;

          if (!nearest) nearest = seriesStatus_;
          if (nearest.nearestPointToCursor.distance > seriesStatus_.nearestPointToCursor.distance) {
            nearest = seriesStatus_;
          }
        }

        series = nearest.series;

        alreadySelectedPoints = series.state.getIndexByPointState(anychart.PointState.SELECT);
        equalsSelectedPoints = alreadySelectedPoints.length == 1 && alreadySelectedPoints[0] == nearest.nearestPointToCursor.index;

        dispatchEvent = !equalsSelectedPoints || (equalsSelectedPoints && (controlKeyPressed || event.shiftKey));

        clickWithControlOnSelectedSeries = (controlKeyPressed || event.shiftKey) && series.state.isStateContains(series.state.getSeriesState(), anychart.PointState.SELECT);
        if ((clickWithControlOnSelectedSeries || !(controlKeyPressed || event.shiftKey)) && !equalsSelectedPoints) {
          series.unselect();
        }
        series.selectPoint(/** @type {number} */ (nearest.nearestPointToCursor.index), event);

        alreadySelectedPoints = series.state.getIndexByPointState(anychart.PointState.SELECT);

        if (alreadySelectedPoints.length) {
          eventSeriesStatus.push({
            series: series,
            points: [nearest.nearestPointToCursor.index],
            nearestPointToCursor: nearest.nearestPointToCursor
          });


          allSeries = this.getAllSeries();
          for (i = 0; i < allSeries.length; i++) {
            series = allSeries[i];
            if (series.selectionMode() == anychart.enums.SelectionMode.NONE)
              continue;

            contains = series == eventSeriesStatus[0].series;
            if (!contains) {
              series.unselect();
            }
          }
        } else {
          eventSeriesStatus.push({
            series: series,
            points: alreadySelectedPoints,
            nearestPointToCursor: seriesStatus_.nearestPointToCursor
          });
        }
      } else {
        var emptySeries = [];
        if (!(controlKeyPressed || event.shiftKey)) {
          allSeries = this.getAllSeries();

          for (i = 0; i < allSeries.length; i++) {
            s = allSeries[i];
            if (s.selectionMode() == anychart.enums.SelectionMode.NONE)
              continue;

            contains = false;
            for (j = 0; j < seriesStatus.length; j++) {
              contains = contains || s == seriesStatus[j].series;
            }
            if (!contains && s.state.getIndexByPointState(anychart.PointState.SELECT).length) {
              emptySeries.push({series: s, points: []});
              s.unselect();
              dispatchEvent = true;
            }
          }
        }

        for (i = 0, len = seriesStatus.length; i < len; i++) {
          seriesStatus_ = seriesStatus[i];
          series = seriesStatus_.series;

          if (series.selectionMode() == anychart.enums.SelectionMode.NONE)
            continue;

          var points;
          if (series.selectionMode() == anychart.enums.SelectionMode.SINGLE_SELECT) {
            points = [seriesStatus_.nearestPointToCursor.index];
          } else {
            points = seriesStatus_.points;
          }

          alreadySelectedPoints = series.state.getIndexByPointState(anychart.PointState.SELECT);
          if (event.shiftKey) {
            contains = true;
            for (j = 0; j < points.length; j++) {
              contains = contains && goog.array.contains(alreadySelectedPoints, points[j]);
            }
            equalsSelectedPoints = contains;
          } else if (!controlKeyPressed) {
            equalsSelectedPoints = goog.array.equals(points, alreadySelectedPoints);
          }
          dispatchEvent = dispatchEvent || !equalsSelectedPoints;

          if (!equalsSelectedPoints) {
            clickWithControlOnSelectedSeries = (controlKeyPressed || event.shiftKey) && series.state.isStateContains(series.state.getSeriesState(), anychart.PointState.SELECT);
            if (clickWithControlOnSelectedSeries || !(controlKeyPressed || event.shiftKey) || series.selectionMode() == anychart.enums.SelectionMode.SINGLE_SELECT) {
              series.unselect();
            }
            series.selectPoint(points, event);
          }
          alreadySelectedPoints = series.state.getIndexByPointState(anychart.PointState.SELECT);
          if (alreadySelectedPoints.length) {
            eventSeriesStatus.push({
              series: series,
              points: alreadySelectedPoints,
              nearestPointToCursor: seriesStatus_.nearestPointToCursor
            });
          } else {
            emptySeries.push({
              series: series,
              points: alreadySelectedPoints,
              nearestPointToCursor: seriesStatus_.nearestPointToCursor
            });
          }
        }

        for (i = 0; i < emptySeries.length; i++) {
          eventSeriesStatus.push(emptySeries[i]);
        }
      }

      if (dispatchEvent) {
        this.dispatchEvent(this.makeInteractivityPointEvent('selected', event, eventSeriesStatus));
        this.prevSelectSeriesStatus = eventSeriesStatus.length ? eventSeriesStatus : null;
      }
    } else {
      this.unselect();
      if (this.prevSelectSeriesStatus)
        this.dispatchEvent(this.makeInteractivityPointEvent('selected', event, this.prevSelectSeriesStatus, true));
      this.prevSelectSeriesStatus = null;
    }
  }
};


/**
 * Deselects all series. It doesn't matter what series it belongs to.
 * @param {(number|Array<number>)=} opt_indexOrIndexes Point index or array of indexes.
 */
anychart.core.Chart.prototype.unselect = function(opt_indexOrIndexes) {
  var i, len;
  var series = this.getAllSeries();
  for (i = 0, len = series.length; i < len; i++) {
    if (series[i]) series[i].unselect(opt_indexOrIndexes);
  }
};


/**
 * Make unhover to all series. It doesn't matter what series it belongs to.
 * @param {(number|Array<number>)=} opt_indexOrIndexes Point index or array of indexes.
 */
anychart.core.Chart.prototype.unhover = function(opt_indexOrIndexes) {
  var i, len;
  var series = this.getAllSeries();
  for (i = 0, len = series.length; i < len; i++) {
    if (series[i]) series[i].unhover(opt_indexOrIndexes);
  }
};


/**
 * Sets/gets settings for regions doesn't linked to anything regions.
 * @param {(Object|anychart.enums.HoverMode)=} opt_value Settings object or boolean value like enabled state.
 * @return {anychart.core.utils.Interactivity|anychart.core.Chart}
 */
anychart.core.Chart.prototype.interactivity = function(opt_value) {
  if (!this.interactivity_) {
    this.interactivity_ = new anychart.core.utils.Interactivity(this);
    this.interactivity_.listenSignals(this.onInteractivitySignal_, this);
  }

  if (goog.isDef(opt_value)) {
    if (goog.isObject(opt_value))
      this.interactivity_.setup(opt_value);
    else
      this.interactivity_.hoverMode(opt_value);
    return this;
  }
  return this.interactivity_;
};


/**
 * Animation enabled change handler.
 * @private
 */
anychart.core.Chart.prototype.onInteractivitySignal_ = function() {
  var series = this.getAllSeries();
  for (var i = series.length; i--;) {
    if (series[i])
      series[i].hoverMode(/** @type {string} */(this.interactivity().hoverMode()));
  }
};


/**
 * Returns chart or gauge type. Published in charts.
 * @return {anychart.enums.ChartTypes|anychart.enums.GaugeTypes|anychart.enums.MapTypes}
 */
anychart.core.Chart.prototype.getType = goog.abstractMethod;


/**
 * @typedef {{chart: anychart.core.Chart}}
 */
anychart.core.Chart.DrawEvent;


//exports
anychart.core.Chart.prototype['animation'] = anychart.core.Chart.prototype.animation;
anychart.core.Chart.prototype['title'] = anychart.core.Chart.prototype.title;//doc|ex
anychart.core.Chart.prototype['background'] = anychart.core.Chart.prototype.background;//doc|ex
anychart.core.Chart.prototype['margin'] = anychart.core.Chart.prototype.margin;//doc|ex
anychart.core.Chart.prototype['padding'] = anychart.core.Chart.prototype.padding;//doc|ex
anychart.core.Chart.prototype['label'] = anychart.core.Chart.prototype.label;//doc|ex
anychart.core.Chart.prototype['container'] = anychart.core.Chart.prototype.container;//doc
anychart.core.Chart.prototype['draw'] = anychart.core.Chart.prototype.draw;//doc
anychart.core.Chart.prototype['toJson'] = anychart.core.Chart.prototype.toJson;//|need-ex
anychart.core.Chart.prototype['toXml'] = anychart.core.Chart.prototype.toXml;//|need-ex
anychart.core.Chart.prototype['legend'] = anychart.core.Chart.prototype.legend;//dummy DO NOT USE
anychart.core.Chart.prototype['credits'] = anychart.core.Chart.prototype.credits;//dummy DO NOT USE
anychart.core.Chart.prototype['tooltip'] = anychart.core.Chart.prototype.tooltip;
anychart.core.Chart.prototype['saveAsPng'] = anychart.core.Chart.prototype.saveAsPng;//inherited
anychart.core.Chart.prototype['saveAsJpg'] = anychart.core.Chart.prototype.saveAsJpg;//inherited
anychart.core.Chart.prototype['saveAsPdf'] = anychart.core.Chart.prototype.saveAsPdf;//inherited
anychart.core.Chart.prototype['saveAsSvg'] = anychart.core.Chart.prototype.saveAsSvg;//inherited
anychart.core.Chart.prototype['toSvg'] = anychart.core.Chart.prototype.toSvg;//inherited
