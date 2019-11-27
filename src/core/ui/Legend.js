//region --- Requiring and Providing
goog.provide('anychart.core.ui.Legend');
goog.provide('anychart.standalones.Legend');

goog.require('acgraph.vector.Text.TextOverflow');
goog.require('anychart.core.IStandaloneBackend');
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
goog.require('anychart.format.Context');
goog.require('anychart.math.Rect');
goog.require('anychart.utils');

goog.require('goog.array');
goog.require('goog.math.Rect');
goog.require('goog.object');
//endregion



/**
 * Legend element.
 * @constructor
 * @implements {anychart.core.IStandaloneBackend}
 * @extends {anychart.core.Text}
 */
anychart.core.ui.Legend = function() {
  anychart.core.ui.Legend.base(this, 'constructor');

  this.addThemes(anychart.themes.DefaultThemes['legend']);

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
  this.drawnPage_ = NaN;

  /**
   * Flag that shows what we need: true - create items, false - update them.
   * @type {boolean}
   * @private
   */
  this.recreateItems_ = true;

  this.invalidate(anychart.ConsistencyState.ALL);

  this.bindHandlersToComponent(this, null, null, null, null, this.handleAll_, null);

  var iconSizeBeforeInvalidationHook = function() {
    if (goog.isDefAndNotNull(this.items_)) {
      for (var i = 0, len = this.items_.length; i < len; i++) {
        this.items_[i].iconSize(this.getOption('iconSize'));
      }
    }
  };

  var positionBeforeInvalidationHook = function() {
    this.dragged = false;
    this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
  };

  var positionModeBeforeInvalidationHook = function() {
    this.dragged = false;
    if (this.getOption('drag')) {
      this.invalidate(anychart.ConsistencyState.LEGEND_DRAG,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    } else {
      this.dispatchSignal(anychart.Signal.BOUNDS_CHANGED);
    }
  };

  var hoverCursorBeforeInvalidationHook = function() {
    if (goog.isDefAndNotNull(this.items_)) {
      for (var i = 0, len = this.items_.length; i < len; i++) {
        this.items_[i].hoverCursor(this.hoverCursor_);
      }
    }
  };

  var iconTextSpacingBeforeInvalidationHook = function() {
    if (goog.isDefAndNotNull(this.items_)) {
      for (var i = 0, len = this.items_.length; i < len; i++) {
        this.items_[i]['iconTextSpacing'](this.getOption('iconTextSpacing'));
      }
    }
  };

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['inverted', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW],
    ['itemsLayout', anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['iconSize', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED,
          0, iconSizeBeforeInvalidationHook],
    ['width', anychart.ConsistencyState.BOUNDS | anychart.ConsistencyState.LEGEND_BACKGROUND,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['height', anychart.ConsistencyState.BOUNDS | anychart.ConsistencyState.LEGEND_BACKGROUND,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['maxWidth', anychart.ConsistencyState.BOUNDS | anychart.ConsistencyState.LEGEND_BACKGROUND,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['maxHeight', anychart.ConsistencyState.BOUNDS | anychart.ConsistencyState.LEGEND_BACKGROUND,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['position', 0, 0, 0, positionBeforeInvalidationHook], // signals\states are in beforeInvalidationHook
    ['positionMode', 0, 0, 0, positionModeBeforeInvalidationHook], // signals\states are in beforeInvalidationHook
    ['align', anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED, 0, function() {this.dragged = false;}],
    ['drag', anychart.ConsistencyState.LEGEND_DRAG, anychart.Signal.NEEDS_REDRAW],
    ['itemsFormat', anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.LEGEND_RECREATE_ITEMS,
          anychart.Signal.NEEDS_REDRAW],
    ['titleFormat', anychart.ConsistencyState.LEGEND_TITLE | anychart.ConsistencyState.BOUNDS,
          anychart.Signal.BOUNDS_CHANGED | anychart.Signal.NEEDS_REDRAW],
    ['itemsSpacing', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['itemsHAlign', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW],
    ['itemsSourceMode', anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.LEGEND_RECREATE_ITEMS,
          anychart.Signal.NEEDS_REDRAW],
    ['hoverCursor', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW,
          0, hoverCursorBeforeInvalidationHook],
    ['iconTextSpacing', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED,
          0, iconTextSpacingBeforeInvalidationHook]
  ]);
};
goog.inherits(anychart.core.ui.Legend, anychart.core.Text);


//region --- Class definitions
/**
 * Supported signals.
 * @type {number}
 */
anychart.core.ui.Legend.prototype.SUPPORTED_SIGNALS = anychart.core.Text.prototype.SUPPORTED_SIGNALS; // NEEDS_REDRAW BOUNDS_CHANGED


/**
 * @type {!Object<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.core.ui.Legend.PROPERTY_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  var spacingNormalizer = function(field) {
    return function(val) {
      var normalized;
      if (field == 'itemsSpacing')
        normalized = parseFloat(val);
      else
        normalized = anychart.core.settings.numberNormalizer(val); // iconTextSpacing needs numberNormalizer
      return goog.isNull(val) ? this.getThemeOption(field) :
          (isNaN(normalized) ? this.getOption(field) : normalized);
    };
  };

  anychart.core.settings.createDescriptors(map, [
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'inverted', anychart.core.settings.booleanNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'itemsLayout', anychart.enums.normalizeLegendLayout],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'iconSize', anychart.utils.toNumber],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'width', anychart.core.settings.asIsNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'height', anychart.core.settings.asIsNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'maxWidth', anychart.core.settings.asIsNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'maxHeight', anychart.core.settings.asIsNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'position', anychart.enums.normalizeOrientation],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'positionMode', anychart.enums.normalizeLegendPositionMode],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'drag', anychart.core.settings.booleanNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'itemsFormat', anychart.core.settings.asIsNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'titleFormat', anychart.core.settings.asIsNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'itemsHAlign', anychart.enums.normalizeAlign],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'itemsSpacing', spacingNormalizer('itemsSpacing')],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'itemsSourceMode', anychart.enums.normalizeLegendItemsSourceMode],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'hoverCursor', anychart.enums.normalizeCursor],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'iconTextSpacing', spacingNormalizer('iconTextSpacing')],
    anychart.core.settings.descriptors.ALIGN
  ]);
  return map;
})();
anychart.core.settings.populate(anychart.core.ui.Legend, anychart.core.ui.Legend.PROPERTY_DESCRIPTORS);


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
 * @param {(anychart.core.SeparateChart|anychart.stockModule.Plot|Array.<anychart.core.SeparateChart|anychart.stockModule.Plot>)=} opt_value Items source.
 * @return {(anychart.core.SeparateChart|anychart.stockModule.Plot|Array.<anychart.core.SeparateChart|anychart.stockModule.Plot>|anychart.core.ui.Legend)} Items source or self for chaining.
 */
anychart.core.ui.Legend.prototype.itemsSource = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = goog.isArray(opt_value) ?
        goog.array.slice(/** @type {Array.<anychart.core.SeparateChart|anychart.stockModule.Plot>} */ (opt_value), 0) :
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
    this.margin_.listenSignals(this.boundsInvalidated_, this);

    this.setupCreated('margin', this.margin_);
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
    this.padding_.listenSignals(this.boundsInvalidated_, this);

    this.setupCreated('padding', this.padding_);
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
    this.background_.listenSignals(this.backgroundInvalidated_, this);

    this.setupCreated('background', this.background_);
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
    this.title_.listenSignals(this.titleInvalidated_, this);
    this.title_.setParentEventTarget(this);

    this.setupCreated('title', this.title_);
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


/**Getter/setter for titleSeparator.
 * @param {(Object|boolean|null)=} opt_value Separator setting.
 * @return {!(anychart.core.ui.Separator|anychart.core.ui.Legend)} Separator setting or self for method chaining.
 */
anychart.core.ui.Legend.prototype.titleSeparator = function(opt_value) {
  if (!this.titleSeparator_) {
    this.titleSeparator_ = new anychart.core.ui.Separator();
    this.titleSeparator_.listenSignals(this.titleSeparatorInvalidated_, this);

    this.setupCreated('titleSeparator', this.titleSeparator_);
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
    this.paginator_.listenSignals(this.paginatorInvalidated_, this);

    this.setupCreated('paginator', this.paginator_);
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
    this.tooltip_ = new anychart.core.ui.Tooltip(0);
    this.tooltip_.listenSignals(this.onTooltipSignal_, this);
    this.tooltip_.containerProvider(this);

    this.tooltip_.addThemes(anychart.themes.DefaultThemes['tooltip']);
    this.setupCreated('tooltip', this.tooltip_);

    // todo: (chernetsky) remove this when tooltip refactored
    this.tooltip_.setupInternal(true, this.tooltip_.themeSettings);
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
 * Show data point tooltip.
 * @protected
 * @param {anychart.core.MouseEvent} event Event that initiates tooltip display.
 */
anychart.core.ui.Legend.prototype.showTooltip = function(event) {
  var tooltip = /** @type {anychart.core.ui.Tooltip} */(this.tooltip());
  if (tooltip.enabled()) {
    var index = event['itemIndex'];
    var item = this.items_[index];
    if (item && event) {
      var values = {
        'value': {value: item.getOption('text'), type: anychart.enums.TokenType.STRING},
        'iconType': {value: item.getOption('iconType'), type: anychart.enums.TokenType.STRING},
        'iconStroke': {value: item.getOption('iconStroke'), type: anychart.enums.TokenType.UNKNOWN},
        'iconFill': {value: item.getOption('iconFill'), type: anychart.enums.TokenType.UNKNOWN},
        'iconHatchFill': {value: item.getOption('iconHatchFill'), type: anychart.enums.TokenType.UNKNOWN},
        'iconMarkerType': {value: item.iconMarkerType(), type: anychart.enums.TokenType.STRING},
        'iconMarkerStroke': {value: item.iconMarkerStroke(), type: anychart.enums.TokenType.UNKNOWN},
        'iconMarkerFill': {value: item.iconMarkerFill(), type: anychart.enums.TokenType.UNKNOWN},
        'meta': {value: this.legendItemsMeta_[index], type: anychart.enums.TokenType.UNKNOWN}
      };
      var formatProvider = new anychart.format.Context(values);
      tooltip.showFloat(event['clientX'], event['clientY'], /** @type {anychart.format.Context} */ (formatProvider.propagate()));
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
  if (!this.enabled() || this.getOption('positionMode') == anychart.enums.LegendPositionMode.INSIDE)
    return parentBounds;

  if (!this.pixelBounds_ || this.hasInvalidationState(anychart.ConsistencyState.BOUNDS))
    this.calculateBounds_();

  switch (this.getOption('position')) {
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
  var itemsLayout = /** @type {anychart.enums.LegendLayout} */(this.getOption('itemsLayout'));
  var itemsSpacing = /** @type {number} */(this.getOption('itemsSpacing'));

  for (var i = 0, len = this.items_.length; i < len; i++) {
    if (i in this.notEnabledItems_)
      continue;

    var bounds = this.items_[i].getPixelBounds();

    width = bounds.width;
    fullWidth += width + itemsSpacing;
    maxWidth = Math.max(maxWidth, width);

    height = bounds.height;
    fullHeight += height + itemsSpacing;
    maxHeight = Math.max(maxHeight, height);


    if (itemsLayout == anychart.enums.LegendLayout.HORIZONTAL_EXPANDABLE) {
      if (rowWidth + width > widthLimit) {
        fullWidthExpand = Math.max(fullWidthExpand, rowWidth);
        fullHeightExpand += rowHeight;
        rowCount++;

        rowWidth = width + itemsSpacing;
        rowHeight = height + itemsSpacing;
      } else {
        rowWidth += width + itemsSpacing;
        rowHeight = Math.max(rowHeight, height + itemsSpacing);
      }
    } else if (itemsLayout == anychart.enums.LegendLayout.VERTICAL_EXPANDABLE) {
      if (colHeight + height > heightLimit) {
        fullHeightExpand = Math.max(fullHeightExpand, colHeight);
        fullWidthExpand += colWidth;
        colCount++;

        colWidth = width + itemsSpacing;
        colHeight = height + itemsSpacing;
      } else {
        colHeight += height + itemsSpacing;
        colWidth = Math.max(colWidth, width + itemsSpacing);
      }
    }
  }


  if (!fullWidth || maxWidth < 0) {
    fullWidth = 0;
    maxWidth = 0;
  } else {
    fullWidth -= itemsSpacing;
  }

  if (!fullHeight || maxHeight < 0) {
    fullHeight = 0;
    maxHeight = 0;
  } else {
    fullHeight -= itemsSpacing;
  }

  this.colCount_ = colCount;
  this.rowCount_ = rowCount;

  if (itemsLayout == anychart.enums.LegendLayout.VERTICAL) {
    return anychart.math.rect(0, 0, Math.max(0, maxWidth), Math.max(0, fullHeight));
  } else if (itemsLayout == anychart.enums.LegendLayout.HORIZONTAL) {
    return anychart.math.rect(0, 0, Math.max(0, fullWidth), Math.max(0, maxHeight));
  } else if (itemsLayout == anychart.enums.LegendLayout.VERTICAL_EXPANDABLE) {
    fullWidthExpand += colWidth - itemsSpacing;
    fullHeightExpand = Math.max(fullHeightExpand, colHeight) - itemsSpacing;
    return anychart.math.rect(0, 0, Math.max(0, fullWidthExpand), Math.max(0, fullHeightExpand));
  } else if (itemsLayout == anychart.enums.LegendLayout.HORIZONTAL_EXPANDABLE) {
    fullWidthExpand = Math.max(fullWidthExpand, rowWidth) - itemsSpacing;
    fullHeightExpand += rowHeight - itemsSpacing;
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

  var width, height, fullWidth, fullHeight, left = 0, top = 0;

  var width_ = /** @type {number|string} */(this.getOption('width'));
  var height_ = /** @type {number|string} */(this.getOption('height'));
  var maxWidth_ = /** @type {number|string} */(this.getOption('maxWidth'));
  var maxHeight_ = /** @type {number|string} */(this.getOption('maxHeight'));

  var maxWidth, maxHeight;
  if (parentBounds) {
    parentWidth = parentBounds.width;
    parentHeight = parentBounds.height;
    if (goog.isDefAndNotNull(width_)) {
      var wiredWidth = anychart.utils.normalizeSize(/** @type {number|string} */(width_), parentWidth);
      var dynamicWidth = goog.isDefAndNotNull(maxWidth_) ?
          anychart.utils.normalizeSize(/** @type {number|string} */(maxWidth_), parentWidth) :
          parentWidth;

      fullWidth = Math.min(parentWidth, wiredWidth, dynamicWidth);
      maxWidth = padding.tightenWidth(margin.tightenWidth(fullWidth));
    } else if (goog.isDefAndNotNull(maxWidth_)) {
      maxWidth = padding.tightenWidth(margin.tightenWidth(anychart.utils.normalizeSize(/** @type {number|string} */(maxWidth_), parentWidth)));
    } else {
      maxWidth = padding.tightenWidth(margin.tightenWidth(parentWidth));
    }
    if (goog.isDefAndNotNull(height_)) {
      var wiredHeight = anychart.utils.normalizeSize(/** @type {number|string} */(height_), parentHeight);
      var dynamicHeight = goog.isDefAndNotNull(maxHeight_) ?
          anychart.utils.normalizeSize(/** @type {number|string} */(maxHeight_), parentHeight) :
          parentHeight;

      fullHeight = Math.min(parentHeight, wiredHeight, dynamicHeight);
      maxHeight = padding.tightenHeight(margin.tightenHeight(fullHeight));
    } else if (goog.isDefAndNotNull(maxHeight_)) {
      maxHeight = padding.tightenHeight(margin.tightenHeight(anychart.utils.normalizeSize(/** @type {number|string} */(maxHeight_), parentHeight)));
    } else {
      maxHeight = padding.tightenHeight(margin.tightenHeight(parentHeight));
    }
  } else {
    if (goog.isNumber(width_) && !isNaN(width_)) {
      fullWidth = width_;
      maxWidth = padding.tightenWidth(width_);
    } else if (goog.isNumber(maxWidth_) && !isNaN(maxWidth_)) {
      maxWidth = padding.tightenWidth(maxWidth_);
    } else {
      maxWidth = Infinity;
    }
    if (goog.isNumber(height_) && !isNaN(height_)) {
      fullHeight = height_;
      maxHeight = padding.tightenHeight(height_);
    } else if (goog.isNumber(maxHeight_) && !isNaN(maxHeight_)) {
      maxHeight = padding.tightenHeight(maxHeight_);
    } else {
      maxHeight = Infinity;
    }
  }

  var separatorBounds;
  var paginatorBounds;
  var titleBounds;

  var separator = this.getCreated('titleSeparator');
  var paginator = this.getCreated('paginator');
  var title = this.getCreated('title');

  var paginatorOrientation = paginator && paginator.getOption('orientation');
  var paginatorIsHorizontal = paginatorOrientation == anychart.enums.Orientation.BOTTOM || paginatorOrientation == anychart.enums.Orientation.TOP;
  var titleOrientation = title && (title.getOption('orientation') || title.defaultOrientation());
  var titleIsHorizontal = titleOrientation && (titleOrientation == anychart.enums.Orientation.BOTTOM || titleOrientation == anychart.enums.Orientation.TOP);
  var titleIsRLYHorizontal = title ? title.getRotation() % 180 == 0 : 0;
  var separatorIsHorizontal = separator && separator.isHorizontal();

  if (separator)
    separator.suspendSignalsDispatching();

  if (paginator)
    paginator.suspendSignalsDispatching();

  if (title)
    title.suspendSignalsDispatching();

  var calculatedBounds = null;
  var lastCalculatedPaginatorBounds = null;
  do {
    if (calculatedBounds) {
      lastCalculatedPaginatorBounds = calculatedBounds;
      calculatedBounds = null;
    }

    var accumHeight = 0;
    var accumWidth = 0;
    var forCompareHeight = 0;
    var forCompareWidth = 0;

    if (title && title.enabled()) {
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

    if (separator && separator.enabled()) {
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
    paginatorBounds = paginator.getPixelBoundsInternal(1);

    var itemsLayout = /** @type {anychart.enums.LegendLayout} */(this.getOption('itemsLayout'));

    if (itemsLayout == anychart.enums.LegendLayout.HORIZONTAL) {
      if (contentWidth > itemsAreaWidth && this.items_ && this.items_.length > 1) {
        paginator.autoEnabled(true);
      } else {
        paginator.autoEnabled(false);
      }
    } else if (itemsLayout == anychart.enums.LegendLayout.VERTICAL_EXPANDABLE) {
      if (contentWidth > itemsAreaWidth && this.colCount_ > 1) {
        paginator.autoEnabled(true);
      } else {
        paginator.autoEnabled(false);
      }
    } else if (itemsLayout == anychart.enums.LegendLayout.VERTICAL ||
        itemsLayout == anychart.enums.LegendLayout.HORIZONTAL_EXPANDABLE) {
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

    if (title && title.enabled()) {
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
            if (paginatorOrientation == anychart.enums.Orientation.TOP || paginatorOrientation == anychart.enums.Orientation.BOTTOM) {
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
        if (separator) {
          separator['width'](width);
          separatorBounds = separator.getContentBounds();
        }

      } else {
        titleBounds = title.getContentBounds();
        if (separator) {
          separator['width'](height);
          separatorBounds = separator.getContentBounds();
        }
      }

      if (titleIsHorizontal)
        contentAreaHeight -= titleBounds.height;
      else
        contentAreaWidth -= titleBounds.width;
    }

    if (separator && separator.enabled()) {
      if (separatorIsHorizontal) {
        contentAreaHeight -= separatorBounds.height;
      } else {
        contentAreaWidth -= separatorBounds.width;
      }
    }

    var pageWidth = contentAreaWidth;
    var pageHeight = contentAreaHeight;

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
  } while (!anychart.math.Rect.equals(lastCalculatedPaginatorBounds, calculatedBounds));

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
      var position = /** @type {anychart.enums.Orientation} */(this.getOption('position'));
      var align = /** @type {anychart.enums.Align} */(this.getOption('align'));
      left = parentBounds.getLeft();
      top = parentBounds.getTop();
      switch (position) {
        case anychart.enums.Orientation.LEFT:
        case anychart.enums.Orientation.RIGHT:
          switch (align) {
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
          switch (align) {
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
      switch (position) {
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

  if (separator)
    separator.resumeSignalsDispatching(false);

  if (paginator)
    paginator.resumeSignalsDispatching(false);

  if (title)
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
  var itemsSpacing = this.getOption('itemsSpacing');
  var k;
  // find first item that need to be showed
  for (k = 0; k < itemsLength; k++) {
    if (!(k in this.notEnabledItems_))
      break;
  }

  if (height > 0 && this.items_ && k != itemsLength) {
    this.distributedItems_[page] = [];
    this.distributedItems_[page][0] = this.items_[k];

    switch (/** @type {anychart.enums.LegendLayout} */(this.getOption('itemsLayout'))) {
      case anychart.enums.LegendLayout.HORIZONTAL:
        w = this.items_[k].getPixelBounds().getWidth();
        for (i = k + 1; i < itemsLength; i++) {
          if (i in this.notEnabledItems_)
            continue;
          if (w + itemsSpacing + this.items_[i].getPixelBounds().getWidth() > width) {
            page++;
            this.distributedItems_[page] = [];
            this.distributedItems_[page][0] = this.items_[i];
            w = this.items_[i].getPixelBounds().getWidth();
          } else {
            w = w + itemsSpacing + this.items_[i].getPixelBounds().getWidth();
            this.distributedItems_[page].push(this.items_[i]);
          }
        }
        break;
      case anychart.enums.LegendLayout.VERTICAL:
        h = this.items_[k].getPixelBounds().getHeight();
        for (i = k + 1, len = this.items_.length; i < len; i++) {
          if (i in this.notEnabledItems_)
            continue;
          if (h + itemsSpacing + this.items_[i].getPixelBounds().getHeight() > height) {
            page++;
            this.distributedItems_[page] = [];
            this.distributedItems_[page][0] = this.items_[i];
            h = this.items_[i].getPixelBounds().getHeight();
          } else {
            h = h + itemsSpacing + this.items_[i].getPixelBounds().getHeight();
            this.distributedItems_[page].push(this.items_[i]);
          }
        }
        break;
      case anychart.enums.LegendLayout.HORIZONTAL_EXPANDABLE:
        var rowWidth = this.items_[k].getPixelBounds().getWidth() + itemsSpacing;
        var rowHeight = this.items_[k].getPixelBounds().getHeight() + itemsSpacing;
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
            rowWidth = itemWidth + itemsSpacing;
            rowHeight = itemHeight + itemsSpacing;
          } else {
            rowWidth += itemWidth + itemsSpacing;
            rowHeight = Math.max(rowHeight, itemHeight + itemsSpacing);
            this.distributedItems_[page].push(item);
          }
        }
        break;
      case anychart.enums.LegendLayout.VERTICAL_EXPANDABLE:
        var colWidth = this.items_[k].getPixelBounds().getWidth() + itemsSpacing;
        var colHeight = this.items_[k].getPixelBounds().getHeight() + itemsSpacing;
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
            colWidth = itemWidth + itemsSpacing;
            colHeight = itemHeight + itemsSpacing;
          } else {
            colWidth = Math.max(colWidth, itemWidth + itemsSpacing);
            colHeight += itemHeight + itemsSpacing;
            this.distributedItems_[page].push(item);
          }
        }
        break;
    }
  }

  var paginator = this.getCreated('paginator');
  if (paginator)
    paginator.pageCount(page + 1);
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
      source = /** @type {anychart.core.SeparateChart|anychart.stockModule.Plot} */ (this.itemsSourceInternal[i]);
      if (!goog.isNull(source) && goog.isFunction(source.createLegendItemsProvider)) {
        var format = /** @type {Function|string} */(this.getOption('itemsFormat'));
        if (goog.isString(format))
          format = anychart.core.utils.TokenParser.getInstance().getFormat(format);
        items = goog.array.concat(items, source.createLegendItemsProvider(this.getOption('itemsSourceMode'), format));
      }
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
      items[i]['iconSize'] = /** @type {number} */(this.getOption('iconSize'));
    config = {
      'iconTextSpacing': /** @type {number} */(this.getOption('iconTextSpacing')),
      'iconSize': /** @type {number} */(this.getOption('iconSize')),
      'hoverCursor': /** @type {anychart.enums.Cursor} */(this.getOption('hoverCursor'))
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
          item.applyFontColor();
          item.setItemIndexToLayer(/** @type {boolean} */(this.getOption('inverted')) ? items.length - 1 - i : i);
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
      if (!item.hasOwnOption('text'))
        item.ownSettings['text'] = 'Legend Item';
      item.applyTextSettings(item.getTextElement(), true);
      item.setItemIndexToLayer(/** @type {boolean} */(this.getOption('inverted')) ? items.length - 1 - i : i);

      this.items_.push(item);
      this.legendItemsMeta_.push(items[i]['meta'] ? items[i]['meta'] : {});
    }
  } else {
    this.clearItems();
  }

  /*
    DEV NOTE: Such sequence of DOM-operations allows to minimize
    forced reflow calculation time:
      1) Add to DOM.
      2) Setup all elements.
      3) Ask numeric measurements (like el.getBBox()). This triggers
         flow recalculation for first measurement request. Another
         measurements are already calculated on first request.

      See more: https://developers.google.com/web/fundamentals/performance/rendering/avoid-large-complex-layouts-and-layout-thrashing
   */
  var textEl, style, sett;
  for (i = 0; i < this.items_.length; i++) {
    item = this.items_[i];
    sett = item.textSettings();
    style = anychart.utils.toStyleString(sett);
    textEl = item.predefinedElement();
    if (!textEl) {
      textEl = this.renderer.createTextElement();
      this.measurementG_.appendChild(textEl);
      item.predefinedElement(textEl);
    }
    textEl.style.cssText = style;
    textEl.textContent = item.text();
  }

  var paginatorTextEl = this.renderer.createTextElement();
  this.measurementG_.appendChild(paginatorTextEl);
  sett = this.paginator().textSettings();
  style = anychart.utils.toStyleString(/** @type {Object} */ (sett));
  paginatorTextEl.style.cssText = style;

  for (i = 0; i < this.items_.length; i++) {
    item = this.items_[i];
    textEl = item.predefinedElement();
    var bbox = textEl['getBBox']();
    item.predefinedBounds(new goog.math.Rect(bbox.x, bbox.y, bbox.width, bbox.height));
  }

  // provide paginator text DOM element reference
  this.paginator_.paginatorTextElement(paginatorTextEl);

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
  var item = new anychart.core.ui.LegendItem();
  item.addThemes(this.themeSettings, 'defaultFontSettings');
  return item;
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
     * @type {acgraph.vector.Layer}
     */
    this.rootElement = acgraph.layer();
    this.bindHandlersToGraphics(this.rootElement);

    if (!this.itemsLayer_) {
      /**
       * Legend items layer.
       * @type {!acgraph.vector.Layer}
       * @private
       */
      this.itemsLayer_ = acgraph.layer();
      this.itemsLayer_.parent(this.rootElement).zIndex(20);
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

    if (acgraph.type() == acgraph.StageType.SVG) {
      this.renderer = acgraph.getRenderer();
      var m = this.renderer.createMeasurement();
      this.measurementG_ = this.renderer.createLayerElement();
      goog.dom.appendChild(m, this.measurementG_);
    }
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
    if (/** @type {boolean} */(this.getOption('inverted')))
      items = items.reverse();
    items = goog.isFunction(formatter) ? formatter(items) : items;
    if (this.items_ && this.items_.length != items.length)
      this.recreateItems_ = true;
    var finalItems = this.prepareItems_(items);
    this.initializeLegendItems_(finalItems);
    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }

  this.clearLastDrawnPage_();
  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    // Reset items width (needs when container was resized) for DVF-2119
    if (this.items_ && this.getOption('textOverflow') == acgraph.vector.Text.TextOverflow.ELLIPSIS) {
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
    var background = this.getCreated('background');
    if (background) {
      background.suspendSignalsDispatching();
      background.parentBounds(this.relativeBoundsWithoutMargin_);
      if (this.enabled()) background.container(this.rootElement);
      background.resumeSignalsDispatching(false);
      background.draw();
    }
    this.markConsistent(anychart.ConsistencyState.LEGEND_BACKGROUND);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.LEGEND_TITLE)) {
    var title = this.getCreated('title');
    if (title) {
      title.suspendSignalsDispatching();
      title.parentBounds(this.relativeBoundsWithoutMarginAndPadding_);
      if (this.enabled()) title.container(this.rootElement);
      title.resumeSignalsDispatching(false);
      title.draw();
    }
    this.markConsistent(anychart.ConsistencyState.LEGEND_TITLE);
  }

  var boundsWithoutTitle = this.title_ ? this.title_.getRemainingBounds() : this.relativeBoundsWithoutMarginAndPadding_;

  if (this.hasInvalidationState(anychart.ConsistencyState.LEGEND_SEPARATOR)) {
    var titleSeparator = this.getCreated('titleSeparator');
    if (titleSeparator) {
      titleSeparator.suspendSignalsDispatching();
      titleSeparator.parentBounds(boundsWithoutTitle);
      if (this.enabled()) titleSeparator.container(this.rootElement);
      titleSeparator.resumeSignalsDispatching(false);
      titleSeparator.draw();
    }
    this.markConsistent(anychart.ConsistencyState.LEGEND_SEPARATOR);
  }

  var boundsWithoutSeparator = this.titleSeparator_ ? this.titleSeparator_.getRemainingBounds() : boundsWithoutTitle;

  var paginator = this.getCreated('paginator');
  if (this.hasInvalidationState(anychart.ConsistencyState.LEGEND_PAGINATOR)) {
    if (paginator) {
      paginator.suspendSignalsDispatching();
      paginator.parentBounds(boundsWithoutSeparator);
      if (this.enabled()) paginator.container(this.rootElement);
      paginator.resumeSignalsDispatching(false);
      paginator.draw();
    }
    this.markConsistent(anychart.ConsistencyState.LEGEND_PAGINATOR);
  }

  var contentBounds = paginator && paginator.getFinalEnabled() ? paginator.getRemainingBounds() : boundsWithoutSeparator;
  var pageToDraw = paginator && paginator.getFinalEnabled() ? paginator.currentPage() - 1 : 0;

  contentBounds.width = Math.max(1, contentBounds.width);
  contentBounds.height = Math.max(1, contentBounds.height);

  this.drawLegendContent_(pageToDraw, /** @type {anychart.math.Rect} */(contentBounds.ceil()));

  if (this.hasInvalidationState(anychart.ConsistencyState.LEGEND_DRAG)) {
    if (!this.dragHandler_ && this.getOption('drag')) {
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
    if (this.getOption('drag')) {
      var diff;
      drag = this.margin().tightenBounds(
          /** @type {!anychart.math.Rect} */(this.getOption('positionMode') == anychart.enums.LegendPositionMode.INSIDE ?
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
 * Clears last drawn page.
 * @private
 */
anychart.core.ui.Legend.prototype.clearLastDrawnPage_ = function() {
  if (goog.isDefAndNotNull(this.drawnPage_) && !isNaN(this.drawnPage_)) {
    var items = this.distributedItems_[this.drawnPage_];
    if (items) {
      for (var i = 0; i < items.length; i++) {
        items[i].enabled(false).draw();
      }
    }
  }
};

/**
 * Put single legend item to correct location.
 *
 * @param {anychart.core.ui.LegendItem} item - Legend item to be put to x, y.
 * @param {number} x - X coordinate to put the item.
 * @param {number} y - Y Coordinate to put the item.
 * @param {anychart.math.Rect} contentBounds - Bounds of the content area.
 * @private
 */
anychart.core.ui.Legend.prototype.putSingleItem_ = function(item, x, y, contentBounds) {
  // Fixes ellipsis applying when change content page throughout paginator.
  item.invalidate(anychart.ConsistencyState.BOUNDS);
  item
  .suspendSignalsDispatching()
  .parentBounds(contentBounds)
      ['x'](x)
      ['y'](y)
  .enabled(true)
  .resumeSignalsDispatching(false)
  .draw();
};


/**
 * Puts items in horizontal layout aligned left.
 *
 * @see { anychart.core.ui.Legend.prototype.drawLegendContent_ }
 * @param {Array.<anychart.core.ui.LegendItem>} items - Items to put.
 * @param {anychart.math.Rect} contentBounds - Bounds of the content area.
 * @private
 */
anychart.core.ui.Legend.prototype.putItemsHorizontalLeft_ = function(items, contentBounds) {
  var x = 0;
  var y = 0;
  var itemsSpacing = /** @type {number} */(this.getOption('itemsSpacing'));
  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    this.putSingleItem_(item, x, y, contentBounds);
    x += item.getPixelBounds().getWidth() + itemsSpacing;
  }
};


/**
* Puts items in horizontal layout aligned right.
*
* @see { anychart.core.ui.Legend.prototype.drawLegendContent_ }
* @param {Array.<anychart.core.ui.LegendItem>} items - Items to put.
* @param {anychart.math.Rect} contentBounds - Bounds of the content area.
* @private
*/
anychart.core.ui.Legend.prototype.putItemsHorizontalRight_ = function(items, contentBounds) {
  var itemsSpacing = /** @type {number} */(this.getOption('itemsSpacing'));
  var x = contentBounds.width;
  var y = 0;

  for (var i = items.length - 1; i >= 0; i--) {
    var item = items[i];
    x -= item.getPixelBounds().getWidth() + itemsSpacing;
    this.putSingleItem_(item, x, y, contentBounds);
  }
};


/**
 * Puts items in horizontal layout aligned center.
 *
 * @see { anychart.core.ui.Legend.prototype.drawLegendContent_ }
 * @param {Array.<anychart.core.ui.LegendItem>} items - Items to put.
 * @param {anychart.math.Rect} contentBounds - Bounds of the content area.
 * @private
 */
anychart.core.ui.Legend.prototype.putItemsHorizontalCenter_ = function(items, contentBounds) {
  var itemsSpacing = /** @type {number} */(this.getOption('itemsSpacing'));
  var i, item;
  var totalWidth = 0;

  for (i = 0; i < items.length; i++) {
    item = items[i];
    totalWidth += items[i].getPixelBounds().getWidth() + itemsSpacing;
  }
  totalWidth -= itemsSpacing; // Removing last spacing.

  var x = (contentBounds.width - totalWidth) / 2;
  var y = 0;
  for (i = 0; i < items.length; i++) {
    item = items[i];
    this.putSingleItem_(item, x, y, contentBounds);
    x += item.getPixelBounds().getWidth() + itemsSpacing;
  }
};


/**
 * Puts items in horizontal layout.
 *
 * @see { anychart.core.ui.Legend.prototype.drawLegendContent_ }
 * @param {Array.<anychart.core.ui.LegendItem>} items - Items to put.
 * @param {anychart.math.Rect} contentBounds - Bounds of the content area.
 * @private
 */
anychart.core.ui.Legend.prototype.putItemsHorizontalLayout_ = function(items, contentBounds) {
  var itemsHAlign = /** @type {anychart.enums.HAlign}*/ (this.getOption('itemsHAlign'));
  switch (itemsHAlign) {
    case anychart.enums.HAlign.LEFT:
    case anychart.enums.HAlign.START:
      this.putItemsHorizontalLeft_(items, contentBounds);
      break;
    case anychart.enums.HAlign.RIGHT:
    case anychart.enums.HAlign.END:
      this.putItemsHorizontalRight_(items, contentBounds);
      break;
    case anychart.enums.HAlign.CENTER:
      this.putItemsHorizontalCenter_(items, contentBounds);
      break;
  }
};


/**
 * Puts items in vertical layout.
 *
 * @see { anychart.core.ui.Legend.prototype.drawLegendContent_ }
 * @param {Array.<anychart.core.ui.LegendItem>} items - Items to put.
 * @param {anychart.math.Rect} contentBounds - Bounds of the content area.
 * @private
 */
anychart.core.ui.Legend.prototype.putItemsVerticalLayout_ = function(items, contentBounds) {
  var x = 0;
  var y = 0;
  var itemsSpacing = /** @type {number} */(this.getOption('itemsSpacing'));

  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    this.putSingleItem_(item, x, y, contentBounds);
    y += item.getPixelBounds().getHeight() + itemsSpacing;
  }
};


/**
 * Puts items in horizontal expandable layout.
 *
 * @see { anychart.core.ui.Legend.prototype.drawLegendContent_ }
 * @param {Array.<anychart.core.ui.LegendItem>} items - Items to put.
 * @param {anychart.math.Rect} contentBounds - Bounds of the content area.
 * @private
 */
anychart.core.ui.Legend.prototype.putItemsHorizontalExpandableLayout_ = function(items, contentBounds) {
  var x = 0;
  var y = 0;
  var rowHeight = 0;
  var itemsSpacing = /** @type {number} */(this.getOption('itemsSpacing'));

  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    var itemBounds = item.getPixelBounds();

    if (x + itemBounds.getWidth() > contentBounds.width) {
      y += rowHeight;
      x = 0;
      rowHeight = 0;
    }

    this.putSingleItem_(item, x, y, contentBounds);

    x += item.getPixelBounds().getWidth() + itemsSpacing;
    rowHeight = Math.max(rowHeight, itemBounds.getHeight() + itemsSpacing);
  }
};


/**
 * Puts items in vertical expandable layout.
 *
 * @see { anychart.core.ui.Legend.prototype.drawLegendContent_ }
 * @param {Array.<anychart.core.ui.LegendItem>} items - Items to put.
 * @param {anychart.math.Rect} contentBounds - Bounds of the content area.
 * @private
 */
anychart.core.ui.Legend.prototype.putItemsVerticalExpandableLayout_ = function(items, contentBounds) {
  var x = 0;
  var y = 0;
  var colWidth = 0;
  var itemsSpacing = /** @type {number} */(this.getOption('itemsSpacing'));

  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    var itemBounds = item.getPixelBounds();

    if (y + itemBounds.getHeight() > contentBounds.height) {
      x += colWidth;
      y = 0;
      colWidth = 0;
    }

    this.putSingleItem_(item, x, y, contentBounds);

    y += item.getPixelBounds().getHeight() + itemsSpacing;
    colWidth = Math.max(colWidth, itemBounds.getWidth() + itemsSpacing);
  }
};


/**
 * This is a very strange method. Its code has been extracted from
 * drawLegendContent_ method during the DVF-4340 minor refactoring.
 *
 * Basically it does nothing, just not needed calculations.
 * Left as is for a while with commented code as it was.
 *
 * @private
 */
anychart.core.ui.Legend.prototype.putTitle_ = function() {
  var title = this.getCreated('title');
  if (title && title.enabled()) {
    var titleOrientation = title.getOption('orientation') || title.defaultOrientation();
    var titleIsHorizontal = titleOrientation == 'top' || titleOrientation == 'bottom';

    if (!titleIsHorizontal) {
      var tx, dx = 0, dy = 0;
      if (tx = this.rootElement.getSelfTransformation()) {
        dx = tx.getTranslateX();
        dy = tx.getTranslateY();
      }
      // var itemsContentBounds = this.itemsLayer_.getAbsoluteBounds();
      var titleBounds = this.title_.getContentBounds();
      titleBounds.top += dy;
      titleBounds.left += dx;

      // var topTranslate = titleBounds.top + titleBounds.height / 2 - (itemsContentBounds.top + itemsContentBounds.height / 2);
      // topTranslate = Math.min(this.contentAreaBounds_.height - itemsContentBounds.height, Math.max(topTranslate, 0));
      //
      // // this.itemsLayer_.setTransformationMatrix(1, 0, 0, 1, 0, topTranslate);
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

    var items = this.distributedItems_[pageNumber];
    var itemsLayout = /** @type {anychart.enums.LegendLayout} */(this.getOption('itemsLayout'));

    if (items) {
      switch (itemsLayout) {
        case anychart.enums.LegendLayout.HORIZONTAL:
          this.putItemsHorizontalLayout_(items, contentBounds);
          break;
        case anychart.enums.LegendLayout.VERTICAL:
          this.putItemsVerticalLayout_(items, contentBounds);
          break;
        case anychart.enums.LegendLayout.HORIZONTAL_EXPANDABLE:
          this.putItemsHorizontalExpandableLayout_(items, contentBounds);
          break;
        case anychart.enums.LegendLayout.VERTICAL_EXPANDABLE:
          this.putItemsVerticalExpandableLayout_(items, contentBounds);
          break;
      }
    }

    this.putTitle_();
  }
  this.drawnPage_ = pageNumber;
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
anychart.core.ui.Legend.prototype.handleAll_ = function(event) {
  var evt = this.makePointEvent_(event);
  if (evt && this.dispatchEvent(evt)) {
    var item, source;
    switch (evt.type) {
      case anychart.enums.EventType.LEGEND_ITEM_MOUSE_OVER:
        item = this.items_ && this.items_[evt['itemIndex']];
        source = /** @type {anychart.core.SeparateChart|anychart.stockModule.Plot} */(evt['itemSource']);
        if (item) {
          if (source && goog.isFunction(source.legendItemOver)) {
            source.legendItemOver(item, event);
          }
          item.applyHover(true);
          if (event) this.showTooltip(event);
        }
        break;

      case anychart.enums.EventType.LEGEND_ITEM_MOUSE_MOVE:
        if (event) this.showTooltip(event);
        break;

      case anychart.enums.EventType.LEGEND_ITEM_MOUSE_OUT:
        item = this.items_ && this.items_[evt['itemIndex']];
        source = /** @type {anychart.core.SeparateChart|anychart.stockModule.Plot} */(evt['itemSource']);
        if (item) {
          if (source && goog.isFunction(source.legendItemOut)) {
            source.legendItemOut(item, event);
          }
          item.applyHover(false);
          this.hideTooltip();
        }
        break;

      case anychart.enums.EventType.LEGEND_ITEM_CLICK:
        if (event['button'] != acgraph.events.BrowserEvent.MouseButton.LEFT) return;
        item = this.items_ && this.items_[evt['itemIndex']];
        source = /** @type {anychart.core.SeparateChart|anychart.stockModule.Plot} */(evt['itemSource']);
        if (item && source && goog.isFunction(source.legendItemClick))
          source.legendItemClick.call(source, item, event);
        break;
    }
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

  itemIndex = /** @type {boolean} */(this.getOption('inverted')) ? this.items_.length - 1 - itemIndex : itemIndex;

  var itemSource = null;
  var itemIndexInSource = NaN;
  var item = this.items_[itemIndex];
  if (item && this.itemsSourceInternal) {
    for (var i = 0; i < this.itemsSourceInternal.length; i++) {
      var source = /** @type {anychart.core.SeparateChart|anychart.stockModule.Plot} */ (this.itemsSourceInternal[i]);
      if (goog.getUid(source) == item.sourceUid() &&
          goog.isFunction(source.legendItemCanInteractInMode) &&
          source.legendItemCanInteractInMode(/** @type {anychart.enums.LegendItemsSourceMode} */(this.getOption('itemsSourceMode')))) {
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

  anychart.core.settings.serialize(this, anychart.core.ui.Legend.PROPERTY_DESCRIPTORS, json);
  json['margin'] = this.margin().serialize();
  json['padding'] = this.padding().serialize();
  json['background'] = this.background().serialize();
  json['title'] = this.title().serialize();
  json['titleSeparator'] = this.titleSeparator().serialize();
  json['paginator'] = this.paginator().serialize();
  json['tooltip'] = this.tooltip().serialize();
  if (goog.isDef(this.items()))
    json['items'] = this.items();
  return json;
};


/** @inheritDoc */
anychart.core.ui.Legend.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.ui.Legend.base(this, 'setupByJSON', config, opt_default);

  anychart.core.settings.deserialize(this, anychart.core.ui.Legend.PROPERTY_DESCRIPTORS, config, opt_default);

  if ('padding' in config)
    this.padding().setupInternal(!!opt_default, config['padding']);

  if ('margin' in config)
    this.margin().setupInternal(!!opt_default, config['margin']);

  if ('title' in config)
    this.title().setupInternal(!!opt_default, config['title']);

  if ('background' in config)
    this.background().setupInternal(!!opt_default, config['background']);

  if ('titleSeparator' in config)
    this.titleSeparator().setupInternal(!!opt_default, config['titleSeparator']);

  if ('paginator' in config)
    this.paginator().setupInternal(!!opt_default, config['paginator']);

  this.tooltip().setupInternal(!!opt_default, config['tooltip']);

  this.items(config['items']);
  this.itemsFormatter(config['itemsFormatter']);
};


/** @inheritDoc */
anychart.core.ui.Legend.prototype.disposeInternal = function() {
  anychart.core.ui.Legend.base(this, 'disposeInternal');

  if (this.measurementG_) {
    goog.dom.removeChildren(this.measurementG_);
    goog.dom.removeNode(this.measurementG_);
  }

  goog.disposeAll(
      this.dragHandler_,
      this.tooltip_,
      this.paginator_,
      this.itemsPool_,
      this.items_,
      this.itemsLayer_,
      this.margin_,
      this.padding_,
      this.background_,
      this.title_,
      this.titleSeparator_,
      this.tooltip_,
      this.rootElement,
      this.measurementG_
  );

  this.dragHandler_ = null;
  this.itemsPool_ = null;
  this.items_ = null;
  this.margin_ = null;
  this.padding_ = null;
  this.paginator_ = null;
  this.itemsLayer_ = null;
  this.background_ = null;
  this.title_ = null;
  this.titleSeparator_ = null;
  this.tooltip_ = null;
  this.rootElement = null;
  this.measurementG_ = null;
};



//endregion
//region --- Standalone
//------------------------------------------------------------------------------
//
//  Standalone
//
//------------------------------------------------------------------------------
/**
 * @constructor
 * @extends {anychart.core.ui.Legend}
 */
anychart.standalones.Legend = function() {
  anychart.standalones.Legend.base(this, 'constructor');
};
goog.inherits(anychart.standalones.Legend, anychart.core.ui.Legend);
anychart.core.makeStandalone(anychart.standalones.Legend, anychart.core.ui.Legend);


//region --- STANDALONE ---
/**
 * Define, is one of the bounds settings set in percent.
 * @return {boolean} Is one of the bounds settings set in percent.
 */
anychart.standalones.Legend.prototype.dependsOnContainerSize = function() {
  var width = this.getOption('width');
  var height = this.getOption('height');
  return anychart.utils.isPercent(width) || anychart.utils.isPercent(height) || goog.isNull(width) || goog.isNull(height);
};


//endregion
/**
 * Removes signal listeners.
 * @private
 */
anychart.standalones.Legend.prototype.unlistenStockPlots_ = function() {
  if (!this.itemsSourceInternal) return;
  var source;
  for (var i = 0; i < this.itemsSourceInternal.length; i++) {
    source = this.itemsSourceInternal[i];
    if (source.needsInteractiveLegendUpdate && source.needsInteractiveLegendUpdate()) {
      source.unlistenSignals(this.onStockPlotSignal_, source);
    }
  }
};


/**
 * Adds signal listeners on stock plots.
 * @private
 */
anychart.standalones.Legend.prototype.listenStockPlots_ = function() {
  if (!this.itemsSourceInternal) return;
  var source;
  for (var i = 0; i < this.itemsSourceInternal.length; i++) {
    source = this.itemsSourceInternal[i];
    if (source.needsInteractiveLegendUpdate && source.needsInteractiveLegendUpdate()) {
      source.listenSignals(this.onStockPlotSignal_, this);
    }
  }
};


/**
 * @param {anychart.SignalEvent} event
 * @private
 */
anychart.standalones.Legend.prototype.onStockPlotSignal_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEED_UPDATE_LEGEND)) {
    this.suspendSignalsDispatching();
    var plot = /** @type {anychart.stockModule.Plot} */ (event.target);
    var autoText = plot.getLegendAutoText(/** @type {string|Function} */ (this.getOption('titleFormat')));
    var title = this.getCreated('title');
    if (title && !goog.isNull(autoText))
      title.autoText(autoText);
    this.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.LEGEND_RECREATE_ITEMS);
    if (this.container())
      this.draw();
    this.resumeSignalsDispatching(false);
  }
};


/**
 * Getter/setter for items source.
 * @param {(anychart.core.SeparateChart|anychart.stockModule.Plot|Array.<anychart.core.SeparateChart|anychart.stockModule.Plot>)=} opt_value Items source.
 * @return {(anychart.core.SeparateChart|anychart.stockModule.Plot|Array.<anychart.core.SeparateChart|anychart.stockModule.Plot>|anychart.core.ui.Legend)} Items source or self for chaining.
 */
anychart.standalones.Legend.prototype.itemsSource = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = goog.isArray(opt_value) ?
        goog.array.slice(/** @type {Array.<anychart.core.SeparateChart|anychart.stockModule.Plot>} */ (opt_value), 0) :
        goog.isNull(opt_value) ?
            opt_value : [opt_value];
    if (!this.sourceEquals(opt_value)) {
      this.unlistenStockPlots_();
      this.itemsSourceInternal = opt_value;
      this.listenStockPlots_();
      this.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.LEGEND_RECREATE_ITEMS, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.itemsSourceInternal;
};


/**
 * Constructor function.
 * @return {!anychart.standalones.Legend}
 */
anychart.standalones.legend = function() {
  var legend = new anychart.standalones.Legend();
  legend.setup(anychart.getFullTheme('standalones.legend'));
  return legend;
};


//endregion
//region --- Exports
//exports
(function() {
  var proto = anychart.core.ui.Legend.prototype;
  proto['items'] = proto.items;
  proto['itemsFormatter'] = proto.itemsFormatter;
  proto['margin'] = proto.margin;
  proto['padding'] = proto.padding;
  proto['background'] = proto.background;
  proto['title'] = proto.title;
  proto['titleSeparator'] = proto.titleSeparator;
  proto['paginator'] = proto.paginator;
  proto['tooltip'] = proto.tooltip;
  proto['getRemainingBounds'] = proto.getRemainingBounds;
  proto['getPixelBounds'] = proto.getPixelBounds;

  // auto generated
  // proto['inverted'] = proto.inverted;
  // proto['itemsLayout'] = proto.itemsLayout;
  // proto['iconSize'] = proto.iconSize;
  // proto['width'] = proto.width;
  // proto['height'] = proto.height;
  // proto['maxWidth'] = proto.maxWidth;
  // proto['maxHeight'] = proto.maxHeight;
  // proto['align'] = proto.align;
  // proto['drag'] = proto.drag;
  // proto['itemsFormat'] = proto.itemsFormat;
  // proto['titleFormat'] = proto.titleFormat;
  // proto['itemsSpacing'] = proto.itemsSpacing;
  // proto['itemsSourceMode'] = proto.itemsSourceMode;
  // proto['hoverCursor'] = proto.hoverCursor;
  // proto['iconTextSpacing'] = proto.iconTextSpacing;
  // proto['position'] = proto.position;
  // proto['positionMode'] = proto.positionMode;

  proto = anychart.standalones.Legend.prototype;
  goog.exportSymbol('anychart.standalones.legend', anychart.standalones.legend);
  proto['draw'] = proto.draw;
  proto['parentBounds'] = proto.parentBounds;
  proto['container'] = proto.container;
  proto['itemsSource'] = proto.itemsSource;
})();
//endregion
