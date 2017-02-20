//region --- Requiring and Providing
goog.provide('anychart.core.ui.Legend');
goog.require('acgraph.vector.Text.TextOverflow');
goog.require('anychart.core.IStandaloneBackend');
goog.require('anychart.core.Text');
goog.require('anychart.core.ui.Background');
goog.require('anychart.core.ui.LegendItem');
goog.require('anychart.core.ui.Paginator');
goog.require('anychart.core.ui.Separator');
goog.require('anychart.core.ui.Title');
goog.require('anychart.core.ui.Tooltip');
goog.require('anychart.core.utils.ITokenProvider');
goog.require('anychart.core.utils.Margin');
goog.require('anychart.core.utils.Padding');
goog.require('anychart.enums');
goog.require('anychart.math.Rect');
goog.require('anychart.utils');
goog.require('goog.array');
goog.require('goog.object');
//endregion



/**
 * Legend element.
 * @constructor
 * @implements {anychart.core.utils.ITokenProvider}
 * @implements {anychart.core.IStandaloneBackend}
 * @extends {anychart.core.Text}
 */
anychart.core.ui.Legend = function() {
  anychart.core.ui.Legend.base(this, 'constructor');

  /**
   * Drag.
   * @type {boolean}
   * @private
   */
  this.drag_;

  /**
   * Position of the legend.
   * @type {anychart.enums.Orientation}
   * @private
   */
  this.position_;

  /**
   * Position mode of the legend.
   * @type {anychart.enums.LegendPositionMode}
   * @private
   */
  this.positionMode_;

  /**
   * Align of the legend.
   * @type {anychart.enums.Align}
   * @private
   */
  this.align_;

  /**
   * Spacing between items.
   * @type {number}
   * @private
   */
  this.itemsSpacing_ = NaN;

  /**
   * Spacing between icon and text in legend item.
   * @type {number}
   * @private
   */
  this.iconTextSpacing_ = NaN;

  /**
   * Width of legend element.
   * @type {?(number|string)}
   * @private
   */
  this.width_ = null;

  /**
   * Max width of legend element.
   * @type {?(number|string)}
   * @private
   */
  this.maxWidth_ = null;

  /**
   * Height of legend element.
   * @type {?(number|string)}
   * @private
   */
  this.height_ = null;

  /**
   * Max height of legend element.
   * @type {?(number|string)}
   * @private
   */
  this.maxHeight_ = null;

  /**
   * Default layout of legend.
   * @type {anychart.enums.LegendLayout}
   * @private
   */
  this.itemsLayout_;

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
  this.itemsLayer_ = null;

  /**
   * @type {number}
   * @private
   */
  this.drawedPage_ = NaN;

  /**
   * Legend items text formatter.
   * @type {?(Function|string)}
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
   * Title text formatter. If set, overrides the title text.
   * @type {?(Function|string)}
   * @private
   */
  this.titleFormatter_ = null;

  /**
   * Hover cursor setting.
   * @type {?anychart.enums.Cursor}
   * @private
   */
  this.hoverCursor_;

  /**
   * @type {boolean}
   * @private
   */
  this.inverted_ = false;

  this.invalidate(anychart.ConsistencyState.ALL);

  this.bindHandlersToComponent(this, this.handleMouseOver_, this.handleMouseOut_, null, this.handleMouseMove_, null, this.handleMouseClick_);
};
goog.inherits(anychart.core.ui.Legend, anychart.core.Text);


//region --- Class definitions
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
    anychart.ConsistencyState.LEGEND_PAGINATOR |
    anychart.ConsistencyState.LEGEND_RECREATE_ITEMS |
    anychart.ConsistencyState.LEGEND_DRAG;


/**
 * Type definition for legend item provider.
 * @includeDoc
 * @typedef {{
 *    index: (number|null|undefined),
 *    text: (string|null|undefined),
 *    iconEnabled: (boolean|undefined),
 *    iconType: (Function|string|null|undefined),
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


//endregion
//region --- Settings
/**
 * Getter/Setter for hover cursor setting.
 * @param {(string|anychart.enums.Cursor)=} opt_value hover cursor setting.
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
 * Sets items layout.
 * @param {(anychart.enums.LegendLayout|string)=} opt_value Layout type for legend items.
 * @return {(anychart.enums.LegendLayout|anychart.core.ui.Legend)} Items layout or self for method chaining.
 */
anychart.core.ui.Legend.prototype.itemsLayout = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeLegendLayout(opt_value, this.itemsLayout_);
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
 * @param {Array.<anychart.core.ui.Legend.LegendItemProvider>=} opt_value Items.
 * @return {(Array.<anychart.core.ui.Legend.LegendItemProvider>|anychart.core.ui.Legend)} Custom items or self for chaining.
 */
anychart.core.ui.Legend.prototype.items = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.customItems_ != opt_value) {
      this.customItems_ = opt_value;
      this.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.LEGEND_RECREATE_ITEMS,
          anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.customItems_;
};


/**
 * .
 * @param {Array.<Object>} sourceArray Array of source.
 * @return {boolean} .
 */
anychart.core.ui.Legend.prototype.sourceEquals = function(sourceArray) {
  if (!this.itemsSourceInternal || !sourceArray || (this.itemsSourceInternal.length != sourceArray.length))
    return false;

  for (var i = 0; i < sourceArray.length; i++) {
    if (this.itemsSourceInternal[i] != sourceArray[i])
      return false;
  }

  return true;
};


/**
 * Getter/setter for items source.
 * @param {(anychart.core.SeparateChart|anychart.core.stock.Plot|Array.<anychart.core.SeparateChart|anychart.core.stock.Plot>)=} opt_value Items source.
 * @return {(anychart.core.SeparateChart|anychart.core.stock.Plot|Array.<anychart.core.SeparateChart|anychart.core.stock.Plot>|anychart.core.ui.Legend)} Items source or self for chaining.
 */
anychart.core.ui.Legend.prototype.itemsSource = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = goog.isArray(opt_value) ?
        goog.array.slice(/** @type {Array.<anychart.core.SeparateChart|anychart.core.stock.Plot>} */ (opt_value), 0) :
        goog.isNull(opt_value) ?
            opt_value : [opt_value];
    if (!this.sourceEquals(opt_value)) {
      this.itemsSourceInternal = opt_value;
      this.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.LEGEND_RECREATE_ITEMS,
          anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.itemsSourceInternal;
};


/**
 * Getter/setter for items source mode.
 * @param {(anychart.enums.LegendItemsSourceMode|string)=} opt_value Items source mode.
 * @return {anychart.enums.LegendItemsSourceMode|anychart.core.ui.Legend} Items source mode or self for chaining.
 */
anychart.core.ui.Legend.prototype.itemsSourceMode = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeLegendItemsSourceMode(opt_value);
    if (this.itemsSourceMode_ != opt_value) {
      this.itemsSourceMode_ = opt_value;
      this.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.LEGEND_RECREATE_ITEMS,
          anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.itemsSourceMode_;
};


/**
 * Getter/setter for items formatter
 * @param {function(Array.<anychart.core.ui.Legend.LegendItemProvider>):Array.<anychart.core.ui.Legend.LegendItemProvider>=} opt_value Formatter function.
 * @return {(function(Array.<anychart.core.ui.Legend.LegendItemProvider>):Array.<anychart.core.ui.Legend.LegendItemProvider>|anychart.core.ui.Legend)} Formatter function or self for chaining.
 */
anychart.core.ui.Legend.prototype.itemsFormatter = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.itemsFormatter_ != opt_value) {
      this.itemsFormatter_ = opt_value;
      this.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.LEGEND_RECREATE_ITEMS,
          anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.itemsFormatter_;
};


/**
 * Getter/setter for items text formatter.
 * @param {(string|Function)=} opt_value Items text formatter function.
 * @return {(Function|string|anychart.core.ui.Legend)} Items text formatter function or self for chaining.
 */
anychart.core.ui.Legend.prototype.itemsTextFormatter = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.itemsTextFormatter_ != opt_value) {
      this.itemsTextFormatter_ = opt_value;
      this.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.LEGEND_RECREATE_ITEMS,
          anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.itemsTextFormatter_;
};


/**
 * Getter/setter for itemsSpacing.
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
 * Getter/setter for iconTextSpacing.
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
 * Getter/setter for icon size.
 * @param {(number|string)=} opt_value Icon size setting.
 * @return {(number|anychart.core.ui.Legend)} Icon size setting or self for method chaining.
 */
anychart.core.ui.Legend.prototype.iconSize = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.utils.toNumber(opt_value);
    if (this.iconSize_ != opt_value) {
      this.iconSize_ = opt_value;
      if (goog.isDefAndNotNull(this.items_)) {
        for (var i = 0, len = this.items_.length; i < len; i++) {
          this.items_[i].iconSize(this.iconSize_);
        }
      }
      this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.iconSize_;
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
 * Getter/setter for background.
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
 * Getter/setter for title.
 * @param {(null|boolean|Object|string)=} opt_value Title to set.
 * @return {!(anychart.core.ui.Title|anychart.core.ui.Legend)} Title or self for method chaining.
 */
anychart.core.ui.Legend.prototype.title = function(opt_value) {
  if (!this.title_) {
    this.title_ = new anychart.core.ui.Title();
    this.registerDisposable(this.title_);
    this.title_.listenSignals(this.titleInvalidated_, this);
    this.title_.setParentEventTarget(this);
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
  // If there are no signals, the !state and nothing happens.
  this.invalidate(state, signal);
};


/**
 * If set, formats title. Currently supported in Stock only.
 * @param {?(Function|string)=} opt_value
 * @return {Function|string|anychart.core.ui.Legend}
 */
anychart.core.ui.Legend.prototype.titleFormatter = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.titleFormatter_ != opt_value) {
      this.titleFormatter_ = opt_value;
      this.invalidate(anychart.ConsistencyState.LEGEND_TITLE | anychart.ConsistencyState.BOUNDS,
          anychart.Signal.BOUNDS_CHANGED | anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.titleFormatter_;
};


/**Getter/setter for titleSeparator.
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
  // If there are no signals, !state and nothing happens.
  this.invalidate(state, signal);
};


/**
 * Getter/setter for paginator.
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
  // If there are no signals, !state and nothing happens.
  this.invalidate(state, signal);
};


/**
 * Legend tooltip.
 * @param {(Object|boolean|null)=} opt_value Tooltip settings.
 * @return {!(anychart.core.ui.Legend|anychart.core.ui.Tooltip)} Tooltip instance or self for method chaining.
 */
anychart.core.ui.Legend.prototype.tooltip = function(opt_value) {
  if (!this.tooltip_) {
    this.tooltip_ = new anychart.core.ui.Tooltip(anychart.core.ui.Tooltip.Capabilities.SUPPORTS_ALLOW_LEAVE_SCREEN);
    this.registerDisposable(this.tooltip_);
    this.tooltip_.listenSignals(this.onTooltipSignal_, this);
    this.tooltip_.boundsProvider = this;
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
  if (tooltip.container()) {
    tooltip.draw();
  }
};


/**
 * TODO(AntonKagakin): need to rewrite legend tooltip provider!.
 * Stub.
 * @override
 */
anychart.core.ui.Legend.prototype.getTokenType = function(name) {
  switch (name) {
    case anychart.enums.StringToken.VALUE:
      return anychart.enums.TokenType.STRING;
    default:
      return anychart.enums.TokenType.UNKNOWN;
  }
};


/**
 * TODO(AntonKagakin): need to rewrite legend tooltip provider!.
 * Stub.
 * @override
 */
anychart.core.ui.Legend.prototype.getTokenValue = function(name) {
  switch (name) {
    case anychart.enums.StringToken.VALUE:
      return this['value'];
    default:
      return void 0;
  }
};


/**
 * Show data point tooltip.
 * @protected
 * @param {anychart.core.MouseEvent} event Event that initiates tooltip display.
 */
anychart.core.ui.Legend.prototype.showTooltip = function(event) {
  var tooltip = /** @type {anychart.core.ui.Tooltip} */(this.tooltip());
  if (tooltip.enabled()) {
    var index = event['itemIndex'];
    var item = this.items_[index];
    if (item) {
      var formatProvider = {
        'value': item.text(),
        'iconType': item.iconType(),
        'iconStroke': item.iconStroke(),
        'iconFill': item.iconFill(),
        'iconHatchFill': item.iconHatchFill(),
        'iconMarkerType': item.iconMarkerType(),
        'iconMarkerStroke': item.iconMarkerStroke(),
        'iconMarkerFill': item.iconMarkerFill(),
        'meta': this.legendItemsMeta_[index],
        'getTokenValue': this.getTokenValue,
        'getTokenType': this.getTokenType
      };
      if (event) {
        tooltip.showFloat(event['clientX'], event['clientY'], formatProvider);
      }
    }
  }
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
 * Getter/setter for width.
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
 * Getter/setter for max width.
 * @param {(number|string|null)=} opt_value .
 * @return {!anychart.core.ui.Legend|number|string|null} .
 */
anychart.core.ui.Legend.prototype.maxWidth = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.maxWidth_ != opt_value) {
      this.maxWidth_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS | anychart.ConsistencyState.LEGEND_BACKGROUND,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.maxWidth_;
};


/**
 * Getter/setter for height.
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


/**
 * Getter/setter for max height.
 * @param {(number|string|null)=} opt_value .
 * @return {!anychart.core.ui.Legend|number|string|null} .
 */
anychart.core.ui.Legend.prototype.maxHeight = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.maxHeight_ != opt_value) {
      this.maxHeight_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS | anychart.ConsistencyState.LEGEND_BACKGROUND,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.maxHeight_;
};


/**
 * Getter/setter for position.
 * @param {(anychart.enums.Orientation|string)=} opt_value Legend position.
 * @return {(anychart.enums.Orientation|anychart.core.ui.Legend)} Legend position or self for method chaining.
 */
anychart.core.ui.Legend.prototype.position = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeOrientation(opt_value);
    if (this.position_ != opt_value) {
      this.position_ = opt_value;
      this.dragged = false;

      var signal = anychart.Signal.NEEDS_REDRAW;
      if (this.positionMode_ == anychart.enums.LegendPositionMode.OUTSIDE)
        signal |= anychart.Signal.BOUNDS_CHANGED;

      this.invalidate(anychart.ConsistencyState.BOUNDS, signal);
    }
    return this;
  } else {
    return this.position_;
  }
};


/**
 * Getter/setter for position mode.
 * @param {(anychart.enums.LegendPositionMode|string)=} opt_value Legend position mode.
 * @return {(anychart.enums.LegendPositionMode|anychart.core.ui.Legend)} Legend position mode or self for method chaining.
 */
anychart.core.ui.Legend.prototype.positionMode = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeLegendPositionMode(opt_value);
    if (this.positionMode_ != opt_value) {
      this.positionMode_ = opt_value;
      this.dragged = false;
      if (this.drag_) {
        this.invalidate(anychart.ConsistencyState.LEGEND_DRAG,
            anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
      } else {
        this.dispatchSignal(anychart.Signal.BOUNDS_CHANGED);
      }
    }
    return this;
  } else {
    return this.positionMode_;
  }
};


/**
 * Getter/setter for align.
 * @param {(anychart.enums.Align|string)=} opt_value Legend align.
 * @return {(anychart.enums.Align|anychart.core.ui.Legend)} Legend align or self for chaining.
 */
anychart.core.ui.Legend.prototype.align = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeAlign(opt_value);
    if (this.align_ != opt_value) {
      this.align_ = opt_value;
      this.dragged = false;

      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.align_;
  }
};


/**
 * Getter/setter for drag.
 * @param {boolean=} opt_value Legend drag.
 * @return {(boolean|anychart.core.ui.Legend)} Legend drag or self for method chaining.
 */
anychart.core.ui.Legend.prototype.drag = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = !!opt_value;
    if (this.drag_ != opt_value) {
      this.drag_ = opt_value;
      this.invalidate(anychart.ConsistencyState.LEGEND_DRAG, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.drag_;
  }
};


//endregion
//region --- Bounds
/** @inheritDoc */
anychart.core.ui.Legend.prototype.parentBounds = function(opt_boundsOrLeft, opt_top, opt_width, opt_height) {
  return anychart.core.ui.Legend.base(this, 'parentBounds', opt_boundsOrLeft, opt_top, opt_width, opt_height);
};


/**
 *
 * @return {!anychart.math.Rect} Bounds that remain after legend.
 */
anychart.core.ui.Legend.prototype.getRemainingBounds = function() {
  /** @type {!anychart.math.Rect} */
  var parentBounds = /** @type {anychart.math.Rect} */(this.parentBounds()) || anychart.math.rect(0, 0, 0, 0);
  if (!this.enabled() || this.positionMode_ == anychart.enums.LegendPositionMode.INSIDE)
    return parentBounds;

  if (!this.pixelBounds_ || this.hasInvalidationState(anychart.ConsistencyState.BOUNDS))
    this.calculateBounds_();

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
 *
 * @return {anychart.math.Rect}
 */
anychart.core.ui.Legend.prototype.getPixelBounds = function() {
  if (!this.pixelBounds_ || this.hasInvalidationState(anychart.ConsistencyState.BOUNDS))
    this.calculateBounds_();
  return this.pixelBounds_;
};


/**
 * Calculation content bounds.
 * @param {number} widthLimit .
 * @param {number} heightLimit .
 * @return {anychart.math.Rect} Bounds.
 * @private
 */
anychart.core.ui.Legend.prototype.calculateContentBounds_ = function(widthLimit, heightLimit) {
  if (!goog.isDefAndNotNull(this.items_))
    return anychart.math.rect(0, 0, 0, 0);

  var fullWidth = 0;
  var width = 0;
  var maxWidth = -Number.MAX_VALUE;

  var fullHeight = 0;
  var height = 0;
  var maxHeight = -Number.MAX_VALUE;

  var rowHeight = 0;
  var rowWidth = 0;
  var rowCount = 1;
  var colHeight = 0;
  var colWidth = 0;
  var colCount = 1;
  var fullWidthExpand = 0;
  var fullHeightExpand = 0;

  for (var i = 0, len = this.items_.length; i < len; i++) {
    if (i in this.notEnabledItems_)
      continue;

    var bounds = this.items_[i].getPixelBounds();

    width = bounds.width;
    fullWidth += width + this.itemsSpacing_;
    maxWidth = Math.max(maxWidth, width);

    height = bounds.height;
    fullHeight += height + this.itemsSpacing_;
    maxHeight = Math.max(maxHeight, height);


    if (this.itemsLayout_ == anychart.enums.LegendLayout.HORIZONTAL_EXPANDABLE) {
      if (rowWidth + width > widthLimit) {
        fullWidthExpand = Math.max(fullWidthExpand, rowWidth);
        fullHeightExpand += rowHeight;
        rowCount++;

        rowWidth = width + this.itemsSpacing_;
        rowHeight = height + this.itemsSpacing_;
      } else {
        rowWidth += width + this.itemsSpacing_;
        rowHeight = Math.max(rowHeight, height + this.itemsSpacing_);
      }
    } else if (this.itemsLayout_ == anychart.enums.LegendLayout.VERTICAL_EXPANDABLE) {
      if (colHeight + height > heightLimit) {
        fullHeightExpand = Math.max(fullHeightExpand, colHeight);
        fullWidthExpand += colWidth;
        colCount++;

        colWidth = width + this.itemsSpacing_;
        colHeight = height + this.itemsSpacing_;
      } else {
        colHeight += height + this.itemsSpacing_;
        colWidth = Math.max(colWidth, width + this.itemsSpacing_);
      }
    }
  }


  if (!fullWidth || maxWidth < 0) {
    fullWidth = 0;
    maxWidth = 0;
  } else {
    fullWidth -= this.itemsSpacing_;
  }

  if (!fullHeight || maxHeight < 0) {
    fullHeight = 0;
    maxHeight = 0;
  } else {
    fullHeight -= this.itemsSpacing_;
  }

  this.colCount_ = colCount;
  this.rowCount_ = rowCount;

  if (this.itemsLayout_ == anychart.enums.LegendLayout.VERTICAL) {
    return anychart.math.rect(0, 0, Math.max(0, maxWidth), Math.max(0, fullHeight));
  } else if (this.itemsLayout_ == anychart.enums.LegendLayout.HORIZONTAL) {
    return anychart.math.rect(0, 0, Math.max(0, fullWidth), Math.max(0, maxHeight));
  } else if (this.itemsLayout_ == anychart.enums.LegendLayout.VERTICAL_EXPANDABLE) {
    fullWidthExpand += colWidth - this.itemsSpacing_;
    fullHeightExpand = Math.max(fullHeightExpand, colHeight) - this.itemsSpacing_;
    return anychart.math.rect(0, 0, Math.max(0, fullWidthExpand), Math.max(0, fullHeightExpand));
  } else if (this.itemsLayout_ == anychart.enums.LegendLayout.HORIZONTAL_EXPANDABLE) {
    fullWidthExpand = Math.max(fullWidthExpand, rowWidth) - this.itemsSpacing_;
    fullHeightExpand += rowHeight - this.itemsSpacing_;
    return anychart.math.rect(0, 0, Math.max(0, fullWidthExpand), Math.max(0, fullHeightExpand));
  }

  return anychart.math.rect(0, 0, 0, 0);
};


/**
 * @param {anychart.math.Rect} bounds Bounds.
 * @return {boolean} Whether bounds are empty.
 * @private
 */
anychart.core.ui.Legend.prototype.hiddenBounds_ = function(bounds) {
  return ((bounds.width <= 0) && (bounds.height <= 0));
};


/**
 * Calculate legend bounds.
 * @private
 */
anychart.core.ui.Legend.prototype.calculateBounds_ = function() {
  /** @type {anychart.math.Rect} */
  var parentBounds = /** @type {anychart.math.Rect} */(this.parentBounds());
  if (goog.isDefAndNotNull(parentBounds) && this.hiddenBounds_(parentBounds))
    parentBounds = null;

  /** @type {number} */
  var parentWidth;
  /** @type {number} */
  var parentHeight;

  var margin = this.margin();
  var padding = this.padding();

  var width, height, orientation, fullWidth, fullHeight, left = 0, top = 0;

  var maxWidth, maxHeight;
  if (parentBounds) {
    parentWidth = parentBounds.width;
    parentHeight = parentBounds.height;
    if (goog.isDefAndNotNull(this.width_)) {
      var wiredWidth = anychart.utils.normalizeSize(/** @type {number|string} */(this.width_), parentWidth);
      var dynamicWidth = goog.isDefAndNotNull(this.maxWidth_) ?
          anychart.utils.normalizeSize(/** @type {number|string} */(this.maxWidth_), parentWidth) :
          parentWidth;

      fullWidth = Math.min(parentWidth, wiredWidth, dynamicWidth);
      maxWidth = padding.tightenWidth(margin.tightenWidth(fullWidth));
    } else if (goog.isDefAndNotNull(this.maxWidth_)) {
      maxWidth = padding.tightenWidth(margin.tightenWidth(anychart.utils.normalizeSize(/** @type {number|string} */(this.maxWidth_), parentWidth)));
    } else {
      maxWidth = padding.tightenWidth(margin.tightenWidth(parentWidth));
    }
    if (goog.isDefAndNotNull(this.height_)) {
      var wiredHeight = anychart.utils.normalizeSize(/** @type {number|string} */(this.height_), parentHeight);
      var dynamicHeight = goog.isDefAndNotNull(this.maxHeight_) ?
          anychart.utils.normalizeSize(/** @type {number|string} */(this.maxHeight_), parentHeight) :
          parentHeight;

      fullHeight = Math.min(parentHeight, wiredHeight, dynamicHeight);
      maxHeight = padding.tightenHeight(margin.tightenHeight(fullHeight));
    } else if (goog.isDefAndNotNull(this.maxHeight_)) {
      maxHeight = padding.tightenHeight(margin.tightenHeight(anychart.utils.normalizeSize(/** @type {number|string} */(this.maxHeight_), parentHeight)));
    } else {
      maxHeight = padding.tightenHeight(margin.tightenHeight(parentHeight));
    }
  } else {
    if (goog.isNumber(this.width_) && !isNaN(this.width_)) {
      fullWidth = this.width_;
      maxWidth = padding.tightenWidth(this.width_);
    } else if (goog.isNumber(this.maxWidth_) && !isNaN(this.maxWidth_)) {
      maxWidth = padding.tightenWidth(this.maxWidth_);
    } else {
      maxWidth = Infinity;
    }
    if (goog.isNumber(this.height_) && !isNaN(this.height_)) {
      fullHeight = this.height_;
      maxHeight = padding.tightenHeight(this.height_);
    } else if (goog.isNumber(this.maxHeight_) && !isNaN(this.maxHeight_)) {
      maxHeight = padding.tightenHeight(this.maxHeight_);
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

  var paginatorOrientation = paginator.orientation();
  var paginatorIsHorizontal = paginatorOrientation == anychart.enums.Orientation.BOTTOM || paginatorOrientation == anychart.enums.Orientation.TOP;
  var titleOrientation = title.getOption('orientation') || title.defaultOrientation();
  var titleIsHorizontal = titleOrientation == anychart.enums.Orientation.BOTTOM || titleOrientation == anychart.enums.Orientation.TOP;
  var titleIsRLYHorizontal = title.getRotation() % 180 == 0;
  var separatorIsHorizontal = separator.isHorizontal();

  separator.suspendSignalsDispatching();
  paginator.suspendSignalsDispatching();
  title.suspendSignalsDispatching();

  var calculatedBounds = null;
  do {
    if (calculatedBounds) {
      paginatorBounds = calculatedBounds;
      calculatedBounds = null;
    }

    var accumHeight = 0;
    var accumWidth = 0;
    var forCompareHeight = 0;
    var forCompareWidth = 0;

    if (title.enabled()) {
      title.parentBounds(null);
      title.setAutoWidth(null);
      title.setAutoHeight(null);
      titleBounds = title.getContentBounds();

      if (titleIsHorizontal) {
        if (titleBounds.width > maxWidth) {
          if (titleIsRLYHorizontal) {
            title.setAutoWidth(maxWidth);
          } else {
            title.setAutoHeight(maxWidth);
          }
          titleBounds = title.getContentBounds();
        }

        forCompareWidth = titleBounds.width;
        accumHeight += titleBounds.height;
      } else {
        if (titleBounds.height > maxHeight) {
          if (titleIsRLYHorizontal) {
            title.setAutoHeight(maxHeight);
          } else {
            title.setAutoWidth(maxHeight);
          }
          titleBounds = title.getContentBounds();
        }

        forCompareHeight = titleBounds.height;
        accumWidth += titleBounds.width;
      }
    } else {
      titleBounds = null;
    }

    if (separator.enabled()) {
      separator.parentBounds(null);
      separatorBounds = separator.getContentBounds();

      if (separatorIsHorizontal) {
        accumHeight += separatorBounds.height;
      } else {
        accumWidth += separatorBounds.width;
      }
    } else {
      separatorBounds = null;
    }

    var itemsAreaWidth = maxWidth - accumWidth;
    var itemsAreaHeight = maxHeight - accumHeight;

    var contentBounds = this.calculateContentBounds_(itemsAreaWidth, itemsAreaHeight);
    var contentWidth = contentBounds.width;
    var contentHeight = contentBounds.height;

    accumHeight += contentHeight;
    accumWidth += contentWidth;
    forCompareHeight = Math.max(forCompareHeight, contentHeight);
    forCompareWidth = Math.max(forCompareWidth, contentWidth);

    var fullAreaWidth = Math.max(forCompareWidth, accumWidth);
    var fullAreaHeight = Math.max(forCompareHeight, accumHeight);

    var maxHeightForPaginator = maxHeight;
    if (titleIsHorizontal) {
      maxHeightForPaginator -= (titleBounds ? titleBounds.height : 0);
    }
    if (separatorIsHorizontal) {
      maxHeightForPaginator -= (separatorBounds ? separatorBounds.height : 0);
    }

    paginator.parentBounds(null);
    paginatorBounds = paginator.getPixelBounds();

    if (this.itemsLayout_ == anychart.enums.LegendLayout.HORIZONTAL) {
      if (contentWidth > itemsAreaWidth && this.items_ && this.items_.length > 1) {
        paginator.autoEnabled(true);
      } else {
        paginator.autoEnabled(false);
      }
    } else if (this.itemsLayout_ == anychart.enums.LegendLayout.VERTICAL_EXPANDABLE) {
      if (contentWidth > itemsAreaWidth && this.colCount_ > 1) {
        paginator.autoEnabled(true);
      } else {
        paginator.autoEnabled(false);
      }
    } else if (this.itemsLayout_ == anychart.enums.LegendLayout.VERTICAL ||
        this.itemsLayout_ == anychart.enums.LegendLayout.HORIZONTAL_EXPANDABLE) {
      if (contentHeight > maxHeightForPaginator && this.items_ && this.items_.length > 1) {
        paginator.autoEnabled(true);
      } else {
        paginator.autoEnabled(false);
      }
    }

    if (paginator.getFinalEnabled()) {
      if (paginatorIsHorizontal) {
        fullAreaWidth = Math.max(fullAreaWidth, paginatorBounds.width);
        fullAreaHeight += paginatorBounds.height;
      } else {
        fullAreaWidth += paginatorBounds.width;
        fullAreaHeight = Math.max(fullAreaHeight, paginatorBounds.height);
      }
    }

    var contentAreaWidth = Math.min(fullAreaWidth, maxWidth);
    var contentAreaHeight = Math.min(fullAreaHeight, maxHeight);

    width = margin.widenWidth(padding.widenWidth(contentAreaWidth));
    height = margin.widenHeight(padding.widenHeight(contentAreaHeight));

    if (title.enabled()) {
      var titleWidth = titleBounds.width;
      if (titleIsHorizontal || titleIsRLYHorizontal) {
        if (titleIsRLYHorizontal && !titleIsHorizontal) {
          //orientation left or right and rotation == 0;
          var minimalContentAreaWidth;
          var paginatorWidth = (paginator.getFinalEnabled() ? paginatorBounds.width : 0);
          var oneItemAndPaginatorWidth = (this.items_ && this.items_.length ? this.items_[0].getPixelBounds().width : 0) + paginatorWidth;

          if (contentWidth + paginatorWidth >= maxWidth - titleBounds.width) {
            minimalContentAreaWidth = oneItemAndPaginatorWidth;
          } else {
            minimalContentAreaWidth = contentWidth;
          }
          var widthToSet = Math.max(Math.min(title.text().length, 1), title.margin().tightenWidth(contentAreaWidth - titleWidth <= minimalContentAreaWidth ? contentAreaWidth - minimalContentAreaWidth : titleWidth));
          title.setAutoWidth(/** @type {null|number|string} */(widthToSet));
        } else if (!titleIsRLYHorizontal) {
          //another cases
          if (fullAreaHeight > maxHeight) {
            //actual for multi line title
            var accHeight = 0;
            if (separatorBounds && separatorIsHorizontal) {
              accHeight += separatorBounds.height;
            }
            if (paginator.orientation() == anychart.enums.Orientation.TOP || paginator.orientation() == anychart.enums.Orientation.BOTTOM) {
              accHeight += paginatorBounds.height;
            }

            var paginatorHeight = (paginator.getFinalEnabled() && !paginatorIsHorizontal ? paginatorBounds.height : 0);
            var oneItemAndPaginatorHeight = Math.max(this.items_ && this.items_.length ? this.items_[0].getPixelBounds().height : 0, paginatorHeight);

            var heightToSet = Math.max(1, title.margin().tightenHeight(maxHeight - accHeight - oneItemAndPaginatorHeight));
            if (titleIsRLYHorizontal) {
              title.setAutoHeight(/** @type {null|number|string} */(heightToSet));
            } else {
              title.setAutoWidth(/** @type {null|number|string} */(heightToSet));
            }
          }
        }

        titleBounds = title.getContentBounds();
        separator['width'](width);
        separatorBounds = separator.getContentBounds();
      } else {
        titleBounds = title.getContentBounds();
        separator['width'](height);
        separatorBounds = separator.getContentBounds();
      }

      if (titleIsHorizontal)
        contentAreaHeight -= titleBounds.height;
      else
        contentAreaWidth -= titleBounds.width;
    }

    if (separator.enabled()) {
      if (separatorIsHorizontal) {
        contentAreaHeight -= separatorBounds.height;
      } else {
        contentAreaWidth -= separatorBounds.width;
      }
    }

    var pageWidth = contentAreaWidth;
    var pageHeight = contentAreaHeight;

    orientation = paginator.orientation();

    if (paginator.getFinalEnabled()) {
      if (paginatorIsHorizontal) {
        pageHeight = contentAreaHeight - paginatorBounds.height;
      } else {
        pageWidth = contentAreaWidth - paginatorBounds.width;
      }
    }

    this.distributeItemsInBounds_(pageWidth, pageHeight);
    paginator.parentBounds(null);
    calculatedBounds = paginator.getPixelBounds();
  } while (!anychart.math.Rect.equals(paginatorBounds, calculatedBounds));

  if (!fullWidth) {
    fullWidth = width;
  }
  if (!fullHeight) {
    fullHeight = height;
  }

  this.pixelBounds_ = new anychart.math.Rect(left, top, fullWidth, fullHeight);

  if (this.dragged) {
    left = this.percentOffsetLeft < this.percentOffsetRight ?
        Math.max(parentBounds.left, this.percentOffsetLeft * parentBounds.width + parentBounds.left) :
        Math.min(parentBounds.getRight(), parentBounds.getRight() - (this.percentOffsetRight * parentBounds.width + fullWidth));
    top = this.percentOffsetTop < this.percentOffsetBottom ?
        Math.max(parentBounds.top, this.percentOffsetTop * parentBounds.height + parentBounds.top) :
        Math.min(parentBounds.getBottom(), parentBounds.getBottom() - (this.percentOffsetBottom * parentBounds.height + fullHeight));

    if (!parentBounds.contains(this.pixelBounds_)) {
      if (left < parentBounds.left) {
        left = parentBounds.left;
      }
      if (left + fullWidth > parentBounds.getRight()) {
        left = parentBounds.getRight() - fullWidth;
      }
      if (top < parentBounds.top) {
        top = parentBounds.top;
      }
      if (top + fullHeight > parentBounds.getBottom()) {
        top = parentBounds.getBottom() - fullHeight;
      }
    }
  } else {
    if (parentBounds) {
      left = parentBounds.getLeft();
      top = parentBounds.getTop();
      switch (this.position_) {
        case anychart.enums.Orientation.LEFT:
        case anychart.enums.Orientation.RIGHT:
          switch (this.align_) {
            case anychart.enums.Align.CENTER:
              top = top + (parentHeight - fullHeight) / 2;
              break;
            case anychart.enums.Align.RIGHT:
            case anychart.enums.Align.BOTTOM:
              top = parentBounds.getBottom() - fullHeight;
              break;
          }
          break;
        case anychart.enums.Orientation.TOP:
        case anychart.enums.Orientation.BOTTOM:
          switch (this.align_) {
            case anychart.enums.Align.CENTER:
              left = left + (parentWidth - fullWidth) / 2;
              break;
            case anychart.enums.Align.RIGHT:
            case anychart.enums.Align.BOTTOM:
              left = parentBounds.getRight() - fullWidth;
              break;
          }
          break;
      }
      switch (this.position_) {
        case anychart.enums.Orientation.RIGHT:
          left = parentBounds.getRight() - fullWidth;
          break;
        case anychart.enums.Orientation.BOTTOM:
          top = parentBounds.getBottom() - fullHeight;
          break;
      }
    } else {
      left = anychart.utils.normalizeSize(/** @type {string|number} */ (margin.getOption('left')), 0);
      top = anychart.utils.normalizeSize(/** @type {string|number} */ (margin.getOption('top')), 0);
    }
  }

  this.pixelBounds_.left = left;
  this.pixelBounds_.top = top;
  this.contentAreaBounds_ = this.padding().tightenBounds(this.margin().tightenBounds(this.pixelBounds_));

  var relativePixelBounds = this.pixelBounds_.clone();
  relativePixelBounds.left = 0;
  relativePixelBounds.top = 0;
  this.relativeBoundsWithoutMargin_ = this.margin().tightenBounds(relativePixelBounds);
  this.relativeBoundsWithoutMarginAndPadding_ = this.padding().tightenBounds(this.relativeBoundsWithoutMargin_);

  separator.resumeSignalsDispatching(false);
  paginator.resumeSignalsDispatching(false);
  title.resumeSignalsDispatching(false);

  this.markConsistent(anychart.ConsistencyState.BOUNDS);
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
  var page, item, itemWidth, itemHeight;

  this.distributedItems_ = [];
  page = 0;
  var itemsLength = this.items_ && this.items_.length;
  var k;
  // find first item that need to be showed
  for (k = 0; k < itemsLength; k++) {
    if (!(k in this.notEnabledItems_))
      break;
  }

  if (height > 0 && this.items_ && k != itemsLength) {
    this.distributedItems_[page] = [];
    this.distributedItems_[page][0] = this.items_[k];

    switch (this.itemsLayout_) {
      case anychart.enums.LegendLayout.HORIZONTAL:
        w = this.items_[k].getPixelBounds().getWidth();
        for (i = k + 1; i < itemsLength; i++) {
          if (i in this.notEnabledItems_)
            continue;
          if (w + this.itemsSpacing_ + this.items_[i].getPixelBounds().getWidth() > width) {
            page++;
            this.distributedItems_[page] = [];
            this.distributedItems_[page][0] = this.items_[i];
            w = this.items_[i].getPixelBounds().getWidth();
          } else {
            w = w + this.itemsSpacing_ + this.items_[i].getPixelBounds().getWidth();
            this.distributedItems_[page].push(this.items_[i]);
          }
        }
        break;
      case anychart.enums.LegendLayout.VERTICAL:
        h = this.items_[k].getPixelBounds().getHeight();
        for (i = k + 1, len = this.items_.length; i < len; i++) {
          if (i in this.notEnabledItems_)
            continue;
          if (h + this.itemsSpacing_ + this.items_[i].getPixelBounds().getHeight() > height) {
            page++;
            this.distributedItems_[page] = [];
            this.distributedItems_[page][0] = this.items_[i];
            h = this.items_[i].getPixelBounds().getHeight();
          } else {
            h = h + this.itemsSpacing_ + this.items_[i].getPixelBounds().getHeight();
            this.distributedItems_[page].push(this.items_[i]);
          }
        }
        break;
      case anychart.enums.LegendLayout.HORIZONTAL_EXPANDABLE:
        var rowWidth = this.items_[k].getPixelBounds().getWidth() + this.itemsSpacing_;
        var rowHeight = this.items_[k].getPixelBounds().getHeight() + this.itemsSpacing_;
        var pageHeight = 0;

        for (i = k + 1; i < itemsLength; i++) {
          if (i in this.notEnabledItems_)
            continue;
          item = this.items_[i];

          itemWidth = item.getPixelBounds().getWidth();
          itemHeight = item.getPixelBounds().getHeight();

          if (rowWidth + itemWidth > width) {
            pageHeight += rowHeight;
            if (pageHeight + itemHeight > height) {
              page++;
              this.distributedItems_[page] = [];
              this.distributedItems_[page][0] = item;
              pageHeight = 0;
            } else {
              this.distributedItems_[page].push(item);
            }
            rowWidth = itemWidth + this.itemsSpacing_;
            rowHeight = itemHeight + this.itemsSpacing_;
          } else {
            rowWidth += itemWidth + this.itemsSpacing_;
            rowHeight = Math.max(rowHeight, itemHeight + this.itemsSpacing_);
            this.distributedItems_[page].push(item);
          }
        }
        break;
      case anychart.enums.LegendLayout.VERTICAL_EXPANDABLE:
        var colWidth = this.items_[k].getPixelBounds().getWidth() + this.itemsSpacing_;
        var colHeight = this.items_[k].getPixelBounds().getHeight() + this.itemsSpacing_;
        var pageWidth = 0;

        for (i = k + 1; i < itemsLength; i++) {
          if (i in this.notEnabledItems_)
            continue;
          item = this.items_[i];

          itemWidth = item.getPixelBounds().getWidth();
          itemHeight = item.getPixelBounds().getHeight();

          if (colHeight + itemHeight > height) {
            pageWidth += colWidth;
            if (pageWidth + itemWidth > width) {
              page++;
              this.distributedItems_[page] = [];
              this.distributedItems_[page][0] = item;
              pageWidth = 0;
            } else {
              this.distributedItems_[page].push(item);
            }
            colWidth = itemWidth + this.itemsSpacing_;
            colHeight = itemHeight + this.itemsSpacing_;
          } else {
            colWidth = Math.max(colWidth, itemWidth + this.itemsSpacing_);
            colHeight += itemHeight + this.itemsSpacing_;
            this.distributedItems_[page].push(item);
          }
        }
        break;
    }
  }

  this.paginator().pageCount(page + 1);
};


//endregion
//region --- Items calculaton
/**
 * Init items.
 * @private
 * @return {Array.<Object>}
 */
anychart.core.ui.Legend.prototype.createItemsFromSource_ = function() {
  if (goog.isArray(this.customItems_))
    return this.customItems_;
  else if (goog.isDefAndNotNull(this.itemsSourceInternal)) {
    var source;
    var items = [];
    for (var i = 0; i < this.itemsSourceInternal.length; i++) {
      source = /** @type {anychart.core.SeparateChart|anychart.core.stock.Plot} */ (this.itemsSourceInternal[i]);
      if (!goog.isNull(source) && goog.isFunction(source.createLegendItemsProvider))
        items = goog.array.concat(items, source.createLegendItemsProvider(this.itemsSourceMode_, this.itemsTextFormatter_));
    }
    return items;
  } else
    return [];
};


/**
 * Prepare items to initialization.
 * @param {Array.<Object>} items Items.
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
    if (isNaN(items[i]['iconSize']))
      items[i]['iconSize'] = this.iconSize_;
    config = {
      'iconTextSpacing': this.iconTextSpacing_,
      'iconSize': this.iconSize_,
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
  if (!this.items_) {
    this.itemsPool_ = [];
    this.items_ = [];
  }

  /** @type {anychart.core.ui.LegendItem} */
  var item;
  var i, len;
  /**
   * Items that were disabled by one of legendItem(null), legendItem(false), legendItem().enabled(false)
   * @type {Object.<number, boolean>}
   * @private
   */
  this.notEnabledItems_ = {};
  if (!this.recreateItems_ && this.items_) {
    for (i = 0, len = items.length; i < len; i++) {
      if (goog.isDef(items[i]['enabled']) && !items[i]['enabled'])
        this.notEnabledItems_[i] = true;
      for (var j = 0; j < this.items_.length; j++) {
        item = this.items_[j];
        var itemSourceUid = item.sourceUid();
        var itemSourceKey = item.sourceKey();

        if (goog.isDef(itemSourceUid) &&
            goog.isDef(itemSourceKey) &&
            itemSourceUid == items[i]['sourceUid'] &&
            itemSourceKey == items[i]['sourceKey']) {
          item.clear();
          item.setup(items[i]);
          item.applyTextSettings(item.getTextElement(), false);
          item.setItemIndexToLayer(this.inverted_ ? items.length - 1 - i : i);
          break;
        }
      }
    }
  } else if (items && items.length > 0) {
    this.clearItems();

    /**
     * Array of legend items metadata. Used for legend item tooltips.
     * @type {Array.<Object>}
     * @private
     */
    this.legendItemsMeta_ = [];
    for (i = 0; i < items.length; i++) {
      if (goog.isDef(items[i]['enabled']) && !items[i]['enabled'])
        this.notEnabledItems_[i] = true;
      item = this.getItemInstance(items[i]);
      item.container(this.itemsLayer_);
      items[i]['enabled'] = false;
      item.setup(items[i]);
      item.applyTextSettings(item.getTextElement(), true);
      item.setItemIndexToLayer(this.inverted_ ? items.length - 1 - i : i);

      this.items_.push(item);
      this.legendItemsMeta_.push(items[i]['meta'] ? items[i]['meta'] : {});
    }
  } else {
    this.clearItems();
  }

  this.recreateItems_ = false;
  this.invalidate(anychart.ConsistencyState.BOUNDS);
};


/**
 * Returns legendItem instance for passed item settings object.
 * @param {Object} item .
 * @return {anychart.core.ui.LegendItem} .
 */
anychart.core.ui.Legend.prototype.getItemInstance = function(item) {
  for (var i = 0, len = this.itemsPool_.length; i < len; i++) {
    var poolItem = this.itemsPool_[i];
    if (poolItem.prevSourceUid == item['sourceUid'] && poolItem.prevSourceKey == item['sourceKey']) {
      goog.array.splice(this.itemsPool_, i, 1);
      return poolItem;
    }
  }
  return this.itemsPool_.pop() || this.createItem();
};


/**
 * Clear items.
 */
anychart.core.ui.Legend.prototype.clearItems = function() {
  for (var i = 0, len = this.items_.length; i < len; i++) {
    var item = this.items_[i];
    this.itemsPool_.push(item.clear());
  }
  this.items_.length = 0;
};


/**
 * @protected
 * @return {anychart.core.ui.LegendItem}
 */
anychart.core.ui.Legend.prototype.createItem = function() {
  return new anychart.core.ui.LegendItem();
};


//endregion
//region --- Drawing
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
    this.bindHandlersToGraphics(this.rootElement);
    this.registerDisposable(this.rootElement);

    if (!this.itemsLayer_) {
      /**
       * Legend items layer.
       * @type {!acgraph.vector.Layer}
       * @private
       */
      this.itemsLayer_ = acgraph.layer();
      this.itemsLayer_.parent(this.rootElement).zIndex(20);
      this.registerDisposable(this.itemsLayer_);
    }
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    this.rootElement.zIndex(/** @type {number} */ (this.zIndex()));
    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  var container = /** @type {acgraph.vector.ILayer} */(this.container());
  var stage = container ? container.getStage() : null;

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    this.rootElement.parent(container);
    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }

  var manualSuspend = stage && !stage.isSuspended();
  if (manualSuspend) stage.suspend();

  if (this.hasInvalidationState(anychart.ConsistencyState.LEGEND_RECREATE_ITEMS)) {
    this.recreateItems_ = true;
    this.markConsistent(anychart.ConsistencyState.LEGEND_RECREATE_ITEMS);
  }

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
    // Reset items width (needs when container was resized) for DVF-2119
    if (this.items_ && this.textOverflow() == acgraph.vector.Text.TextOverflow.ELLIPSIS) {
      for (var i = 0, len = this.items_.length; i < len; i++) {
        this.items_[i].parentBounds(null);
        this.items_[i].getTextElement().width(null);
      }
    }
    this.calculateBounds_();
    this.invalidate(anychart.ConsistencyState.LEGEND_BACKGROUND |
        anychart.ConsistencyState.LEGEND_TITLE |
        anychart.ConsistencyState.LEGEND_SEPARATOR |
        anychart.ConsistencyState.LEGEND_PAGINATOR |
        anychart.ConsistencyState.LEGEND_DRAG);

    this.rootElement.setTransformationMatrix(1, 0, 0, 1, this.pixelBounds_.left, this.pixelBounds_.top);
    this.rootElement.clip(this.relativeBoundsWithoutMargin_);
    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.LEGEND_BACKGROUND)) {
    var background = /** @type {anychart.core.ui.Background} */(this.background());
    background.suspendSignalsDispatching();
    background.parentBounds(this.relativeBoundsWithoutMargin_);
    if (this.enabled()) background.container(this.rootElement);
    background.resumeSignalsDispatching(false);
    background.draw();
    this.markConsistent(anychart.ConsistencyState.LEGEND_BACKGROUND);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.LEGEND_TITLE)) {
    var title = /** @type {anychart.core.ui.Title} */(this.title());
    title.suspendSignalsDispatching();
    title.parentBounds(this.relativeBoundsWithoutMarginAndPadding_);
    if (this.enabled()) title.container(this.rootElement);
    title.resumeSignalsDispatching(false);
    title.draw();
    this.markConsistent(anychart.ConsistencyState.LEGEND_TITLE);
  }

  var boundsWithoutTitle = this.title_ ? this.title_.getRemainingBounds() : this.relativeBoundsWithoutMarginAndPadding_;

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

  var contentBounds = this.paginator().getFinalEnabled() ? this.paginator().getRemainingBounds() : boundsWithoutSeparator;

  var pageToDraw = this.paginator().getFinalEnabled() ? this.paginator().currentPage() - 1 : 0;

  contentBounds.width = Math.max(1, contentBounds.width);
  contentBounds.height = Math.max(1, contentBounds.height);

  this.drawLegendContent_(pageToDraw, /** @type {anychart.math.Rect} */(contentBounds.ceil()));

  if (this.hasInvalidationState(anychart.ConsistencyState.LEGEND_DRAG)) {
    if (!this.dragHandler_ && this.drag_) {
      this.dragHandler_ = this.rootElement.rect();
      this.dragHandler_
          .fill(anychart.color.TRANSPARENT_HANDLER)
          .stroke(null)
          .zIndex(0);

      this.rootElement.listen(acgraph.events.EventType.DRAG_BEFORE, function(e) {
        this.dragged = true;
        if (!this.inDragging) {
          this.inDragging = true;
          if (!this.interactivityBlocker_) {
            this.interactivityBlocker_ = acgraph.rect();
            this.interactivityBlocker_
                .fill(anychart.color.TRANSPARENT_HANDLER)
                .stroke(null)
                .zIndex(100);
          }
          this.interactivityBlocker_.setBounds(this.relativeBoundsWithoutMargin_);
          this.interactivityBlocker_.parent(this.rootElement);
          this.dispatchEvent(anychart.enums.EventType.DRAG_START);
        }
      }, false, this);
      this.rootElement.listen(acgraph.events.EventType.DRAG, this.handleDragEvent, false, this);

      this.rootElement.listen(acgraph.events.EventType.DRAG_END, function(e) {
        var tx = this.rootElement.getSelfTransformation();
        var bounds = this.getPixelBounds();
        var parentBounds = this.parentBounds();

        this.dragOffsetX = tx.getTranslateX();
        this.dragOffsetY = tx.getTranslateY();
        this.percentOffsetLeft = (this.dragOffsetX - parentBounds.left) / (parentBounds.width);
        this.percentOffsetTop = (this.dragOffsetY - parentBounds.top) / (parentBounds.height);
        this.percentOffsetRight = (parentBounds.width - (this.dragOffsetX - parentBounds.left + bounds.width)) / parentBounds.width;
        this.percentOffsetBottom = (parentBounds.height - (this.dragOffsetY - parentBounds.top + bounds.height)) / parentBounds.height;

        if (this.inDragging) {
          this.inDragging = false;
          this.interactivityBlocker_.parent(null);
          this.dispatchEvent(anychart.enums.EventType.DRAG_END);
        }
      }, false, this);
    }

    var drag = false;
    if (this.drag_) {
      var diff;
      drag = this.margin().tightenBounds(
          /** @type {!anychart.math.Rect} */(this.positionMode_ == anychart.enums.LegendPositionMode.INSIDE ?
              this.parentBounds() :
              (diff = this.parentBounds().difference(this.getRemainingBounds())).length ? diff[0] : anychart.math.rect(0, 0, 0, 0)));


    }
    if (this.dragHandler_)
      this.dragHandler_.setBounds(this.relativeBoundsWithoutMargin_);
    this.rootElement.drag(drag);

    this.markConsistent(anychart.ConsistencyState.LEGEND_DRAG);
  }

  if (manualSuspend) stage.resume();

  return this;
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
    this.itemsLayer_.setTransformationMatrix(1, 0, 0, 1, 0, 0);

    var x = 0;
    var y = 0;
    var rowHeight = 0, colWidth = 0;
    var i;
    var items = this.distributedItems_[pageNumber];
    var item, itemBounds;

    if (items) {
      switch (this.itemsLayout_) {
        case anychart.enums.LegendLayout.HORIZONTAL:
          for (i = 0; i < items.length; i++) {
            item = items[i];
            // fixes ellipsis applying when change content page throughout paginator
            item.invalidate(anychart.ConsistencyState.BOUNDS);
            item
                .suspendSignalsDispatching()
                .parentBounds(contentBounds)
                .x(x)
                .y(y)
                .enabled(true)
                .resumeSignalsDispatching(false)
                .draw();
            x += items[i].getPixelBounds().getWidth() + this.itemsSpacing_;
          }
          break;
        case anychart.enums.LegendLayout.VERTICAL:
          for (i = 0; i < items.length; i++) {
            item = items[i];
            // fixes ellipsis applying when change content page throughout paginator
            item.invalidate(anychart.ConsistencyState.BOUNDS);
            item
                .suspendSignalsDispatching()
                .parentBounds(contentBounds)
                .x(x)
                .y(y)
                .enabled(true)
                .resumeSignalsDispatching(false)
                .draw();
            y += items[i].getPixelBounds().getHeight() + this.itemsSpacing_;
          }
          break;
        case anychart.enums.LegendLayout.HORIZONTAL_EXPANDABLE:
          for (i = 0; i < items.length; i++) {
            item = items[i];
            itemBounds = item.getPixelBounds();

            if (x + itemBounds.getWidth() > contentBounds.width) {
              y += rowHeight;
              x = 0;
              rowHeight = 0;
            }

            // fixes ellipsis applying when change content page throughout paginator
            item.invalidate(anychart.ConsistencyState.BOUNDS);
            item
                .suspendSignalsDispatching()
                .parentBounds(contentBounds)
                .x(x)
                .y(y)
                .enabled(true)
                .resumeSignalsDispatching(false)
                .draw();

            x += item.getPixelBounds().getWidth() + this.itemsSpacing_;
            rowHeight = Math.max(rowHeight, itemBounds.getHeight() + this.itemsSpacing_);
          }
          break;
        case anychart.enums.LegendLayout.VERTICAL_EXPANDABLE:
          for (i = 0; i < items.length; i++) {
            item = items[i];
            itemBounds = item.getPixelBounds();

            if (y + itemBounds.getHeight() > contentBounds.height) {
              x += colWidth;
              y = 0;
              colWidth = 0;
            }
            // fixes ellipsis applying when change content page throughout paginator
            item.invalidate(anychart.ConsistencyState.BOUNDS);
            item
                .suspendSignalsDispatching()
                .parentBounds(contentBounds)
                .x(x)
                .y(y)
                .enabled(true)
                .resumeSignalsDispatching(false)
                .draw();
            y += items[i].getPixelBounds().getHeight() + this.itemsSpacing_;
            colWidth = Math.max(colWidth, itemBounds.getWidth() + this.itemsSpacing_);
          }
          break;
      }
    }

    if (this.title().enabled()) {
      var titleOrientation = this.title().getOption('orientation') || this.title().defaultOrientation();
      var titleIsHorizontal = titleOrientation == 'top' || titleOrientation == 'bottom';

      if (!titleIsHorizontal) {
        var tx, dx = 0, dy = 0;
        if (tx = this.rootElement.getSelfTransformation()) {
          dx = tx.getTranslateX();
          dy = tx.getTranslateY();
        }
        var itemsContentBounds = this.itemsLayer_.getAbsoluteBounds();
        var titleBounds = this.title_.getContentBounds();
        titleBounds.top += dy;
        titleBounds.left += dx;

        var topTranslate = titleBounds.top + titleBounds.height / 2 - (itemsContentBounds.top + itemsContentBounds.height / 2);
        topTranslate = Math.min(this.contentAreaBounds_.height - itemsContentBounds.height, Math.max(topTranslate, 0));

        this.itemsLayer_.setTransformationMatrix(1, 0, 0, 1, 0, topTranslate);
      }
    }
  }
  this.drawedPage_ = pageNumber;
};


//endregion
//region --- Interactivity
//----------------------------------------------------------------------------------------------------------------------
//
//  Interactivity
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Drag event handler. Redispatches the event over ACDVF event target hierarchy.
 * @param {goog.fx.DragEvent} e
 * @return {boolean} If anyone called preventDefault on the event object (or
 *     if any of the listeners returns false) this will also return false.
 * @protected
 */
anychart.core.ui.Legend.prototype.handleDragEvent = function(e) {
  return this.dispatchEvent(e.type);
};


/** @inheritDoc */
anychart.core.ui.Legend.prototype.makeBrowserEvent = function(e) {
  var res = anychart.core.ui.Legend.base(this, 'makeBrowserEvent', e);
  var tag = anychart.utils.extractTag(res['domTarget']);
  tag = anychart.utils.toNumber(tag && tag.index);
  if (!isNaN(tag))
    res['itemIndex'] = tag;
  return res;
};


/**
 * @param {anychart.core.MouseEvent} event .
 * @private
 */
anychart.core.ui.Legend.prototype.handleMouseOver_ = function(event) {
  var evt = this.makePointEvent_(event);
  if (evt && this.dispatchEvent(evt)) {
    var item = this.items_ && this.items_[evt['itemIndex']];
    var source = /** @type {anychart.core.SeparateChart|anychart.core.stock.Plot} */(evt['itemSource']);
    if (item) {
      if (source && goog.isFunction(source.legendItemOver)) {
        source.legendItemOver(item, event);
      }
      item.applyHover(true);
      if (event) this.showTooltip(event);
    }
  }
};


/**
 * @param {anychart.core.MouseEvent} event .
 * @private
 */
anychart.core.ui.Legend.prototype.handleMouseMove_ = function(event) {
  var evt = this.makePointEvent_(event);
  if (evt && this.dispatchEvent(evt)) {
    if (event) this.showTooltip(event);
  }
};


/**
 * @param {anychart.core.MouseEvent} event .
 * @private
 */
anychart.core.ui.Legend.prototype.handleMouseOut_ = function(event) {
  var evt = this.makePointEvent_(event);
  if (evt && this.dispatchEvent(evt)) {
    var item = this.items_ && this.items_[evt['itemIndex']];
    var source = /** @type {anychart.core.SeparateChart|anychart.core.stock.Plot} */(evt['itemSource']);
    if (item) {
      if (source && goog.isFunction(source.legendItemOut)) {
        source.legendItemOut(item, event);
      }
      item.applyHover(false);
      this.hideTooltip();
    }
  }
};


/**
 * @param {anychart.core.MouseEvent} event .
 * @private
 */
anychart.core.ui.Legend.prototype.handleMouseClick_ = function(event) {
  if (event['button'] != acgraph.events.BrowserEvent.MouseButton.LEFT) return;
  var evt = this.makePointEvent_(event);
  if (evt && this.dispatchEvent(evt)) {
    var item = this.items_ && this.items_[evt['itemIndex']];
    var source = /** @type {anychart.core.SeparateChart|anychart.core.stock.Plot} */(evt['itemSource']);
    if (item && source && goog.isFunction(source.legendItemClick))
      source.legendItemClick.call(source, item, event);
  }
};


/** @inheritDoc */
anychart.core.ui.Legend.prototype.handleMouseEvent = function(event) {
  var evt = this.makePointEvent_(event);
  if (evt)
    this.dispatchEvent(evt);
};


/**
 * This method also has a side effect - it patches the original source event to maintain pointIndex support for
 * browser events.
 * @param {anychart.core.MouseEvent} event
 * @return {Object} An object of event to dispatch. If null - unrecognized type was found.
 * @private
 */
anychart.core.ui.Legend.prototype.makePointEvent_ = function(event) {
  var itemIndex = anychart.utils.toNumber(event['itemIndex']);
  if (isNaN(itemIndex))
    return null;

  var type = event['type'];
  switch (type) {
    case acgraph.events.EventType.MOUSEOUT:
      type = anychart.enums.EventType.LEGEND_ITEM_MOUSE_OUT;
      break;
    case acgraph.events.EventType.MOUSEOVER:
      type = anychart.enums.EventType.LEGEND_ITEM_MOUSE_OVER;
      break;
    case acgraph.events.EventType.MOUSEMOVE:
      type = anychart.enums.EventType.LEGEND_ITEM_MOUSE_MOVE;
      break;
    case acgraph.events.EventType.MOUSEDOWN:
      type = anychart.enums.EventType.LEGEND_ITEM_MOUSE_DOWN;
      break;
    case acgraph.events.EventType.MOUSEUP:
      type = anychart.enums.EventType.LEGEND_ITEM_MOUSE_UP;
      break;
    case acgraph.events.EventType.CLICK:
      type = anychart.enums.EventType.LEGEND_ITEM_CLICK;
      break;
    case acgraph.events.EventType.DBLCLICK:
      type = anychart.enums.EventType.LEGEND_ITEM_DBLCLICK;
      break;
    default:
      return null;
  }

  itemIndex = this.inverted_ ? this.items_.length - 1 - itemIndex : itemIndex;

  var itemSource = null;
  var itemIndexInSource = NaN;
  var item = this.items_[itemIndex];
  if (item && this.itemsSourceInternal) {
    for (var i = 0; i < this.itemsSourceInternal.length; i++) {
      var source = /** @type {anychart.core.SeparateChart|anychart.core.stock.Plot} */ (this.itemsSourceInternal[i]);
      if (goog.getUid(source) == item.sourceUid() &&
          goog.isFunction(source.legendItemCanInteractInMode) &&
          source.legendItemCanInteractInMode(this.itemsSourceMode_)) {
        itemSource = source;
        itemIndexInSource = item.sourceKey();
        break;
      }
    }
  }

  return {
    'type': type,
    'itemIndex': itemIndex,
    'itemSource': itemSource,
    'itemIndexInSource': itemIndexInSource,
    'target': this,
    'originalEvent': event
  };
};


//endregion
//region --- Setup and Dispose
/** @inheritDoc */
anychart.core.ui.Legend.prototype.serialize = function() {
  var json = anychart.core.ui.Legend.base(this, 'serialize');
  json['margin'] = this.margin().serialize();
  json['padding'] = this.padding().serialize();
  json['background'] = this.background().serialize();
  json['title'] = this.title().serialize();
  json['titleFormatter'] = this.titleFormatter();
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
  json['iconSize'] = this.iconSize();
  json['width'] = this.width();
  json['height'] = this.height();
  json['maxWidth'] = this.maxWidth();
  json['maxHeight'] = this.maxHeight();
  json['position'] = this.position();
  json['positionMode'] = this.positionMode();
  json['align'] = this.align();
  json['hoverCursor'] = this.hoverCursor();
  json['drag'] = this.drag();
  return json;
};


/** @inheritDoc */
anychart.core.ui.Legend.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.ui.Legend.base(this, 'setupByJSON', config, opt_default);

  if ('title' in config)
    this.title(config['title']);

  if ('background' in config)
    this.background(config['background']);

  if ('padding' in config)
    this.padding(config['padding']);

  if ('margin' in config)
    this.margin(config['margin']);

  this.titleFormatter(config['titleFormatter']);
  this.titleSeparator(config['titleSeparator']);
  this.paginator(config['paginator']);

  this.tooltip().setupByVal(config['tooltip'], opt_default);

  this.itemsLayout(config['itemsLayout']);
  this.itemsSpacing(config['itemsSpacing']);
  this.inverted(config['inverted']);
  this.itemsSourceMode(config['itemsSourceMode']);
  this.items(config['items']);
  this.itemsTextFormatter(config['itemsTextFormatter']);
  this.itemsFormatter(config['itemsFormatter']);
  this.iconTextSpacing(config['iconTextSpacing']);
  this.iconSize(config['iconSize']);
  this.width(config['width']);
  this.height(config['height']);
  this.maxWidth(config['maxWidth']);
  this.maxHeight(config['maxHeight']);
  this.position(config['position']);
  this.positionMode(config['positionMode']);
  this.align(config['align']);
  this.hoverCursor(config['hoverCursor']);
  this.drag(config['drag']);
};


/** @inheritDoc */
anychart.core.ui.Legend.prototype.disposeInternal = function() {
  anychart.core.ui.Legend.base(this, 'disposeInternal');

  goog.disposeAll(this.dragHandler_, this.tooltip_, this.paginator_, this.itemsPool_, this.items_);

  this.dragHandler_ = null;
  this.itemsPool_ = null;
  this.items_ = null;
  this.tooltip_ = null;
  this.paginator_ = null;
};


//endregion
//region --- Exports
//exports
(function() {
  var proto = anychart.core.ui.Legend.prototype;
  proto['itemsLayout'] = proto.itemsLayout;
  proto['itemsSpacing'] = proto.itemsSpacing;
  proto['items'] = proto.items;
  proto['itemsFormatter'] = proto.itemsFormatter;
  proto['itemsTextFormatter'] = proto.itemsTextFormatter;
  proto['itemsSourceMode'] = proto.itemsSourceMode;
  proto['inverted'] = proto.inverted;
  proto['hoverCursor'] = proto.hoverCursor;
  proto['iconTextSpacing'] = proto.iconTextSpacing;
  proto['iconSize'] = proto.iconSize;
  proto['margin'] = proto.margin;
  proto['padding'] = proto.padding;
  proto['background'] = proto.background;
  proto['title'] = proto.title;
  proto['titleFormatter'] = proto.titleFormatter;
  proto['titleSeparator'] = proto.titleSeparator;
  proto['paginator'] = proto.paginator;
  proto['tooltip'] = proto.tooltip;
  proto['width'] = proto.width;
  proto['height'] = proto.height;
  proto['maxWidth'] = proto.maxWidth;
  proto['maxHeight'] = proto.maxHeight;
  proto['position'] = proto.position;
  proto['positionMode'] = proto.positionMode;
  proto['align'] = proto.align;
  proto['getRemainingBounds'] = proto.getRemainingBounds;
  proto['drag'] = proto.drag;
})();
//endregion
