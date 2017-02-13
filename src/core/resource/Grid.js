goog.provide('anychart.core.resource.Grid');
goog.require('anychart.core.VisualBaseWithBounds');
goog.require('anychart.core.settings');
goog.require('anychart.core.ui.Background');
goog.require('anychart.core.ui.Overlay');



/**
 * Resource Chart grid.
 * @constructor
 * @extends {anychart.core.VisualBaseWithBounds}
 * @implements {anychart.core.settings.IObjectWithSettings}
 */
anychart.core.resource.Grid = function() {
  anychart.core.resource.Grid.base(this, 'constructor');

  /**
   * Root element of the grid.
   * @type {acgraph.vector.Layer}
   * @private
   */
  this.rootElement_ = null;

  /**
   * Root element of the moving parts of the grid.
   * @type {acgraph.vector.Layer}
   * @private
   */
  this.gridLayer_ = null;

  /**
   * Path for odd working tiles.
   * @type {acgraph.vector.Path}
   * @private
   */
  this.oddPath_ = null;

  /**
   * Path for even working tiles.
   * @type {acgraph.vector.Path}
   * @private
   */
  this.evenPath_ = null;

  /**
   * Path for odd holiday tiles.
   * @type {acgraph.vector.Path}
   * @private
   */
  this.oddHolidayPath_ = null;

  /**
   * Path for even holiday tiles.
   * @type {acgraph.vector.Path}
   * @private
   */
  this.evenHolidayPath_ = null;

  /**
   * Path for odd working tiles.
   * @type {acgraph.vector.Path}
   * @private
   */
  this.oddHFPath_ = null;

  /**
   * Path for even working tiles.
   * @type {acgraph.vector.Path}
   * @private
   */
  this.evenHFPath_ = null;

  /**
   * Path for odd holiday tiles.
   * @type {acgraph.vector.Path}
   * @private
   */
  this.oddHolidayHFPath_ = null;

  /**
   * Path for even holiday tiles.
   * @type {acgraph.vector.Path}
   * @private
   */
  this.evenHolidayHFPath_ = null;

  /**
   * Path for horizontal strokes.
   * @type {acgraph.vector.Path}
   * @private
   */
  this.hStrokePath_ = null;

  /**
   * Path for vertical strokes.
   * @type {acgraph.vector.Path}
   * @private
   */
  this.vStrokePath_ = null;

  /**
   * Pixel bounds cache.
   * @type {anychart.math.Rect}
   * @private
   */
  this.pixelBoundsCache_ = null;

  /**
   * Background.
   * @type {anychart.core.ui.Background}
   * @private
   */
  this.background_ = new anychart.core.ui.Background();
  this.background_.listenSignals(this.handleBackgroundSignal_, this);

  this.overlay_ = new anychart.core.ui.Overlay();
  this.overlay_.listenSignals(this.overlaySignal_, this);

  /**
   * X scale holder.
   * @type {anychart.scales.DateTimeWithCalendar}
   * @private
   */
  this.xScale_ = null;

  /**
   * Settings holder.
   * @type {Object}
   */
  this.settings = {};

  /**
   * Default settings holder.
   * @type {Object}
   */
  this.defaultSettings = {};

  /**
   * Heights array.
   * @type {Array.<number>}
   * @private
   */
  this.heights_ = [];

  /**
   * Y Scroll Position.
   * @type {number}
   * @private
   */
  this.yScrollPosition_ = 0;
};
goog.inherits(anychart.core.resource.Grid, anychart.core.VisualBaseWithBounds);


//region --- Infrastructure
//------------------------------------------------------------------------------
//
//  Infrastructure
//
//------------------------------------------------------------------------------
/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.resource.Grid.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.VisualBaseWithBounds.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.APPEARANCE |
    anychart.ConsistencyState.RESOURCE_GRID_BACKGROUND |
    anychart.ConsistencyState.RESOURCE_GRID_TICKS |
    anychart.ConsistencyState.RESOURCE_GRID_POSITION |
    anychart.ConsistencyState.RESOURCE_GRID_OVERLAY;


/**
 * Supported signals.
 * @type {number}
 */
anychart.core.resource.Grid.prototype.SUPPORTED_SIGNALS =
    anychart.core.VisualBaseWithBounds.prototype.SUPPORTED_SIGNALS;


//endregion
//region --- Settings
//------------------------------------------------------------------------------
//
//  Settings
//
//------------------------------------------------------------------------------
/**
 * Properties that should be defined in anychart.core.resource.Grid prototype.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.core.resource.Grid.DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};
  map['horizontalStroke'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'horizontalStroke',
      anychart.core.settings.strokeNormalizer,
      anychart.ConsistencyState.APPEARANCE,
      anychart.Signal.NEEDS_REDRAW);
  map['verticalStroke'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'verticalStroke',
      anychart.core.settings.strokeNormalizer,
      anychart.ConsistencyState.APPEARANCE,
      anychart.Signal.NEEDS_REDRAW);
  map['oddFill'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'oddFill',
      anychart.core.settings.fillNormalizer,
      anychart.ConsistencyState.APPEARANCE,
      anychart.Signal.NEEDS_REDRAW);
  map['evenFill'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'evenFill',
      anychart.core.settings.fillNormalizer,
      anychart.ConsistencyState.APPEARANCE,
      anychart.Signal.NEEDS_REDRAW);
  map['oddHolidayFill'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'oddHolidayFill',
      anychart.core.settings.fillNormalizer,
      anychart.ConsistencyState.APPEARANCE,
      anychart.Signal.NEEDS_REDRAW);
  map['evenHolidayFill'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'evenHolidayFill',
      anychart.core.settings.fillNormalizer,
      anychart.ConsistencyState.APPEARANCE,
      anychart.Signal.NEEDS_REDRAW);
  map['oddHatchFill'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'oddHatchFill',
      anychart.core.settings.hatchFillNormalizer,
      anychart.ConsistencyState.APPEARANCE,
      anychart.Signal.NEEDS_REDRAW);
  map['evenHatchFill'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'evenHatchFill',
      anychart.core.settings.hatchFillNormalizer,
      anychart.ConsistencyState.APPEARANCE,
      anychart.Signal.NEEDS_REDRAW);
  map['oddHolidayHatchFill'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'oddHolidayHatchFill',
      anychart.core.settings.hatchFillNormalizer,
      anychart.ConsistencyState.APPEARANCE,
      anychart.Signal.NEEDS_REDRAW);
  map['evenHolidayHatchFill'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'evenHolidayHatchFill',
      anychart.core.settings.hatchFillNormalizer,
      anychart.ConsistencyState.APPEARANCE,
      anychart.Signal.NEEDS_REDRAW);
  map['drawTopLine'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'drawTopLine',
      anychart.core.settings.booleanNormalizer,
      anychart.ConsistencyState.RESOURCE_GRID_TICKS,
      anychart.Signal.NEEDS_REDRAW);
  map['drawRightLine'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'drawRightLine',
      anychart.core.settings.booleanNormalizer,
      anychart.ConsistencyState.RESOURCE_GRID_TICKS,
      anychart.Signal.NEEDS_REDRAW);
  map['drawBottomLine'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'drawBottomLine',
      anychart.core.settings.booleanNormalizer,
      anychart.ConsistencyState.RESOURCE_GRID_TICKS,
      anychart.Signal.NEEDS_REDRAW);
  map['drawLeftLine'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'drawLeftLine',
      anychart.core.settings.booleanNormalizer,
      anychart.ConsistencyState.RESOURCE_GRID_TICKS,
      anychart.Signal.NEEDS_REDRAW);
  return map;
})();
anychart.core.settings.populate(anychart.core.resource.Grid, anychart.core.resource.Grid.DESCRIPTORS);


//endregion
//region --- Public methods
//------------------------------------------------------------------------------
//
//  Public methods
//
//------------------------------------------------------------------------------
/**
 * Background getter/setter
 * @param {(string|Object|null|boolean)=} opt_value
 * @return {anychart.core.ui.Background|anychart.core.resource.Grid}
 */
anychart.core.resource.Grid.prototype.background = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.background_.setup(opt_value);
    return this;
  }
  return this.background_;
};


/**
 * Overlay element.
 * @param {(string|Object|null|boolean)=} opt_value .
 * @return {anychart.core.resource.Grid|anychart.core.ui.Overlay}
 */
anychart.core.resource.Grid.prototype.overlay = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.overlay_.setup(opt_value);
    this.invalidate(anychart.ConsistencyState.RESOURCE_GRID_OVERLAY, anychart.Signal.NEEDS_REDRAW);
    return this;
  }
  return this.overlay_;
};


//endregion
//region --- Internal methods
//------------------------------------------------------------------------------
//
//  Internal methods
//
//------------------------------------------------------------------------------
/**
 * Getter/setter for xScale.
 * @param {anychart.scales.DateTimeWithCalendar=} opt_value
 * @return {anychart.scales.DateTimeWithCalendar|anychart.core.resource.Grid}
 */
anychart.core.resource.Grid.prototype.xScale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.xScale_ != opt_value) {
      if (this.xScale_)
        this.xScale_.unlistenSignals(this.handleXScaleSignal_, this);
      this.xScale_ = opt_value;
      if (this.xScale_)
        this.xScale_.listenSignals(this.handleXScaleSignal_, this);
      this.invalidate(anychart.ConsistencyState.RESOURCE_GRID_TICKS, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.xScale_;
};


/**
 * Getter/setter for heights array.
 * @param {Array.<number>=} opt_value
 * @return {Array.<number>|anychart.core.resource.Grid}
 */
anychart.core.resource.Grid.prototype.heights = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.heights_ = opt_value;
    this.invalidate(anychart.ConsistencyState.RESOURCE_GRID_TICKS, anychart.Signal.NEEDS_REDRAW);
    return this;
  }
  return this.heights_;
};


/**
 * Getter/setter for grid position.
 * @param {number=} opt_value
 * @return {number|anychart.core.resource.Grid}
 */
anychart.core.resource.Grid.prototype.verticalScrollBarPosition = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.yScrollPosition_ = opt_value;
    this.invalidate(anychart.ConsistencyState.RESOURCE_GRID_POSITION, anychart.Signal.NEEDS_REDRAW);
    return this;
  }
  return this.yScrollPosition_;
};


//endregion
//region --- Signals handling
//------------------------------------------------------------------------------
//
//  Signals handling
//
//------------------------------------------------------------------------------
/**
 * XScale signals handler.
 * @param {anychart.SignalEvent} e
 * @private
 */
anychart.core.resource.Grid.prototype.handleXScaleSignal_ = function(e) {
  this.invalidate(anychart.ConsistencyState.RESOURCE_GRID_TICKS, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Background signals handler.
 * @param {anychart.SignalEvent} e
 * @private
 */
anychart.core.resource.Grid.prototype.handleBackgroundSignal_ = function(e) {
  this.invalidate(anychart.ConsistencyState.RESOURCE_GRID_BACKGROUND, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Overlay signals handler.
 * @param {anychart.SignalEvent} e
 * @private
 */
anychart.core.resource.Grid.prototype.overlaySignal_ = function(e) {
  this.invalidate(anychart.ConsistencyState.RESOURCE_GRID_OVERLAY, anychart.Signal.NEEDS_REDRAW);
};


//endregion
//region --- Drawing
//------------------------------------------------------------------------------
//
//  Drawing
//
//------------------------------------------------------------------------------
/**
 * Draws the grid.
 */
anychart.core.resource.Grid.prototype.draw = function() {
  if (!this.checkDrawingNeeded())
    return;

  if (!this.rootElement_) {
    this.rootElement_ = acgraph.layer();
    this.gridLayer_ = this.rootElement_.layer();
    this.clip_ = acgraph.clip();
    this.rootElement_.clip(this.clip_);
    this.oddPath_ = this.gridLayer_.path();
    this.oddPath_.stroke(null);
    this.evenPath_ = this.gridLayer_.path();
    this.evenPath_.stroke(null);
    this.oddHolidayPath_ = this.gridLayer_.path();
    this.oddHolidayPath_.stroke(null);
    this.evenHolidayPath_ = this.gridLayer_.path();
    this.evenHolidayPath_.stroke(null);
    this.oddHFPath_ = this.gridLayer_.path();
    this.oddHFPath_.stroke(null);
    this.evenHFPath_ = this.gridLayer_.path();
    this.evenHFPath_.stroke(null);
    this.oddHolidayHFPath_ = this.gridLayer_.path();
    this.oddHolidayHFPath_.stroke(null);
    this.evenHolidayHFPath_ = this.gridLayer_.path();
    this.evenHolidayHFPath_.stroke(null);
    this.hStrokePath_ = this.gridLayer_.path();
    this.hStrokePath_.fill(null);
    this.hStrokePath_.disableStrokeScaling(true);
    this.vStrokePath_ = this.gridLayer_.path();
    this.vStrokePath_.fill(null);
    this.vStrokePath_.disableStrokeScaling(true);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    this.pixelBoundsCache_ = this.getPixelBounds();
    anychart.utils.applyPixelShiftToRect(this.pixelBoundsCache_, 0);
    this.clip_.shape(this.pixelBoundsCache_);
    this.invalidate(
        anychart.ConsistencyState.RESOURCE_GRID_BACKGROUND |
        anychart.ConsistencyState.RESOURCE_GRID_POSITION |
        anychart.ConsistencyState.RESOURCE_GRID_TICKS |
        anychart.ConsistencyState.RESOURCE_GRID_OVERLAY);
    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.RESOURCE_GRID_BACKGROUND)) {
    // some hacks
    this.gridLayer_.zIndex(/** @type {number} */(this.background_.zIndex()) + 1);
    this.background_.parentBounds(this.pixelBoundsCache_);
    this.background_.container(this.rootElement_);
    this.background_.draw();
    this.markConsistent(anychart.ConsistencyState.RESOURCE_GRID_BACKGROUND);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    this.oddPath_.fill(/** @type {acgraph.vector.Fill} */(this.getOption('oddFill')));
    this.evenPath_.fill(/** @type {acgraph.vector.Fill} */(this.getOption('evenFill')));
    this.oddHolidayPath_.fill(/** @type {acgraph.vector.Fill} */(this.getOption('oddHolidayFill')));
    this.evenHolidayPath_.fill(/** @type {acgraph.vector.Fill} */(this.getOption('evenHolidayFill')));
    this.oddHFPath_.fill(/** @type {acgraph.vector.Fill} */(this.getOption('oddHatchFill')));
    this.evenHFPath_.fill(/** @type {acgraph.vector.Fill} */(this.getOption('evenHatchFill')));
    this.oddHolidayHFPath_.fill(/** @type {acgraph.vector.Fill} */(this.getOption('oddHolidayHatchFill')));
    this.evenHolidayHFPath_.fill(/** @type {acgraph.vector.Fill} */(this.getOption('evenHolidayHatchFill')));
    this.hStrokePath_.stroke(/** @type {acgraph.vector.Stroke} */(this.getOption('horizontalStroke')));
    this.vStrokePath_.stroke(/** @type {acgraph.vector.Stroke} */(this.getOption('verticalStroke')));
    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.RESOURCE_GRID_TICKS)) {
    this.oddPath_.clear();
    this.evenPath_.clear();
    this.oddHolidayPath_.clear();
    this.evenHolidayPath_.clear();
    this.oddHFPath_.clear();
    this.evenHFPath_.clear();
    this.oddHolidayHFPath_.clear();
    this.evenHolidayHFPath_.clear();
    this.hStrokePath_.clear();
    this.vStrokePath_.clear();
    if (this.xScale_) {
      var horzTicks = this.xScale_.getTicks(0, this.pixelBoundsCache_.width);
      var lastRow = this.heights_.length - 1;
      var lastCol = horzTicks.length - 1;
      var hThickness = acgraph.vector.getThickness(/** @type {acgraph.vector.Stroke} */(this.hStrokePath_.stroke()));
      var vThickness = acgraph.vector.getThickness(/** @type {acgraph.vector.Stroke} */(this.vStrokePath_.stroke()));
      var from = anychart.utils.applyPixelShift(0, hThickness);
      var to = 0;
      var drawTop = !!this.getOption('drawTopLine');
      var drawRight = !!this.getOption('drawRightLine');
      var drawBottom = !!this.getOption('drawBottomLine');
      var drawLeft = !!this.getOption('drawLeftLine');
      for (var row = 0; row <= lastRow; row++) {
        var isLastRow = row == lastRow;
        to = anychart.utils.applyPixelShift(from + this.heights_[row] - (isLastRow ? hThickness : 0), hThickness);
        for (var col = 0; col <= lastCol; col++) {
          var isLastCol = col == lastCol;
          var tick = horzTicks[col];
          var left = anychart.utils.applyPixelShift(
              this.xScale_.dateToPix(tick['start']) + this.pixelBoundsCache_.left,
              vThickness);
          var right = anychart.utils.applyPixelShift(
              this.xScale_.dateToPix(tick['end']) + this.pixelBoundsCache_.left - (isLastCol ? vThickness : 0),
              vThickness);
          var holiday = tick['holiday'];
          var path, hfPath;
          if (!!(row & 1)) { // treat rows count starting from 1
            if (holiday) {
              path = this.evenHolidayPath_;
              hfPath = this.evenHolidayHFPath_;
            } else {
              path = this.evenPath_;
              hfPath = this.evenHFPath_;
            }
          } else {
            if (holiday) {
              path = this.oddHolidayPath_;
              hfPath = this.oddHolidayHFPath_;
            } else {
              path = this.oddPath_;
              hfPath = this.oddHFPath_;
            }
          }
          var l = (drawLeft && !col) ? Math.ceil(left) : Math.floor(left);
          var r = (drawRight || !isLastCol) ? Math.floor(right) : Math.ceil(right);
          var t = (drawTop && !row) ? Math.ceil(from) : Math.floor(from);
          var b = (drawBottom || !isLastRow) ? Math.floor(to) : Math.ceil(to);
          path
              .moveTo(l, t)
              .lineTo(r, t)
              .lineTo(r, b)
              .lineTo(l, b)
              .close();
          hfPath
              .moveTo(l, t)
              .lineTo(r, t)
              .lineTo(r, b)
              .lineTo(l, b)
              .close();
          if (drawLeft && !col)
            this.vStrokePath_
                .moveTo(left, t)
                .lineTo(left, b);
          if (drawRight || !isLastCol)
            this.vStrokePath_
                .moveTo(right, t)
                .lineTo(right, b);
          if (drawTop && !row)
            this.hStrokePath_
                .moveTo(l, from)
                .lineTo(r, from);
          if (drawBottom || !isLastRow)
            this.hStrokePath_
                .moveTo(l, to)
                .lineTo(r, to);
        }
        from = to;
      }
      this.fullPixelHeight_ = to;
    } else {
      this.fullPixelHeight_ = false;
    }
    this.markConsistent(anychart.ConsistencyState.RESOURCE_GRID_TICKS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.RESOURCE_GRID_POSITION)) {
    this.gridLayer_.setTransformationMatrix(1, 0, 0, 1, 0, Math.round(this.pixelBoundsCache_.top - this.yScrollPosition_ * this.fullPixelHeight_));
    this.markConsistent(anychart.ConsistencyState.RESOURCE_GRID_POSITION);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.RESOURCE_GRID_OVERLAY)) {
    this.overlay_.target(this.container().getStage().getDomWrapper());
    this.overlay_.setBounds(this.getPixelBounds());
    this.overlay_.draw();
    this.markConsistent(anychart.ConsistencyState.RESOURCE_GRID_OVERLAY);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    this.rootElement_.parent(/** @type {acgraph.vector.ILayer} */(this.container()));
    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    this.rootElement_.zIndex(/** @type {number} */(this.zIndex()));
    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }
};


/** @inheritDoc */
anychart.core.resource.Grid.prototype.remove = function() {
  if (this.rootElement_)
    this.rootElement_.parent(null);
};


//endregion
//region --- IObjectWithSettings impl
//----------------------------------------------------------------------------------------------------------------------
//
//  --- IObjectWithSettings impl
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Returns option value if it was set directly to the object.
 * @param {string} name
 * @return {*}
 */
anychart.core.resource.Grid.prototype.getOwnOption = function(name) {
  return this.settings[name];
};


/**
 * Returns true if the option value was set directly to the object.
 * @param {string} name
 * @return {boolean}
 */
anychart.core.resource.Grid.prototype.hasOwnOption = function(name) {
  return goog.isDefAndNotNull(this.settings[name]);
};


/**
 * Returns option value from the theme if any.
 * @param {string} name
 * @return {*}
 */
anychart.core.resource.Grid.prototype.getThemeOption = function(name) {
  return this.defaultSettings[name];
};


/**
 * Returns option value by priorities.
 * @param {string} name
 * @return {*}
 */
anychart.core.resource.Grid.prototype.getOption = function(name) {
  return goog.isDefAndNotNull(this.settings[name]) ? this.settings[name] : this.defaultSettings[name];
};


/**
 * Sets option value to the instance.
 * @param {string} name
 * @param {*} value
 */
anychart.core.resource.Grid.prototype.setOption = function(name, value) {
  this.settings[name] = value;
};


/**
 * Performs checks on the instance to determine whether the state should be invalidated after option change.
 * @param {number} flags
 * @return {boolean}
 */
anychart.core.resource.Grid.prototype.check = function(flags) {
  return true;
};


//endregion
//region --- Serialization / Deserialization / Disposing
//------------------------------------------------------------------------------
//
//  Serialization / Deserialization / Disposing
//
//------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.resource.Grid.prototype.serialize = function() {
  var json = anychart.core.resource.Grid.base(this, 'serialize');
  anychart.core.settings.serialize(this, anychart.core.resource.Grid.DESCRIPTORS, json, 'Resource Grid');

  json['background'] = this.background_.serialize();
  json['overlay'] = this.overlay_.serialize();
  return json;
};


/** @inheritDoc */
anychart.core.resource.Grid.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.resource.Grid.base(this, 'setupByJSON', config, opt_default);
  //todo(Anton Saukh): Add opt_default support.
  anychart.core.settings.deserialize(this, anychart.core.resource.Grid.DESCRIPTORS, config);

  if (goog.isDef(this.background_))
    this.background_.setupByVal(config['background']);
  this.overlay_.setupByVal(config['overlay'], opt_default);
};


/** @inheritDoc */
anychart.core.resource.Grid.prototype.disposeInternal = function() {
  goog.dispose(this.background_);
  this.background_ = null;
  goog.dispose(this.rootElement_);
  this.rootElement_ = null;
  this.gridLayer_ = null;
  this.oddPath_ = null;
  this.evenPath_ = null;
  this.oddHolidayPath_ = null;
  this.evenHolidayPath_ = null;
  this.oddHFPath_ = null;
  this.evenHFPath_ = null;
  this.oddHolidayHFPath_ = null;
  this.evenHolidayHFPath_ = null;
  this.hStrokePath_ = null;
  this.vStrokePath_ = null;
  goog.dispose(this.overlay_);
  this.overlay_ = null;
  anychart.core.resource.Grid.base(this, 'disposeInternal');
};


//endregion
//region --- Exports
//------------------------------------------------------------------------------
//
//  Exports
//
//------------------------------------------------------------------------------
//exports
(function() {
  var proto = anychart.core.resource.Grid.prototype;
  proto['background'] = proto.background;
  proto['overlay'] = proto.overlay;
  // descriptors
  // proto['horizontalStroke'] = proto.horizontalStroke;
  // proto['verticalStroke'] = proto.verticalStroke;
  // proto['oddFill'] = proto.oddFill;
  // proto['evenFill'] = proto.evenFill;
  // proto['oddHolidayFill'] = proto.oddHolidayFill;
  // proto['evenHolidayFill'] = proto.evenHolidayFill;
  // proto['oddHatchFill'] = proto.oddHatchFill;
  // proto['evenHatchFill'] = proto.evenHatchFill;
  // proto['oddHolidayHatchFill'] = proto.oddHolidayHatchFill;
  // proto['evenHolidayHatchFill'] = proto.evenHolidayHatchFill;
  // proto['drawTopLine'] = proto.drawTopLine;
  // proto['drawRightLine'] = proto.drawRightLine;
  // proto['drawBottomLine'] = proto.drawBottomLine;
  // proto['drawLeftLine'] = proto.drawLeftLine;
})();


//endregion
