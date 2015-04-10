goog.provide('anychart.core.ui.Legend');
goog.require('acgraph');
goog.require('anychart.core.Text');
goog.require('anychart.core.ui.Background');
goog.require('anychart.core.ui.LegendItem');
goog.require('anychart.core.ui.Paginator');
goog.require('anychart.core.ui.Separator');
goog.require('anychart.core.ui.Title');
goog.require('anychart.core.ui.Tooltip');
goog.require('anychart.core.utils.Margin');
goog.require('anychart.core.utils.Padding');
goog.require('anychart.enums');
goog.require('anychart.math.Rect');
goog.require('anychart.utils');
goog.require('goog.array');
goog.require('goog.object');



/**
 * Legend element.
 * @constructor
 * @extends {anychart.core.Text}
 */
anychart.core.ui.Legend = function() {
  goog.base(this);

  /**
   * Position of the legend.
   * @type {anychart.enums.Orientation}
   * @private
   */
  this.position_ = anychart.enums.Orientation.BOTTOM;

  /**
   * Align of the legend.
   * @type {anychart.enums.Align}
   * @private
   */
  this.align_ = anychart.enums.Align.CENTER;

  /**
   * Spacing between items.
   * @type {number}
   * @private
   */
  this.itemsSpacing_ = 15;

  /**
   * Spacing between icon and text in legend item.
   * @type {number}
   * @private
   */
  this.iconTextSpacing_ = 5;

  /**
   * Width of legend element.
   * @type {?(number|string)}
   * @private
   */
  this.width_ = null;

  /**
   * Height of legend element.
   * @type {?(number|string)}
   * @private
   */
  this.height_ = null;

  /**
   * Default layout of legend.
   * @type {anychart.enums.Layout}
   * @private
   */
  this.itemsLayout_ = anychart.enums.Layout.HORIZONTAL;

  /**
   * Wrapped legend items.
   * @type {Array.<anychart.core.ui.LegendItem>}
   * @private
   */
  this.items_ = null;

  /**
   * Layer that containts legend items.
   * @type {acgraph.vector.Layer}
   * @private
   */
  this.layer_ = null;

  this.drawedPage_ = NaN;

  this.fontFamily('Verdana')
    .fontSize('10')
    .fontWeight('normal')
    .fontColor('rgb(35,35,35)')
      // we need LegendItem text could catch mouseover and mouseclick
      // (cause elements.Text turns disablePointerEvents() on with non-hoverable text)
    .disablePointerEvents(false)
    .padding(7)
    .margin(5);

  this.background()
      .enabled(true)
      .fill(/** @type {acgraph.vector.LinearGradientFill} */({
        'keys': [
          '0 rgb(255,255,255) 1',
          '0.5 rgb(243,243,243) 1',
          '1 rgb(255,255,255) 1'],
        'angle': '90'
      }))
      .stroke({
        'keys': [
          '0 rgb(221,221,221) 1',
          '1 rgb(208,208,208) 1'
        ],
        'angle': '90'
      })
      .corners(5)
      .zIndex(0);
  //
  this.title()
    .enabled(true)
    .zIndex(10)
    .text('Legend Title')
    .fontFamily('Verdana')
    .fontSize('10')
    .fontWeight('bold')
    .fontColor('rgb(35,35,35)')
    .orientation('top')
    .margin(0, 0, 3, 0)
    .padding(0);
  this.title().background()
    .enabled(false)
    .stroke({
        'keys': [
          '0 #DDDDDD 1',
          '1 #D0D0D0 1'
        ],
        'angle': '90'
      })
    .fill({
        'keys': [
          '0 #FFFFFF 1',
          '0.5 #F3F3F3 1',
          '1 #FFFFFF 1'
        ],
        'angle': '90'
      });

  this.titleSeparator()
    .enabled(true)
    .zIndex(10)
    .margin(3, 0, 3, 0)
    .orientation('top')
    .width('100%')
    .height(1)
    .fill({
        'keys': [
          '0 #333333 0',
          '0.5 #333333 1',
          '1 #333333 0'
        ]
      });
  this.paginator()
    .enabled(false)
    .zIndex(30) // data item layer have zIndex: 20, paginator should be over than item data layer
    .fontFamily('Verdana')
    .fontSize('10')
    .fontWeight('normal')
    .fontColor('rgb(35,35,35)')
    .orientation('right')
    .margin(0)
    .padding(0);
  this.paginator().background()
    .enabled(false)
    .stroke({
        'keys': [
          '0 #DDDDDD 1',
          '1 #D0D0D0 1'
        ],
        'angle': '90'
      })
    .fill({
        'keys': [
          '0 #FFFFFF 1',
          '0.5 #F3F3F3 1',
          '1 #FFFFFF 1'
        ],
        'angle': '90'
      });

  var tooltip = /** @type {anychart.core.ui.Tooltip} */(this.tooltip());
  tooltip.suspendSignalsDispatching();
  tooltip.isFloating(true);
  tooltip.resumeSignalsDispatching(false);

  var tooltipTitle = /** @type {anychart.core.ui.Title} */(tooltip.title());
  tooltipTitle.enabled(false);
  tooltipTitle.padding(0);
  tooltipTitle.margin(3, 3, 0, 3);

  this.inverted(false);
  this.items(null);
  this.itemsSourceMode(anychart.enums.LegendItemsSourceMode.DEFAULT);
  this.itemsFormatter(function(items) {
    return items;
  });

  /**
   * Legend items text formatter.
   * @type {?Function}
   * @private
   */
  this.itemsTextFormatter_ = null;

  /**
   * Flag that shows what we need: true - create items, false - update them.
   * @type {boolean}
   * @private
   */
  this.recreateItems_ = true;

  /**
   * Hover cursor setting.
   * @type {anychart.enums.Cursor}
   * @private
   */
  this.hoverCursor_ = anychart.enums.Cursor.POINTER;

  this.invalidate(anychart.ConsistencyState.ALL);
};
goog.inherits(anychart.core.ui.Legend, anychart.core.Text);


/**
 * Supported signals.
 * @type {number}
 */
anychart.core.ui.Legend.prototype.SUPPORTED_SIGNALS = anychart.core.Text.prototype.SUPPORTED_SIGNALS; // NEEDS_REDRAW BOUNDS_CHANGED


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.ui.Legend.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.Text.prototype.SUPPORTED_CONSISTENCY_STATES |  // ENABLED CONTAINER Z_INDEX APPEARANCE BOUNDS
    anychart.ConsistencyState.LEGEND_BACKGROUND |
    anychart.ConsistencyState.LEGEND_TITLE |
    anychart.ConsistencyState.LEGEND_SEPARATOR |
    anychart.ConsistencyState.LEGEND_PAGINATOR;


/**
 * Sets items layout.
 * @param {string=} opt_value Layout type for legend items.
 * @return {(anychart.enums.Layout|anychart.core.ui.Legend)} Items layout or self for method chaining.
 */
anychart.core.ui.Legend.prototype.itemsLayout = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeLayout(opt_value, this.itemsLayout_);
    if (this.itemsLayout_ != opt_value) {
      this.itemsLayout_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.itemsLayout_;
};


/**
 * Getter/setter for inverted setting.
 * @param {boolean=} opt_value Whether item list should be inverted or not.
 * @return {(boolean|anychart.core.ui.Legend)} Whether item list inverted or not or self for chaining.
 */
anychart.core.ui.Legend.prototype.inverted = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = !!opt_value;
    if (this.inverted_ != opt_value) {
      this.inverted_ = opt_value;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.inverted_;
};


/**
 * Getter/setter for custom items.
 * @param {?Array.<Object>=} opt_value Items.
 * @return {(?Array.<Object>|anychart.core.ui.Legend)} Custom items or self for chaining.
 */
anychart.core.ui.Legend.prototype.items = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.customItems_ != opt_value) {
      this.customItems_ = opt_value;
      this.recreateItems_ = true;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.customItems_;
};


/**
 * .
 * @param {Array.<Object>} sourceArray Array of source.
 * @return {boolean} .
 * @private
 */
anychart.core.ui.Legend.prototype.sourceEquals_ = function(sourceArray) {
  if (!this.itemsSource_ || !sourceArray || (this.itemsSource_.length != sourceArray.length))
    return false;

  for (var i = 0; i < sourceArray.length; i++) {
    if (this.itemsSource_[i] != sourceArray[i])
      return false;
  }

  return true;
};


/**
 * Getter/setter for items source.
 * @param {(anychart.core.SeparateChart|Array.<anychart.core.SeparateChart>)=} opt_value Items source.
 * @return {(anychart.core.SeparateChart|Array.<anychart.core.SeparateChart>|anychart.core.ui.Legend)} Items source or self for chaining.
 */
anychart.core.ui.Legend.prototype.itemsSource = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = goog.isArray(opt_value) ?
        goog.array.slice(/** @type {Array.<anychart.core.SeparateChart>} */ (opt_value), 0) :
        goog.isNull(opt_value) ?
            opt_value : [opt_value];
    if (!this.sourceEquals_(opt_value)) {
      this.itemsSource_ = opt_value;
      this.recreateItems_ = true;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.itemsSource_;
};


/**
 * Getter/setter for items source mode.
 * @param {string=} opt_value Items source mode.
 * @return {(string|anychart.core.ui.Legend)} Items source mode or self for chaining.
 */
anychart.core.ui.Legend.prototype.itemsSourceMode = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeLegendItemsSourceMode(opt_value);
    if (this.itemsSourceMode_ != opt_value) {
      this.itemsSourceMode_ = opt_value;
      this.recreateItems_ = true;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.itemsSourceMode_;
};


/**
 * Getter/setter for items formatter
 * @param {function(Array.<Object>):Array.<Object>=} opt_value Formatter function.
 * @return {(function(Array.<Object>):Array.<Object>|anychart.core.ui.Legend)} Formatter function or self for chaining.
 */
anychart.core.ui.Legend.prototype.itemsFormatter = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.itemsFormatter_ != opt_value) {
      this.itemsFormatter_ = opt_value;
      this.recreateItems_ = true;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
  }
  return this.itemsFormatter_;
};


/**
 * Getter/setter for items text formatter.
 * @param {function(Object):string=} opt_value Items text formatter function.
 * @return {(function(Object):string|anychart.core.ui.Legend)} Items text formatter function or self for chaining.
 */
anychart.core.ui.Legend.prototype.itemsTextFormatter = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.itemsTextFormatter_ != opt_value) {
      this.itemsTextFormatter_ = opt_value;
      this.recreateItems_ = true;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
  }
  return this.itemsTextFormatter_;
};


/**
 * Getter for items spacing setting.
 * @return {(string|number)} Items spacing setting.
 *//**
 * Setter for items spacing setting.
 * @param {(string|number)=} opt_value Value to set.
 * @return {!anychart.core.ui.Legend} An instance of the {@link anychart.core.ui.Legend} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(string|number)=} opt_value Value of spacing between legend items.
 * @return {(string|number|anychart.core.ui.Legend)} Items spacing setting or self for method chaining.
 */
anychart.core.ui.Legend.prototype.itemsSpacing = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = !isNaN(parseFloat(opt_value)) ? opt_value : 15;
    if (this.itemsSpacing_ != opt_value) {
      this.itemsSpacing_ = parseFloat(opt_value);
      this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.itemsSpacing_;
};


/**
 * Getter for spacing between icon and text in legend item.
 * @return {number} Spacing setting.
 *//**
 * Setter for spacing between icon and text in legend item.
 * @param {(string|number)=} opt_value Spacing setting.
 * @return {!anychart.core.ui.Legend} An instance of the {@link anychart.core.ui.Legend} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(string|number)=} opt_value Spacing setting.
 * @return {(number|anychart.core.ui.Legend)} Spacing setting or self for method chaining.
 */
anychart.core.ui.Legend.prototype.iconTextSpacing = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = !anychart.utils.isNaN(opt_value) ? +opt_value : 5;
    if (this.iconTextSpacing_ != opt_value) {
      this.iconTextSpacing_ = opt_value;
      if (goog.isDefAndNotNull(this.items_)) {
        for (var i = 0, len = this.items_.length; i < len; i++) {
          this.items_[i].iconTextSpacing(this.iconTextSpacing_);
        }
      }
      this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.iconTextSpacing_;
};


/**
 * Legend margin setting.
 * @param {(string|number|Array.<number|string>|{top:(number|string),left:(number|string),bottom:(number|string),right:(number|string)})=} opt_spaceOrTopOrTopAndBottom Space object or top or top and bottom
 *    space.
 * @param {(string|number)=} opt_rightOrRightAndLeft Right or right and left space.
 * @param {(string|number)=} opt_bottom Bottom space.
 * @param {(string|number)=} opt_left Left space.
 * @return {!(anychart.core.ui.Legend|anychart.core.utils.Margin)} Margin or self for method chaining.
 */
anychart.core.ui.Legend.prototype.margin = function(opt_spaceOrTopOrTopAndBottom, opt_rightOrRightAndLeft, opt_bottom, opt_left) {
  if (!this.margin_) {
    this.margin_ = new anychart.core.utils.Margin();
    this.registerDisposable(this.margin_);
    this.margin_.listenSignals(this.boundsInvalidated_, this);
  }
  if (goog.isDef(opt_spaceOrTopOrTopAndBottom)) {
    this.margin_.setup.apply(this.margin_, arguments);
    return this;
  }
  return this.margin_;
};


/**
 * Listener for bounds invalidation.
 * @param {anychart.SignalEvent} event Invalidation event.
 * @private
 */
anychart.core.ui.Legend.prototype.boundsInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.BOUNDS,
        anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
  }
};


/**
 * Legend padding setting.
 * @param {(string|number|Array.<number|string>|{top:(number|string),left:(number|string),bottom:(number|string),right:(number|string)})=} opt_spaceOrTopOrTopAndBottom Space object or top or top and bottom
 *    space.
 * @param {(string|number)=} opt_rightOrRightAndLeft Right or right and left space.
 * @param {(string|number)=} opt_bottom Bottom space.
 * @param {(string|number)=} opt_left Left space.
 * @return {!(anychart.core.ui.Legend|anychart.core.utils.Padding)} Padding or self for method chaining.
 */
anychart.core.ui.Legend.prototype.padding = function(opt_spaceOrTopOrTopAndBottom, opt_rightOrRightAndLeft, opt_bottom, opt_left) {
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
 * Getter for legend background.
 * @return {!anychart.core.ui.Background} Background or self for method chaining.
 *//**
 * Setter for legend background.
 * @param {(string|Object|null|boolean)=} opt_value Background setting.
 * @return {!anychart.core.ui.Legend} An instance of the {@link anychart.core.ui.Legend} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(string|Object|null|boolean)=} opt_value Background setting.
 * @return {!(anychart.core.ui.Legend|anychart.core.ui.Background)} Background or self for method chaining.
 */
anychart.core.ui.Legend.prototype.background = function(opt_value) {
  if (!this.background_) {
    this.background_ = new anychart.core.ui.Background();
    this.registerDisposable(this.background_);
    this.background_.listenSignals(this.backgroundInvalidated_, this);
  }

  if (goog.isDef(opt_value)) {
    this.background_.setup(opt_value);
    return this;
  } else {
    return this.background_;
  }
};


/**
 * Background invalidation handler.
 * @param {anychart.SignalEvent} event Event.
 * @private
 */
anychart.core.ui.Legend.prototype.backgroundInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    this.invalidate(anychart.ConsistencyState.LEGEND_BACKGROUND, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Getter for legend title.
 * @return {!anychart.core.ui.Title} Title settings.
 *//**
 * Setter for legend title.<br/>
 * <b>Note:</b> to turn title off you have to send null or 'none'.
 * @param {(null|boolean|Object|string)=} opt_value Value to set.
 * @return {!anychart.core.ui.Legend} An instance of the {@link anychart.core.ui.Legend} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(null|boolean|Object|string)=} opt_value Title to set.
 * @return {!(anychart.core.ui.Title|anychart.core.ui.Legend)} Title or self for method chaining.
 */
anychart.core.ui.Legend.prototype.title = function(opt_value) {
  if (!this.title_) {
    this.title_ = new anychart.core.ui.Title();
    this.registerDisposable(this.title_);
    this.title_.listenSignals(this.titleInvalidated_, this);
  }

  if (goog.isDef(opt_value)) {
    this.title_.setup(opt_value);
    return this;
  } else {
    return this.title_;
  }
};


/**
 * Title invalidation handler.
 * @param {anychart.SignalEvent} event Event.
 * @private
 */
anychart.core.ui.Legend.prototype.titleInvalidated_ = function(event) {
  var state = 0;
  var signal = 0;
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    state |= anychart.ConsistencyState.LEGEND_TITLE;
    signal |= anychart.Signal.NEEDS_REDRAW;
  }
  if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    state |= anychart.ConsistencyState.BOUNDS;
    signal |= anychart.Signal.BOUNDS_CHANGED;
  }
  // If there are no signals, the state == 0 and nothing happens.
  this.invalidate(state, signal);
};


/**
 * Getter for title separator setting.
 * @return {!anychart.core.ui.Separator} Current settings.
 *//**
 * Setter for title separator setting.<br/>
 * <b>Note:</b> To turn off titleSeparatoryou have to send null or 'none'.
 * @param {(Object|boolean|null)=} opt_value Value to set.
 * @return {!anychart.core.ui.Legend} An instance of the {@link anychart.core.ui.Legend} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(Object|boolean|null)=} opt_value Separator setting.
 * @return {!(anychart.core.ui.Separator|anychart.core.ui.Legend)} Separator setting or self for method chaining.
 */
anychart.core.ui.Legend.prototype.titleSeparator = function(opt_value) {
  if (!this.titleSeparator_) {
    this.titleSeparator_ = new anychart.core.ui.Separator();
    this.registerDisposable(this.titleSeparator_);
    this.titleSeparator_.listenSignals(this.titleSeparatorInvalidated_, this);
  }

  if (goog.isDef(opt_value)) {
    this.titleSeparator_.setup(opt_value);
    return this;
  } else {
    return this.titleSeparator_;
  }
};


/**
 * Internal title separator invalidation handler.
 * @param {anychart.SignalEvent} event Event.
 * @private
 */
anychart.core.ui.Legend.prototype.titleSeparatorInvalidated_ = function(event) {
  var state = 0;
  var signal = 0;
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    state |= anychart.ConsistencyState.LEGEND_SEPARATOR;
    signal |= anychart.Signal.NEEDS_REDRAW;
  }
  if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    state |= anychart.ConsistencyState.BOUNDS;
    signal |= anychart.Signal.BOUNDS_CHANGED;
  }
  // If there are no signals, state == 0 and nothing happens.
  this.invalidate(state, signal);
};


/**
 * Getter for paginator setting.
 * @return {!anychart.core.ui.Paginator} Current settings.
 *//**
 * Setter for paginator setting.<br/>
 * <b>Note:</b> To turn Paginator off you need to send null or 'none'.
 * @param {(Object|boolean|null)=} opt_value Value to set.
 * @return {!anychart.core.ui.Legend} An instance of the {@link anychart.core.ui.Legend} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(Object|boolean|null)=} opt_value Paginator to set.
 * @return {!(anychart.core.ui.Paginator|anychart.core.ui.Legend)} Paginator or self for method chaining.
 */
anychart.core.ui.Legend.prototype.paginator = function(opt_value) {
  if (!this.paginator_) {
    this.paginator_ = new anychart.core.ui.Paginator();
    this.registerDisposable(this.paginator_);
    this.paginator_.listenSignals(this.paginatorInvalidated_, this);
  }

  if (goog.isDef(opt_value)) {
    this.paginator_.setup(opt_value);
    return this;
  } else {
    return this.paginator_;
  }
};


/**
 * Internal paginator invalidation handler.
 * @param {anychart.SignalEvent} event Event.
 * @private
 */
anychart.core.ui.Legend.prototype.paginatorInvalidated_ = function(event) {
  var state = 0;
  var signal = 0;
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    state |= anychart.ConsistencyState.LEGEND_PAGINATOR;
    signal |= anychart.Signal.NEEDS_REDRAW;
  }
  if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    state |= anychart.ConsistencyState.BOUNDS;
    signal |= anychart.Signal.BOUNDS_CHANGED;
  }
  // If there are no signals, state == 0 and nothing happens.
  this.invalidate(state, signal);
};


/**
 * Legend tooltip.
 * @param {(Object|boolean|null)=} opt_value Tooltip settings.
 * @return {!(anychart.core.ui.Legend|anychart.core.ui.Tooltip)} Tooltip instance or self for method chaining.
 */
anychart.core.ui.Legend.prototype.tooltip = function(opt_value) {
  if (!this.tooltip_) {
    this.tooltip_ = new anychart.core.ui.Tooltip();
    this.registerDisposable(this.tooltip_);
    this.tooltip_.listenSignals(this.onTooltipSignal_, this);
  }
  if (goog.isDef(opt_value)) {
    this.tooltip_.setup(opt_value);
    return this;
  } else {
    return this.tooltip_;
  }
};


/**
 * Tooltip invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.core.ui.Legend.prototype.onTooltipSignal_ = function(event) {
  var tooltip = /** @type {anychart.core.ui.Tooltip} */(this.tooltip());
  tooltip.redraw();
};


/**
 * Show data point tooltip.
 * @protected
 * @param {goog.events.BrowserEvent} event Event that initiates tooltip display.
 */
anychart.core.ui.Legend.prototype.showTooltip = function(event) {
  this.moveTooltip(event);
};


/**
 * Hide data point tooltip.
 * @protected
 */
anychart.core.ui.Legend.prototype.hideTooltip = function() {
  var tooltip = /** @type {anychart.core.ui.Tooltip} */(this.tooltip());
  tooltip.hide();
};


/**
 * @protected
 * @param {goog.events.BrowserEvent} event that initiates tooltip display.
 */
anychart.core.ui.Legend.prototype.moveTooltip = function(event) {
  var tooltip = /** @type {anychart.core.ui.Tooltip} */(this.tooltip());
  var index = event['index'];
  var item = event['item'];
  var formatProvider = {
    'value': item.text(),
    'iconType': item.iconType(),
    'iconStroke': item.iconStroke(),
    'iconFill': item.iconFill(),
    'iconHatchFill': item.iconHatchFill(),
    'iconMarkerType': item.iconMarkerType(),
    'iconMarkerStroke': item.iconMarkerStroke(),
    'iconMarkerFill': item.iconMarkerFill(),
    'meta': this.legendItemsMeta_[index]
  };
  if (tooltip.isFloating() && event) {
    tooltip.show(
        formatProvider,
        new acgraph.math.Coordinate(event.clientX, event.clientY));
  } else {
    tooltip.show(
        formatProvider,
        new acgraph.math.Coordinate(0, 0));
  }
};


/**
 * Getter for legend width.
 * @return {number|string|null} Current width.
 *//**
 * Setter for legend width.
 * @param {(number|string|null)=} opt_value Value to set.
 * @return {!anychart.core.ui.Legend} An instance of the {@link anychart.core.ui.Legend} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(number|string|null)=} opt_value .
 * @return {!anychart.core.ui.Legend|number|string|null} .
 */
anychart.core.ui.Legend.prototype.width = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.width_ != opt_value) {
      this.width_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS | anychart.ConsistencyState.LEGEND_BACKGROUND,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.width_;
};


/**
 * Getter for legend height.
 * @return {number|string|null} Current height.
 *//**
 * Setter for legend height.
 * @param {(number|string|null)=} opt_value Value to set.
 * @return {!anychart.core.ui.Legend} An instance of the {@link anychart.core.ui.Legend} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(number|string|null)=} opt_value .
 * @return {!anychart.core.ui.Legend|number|string|null} .
 */
anychart.core.ui.Legend.prototype.height = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.height_ != opt_value) {
      this.height_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS | anychart.ConsistencyState.LEGEND_BACKGROUND,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.height_;
};


//todo Need rename. Orientation or Position (blackart)
/**
 * Getter for legend position setting.
 * @return {anychart.enums.Orientation} Legend position.
 *//**
 * Setter for legend position setting.
 * @param {(anychart.enums.Orientation|string)=} opt_value Legend position.
 * @return {!anychart.core.ui.Legend} An instance of the {@link anychart.core.ui.Legend} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(anychart.enums.Orientation|string)=} opt_value Legend position.
 * @return {(anychart.enums.Orientation|anychart.core.ui.Legend)} Legend position or self for method chaining.
 */
anychart.core.ui.Legend.prototype.position = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeOrientation(opt_value);
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
 * Getter for legend align setting.
 * @return {anychart.enums.Align} Legend align.
 *//**
 * Setter for legend align setting.
 * @param {(anychart.enums.Align|string)=} opt_value Value to set.
 * @return {!anychart.core.ui.Legend} An instance of the {@link anychart.core.ui.Legend} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(anychart.enums.Align|string)=} opt_value Legend align.
 * @return {(anychart.enums.Align|anychart.core.ui.Legend)} Legend align or self for chaining.
 */
anychart.core.ui.Legend.prototype.align = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeAlign(opt_value);
    if (this.align_ != opt_value) {
      this.align_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.align_;
  }
};


/**
 *
 * @return {!anychart.math.Rect} Bounds that remain after legend.
 */
anychart.core.ui.Legend.prototype.getRemainingBounds = function() {
  if (!this.pixelBounds_ || this.hasInvalidationState(anychart.ConsistencyState.BOUNDS))
    this.calculateBounds_();
  /** @type {!anychart.math.Rect} */
  var parentBounds = /** @type {anychart.math.Rect} */(this.parentBounds()) || anychart.math.rect(0, 0, 0, 0);

  if (!this.enabled()) return parentBounds;

  switch (this.position_) {
    case anychart.enums.Orientation.TOP:
      parentBounds.top += this.pixelBounds_.height;
      parentBounds.height -= this.pixelBounds_.height;
      break;
    case anychart.enums.Orientation.RIGHT:
      parentBounds.width -= this.pixelBounds_.width;
      break;
    default:
    case anychart.enums.Orientation.BOTTOM:
      parentBounds.height -= this.pixelBounds_.height;
      break;
    case anychart.enums.Orientation.LEFT:
      parentBounds.left += this.pixelBounds_.width;
      parentBounds.width -= this.pixelBounds_.width;
      break;
  }

  return parentBounds;
};


/**
 * Init items.
 * @private
 * @return {Array.<Object>}
 */
anychart.core.ui.Legend.prototype.createItemsFromSource_ = function() {
  if (goog.isArray(this.customItems_))
    return this.customItems_;
  else if (goog.isDefAndNotNull(this.itemsSource_)) {
    var source;
    var items = [];
    for (var i = 0; i < this.itemsSource_.length; i++) {
      source = /** @type {anychart.core.SeparateChart} */ (this.itemsSource_[i]);
      if (!goog.isNull(source))
        items = goog.array.concat(items, source.createLegendItemsProvider(this.itemsSourceMode_, this.itemsTextFormatter_));
    }
    return items;
  } else
    return [];
};


/**
 * Prepare items to initialization.
 * @param {!Array.<Object>} items Items.
 * @return {!Array.<Object>} Items prepared to initialization.
 * @private
 */
anychart.core.ui.Legend.prototype.prepareItems_ = function(items) {
  if (!goog.isArray(items))
    return [];
  var itemList = [];
  var config;
  var textSettings = /** @type {Object} */ (this.textSettings());
  for (var i = 0; i < items.length; i++) {
    config = {
      'iconTextSpacing': this.iconTextSpacing_,
      'hoverCursor': this.hoverCursor_
    };
    goog.object.extend(config, textSettings, items[i]);
    itemList.push(config);
  }
  return itemList;
};


/**
 * Init items.
 * @param {!Array.<Object>} items Array of items.
 * @private
 */
anychart.core.ui.Legend.prototype.initializeLegendItems_ = function(items) {
  /** @type {anychart.core.ui.LegendItem} */
  var item;
  var i;
  /**
   * Items that were disabled by one of legendItem(null), legendItem(false), legendItem().enabled(false)
   * @type {Object.<number, boolean>}
   * @private
   */
  this.notEnabledItems_ = {};
  if (!this.recreateItems_ && this.items_) {
    for (i = 0; i < items.length; i++) {
      if (goog.isDef(items[i]['enabled']) && !items[i]['enabled'])
        this.notEnabledItems_[i] = true;
      for (var j = 0; j < this.items_.length; j++) {
        item = this.items_[j];
        var itemSourceUid = item.sourceUid();
        var itemSourceKey = item.sourceKey();
        if ((goog.isDef(itemSourceUid) && goog.isDef(itemSourceKey) && itemSourceUid == items[i]['sourceUid'] && itemSourceKey == items[i]['sourceKey'])) {
          item.setup(items[i]);
          item.applyTextSettings(item.getTextElement(), false);
          break;
        }
      }
    }
  } else if (items && items.length > 0) {
    goog.disposeAll(this.items_);
    /**
     * Array of legend item.
     * @type {Array.<anychart.core.ui.LegendItem>}
     * @private
     */
    this.items_ = [];
    /**
     * Array of legend items metadata. Used for legend item tooltips.
     * @type {Array.<Object>}
     * @private
     */
    this.legendItemsMeta_ = [];
    for (i = 0; i < items.length; i++) {
      if (goog.isDef(items[i]['enabled']) && !items[i]['enabled'])
        this.notEnabledItems_[i] = true;
      item = this.createItem();
      item.container(this.layer_);
      items[i]['enabled'] = false;
      item.setup(items[i]);
      item.applyTextSettings(item.getTextElement(), true);

      this.setupMouseEventsListeners_(item);

      this.items_.push(item);
      this.legendItemsMeta_.push(items[i]['meta'] ? items[i]['meta'] : {});
    }
  } else {
    goog.disposeAll(this.items_);
    this.items_ = null;
    this.legendItemsMeta_ = null;
  }
  this.recreateItems_ = false;
  this.invalidate(anychart.ConsistencyState.BOUNDS);
};


/**
 * @protected
 * @return {anychart.core.ui.LegendItem}
 */
anychart.core.ui.Legend.prototype.createItem = function() {
  return new anychart.core.ui.LegendItem();
};


/**
 * Setup listening of mouse events on legend item.
 * @param {anychart.core.ui.LegendItem} item
 * @private
 */
anychart.core.ui.Legend.prototype.setupMouseEventsListeners_ = function(item) {
  acgraph.events.listen(item, anychart.enums.EventType.LEGEND_ITEM_MOUSE_OVER, this.onLegendItemMouseOver_, false, this);
  acgraph.events.listen(item, anychart.enums.EventType.LEGEND_ITEM_MOUSE_OUT, this.onLegendItemMouseOut_, false, this);
  acgraph.events.listen(item, anychart.enums.EventType.LEGEND_ITEM_MOUSE_MOVE, this.onLegendItemMouseMove_, false, this);
  acgraph.events.listen(item, anychart.enums.EventType.LEGEND_ITEM_CLICK, this.onLegendItemClick_, false, this);
};


/**
 * Returns index of legend item that dispatched an event.
 * @param {anychart.core.ui.LegendItem} item Event.
 * @private
 * @return {number} Item index in legend or NaN.
 */
anychart.core.ui.Legend.prototype.getItemIndexInLegend_ = function(item) {
  return parseInt(goog.object.findKey(this.items_, function(value, key, obj) {
    return item == value;
  }), 10);
};


/**
 * Getter/Setter for hover cursor setting.
 * @param {anychart.enums.Cursor=} opt_value hover cursor setting.
 * @return {(anychart.enums.Cursor|anychart.core.ui.Legend)} Hover cursor setting or self for chaining.
 */
anychart.core.ui.Legend.prototype.hoverCursor = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeCursor(opt_value);
    if (this.hoverCursor_ != opt_value) {
      this.hoverCursor_ = opt_value;
      if (goog.isDefAndNotNull(this.items_)) {
        for (var i = 0, len = this.items_.length; i < len; i++) {
          this.items_[i].hoverCursor(this.hoverCursor_);
        }
      }
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
      return this;
    }
  }
  return this.hoverCursor_;
};


/**
 * LegendItem click handler.
 * @param {anychart.core.ui.LegendItem.BrowserEvent} event Event.
 * @private
 */
anychart.core.ui.Legend.prototype.onLegendItemClick_ = function(event) {
  var item = /** @type {anychart.core.ui.LegendItem} */(/** @type {Object} */ (event.target));
  // save index of legend item and itself to event and dispatch event
  event['index'] = this.getItemIndexInLegend_(item);
  event['item'] = item;
  if (this.dispatchEvent(event)) {
    if (this.itemsSource_) {
      for (var i = 0; i < this.itemsSource_.length; i++) {
        var source = /** @type {anychart.core.SeparateChart} */ (this.itemsSource_[i]);
        if (goog.getUid(source) == item.sourceUid() && source.legendItemCanInteractInMode(this.itemsSourceMode_)) {
          source.legendItemClick(item);
          break;
        }
      }
    }
  }
};


/**
 * LegendItem mouse over handler.
 * @param {anychart.core.ui.LegendItem.BrowserEvent} event Event.
 * @private
 */
anychart.core.ui.Legend.prototype.onLegendItemMouseOver_ = function(event) {
  var item = /** @type {anychart.core.ui.LegendItem} */(/** @type {Object} */ (event.target));
  // save index of legend item and itself to event and dispatch event
  event['index'] = this.getItemIndexInLegend_(item);
  event['item'] = item;
  if (this.dispatchEvent(event)) {
    if (this.itemsSource_) {
      for (var i = 0; i < this.itemsSource_.length; i++) {
        var source = /** @type {anychart.core.SeparateChart} */ (this.itemsSource_[i]);
        if (goog.getUid(source) == item.sourceUid() && source.legendItemCanInteractInMode(this.itemsSourceMode_)) {
          source.legendItemOver(item);
          break;
        }
      }
    }
    this.showTooltip(event);
  }
};


/**
 * LegendItem mouse out handler.
 * @param {anychart.core.ui.LegendItem.BrowserEvent} event Event.
 * @private
 */
anychart.core.ui.Legend.prototype.onLegendItemMouseOut_ = function(event) {
  var item = /** @type {anychart.core.ui.LegendItem} */(/** @type {Object} */ (event.target));
  // save index of legend item and itself to event and dispatch event
  event['index'] = this.getItemIndexInLegend_(item);
  event['item'] = item;
  if (this.dispatchEvent(event)) {
    if (this.itemsSource_) {
      for (var i = 0; i < this.itemsSource_.length; i++) {
        var source = /** @type {anychart.core.SeparateChart} */ (this.itemsSource_[i]);
        if (goog.getUid(source) == item.sourceUid() && source.legendItemCanInteractInMode(this.itemsSourceMode_)) {
          source.legendItemOut(item);
          break;
        }
      }
    }
    this.hideTooltip();
  }
};


/**
 * LegendItem mouse move handler.
 * @param {anychart.core.ui.LegendItem.BrowserEvent} event Event.
 * @private
 */
anychart.core.ui.Legend.prototype.onLegendItemMouseMove_ = function(event) {
  var item = /** @type {anychart.core.ui.LegendItem} */(/** @type {Object} */ (event.target));
  // save index of legend item and itself to event and dispatch event
  event['index'] = this.getItemIndexInLegend_(item);
  event['item'] = item;
  if (this.dispatchEvent(event)) {
    this.moveTooltip(event);
  }
};


/**
 * Calculates legend width.
 * @return {number} Calculated width.
 * @private
 */
anychart.core.ui.Legend.prototype.calculateContentWidth_ = function() {
  if (!goog.isDefAndNotNull(this.items_)) return 0;
  var fullWidth = 0;
  var width = 0;
  var maxWidth = -Number.MAX_VALUE;

  for (var i = 0, len = this.items_.length; i < len; i++) {
    if (i in this.notEnabledItems_)
      continue;
    width = this.items_[i].getWidth();
    fullWidth += width + this.itemsSpacing_;
    maxWidth = Math.max(maxWidth, width);
  }
  if (fullWidth == 0 || maxWidth < 0)
    return 0;
  fullWidth -= this.itemsSpacing_;

  if (this.itemsLayout_ == anychart.enums.Layout.VERTICAL) {
    return maxWidth;
  } else {
    return fullWidth;
  }
};


/**
 * Calculates legend height.
 * @return {number} Calculated height.
 * @private
 */
anychart.core.ui.Legend.prototype.calculateContentHeight_ = function() {
  if (!goog.isDefAndNotNull(this.items_)) return 0;
  var fullHeight = 0;
  var height = 0;
  var maxHeight = -Number.MAX_VALUE;

  for (var i = 0, len = this.items_.length; i < len; i++) {
    if (i in this.notEnabledItems_)
      continue;
    height = this.items_[i].getHeight();
    fullHeight += height + this.itemsSpacing_;
    maxHeight = Math.max(maxHeight, height);
  }
  if (fullHeight == 0 || maxHeight < 0)
    return 0;
  fullHeight -= this.itemsSpacing_;

  if (this.itemsLayout_ == anychart.enums.Layout.HORIZONTAL) {
    return maxHeight;
  } else {
    return fullHeight;
  }
};


/**
 * Calculate legend bounds.
 * @private
 */
anychart.core.ui.Legend.prototype.calculateBounds_ = function() {
  /** @type {anychart.math.Rect} */
  var parentBounds = /** @type {anychart.math.Rect} */(this.parentBounds());
  /** @type {number} */
  var parentWidth;
  /** @type {number} */
  var parentHeight;

  var margin = this.margin();
  var padding = this.padding();

  var width, height;

  var maxWidth, maxHeight;
  if (parentBounds) {
    parentWidth = parentBounds.width;
    parentHeight = parentBounds.height;
    if (goog.isDefAndNotNull(this.width_)) {
      width = anychart.utils.normalizeSize(/** @type {number|string} */(this.width_), parentWidth);
      if (margin.widenWidth(width) > parentWidth) width = margin.tightenWidth(parentWidth);
      maxWidth = padding.tightenWidth(width);
    } else {
      maxWidth = padding.tightenWidth(margin.tightenWidth(parentWidth));
    }
    if (goog.isDefAndNotNull(this.height_)) {
      height = anychart.utils.normalizeSize(/** @type {number|string} */(this.height_), parentHeight);
      if (margin.widenHeight(height) > parentHeight) height = margin.tightenHeight(parentHeight);
      maxHeight = padding.tightenHeight(height);
    } else {
      maxHeight = padding.tightenHeight(margin.tightenHeight(parentHeight));
    }
  } else {
    if (goog.isNumber(this.width_) && !isNaN(this.width_)) {
      maxWidth = padding.tightenWidth(this.width_);
    } else {
      maxWidth = Infinity;
    }
    if (goog.isNumber(this.height_) && !isNaN(this.height_)) {
      maxHeight = padding.tightenHeight(this.height_);
    } else {
      maxHeight = Infinity;
    }
  }

  var separatorBounds;
  var paginatorBounds;
  var titleBounds;

  var separator = /** @type {anychart.core.ui.Separator} */(this.titleSeparator());
  var paginator = /** @type {anychart.core.ui.Paginator} */(this.paginator());
  var title = /** @type {anychart.core.ui.Title} */(this.title());

  separator.suspendSignalsDispatching();
  paginator.suspendSignalsDispatching();
  title.suspendSignalsDispatching();

  if (title.enabled()) {
    title.parentBounds(null);
    title.width(null);
    title.height(null);
    titleBounds = title.getContentBounds();
  } else
    titleBounds = null;

  var contentWidth = this.calculateContentWidth_();
  var contentHeight = this.calculateContentHeight_();

  if (separator.enabled()) {
    separator.parentBounds(null);
    if (titleBounds)
      separator.width(titleBounds.width);
    else
      separator.width((separator.orientation() == anychart.enums.Orientation.LEFT || separator.orientation() == anychart.enums.Orientation.RIGHT) ? contentHeight : contentWidth);
    separatorBounds = separator.getContentBounds();
  } else
    separatorBounds = null;

  paginator.parentBounds(null);
  paginatorBounds = paginator.getPixelBounds();

  var orientation;

  if (this.itemsLayout_ == anychart.enums.Layout.HORIZONTAL) {
    if (contentWidth > maxWidth)
      paginator.enabled(true);
    else
      paginator.enabled(false);
  }
  if (this.itemsLayout_ == anychart.enums.Layout.VERTICAL) {
    if (contentHeight > maxHeight)
      paginator.enabled(true);
    else
      paginator.enabled(false);
  }

  var fullAreaWidth = 0;
  var fullAreaHeight = 0;

  // calculating area width and height
  fullAreaWidth += contentWidth;
  fullAreaHeight += contentHeight;

  if (separator.enabled()) {
    orientation = separator.orientation();
    if (orientation == anychart.enums.Orientation.LEFT || orientation == anychart.enums.Orientation.RIGHT) {
      fullAreaWidth += separatorBounds.width;
      fullAreaHeight = Math.max(fullAreaHeight, separatorBounds.height);
    } else {
      fullAreaWidth = Math.max(fullAreaWidth, separatorBounds.width);
      fullAreaHeight += separatorBounds.height;
    }
  }

  if (paginator.enabled()) {
    orientation = paginator.orientation();
    if (orientation == anychart.enums.Orientation.LEFT || orientation == anychart.enums.Orientation.RIGHT) {
      fullAreaWidth += paginatorBounds.width;
      fullAreaHeight = Math.max(fullAreaHeight, paginatorBounds.height);
    } else {
      fullAreaWidth = Math.max(fullAreaWidth, paginatorBounds.width);
      fullAreaHeight += paginatorBounds.height;
    }
  }

  if (title.enabled()) {
    orientation = title.orientation();
    if (orientation == anychart.enums.Orientation.LEFT || orientation == anychart.enums.Orientation.RIGHT) {
      fullAreaWidth += titleBounds.width;
      fullAreaHeight = Math.max(fullAreaHeight, titleBounds.height);
    } else {
      fullAreaWidth = Math.max(fullAreaWidth, titleBounds.width);
      fullAreaHeight += titleBounds.height;
    }
  }

  var contentAreaWidth = fullAreaWidth > maxWidth ? maxWidth : fullAreaWidth;
  var contentAreaHeight = fullAreaHeight > maxHeight ? maxHeight : fullAreaHeight;
  width = margin.widenWidth(padding.widenWidth(contentAreaWidth));
  height = margin.widenHeight(padding.widenHeight(contentAreaHeight));
  if (title.enabled()) {
    var titleWidth = titleBounds.width;
    var titleHeight = titleBounds.height;
    orientation = title.orientation();
    if (orientation == anychart.enums.Orientation.TOP || orientation == anychart.enums.Orientation.BOTTOM) {
      title.width(title.margin().tightenWidth(contentAreaWidth));
      titleBounds = title.getContentBounds();
      separator.width(titleBounds.width);
      separatorBounds = separator.getContentBounds();
      if (titleBounds.height != titleHeight) {
        title.height(title.margin().tightenHeight(titleHeight));
        titleBounds = title.getContentBounds();
      }
    } else {
      title.width(title.margin().tightenWidth(contentAreaHeight));
      titleBounds = title.getContentBounds();
      separator.width(titleBounds.height);
      separatorBounds = separator.getContentBounds();
      if (titleBounds.width != titleWidth) {
        title.height(title.margin().tightenHeight(titleWidth));
        titleBounds = title.getContentBounds();
      }
    }
  }
  if (title.enabled()) {
    orientation = title.orientation();
    if (orientation == anychart.enums.Orientation.TOP || orientation == anychart.enums.Orientation.BOTTOM) contentAreaHeight -= titleBounds.height;
    else contentAreaWidth -= titleBounds.width;
  }

  if (separator.enabled()) {
    orientation = separator.orientation();
    if (orientation == anychart.enums.Orientation.TOP || orientation == anychart.enums.Orientation.BOTTOM) contentAreaHeight -= separatorBounds.height;
    else contentAreaWidth -= separatorBounds.width;
  }

  var pageWidth = contentAreaWidth, pageHeight = contentAreaHeight;
  orientation = paginator.orientation();

  if (paginator.enabled()) {
    if (orientation == anychart.enums.Orientation.TOP || orientation == anychart.enums.Orientation.BOTTOM) pageHeight = contentAreaHeight - paginatorBounds.height;
    else pageWidth = contentAreaWidth - paginatorBounds.width;
  }

  do {
    this.markConsistent(anychart.ConsistencyState.BOUNDS);
    this.distributeItemsInBounds_(pageWidth, pageHeight);
    paginator.parentBounds(null);
    paginatorBounds = paginator.getPixelBounds();
    if (orientation == anychart.enums.Orientation.TOP || orientation == anychart.enums.Orientation.BOTTOM) pageHeight = contentAreaHeight - (paginatorBounds ? paginatorBounds.height : 0);
    else pageWidth = contentAreaWidth - (paginatorBounds ? paginatorBounds.width : 0);
  } while (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS));

  var left, top;
  width = isFinite(maxWidth) && goog.isDefAndNotNull(this.width_) ? padding.widenWidth(maxWidth) : width;
  height = isFinite(maxHeight) && goog.isDefAndNotNull(this.height_) ? padding.widenHeight(maxHeight) : height;

  if (parentBounds) {
    left = parentBounds.getLeft();
    top = parentBounds.getTop();
    switch (this.position_) {
      case anychart.enums.Orientation.LEFT:
      case anychart.enums.Orientation.RIGHT:
        switch (this.align_) {
          case anychart.enums.Align.CENTER:
            top = top + (parentHeight - height) / 2;
            break;
          case anychart.enums.Align.RIGHT:
          case anychart.enums.Align.BOTTOM:
            top = parentBounds.getBottom() - height;
            break;
        }
        break;
      case anychart.enums.Orientation.TOP:
      case anychart.enums.Orientation.BOTTOM:
        switch (this.align_) {
          case anychart.enums.Align.CENTER:
            left = left + (parentWidth - width) / 2;
            break;
          case anychart.enums.Align.RIGHT:
          case anychart.enums.Align.BOTTOM:
            left = parentBounds.getRight() - width;
            break;
        }
        break;
    }
    switch (this.position_) {
      case anychart.enums.Orientation.RIGHT:
        left = parentBounds.getRight() - width;
        break;
      case anychart.enums.Orientation.BOTTOM:
        top = parentBounds.getBottom() - height;
        break;
    }
  } else {
    left = anychart.utils.normalizeSize(/** @type {string|number} */ (margin.left()), 0);
    top = anychart.utils.normalizeSize(/** @type {string|number} */ (margin.top()), 0);
  }

  this.pixelBounds_ = new anychart.math.Rect(left, top, width, height);

  separator.resumeSignalsDispatching(false);
  paginator.resumeSignalsDispatching(false);
  title.resumeSignalsDispatching(false);
};


/**
 * @inheritDoc
 */
anychart.core.ui.Legend.prototype.remove = function() {
  if (this.rootElement) this.rootElement.parent(null);
};


/**
 * Draw legend.
 * @return {anychart.core.ui.Legend} An instance of {@link anychart.core.ui.Legend} class for method chaining.
 */
anychart.core.ui.Legend.prototype.draw = function() {
  if (!this.checkDrawingNeeded())
    return this;

  if (!this.rootElement) {
    /**
     * Layer of legend.
     * @type {!acgraph.vector.Layer}
     */
    this.rootElement = acgraph.layer();
    this.registerDisposable(this.rootElement);

    if (!this.layer_) {
      /**
       * Legend items layer.
       * @type {!acgraph.vector.Layer}
       * @private
       */
      this.layer_ = acgraph.layer();
      this.layer_.parent(this.rootElement).zIndex(20);
      this.registerDisposable(this.layer_);
    }
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    this.rootElement.zIndex(/** @type {number} */ (this.zIndex()));
    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  var container = /** @type {acgraph.vector.ILayer} */(this.container());

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    this.rootElement.parent(container);
    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }

  var stage = container ? container.getStage() : null;
  var manualSuspend = stage && !stage.isSuspended();
  if (manualSuspend) stage.suspend();

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    var formatter = this.itemsFormatter();
    var items = this.createItemsFromSource_();
    if (this.inverted_)
      items = items.reverse();
    items = goog.isFunction(formatter) ? formatter(items) : items;
    if (this.items_ && this.items_.length != items.length)
      this.recreateItems_ = true;
    var finalItems = this.prepareItems_(items);
    this.initializeLegendItems_(finalItems);
    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }

  this.clearLastDrawedPage_();
  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    this.calculateBounds_();
    this.invalidate(anychart.ConsistencyState.LEGEND_BACKGROUND |
        anychart.ConsistencyState.LEGEND_TITLE |
        anychart.ConsistencyState.LEGEND_SEPARATOR |
        anychart.ConsistencyState.LEGEND_PAGINATOR);
    this.rootElement.setTransformationMatrix(1, 0, 0, 1, 0, 0);
    this.rootElement.translate(this.pixelBounds_.left, this.pixelBounds_.top);
    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }

  var totalBounds = this.pixelBounds_.clone();
  totalBounds.left = 0;
  totalBounds.top = 0;

  var boundsWithoutMargin = this.margin().tightenBounds(totalBounds);

  if (this.hasInvalidationState(anychart.ConsistencyState.LEGEND_BACKGROUND)) {
    var background = /** @type {anychart.core.ui.Background} */(this.background());
    background.suspendSignalsDispatching();
    background.parentBounds(boundsWithoutMargin);
    if (this.enabled()) background.container(this.rootElement);
    background.resumeSignalsDispatching(false);
    background.draw();
    this.markConsistent(anychart.ConsistencyState.LEGEND_BACKGROUND);
  }

  var boundsWithoutPadding = this.padding().tightenBounds(boundsWithoutMargin);

  if (this.hasInvalidationState(anychart.ConsistencyState.LEGEND_TITLE)) {
    var title = /** @type {anychart.core.ui.Title} */(this.title());
    title.suspendSignalsDispatching();
    title.parentBounds(boundsWithoutPadding);
    if (this.enabled()) title.container(this.rootElement);
    title.resumeSignalsDispatching(false);
    title.draw();
    this.markConsistent(anychart.ConsistencyState.LEGEND_TITLE);
  }

  var boundsWithoutTitle = this.title_ ? this.title_.getRemainingBounds() : boundsWithoutPadding;

  if (this.hasInvalidationState(anychart.ConsistencyState.LEGEND_SEPARATOR)) {
    var titleSeparator = /** @type {anychart.core.ui.Separator} */(this.titleSeparator());
    titleSeparator.suspendSignalsDispatching();
    titleSeparator.parentBounds(boundsWithoutTitle);
    if (this.enabled()) titleSeparator.container(this.rootElement);
    titleSeparator.resumeSignalsDispatching(false);
    titleSeparator.draw();
    this.markConsistent(anychart.ConsistencyState.LEGEND_SEPARATOR);
  }

  var boundsWithoutSeparator = this.titleSeparator_ ? this.titleSeparator_.getRemainingBounds() : boundsWithoutTitle;

  if (this.hasInvalidationState(anychart.ConsistencyState.LEGEND_PAGINATOR)) {
    var paginator = /** @type {anychart.core.ui.Paginator} */(this.paginator());
    paginator.suspendSignalsDispatching();
    paginator.parentBounds(boundsWithoutSeparator);
    if (this.enabled()) paginator.container(this.rootElement);
    paginator.resumeSignalsDispatching(false);
    paginator.draw();
    this.markConsistent(anychart.ConsistencyState.LEGEND_PAGINATOR);
  }

  var contentBounds = this.paginator().enabled() ? this.paginator().getRemainingBounds() : boundsWithoutSeparator;

  var pageToDraw = this.paginator().enabled() ? this.paginator().currentPage() - 1 : 0;
  this.drawLegendContent_(pageToDraw, contentBounds);

  if (manualSuspend) stage.resume();

  return this;
};


/**
 * Distribute items per pages.
 * @param {number} width Bounds of the content area.
 * @param {number} height Bounds of the content area.
 * @private
 */
anychart.core.ui.Legend.prototype.distributeItemsInBounds_ = function(width, height) {
  var i, len;
  var w, h;
  var page;

  this.distributedItems_ = [];

  page = 0;

  this.suspendSignalsDispatching();

  var itemsLength = this.items_ && this.items_.length;

  var k;
  // find first item that need to be showed
  for (k = 0; k < itemsLength; k++) {
    if (!(k in this.notEnabledItems_))
      break;
  }
  if (this.items_ && k != itemsLength) {
    this.distributedItems_[page] = [];
    this.distributedItems_[page][0] = this.items_[k];
    if (this.itemsLayout_ == anychart.enums.Layout.HORIZONTAL) {
      w = this.items_[k].getWidth();
      for (i = k + 1; i < itemsLength; i++) {
        if (i in this.notEnabledItems_)
          continue;
        if (w + this.itemsSpacing_ + this.items_[i].getWidth() > width) {
          page++;
          this.distributedItems_[page] = [];
          this.distributedItems_[page][0] = this.items_[i];
          w = this.items_[i].getWidth();
        } else {
          w = w + this.itemsSpacing_ + this.items_[i].getWidth();
          this.distributedItems_[page].push(this.items_[i]);
        }
      }
    } else {
      h = this.items_[k].getHeight();
      for (i = k + 1, len = this.items_.length; i < len; i++) {
        if (i in this.notEnabledItems_)
          continue;
        if (h + this.itemsSpacing_ + this.items_[i].getHeight() > height) {
          page++;
          this.distributedItems_[page] = [];
          this.distributedItems_[page][0] = this.items_[i];
          h = this.items_[i].getHeight();
        } else {
          h = h + this.itemsSpacing_ + this.items_[i].getHeight();
          this.distributedItems_[page].push(this.items_[i]);
        }
      }
    }
  }

  this.paginator().pageCount(page + 1);
  this.resumeSignalsDispatching(false);
};


/**
 * Clears last drawed page.
 * @private
 */
anychart.core.ui.Legend.prototype.clearLastDrawedPage_ = function() {
  if (goog.isDefAndNotNull(this.drawedPage_) && !isNaN(this.drawedPage_)) {
    var items = this.distributedItems_[this.drawedPage_];
    if (items) {
      for (var i = 0; i < items.length; i++) {
        items[i].enabled(false).draw();
      }
    }
  }
};


/**
 * Draws allocated legend items on set page.
 * @param {number} pageNumber Page number.
 * @param {anychart.math.Rect} contentBounds Bounds of the content area.
 * @private
 */
anychart.core.ui.Legend.prototype.drawLegendContent_ = function(pageNumber, contentBounds) {
  // draw legend content
  if (goog.isDefAndNotNull(this.items_)) {
    var x = 0;
    var y = 0;
    var i;
    var items = this.distributedItems_[pageNumber];
    var item;
    if (items) {
      switch (this.itemsLayout_) {
        case anychart.enums.Layout.HORIZONTAL:
          for (i = 0; i < items.length; i++) {
            item = items[i];
            item
              .suspendSignalsDispatching()
              .parentBounds(contentBounds)
              .x(x)
              .y(y)
              .enabled(true)
              .resumeSignalsDispatching(false)
              .draw();
            x += items[i].getWidth() + this.itemsSpacing_;
          }
          break;
        case anychart.enums.Layout.VERTICAL:
          for (i = 0; i < items.length; i++) {
            item = items[i];
            item
              .suspendSignalsDispatching()
              .parentBounds(contentBounds)
              .x(x)
              .y(y)
              .enabled(true)
              .resumeSignalsDispatching(false)
              .draw();
            y += items[i].getHeight() + this.itemsSpacing_;
          }
          break;
      }
    }
  }
  this.drawedPage_ = pageNumber;
};


/** @inheritDoc */
anychart.core.ui.Legend.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');
  json['margin'] = this.margin().serialize();
  json['padding'] = this.padding().serialize();
  json['background'] = this.background().serialize();
  json['title'] = this.title().serialize();
  json['titleSeparator'] = this.titleSeparator().serialize();
  json['paginator'] = this.paginator().serialize();
  json['tooltip'] = this.tooltip().serialize();
  json['itemsLayout'] = this.itemsLayout();
  json['itemsSpacing'] = this.itemsSpacing();
  json['itemsSourceMode'] = this.itemsSourceMode();
  json['inverted'] = this.inverted();
  if (goog.isDef(this.items()))
    json['items'] = this.items();
  json['iconTextSpacing'] = this.iconTextSpacing();
  json['width'] = this.width();
  json['height'] = this.height();
  json['position'] = this.position();
  json['align'] = this.align();
  json['hoverCursor'] = this.hoverCursor();
  return json;
};


/** @inheritDoc */
anychart.core.ui.Legend.prototype.setupByJSON = function(config) {
  goog.base(this, 'setupByJSON', config);
  this.margin(config['margin']);
  this.padding(config['padding']);
  this.background(config['background']);
  this.title(config['title']);
  this.titleSeparator(config['titleSeparator']);
  this.paginator(config['paginator']);
  this.tooltip(config['tooltip']);
  this.itemsLayout(config['itemsLayout']);
  this.itemsSpacing(config['itemsSpacing']);
  this.inverted(config['inverted']);
  this.itemsSourceMode(config['itemsSourceMode']);
  this.items(config['items']);
  this.iconTextSpacing(config['iconTextSpacing']);
  this.width(config['width']);
  this.height(config['height']);
  this.position(config['position']);
  this.align(config['align']);
  this.hoverCursor(config['hoverCursor']);
};


/**
 * Type definition for legend item provider.
 * @includeDoc
 * @typedef {{
 *    index: (number|null|undefined),
 *    text: (string|null|undefined),
 *    iconEnabled: (boolean|undefined),
 *    iconType: (Function, string|null|undefined),
 *    iconStroke: (acgraph.vector.Stroke|null|undefined),
 *    iconFill: (acgraph.vector.Fill|null|undefined),
 *    iconHatchFill: (acgraph.vector.HatchFill.HatchFillType|acgraph.vector.PatternFill|acgraph.vector.HatchFill|null|undefined),
 *    iconMarkerType: (string|null|undefined),
 *    iconMarkerStroke: (acgraph.vector.Stroke|null|undefined),
 *    iconMarkerFill: (acgraph.vector.Fill|null|undefined),
 *    iconTextSpacing: (number|null|undefined),
 *    disabled: (boolean|undefined),
 *    meta: (Object|null|undefined)
 * }}
 */
anychart.core.ui.Legend.LegendItemProvider;


//exports
anychart.core.ui.Legend.prototype['itemsLayout'] = anychart.core.ui.Legend.prototype.itemsLayout;
anychart.core.ui.Legend.prototype['itemsSpacing'] = anychart.core.ui.Legend.prototype.itemsSpacing;
anychart.core.ui.Legend.prototype['items'] = anychart.core.ui.Legend.prototype.items;
anychart.core.ui.Legend.prototype['itemsFormatter'] = anychart.core.ui.Legend.prototype.itemsFormatter;
anychart.core.ui.Legend.prototype['itemsTextFormatter'] = anychart.core.ui.Legend.prototype.itemsTextFormatter;
anychart.core.ui.Legend.prototype['itemsSourceMode'] = anychart.core.ui.Legend.prototype.itemsSourceMode;
anychart.core.ui.Legend.prototype['inverted'] = anychart.core.ui.Legend.prototype.inverted;
anychart.core.ui.Legend.prototype['hoverCursor'] = anychart.core.ui.Legend.prototype.hoverCursor;
anychart.core.ui.Legend.prototype['iconTextSpacing'] = anychart.core.ui.Legend.prototype.iconTextSpacing;
anychart.core.ui.Legend.prototype['margin'] = anychart.core.ui.Legend.prototype.margin;
anychart.core.ui.Legend.prototype['padding'] = anychart.core.ui.Legend.prototype.padding;
anychart.core.ui.Legend.prototype['background'] = anychart.core.ui.Legend.prototype.background;
anychart.core.ui.Legend.prototype['title'] = anychart.core.ui.Legend.prototype.title;
anychart.core.ui.Legend.prototype['titleSeparator'] = anychart.core.ui.Legend.prototype.titleSeparator;
anychart.core.ui.Legend.prototype['paginator'] = anychart.core.ui.Legend.prototype.paginator;
anychart.core.ui.Legend.prototype['tooltip'] = anychart.core.ui.Legend.prototype.tooltip;
anychart.core.ui.Legend.prototype['width'] = anychart.core.ui.Legend.prototype.width;
anychart.core.ui.Legend.prototype['height'] = anychart.core.ui.Legend.prototype.height;
anychart.core.ui.Legend.prototype['position'] = anychart.core.ui.Legend.prototype.position;
anychart.core.ui.Legend.prototype['align'] = anychart.core.ui.Legend.prototype.align;
anychart.core.ui.Legend.prototype['getRemainingBounds'] = anychart.core.ui.Legend.prototype.getRemainingBounds;
