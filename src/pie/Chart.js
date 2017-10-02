goog.provide('anychart.pieModule.Chart');

goog.require('anychart.animations.AnimationSerialQueue');
goog.require('anychart.color');
goog.require('anychart.core.IShapeManagerUser');
goog.require('anychart.core.SeparateChart');
goog.require('anychart.core.StateSettings');
goog.require('anychart.core.reporting');
goog.require('anychart.core.settings');
goog.require('anychart.core.ui.CircularLabelsFactory');
goog.require('anychart.core.ui.Tooltip');
goog.require('anychart.core.utils.IInteractiveSeries');
goog.require('anychart.core.utils.PieInteractivityState');
goog.require('anychart.core.utils.TypedLayer');
goog.require('anychart.data.Set');
goog.require('anychart.enums');
goog.require('anychart.format.Context');
goog.require('anychart.math');
goog.require('anychart.palettes');
goog.require('anychart.pieModule.Animation');
goog.require('anychart.pieModule.DataView');
goog.require('anychart.pieModule.LabelAnimation');
goog.require('anychart.pieModule.Point');
goog.require('goog.labs.userAgent.device');



/**
 * Pie (Donut) Chart Class.<br/>
 * <b>Note:</b> Use method {@link anychart.pie} to get an instance of this class:
 * @param {(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Data for the chart.
 * @param {(anychart.enums.TextParsingMode|anychart.data.TextParsingSettings)=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings here as a hash map.
 * @extends {anychart.core.SeparateChart}
 * @implements {anychart.core.utils.IInteractiveSeries}
 * @implements {anychart.core.IShapeManagerUser}
 * @constructor
 */
anychart.pieModule.Chart = function(opt_data, opt_csvSettings) {
  anychart.pieModule.Chart.base(this, 'constructor');
  this.suspendSignalsDispatching();

  /**
   * Pie point provider.
   * @type {anychart.format.Context}
   * @private
   */
  this.pointProvider_;

  /**
   * Filter function that should accept a field value and return true if the row
   *    should be included into the resulting view as and false otherwise.
   * @type {?function(*):boolean}
   * @private
   */
  this.groupedPointFilter_ = null;

  /**
   * Pie chart default palette.
   * @type {anychart.palettes.DistinctColors|anychart.palettes.RangeColors}
   * @private
   */
  this.palette_ = null;

  /**
   * @type {anychart.palettes.HatchFills}
   * @private
   */
  this.hatchFillPalette_ = null;

  /**
   * Original view for the chart data.
   * @type {anychart.data.View}
   * @private
   */
  this.parentView_ = null;

  /**
   * View that should be disposed on data reset.
   * @type {(anychart.data.View|anychart.data.Set)}
   * @private
   */
  this.parentViewToDispose_ = null;

  /**
   * Template for aqua style fill.
   * @private
   * @type {Object}
   */
  this.aquaStyleObj_ = {};

  /**
   * Aqua style fill function.
   * this {{index:number, sourceColor: acgraph.vector.Fill, aquaStyleObj: acgraph.vector.Fill}}
   * return {acgraph.vector.Fill} Fill for a pie slice.
   * @type {acgraph.vector.Fill|Function}
   * @private
   */
  this.aquaStyleFill_ = (function() {
    var color = this['sourceColor'];
    var aquaStyleObj = this['aquaStyleObj'];
    return /** @type {acgraph.vector.Fill} */({
      'keys': [
        {'offset': 0, 'color': anychart.color.lighten(color, .5)},
        {'offset': .95, 'color': anychart.color.darken(color, .4)},
        {'offset': 1, 'color': anychart.color.darken(color, .4)}
      ],
      'cx': .5,
      'cy': .5,
      'fx': aquaStyleObj['fx'],
      'fy': aquaStyleObj['fy'],
      'mode': aquaStyleObj['mode']
    });
  });

  /**
   * @type {!anychart.data.Iterator}
   */
  this.iterator_;

  /**
   * All (top, front, back, start, end) sides of the 3d pie.
   * @type {Array.<anychart.pieModule.Chart.Side3D>}
   * @private
   */
  this.sides3D_ = [];

  /**
   * Interactivity state.
   * @type {anychart.core.utils.InteractivityState}
   */
  this.state = new anychart.core.utils.PieInteractivityState(this);

  this.data(opt_data || null, opt_csvSettings);

  this.invalidate(anychart.ConsistencyState.ALL);

  /**
   * @this {anychart.pieModule.Chart}
   */
  function sortBeforeInvalidation() {
    this.redefineView_();
  }
  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['overlapMode', anychart.ConsistencyState.PIE_LABELS, anychart.Signal.NEEDS_REDRAW],
    ['radius', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW],
    ['innerRadius', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW],
    ['startAngle', anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.PIE_LABELS,
      anychart.Signal.NEEDS_REDRAW],
    ['explode',
      anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.BOUNDS | anychart.ConsistencyState.PIE_LABELS,
      anychart.Signal.NEEDS_REDRAW],
    ['sort', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW, 0, sortBeforeInvalidation],
    ['outsideLabelsSpace',
      anychart.ConsistencyState.BOUNDS | anychart.ConsistencyState.PIE_LABELS,
      anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['insideLabelsOffset',
      anychart.ConsistencyState.BOUNDS | anychart.ConsistencyState.PIE_LABELS,
      anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['connectorLength',
      anychart.ConsistencyState.BOUNDS | anychart.ConsistencyState.PIE_LABELS,
      anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['outsideLabelsCriticalAngle', anychart.ConsistencyState.PIE_LABELS, anychart.Signal.NEEDS_REDRAW],
    ['forceHoverLabels', anychart.ConsistencyState.PIE_LABELS, anychart.Signal.NEEDS_REDRAW],
    ['connectorStroke', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW],
    ['mode3d', anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.PIE_LABELS, anychart.Signal.NEEDS_REDRAW]
  ]);

  var normalDescriptorsMeta = {};
  anychart.core.settings.createDescriptorsMeta(normalDescriptorsMeta, [
    ['fill',
      anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.CHART_LEGEND,
      anychart.Signal.NEEDS_REDRAW],
    ['stroke',
      anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.CHART_LEGEND,
      anychart.Signal.NEEDS_REDRAW],
    ['hatchFill',
      anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.CHART_LEGEND,
      anychart.Signal.NEEDS_REDRAW],
    ['labels', 0, 0]
  ]);
  function pieFillNormalizer(args) {
    var isAqua = false;
    if (goog.isString(args[0])) {
      args[0] = args[0].toLowerCase();
      isAqua = args[0] == 'aquastyle';
    }
    if (this.getOption('mode3d') && isAqua) {
      return this.getOption('fill');
    }
    return goog.isFunction(args[0]) || isAqua ?
        args[0] :
        acgraph.vector.normalizeFill.apply(null, args);
  }
  var descriptorsOverride = [
    [anychart.enums.PropertyHandlerType.MULTI_ARG, 'fill', pieFillNormalizer]
  ];
  this.normal_ = new anychart.core.StateSettings(this, normalDescriptorsMeta, anychart.PointState.NORMAL, descriptorsOverride);
  this.normal_.setOption(anychart.core.StateSettings.LABELS_FACTORY_CONSTRUCTOR, anychart.core.StateSettings.CIRCULAR_LABELS_CONSTRUCTOR);
  this.normal_.setOption(anychart.core.StateSettings.LABELS_AFTER_INIT_CALLBACK, /** @this {anychart.pieModule.Chart} */ function(factory) {
    factory.listenSignals(this.labelsInvalidated_, this);
    factory.setParentEventTarget(this);
    this.invalidate(anychart.ConsistencyState.PIE_LABELS, anychart.Signal.NEEDS_REDRAW);
  });

  var hoveredDescriptorsMeta = {};
  anychart.core.settings.createDescriptorsMeta(hoveredDescriptorsMeta, [
    ['fill', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW],
    ['stroke', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW],
    ['hatchFill', 0, 0],
    ['labels', 0, 0]
  ]);
  this.hovered_ = new anychart.core.StateSettings(this, hoveredDescriptorsMeta, anychart.PointState.HOVER);
  this.hovered_.setOption(anychart.core.StateSettings.LABELS_FACTORY_CONSTRUCTOR, anychart.core.StateSettings.CIRCULAR_LABELS_CONSTRUCTOR);

  this.resumeSignalsDispatching(false);
};
goog.inherits(anychart.pieModule.Chart, anychart.core.SeparateChart);
anychart.core.settings.populateAliases(anychart.pieModule.Chart, ['fill', 'stroke', 'hatchFill'], 'normal');


/**
 * Normal state settings.
 * @param {!Object=} opt_value
 * @return {anychart.core.StateSettings|anychart.pieModule.Chart}
 */
anychart.pieModule.Chart.prototype.normal = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.normal_.setup(opt_value);
    return this;
  }
  return this.normal_;
};


/**
 * Hovered state settings.
 * @param {!Object=} opt_value
 * @return {anychart.core.StateSettings|anychart.pieModule.Chart}
 */
anychart.pieModule.Chart.prototype.hovered = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.hovered_.setup(opt_value);
    return this;
  }
  return this.hovered_;
};


/**
 * Link to incoming raw data.
 * Used to avoid data reapplication on same data sets.
 * NOTE: If is disposable entity, should be disposed from the source, not from this class.
 * @type {?(anychart.data.View|anychart.data.Set|Array|string)}
 * @private
 */
anychart.pieModule.Chart.prototype.rawData_;


/** @inheritDoc */
anychart.pieModule.Chart.prototype.getType = function() {
  return /** @type {boolean} */ (this.getOption('mode3d')) ? anychart.enums.ChartTypes.PIE_3D : anychart.enums.ChartTypes.PIE;
};


/**
 * @typedef {{
 *   index: number,
 *   type: anychart.pieModule.Chart.Side3DType,
 *   angle: number,
 *   ex: number,
 *   ey: number
 * }|{
 *   index: number,
 *   type: anychart.pieModule.Chart.Side3DType,
 *   start: number,
 *   sweep: number,
 *   ex: number,
 *   ey: number
 * }}
 */
anychart.pieModule.Chart.Side3D;


/**
 * The height of the ellipse relative to its width.
 * @type {number}
 */
anychart.pieModule.Chart.ASPECT_3D = .45;


/**
 * The thickness of the pie (For 3D).
 * @type {number}
 */
anychart.pieModule.Chart.PIE_THICKNESS = .2;


/**
 * Connectors z-index. 3D pie slices upper then this connectors.
 * @type {number}
 */
anychart.pieModule.Chart.ZINDEX_CONNECTOR_LOWER_LAYER = 29;


/**
 * Series element z-index in series root layer.
 * @type {number}
 */
anychart.pieModule.Chart.ZINDEX_PIE = 30;


/**
 * Hatch fill z-index in series root layer.
 * @type {number}
 */
anychart.pieModule.Chart.ZINDEX_HATCH_FILL = 31;


/**
 * Label z-index in series root layer.
 * @type {number}
 */
anychart.pieModule.Chart.ZINDEX_LABEL = 32;


/**
 * Default start angle.
 * @type {number}
 */
anychart.pieModule.Chart.DEFAULT_START_ANGLE = -90;


/**
 * @type {number}
 * @private
 */
anychart.pieModule.Chart.OUTSIDE_LABELS_MAX_WIDTH_ = 150;


/**
 * @type {number}
 * @private
 */
anychart.pieModule.Chart.OUTSIDE_LABELS_CONNECTOR_SIZE_ = 5;


/**
 * Ratio of pie animation duration.
 * Full pie animation consists of 2 serial animations (pie slices animation and labels animation).
 * So this ratio shows pie slices animation duration.
 * Left ratio goes to labels animation.
 *
 * In default case of 1000ms duration:
 *   slices animation duration will be 550ms.
 *   labels animation - 450ms.
 * @type {number}
 */
anychart.pieModule.Chart.PIE_ANIMATION_DURATION_RATIO = 0.85;


/**
 * 3D sides type.
 * @enum {string}
 */
anychart.pieModule.Chart.Side3DType = {
  TOP: 'top',
  FRONT: 'front',
  BACK: 'back',
  START: 'start',
  END: 'end'
};


/**
 * Supported signals.
 * @type {number}
 */
anychart.pieModule.Chart.prototype.SUPPORTED_SIGNALS =
    anychart.core.SeparateChart.prototype.SUPPORTED_SIGNALS |
    anychart.Signal.DATA_CHANGED;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.pieModule.Chart.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.SeparateChart.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.APPEARANCE |
    anychart.ConsistencyState.PIE_LABELS |
    anychart.ConsistencyState.PIE_DATA;


/**
 * Default hatch fill type.
 * @type {acgraph.vector.HatchFill.HatchFillType|string}
 */
anychart.pieModule.Chart.DEFAULT_HATCH_FILL_TYPE = 'none';


/** @inheritDoc */
anychart.pieModule.Chart.prototype.doAnimation = function() {
  if (!this.getOption('mode3d') && this.animation().enabled() && this.animation().duration() > 0) {
    if (this.animationQueue_ && this.animationQueue_.isPlaying()) {
      this.animationQueue_.update();
    } else if (this.hasInvalidationState(anychart.ConsistencyState.CHART_ANIMATION)) {
      goog.dispose(this.animationQueue_);
      this.animationQueue_ = new anychart.animations.AnimationSerialQueue();
      var duration = /** @type {number} */(this.animation().duration());
      var pieDuration = duration * anychart.pieModule.Chart.PIE_ANIMATION_DURATION_RATIO;
      var pieLabelDuration = duration * (1 - anychart.pieModule.Chart.PIE_ANIMATION_DURATION_RATIO);

      var pieAnimation = new anychart.pieModule.Animation(this, pieDuration);
      var pieLabelAnimation = new anychart.pieModule.LabelAnimation(this, pieLabelDuration);

      this.animationQueue_.add(/** @type {goog.fx.TransitionBase} */ (pieAnimation));
      this.animationQueue_.add(/** @type {goog.fx.TransitionBase} */ (pieLabelAnimation));

      this.animationQueue_.listen(goog.fx.Transition.EventType.BEGIN, function() {
        this.ignoreMouseEvents(true);
        this.dispatchDetachedEvent({
          'type': anychart.enums.EventType.ANIMATION_START,
          'chart': this
        });
      }, false, this);

      this.animationQueue_.listen(goog.fx.Transition.EventType.END, function() {
        this.ignoreMouseEvents(false);
        this.dispatchDetachedEvent({
          'type': anychart.enums.EventType.ANIMATION_END,
          'chart': this
        });
      }, false, this);

      this.animationQueue_.play(false);
    }
  }
};


/**
 * @inheritDoc
 */
anychart.pieModule.Chart.prototype.getAllSeries = function() {
  return [this];
};


/**
 * Tester if the series is discrete based.
 * @return {boolean}
 */
anychart.pieModule.Chart.prototype.isDiscreteBased = function() {
  return true;
};


/**
 * Tester if the series is discrete based.
 * @return {boolean}
 */
anychart.pieModule.Chart.prototype.isSizeBased = function() {
  return false;
};


/**
 * @inheritDoc
 */
anychart.pieModule.Chart.prototype.isSeries = function() {
  return true;
};


/**
 * Getter/setter for data.
 * @param {(anychart.data.View|anychart.data.Set|anychart.data.DataSettings|Array|string)=} opt_value .
 * @param {(anychart.enums.TextParsingMode|anychart.data.TextParsingSettings)=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings here as a hash map.
 * @return {(anychart.data.View|anychart.pieModule.Chart)} .
 */
anychart.pieModule.Chart.prototype.data = function(opt_value, opt_csvSettings) {
  if (goog.isDef(opt_value)) {
    // handle HTML table data
    if (opt_value) {
      var title = opt_value['title'] || opt_value['caption'];
      if (title) this.title(title);
      if (opt_value['rows']) opt_value = opt_value['rows'];
    }

    if (this.rawData_ !== opt_value) {
      this.rawData_ = opt_value;
      if (this.parentView_ != opt_value || goog.isNull(opt_value)) {

        //drop data cache
        goog.dispose(this.parentViewToDispose_);

        /** @type {anychart.data.View} */
        var parentView;
        if (anychart.utils.instanceOf(opt_value, anychart.data.View)) {
          parentView = opt_value;
          this.parentViewToDispose_ = null;
        } else {
          if (anychart.utils.instanceOf(opt_value, anychart.data.Set))
            parentView = (this.parentViewToDispose_ = opt_value).mapAs();
          else
            parentView = (this.parentViewToDispose_ = new anychart.data.Set(
                (goog.isArray(opt_value) || goog.isString(opt_value)) ? opt_value : null, opt_csvSettings)).mapAs();
          this.registerDisposable(this.parentViewToDispose_);
        }
        this.parentView_ = parentView.derive();
      }

      this.redefineView_();

    }
    return this;
  }
  return this.view_;
};


/**
 * Sets new value of this.view_ depending on current grouping and sorting settings.
 * @private
 */
anychart.pieModule.Chart.prototype.redefineView_ = function() {
  goog.dispose(this.view_);
  delete this.iterator_;
  this.view_ = this.prepareData_(this.parentView_);
  this.view_.listenSignals(this.dataInvalidated_, this);
  this.registerDisposable(this.view_);
  this.invalidate(
      anychart.ConsistencyState.APPEARANCE |
      anychart.ConsistencyState.PIE_LABELS |
      anychart.ConsistencyState.CHART_LEGEND |
      anychart.ConsistencyState.A11Y |
      anychart.ConsistencyState.PIE_DATA |
      anychart.ConsistencyState.CHART_LABELS,
      anychart.Signal.NEEDS_REDRAW |
      anychart.Signal.DATA_CHANGED
  );
};


/**
 * Returns current view iterator.
 * @return {!anychart.data.Iterator} Current pie view iterator.
 */
anychart.pieModule.Chart.prototype.getIterator = function() {
  return this.iterator_ || (this.iterator_ = this.view_.getIterator());
};


/**
 * Returns new default iterator for the current mapping.
 * @return {!anychart.data.Iterator} New iterator.
 */
anychart.pieModule.Chart.prototype.getResetIterator = function() {
  return this.iterator_ = this.view_.getIterator();
};


/**
 * Returns detached iterator.
 * @return {!anychart.data.Iterator} Detached iterator.
 */
anychart.pieModule.Chart.prototype.getDetachedIterator = function() {
  return this.view_.getIterator();
};


/**
 * Method that prepares the final view of data.
 * @param {anychart.data.View} data Data.
 * @return {anychart.data.View} Ready to use view.
 * @private
 */
anychart.pieModule.Chart.prototype.prepareData_ = function(data) {
  if (this.groupedPointFilter_ != null) {
    var oldData = data;
    data = new anychart.pieModule.DataView(/** @type {!anychart.data.View} */(data), 'value', this.groupedPointFilter_, undefined, function() {
      return {'value': 0};
    });
    oldData.registerDisposable(data);
    data.transitionMeta(true);
  }

  var sort = /** @type {anychart.enums.Sort} */ (this.getOption('sort'));
  if (sort == 'none') {
    return data;
  } else {
    if (sort == 'asc') {
      data = data.sort('value', function(a, b) {
        return (/** @type {number} */ (a) - /** @type {number} */ (b));
      });
      data.transitionMeta(true);
    } else {
      data = data.sort('value', function(a, b) {
        return (/** @type {number} */ (b) - /** @type {number} */ (a));
      });
      data.transitionMeta(true);
    }
  }
  return data;
};


/**
 * Getter/setter for palette.
 * @param {(anychart.palettes.RangeColors|anychart.palettes.DistinctColors|Object|Array.<string>)=} opt_value .
 * @return {!(anychart.palettes.RangeColors|anychart.palettes.DistinctColors|anychart.pieModule.Chart)} .
 */
anychart.pieModule.Chart.prototype.palette = function(opt_value) {
  if (anychart.utils.instanceOf(opt_value, anychart.palettes.RangeColors)) {
    this.setupPalette_(anychart.palettes.RangeColors, /** @type {anychart.palettes.RangeColors} */(opt_value));
    return this;
  } else if (anychart.utils.instanceOf(opt_value, anychart.palettes.DistinctColors)) {
    this.setupPalette_(anychart.palettes.DistinctColors, /** @type {anychart.palettes.DistinctColors} */(opt_value));
    return this;
  } else if (goog.isObject(opt_value) && opt_value['type'] == 'range') {
    this.setupPalette_(anychart.palettes.RangeColors);
  } else if (goog.isObject(opt_value) || this.palette_ == null)
    this.setupPalette_(anychart.palettes.DistinctColors);

  if (goog.isDef(opt_value)) {
    this.palette_.setup(opt_value);
    return this;
  }

  return /** @type {!(anychart.palettes.RangeColors|anychart.palettes.DistinctColors)} */(this.palette_);
};


/**
 * @param {Function} cls Palette constructor.
 * @param {(anychart.palettes.RangeColors|anychart.palettes.DistinctColors)=} opt_cloneFrom Settings to clone from.
 * @private
 */
anychart.pieModule.Chart.prototype.setupPalette_ = function(cls, opt_cloneFrom) {
  if (anychart.utils.instanceOf(this.palette_, cls)) {
    if (opt_cloneFrom)
      this.palette_.setup(opt_cloneFrom);
  } else {
    // we dispatch only if we replace existing palette.
    var doDispatch = !!this.palette_;
    goog.dispose(this.palette_);
    this.palette_ = new cls();
    if (opt_cloneFrom)
      this.palette_.setup(opt_cloneFrom);
    this.palette_.listenSignals(this.paletteInvalidated_, this);
    this.registerDisposable(this.palette_);
    if (doDispatch)
      this.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.CHART_LEGEND, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Chart hatch fill palette settings.
 * @param {(Array.<acgraph.vector.HatchFill.HatchFillType>|Object|anychart.palettes.HatchFills)=} opt_value Chart
 * hatch fill palette settings to set.
 * @return {!(anychart.palettes.HatchFills|anychart.pieModule.Chart)} Return current chart hatch fill palette or itself
 * for chaining call.
 */
anychart.pieModule.Chart.prototype.hatchFillPalette = function(opt_value) {
  if (!this.hatchFillPalette_) {
    this.hatchFillPalette_ = new anychart.palettes.HatchFills();
    this.hatchFillPalette_.listenSignals(this.paletteInvalidated_, this);
    this.registerDisposable(this.hatchFillPalette_);
  }

  if (goog.isDef(opt_value)) {
    this.hatchFillPalette_.setup(opt_value);
    return this;
  } else {
    return this.hatchFillPalette_;
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Fill.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Cache of resolver functions.
 * @type {Object.<string, Function>}
 * @private
 */
anychart.pieModule.Chart.colorResolversCache_ = {};


/**
 * Returns a color resolver for passed color names and type.
 * @param {(string|null|boolean)} colorName
 * @param {anychart.enums.ColorType} colorType
 * @param {boolean} canBeHoveredSelected Whether need to resolve hovered selected colors
 * @return {Function}
 */
anychart.pieModule.Chart.getColorResolver = function(colorName, colorType, canBeHoveredSelected) {
  if (!colorName) return anychart.color.getNullColor;
  var hash = colorType + '|' + colorName + '|' + canBeHoveredSelected;
  var result = anychart.pieModule.Chart.colorResolversCache_[hash];
  if (!result) {
    /** @type {!Function} */
    var normalizerFunc;
    switch (colorType) {
      case anychart.enums.ColorType.STROKE:
        normalizerFunc = anychart.core.settings.strokeOrFunctionSimpleNormalizer;
        break;
      case anychart.enums.ColorType.HATCH_FILL:
        normalizerFunc = anychart.core.settings.hatchFillOrFunctionSimpleNormalizer;
        break;
      default:
      case anychart.enums.ColorType.FILL:
        normalizerFunc = anychart.core.settings.fillOrFunctionSimpleNormalizer;
        break;
    }
    anychart.pieModule.Chart.colorResolversCache_[hash] = result = goog.partial(anychart.pieModule.Chart.getColor_,
        colorName, normalizerFunc, colorType == anychart.enums.ColorType.HATCH_FILL, canBeHoveredSelected);
  }
  return result;
};


/**
 *
 * @param {string} colorName
 * @param {Function} normalizer
 * @param {boolean} isHatchFill
 * @param {boolean} canBeHoveredSelected Whether need to resolve hovered selected colors
 * @param {anychart.pieModule.Chart} pie
 * @param {number} state
 * @param {boolean=} opt_ignorePointSettings
 * @return {*}
 * @private
 */
anychart.pieModule.Chart.getColor_ = function(colorName, normalizer, isHatchFill, canBeHoveredSelected, pie, state, opt_ignorePointSettings) {
  var stateColor, context;
  //state = anychart.core.utils.InteractivityState.clarifyState(state);
  if (state != anychart.PointState.NORMAL && canBeHoveredSelected) {
    stateColor = pie.resolveOption(colorName, state, pie.getIterator(), normalizer, false, void 0, opt_ignorePointSettings);
    if (isHatchFill && stateColor === true)
      stateColor = normalizer(pie.getAutoHatchFill());
    if (goog.isDef(stateColor)) {
      if (!goog.isFunction(stateColor))
        return /** @type {acgraph.vector.Fill|acgraph.vector.Stroke|acgraph.vector.PatternFill} */(stateColor);
      else if (isHatchFill) { // hatch fills set as function some why cannot nest by initial implementation
        context = pie.getHatchFillResolutionContext(opt_ignorePointSettings);
        return /** @type {acgraph.vector.PatternFill} */(normalizer(stateColor.call(context, context)));
      }
    }
  }
  // we can get here only if state color is undefined or is a function
  var color = pie.resolveOption(colorName, 0, pie.getIterator(), normalizer, false, void 0, opt_ignorePointSettings);
  var isAqua = goog.isString(color) && color == 'aquastyle';
  if (isHatchFill && color === true)
    color = normalizer(pie.getAutoHatchFill());
  if (goog.isFunction(color)) {
    context = isHatchFill ?
        pie.getHatchFillResolutionContext(opt_ignorePointSettings) :
        pie.getColorResolutionContext(void 0, opt_ignorePointSettings);
    color = /** @type {acgraph.vector.Fill|acgraph.vector.Stroke|acgraph.vector.PatternFill} */(normalizer(color.call(context, context)));
  }
  if (isAqua) {
    color = pie.resolveAquaStyle();
  }
  if (stateColor) { // it is a function and not a hatch fill here
    context = pie.getColorResolutionContext(
        /** @type {acgraph.vector.Fill|acgraph.vector.Stroke} */(color),
        opt_ignorePointSettings);
    color = normalizer(stateColor.call(context, context));
  }
  return /** @type {acgraph.vector.Fill|acgraph.vector.Stroke|acgraph.vector.PatternFill} */(color);
};


/** @inheritDoc */
anychart.pieModule.Chart.prototype.resolveOption = function(name, state, point, normalizer, scrollerSelected, opt_seriesName, opt_ignorePointSettings) {
  var val;
  var hasHoverState = !!(state & anychart.PointState.HOVER);
  var stateObject = hasHoverState ? this.hovered_ : this.normal_;
  var stateValue = stateObject.getOption(name);
  if (opt_ignorePointSettings) {
    val = stateValue;
  } else {
    var pointStateName = hasHoverState ? 'hovered' : 'normal';
    var pointStateObject = point.get(pointStateName);
    val = anychart.utils.getFirstDefinedValue(
        goog.isDef(pointStateObject) ? pointStateObject[name] : void 0,
        point.get(anychart.color.getPrefixedColorName(state, name)),
        stateValue);
  }
  if (goog.isDef(val))
    val = normalizer(val);
  return val;
};


/** @inheritDoc */
anychart.pieModule.Chart.prototype.getAutoHatchFill = function() {
  return /** @type {acgraph.vector.HatchFill} */ (
      acgraph.vector.normalizeHatchFill(this.hatchFillPalette().itemAt(this.getIterator().getIndex()) ||
      anychart.pieModule.Chart.DEFAULT_HATCH_FILL_TYPE));
};


/** @inheritDoc */
anychart.pieModule.Chart.prototype.getHatchFillResolutionContext = function(opt_ignorePointSettings) {
  var iterator = this.getIterator();
  var index = iterator.getIndex();
  return {
    'index': index,
    'sourceHatchFill': this.getAutoHatchFill(),
    'iterator': iterator
  };
};


/** @inheritDoc */
anychart.pieModule.Chart.prototype.getColorResolutionContext = function(opt_baseColor, opt_ignorePointSettings, opt_ignoreColorScale) {
  var iterator = this.getIterator();
  return {
    'index': iterator.getIndex(),
    'sourceColor': opt_baseColor || this.palette().itemAt(iterator.getIndex()) || 'blue',
    'iterator': iterator
  };
};


/**
 * Returns aqua resolution context.
 * @return {acgraph.vector.AnyColor}
 */
anychart.pieModule.Chart.prototype.resolveAquaStyle = function() {
  var iterator = this.getIterator();
  var context = {
    'aquaStyleObj': this.aquaStyleObj_,
    'sourceColor': this.palette().itemAt(iterator.getIndex())
  };
  return this.aquaStyleFill_.call(context);
};


/**
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.pieModule.Chart.PROPERTY_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};
  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'overlapMode',
      anychart.enums.normalizeLabelsOverlapMode);
  function radiusNormalizer(opt_value) {
    return anychart.utils.normalizeNumberOrPercent(opt_value, '100%');
  }
  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'radius',
      radiusNormalizer);
  function innerRadiusNormalizer(opt_value) {
    return goog.isFunction(opt_value) ? opt_value : anychart.utils.normalizeNumberOrPercent(opt_value);
  }
  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'innerRadius',
      innerRadiusNormalizer);
  function startAngleNormalizer(opt_value) {
    return goog.math.standardAngle(anychart.utils.toNumber(opt_value) || 0);
  }
  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'startAngle',
      startAngleNormalizer);
  function explodeNormalizer(opt_value) {
    return anychart.utils.normalizeNumberOrPercent(opt_value, 15);
  }
  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'explode',
      explodeNormalizer);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'sort',
      anychart.enums.normalizeSort);
  function outsideLabelsSpaceNormalizer(opt_value) {
    return anychart.utils.normalizeNumberOrPercent(opt_value, '30%');
  }
  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'outsideLabelsSpace',
      outsideLabelsSpaceNormalizer);
  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'insideLabelsOffset',
      anychart.utils.normalizeNumberOrPercent);
  function connectorLengthNormalizer(opt_value) {
    return anychart.utils.normalizeNumberOrPercent(opt_value, '20%');
  }
  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'connectorLength',
      connectorLengthNormalizer);
  function criticalAngleNormalizer(opt_value) {
    return goog.math.standardAngle(anychart.utils.normalizeSize(opt_value));
  }
  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'outsideLabelsCriticalAngle',
      criticalAngleNormalizer);
  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'forceHoverLabels',
      anychart.core.settings.asIsNormalizer);
  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'connectorStroke',
      anychart.core.settings.strokeNormalizer);
  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'mode3d',
      anychart.core.settings.booleanNormalizer);

  return map;
})();
anychart.core.settings.populate(anychart.pieModule.Chart, anychart.pieModule.Chart.PROPERTY_DESCRIPTORS);


/**
 * Getter/setter for labels.
 * @param {(Object|boolean|null)=} opt_value .
 * @return {anychart.core.ui.CircularLabelsFactory|anychart.pieModule.Chart} .
 */
anychart.pieModule.Chart.prototype.labels = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.normal_.labels(opt_value);
    return this;
  }
  return /** @type {anychart.core.ui.CircularLabelsFactory} */ (this.normal_.labels());
};


/**
 * Getter/setter for grouping.
 * @param {(string|null|function(*):boolean)=} opt_value Filter function or disablt value (null, 'none').
 * @return {(anychart.pieModule.Chart|function(*):boolean|null)} Current grouping function or self for method chaining.
 */
anychart.pieModule.Chart.prototype.group = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (goog.isFunction(opt_value) && opt_value != this.groupedPointFilter_) {
      this.groupedPointFilter_ = opt_value;
      this.redefineView_();
    } else if (anychart.utils.isNone(opt_value)) {
      this.groupedPointFilter_ = null;
      this.redefineView_();
    }
    return this;
  } else {
    return this.groupedPointFilter_;
  }
};


/**
 * Getter for the pie chart center point.<br/>
 * <b>Note:</b> Works only after {@link anychart.pieModule.Chart#draw} is called.
 * @example
 *  var pieInnerRadius = 40
 *  var pie = anychart.pie([10, 14, 8, 12])
 *      .container(stage)
 *      .innerRadius(pieInnerRadius+10)
 *      .draw();
 *  var pieCenter = pie.getCenterPoint();
 *  var labelBounds = anychart.math.rect(
 *      pieCenter.x - pieInnerRadius,
 *      pieCenter.y - pieInnerRadius,
 *      pieCenter.x + pieInnerRadius,
 *      pieCenter.y + pieInnerRadius
 *  );
 *  anychart.standalones.label()
 *      .text('Pie\ninner\nlabel')
 *      .parentBounds(labelBounds)
 *      .container(stage)
 *      .hAlign('center')
 *      .vAlign('center')
 *      .adjustFontSize(true)
 *      .width(2*pieInnerRadius)
 *      .height(2*pieInnerRadius)
 *      .draw();
 * @return {anychart.math.Coordinate} XY coordinate of the current pie chart center.
 */
anychart.pieModule.Chart.prototype.getCenterPoint = function() {
  return {'x': this.cx_, 'y': this.cy_};
};


/**
 * Getter for the current pie pixel outer radius.<br/>
 * <b>Note:</b> Works only after {@link anychart.pieModule.Chart#draw} is called.
 * @return {number} Pixel value of the pie radius.
 */
anychart.pieModule.Chart.prototype.getPixelRadius = function() {
  return this.radiusValue_;
};


/**
 * Getter for the current pie pixel inner radius.<br/>
 * <b>Note:</b> Works only after {@link anychart.pieModule.Chart#draw} is called.
 * @return {number} XY coordinate of the pie center.
 */
anychart.pieModule.Chart.prototype.getPixelInnerRadius = function() {
  return this.innerRadiusValue_;
};


/**
 * Getter for the current explode value.
 * @return {number}
 */
anychart.pieModule.Chart.prototype.getPixelExplode = function() {
  return this.explodeValue_;
};


/**
 * Internal getter for fixed gauge start angle. All for human comfort.
 * @return {number}
 */
anychart.pieModule.Chart.prototype.getStartAngle = function() {
  return /** @type {number} */ (this.getOption('startAngle')) + anychart.pieModule.Chart.DEFAULT_START_ANGLE;
};


/**
 * Explodes slice at index.
 * @example
 * var chart = anychart.pie([10, 12, 14, 46]);
 * chart.explodeSlice(2);
 * chart.container(stage).draw();
 * @param {number} index Pie slice index that should be exploded or not.
 * @param {boolean=} opt_explode [true] Whether to explode.
 * @return {anychart.pieModule.Chart} .
 */
anychart.pieModule.Chart.prototype.explodeSlice = function(index, opt_explode) {
  var iterator = this.getIterator();
  if (iterator.select(index) && !this.isMissing_(iterator.get('value'))) {
    this.clickSlice(goog.isDef(opt_explode) ? !!opt_explode : true);
  }
  return this;
};


/**
 * Explodes all slices.
 * @example
 * var chart = anychart.pie([10, 12, 14, 46]);
 * chart.explodeSlices(true);
 * chart.container(stage).draw();
 * @param {boolean|Array.<number>} value Whether to explode.
 * @return {anychart.pieModule.Chart} .
 */
anychart.pieModule.Chart.prototype.explodeSlices = function(value) {
  var iterator = this.getIterator().reset();

  if (goog.isArray(value)) {
    for (var i = 0, len = value.length; i < len; i++) {
      var index = value[i];
      if (iterator.select(index) && !this.isMissing_(iterator.get('value'))) {
        this.clickSlice(true);
      }
    }
  } else {
    while (iterator.advance()) {
      if (iterator.select(iterator.getIndex()) && !this.isMissing_(iterator.get('value'))) {
        this.clickSlice(/** @type {boolean} */(value));
      }
    }
  }

  return this;
};


/**
 * Calculating common values for a pie plot.
 * @param {anychart.math.Rect} bounds Bounds of the content area.
 * @private
 */
anychart.pieModule.Chart.prototype.calculate_ = function(bounds) {
  var minWidthHeight = Math.min(bounds.width, bounds.height);

  this.outsideLabelsOffsetValue_ = this.isOutsideLabels() && this.labels().enabled() ?
      anychart.utils.normalizeSize(/** @type {number|string} */ (this.getOption('outsideLabelsSpace')), minWidthHeight) : 0;
  this.radiusValue_ = anychart.utils.normalizeSize(/** @type {number|string} */ (this.getOption('radius')), minWidthHeight - this.outsideLabelsOffsetValue_);
  this.connectorLengthValue_ = anychart.utils.normalizeSize(/** @type {number|string} */ (this.getOption('connectorLength')), this.radiusValue_);

  //todo Don't remove it, it can be useful (blackart)
  //  this.recommendedLabelWidth_ = parseInt(
  //      (bounds.width
  //          - 2 * this.radiusValue_
  //          - 2 * this.connectorLengthValue_
  //          - 2 * anychart.pieModule.Chart.OUTSIDE_LABELS_CONNECTOR_SIZE_)
  //      / 2);

  var innerRadius = /** @type {Function|string|number} */ (this.getOption('innerRadius'));
  this.innerRadiusValue_ = goog.isFunction(innerRadius) ?
      innerRadius(this.radiusValue_) :
      anychart.utils.normalizeSize(innerRadius, this.radiusValue_);

  this.explodeValue_ = anychart.utils.normalizeSize(/** @type {number|string} */ (this.getOption('explode')), minWidthHeight);

  this.cx_ = bounds.left + bounds.width / 2;
  this.cy_ = bounds.top + bounds.height / 2;

  /**
   * Bounds of pie. (Not bounds of content area).
   * Need for radial gradient to set correct bounds.
   * @type {anychart.math.Rect}
   * @private
   */
  this.pieBounds_ = new anychart.math.Rect(this.cx_ - this.radiusValue_, this.cy_ - this.radiusValue_,
      this.radiusValue_ * 2, this.radiusValue_ * 2);

  //Calculate aqua style relative bounds.
  var ac6_angle = goog.math.toRadians(-145);
  var ac6_focalPoint = .5;
  var defFx = .5;
  var defFy = .5;
  var r = Math.min(bounds.width, bounds.height) / 2;
  var fx = (ac6_focalPoint * r * Math.cos(ac6_angle) / bounds.width) + defFx;
  var fy = (ac6_focalPoint * r * Math.sin(ac6_angle) / bounds.height) + defFy;

  if (bounds.width < 0) bounds.width = 0;
  if (bounds.height < 0) bounds.height = 0;

  this.aquaStyleObj_['fx'] = !isNaN(fx) && isFinite(fx) ? fx : 0;
  this.aquaStyleObj_['fy'] = !isNaN(fy) && isFinite(fy) ? fy : 0;
  this.aquaStyleObj_['mode'] = bounds;

  var labels = this.labels();
  labels.suspendSignalsDispatching();
  labels.cx(this.cx_);
  labels.cy(this.cy_);
  labels.parentRadius(this.radiusValue_);
  labels.startAngle(/** @type {number} */ (this.getOption('startAngle')));
  labels.sweepAngle(360);
  labels.parentBounds(this.pieBounds_);
  labels.resumeSignalsDispatching(false);

  this.hovered().labels()
      .parentBounds(this.pieBounds_);
};


/**
 * Identifies fill or stroke as radial gradient.
 * @param {(acgraph.vector.Fill|acgraph.vector.Stroke)} fillOrStroke Fill or stroke.
 * @return {boolean} is fill or stroke radial gradient.
 * @private
 */
anychart.pieModule.Chart.prototype.isRadialGradientMode_ = function(fillOrStroke) {
  return goog.isObject(fillOrStroke) && fillOrStroke.hasOwnProperty('mode') && fillOrStroke.hasOwnProperty('cx');
};


/**
 * Gets final normalized fill or stroke color.
 * @param {acgraph.vector.Fill|acgraph.vector.Stroke|Function|boolean} color Normal state color.
 * @param {...(acgraph.vector.Fill|acgraph.vector.Stroke|Function)} var_args .
 * @return {!(acgraph.vector.Fill|acgraph.vector.Stroke)} Normalized color.
 * @protected
 */
anychart.pieModule.Chart.prototype.normalizeColor = function(color, var_args) {
  var fill;
  var index = this.getIterator().getIndex();
  var sourceColor, scope;
  if (goog.isString(color) && color == 'aquastyle') {
    scope = {
      'aquaStyleObj': this.aquaStyleObj_,
      'sourceColor': this.palette().itemAt(index)
    };
    fill = this.aquaStyleFill_.call(scope);
  } else if (goog.isFunction(color)) {
    sourceColor = arguments.length > 1 ?
        this.normalizeColor.apply(this, goog.array.slice(arguments, 1)) :
        this.palette().itemAt(index);
    scope = {
      'index': index,
      'sourceColor': sourceColor,
      'iterator': this.getIterator()
    };
    fill = color.call(scope);
  } else
    fill = color;
  return fill;
};


/**
 * @inheritDoc
 */
anychart.pieModule.Chart.prototype.beforeDraw = function() {
  if (this.palette_ && anychart.utils.instanceOf(this.palette_, anychart.palettes.RangeColors)) {
    this.palette_.count(this.getIterator().getRowsCount());
  }
};


/**
 * Drawing content.
 * @param {anychart.math.Rect} bounds Bounds of content area.
 */
anychart.pieModule.Chart.prototype.drawContent = function(bounds) {
  this.calculate();
  this.labels().dropCallsCache();
  var iterator = this.getIterator();
  var exploded;
  var value;
  var rowsCount = iterator.getRowsCount();
  var mode3d = /** @type {boolean} */ (this.getOption('mode3d'));

  if (rowsCount > 7) {
    anychart.core.reporting.info(anychart.enums.InfoCode.PIE_TOO_MUCH_POINTS, [rowsCount]);
  }

  // if (!this.tooltip().container()) {
  //   this.tooltip().container(/** @type {acgraph.vector.ILayer} */(this.container()));
  // }

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    this.calculate_(bounds);
    this.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.PIE_LABELS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    if (this.dataLayer_) {
      this.dataLayer_.clear();
    } else {
      this.dataLayer_ = new anychart.core.utils.TypedLayer(function() {
        return acgraph.path();
      }, function(child) {
        (/** @type {acgraph.vector.Path} */ (child)).clear();
      });
      this.dataLayer_.zIndex(anychart.pieModule.Chart.ZINDEX_PIE);
      this.dataLayer_.parent(this.rootElement);
    }

    if (this.hatchLayer_) {
      this.hatchLayer_.clear();
    } else {
      this.hatchLayer_ = new anychart.core.utils.TypedLayer(function() {
        return acgraph.path();
      }, function(child) {
        (/** @type {acgraph.vector.Path} */ (child)).clear();
      });
      this.hatchLayer_.parent(this.rootElement);
      this.hatchLayer_.zIndex(/** @type {number} */(anychart.pieModule.Chart.ZINDEX_HATCH_FILL)).disablePointerEvents(true);
    }

    if (mode3d) {
      this.sides3D_.length = 0;
    }

    var start = /** @type {number} */ (this.getStartAngle());
    var sweep = 0;

    iterator.reset();
    while (iterator.advance()) {
      value = /** @type {number|string|null|undefined} */ (iterator.get('value'));
      if (this.isMissing_(value)) {
        iterator.meta('missing', true);
        continue;
      }
      value = +value;
      sweep = value / /** @type {number} */ (this.getStat(anychart.enums.Statistics.SUM)) * 360;

      iterator.meta('start', start).meta('sweep', sweep);
      if (!goog.isDef(exploded = iterator.meta('exploded'))) {
        exploded = !!iterator.get('exploded');
        iterator.meta('exploded', exploded);
        if (exploded)
          this.state.setPointState(anychart.PointState.SELECT, iterator.getIndex());
      }


      if (mode3d) {
        this.prepare3DSlice_();
      } else {
        this.drawSlice_();
      }
      start += sweep;
    }

    if (mode3d) {
      this.draw3DSlices_();
    }

    var connectorStroke = /** @type {acgraph.vector.Stroke} */ (this.getOption('connectorStroke'));
    if (this.drawnConnectors_) {
      for (var i in this.drawnConnectors_) {
        if (this.drawnConnectors_.hasOwnProperty(i))
          this.drawnConnectors_[i].stroke(connectorStroke);
      }
    }

    if (this.hoveredLabelConnectorPath_)
      this.hoveredLabelConnectorPath_.stroke(connectorStroke);

    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }


  if (this.hasInvalidationState(anychart.ConsistencyState.PIE_LABELS)) {
    if (!this.labels().container()) this.labels().container(this.rootElement);
    this.labels().clear();
    if (this.connectorsLayer_) {
      this.connectorsLayer_.clear();
      if (mode3d) this.connectorsLowerLayer_.clear();
    }

    var themePart = this.isOutsideLabels() ?
        anychart.getFullTheme('pie.outsideLabels') :
        anychart.getFullTheme('pie.insideLabels');
    this.labels().setAutoColor(themePart['autoColor']);
    this.labels()['disablePointerEvents'](themePart['disablePointerEvents']);
    if (this.isOutsideLabels()) {
      this.calculateOutsideLabels();
    } else {
      iterator.reset();
      while (iterator.advance()) {
        if (this.isMissing_(iterator.get('value'))) continue;
        var pointState = this.state.seriesState | this.state.getPointStateByIndex(iterator.getIndex());
        var hovered = this.state.isStateContains(pointState, anychart.PointState.HOVER);
        this.drawLabel_(pointState, hovered);
      }
    }
    this.labels().draw();
    this.labels().getDomElement().clip(bounds);
    this.markConsistent(anychart.ConsistencyState.PIE_LABELS);
  }
};


/**
 * Checks that value represents missing point.
 * @param {*} value
 * @return {boolean} Is value represents missing value.
 * @private
 */
anychart.pieModule.Chart.prototype.isMissing_ = function(value) {
  value = goog.isNull(value) ? NaN : +value;
  return !(goog.isNumber(value) && !isNaN(value) && (value > 0));
};


/**
 * Updates point on animate.
 * @param {anychart.data.Iterator} point Iterator pointing to slice.
 */
anychart.pieModule.Chart.prototype.updatePointOnAnimate = function(point) {
  var slice = /** @type {!acgraph.vector.Path} */ (point.meta('slice'));
  slice.clear();
  var start = /** @type {number} */ (point.meta('start'));
  var sweep = /** @type {number} */ (point.meta('sweep'));
  var radius = /** @type {number} */ (point.meta('radius'));
  var innerRadius = /** @type {number} */ (point.meta('innerRadius'));
  var exploded = !!point.meta('exploded') && !(point.getRowsCount() == 1);

  if (exploded) {
    var angle = start + sweep / 2;
    var cos = Math.cos(goog.math.toRadians(angle));
    var sin = Math.sin(goog.math.toRadians(angle));
    var ex = this.explodeValue_ * cos;
    var ey = this.explodeValue_ * sin;
    slice = acgraph.vector.primitives.donut(slice, this.cx_ + ex, this.cy_ + ey, radius, innerRadius, start, sweep);
  } else {
    slice = acgraph.vector.primitives.donut(slice, this.cx_, this.cy_, radius, innerRadius, start, sweep);
  }

  var hatchSlice = /** @type {!acgraph.vector.Path} */ (point.meta('hatchSlice'));
  if (hatchSlice) {
    this.getIterator().select(point.getIndex());
    hatchSlice.clear();
    hatchSlice.deserialize(slice.serialize());
    var hatchFillResolver = anychart.pieModule.Chart.getColorResolver('hatchFill', anychart.enums.ColorType.HATCH_FILL, true);
    var hatchFill = hatchFillResolver(this, this.state.getPointStateByIndex(point.getIndex()), false);
    hatchSlice.stroke(null).fill(hatchFill);
  }
};


/**
 * Updates label (and connector) on animate.
 * @param {number} labelOpacity Label opacity.
 * @param {number} connectorOpacity Connector opacity.
 * @param {boolean} isOutside Whether labels has outside position.
 */
anychart.pieModule.Chart.prototype.updateLabelsOnAnimate = function(labelOpacity, connectorOpacity, isOutside) {
  var labels = this.labels();
  labels.suspendSignalsDispatching();
  labels['fontOpacity'](labelOpacity);
  labels.draw();
  labels.resumeSignalsDispatching(false);
  if (isOutside && this.drawnConnectors_) {
    for (var i in this.drawnConnectors_) {
      if (this.drawnConnectors_.hasOwnProperty(i))
        this.drawnConnectors_[i].stroke(anychart.color.setOpacity(/** @type {acgraph.vector.Stroke} */ (this.getOption('connectorStroke')), connectorOpacity));
    }
  }
};


/**
 * Internal function for drawinga slice by arguments.
 * @param {boolean=} opt_update Whether to update current slice.
 * @return {boolean} True if point is drawn.
 * @private
 */
anychart.pieModule.Chart.prototype.drawSlice_ = function(opt_update) {
  var iterator = this.getIterator();

  var index = /** @type {number} */ (iterator.getIndex());
  var start = /** @type {number} */ (iterator.meta('start'));
  var sweep = /** @type {number} */ (iterator.meta('sweep'));
  var exploded = !!iterator.meta('exploded') && !(iterator.getRowsCount() == 1);

  /** @type {!acgraph.vector.Path} */
  var slice;
  /** @type {acgraph.vector.Path} */
  var hatchSlice;
  if (opt_update) {
    slice = /** @type {!acgraph.vector.Path} */ (iterator.meta('slice'));
    hatchSlice = /** @type {acgraph.vector.Path} */ (iterator.meta('hatchSlice'));
    slice.clear();
    if (hatchSlice) hatchSlice.clear();
  } else {
    slice = /** @type {!acgraph.vector.Path} */(this.dataLayer_.genNextChild());
    iterator.meta('slice', slice);
    hatchSlice = /** @type {acgraph.vector.Path} */(this.hatchLayer_.genNextChild());
    iterator.meta('hatchSlice', hatchSlice);
  }

  if (exploded) {
    var angle = start + sweep / 2;
    var cos = Math.cos(goog.math.toRadians(angle));
    var sin = Math.sin(goog.math.toRadians(angle));
    var ex = this.explodeValue_ * cos;
    var ey = this.explodeValue_ * sin;
    slice = acgraph.vector.primitives.donut(slice, this.cx_ + ex, this.cy_ + ey, this.radiusValue_, this.innerRadiusValue_, start, sweep);
  } else {
    slice = acgraph.vector.primitives.donut(slice, this.cx_, this.cy_, this.radiusValue_, this.innerRadiusValue_, start, sweep);
  }

  slice.tag = {
    series: this,
    index: index
  };
  var pointState = this.state.getPointStateByIndex(iterator.getIndex());
  this.colorizeSlice(pointState);
  if (hatchSlice) {
    hatchSlice.deserialize(slice.serialize());
    hatchSlice.tag = {
      series: this,
      index: index
    };
    this.applyHatchFill(pointState);
  }

  return true;
};


/**
 * @param {(anychart.enums.SelectionMode|string|null)=} opt_value Selection mode.
 * @return {anychart.pieModule.Chart|anychart.enums.SelectionMode|null} .
 */
/*TODO(AntonKagakin): Do not remove. For future interactivity improvement.
anychart.pieModule.Chart.prototype.selectionMode = function(opt_value) {
  return null;
};*/


/**
 * @param {(anychart.enums.HoverMode|string)=} opt_value Hover mode.
 * @return {anychart.pieModule.Chart|anychart.enums.HoverMode} .
 */
anychart.pieModule.Chart.prototype.hoverMode = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeHoverMode(opt_value);
    if (opt_value != this.hoverMode_) {
      this.hoverMode_ = opt_value;
    }
    return this;
  }
  return /** @type {anychart.enums.HoverMode}*/(this.hoverMode_);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  3D mode.
//
//----------------------------------------------------------------------------------------------------------------------


/**
 * Get minor semi-axes (minor radius) value.
 * @param {number} majorRadius
 * @return {number}
 * @protected
 */
anychart.pieModule.Chart.prototype.get3DYRadius = function(majorRadius) {
  return majorRadius * anychart.pieModule.Chart.ASPECT_3D;
};


/**
 * Get the thickness of the pie.
 * @return {number}
 * @protected
 */
anychart.pieModule.Chart.prototype.get3DHeight = function() {
  return this.radiusValue_ * anychart.pieModule.Chart.PIE_THICKNESS;
};


/**
 * To prepare 3D slice.
 * @private
 */
anychart.pieModule.Chart.prototype.prepare3DSlice_ = function() {
  var iterator = this.getIterator();
  var index = iterator.getIndex();

  var start = /** @type {number} */ (iterator.meta('start'));
  var sweep = /** @type {number} */ (iterator.meta('sweep'));
  var end = start + sweep;
  // if no information about slice in meta (e.g. no slice has drawn: call explodeSlice(_, _) before chart.draw()).
  if (!goog.isDef(start) || !goog.isDef(sweep) || !sweep) return;

  var angle = start + sweep / 2;
  var cos = Math.cos(goog.math.toRadians(angle));
  var sin = Math.sin(goog.math.toRadians(angle));
  var ex = this.explodeValue_ * cos;
  var ey = this.get3DYRadius(this.explodeValue_) * sin;

  this.sides3D_.push({
    index: index,
    type: anychart.pieModule.Chart.Side3DType.TOP,
    start: start,
    sweep: sweep,
    ex: ex,
    ey: ey
  });

  if (Math.abs(sweep) != 360) {
    if (this.hasStartSide_(start)) {
      this.sides3D_.push({
        index: index,
        type: anychart.pieModule.Chart.Side3DType.START,
        angle: start,
        ex: ex,
        ey: ey
      });
    }

    if (this.hasEndSide_(end)) {
      this.sides3D_.push({
        index: index,
        type: anychart.pieModule.Chart.Side3DType.END,
        angle: end,
        ex: ex,
        ey: ey
      });
    }
  }

  var len1;
  var len2;
  var j;

  if (this.hasFrontSide_(start, end)) {
    var frontSides = this.getFrontSides_(start, end);

    len1 = this.sides3D_.length;
    len2 = frontSides.length;
    this.sides3D_.length = len1 + len2;
    for (j = 0; j < len2; j++) {
      frontSides[j].index = index;
      frontSides[j].type = anychart.pieModule.Chart.Side3DType.FRONT;
      frontSides[j].sweep = sweep;
      frontSides[j].ex = ex;
      frontSides[j].ey = ey;

      this.sides3D_[len1 + j] = frontSides[j];
    }
  }

  if (this.hasBackSide_(start, end)) {
    var backSides = this.getBackSides_(start, end);

    len1 = this.sides3D_.length;
    len2 = backSides.length;
    this.sides3D_.length = len1 + len2;
    for (j = 0; j < len2; j++) {
      backSides[j].index = index;
      backSides[j].type = anychart.pieModule.Chart.Side3DType.BACK;
      backSides[j].sweep = sweep;
      backSides[j].ex = ex;
      backSides[j].ey = ey;

      this.sides3D_[len1 + j] = backSides[j];
    }
  }
};


/**
 * Draw whole 3D slice.
 * @param {number=} opt_sliceIndex
 * @param {boolean=} opt_update
 * @private
 */
anychart.pieModule.Chart.prototype.draw3DSlices_ = function(opt_sliceIndex, opt_update) {
  var i = 0, length = this.sides3D_.length;
  var side;

  if (goog.isDef(opt_sliceIndex)) {
    for (i = 0; i < length; i++) {
      side = this.sides3D_[i];
      if (side.index == opt_sliceIndex) {
        this.draw3DSlice_(side, opt_update);
      }
    }

  } else {
    for (i = 0; i < length; i++) {
      side = this.sides3D_[i];

      switch (side.type) {
        case anychart.pieModule.Chart.Side3DType.TOP:
          side.sortWeight = 1;
          break;
        case anychart.pieModule.Chart.Side3DType.FRONT:
          side.sortWeight = (side.isInFront ?
              1 :
              anychart.math.round(Math.sin(goog.math.toRadians(this.getCenterAngle_(side.start, side.end))), 7));
          break;
        case anychart.pieModule.Chart.Side3DType.BACK:
          side.sortWeight = (side.isInFront ?
              -1 :
              anychart.math.round(Math.sin(goog.math.toRadians(this.getCenterAngle_(side.start, side.end))), 7));
          break;
          // for start or end side
        default:
          side.sortWeight = anychart.math.round(Math.sin(goog.math.toRadians(side.angle)), 7);
          break;
      }
    }

    this.sides3D_.sort(function(a, b) {
      return a.sortWeight - b.sortWeight;
    });

    for (i = 0; i < length; i++) {
      this.draw3DSlice_(this.sides3D_[i]);
    }
  }
};


/**
 * Draw 3D slice by side settings.
 * @param {Object} side
 * @param {boolean=} opt_update
 * @private
 */
anychart.pieModule.Chart.prototype.draw3DSlice_ = function(side, opt_update) {
  var iterator = this.getIterator();
  iterator.select(side.index);
  var exploded = !!iterator.meta('exploded') && !(iterator.getRowsCount() == 1);

  var cx = this.cx_;
  var cy = this.cy_;
  if (exploded) {
    cx += side.ex;
    cy += side.ey;
  }

  var outerR = this.radiusValue_;
  var innerR = this.innerRadiusValue_;

  var pointState = this.state.getPointStateByIndex(iterator.getIndex());

  switch (side.type) {
    case anychart.pieModule.Chart.Side3DType.TOP:
      this.drawTopSide_(cx, cy, outerR, innerR, side.start, side.sweep, pointState, opt_update);
      break;
    case anychart.pieModule.Chart.Side3DType.FRONT:
      this.drawFrontSide_(cx, cy, outerR, side.start, side.end, side.sweep, pointState, opt_update);
      break;
    case anychart.pieModule.Chart.Side3DType.BACK:
      this.drawBackSide_(cx, cy, innerR, side.start, side.end, side.sweep, pointState, opt_update);
      break;
    case anychart.pieModule.Chart.Side3DType.START:
      this.drawSimpleSide_('startPath', cx, cy, outerR, innerR, side.angle, pointState, opt_update);
      break;
    case anychart.pieModule.Chart.Side3DType.END:
      this.drawSimpleSide_('endPath', cx, cy, outerR, innerR, side.angle, pointState, opt_update);
      break;
  }
};


/**
 * Draw top side.
 * @param {number} cx
 * @param {number} cy
 * @param {number} outerR
 * @param {number} innerR
 * @param {number} start Start angle in degrees.
 * @param {number} sweep Sweep angle in degrees.
 * @param {(anychart.PointState|number)} pointState Point state.
 * @param {boolean=} opt_update
 * @return {!acgraph.vector.Path}
 * @private
 */
anychart.pieModule.Chart.prototype.drawTopSide_ = function(cx, cy, outerR, innerR, start, sweep, pointState, opt_update) {
  if (outerR < 0) outerR = 0;
  if (innerR < 0) innerR = 0;
  if (outerR < innerR) {
    var tmp = outerR;
    outerR = innerR;
    innerR = tmp;
  }

  sweep = goog.math.clamp(sweep, -360, 360);

  var path = this.createPath_('topPath', opt_update);

  // draw pie
  if (innerR <= 0) {
    if (Math.abs(sweep) == 360) {
      path.circularArc(cx, cy, outerR, this.get3DYRadius(outerR), start, sweep, false);
    } else {
      path.moveTo(cx, cy).circularArc(cx, cy, outerR, this.get3DYRadius(outerR), start, sweep, true).close();
    }

    this.colorize3DPath_('topPath', pointState);
    return path;
  }

  var drawSides = Math.abs(sweep) < 360;

  path.circularArc(cx, cy, outerR, this.get3DYRadius(outerR), start, sweep)
      .circularArc(cx, cy, innerR, this.get3DYRadius(innerR), start + sweep, -sweep, drawSides);

  if (drawSides) {
    path.close();
  }

  this.colorize3DPath_('topPath', pointState);
  return path;
};


/**
 * Get path name for hatchPath.
 * @param {string} pathName
 * @return {string}
 * @private
 */
anychart.pieModule.Chart.prototype.get3DHatchPathName_ = function(pathName) {
  // capitalize
  return 'hatch' + String(pathName.charAt(0)).toUpperCase() + pathName.substr(1);
};


/**
 *
 * @param {string} pathName
 * @param {boolean=} opt_update
 * @return {!acgraph.vector.Path}
 * @private
 */
anychart.pieModule.Chart.prototype.createPath_ = function(pathName, opt_update) {
  var iterator = this.getIterator();
  var hatchName = this.get3DHatchPathName_(pathName);

  /** @type {!acgraph.vector.Path} */
  var path;
  /** @type {!acgraph.vector.Path} */
  var hatchPath;
  if (opt_update) {
    path = /** @type {!acgraph.vector.Path} */ (iterator.meta(pathName));
    hatchPath = /** @type {!acgraph.vector.Path} */ (iterator.meta(hatchName));

    path.clear();
    if (hatchPath) hatchPath.clear();

  } else {
    path = /** @type {!acgraph.vector.Path} */(this.dataLayer_.genNextChild());
    iterator.meta(pathName, path);

    hatchPath = /** @type {!acgraph.vector.Path} */(this.dataLayer_.genNextChild());
    iterator.meta(hatchName, hatchPath);
  }

  return path;
};


/**
 * Colorize and apply hatchFill for all path of slice.
 * @param {anychart.PointState|number} pointState Point state.
 * @private
 */
anychart.pieModule.Chart.prototype.colorize3DSlice_ = function(pointState) {
  var i, length = this.sides3D_.length;
  var side;
  var index = this.getIterator().getIndex();

  for (i = 0; i < length; i++) {
    side = this.sides3D_[i];
    if (side.index == index) {
      var uniqueValue = (side.type == anychart.pieModule.Chart.Side3DType.FRONT || side.type == anychart.pieModule.Chart.Side3DType.BACK) ? side.start : '';
      this.colorize3DPath_(side.type + 'Path' + uniqueValue, pointState);
    }
  }
};


/**
 * Get fill color for 3D mode.
 * Compute named colors (from point data) and fallback if rawColor is not hex.
 * @param {(anychart.PointState|number)} pointState Point state.
 * @return {string}
 * @private
 */
anychart.pieModule.Chart.prototype.get3DFillColor_ = function(pointState) {
  var iterator = this.getIterator();
  var index = iterator.getIndex();

  var pointStateObject = iterator.get('normal');
  var normalColor = /** @type {acgraph.vector.Fill|Function} */(anychart.utils.getFirstDefinedValue(
      goog.isDef(pointStateObject) ? pointStateObject['fill'] : void 0,
      iterator.get('fill'),
      this.fill()));

  var rawColor;
  if (this.state.isStateContains(pointState, anychart.PointState.HOVER)) {
    var hoverFill;
    pointStateObject = iterator.get('hovered');
    hoverFill = anychart.utils.getFirstDefinedValue(
        goog.isDef(pointStateObject) ? pointStateObject['fill'] : void 0,
        iterator.get('hoverFill'),
        normalColor);
    rawColor = this.normalizeColor(
        /** @type {acgraph.vector.Fill|Function} */(hoverFill), normalColor);
  } else {
    rawColor = this.normalizeColor(normalColor);
  }

  var parsedColor;
  if (goog.isString(rawColor)) {
    parsedColor = anychart.color.parseColor(rawColor);
  }

  var paletteColor = this.palette().itemAt(index);
  var parsedPaletteColor;
  // extract color
  if (goog.isObject(paletteColor)) {
    if (paletteColor.color) {
      parsedPaletteColor = anychart.color.parseColor(paletteColor.color);
    } else if (paletteColor.keys && paletteColor.keys.length) {
      parsedPaletteColor = anychart.color.parseColor(paletteColor.keys[0].color);
    }
  }
  var finalPaletteColor = parsedPaletteColor ? parsedPaletteColor.hex : paletteColor;

  return parsedColor ? parsedColor.hex : finalPaletteColor;
};


/**
 * Get stroke color for 3D mode for legend.
 * @return {acgraph.vector.Stroke}
 */
anychart.pieModule.Chart.prototype.get3DStrokeColor = function() {
  return /** @type {acgraph.vector.Stroke} */ (anychart.color.darken(this.get3DFillColor_(anychart.PointState.NORMAL), .2));
};


/**
 * Colorize and apply hatchFill for path.
 * @param {!string} pathName
 * @param {(anychart.PointState|number)} pointState Point state.
 * @private
 */
anychart.pieModule.Chart.prototype.colorize3DPath_ = function(pathName, pointState) {
  var iterator = this.getIterator();
  var index = iterator.getIndex();

  var color = this.get3DFillColor_(pointState);
  var rgbColor = goog.color.hexToRgb(color);

  var path = iterator.meta(pathName);
  path.tag = {
    series: this,
    index: index
  };

  var fill;

  var rgbDarken = goog.color.darken(rgbColor, .3);
  var rgbLighten = goog.color.lighten(rgbColor, .1);

  var topPathSecondColor = goog.color.rgbArrayToHex(goog.color.blend(rgbColor, rgbDarken, .7));
  var frontSecondColor = goog.color.rgbArrayToHex(goog.color.blend(rgbDarken, rgbLighten, .1));
  var frontThirdColor = goog.color.rgbArrayToHex(goog.color.blend(rgbColor, rgbDarken, .8));
  var darkPathColor = goog.color.rgbArrayToHex(goog.color.blend(rgbColor, rgbDarken, .2));
  var darkSidesPathColor = goog.color.rgbArrayToHex(goog.color.blend(rgbColor, rgbDarken, .1));

  var hovered = this.state.isStateContains(pointState, anychart.PointState.HOVER);

  if (pathName == 'topPath') {

    fill = {
      'angle': -50,
      'keys': [{
        'position': 0,
        'opacity': 1,
        'color': hovered ? anychart.color.lighten(color, .3) : color
      }, {
        'position': 1,
        'opacity': 1,
        'color': hovered ? anychart.color.lighten(topPathSecondColor, .2) : topPathSecondColor
      }]
    };

  } else if (goog.string.startsWith(pathName, 'frontPath')) {
    fill = {
      'angle': 45,
      'keys': [{
        'position': 0,
        'opacity': 1,
        'color': hovered ? anychart.color.lighten(color, .2) : anychart.color.lighten(color, .1)
      }, {
        'position': .19,
        'opacity': 1,
        'color': hovered ? anychart.color.lighten(frontSecondColor, .2) : frontSecondColor
      }, {
        'position': 1,
        'opacity': 1,
        'color': hovered ? anychart.color.lighten(frontThirdColor, .2) : frontThirdColor
      }]
    };

  } else if (goog.string.startsWith(pathName, 'backPath')) {
    fill = hovered ? anychart.color.lighten(darkPathColor, .2) : darkPathColor;

    // sides (start, end)
  } else {
    fill = hovered ? anychart.color.lighten(darkSidesPathColor, .2) : darkSidesPathColor;
  }

  path.fill(fill);
  // use stroke with some fill for white space compensation between paths of slice
  path.stroke(fill);

  var hatchPathName = this.get3DHatchPathName_(pathName);
  var hatchPath = iterator.meta(hatchPathName);
  if (hatchPath) {
    hatchPath.deserialize(path.serialize());
    hatchPath.tag = {
      series: this,
      index: index
    };
    this.applyHatchFill(pointState, hatchPathName);
  }
};


/**
 * Checks slice for having start side.
 * @param {number} startAngle Start angle.
 * @return {boolean} Whether slice have start side or not.
 * @private
 */
anychart.pieModule.Chart.prototype.hasStartSide_ = function(startAngle) {
  startAngle = goog.math.toRadians(startAngle);
  var startCos = anychart.math.round(Math.cos(startAngle), 7);
  var startSin = anychart.math.round(Math.sin(startAngle), 7);

  var startQuadrant = this.getQuadrant_(startCos, startSin);
  return ((!(!startCos && Math.abs(startSin) == 1) && startQuadrant == 3) || startQuadrant == 2);
};


/**
 * Checks slice for having end side.
 * @param {number} endAngle Start angle.
 * @return {boolean} Whether slice have end side or not.
 * @private
 */
anychart.pieModule.Chart.prototype.hasEndSide_ = function(endAngle) {
  endAngle = goog.math.toRadians(endAngle);
  var endCos = anychart.math.round(Math.cos(endAngle), 7);
  var endSin = anychart.math.round(Math.sin(endAngle), 7);
  var endQuadrant = this.getQuadrant_(endCos, endSin);
  return ((!(!endCos && Math.abs(endSin) == 1) && endQuadrant == 1) || endQuadrant == 4);
};


/**
 * True if slice has front side.
 * @param {number} startAngle
 * @param {number} endAngle
 * @return {boolean}
 * @private
 */
anychart.pieModule.Chart.prototype.hasFrontSide_ = function(startAngle, endAngle) {
  if (startAngle == endAngle) return false;

  startAngle = goog.math.toRadians(startAngle);
  endAngle = goog.math.toRadians(endAngle);

  var startCos = anychart.math.round(Math.cos(startAngle), 7);
  var endCos = anychart.math.round(Math.cos(endAngle), 7);

  var startQuadrant = this.getQuadrant_(startCos, Math.sin(startAngle));
  var endQuadrant = this.getQuadrant_(endCos, Math.sin(endAngle));

  if (startQuadrant == 1 || startQuadrant == 2) return true;

  if (startQuadrant == 3) {
    if (endQuadrant == 1 || endQuadrant == 2) return true;
    if (endQuadrant == 3) return (startCos >= endCos);
    return false;
  }

  if (startQuadrant == 4) {
    if (endQuadrant == 4) return (startCos >= endCos);
    return true;
  }

  return false;
};


/**
 * True if slice has back side.
 * @param {number} startAngle
 * @param {number} endAngle
 * @return {boolean}
 * @private
 */
anychart.pieModule.Chart.prototype.hasBackSide_ = function(startAngle, endAngle) {
  if (startAngle == endAngle || !this.innerRadiusValue_) return false;

  startAngle = goog.math.toRadians(startAngle);
  endAngle = goog.math.toRadians(endAngle);

  var startCos = anychart.math.round(Math.cos(startAngle), 7);
  var endCos = anychart.math.round(Math.cos(endAngle), 7);

  var startQuadrant = this.getQuadrant_(startCos, Math.sin(startAngle));
  var endQuadrant = this.getQuadrant_(endCos, Math.sin(endAngle));

  if (startQuadrant == 3 || startQuadrant == 4) return true;

  if (startQuadrant == 1) {
    if (endQuadrant == 3 || endQuadrant == 4) return true;
    if (endQuadrant == 1) return (startCos <= endCos);
    return false;
  }

  if (startQuadrant == 2) {
    if (endQuadrant == 2) return (startCos <= endCos);
    return true;
  }
  return false;
};


/**
 * Get quadrant (from 1st to 4th).
 * @param {number} cos
 * @param {number} sin
 * @return {number}
 * @private
 */
anychart.pieModule.Chart.prototype.getQuadrant_ = function(cos, sin) {
  if (cos >= 0 && sin >= 0)
    return 1;
  if (cos <= 0 && sin >= 0)
    return 2;
  if (cos <= 0 && sin < 0)
    return 3;
  return 4;
};


/**
 * Get all (one or two) paths of front side.
 * @param {number} startAngle
 * @param {number} endAngle
 * @return {Array.<anychart.pieModule.Chart.Side3D>}
 * @private
 */
anychart.pieModule.Chart.prototype.getFrontSides_ = function(startAngle, endAngle) {
  var startSin = Math.sin(goog.math.toRadians(startAngle));
  var endSin = Math.sin(goog.math.toRadians(endAngle));

  var startCos = anychart.math.round(Math.cos(goog.math.toRadians(startAngle)), 7);
  var endCos = anychart.math.round(Math.cos(goog.math.toRadians(endAngle)), 7);

  var startQuadrant = this.getQuadrant_(startCos, startSin);
  var endQuadrant = this.getQuadrant_(endCos, endSin);

  var sides = [];

  if (startQuadrant == 1) {
    switch (endQuadrant) {
      case 1:
        if (startCos >= endCos) {
          sides.push({start: startAngle, end: endAngle});
        } else {
          sides.push({start: startAngle, end: 180, isInFront: true});
          sides.push({start: 360, end: endAngle});
        }
        break;
      case 2:
        sides.push({start: startAngle, end: endAngle, isInFront: true});
        break;
      case 3:
      case 4:
        sides.push({start: startAngle, end: 180, isInFront: true});
        break;
    }
  } else if (startQuadrant == 2) {
    switch (endQuadrant) {
      case 1:
        sides.push({start: startAngle, end: 180});
        sides.push({start: 360, end: endAngle});
        break;
      case 2:
        if (startCos >= endCos) {
          sides.push({start: startAngle, end: endAngle});
        } else {
          sides.push({start: startAngle, end: 180});
          sides.push({start: 360, end: endAngle, isInFront: true});
        }
        break;
      case 3:
      case 4:
        sides.push({start: startAngle, end: 180});
        break;
    }
  } else if (startQuadrant == 3) {
    switch (endQuadrant) {
      case 1:
        sides.push({start: 360, end: endAngle});
        break;
      case 2:
        sides.push({start: 360, end: endAngle, isInFront: true});
        break;
      case 3:
        if (startCos >= endCos) {
          sides.push({start: 0, end: 180, isInFront: true});
        }
        break;
    }
  } else if (startQuadrant == 4) {
    switch (endQuadrant) {
      case 1:
        sides.push({start: 360, end: endAngle});
        break;
      case 2:
        sides.push({start: 360, end: endAngle, isInFront: true});
        break;
      case 3:
        sides.push({start: 360, end: 180, isInFront: true});
        break;
      case 4:
        if (startCos >= endCos) {
          sides.push({start: 0, end: 180, isInFront: true});
        }
        break;
    }
  }

  return sides;
};


/**
 * Get all (one or two) paths of back side.
 * @param {number} startAngle
 * @param {number} endAngle
 * @return {Array.<anychart.pieModule.Chart.Side3D>}
 * @private
 */
anychart.pieModule.Chart.prototype.getBackSides_ = function(startAngle, endAngle) {
  var startSin = Math.sin(goog.math.toRadians(startAngle));
  var endSin = Math.sin(goog.math.toRadians(endAngle));

  var startCos = anychart.math.round(Math.cos(goog.math.toRadians(startAngle)), 7);
  var endCos = anychart.math.round(Math.cos(goog.math.toRadians(endAngle)), 7);

  var startQuadrant = this.getQuadrant_(startCos, startSin);
  var endQuadrant = this.getQuadrant_(endCos, endSin);

  var sides = [];

  if (startQuadrant == 1) {
    switch (endQuadrant) {
      case 1:
        if (startCos <= endCos) {
          sides.push({start: 180, end: 360});
        }
        break;
      case 3:
        sides.push({start: 180, end: endAngle});
        break;
      case 4:
        sides.push({start: 180, end: endAngle, isInFront: true});
        break;
    }
  } else if (startQuadrant == 2) {
    switch (endQuadrant) {
      case 1:
        sides.push({start: 180, end: 360, isInFront: true});
        break;
      case 2:
        if (startCos <= endCos) {
          sides.push({start: 180, end: 360, isInFront: true});
        }
        break;
      case 3:
        sides.push({start: 180, end: endAngle});
        break;
      case 4:
        sides.push({start: 180, end: endAngle, isInFront: true});
        break;
    }
  } else if (startQuadrant == 3) {
    switch (endQuadrant) {
      case 1:
      case 2:
        sides.push({start: startAngle, end: 360, isInFront: true});
        break;
      case 3:
        if (startCos >= endCos) {
          sides.push({start: startAngle, end: 360});
          sides.push({start: 180, end: endAngle});
        } else {
          sides.push({start: startAngle, end: endAngle});
        }
        break;
      case 4:
        sides.push({start: startAngle, end: endAngle, isInFront: true});
        break;
    }
  } else if (startQuadrant == 4) {
    switch (endQuadrant) {
      case 1:
      case 2:
        sides.push({start: startAngle, end: 360});
        break;
      case 3:
        sides.push({start: startAngle, end: 360});
        sides.push({start: 180, end: endAngle});
        break;
      case 4:
        if (startCos >= endCos) {
          sides.push({start: startAngle, end: 360});
          sides.push({start: 180, end: endAngle});
        } else {
          sides.push({start: startAngle, end: endAngle});
        }
        break;
    }
  }

  return sides;
};


/**
 * Draw front side.
 * @param {number} cx
 * @param {number} cy
 * @param {number} outerR
 * @param {number} startAngle
 * @param {number} endAngle
 * @param {number} sweep
 * @param {anychart.PointState|number} pointState
 * @param {boolean=} opt_update
 * @return {!acgraph.vector.Path}
 * @private
 */
anychart.pieModule.Chart.prototype.drawFrontSide_ = function(cx, cy, outerR, startAngle, endAngle, sweep, pointState, opt_update) {
  // there may be two front sides
  var uniqueValue = '' + startAngle;
  var pathName = 'frontPath' + uniqueValue;
  var path = this.createPath_(pathName, opt_update);

  var outerXR = outerR;
  var outerYR = this.get3DYRadius(outerR);

  var h = this.get3DHeight();

  if (endAngle < startAngle) endAngle += 360;

  if (Math.abs(sweep) == 360) {
    startAngle = 0;
    endAngle = 180;
  }

  var radStartAngle = goog.math.toRadians(startAngle);
  var radEndAngle = goog.math.toRadians(endAngle);

  var startX = cx + outerXR * +Math.cos(radStartAngle).toFixed(5);
  var startY = cy + outerYR * +Math.sin(radStartAngle).toFixed(5);

  var endX = cx + outerXR * +Math.cos(radEndAngle).toFixed(5);
  var endY = cy + outerYR * +Math.sin(radEndAngle).toFixed(5);

  path.moveTo(startX, startY);
  path.arcToByEndPoint(endX, endY, outerXR, outerYR, false, true);
  path.lineTo(endX, endY + h);
  path.arcToByEndPoint(startX, startY + h, outerXR, outerYR, false, false);
  path.lineTo(startX, startY);
  path.close();

  this.colorize3DPath_(pathName, pointState);
  return path;
};


/**
 * Draw back side.
 * @param {number} cx
 * @param {number} cy
 * @param {number} innerR
 * @param {number} startAngle
 * @param {number} endAngle
 * @param {number} sweep
 * @param {anychart.PointState|number} pointState
 * @param {boolean=} opt_update
 * @return {!acgraph.vector.Path}
 * @private
 */
anychart.pieModule.Chart.prototype.drawBackSide_ = function(cx, cy, innerR, startAngle, endAngle, sweep, pointState, opt_update) {
  // there may be two back sides
  var uniqueValue = '' + startAngle;
  var pathName = 'backPath' + uniqueValue;
  var path = this.createPath_(pathName, opt_update);

  var innerXR = innerR;
  var innerYR = this.get3DYRadius(innerR);

  var h = this.get3DHeight();

  if (endAngle < startAngle) endAngle += 360;

  if (Math.abs(sweep) == 360) {
    startAngle = 180;
    endAngle = 0;
  }

  var radStartAngle = goog.math.toRadians(startAngle);
  var radEndAngle = goog.math.toRadians(endAngle);

  var innerStartX = cx + innerXR * Math.cos(radStartAngle);
  var innerStartY = cy + innerYR * Math.sin(radStartAngle);

  var innerEndX = cx + innerXR * Math.cos(radEndAngle);
  var innerEndY = cy + innerYR * Math.sin(radEndAngle);

  path.moveTo(innerStartX, innerStartY);
  path.arcToByEndPoint(innerEndX, innerEndY, innerXR, innerYR, false, true);
  path.lineTo(innerEndX, innerEndY + h);
  path.arcToByEndPoint(innerStartX, innerStartY + h, innerXR, innerYR, false, false);
  path.lineTo(innerStartX, innerStartY);
  path.close();

  this.colorize3DPath_(pathName, pointState);
  return path;
};


/**
 * Draw simple (rect) side (start and end sides of pie).
 * @param {!string} pathName
 * @param {number} cx
 * @param {number} cy
 * @param {number} outerR
 * @param {number} innerR
 * @param {number} angle
 * @param {anychart.PointState|number} pointState
 * @param {boolean=} opt_update
 * @return {!acgraph.vector.Path}
 * @private
 */
anychart.pieModule.Chart.prototype.drawSimpleSide_ = function(pathName, cx, cy, outerR, innerR, angle, pointState, opt_update) {
  var outerXR = outerR;
  var outerYR = this.get3DYRadius(outerR);
  var innerXR = innerR;
  var innerYR = this.get3DYRadius(innerR);

  var radAngle = goog.math.toRadians(angle);

  var h = this.get3DHeight();
  var x1 = cx + innerXR * Math.cos(radAngle);
  var x2 = cx + outerXR * Math.cos(radAngle);
  var y1 = cy + innerYR * Math.sin(radAngle);
  var y2 = cy + outerYR * Math.sin(radAngle);

  var path = this.createPath_(pathName, opt_update);
  path.moveTo(x1, y1);
  path.lineTo(x2, y2);
  path.lineTo(x2, y2 + h);
  path.lineTo(x1, y1 + h);
  path.lineTo(x1, y1);
  path.close();

  this.colorize3DPath_(pathName, pointState);
  return path;
};


/**
 * Get center angle.
 * @param {number} startAngle
 * @param {number} endAngle
 * @return {number}
 * @private
 */
anychart.pieModule.Chart.prototype.getCenterAngle_ = function(startAngle, endAngle) {
  if (endAngle < startAngle) endAngle += 360;

  return (startAngle + endAngle) / 2;
};


/**
 * Draws outside label for a slice.
 * @private
 * @param {anychart.PointState|number} pointState Point state.
 * @param {boolean=} opt_updateConnector Whether to update connector or not.
 * @return {anychart.core.ui.CircularLabelsFactory.Label} Label.
 */
anychart.pieModule.Chart.prototype.drawOutsideLabel_ = function(pointState, opt_updateConnector) {
  var iterator = this.getIterator();

  var hovered = this.state.isStateContains(pointState, anychart.PointState.HOVER);

  var sliceLabel = iterator.get('normal');
  sliceLabel = goog.isDef(sliceLabel) ? sliceLabel['label'] : void 0;
  var hoverSliceLabel = iterator.get('hovered');
  hoverSliceLabel = goog.isDef(hoverSliceLabel) ? hoverSliceLabel['label'] : void 0;

  sliceLabel = anychart.utils.getFirstDefinedValue(sliceLabel, iterator.get('label'));
  hoverSliceLabel = hovered ? anychart.utils.getFirstDefinedValue(hoverSliceLabel, iterator.get('hoverLabel')) : null;

  var index = iterator.getIndex();

  var hoverLabels = this.hovered().labels();
  var labelsFactory = /** @type {anychart.core.ui.CircularLabelsFactory} */(hovered ? hoverLabels : null);

  var label = this.labels().getLabel(index);

  var labelEnabledState = sliceLabel && goog.isDef(sliceLabel['enabled']) ? sliceLabel['enabled'] : null;
  var labelHoverEnabledState = hoverSliceLabel && goog.isDef(hoverSliceLabel['enabled']) ? hoverSliceLabel['enabled'] : null;

  var isDraw = hovered ?
      goog.isNull(labelHoverEnabledState) ?
          goog.isNull(hoverLabels.enabled()) ?
              goog.isNull(labelEnabledState) ?
                  (label && goog.isDef(label.enabled())) ?
                      label.enabled() :
                      this.labels().enabled() :
                  labelEnabledState :
              hoverLabels.enabled() :
          labelHoverEnabledState :
      goog.isNull(labelEnabledState) ?
          (label && goog.isDef(label.enabled())) ?
              label.enabled() :
              this.labels().enabled() :
          labelEnabledState;

  var enabled;
  var wasNoLabel;
  var anchor;
  var formatProvider = this.createFormatProvider();
  var positionProvider = this.createPositionProvider();
  if (isDraw) {
    if (wasNoLabel = !label) {
      label = this.labels().add(formatProvider, positionProvider, index);
    }

    // save enabled setting for label
    enabled = label.enabled();

    label.resetSettings();
    label.currentLabelsFactory(labelsFactory);
    label.setSettings(/** @type {Object} */(sliceLabel), /** @type {Object} */(hoverSliceLabel));
    label.enabled(/** @type {boolean} */(enabled));

    anchor = iterator.meta('anchor');
    if (goog.isDef(anchor))
      label['anchor'](/** @type {string} */(anchor));

    if (!wasNoLabel)
      label.draw();

  } else if (label) {
    enabled = label.enabled();
    label.clear();
    label.enabled(/** @type {boolean} */(enabled));
  } else {
    label = this.labels().add(formatProvider, positionProvider, index);
    anchor = iterator.meta('anchor');
    if (goog.isDef(anchor))
      label['anchor'](/** @type {string} */(anchor));
    label.enabled(false);
  }
  if (opt_updateConnector)
    this.updateConnector_(/** @type {anychart.core.ui.CircularLabelsFactory.Label}*/(label), isDraw);
  return /** @type {anychart.core.ui.CircularLabelsFactory.Label}*/(label);
};


/**
 * Draws label for a slice.
 * @private
 * @param {anychart.PointState|number} pointState Point state.
 * @param {boolean=} opt_updateConnector Whether to update connector or not. Used only with outside labels.
 * @return {anychart.core.ui.CircularLabelsFactory.Label} Label.
 */
anychart.pieModule.Chart.prototype.drawLabel_ = function(pointState, opt_updateConnector) {
  if (this.isOutsideLabels())
    return this.drawOutsideLabel_(pointState, opt_updateConnector);

  var hovered = this.state.isStateContains(pointState, anychart.PointState.HOVER);

  var iterator = this.getIterator();

  var sliceLabel = iterator.get('normal');
  sliceLabel = goog.isDef(sliceLabel) ? sliceLabel['label'] : void 0;
  var hoverSliceLabel = iterator.get('hovered');
  hoverSliceLabel = goog.isDef(hoverSliceLabel) ? hoverSliceLabel['label'] : void 0;

  sliceLabel = anychart.utils.getFirstDefinedValue(sliceLabel, iterator.get('label'));
  hoverSliceLabel = hovered ? anychart.utils.getFirstDefinedValue(hoverSliceLabel, iterator.get('hoverLabel')) : null;

  var index = iterator.getIndex();
  var hoverLabels = this.hovered().labels();
  var labelsFactory = /** @type {anychart.core.ui.CircularLabelsFactory} */(hovered ? hoverLabels : null);

  var label = this.labels().getLabel(index);

  var labelEnabledState = sliceLabel && goog.isDef(sliceLabel['enabled']) ? sliceLabel['enabled'] : null;
  var labelHoverEnabledState = hoverSliceLabel && goog.isDef(hoverSliceLabel['enabled']) ? hoverSliceLabel['enabled'] : null;

  var positionProvider = this.createPositionProvider();
  var formatProvider = this.createFormatProvider(true);

  var mode3d = /** @type {boolean} */ (this.getOption('mode3d'));
  var isFitToSlice = true;
  if ((!hovered || (hovered && !this.getOption('forceHoverLabels'))) && this.getOption('overlapMode') != anychart.enums.LabelsOverlapMode.ALLOW_OVERLAP) {
    var start = /** @type {number} */ (iterator.meta('start'));
    var sweep = /** @type {number} */ (iterator.meta('sweep'));

    var cx = this.cx_;
    var cy = this.cy_;

    var angle;
    var exploded = !!iterator.meta('exploded') && !(iterator.getRowsCount() == 1);
    if (exploded) {
      angle = (start + sweep / 2) * Math.PI / 180;
      var ex = this.explodeValue_ * Math.cos(angle);
      var ey = (mode3d ? this.get3DYRadius(this.explodeValue_) : this.explodeValue_) * Math.sin(angle);
      cx += ex;
      cy += ey;
    }

    angle = start * Math.PI / 180;
    var ax = cx + this.radiusValue_ * Math.cos(angle);
    var ay = cy + (mode3d ? this.get3DYRadius(this.radiusValue_) : this.radiusValue_) * Math.sin(angle);

    angle = (start + sweep) * Math.PI / 180;
    var bx = cx + this.radiusValue_ * Math.cos(angle);
    var by = cy + (mode3d ? this.get3DYRadius(this.radiusValue_) : this.radiusValue_) * Math.sin(angle);

    if (!this.measureLabel_) {
      this.measureLabel_ = new anychart.core.ui.CircularLabelsFactory.Label();
    } else {
      this.measureLabel_.clear();
    }
    this.measureLabel_.formatProvider(formatProvider);
    this.measureLabel_.positionProvider(positionProvider);
    this.measureLabel_.resetSettings();
    this.measureLabel_.parentLabelsFactory(this.labels());
    this.measureLabel_.currentLabelsFactory(labelsFactory);
    this.measureLabel_.setSettings(/** @type {Object} */(sliceLabel), /** @type {Object} */(hoverSliceLabel));

    var bounds = this.labels().measureWithTransform(this.measureLabel_, null, null, index);

    var singlePiePoint = ((iterator.getRowsCount() == 1 || sweep == 360) && !this.innerRadiusValue_);
    var notIntersectStartLine = singlePiePoint || !anychart.math.checkRectIntersectionWithSegment(ax, ay, cx, cy, bounds);
    var notIntersectEndLine = singlePiePoint || !anychart.math.checkRectIntersectionWithSegment(cx, cy, bx, by, bounds);
    var notIntersectPieOuterRadius = !anychart.math.checkForRectIsOutOfCircleBounds(cx, cy, this.radiusValue_, bounds);
    var notIntersectPieInnerRadius = singlePiePoint || anychart.math.checkForRectIsOutOfCircleBounds(cx, cy, this.innerRadiusValue_, bounds);

    isFitToSlice = notIntersectStartLine && notIntersectEndLine && notIntersectPieOuterRadius && notIntersectPieInnerRadius;
  }

  var isDraw = hovered ?
      goog.isNull(labelHoverEnabledState) ?
          goog.isNull(hoverLabels.enabled()) ?
              goog.isNull(labelEnabledState) ?
                  this.labels().enabled() :
                  labelEnabledState :
              hoverLabels.enabled() :
          labelHoverEnabledState :
      goog.isNull(labelEnabledState) ?
          this.labels().enabled() :
          labelEnabledState;

  if (isDraw && isFitToSlice) {
    if (label) {
      label.formatProvider(formatProvider);
      label.positionProvider(positionProvider);
    } else {
      label = this.labels().add(formatProvider, positionProvider, index);
    }

    label.resetSettings();
    label.currentLabelsFactory(labelsFactory);
    label.setSettings(/** @type {Object} */(sliceLabel), /** @type {Object} */(hoverSliceLabel));

    //todo: this shit should be reworked when labelsFactory will be reworked
    //if usual label isn't disabled and not drawn then it doesn't have container and hover label doesn't know nothing
    //about its DOM element and trying to apply itself setting to it. But nothing will happen because container is empty.
    if (hovered && !label.container() && this.labels().getDomElement()) {
      label.container(this.labels().getDomElement());
      if (!label.container().parent()) {
        label.container().parent(/** @type {acgraph.vector.ILayer} */(this.labels().container()));
      }
    }
  } else if (label) {
    this.labels().clear(label.getIndex());
  }
  return /** @type {anychart.core.ui.CircularLabelsFactory.Label}*/(label);
};


/**
 * Colorizes shape in accordance to current slice colorization settings.
 * Shape is get from current meta 'shape'.
 * @param {anychart.PointState|number} pointState Point state.
 * @protected
 */
anychart.pieModule.Chart.prototype.colorizeSlice = function(pointState) {
  if (this.getOption('mode3d')) {
    this.colorize3DSlice_(pointState);

  } else {
    var slice = /** @type {acgraph.vector.Path} */ (this.getIterator().meta('slice'));
    if (goog.isDef(slice)) {
      var fillResolver = anychart.pieModule.Chart.getColorResolver('fill', anychart.enums.ColorType.FILL, true);
      var fillColor = fillResolver(this, pointState, false, true);
      if (this.isRadialGradientMode_(fillColor) && goog.isNull(fillColor.mode)) {
        //fillColor = /** @type {!acgraph.vector.Fill} */(goog.object.clone(/** @type {Object} */(fillColor)));
        fillColor.mode = this.pieBounds_ ? this.pieBounds_ : null;
      }
      slice.fill(fillColor);

      var strokeResolver = anychart.pieModule.Chart.getColorResolver('stroke', anychart.enums.ColorType.STROKE, true);
      var strokeColor = strokeResolver(this, pointState, false, true);
      if (this.isRadialGradientMode_(strokeColor) && goog.isNull(strokeColor.mode)) {
        strokeColor.mode = this.pieBounds_ ? this.pieBounds_ : null;
      }
      slice.stroke(strokeColor);

      this.applyHatchFill(pointState);
    }
  }
};


/**
 * Apply hatch fill to shape in accordance to current point colorization settings.
 * Shape is get from current meta 'hatchFillShape'.
 * @param {(anychart.PointState|number)} pointState Point state.
 * @param {string=} opt_pathName
 * @protected
 */
anychart.pieModule.Chart.prototype.applyHatchFill = function(pointState, opt_pathName) {
  var hatchSlice = /** @type {acgraph.vector.Path} */(this.getIterator().meta(opt_pathName || 'hatchSlice'));
  if (goog.isDefAndNotNull(hatchSlice)) {
    var hatchFillResolver = anychart.pieModule.Chart.getColorResolver('hatchFill', anychart.enums.ColorType.HATCH_FILL, true);
    var hatchFill = hatchFillResolver(this, pointState, false);
    hatchSlice
        .stroke(null)
        .fill(hatchFill);
  }
};


/**
 * Internal data invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.pieModule.Chart.prototype.dataInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.DATA_CHANGED)) {
    this.invalidate(
        anychart.ConsistencyState.PIE_LABELS |
        anychart.ConsistencyState.APPEARANCE |
        anychart.ConsistencyState.CHART_LEGEND |
        anychart.ConsistencyState.A11Y |
        anychart.ConsistencyState.PIE_DATA |
        anychart.ConsistencyState.CHART_LABELS,
        anychart.Signal.NEEDS_REDRAW |
        anychart.Signal.DATA_CHANGED
    );

  }
};


/**
 * Internal label invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.pieModule.Chart.prototype.labelsInvalidated_ = function(event) {
  var state = 0, signal = 0;
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    state |= anychart.ConsistencyState.PIE_LABELS;
    signal |= anychart.Signal.NEEDS_REDRAW;
  }

  if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    state |= anychart.ConsistencyState.BOUNDS | anychart.ConsistencyState.PIE_LABELS;
    signal |= anychart.Signal.BOUNDS_CHANGED | anychart.Signal.NEEDS_REDRAW;
  }

  this.invalidate(state, signal);
};


/**
 * Internal palette invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.pieModule.Chart.prototype.paletteInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.CHART_LEGEND, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Explode or implode pie slice.
 * @protected
 * @param {boolean=} opt_explode Explode value to set.
 */
anychart.pieModule.Chart.prototype.clickSlice = function(opt_explode) {
  var iterator = this.getIterator();
  // if only 1 point in Pie was drawn - forbid to explode it
  if (iterator.getRowsCount() == 1 || iterator.meta('sweep') == 360)
    return;
  if (goog.isDef(opt_explode)) {
    iterator.meta('exploded', opt_explode);
  } else {
    var exploded = iterator.meta('exploded');
    iterator.meta('exploded', !exploded);
  }

  var start = /** @type {number} */ (iterator.meta('start'));
  var sweep = /** @type {number} */ (iterator.meta('sweep'));
  // if no information about slice in meta (e.g. no slice has drawn: call explodeSlice(_, _) before chart.draw()).
  if (!goog.isDef(start) || !goog.isDef(sweep) || !sweep) return;

  var index = iterator.getIndex();
  if (this.getOption('mode3d')) {
    this.draw3DSlices_(index, true);
  } else {
    this.drawSlice_(true);
  }
  if (this.isOutsideLabels()) {
    this.labels().suspendSignalsDispatching();
    this.labels().clear();
    this.calculateOutsideLabels();
    this.labels().draw();
    this.labels().resumeSignalsDispatching(true);
    iterator.select(index);
  }
  // for support users pointClick changes
  var pointState = this.state.seriesState | this.state.getPointStateByIndex(iterator.getIndex());
  var hovered = this.state.isStateContains(pointState, anychart.PointState.HOVER);
  this.drawLabel_(pointState, hovered);
  this.labels().draw();
};


/**
 * @return {boolean} Define, is labels have outside position.
 */
anychart.pieModule.Chart.prototype.isOutsideLabels = function() {
  return anychart.enums.normalizeSidePosition(this.labels().getOption('position')) == anychart.enums.SidePosition.OUTSIDE;
};


/** @inheritDoc */
anychart.pieModule.Chart.prototype.getSeriesStatus = function(event) {
  //todo (blackart) coming soon.
  //var bounds = anychart.math.rect(0, 0, 0, 0);
  //var clientX = event['clientX'];
  //var clientY = event['clientY'];
  //
  //var value, index, iterator;
  //
  //var containerOffset = this.container().getStage().getClientPosition();
  //
  //var x = clientX - containerOffset.x;
  //var y = clientY - containerOffset.y;
  //
  //var minX = bounds.left;
  //var minY = bounds.top;
  //var rangeX = bounds.width;
  //var rangeY = bounds.height;
  //
  //if (x < minX || x > minX + rangeX || y < minY || y > minY + rangeY)
  //  return null;
  //
  // var points = [];
  // var interactivity = this.interactivity();
  //
  // if (interactivity.hoverMode() == anychart.enums.HoverMode.BY_SPOT) {
  //
  // } else if (this.interactivity().hoverMode() == anychart.enums.HoverMode.BY_X) {
  //
  // }
  //
  // return points;
  return [];
};


/** @inheritDoc */
anychart.pieModule.Chart.prototype.makeBrowserEvent = function(e) {
  var res = {
    'type': e['type'],
    'target': this,
    'relatedTarget': this.getOwnerElement(e['relatedTarget']) || e['relatedTarget'],
    'domTarget': e['target'],
    'relatedDomTarget': e['relatedTarget'],
    'offsetX': e['offsetX'],
    'offsetY': e['offsetY'],
    'clientX': e['clientX'],
    'clientY': e['clientY'],
    'screenX': e['screenX'],
    'screenY': e['screenY'],
    'button': e['button'],
    'keyCode': e['keyCode'],
    'charCode': e['charCode'],
    'ctrlKey': e['ctrlKey'],
    'altKey': e['altKey'],
    'shiftKey': e['shiftKey'],
    'metaKey': e['metaKey'],
    'platformModifierKey': e['platformModifierKey'],
    'state': e['state']
  };

  var tag = anychart.utils.extractTag(res['domTarget']);
  var pointIndex = tag.index;
  // fix for domTarget == layer (mouseDown on label + mouseUp on path = click on layer)
  if (!goog.isDef(pointIndex) && this.state.hasPointState(anychart.PointState.HOVER)) {
    var hoveredPointsIndex = this.state.getIndexByPointState(anychart.PointState.HOVER);
    if (hoveredPointsIndex.length) {
      pointIndex = hoveredPointsIndex[0];
    }
  }

  pointIndex = anychart.utils.toNumber(pointIndex);
  if (!isNaN(pointIndex)) {
    res['pointIndex'] = res['sliceIndex'] = pointIndex;
  }
  return res;
};


/**
 * Mouse click internal handler.
 * @param {anychart.core.MouseEvent} event Event object.
 */
anychart.pieModule.Chart.prototype.handleMouseDown = function(event) {
  var evt = this.makePointEvent(event);
  if (!evt) return;

  var index = evt['pointIndex'];
  if (this.dispatchEvent(evt) && this.getIterator().select(index)) {
    this.selectPoint(index);
    var seriesStatus = {
      series: this,
      points: [index],
      nearestPointToCursor: {index: index, distance: 0}
    };
    var selectedPointEvent = this.makeInteractivityPointEvent('selected', event, [seriesStatus]);
    selectedPointEvent['currentPoint']['selected'] = !!this.getIterator().meta('exploded');
    this.dispatchEvent(selectedPointEvent);
  }
};


/** @inheritDoc */
anychart.pieModule.Chart.prototype.handleMouseEvent = function(event) {
  var evt = this.makePointEvent(event);
  if (evt)
    this.dispatchEvent(evt);
};


/**
 * This method also has a side effect - it patches the original source event to maintain pointIndex support for
 * browser events.
 * @param {anychart.core.MouseEvent} event
 * @return {Object} An object of event to dispatch. If null - unrecognized type was found.
 */
anychart.pieModule.Chart.prototype.makePointEvent = function(event) {
  var pointIndex;
  if ('pointIndex' in event) {
    pointIndex = event['pointIndex'];
  } else if ('labelIndex' in event) {
    pointIndex = event['labelIndex'];
  } else if ('markerIndex' in event) {
    pointIndex = event['markerIndex'];
  }
  pointIndex = anychart.utils.toNumber(pointIndex);
  if (isNaN(pointIndex)) return null;

  event['pointIndex'] = pointIndex;

  var type = event['type'];
  switch (type) {
    case acgraph.events.EventType.MOUSEOUT:
      type = anychart.enums.EventType.POINT_MOUSE_OUT;
      break;
    case acgraph.events.EventType.MOUSEOVER:
      type = anychart.enums.EventType.POINT_MOUSE_OVER;
      break;
    case acgraph.events.EventType.MOUSEMOVE:
      type = anychart.enums.EventType.POINT_MOUSE_MOVE;
      break;
    case acgraph.events.EventType.MOUSEDOWN:
      type = anychart.enums.EventType.POINT_MOUSE_DOWN;
      break;
    case acgraph.events.EventType.MOUSEUP:
      type = anychart.enums.EventType.POINT_MOUSE_UP;
      break;
    case acgraph.events.EventType.CLICK:
      type = anychart.enums.EventType.POINT_CLICK;
      break;
    case acgraph.events.EventType.DBLCLICK:
      type = anychart.enums.EventType.POINT_DBLCLICK;
      break;
    default:
      return null;
  }

  var iter = this.data().getIterator();
  if (!iter.select(pointIndex))
    iter.reset();

  return {
    'type': type,
    'actualTarget': event['target'],
    'pie': this,
    'iterator': iter,
    'sliceIndex': pointIndex,
    'pointIndex': pointIndex,
    'target': this,
    'originalEvent': event,
    'point': this.getPoint(pointIndex)
  };
};


/** @inheritDoc */
anychart.pieModule.Chart.prototype.getPoint = function(index) {
  var point = new anychart.pieModule.Point(this, index);
  var iter = this.getIterator();
  var value;
  if (iter.select(index) &&
      point.exists() && !this.isMissing_(value = /** @type {number} */(point.get('value')))) {

    var val = value / /** @type {number} */(this.getStat(anychart.enums.Statistics.SUM)) * 100;
    point.statistics(anychart.enums.Statistics.PERCENT_VALUE, val);
    point.statistics(anychart.enums.Statistics.Y_PERCENT_OF_TOTAL, val);
  }

  return point;
};


/** @inheritDoc */
anychart.pieModule.Chart.prototype.createLegendItemsProvider = function(sourceMode, itemsFormat) {
  /**
   * @type {!Array.<anychart.core.ui.Legend.LegendItemProvider>}
   */
  var data = [];
  var iterator = this.getIterator().reset();
  var index;
  var isAqua = (this.normal_.getOption('fill') == 'aquastyle');
  if (isAqua) {
    /** @type {Object} */
    var aquaStyleObj = this.aquaStyleObj_;
    this.aquaStyleObj_ = {};
  }
  while (iterator.advance()) {
    index = iterator.getIndex();
    var legendItem = /** @type {Object} */ (iterator.get('legendItem') || {});
    var itemText = null;
    if (goog.isFunction(itemsFormat)) {
      var format = this.createFormatProvider();
      itemText = itemsFormat.call(format, format);
      if (goog.isNumber(itemText))
        itemText = String(itemText);
    }
    if (!goog.isString(itemText)) {
      var isGrouped = !!iterator.meta('groupedPoint');
      if (isGrouped)
        itemText = 'Other points';
      else
        itemText = String(goog.isDef(iterator.get('name')) ? iterator.get('name') : iterator.get('x'));
    }
    var mode3d = this.getOption('mode3d');

    var fillResolver = anychart.pieModule.Chart.getColorResolver('fill', anychart.enums.ColorType.FILL, false);
    var strokeResolver = anychart.pieModule.Chart.getColorResolver('stroke', anychart.enums.ColorType.STROKE, false);
    var hatchFillResolver = anychart.pieModule.Chart.getColorResolver('hatchFill', anychart.enums.ColorType.HATCH_FILL, false);

    var obj = {
      'enabled': true,
      'meta': {
        'pointIndex': index,
        'pointValue': iterator.get('value')
      },
      'iconType': anychart.enums.LegendItemIconType.SQUARE,
      'text': itemText,
      'iconStroke': mode3d ? this.get3DStrokeColor() : /** @type {acgraph.vector.Stroke} */ (strokeResolver(this, anychart.PointState.NORMAL, false)),
      'iconFill': mode3d ? this.get3DFillColor_(anychart.PointState.NORMAL) : /** @type {acgraph.vector.Fill} */ (fillResolver(this, anychart.PointState.NORMAL, false)),
      'iconHatchFill': /** @type {acgraph.vector.HatchFill} */ (hatchFillResolver(this, anychart.PointState.NORMAL, false))
    };
    goog.object.extend(obj, legendItem);
    obj['sourceUid'] = goog.getUid(this);
    obj['sourceKey'] = index;
    data.push(obj);
  }
  if (isAqua)
    this.aquaStyleObj_ = aquaStyleObj;
  return data;
};


/** @inheritDoc */
anychart.pieModule.Chart.prototype.legendItemCanInteractInMode = function(mode) {
  return true;
};


/** @inheritDoc */
anychart.pieModule.Chart.prototype.legendItemClick = function(item, event) {
  var sourceKey = item.sourceKey();
  var iterator = this.data().getIterator();
  if (iterator.select(/** @type {number} */ (sourceKey))) {
    var isExploded = !!iterator.meta('exploded');
    this.explodeSlice(/** @type {number} */ (sourceKey), !isExploded);
  }
};


/** @inheritDoc */
anychart.pieModule.Chart.prototype.legendItemOver = function(item, event) {
  var sourceKey = item.sourceKey();
  if (item && !goog.isDefAndNotNull(sourceKey) && !isNaN(sourceKey))
    return;

  var tag = anychart.utils.extractTag(event['domTarget']);
  if (tag)
    tag.series = this;
};


/** @inheritDoc */
anychart.pieModule.Chart.prototype.legendItemOut = function(item, event) {
  var sourceKey = item.sourceKey();

  if (item && !goog.isDefAndNotNull(sourceKey) && !isNaN(sourceKey))
    return;

  var tag = anychart.utils.extractTag(event['domTarget']);
  if (tag)
    tag.series = this;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Hover.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * If index is passed, hovers a point of the series by its index, else hovers all points of the series.
 * @param {(number|Array<number>)=} opt_indexOrIndexes Point index or array of indexes.
 * @return {!anychart.pieModule.Chart}  {@link anychart.pieModule.Chart} instance for method chaining.
 */
anychart.pieModule.Chart.prototype.hover = function(opt_indexOrIndexes) {
  if (goog.isDef(opt_indexOrIndexes))
    this.hoverPoint(opt_indexOrIndexes);
  else
    this.hoverSeries();

  return this;
};


/** @inheritDoc */
anychart.pieModule.Chart.prototype.unhover = function(opt_indexOrIndexes) {
  if (!(this.state.hasPointState(anychart.PointState.HOVER) ||
      this.state.isStateContains(this.state.getSeriesState(), anychart.PointState.HOVER)) || !this.enabled())
    return;

  var index;
  if (goog.isDef(opt_indexOrIndexes))
    index = opt_indexOrIndexes;
  else
    index = (this.state.seriesState == anychart.PointState.NORMAL ? NaN : undefined);
  this.state.removePointState(anychart.PointState.HOVER, index);

  this.hideTooltip();
};


/**
 * Hovers a point of the series by its index.
 * @param {number|Array<number>} index Index of the point to hover.
 * @param {anychart.core.MouseEvent=} opt_event Event that initiate point hovering.<br/>
 *    <b>Note:</b> Used only to display float tooltip.
 * @return {!anychart.pieModule.Chart}  {@link anychart.pieModule.Chart} instance for method chaining.
 */
anychart.pieModule.Chart.prototype.hoverPoint = function(index, opt_event) {
  if (!this.enabled())
    return this;

  if (goog.isArray(index)) {
    var hoveredPoints = this.state.getIndexByPointState(anychart.PointState.HOVER);
    for (var i = 0; i < hoveredPoints.length; i++) {
      if (!goog.array.contains(index, hoveredPoints[i])) {
        this.state.removePointState(anychart.PointState.HOVER, hoveredPoints[i]);
      }
    }
    this.state.addPointState(anychart.PointState.HOVER, index);
    if (goog.isDef(opt_event))
      this.showTooltip(opt_event);

  } else if (goog.isNumber(index)) {
    this.unhover();
    this.state.addPointState(anychart.PointState.HOVER, index);
    if (goog.isDef(opt_event))
      this.showTooltip(opt_event);
  }
  return this;
};


/**
 * Hovers all points of the series. Use <b>unhover</b> method for unhover series.
 * @return {!anychart.pieModule.Chart} An instance of the {@link anychart.pieModule.Chart} class for method chaining.
 */
anychart.pieModule.Chart.prototype.hoverSeries = function() {
  if (!this.enabled())
    return this;

  this.state.setPointState(anychart.PointState.HOVER);

  return this;
};


/**
 * Selects a point of the chart by its index.
 * @param {(number|Array.<number>)=} opt_indexOrIndexes Index or array of indexes of the point to select.
 * @return {!anychart.pieModule.Chart} {@link anychart.pieModule.Chart} instance for method chaining.
 */
/*TODO(AntonKagakin): Do not remove. For future interactivity improvement.
anychart.pieModule.Chart.prototype.select = function(opt_indexOrIndexes) {
  if (!this.enabled())
    return this;

  if (goog.isDef(opt_indexOrIndexes))
    this.selectPoint(opt_indexOrIndexes);
  else
    this.selectSeries();

  return this;
};*/


/**
 * Selects all points of the chart. Use <b>unselect</b> method to unselect them.
 * @return {!anychart.pieModule.Chart} An instance of the {@link anychart.pieModule.Chart} class for method chaining.
 */
/*TODO(AntonKagakin): Do not remove. For future interactivity improvement.
anychart.pieModule.Chart.prototype.selectSeries = function() {
  if (!this.enabled())
    return this;

  //hide tooltip in any case
  this.hideTooltip();

  this.state.setPointState(anychart.PointState.SELECT);

  return this;
};*/


/**
 * Select a point of the series by its index.
 * @param {number|Array<number>} indexOrIndexes Index of the point to hover.
 * @return {!anychart.pieModule.Chart}  {@link anychart.pieModule.Chart} instance for method chaining.
 */
anychart.pieModule.Chart.prototype.selectPoint = function(indexOrIndexes) {
  if (!this.enabled())
    return this;

  var iterator = this.getIterator();
  // for float tooltip and exploded checking
  this.getIterator().select(indexOrIndexes[0] || indexOrIndexes);

  if (!iterator.meta('exploded')) {
    this.state.addPointState(anychart.PointState.SELECT, indexOrIndexes);
  } else {
    this.state.removePointState(anychart.PointState.SELECT, indexOrIndexes);
  }

  this.clickSlice();

  return this;
};


/** @inheritDoc */
/*TODO(AntonKagakin): Do not remove. For future interactivity improvement.
anychart.pieModule.Chart.prototype.unselect = function(opt_indexOrIndexes) {
  if (!this.enabled())
    return;

  var index;
  if (goog.isDef(opt_indexOrIndexes))
    index = opt_indexOrIndexes;
  else
    index = (this.state.seriesState == anychart.PointState.NORMAL ? NaN : undefined);
  this.state.removePointState(anychart.PointState.SELECT, index);

  //---------------------------------------------------------------------
  var iterator = this.getIterator();
  iterator.reset();
  while (iterator.advance()) {
    this.drawLabel_(this.state.getPointStateByIndex(iterator.getIndex()));
  }
};*/


//----------------------------------------------------------------------------------------------------------------------
//
//  Interactivity section (Apply appearance).
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Apply appearance to point.
 * @param {anychart.PointState|number} pointState
 */
anychart.pieModule.Chart.prototype.applyAppearanceToPoint = function(pointState) {
  this.colorizeSlice(pointState);
  this.drawLabel_(pointState, true);
};


/**
 * Finalization point appearance. For drawing labels and markers.
 */
anychart.pieModule.Chart.prototype.finalizePointAppearance = function() {
  this.labels().draw();
};


/**
 * Apply appearance to series.
 * @param {anychart.PointState|number} pointState .
 */
anychart.pieModule.Chart.prototype.applyAppearanceToSeries = function(pointState) {
  this.colorizeSlice(pointState);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Tooltip.
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.pieModule.Chart.prototype.createTooltip = function() {
  var tooltip = new anychart.core.ui.Tooltip(0);
  this.registerDisposable(tooltip);
  tooltip.chart(this);
  tooltip.listenSignals(this.onTooltipSignal_, this);
  return tooltip;
};


/**
 * Tooltip invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.pieModule.Chart.prototype.onTooltipSignal_ = function(event) {
  var tooltip = /** @type {anychart.core.ui.Tooltip} */(this.tooltip());
  tooltip.draw();
};


/**
 * @param {anychart.core.MouseEvent=} opt_event initiates tooltip show.
 * @protected
 */
anychart.pieModule.Chart.prototype.showTooltip = function(opt_event) {
  if (opt_event && opt_event['target'] == this.legend()) {
    return;
  }
  var tooltip = /** @type {anychart.core.ui.Tooltip} */(this.tooltip());
  var formatProvider = this.createFormatProvider();
  if (opt_event) {
    tooltip.suspendSignalsDispatching();
    tooltip.showFloat(opt_event['clientX'], opt_event['clientY'], formatProvider);
    tooltip.resumeSignalsDispatching(false);
    this.listen(goog.labs.userAgent.device.isDesktop() ?
        goog.events.EventType.MOUSEMOVE : goog.events.EventType.TOUCHSTART, this.showTooltip);
  }
  // if (tooltip.isFloating() && opt_event) {
  //   tooltip.show(
  //       formatProvider,
  //       new goog.math.Coordinate(opt_event['clientX'], opt_event['clientY']));
  //
  //   // for float
  //   this.listen(goog.events.EventType.MOUSEMOVE, this.showTooltip);
  //
  // } else {
  //   tooltip.show(
  //       formatProvider,
  //       new goog.math.Coordinate(0, 0));
  // }
};


/**
 * Hide data point tooltip.
 * @protected
 */
anychart.pieModule.Chart.prototype.hideTooltip = function() {
  var tooltip = /** @type {anychart.core.ui.Tooltip} */(this.tooltip());
  this.unlisten(goog.labs.userAgent.device.isDesktop() ?
      goog.events.EventType.MOUSEMOVE : goog.events.EventType.TOUCHSTART, this.showTooltip);
  tooltip.hide();
};


/**
 * @inheritDoc
 */
anychart.pieModule.Chart.prototype.calculate = function() {
  if (this.hasInvalidationState(anychart.ConsistencyState.PIE_DATA)) {
    this.resetStatistics();

    var iterator = this.data().getIterator();
    var value;
    var missingPoints = 0;
    var min = Number.MAX_VALUE;
    var max = -Number.MAX_VALUE;
    var sum = 0;
    while (iterator.advance()) {
      value = /** @type {number|string|null|undefined} */ (iterator.get('value'));
      // if missing
      if (this.isMissing_(value)) {
        missingPoints++;
        continue;
      }
      value = +value;
      min = Math.min(value, min);
      max = Math.max(value, max);
      sum += value;
    }

    var count = iterator.getRowsCount() - missingPoints; // do not count missing points
    var avg;
    if (!count) min = max = sum = avg = undefined;
    else avg = sum / count;
    this.statistics(anychart.enums.Statistics.COUNT, count);
    this.statistics(anychart.enums.Statistics.MIN, min);
    this.statistics(anychart.enums.Statistics.MAX, max);
    this.statistics(anychart.enums.Statistics.SUM, sum);
    this.statistics(anychart.enums.Statistics.AVERAGE, avg);

    this.markConsistent(anychart.ConsistencyState.PIE_DATA);
  }
};


/**
 * Create pie label format provider.
 * @param {boolean=} opt_force create context provider forcibly.
 * @return {Object} Object with info for labels formatting.
 * @protected
 */
anychart.pieModule.Chart.prototype.createFormatProvider = function(opt_force) {
  var iterator = this.getIterator();

  if (!this.pointProvider_ || opt_force)
    this.pointProvider_ = new anychart.format.Context();

  this.pointProvider_
      .dataSource(iterator)
      .statisticsSources([this.getPoint(iterator.getIndex()), this]);

  var values = { //TODO (A.Kudryavtsev): Check types!!!
    'x': {value: iterator.get('x'), type: anychart.enums.TokenType.STRING},
    'value': {value: iterator.get('value'), type: anychart.enums.TokenType.NUMBER},
    'name': {value: iterator.get('name'), type: anychart.enums.TokenType.STRING},
    'index': {value: iterator.getIndex(), type: anychart.enums.TokenType.NUMBER},
    'chart': {value: this, type: anychart.enums.TokenType.UNKNOWN}
  };

  if (iterator.meta('groupedPoint')) {
    values['name'] = {value: 'Other points', type: anychart.enums.TokenType.STRING};
    values['groupedPoint'] = {value: true, type: anychart.enums.TokenType.STRING};
    values['names'] = {value: iterator.meta('names'), type: anychart.enums.TokenType.UNKNOWN};
    values['values'] = {value: iterator.meta('values'), type: anychart.enums.TokenType.UNKNOWN};
  }

  return this.pointProvider_.propagate(values);
};


/**
 * Creates tooltip format provider.
 * @return {Object}
 */
anychart.pieModule.Chart.prototype.createTooltipContextProvider = function() {
  return this.createFormatProvider();
};


/**
 *
 * @param {anychart.core.ui.CircularLabelsFactory.Label} label .
 * @return {anychart.math.Rect}
 */
anychart.pieModule.Chart.prototype.getLabelBounds = function(label) {
  if (!this.labelsBoundsCache_) this.labelsBoundsCache_ = [];
  var index = label.getIndex();
  if (!this.labelsBoundsCache_[index])
    this.labelsBoundsCache_[index] = anychart.math.Rect.fromCoordinateBox(this.labels().measureWithTransform(label));

  return this.labelsBoundsCache_[index];
};


/**
 * Drop label bounds cache.
 * @param {anychart.core.ui.CircularLabelsFactory.Label} label Label to drop bounds.
 */
anychart.pieModule.Chart.prototype.dropLabelBoundsCache = function(label) {
  var index = label.getIndex();
  if (this.labelsBoundsCache_) {
    this.labelsBoundsCache_[index] = null;
  }
};


/**
 * Defragmentation domain. If domain have critical angle then need defragment domain.
 * @param {!anychart.pieModule.Chart.PieOutsideLabelsDomain} domain Domain to defragmentation.
 */
anychart.pieModule.Chart.prototype.domainDefragmentation = function(domain) {
  var labels = domain.labels;
  var sourcePieLabelsDomains = domain.pieLabelsDomains;
  var i, len, label, bounds;
  var prevDomain = sourcePieLabelsDomains[sourcePieLabelsDomains.length - 1];

  if (prevDomain == domain) return;

  var tmpDomain = null;
  var tmpLabels = labels.slice();
  var domainsLength = sourcePieLabelsDomains.length;
  var domainExpanded = false;

  for (i = 0, len = labels.length; i < len; i++) {
    label = labels[i];
    if (label) {
      bounds = this.getLabelBounds(label);

      if (!prevDomain || prevDomain.isNotIntersect(bounds)) {

        if (!tmpDomain || tmpDomain.isNotIntersect(bounds)) {
          if (tmpDomain) {
            sourcePieLabelsDomains.push(tmpDomain);
            prevDomain = tmpDomain;
          }
          var isRightSide = label['anchor']() == anychart.enums.Anchor.LEFT_CENTER;
          tmpDomain = new anychart.pieModule.Chart.PieOutsideLabelsDomain(isRightSide, this, sourcePieLabelsDomains);
          tmpDomain.softAddLabel(label);
        } else {
          tmpDomain.softAddLabel(label);

          if (this.isCriticalAngle) {
            label.enabled(false);
            if (!tmpDomain.droppedLabels) tmpDomain.droppedLabels = [];
            tmpDomain.droppedLabels.push(label);
            tmpDomain.labels.pop();
            tmpDomain.calcDomain();
          } else if (prevDomain && tmpDomain && !prevDomain.isNotIntersect(tmpDomain.getBounds())) {
            sourcePieLabelsDomains.pop();
            tmpDomain.labels = goog.array.concat(prevDomain.labels, tmpDomain.labels);
            prevDomain = null;
            tmpDomain.calcDomain();

            domainExpanded = true;
          }
        }
      } else {
        label.enabled(false);
        if (tmpDomain) {
          if (!tmpDomain.droppedLabels) tmpDomain.droppedLabels = [];
          tmpDomain.droppedLabels.push(label);
        }
      }
    }
  }
  if (tmpDomain) {
    if (sourcePieLabelsDomains.length - domainsLength > 0 || domainExpanded) {
      domain.labels = tmpDomain.labels;
    } else {
      tmpDomain.clearDroppedLabels();
      if (tmpLabels.length != labels.length)
        domain.labels = tmpLabels;
    }
  }
};


/**
 * Calculating outside labels.
 */
anychart.pieModule.Chart.prototype.calculateOutsideLabels = function() {
  var iterator = this.getIterator();
  var label, x0, y0, dR0, isRightSide;
  var connectorPath;

  //-----------init connector element------------------------------------------------------------------------

  this.connectorAnchorCoords = [];
  var connector;

  var mode3d = this.getOption('mode3d');
  if (this.connectorsLayer_) {
    this.connectorsLayer_.clear();
    if (mode3d) this.connectorsLowerLayer_.clear();
  } else {
    this.connectorsLayer_ = new anychart.core.utils.TypedLayer(function() {
      return acgraph.path();
    }, function(child) {
      (/** @type {acgraph.vector.Path} */ (child)).clear();
    });
    this.connectorsLayer_.parent(this.rootElement);
    this.connectorsLayer_.zIndex(anychart.pieModule.Chart.ZINDEX_LABEL);

    if (mode3d) {
      this.connectorsLowerLayer_ = new anychart.core.utils.TypedLayer(function() {
        return acgraph.path();
      }, function(child) {
        (/** @type {acgraph.vector.Path} */ (child)).clear();
      });
      this.connectorsLowerLayer_.parent(this.rootElement);
      this.connectorsLowerLayer_.zIndex(anychart.pieModule.Chart.ZINDEX_CONNECTOR_LOWER_LAYER);
    }
  }
  this.drawnConnectors_ = [];
  var connectorStroke = /** @type {acgraph.vector.Stroke} */ (this.getOption('connectorStroke'));
  if (!this.hoveredLabelConnectorPath_) {
    // path for connector for label disabled by algorithm
    this.hoveredLabelConnectorPath_ = this.rootElement.path();
    this.hoveredLabelConnectorPath_.stroke(connectorStroke);
  }

  //--------calculate absolute labels position, sort labels, separation of the labels on the left and right side--------

  var rightSideLabels = [], leftSideLabels = [], rightSideLabels2, leftSideLabels2;
  iterator.reset();
  var switchToRightSide = false;
  var switchToLeftSide = false;
  while (iterator.advance()) {
    if (this.isMissing_(iterator.get('value'))) continue;
    var index = iterator.getIndex();
    var start = /** @type {number} */ (iterator.meta('start'));
    var sweep = /** @type {number} */ (iterator.meta('sweep'));
    var exploded = /** @type {boolean} */ (iterator.meta('exploded')) && !(iterator.getRowsCount() == 1);
    var angle = (start + sweep / 2) * Math.PI / 180;
    var angleDeg = goog.math.standardAngle(goog.math.toDegrees(angle));

    if (angleDeg > 270 && !switchToRightSide &&
        (leftSideLabels.length != 0 || (leftSideLabels2 && leftSideLabels2.length != 0))) {
      switchToRightSide = true;
      rightSideLabels2 = [];
    }

    if (angleDeg > 90 && !switchToLeftSide &&
        (rightSideLabels.length != 0 || (rightSideLabels2 && rightSideLabels2.length != 0))) {
      switchToLeftSide = true;
      leftSideLabels2 = [];
    }

    isRightSide = angleDeg < 90 || angleDeg > 270;

    dR0 = this.radiusValue_ + (exploded ? this.explodeValue_ : 0);
    var dR1 = mode3d ?
        (this.get3DYRadius(this.radiusValue_) + (exploded ? this.get3DYRadius(this.explodeValue_) : 0)) :
        dR0;

    // coordinates of the point where the connector touches a pie
    x0 = this.cx_ + dR0 * Math.cos(angle);
    y0 = this.cy_ + dR1 * Math.sin(angle);

    if (mode3d) {
      y0 += this.get3DHeight() / 2;
    }

    connector = isRightSide ?
        anychart.pieModule.Chart.OUTSIDE_LABELS_CONNECTOR_SIZE_ :
        -anychart.pieModule.Chart.OUTSIDE_LABELS_CONNECTOR_SIZE_;
    iterator.meta('connector', connector);

    this.connectorAnchorCoords[index * 2] = x0;
    this.connectorAnchorCoords[index * 2 + 1] = y0;

    var anchor = isRightSide ? anychart.enums.Position.LEFT_CENTER : anychart.enums.Position.RIGHT_CENTER;
    iterator.meta('anchor', anchor);
    label = this.drawLabel_(anychart.PointState.NORMAL, false);
    this.dropLabelBoundsCache(label);

    label.angle_ = angleDeg;
    if (isRightSide) {
      switchToRightSide ? rightSideLabels2.push(label) : rightSideLabels.push(label);
    } else {
      switchToLeftSide ? leftSideLabels2.push(label) : leftSideLabels.push(label);
    }

    if (this.getOption('overlapMode') == anychart.enums.LabelsOverlapMode.ALLOW_OVERLAP) {
      if (label && label.enabled() != false) {
        index = label.getIndex();

        if (!this.drawnConnectors_[index]) {
          y0 = this.connectorAnchorCoords[index * 2 + 1] - this.get3DHeight() / 2;
          if (mode3d && y0 < this.cy_) {
            connectorPath = /** @type {acgraph.vector.Path} */(this.connectorsLowerLayer_.genNextChild());
          } else {
            connectorPath = /** @type {acgraph.vector.Path} */(this.connectorsLayer_.genNextChild());
          }
          this.drawnConnectors_[index] = connectorPath;
          connectorPath.stroke(connectorStroke);
          this.drawConnectorLine(label, connectorPath);
        }
      }
    }
  }

  rightSideLabels = rightSideLabels2 ? rightSideLabels2.concat(rightSideLabels) : rightSideLabels;
  leftSideLabels = leftSideLabels2 ? leftSideLabels2.concat(leftSideLabels) : leftSideLabels;

  if (this.getOption('overlapMode') != anychart.enums.LabelsOverlapMode.ALLOW_OVERLAP) {

    //------------------------------------ left domain calculation ------------------------------------------------------

    var i, len, bounds, droppedLabels, notIntersection, m, l;
    var leftDomains = [], domain = null;
    var domainBounds;

    for (i = 0, len = leftSideLabels.length; i < len; i++) {
      label = leftSideLabels[i];
      if (label) {
        iterator.select(label.getIndex());
        label.formatProvider(this.createFormatProvider());
        bounds = this.getLabelBounds(label);

        if (!domain || (domain.isNotIntersect(bounds))) {
          if (domain) leftDomains.push(domain);
          isRightSide = label['anchor']() == anychart.enums.Position.LEFT_CENTER;
          domain = new anychart.pieModule.Chart.PieOutsideLabelsDomain(isRightSide, this, leftDomains);
          domain.addLabel(label);
        } else {
          domain.addLabel(label);
        }
      }
    }
    if (domain) leftDomains.push(domain);

    for (i = 0, len = leftDomains.length; i < len; i++) {
      domain = leftDomains[i];
      if (domain && domain.droppedLabels) {
        if (!droppedLabels) droppedLabels = [];
        droppedLabels = goog.array.concat(droppedLabels, domain.droppedLabels);
      }
    }

    domain = null;
    if (droppedLabels) {
      goog.array.sort(droppedLabels, function(a, b) {
        return a.getIndex() > b.getIndex() ? 1 : a.getIndex() < b.getIndex() ? -1 : 0;
      });

      for (i = 0, len = droppedLabels.length; i < len; i++) {
        label = droppedLabels[i];
        if (label) {
          iterator.select(label.getIndex());
          label.formatProvider(this.createFormatProvider());
          bounds = this.getLabelBounds(label);

          notIntersection = true;
          for (m = 0, l = leftDomains.length; m < l; m++) {
            notIntersection = notIntersection && leftDomains[m].isNotIntersect(bounds);
          }

          if (notIntersection) {
            if (!domain) {
              isRightSide = label['anchor']() == anychart.enums.Position.LEFT_CENTER;
              domain = new anychart.pieModule.Chart.PieOutsideLabelsDomain(isRightSide, this, []);
            }
            domain.softAddLabel(label);
            domainBounds = domain.getBounds();

            notIntersection = true;
            for (m = 0; m < l; m++) {
              notIntersection = notIntersection && leftDomains[m].isNotIntersect(domainBounds);
            }

            if (domain.isCriticalAngle || !notIntersection) {
              domain.labels.pop().enabled(false);
              domain.calcDomain();
              leftDomains.push(domain);
              domain = null;
            } else {
              label.enabled(true);
            }
          } else {
            if (domain) {
              leftDomains.push(domain);
              domain = null;
            }
          }
        }
      }
      if (domain) {
        leftDomains.push(domain);
        domain = null;
      }
    }

    //------------------------------------ right domain calculation ------------------------------------------------------

    var rightDomains = [];
    domain = null;
    for (i = rightSideLabels.length; i--;) {
      label = rightSideLabels[i];
      if (label) {
        iterator.select(label.getIndex());
        label.formatProvider(this.createFormatProvider());
        bounds = this.getLabelBounds(label);

        if (!domain || domain.isNotIntersect(bounds)) {
          if (domain) rightDomains.push(domain);
          isRightSide = label['anchor']() == anychart.enums.Position.LEFT_CENTER;
          domain = new anychart.pieModule.Chart.PieOutsideLabelsDomain(isRightSide, this, rightDomains);
          domain.addLabel(label);
        } else {
          domain.addLabel(label);
        }
      }
    }
    if (domain) rightDomains.push(domain);

    if (droppedLabels) droppedLabels.length = 0;
    for (i = 0, len = rightDomains.length; i < len; i++) {
      domain = rightDomains[i];
      if (domain && domain.droppedLabels) {
        if (!droppedLabels) droppedLabels = [];
        droppedLabels = goog.array.concat(droppedLabels, domain.droppedLabels);
      }
    }

    domain = null;
    if (droppedLabels) {
      goog.array.sort(droppedLabels, function(a, b) {
        return a.getIndex() > b.getIndex() ? 1 : a.getIndex() < b.getIndex() ? -1 : 0;
      });

      for (i = droppedLabels.length; i--;) {
        label = droppedLabels[i];
        if (label) {
          iterator.select(label.getIndex());
          label.formatProvider(this.createFormatProvider());
          bounds = this.getLabelBounds(label);

          notIntersection = true;
          for (m = 0, l = rightDomains.length; m < l; m++) {
            notIntersection = notIntersection && rightDomains[m].isNotIntersect(bounds);
          }

          if (notIntersection) {
            if (!domain) {
              isRightSide = label['anchor']() == anychart.enums.Position.LEFT_CENTER;
              domain = new anychart.pieModule.Chart.PieOutsideLabelsDomain(isRightSide, this, []);
            }
            domain.softAddLabel(label);
            domainBounds = domain.getBounds();

            notIntersection = true;
            for (m = 0; m < l; m++) {
              notIntersection = notIntersection && rightDomains[m].isNotIntersect(domainBounds);
            }

            if (domain.isCriticalAngle || !notIntersection) {
              domain.labels.pop().enabled(false);
              domain.calcDomain();
              rightDomains.push(domain);
              domain = null;
            } else {
              label.enabled(true);
            }
          } else {
            if (domain) {
              rightDomains.push(domain);
              domain = null;
            }
          }
        }

      }
    }
    if (domain) {
      leftDomains.push(domain);
      domain = null;
    }

    //-----------left domains connectors calculation, applying labels positions--------------------------------

    var k, labelsLen;
    for (i = 0, len = leftDomains.length; i < len; i++) {
      domain = leftDomains[i];
      if (domain) {
        domain.applyPositions();

        for (k = 0, labelsLen = domain.labels.length; k < labelsLen; k++) {
          label = domain.labels[k];
          if (label && label.enabled() != false) {
            index = label.getIndex();

            if (!this.drawnConnectors_[index]) {
              y0 = this.connectorAnchorCoords[index * 2 + 1] - this.get3DHeight() / 2;
              if (mode3d && y0 < this.cy_) {
                connectorPath = /** @type {acgraph.vector.Path} */(this.connectorsLowerLayer_.genNextChild());
              } else {
                connectorPath = /** @type {acgraph.vector.Path} */(this.connectorsLayer_.genNextChild());
              }
              this.drawnConnectors_[index] = connectorPath;
              connectorPath.stroke(connectorStroke);
              this.drawConnectorLine(label, connectorPath);
            }
          }
        }
      }
    }

    //-----------right domains connectors calculation, applying labels positions--------------------------------

    for (i = 0, len = rightDomains.length; i < len; i++) {
      domain = rightDomains[i];
      if (domain) {
        domain.applyPositions();

        for (k = 0, labelsLen = domain.labels.length; k < labelsLen; k++) {
          label = domain.labels[k];
          if (label && label.enabled() != false) {
            index = label.getIndex();

            if (!this.drawnConnectors_[index]) {
              y0 = this.connectorAnchorCoords[index * 2 + 1] - this.get3DHeight() / 2;
              if (mode3d && y0 < this.cy_) {
                connectorPath = /** @type {acgraph.vector.Path} */(this.connectorsLowerLayer_.genNextChild());
              } else {
                connectorPath = /** @type {acgraph.vector.Path} */(this.connectorsLayer_.genNextChild());
              }
              this.drawnConnectors_[index] = connectorPath;
              connectorPath.stroke(connectorStroke);
              this.drawConnectorLine(label, connectorPath);
            }
          }
        }
      }
    }
  }
};


/**
 * Draws connector line for label.
 * @param {anychart.core.ui.CircularLabelsFactory.Label} label Label.
 * @param {acgraph.vector.Path} path Connector path element.
 */
anychart.pieModule.Chart.prototype.drawConnectorLine = function(label, path) {
  var iterator = this.data().getIterator();
  var index = label.getIndex();
  if (iterator.select(index)) {
    var x0 = this.connectorAnchorCoords[index * 2];
    var y0 = this.connectorAnchorCoords[index * 2 + 1];

    var connector = /** @type {number} */(iterator.meta('connector'));
    var positionProvider = label.positionProvider()['value'];

    var offsetY = goog.isDef(label.getOption('offsetY')) ? label.getOption('offsetY') : this.labels().getOption('offsetY');
    if (!offsetY) offsetY = 0;
    var offsetRadius = anychart.utils.normalizeSize(/** @type {number|string} */(offsetY), this.radiusValue_);

    var offsetX = goog.isDef(label.getOption('offsetX')) ? label.getOption('offsetX') : this.labels().getOption('offsetX');
    if (!offsetX) offsetX = 0;
    var offsetAngle = anychart.utils.normalizeSize(/** @type {number|string} */(offsetX), 360);

    var angle = positionProvider['angle'] + offsetAngle;
    var angleRad = goog.math.toRadians(angle);
    var radius = positionProvider['radius'] + offsetRadius;

    var x = this.cx_ + radius * Math.cos(angleRad) - connector;
    var y = this.cy_ + radius * Math.sin(angleRad);

    path.clear().moveTo(x0, y0).lineTo(x, y).lineTo(x + connector, y);
  }
};


/**
 * Show or hide connector for label.
 * @param {anychart.core.ui.CircularLabelsFactory.Label} label Label.
 * @param {boolean} show Whether to show connector ot not for label.
 * @private
 */
anychart.pieModule.Chart.prototype.updateConnector_ = function(label, show) {
  if (!label || !this.drawnConnectors_)
    return;
  var index = label.getIndex();
  var path;
  if (!(path = this.drawnConnectors_[index])) {
    if (!show) {
      this.hoveredLabelConnectorPath_.clear();
    } else {
      this.drawConnectorLine(label, this.hoveredLabelConnectorPath_);
    }
    return;
  }

  if (label && label.enabled() != false && show) {
    this.drawConnectorLine(label, path);
  } else
    path.clear();
};


/**
 * Create column series format provider.
 * @return {Object} Object with info for labels formatting.
 * @protected
 */
anychart.pieModule.Chart.prototype.createPositionProvider = function() {
  var outside = this.isOutsideLabels();
  var iterator = this.getIterator();
  var start = /** @type {number} */ (iterator.meta('start'));
  var sweep = /** @type {number} */ (iterator.meta('sweep'));
  var singlePoint = (iterator.getRowsCount() == 1) || sweep == 360;
  var exploded = /** @type {boolean} */ (iterator.meta('exploded')) && !singlePoint;
  var angle = start + sweep / 2;
  var dR;
  var outerXR;
  var outerYR;
  var innerXR;
  var innerYR;
  var xRadius;
  var yRadius;

  var mode3d = /** @type {boolean} */ (this.getOption('mode3d'));
  var insideLabelsOffset = /** @type {number|string} */ (this.getOption('insideLabelsOffset'));
  if (mode3d) {
    if (outside) {
      xRadius = this.radiusValue_ + this.connectorLengthValue_;
      yRadius = this.get3DYRadius(this.radiusValue_) + this.connectorLengthValue_;

      if (exploded) {
        xRadius += this.explodeValue_;
        yRadius += this.get3DYRadius(this.explodeValue_);
      }

    } else {
      outerXR = this.radiusValue_;
      outerYR = this.get3DYRadius(this.radiusValue_);
      innerXR = this.innerRadiusValue_;
      innerYR = this.get3DYRadius(this.innerRadiusValue_);

      if (singlePoint && !innerXR) {
        xRadius = 0;
        yRadius = 0;
      } else {
        xRadius = anychart.utils.normalizeSize(insideLabelsOffset, (innerXR + outerXR));
        // support pixels value
        if (anychart.utils.isPercent(insideLabelsOffset)) {
          yRadius = anychart.utils.normalizeSize(insideLabelsOffset, (innerYR + outerYR));
        } else {
          yRadius = this.get3DYRadius(anychart.utils.normalizeSize(insideLabelsOffset, (innerYR + outerYR)));
        }

        if (exploded) {
          xRadius += this.explodeValue_;
          yRadius += this.get3DYRadius(this.explodeValue_);
        }
      }
    }

    return {'value': {'angle': angle, 'radius': xRadius, 'radiusY': yRadius}};

  } else {
    if (outside) {
      dR = (this.radiusValue_ + this.connectorLengthValue_) + (exploded ? this.explodeValue_ : 0);
    } else {
      var radius = singlePoint && !this.innerRadiusValue_ ? 0 : this.radiusValue_ - this.innerRadiusValue_;
      dR = anychart.utils.normalizeSize(insideLabelsOffset, radius) +
          this.innerRadiusValue_ + (exploded ? this.explodeValue_ : 0);
    }

    return {'value': {'angle': angle, 'radius': dR}};
  }
};


/** @inheritDoc */
anychart.pieModule.Chart.prototype.isNoData = function() {
  var rowsCount = this.getIterator().getRowsCount();
  return (!rowsCount);
};


/** @inheritDoc */
anychart.pieModule.Chart.prototype.serialize = function() {
  var json = anychart.pieModule.Chart.base(this, 'serialize');
  json['type'] = this.getType();
  json['data'] = this.data().serialize();
  json['palette'] = this.palette().serialize();
  json['hatchFillPalette'] = this.hatchFillPalette().serialize();
  json['tooltip'] = this.tooltip().serialize();

  anychart.core.settings.serialize(this, anychart.pieModule.Chart.PROPERTY_DESCRIPTORS, json, 'Pie');
  json['normal'] = this.normal_.serialize();
  json['hovered'] = this.hovered_.serialize();

  // The values of group() function can be function or null or 'none'. So we don't serialize it anyway.
  //if (goog.isFunction(this['group'])) {
  //  if (goog.isFunction(this.group())) {
  //    anychart.core.reporting.warning(
  //        anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
  //        null,
  //        ['Pie group']
  //    );
  //  } else {
  //    json['group'] = this.group();
  //  }
  //}

  return {'chart': json};
};


/** @inheritDoc */
anychart.pieModule.Chart.prototype.setupByJSON = function(config, opt_default) {
  anychart.pieModule.Chart.base(this, 'setupByJSON', config, opt_default);
  this.group(config['group']);
  this.data(config['data']);

  this.palette(config['palette']);
  this.hatchFillPalette(config['hatchFillPalette']);

  if ('tooltip' in config)
    this.tooltip().setupInternal(!!opt_default, config['tooltip']);

  anychart.core.settings.deserialize(this, anychart.pieModule.Chart.PROPERTY_DESCRIPTORS, config);
  this.normal_.setupInternal(!!opt_default, config);
  this.normal_.setupInternal(!!opt_default, config['normal']);
  this.hovered_.setupInternal(!!opt_default, config['hovered']);
};



/**
 * Labels Domain.
 * @param {boolean} isRight .
 * @param {!anychart.pieModule.Chart} pie .
 * @param {Array.<anychart.pieModule.Chart.PieOutsideLabelsDomain>} domains .
 * @constructor
 */
anychart.pieModule.Chart.PieOutsideLabelsDomain = function(isRight, pie, domains) {
  /**
   *
   * @type {Array.<anychart.pieModule.Chart.PieOutsideLabelsDomain>}
   */
  this.pieLabelsDomains = domains;

  /**
   * Link to pie.
   * @type {!anychart.pieModule.Chart}
   */
  this.pie = pie;

  /**
   * Domain labels.
   * @type {Array.<anychart.core.ui.CircularLabelsFactory.Label>}
   */
  this.labels = [];

  /**
   * Domain height.
   * @type {number}
   */
  this.height = 0;

  /**
   * Left top domain corner position.
   * @type {number}
   */
  this.y = 0;

  /**
   * Result positions for labels.
   * @type {Array.<number>}
   */
  this.labelsPositions = [];

  /**
   * Defines domain side.
   * @type {boolean}
   */
  this.isRightSide = isRight;

  /**
   * Is critical angle in domain.
   * @type {boolean}
   */
  this.isCriticalAngle = false;

  /**
   * Bounds cache.
   * @type {anychart.math.Rect}
   */
  this.boundsCache = null;
};


/**
 * Dropped labels.
 * @type {Array.<anychart.core.ui.CircularLabelsFactory.Label>}
 */
anychart.pieModule.Chart.PieOutsideLabelsDomain.prototype.droppedLabels;


/**
 * Adding label to domain with checks critical angles and intersection with other domains.
 * @param {anychart.core.ui.CircularLabelsFactory.Label} label Adding label.
 */
anychart.pieModule.Chart.PieOutsideLabelsDomain.prototype.addLabel = function(label) {
  if (label) {
    this.labels.push(label);
    this.calculate();
  }
};


/**
 * Adding label to domain without any checks.
 * @param {anychart.core.ui.CircularLabelsFactory.Label} label Adding label.
 */
anychart.pieModule.Chart.PieOutsideLabelsDomain.prototype.softAddLabel = function(label) {
  if (label) {
    this.labels.push(label);
    this.calcDomain();
  }
};


/**
 * Clearing dropped labels array.
 */
anychart.pieModule.Chart.PieOutsideLabelsDomain.prototype.clearDroppedLabels = function() {
  if (this.droppedLabels) {
    for (var i = 0, len = this.droppedLabels.length; i < len; i++) {
      var l = this.droppedLabels[i];
      l.enabled(true);
    }

    this.droppedLabels.length = 0;
  }
};


/**
 * Drop label.
 * @param {anychart.core.ui.CircularLabelsFactory.Label} label
 * @param {number} index Label index in domain labels array.
 */
anychart.pieModule.Chart.PieOutsideLabelsDomain.prototype.dropLabel = function(label, index) {
  if (!isNaN(index)) {

    label.enabled(false);
    if (!this.droppedLabels) this.droppedLabels = [];
    this.droppedLabels.push(label);

    goog.array.splice(this.labels, index, 1);
  }
};


/**
 * Get label bounds.
 * @return {anychart.math.Rect} Label bounds.
 */
anychart.pieModule.Chart.PieOutsideLabelsDomain.prototype.getBounds = function() {
  if (!this.boundsCache) {
    var firstLabelHeight = this.labels[0] ? this.pie.getLabelBounds(this.labels[0]).height : 0;
    var domainY = this.y + firstLabelHeight / 2;
    this.boundsCache = new anychart.math.Rect(this.x, domainY, this.width, this.height);
  }

  return this.boundsCache;
};


/**
 * Drop bounds cache.
 */
anychart.pieModule.Chart.PieOutsideLabelsDomain.prototype.dropBoundsCache = function() {
  this.boundsCache = null;
};


/**
 * Check intersections this domain with other domain.
 * @param {anychart.math.Rect} bounds Passed labels bounds.
 * @return {boolean} is not intersect with entry with incoming params.
 */
anychart.pieModule.Chart.PieOutsideLabelsDomain.prototype.isNotIntersect = function(bounds) {
  var bounds1 = this.getBounds().toCoordinateBox();
  var bounds2 = bounds.toCoordinateBox();
  return !anychart.math.checkRectIntersection(bounds1, bounds2);
};


/**
 * Applying positions to labels.
 */
anychart.pieModule.Chart.PieOutsideLabelsDomain.prototype.applyPositions = function() {
  for (var j = 0, len = this.labels.length; j < len; j++) {
    var label = this.labels[j];

    var angle = this.labelsPositions[j * 3];
    var radius = this.labelsPositions[j * 3 + 1];
    var radiusY = this.labelsPositions[j * 3 + 2];

    var positionProviderValue = label.positionProvider()['value'];

    positionProviderValue['angle'] = angle;
    positionProviderValue['radius'] = radius;
    positionProviderValue['radiusY'] = radiusY;

    this.pie.dropLabelBoundsCache(label);
  }
};


/**
 * Calculating domain parameters: bounds, labels positions, critical angle.
 */
anychart.pieModule.Chart.PieOutsideLabelsDomain.prototype.calcDomain = function() {
  var label, labelBounds;
  this.height = 0;
  var sumPos = 0;
  this.dropBoundsCache();

  var pieCenter = this.pie.getCenterPoint();
  var cx = pieCenter['x'], cy = pieCenter['y'];
  var bottomLabelsYLimit, topLabelsYLimit;

  var mode3d = /** @type {boolean} */ (this.pie.getOption('mode3d'));
  if (mode3d) {
    bottomLabelsYLimit = cy + this.pie.get3DYRadius(this.pie.getPixelRadius()) + this.pie.connectorLengthValue_ - .1 + this.pie.get3DHeight() / 2;
    topLabelsYLimit = cy - (this.pie.get3DYRadius(this.pie.getPixelRadius()) + this.pie.connectorLengthValue_) + .1 - this.pie.get3DHeight() / 2;
  } else {
    bottomLabelsYLimit = cy + this.pie.getPixelRadius() + this.pie.connectorLengthValue_ - .1;
    topLabelsYLimit = cy - (this.pie.getPixelRadius() + this.pie.connectorLengthValue_) + .1;
  }

  for (var j = 0, len = this.labels.length; j < len; j++) {
    label = this.labels[j];
    labelBounds = this.pie.getLabelBounds(label);
    sumPos += labelBounds.top - this.height - labelBounds.height / 2;
    this.height += labelBounds.height;
  }

  this.y = sumPos / len;
  var startLabelsDrawingYPos = this.y + this.height;

  if (startLabelsDrawingYPos > bottomLabelsYLimit) {
    startLabelsDrawingYPos = bottomLabelsYLimit;
    this.y = bottomLabelsYLimit - this.height;
  }
  if (this.labels.length != 0) {
    var firstLabelHeight = this.pie.getLabelBounds(this.labels[0]).height;
    if (this.y + firstLabelHeight < topLabelsYLimit) {
      startLabelsDrawingYPos = topLabelsYLimit - firstLabelHeight + this.height;
      this.y = topLabelsYLimit - firstLabelHeight;
    }
  }

  var criticalAngle = /** @type {number} */ (this.pie.getOption('outsideLabelsCriticalAngle'));

  this.labelsPositions.length = 0;
  var iterator = this.pie.data().getIterator();
  var nextLabelHeight;
  var start, sweep, exploded, angle, dR, dRPie, y, y0, y1, x, x0, x1, connector;
  this.x = NaN;
  this.width = NaN;
  var rightBound, leftBound;

  this.labelToDrop = null;
  this.dropIndex = NaN;
  this.maxAngle = NaN;
  this.isCriticalAngle = false;

  for (j = 0, len = this.labels.length; j < len; j++) {
    label = this.labels[j];
    labelBounds = this.pie.getLabelBounds(label);
    nextLabelHeight = (j == len - 1) ? 0 : this.pie.getLabelBounds(this.labels[j + 1]).height;

    iterator.select(label.getIndex());

    start = /** @type {number} */ (iterator.meta('start'));
    sweep = /** @type {number} */ (iterator.meta('sweep'));
    exploded = /** @type {boolean} */ (iterator.meta('exploded'));

    var offsetX = goog.isDef(label.getOption('offsetX')) ? label.getOption('offsetX') : this.pie.labels().getOption('offsetX');
    if (!offsetX) offsetX = 0;
    var offsetAngle = anychart.utils.normalizeSize(/** @type {number|string} */(offsetX), 360);

    var offsetY = goog.isDef(label.getOption('offsetY')) ? label.getOption('offsetY') : this.pie.labels().getOption('offsetY');
    if (!offsetY) offsetY = 0;
    var offsetRadius = anychart.utils.normalizeSize(/** @type {number|string} */(offsetY), this.pie.radiusValue_);

    angle = (start + sweep / 2 + offsetAngle) * Math.PI / 180;

    connector = this.isRightSide ?
        anychart.pieModule.Chart.OUTSIDE_LABELS_CONNECTOR_SIZE_ :
        -anychart.pieModule.Chart.OUTSIDE_LABELS_CONNECTOR_SIZE_;

    dRPie = this.pie.radiusValue_ + (exploded ? this.pie.explodeValue_ : 0);
    dR = (this.pie.getPixelRadius() + this.pie.connectorLengthValue_) + (exploded ? this.pie.explodeValue_ : 0) + offsetRadius;

    var dRYPie, dRY;
    if (mode3d) {
      dRYPie = this.pie.get3DYRadius(this.pie.radiusValue_) + (exploded ? this.pie.get3DYRadius(this.pie.explodeValue_) : 0);
      dRY = (this.pie.get3DYRadius(this.pie.getPixelRadius()) + this.pie.connectorLengthValue_) + (exploded ? this.pie.get3DYRadius(this.pie.explodeValue_) : 0) + this.pie.get3DYRadius(offsetRadius);
    } else {
      dRYPie = dRPie;
      dRY = dR;
    }

    // new coordinates of the point where connector touches a label
    y = startLabelsDrawingYPos;

    var a = dRPie + this.pie.connectorLengthValue_;
    var b = dRYPie + this.pie.connectorLengthValue_;

    // 3d pie hard fix (but works fine). (y - cy) should not be less than 'b' by equation below.
    if (Math.abs(y - cy) > b) {
      b = Math.abs(y - cy);
    }
    // use canonical equation of ellipse for solve X coord
    // https://www.wolframalpha.com/input/?i=solve+x%5E2%2Fa%5E2%2By%5E2%2Fb%5E2%3D1+for+x
    var leg = (a * Math.sqrt(Math.pow(b, 2) - Math.pow(y - cy, 2))) / b;
    x = cx + (this.isRightSide ? 1 : -1) * Math.abs(leg);

    // coordinates of the point where connector touches a pie
    x0 = cx + dRPie * Math.cos(angle);
    y0 = cy + dRYPie * Math.sin(angle);

    // normal (before transformation (overlap correction)) coordinate of the point where connector touches a label.
    x1 = cx + dR * Math.cos(angle);
    y1 = cy + dRY * Math.sin(angle);

    // get connector radius before overlap correction
    var normalConnector = (anychart.math.vectorLength(x0, y0, x1, y1)).toFixed(3);
    // get connector radius after overlap correction
    var txConnector = (anychart.math.vectorLength(x0, y0, x, y)).toFixed(3);
    var dAngle = goog.math.toDegrees(Math.acos(normalConnector / txConnector));

    if (dAngle > this.maxAngle || isNaN(this.maxAngle) || leg < 0) {
      this.maxAngle = leg < 0 ? Number.POSITIVE_INFINITY : dAngle;
      this.labelToDrop = label;
      this.dropIndex = j;
    }
    if (dAngle > criticalAngle || leg < 0) this.isCriticalAngle = true;

    var labelXCoord = x + connector;
    leftBound = this.isRightSide ? labelXCoord : labelXCoord - labelBounds.width;
    this.x = isNaN(this.x) ? leftBound : this.x > leftBound ? leftBound : this.x;
    rightBound = this.isRightSide ? labelXCoord + labelBounds.width : labelXCoord;
    this.width = isNaN(this.width) ? rightBound : this.width < rightBound ? rightBound : this.width;


    var x_ = labelXCoord - cx;
    var y_ = y - cy;

    if (mode3d) {
      y_ += this.pie.get3DHeight() / 2;
    }

    var radius_ = Math.sqrt(Math.pow(x_, 2) + Math.pow(y_, 2)) - offsetRadius;
    var radiusY_ = Math.sqrt(Math.pow(x_, 2) + Math.pow(y_, 2)) - offsetRadius;

    var angle_ = NaN;
    if (x_ > 0 && y_ >= 0) {
      angle_ = goog.math.toDegrees(Math.atan(y_ / x_));
    } else if (x_ > 0 && y_ < 0) {
      angle_ = goog.math.toDegrees(Math.atan(y_ / x_)) + 360;
    } else if (x_ < 0) {
      angle_ = goog.math.toDegrees(Math.atan(y_ / x_)) + 180;
    } else if (!x_ && y_ > 0) {
      angle_ = 90;
    } else if (!x_ && y_ < 0) {
      angle_ = 270;
    }

    angle_ -= offsetAngle;

    this.labelsPositions.push(angle_, radius_, radiusY_);

    startLabelsDrawingYPos -= labelBounds.height / 2 + nextLabelHeight / 2;
  }

  this.width -= this.x;
};


/**
 * Calculating domain with checks critical angles and intersection with other domains.
 */
anychart.pieModule.Chart.PieOutsideLabelsDomain.prototype.calculate = function() {
  this.calcDomain();

  if (this.isCriticalAngle) {
    this.dropLabel(this.labelToDrop, this.dropIndex);
    this.pie.domainDefragmentation(this);
    this.calculate();
  } else {
    var prevDomain = this.pieLabelsDomains[this.pieLabelsDomains.length - 1];
    var boundsPrevDomain;
    if (prevDomain) boundsPrevDomain = prevDomain.getBounds();
    //If domain is so large that we overlap the previous domain, we assimilate (resistance is futile)
    //previous domain (take its labels into the current domain and remove the previous from the list of domains)
    if (boundsPrevDomain && !this.isNotIntersect(boundsPrevDomain)) {
      this.pieLabelsDomains.pop();
      this.labels = goog.array.concat(prevDomain.labels, this.labels);
      for (var j = 0, len = this.labels.length; j < len; j++) {
        this.labels[j].enabled(true);
      }
      this.calculate();
    }
  }
};


/**
 * @inheritDoc
 */
anychart.pieModule.Chart.prototype.disposeInternal = function() {
  goog.disposeAll(this.animationQueue_, this.normal_, this.hovered_);
  anychart.pieModule.Chart.base(this, 'disposeInternal');
};



//exports
(function() {
  var proto = anychart.pieModule.Chart.prototype;
  // auto generated
  // proto['radius'] = proto.radius;//doc|ex
  // proto['innerRadius'] = proto.innerRadius;//doc|ex
  // proto['startAngle'] = proto.startAngle;//doc|ex
  // proto['explode'] = proto.explode;//doc/ex
  // proto['sort'] = proto.sort;//doc|ex
  // proto['outsideLabelsSpace'] = proto.outsideLabelsSpace;//doc|ewx
  // proto['overlapMode'] = proto.overlapMode;
  // proto['insideLabelsOffset'] = proto.insideLabelsOffset;//doc|ewx
  // proto['connectorLength'] = proto.connectorLength;//doc|ex
  // proto['outsideLabelsCriticalAngle'] = proto.outsideLabelsCriticalAngle;//doc|ex
  // proto['forceHoverLabels'] = proto.forceHoverLabels;
  // proto['connectorStroke'] = proto.connectorStroke;//doc|ex
  // proto['mode3d'] = proto.mode3d;
  proto['group'] = proto.group;//doc|ex|non-tr
  proto['data'] = proto.data;//doc|ex|
  proto['labels'] = proto.labels;//doc|ex
  proto['getCenterPoint'] = proto.getCenterPoint;//doc|ex
  proto['getPixelRadius'] = proto.getPixelRadius;//doc|need-ex
  proto['getPixelInnerRadius'] = proto.getPixelInnerRadius;//doc|need-ex
  proto['getPixelExplode'] = proto.getPixelExplode;
  proto['palette'] = proto.palette;//doc|ex
  proto['explodeSlice'] = proto.explodeSlice;//doc|ex
  proto['explodeSlices'] = proto.explodeSlices;
  proto['tooltip'] = proto.tooltip;//doc|ex
  proto['hatchFillPalette'] = proto.hatchFillPalette;
  proto['getType'] = proto.getType;
  proto['hover'] = proto.hover;
  proto['unhover'] = proto.unhover;
  proto['getPoint'] = proto.getPoint;
  proto['toCsv'] = proto.toCsv;

  proto['normal'] = proto.normal;
  proto['hovered'] = proto.hovered;
})();
