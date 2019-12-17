//region --- Requiring and Providing
goog.provide('anychart.pieModule.Chart');

goog.require('anychart.animations.AnimationSerialQueue');
goog.require('anychart.color');
goog.require('anychart.core.Base');
goog.require('anychart.core.ICenterContentChart');
goog.require('anychart.core.IShapeManagerUser');
goog.require('anychart.core.SeparateChart');
goog.require('anychart.core.StateSettings');
goog.require('anychart.core.reporting');
goog.require('anychart.core.settings');
goog.require('anychart.core.ui.Center');
goog.require('anychart.core.ui.CircularLabelsFactory');
goog.require('anychart.core.ui.Tooltip');
goog.require('anychart.core.utils.IInteractiveSeries');
goog.require('anychart.core.utils.InteractivityState');
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
//endregion;



/**
 * Pie (Donut) Chart Class.<br/>
 * <b>Note:</b> Use method {@link anychart.pie} to get an instance of this class:
 * @param {(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Data for the chart.
 * @param {(anychart.enums.TextParsingMode|anychart.data.TextParsingSettings)=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings here as a hash map.
 * @extends {anychart.core.SeparateChart}
 * @implements {anychart.core.utils.IInteractiveSeries}
 * @implements {anychart.core.IShapeManagerUser}
 * @implements {anychart.core.ICenterContentChart}
 * @constructor
 */
anychart.pieModule.Chart = function(opt_data, opt_csvSettings) {
  anychart.pieModule.Chart.base(this, 'constructor');

  this.addThemes('pieFunnelPyramidBase', 'pie');

  this.contextMenu(this.themeSettings['contextMenu']);

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
   * Flag whether chart performs first draw (initial true value)
   * or needs force bounds recalculation (bounds invalidation).
   * Needed to consider outsideLabels on calculation (DVF-4147)
   * because interactivity works that way:
   *  - default state is 'normal'.
   *  - state is changed if state is 'exploded' (selected). Bug is here:
   *    state can be initially 'exploded' from data.
   *  - if state is changed, we don't need to recalculate bounds.
   * Considering this flag fixes DVF-4147 shortly without changing
   * jungles of code in interactivity.
   *
   * @type {boolean}
   * @private
   */
  this.needsForceBoundsRecalculation_ = true;

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
  this.state = new anychart.core.utils.InteractivityState(this);

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
    ['sort', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW, 0, sortBeforeInvalidation],
    ['insideLabelsOffset',
      anychart.ConsistencyState.BOUNDS | anychart.ConsistencyState.PIE_LABELS,
      anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['connectorLength',
      anychart.ConsistencyState.BOUNDS | anychart.ConsistencyState.PIE_LABELS,
      anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['outsideLabelsCriticalAngle', anychart.ConsistencyState.PIE_LABELS, anychart.Signal.NEEDS_REDRAW],
    ['forceHoverLabels', anychart.ConsistencyState.PIE_LABELS, anychart.Signal.NEEDS_REDRAW],
    ['connectorStroke', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW],
    ['mode3d', anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.BOUNDS | anychart.ConsistencyState.PIE_LABELS, anychart.Signal.NEEDS_REDRAW],
    ['sliceDrawer', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW]
  ]);

  var normalDescriptorsMeta = {};
  anychart.core.settings.createDescriptorsMeta(normalDescriptorsMeta, [
    ['explode',
      anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.BOUNDS | anychart.ConsistencyState.PIE_LABELS,
      anychart.Signal.NEEDS_REDRAW],
    ['fill',
      anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.CHART_LEGEND,
      anychart.Signal.NEEDS_REDRAW],
    ['stroke',
      anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.CHART_LEGEND,
      anychart.Signal.NEEDS_REDRAW],
    ['hatchFill',
      anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.CHART_LEGEND,
      anychart.Signal.NEEDS_REDRAW],
    ['labels', 0, 0],
    ['outline', 0, 0]
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
  this.normal_.setOption(anychart.core.StateSettings.OUTLINE_AFTER_INIT_CALLBACK, /** @this {anychart.pieModule.Chart} */ function(instance) {
    instance.listenSignals(this.outlineInvalidated_, this);
    this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
  });

  var hoveredDescriptorsMeta = {};
  anychart.core.settings.createDescriptorsMeta(hoveredDescriptorsMeta, [
    ['explode', anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.BOUNDS | anychart.ConsistencyState.PIE_LABELS,
      anychart.Signal.NEEDS_REDRAW],
    ['fill', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW],
    ['stroke', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW],
    ['hatchFill', 0, 0],
    ['labels', 0, 0],
    ['outline', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW]
  ]);
  this.hovered_ = new anychart.core.StateSettings(this, hoveredDescriptorsMeta, anychart.PointState.HOVER);
  this.hovered_.setOption(anychart.core.StateSettings.LABELS_FACTORY_CONSTRUCTOR, anychart.core.StateSettings.CIRCULAR_LABELS_CONSTRUCTOR_NO_THEME);

  var selectedDescriptorsMeta = {};
  anychart.core.settings.createDescriptorsMeta(selectedDescriptorsMeta, [
    ['explode', anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.BOUNDS | anychart.ConsistencyState.PIE_LABELS,
      anychart.Signal.NEEDS_REDRAW],
    ['fill', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW],
    ['stroke', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW],
    ['hatchFill', 0, 0],
    ['labels', 0, 0],
    ['outline', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW]
  ]);
  this.selected_ = new anychart.core.StateSettings(this, selectedDescriptorsMeta, anychart.PointState.SELECT);
  this.selected_.setOption(anychart.core.StateSettings.LABELS_FACTORY_CONSTRUCTOR, anychart.core.StateSettings.CIRCULAR_LABELS_CONSTRUCTOR_NO_THEME);

  this.resumeSignalsDispatching(false);
};
goog.inherits(anychart.pieModule.Chart, anychart.core.SeparateChart);
anychart.core.settings.populateAliases(anychart.pieModule.Chart, ['fill', 'stroke', 'hatchFill', 'outline'], 'normal');
anychart.core.settings.populateAliases(anychart.pieModule.Chart, ['explode'], 'selected');


//region --- Static props
/**
 * @typedef {{
 *   centerX: !number,
 *   centerY: !number,
 *   innerRadius: !number,
 *   outerRadius: !number,
 *   innerOutlineRadius: !number,
 *   outerOutlineRadius: !number,
 *   startAngle: !number,
 *   sweepAngle: !number,
 *   explodeX: !number,
 *   explodeY: !number,
 *   path: !acgraph.vector.Path
 * }}
 */
anychart.pieModule.Chart.SliceDrawerContext;


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
 * Default hatch fill type.
 * @type {acgraph.vector.HatchFill.HatchFillType|string}
 */
anychart.pieModule.Chart.DEFAULT_HATCH_FILL_TYPE = 'none';


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
 * Center content bg z-index in root layer.
 * @type {number}
 */
anychart.pieModule.Chart.ZINDEX_CENTER_CONTENT_BG = 20;


/**
 * Center content layer z-index in root layer.
 * @type {number}
 */
anychart.pieModule.Chart.ZINDEX_CENTER_CONTENT_LAYER = 25;


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
  OUTERFRONT: 'outerFront',
  INNERBACK: 'innerBack',
  START: 'start',
  END: 'end',
  BOTTOM: 'bottom',
  INNERFRONT: 'innerFront',
  OUTERBACK: 'outerBack'
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
    anychart.ConsistencyState.PIE_CENTER_CONTENT |
    anychart.ConsistencyState.PIE_DATA;


/**
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.pieModule.Chart.PROPERTY_DESCRIPTORS = (function() {
  // function explodeNormalizer(opt_value) {
  //   return anychart.utils.normalizeNumberOrPercent(opt_value, 15);
  // }
  // anychart.core.settings.createDescriptor(
  //     map,
  //     anychart.enums.PropertyHandlerType.SINGLE_ARG,
  //     '',
  //     explodeNormalizer,
  //     'explode');
  function outsideLabelsSpaceNormalizer(opt_value) {
    return anychart.utils.normalizeNumberOrPercent(opt_value, '30%');
  }
  function connectorLengthNormalizer(opt_value) {
    return anychart.utils.normalizeNumberOrPercent(opt_value, '20%');
  }
  function criticalAngleNormalizer(opt_value) {
    return goog.math.standardAngle(anychart.utils.normalizeSize(opt_value));
  }
  function radiusNormalizer(opt_value) {
    return anychart.utils.normalizeNumberOrPercent(opt_value, '100%');
  }
  function innerRadiusNormalizer(opt_value) {
    return goog.isFunction(opt_value) ? opt_value : anychart.utils.normalizeNumberOrPercent(opt_value);
  }
  var descriptors = anychart.core.settings.descriptors;
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};
  anychart.core.settings.createDescriptors(map, [
        descriptors.OVERLAP_MODE,
        descriptors.START_ANGLE,
        [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'radius', radiusNormalizer],
        [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'innerRadius', innerRadiusNormalizer],
        [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'sort', anychart.enums.normalizeSort],
        [anychart.enums.PropertyHandlerType.SINGLE_ARG_DEPRECATED, '', outsideLabelsSpaceNormalizer, 'outsideLabelsSpace'],
        [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'insideLabelsOffset', anychart.utils.normalizeNumberOrPercent],
        [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'connectorLength', connectorLengthNormalizer],
        [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'outsideLabelsCriticalAngle', criticalAngleNormalizer],
        [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'forceHoverLabels', anychart.core.settings.asIsNormalizer],
        [anychart.enums.PropertyHandlerType.MULTI_ARG, 'connectorStroke', anychart.core.settings.strokeNormalizer],
        [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'mode3d', anychart.core.settings.booleanNormalizer],
        [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'sliceDrawer', anychart.core.settings.functionNormalizer]
  ]);
  return map;
})();
anychart.core.settings.populate(anychart.pieModule.Chart, anychart.pieModule.Chart.PROPERTY_DESCRIPTORS);


//endregion
//region --- Interface methods
/** @inheritDoc */
anychart.pieModule.Chart.prototype.getType = function() {
  return /** @type {boolean} */ (this.getOption('mode3d')) ? anychart.enums.ChartTypes.PIE_3D : anychart.enums.ChartTypes.PIE;
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
 * @inheritDoc
 */
anychart.pieModule.Chart.prototype.getAllSeries = function() {
  return [this];
};


//endregion
//region --- Data
/**
 * Link to incoming raw data.
 * Used to avoid data reapplication on same data sets.
 * NOTE: If is disposable entity, should be disposed from the source, not from this class.
 * @type {?(anychart.data.View|anychart.data.Set|Array|string)}
 * @private
 */
anychart.pieModule.Chart.prototype.rawData_;


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
 * Sets new value of this.view_ depending on current grouping and sorting settings.
 * @private
 */
anychart.pieModule.Chart.prototype.redefineView_ = function() {
  goog.dispose(this.view_);
  delete this.iterator_;
  this.view_ = this.prepareData_(this.parentView_);
  this.view_.listenSignals(this.dataInvalidated_, this);
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
    data = new anychart.pieModule.DataView(/** @type {!anychart.data.View} */(data), 'value', this.groupedPointName_, this.groupedPointFilter_, undefined, function() {
      return {'value': 0};
    });
    oldData.registerDisposable(data);
    data.transitionMeta(true);
  }

  var sort = /** @type {anychart.enums.Sort} */ (this.getOption('sort'));
  if (sort == 'none' || !goog.isDefAndNotNull(sort)) {
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
 * Getter/setter for grouping.
 * @param {(string|null|function(*):boolean)=} opt_value Filter function or disable value (null, 'none').
 * @param {string=} opt_name Name for group
 * @return {(anychart.pieModule.Chart|function(*):boolean|null)} Current grouping function or self for method chaining.
 */
anychart.pieModule.Chart.prototype.group = function(opt_value, opt_name) {
  if (goog.isDef(opt_value)) {
    if (goog.isFunction(opt_value) && opt_value != this.groupedPointFilter_) {
      this.groupedPointFilter_ = opt_value;
      this.groupedPointName_ = opt_name || 'Grouped point';
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


//endregion
//region --- Palette
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
    this.setupCreated('palette', this.palette_);
    this.palette_.restoreDefaults();
    if (opt_cloneFrom)
      this.palette_.setup(opt_cloneFrom);
    this.palette_.listenSignals(this.paletteInvalidated_, this);
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
  }

  if (goog.isDef(opt_value)) {
    this.hatchFillPalette_.setup(opt_value);
    return this;
  } else {
    return this.hatchFillPalette_;
  }
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


//endregion
//region --- Coloring
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
 * @param {(acgraph.vector.Fill|Function)=} opt_baseColor State where target will be get base color.
 * @return {*}
 * @private
 */
anychart.pieModule.Chart.getColor_ = function(colorName, normalizer, isHatchFill, canBeHoveredSelected, pie, state, opt_ignorePointSettings, opt_baseColor) {
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
  var baseColor = goog.isDef(opt_baseColor) ? opt_baseColor : color;

  var isAqua = goog.isString(color) && color == 'aquastyle';
  if (isHatchFill && color === true)
    color = normalizer(pie.getAutoHatchFill());
  if (goog.isFunction(color)) {
    context = isHatchFill ?
        pie.getHatchFillResolutionContext(opt_ignorePointSettings) :
        pie.getColorResolutionContext(/** @type {acgraph.vector.Fill|acgraph.vector.Stroke} */(baseColor), opt_ignorePointSettings);
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
  var hasSelectState = !!(state & anychart.PointState.SELECT);

  var stateObject = hasSelectState ? this.selected_ : hasHoverState ? this.hovered_ : this.normal_;
  var path = name.split('.');
  var stateValue = goog.array.reduce(path, function(rval, val) {return rval[val]();}, stateObject);

  if (opt_ignorePointSettings) {
    val = stateValue;
  } else {
    var pointStateName = hasSelectState ? 'selected' : hasHoverState ? 'hovered' : 'normal';
    var pointStateObject = point.get(pointStateName);
    var pointStateValue = goog.isDef(pointStateObject) ?
        goog.array.reduce(path, function(rval, val) {return rval ? rval[val] : rval;}, pointStateObject) :
        void 0;

    val = anychart.utils.getFirstDefinedValue(
        pointStateValue,
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
  var pointFill;
  if (!opt_ignorePointSettings) {
    pointFill = iterator.get('fill');
  }
  return {
    'index': iterator.getIndex(),
    'sourceColor': acgraph.vector.normalizeFill(/** @type {!acgraph.vector.Fill} */(
        opt_baseColor || pointFill || this.palette().itemAt(iterator.getIndex()) || 'blue')),
    'iterator': iterator,
    'series': this,
    'chart': this
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
 * Colorizes shape in accordance to current slice colorization settings.
 * Shape is get from current meta 'shape'.
 * @param {anychart.PointState|number} pointState Point state.
 * @protected
 */
anychart.pieModule.Chart.prototype.colorizeSlice = function(pointState) {
  if (this.getOption('mode3d')) {
    this.colorize3DSlice_(pointState);

  } else {
    var iterator = this.getIterator();
    var slice = /** @type {acgraph.vector.Path} */ (iterator.meta('slice'));
    if (goog.isDef(slice)) {
      var fillResolver = anychart.pieModule.Chart.getColorResolver('fill', anychart.enums.ColorType.FILL, true);
      var fillColor = fillResolver(this, pointState, false, null);
      if (this.isRadialGradientMode_(fillColor) && goog.isNull(fillColor.mode)) {
        //fillColor = /** @type {!acgraph.vector.Fill} */(goog.object.clone(/** @type {Object} */(fillColor)));
        fillColor.mode = this.pieBounds_ ? this.pieBounds_ : null;
      }
      slice.fill(fillColor);

      var strokeResolver = anychart.pieModule.Chart.getColorResolver('stroke', anychart.enums.ColorType.STROKE, true);
      var strokeColor = strokeResolver(this, pointState, false, null);
      if (this.isRadialGradientMode_(strokeColor) && goog.isNull(strokeColor.mode)) {
        strokeColor.mode = this.pieBounds_ ? this.pieBounds_ : null;
      }
      slice.stroke(strokeColor);


      var sliceOutline = /** @type {acgraph.vector.Path} */ (this.getIterator().meta('sliceOutline'));
      if (sliceOutline) {
        var outlineEnabled = this.resolveOption('outline.enabled', pointState, iterator, anychart.core.settings.boolOrNullNormalizer, false);
        if (goog.isNull(outlineEnabled))
          outlineEnabled = this.resolveOption('outline.enabled', 0, iterator, anychart.core.settings.boolOrNullNormalizer, false);

        if (outlineEnabled) {
          fillResolver = anychart.pieModule.Chart.getColorResolver('outline.fill', anychart.enums.ColorType.FILL, true);
          var fillColor_ = fillResolver(this, 0, false, fillColor);
          fillColor = fillResolver(this, pointState, false, fillColor_);
          if (this.isRadialGradientMode_(fillColor) && goog.isNull(fillColor.mode)) {
            //fillColor = /** @type {!acgraph.vector.Fill} */(goog.object.clone(/** @type {Object} */(fillColor)));
            fillColor.mode = this.pieBounds_ ? this.pieBounds_ : null;
          }

          strokeResolver = anychart.pieModule.Chart.getColorResolver('outline.stroke', anychart.enums.ColorType.STROKE, true);
          strokeColor = strokeResolver(this, pointState, false, strokeColor);
          if (this.isRadialGradientMode_(strokeColor) && goog.isNull(strokeColor.mode)) {
            strokeColor.mode = this.pieBounds_ ? this.pieBounds_ : null;
          }
        } else {
          fillColor = strokeColor = 'none';
        }

        sliceOutline
            .fill(fillColor)
            .stroke(strokeColor);
      }

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


//endregion
//region --- Checkers
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
 * @return {boolean} Define, is labels have outside position.
 */
anychart.pieModule.Chart.prototype.isOutsideLabels = function() {
  return anychart.enums.normalizeSidePosition(this.labels().getOption('position')) == anychart.enums.SidePosition.OUTSIDE;
};


/** @inheritDoc */
anychart.pieModule.Chart.prototype.isNoData = function() {
  var rowsCount = this.getIterator().getRowsCount();
  return (!rowsCount);
};


//endregion
//region --- Center content
/**
 * Pie center settings.
 * @param {Object=} opt_value
 * @return {anychart.pieModule.Chart|anychart.core.ui.Center}
 */
anychart.pieModule.Chart.prototype.center = function(opt_value) {
  if (!this.center_) {
    this.center_ = new anychart.core.ui.Center(this);
    this.center_.listenSignals(this.pieCenterInvalidated_, this);

    this.setupCreated('center', this.center_);
  }

  if (goog.isDef(opt_value)) {
    this.center_.setup(opt_value);
    return this;
  }

  return this.center_;
};


/**
 * Pie center signal listener.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.pieModule.Chart.prototype.pieCenterInvalidated_ = function(event) {
  var state = 0, signal = 0;
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    state |= anychart.ConsistencyState.APPEARANCE;
    signal |= anychart.Signal.NEEDS_REDRAW;
  }

  if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    state |= anychart.ConsistencyState.PIE_CENTER_CONTENT | anychart.ConsistencyState.BOUNDS;
    signal |= anychart.Signal.NEEDS_REDRAW;
  }

  this.invalidate(state, signal);
};


//endregion
//region --- Labels
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
 * Internal label invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.pieModule.Chart.prototype.outlineInvalidated_ = function(event) {
  this.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Create pie label format provider.
 * @param {boolean=} opt_force create context provider forcibly.
 * @return {anychart.format.Context} Object with info for labels formatting.
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
    values['name'] = {value: iterator.meta('name'), type: anychart.enums.TokenType.STRING};
    values['groupedPoint'] = {value: true, type: anychart.enums.TokenType.STRING};
    values['names'] = {value: iterator.meta('names'), type: anychart.enums.TokenType.UNKNOWN};
    values['values'] = {value: iterator.meta('values'), type: anychart.enums.TokenType.UNKNOWN};
  }

  return /** @type {anychart.format.Context} */ (this.pointProvider_.propagate(values));
};


/**
 * Create column position provider.
 * @return {Object} Object with info for labels formatting.
 * @protected
 */
anychart.pieModule.Chart.prototype.createPositionProvider = function() {
  var outside = this.isOutsideLabels();
  var iterator = this.getIterator();
  var start = /** @type {number} */ (iterator.meta('start'));
  var sweep = /** @type {number} */ (iterator.meta('sweep'));
  var singlePoint = (iterator.getRowsCount() == 1) || sweep == 360;
  var pointState = this.state.getPointStateByIndex(iterator.getIndex());
  var explode = this.getExplode(pointState);
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

      if (explode) {
        xRadius += explode;
        yRadius += this.get3DYRadius(explode);
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

        if (explode) {
          xRadius += explode;
          yRadius += this.get3DYRadius(explode);
        }
      }
    }

    return {'value': {'angle': angle, 'radius': xRadius, 'radiusY': yRadius}};
  } else {
    if (outside) {
      dR = this.radiusValue_ + this.connectorLengthValue_ + explode;
    } else {
      var radius = (singlePoint && !this.innerRadiusValue_) ? 0 : this.radiusValue_ - this.innerRadiusValue_;
      dR = anychart.utils.normalizeSize(insideLabelsOffset, radius) + this.innerRadiusValue_ + explode;
    }

    return {'value': {'angle': angle, 'radius': dR, 'outerRadius': this.radiusValue_, 'innerRadius': this.innerRadiusValue_}};
  }
};


//endregion
//region --- Calculating outside labels and connectors
/**
 * Init connector elements.
 */
anychart.pieModule.Chart.prototype.initConnectorElements = function() {
  //region init connector elements
  this.connectorAnchorCoords = [];
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
  //endregion
};


/**
 * Calculating outside labels.
 */
anychart.pieModule.Chart.prototype.calculateOutsideLabels = function() {
  var iterator = this.getIterator();

  /*
    Position needs to be restored after all operation
    because of DVF-4112 issue.
    The general reason is in fact that calculateOutsideLabels()
    resets iterator and calcDomain() changes index of iterator as well.
    It breaks processing of APPEARANCE state on chart draw.
   */
  var previousPosition = iterator.getIndex();

  var label, x0, y0, radius, isRightSide;
  var connectorPath, connector;
  var mode3d = this.getOption('mode3d');
  var allowOverlap = this.getOption('overlapMode') == anychart.enums.LabelsOverlapMode.ALLOW_OVERLAP;

  this.initConnectorElements();

  //region calculate absolute labels position, sort labels, separation of the labels on the left and right side
  var arr, explodeLevels, switchToRightSide, switchToLeftSide;
  if (!allowOverlap) {
    explodeLevels = {};
    switchToRightSide = false;
    switchToLeftSide = false;
  }

  iterator.reset();
  while (iterator.advance()) {
    if (this.isMissing_(iterator.get('value'))) continue;
    var index = iterator.getIndex();
    var pointState = this.state.getPointStateByIndex(index);

    var start = /** @type {number} */ (iterator.meta('start'));
    var sweep = /** @type {number} */ (iterator.meta('sweep'));

    var angle = (start + sweep / 2) * Math.PI / 180;
    var angleDeg = goog.math.standardAngle(goog.math.toDegrees(angle));

    isRightSide = angleDeg < 90 || angleDeg > 270;

    var center = this.getSliceCenterCoords(index);
    radius = mode3d ? this.get3DYRadius(this.radiusValue_) : this.radiusValue_;

    // coordinates of the point where the connector touches a pie
    x0 = center[0] + this.radiusValue_ * Math.cos(angle);
    y0 = center[1] + radius * Math.sin(angle);

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
    label = this.drawLabel_(pointState, false);
    this.dropLabelBoundsCache(label);

    label.angle_ = angleDeg;

    var explode = this.getExplode(pointState);
    iterator.meta('explode', explode);

    if (this.lableToDrop && goog.array.indexOf(this.lableToDrop, index) != -1) {
      label.enabled(false);
    }

    if (allowOverlap) {
      if (label && label.enabled() != false) {
        index = label.getIndex();

        this.dropLabelBoundsCache(label);
        var bounds = this.getLabelBounds(label);
        var boundsForCompare = explode ? this.contentBounds : this.piePlotBounds_;

        this.labelsRadiusOffset_ = Math.max(
            boundsForCompare.left - bounds.left,
            bounds.getRight() - boundsForCompare.getRight(),
            boundsForCompare.top - bounds.top,
            bounds.getBottom() - boundsForCompare.getBottom(),
            this.labelsRadiusOffset_);

        if (!this.drawnConnectors_[index]) {
          y0 = this.connectorAnchorCoords[index * 2 + 1] - this.get3DHeight() / 2;
          if (mode3d && y0 < this.cy) {
            connectorPath = /** @type {acgraph.vector.Path} */(this.connectorsLowerLayer_.genNextChild());
          } else {
            connectorPath = /** @type {acgraph.vector.Path} */(this.connectorsLayer_.genNextChild());
          }
          this.drawnConnectors_[index] = connectorPath;
          connectorPath.stroke(/** @type {acgraph.vector.Stroke} */ (this.getOption('connectorStroke')));
          this.drawConnectorLine(label, connectorPath);
        }
      }
    } else {
      var explodeLevel, left, right, left2, right2;
      if (!(explodeLevel = explodeLevels[explode])) {
        explodeLevel = [];
        left = [];
        right = [];
        left2 = [];
        right2 = [];
        explodeLevel.push(left, right, left2, right2, explode);
        explodeLevels[explode] = explodeLevel;
      } else {
        left = explodeLevel[0];
        right = explodeLevel[1];
        left2 = explodeLevel[2];
        right2 = explodeLevel[3];
      }

      if (angleDeg > 270 && !switchToRightSide && (left.length || (left2 && left2.length))) {
        switchToRightSide = true;
      }

      if (angleDeg > 90 && !switchToLeftSide && (right.length || (right2 && right2.length))) {
        switchToLeftSide = true;
      }

      //Target array chosen.
      if (isRightSide) {
        arr = switchToRightSide ? right2 : right;
      } else {
        arr = switchToLeftSide ? left2 : left;
      }
      arr.push(label);
    }
  }
  //endregion

  this.indexOfMaxLabel = NaN;

  if (!allowOverlap) {
    //@todo (blackart) for debug purpose
    // var ___name = 'cb_';
    // if (!this[___name]) this[___name] = this.container().rect().zIndex(1000).stroke('green');
    // this[___name].setBounds(this.contentBounds);
    //
    // var ___name = 'ppb_';
    // if (!this[___name]) this[___name] = this.container().rect().zIndex(1000).stroke('blue');
    // this[___name].setBounds(this.piePlotBounds_);

    var labelsToCompare = [];
    goog.array.forEachRight(/** @type {Array} */(goog.object.getValues(/** @type {Object} */(explodeLevels))), function(explodeLevel) {
      var right = explodeLevel[3].concat(explodeLevel[1]);
      var left = explodeLevel[2].concat(explodeLevel[0]);
      var explode = explodeLevel[4];

      this.calcDomain(left, false, labelsToCompare, explode);
      this.calcDomain(right, true, labelsToCompare, explode);

      labelsToCompare = labelsToCompare.concat(left, right);
    }, this);
  }
  iterator.select(previousPosition);

  if (!this.maxLabelIndexesArr_)
    this.maxLabelIndexesArr_ = [];

  if (!this.lableToDrop)
    this.lableToDrop = [];

  index = this.indexOfMaxLabel;
  if (goog.array.indexOf(this.maxLabelIndexesArr_, index) != -1) {
    if (goog.array.peek(this.maxLabelIndexesArr_) != index) {
      this.lableToDrop.push(index);
      this.maxLabelIndexesArr_.length = 0;
    }
  } else {
    this.maxLabelIndexesArr_.push(index);
  }

  this.labelsRadiusOffset_ = Math.round(this.labelsRadiusOffset_);
};


/**
 * Calculate labels domain.
 * @param {Array.<anychart.core.ui.CircularLabelsFactory.Label>} labels .
 * @param {boolean} isRightSide .
 * @param {Array.<anychart.core.ui.CircularLabelsFactory.Label>=} opt_labelsForComparing .
 * @param {number=} opt_explode .
 */
anychart.pieModule.Chart.prototype.calcDomain = function(labels, isRightSide, opt_labelsForComparing, opt_explode) {
  var i, len, droppedLabels, notIntersection, m, l, domainBounds, domain = null, label, bounds;
  var iterator = this.getIterator();
  var domains = [];
  var labelsIterator = isRightSide ? goog.array.forEachRight : goog.array.forEach;

  labelsIterator(labels, function(label) {
    if (label && label.enabled() != false) {
      iterator.select(label.getIndex());
      label.formatProvider(this.createFormatProvider());
      bounds = this.getLabelBounds(label);

      if (!domain || (domain.isNotIntersect(bounds))) {
        if (domain) domains.push(domain);
        domain = new anychart.pieModule.Chart.PieOutsideLabelsDomain(isRightSide, this, domains, opt_explode || 0);
        domain.addLabel(label);
      } else {
        domain.addLabel(label);
      }
    }
  }, this);

  if (domain) domains.push(domain);

  for (i = 0, len = domains.length; i < len; i++) {
    domain = domains[i];
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

    labelsIterator(droppedLabels, function(label) {
      if (label) {
        iterator.select(label.getIndex());
        label.formatProvider(this.createFormatProvider());
        bounds = this.getLabelBounds(label);

        notIntersection = true;
        for (m = 0, l = domains.length; m < l; m++) {
          notIntersection = notIntersection && domains[m].isNotIntersect(bounds);
        }

        if (notIntersection) {
          if (!domain) {
            domain = new anychart.pieModule.Chart.PieOutsideLabelsDomain(isRightSide, this, [], opt_explode || 0);
          }
          domain.softAddLabel(label);
          domainBounds = domain.getBounds();

          notIntersection = true;
          for (m = 0; m < l; m++) {
            notIntersection = notIntersection && domains[m].isNotIntersect(domainBounds);
          }

          if (domain.isCriticalAngle || !notIntersection) {
            domain.labels.pop().enabled(false);
            domain.calcDomain();
            domains.push(domain);
            domain = null;
          } else {
            label.enabled(true);
          }
        } else {
          if (domain) {
            domains.push(domain);
            domain = null;
          }
        }
      }
    }, this);

    if (domain)
      domains.push(domain);
  }

  var y0, connectorPath, index, k, z, labelsLen, labelsForComparingLen;
  var mode3d = this.getOption('mode3d');
  var connectorStroke = /** @type {acgraph.vector.Stroke} */ (this.getOption('connectorStroke'));

  for (i = 0, len = domains.length; i < len; i++) {
    domain = domains[i];
    if (domain) {
      domain.applyPositions();

      for (k = 0, labelsLen = domain.labels.length; k < labelsLen; k++) {
        label = domain.labels[k];
        if (label && label.enabled() != false) {
          this.dropLabelBoundsCache(label);
          index = label.getIndex();
          iterator.select(index);

          bounds = this.getLabelBounds(label);
          if (opt_labelsForComparing) {
            var c_x0 = this.connectorAnchorCoords[index * 2];
            var c_y0 = this.connectorAnchorCoords[index * 2 + 1];

            var connector = /** @type {number} */(iterator.meta('connector'));
            var positionProvider = label.positionProvider()['value'];

            var angle = positionProvider['angle'];
            var angleRad = goog.math.toRadians(angle);
            var radius = positionProvider['radius'];

            var c_x1 = this.cx + radius * Math.cos(angleRad) - connector;
            var c_y1 = this.cy + radius * Math.sin(angleRad);

            for (z = 0, labelsForComparingLen = opt_labelsForComparing.length; z < labelsForComparingLen; z++) {
              var comparingLabel = opt_labelsForComparing[z];
              this.dropLabelBoundsCache(comparingLabel);

              var comparingBounds = this.getLabelBounds(comparingLabel);
              var comparingLabelIndex = comparingLabel.getIndex();

              var center = this.getSliceCenterCoords(comparingLabelIndex);
              var cx = center[0], cy = center[1];

              var start = /** @type {number} */ (iterator.meta('start'));
              var sweep = /** @type {number} */ (iterator.meta('sweep'));

              //Coords of comparing label connector
              var cc_x0 = this.connectorAnchorCoords[comparingLabelIndex * 2];
              var cc_y0 = this.connectorAnchorCoords[comparingLabelIndex * 2 + 1];

              connector = /** @type {number} */(iterator.meta('connector'));
              positionProvider = comparingLabel.positionProvider()['value'];

              angle = positionProvider['angle'];
              angleRad = goog.math.toRadians(angle);
              radius = positionProvider['radius'];

              var cc_x1 = this.cx + radius * Math.cos(angleRad) - connector;
              var cc_y1 = this.cy + radius * Math.sin(angleRad);

              //Coords of slice sides
              angleRad = goog.math.toRadians(start);
              var startSliceLinePointInner_x = cx + this.innerRadiusValue_ * Math.cos(angleRad);
              var startSliceLinePointInner_y = cy + this.innerRadiusValue_ * Math.sin(angleRad);

              var startSliceLinePointOuter_x = cx + this.radiusValue_ * Math.cos(angleRad);
              var startSliceLinePointOuter_y = cy + this.radiusValue_ * Math.sin(angleRad);

              angleRad = goog.math.toRadians(start + sweep);
              var endSliceLinePointInner_x = cx + this.innerRadiusValue_ * Math.cos(angleRad);
              var endSliceLinePointInner_y = cy + this.innerRadiusValue_ * Math.sin(angleRad);

              var endSliceLinePointOuter_x = cx + this.radiusValue_ * Math.cos(angleRad);
              var endSliceLinePointOuter_y = cy + this.radiusValue_ * Math.sin(angleRad);

              var cbbox = bounds.toCoordinateBox();

              var isIntersect =
                  anychart.math.checkRectIntersection(cbbox, comparingBounds.toCoordinateBox()) ||
                  anychart.math.checkRectIntersectionWithSegment(startSliceLinePointInner_x, startSliceLinePointInner_y, startSliceLinePointOuter_x, startSliceLinePointOuter_y, cbbox) ||
                  anychart.math.checkRectIntersectionWithSegment(endSliceLinePointInner_x, endSliceLinePointInner_y, endSliceLinePointOuter_x, endSliceLinePointOuter_y, cbbox) ||
                  anychart.math.checkRectIntersectionWithSegment(cc_x0, cc_y0, cc_x1, cc_y1, cbbox) ||
                  anychart.math.checkSegmentsIntersection(c_x0, c_y0, c_x1, c_y1, startSliceLinePointInner_x, startSliceLinePointInner_y, startSliceLinePointOuter_x, startSliceLinePointOuter_y) ||
                  anychart.math.checkSegmentsIntersection(c_x0, c_y0, c_x1, c_y1, endSliceLinePointInner_x, endSliceLinePointInner_y, endSliceLinePointOuter_x, endSliceLinePointOuter_y) ||
                  anychart.math.checkSegmentsIntersection(cc_x0, cc_y0, cc_x1, cc_y1, c_x0, c_y0, c_x1, c_y1) ||
                  anychart.math.checkRectIntersection(cbbox, [startSliceLinePointOuter_x, startSliceLinePointOuter_y, startSliceLinePointInner_x, startSliceLinePointInner_y]) ||
                  anychart.math.checkRectIntersection(cbbox, [endSliceLinePointOuter_x, endSliceLinePointOuter_y, endSliceLinePointInner_x, endSliceLinePointInner_y]);

              if (isIntersect) {
                label.enabled(false);
                break;
              }
            }
          }

          if (label.enabled() != false) {
            if (this.recalculateBounds_ || this.needsForceBoundsRecalculation_) {
              var boundsForCompare = opt_explode ? this.contentBounds : this.piePlotBounds_;

              var labelsRadiusOffset = Math.max(
                  boundsForCompare.left - bounds.left,
                  bounds.getRight() - boundsForCompare.getRight(),
                  boundsForCompare.top - bounds.top,
                  bounds.getBottom() - boundsForCompare.getBottom()
              );

              if (labelsRadiusOffset > this.labelsRadiusOffset_) {
                this.indexOfMaxLabel = index;
              }

              this.labelsRadiusOffset_ = Math.max(this.labelsRadiusOffset_, labelsRadiusOffset);
            }

            if (!this.drawnConnectors_[index]) {
              y0 = this.connectorAnchorCoords[index * 2 + 1] - this.get3DHeight() / 2;
              if (mode3d && y0 < this.cy) {
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
          tmpDomain = new anychart.pieModule.Chart.PieOutsideLabelsDomain(isRightSide, this, sourcePieLabelsDomains, domain.explode);
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


//endregion
//region --- Drawing
/**
 * Calculating common values for a pie plot.
 * @param {anychart.math.Rect} bounds Bounds of the content area.
 * @private
 */
anychart.pieModule.Chart.prototype.calculateBounds_ = function(bounds) {
  this.minWidthHeight_ = Math.min(bounds.width, bounds.height);

  var normalExplode = this.getExplode(anychart.PointState.NORMAL, true);
  var hoveredExplode = this.getExplode(anychart.PointState.HOVER, true);
  var selectedExplode = this.getExplode(anychart.PointState.SELECT, true);

  var maxExplode = Math.max(normalExplode, hoveredExplode || 0, selectedExplode || 0);

  var iterator = this.getIterator();
  iterator.reset();
  while (iterator.advance()) {
    normalExplode = this.getExplode(anychart.PointState.NORMAL);
    hoveredExplode = this.getExplode(anychart.PointState.HOVER);
    selectedExplode = this.getExplode(anychart.PointState.SELECT);
    maxExplode = Math.max(normalExplode, hoveredExplode || 0, selectedExplode || 0, maxExplode);
  }

  var isLabelsEnabled = this.normal_.labels().enabled() || this.hovered_.labels().enabled() || this.selected_.labels().enabled();
  var clampPie = (this.isOutsideLabels() && isLabelsEnabled ? maxExplode : 0);

  this.piePlotBounds_ = anychart.math.rect(
      bounds.left + clampPie,
      bounds.top + clampPie,
      bounds.width - 2 * clampPie,
      bounds.height - 2 * clampPie);


  var minWidthHeightOfPieBounds = this.minWidthHeight_ - 2 * clampPie;

  // var ___name = 'ppb';
  // if (!this[___name]) this[___name] = this.container().rect().zIndex(1000);
  // this[___name].setBounds(this.piePlotBounds_);
  //
  // var ___name = 'bbounds';
  // if (!this[___name]) this[___name] = this.container().rect().zIndex(1000);
  // this[___name].setBounds(bounds);

  var radiusX = Math.max(anychart.utils.normalizeSize(/** @type {number|string} */ (this.getOption('radius')), minWidthHeightOfPieBounds), 0);
  var mode3d = /** @type {boolean} */ (this.getOption('mode3d'));
  if (mode3d) {
    var radiusXMax = Math.min(radiusX, (bounds.width - 2 * clampPie) / 2);
    var ratioSum = anychart.pieModule.Chart.ASPECT_3D + anychart.pieModule.Chart.PIE_THICKNESS;
    var radiusYMax = (bounds.height - 2 * clampPie) / (2 * ratioSum);
    this.radiusValue_ = Math.min(radiusXMax, radiusYMax);
  } else {
    this.radiusValue_ = Math.min(minWidthHeightOfPieBounds / 2, radiusX);
  }
  this.connectorLengthValue_ = anychart.utils.normalizeSize(/** @type {number|string} */ (this.getOption('connectorLength')), this.radiusValue_);

  this.originalRadiusValue_ = this.radiusValue_;
  this.labelsRadiusOffset_ = 0;

  this.cx = this.piePlotBounds_.left + this.piePlotBounds_.width / 2;
  this.cy = this.piePlotBounds_.top + this.piePlotBounds_.height / 2;

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

  this.updateBounds();
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
 * Update bounds.
 */
anychart.pieModule.Chart.prototype.updateBounds = function() {
  var labelRadiusOffset = Math.max(this.labelsRadiusOffset_, 0);
  this.radiusValue_ = Math.max(this.radiusValue_ - labelRadiusOffset, 0);

  var innerRadius = /** @type {Function|string|number} */ (this.getOption('innerRadius'));
  this.innerRadiusValue_ = goog.isFunction(innerRadius) ?
      innerRadius(this.radiusValue_) :
      anychart.utils.normalizeSize(innerRadius, this.radiusValue_);

  var innerRectSide = this.innerRadiusValue_ / Math.pow(2, .5) * 2;
  var x = this.cx - innerRectSide / 2;
  var y = this.cy - innerRectSide / 2;
  this.centerContentBounds = anychart.math.rect(x, y, innerRectSide, innerRectSide);

  /**
   * Bounds of pie. (Not bounds of content area).
   * Need for radial gradient to set correct bounds.
   * @type {anychart.math.Rect}
   * @private
   */
  this.pieBounds_ = new anychart.math.Rect(
      this.cx - this.radiusValue_,
      this.cy - this.radiusValue_,
      this.radiusValue_ * 2,
      this.radiusValue_ * 2);

  var labels = this.labels();
  labels.suspendSignalsDispatching();
  labels.cx(this.cx);
  labels.cy(this.cy);
  labels.parentRadius(this.radiusValue_);
  labels.startAngle(/** @type {number} */ (this.getOption('startAngle')));
  labels.sweepAngle(360);
  labels.parentBounds(this.pieBounds_);
  labels.resumeSignalsDispatching(false);

  this.hovered().labels()
      .parentBounds(this.pieBounds_);
};


/**
 * Change center content transformation.
 * @param {anychart.math.Rect} contentBoundingBox .
 */
anychart.pieModule.Chart.prototype.transformCenterContent = function(contentBoundingBox) {
  this.contentBoundingBox_ = contentBoundingBox;

  var ratio = Math.min(this.centerContentBounds.width / this.contentBoundingBox_.width,
      this.centerContentBounds.height / this.contentBoundingBox_.height);
  if (!isFinite(ratio))
    ratio = 0;

  var txCenterContentWidth = ratio * this.contentBoundingBox_.width;
  var txCenterContentHeight = ratio * this.contentBoundingBox_.height;

  var dx = (this.centerContentBounds.left - this.contentBoundingBox_.left * ratio) + (this.centerContentBounds.width - txCenterContentWidth) / 2;
  var dy = (this.centerContentBounds.top - this.contentBoundingBox_.top * ratio) + (this.centerContentBounds.height - txCenterContentHeight) / 2;

  this.center_.contentLayer.setTransformationMatrix(ratio, 0, 0, ratio, dx, dy);
};


/**
 * @inheritDoc
 */
anychart.pieModule.Chart.prototype.beforeDraw = function() {
  if (this.palette_ && anychart.utils.instanceOf(this.palette_, anychart.palettes.RangeColors)) {
    this.palette_.setAutoCount(this.getIterator().getRowsCount());
  }
};


/**
 * Listener for graphics elements rendering.
 */
anychart.pieModule.Chart.prototype.acgraphElementsListener = function() {
  var ccbb = this.center_.realContent.getBounds();

  if (!anychart.math.Rect.equals(ccbb, this.contentBoundingBox_)) {
    this.transformCenterContent(ccbb);
  }
};


/**
 * Listener for graphics elements rendering.
 */
anychart.pieModule.Chart.prototype.chartsListener = function() {
  this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Drawing content.
 * @param {anychart.math.Rect} bounds Bounds of content area.
 */
anychart.pieModule.Chart.prototype.drawContent = function(bounds) {
  this.calculate();
  this.labels().dropCallsCache();
  var iterator = this.getIterator();
  var pointState, value;
  var rowsCount = iterator.getRowsCount();
  var mode3d = /** @type {boolean} */ (this.getOption('mode3d'));

  if (rowsCount > 7) {
    anychart.core.reporting.info(anychart.enums.InfoCode.PIE_TOO_MUCH_POINTS, [rowsCount]);
  }

  // if (!this.tooltip().container()) {
  //   this.tooltip().container(/** @type {acgraph.vector.ILayer} */(this.container()));
  // }

  var center = this.center();
  if (this.hasInvalidationState(anychart.ConsistencyState.PIE_CENTER_CONTENT)) {
    if (center && center.contentLayer) {
      this.center_.clearContent();
      this.center_.contentLayer.parent(this.rootElement);
      this.center_.contentLayer.zIndex(anychart.pieModule.Chart.ZINDEX_CENTER_CONTENT_LAYER);

      if (this.center_.contentLayer) {
        if (anychart.utils.instanceOf(this.center_.realContent, acgraph.vector.Element)) {
          this.center_.contentLayer.getStage().listen(acgraph.vector.Stage.EventType.RENDER_FINISH,
              this.acgraphElementsListener, false, this);
        } else if (anychart.utils.instanceOf(this.center_.realContent, anychart.core.VisualBase)) {
          this.center_.contentLayer.listen(anychart.enums.EventType.CHART_DRAW,
              this.chartsListener, false, this);
        }
      }
    }
    this.markConsistent(anychart.ConsistencyState.PIE_CENTER_CONTENT);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    this.needsForceBoundsRecalculation_ = true;
    this.calculateBounds_(bounds);
    this.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.PIE_LABELS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    this.recalculateBounds_ = true;

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

      var state = iterator.get('state');
      state = state == 'selected' ? anychart.PointState.SELECT :
          state == 'hovered' ? anychart.PointState.HOVER :
          state == 'normal' ? anychart.PointState.NORMAL : NaN;

      if (!isNaN(state)) {
        this.state.setPointState(/** @type {anychart.PointState} */(state), iterator.getIndex());
      }

      iterator
          .meta('start', start)
          .meta('sweep', sweep)
          .meta('explode', this.getExplode(state));

      start += sweep;
    }
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.PIE_LABELS)) {
    if (!this.labels().container()) this.labels().container(this.rootElement);
    this.labels().clear();
    if (this.maxLabelIndexesArr_)
      this.maxLabelIndexesArr_.length = 0;

    if (this.lableToDrop)
      this.lableToDrop.length = 0;

    if (this.connectorsLayer_) {
      this.connectorsLayer_.clear();
      if (mode3d) this.connectorsLowerLayer_.clear();
    }

    if (this.labels().enabled()) {
      var settingsName = this.isOutsideLabels() ? 'outsideLabels' : 'insideLabels';
      var labelsSettings = this.getCreated(settingsName, true, function() {
        var labelsSettings = new anychart.core.Base();
        this.registerDisposable(labelsSettings);
        this.setupCreated(settingsName, labelsSettings);
        return labelsSettings;
      });
      var themePart = labelsSettings.themeSettings;
      this.labels().setAutoColor(themePart['autoColor']);
      this.labels()['disablePointerEvents'](themePart['disablePointerEvents']);
      if (this.isOutsideLabels()) {
        if (this.recalculateBounds_ || this.needsForceBoundsRecalculation_) {
          this.radiusValue_ = this.originalRadiusValue_;
          this.labelsRadiusOffset_ = Number.NEGATIVE_INFINITY;
        }
        this.calculateOutsideLabels();

        if (this.recalculateBounds_ || this.needsForceBoundsRecalculation_) {
          var iteration = 5;
          var error = 10;
          //todo (blackart) for debug purpose
          // console.log('iteration:', iteration, 'labels offset:', this.labelsRadiusOffset_, 'maxLabel:', this.indexOfMaxLabel, 'label for drop:', this.lableToDrop );

          for (; this.labelsRadiusOffset_ && isFinite(this.labelsRadiusOffset_) && iteration && Math.abs(this.labelsRadiusOffset_) > error;) {
            this.updateBounds();

            this.labelsRadiusOffset_ = Number.NEGATIVE_INFINITY;

            this.labels().clear();
            if (this.connectorsLayer_) {
              this.connectorsLayer_.clear();
              if (mode3d)
                this.connectorsLowerLayer_.clear();
            }

            this.calculateOutsideLabels();
            iteration--;
            //todo (blackart) for debug purpose
            // console.log('iteration:', iteration, 'labels offset:', this.labelsRadiusOffset_, 'maxLabel:', this.indexOfMaxLabel, 'label for drop:', this.lableToDrop );
          }

          this.invalidate(anychart.ConsistencyState.BOUNDS);
        }
      } else {
        iterator.reset();
        while (iterator.advance()) {
          if (this.isMissing_(iterator.get('value'))) continue;
          pointState = this.state.getPointStateByIndex(iterator.getIndex());
          var hovered = this.state.isStateContains(pointState, anychart.PointState.HOVER);
          this.drawLabel_(pointState, hovered);
        }
      }
    }

    this.labels().draw();
    this.labels().getDomElement().clip(bounds);

    this.invalidate(anychart.ConsistencyState.APPEARANCE);
    this.markConsistent(anychart.ConsistencyState.PIE_LABELS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    var hasOutLine = this.normal_.outline().getOption('offset') || this.normal_.outline().getOption('width') ||
        this.hovered_.outline().getOption('offset') || this.hovered_.outline().getOption('width') ||
        this.selected_.outline().getOption('offset') || this.selected_.outline().getOption('width');

    if (this.outlineLayer_) {
      this.outlineLayer_.clear();
    } else if (hasOutLine) {
      this.outlineLayer_ = new anychart.core.utils.TypedLayer(function() {
        return acgraph.path();
      }, function(child) {
        (/** @type {acgraph.vector.Path} */ (child)).clear();
      });
      this.outlineLayer_.zIndex(anychart.pieModule.Chart.ZINDEX_PIE);
      this.outlineLayer_.parent(this.rootElement);
    }

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

    iterator.reset();
    while (iterator.advance()) {
      if (this.isMissing_(iterator.get('value'))) continue;
      pointState = this.state.getPointStateByIndex(iterator.getIndex());
      if (mode3d) {
        this.prepare3DSlice_();
      } else {
        this.drawSlice_(pointState);
      }
    }

    if (mode3d) {
      this.draw3DSlices_();
    }

    var connectorStroke = /** @type {acgraph.vector.Stroke} */ (this.getOption('connectorStroke'));
    if (this.drawnConnectors_) {
      for (var i = 0; i < this.drawnConnectors_.length; i++) {
        var conn = this.drawnConnectors_[i];
        if (conn)
          conn.stroke(connectorStroke);
      }
    }

    if (this.innerRadiusValue_) {
      var centerContentFill = /** @type {acgraph.vector.Stroke} */ (this.center_.getOption('fill'));
      var centerContentStroke = /** @type {acgraph.vector.Stroke} */ (this.center_.getOption('stroke'));

      if (!this.centerContentBg_)
        this.centerContentBg_ = acgraph.circle();

      var radius = this.innerRadiusValue_ - acgraph.vector.getThickness(centerContentStroke) / 2;

      this.centerContentBg_
          .parent(this.rootElement)
          .zIndex(anychart.pieModule.Chart.ZINDEX_CENTER_CONTENT_BG)
          .stroke(centerContentStroke)
          .fill(centerContentFill)
          .radius(radius);
    } else if (this.centerContentBg_) {
      this.centerContentBg_.parent(null);
    }

    if (this.hoveredLabelConnectorPath_)
      this.hoveredLabelConnectorPath_.stroke(connectorStroke);

    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    if (center) {
      var realContent = center.realContent;
      var contentLayer = center.contentLayer;
      if (anychart.utils.instanceOf(realContent, acgraph.vector.Element)) {
        var ccbb = realContent.getBounds();
        this.transformCenterContent(ccbb);
        contentLayer.clip(null);
      } else if (anychart.utils.instanceOf(realContent, anychart.core.VisualBase)) {
        realContent.parentBounds(this.centerContentBounds);
        realContent.resumeSignalsDispatching(false);
        realContent.draw();

        contentLayer.setTransformationMatrix(1, 0, 0, 1, 0, 0);
        contentLayer.clip(acgraph.circle(this.cx, this.cy, this.innerRadiusValue_ + 2));
      }

      if (this.centerContentBg_ && this.innerRadiusValue_) {
        this.centerContentBg_
            .centerX(this.cx)
            .centerY(this.cy);
      }
    }
  }

  this.needsForceBoundsRecalculation_ = false;
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

  var state = anychart.core.utils.InteractivityState.clarifyState(pointState);

  var hovered = state == anychart.PointState.HOVER;
  var selected = state == anychart.PointState.SELECT;

  var mainFactory = this.labels();
  var stateFactory = selected ? this.selected_.labels() : hovered ? this.hovered_.labels() : null;

  var pointLabel = iterator.get('normal');
  pointLabel = goog.isDef(pointLabel) ? pointLabel['label'] : void 0;

  var statePointLabel = selected ? iterator.get('selected') : hovered ? iterator.get('hovered') : void 0;
  statePointLabel = goog.isDef(statePointLabel) ? statePointLabel['label'] : void 0;

  pointLabel = anychart.utils.getFirstDefinedValue(pointLabel, iterator.get('label'));
  statePointLabel = selected ? anychart.utils.getFirstDefinedValue(statePointLabel, iterator.get('selectLabel')) :
      hovered ? anychart.utils.getFirstDefinedValue(statePointLabel, iterator.get('hoverLabel')) : null;

  var index = iterator.getIndex();

  var label = mainFactory.getLabel(index);

  var labelEnabled = pointLabel && goog.isDef(pointLabel['enabled']) ? pointLabel['enabled'] : null;
  var stateLabelEnabled = statePointLabel && goog.isDef(statePointLabel['enabled']) ? statePointLabel['enabled'] : null;

  var isDraw = (hovered || selected) ?
      goog.isNull(stateLabelEnabled) ?
          goog.isNull(stateFactory.enabled()) ?
              goog.isNull(labelEnabled) ?
                  (label && goog.isDef(label.enabled())) ?
                      label.enabled() :
                      mainFactory.enabled() :
                  labelEnabled :
              stateFactory.enabled() :
          stateLabelEnabled :
      goog.isNull(labelEnabled) ?
          (label && goog.isDef(label.enabled())) ?
              label.enabled() :
              mainFactory.enabled() :
          labelEnabled;

  var enabled;
  var wasNoLabel;
  var anchor;
  var formatProvider = this.createFormatProvider(true);
  var positionProvider = this.createPositionProvider();
  if (isDraw) {
    if (wasNoLabel = !label) {
      label = mainFactory.add(formatProvider, positionProvider, index);
    }

    // save enabled setting for label
    enabled = label.enabled();

    label.resetSettings();
    label.currentLabelsFactory(/** @type {anychart.core.ui.LabelsFactory} */(stateFactory));
    label.setSettings(/** @type {Object} */(pointLabel), /** @type {Object} */(statePointLabel));
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
    label = mainFactory.add(formatProvider, positionProvider, index);
    anchor = iterator.meta('anchor');
    if (goog.isDef(anchor))
      label['anchor'](/** @type {string} */(anchor));
    label.enabled(false);
  }

  if (opt_updateConnector)
    this.updateConnector_(/** @type {anychart.core.ui.CircularLabelsFactory.Label} */(label), isDraw);

  return /** @type {anychart.core.ui.CircularLabelsFactory.Label} */(label);
};


/**
 * Draws connector line for label.
 * @param {anychart.core.ui.CircularLabelsFactory.Label} label Label.
 * @param {acgraph.vector.Path} path Connector path element.
 */
anychart.pieModule.Chart.prototype.drawConnectorLine = function(label, path) {
  var iterator = this.data().getIterator();
  var index = label.getIndex();
  var mode3d = /** @type {boolean} */ (this.getOption('mode3d'));

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
    var radiusY = mode3d ? positionProvider['radiusY'] + offsetRadius : radius;

    var x = this.cx + radius * Math.cos(angleRad) - connector;
    var y = this.cy + radiusY * Math.sin(angleRad);

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
 * Draws label for a slice.
 * @private
 * @param {anychart.PointState|number} pointState Point state.
 * @param {boolean=} opt_updateConnector Whether to update connector or not. Used only with outside labels.
 * @return {anychart.core.ui.CircularLabelsFactory.Label} Label.
 */
anychart.pieModule.Chart.prototype.drawLabel_ = function(pointState, opt_updateConnector) {
  if (this.isOutsideLabels())
    return this.drawOutsideLabel_(pointState, opt_updateConnector);

  pointState = anychart.core.utils.InteractivityState.clarifyState(pointState);

  var hovered = pointState == anychart.PointState.HOVER;
  var selected = pointState == anychart.PointState.SELECT;

  var iterator = this.getIterator();

  var mainFactory = this.labels();
  var stateFactory = selected ? this.selected_.labels() : hovered ? this.hovered_.labels() : null;

  var pointLabel = iterator.get('normal');
  pointLabel = goog.isDef(pointLabel) ? pointLabel['label'] : void 0;

  var statePointLabel = selected ? iterator.get('selected') : hovered ? iterator.get('hovered') : void 0;
  statePointLabel = goog.isDef(statePointLabel) ? statePointLabel['label'] : void 0;

  pointLabel = anychart.utils.getFirstDefinedValue(pointLabel, iterator.get('label'));
  statePointLabel = selected ? anychart.utils.getFirstDefinedValue(statePointLabel, iterator.get('selectLabel')) :
      hovered ? anychart.utils.getFirstDefinedValue(statePointLabel, iterator.get('hoverLabel')) : null;

  var index = iterator.getIndex();
  var label = mainFactory.getLabel(index);

  var labelEnabled = pointLabel && goog.isDef(pointLabel['enabled']) ? pointLabel['enabled'] : null;
  var stateLabelEnabled = statePointLabel && goog.isDef(statePointLabel['enabled']) ? statePointLabel['enabled'] : null;

  var positionProvider = this.createPositionProvider();
  var formatProvider = this.createFormatProvider(true);

  var mode3d = /** @type {boolean} */ (this.getOption('mode3d'));

  var isNotNormalState = hovered || selected;

  var isFitToSlice = true;
  if ((!isNotNormalState || (isNotNormalState && !this.getOption('forceHoverLabels'))) && this.getOption('overlapMode') != anychart.enums.LabelsOverlapMode.ALLOW_OVERLAP) {
    var start = /** @type {number} */ (iterator.meta('start'));
    var sweep = /** @type {number} */ (iterator.meta('sweep'));

    var cx = this.cx;
    var cy = this.cy;

    var angle;
    var explode = this.getExplode(pointState);
    if (explode) {
      angle = (start + sweep / 2) * Math.PI / 180;
      var ex = explode * Math.cos(angle);
      var ey = (mode3d ? this.get3DYRadius(explode) : explode) * Math.sin(angle);
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
    this.measureLabel_.currentLabelsFactory(mainFactory);
    this.measureLabel_.setSettings(/** @type {Object} */(pointLabel), /** @type {Object} */(statePointLabel));

    var bounds = this.labels().measureWithTransform(this.measureLabel_, null, null, index);

    var singlePiePoint = ((iterator.getRowsCount() == 1 || sweep == 360) && !this.innerRadiusValue_);
    var notIntersectStartLine = singlePiePoint || !anychart.math.checkRectIntersectionWithSegment(ax, ay, cx, cy, bounds);
    var notIntersectEndLine = singlePiePoint || !anychart.math.checkRectIntersectionWithSegment(cx, cy, bx, by, bounds);
    var notIntersectPieOuterRadius = !anychart.math.checkForRectIsOutOfCircleBounds(cx, cy, this.radiusValue_, bounds);
    var notIntersectPieInnerRadius = singlePiePoint || anychart.math.checkForRectIsOutOfCircleBounds(cx, cy, this.innerRadiusValue_, bounds);

    isFitToSlice = notIntersectStartLine && notIntersectEndLine && notIntersectPieOuterRadius && notIntersectPieInnerRadius;
  }

  var isDraw = isNotNormalState ?
      goog.isNull(stateLabelEnabled) ?
          goog.isNull(stateFactory.enabled()) ?
              goog.isNull(labelEnabled) ?
                  mainFactory.enabled() :
                  labelEnabled :
              stateFactory.enabled() :
          stateLabelEnabled :
      goog.isNull(labelEnabled) ?
          mainFactory.enabled() :
          labelEnabled;

  if (isDraw && isFitToSlice) {
    if (label) {
      label.formatProvider(formatProvider);
      label.positionProvider(positionProvider);
    } else {
      label = mainFactory.add(formatProvider, positionProvider, index);
    }

    label.resetSettings();
    label.currentLabelsFactory(/** @type {anychart.core.ui.LabelsFactory} */(stateFactory));
    label.setSettings(/** @type {Object} */(pointLabel), /** @type {Object} */(statePointLabel));

    //todo: this shit should be reworked when labelsFactory will be reworked
    //if usual label isn't disabled and not drawn then it doesn't have container and hover label doesn't know nothing
    //about its DOM element and trying to apply itself setting to it. But nothing will happen because container is empty.
    if (hovered && !label.container() && mainFactory.getDomElement()) {
      label.container(mainFactory.getDomElement());
      if (!label.container().parent()) {
        label.container().parent(/** @type {acgraph.vector.ILayer} */(mainFactory.container()));
      }
    }
  } else if (label) {
    mainFactory.clear(label.getIndex());
  }
  return /** @type {anychart.core.ui.CircularLabelsFactory.Label} */(label);
};


/**
 * Internal function for drawing a slice by arguments.
 * @param {anychart.PointState|number} pointState Point state.
 * @param {boolean=} opt_update Whether to update current slice.
 * @return {boolean} True if point is drawn.
 * @private
 */
anychart.pieModule.Chart.prototype.drawSlice_ = function(pointState, opt_update) {
  var iterator = this.getIterator();

  var index = /** @type {number} */ (iterator.getIndex());
  var start = /** @type {number} */ (iterator.meta('start'));
  var sweep = /** @type {number} */ (iterator.meta('sweep'));

  /** @type {!acgraph.vector.Path} */
  var slice;
  /** @type {!acgraph.vector.Path} */
  var sliceOutline;
  /** @type {acgraph.vector.Path} */
  var hatchSlice;
  if (opt_update) {
    slice = /** @type {!acgraph.vector.Path} */ (iterator.meta('slice'));
    sliceOutline = /** @type {!acgraph.vector.Path} */ (iterator.meta('sliceOutline'));
    hatchSlice = /** @type {acgraph.vector.Path} */ (iterator.meta('hatchSlice'));
    if (slice) slice.clear();
    if (hatchSlice) hatchSlice.clear();
    if (sliceOutline) sliceOutline.clear();
  } else {
    if (this.dataLayer_) {
      slice = /** @type {!acgraph.vector.Path} */(this.dataLayer_.genNextChild());
      iterator.meta('slice', slice);
    }
    if (this.outlineLayer_) {
      sliceOutline = /** @type {!acgraph.vector.Path} */(this.outlineLayer_.genNextChild());
      iterator.meta('sliceOutline', sliceOutline);
    }
    if (this.hatchLayer_) {
      hatchSlice = /** @type {acgraph.vector.Path} */(this.hatchLayer_.genNextChild());
      iterator.meta('hatchSlice', hatchSlice);
    }
  }

  if (slice) {
    var normalizer = anychart.core.settings.numberOrPercentNormalizer;

    var outlineOffset = this.resolveOption('outline.offset', pointState, iterator, normalizer, false) || 0;
    var outlineWidth = this.resolveOption('outline.width', pointState, iterator, normalizer, false) || 0;

    outlineOffset = anychart.utils.normalizeSize(/** @type {number|string} */(outlineOffset), this.radiusValue_);
    outlineWidth = anychart.utils.normalizeSize(/** @type {number|string} */(outlineWidth), this.radiusValue_);

    var explode = this.getExplode(pointState);
    iterator.meta('explode', explode);

    var angle = start + sweep / 2;
    var cos = Math.cos(goog.math.toRadians(angle));
    var sin = Math.sin(goog.math.toRadians(angle));
    var ex = explode * cos;
    var ey = explode * sin;

    var outerSliceRadius = this.radiusValue_;
    var innerOutlineRadius = outerSliceRadius + outlineOffset;
    var outerOutlineRadius = outerSliceRadius + outlineOffset + outlineWidth;

    var ctx = {
      'centerX': this.cx,
      'centerY': this.cy,
      'innerRadius': this.innerRadiusValue_,
      'outerRadius': outerSliceRadius,
      'innerOutlineRadius': innerOutlineRadius,
      'outerOutlineRadius': outerOutlineRadius,
      'startAngle': start,
      'sweepAngle': sweep,
      'explodeX': ex,
      'explodeY': ey,
      'path': slice
    };

    if (sliceOutline) {
      if (!outlineWidth) {
        sliceOutline.clear();
      } else {
        acgraph.vector.primitives.donut(sliceOutline, this.cx + ex, this.cy + ey, outerOutlineRadius, innerOutlineRadius, start, sweep);
      }
    }
    /**
     * @type {function(this:anychart.pieModule.Chart.SliceDrawerContext, anychart.pieModule.Chart.SliceDrawerContext)}
     */
    var sliceDrawer = /** @type {function(this:anychart.pieModule.Chart.SliceDrawerContext, anychart.pieModule.Chart.SliceDrawerContext)} */ (this.getOption('sliceDrawer'));
    sliceDrawer.call(ctx, ctx);
    // slice = acgraph.vector.primitives.donut(slice, this.cx + ex, this.cy + ey, outerSliceRadius, this.innerRadiusValue_, start, sweep);

    slice.tag = {
      series: this,
      index: index
    };

    this.colorizeSlice(pointState);
    if (hatchSlice) {
      hatchSlice.deserialize(slice.serialize());
      hatchSlice.tag = {
        series: this,
        index: index
      };
      this.applyHatchFill(pointState);
    }
  }

  return true;
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
 * @param {string} name Name of side
 * @param {boolean=} opt_update
 * @return {acgraph.vector.Path}
 * @private
 */
anychart.pieModule.Chart.prototype.drawFrontSide_ = function(cx, cy, outerR, startAngle, endAngle, sweep, pointState, name, opt_update) {
  // there may be two front sides
  var uniqueValue = String(startAngle);
  var pathName = name + uniqueValue;
  var path = this.createPath_(pathName, opt_update);
  if (!path) return null;

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
 * @param {string} name Name of side
 * @param {boolean=} opt_update
 * @return {acgraph.vector.Path}
 * @private
 */
anychart.pieModule.Chart.prototype.drawBackSide_ = function(cx, cy, innerR, startAngle, endAngle, sweep, pointState, name, opt_update) {
  // there may be two back sides
  var uniqueValue = String(startAngle);
  var pathName = name + uniqueValue;
  var path = this.createPath_(pathName, opt_update);
  if (!path) return null;

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
 * @return {acgraph.vector.Path}
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
  if (!path) return null;

  path.moveTo(x1, y1);
  path.lineTo(x2, y2);
  path.lineTo(x2, y2 + h);
  path.lineTo(x1, y1 + h);
  path.lineTo(x1, y1);
  path.close();

  this.colorize3DPath_(pathName, pointState);
  return path;
};


//endregion
//region --- Animation
/** @inheritDoc */
anychart.pieModule.Chart.prototype.doAnimation = function() {
  if (!this.getOption('mode3d') && this.animation().getOption('enabled') && /** @type {number} */(this.animation().getOption('duration')) > 0) {
    if (this.animationQueue_ && this.animationQueue_.isPlaying()) {
      this.animationQueue_.update();
    } else if (this.hasInvalidationState(anychart.ConsistencyState.CHART_ANIMATION)) {
      goog.dispose(this.animationQueue_);
      this.animationQueue_ = new anychart.animations.AnimationSerialQueue();
      var duration = /** @type {number} */(this.animation().getOption('duration'));
      var pieDuration = duration * anychart.pieModule.Chart.PIE_ANIMATION_DURATION_RATIO;
      var pieLabelDuration = duration * (1 - anychart.pieModule.Chart.PIE_ANIMATION_DURATION_RATIO);

      var pieAnimation = new anychart.pieModule.Animation(this, pieDuration);
      var pieLabelAnimation = new anychart.pieModule.LabelAnimation(this, pieLabelDuration);

      this.animationQueue_.add(/** @type {goog.fx.TransitionBase} */ (pieAnimation));
      this.animationQueue_.add(/** @type {goog.fx.TransitionBase} */ (pieLabelAnimation));

      this.animationQueue_.listen(goog.fx.Transition.EventType.BEGIN, function() {
        this.connStrokeBackup_ = this.getOption('connectorStroke');
        this.setOption('connectorStroke', 'none');
        this.ignoreMouseEvents(true);
        this.dispatchDetachedEvent({
          'type': anychart.enums.EventType.ANIMATION_START,
          'chart': this
        });
      }, false, this);

      this.animationQueue_.listen(goog.fx.Transition.EventType.END, function() {
        this.setOption('connectorStroke', this.connStrokeBackup_);
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
  var pointState = this.state.getPointStateByIndex(point.getIndex());
  var explode = this.getExplode(pointState);

  if (explode) {
    var angle = start + sweep / 2;
    var cos = Math.cos(goog.math.toRadians(angle));
    var sin = Math.sin(goog.math.toRadians(angle));
    var ex = explode * cos;
    var ey = explode * sin;
    slice = acgraph.vector.primitives.donut(slice, this.cx + ex, this.cy + ey, radius, innerRadius, start, sweep);
  } else {
    slice = acgraph.vector.primitives.donut(slice, this.cx, this.cy, radius, innerRadius, start, sweep);
  }

  var hatchSlice = /** @type {!acgraph.vector.Path} */ (point.meta('hatchSlice'));
  if (hatchSlice) {
    this.getIterator().select(point.getIndex());
    hatchSlice.clear();
    hatchSlice.deserialize(slice.serialize());
    var hatchFillResolver = anychart.pieModule.Chart.getColorResolver('hatchFill', anychart.enums.ColorType.HATCH_FILL, true);
    var hatchFill = hatchFillResolver(this, this.state.getPointStateByIndex(point.getIndex()), false, null);
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
    for (var i = 0; i < this.drawnConnectors_.length; i++) {
      var conn = this.drawnConnectors_[i];
      if (conn) {
        var connStroke = /** @type {acgraph.vector.Stroke} */ (this.getOption('connectorStroke'));
        var opacity = anychart.color.setOpacity(connStroke, connectorOpacity);
        conn.stroke(opacity);
      }
    }
  }
};


//endregion
//region --- 3D mode
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
  var pointState = this.state.getPointStateByIndex(index);
  var explode = this.getExplode(pointState);

  var start = /** @type {number} */ (iterator.meta('start'));
  var sweep = /** @type {number} */ (iterator.meta('sweep'));
  var end = start + sweep;
  // if no information about slice in meta (e.g. no slice has drawn: call explodeSlice(_, _) before chart.draw()).
  if (!goog.isDef(start) || !goog.isDef(sweep) || !sweep) return;

  var angle = start + sweep / 2;
  var cos = Math.cos(goog.math.toRadians(angle));
  var sin = Math.sin(goog.math.toRadians(angle));
  var ex = explode * cos;
  var ey = this.get3DYRadius(explode) * sin;

  this.sides3D_.push({
    index: index,
    type: anychart.pieModule.Chart.Side3DType.TOP,
    start: start,
    sweep: sweep,
    ex: ex,
    ey: ey
  });


  this.sides3D_.push({
    index: index,
    type: anychart.pieModule.Chart.Side3DType.BOTTOM,
    start: start,
    sweep: sweep,
    ex: ex,
    ey: ey
  });

  if (Math.abs(sweep) != 360) {
    this.sides3D_.push({
      index: index,
      type: anychart.pieModule.Chart.Side3DType.START,
      angle: start,
      ex: ex,
      ey: ey
    });
    this.sides3D_.push({
      index: index,
      type: anychart.pieModule.Chart.Side3DType.END,
      angle: end,
      ex: ex,
      ey: ey
    });
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
      frontSides[j].type = anychart.pieModule.Chart.Side3DType.OUTERFRONT;
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
      backSides[j].type = anychart.pieModule.Chart.Side3DType.INNERBACK;
      backSides[j].sweep = sweep;
      backSides[j].ex = ex;
      backSides[j].ey = ey;

      this.sides3D_[len1 + j] = backSides[j];
    }
  }

  //outer back side
  var sides = this.getBackSides_(start, end);

  len1 = this.sides3D_.length;
  len2 = sides.length;
  this.sides3D_.length = len1 + len2;
  for (j = 0; j < len2; j++) {
    sides[j].index = index;
    sides[j].type = anychart.pieModule.Chart.Side3DType.OUTERBACK;
    sides[j].sweep = sweep;
    sides[j].ex = ex;
    sides[j].ey = ey;

    this.sides3D_[len1 + j] = sides[j];
  }

  //inner front side
  sides = this.getFrontSides_(start, end);
  len1 = this.sides3D_.length;
  len2 = sides.length;
  this.sides3D_.length = len1 + len2;
  for (j = 0; j < len2; j++) {
    sides[j].index = index;
    sides[j].type = anychart.pieModule.Chart.Side3DType.INNERFRONT;
    sides[j].sweep = sweep;
    sides[j].ex = ex;
    sides[j].ey = ey;

    this.sides3D_[len1 + j] = sides[j];
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
        case anychart.pieModule.Chart.Side3DType.OUTERFRONT:
          side.sortWeight = (side.isInFront ?
              1 :
              anychart.math.round(Math.sin(goog.math.toRadians(this.getCenterAngle_(side.start, side.end))), 7));
          break;
        case anychart.pieModule.Chart.Side3DType.INNERBACK:
          side.sortWeight = (side.isInFront ?
              -1 :
              anychart.math.round(Math.sin(goog.math.toRadians(this.getCenterAngle_(side.start, side.end))), 7));
          break;
        case anychart.pieModule.Chart.Side3DType.BOTTOM:
          side.sortWeight = -3;
          break;
        case anychart.pieModule.Chart.Side3DType.INNERFRONT:
          side.sortWeight = 0;
          break;
        case anychart.pieModule.Chart.Side3DType.OUTERBACK:
          side.sortWeight = -2;
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
  this.sides3D_.length = 0;
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
  var pointState = this.state.getPointStateByIndex(side.index);

  var explode = this.getExplode(pointState);
  iterator.meta('explode', explode);

  var cx = this.cx;
  var cy = this.cy;
  if (explode) {
    cx += side.ex;
    cy += side.ey;
  }

  var outerR = this.radiusValue_;
  var innerR = this.innerRadiusValue_;

  switch (side.type) {
    case anychart.pieModule.Chart.Side3DType.TOP:
      this.drawTopOrBottomSide_(cx, cy, outerR, innerR, side.start, side.sweep, pointState, true, opt_update);
      break;
    case anychart.pieModule.Chart.Side3DType.BOTTOM:
      this.drawTopOrBottomSide_(cx, cy, outerR, innerR, side.start, side.sweep, pointState, false, opt_update);
      break;
    case anychart.pieModule.Chart.Side3DType.OUTERFRONT:
      this.drawFrontSide_(cx, cy, outerR, side.start, side.end, side.sweep, pointState, anychart.pieModule.Chart.Side3DType.OUTERFRONT, opt_update);
      break;
    case anychart.pieModule.Chart.Side3DType.INNERBACK:
      this.drawBackSide_(cx, cy, innerR, side.start, side.end, side.sweep, pointState, anychart.pieModule.Chart.Side3DType.INNERBACK, opt_update);
      break;
    case anychart.pieModule.Chart.Side3DType.OUTERBACK:
      this.drawFrontSide_(cx, cy, outerR, side.start, side.end, side.sweep, pointState, anychart.pieModule.Chart.Side3DType.OUTERBACK, opt_update);
      break;
    case anychart.pieModule.Chart.Side3DType.INNERFRONT:
      this.drawBackSide_(cx, cy, innerR, side.start, side.end, side.sweep, pointState, anychart.pieModule.Chart.Side3DType.INNERFRONT, opt_update);
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
 * @param {boolean} topSide
 * @param {boolean=} opt_update
 * @return {acgraph.vector.Path}
 * @private
 */
anychart.pieModule.Chart.prototype.drawTopOrBottomSide_ = function(cx, cy, outerR, innerR, start, sweep, pointState, topSide, opt_update) {
  if (outerR < 0) outerR = 0;
  if (innerR < 0) innerR = 0;
  if (outerR < innerR) {
    var tmp = outerR;
    outerR = innerR;
    innerR = tmp;
  }

  var pathName = (topSide ? 'top' : 'bottom') + 'Path';
  cy += topSide ? 0 : this.get3DHeight();
  sweep = goog.math.clamp(sweep, -360, 360);

  var path = this.createPath_(pathName, opt_update);
  if (!path) return null;

  // draw pie
  if (innerR <= 0) {
    if (Math.abs(sweep) == 360) {
      path.circularArc(cx, cy, outerR, this.get3DYRadius(outerR), start, sweep, false);
    } else {
      path.moveTo(cx, cy).circularArc(cx, cy, outerR, this.get3DYRadius(outerR), start, sweep, true).close();
    }

    this.colorize3DPath_(pathName, pointState);
    return path;
  }

  var drawSides = Math.abs(sweep) < 360;

  path.circularArc(cx, cy, outerR, this.get3DYRadius(outerR), start, sweep)
      .circularArc(cx, cy, innerR, this.get3DYRadius(innerR), start + sweep, -sweep, drawSides);

  if (drawSides) {
    path.close();
  }

  this.colorize3DPath_(pathName, pointState);
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

    if (path) path.clear();
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
      var uniqueValue = (side.type == anychart.pieModule.Chart.Side3DType.OUTERFRONT ||
                         side.type == anychart.pieModule.Chart.Side3DType.INNERBACK ||
                         side.type == anychart.pieModule.Chart.Side3DType.OUTERBACK ||
                         side.type == anychart.pieModule.Chart.Side3DType.INNERFRONT) ? side.start : '';
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

  pointState = anychart.core.utils.InteractivityState.clarifyState(pointState);

  var rawColor;
  if (pointState == anychart.PointState.SELECT) {
    var selectFill;
    pointStateObject = iterator.get('selected');
    selectFill = anychart.utils.getFirstDefinedValue(
        goog.isDef(pointStateObject) ? pointStateObject['fill'] : void 0,
        iterator.get('selectFill'),
        this.selected().fill(),
        normalColor);
    rawColor = this.normalizeColor(
        /** @type {acgraph.vector.Fill|Function} */(selectFill), normalColor);
  } else if (pointState == anychart.PointState.HOVER) {
    var hoverFill;
    pointStateObject = iterator.get('hovered');
    hoverFill = anychart.utils.getFirstDefinedValue(
        goog.isDef(pointStateObject) ? pointStateObject['fill'] : void 0,
        iterator.get('hoverFill'),
        this.hovered().fill(),
        normalColor);
    rawColor = this.normalizeColor(
        /** @type {acgraph.vector.Fill|Function} */(hoverFill), normalColor);
  } else {
    rawColor = this.normalizeColor(normalColor);
  }

  var parsedColor;
  if (goog.isString(rawColor)) {
    parsedColor = anychart.color.parseColor(rawColor);
  } else {
    parsedColor = anychart.color.parseColor(rawColor.color);
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

  var state = anychart.core.utils.InteractivityState.clarifyState(pointState);
  var hovered = state == anychart.PointState.HOVER;
  var selected = state == anychart.PointState.SELECT;

  var opacity = anychart.color.getOpacity(hovered ? this.hovered().fill() : selected ? this.selected().fill() : this.fill());

  var innerColor = {
    color: (hovered || selected) ? anychart.color.lighten(darkPathColor, .2) : darkPathColor,
    opacity: opacity
  };

  var outerColor = {
    'angle': 45,
    'keys': [{
      'position': 0,
      'opacity': opacity,
      'color': (hovered || selected) ? anychart.color.lighten(color, .2) : anychart.color.lighten(color, .1)
    }, {
      'position': .19,
      'opacity': opacity,
      'color': (hovered || selected) ? anychart.color.lighten(frontSecondColor, .2) : frontSecondColor
    }, {
      'position': 1,
      'opacity': opacity,
      'color': (hovered || selected) ? anychart.color.lighten(frontThirdColor, .2) : frontThirdColor
    }]
  };

  var topColor;
  var bottomColor = topColor = {
    'angle': -50,
    'keys': [{
      'position': 0,
      'opacity': opacity,
      'color': (hovered || selected) ? anychart.color.lighten(color, .3) : color
    }, {
      'position': 1,
      'opacity': opacity,
      'color': (hovered || selected) ? anychart.color.lighten(topPathSecondColor, .2) : topPathSecondColor
    }]
  };
  if (pathName == 'topPath') {
    fill = topColor;
  } else if (pathName == 'bottomPath') {
    fill = bottomColor;
  } else if (goog.string.startsWith(pathName, 'outer')) {
    fill = outerColor;
  } else if (goog.string.startsWith(pathName, 'inner')) {
    fill = innerColor;
  } else {
    // sides (start, end)
    fill = {
      color: (hovered || selected) ? anychart.color.lighten(darkSidesPathColor, .2) : darkSidesPathColor,
      opacity: opacity
    };
  }

  var stroke;
  if (selected && anychart.color.isNotNullColor(this.selected()['stroke']())) {
    stroke = this.selected()['stroke']();
  } else if (anychart.color.isNotNullColor(this['stroke']())) {
    stroke = this['stroke']();
  } else {
    stroke = fill;
  }

  path.fill(fill);
  // use stroke with some fill for white space compensation between paths of slice
  path.stroke(stroke);

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


//endregion
//region --- Utils
/**
 *
 * @param {number} index
 * @return {Array.<number>}
 */
anychart.pieModule.Chart.prototype.getSliceCenterCoords = function(index) {
  var iterator = this.getIterator();
  iterator.select(index);

  var cx = this.cx;
  var cy = this.cy;

  var pointState = this.state.getPointStateByIndex(index);
  var explode = this.getExplode(pointState);
  if (explode) {
    var mode3d = /** @type {boolean} */ (this.getOption('mode3d'));
    var start = /** @type {number} */ (iterator.meta('start'));
    var sweep = /** @type {number} */ (iterator.meta('sweep'));

    var angle = (start + sweep / 2) * Math.PI / 180;
    var ex = explode * Math.cos(angle);
    var ey = (mode3d ? this.get3DYRadius(explode) : explode) * Math.sin(angle);
    cx += ex;
    cy += ey;
  }

  return [cx, cy];
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
 * @deprecated since 8.2.0 use pie.center.getPoint() instead. DVF-3445
 */
anychart.pieModule.Chart.prototype.getCenterPoint = function() {
  anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null, ['getCenterPoint()', 'center().getPoint()'], true);
  return this.center().getPoint();
};


/** @inheritDoc */
anychart.pieModule.Chart.prototype.getCenterCoords = function() {
  return [this.cx, this.cy];
};


/** @inheritDoc */
anychart.pieModule.Chart.prototype.getCenterContentBounds = function() {
  return this.centerContentBounds;
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
 * @param {(number|anychart.PointState)=} opt_pointState .
 * @return {number}
 */
anychart.pieModule.Chart.prototype.getPixelExplode = function(opt_pointState) {
  return this.getExplode(opt_pointState);
};


/**
 * Internal getter for fixed gauge start angle. All for human comfort.
 * @return {number}
 */
anychart.pieModule.Chart.prototype.getStartAngle = function() {
  return /** @type {number} */ (this.getOption('startAngle')) + anychart.pieModule.Chart.DEFAULT_START_ANGLE;
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


/**
 * @param {(anychart.PointState|number)=} opt_pointState .
 * @param {boolean=} opt_ignorePointSettings .
 * @return {number}
 */
anychart.pieModule.Chart.prototype.getExplode = function(opt_pointState, opt_ignorePointSettings) {
  var pointState = opt_pointState || 0;
  var iterator = this.getIterator();

  var singlePoint = iterator.getRowsCount() == 1;
  var explode, explodeValue;
  if (singlePoint) {
    explodeValue = 0;
  } else {
    explode = this.resolveOption('explode', pointState, iterator, anychart.core.settings.numberOrPercentNormalizer, false, void 0, opt_ignorePointSettings);
    explodeValue = goog.isDef(explode) ? anychart.utils.normalizeSize(/** @type {number|string} */ (explode), this.minWidthHeight_) : 0;
  }
  return explodeValue;
};


//endregion
//region --- Legend
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
        itemText = /** @type {string} */(iterator.meta('name'));
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
      'iconStroke': mode3d ? this.get3DStrokeColor() : /** @type {acgraph.vector.Stroke} */ (strokeResolver(this, anychart.PointState.NORMAL, false, null)),
      'iconFill': mode3d ? this.get3DFillColor_(anychart.PointState.NORMAL) : /** @type {acgraph.vector.Fill} */ (fillResolver(this, anychart.PointState.NORMAL, false, null)),
      'iconHatchFill': /** @type {acgraph.vector.HatchFill} */ (hatchFillResolver(this, anychart.PointState.NORMAL, false, null))
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
    this.select(/** @type {number} */ (sourceKey));
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


//endregion
//region --- Interactivity
/**
 * Explodes slice at index.
 * @example
 * var chart = anychart.pie([10, 12, 14, 46]);
 * chart.explodeSlice(2);
 * chart.container(stage).draw();
 * @param {number} index Pie slice index that should be exploded or not.
 * @param {boolean=} opt_explode [true] Whether to explode.
 * @return {anychart.pieModule.Chart} .
 * @deprecated since 8.1.0 use select() instead. DVF-3404
 */
anychart.pieModule.Chart.prototype.explodeSlice = function(index, opt_explode) {
  anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null, ['explodeSlice()', 'select()'], true);
  var currentPointState = this.state.getPointStateByIndex(index);
  if (opt_explode || !goog.isDef(opt_explode)) {
    if (!this.state.isStateContains(currentPointState, anychart.PointState.SELECT))
      this.select(index);
  } else {
    this.unselect(index);
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
 * @deprecated since 8.1.0 use select() instead. DVF-3404
 */
anychart.pieModule.Chart.prototype.explodeSlices = function(value) {
  anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null, ['explodeSlices()', 'select()'], true);
  if (goog.isBoolean(value)) {
    if (value) {
      this.select();
    } else {
      this.unselect();
    }
  } else {
    this.select(value);
  }
  return this;
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
  var res = anychart.core.VisualBase.prototype.makeBrowserEvent.call(this, e);

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
  return /** @type {anychart.enums.HoverMode} */(this.hoverMode_);
};


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

  if (goog.isDef(opt_indexOrIndexes)) {
    this.state.removePointState(anychart.PointState.HOVER, opt_indexOrIndexes);
  } else {
    this.state.removePointState(anychart.PointState.HOVER, true);
  }


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
  }

  this.state.addPointState(anychart.PointState.HOVER, index);
  if (goog.isDef(opt_event))
    this.showTooltip(opt_event);

  return this;
};


/**
 * Hovers all points of the series. Use <b>unhover</b> method for unhover series.
 * @return {!anychart.pieModule.Chart} An instance of the {@link anychart.pieModule.Chart} class for method chaining.
 */
anychart.pieModule.Chart.prototype.hoverSeries = function() {
  if (!this.enabled())
    return this;

  this.state.setPointState(anychart.PointState.HOVER, true);

  return this;
};


/**
 * Selected state settings.
 * @param {!Object=} opt_value
 * @return {anychart.core.StateSettings|anychart.pieModule.Chart}
 */
anychart.pieModule.Chart.prototype.selected = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.selected_.setup(opt_value);
    return this;
  }
  return this.selected_;
};


/**
 * @param {(anychart.enums.SelectionMode|string)=} opt_value Selection mode.
 * @return {anychart.pieModule.Chart|anychart.enums.SelectionMode} .
 */
anychart.pieModule.Chart.prototype.selectionMode = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeSelectMode(opt_value);
    if (opt_value != this.selectMode_) {
      this.selectMode_ = opt_value;
    }
    return this;
  }
  return /** @type {anychart.enums.SelectionMode} */(this.selectMode_);
};


/**
 * Selects a point of the chart by its index.
 * @param {(number|Array.<number>)=} opt_indexOrIndexes Index or array of indexes of the point to select.
 * @return {!anychart.pieModule.Chart} {@link anychart.pieModule.Chart} instance for method chaining.
 */
anychart.pieModule.Chart.prototype.select = function(opt_indexOrIndexes) {
  if (!this.enabled())
    return this;

  if (goog.isDef(opt_indexOrIndexes))
    this.selectPoint(opt_indexOrIndexes);
  else {
    this.selectSeries();
  }

  return this;
};


/**
 * Selects all points of the chart. Use <b>unselect</b> method to unselect them.
 * @return {!anychart.pieModule.Chart} An instance of the {@link anychart.pieModule.Chart} class for method chaining.
 */
anychart.pieModule.Chart.prototype.selectSeries = function() {
  //hide tooltip in any case
  this.hideTooltip();

  this.state.setPointState(anychart.PointState.SELECT, true);

  return this;
};


/**
 * Select a point of the series by its index.
 * @param {number|Array<number>} indexOrIndexes Index of the point to hover.
 * @param {anychart.core.MouseEvent=} opt_event Event that initiate point selecting.
 * @return {!anychart.pieModule.Chart}  {@link anychart.pieModule.Chart} instance for method chaining.
 */
anychart.pieModule.Chart.prototype.selectPoint = function(indexOrIndexes, opt_event) {
  var unselect = !(opt_event && opt_event.shiftKey);
  var changedState = unselect ? opt_event ? anychart.PointState.HOVER : anychart.PointState.NORMAL : void 0;

  if (goog.isArray(indexOrIndexes)) {
    if (!opt_event)
      this.unselect();

    this.state.setPointState(anychart.PointState.SELECT, indexOrIndexes, changedState);
  } else if (goog.isNumber(indexOrIndexes)) {
    this.state.setPointState(anychart.PointState.SELECT, indexOrIndexes, changedState);
  }

  return this;
};


/** @inheritDoc */
anychart.pieModule.Chart.prototype.unselect = function(opt_indexOrIndexes) {
  if (goog.isDef(opt_indexOrIndexes)) {
    this.state.removePointState(anychart.PointState.SELECT, opt_indexOrIndexes);
  } else {
    this.state.removePointState(anychart.PointState.SELECT, true);
  }
};


/** @inheritDoc */
anychart.pieModule.Chart.prototype.applyAppearanceToPoint = function(pointState, opt_value) {
  var iterator = this.getIterator();
  var currentPointExplode = /** @type {number} */(iterator.meta('explode'));

  var mode3d = /** @type {boolean} */ (this.getOption('mode3d'));
  if (mode3d) {
    this.prepare3DSlice_();
    this.draw3DSlices_(iterator.getIndex(), true);
  } else {
    this.drawSlice_(pointState, true);
  }

  if (!this.isMissing_(iterator.get('value'))) // fixes DVF-4174.
    this.drawLabel_(pointState);

  return opt_value || (currentPointExplode != this.getExplode(pointState));
};


/** @inheritDoc */
anychart.pieModule.Chart.prototype.finalizePointAppearance = function(opt_value) {
  var iterator = this.getIterator();
  var sweep = /** @type {number} */(iterator.meta('sweep'));
  var value = /** @type {number|string|null|undefined} */(iterator.get('value'));
  var currIndex = iterator.getIndex();

  // if only 1 point in Pie was drawn - forbid to explode it
  if (iterator.getRowsCount() == 1 || sweep == 360 || (this.isMissing_(value) && currIndex != iterator.getRowsCount()))
    return;

  var explodeChanged = !!opt_value;
  var isOutsideLabels = this.isOutsideLabels();

  if (explodeChanged || isOutsideLabels) {
    if (isOutsideLabels) {
      this.recalculateBounds_ = false;
      this.labels().suspendSignalsDispatching();
      this.labels().clear();
      this.calculateOutsideLabels();
      this.labels().draw();
      this.labels().resumeSignalsDispatching(false);
    } else {
      this.labels().clear();
      iterator.select(currIndex);
    }
  } else {
    this.labels().draw();
  }
};


/** @inheritDoc */
anychart.pieModule.Chart.prototype.applyAppearanceToSeries = goog.nullFunction;


/** @inheritDoc */
anychart.pieModule.Chart.prototype.getStartValueForAppearanceReduction = goog.nullFunction;


//endregion
//region --- Tooltip
/** @inheritDoc */
anychart.pieModule.Chart.prototype.createTooltip = function() {
  var tooltip = new anychart.core.ui.Tooltip(0);
  tooltip.chart(this);
  tooltip.containerProvider(this);
  tooltip.listenSignals(this.onTooltipSignal_, this);
  this.setupCreated('tooltip', tooltip);
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
  var legend = this.getCreated('legend');
  if (opt_event && legend && opt_event['target'] == legend) {
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
 * Creates tooltip format provider.
 * @return {Object}
 */
anychart.pieModule.Chart.prototype.createTooltipContextProvider = function() {
  return this.createFormatProvider();
};


//endregion
//region --- Disposing / Serialization / Setup
/** @inheritDoc */
anychart.pieModule.Chart.prototype.serialize = function() {
  var json = anychart.pieModule.Chart.base(this, 'serialize');
  json['data'] = this.data().serialize();
  json['palette'] = this.palette().serialize();
  json['hatchFillPalette'] = this.hatchFillPalette().serialize();

  if (this.getCreated('tooltip'))
    json['tooltip'] = this.tooltip().serialize();

  if (this.center())
    json['center'] = this.center().serialize();

  anychart.core.settings.serialize(this, anychart.pieModule.Chart.PROPERTY_DESCRIPTORS, json, 'Pie');
  json['normal'] = this.normal_.serialize();
  json['hovered'] = this.hovered_.serialize();
  json['selected'] = this.selected_.serialize();

  return {'chart': json};
};


/** @inheritDoc */
anychart.pieModule.Chart.prototype.setupByJSON = function(config, opt_default) {
  anychart.pieModule.Chart.base(this, 'setupByJSON', config, opt_default);

  anychart.core.settings.deserialize(this, anychart.pieModule.Chart.PROPERTY_DESCRIPTORS, config, opt_default);

  this.group(config['group']);
  this.data(config['data']);

  if ('center' in config)
    this.center().setupInternal(!!opt_default, config['center']);

  if ('tooltip' in config)
    this.tooltip().setupInternal(!!opt_default, config['tooltip']);

  if ('normal' in config)
    this.normal().setupInternal(!!opt_default, config['normal']);

  if ('hovered' in config)
    this.hovered().setupInternal(!!opt_default, config['hovered']);

  if ('selected' in config)
    this.selected().setupInternal(!!opt_default, config['selected']);

  if ('hatchFillPalette' in config)
    this.hatchFillPalette().setupInternal(!!opt_default, config['hatchFillPalette']);

  if ('palette' in config)
    this.palette(config['palette']);
};


/** @inheritDoc */
anychart.pieModule.Chart.prototype.setupStateSettings = function() {
  this.normal_.addThemes(this.themeSettings);
  this.setupCreated('normal', this.normal_);
  this.normal_.setupInternal(true, {});

  this.setupCreated('hovered', this.hovered_);
  this.hovered_.setupInternal(true, {});

  this.setupCreated('selected', this.selected_);
  this.selected_.setupInternal(true, {});
};


/**
 * @inheritDoc
 */
anychart.pieModule.Chart.prototype.disposeInternal = function() {
  goog.disposeAll(
      this.animationQueue_,
      this.normal_,
      this.hovered_,
      this.selected_,
      this.center_,
      this.parentViewToDispose_,
      this.parentView_,
      this.view_,
      this.palette_,
      this.hatchFillPalette_);
  this.animationQueue_ = null;
  this.normal_ = null;
  this.hovered_ = null;
  this.selected_ = null;
  this.center_ = null;
  this.parentViewToDispose_ = null;
  this.parentView_ = null;
  this.view_ = null;
  delete this.iterator_;
  this.palette_ = null;
  this.hatchFillPalette_ = null;
  anychart.pieModule.Chart.base(this, 'disposeInternal');
};



//endregion
//region --- PieOutsideLabelsDomain
/**
 * Labels Domain.
 * @param {boolean} isRight .
 * @param {!anychart.pieModule.Chart} pie .
 * @param {Array.<anychart.pieModule.Chart.PieOutsideLabelsDomain>} domains .
 * @param {number} explode .
 * @constructor
 */
anychart.pieModule.Chart.PieOutsideLabelsDomain = function(isRight, pie, domains, explode) {
  /**
   *
   * @type {number}
   */
  this.explode = explode;

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

  var explode = this.explode;
  var center = this.pie.center();
  var pieCenter = center ? center.getPoint() : this.pie.getCenterCoords();
  var piePxRadius = this.pie.getPixelRadius() + explode;

  var cx = pieCenter['x'], cy = pieCenter['y'];
  var bottomLabelsYLimit, topLabelsYLimit;

  var mode3d = /** @type {boolean} */ (this.pie.getOption('mode3d'));
  if (mode3d) {
    bottomLabelsYLimit = cy + this.pie.get3DYRadius(piePxRadius) + this.pie.connectorLengthValue_ - .1 + this.pie.get3DHeight() / 2;
    topLabelsYLimit = cy - (this.pie.get3DYRadius(piePxRadius) + this.pie.connectorLengthValue_) + .1 - this.pie.get3DHeight() / 2;
  } else {
    bottomLabelsYLimit = cy + piePxRadius + this.pie.connectorLengthValue_ - .1;
    topLabelsYLimit = cy - (piePxRadius + this.pie.connectorLengthValue_) + .1;
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
  var start, sweep, angle, dR, dRPie, y, y0, y1, x, x0, x1, connector;
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

    var index = label.getIndex();
    iterator.select(index);

    start = /** @type {number} */ (iterator.meta('start'));
    sweep = /** @type {number} */ (iterator.meta('sweep'));

    var offsetX = goog.isDef(label.getOption('offsetX')) ? label.getOption('offsetX') : this.pie.labels().getOption('offsetX');
    if (!offsetX) offsetX = 0;
    var offsetAngle = anychart.utils.normalizeSize(/** @type {number|string} */(offsetX), 360);

    var offsetY = goog.isDef(label.getOption('offsetY')) ? label.getOption('offsetY') : this.pie.labels().getOption('offsetY');
    if (!offsetY) offsetY = 0;
    var offsetRadius = anychart.utils.normalizeSize(/** @type {number|string} */(offsetY), this.pie.radiusValue_);

    angle = goog.math.toRadians(start + sweep / 2 + offsetAngle);

    connector = this.isRightSide ?
        anychart.pieModule.Chart.OUTSIDE_LABELS_CONNECTOR_SIZE_ :
        -anychart.pieModule.Chart.OUTSIDE_LABELS_CONNECTOR_SIZE_;

    dRPie = this.pie.radiusValue_ + explode;
    dR = (this.pie.getPixelRadius() + this.pie.connectorLengthValue_) + explode + offsetRadius;

    var dRYPie, dRY;
    if (mode3d) {
      dRYPie = this.pie.get3DYRadius(this.pie.radiusValue_ + explode);
      dRY = this.pie.get3DYRadius(this.pie.getPixelRadius() + explode + offsetRadius) + this.pie.connectorLengthValue_;
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

    //radius from center of pir to label position.
    var realConnectorRadius = Math.floor(anychart.math.vectorLength(x, y, cx, cy)) + offsetY;
    var dAngle = Math.abs(acgraph.math.angleBetweenVectors(x - x0, y - y0, x1 - x0, y1 - y0));

    var isNotValidConnectorLength = leg < 0 || realConnectorRadius > dR;

    if (dAngle > this.maxAngle || isNaN(this.maxAngle) || isNotValidConnectorLength) {
      this.maxAngle = leg < 0 ? Number.POSITIVE_INFINITY : dAngle;

      var minValue = Infinity;
      var minIndex = 0;
      for (var i = 0; i < this.labels.length; i++) {
        iterator.select(this.labels[i].getIndex());
        var value = /** @type {number|string} */ (iterator.get('value'));
        if (!isNaN(+value))
          value = +value;
        if (value < minValue) {
          minValue = value;
          minIndex = i;
        }
      }

      this.labelToDrop = this.labels[minIndex];
      this.dropIndex = minIndex;
    }
    if (dAngle > criticalAngle || isNotValidConnectorLength) this.isCriticalAngle = true;

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


//endregion
//region --- Exports
//exports
/**
 * @suppress {deprecated}
 */
(function() {
  var proto = anychart.pieModule.Chart.prototype;
  // auto generated
  // proto['radius'] = proto.radius;//doc|ex
  // proto['innerRadius'] = proto.innerRadius;//doc|ex
  // proto['startAngle'] = proto.startAngle;//doc|ex
  // proto['explode'] = proto.explode;//doc/ex
  // proto['sort'] = proto.sort;//doc|ex
  // proto['overlapMode'] = proto.overlapMode;
  // proto['insideLabelsOffset'] = proto.insideLabelsOffset;//doc|ewx
  // proto['connectorLength'] = proto.connectorLength;//doc|ex
  // proto['outsideLabelsCriticalAngle'] = proto.outsideLabelsCriticalAngle;//doc|ex
  // proto['connectorStroke'] = proto.connectorStroke;//doc|ex
  // proto['mode3d'] = proto.mode3d;
  // proto['forceHoverLabels'] = proto.forceHoverLabels;
  // proto['sliceDrawer'] = proto.sliceDrawer;
  //deprecated
  // proto['outsideLabelsSpace'] = proto.outsideLabelsSpace;//doc|ewx
  proto['explodeSlice'] = proto.explodeSlice;//doc|ex
  proto['explodeSlices'] = proto.explodeSlices;
  //actual
  proto['center'] = proto.center;
  proto['group'] = proto.group;//doc|ex|non-tr
  proto['data'] = proto.data;//doc|ex|
  proto['labels'] = proto.labels;//doc|ex
  proto['getCenterPoint'] = proto.getCenterPoint;//doc|ex
  proto['getPixelRadius'] = proto.getPixelRadius;//doc|need-ex
  proto['getPixelInnerRadius'] = proto.getPixelInnerRadius;//doc|need-ex
  proto['getPixelExplode'] = proto.getPixelExplode;
  proto['palette'] = proto.palette;//doc|ex
  proto['tooltip'] = proto.tooltip;//doc|ex
  proto['hatchFillPalette'] = proto.hatchFillPalette;
  proto['getType'] = proto.getType;
  proto['getPoint'] = proto.getPoint;
  proto['toCsv'] = proto.toCsv;

  proto['hover'] = proto.hover;
  proto['unhover'] = proto.unhover;

  proto['select'] = proto.select;
  proto['unselect'] = proto.unselect;

  proto['normal'] = proto.normal;
  proto['hovered'] = proto.hovered;
  proto['selected'] = proto.selected;
})();
//endregion
