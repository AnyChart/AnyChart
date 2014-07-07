goog.provide('anychart.elements.Legend');
goog.require('anychart.elements.Background');
goog.require('anychart.elements.LegendItem');
goog.require('anychart.elements.Separator');
goog.require('anychart.elements.Text');
goog.require('anychart.elements.Title');
goog.require('anychart.math.Rect');
goog.require('anychart.ui.Paginator');
goog.require('anychart.utils');
goog.require('anychart.utils.Margin');
goog.require('anychart.utils.Padding');
goog.require('goog.array');
goog.require('goog.object');



/**
 * Legend element.
 * @constructor
 * @extends {anychart.elements.Text}
 */
anychart.elements.Legend = function() {
  goog.base(this);

  /**
   * Position of the legend.
   * @type {anychart.utils.Orientation}
   * @private
   */
  this.position_ = anychart.utils.Orientation.BOTTOM;

  /**
   * Align of the legend.
   * @type {anychart.utils.Align}
   * @private
   */
  this.align_ = anychart.utils.Align.CENTER;

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
   * @type {(number|string)?}
   * @private
   */
  this.width_ = null;

  /**
   * Height of legend element.
   * @type {(number|string)?}
   * @private
   */
  this.height_ = null;

  /**
   * Bounds of legend parent element.
   * @type {anychart.math.Rect}
   * @private
   */
  this.parentBounds_ = null;

  /**
   * Default layout of legend.
   * @type {anychart.elements.Legend.Layout}
   * @private
   */
  this.itemsLayout_ = anychart.elements.Legend.Layout.HORIZONTAL;

  /**
   * Wrapped legend items.
   * @type {Array.<anychart.elements.LegendItem>}
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

  this.zIndex(10);

  this.fontFamily('Verdana')
      .fontSize('10')
      .fontWeight('normal')
      .fontColor('rgb(35,35,35)')
      // we need LegendItem text could catch mouseover and mouseclick (cause elements.Text turns  pointerEvents off with non-hoverable text)
      .hoverable(true)
      .padding(7)
      .margin(5);

  var bg = new anychart.elements.Background()
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
      .corners(5);
  this.background(/** @type {anychart.elements.Background} */ (bg))
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
      .zIndex(20)
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

  var tooltip = /** @type {anychart.elements.Tooltip} */(this.tooltip());
  tooltip.suspendSignalsDispatching();
  tooltip.isFloating(true);
  tooltip.content().useHtml(true);
  tooltip.titleFormatter(function() {
    return this['text'];
  });
  tooltip.textFormatter(function() {
    return this['text'];
  });
  tooltip.resumeSignalsDispatching(false);

  var tooltipTitle = /** @type {anychart.elements.Title} */(tooltip.title());
  tooltipTitle.enabled(false);
  tooltipTitle.padding(0);
  tooltipTitle.margin(3, 3, 0, 3);

  this.invalidate(anychart.ConsistencyState.ALL);
};
goog.inherits(anychart.elements.Legend, anychart.elements.Text);


/**
 * Supported signals.
 * @type {number}
 */
anychart.elements.Legend.prototype.SUPPORTED_SIGNALS = anychart.elements.Text.prototype.SUPPORTED_SIGNALS; // NEEDS_REDRAW BOUNDS_CHANGED


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.elements.Legend.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.elements.Text.prototype.SUPPORTED_CONSISTENCY_STATES |  // ENABLED CONTAINER Z_INDEX APPEARANCE BOUNDS
    anychart.ConsistencyState.BACKGROUND |
    anychart.ConsistencyState.TITLE |
    anychart.ConsistencyState.SEPARATOR |
    anychart.ConsistencyState.PAGINATOR |
    anychart.ConsistencyState.DATA;


/**
 * Legend layout enum.
 * @enum {string}
 */
anychart.elements.Legend.Layout = {
  /**
   * Horizontal allocation of items.
   */
  HORIZONTAL: 'horizontal',

  /**
   * Vertical allocation of items.
   */
  VERTICAL: 'vertical',

  /**
   * Table allocation.
   */
  TABLE: 'table'
};


/**
 * Normalizes string value to Layout enum.
 * @param {string} layout Layout to be normalized.
 * @param {anychart.elements.Legend.Layout=} opt_default Default value to be used.
 * @return {anychart.elements.Legend.Layout} Normalized layout.
 */
anychart.elements.Legend.normalizeItemsLayout = function(layout, opt_default) {
  if (goog.isString(layout)) {
    layout = layout.toLowerCase();
    for (var i in anychart.elements.Legend.Layout) {
      if (layout == anychart.elements.Legend.Layout[i] && anychart.elements.Legend.Layout[i] != 'table')
        return anychart.elements.Legend.Layout[i];
    }
  }
  return opt_default || anychart.elements.Legend.Layout.HORIZONTAL;
};


/**
 * Sets items layout.
 * @param {string=} opt_value Layout type for legend items.
 * @return {(anychart.elements.Legend.Layout|anychart.elements.Legend)} Items layout or self for method chaining.
 */
anychart.elements.Legend.prototype.itemsLayout = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.elements.Legend.normalizeItemsLayout(opt_value, this.itemsLayout_);
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
 * Getter for items provider.
 * @return {Array.<anychart.elements.Legend.LegendItemProvider>} Array of legend item provider.
 *//**
 * Setter for items provider.
 * @param {Array.<anychart.elements.Legend.LegendItemProvider>=} opt_value Items provider.
 * @return {!anychart.elements.Legend} An instance of the {@link anychart.elements.Legend} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {Array.<anychart.elements.Legend.LegendItemProvider>=} opt_value Items provider.
 * @return {(Array.<anychart.elements.Legend.LegendItemProvider>|anychart.elements.Legend)} Legend items provider.
 */
anychart.elements.Legend.prototype.itemsProvider = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (opt_value != this.itemsProvider_ && goog.isArray(opt_value) && opt_value.length > 0) {
      this.itemsProvider_ = opt_value;
      this.invalidate(anychart.ConsistencyState.DATA, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.itemsProvider_;
};


/**
 * Getter for items spacing setting.
 * @return {(string|number)} Items spacing setting.
 *//**
 * Setter for items spacing setting.
 * @param {(string|number)=} opt_value Value to set.
 * @return {!anychart.elements.Legend} An instance of the {@link anychart.elements.Legend} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(string|number)=} opt_value Value of spacing between legend items.
 * @return {(string|number|anychart.elements.Legend)} Items spacing setting or self for method chaining.
 */
anychart.elements.Legend.prototype.itemsSpacing = function(opt_value) {
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
 * @return {!anychart.elements.Legend} An instance of the {@link anychart.elements.Legend} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(string|number)=} opt_value Spacing setting.
 * @return {(number|anychart.elements.Legend)} Spacing setting or self for method chaining.
 */
anychart.elements.Legend.prototype.iconTextSpacing = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = !isNaN(parseFloat(opt_value)) ? opt_value : 5;
    if (this.iconTextSpacing_ != opt_value) {
      this.iconTextSpacing_ = parseFloat(opt_value);
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
 * @param {(string|number|anychart.utils.Space)=} opt_spaceOrTopOrTopAndBottom Space object or top or top and bottom
 *    space.
 * @param {(string|number)=} opt_rightOrRightAndLeft Right or right and left space.
 * @param {(string|number)=} opt_bottom Bottom space.
 * @param {(string|number)=} opt_left Left space.
 * @return {!(anychart.elements.Legend|anychart.utils.Margin)} Margin or self for method chaining.
 */
anychart.elements.Legend.prototype.margin = function(opt_spaceOrTopOrTopAndBottom, opt_rightOrRightAndLeft, opt_bottom, opt_left) {
  if (!this.margin_) {
    this.margin_ = new anychart.utils.Margin();
    this.registerDisposable(this.margin_);
    this.margin_.listenSignals(this.boundsInvalidated_, this);
  }
  if (goog.isDef(opt_spaceOrTopOrTopAndBottom)) {
    if (goog.isObject(opt_spaceOrTopOrTopAndBottom)) {
      this.margin_.deserialize(opt_spaceOrTopOrTopAndBottom);
    } else {
      this.margin_.set.apply(this.margin_, arguments);
    }
    return this;
  }
  return this.margin_;
};


/**
 * Listener for bounds invalidation.
 * @param {anychart.SignalEvent} event Invalidation event.
 * @private
 */
anychart.elements.Legend.prototype.boundsInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.BOUNDS,
        anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
  }
};


/**
 * Legend padding setting.
 * @param {(string|number|anychart.utils.Space)=} opt_spaceOrTopOrTopAndBottom Space object or top or top and bottom
 *    space.
 * @param {(string|number)=} opt_rightOrRightAndLeft Right or right and left space.
 * @param {(string|number)=} opt_bottom Bottom space.
 * @param {(string|number)=} opt_left Left space.
 * @return {!(anychart.elements.Legend|anychart.utils.Padding)} Padding or self for method chaining.
 */
anychart.elements.Legend.prototype.padding = function(opt_spaceOrTopOrTopAndBottom, opt_rightOrRightAndLeft, opt_bottom, opt_left) {
  if (!this.padding_) {
    this.padding_ = new anychart.utils.Padding();
    this.registerDisposable(this.padding_);
    this.padding_.listenSignals(this.boundsInvalidated_, this);
  }
  if (goog.isDef(opt_spaceOrTopOrTopAndBottom)) {
    if (goog.isObject(opt_spaceOrTopOrTopAndBottom)) {
      this.padding_.deserialize(opt_spaceOrTopOrTopAndBottom);
    } else {
      this.padding_.set.apply(this.padding_, arguments);
    }
    return this;
  }
  return this.padding_;
};


/**
 * Getter for legend background.
 * @return {!anychart.elements.Background} Background or self for method chaining.
 *//**
 * Setter for legend background.
 * @param {anychart.elements.Background=} opt_value Background setting.
 * @return {!anychart.elements.Legend} An instance of the {@link anychart.elements.Legend} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {anychart.elements.Background=} opt_value Background setting.
 * @return {!(anychart.elements.Legend|anychart.elements.Background)} Background or self for method chaining.
 */
anychart.elements.Legend.prototype.background = function(opt_value) {
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
    this.background_.resumeSignalsDispatching(false);
    this.invalidate(anychart.ConsistencyState.BACKGROUND, anychart.Signal.NEEDS_REDRAW);
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
anychart.elements.Legend.prototype.backgroundInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    this.invalidate(anychart.ConsistencyState.BACKGROUND, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Getter for legend title.
 * @return {anychart.elements.Title} Title settings.
 *//**
 * Setter for legend title.<br/>
 * <b>Note:</b> to turn title off you have to send null or 'none'.
 * @param {(string|null|anychart.elements.Title)=} opt_value Value to set.
 * @return {!anychart.elements.Legend} An instance of the {@link anychart.elements.Legend} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(string|null|anychart.elements.Title)=} opt_value Title to set.
 * @return {(anychart.elements.Title|anychart.elements.Legend)} Title or self for method chaining.
 */
anychart.elements.Legend.prototype.title = function(opt_value) {
  if (!this.title_) {
    this.title_ = new anychart.elements.Title();
    this.registerDisposable(this.title_);
    this.title_.listenSignals(this.titleInvalidated_, this);
  }

  if (goog.isDef(opt_value)) {
    this.title_.suspendSignalsDispatching();
    if (opt_value instanceof anychart.elements.Title) {
      this.title_.deserialize(opt_value.serialize());
    } else if (goog.isString(opt_value)) {
      this.title_.text(opt_value);
    } else if (goog.isObject(opt_value)) {
      this.title_.deserialize(opt_value);
    } else if (anychart.utils.isNone(opt_value)) {
      this.title_.enabled(false);
    }
    this.title_.resumeSignalsDispatching(true);
    this.invalidate(anychart.ConsistencyState.TITLE, anychart.Signal.NEEDS_REDRAW);
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
anychart.elements.Legend.prototype.titleInvalidated_ = function(event) {
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
  // If there are no signals, the state == 0 and nothing happens.
  this.invalidate(state, signal);
};


/**
 * Getter for title separator setting.
 * @return {anychart.elements.Separator} Current settings.
 *//**
 * Setter for title separator setting.<br/>
 * <b>Note:</b> To turn off titleSeparatoryou have to send null or 'none'.
 * @param {(Object|string|null|anychart.elements.Separator)=} opt_value Value to set.
 * @return {!anychart.elements.Legend} An instance of the {@link anychart.elements.Legend} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {*=} opt_value Separator setting.
 * @return {(*|anychart.elements.Legend)} Separator setting or self for method chaining.
 */
anychart.elements.Legend.prototype.titleSeparator = function(opt_value) {
  if (!this.titleSeparator_) {
    this.titleSeparator_ = new anychart.elements.Separator();
    this.registerDisposable(this.titleSeparator_);
    this.titleSeparator_.listenSignals(this.titleSeparatorInvalidated_, this);
  }

  if (goog.isDef(opt_value)) {
    if (opt_value instanceof anychart.elements.Separator) {
      this.titleSeparator_.deserialize(opt_value.serialize());
    } else if (goog.isObject(opt_value)) {
      this.titleSeparator_.deserialize(opt_value);
    } else if (anychart.utils.isNone(opt_value)) {
      this.titleSeparator_.enabled(false);
    }
    this.invalidate(anychart.ConsistencyState.TITLE, anychart.Signal.NEEDS_REDRAW);
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
anychart.elements.Legend.prototype.titleSeparatorInvalidated_ = function(event) {
  var state = 0;
  var signal = 0;
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    state |= anychart.ConsistencyState.SEPARATOR;
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
 * @return {anychart.elements.Separator} Current settings.
 *//**
 * Setter for paginator setting.<br/>
 * <b>Note:</b> To turn Paginator off you need to send null or 'none'.
 * @param {(Object|anychart.elements.Paginator|string|null)=} opt_value Value to set.
 * @return {!anychart.elements.Legend} An instance of the {@link anychart.elements.Legend} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {*=} opt_value Paginator to set.
 * @return {(*|anychart.elements.Legend)} Paginator or self for method chaining.
 */
anychart.elements.Legend.prototype.paginator = function(opt_value) {
  if (!this.paginator_) {
    this.paginator_ = new anychart.ui.Paginator();
    this.registerDisposable(this.paginator_);
    this.paginator_.listenSignals(this.paginatorInvalidated_, this);
  }

  if (goog.isDef(opt_value)) {
    if (opt_value instanceof anychart.ui.Paginator) {
      this.paginator_.deserialize(opt_value.serialize());
    } else if (goog.isObject(opt_value)) {
      this.paginator_.deserialize(opt_value);
    } else if (anychart.utils.isNone(opt_value)) {
      this.paginator_.enabled(false);
    }
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
anychart.elements.Legend.prototype.paginatorInvalidated_ = function(event) {
  var state = 0;
  var signal = 0;
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    state |= anychart.ConsistencyState.PAGINATOR;
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
 * @param {(null|string|Object|anychart.elements.Tooltip)=} opt_value Tooltip settings.
 * @return {!(anychart.elements.Legend|anychart.elements.Tooltip)} Tooltip instance or self for method chaining.
 */
anychart.elements.Legend.prototype.tooltip = function(opt_value) {
  if (!this.tooltip_) {
    this.tooltip_ = new anychart.elements.Tooltip();
    this.registerDisposable(this.tooltip_);
    this.tooltip_.listenSignals(this.onTooltipSignal_, this);
  }
  if (goog.isDef(opt_value)) {
    if (opt_value instanceof anychart.elements.Tooltip) {
      this.tooltip_.deserialize(opt_value.serialize());
    } else if (goog.isObject(opt_value)) {
      this.tooltip_.deserialize(opt_value);
    } else if (anychart.utils.isNone(opt_value)) {
      this.tooltip_.enabled(false);
    }
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
anychart.elements.Legend.prototype.onTooltipSignal_ = function(event) {
  var tooltip = /** @type {anychart.elements.Tooltip} */(this.tooltip());
  tooltip.redraw();
};


/**
 * Show data point tooltip.
 * @protected
 * @param {goog.events.BrowserEvent} event Event that initiates tooltip display.
 */
anychart.elements.Legend.prototype.showTooltip = function(event) {
  this.moveTooltip(event);
};


/**
 * Hide data point tooltip.
 * @protected
 */
anychart.elements.Legend.prototype.hideTooltip = function() {
  var tooltip = /** @type {anychart.elements.Tooltip} */(this.tooltip());
  tooltip.hide();
};


/**
 * @protected
 * @param {goog.events.BrowserEvent} event that initiates tooltip display.
 */
anychart.elements.Legend.prototype.moveTooltip = function(event) {
  var tooltip = /** @type {anychart.elements.Tooltip} */(this.tooltip());
  var index = event['index'];
  var item = event['item'];
  var formatProvider = {
    'text': item.text(),
    'iconType': item.iconType(),
    'iconStroke': item.iconStroke(),
    'iconFill': item.iconFill(),
    'iconMarker': item.iconMarker(),
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
 * @return {!anychart.elements.Legend} An instance of the {@link anychart.elements.Legend} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(number|string|null)=} opt_value .
 * @return {!anychart.elements.Legend|number|string|null} .
 */
anychart.elements.Legend.prototype.width = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.width_ != opt_value) {
      this.width_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS | anychart.ConsistencyState.BACKGROUND,
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
 * @return {!anychart.elements.Legend} An instance of the {@link anychart.elements.Legend} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(number|string|null)=} opt_value .
 * @return {!anychart.elements.Legend|number|string|null} .
 */
anychart.elements.Legend.prototype.height = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.height_ != opt_value) {
      this.height_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS | anychart.ConsistencyState.BACKGROUND,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.height_;
};


/**
 * Getter for legend parent element bounds.
 * @return {anychart.math.Rect} Parent element bounds.
 *//**
 * Setter for legend's parent element bounds.
 * @param {anychart.math.Rect=} opt_value Value to set.
 * @return {!anychart.elements.Legend} An instance of the {@link anychart.elements.Legend} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {anychart.math.Rect=} opt_value Parent element bounds to set.
 * @return {(anychart.math.Rect|!anychart.elements.Legend)} Parent element bounds or self for method chaining.
 */
anychart.elements.Legend.prototype.parentBounds = function(opt_value) {
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


//todo Need rename. Orientation or Position (blackart)
/**
 * Getter for legend position setting.
 * @return {anychart.utils.Orientation} Legend position.
 *//**
 * Setter for legend position setting.
 * @param {(anychart.utils.Orientation|string)=} opt_value Legend position.
 * @return {!anychart.elements.Legend} An instance of the {@link anychart.elements.Legend} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(anychart.utils.Orientation|string)=} opt_value Legend position.
 * @return {(anychart.utils.Orientation|anychart.elements.Legend)} Legend position or self for method chaining.
 */
anychart.elements.Legend.prototype.position = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.utils.normalizeOrientation(opt_value);
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
 * @return {anychart.utils.Align} Legend align.
 *//**
 * Setter for legend align setting.
 * @param {(anychart.utils.Align|string)=} opt_value Value to set.
 * @return {!anychart.elements.Legend} An instance of the {@link anychart.elements.Legend} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(anychart.utils.Align|string)=} opt_value Legend align.
 * @return {(anychart.utils.Align|anychart.elements.Legend)} Legend align or self for chaining.
 */
anychart.elements.Legend.prototype.align = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.utils.normalizeAlign(opt_value);
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
 * @return {anychart.math.Rect} Bounds that remain after legend.
 */
anychart.elements.Legend.prototype.getRemainingBounds = function() {
  if (!this.pixelBounds_ || this.hasInvalidationState(anychart.ConsistencyState.BOUNDS))
    this.calculateBounds_();
  /** @type {anychart.math.Rect} */
  var parentBounds;
  if (this.parentBounds_) {
    parentBounds = this.parentBounds_.clone();
  } else {
    var container = /** @type {acgraph.vector.ILayer} */(this.container());
    var stage = container ? container.getStage() : null;
    if (stage) {
      parentBounds = stage.getBounds(); // cloned already
    } else {
      return new anychart.math.Rect(0, 0, 0, 0);
    }
  }

  if (!this.enabled()) return parentBounds;

  switch (this.position_) {
    case anychart.utils.Orientation.TOP:
      parentBounds.top += this.pixelBounds_.height;
      parentBounds.height -= this.pixelBounds_.height;
      break;
    case anychart.utils.Orientation.RIGHT:
      parentBounds.width -= this.pixelBounds_.width;
      break;
    default:
    case anychart.utils.Orientation.BOTTOM:
      parentBounds.height -= this.pixelBounds_.height;
      break;
    case anychart.utils.Orientation.LEFT:
      parentBounds.left += this.pixelBounds_.width;
      parentBounds.width -= this.pixelBounds_.width;
      break;
  }

  return parentBounds;
};


/**
 * Init items.
 * @private
 */
anychart.elements.Legend.prototype.initializeLegendItems_ = function() {
  if (this.itemsProvider_ && this.itemsProvider_.length > 0) {
    goog.disposeAll(this.items_);
    this.items_ = [];
    /**
     * Array of legend items metadata. Used for legend item tooltips.
     * @type {Array.<Object>}
     * @private
     */
    this.legendItemsMeta_ = [];
    var settingsObj = this.textSettings();
    var item; // legend item
    var provider; // legend item provider object
    for (var i = 0; i < this.itemsProvider_.length; i++) {
      provider = this.itemsProvider_[i];
      item = new anychart.elements.LegendItem();

      item.iconType(provider['iconType'] ? provider['iconType'] : anychart.elements.LegendItem.IconType.SQUARE);
      item.iconStroke(provider['iconStroke'] ? provider['iconStroke'] : 'none');
      item.iconFill(provider['iconFill'] ? provider['iconFill'] : 'none');
      item.iconMarker(provider['iconMarker'] ? provider['iconMarker'] : 'none');

      item.text(provider['text'] ? provider['text'] : 'Item ' + i);
      item.iconTextSpacing(this.iconTextSpacing_);

      item.textSettings(/** @type {Object} */(settingsObj));
      item.applyTextSettings(item.getTextElement(), true);

      item.container(this.layer_);
      item.enabled(false);

      this.items_.push(item);
      this.legendItemsMeta_.push(provider['meta'] ? provider['meta'] : {});
    }
  } else {
    goog.disposeAll(this.items_);
    this.items_ = null;
    this.legendItemsMeta_ = null;
  }
  this.invalidate(anychart.ConsistencyState.BOUNDS);
};


/**
 * Calculates legend width.
 * @return {number} Calculated width.
 * @private
 */
anychart.elements.Legend.prototype.calculateContentWidth_ = function() {
  if (!goog.isDefAndNotNull(this.items_)) return 0;
  var fullWidth = 0;
  var width = 0;
  var maxWidth = -Number.MAX_VALUE;

  for (var i = 0, len = this.items_.length; i < len; i++) {
    width = this.items_[i].getWidth();
    fullWidth += width + this.itemsSpacing_;
    maxWidth = Math.max(maxWidth, width);
  }
  fullWidth -= this.itemsSpacing_;

  if (this.itemsLayout_ == anychart.elements.Legend.Layout.VERTICAL) {
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
anychart.elements.Legend.prototype.calculateContentHeight_ = function() {
  if (!goog.isDefAndNotNull(this.items_)) return 0;
  var fullHeight = 0;
  var height = 0;
  var maxHeight = -Number.MAX_VALUE;

  for (var i = 0, len = this.items_.length; i < len; i++) {
    height = this.items_[i].getHeight();
    fullHeight += height + this.itemsSpacing_;
    maxHeight = Math.max(maxHeight, height);
  }
  fullHeight -= this.itemsSpacing_;

  if (this.itemsLayout_ == anychart.elements.Legend.Layout.HORIZONTAL) {
    return maxHeight;
  } else {
    return fullHeight;
  }
};


/**
 * Calculate actual bounds.
 * @deprecated Old method to calculate legend bounds. Use calculateBounds_ instead.
 * @private
 */
anychart.elements.Legend.prototype.calculateLegendBounds_ = function() {
  var container = /** @type {acgraph.vector.ILayer} */ (this.container());
  var stage = container ? container.getStage() : null;

  /** @type {anychart.math.Rect} */
  var parentBounds;
  var parentWidth;
  var parentHeight;
  if (this.parentBounds_) {
    parentBounds = this.parentBounds_;
  } else if (stage) {
    parentBounds = stage.getBounds();
  } else {
    parentBounds = null;
  }

  var width, height;
  var autoWidth, autoHeight;

  // Define if there is autocalculation or not
  if (parentBounds) {
    parentWidth = parentBounds.width;
    parentHeight = parentBounds.height;
    if (goog.isDefAndNotNull(this.width_)) {
      width = anychart.utils.normalize(/** @type {number|string} */(this.width_), parentWidth);
      autoWidth = false;
    } else {
      width = 0;
      autoWidth = true;
    }
    if (goog.isDefAndNotNull(this.height_)) {
      height = anychart.utils.normalize(/** @type {number|string} */(this.height_), parentHeight);
      autoHeight = false;
    } else {
      height = 0;
      autoHeight = true;
    }
  } else {
    if (goog.isNumber(this.width_) && !isNaN(this.width_)) {
      autoWidth = false;
      width = this.width_;
    } else {
      autoWidth = true;
      width = 0;
    }
    if (goog.isNumber(this.height_) && !isNaN(this.height_)) {
      autoHeight = false;
      height = this.height_;
    } else {
      autoHeight = true;
      height = 0;
    }
  }

  var padding = this.padding();
  var margin = this.margin();

  var titleBounds;
  var title = /** @type {anychart.elements.Title} */(this.title());
  if (title.enabled()) {
    title.suspendSignalsDispatching();
    title.parentBounds(null);
    title.resumeSignalsDispatching(false);
    titleBounds = title.getContentBounds();
  } else titleBounds = null;

  var separatorBounds;
  var separator = /** @type {anychart.elements.Separator} */(this.titleSeparator());
  if (separator.enabled()) {
    separator.suspendSignalsDispatching();
    separator.parentBounds(null);
    separator.resumeSignalsDispatching(false);
    separatorBounds = separator.getContentBounds();
  } else separatorBounds = null;

  var paginatorBounds;
  var paginator = /** @type {anychart.ui.Paginator} */(this.paginator());
  paginator.suspendSignalsDispatching();
  paginator.parentBounds(null);
  paginatorBounds = paginator.getPixelBounds();
  paginator.resumeSignalsDispatching(false);


  var contentWidth = this.calculateContentWidth_();
  var contentHeight = this.calculateContentHeight_();
  var tightenWidth;

  if (autoWidth) {
    width += contentWidth;

    if (paginatorBounds) {
      switch (paginator.orientation()) {
        case anychart.utils.Orientation.LEFT:
        case anychart.utils.Orientation.RIGHT:
          width += paginatorBounds.width;
          break;
      }
    }
    width = Math.max(width, titleBounds ? titleBounds.width : 0);
    width = padding.widenWidth(width);
    tightenWidth = padding.tightenWidth(width);
  } else {
    tightenWidth = padding.tightenWidth(width);
  }
  var tightenHeight;
  if (autoHeight) {
    height += titleBounds ? titleBounds.height : 0;
    height += separatorBounds ? separatorBounds.height : 0;

    var paginatorHeight = 0;
    if (paginatorBounds) {
      switch (paginator.orientation()) {
        case anychart.utils.Orientation.TOP:
        case anychart.utils.Orientation.BOTTOM:
          height += paginatorBounds.height;
          break;
        default:
          paginatorHeight = paginatorBounds.height;
          break;
      }
    }
    height += Math.max(contentHeight, paginatorHeight);
    height = padding.widenHeight(height);
    tightenHeight = padding.tightenHeight(height);
  } else {
    tightenHeight = padding.tightenHeight(height);
  }

  var widthWithMargin = margin.widenWidth(width);
  var heightWithMargin = margin.widenHeight(height);

  if (parentBounds && parentWidth < widthWithMargin) {
    width = margin.tightenWidth(parentWidth);
    tightenWidth = padding.tightenWidth(width);
    widthWithMargin = margin.widenWidth(width);
  }

  if (parentBounds && parentHeight < heightWithMargin) {
    height = margin.tightenHeight(parentHeight);
    tightenHeight = padding.tightenHeight(height);
    heightWithMargin = margin.widenHeight(height);
  }

  var shouldEnablePaginator = false;
  switch (this.itemsLayout_) {
    case anychart.elements.Legend.Layout.TABLE:
    case anychart.elements.Legend.Layout.HORIZONTAL:
      switch (paginator.orientation()) {
        case anychart.utils.Orientation.TOP:
        case anychart.utils.Orientation.BOTTOM:
          if (contentWidth > width) {
            shouldEnablePaginator = true;
          }
          break;
        case anychart.utils.Orientation.LEFT:
        case anychart.utils.Orientation.RIGHT:
          if (contentWidth > width) {
            shouldEnablePaginator = true;
          }
          break;
      }
      break;
    case anychart.elements.Legend.Layout.VERTICAL:
      switch (paginator.orientation()) {
        case anychart.utils.Orientation.TOP:
        case anychart.utils.Orientation.BOTTOM:
          if (contentHeight > height) {
            shouldEnablePaginator = true;
          }
          break;
        case anychart.utils.Orientation.LEFT:
        case anychart.utils.Orientation.RIGHT:
          if (contentHeight > height) {
            shouldEnablePaginator = true;
          }
          break;
      }
      break;
  }
  paginator.suspendSignalsDispatching();
  paginator.enabled(shouldEnablePaginator);
  paginator.resumeSignalsDispatching(false);

  if (!shouldEnablePaginator) {
    if (autoWidth) {
      if (paginatorBounds) {
        switch (paginator.orientation()) {
          case anychart.utils.Orientation.LEFT:
          case anychart.utils.Orientation.RIGHT:
            width -= paginatorBounds.width;
            widthWithMargin -= paginatorBounds.width;
            tightenWidth -= paginatorBounds.width;
            break;
        }
      }
    }
    if (autoHeight) {
      if (paginatorBounds) {
        switch (paginator.orientation()) {
          case anychart.utils.Orientation.TOP:
          case anychart.utils.Orientation.BOTTOM:
            height -= paginatorBounds.height;
            heightWithMargin -= paginatorBounds.height;
            tightenHeight -= paginatorBounds.height;
            break;
        }
      }
    }
  }

  var pageWidth = tightenWidth;
  var pageHeight = tightenHeight - (titleBounds ? titleBounds.height : 0) - (separatorBounds ? separatorBounds.height : 0);

  if (paginator.enabled()) {
    switch (paginator.orientation()) {
      case anychart.utils.Orientation.LEFT:
      case anychart.utils.Orientation.RIGHT:
        pageWidth -= (paginatorBounds ? paginatorBounds.width : 0);
        break;
      case anychart.utils.Orientation.TOP:
      case anychart.utils.Orientation.BOTTOM:
        pageHeight -= (paginatorBounds ? paginatorBounds.height : 0);
        break;
    }
  }

  do {
    this.markConsistent(anychart.ConsistencyState.BOUNDS);
    this.distributeItemsInBounds_(pageWidth, pageHeight);
    paginator.suspendSignalsDispatching();
    paginator.parentBounds(null);
    paginator.resumeSignalsDispatching(false);
    paginatorBounds = paginator.getPixelBounds();
    pageWidth = tightenWidth - (paginatorBounds ? paginatorBounds.width : 0);
  } while (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS));

  if (parentBounds) {
    var left = parentBounds.getLeft();
    var top = parentBounds.getTop();
    switch (this.position_) {
      case anychart.utils.Orientation.LEFT:
      case anychart.utils.Orientation.RIGHT:
        switch (this.align_) {
          case anychart.utils.Align.CENTER:
            top = top + (parentHeight - heightWithMargin) / 2;
            break;
          case anychart.utils.Align.RIGHT:
          case anychart.utils.Align.BOTTOM:
            top = parentBounds.getBottom() - heightWithMargin;
            break;
        }
        break;
      case anychart.utils.Orientation.TOP:
      case anychart.utils.Orientation.BOTTOM:
        switch (this.align_) {
          case anychart.utils.Align.CENTER:
            left = left + (parentWidth - widthWithMargin) / 2;
            break;
          case anychart.utils.Align.RIGHT:
          case anychart.utils.Align.BOTTOM:
            left = parentBounds.getRight() - widthWithMargin;
            break;
        }
        break;
    }
    switch (this.position_) {
      case anychart.utils.Orientation.RIGHT:
        left = parentBounds.getRight() - widthWithMargin;
        break;
      case anychart.utils.Orientation.BOTTOM:
        top = parentBounds.getBottom() - heightWithMargin;
        break;
    }
  } else {
    left = anychart.utils.normalize(/** @type {string|number} */ (margin.left()), 0);
    top = anychart.utils.normalize(/** @type {string|number} */ (margin.top()), 0);
  }
  this.pixelBounds_ = new anychart.math.Rect(left, top, widthWithMargin, heightWithMargin);
};


/**
 * Calculate legend bounds.
 * @private
 */
anychart.elements.Legend.prototype.calculateBounds_ = function() {
  var container = /** @type {acgraph.vector.ILayer} */ (this.container());
  var stage = container ? container.getStage() : null;

  /** @type {anychart.math.Rect} */
  var parentBounds;
  /** @type {number} */
  var parentWidth;
  /** @type {number} */
  var parentHeight;

  if (this.parentBounds_) {
    parentBounds = this.parentBounds_;
  } else if (stage) {
    parentBounds = stage.getBounds();
  } else {
    parentBounds = null;
  }

  var autoWidth, autoHeight;
  var width, height;

  if (parentBounds) {
    parentWidth = parentBounds.width;
    parentHeight = parentBounds.height;
    if (goog.isDefAndNotNull(this.width_)) {
      width = anychart.utils.normalize(/** @type {number|string} */(this.width_), parentWidth);
      autoWidth = false;
    } else {
      width = 0;
      autoWidth = true;
    }
    if (goog.isDefAndNotNull(this.height_)) {
      height = anychart.utils.normalize(/** @type {number|string} */(this.height_), parentHeight);
      autoHeight = false;
    } else {
      height = 0;
      autoHeight = true;
    }
  } else {
    if (goog.isNumber(this.width_) && !isNaN(this.width_)) {
      autoWidth = false;
      width = this.width_;
    } else {
      autoWidth = true;
      width = 0;
    }
    if (goog.isNumber(this.height_) && !isNaN(this.height_)) {
      autoHeight = false;
      height = this.height_;
    } else {
      autoHeight = true;
      height = 0;
    }
  }

  var titleBounds;
  var title = /** @type {anychart.elements.Title} */(this.title());
  if (title.enabled()) {
    title.suspendSignalsDispatching();
    title.parentBounds(null);
    title.resumeSignalsDispatching(false);
    titleBounds = title.getContentBounds();
  } else titleBounds = null;

  var separatorBounds;
  var separator = /** @type {anychart.elements.Separator} */(this.titleSeparator());
  if (separator.enabled()) {
    separator.suspendSignalsDispatching();
    separator.parentBounds(null);
    separator.resumeSignalsDispatching(false);
    separatorBounds = separator.getContentBounds();
  } else separatorBounds = null;

  var paginatorBounds;
  var paginator = /** @type {anychart.ui.Paginator} */(this.paginator());
  paginator.suspendSignalsDispatching();
  paginator.parentBounds(null);
  paginatorBounds = paginator.getPixelBounds();

  paginator.resumeSignalsDispatching(false);

  var padding = this.padding();
  var margin = this.margin();

  var contentWidth = this.calculateContentWidth_();
  var contentHeight = this.calculateContentHeight_();
  var orientation;
  var enablePaginator;

  // force disable paginator
  paginator.suspendSignalsDispatching().enabled(false).resumeSignalsDispatching(false);
  if (autoWidth) {
    width += contentWidth;

    if (paginator.enabled()) {
      orientation = paginator.orientation();
      if (orientation == anychart.utils.Orientation.LEFT || orientation == anychart.utils.Orientation.RIGHT) width += paginatorBounds.width;
      else Math.max(width, paginatorBounds.width);
    }

    if (title.enabled()) {
      orientation = title.orientation();
      if (orientation == anychart.utils.Orientation.LEFT || orientation == anychart.utils.Orientation.RIGHT) width += titleBounds.width;
      else width = Math.max(width, titleBounds.width);
    }

    if (separator.enabled()) {
      orientation = separator.orientation();
      if (orientation == anychart.utils.Orientation.LEFT || orientation == anychart.utils.Orientation.RIGHT) width += separatorBounds.width;
      else Math.max(width, separatorBounds.width);
    }

    width = margin.widenWidth(padding.widenWidth(width));
    if (parentWidth &&
        width > parentWidth &&
        this.itemsLayout_ == anychart.elements.Legend.Layout.HORIZONTAL) paginator.suspendSignalsDispatching().enabled(true).resumeSignalsDispatching(false);
  } else {
    enablePaginator = false;
    if (paginatorBounds) {
      orientation = paginator.orientation();
      if (orientation == anychart.utils.Orientation.LEFT || orientation == anychart.utils.Orientation.RIGHT) {
        if (contentWidth + paginatorBounds.width > width) enablePaginator = true;
      } else {
        if (contentWidth > width) enablePaginator = true;
      }
    }
    if (this.itemsLayout_ == anychart.elements.Legend.Layout.HORIZONTAL) paginator.suspendSignalsDispatching().enabled(enablePaginator).resumeSignalsDispatching(false);
  }

  if (autoHeight) {
    height += contentHeight;
    if (paginator.enabled()) {
      orientation = paginator.orientation();
      if (orientation == anychart.utils.Orientation.TOP || orientation == anychart.utils.Orientation.BOTTOM) height += paginatorBounds.height;
      else height = Math.max(height, paginatorBounds.height);
    }
    if (title.enabled()) {
      orientation = title.orientation();
      if (orientation == anychart.utils.Orientation.TOP || orientation == anychart.utils.Orientation.BOTTOM) height += titleBounds.height;
      else height = Math.max(height, titleBounds.height);
    }
    if (separator.enabled()) {
      orientation = separator.orientation();
      if (orientation == anychart.utils.Orientation.TOP || orientation == anychart.utils.Orientation.BOTTOM) height += separatorBounds.height;
      else {
        separator.suspendSignalsDispatching().width(height).resumeSignalsDispatching(false);
        separatorBounds = separator.getContentBounds();
        height = Math.max(height, separatorBounds.height);
      }
    }

    height = margin.widenHeight(padding.widenHeight(height));
    if (parentHeight &&
        height > parentHeight &&
        this.itemsLayout_ == anychart.elements.Legend.Layout.VERTICAL) {
      paginator.suspendSignalsDispatching().enabled(true).resumeSignalsDispatching(false);
      if (autoWidth) width += paginatorBounds.width;
    }
  } else {
    enablePaginator = false;
    if (paginatorBounds) {
      orientation = paginator.orientation();
      if (orientation == anychart.utils.Orientation.TOP || orientation == anychart.utils.Orientation.BOTTOM) {
        if (contentHeight + paginatorBounds.height > height) enablePaginator = true;
      } else {
        if (contentHeight > height) enablePaginator = true;
      }
    }
    if (this.itemsLayout_ == anychart.elements.Legend.Layout.VERTICAL) paginator.suspendSignalsDispatching().enabled(enablePaginator).resumeSignalsDispatching(false);
  }

  if (parentWidth && width > parentWidth) width = parentWidth;
  if (parentHeight && height > parentHeight) height = parentHeight;

  var widthWithoutMargin = margin.tightenWidth(width);
  var heightWithoutMargin = margin.tightenHeight(height);

  var widthWithoutPadding = padding.tightenWidth(widthWithoutMargin);
  var heightWithoutPadding = padding.tightenHeight(heightWithoutMargin);

  var contentAreaWidth = widthWithoutPadding;
  var contentAreaHeight = heightWithoutPadding;

  if (title.enabled()) {
    orientation = title.orientation();
    if (orientation == anychart.utils.Orientation.TOP || orientation == anychart.utils.Orientation.BOTTOM) contentAreaHeight -= titleBounds.height;
    else contentAreaWidth -= titleBounds.width;
  }
  if (separator.enabled()) {
    orientation = separator.orientation();
    if (orientation == anychart.utils.Orientation.TOP || orientation == anychart.utils.Orientation.BOTTOM) contentAreaHeight -= separatorBounds.height;
    else contentAreaWidth -= separatorBounds.width;
  }
  var pageWidth = contentAreaWidth, pageHeight = contentAreaHeight;
  orientation = paginator.orientation();

  if (paginator.enabled()) {
    if (orientation == anychart.utils.Orientation.TOP || orientation == anychart.utils.Orientation.BOTTOM) pageHeight = contentAreaHeight - paginatorBounds.height;
    else pageWidth = contentAreaWidth - paginatorBounds.width;
  }

  do {
    this.markConsistent(anychart.ConsistencyState.BOUNDS);
    this.distributeItemsInBounds_(pageWidth, pageHeight);
    paginator.suspendSignalsDispatching();
    paginator.parentBounds(null);
    paginator.resumeSignalsDispatching(false);
    paginatorBounds = paginator.getPixelBounds();
    if (orientation == anychart.utils.Orientation.TOP || orientation == anychart.utils.Orientation.BOTTOM) pageHeight = contentAreaHeight - (paginatorBounds ? paginatorBounds.height : 0);
    else pageWidth = contentAreaWidth - (paginatorBounds ? paginatorBounds.width : 0);
  } while (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS));

  var left, top;
  if (parentBounds) {
    left = parentBounds.getLeft();
    top = parentBounds.getTop();
    switch (this.position_) {
      case anychart.utils.Orientation.LEFT:
      case anychart.utils.Orientation.RIGHT:
        switch (this.align_) {
          case anychart.utils.Align.CENTER:
            top = top + (parentHeight - height) / 2;
            break;
          case anychart.utils.Align.RIGHT:
          case anychart.utils.Align.BOTTOM:
            top = parentBounds.getBottom() - height;
            break;
        }
        break;
      case anychart.utils.Orientation.TOP:
      case anychart.utils.Orientation.BOTTOM:
        switch (this.align_) {
          case anychart.utils.Align.CENTER:
            left = left + (parentWidth - width) / 2;
            break;
          case anychart.utils.Align.RIGHT:
          case anychart.utils.Align.BOTTOM:
            left = parentBounds.getRight() - width;
            break;
        }
        break;
    }
    switch (this.position_) {
      case anychart.utils.Orientation.RIGHT:
        left = parentBounds.getRight() - width;
        break;
      case anychart.utils.Orientation.BOTTOM:
        top = parentBounds.getBottom() - height;
        break;
    }
  } else {
    left = anychart.utils.normalize(/** @type {string|number} */ (margin.left()), 0);
    top = anychart.utils.normalize(/** @type {string|number} */ (margin.top()), 0);
  }

  this.pixelBounds_ = new anychart.math.Rect(left, top, width, height);
};


/**
 * @inheritDoc
 */
anychart.elements.Legend.prototype.remove = function() {
  if (this.rootElement) this.rootElement.parent(null);
};


/**
 * Draw legend.
 */
anychart.elements.Legend.prototype.draw = function() {
  if (!this.checkDrawingNeeded())
    return;

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
      this.layer_.parent(this.rootElement).zIndex(30);
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

  if (this.hasInvalidationState(anychart.ConsistencyState.DATA)) {
    this.initializeLegendItems_();
    this.markConsistent(anychart.ConsistencyState.DATA);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    if (goog.isDefAndNotNull(this.items_)) {
      var textSettings = /** @type {Object} */ (this.textSettings());
      for (var i = 0, len = this.items_.length; i < len; i++) {
        this.items_[i].textSettings(textSettings);
        this.items_[i].applyTextSettings(this.items_[i].getTextElement(), false);
      }
    }
    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }

  this.clearLastDrawedPage_();
  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    this.calculateBounds_();
    this.invalidate(anychart.ConsistencyState.BACKGROUND |
        anychart.ConsistencyState.TITLE |
        anychart.ConsistencyState.SEPARATOR |
        anychart.ConsistencyState.PAGINATOR);
    this.rootElement.setTransformationMatrix(1, 0, 0, 1, 0, 0);
    this.rootElement.translate(this.pixelBounds_.left, this.pixelBounds_.top);
    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }

  var totalBounds = this.pixelBounds_.clone();
  totalBounds.left = 0;
  totalBounds.top = 0;

  var boundsWithoutMargin = this.margin().tightenBounds(totalBounds);

  if (this.hasInvalidationState(anychart.ConsistencyState.BACKGROUND)) {
    var background = /** @type {anychart.elements.Background} */(this.background());
    background.suspendSignalsDispatching();
    background.pixelBounds(boundsWithoutMargin);
    if (this.enabled()) background.container(this.rootElement);
    background.resumeSignalsDispatching(false);
    background.draw();
    this.markConsistent(anychart.ConsistencyState.BACKGROUND);
  }

  var boundsWithoutPadding = this.padding().tightenBounds(boundsWithoutMargin);

  if (this.hasInvalidationState(anychart.ConsistencyState.TITLE)) {
    var title = /** @type {anychart.elements.Title} */(this.title());
    title.suspendSignalsDispatching();
    title.parentBounds(boundsWithoutPadding);
    if (this.enabled()) title.container(this.rootElement);
    title.resumeSignalsDispatching(false);
    title.draw();
    this.markConsistent(anychart.ConsistencyState.TITLE);
  }

  var boundsWithoutTitle = this.title_ ? this.title_.getRemainingBounds() : boundsWithoutPadding;

  if (this.hasInvalidationState(anychart.ConsistencyState.SEPARATOR)) {
    var titleSeparator = /** @type {anychart.elements.Separator} */(this.titleSeparator());
    titleSeparator.suspendSignalsDispatching();
    titleSeparator.parentBounds(boundsWithoutTitle);
    if (this.enabled()) titleSeparator.container(this.rootElement);
    titleSeparator.resumeSignalsDispatching(false);
    titleSeparator.draw();
    this.markConsistent(anychart.ConsistencyState.SEPARATOR);
  }

  var boundsWithoutSeparator = this.titleSeparator_ ? this.titleSeparator_.getRemainingBounds() : boundsWithoutTitle;

  if (this.hasInvalidationState(anychart.ConsistencyState.PAGINATOR)) {
    var paginator = /** @type {anychart.ui.Paginator} */(this.paginator());
    paginator.suspendSignalsDispatching();
    paginator.parentBounds(boundsWithoutSeparator);
    if (this.enabled()) paginator.container(this.rootElement);
    paginator.resumeSignalsDispatching(false);
    paginator.draw();
    this.markConsistent(anychart.ConsistencyState.PAGINATOR);
  }

  var contentBounds = this.paginator().enabled() ? this.paginator().getRemainingBounds() : boundsWithoutSeparator;
  this.layer_.clip(/** @type {acgraph.math.Rect} */ (contentBounds));

  var pageToDraw = this.paginator().enabled() ? this.paginator().currentPage() - 1 : 0;
  //TODO(AntonKagakin): extract content bounds calculation to prototype method
  this.drawLegendContent_(pageToDraw, contentBounds);

  if (manualSuspend) stage.resume();
};


/**
 * Distribute items per pages.
 * @param {number} width Bounds of the content area.
 * @param {number} height Bounds of the content area.
 * @private
 */
anychart.elements.Legend.prototype.distributeItemsInBounds_ = function(width, height) {
  var i, len;
  var w, h;
  var page;

  this.distributedItems_ = [];

  page = 0;

  this.suspendSignalsDispatching();

  if (this.items_) {
    this.distributedItems_[page] = [];
    this.distributedItems_[page][0] = this.items_[0];
    if (this.itemsLayout_ == anychart.elements.Legend.Layout.HORIZONTAL) {
      w = this.items_[0].getWidth();
      for (i = 1, len = this.items_.length; i < len; i++) {
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
      h = this.items_[0].getHeight();
      for (i = 1, len = this.items_.length; i < len; i++) {
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
 * Create default paginator.
 * @private
 */
anychart.elements.Legend.prototype.initDefaultPaginator_ = function() {
  if (!this.paginator_) {
    this.paginator()
        .container(this.rootElement)
        .zIndex(20)
        .fontFamily('Verdana')
        .fontSize('10')
        .fontWeight('normal')
        .fontColor('rgb(35,35,35)')
        .orientation('right')
        .margin(0)
        .padding(2);
    this.paginator().background()
        .enabled(false)
        .stroke({
          'keys': [
            '0 #DDDDDD 1',
            '1 #D0D0D0 1'
          ],
          'angle' : '90'
        })
        .fill({
          'keys': [
            '0 #FFFFFF 1',
            '0.5 #F3F3F3 1',
            '1 #FFFFFF 1'
          ],
          'angle' : '90'
        });
    this.invalidate(anychart.ConsistencyState.PAGINATOR | anychart.ConsistencyState.BOUNDS);
  }
};


/**
 * Clears last drawed page.
 * @private
 */
anychart.elements.Legend.prototype.clearLastDrawedPage_ = function() {
  if (goog.isDefAndNotNull(this.drawedPage_) && !isNaN(this.drawedPage_)) {
    var items = this.distributedItems_[this.drawedPage_];
    if (items) {
      for (var i = 0; i < items.length; i++) {
        items[i].enabled(false).draw(0, 0);
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
anychart.elements.Legend.prototype.drawLegendContent_ = function(pageNumber, contentBounds) {
  // draw legend content
  if (goog.isDefAndNotNull(this.items_)) {
    var x = 0;
    var y = 0;
    var i;
    var items = this.distributedItems_[pageNumber];
    var item;
    if (items) {
      switch (this.itemsLayout_) {
        case anychart.elements.Legend.Layout.HORIZONTAL:
          for (i = 0; i < items.length; i++) {
            item = items[i];
            item
                .suspendSignalsDispatching()
                .parentBounds(contentBounds)
                .x(x)
                .y(y)
                .enabled(true)
                .resumeSignalsDispatching()
                .draw();
            x += items[i].getWidth() + this.itemsSpacing_;
          }
          break;
        case anychart.elements.Legend.Layout.VERTICAL:
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


/**
 * @inheritDoc
 */
anychart.elements.Legend.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');

  json['position'] = this.position();
  json['align'] = this.align();
  json['itemsSpacing'] = this.itemsSpacing();
  json['iconTextSpacing'] = this.iconTextSpacing();
  json['width'] = this.width();
  json['height'] = this.height();
  json['itemsLayout'] = this.itemsLayout();

  json['margin'] = this.margin().serialize();
  json['padding'] = this.padding().serialize();
  json['background'] = this.background().serialize();
  json['title'] = this.title().serialize();
  json['titleSeparator'] = this.titleSeparator().serialize();
  json['paginator'] = this.paginator().serialize();

  return json;
};


/**
 * @inheritDoc
 */
anychart.elements.Legend.prototype.deserialize = function(config) {
  this.suspendSignalsDispatching();

  goog.base(this, 'deserialize', config);

  this.position(config['position']);
  this.align(config['align']);
  this.itemsSpacing(config['itemsSpacing']);
  this.iconTextSpacing(config['iconTextSpacing']);
  this.width(config['config']);
  this.height(config['config']);
  this.itemsLayout(config['itemsLayout']);

  this.textSettings(config);

  if (config['margin']) this.margin().deserialize(config['margin']);
  if (config['padding']) this.padding().deserialize(config['padding']);
  this.background(config['background']);
  this.title(config['title']);
  this.titleSeparator(config['titleSeparator']);
  this.paginator(config['paginator']);

  this.resumeSignalsDispatching(true);

  return this;
};


/**
 * Type definition for legend item provider.
 * @includeDoc
 * @typedef {{
 *    index: (number|null|undefined),
 *    text: (string|null|undefined),
 *    iconType: (string|null|undefined),
 *    iconStroke: (acgraph.vector.Stroke|null|undefined),
 *    iconFill: (acgraph.vector.Fill|null|undefined),
 *    iconMarker: (string|null|undefined),
 *    meta: (Object|null|undefined)
 * }}
 */
anychart.elements.Legend.LegendItemProvider;
