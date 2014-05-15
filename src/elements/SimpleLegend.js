goog.provide('anychart.elements.Legend');
goog.require('anychart.elements.Background');
goog.require('anychart.elements.Separator');
goog.require('anychart.elements.Text');
goog.require('anychart.elements.Title');
goog.require('anychart.math.Rect');
goog.require('anychart.ui.Paginator');
goog.require('anychart.utils');
goog.require('anychart.utils.LegendItemsProvider');
goog.require('anychart.utils.Margin');
goog.require('anychart.utils.Padding');
goog.require('goog.array');


/**
 * Type definition for legend items provider.
 * @includeDoc
 * @typedef {!(
 *   Array |
 *   function():Array |
 *   anychart.utils.LegendItemsProvider
 * )}
 */
anychart.elements.LegendItemsProviderObject;



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
   * @type {anychart.elements.Legend.Align}
   * @private
   */
  this.align_ = anychart.elements.Legend.Align.CENTER;

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
   * Bounds of legend's parent element.
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
   * @type {Array.<anychart.elements.Legend.LegendItem_>}
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
  this.background(/** @type {anychart.elements.Background} */ (bg));
  //
  this.title()
      .enabled(true)
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

  this.titleSeparator()
      .enabled(true)
      .margin(0, 3, 3, 3)
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

  this.invalidate(anychart.ConsistencyState.ALL);
};
goog.inherits(anychart.elements.Legend, anychart.elements.Text);


/**
 * Supported signals.
 * @type {number}
 */
anychart.elements.Legend.prototype.SUPPORTED_SIGNALS = anychart.elements.Text.prototype.SUPPORTED_SIGNALS;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.elements.Legend.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.elements.Text.prototype.SUPPORTED_CONSISTENCY_STATES |
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
   * Horizontal distributing of items.
   */
  HORIZONTAL: 'horizontal',

  /**
   * Vertical distributing of items.
   */
  VERTICAL: 'vertical',

  /**
   * Table distributing.
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
 * Types of legend alignment.
 * @enum {string}
 */
anychart.elements.Legend.Align = {
  LEFT: 'left',
  CENTER: 'center',
  RIGHT: 'right'
};


/**
 * Normalize align value for legend.
 * @param {string} align Align to normalize.
 * @param {anychart.elements.Legend.Align=} opt_default Default align to set.
 * @return {anychart.elements.Legend.Align} Normalized align.
 */
anychart.elements.Legend.normalizeAlign = function(align, opt_default) {
  if (goog.isString(align)) {
    align = align.toLowerCase();
    for (var i in anychart.elements.Legend.Align) {
      if (align == anychart.elements.Legend.Align[i])
        return anychart.elements.Legend.Align[i];
    }
  }
  return opt_default || anychart.elements.Legend.Align.CENTER;
};


/**
 * Sets items layout.
 * @param {string=} opt_value Layout type for legend items.
 * @return {(anychart.elements.Legend.Layout|anychart.elements.Legend)} Items layout or self for chaining.
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
 * @return {anychart.elements.LegendItemsProviderObject} Legend items provider.
 *//**
 * Setter for items provider.
 * @param {anychart.elements.LegendItemsProviderObject=} opt_value Items provider.
 * @return {!anychart.elements.Legend} An instance of the {@link anychart.elements.Legend} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {anychart.elements.LegendItemsProviderObject=} opt_value Items provider.
 * @return {(anychart.elements.LegendItemsProviderObject|anychart.elements.Legend)} Legend items provider.
 */
anychart.elements.Legend.prototype.itemsProvider = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var val;
    if (goog.isFunction(opt_value)) val = opt_value();
    if (goog.isArrayLike(opt_value) || goog.isString(opt_value)) val = goog.array.slice(/** @type {goog.array.ArrayLike} */ (opt_value), 0);

    if (goog.isArray(val) && val.length > 0) {
      goog.dispose(this.itemsProvider_);
      this.itemsProvider_ = new anychart.utils.LegendItemsProvider(val);
      this.registerDisposable(this.itemsProvider_);
      this.invalidate(anychart.ConsistencyState.DATA, anychart.Signal.NEEDS_REDRAW);
    } else if (opt_value instanceof anychart.utils.LegendItemsProvider && opt_value != this.itemsProvider_) {
      goog.dispose(this.itemsProvider_);
      this.itemsProvider_ = opt_value;
      this.invalidate(anychart.ConsistencyState.DATA, anychart.Signal.NEEDS_REDRAW);
    } else {
      this.itemsProvider_ = null;
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
 * @return {(string|number|anychart.elements.Legend)} Items spacing setting or self for chaining.
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
 * @return {(number|anychart.elements.Legend)} Spacing setting or self for chaining.
 */
anychart.elements.Legend.prototype.iconTextSpacing = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = !isNaN(parseFloat(opt_value)) ? opt_value : 5;
    if (this.iconTextSpacing_ != opt_value) {
      this.iconTextSpacing_ = parseFloat(opt_value);
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
 * @return {!(anychart.elements.Legend|anychart.utils.Margin)} Margin or self for chaining.
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
 * @return {!(anychart.elements.Legend|anychart.utils.Padding)} Padding or self for chaining.
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
 * @return {!anychart.elements.Background} Background or self for chaining.
 *//**
 * Setter for legend background.
 * @param {anychart.elements.Background=} opt_value Background setting.
 * @return {!anychart.elements.Legend} An instance of the {@link anychart.elements.Legend} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {anychart.elements.Background=} opt_value Background setting.
 * @return {!(anychart.elements.Legend|anychart.elements.Background)} Background or self for chaining.
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
 * <b>Note:</b> Что бы отключить title надо передать null или 'none'.
 * @param {(string|null|anychart.elements.Title)=} opt_value Value to set.
 * @return {!anychart.elements.Legend} An instance of the {@link anychart.elements.Legend} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(string|null|anychart.elements.Title)=} opt_value Title to set.
 * @return {(anychart.elements.Title|anychart.elements.Legend)} Title or self for chaining.
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
  // Если ни одного сингнала нет, то state == 0 и ничего не произойдет.
  this.invalidate(state, signal);
};


/**
 * Getter for title separator setting.
 * @return {anychart.elements.Separator} Current settings.
 *//**
 * Setter for title separator setting.<br/>
 * <b>Note:</b> Что бы отключить titleSeparator надо передать null или 'none'.
 * @param {(Object|string|null|anychart.elements.Separator)=} opt_value Value to set.
 * @return {!anychart.elements.Legend} An instance of the {@link anychart.elements.Legend} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {*=} opt_value Separator setting.
 * @return {(*|anychart.elements.Legend)} Separator setting or self for chaining.
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
  // Если ни одного сингнала нет, то state == 0 и ничего не произойдет.
  this.invalidate(state, signal);
};


/**
 * Getter for paginator setting.
 * @return {anychart.elements.Separator} Current settings.
 *//**
 * Setter for paginator setting.<br/>
 * <b>Note:</b> Что бы отключить Paginator надо передать null или 'none'.
 * @param {(Object|anychart.elements.Paginator|string|null)=} opt_value Value to set.
 * @return {!anychart.elements.Legend} An instance of the {@link anychart.elements.Legend} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {*=} opt_value Paginator to set.
 * @return {(*|anychart.elements.Legend)} Paginator or self for chaining.
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
  // Если ни одного сингнала нет, то state == 0 и ничего не произойдет.
  this.invalidate(state, signal);
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
 * Getter for legend's parent element bounds.
 * @return {anychart.math.Rect} Parent element bounds.
 *//**
 * Setter for legend's parent element bounds.
 * @param {anychart.math.Rect=} opt_value Value to set.
 * @return {!anychart.elements.Legend} An instance of the {@link anychart.elements.Legend} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {anychart.math.Rect=} opt_value Parent element bounds to set.
 * @return {(anychart.math.Rect|!anychart.elements.Legend)} Parent element bounds or self for chaining.
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
 * @return {(anychart.utils.Orientation|anychart.elements.Legend)} Legend position or self for chaining.
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
 * @return {anychart.elements.Legend.Align} Legend align.
 *//**
 * Setter for legend align setting.
 * @param {(anychart.elements.Legend.Align|string)=} opt_value Value to set.
 * @return {!anychart.elements.Legend} An instance of the {@link anychart.elements.Legend} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(anychart.elements.Legend.Align|string)=} opt_value Legend align.
 * @return {(anychart.elements.Legend.Align|anychart.elements.Legend)} Legend align or self for chaining.
 */
anychart.elements.Legend.prototype.align = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.elements.Legend.normalizeAlign(opt_value);
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
 * @return {anychart.math.Rect} Bounds that remaining after legend.
 */
anychart.elements.Legend.prototype.getRemainingBounds = function() {
  if (!this.pixelBounds_ || this.hasInvalidationState(anychart.ConsistencyState.BOUNDS))
    this.calculateLegendBounds_();
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
  if (this.itemsProvider_) {
    goog.disposeAll(this.items_);
    this.items_ = [];
    var settingsObj = this.textSettings();
    for (var i = 0; i < this.itemsProvider_.getItemsCount(); i++) {
      this.items_.push(
          new anychart.elements.Legend.LegendItem_(
              this.itemsProvider_.getItemText(i),
              this.itemsProvider_.getItemIconColor(i),
              this.iconTextSpacing_,
              /** @type {Object} */ (settingsObj),
              this.itemsProvider_.getItem(i)
          )
      );
      this.items_[i].container(this.layer_);
      this.items_[i].enabled(false);
    }
  } else {
    goog.disposeAll(this.items_);
    this.items_ = null;
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

  // Определяем будет ли авторасчет или нет.
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

  var titleBounds, separatorBounds, paginatorBounds;

  if (this.title_ && this.title_.enabled()) {
    titleBounds = this.title_.getContentBounds();
  } else titleBounds = undefined;

  if (this.titleSeparator_ && this.titleSeparator_.enabled()) {
    separatorBounds = this.titleSeparator_.getContentBounds();
  } else separatorBounds = undefined;

  if (this.paginator_ && this.paginator_.enabled()) {
    paginatorBounds = this.paginator_.getPixelBounds();
  } else paginatorBounds = undefined;

  if (autoWidth) {
    width += this.calculateContentWidth_();

    if (paginatorBounds) {
      switch (this.paginator_.orientation()) {
        case anychart.utils.Orientation.LEFT:
        case anychart.utils.Orientation.RIGHT:
          width += paginatorBounds.width;
          break;
      }
    }
    width = Math.max.call(null, width, titleBounds ? titleBounds.width : 0);
    width = padding.widenWidth(width);
  } else {
    width = padding.tightenWidth(width);
  }

  if (autoHeight) {
    height += titleBounds ? titleBounds.height : 0;
    height += separatorBounds ? separatorBounds.height : 0;

    var paginatorHeight = 0;
    if (paginatorBounds) {
      switch (this.paginator_.orientation()) {
        case anychart.utils.Orientation.TOP:
        case anychart.utils.Orientation.BOTTOM:
          height += paginatorBounds.height;
          break;
        default:
          paginatorHeight = paginatorBounds.height;
          break;
      }
    }
    height += Math.max(this.calculateContentHeight_(), paginatorHeight);
    height = padding.widenHeight(height);
  } else {
    height = padding.tightenHeight(height);
  }

  if (parentBounds && parentWidth < width) {
    width = margin.tightenWidth(parentWidth);
  }

  if (parentBounds && parentHeight < height) {
    height = margin.tightenHeight(parentHeight);
  }

  var widthWithMargin = margin.widenWidth(width);
  var heightWithMargin = margin.widenHeight(height);
  var bounds;

  if (parentBounds) {
    var left = parentBounds.getLeft();
    var top = parentBounds.getTop();
    switch (this.position_) {
      case anychart.utils.Orientation.LEFT:
      case anychart.utils.Orientation.RIGHT:
        switch (this.align_) {
          case anychart.elements.Legend.Align.CENTER:
            top = top + (parentHeight - heightWithMargin) / 2;
            break;
          case anychart.elements.Legend.Align.RIGHT:
            top = parentBounds.getBottom() - heightWithMargin;
            break;
        }
        break;
      case anychart.utils.Orientation.TOP:
      case anychart.utils.Orientation.BOTTOM:
        switch (this.align_) {
          case anychart.elements.Legend.Align.CENTER:
            left = left + (parentWidth - widthWithMargin) / 2;
            break;
          case anychart.elements.Legend.Align.RIGHT:
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
  bounds = new anychart.math.Rect(left, top, width, height);
  this.pixelBounds_ = margin.widenBounds(bounds);
  this.backgroundWidth_ = width;
  this.backgroundHeight_ = height;
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
    this.rootElement = acgraph.layer();
    if (!this.layer_) (this.layer_ = acgraph.layer()).parent(this.rootElement).zIndex(30);
    this.registerDisposable(this.layer_);
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

  if (this.background_ && !this.background_.container()) {
    this.background_.container(this.rootElement);
    this.background_.zIndex(0);
  }

  if (this.title_ && !this.title_.container()) {
    this.title_.container(this.rootElement);
    this.title_.zIndex(10);
  }

  if (this.titleSeparator_ && !this.titleSeparator_.container()) {
    this.titleSeparator_.container(this.rootElement);
    this.titleSeparator_.zIndex(10);
  }

  if (this.paginator_ && !this.paginator_.container()) {
    this.paginator_.container(this.rootElement);
    this.paginator_.zIndex(20);
  }

  var stage = container ? container.getStage() : null;
  var manualSuspend = stage && !stage.isSuspended();
  if (manualSuspend) stage.suspend();

  if (this.hasInvalidationState(anychart.ConsistencyState.DATA)) {
    this.initializeLegendItems_();
    this.markConsistent(anychart.ConsistencyState.DATA);
    this.needRedistribution_ = true;
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    if (goog.isDefAndNotNull(this.items_)) {
      for (var i = 0, len = this.items_.length; i < len; i++) {
        var textElement = this.items_[i].getTextElement();
        this.items_[i].textSettings(/** @type {Object} */ (this.textSettings()));
        this.items_[i].applyTextSettings.call(this.items_[i], /** @type {!acgraph.vector.Text} */ (textElement), false);
      }
    }
    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    this.calculateLegendBounds_();
    this.invalidate(anychart.ConsistencyState.BACKGROUND |
        anychart.ConsistencyState.TITLE |
        anychart.ConsistencyState.SEPARATOR |
        anychart.ConsistencyState.PAGINATOR);
    this.rootElement.setTransformationMatrix(1, 0, 0, 1, 0, 0);
    this.rootElement.translate(this.pixelBounds_.left, this.pixelBounds_.top);
    this.markConsistent(anychart.ConsistencyState.BOUNDS);
    this.needRedistribution_ = true;
  }

  var totalBounds = this.pixelBounds_.clone();
  var parentBounds = this.parentBounds();
  var parentWidth = /** @type {number} */ (parentBounds ? parentBounds.width : undefined);
  var parentHeight = /** @type {number} */ (parentBounds ? parentBounds.height : undefined);
  var margin = this.margin();
  totalBounds.left = anychart.utils.normalize(/** @type {string|number} */(margin.left()), parentWidth);
  totalBounds.top = anychart.utils.normalize(/** @type {string|number} */(margin.top()), parentHeight);

  var boundsWithoutMargin = this.margin().tightenBounds(totalBounds);

  if (this.hasInvalidationState(anychart.ConsistencyState.BACKGROUND)) {
    this.background_.suspendSignalsDispatching();
    this.background_.pixelBounds(boundsWithoutMargin);
    this.background_.resumeSignalsDispatching(false);
    this.background_.draw();
    this.markConsistent(anychart.ConsistencyState.BACKGROUND);
  }

  var boundsWithoutPadding = this.padding().tightenBounds(boundsWithoutMargin);

  if (this.title_ && this.hasInvalidationState(anychart.ConsistencyState.TITLE)) {
    this.title_.suspendSignalsDispatching();
    this.title_.parentBounds(boundsWithoutPadding);
    this.title_.resumeSignalsDispatching(false);
    this.title_.draw();
    this.markConsistent(anychart.ConsistencyState.TITLE);
  }

  var boundsWithoutTitle = this.title_ ? this.title_.getRemainingBounds() : boundsWithoutPadding;

  if (this.titleSeparator_ && this.hasInvalidationState(anychart.ConsistencyState.SEPARATOR)) {
    this.titleSeparator_.suspendSignalsDispatching();
    this.titleSeparator_.parentBounds(boundsWithoutTitle);
    this.titleSeparator_.resumeSignalsDispatching(false);
    this.titleSeparator_.draw();
    this.markConsistent(anychart.ConsistencyState.SEPARATOR);
  }

  var boundsWithoutSeparator = this.titleSeparator_ ? this.titleSeparator_.getRemainingBounds() : boundsWithoutTitle;

  if (this.paginator_ && this.hasInvalidationState(anychart.ConsistencyState.PAGINATOR)) {
    this.paginator_.suspendSignalsDispatching();
    this.paginator_.parentBounds(boundsWithoutSeparator);
    this.paginator_.resumeSignalsDispatching(false);
    this.paginator_.draw();
    this.markConsistent(anychart.ConsistencyState.PAGINATOR);
  } else this.markConsistent(anychart.ConsistencyState.PAGINATOR);

  var contentBounds = this.paginator_ ? this.paginator_.getRemainingBounds() : boundsWithoutSeparator;

  this.clearLastDrawedPage_();

  if (this.needRedistribution_) {
    //TODO(AntonKagakin): учесть бесконечный цикл ^_^
    do {
      this.markConsistent(anychart.ConsistencyState.BOUNDS);
      this.distributeItemsInBounds_(contentBounds);
      if (this.paginator_) this.paginator_.parentBounds(boundsWithoutSeparator);
      contentBounds = this.paginator_ ? this.paginator_.getRemainingBounds() : boundsWithoutSeparator;
    } while (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS));

    this.needRedistribution_ = false;
  }
  this.layer_.clip(/** @type {acgraph.math.Rect} */ (contentBounds));

  if (this.paginator_ && this.hasInvalidationState(anychart.ConsistencyState.PAGINATOR)) {
    this.paginator_.suspendSignalsDispatching();
    this.paginator_.parentBounds(boundsWithoutSeparator);
    this.paginator_.resumeSignalsDispatching(false);
    this.paginator_.draw();
    this.markConsistent(anychart.ConsistencyState.PAGINATOR | anychart.ConsistencyState.BOUNDS);
  } else this.markConsistent(anychart.ConsistencyState.PAGINATOR | anychart.ConsistencyState.BOUNDS);

  this.drawLegendContent_(this.paginator_ ? this.paginator_.currentPage() - 1 : 0, contentBounds);

  if (manualSuspend) stage.resume();
};


/**
 * Distribute items per pages.
 * @param {anychart.math.Rect} bounds Bounds of the content area.
 * @private
 */
anychart.elements.Legend.prototype.distributeItemsInBounds_ = function(bounds) {
  var contentWidth = this.calculateContentWidth_();
  var contentHeight = this.calculateContentHeight_();
  var pageWidth = bounds.width;
  var pageHeight = bounds.height;
  var i, len;
  var w, h;
  var page;

  this.distributedItems_ = [];
  if (this.itemsLayout_ == anychart.elements.Legend.Layout.HORIZONTAL) {
    if (contentWidth > pageWidth) this.initDefaultPaginator_();
  } else {
    if (contentHeight > pageHeight) this.initDefaultPaginator_();
  }

  page = 0;

  var hasPaginator = !!(this.paginator_);
  this.suspendSignalsDispatching();

  if (this.items_) {
    this.distributedItems_[page] = [];
    this.distributedItems_[page][0] = this.items_[0];
    if (this.itemsLayout_ == anychart.elements.Legend.Layout.HORIZONTAL) {
      w = this.items_[0].getWidth();
      for (i = 1, len = this.items_.length; i < len; i++) {
        if (w + this.itemsSpacing_ + this.items_[i].getWidth() > pageWidth) {
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
        if (h + this.itemsSpacing_ + this.items_[i].getHeight() > pageHeight) {
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

  if (hasPaginator) {
    this.paginator().pageCount(page + 1);
  }
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
 * Draws distributed legend items on set page.
 * @param {number} pageNumber Page number.
 * @param {anychart.math.Rect} contentBounds Bounds of the content area.
 * @private
 */
anychart.elements.Legend.prototype.drawLegendContent_ = function(pageNumber, contentBounds) {
  // draw legend content
  if (goog.isDefAndNotNull(this.items_)) {
    var x = contentBounds.left;
    var y = contentBounds.top;
    var i;
    var items = this.distributedItems_[pageNumber];
    if (items) {
      switch (this.itemsLayout_) {
        case anychart.elements.Legend.Layout.HORIZONTAL:
          for (i = 0; i < items.length; i++) {
            items[i].enabled(true).draw(x, y);
            x += items[i].getWidth() + this.itemsSpacing_;
          }
          break;
        case anychart.elements.Legend.Layout.VERTICAL:
          for (i = 0; i < items.length; i++) {
            items[i].enabled(true).draw(x, y);
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
 * Inner class for representing legend item.
 * @param {string} itemText Legend item text.
 * @param {acgraph.vector.Fill} itemIconColor Legend item icon color.
 * @param {number} iconTextSpacing Space between item icon and item text.
 * @param {Object} settingsObj Text settings object.
 * @param {Object} rawItem Raw item as it was set in provider.
 * @extends {anychart.elements.Text}
 * @constructor
 * @private
 */
anychart.elements.Legend.LegendItem_ = function(itemText, itemIconColor, iconTextSpacing, settingsObj, rawItem) {
  goog.base(this);
  this.textSettings(settingsObj);
  this.itemText_ = itemText;
  this.itemIconColor_ = itemIconColor;
  this.iconTextSpacing_ = iconTextSpacing;

  /**
   * Legen icon path.
   * @type {acgraph.vector.Path}
   * @private
   */
  this.icon_ = acgraph.path();
  this.registerDisposable(this.icon_);

  /**
   * Legend icon text element.
   * @type {acgraph.vector.Text}
   * @private
   */
  this.textElement_ = acgraph.text();
  this.registerDisposable(this.textElement_);

  this.textElement_.text(this.itemText_);
  this.applyTextSettings(this.textElement_, true);


  /**
   * Size of the icon.
   * @type {number}
   * @private
   */
  this.iconSize_ = this.textElement_.getBounds().height;

  /**
   * Raw item as it set in items provider.
   * @type {*}
   * @private
   */
  this.rawItem_ = rawItem;

  this.invalidate(anychart.ConsistencyState.ALL);
};
goog.inherits(anychart.elements.Legend.LegendItem_, anychart.elements.Text);


/**
 * Supported signals.
 * @type {number}
 */
anychart.elements.Legend.LegendItem_.prototype.SUPPORTED_SIGNALS = anychart.elements.Text.prototype.SUPPORTED_SIGNALS;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.elements.Legend.LegendItem_.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.elements.Text.prototype.SUPPORTED_CONSISTENCY_STATES;


/**
 * Legend item text element.
 * @return {acgraph.vector.Text} Text element.
 */
anychart.elements.Legend.LegendItem_.prototype.getTextElement = function() {
  return this.textElement_;
};


/**
 * Calculating width of legend item.
 * @return {number} Width.
 */
anychart.elements.Legend.LegendItem_.prototype.getWidth = function() {
  return this.getHeight() + this.iconTextSpacing_ + this.textElement_.getBounds().width;
};


/**
 * Calculating height of legend item.
 * @return {number} Height.
 */
anychart.elements.Legend.LegendItem_.prototype.getHeight = function() {
  return (this.iconSize_ = this.textElement_.getBounds().height);
};


/**
 * Draws icon.
 * @param {acgraph.vector.Path} path Path of the icon.
 * @param {number} size Size of icon.
 * @private
 */
anychart.elements.Legend.LegendItem_.prototype.drawIcon_ = function(path, size) {
  path.clear();

  // square
  path.moveTo(0, 0)
      .lineTo(size, 0)
      .lineTo(size, size)
      .lineTo(0, size)
      .close();
};


/**
 * @inheritDoc
 */
anychart.elements.Legend.LegendItem_.prototype.remove = function() {
  this.icon_.parent(null);
  this.textElement_.parent(null);
};


/**
 * Draws item.
 * @param {number} x x coordinate.
 * @param {number} y y coordinate.
 */
anychart.elements.Legend.LegendItem_.prototype.draw = function(x, y) {
  if (!this.checkDrawingNeeded())
    return;

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    var zIndex = /** @type {number} */ (this.zIndex());
    this.icon_.zIndex(zIndex);
    this.textElement_.zIndex(zIndex);
    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    var container = /** @type {acgraph.vector.ILayer} */(this.container());
    this.icon_.parent(container);
    this.textElement_.parent(container);
    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    this.drawIcon_(this.icon_, this.iconSize_);
    this.icon_.fill(this.itemIconColor_);
    this.icon_.stroke('none');
    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }

  this.icon_.setTransformationMatrix(1, 0, 0, 1, 0, 0);
  this.icon_.translate(x, y);
  this.textElement_.setTransformationMatrix(1, 0, 0, 1, 0, 0);
  this.textElement_.translate(x + this.iconSize_ + this.iconTextSpacing_, y);

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }
};
