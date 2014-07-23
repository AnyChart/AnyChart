goog.provide('anychart.Chart');

goog.require('anychart.VisualBaseWithBounds');
goog.require('anychart.elements.Background');
goog.require('anychart.elements.Label');
goog.require('anychart.elements.Legend');
goog.require('anychart.elements.Title');
goog.require('anychart.events.EventType');
goog.require('anychart.utils');
goog.require('anychart.utils.Margin');
goog.require('anychart.utils.Padding');
goog.require('anychart.utils.PrintHelper');
goog.require('goog.json.hybrid');



/**
 * Base class for all charts, contains the margins, the background and the title.
 * @constructor
 * @extends {anychart.VisualBaseWithBounds}
 */
anychart.Chart = function() {
  //todo: this suspend can be replaced with a flag for the chart if it will not be needed anywhere else.
  this.suspendSignalsDispatching();
  goog.base(this);

  /**
   * @type {acgraph.vector.Layer}
   * @protected
   */
  this.rootElement = null;

  /**
   * @type {anychart.elements.Background}
   * @private
   */
  this.background_ = null;

  /**
   * @type {anychart.utils.Margin}
   * @private
   */
  this.margin_ = null;

  /**
   * @type {anychart.elements.Title}
   * @private
   */
  this.title_ = null;

  /**
   * @type {anychart.utils.Padding}
   * @private
   */
  this.padding_ = null;

  /**
   * @type {anychart.elements.Legend}
   * @private
   */
  this.legend_ = null;

  /**
   * @type {Array.<anychart.elements.Label>}
   * @private
   */
  this.chartLabels_ = [];

  /**
   * @type {boolean}
   * @private
   */
  this.autoResize_ = true;

  this.restoreDefaults();
  this.invalidate(anychart.ConsistencyState.ALL);
  this.resumeSignalsDispatching(false);
};
goog.inherits(anychart.Chart, anychart.VisualBaseWithBounds);


/**
 * Supported consistency states. Adds APPEARANCE to BaseWithBounds states.
 * @type {number}
 */
anychart.Chart.prototype.SUPPORTED_SIGNALS = anychart.VisualBaseWithBounds.prototype.SUPPORTED_SIGNALS;


/**
 * Supported consistency states. Adds BACKGROUND, TITLE and LEGEND to BaseWithBounds states.
 * @type {number}
 */
anychart.Chart.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.VisualBaseWithBounds.prototype.SUPPORTED_CONSISTENCY_STATES |
        anychart.ConsistencyState.LEGEND |
        anychart.ConsistencyState.CHART_LABELS |
        anychart.ConsistencyState.BACKGROUND |
        anychart.ConsistencyState.TITLE;


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
 * @return {anychart.utils.Margin} The current chart margin.
 *//**
 * Setter for the chart margin in pixels using a single value.<br/>
 * @example <t>listingOnly</t>
 * // all margins 15px
 * chart.margin(15);
 * // all margins 15px
 * chart.margin('15px');
 * // top and bottom 5px ,right and left 15px
 * chart.margin( new anychart.utils.Space(5,15) );
 * @param {(string|number|anychart.utils.Space)=} opt_value Value to set.
 * @return {anychart.Chart} An instance of {@link anychart.Chart} class for method chaining.
 *//**
 * Setter for the chart margin in pixels using several numbers.<br/>
 * @example <t>listingOnly</t>
 * // 1) top and bottom 10px, left and right 15px
 * chart.margin(10, '15px');
 * // 2) top 10px, left and right 15px, bottom 5px
 * chart.margin(10, '15px', 5);
 * // 3) top 10px, right 15px, bottom 5px, left 12px
 * chart.margin(10, '15px', '5px', 12);
 * @param {(string|number)=} opt_value1 Top or top-bottom space.
 * @param {(string|number)=} opt_value2 Right or right-left space.
 * @param {(string|number)=} opt_value3 Bottom space.
 * @param {(string|number)=} opt_value4 Left space.
 * @return {anychart.Chart} An instance of {@link anychart.Chart} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(string|number|Object|anychart.utils.Space)=} opt_spaceOrTopOrTopAndBottom .
 * @param {(string|number)=} opt_rightOrRightAndLeft .
 * @param {(string|number)=} opt_bottom .
 * @param {(string|number)=} opt_left .
 * @return {anychart.Chart|anychart.utils.Margin} .
 */
anychart.Chart.prototype.margin = function(opt_spaceOrTopOrTopAndBottom, opt_rightOrRightAndLeft, opt_bottom, opt_left) {
  if (!this.margin_) {
    this.margin_ = new anychart.utils.Margin();
    this.margin_.listenSignals(this.marginInvalidated_, this);
    this.registerDisposable(this.margin_);
  }

  if (arguments.length > 0) {
    if (arguments.length > 1) {
      this.margin_.set.apply(this.margin_, arguments);
    } else if (opt_spaceOrTopOrTopAndBottom instanceof anychart.utils.Space) {
      this.margin_.deserialize(opt_spaceOrTopOrTopAndBottom.serialize());
    } else if (goog.isObject(opt_spaceOrTopOrTopAndBottom)) {
      this.margin_.deserialize(opt_spaceOrTopOrTopAndBottom);
    } else {
      this.margin_.set(opt_spaceOrTopOrTopAndBottom);
    }
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
anychart.Chart.prototype.marginInvalidated_ = function(event) {
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
 * @return {anychart.utils.Padding} Current chart padding.
 *//**
 * Setter for the chart paddings in pixels using a single value.<br/>
 * @example <t>listingOnly</t>
 * // all paddings 15px
 * chart.padding(15);
 * // all paddings 15px
 * chart.padding('15px');
 * // top and bottom 5px ,right and left 15px
 * chart.padding( new anychart.utils.Space(5,15) );
 * @param {(string|number|anychart.utils.Space)=} opt_value Value to set.
 * @return {anychart.Chart} An instance of {@link anychart.Chart} class for method chaining.
 *//**
 * Setter for the chart paddings in pixels using several numbers.<br/>
 * @example <t>listingOnly</t>
 * // 1) top and bottom 10px, left and right 15px
 * chart.padding(10, '15px');
 * // 2) top 10px, left and right 15px, bottom 5px
 * chart.padding(10, '15px', 5);
 * // 3) top 10px, right 15px, bottom 5px, left 12px
 * chart.padding(10, '15px', '5px', 12);
 * @param {(string|number)=} opt_value1 Top or top-bottom space.
 * @param {(string|number)=} opt_value2 Right or right-left space.
 * @param {(string|number)=} opt_value3 Bottom space.
 * @param {(string|number)=} opt_value4 Left space.
 * @return {anychart.Chart} An instance of {@link anychart.Chart} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(string|number|Object|anychart.utils.Space)=} opt_spaceOrTopOrTopAndBottom .
 * @param {(string|number)=} opt_rightOrRightAndLeft .
 * @param {(string|number)=} opt_bottom .
 * @param {(string|number)=} opt_left .
 * @return {anychart.Chart|anychart.utils.Padding} .
 */
anychart.Chart.prototype.padding = function(opt_spaceOrTopOrTopAndBottom, opt_rightOrRightAndLeft, opt_bottom, opt_left) {
  if (!this.padding_) {
    this.padding_ = new anychart.utils.Padding();
    this.padding_.listenSignals(this.paddingInvalidated_, this);
    this.registerDisposable(this.padding_);
  }

  if (arguments.length > 0) {
    if (arguments.length > 1) {
      this.padding_.set.apply(this.padding_, arguments);
    } else if (opt_spaceOrTopOrTopAndBottom instanceof anychart.utils.Padding) {
      this.padding_.deserialize(opt_spaceOrTopOrTopAndBottom.serialize());
    } else if (goog.isObject(opt_spaceOrTopOrTopAndBottom)) {
      this.padding_.deserialize(opt_spaceOrTopOrTopAndBottom);
    } else {
      this.padding_.set(opt_spaceOrTopOrTopAndBottom);
    }
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
anychart.Chart.prototype.paddingInvalidated_ = function(event) {
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
 * @example <t>listingOnly</t>
 * chart.background().stroke('2 green');
 * @return {anychart.elements.Background} The current chart background.
 *//**
 * Setter for the chart background.
 * @example <t>listingOnly</t>
 * var background = new anychart.elements.Background()
 *    .stroke('2 rgb(36,102,177)')
 *    .corners(10)
 *    .fill({
 *           keys: [
 *             "rgb(255,255,255) 1",
 *             "rgb(233,233,233) 1",
 *             "rgb(255,255,255) 1"
 *           ],
 *           angle: -90
 *         });
 * chart.background(background);
 * @param {(anychart.elements.Background)=} opt_value Background object to set.
 * @return {anychart.Chart} An instance of {@link anychart.Chart} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(anychart.elements.Background)=} opt_value .
 * @return {anychart.Chart|anychart.elements.Background} .
 */
anychart.Chart.prototype.background = function(opt_value) {
  if (!this.background_) {
    this.background_ = new anychart.elements.Background();
    this.background_.listenSignals(this.backgroundInvalidated_, this);
    this.registerDisposable(this.background_);
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
anychart.Chart.prototype.backgroundInvalidated_ = function(event) {
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
 * @example <t>listingOnly</t>
 * chart.title().fontSize(41);
 * @return {anychart.elements.Title} The current chart title.
 *//**
 * Setter for the chart title.
 * @example <t>listingOnly</t><c>Simple string</c>
 * chart.title('Conqueror of Naxxramas');
 * @example <t>listingOnly</t><c>Title instance</c>
 * chart.title( new anychart.elements.Title()
 *      .fontColor('red')
 *      .text('Red title')
 * );
 * @param {(string|anychart.elements.Title)=} opt_value Chart title text or title instance for copy settings from.
 * @return {anychart.Chart} An instance of {@link anychart.Chart} for method chaining.
 *//**
 * @ignoreDoc
 * @param {(null|string|Object|anychart.elements.Title)=} opt_value .
 * @return {anychart.elements.Title|anychart.Chart} .
 */
anychart.Chart.prototype.title = function(opt_value) {
  if (!this.title_) {
    this.title_ = new anychart.elements.Title();
    this.title_.listenSignals(this.onTitleSignal_, this);
    this.registerDisposable(this.title_);
  }

  if (goog.isDef(opt_value)) {
    this.suspendSignalsDispatching();
    if (opt_value instanceof anychart.elements.Title) {
      this.title_.deserialize(opt_value.serialize());
    } else if (goog.isObject(opt_value)) {
      this.title_.deserialize(opt_value);
    } else if (anychart.utils.isNone(opt_value)) {
      this.title_.enabled(false);
    }
    this.resumeSignalsDispatching(true);
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
anychart.Chart.prototype.onTitleSignal_ = function(event) {
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
 * Chart legend.
 * @param {(null|string|Object|anychart.elements.Legend)=} opt_value Legend settings.
 * @return {!(anychart.Chart|anychart.elements.Legend)} Chart legend instance of itself for chaining call.
 */
anychart.Chart.prototype.legend = function(opt_value) {
  if (!this.legend_) {
    this.legend_ = new anychart.elements.Legend();
    this.registerDisposable(this.legend_);
    this.legend_.listenSignals(this.onLegendSignal_, this);
  }

  if (goog.isDef(opt_value)) {
    if (opt_value instanceof anychart.elements.Legend) {
      this.legend_.deserialize(opt_value.serialize());
    } else if (goog.isObject(opt_value)) {
      this.legend_.deserialize(opt_value);
    } else if (anychart.utils.isNone(opt_value)) {
      this.legend_.enabled(false);
    }
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
anychart.Chart.prototype.onLegendSignal_ = function(event) {
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
 * Create chart label.
 * @param {(anychart.elements.Label|Object|string|number|null)=} opt_indexOrValue Chart label instance to add.
 * @param {anychart.elements.Label=} opt_value Chart label instance.
 * @return {!(anychart.elements.Label|anychart.Chart)} Chart label instance or itself for chaining call.
 */
anychart.Chart.prototype.chartLabel = function(opt_indexOrValue, opt_value) {
  var index, value;
  if (goog.isNumber(opt_indexOrValue) || (goog.isString(opt_indexOrValue) && !isNaN(+opt_indexOrValue))) {
    index = +opt_indexOrValue;
    value = opt_value;
  } else {
    index = this.chartLabels_.length;
    value = opt_indexOrValue;
  }
  var label = this.chartLabels_[index];
  if (!label) {
    label = new anychart.elements.Label();
    label.text('Chart label');
    this.chartLabels_[index] = label;
    this.registerDisposable(label);
    label.listenSignals(this.onChartLabelSignal_, this);
  }

  if (goog.isDef(value)) {
    if (value instanceof anychart.elements.Label) {
      label.deserialize(value.serialize());
    } else if (goog.isObject(value)) {
      label.deserialize(value);
    } else if (anychart.utils.isNone(value)) {
      label.enabled(false);
    }
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
anychart.Chart.prototype.onChartLabelSignal_ = function(event) {
  this.invalidate(anychart.ConsistencyState.CHART_LABELS, anychart.Signal.NEEDS_REDRAW);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Drawing.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Starts the rendering of the chart into the container.
 * @return {anychart.Chart} An instance of {@link anychart.Chart} class for method chaining.
 */
anychart.Chart.prototype.draw = function() {
  if (!this.checkDrawingNeeded())
    return this;

  this.suspendSignalsDispatching();

  //total chart area bounds, do not override, it can be useful later
  var totalBounds;
  //chart area with applied margin
  var boundsWithoutMargin;
  //chart area with applied margin and padding
  var boundsWithoutPadding;
  // chart area with applied margin, padding and title
  var boundsWithoutTitle;
  // chart area with applied margin, padding, title and legend
  var boundsWithoutLegend;
  //chart content bounds, allocated space for all chart appearance items.
  var contentAreaBounds;


  //create root element only if draw is called
  if (!this.rootElement) this.rootElement = acgraph.layer();

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
      if (this.title().enabled()) this.title_.container(this.rootElement);
    }

    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }
  //end clear container consistency states

  totalBounds = /** @type {!anychart.math.Rect} */(this.pixelBounds());
  boundsWithoutMargin = this.margin().tightenBounds(totalBounds);

  var background = this.background();
  if (this.hasInvalidationState(anychart.ConsistencyState.BACKGROUND | anychart.ConsistencyState.BOUNDS)) {
    background.suspendSignalsDispatching();
    if (!background.container()) background.container(this.rootElement);
    background.pixelBounds(boundsWithoutMargin);
    background.resumeSignalsDispatching(false);
    background.draw();
    this.markConsistent(anychart.ConsistencyState.BACKGROUND);
  }

  boundsWithoutPadding = this.padding().tightenBounds(boundsWithoutMargin);

  var title = this.title();
  if (this.hasInvalidationState(anychart.ConsistencyState.TITLE | anychart.ConsistencyState.BOUNDS)) {
    title.suspendSignalsDispatching();
    title.parentBounds(boundsWithoutPadding);
    title.resumeSignalsDispatching(false);
    title.draw();
    this.markConsistent(anychart.ConsistencyState.TITLE);
  }

  boundsWithoutTitle = title.enabled() ? title.getRemainingBounds() : boundsWithoutPadding;


  var legend = /** @type {anychart.elements.Legend} */(this.legend());
  var legendParentBounds = boundsWithoutTitle;
  if (this.hasInvalidationState(anychart.ConsistencyState.LEGEND | anychart.ConsistencyState.BOUNDS)) {
    legend.suspendSignalsDispatching();
    if (!legend.container() && legend.enabled()) legend.container(this.rootElement);
    legend.parentBounds(legendParentBounds);
    legend.itemsProvider(this.createLegendItemsProvider());
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
      label.suspendSignalsDispatching();
      if (!label.container() && label.enabled()) label.container(this.rootElement);
      label.parentBounds(totalBounds);
      label.resumeSignalsDispatching(false);
      label.draw();
    }
    this.markConsistent(anychart.ConsistencyState.CHART_LABELS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    //can be null if you add chart to tooltip container on hover (Vitalya :) )
    if (this.container() && this.container().getStage()) {
      //listen resize event
      stage = this.container().getStage();
      stage.resize(stage.originalWidth, stage.originalHeight);
      if (this.autoResize_ && this.bounds().dependsOnContainerSize()) {
        this.container().getStage().listen(
            acgraph.vector.Stage.EventType.STAGE_RESIZE,
            this.resizeHandler_,
            false,
            this
        );
      } else {
        this.container().getStage().unlisten(
            acgraph.vector.Stage.EventType.STAGE_RESIZE,
            this.resizeHandler_,
            false,
            this
        );
      }
    }
  }

  //after all chart items drawn, we can clear other states
  this.markConsistent(anychart.ConsistencyState.BOUNDS);

  if (manualSuspend) stage.resume();

  //todo(Anton Saukh): refactor this mess!
  this.listenSignals(this.invalidateHandler_, this);
  //end mess

  this.resumeSignalsDispatching(false);

  this.dispatchDetachedEvent(new anychart.Chart.DrawEvent(this));

  return this;
};


/**
 * Extension point do draw chart content.
 * @param {acgraph.math.Rect} bounds Chart content area bounds.
 */
anychart.Chart.prototype.drawContent = goog.nullFunction;


//----------------------------------------------------------------------------------------------------------------------
//
//  Resize.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Define auto resize settings.
 * @param {boolean=} opt_value
 * @return {!(boolean|anychart.Chart)} Auto resize settings or itself for chaining call.
 */
anychart.Chart.prototype.autoResize = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.autoResize_ != opt_value) {
      this.autoResize_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.autoResize_;
  }
};


/**
 * @param {goog.events.Event} evt
 * @private
 */
anychart.Chart.prototype.resizeHandler_ = function(evt) {
  this.invalidate(anychart.ConsistencyState.ALL,
      anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Remove/Restore.
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.Chart.prototype.remove = function() {
  this.rootElement.parent(null);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Legend.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Create legend items provider specific to chart type.
 * @protected
 * @return {!Array.<anychart.elements.Legend.LegendItemProvider>} Legend items provider.
 */
anychart.Chart.prototype.createLegendItemsProvider = goog.abstractMethod;


//todo(Anton Saukh): refactor this mess!
/**
 * Internal invalidation event handler, redraw chart on all invalidate events.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.Chart.prototype.invalidateHandler_ = function(event) {
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
anychart.Chart.prototype.toJson = function(opt_stringify) {
  return opt_stringify ?
      goog.json.hybrid.stringify(/** @type {!Object} */(this.serialize())) :
      this.serialize();
};


/**
 * Return chart configuration as XML string or XMLNode.
 * @param {boolean=} opt_asXmlNode Return XML as XMLNode.
 * @return {string|Node} Chart configuration.
 */
anychart.Chart.prototype.toXml = function(opt_asXmlNode) {
  return anychart.utils.json2xml(this.serialize(), undefined, opt_asXmlNode);
};


/**
 * @inheritDoc
 */
anychart.Chart.prototype.deserialize = function(config) {
  this.suspendSignalsDispatching();

  goog.base(this, 'deserialize', config);

  var margin = config['margin'];
  var padding = config['padding'];
  var background = config['background'];
  var title = config['title'];
  var legend = config['legend'];

  this.margin(margin);
  this.padding(padding);
  this.background(background);
  this.title(title);
  this.legend(legend);
  this.autoResize(config['autoResize']);

  this.resumeSignalsDispatching(true);

  return this;
};


/**
 * @inheritDoc
 */
anychart.Chart.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');

  json['margin'] = this.margin().serialize();
  json['padding'] = this.padding().serialize();
  json['background'] = this.background().serialize();
  json['title'] = this.title().serialize();
  json['legend'] = this.legend().serialize();
  json['autoResize'] = this.autoResize();

  return json;
};


/**
 * Restore default chart settings.
 */
anychart.Chart.prototype.restoreDefaults = function() {
  this.bounds().set(null, null, null, null);
  this.margin(0);
  this.padding(10, 20);

  var background = /** @type {anychart.elements.Background} */(this.background());
  background.fill(['rgb(255,255,255)', 'rgb(243,243,243)', 'rgb(255,255,255)']);
  background.stroke('none');

  this.title('Chart title');

  var legend = /** @type {anychart.elements.Legend} */(this.legend());
  legend.enabled(false);
  legend.itemsLayout('horizontal');
  legend.position('bottom');
  legend.margin(0, 0, 0, 10);
  legend.align('center');
  legend.fontSize(11);
  legend.fontFamily('Tahoma');
  legend.fontColor('rgb(34,34,34)');

  var legendSeparator = /** @type {anychart.elements.Separator} */(legend.titleSeparator());
  legendSeparator.enabled(false);
  legendSeparator.height(1);
  legendSeparator.fill(['#000000 0', '#000000 1', '#000000 0']);

  var legendTitle = /** @type {anychart.elements.Title} */(legend.title());
  legendTitle.enabled(false);
  legendTitle.text('Legend title');
  legendTitle.fontSize(10);
  legendTitle.fontWeight('bold');
  legendTitle.fontFamily('verdana');
  legendTitle.fontColor('rgb(35,35,35)');

  var legendBackground = /** @type {anychart.elements.Background} */(legend.background());
  legendBackground.fill(['rgb(255,255,255)', 'rgb(243,243,243)', 'rgb(255,255,255)']);
  legendBackground.stroke('rgb(221,221,221)');
};


/**
 * Prints a chart or stage.
 * @param {acgraph.vector.Stage=} opt_stage - Stage to be printed.
 */
anychart.Chart.prototype.print = function(opt_stage) {
  var stage = opt_stage || ((this.container() && this.container().getStage) ? this.container().getStage() : this.rootElement.getStage());

  anychart.utils.PrintHelper.getInstance().print(stage);
};



/**
 * @param {anychart.Chart} chart
 * @constructor
 * @extends {goog.events.Event}
 */
anychart.Chart.DrawEvent = function(chart) {
  goog.base(this, anychart.events.EventType.CHART_DRAW, chart);

  /**
   * @type {anychart.Chart}
   */
  this['chart'] = chart;
};
goog.inherits(anychart.Chart.DrawEvent, goog.events.Event);


//exports
anychart.Chart.prototype['title'] = anychart.Chart.prototype.title;//in docs/final
anychart.Chart.prototype['background'] = anychart.Chart.prototype.background;//in docs/final
anychart.Chart.prototype['margin'] = anychart.Chart.prototype.margin;//in docs/final
anychart.Chart.prototype['padding'] = anychart.Chart.prototype.padding;//in docs/final
anychart.Chart.prototype['legend'] = anychart.Chart.prototype.legend;
anychart.Chart.prototype['chartLabel'] = anychart.Chart.prototype.chartLabel;
anychart.Chart.prototype['draw'] = anychart.Chart.prototype.draw;//in docs/final
anychart.Chart.prototype['toJson'] = anychart.Chart.prototype.toJson;
anychart.Chart.prototype['toXml'] = anychart.Chart.prototype.toXml;
