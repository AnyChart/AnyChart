//region --- Requiring and Providing
goog.provide('anychart.core.ui.Background');
goog.provide('anychart.standalones.Background');
goog.require('acgraph');
goog.require('anychart.core.IStandaloneBackend');
goog.require('anychart.core.VisualBaseWithBounds');
goog.require('anychart.core.settings');
goog.require('anychart.enums');
goog.require('anychart.math.Rect');
goog.require('goog.array');
//endregion



/**
 * Background element class.<br/>
 * Background can be a part of another complex element (chart, legend, title and so on),
 * or used separately.<br/>
 * Background has a fill, a border and corner shape settings.<br/>
 * <b>Note:</b> Always specify display bounds if you use Background separately.
 * @extends {anychart.core.VisualBaseWithBounds}
 * @implements {anychart.core.IStandaloneBackend}
 * @constructor
 * @implements {anychart.core.settings.IResolvable}
 */
anychart.core.ui.Background = function() {
  anychart.core.ui.Background.base(this, 'constructor');

  this.addDefaultThemes(anychart.themes.DefaultThemes['background']);

  /**
   * Serialize only own properties
   * @type {boolean}
   **/
  this.serializeOnlyOwn = true; //todo: Should think about it after themes refactoring. Hack for gantt serialize

  /**
   * Parent.
   * @type {anychart.core.ui.Background}
   * @private
   */
  this.parent_ = null;

  /**
   * Resolution chain cache.
   * @type {?Array.<Object|null|undefined>}
   * @private
   */
  this.resolutionChainCache_ = null;

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['fill', anychart.ConsistencyState.APPEARANCE],
    ['stroke', anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.BOUNDS],
    ['topStroke', anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.BOUNDS],
    ['rightStroke', anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.BOUNDS],
    ['bottomStroke', anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.BOUNDS],
    ['leftStroke', anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.BOUNDS],
    ['disablePointerEvents', anychart.ConsistencyState.BACKGROUND_POINTER_EVENTS],
    ['cornerType', anychart.ConsistencyState.BOUNDS]
  ]);
};
goog.inherits(anychart.core.ui.Background, anychart.core.VisualBaseWithBounds);


//region -- Consistency states and Signals
/**
 * Supported signals.
 * @type {number}
 */
anychart.core.ui.Background.prototype.SUPPORTED_SIGNALS =
    anychart.core.VisualBaseWithBounds.prototype.SUPPORTED_SIGNALS |
    anychart.Signal.ENABLED_STATE_CHANGED;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.ui.Background.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.VisualBaseWithBounds.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.APPEARANCE |
    anychart.ConsistencyState.BACKGROUND_POINTER_EVENTS;


//endregion
//region -- Optimized props descriptors
/**
 * Simple BG descriptors.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.core.ui.Background.prototype.SIMPLE_PROPS_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  anychart.core.settings.createDescriptors(map, [
    [anychart.enums.PropertyHandlerType.MULTI_ARG, 'fill', anychart.core.settings.fillNormalizer],
    [anychart.enums.PropertyHandlerType.MULTI_ARG, 'stroke', anychart.core.settings.strokeNormalizer],
    [anychart.enums.PropertyHandlerType.MULTI_ARG, 'topStroke', anychart.core.settings.strokeNormalizer],
    [anychart.enums.PropertyHandlerType.MULTI_ARG, 'rightStroke', anychart.core.settings.strokeNormalizer],
    [anychart.enums.PropertyHandlerType.MULTI_ARG, 'bottomStroke', anychart.core.settings.strokeNormalizer],
    [anychart.enums.PropertyHandlerType.MULTI_ARG, 'leftStroke', anychart.core.settings.strokeNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'disablePointerEvents', anychart.core.settings.booleanNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'cornerType', anychart.enums.normalizeBackgroundCornerType]
  ]);

  return map;
})();
anychart.core.settings.populate(anychart.core.ui.Background, anychart.core.ui.Background.prototype.SIMPLE_PROPS_DESCRIPTORS);


//endregion
//region -- IObjectWithSettings implementation
/**
 * @override
 * @param {string} name
 * @return {*}
 */
anychart.core.ui.Background.prototype.getOption = anychart.core.settings.getOption;


/** @inheritDoc */
anychart.core.ui.Background.prototype.getSignal = function(fieldName) {
  // all props invalidates with NEEDS_REDRAW
  return anychart.Signal.NEEDS_REDRAW;
};


//endregion
//region -- IResolvable implementation
/** @inheritDoc */
anychart.core.ui.Background.prototype.resolutionChainCache = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.resolutionChainCache_ = opt_value;
  }
  return this.resolutionChainCache_;
};


/** @inheritDoc */
anychart.core.ui.Background.prototype.getResolutionChain = anychart.core.settings.getResolutionChain;


/** @inheritDoc */
anychart.core.ui.Background.prototype.getLowPriorityResolutionChain = function() {
  var sett = [this.themeSettings];
  if (this.parent_) {
    sett = goog.array.concat(sett, this.parent_.getLowPriorityResolutionChain());
  }
  return sett;
};


/** @inheritDoc */
anychart.core.ui.Background.prototype.getHighPriorityResolutionChain = function() {
  var sett = [this.ownSettings];
  if (this.parent_) {
    sett = goog.array.concat(sett, this.parent_.getHighPriorityResolutionChain());
  }
  return sett;
};


//endregion
//region -- Other methods
/**
 * Corners formatter.
 * @param {...(number|string|Array.<number|string>)} var_args .
 * @return {Array.<number|string>}
 * @private
 */
anychart.core.ui.Background.prototype.cornersFormatter_ = function(var_args) {
  var val;
  var arg0 = arguments[0];
  if (goog.isArray(arg0)) {
    val = arg0;
  } else if (goog.isObject(arg0)) {
    val = [
      arg0['leftTop'] || 0,
      arg0['rightTop'] || 0,
      arg0['rightBottom'] || 0,
      arg0['leftBottom'] || 0
    ];
  } else {
    val = goog.array.slice(arguments, 0);
  }
  return val;
};


/**
 * Getter/setter for corners.
 * @param {(number|string|Array.<number|string>)=} opt_value .
 * @return {(Array.<number|string>|!anychart.core.ui.Background)} .
 */
anychart.core.ui.Background.prototype.corners = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var val = this.cornersFormatter_.apply(this, arguments);
    if (!goog.array.equals(val, this.ownSettings['corners'])) {
      this.ownSettings['corners'] = val;
      this.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.cornersFormatter_(/** @type {Array.<number|string>} */(this.getOption('corners')));
  }
};


/**
 * Returns corner size by index.
 * @param {number} value Corner index.
 * @param {number} width - Width of element corner calculate for.
 * @param {number} height - Height of element corner calculate for.
 * @return {number} - Radius size.
 * @private
 */
anychart.core.ui.Background.prototype.getCornerSize_ = function(value, width, height) {
  var corners = this.corners();
  var corner = corners.length < 4 ? corners[0] : corners[value];
  var minSide = Math.min(height, width);

  return anychart.utils.normalizeSize(corner, minSide) || 0;
};


//endregion
//region -- Parental relations
/**
 * Gets/sets new parent.
 * @param {anychart.core.ui.Background=} opt_value - Value to set.
 * @return {anychart.core.ui.Background} - Current value or itself for method chaining.
 */
anychart.core.ui.Background.prototype.parent = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.parent_ != opt_value) {
      if (goog.isNull(opt_value)) {
        //this.parent_ is not null here.
        this.parent_.unlistenSignals(this.parentInvalidated_, this);
        this.parent_ = null;
      } else {
        if (this.parent_)
          this.parent_.unlistenSignals(this.parentInvalidated_, this);
        this.parent_ = opt_value;
        this.parent_.listenSignals(this.parentInvalidated_, this);
      }
    }
    return this;
  }
  return this.parent_;
};


/**
 * Parent invalidation handler.
 * @param {anychart.SignalEvent} e - Signal event.
 * @private
 */
anychart.core.ui.Background.prototype.parentInvalidated_ = function(e) {
  var state = 0;
  var signal = 0;

  if (e.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    state |= anychart.ConsistencyState.APPEARANCE;
    signal |= anychart.Signal.NEEDS_REDRAW;
  }

  if (e.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    state |= anychart.ConsistencyState.BOUNDS;
    signal |= anychart.Signal.BOUNDS_CHANGED;
  }

  if (e.hasSignal(anychart.Signal.ENABLED_STATE_CHANGED)) {
    state |= anychart.ConsistencyState.ENABLED;
    signal |= anychart.Signal.NEEDS_REDRAW;
  }

  this.resolutionChainCache_ = null;

  this.invalidate(state, signal);
};


//endregion
//region -- Drawing, removing
/**
 * @param {acgraph.vector.Path} path .
 * @param {number} x1 .
 * @param {number} y1 .
 * @param {number} x2 .
 * @param {number} y2 .
 * @param {number} radius .
 */
anychart.core.ui.Background.prototype.drawCorner = function(path, x1, y1, x2, y2, radius) {
  switch (this.getOption('cornerType')) {
    case acgraph.vector.Rect.CornerType.ROUND:
      path.arcToByEndPoint(x2, y2, radius, radius, false, true);
      break;
    case acgraph.vector.Rect.CornerType.ROUND_INNER:
      path.arcToByEndPoint(x2, y2, radius, radius, false, false);
      break;
    case acgraph.vector.Rect.CornerType.CUT:
      path.lineTo(x2, y2);
      break;
    default:
      path.lineTo(x1, y1).lineTo(x2, y2);
  }
};


/**
 * Getter for bounds to draw background.
 * @return {!anychart.math.Rect}
 */
anychart.core.ui.Background.prototype.getBoundsForDrawing = function() {
  return this.getPixelBounds();
};


/**
 * Render background.
 * @return {!anychart.core.ui.Background} {@link anychart.core.ui.Background} instance for method chaining.
 */
anychart.core.ui.Background.prototype.draw = function() {
  if (!this.checkDrawingNeeded())
    return this;

  var fill = /** @type {acgraph.vector.Fill} */(this.getOption('fill') || 'none');
  var stroke = /** @type {acgraph.vector.Stroke} */(this.getOption('stroke'));
  var topStroke = /** @type {acgraph.vector.Stroke} */(this.getOption('topStroke'));
  var rightStroke = /** @type {acgraph.vector.Stroke} */(this.getOption('rightStroke'));
  var bottomStroke = /** @type {acgraph.vector.Stroke} */(this.getOption('bottomStroke'));
  var leftStroke = /** @type {acgraph.vector.Stroke} */(this.getOption('leftStroke'));

  var hasTopStroke = goog.isDef(topStroke) && !anychart.utils.isNone(topStroke);
  var hasRightStroke = goog.isDef(rightStroke) && !anychart.utils.isNone(rightStroke);
  var hasBottomStroke = goog.isDef(bottomStroke) && !anychart.utils.isNone(bottomStroke);
  var hasLeftStroke = goog.isDef(leftStroke) && !anychart.utils.isNone(leftStroke);
  var isSingleStroke = !(hasTopStroke || hasRightStroke || hasBottomStroke || hasLeftStroke);
  var isAtLeastOneCustomStroke = !isSingleStroke;
  var allStrokeIsCustom = hasTopStroke && hasRightStroke && hasBottomStroke && hasLeftStroke;
  var i, len, strokePath;

  var stage = this.container() ? this.container().getStage() : null;
  var manualSuspend = stage && !stage.isSuspended();
  if (manualSuspend) stage.suspend();

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    if (!this.rootElement) {
      this.rootElement = acgraph.layer();
    }

    if (allStrokeIsCustom && this.strokePath_) {
      this.strokePath_.clear().parent(null);
    } else {
      if (!this.strokePath_) {
        this.strokePath_ = acgraph.path();
      }
      this.strokePath_.parent(this.rootElement);
      this.strokePath_.clear();
    }

    if (isAtLeastOneCustomStroke) {
      if (!this.fillPath_) {
        this.fillPath_ = acgraph.path();
      }
      this.fillPath_.parent(this.rootElement);
      this.fillPath_.clear();
    } else if (this.fillPath_) {
      this.fillPath_.clear().parent(null);
    }

    if (this.strokePathsPoll_) {
      for (i = 0, len = this.strokePathsPoll_.length; i < len; i++) {
        strokePath = this.strokePathsPoll_[i];
        if (strokePath)
          strokePath.clear().parent(null);
      }
    }

    if (isAtLeastOneCustomStroke) {
      this.strokes_ = [topStroke, rightStroke, bottomStroke, leftStroke];
      if (!this.strokePathsPoll_) this.strokePathsPoll_ = [];
      if (!this.strokePaths_) this.strokePaths_ = [];

      for (i = 0, len = this.strokes_.length; i < len; i++) {
        var stroke_ = this.strokes_[i];
        if (goog.isDef(stroke_) && !anychart.utils.isNone(stroke_)) {
          var path = this.strokePathsPoll_[i] ? this.strokePathsPoll_[i] : this.strokePathsPoll_[i] = acgraph.path();
          path.parent(this.rootElement);
          path.clear();
          this.strokePaths_[i] = path;
        } else if (goog.isDef(stroke) && !anychart.utils.isNone(stroke)) {
          this.strokes_[i] = stroke;
          this.strokePaths_[i] = this.strokePath_;
        }
      }
    }

    var bounds = this.getBoundsForDrawing();
    var width = bounds.width;
    var height = bounds.height;

    var leftTopCorner = this.getCornerSize_(0, width, height);
    var rightTopCorner = this.getCornerSize_(1, width, height);
    var rightBottomCorner = this.getCornerSize_(2, width, height);
    var leftBottomCorner = this.getCornerSize_(3, width, height);
    var points;

    var currentPath, sideIndex;

    if (isAtLeastOneCustomStroke) {
      var topThickness = this.strokePaths_[0] ? acgraph.vector.getThickness(/** @type {acgraph.vector.Stroke} */(acgraph.vector.normalizeStroke(this.strokes_[0]))) / 2 : 0;
      var rightThickness = this.strokePaths_[1] ? acgraph.vector.getThickness(/** @type {acgraph.vector.Stroke} */(acgraph.vector.normalizeStroke(this.strokes_[1]))) / 2 : 0;
      var bottomThickness = this.strokePaths_[2] ? acgraph.vector.getThickness(/** @type {acgraph.vector.Stroke} */(acgraph.vector.normalizeStroke(this.strokes_[2]))) / 2 : 0;
      var leftThickness = this.strokePaths_[3] ? acgraph.vector.getThickness(/** @type {acgraph.vector.Stroke} */(acgraph.vector.normalizeStroke(this.strokes_[3]))) / 2 : 0;

      bounds.left += leftThickness;
      bounds.top += topThickness;
      bounds.width -= leftThickness + rightThickness;
      bounds.height -= topThickness + bottomThickness;

      var x0 = (bounds.getRight() - rightTopCorner) + rightTopCorner * Math.cos(goog.math.toRadians(315));
      var y0 = (bounds.top + rightTopCorner) + rightTopCorner * Math.sin(goog.math.toRadians(315));

      var x1 = (bounds.getRight() - rightBottomCorner) + rightBottomCorner * Math.cos(goog.math.toRadians(45));
      var y1 = (bounds.getBottom() - rightBottomCorner) + rightBottomCorner * Math.sin(goog.math.toRadians(45));

      var x2 = (bounds.left + leftBottomCorner) + leftBottomCorner * Math.cos(goog.math.toRadians(135));
      var y2 = (bounds.getBottom() - leftBottomCorner) + leftBottomCorner * Math.sin(goog.math.toRadians(135));

      var x3 = (bounds.left + leftTopCorner) + leftTopCorner * Math.cos(goog.math.toRadians(225));
      var y3 = (bounds.top + leftTopCorner) + leftTopCorner * Math.sin(goog.math.toRadians(225));

      points = [
        bounds.getRight() - rightTopCorner, bounds.top,
        bounds.getRight(), bounds.top,
        bounds.getRight(), bounds.top + rightTopCorner,
        x0, y0,

        bounds.getRight(), bounds.getBottom() - rightBottomCorner,
        bounds.getRight(), bounds.getBottom(),
        bounds.getRight() - rightBottomCorner, bounds.getBottom(),
        x1, y1,

        bounds.left + leftBottomCorner, bounds.getBottom(),
        bounds.left, bounds.getBottom(),
        bounds.left, bounds.getBottom() - leftBottomCorner,
        x2, y2,

        bounds.left, bounds.top + leftTopCorner,
        bounds.left, bounds.top,
        bounds.left + leftTopCorner, bounds.top,
        x3, y3
      ];

      var prevPath;
      for (i = 0, len = points.length; i < len; i = i + 8) {
        sideIndex = i / 8;

        var cornerSize = this.getCornerSize_(sideIndex, width, height);

        if (!i) {
          this.fillPath_.moveTo(points[points.length - 4], points[points.length - 3]);
        }
        this.fillPath_.lineTo(points[i], points[i + 1]);
        this.drawCorner(
            this.fillPath_,
            points[i + 2], points[i + 3],
            points[i + 4], points[i + 5],
            cornerSize);

        currentPath = this.strokePaths_[sideIndex];
        if (!currentPath)
          continue;

        if (!i) {
          currentPath.moveTo(points[points.length - 2], points[points.length - 1]);
          this.drawCorner(
              currentPath,
              points[points.length - 6], points[points.length - 5],
              points[points.length - 4], points[points.length - 3],
              cornerSize);
        } else if (prevPath != currentPath) {
          currentPath.moveTo(points[i - 2], points[i - 1]);
          this.drawCorner(
              currentPath,
              points[i - 6], points[i - 5],
              points[i - 4], points[i - 3],
              cornerSize);
        } else {
          this.drawCorner(
              currentPath,
              points[i - 6], points[i - 5],
              points[i - 4], points[i - 3],
              cornerSize);
        }

        currentPath.lineTo(points[i], points[i + 1]);
        this.drawCorner(
            currentPath,
            points[i + 2], points[i + 3],
            points[i + 6], points[i + 7],
            cornerSize);

        prevPath = currentPath;
      }
    } else {
      var strokeThickness = acgraph.vector.getThickness(/** @type {acgraph.vector.Stroke} */(acgraph.vector.normalizeStroke(stroke)));
      var thicknessHalf = strokeThickness / 2;
      if (isNaN(thicknessHalf)) thicknessHalf = .5;

      bounds.left += thicknessHalf;
      bounds.top += thicknessHalf;
      bounds.width -= thicknessHalf + thicknessHalf;
      bounds.height -= thicknessHalf + thicknessHalf;

      points = [
        bounds.getRight() - rightTopCorner, bounds.top,
        bounds.getRight(), bounds.top,
        bounds.getRight(), bounds.top + rightTopCorner,

        bounds.getRight(), bounds.getBottom() - rightBottomCorner,
        bounds.getRight(), bounds.getBottom(),
        bounds.getRight() - rightBottomCorner, bounds.getBottom(),

        bounds.left + leftBottomCorner, bounds.getBottom(),
        bounds.left, bounds.getBottom(),
        bounds.left, bounds.getBottom() - leftBottomCorner,

        bounds.left, bounds.top + leftTopCorner,
        bounds.left, bounds.top,
        bounds.left + leftTopCorner, bounds.top
      ];

      for (i = 0, len = points.length; i < len; i = i + 6) {
        if (!i) {
          this.strokePath_.moveTo(points[points.length - 2], points[points.length - 1]);
        }
        this.strokePath_.lineTo(points[i], points[i + 1]);
        this.drawCorner(
            this.strokePath_,
            points[i + 2], points[i + 3],
            points[i + 4], points[i + 5],
            this.getCornerSize_((i / 6 + 1) % 4, width, height));
      }
      this.strokePath_.close();
    }

    this.markConsistent(anychart.ConsistencyState.BOUNDS);

    if (goog.isObject(fill) && ('keys' in fill || 'src' in fill))
      this.invalidate(anychart.ConsistencyState.APPEARANCE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    if (isAtLeastOneCustomStroke) {
      for (i = 0, len = this.strokePaths_.length; i < len; i++) {
        strokePath = this.strokePaths_[i];
        if (strokePath)
          strokePath.stroke(this.strokes_[i]);
      }
      this.fillPath_.fill(fill);
      this.fillPath_.stroke(null);
    } else {
      this.strokePath_.stroke(stroke);
      this.strokePath_.fill(fill);
    }
    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.BACKGROUND_POINTER_EVENTS)) {
    var pointerEventsSettings = /** @type {boolean|undefined} */ (this.getOption('disablePointerEvents'));
    if (isAtLeastOneCustomStroke) {
      for (i = 0, len = this.strokePaths_.length; i < len; i++) {
        strokePath = this.strokePaths_[i];
        if (strokePath)
          strokePath.disablePointerEvents(pointerEventsSettings);
      }
      this.fillPath_.disablePointerEvents(pointerEventsSettings);
    } else {
      this.strokePath_.disablePointerEvents(pointerEventsSettings);
    }
    this.rootElement.disablePointerEvents(pointerEventsSettings);
    this.markConsistent(anychart.ConsistencyState.BACKGROUND_POINTER_EVENTS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    this.rootElement.zIndex(/** @type {number} */(this.getOption('zIndex')));
    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    this.rootElement.parent(/** @type {acgraph.vector.ILayer} */(this.container()));
    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }

  if (manualSuspend) stage.resume();

  return this;
};


/** @inheritDoc */
anychart.core.ui.Background.prototype.remove = function() {
  if (this.rootElement)
    this.rootElement.parent(null);
};


//endregion
//region -- Other functions
/**
 * Returns the remaining (after background placement) part of the container.
 * @return {!anychart.math.Rect} Parent bounds without the space used by the background thickness.
 */
anychart.core.ui.Background.prototype.getRemainingBounds = function() {
  var parentBounds = /** @type {anychart.math.Rect} */(this.getPixelBounds());
  if (parentBounds)
    parentBounds = parentBounds.clone();
  else
    parentBounds = anychart.math.rect(0, 0, 0, 0);

  if (!this.enabled())
    return parentBounds;

  var stroke = /** @type {acgraph.vector.Stroke} */ (this.getOption('stroke'));
  var thickness = anychart.utils.isNone(stroke) ? 0 : acgraph.vector.getThickness(stroke);

  parentBounds.top += thickness;
  parentBounds.left += thickness;
  parentBounds.height -= 2 * thickness;
  parentBounds.width -= 2 * thickness;

  return parentBounds;
};


//endregion
//region -- Serialize, deserialize, dispose


/** @inheritDoc */
anychart.core.ui.Background.prototype.serialize = function() {
  var json = anychart.core.ui.Background.base(this, 'serialize');

  anychart.core.settings.serialize(this, this.SIMPLE_PROPS_DESCRIPTORS, json, 'Background', void 0, this.serializeOnlyOwn);

  var corners = /** @type {Array} */(this.getOwnOption('corners'));
  if (corners) {
    if (corners.length >= 4) {
      corners = {
        'leftTop': corners[0],
        'rightTop': corners[1],
        'rightBottom': corners[2],
        'leftBottom': corners[3]
      };
    } else {
      corners = corners[0];
    }
    json['corners'] = corners;
  }
  return json;
};


/** @inheritDoc */
anychart.core.ui.Background.prototype.resolveSpecialValue = function(var_args) {
  var result = null;
  var arg0 = arguments[0];
  if (goog.isString(arg0)) {
    result = {
      'fill': arg0,
      'stroke': null,
      'enabled': true
    };
  } else if (goog.isBoolean(arg0) || goog.isNull(arg0)) {
    result = {'enabled': !!arg0};
  }
  return result;
};


/** @inheritDoc */
anychart.core.ui.Background.prototype.setupSpecial = function(isDefault, var_args) {
  var resolvedValue = this.resolveSpecialValue(arguments[1]);
  if (resolvedValue) {
    if (isDefault) {
      if ('fill' in resolvedValue)
        this.themeSettings['fill'] = resolvedValue['fill'];

      if ('stroke' in resolvedValue)
        this.themeSettings['stroke'] = resolvedValue['stroke'];

      if ('enabled' in resolvedValue)
        this.themeSettings['enabled'] = resolvedValue['enabled'];

    } else {
      if ('fill' in resolvedValue)
        this['fill'](resolvedValue['fill']);

      if ('stroke' in resolvedValue)
        this['stroke'](resolvedValue['stroke']);

      if ('enabled' in resolvedValue)
        this.enabled(resolvedValue['enabled']);
    }
    return true;
  }
  return false;
};


/** @inheritDoc */
anychart.core.ui.Background.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.ui.Background.base(this, 'setupByJSON', config, opt_default);

  anychart.core.settings.deserialize(this, this.SIMPLE_PROPS_DESCRIPTORS, config, opt_default);

  if (opt_default) {
    if ('corners' in config)
      this.themeSettings['corners'] = this.cornersFormatter_(config['corners']);
  } else
    this.corners(config['corners']);
};


/** @inheritDoc */
anychart.core.ui.Background.prototype.disposeInternal = function() {
  goog.disposeAll(
      this.strokePath_,
      this.strokePaths_,
      this.fillPath_
  );

  this.strokePath_ = null;
  this.strokePaths_ = null;
  this.fillPath_ = null;

  anychart.core.ui.Background.base(this, 'disposeInternal');
};



/**
 * @constructor
 * @extends {anychart.core.ui.Background}
 */
anychart.standalones.Background = function() {
  anychart.standalones.Background.base(this, 'constructor');
};
goog.inherits(anychart.standalones.Background, anychart.core.ui.Background);
anychart.core.makeStandalone(anychart.standalones.Background, anychart.core.ui.Background);


/**
 * Constructor function.
 * @return {!anychart.standalones.Background}
 */
anychart.standalones.background = function() {
  var background = new anychart.standalones.Background();
  background.setupInternal(true, anychart.getFullTheme('standalones.background'));
  return background;
};


//endregion
//exports
(function() {
  var proto = anychart.core.ui.Background.prototype;
  // proto['fill'] = proto.fill;//in docs/final
  // proto['stroke'] = proto.stroke;//in docs/final
  // proto['topStroke'] = proto.topStroke;
  // proto['rightStroke'] = proto.rightStroke;
  // proto['bottomStroke'] = proto.bottomStroke;
  // proto['leftStroke'] = proto.leftStroke;
  // proto['cornerType'] = proto.cornerType;//in docs/final
  proto['corners'] = proto.corners;//in docs/final

  proto = anychart.standalones.Background.prototype;
  goog.exportSymbol('anychart.standalones.background', anychart.standalones.background);
  proto['draw'] = proto.draw;
  proto['parentBounds'] = proto.parentBounds;
  proto['container'] = proto.container;
})();
