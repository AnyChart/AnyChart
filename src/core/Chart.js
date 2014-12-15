goog.provide('anychart.core.Chart');
goog.require('acgraph');
goog.require('anychart.core.VisualBaseWithBounds');
goog.require('anychart.core.ui.Background');
goog.require('anychart.core.ui.Credits');
goog.require('anychart.core.ui.Label');
goog.require('anychart.core.ui.Legend');
goog.require('anychart.core.ui.Title');
goog.require('anychart.core.utils.Margin');
goog.require('anychart.core.utils.Padding');
goog.require('anychart.core.utils.PrintHelper');
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
   * @type {anychart.core.ui.Legend}
   * @private
   */
  this.legend_ = null;

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
   * @type {anychart.core.ui.Credits}
   * @private
   */
  this.credits_ = null;

  this.restoreDefaults();
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
 * Supported consistency states. Adds BACKGROUND, TITLE and LEGEND to BaseWithBounds states.
 * @type {number}
 */
anychart.core.Chart.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.VisualBaseWithBounds.prototype.SUPPORTED_CONSISTENCY_STATES |
        anychart.ConsistencyState.LEGEND |
        anychart.ConsistencyState.CHART_LABELS |
        anychart.ConsistencyState.BACKGROUND |
        anychart.ConsistencyState.TITLE |
        anychart.ConsistencyState.CREDITS;


/**
 * Background z-index in chart root layer.
 * @type {number}
 */
anychart.core.Chart.ZINDEX_BACKGROUND = 1;


/**
 * Legend z-index in chart root layer.
 * @type {number}
 */
anychart.core.Chart.ZINDEX_LEGEND = 20;


/**
 * Chart label z-index in chart root layer.
 * @type {number}
 */
anychart.core.Chart.ZINDEX_LABEL = 50;


/**
 * Title z-index in chart root layer.
 * @type {number}
 */
anychart.core.Chart.ZINDEX_TITLE = 80;


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
anychart.core.Chart.prototype.margin = function(opt_spaceOrTopOrTopAndBottom, opt_rightOrRightAndLeft, opt_bottom, opt_left) {
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
anychart.core.Chart.prototype.padding = function(opt_spaceOrTopOrTopAndBottom, opt_rightOrRightAndLeft, opt_bottom, opt_left) {
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
 * chart.background(background)
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
    this.background_.zIndex(anychart.core.Chart.ZINDEX_BACKGROUND);
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
    this.invalidate(anychart.ConsistencyState.BACKGROUND, anychart.Signal.NEEDS_REDRAW);
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
    this.title_.listenSignals(this.onTitleSignal_, this);
    this.title_.zIndex(anychart.core.Chart.ZINDEX_TITLE);
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
    state |= anychart.ConsistencyState.TITLE;
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
//  Legend.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter for current chart legend.
 * @example <t>lineChart</t>
 * chart.line([-2, 11, 2, 4]);
 * chart.line([7, 10, 2, 0]);
 * chart.legend()
 *         .position('right')
 *         .title(null)
 *         .itemsLayout('vertical')
 *         .align('left');
 * @return {!anychart.core.ui.Legend} An instance of {@link anychart.core.ui.Legend} for method chaining.
 *//**
 * Setter for chart legend setting.
 * @example <t>lineChart</t>
 * chart.line([-2, 11, 2, 4]);
 * chart.line([7, 10, 2, 0]);
 * chart.legend(true);
 * @param {(Object|boolean|null)=} opt_value Legend settings.
 * @return {!anychart.core.Chart} An instance of {@link anychart.core.Chart} for method chaining.
 *//**
 * @ignoreDoc
 * @param {(Object|boolean|null)=} opt_value Legend settings.
 * @return {!(anychart.core.Chart|anychart.core.ui.Legend)} Chart legend instance of itself for chaining call.
 */
anychart.core.Chart.prototype.legend = function(opt_value) {
  if (!this.legend_) {
    this.legend_ = new anychart.core.ui.Legend();
    this.legend_.zIndex(anychart.core.Chart.ZINDEX_LEGEND);
    this.registerDisposable(this.legend_);
    this.legend_.listenSignals(this.onLegendSignal_, this);
  }

  if (goog.isDef(opt_value)) {
    this.legend_.setup(opt_value);
    return this;
  } else {
    return this.legend_;
  }
};


/**
 * Internal title invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.core.Chart.prototype.onLegendSignal_ = function(event) {
  var state = 0;
  var signal = 0;
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    state |= anychart.ConsistencyState.LEGEND;
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
 * chart.label({text: 'custom text});
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
    label = new anychart.core.ui.Label();
    label.text('Chart label');
    label.zIndex(anychart.core.Chart.ZINDEX_LABEL);
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


//----------------------------------------------------------------------------------------------------------------------
//
//  Credits.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter for current chart credits settings.
 * @example <t>lineChart</t>
 * chart.line([1, 4, 2, 9]);
 * chart.credits().text('Click me!');
 * @return {!anychart.core.ui.Credits} An instance of {@link anychart.core.ui.Credits} class for method chaining.
 *//**
 * Setter for chart credits settings.
 * @example <t>lineChart</t>
 * chart.line([1, 4, 2, 9]);
 * chart.credits(null);
 * @param {(Object|boolean|null)=} opt_value
 * @return {!anychart.core.Chart} An instance of {@link anychart.core.Chart} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(Object|boolean|null)=} opt_value
 * @return {!(anychart.core.Chart|anychart.core.ui.Credits)} Chart credits or itself for chaining call.
 */
anychart.core.Chart.prototype.credits = function(opt_value) {
  if (!this.credits_) {
    this.credits_ = new anychart.core.ui.Credits();
    this.registerDisposable(this.credits_);
    this.credits_.listenSignals(this.onCreditsSignal_, this);
  }

  if (goog.isDef(opt_value)) {
    this.credits_.setup(opt_value);
    return this;
  } else {
    return this.credits_;
  }
};


/**
 * Internal title invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.core.Chart.prototype.onCreditsSignal_ = function(event) {
  var state = 0;
  var signal = anychart.Signal.NEEDS_REDRAW;
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    state |= anychart.ConsistencyState.CREDITS;
  }
  if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    state |= anychart.ConsistencyState.BOUNDS;
  }
  // If there are no signals – state == 0 and nothing will happen.
  this.invalidate(state, signal);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Drawing.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Starts the rendering of the chart into the container.
 * @return {anychart.core.Chart} An instance of {@link anychart.core.Chart} class for method chaining.
 */
anychart.core.Chart.prototype.draw = function() {
  //todo(Anton Saukh): refactor this mess!
  if (this.autoRedraw_)
    this.listenSignals(this.invalidateHandler_, this);
  else
    this.unlistenSignals(this.invalidateHandler_, this);
  //end mess

  if (!this.checkDrawingNeeded())
    return this;

  var startTime = new Date().getTime();

  this.suspendSignalsDispatching();

  //total chart area bounds, do not override, it can be useful later
  var totalBounds;
  //chart area with applied margin
  var boundsWithoutMargin;
  //chart area bounds with applied margin and copped by credits
  var boundsWithoutCredits;
  //chart area with applied margin and padding
  var boundsWithoutPadding;
  // chart area with applied margin, padding and title
  var boundsWithoutTitle;
  // chart area with applied margin, padding, title and legend
  var boundsWithoutLegend;
  //chart content bounds, allocated space for all chart appearance items.
  var contentAreaBounds;


  //create root element only if draw is called
  if (!this.rootElement) {
    this.rootElement = acgraph.layer();
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

  totalBounds = /** @type {!anychart.math.Rect} */(this.getPixelBounds());
  boundsWithoutMargin = this.margin().tightenBounds(totalBounds);

  var background = this.background();
  if (this.hasInvalidationState(anychart.ConsistencyState.BACKGROUND | anychart.ConsistencyState.BOUNDS)) {
    background.suspendSignalsDispatching();
    if (!background.container()) background.container(this.rootElement);
    background.parentBounds(boundsWithoutMargin);
    background.resumeSignalsDispatching(false);
    background.draw();
    this.markConsistent(anychart.ConsistencyState.BACKGROUND);
  }

  var credits = this.credits();
  if (this.hasInvalidationState(anychart.ConsistencyState.CREDITS | anychart.ConsistencyState.BOUNDS)) {
    credits.suspendSignalsDispatching();
    if (!credits.container())
      credits.container(/** @type {acgraph.vector.ILayer} */(this.container()));
    credits.parentBounds(/** @type {anychart.math.Rect} */ (boundsWithoutMargin));
    credits.resumeSignalsDispatching(false);
    credits.draw();
    this.markConsistent(anychart.ConsistencyState.CREDITS);
  }
  boundsWithoutCredits = this.credits().getRemainingBounds();

  boundsWithoutPadding = this.padding().tightenBounds(boundsWithoutCredits);
  var title = this.title();
  if (this.hasInvalidationState(anychart.ConsistencyState.TITLE | anychart.ConsistencyState.BOUNDS)) {
    title.suspendSignalsDispatching();
    if (!title.container()) title.container(this.rootElement);
    title.parentBounds(boundsWithoutPadding);
    title.resumeSignalsDispatching(false);
    title.draw();
    this.markConsistent(anychart.ConsistencyState.TITLE);
  }

  boundsWithoutTitle = title.enabled() ? title.getRemainingBounds() : boundsWithoutPadding;
  var legend = /** @type {anychart.core.ui.Legend} */(this.legend());
  var legendParentBounds = boundsWithoutTitle;
  if (this.hasInvalidationState(anychart.ConsistencyState.LEGEND | anychart.ConsistencyState.BOUNDS)) {
    legend.suspendSignalsDispatching();
    if (!legend.container() && legend.enabled()) legend.container(this.rootElement);
    legend.parentBounds(legendParentBounds);
    if (!legend.itemsProvider()) {
      legend.itemsProvider(this.createLegendItemsProvider());
    }
    legend.resumeSignalsDispatching(false);
    legend.draw();
    this.markConsistent(anychart.ConsistencyState.LEGEND);
  }

  boundsWithoutLegend = legend.enabled() ? legend.getRemainingBounds() : legendParentBounds;

  contentAreaBounds = boundsWithoutLegend.clone();
  this.drawContent(contentAreaBounds);

  if (this.hasInvalidationState(anychart.ConsistencyState.CHART_LABELS | anychart.ConsistencyState.BOUNDS)) {
    for (var i = 0, count = this.chartLabels_.length; i < count; i++) {
      var label = this.chartLabels_[i];
      if (label) {
        label.suspendSignalsDispatching();
        if (!label.container() && label.enabled()) label.container(this.rootElement);
        label.parentBounds(totalBounds);
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
          this.resizeHandler_,
          false,
          this
      );
    }
  }

  //after all chart items drawn, we can clear other states
  this.markConsistent(anychart.ConsistencyState.BOUNDS);

  if (manualSuspend) stage.resume();

  this.resumeSignalsDispatching(false);

  this.dispatchDetachedEvent(new anychart.core.Chart.DrawEvent(this));

  var msg = 'Chart rendering time: ' + (new Date().getTime() - startTime);
  anychart.utils.info(msg);

  return this;
};


/**
 * Extension point do draw chart content.
 * @param {acgraph.math.Rect} bounds Chart content area bounds.
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
 * @private
 */
anychart.core.Chart.prototype.resizeHandler_ = function(evt) {
  this.credits().invalidate(anychart.ConsistencyState.POSITION);
  if (this.bounds().dependsOnContainerSize()) {
    this.invalidate(anychart.ConsistencyState.ALL,
        anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
  } else {
    this.invalidate(anychart.ConsistencyState.CREDITS, anychart.Signal.NEEDS_REDRAW);
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


//----------------------------------------------------------------------------------------------------------------------
//
//  Legend.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Create legend items provider specific to chart type.
 * @protected
 * @return {!Array.<anychart.core.ui.Legend.LegendItemProvider>} Legend items provider.
 */
anychart.core.Chart.prototype.createLegendItemsProvider = goog.abstractMethod;


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
 * @param {string=} opt_stringify Return as JSON as string.
 * @return {*} Chart JSON.
 */
anychart.core.Chart.prototype.toJson = function(opt_stringify) {
  return opt_stringify ?
      goog.json.hybrid.stringify(/** @type {!Object} */(this.serialize())) :
      this.serialize();
};


/**
 * Return chart configuration as XML string or XMLNode.
 * @param {boolean=} opt_asXmlNode Return XML as XMLNode.
 * @return {string|Node} Chart configuration.
 */
anychart.core.Chart.prototype.toXml = function(opt_asXmlNode) {
  return anychart.utils.json2xml(this.serialize(), undefined, opt_asXmlNode);
};


/** @inheritDoc */
anychart.core.Chart.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');
  json['title'] = this.title().serialize();
  json['background'] = this.background().serialize();
  json['margin'] = this.margin().serialize();
  json['padding'] = this.padding().serialize();
  json['legend'] = this.legend().serialize();
  json['credits'] = this.credits().serialize();
  var labels = [];
  for (var i = 0; i < this.chartLabels_.length; i++) {
    labels.push(this.chartLabels_[i].serialize());
  }
  // from VisualBase
  json['chartLabels'] = labels;
  // from VisualBaseWithBounds
  json['bounds'] = this.bounds().serialize();
  return json;
};


/** @inheritDoc */
anychart.core.Chart.prototype.setupByJSON = function(config) {
  goog.base(this, 'setupByJSON', config);
  this.title(config['title']);
  this.background(config['background']);
  this.margin(config['margin']);
  this.padding(config['padding']);
  this.legend(config['legend']);
  this.credits(config['credits']);

  var labels = config['chartLabels'];
  if (goog.isArray(labels)) {
    for (var i = 0; i < labels.length; i++)
      this.label(labels[i]);
  }

  // from VisualBase
  if (goog.isString(config['container']))
    this.container(config['container'])

  // from VisualBaseWithBounds
  this.bounds(config['bounds']);
  this.left(config['left']);
  this.top(config['top']);
  this.width(config['width']);
  this.height(config['height']);
  this.right(config['right']);
  this.bottom(config['bottom']);
};


/**
 * Restore default chart settings.
 */
anychart.core.Chart.prototype.restoreDefaults = function() {
  this.bounds().set(null, null, null, null);
  this.margin(0);
  this.padding(10, 20);

  var background = /** @type {anychart.core.ui.Background} */(this.background());
  background.fill(['rgb(255,255,255)', 'rgb(243,243,243)', 'rgb(255,255,255)']);
  background.stroke('none');

  var title = /** @type {anychart.core.ui.Title} */(this.title());
  title.text('Chart title');
  title.margin().bottom(15);

  var legend = /** @type {anychart.core.ui.Legend} */(this.legend());
  legend.enabled(false);
  legend.itemsLayout('horizontal');
  legend.position('bottom');
  legend.margin(0, 0, 0, 10);
  legend.align(anychart.enums.Align.CENTER);
  legend.fontSize(11);
  legend.fontFamily('Tahoma');
  legend.fontColor('rgb(34,34,34)');

  var legendSeparator = /** @type {anychart.core.ui.Separator} */(legend.titleSeparator());
  legendSeparator.enabled(false);
  legendSeparator.height(1);
  legendSeparator.fill(['#000000 0', '#000000 1', '#000000 0']);

  var legendTitle = /** @type {anychart.core.ui.Title} */(legend.title());
  legendTitle.enabled(false);
  legendTitle.text('Legend title');
  legendTitle.fontSize(10);
  legendTitle.fontWeight('bold');
  legendTitle.fontFamily('verdana');
  legendTitle.fontColor('rgb(35,35,35)');

  var legendBackground = /** @type {anychart.core.ui.Background} */(legend.background());
  legendBackground.fill(['rgb(255,255,255)', 'rgb(243,243,243)', 'rgb(255,255,255)']);
  legendBackground.stroke('rgb(221,221,221)');
};


/**
 * Prints a chart or stage.
 * @param {acgraph.vector.Stage=} opt_stage - Stage to be printed.
 */
anychart.core.Chart.prototype.print = function(opt_stage) {
  var stage = opt_stage || ((this.container() && this.container().getStage) ? this.container().getStage() : this.rootElement.getStage());

  anychart.core.utils.PrintHelper.getInstance().print(stage);
};



/**
 * @param {anychart.core.Chart} chart
 * @constructor
 * @extends {goog.events.Event}
 */
anychart.core.Chart.DrawEvent = function(chart) {
  goog.base(this, anychart.enums.EventType.CHART_DRAW, chart);

  /**
   * @type {anychart.core.Chart}
   */
  this['chart'] = chart;
};
goog.inherits(anychart.core.Chart.DrawEvent, goog.events.Event);


//exports
anychart.core.Chart.prototype['title'] = anychart.core.Chart.prototype.title;//doc|ex
anychart.core.Chart.prototype['background'] = anychart.core.Chart.prototype.background;//doc|ex
anychart.core.Chart.prototype['margin'] = anychart.core.Chart.prototype.margin;//doc|ex
anychart.core.Chart.prototype['padding'] = anychart.core.Chart.prototype.padding;//doc|ex
anychart.core.Chart.prototype['legend'] = anychart.core.Chart.prototype.legend;//doc|ex
anychart.core.Chart.prototype['label'] = anychart.core.Chart.prototype.label;//doc|ex
anychart.core.Chart.prototype['credits'] = anychart.core.Chart.prototype.credits;//doc|ex
anychart.core.Chart.prototype['container'] = anychart.core.Chart.prototype.container;//doc
anychart.core.Chart.prototype['draw'] = anychart.core.Chart.prototype.draw;//doc
anychart.core.Chart.prototype['toJson'] = anychart.core.Chart.prototype.toJson;//|need-ex
anychart.core.Chart.prototype['toXml'] = anychart.core.Chart.prototype.toXml;//|need-ex
