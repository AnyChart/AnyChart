goog.provide('anychart.charts.Pie');
goog.require('acgraph');
goog.require('anychart.color');
goog.require('anychart.core.SeparateChart');
goog.require('anychart.core.ui.CircularLabelsFactory');
goog.require('anychart.core.ui.Tooltip');
goog.require('anychart.core.utils.PiePointContextProvider');
goog.require('anychart.core.utils.TypedLayer');
goog.require('anychart.enums');
goog.require('anychart.math');
goog.require('anychart.palettes.DistinctColors');
goog.require('anychart.palettes.HatchFills');
goog.require('anychart.palettes.RangeColors');



/**
 * Pie (Donut) Chart Class.<br/>
 * <b>Note:</b> Use method {@link anychart.pie} to get an instance of this class:
 * @param {(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Data for the chart.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings here as a hash map.
 * @extends {anychart.core.SeparateChart}
 * @constructor
 */
anychart.charts.Pie = function(opt_data, opt_csvSettings) {
  goog.base(this);
  this.suspendSignalsDispatching();

  /**
   * Pie point provider.
   * @type {anychart.core.utils.PiePointContextProvider}
   * @private
   */
  this.pointProvider_;

  /**
   * Filter function that should accept a field value and return true if the row
   *    should be included into the resulting view as and false otherwise.
   * @type {(null|function(*):boolean)}
   * @private
   */
  this.groupedPointFilter_ = null;

  /**
   * Start angle for the first slice of a pie chart.
   * @type {number}
   * @private
   */
  this.startAngle_ = 0;

  /**
   * Outer radius of the pie chart.
   * @type {(string|number)}
   * @private
   */
  this.radius_ = '45%';

  /**
   * Inner radius in case of a donut chart.
   * @type {!(string|number|function(number):number)}
   * @private
   */
  this.innerRadius_ = 0;

  /**
   * The value to which pie slice should expand (explode).
   * @type {(string|number)}
   * @private
   */
  this.explode_ = 15;

  /**
   * The sort type for the pie points.
   * Grouped point included into sort.
   * @type {anychart.enums.Sort}
   * @private
   */
  this.sort_ = anychart.enums.Sort.NONE;

  /**
   * @type {anychart.core.ui.CircularLabelsFactory}
   * @private
   */
  this.labels_ = null;

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
   * Object with information about pie. (min value, max value, sum of values, average value, count of slices)
   * @type {Object}
   * @private
   */
  this.statistics_;

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
  this.aquaStylfill_ = (function() {
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
   * Default fill function.
   * this {{index:number, sourceColor: acgraph.vector.Fill, aquaStyleObj: acgraph.vector.Fill}}
   * return {acgraph.vector.Fill} Fill for a pie slice.
   * @type {acgraph.vector.Fill|Function}
   * @private
   */
  this.fill_ = (function() {
    return /** @type {acgraph.vector.Fill} */ (this['sourceColor']);
  });

  /**
   * Default stroke function.
   * this {{index:number, sourceColor: acgraph.vector.Stroke}}
   * return {acgraph.vector.Stroke} Stroke for a pie slice.
   * @type {acgraph.vector.Stroke|Function}
   * @private
   */
  this.stroke_ = (function() {
    return /** @type {acgraph.vector.Stroke} */ (anychart.color.darken(this['sourceColor'], .2));
  });

  /**
   * Default fill function for hover state.
   * this {{index:number, sourceColor: acgraph.vector.Fill, aquaStyleObj: acgraph.vector.Fill}}
   * return {acgraph.vector.Fill} Fill for a pie slice in hover state.
   * @type {acgraph.vector.Fill|Function}
   * @private
   */
  this.hoverFill_ = (function() {
    var fill;
    if (goog.isObject(this['sourceColor']) && goog.isDef(this['sourceColor']['keys'])) {
      fill = goog.object.clone(this['sourceColor']);
      var keys = fill['keys'];
      var newKeys = [];
      for (var i = 0, len = keys.length; i < len; i++) {
        var key = goog.object.clone(keys[i]);
        key['color'] = anychart.color.lighten(key['color']);
        newKeys.push(key);
      }
      fill['keys'] = newKeys;
    } else {
      fill = /** @type {acgraph.vector.Fill} */ (anychart.color.lighten(this['sourceColor']));
    }
    return fill;
  });

  /**
   * Default stroke function for hover state.
   * this {{index:number, sourceColor: acgraph.vector.Stroke}}
   * return {acgraph.vector.Stroke} Stroke for a pie slice in hover state.
   * @type {acgraph.vector.Stroke|Function}
   * @private
   */
  this.hoverStroke_ = (function() {
    return /** @type {acgraph.vector.Stroke} */ (anychart.color.darken(this['sourceColor']));
  });

  /**
   * Hatch fill.
   * @type {acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function|boolean}
   * @private
   */
  this.hatchFill_ = null;

  /**
   * Hover hatch fill.
   * @type {acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function|boolean}
   * @private
   */
  this.hoverHatchFill_;

  /**
   * @type {!anychart.data.Iterator}
   */
  this.iterator_;

  var tooltip = /** @type {anychart.core.ui.Tooltip} */(this.tooltip());
  tooltip.suspendSignalsDispatching();
  tooltip.isFloating(true);
  tooltip.titleFormatter(function() {
    return this['name'] || this['x'];
  });
  tooltip.contentFormatter(function() {
    return (this['name'] || this['x']) + '\n' + this['value'];
  });
  tooltip.resumeSignalsDispatching(false);

  this.palette();
  this.hatchFillPalette();
  this.labels()
      .fontSize(13)
      .padding(1);
  (/** @type {anychart.core.ui.CircularLabelsFactory} */(this.hoverLabels())).enabled(null);
  this.data(opt_data || null, opt_csvSettings);
  this.legend().enabled(true);

  this.overlapMode(anychart.enums.LabelsOverlapMode.NO_OVERLAP);
  this.outsideLabelsSpace('30');
  this.insideLabelsOffset('50%');
  this.connectorLength('20');
  this.outsideLabelsCriticalAngle(60);
  this.connectorStroke('black 0.3');
  var title = this.title();
  title.margin().bottom(0);

  this.legend().tooltip().contentFormatter(function() {
    return (this['value']) + '\n' + this['meta']['pointValue'];
  });
  this.invalidate(anychart.ConsistencyState.ALL);
  this.resumeSignalsDispatching(false);
};
goog.inherits(anychart.charts.Pie, anychart.core.SeparateChart);


/** @inheritDoc */
anychart.charts.Pie.prototype.getType = function() {
  return anychart.enums.ChartTypes.PIE;
};


/**
 * Series element z-index in series root layer.
 * @type {number}
 */
anychart.charts.Pie.ZINDEX_PIE = 30;


/**
 * Hatch fill z-index in series root layer.
 * @type {number}
 */
anychart.charts.Pie.ZINDEX_HATCH_FILL = 31;


/**
 * Label z-index in series root layer.
 * @type {number}
 */
anychart.charts.Pie.ZINDEX_LABEL = 32;


/**
 * Default start angle.
 * @type {number}
 */
anychart.charts.Pie.DEFAULT_START_ANGLE = -90;


/**
 * @type {number}
 * @private
 */
anychart.charts.Pie.OUTSIDE_LABELS_MAX_WIDTH_ = 150;


/**
 * @type {number}
 * @private
 */
anychart.charts.Pie.OUTSIDE_LABELS_CONNECTOR_SIZE_ = 5;


/**
 * Supported signals.
 * @type {number}
 */
anychart.charts.Pie.prototype.SUPPORTED_SIGNALS =
    anychart.core.SeparateChart.prototype.SUPPORTED_SIGNALS |
    anychart.Signal.DATA_CHANGED;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.charts.Pie.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.SeparateChart.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.APPEARANCE |
    anychart.ConsistencyState.PIE_LABELS;


/**
 * Default hatch fill type.
 * @type {acgraph.vector.HatchFill.HatchFillType|string}
 */
anychart.charts.Pie.DEFAULT_HATCH_FILL_TYPE = 'none';


/**
 * Gets current chart data.
 * @return {anychart.data.View} Current data view.
 *//**
 * Sets data for the current chart.
 * Learn more about mapping at {@link anychart.data.Mapping}.
 * @example <c>Set data using simple array</c>
 *  var data = [20, 7, 10, 14];
 *  anychart.pie(data).container(stage).draw();
 * @example <c>Set data using {@link anychart.data.Set}</c>
 *  var dataSet = anychart.data.set([
 *    {name: 'Point 1', value: 10},
 *    {name: 'Point 2', value: 7},
 *    {name: 'Point 3', value: 20},
 *    {name: 'Point 4', value: 14}
 *  ]);
 *  anychart.pie(dataSet).container(stage).draw();
 * @example <c>Set data using {@link anychart.data.Mapping}</c>
 *  var dataSet = anychart.data.set([
 *    {name: 'Point 1', value: 10},
 *    {name: 'Point 2', value: 7},
 *    {name: 'Point 3', value: 20},
 *    {name: 'Point 4', value: 14}
 *  ]);
 *  anychart.pie(dataSet).container(stage).draw();
 * @example <c>Set data using a complex {@link anychart.data.Mapping}</c>
 *  var dataSet = anychart.data.set([
 *    [1, 22, 13],
 *    [13, 22, 23],
 *    [17, 22, 33],
 *    [21, 22, 43]
 *  ]);
 *  anychart.pie(dataSet.mapAs({'value': [1]}))
 *      .container(stage)
 *      .bounds(0,0,'50%', '100%')
 *      .draw();
 *  anychart.pie(dataSet.mapAs({'value': [2]}))
 *      .container(stage)
 *      .bounds('50%',0,'50%', '100%')
 *      .draw();
 * @param {(anychart.data.View|anychart.data.Mapping|anychart.data.Set|Array)=} opt_value Data for the chart.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed by first param, you can pass CSV parser settings here as a hash map.
 * @return {anychart.charts.Pie} An instance of {@link anychart.charts.Pie} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(anychart.data.View|anychart.data.Set|Array|string)=} opt_value .
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings here as a hash map.
 * @return {(anychart.data.View|anychart.charts.Pie)} .
 */
anychart.charts.Pie.prototype.data = function(opt_value, opt_csvSettings) {
  if (goog.isDef(opt_value)) {
    if (this.parentView_ != opt_value || goog.isNull(opt_value)) {

      //drop data cache
      goog.dispose(this.parentViewToDispose_);
      delete this.iterator_;

      this.statistics_ = null;

      /**
       * @type {anychart.data.View}
       */
      var parentView;
      if (opt_value instanceof anychart.data.View) {
        parentView = opt_value;
        this.parentViewToDispose_ = null;
      } else {
        if (opt_value instanceof anychart.data.Set)
          parentView = (this.parentViewToDispose_ = opt_value).mapAs();
        else
          parentView = (this.parentViewToDispose_ = new anychart.data.Set(
              (goog.isArray(opt_value) || goog.isString(opt_value)) ? opt_value : null, opt_csvSettings)).mapAs();
        this.registerDisposable(this.parentViewToDispose_);
      }
      this.parentView_ = parentView.derive();
    }

    goog.dispose(this.view_);
    this.view_ = this.prepareData_(this.parentView_);
    this.view_.listenSignals(this.dataInvalidated_, this);
    this.registerDisposable(this.view_);
    this.invalidate(
        anychart.ConsistencyState.APPEARANCE |
        anychart.ConsistencyState.PIE_LABELS |
        anychart.ConsistencyState.CHART_LEGEND,
        anychart.Signal.NEEDS_REDRAW
    );
    return this;
  }
  return this.view_;
};


/**
 * Returns current view iterator.
 * @return {!anychart.data.Iterator} Current pie view iterator.
 */
anychart.charts.Pie.prototype.getIterator = function() {
  return this.iterator_ || (this.iterator_ = this.view_.getIterator());
};


/**
 * Method that prepares the final view of data.
 * @param {(anychart.data.View)} data Data.
 * @return {anychart.data.View} Ready to use view.
 * @private
 */
anychart.charts.Pie.prototype.prepareData_ = function(data) {
  if (this.groupedPointFilter_ != null) {
    data = data.preparePie('value', this.groupedPointFilter_, undefined, function() {
      return {'value': 0};
    });
    data.transitionMeta(true);
  }

  if (this.sort_ == 'none') {
    return data;
  } else {
    if (this.sort_ == 'asc') {
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
 * Getter for the current pie palette.
 * @return {!(anychart.palettes.RangeColors|anychart.palettes.DistinctColors)} Color palette instance.
 *//**
 * Setter for a pie palette.
 * @example
 *  var data = [7, 7, 7, 7, 7, 7, 7];
 *  anychart.pie(data)
 *     .labels(null)
 *     .legend(null)
 *     .container(stage)
 *     .bounds(0,0,'33%', '100%')
 *     .draw();
 *  anychart.pie(data)
 *     .labels(null)
 *     .legend(null)
 *     .container(stage)
 *     .bounds('33%',0,'33%', '100%')
 *     .palette(['#00F', '#00E', '#00D', '#00C', '#00B', '#00A', '#009', '#008'])
 *     .draw();
 *  anychart.pie(data)
 *     .labels(null)
 *     .legend(null)
 *     .container(stage)
 *     .bounds('66%',0,'33%', '100%')
 *     .palette(
 *          anychart.palettes.rangeColors()
 *              .colors(['red', 'yellow'])
 *              .count(data.length)
 *      )
 *     .draw();
 * @param {(anychart.palettes.RangeColors|anychart.palettes.DistinctColors|Object|Array.<string>)=} opt_value Color palette instance.
 * @return {!anychart.charts.Pie} An instance of {@link anychart.charts.Pie} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(anychart.palettes.RangeColors|anychart.palettes.DistinctColors|Object|Array.<string>)=} opt_value .
 * @return {!(anychart.palettes.RangeColors|anychart.palettes.DistinctColors|anychart.charts.Pie)} .
 */
anychart.charts.Pie.prototype.palette = function(opt_value) {
  if (opt_value instanceof anychart.palettes.RangeColors) {
    this.setupPalette_(anychart.palettes.RangeColors, opt_value);
    return this;
  } else if (opt_value instanceof anychart.palettes.DistinctColors) {
    this.setupPalette_(anychart.palettes.DistinctColors, opt_value);
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
anychart.charts.Pie.prototype.setupPalette_ = function(cls, opt_cloneFrom) {
  if (this.palette_ instanceof cls) {
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
 * @return {!(anychart.palettes.HatchFills|anychart.charts.Pie)} Return current chart hatch fill palette or itself
 * for chaining call.
 */
anychart.charts.Pie.prototype.hatchFillPalette = function(opt_value) {
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


/**
 * Getter for the pie slices fill in normal state.
 * @return {(acgraph.vector.Fill|function():acgraph.vector.Fill)} Current fill in the normal state.
 *//**
 * Setter for the pie slices fill in the normal state.<br/>
 * Learn more about coloring at:
 * {@link http://docs.anychart.com/__VERSION__/General_settings/Elements_Fill}
 * @example
 *  var data = [10, 1, 7, 10];
 *  var chart = anychart.pie(data);
 *  chart.fill(function(){
 *     return 'rgba(210,' + (50 * (this.index + 1) - 10) + ',100,1)';
 *  });
 *  chart.legend(null);
 *  chart.stroke('none');
 *  chart.container(stage).draw();
 * @param {(acgraph.vector.Fill|function():acgraph.vector.Fill)=} opt_value [// return the fill from the default pallete.
 * function() {
 *   return this.sourceColor;
 * };] or Fill, or fill-function, which should look like this:<code>function() {
 *  //  this: {
 *  //  index : number  - the index of the current point
 *  //  sourceColor : acgraph.vector.Fill - fill of the current point
 *  // }
 *  return myFill; //acgraph.vector.Fill
 * };</code>.
 * @return {!anychart.charts.Pie} An instance of {@link anychart.charts.Pie} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|Function|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.charts.Pie|Function} .
 */
anychart.charts.Pie.prototype.fill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var isAqua = false;
    if (goog.isString(opt_fillOrColorOrKeys)) {
      opt_fillOrColorOrKeys = opt_fillOrColorOrKeys.toLowerCase();
      isAqua = opt_fillOrColorOrKeys == 'aquastyle';
    }

    var fill = goog.isFunction(opt_fillOrColorOrKeys) || isAqua ?
        opt_fillOrColorOrKeys :
        acgraph.vector.normalizeFill.apply(null, arguments);
    if (fill != this.fill_) {
      this.fill_ = /** @type {acgraph.vector.Fill}*/(fill);
      this.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.CHART_LEGEND, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.fill_;
};


/**
 * Getter for the pie slices stroke in the normal state.
 * @return {(acgraph.vector.Stroke|function():acgraph.vector.Stroke)} Current stroke in the normal state.
 *//**
 * Setter for the pie slices stroke in the normal state.<br/>
 * Learn more about coloring at:
 * {@link http://docs.anychart.com/__VERSION__/General_settings/Elements_Stroke}
 * @example
 *  var data = [10, 1, 7, 10];
 *  var chart = anychart.pie(data);
 *  chart.stroke('2 white');
 *  chart.container(stage).draw();
 * @param {(acgraph.vector.Stroke|function():acgraph.vector.Stroke)=} opt_value [// return stroke from the default pallete.
 * function() {
 *   return anychart.color.darken(this.sourceColor);
 * };] or Stroke, or stroke-function, which should look like:<code>function() {
 *  //  this: {
 *  //  index : number  - the index of the current point
 *  //  sourceColor : acgraph.vector.Stroke - stroke of the current point
 *  // }
 *  return myStroke; //acgraph.vector.Stroke
 * };</code>.
 * @return {!anychart.charts.Pie} An instance of {@link anychart.charts.Pie} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line joint style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {anychart.charts.Pie|acgraph.vector.Stroke|Function} .
 */
anychart.charts.Pie.prototype.stroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var stroke = goog.isFunction(opt_strokeOrFill) ?
        opt_strokeOrFill :
        acgraph.vector.normalizeStroke.apply(null, arguments);
    if (stroke != this.stroke_) {
      this.stroke_ = stroke;
      this.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.CHART_LEGEND, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.stroke_;
};


/**
 * Getter for the pie slices fill in the hover state.
 * @return {(acgraph.vector.Fill|function():acgraph.vector.Fill)} Current fill in the hover state.
 *//**
 * Setter for the pie slices fill in the hover state.<br/>
 * Learn more about coloring at:
 * {@link http://docs.anychart.com/__VERSION__/General_settings/Elements_Fill}
 * @example
 *  var data = [10, 1, 7, 10];
 *  var chart = anychart.pie(data);
 *  chart.hoverFill(['red', 'blue']);
 *  chart.container(stage).draw();
 * @param {(acgraph.vector.Fill|function():acgraph.vector.Fill)=} opt_value [// return lighter fill of the default pallete.
 * function() {
 *   return anychart.color.lighten(this.sourceColor);
 * };] or Fill, or fill-function, which should look like:<code>function() {
 *  //  this: {
 *  //  index : number  - the index of the current point
 *  //  sourceColor : acgraph.vector.Fill - fill of the current point
 *  // }
 *  return myFill; //acgraph.vector.Fill
 * };</code>.
 * @return {!anychart.charts.Pie} An instance of {@link anychart.charts.Pie} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|Function|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.charts.Pie|Function} .
 */
anychart.charts.Pie.prototype.hoverFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var fill = goog.isFunction(opt_fillOrColorOrKeys) ?
        opt_fillOrColorOrKeys :
        acgraph.vector.normalizeFill.apply(null, arguments);
    if (fill != this.hoverFill_) {
      this.hoverFill_ = fill;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.hoverFill_;
};


/**
 * Getter for the pie slices stroke in the hover state.
 * @return {(acgraph.vector.Stroke|function():acgraph.vector.Stroke)} Current stroke in the hover state.
 *//**
 * Setter for the pie slices stroke in the hover state.<br/>
 * Learn more about coloring at:
 * {@link http://docs.anychart.com/__VERSION__/General_settings/Elements_Stroke}
 * @example
 *  var data = [10, 1, 7, 10];
 *  var chart = anychart.pie(data);
 *  chart.hoverStroke('2 #CC0088');
 *  chart.container(stage).draw();
 * @param {(acgraph.vector.Stroke|function():acgraph.vector.Stroke)=} opt_value [// return stroke from the default pallete.
 * function() {
 *   return anychart.color.darken(this.sourceColor);
 * };] or Stroke, or stroke-function, which should look like:<code>function() {
 *  //  this: {
 *  //  index : number  - the index of the current point
 *  //  sourceColor : acgraph.vector.Stroke - stroke of the current point
 *  // }
 *  return myStroke; //acgraph.vector.Stroke
 * };</code>.
 * @return {!anychart.charts.Pie} An instance of {@link anychart.charts.Pie} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line joint style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {anychart.charts.Pie|acgraph.vector.Stroke|Function} .
 */
anychart.charts.Pie.prototype.hoverStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var stroke = goog.isFunction(opt_strokeOrFill) ?
        opt_strokeOrFill :
        acgraph.vector.normalizeStroke.apply(null, arguments);
    if (stroke != this.hoverStroke_) {
      this.hoverStroke_ = stroke;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.hoverStroke_;
};


/**
 * Getter for current hatch fill settings.
 * @return {acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function} Current hatch fill.
 *//**
 * Setter for hatch fill settings.
 * @example
 *  var data = [10, 1, 7, 10];
 *  var chart = anychart.pie(data);
 *  chart.hatchFill('diagonalbrick');
 *  chart.container(stage).draw();
 * @param {(acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function|acgraph.vector.HatchFill.HatchFillType|
 * string|boolean)=} opt_patternFillOrType PatternFill or HatchFill instance or type of hatch fill.
 * @param {string=} opt_color Color.
 * @param {number=} opt_thickness Thickness.
 * @param {number=} opt_size Pattern size.
 * @return {!anychart.charts.Pie} {@link anychart.charts.Pie} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function|acgraph.vector.HatchFill.HatchFillType|
 * string|boolean)=} opt_patternFillOrTypeOrState PatternFill or HatchFill instance or type of hatch fill.
 * @param {string=} opt_color Color.
 * @param {number=} opt_thickness Thickness.
 * @param {number=} opt_size Pattern size.
 * @return {acgraph.vector.PatternFill|acgraph.vector.HatchFill|anychart.charts.Pie|Function|boolean} Hatch fill.
 */
anychart.charts.Pie.prototype.hatchFill = function(opt_patternFillOrTypeOrState, opt_color, opt_thickness, opt_size) {
  if (goog.isDef(opt_patternFillOrTypeOrState)) {
    var hatchFill = goog.isFunction(opt_patternFillOrTypeOrState) || goog.isBoolean(opt_patternFillOrTypeOrState) ?
        opt_patternFillOrTypeOrState :
        acgraph.vector.normalizeHatchFill.apply(null, arguments);

    if (hatchFill != this.hatchFill_) {
      this.hatchFill_ = hatchFill;
      this.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.CHART_LEGEND, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return /** @type {acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function|boolean} */ (this.hatchFill_);
};


/**
 * Getter for current hover hatch fill settings.
 * @return {acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function} Current hover hatch fill.
 *//**
 * Setter for hover hatch fill settings.
 * @example
 *  var data = [10, 1, 7, 10];
 *  var chart = anychart.pie(data);
 *  chart.hoverHatchFill('diagonalbrick');
 *  chart.container(stage).draw();
 * @param {(acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function|acgraph.vector.HatchFill.HatchFillType|
 * string|boolean)=} opt_patternFillOrType PatternFill or HatchFill instance or type of hatch fill.
 * @param {string=} opt_color Color.
 * @param {number=} opt_thickness Thickness.
 * @param {number=} opt_size Pattern size.
 * @return {!anychart.charts.Pie} {@link anychart.charts.Pie} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function|acgraph.vector.HatchFill.HatchFillType|
 * string|boolean)=} opt_patternFillOrTypeOrState PatternFill or HatchFill instance or type of hatch fill.
 * @param {string=} opt_color Color.
 * @param {number=} opt_thickness Thickness.
 * @param {number=} opt_size Pattern size.
 * @return {acgraph.vector.PatternFill|acgraph.vector.HatchFill|anychart.charts.Pie|Function|boolean} Hatch fill.
 */
anychart.charts.Pie.prototype.hoverHatchFill = function(opt_patternFillOrTypeOrState, opt_color, opt_thickness, opt_size) {
  if (goog.isDef(opt_patternFillOrTypeOrState)) {
    var hatchFill = goog.isFunction(opt_patternFillOrTypeOrState) || goog.isBoolean(opt_patternFillOrTypeOrState) ?
        opt_patternFillOrTypeOrState :
        acgraph.vector.normalizeHatchFill.apply(null, arguments);

    if (this.hoverHatchFill_ != hatchFill)
      this.hoverHatchFill_ = hatchFill;

    return this;
  }
  return /** @type {acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function|boolean} */ (this.hoverHatchFill_);
};


/**
 * Defines show label if it don't fit to bounds slice or not show. ONLY for inside labels.
 * @param {(anychart.enums.LabelsOverlapMode|string)=} opt_value .
 * @return {anychart.enums.LabelsOverlapMode|anychart.charts.Pie} .
 */
anychart.charts.Pie.prototype.overlapMode = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var val = anychart.enums.normalizeLabelsOverlapMode(opt_value) == anychart.enums.LabelsOverlapMode.ALLOW_OVERLAP;
    if (this.insideLabelsOverlap_ != val) {
      this.insideLabelsOverlap_ = val;
      this.invalidate(anychart.ConsistencyState.PIE_LABELS, anychart.Signal.NEEDS_REDRAW);
      return this;
    }
  }
  return this.insideLabelsOverlap_ ?
      anychart.enums.LabelsOverlapMode.ALLOW_OVERLAP :
      anychart.enums.LabelsOverlapMode.NO_OVERLAP;
};


/**
 * Getter for the current pie labels.<br/>
 * It is used to access to the current (default too) settings of the labels.<br>
 * <b>Note:</b> Default labels will appear when this getter is called for the first time.
 * @example
 *  var data = [
 *    {name: 'Point 1', value: 10},
 *    {name: 'Point 2', value: 7},
 *    {name: 'Point 3', value: 20},
 *    {name: 'Point 4', value: 14}
 *  ];
 *  var chart = anychart.pie(data);
 *  chart.labels()
 *      .position('outside')
 *      .fontSize(10)
 *      .fontColor('red');
 *  chart.container(stage).draw();
 * @return {!anychart.core.ui.CircularLabelsFactory} An instance of {@link anychart.core.ui.CircularLabelsFactory} class for method chaining.
 *//**
 * Setter for the pie labels.<br/>
 * <b>Note:</b> positioing is done using {@link anychart.core.ui.CircularLabelsFactory#positionFormatter} method
 * and text is formatted using {@link anychart.core.ui.CircularLabelsFactory#textFormatter} method.
 * @example
 *  var data = [
 *    {name: 'Point 1', value: 10},
 *    {name: 'Point 2', value: 7},
 *    {name: 'Point 3', value: 20},
 *    {name: 'Point 4', value: 14}
 *  ];
 *  var chart = anychart.pie(data);
 *  chart.labels(true);
 *  chart.container(stage).draw();
 * @param {(Object|boolean|null)=} opt_value [] LabelsFactory instance.
 * @return {!anychart.charts.Pie} An instance of {@link anychart.charts.Pie} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(Object|boolean|null)=} opt_value .
 * @return {!(anychart.core.ui.CircularLabelsFactory|anychart.charts.Pie)} .
 */
anychart.charts.Pie.prototype.labels = function(opt_value) {
  if (!this.labels_) {
    this.labels_ = new anychart.core.ui.CircularLabelsFactory();
    this.labels_.zIndex(anychart.charts.Pie.ZINDEX_LABEL);
    this.labels_.textFormatter(function() {
      return (this['value'] * 100 / this.getStat('sum')).toFixed(1) + '%';
    });
    this.labels_.positionFormatter(function() {
      return this['value'];
    });

    this.labels_.listenSignals(this.labelsInvalidated_, this);
    this.registerDisposable(this.labels_);
    this.invalidate(anychart.ConsistencyState.PIE_LABELS, anychart.Signal.NEEDS_REDRAW);
  }

  if (goog.isDef(opt_value)) {
    this.labels_.setup(opt_value);
    return this;
  }
  return this.labels_;
};


/**
 * Getter for series hover data labels.
 * @example
 *  var data = [
 *    {name: 'Point 1', value: 10},
 *    {name: 'Point 2', value: 7},
 *    {name: 'Point 3', value: 20},
 *    {name: 'Point 4', value: 14}
 *  ];
 *  var chart = anychart.pie(data);
 *  chart.hoverLabels()
 *      .fontSize(10)
 *      .fontStyle('italic')
 *      .fontColor('red');
 *  chart.container(stage).draw();
 * @return {!anychart.core.ui.CircularLabelsFactory} Current labels instance.
 *//**
 * Setter for series hover data labels.
 * @example
 *  var data = [
 *    {name: 'Point 1', value: 10},
 *    {name: 'Point 2', value: 7},
 *    {name: 'Point 3', value: 20},
 *    {name: 'Point 4', value: 14}
 *  ];
 *  var chart = anychart.pie(data);
 *  chart.hoverLabels(false);
 *  chart.container(stage).draw();
 * @param {(Object|boolean|null)=} opt_value pie hover data labels settings.
 * @return {!anychart.charts.Pie} {@link anychart.charts.Pie} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(Object|boolean|null)=} opt_value pie hover data labels settings.
 * @return {!(anychart.core.ui.CircularLabelsFactory|anychart.charts.Pie)} Labels instance or itself for chaining call.
 */
anychart.charts.Pie.prototype.hoverLabels = function(opt_value) {
  if (!this.hoverLabels_) {
    this.hoverLabels_ = new anychart.core.ui.CircularLabelsFactory();
    this.hoverLabels_.zIndex(anychart.charts.Pie.ZINDEX_LABEL);
    this.registerDisposable(this.hoverLabels_);
  }

  if (goog.isDef(opt_value)) {
    this.hoverLabels_.setup(opt_value);
    return this;
  }
  return this.hoverLabels_;
};


/**
 * Getter for outside labels space settings.
 * @return {number|string|null} Current outside labels space.
 *//**
 * Setter for outside labels space settings.<br/>
 * <b>Note: </b> Works only with outside labels mode.
 * @example
 * var chart = anychart.pie([5, 2, 1, 3, 1, 3]);
 * chart.labels()
 *   .fontColor('black')
 *   .position('outside');
 * chart.outsideLabelsSpace('15%');
 * chart.container(stage).draw();
 * @param {(number|string)=} opt_value [30%] Value to set.
 * @return {anychart.charts.Pie} {@link anychart.charts.Pie} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(number|string)=} opt_value [30%] Value to set.
 * @return {!anychart.charts.Pie|number|string|null} Outside labels space or self for chaining call.
 */
anychart.charts.Pie.prototype.outsideLabelsSpace = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.outsideLabelsSpace_ != opt_value) {
      this.outsideLabelsSpace_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS | anychart.ConsistencyState.PIE_LABELS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.outsideLabelsSpace_;
};


/**
 * Getter for inside labels offset settings.
 * @return {number|string|null} Current inside labels offset.
 *//**
 * Setter for inside labels space settings.<br/>
 * <b>Note: </b> Works only with inside labels mode.
 * @example
 * var chart = anychart.pie([5, 2, 1, 3, 1, 3]);
 * chart.labels()
 *   .fontColor('black');
 * chart.insideLabelsOffset('15%');
 * chart.container(stage).draw();
 * @param {(number|string)=} opt_value [50%] Value to set.
 * @return {anychart.charts.Pie} {@link anychart.charts.Pie} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(number|string)=} opt_value [50%] Value to set.
 * @return {!anychart.charts.Pie|number|string|null} Inside labels offset or self for chaining call.
 */
anychart.charts.Pie.prototype.insideLabelsOffset = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.insideLabelsOffset_ != opt_value) {
      this.insideLabelsOffset_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS | anychart.ConsistencyState.PIE_LABELS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.insideLabelsOffset_;
};


/**
 * Getter for outside labels connector length.
 * @return {number|string|null} Outside labels connector length.
 *//**
 * Setter for outside labels connector length.<br/>
 * <b>Note: </b> Works only with outside labels mode.
 * @example
 * var chart = anychart.pie([5, 2, 1, 3, 1, 3]);
 * chart.labels()
 *   .fontColor('black')
 *   .position('outside');
 * chart.connectorLength(20);
 * chart.container(stage).draw();
 * @param {(number|string)=} opt_value [30%] Value to set.
 * @return {anychart.charts.Pie} {@link anychart.charts.Pie} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(number|string)=} opt_value [30%] Value to set.
 * @return {!anychart.charts.Pie|number|string|null} Outside labels margin or self for chaining call.
 */
anychart.charts.Pie.prototype.connectorLength = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.connectorLength_ != opt_value) {
      this.connectorLength_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS | anychart.ConsistencyState.PIE_LABELS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.connectorLength_;
};


/**
 * Getter for outside labels connector critical angle settings.
 * @return {number|string|null} Outside labels critical angle.
 *//**
 * Setter for outside labels connector critical angle settings.<br/>
 * Labels with the connector angle greater than critical are not displayed.<br/>
 * <b>Note: </b> Works only with outside labels mode.
 * @example
 * var chart = anychart.pie([50, 2, 1, 3, 1, 3]);
 * chart.labels()
 *   .fontColor('black')
 *   .position('outside');
 * chart.outsideLabelsCriticalAngle(20);
 * chart.container(stage).draw();
 * @param {(number|string)=} opt_value [60] Value to set.
 * @return {anychart.charts.Pie} {@link anychart.charts.Pie} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(number|string)=} opt_value [60] Value to set.
 * @return {!anychart.charts.Pie|number|string|null} Outside labels critical angle or self for chaining call.
 */
anychart.charts.Pie.prototype.outsideLabelsCriticalAngle = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = goog.math.standardAngle(anychart.utils.normalizeSize(opt_value));
    if (this.outsideLabelsCriticalAngle_ != opt_value) {
      this.outsideLabelsCriticalAngle_ = opt_value;
      this.invalidate(anychart.ConsistencyState.PIE_LABELS, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.outsideLabelsCriticalAngle_;
};


/**
 * Getter for outside labels connectors stroke settings.
 * @return {acgraph.vector.Stroke|Function} Current stroke settings.
 *//**
 * Setter for outside labels connectors stroke settings by function.<br/>
 * <b>Note: </b> Works only with outside labels mode.
 * @example
 * var chart = anychart.pie([5, 2, 1, 3, 1, 3]);
 * chart.labels()
 *   .fontColor('black')
 *   .position('outside');
 * chart.connectorStroke(
 *      function(){
 *        return '3 '+ this.sourceColor;
 *      }
 *   );
 * chart.container(stage).draw();
 * @param {function():(acgraph.vector.ColoredFill|acgraph.vector.Stroke)=} opt_fillFunction [function() {
 *  return anychart.color.darken(this.sourceColor);
 * }] Function that looks like <code>function(){
 *    // this.sourceColor -  color returned by fill() getter.
 *    return fillValue; // type acgraph.vector.Fill
 * }</code>.
 * @return {!anychart.charts.Pie} {@link anychart.charts.Pie} instance for method chaining.
 *//**
 * Setter for outside labels connectors stroke settings.<br/>
 * Learn more about stroke settings:
 * {@link http://docs.anychart.com/__VERSION__/General_settings/Elements_Stroke}<br/>
 * <b>Note: </b> Works only with outside labels mode.
 * @example
 * var chart = anychart.pie([5, 2, 1, 3, 1, 3]);
 * chart.labels()
 *   .fontColor('black')
 *   .position('outside');
 * chart.connectorStroke('orange', 3, '5 2', 'round');
 * chart.container(stage).draw();
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line join style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {!anychart.charts.Pie} {@link anychart.charts.Pie} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line joint style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {anychart.charts.Pie|acgraph.vector.Stroke|Function} .
 */
anychart.charts.Pie.prototype.connectorStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var stroke = acgraph.vector.normalizeStroke.apply(null, arguments);
    if (stroke != this.connectorStroke_) {
      this.connectorStroke_ = stroke;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.connectorStroke_;
};


/**
 * Gets the last values set by grouping function or null.
 * @return {(null|function(*):boolean)} Current grouping function.
 *//**
 * Setter for points grouping function.<br/>
 * Groups point and adds final point to the end.
 * <b>Note:</b> To disable filter function pass <b>null</b> or <b>'none'</b>.
 * @example
 * anychart.pie([5, 2, 1, 3, 1, 3])
 *   .group(function(val){ return val > 2; })
 *   .container(stage).draw();
 * @param {(string|null|function(*):boolean)=} opt_value Filter function or disablt value (null, 'none').
 * @return {anychart.charts.Pie} {@link anychart.charts.Pie} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(string|null|function(*):boolean)=} opt_value Filter function or disablt value (null, 'none').
 * @return {(anychart.charts.Pie|function(*):boolean|null)} Current grouping function or self for method chaining.
 */
anychart.charts.Pie.prototype.group = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (goog.isFunction(opt_value) && opt_value != this.groupedPointFilter_) {
      this.groupedPointFilter_ = opt_value;
      this.data(this.parentView_);
    } else if (anychart.utils.isNone(opt_value)) {
      this.groupedPointFilter_ = null;
      this.data(this.parentView_);
    }
    return this;
  } else {
    return this.groupedPointFilter_;
  }
};


/**
 * Getter for the current pie outer radius.
 * @return {(string|number)} Outer radius.
 *//**
 * Setter for the outer pie radius.<br/>
 * Radius can be set as a number (considered as number of pixels),
 * or as a string, e.g.'42%' or '152px'.
 * @example
 *  var data = [10, 7, 4];
 *  anychart.pie(data)
 *     .container(stage)
 *     .radius(100)
 *     .bounds(0,0,'50%', '100%')
 *     .draw();
 *  anychart.pie(data)
 *     .container(stage)
 *     .radius('52%')
 *     .bounds('50%',0,'50%', '100%')
 *     .draw();
 * @param {(string|number)=} opt_value ['45%'] Value of the outer radius.
 * @return {anychart.charts.Pie} An instance of {@link anychart.charts.Pie} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(string|number)=} opt_value ['45%'] Value of the outer radius.
 * @return {(string|number|anychart.charts.Pie)} An instance of {@link anychart.charts.Pie} class for method chaining.
 */
anychart.charts.Pie.prototype.radius = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.radius_ = opt_value;
    this.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.PIE_LABELS,
        anychart.Signal.NEEDS_REDRAW);
    return this;
  } else {
    return this.radius_;
  }
};


/**
 * Getter for the inner radius in case of a Donut chart.
 * @return {(string|number|function(number):number)} Current inner radius of a pie/donut chart.
 *//**
 * Setter for the inner radius in case of a Donut chart.
 * @example
 *  var data = [10, 7, 4, 5];
 *  anychart.pie(data)
 *      .innerRadius('25%')
 *      .bounds(0,0,'50%', '100%')
 *      .container(stage)
 *      .draw();
 *  anychart.pie(data)
 *      .innerRadius(function(outerRadius){
 *          return parseFloat(outerRadius)/2;
 *        })
 *      .bounds('50%',0,'50%', '100%')
 *      .container(stage)
 *      .draw();
 * @param {(string|number|function(number):number)=} opt_value [0] The value of the inner radius in pixels, percents or
 * function. In general the function should look like this:
 * <code>function(outerRadius){
 *   ...
 *   return NUMBER;
 * }
 * </code>.
 * @return {anychart.charts.Pie} An instance of {@link anychart.charts.Pie} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(string|number|function(number):number)=} opt_value .
 * @return {(string|number|function(number):number|anychart.charts.Pie)} .
 */
anychart.charts.Pie.prototype.innerRadius = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.innerRadius_ = opt_value;
    this.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.PIE_LABELS,
        anychart.Signal.NEEDS_REDRAW);
    return this;
  } else {
    return this.innerRadius_;
  }
};


/**
 * Getter for the pie chart center point.<br/>
 * <b>Note:</b> Works only after {@link anychart.charts.Pie#draw} is called.
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
 *  anychart.ui.label()
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
anychart.charts.Pie.prototype.getCenterPoint = function() {
  return {'x': this.cx_, 'y': this.cy_};
};


/**
 * Getter for the current pie pixel outer radius.<br/>
 * <b>Note:</b> Works only after {@link anychart.charts.Pie#draw} is called.
 * @return {number} Pixel value of the pie radius.
 */
anychart.charts.Pie.prototype.getPixelRadius = function() {
  return this.radiusValue_;
};


/**
 * Getter for the current pie pixel inner radius.<br/>
 * <b>Note:</b> Works only after {@link anychart.charts.Pie#draw} is called.
 * @return {number} XY coordinate of the pie center.
 */
anychart.charts.Pie.prototype.getPixelInnerRadius = function() {
  return this.innerRadiusValue_;
};


/**
 * Getter for the angle from which the first slice is drawn clockwise.
 * @return {(number)} Current start angle.
 *//**
 * Setter for the angle from which the first slice is drawn clockwise.
 * @illustration <t>stageOnly</t>
 * var data = [3.4, 0, 6.6, 6.6, 3.4];
 * chart = anychart.pie(data)
 *   .startAngle(0)
 *   .container(stage)
 *   .draw();
 * var center = chart.getCenterPoint();
 * layer.circle(center.x + chart.getPixelRadius(), center.y, 4).fill('red .5').stroke('red');
 * layer.text(center.x + chart.getPixelRadius()+7, center.y - 8, '0\u00B0');
 * layer.circle(center.x + Math.cos(Math.PI/3)*chart.getPixelRadius(), center.y - Math.sin(Math.PI/3)*chart.getPixelRadius(), 4).fill('red .5').stroke('red');
 * layer.text(center.x + Math.cos(Math.PI/3)*chart.getPixelRadius()+7, center.y - Math.sin(Math.PI/3)*chart.getPixelRadius() -10, '-60\u00B0');
 * layer.circle(center.x + Math.cos(Math.PI/3)*chart.getPixelRadius(), center.y + Math.sin(Math.PI/3)*chart.getPixelRadius(), 4).fill('red .5').stroke('red');
 * layer.text(center.x + Math.cos(Math.PI/3)*chart.getPixelRadius()+7, center.y + Math.sin(Math.PI/3)*chart.getPixelRadius() -6, '60\u00B0');
 * layer.circle(center.x - chart.getPixelRadius(), center.y, 4).fill('red .5').stroke('red');
 * layer.text(center.x - chart.getPixelRadius()-30, center.y -8, '180\u00B0');
 * @example
 * anychart.pie([3, 3, 5, 1])
 *   .startAngle(-40)
 *   .container(stage)
 *   .draw();
 * @param {(string|number)=} opt_value [-90] Value of the start angle.
 * @return {anychart.charts.Pie} An instance of {@link anychart.charts.Pie} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(string|number)=} opt_value .
 * @return {(number|anychart.charts.Pie)} .
 */
anychart.charts.Pie.prototype.startAngle = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = goog.math.standardAngle(anychart.utils.toNumber(opt_value) || 0);
    if (this.startAngle_ != opt_value) {
      this.startAngle_ = opt_value;
      this.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.PIE_LABELS,
          anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.startAngle_;
  }
};


/**
 * Internal getter for fixed gauge start angle. All for human comfort.
 * @return {number}
 */
anychart.charts.Pie.prototype.getStartAngle = function() {
  return this.startAngle_ + anychart.charts.Pie.DEFAULT_START_ANGLE;
};


/**
 * Getter for the value of pie slice exploding.
 * @return {(string|number)} Exploding value.
 *//**
 * Sets the value of exploding in pixels.
 * @example
 *  var data = anychart.data.set([
 *       {name: 'Point 1', value: 50},
 *       {name: 'Point 2', value: 13, exploded: true},
 *       {name: 'Point 3', value: 14, exploded: true}
 *     ]);
 *  chart = anychart.pie(data);
 *  chart.container(stage)
 *      .explode(15)
 *      .draw();
 * @param {(string|number)=} opt_value [15] Value of the expansion/exploding.
 * @return {anychart.charts.Pie} An instance of {@link anychart.charts.Pie} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(string|number)=} opt_value .
 * @return {(string|number|anychart.charts.Pie)} .
 */
anychart.charts.Pie.prototype.explode = function(opt_value) {
  if (goog.isDef(opt_value)) {
    // TODO(Anton Saukh): that's an inline of ex normalizeNumberOrStringPercentValue - we should do something about it.
    this.explode_ = isNaN(parseFloat(opt_value)) ? 15 : opt_value;
    this.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.BOUNDS |
        anychart.ConsistencyState.PIE_LABELS, anychart.Signal.NEEDS_REDRAW);
    return this;
  } else {
    return this.explode_;
  }
};


/**
 * Explodes slice at index.
 * @example
 * var chart = anychart.pie([10, 12, 14, 46]);
 * chart.explodeSlice(2);
 * chart.container(stage).draw();
 * @param {number} index Pie slice index that should be exploded or not.
 * @param {boolean=} opt_explode [true] Whether to explode.
 * @return {anychart.charts.Pie} .
 */
anychart.charts.Pie.prototype.explodeSlice = function(index, opt_explode) {
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
 * @param {boolean} value Whether to explode.
 * @return {anychart.charts.Pie} .
 */
anychart.charts.Pie.prototype.explodeSlices = function(value) {
  var iterator = this.getIterator().reset();

  while (iterator.advance()) {
    if (iterator.select(iterator.getIndex()) && !this.isMissing_(iterator.get('value'))) {
      this.clickSlice(value);
    }
  }

  return this;
};


/**
 * Getter for the current sort setting.
 * @return {anychart.enums.Sort} Sort setting.
 *//**
 * Setter for the sort setting.<br/>
 * Ascending, Descending and No sorting is supported.
 * @example
 *  var data = [3.4, 10, 6.6, 7, 3.4];
 *  anychart.pie(data)
 *      .container(stage)
 *      .bounds(0,0,'50%', '100%')
 *      .draw();
 *  anychart.pie(data)
 *      .container(stage)
 *      .bounds('50%',0,'50%', '100%')
 *      .sort(anychart.enums.Sort.DESC)
 *      .draw();
 * @param {(anychart.enums.Sort|string)=} opt_value [{@link anychart.enums.Sort}.NONE] Value of the sort setting.
 * @return {anychart.charts.Pie} An instance of {@link anychart.charts.Pie} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(anychart.enums.Sort|string)=} opt_value .
 * @return {(anychart.enums.Sort|anychart.charts.Pie)} .
 */
anychart.charts.Pie.prototype.sort = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeSort(opt_value);
    if (this.sort_ != opt_value) {
      this.sort_ = opt_value;
      this.data(this.parentView_);
    }
    return this;
  } else {
    return this.sort_;
  }
};


/**
 * Calculating common values for a pie plot.
 * @param {anychart.math.Rect} bounds Bounds of the content area.
 * @private
 */
anychart.charts.Pie.prototype.calculate_ = function(bounds) {
  var minWidthHeight = Math.min(bounds.width, bounds.height);

  this.outsideLabelsOffsetValue_ = this.isOutsideLabels_() ?
      anychart.utils.normalizeSize(this.outsideLabelsSpace_, minWidthHeight) : 0;
  this.radiusValue_ = anychart.utils.normalizeSize(this.radius_, minWidthHeight - this.outsideLabelsOffsetValue_);
  this.connectorLengthValue_ = anychart.utils.normalizeSize(this.connectorLength_, this.radiusValue_);

  //todo Don't remove it, it can be useful (blackart)
  //  this.recommendedLabelWidth_ = parseInt(
  //      (bounds.width
  //          - 2 * this.radiusValue_
  //          - 2 * this.connectorLengthValue_
  //          - 2 * anychart.charts.Pie.OUTSIDE_LABELS_CONNECTOR_SIZE_)
  //      / 2);

  this.innerRadiusValue_ = goog.isFunction(this.innerRadius_) ?
      this.innerRadius_(this.radiusValue_) :
      anychart.utils.normalizeSize(this.innerRadius_, this.radiusValue_);

  this.explodeValue_ = anychart.utils.normalizeSize(this.explode_, minWidthHeight);

  this.cx_ = bounds.left + bounds.width / 2;
  this.cy_ = bounds.top + bounds.height / 2;

  /**
   * Bounds of pie. (Not bounds of content area).
   * Need for radial gradient to set correct bounds.
   * @type {anychart.math.Rect}
   * @private
   */
  this.pieBounds_ = new anychart.math.Rect(
      this.cx_ - this.radiusValue_,
      this.cy_ - this.radiusValue_,
      this.radiusValue_ * 2,
      this.radiusValue_ * 2
      );

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

  this.labels()
      .suspendSignalsDispatching()
      .cx(this.cx_)
      .cy(this.cy_)
      .parentRadius(this.radiusValue_)
      .startAngle(this.startAngle_)
      .sweepAngle(360)
      .parentBounds(this.pieBounds_)
      .resumeSignalsDispatching(false);
};


/**
 * Method that gets final fill color for the current point, with all fallbacks taken into account.
 * @param {boolean} usePointSettings If point settings should count too (iterator questioning).
 * @param {boolean} hover If the fill should be a hover fill.
 * @return {!acgraph.vector.Fill} Final hover fill for the current slice.
 * @protected
 */
anychart.charts.Pie.prototype.getFillColor = function(usePointSettings, hover) {
  var iterator = this.getIterator();
  var normalColor = /** @type {acgraph.vector.Fill|Function} */(
      (usePointSettings && iterator.get('fill')) || this.fill());
  return /** @type {!acgraph.vector.Fill} */(hover ?
      this.normalizeColor(
          /** @type {acgraph.vector.Fill|Function} */(
              (usePointSettings && iterator.get('hoverFill')) || this.hoverFill() || normalColor),
          normalColor) :
      this.normalizeColor(normalColor));
};


/**
 * Method that gets final stroke color for the current point, with all fallbacks taken into account.
 * @param {boolean} usePointSettings If point settings should count too (iterator questioning).
 * @param {boolean} hover If the stroke should be a hover stroke.
 * @return {!acgraph.vector.Stroke} Final hover stroke for the current slice.
 * @protected
 */
anychart.charts.Pie.prototype.getStrokeColor = function(usePointSettings, hover) {
  var iterator = this.getIterator();

  var normalColor = /** @type {acgraph.vector.Stroke|Function} */(
      (usePointSettings && iterator.get('stroke')) ||
      this.stroke());
  return /** @type {!acgraph.vector.Stroke} */(hover ?
      this.normalizeColor(
          /** @type {acgraph.vector.Stroke|Function} */(
              (usePointSettings && iterator.get('hoverStroke')) || this.hoverStroke() || normalColor),
          normalColor) :
      this.normalizeColor(normalColor));
};


/**
 * Method that gets the final hatch fill for a current point, with all fallbacks taken into account.
 * @param {boolean} usePointSettings If point settings should count too (iterator questioning).
 * @param {boolean} hover If the hatch fill should be a hover hatch fill.
 * @return {!(acgraph.vector.HatchFill|acgraph.vector.PatternFill)} Final hatch fill for the current row.
 */
anychart.charts.Pie.prototype.getFinalHatchFill = function(usePointSettings, hover) {
  var iterator = this.getIterator();

  var normalHatchFill;
  if (usePointSettings && goog.isDef(iterator.get('hatchFill'))) {
    normalHatchFill = iterator.get('hatchFill');
  } else {
    normalHatchFill = this.hatchFill();
  }

  var hatchFill;
  if (hover) {
    if (usePointSettings && goog.isDef(iterator.get('hoverHatchFill'))) {
      hatchFill = iterator.get('hoverHatchFill');
    } else if (goog.isDef(this.hoverHatchFill())) {
      hatchFill = this.hoverHatchFill();
    } else {
      hatchFill = normalHatchFill;
    }
  } else {
    hatchFill = normalHatchFill;
  }

  return /** @type {!(acgraph.vector.HatchFill|acgraph.vector.PatternFill)} */(
      this.normalizeHatchFill(
          /** @type {acgraph.vector.HatchFill|acgraph.vector.PatternFill|Function|boolean|string} */(hatchFill)));
};


/**
 * Identifies fill or stroke as radial gradient.
 * @param {(acgraph.vector.Fill|acgraph.vector.Stroke)} fillOrStroke Fill or stroke.
 * @return {boolean} is fill or stroke radial gradient.
 * @private
 */
anychart.charts.Pie.prototype.isRadialGradientMode_ = function(fillOrStroke) {
  return goog.isObject(fillOrStroke) && fillOrStroke.hasOwnProperty('mode') && fillOrStroke.hasOwnProperty('cx');
};


/**
 * Gets final normalized fill or stroke color.
 * @param {acgraph.vector.Fill|acgraph.vector.Stroke|Function|boolean} color Normal state color.
 * @param {...(acgraph.vector.Fill|acgraph.vector.Stroke|Function)} var_args .
 * @return {!(acgraph.vector.Fill|acgraph.vector.Stroke)} Normalized color.
 * @protected
 */
anychart.charts.Pie.prototype.normalizeColor = function(color, var_args) {
  var fill;
  var index = this.getIterator().getIndex();
  var sourceColor, scope;
  if (goog.isString(color) && color == 'aquastyle') {
    scope = {
      'aquaStyleObj': this.aquaStyleObj_,
      'sourceColor': this.palette().colorAt(index)
    };
    fill = this.aquaStylfill_.call(scope);
  } else if (goog.isFunction(color)) {
    sourceColor = arguments.length > 1 ?
        this.normalizeColor.apply(this, goog.array.slice(arguments, 1)) :
        this.palette().colorAt(index);
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
 * Gets final normalized pattern/hatch fill.
 * @param {acgraph.vector.HatchFill|acgraph.vector.PatternFill|Function|boolean|string} hatchFill Normal state hatch fill.
 * @return {acgraph.vector.HatchFill|acgraph.vector.PatternFill} Normalized hatch fill.
 * @protected
 */
anychart.charts.Pie.prototype.normalizeHatchFill = function(hatchFill) {
  var fill;
  var index = this.getIterator().getIndex();
  if (goog.isFunction(hatchFill)) {
    var sourceHatchFill = acgraph.vector.normalizeHatchFill(
        /** @type {acgraph.vector.HatchFill|acgraph.vector.PatternFill} */(this.hatchFillPalette().hatchFillAt(index)));
    var scope = {
      'index': index,
      'sourceHatchFill': sourceHatchFill,
      'iterator': this.getIterator()
    };
    fill = acgraph.vector.normalizeHatchFill(hatchFill.call(scope));
  } else if (goog.isBoolean(hatchFill)) {
    fill = hatchFill ? /** @type {acgraph.vector.PatternFill} */(this.hatchFillPalette().hatchFillAt(index)) : null;
  } else
    fill = acgraph.vector.normalizeHatchFill(hatchFill);
  return fill;
};


/**
 * @inheritDoc
 */
anychart.charts.Pie.prototype.remove = function() {
  if (this.dataLayer_) this.dataLayer_.parent(null);
};


/**
 * Drawing content.
 * @param {anychart.math.Rect} bounds Bounds of content area.
 */
anychart.charts.Pie.prototype.drawContent = function(bounds) {
  this.labels().dropCallsCache();
  var iterator = this.getIterator();
  var exploded;
  var value;
  var rowsCount = iterator.getRowsCount();

  if (rowsCount >= 7) {
    anychart.utils.info(anychart.enums.InfoCode.PIE_TOO_MUCH_POINTS, [rowsCount]);
  }

  if (this.palette_ && this.palette_ instanceof anychart.palettes.RangeColors) {
    this.palette_.count(iterator.getRowsCount());
  }

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
      this.dataLayer_.zIndex(anychart.charts.Pie.ZINDEX_PIE);
      this.dataLayer_.parent(this.rootElement);
    }

    if (!this.hatchLayer_) {
      this.hatchLayer_ = new anychart.core.utils.TypedLayer(function() {
        return acgraph.path();
      }, function(child) {
        (/** @type {acgraph.vector.Path} */ (child)).clear();
      });
      this.hatchLayer_.parent(this.rootElement);
      this.hatchLayer_.zIndex(/** @type {number} */(anychart.charts.Pie.ZINDEX_HATCH_FILL)).disablePointerEvents(true);
    }

    var start = /** @type {number} */ (this.getStartAngle());
    var sweep = 0;

    iterator.reset();
    while (iterator.advance()) {
      value = /** @type {number|string|null|undefined} */ (iterator.get('value'));
      if (this.isMissing_(value)) continue;
      value = +value;
      sweep = value / /** @type {number} */ (this.statistics('sum')) * 360;

      iterator.meta('start', start).meta('sweep', sweep);
      if (!goog.isDef(exploded = iterator.meta('exploded'))) {
        exploded = !!iterator.get('exploded');
        iterator.meta('exploded', exploded);
      }

      this.drawSlice_();
      start += sweep;
    }
    if (this.drawnConnectors_) {
      for (var i in this.drawnConnectors_) {
        this.drawnConnectors_[i].stroke(this.connectorStroke_);
      }
    }

    if (this.hoveredLabelConnectorPath_)
      this.hoveredLabelConnectorPath_.stroke(this.connectorStroke_);

    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }


  if (this.hasInvalidationState(anychart.ConsistencyState.PIE_LABELS)) {
    if (!this.labels().container()) this.labels_.container(this.rootElement);
    this.labels().clear();
    if (this.connectorsLayer_)
      this.connectorsLayer_.clear();

    if (this.isOutsideLabels_()) {
      this.labels().setAutoColor('#000');
      this.calculateOutsideLabels();
    } else {
      this.labels().setAutoColor('#fff');
      iterator.reset();
      while (iterator.advance()) {
        if (this.isMissing_(iterator.get('value'))) continue;
        this.drawLabel_(false);
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
anychart.charts.Pie.prototype.isMissing_ = function(value) {
  value = goog.isNull(value) ? NaN : +value;
  return !(goog.isNumber(value) && !isNaN(value) && (value > 0));
};


/**
 * Internal function for drawinga slice by arguments.
 * @param {boolean=} opt_update Whether to update current slice.
 * @return {boolean} True if point is drawn.
 * @private
 */
anychart.charts.Pie.prototype.drawSlice_ = function(opt_update) {
  var iterator = this.getIterator();

  var index = /** @type {number} */ (iterator.getIndex());
  var start = /** @type {number} */ (iterator.meta('start'));
  var sweep = /** @type {number} */ (iterator.meta('sweep'));
  // if no information about slice in meta (e.g. no slice has drawn: call explodeSlice(_, _) before chart.draw()).
  if (!goog.isDef(start) || !goog.isDef(sweep) || sweep == 0) return false;
  var exploded = !!iterator.meta('exploded') && !(iterator.getRowsCount() == 1);

  var slice, hatchSlice;
  if (opt_update) {
    slice = /** @type {acgraph.vector.Path} */ (iterator.meta('slice'));
    hatchSlice = /** @type {acgraph.vector.Path} */ (iterator.meta('hatchSlice'));
    slice.clear();
    if (hatchSlice) hatchSlice.clear();
  } else {
    slice = this.dataLayer_.genNextChild();
    iterator.meta('slice', slice);
    hatchSlice = iterator.meta('hatchSlice');
    if (!hatchSlice) {
      hatchSlice = this.hatchLayer_.genNextChild();
      iterator.meta('hatchSlice', hatchSlice);
    }
  }

  if (exploded) {
    var angle = start + sweep / 2;
    var cos = Math.cos(angle * Math.PI / 180);
    var sin = Math.sin(angle * Math.PI / 180);
    var ex = this.explodeValue_ * cos;
    var ey = this.explodeValue_ * sin;
    slice = acgraph.vector.primitives.donut(slice, this.cx_ + ex, this.cy_ + ey, this.radiusValue_, this.innerRadiusValue_, start, sweep);
  } else {
    slice = acgraph.vector.primitives.donut(slice, this.cx_, this.cy_, this.radiusValue_, this.innerRadiusValue_, start, sweep);
  }

  slice['__index'] = index;
  var hover = (this.hoverStatus == index);
  this.colorizeSlice(hover);
  if (hatchSlice) {
    hatchSlice.deserialize(slice.serialize());
    hatchSlice['__index'] = index;
    this.applyHatchFill(hover);
  }

  acgraph.events.listen(slice, acgraph.events.EventType.MOUSEOVER, this.mouseOverHandler_, false, this);
  acgraph.events.listen(slice, acgraph.events.EventType.CLICK, this.mouseClickHandler_, false, this);
  acgraph.events.listen(slice, acgraph.events.EventType.DBLCLICK, this.mouseDblClickHandler_, false, this);

  return true;
};


/**
 * Draws outside label for a slice.
 * @private
 * @param {boolean} hovered If it is a hovered label drawing.
 * @param {boolean=} opt_updateConnector Whether to update connector or not.
 * @return {anychart.core.ui.CircularLabelsFactory.Label} Label.
 */
anychart.charts.Pie.prototype.drawOutsideLabel_ = function(hovered, opt_updateConnector) {
  var iterator = this.getIterator();

  var sliceLabel = iterator.get('label');
  var hoverSliceLabel = hovered ? iterator.get('hoverLabel') : null;

  var index = iterator.getIndex();

  var labelsFactory = /** @type {anychart.core.ui.CircularLabelsFactory} */(hovered ? this.hoverLabels() : this.labels());

  var label = this.labels().getLabel(index);

  var labelEnabledState = sliceLabel && goog.isDef(sliceLabel['enabled']) ? sliceLabel['enabled'] : null;
  var labelHoverEnabledState = hoverSliceLabel && goog.isDef(hoverSliceLabel['enabled']) ? hoverSliceLabel['enabled'] : null;

  var isDraw = hovered ?
      goog.isNull(labelHoverEnabledState) ?
          goog.isNull(this.hoverLabels().enabled()) ?
              goog.isNull(labelEnabledState) ?
                  (label && goog.isDef(label.enabled())) ?
                      label.enabled() :
                      this.labels().enabled() :
                  labelEnabledState :
              this.hoverLabels().enabled() :
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
      label.anchor(/** @type {string} */(anchor));

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
      label.anchor(/** @type {string} */(anchor));
    label.enabled(false);
  }
  if (opt_updateConnector)
    this.updateConnector_(/** @type {anychart.core.ui.CircularLabelsFactory.Label}*/(label), isDraw);
  return /** @type {anychart.core.ui.CircularLabelsFactory.Label}*/(label);
};


/**
 * Draws label for a slice.
 * @private
 * @param {boolean} hovered If it is a hovered label drawing.
 * @param {boolean=} opt_updateConnector Whether to update connector or not. Used only with outside labels.
 * @return {anychart.core.ui.CircularLabelsFactory.Label} Label.
 */
anychart.charts.Pie.prototype.drawLabel_ = function(hovered, opt_updateConnector) {
  if (this.isOutsideLabels_())
    return this.drawOutsideLabel_(hovered, opt_updateConnector);

  var iterator = this.getIterator();
  var sliceLabel = iterator.get('label');
  var hoverSliceLabel = hovered ? iterator.get('hoverLabel') : null;
  var index = iterator.getIndex();
  var labelsFactory = /** @type {anychart.core.ui.CircularLabelsFactory} */(hovered ? this.hoverLabels() : this.labels());

  var label = this.labels().getLabel(index);

  var labelEnabledState = sliceLabel && goog.isDef(sliceLabel['enabled']) ? sliceLabel['enabled'] : null;
  var labelHoverEnabledState = hoverSliceLabel && goog.isDef(hoverSliceLabel['enabled']) ? hoverSliceLabel['enabled'] : null;

  var positionProvider = this.createPositionProvider();
  var formatProvider = this.createFormatProvider();

  var singlePoint = (iterator.getRowsCount() == 1);

  var isFitToSlice = true;
  if (!hovered && !this.insideLabelsOverlap_ && !singlePoint) {
    var start = /** @type {number} */ (iterator.meta('start'));
    var sweep = /** @type {number} */ (iterator.meta('sweep'));

    var cx = this.cx_;
    var cy = this.cy_;
    var angle;

    angle = start * Math.PI / 180;
    var ax = cx + this.radiusValue_ * Math.cos(angle);
    var ay = cy + this.radiusValue_ * Math.sin(angle);

    angle = (start - 90) * Math.PI / 180;
    var apx = cx + this.radiusValue_ * Math.cos(angle);
    var apy = cx + this.radiusValue_ * Math.cos(angle);

    angle = (start + sweep) * Math.PI / 180;
    var bx = cx + this.radiusValue_ * Math.cos(angle);
    var by = cy + this.radiusValue_ * Math.sin(angle);

    angle = (start + sweep - 90) * Math.PI / 180;
    var bpx = cx + this.radiusValue_ * Math.cos(angle);
    var bpy = cy + this.radiusValue_ * Math.sin(angle);

    var bounds = labelsFactory.measureWithTransform(formatProvider, positionProvider, /** @type {Object} */(sliceLabel), index);

    var notIntersectStartLine = anychart.math.checkPointsRelativeLine(ax, ay, cx, cy, bounds) ||
        anychart.math.checkPointsRelativeLine(apx, apy, cx, cy, bounds);

    var notIntersectEndLine = anychart.math.checkPointsRelativeLine(cx, cy, bx, by, bounds) ||
        anychart.math.checkPointsRelativeLine(cx, cy, bpx, bpy, bounds);

    isFitToSlice = notIntersectStartLine && notIntersectEndLine;
  }

  var isDraw = hovered ?
      goog.isNull(labelHoverEnabledState) ?
          goog.isNull(this.hoverLabels().enabled()) ?
              goog.isNull(labelEnabledState) ?
                  this.labels().enabled() :
                  labelEnabledState :
              this.hoverLabels().enabled() :
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

    label.draw();

    //todo: this shit should be reworked when labelsFactory will be reworked
    //if usual label isn't disabled and not drawn then it doesn't have container and hover label doesn't know nothing
    //about its DOM element and trying to apply itself setting to it. But nothing will happen because container is empty.
    if (hovered && !label.container() && this.labels().getDomElement()) {
      label.container(this.labels().getDomElement());
      if (!label.container().parent()) {
        label.container().parent(/** @type {acgraph.vector.ILayer} */(this.labels().container()));
      }
      label.draw();
    }
  } else if (label) {
    label.clear();
  }
  return /** @type {anychart.core.ui.CircularLabelsFactory.Label}*/(label);
};


/**
 * Colorizes shape in accordance to current slice colorization settings.
 * Shape is get from current meta 'shape'.
 * @param {boolean} hover If the slice is hovered.
 * @protected
 */
anychart.charts.Pie.prototype.colorizeSlice = function(hover) {
  var slice = /** @type {acgraph.vector.Path} */ (this.getIterator().meta('slice'));
  if (goog.isDef(slice)) {
    var fill = this.getFillColor(true, hover);
    if (this.isRadialGradientMode_(fill) && goog.isNull(fill.mode))
      fill.mode = this.pieBounds_ ? this.pieBounds_ : null;
    slice.fill(fill);

    fill = this.getStrokeColor(true, hover);
    if (this.isRadialGradientMode_(fill) && goog.isNull(fill.mode))
      fill.mode = this.pieBounds_ ? this.pieBounds_ : null;
    slice.stroke(fill);
  }
};


/**
 * Apply hatch fill to shape in accordance to current point colorization settings.
 * Shape is get from current meta 'hatchFillShape'.
 * @param {boolean} hover If the point is hovered.
 * @protected
 */
anychart.charts.Pie.prototype.applyHatchFill = function(hover) {
  var hatchSlice = /** @type {acgraph.vector.Path} */(this.getIterator().meta('hatchSlice'));
  if (goog.isDefAndNotNull(hatchSlice)) {
    hatchSlice
      .stroke(null)
      .fill(this.getFinalHatchFill(true, hover));
  }
};


/**
 * Internal data invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.charts.Pie.prototype.dataInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.DATA_CHANGED)) {
    this.invalidate(
        anychart.ConsistencyState.PIE_LABELS |
        anychart.ConsistencyState.APPEARANCE |
        anychart.ConsistencyState.CHART_LEGEND,
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
anychart.charts.Pie.prototype.labelsInvalidated_ = function(event) {
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
anychart.charts.Pie.prototype.paletteInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.CHART_LEGEND, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Slice hover status. NaN - not hovered, non-negative number - pie slice with this index hovered.
 * @type {number}
 * @protected
 */
anychart.charts.Pie.prototype.hoverStatus = NaN;


/**
 * Hovers pie slice by its index.
 * @param {number} index Index of the slice to hover.
 * @param {acgraph.events.Event=} opt_event Event that initiate Slice hovering.
 * @protected
 * @return {!anychart.charts.Pie} {@link anychart.charts.Pie} instance for method chaining.
 */
anychart.charts.Pie.prototype.hoverSlice = function(index, opt_event) {
  if (this.hoverStatus == index) return this;
  this.unhover();
  if (this.getIterator().reset().select(index)) {
    this.colorizeSlice(true);
    this.applyHatchFill(true);
    if (goog.isDef(opt_event))
      this.showTooltip(opt_event);
    this.drawLabel_(true, true);
  }
  this.hoverStatus = index;
  return this;
};


/**
 * Removes hover from the pie slice.
 * @return {!anychart.charts.Pie} {@link anychart.charts.Pie} instance for method chaining.
 */
anychart.charts.Pie.prototype.unhover = function() {
  if (isNaN(this.hoverStatus)) return this;
  if (this.getIterator().reset().select(this.hoverStatus)) {
    this.colorizeSlice(false);
    this.applyHatchFill(false);
    this.hideTooltip();
    this.drawLabel_(false, true);
  }
  this.hoverStatus = NaN;
  return this;
};


/**
 * Explode or implode pie slice.
 * @protected
 * @param {boolean=} opt_explode Explode value to set.
 */
anychart.charts.Pie.prototype.clickSlice = function(opt_explode) {
  var iterator = this.getIterator();
  // if only 1 point in Pie forbid to explode it
  if (iterator.getRowsCount() == 1)
    return;
  if (goog.isDef(opt_explode)) {
    iterator.meta('exploded', opt_explode);
  } else {
    var exploded = iterator.meta('exploded');
    iterator.meta('exploded', !exploded);
  }
  this.drawSlice_(true);
  var index = iterator.getIndex();
  if (this.isOutsideLabels_()) {
    this.labels().suspendSignalsDispatching();
    this.labels().clear();
    this.calculateOutsideLabels();
    this.labels().draw();
    this.labels().resumeSignalsDispatching(true);
    iterator.select(index);
  }
  this.drawLabel_(this.hoverStatus == index, this.hoverStatus == index);
};


/**
 * @private
 * @return {boolean} Define, is labels have outside position.
 */
anychart.charts.Pie.prototype.isOutsideLabels_ = function() {
  return anychart.enums.normalizeSidePosition(this.labels().position()) == anychart.enums.SidePosition.OUTSIDE;
};


/**
 * Mouse over internal handler.
 * @param {acgraph.events.Event} event Event object.
 * @private
 */
anychart.charts.Pie.prototype.mouseOverHandler_ = function(event) {
  if (this.dispatchEvent(new anychart.charts.Pie.BrowserEvent(this, event))) {
    if (event && event.target) {
      if (goog.isDef(event.target['__index']))
        this.hoverSlice(event.target['__index'], event);
      else
        this.unhover();
    } else
      this.unhover();

    acgraph.events.listen(event.target, acgraph.events.EventType.MOUSEOUT, this.mouseOutHandler_, false, this);
  }
};


/**
 * Mouse out internal handler.
 * @param {acgraph.events.Event} event Event object.
 * @private
 */
anychart.charts.Pie.prototype.mouseOutHandler_ = function(event) {
  if (this.dispatchEvent(new anychart.charts.Pie.BrowserEvent(this, event))) {
    this.unhover();
    acgraph.events.unlisten(event.target, acgraph.events.EventType.MOUSEOUT, this.mouseOutHandler_, false, this);
  }
};


/**
 * Mouse click internal handler.
 * @param {acgraph.events.Event} event Event object.
 * @private
 */
anychart.charts.Pie.prototype.mouseClickHandler_ = function(event) {
  if (this.dispatchEvent(new anychart.charts.Pie.BrowserEvent(this, event))) {
    if (event && event.target) {
      if (goog.isDef(event.target['__index'])) {
        this.getIterator().select(event.target['__index']);
        this.clickSlice();
      }
    }
  }
};


/**
 * Mouse dblclick internal handler.
 * @param {acgraph.events.Event} event Event object.
 * @private
 */
anychart.charts.Pie.prototype.mouseDblClickHandler_ = function(event) {
  this.dispatchEvent(new anychart.charts.Pie.BrowserEvent(this, event));
};


/** @inheritDoc */
anychart.charts.Pie.prototype.createLegendItemsProvider = function(sourceMode, itemsTextFormatter) {
  /**
   * @type {!Array.<anychart.core.ui.Legend.LegendItemProvider>}
   */
  var data = [];
  var iterator = this.getIterator().reset();
  var x, index;
  var isAqua = (this.fill() == 'aquastyle');
  if (isAqua) {
    /** @type {Object} */
    var aquaStyleObj = this.aquaStyleObj_;
    this.aquaStyleObj_ = {};
  }
  while (iterator.advance()) {
    x = iterator.get('x');
    index = iterator.getIndex();
    var legendItem = /** @type {Object} */ (iterator.get('legendItem') || {});
    var itemText = null;
    if (goog.isFunction(itemsTextFormatter)) {
      var format = this.createFormatProvider();
      itemText = itemsTextFormatter.call(format, format);
    }
    if (!goog.isString(itemText)) {
      itemText = String(goog.isDef(iterator.get('name')) ? iterator.get('name') : iterator.get('x'));
    }
    var obj = {
      'enabled': true,
      'meta': {
        'pointIndex': index,
        'pointValue': iterator.get('value')
      },
      'iconType': anychart.enums.LegendItemIconType.SQUARE,
      'text': itemText,
      'iconStroke': this.getStrokeColor(true, false),
      'iconFill': this.getFillColor(true, false),
      'iconHatchFill': this.getFinalHatchFill(true, false)
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
anychart.charts.Pie.prototype.legendItemCanInteractInMode = function(mode) {
  return true;
};


/** @inheritDoc */
anychart.charts.Pie.prototype.legendItemClick = function(item) {
  var sourceKey = item.sourceKey();
  var iterator = this.data().getIterator();
  if (iterator.select(/** @type {number} */ (sourceKey))) {
    var isExploded = !!iterator.meta('exploded');
    this.explodeSlice(/** @type {number} */ (sourceKey), !isExploded);
  }
};


/** @inheritDoc */
anychart.charts.Pie.prototype.legendItemOver = function(item) {
  var sourceKey = item.sourceKey();
  if (item && !goog.isDefAndNotNull(sourceKey) && !isNaN(sourceKey))
    return;
  var iterator = this.data().getIterator();
  if (iterator.select(/** @type {number} */ (sourceKey))) {
    this.hoverSlice(/** @type {number} */ (sourceKey));
  }
};


/** @inheritDoc */
anychart.charts.Pie.prototype.legendItemOut = function(item) {
  this.unhover();
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Tooltip.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter for tolltip settings.
 * @example
 * var chart = anychart.pie([10, 14, 8, 12]);
 * chart.tooltip()
 *     .titleFormatter(function(){
 *         return 'title [' + this.index + ']';
 *     })
 *     .title()
 *         .enabled(true);
 * chart.container(stage).draw();
 * @return {!anychart.core.ui.Tooltip} An instance of {@link anychart.core.ui.Tooltip} class for method chaining.
 *//**
 * Setter for tolltip settings.
 * @example
 * var chart = anychart.pie([10, 14, 8, 12]);
 * chart.tooltip(false);
 * chart.container(stage).draw();
 * @param {(Object|boolean|null)=} opt_value Tooltip settings.
 * @return {!anychart.charts.Pie} An instance of {@link anychart.charts.Pie} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(Object|boolean|null)=} opt_value Tooltip settings.
 * @return {!(anychart.charts.Pie|anychart.core.ui.Tooltip)} Tooltip instance or self for method chaining.
 */
anychart.charts.Pie.prototype.tooltip = function(opt_value) {
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
anychart.charts.Pie.prototype.onTooltipSignal_ = function(event) {
  var tooltip = /** @type {anychart.core.ui.Tooltip} */(this.tooltip());
  tooltip.redraw();
};


/**
 * Show data point tooltip.
 * @protected
 * @param {goog.events.BrowserEvent=} opt_event Event that initiate tooltip to show.
 */
anychart.charts.Pie.prototype.showTooltip = function(opt_event) {
  this.moveTooltip(opt_event);
  acgraph.events.listen(
      goog.dom.getDocument(),
      acgraph.events.EventType.MOUSEMOVE,
      this.moveTooltip,
      false,
      this);
};


/**
 * Hide data point tooltip.
 * @protected
 */
anychart.charts.Pie.prototype.hideTooltip = function() {
  var tooltip = /** @type {anychart.core.ui.Tooltip} */(this.tooltip());
  acgraph.events.unlisten(
      goog.dom.getDocument(),
      acgraph.events.EventType.MOUSEMOVE,
      this.moveTooltip,
      false,
      this);
  tooltip.hide();
};


/**
 * @protected
 * @param {goog.events.BrowserEvent=} opt_event initiates tooltip show.
 */
anychart.charts.Pie.prototype.moveTooltip = function(opt_event) {
  var tooltip = /** @type {anychart.core.ui.Tooltip} */(this.tooltip());
  var formatProvider = this.createFormatProvider();
  if (tooltip.isFloating() && opt_event) {
    tooltip.show(
        formatProvider,
        new acgraph.math.Coordinate(opt_event.clientX, opt_event.clientY));
  } else {
    tooltip.show(
        formatProvider,
        new acgraph.math.Coordinate(0, 0));
  }
};


/**
 * Calculates statistic for pie.
 * @private
 */
anychart.charts.Pie.prototype.calculateStatistics_ = function() {
  this.statistics_ = {};
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
  if (count == 0) min = max = sum = avg = undefined;
  else avg = sum / count;
  this.statistics_['count'] = count;
  this.statistics_['min'] = min;
  this.statistics_['max'] = max;
  this.statistics_['sum'] = sum;
  this.statistics_['average'] = avg;
};


/**
 * Gets statistic value by its key.
 * @param {string=} opt_key
 * @param {string=} opt_value
 * @return {*} Statistic value by key, statistic object, or self in case of setter.
 */
anychart.charts.Pie.prototype.statistics = function(opt_key, opt_value) {
  if (!this.statistics_)
    this.calculateStatistics_();
  if (goog.isDef(opt_key)) {
    if (goog.isDef(opt_value)) {
      this.statistics_[opt_key] = opt_value;
      return this;
    } else {
      return this.statistics_[opt_key];
    }
  } else {
    return this.statistics_;
  }
};


/**
 * Create pie label format provider.
 * @return {Object} Object with info for labels formatting.
 * @protected
 */
anychart.charts.Pie.prototype.createFormatProvider = function() {
  if (!this.pointProvider_)
    this.pointProvider_ = new anychart.core.utils.PiePointContextProvider(this, ['x', 'value', 'name']);
  this.pointProvider_.applyReferenceValues();
  return this.pointProvider_;
};


/**
 *
 * @param {anychart.core.ui.CircularLabelsFactory.Label} label .
 * @return {anychart.math.Rect}
 */
anychart.charts.Pie.prototype.getLabelBounds = function(label) {
  if (!this.labelsBoundsCache_) this.labelsBoundsCache_ = [];
  var index = label.getIndex();
  if (!this.labelsBoundsCache_[index])
    this.labelsBoundsCache_[index] = anychart.math.Rect.fromCoordinateBox(this.labels_.measureWithTransform(label));

  return this.labelsBoundsCache_[index];
};


/**
 * Drop label bounds cache.
 * @param {anychart.core.ui.CircularLabelsFactory.Label} label Label to drop bounds.
 */
anychart.charts.Pie.prototype.dropLabelBoundsCache = function(label) {
  var index = label.getIndex();
  if (this.labelsBoundsCache_) {
    this.labelsBoundsCache_[index] = null;
  }
};


/**
 * Defragmentation domain. If domain have critical angle then need defragment domain.
 * @param {!anychart.charts.Pie.PieOutsideLabelsDomain} domain Domain to defragmentation.
 */
anychart.charts.Pie.prototype.domainDefragmentation = function(domain) {
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
          var isRightSide = label.anchor() == anychart.enums.Anchor.LEFT_CENTER;
          tmpDomain = new anychart.charts.Pie.PieOutsideLabelsDomain(isRightSide, this, sourcePieLabelsDomains);
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
anychart.charts.Pie.prototype.calculateOutsideLabels = function() {
  var iterator = this.getIterator();
  var label, x0, y0, dR0, isRightSide;

  this.connectorAnchorCoords = [];
  var connector;

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

    if (angleDeg > 270 &&
        !switchToRightSide &&
        (leftSideLabels.length != 0 || (leftSideLabels2 && leftSideLabels2.length != 0))) {
      switchToRightSide = true;
      rightSideLabels2 = [];
    }

    if (angleDeg > 90 &&
        !switchToLeftSide &&
        (rightSideLabels.length != 0 || (rightSideLabels2 && rightSideLabels2.length != 0))) {
      switchToLeftSide = true;
      leftSideLabels2 = [];
    }

    isRightSide = angleDeg < 90 || angleDeg > 270;

    dR0 = this.radiusValue_ + (exploded ? this.explodeValue_ : 0);

    // coordinates of the point where the connector touches a pie
    x0 = this.cx_ + dR0 * Math.cos(angle);
    y0 = this.cy_ + dR0 * Math.sin(angle);

    connector = isRightSide ?
        anychart.charts.Pie.OUTSIDE_LABELS_CONNECTOR_SIZE_ :
        -anychart.charts.Pie.OUTSIDE_LABELS_CONNECTOR_SIZE_;
    iterator.meta('connector', connector);

    this.connectorAnchorCoords[index * 2] = x0;
    this.connectorAnchorCoords[index * 2 + 1] = y0;

    var anchor = isRightSide ? anychart.enums.Position.LEFT_CENTER : anychart.enums.Position.RIGHT_CENTER;
    iterator.meta('anchor', anchor);
    label = this.drawLabel_(false, false);
    this.dropLabelBoundsCache(label);

    label.angle_ = angleDeg;
    if (isRightSide) {
      switchToRightSide ? rightSideLabels2.push(label) : rightSideLabels.push(label);
    } else {
      switchToLeftSide ? leftSideLabels2.push(label) : leftSideLabels.push(label);
    }
  }

  rightSideLabels = rightSideLabels2 ? rightSideLabels2.concat(rightSideLabels) : rightSideLabels;
  leftSideLabels = leftSideLabels2 ? leftSideLabels2.concat(leftSideLabels) : leftSideLabels;

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

      if (!domain || domain.isNotIntersect(bounds)) {
        if (domain) leftDomains.push(domain);
        isRightSide = label.anchor() == anychart.enums.Position.LEFT_CENTER;
        domain = new anychart.charts.Pie.PieOutsideLabelsDomain(isRightSide, this, leftDomains);
        domain.addLabel(label);
      } else {
        domain.addLabel(label);
      }
    }
  }
  leftDomains.push(domain);

  for (i = 0, len = leftDomains.length; i < len; i++) {
    domain = leftDomains[i];
    if (domain.droppedLabels) {
      if (!droppedLabels) droppedLabels = [];
      droppedLabels = goog.array.concat(droppedLabels, domain.droppedLabels);
    }
  }

  domain = null;
  if (droppedLabels) {
    goog.array.sort(droppedLabels, function(a, b) {
      return a.getIndex() > b.getIndex() ? 1 : a.getIndex() < b.getIndex() ? -1 : 0});

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
            isRightSide = label.anchor() == anychart.enums.Position.LEFT_CENTER;
            domain = new anychart.charts.Pie.PieOutsideLabelsDomain(isRightSide, this, []);
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
        isRightSide = label.anchor() == anychart.enums.Position.LEFT_CENTER;
        domain = new anychart.charts.Pie.PieOutsideLabelsDomain(isRightSide, this, rightDomains);
        domain.addLabel(label);
      } else {
        domain.addLabel(label);
      }
    }
  }
  rightDomains.push(domain);

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
      return a.getIndex() > b.getIndex() ? 1 : a.getIndex() < b.getIndex() ? -1 : 0});

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
            isRightSide = label.anchor() == anychart.enums.Position.LEFT_CENTER;
            domain = new anychart.charts.Pie.PieOutsideLabelsDomain(isRightSide, this, []);
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

  //-----------init connector element------------------------------------------------------------------------

  if (this.connectorsLayer_) {
    this.connectorsLayer_.clear();
  } else {
    this.connectorsLayer_ = new anychart.core.utils.TypedLayer(function() {
      return acgraph.path();
    }, function(child) {
      (/** @type {acgraph.vector.Path} */ (child)).clear();
    });
    this.connectorsLayer_.parent(this.rootElement);
    this.connectorsLayer_.zIndex(anychart.charts.Pie.ZINDEX_LABEL);
  }
  this.drawnConnectors_ = [];
  if (!this.hoveredLabelConnectorPath_) {
    // path for connector for label disabled by algorithm
    this.hoveredLabelConnectorPath_ = this.rootElement.path();
    this.hoveredLabelConnectorPath_.stroke(this.connectorStroke_);
  }

  //-----------left domains connectors calculation, applying labels positions--------------------------------

  var k, labelsLen;
  var connectorPath;
  for (i = 0, len = leftDomains.length; i < len; i++) {
    domain = leftDomains[i];
    if (domain) {
      domain.applyPositions();

      for (k = 0, labelsLen = domain.labels.length; k < labelsLen; k++) {
        label = domain.labels[k];
        if (label && label.enabled() != false) {
          index = label.getIndex();

          if (!this.drawnConnectors_[index]) {
            this.drawnConnectors_[index] = connectorPath = /** @type {acgraph.vector.Path} */(this.connectorsLayer_.genNextChild());
            connectorPath.stroke(this.connectorStroke_);
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
            this.drawnConnectors_[index] = connectorPath = /** @type {acgraph.vector.Path} */(this.connectorsLayer_.genNextChild());
            connectorPath.stroke(this.connectorStroke_);
            this.drawConnectorLine(label, connectorPath);
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
anychart.charts.Pie.prototype.drawConnectorLine = function(label, path) {
  var iterator = this.data().getIterator();
  var index = label.getIndex();
  if (iterator.select(index)) {
    var x0 = this.connectorAnchorCoords[index * 2];
    var y0 = this.connectorAnchorCoords[index * 2 + 1];

    var connector = /** @type {number} */(iterator.meta('connector'));
    var positionProvider = label.positionProvider()['value'];

    var offsetY = goog.isDef(label.offsetY()) ? label.offsetY() : this.labels().offsetY();
    if (!offsetY) offsetY = 0;
    var offsetRadius = anychart.utils.normalizeSize(/** @type {number|string} */(offsetY), this.radiusValue_);

    var offsetX = goog.isDef(label.offsetX()) ? label.offsetX() : this.labels().offsetX();
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
anychart.charts.Pie.prototype.updateConnector_ = function(label, show) {
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
anychart.charts.Pie.prototype.createPositionProvider = function() {
  var outside = this.isOutsideLabels_();
  var iterator = this.getIterator();
  var singlePoint = (iterator.getRowsCount() == 1);
  var start = /** @type {number} */ (iterator.meta('start'));
  var sweep = /** @type {number} */ (iterator.meta('sweep'));
  var exploded = /** @type {boolean} */ (iterator.meta('exploded')) && !singlePoint;
  var angle = start + sweep / 2;
  var dR;

  if (outside)
    dR = (this.radiusValue_ + this.connectorLengthValue_) + (exploded ? this.explodeValue_ : 0);
  else {
    var radius = singlePoint && !this.innerRadiusValue_ ? 0 : this.radiusValue_ - this.innerRadiusValue_;
    dR = anychart.utils.normalizeSize(this.insideLabelsOffset_, radius) +
        this.innerRadiusValue_ + (exploded ? this.explodeValue_ : 0);
  }

  return {'value': {'angle': angle, 'radius': dR}};
};


/** @inheritDoc */
anychart.charts.Pie.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');
  json['type'] = anychart.enums.ChartTypes.PIE;
  json['data'] = this.data().serialize();
  json['labels'] = this.labels().serialize();
  json['hoverLabels'] = this.hoverLabels().serialize();
  json['palette'] = this.palette().serialize();
  json['hatchFillPalette'] = this.hatchFillPalette().serialize();
  json['tooltip'] = this.tooltip().serialize();

  json['sort'] = this.sort();
  json['radius'] = this.radius();
  json['innerRadius'] = this.innerRadius();
  json['startAngle'] = this.startAngle();
  json['explode'] = this.explode();
  json['outsideLabelsSpace'] = this.outsideLabelsSpace();
  json['insideLabelsOffset'] = this.insideLabelsOffset();
  json['connectorLength'] = this.connectorLength();
  json['outsideLabelsCriticalAngle'] = this.outsideLabelsCriticalAngle();
  json['overlapMode'] = this.overlapMode();


  // The values of group() function can be function or null or 'none'. So we don't serialize it anyway.
  //if (goog.isFunction(this['group'])) {
  //  if (goog.isFunction(this.group())) {
  //    anychart.utils.warning(
  //        anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
  //        null,
  //        ['Pie group']
  //    );
  //  } else {
  //    json['group'] = this.group();
  //  }
  //}
  if (goog.isFunction(this['connectorStroke'])) {
    if (goog.isFunction(this.connectorStroke())) {
      anychart.utils.warning(
          anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
          null,
          ['Pie connectorStroke']
      );
    } else {
      json['connectorStroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke}*/(this.connectorStroke()));
    }
  }
  if (goog.isFunction(this['fill'])) {
    if (goog.isFunction(this.fill())) {
      anychart.utils.warning(
          anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
          null,
          ['Pie fill']
      );
    } else {
      json['fill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.fill()));
    }
  }
  if (goog.isFunction(this['hoverFill'])) {
    if (goog.isFunction(this.hoverFill())) {
      anychart.utils.warning(
          anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
          null,
          ['Pie hoverFill']
      );
    } else {
      json['hoverFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.hoverFill()));
    }
  }
  if (goog.isFunction(this['stroke'])) {
    if (goog.isFunction(this.stroke())) {
      anychart.utils.warning(
          anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
          null,
          ['Pie stroke']
      );
    } else {
      json['stroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke}*/(this.stroke()));
    }
  }
  if (goog.isFunction(this['hoverStroke'])) {
    if (goog.isFunction(this.hoverStroke())) {
      anychart.utils.warning(
          anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
          null,
          ['Pie hoverStroke']
      );
    } else {
      json['hoverStroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke}*/(this.hoverStroke()));
    }
  }
  if (goog.isFunction(this['hatchFill'])) {
    if (goog.isFunction(this.hatchFill())) {
      anychart.utils.warning(
          anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
          null,
          ['Pie hatchFill']
      );
    } else {
      json['hatchFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.hatchFill()));
    }
  }
  if (goog.isFunction(this['hoverHatchFill'])) {
    if (goog.isFunction(this.hoverHatchFill())) {
      anychart.utils.warning(
          anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
          null,
          ['Pie hoverHatchFill']
      );
    } else {
      json['hoverHatchFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/
          (this.hoverHatchFill()));
    }
  }
  return {'chart': json};
};


/** @inheritDoc */
anychart.charts.Pie.prototype.setupByJSON = function(config) {
  goog.base(this, 'setupByJSON', config);
  this.group(config['group']);
  this.data(config['data']);
  this.labels(config['labels']);
  this.hoverLabels(config['hoverLabels']);
  this.palette(config['palette']);
  this.hatchFillPalette(config['hatchFillPalette']);
  this.tooltip(config['tooltip']);
  this.sort(config['sort']);
  this.radius(config['radius']);
  this.innerRadius(config['innerRadius']);
  this.startAngle(config['startAngle']);
  this.explode(config['explode']);
  this.outsideLabelsSpace(config['outsideLabelsSpace']);
  this.insideLabelsOffset(config['insideLabelsOffset']);
  this.overlapMode(config['overlapMode']);
  this.connectorLength(config['connectorLength']);
  this.outsideLabelsCriticalAngle(config['outsideLabelsCriticalAngle']);
  this.connectorStroke(config['connectorStroke']);
  this.fill(config['fill']);
  this.stroke(config['stroke']);
  this.hoverFill(config['hoverFill']);
  this.hoverStroke(config['hoverStroke']);
  this.hatchFill(config['hatchFill']);
  this.hoverHatchFill(config['hoverHatchFill']);
};



/**
 * Labels Domain.
 * @param {boolean} isRight .
 * @param {!anychart.charts.Pie} pie .
 * @param {Array.<anychart.charts.Pie.PieOutsideLabelsDomain>} domains .
 * @constructor
 */
anychart.charts.Pie.PieOutsideLabelsDomain = function(isRight, pie, domains) {
  /**
   *
   * @type {Array.<anychart.charts.Pie.PieOutsideLabelsDomain>}
   */
  this.pieLabelsDomains = domains;

  /**
   * Link to pie.
   * @type {!anychart.charts.Pie}
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
   * @type {acgraph.math.Rect}
   */
  this.boundsCache = null;
};


/**
 * Dropped labels.
 * @type {Array.<anychart.core.ui.CircularLabelsFactory.Label>}
 */
anychart.charts.Pie.PieOutsideLabelsDomain.prototype.droppedLabels;


/**
 * Adding label to domain with checks critical angles and intersection with other domains.
 * @param {anychart.core.ui.CircularLabelsFactory.Label} label Adding label.
 */
anychart.charts.Pie.PieOutsideLabelsDomain.prototype.addLabel = function(label) {
  if (label) {
    this.labels.push(label);
    this.calculate();
  }
};


/**
 * Adding label to domain without any checks.
 * @param {anychart.core.ui.CircularLabelsFactory.Label} label Adding label.
 */
anychart.charts.Pie.PieOutsideLabelsDomain.prototype.softAddLabel = function(label) {
  if (label) {
    this.labels.push(label);
    this.calcDomain();
  }
};


/**
 * Clearing dropped labels array.
 */
anychart.charts.Pie.PieOutsideLabelsDomain.prototype.clearDroppedLabels = function() {
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
anychart.charts.Pie.PieOutsideLabelsDomain.prototype.dropLabel = function(label, index) {
  if (!isNaN(index)) {

    label.enabled(false);
    if (!this.droppedLabels) this.droppedLabels = [];
    this.droppedLabels.push(label);

    goog.array.splice(this.labels, index, 1);
  }
};


/**
 * Get label bounds.
 * @return {acgraph.math.Rect} Label bounds.
 */
anychart.charts.Pie.PieOutsideLabelsDomain.prototype.getBounds = function() {
  if (!this.boundsCache) {
    var firstLabelHeight = this.labels[0] ? this.pie.getLabelBounds(this.labels[0]).height : 0;
    var domainY = this.y + firstLabelHeight / 2;
    this.boundsCache = new acgraph.math.Rect(this.x, domainY, this.width, this.height);
  }

  return this.boundsCache;
};


/**
 * Drop bounds cache.
 */
anychart.charts.Pie.PieOutsideLabelsDomain.prototype.dropBoundsCache = function() {
  this.boundsCache = null;
};


/**
 * Check intersections this domain with other domain.
 * @param {anychart.math.Rect} bounds Passed labels bounds.
 * @return {boolean} is not intersect with entry with incoming params.
 */
anychart.charts.Pie.PieOutsideLabelsDomain.prototype.isNotIntersect = function(bounds) {
  var bounds1 = this.getBounds().toCoordinateBox();
  var bounds2 = bounds.toCoordinateBox();
  return !anychart.math.checkRectIntersection(bounds1, bounds2);
};


/**
 * Applying positions to labels.
 */
anychart.charts.Pie.PieOutsideLabelsDomain.prototype.applyPositions = function() {
  for (var j = 0, len = this.labels.length; j < len; j++) {
    var label = this.labels[j];

    var angle = this.labelsPositions[j * 2];
    var radius = this.labelsPositions[j * 2 + 1];

    var positionProviderValue = label.positionProvider()['value'];

    positionProviderValue['angle'] = angle;
    positionProviderValue['radius'] = radius;

    this.pie.dropLabelBoundsCache(label);
  }
};


/**
 * Calculating domain parameters: bounds, labels positions, critical angle.
 */
anychart.charts.Pie.PieOutsideLabelsDomain.prototype.calcDomain = function() {
  var label, labelBounds;
  this.height = 0;
  var sumPos = 0;
  this.dropBoundsCache();

  var pieCenter = this.pie.getCenterPoint();
  var cx = pieCenter['x'], cy = pieCenter['y'];
  var bottomLabelsYLimit = cy + this.pie.getPixelRadius() + this.pie.connectorLengthValue_ - .1;
  var topLabelsYLimit = cy - (this.pie.getPixelRadius() + this.pie.connectorLengthValue_) + .1;

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

  var criticalAngle = this.pie.outsideLabelsCriticalAngle();

  this.labelsPositions.length = 0;
  var iterator = this.pie.data().getIterator();
  var nextLabelHeight;
  var start, sweep, exploded, angle, angleDeg, dR, dRPie, y, y0, y1, x, x0, x1, connector;
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

    var offsetX = goog.isDef(label.offsetX()) ? label.offsetX() : this.pie.labels().offsetX();
    if (!offsetX) offsetX = 0;
    var offsetAngle = anychart.utils.normalizeSize(/** @type {number|string} */(offsetX), 360);

    var offsetY = goog.isDef(label.offsetY()) ? label.offsetY() : this.pie.labels().offsetY();
    if (!offsetY) offsetY = 0;
    var offsetRadius = anychart.utils.normalizeSize(/** @type {number|string} */(offsetY), this.pie.radiusValue_);

    angle = (start + sweep / 2 + offsetAngle) * Math.PI / 180;
    angleDeg = goog.math.standardAngle(goog.math.toDegrees(angle));

    connector = this.isRightSide ?
        anychart.charts.Pie.OUTSIDE_LABELS_CONNECTOR_SIZE_ :
        -anychart.charts.Pie.OUTSIDE_LABELS_CONNECTOR_SIZE_;

    dRPie = this.pie.radiusValue_ + (exploded ? this.pie.explodeValue_ : 0);
    dR = (this.pie.getPixelRadius() + this.pie.connectorLengthValue_) + (exploded ? this.pie.explodeValue_ : 0) + offsetRadius;

    // new coordinates of the point where connector touches a label
    y = startLabelsDrawingYPos;
    var leg = dR * dR - Math.pow(y - cy, 2);
    x = cx + (this.isRightSide ? 1 : -1) * Math.sqrt(Math.abs(leg));

    // coordinates of the point where connector touches a pie
    x0 = cx + dRPie * Math.cos(angle);
    y0 = cy + dRPie * Math.sin(angle);

    // normal (before transformation) coordinate of the point where connector touches a label.
    x1 = cx + dR * Math.cos(angle);
    y1 = cy + dR * Math.sin(angle);

    var normalConnector = (Math.sqrt(Math.pow(x0 - x1, 2) + Math.pow(y0 - y1, 2))).toFixed(3);
    var txConnector = (Math.sqrt(Math.pow(x0 - x, 2) + Math.pow(y0 - y, 2))).toFixed(3);
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

    var radius_ = Math.sqrt(Math.pow(labelXCoord - cx, 2) + Math.pow(y - cy, 2)) - offsetRadius;

    var angle_ = NaN;
    if (x_ > 0 && y_ >= 0) {
      angle_ = goog.math.toDegrees(Math.atan(y_ / x_));
    } else if (x_ > 0 && y_ < 0) {
      angle_ = goog.math.toDegrees(Math.atan(y_ / x_)) + 360;
    } else if (x_ < 0) {
      angle_ = goog.math.toDegrees(Math.atan(y_ / x_)) + 180;
    } else if (x_ == 0 && y_ > 0) {
      angle_ = 90;
    } else if (x_ == 0 && y_ < 0) {
      angle_ = 270;
    }

    angle_ -= offsetAngle;

    this.labelsPositions.push(angle_, radius_);

    startLabelsDrawingYPos -= labelBounds.height / 2 + nextLabelHeight / 2;
  }

  this.width -= this.x;
};


/**
 * Calculating domain with checks critical angles and intersection with other domains.
 */
anychart.charts.Pie.PieOutsideLabelsDomain.prototype.calculate = function() {
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
 * Encapsulates browser event for acgraph.
 * @param {anychart.charts.Pie} target EventTarget to be set as a target of the event.
 * @param {goog.events.BrowserEvent=} opt_e Normalized browser event to initialize this event.
 * @constructor
 * @extends {goog.events.BrowserEvent}
 */
anychart.charts.Pie.BrowserEvent = function(target, opt_e) {
  goog.base(this);
  if (opt_e)
    this.copyFrom(opt_e, target);

  /**
   * Slice index.
   * @type {number}
   */
  this['sliceIndex'] = opt_e && opt_e.target && opt_e.target['__index'];
  if (isNaN(this['sliceIndex']))
    this['sliceIndex'] = -1;

  /**
   * Pie chart data iterator ready for the slice capturing.
   * @type {!anychart.data.Iterator}
   */
  this['iterator'] = target.data().getIterator();
  this['iterator'].select(this['sliceIndex']) || this['iterator'].reset();

  /**
   * Series.
   * @type {anychart.charts.Pie}
   */
  this['pie'] = target;
};
goog.inherits(anychart.charts.Pie.BrowserEvent, goog.events.BrowserEvent);


/**
 * An override of BrowserEvent.event_ field to allow compiler to treat it properly.
 * @private
 * @type {goog.events.BrowserEvent}
 */
anychart.charts.Pie.BrowserEvent.prototype.event_;


/**
 * Copies all info from a BrowserEvent to represent a new one, rearmed event, that can be redispatched.
 * @param {goog.events.BrowserEvent} e Normalized browser event to copy the event from.
 * @param {goog.events.EventTarget=} opt_target EventTarget to be set as a target of the event.
 */
anychart.charts.Pie.BrowserEvent.prototype.copyFrom = function(e, opt_target) {
  var type = e.type;
  switch (type) {
    case acgraph.events.EventType.MOUSEOUT:
      type = anychart.enums.EventType.POINT_MOUSE_OUT;
      break;
    case acgraph.events.EventType.MOUSEOVER:
      type = anychart.enums.EventType.POINT_MOUSE_OVER;
      break;
    case acgraph.events.EventType.CLICK:
      type = anychart.enums.EventType.POINT_CLICK;
      break;
    case acgraph.events.EventType.DBLCLICK:
      type = anychart.enums.EventType.POINT_DOUBLE_CLICK;
      break;
  }
  this.type = type;
  // TODO (Anton Saukh): this awful typecast must be removed when it is no longer needed.
  // In the BrowserEvent.init() method there is a TODO from Santos, asking to change typification
  // from Node to EventTarget, which would make more sense.
  /** @type {Node} */
  var target = /** @type {Node} */(/** @type {Object} */(opt_target));
  this.target = target || e.target;
  this.currentTarget = e.currentTarget || this.target;
  this.relatedTarget = e.relatedTarget || this.target;

  this.offsetX = e.offsetX;
  this.offsetY = e.offsetY;

  this.clientX = e.clientX;
  this.clientY = e.clientY;

  this.screenX = e.screenX;
  this.screenY = e.screenY;

  this.button = e.button;

  this.keyCode = e.keyCode;
  this.charCode = e.charCode;
  this.ctrlKey = e.ctrlKey;
  this.altKey = e.altKey;
  this.shiftKey = e.shiftKey;
  this.metaKey = e.metaKey;
  this.platformModifierKey = e.platformModifierKey;
  this.state = e.state;

  this.event_ = e;
  delete this.propagationStopped_;
};


//exports
anychart.charts.Pie.prototype['data'] = anychart.charts.Pie.prototype.data;//doc|ex|
anychart.charts.Pie.prototype['group'] = anychart.charts.Pie.prototype.group;//doc|ex|non-tr
anychart.charts.Pie.prototype['labels'] = anychart.charts.Pie.prototype.labels;//doc|ex
anychart.charts.Pie.prototype['hoverLabels'] = anychart.charts.Pie.prototype.hoverLabels;//doc|ex
anychart.charts.Pie.prototype['radius'] = anychart.charts.Pie.prototype.radius;//doc|ex
anychart.charts.Pie.prototype['innerRadius'] = anychart.charts.Pie.prototype.innerRadius;//doc|ex
anychart.charts.Pie.prototype['startAngle'] = anychart.charts.Pie.prototype.startAngle;//doc|ex
anychart.charts.Pie.prototype['explode'] = anychart.charts.Pie.prototype.explode;//doc/ex
anychart.charts.Pie.prototype['sort'] = anychart.charts.Pie.prototype.sort;//doc|ex
anychart.charts.Pie.prototype['getCenterPoint'] = anychart.charts.Pie.prototype.getCenterPoint;//doc|ex
anychart.charts.Pie.prototype['getPixelRadius'] = anychart.charts.Pie.prototype.getPixelRadius;//doc|need-ex
anychart.charts.Pie.prototype['getPixelInnerRadius'] = anychart.charts.Pie.prototype.getPixelInnerRadius;//doc|need-ex
anychart.charts.Pie.prototype['palette'] = anychart.charts.Pie.prototype.palette;//doc|ex
anychart.charts.Pie.prototype['fill'] = anychart.charts.Pie.prototype.fill;//doc|ex
anychart.charts.Pie.prototype['stroke'] = anychart.charts.Pie.prototype.stroke;//doc|ex
anychart.charts.Pie.prototype['hoverFill'] = anychart.charts.Pie.prototype.hoverFill;//doc|ex
anychart.charts.Pie.prototype['hoverStroke'] = anychart.charts.Pie.prototype.hoverStroke;//doc|ex
anychart.charts.Pie.prototype['hatchFill'] = anychart.charts.Pie.prototype.hatchFill;//doc|ex
anychart.charts.Pie.prototype['hoverHatchFill'] = anychart.charts.Pie.prototype.hoverHatchFill;//doc|ex
anychart.charts.Pie.prototype['explodeSlice'] = anychart.charts.Pie.prototype.explodeSlice;//doc|ex
anychart.charts.Pie.prototype['explodeSlices'] = anychart.charts.Pie.prototype.explodeSlices;
anychart.charts.Pie.prototype['tooltip'] = anychart.charts.Pie.prototype.tooltip;//doc|ex
anychart.charts.Pie.prototype['outsideLabelsSpace'] = anychart.charts.Pie.prototype.outsideLabelsSpace;//doc|ewx
anychart.charts.Pie.prototype['overlapMode'] = anychart.charts.Pie.prototype.overlapMode;
anychart.charts.Pie.prototype['insideLabelsOffset'] = anychart.charts.Pie.prototype.insideLabelsOffset;//doc|ewx
anychart.charts.Pie.prototype['connectorLength'] = anychart.charts.Pie.prototype.connectorLength;//doc|ex
anychart.charts.Pie.prototype['outsideLabelsCriticalAngle'] = anychart.charts.Pie.prototype.outsideLabelsCriticalAngle;//doc|ex
anychart.charts.Pie.prototype['connectorStroke'] = anychart.charts.Pie.prototype.connectorStroke;//doc|ex
anychart.charts.Pie.prototype['hatchFillPalette'] = anychart.charts.Pie.prototype.hatchFillPalette;
anychart.charts.Pie.prototype['getType'] = anychart.charts.Pie.prototype.getType;
