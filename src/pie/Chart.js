goog.provide('anychart.pie.Chart');
goog.require('acgraph');
goog.require('anychart.Chart');
goog.require('anychart.color');
goog.require('anychart.elements.LabelsFactory');
goog.require('anychart.elements.Tooltip');
goog.require('anychart.enums');
goog.require('anychart.math');
goog.require('anychart.utils.DistinctColorPalette');
goog.require('anychart.utils.HatchFillPalette');
goog.require('anychart.utils.RangeColorPalette');
goog.require('anychart.utils.TypedLayer');



/**
 * Pie (Donut) Chart Class.<br/>
 * <b>Note:</b> Use these methods to get an instance of this class:
 *  <ul>
 *      <li>{@link anychart.pie.chart}</li>
 *      <li>{@link anychart.pieChart}</li>
 *  </ul>
 * @param {(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Data for the chart.
 * @extends {anychart.Chart}
 * @constructor
 */
anychart.pie.Chart = function(opt_data) {
  goog.base(this);
  this.suspendSignalsDispatching();

  /**
   * Filter function that should accept a field value and return true if the row
   *    should be included into the resulting view as and false otherwise.
   * @type {(null|function(*):boolean)}
   * @private
   */
  this.groupedPointFilter_ = null;

  /**
   * Start angle for the first slice of a pie chart.
   * @type {(string|number)}
   * @private
   */
  this.startAngle_ = -90;

  /**
   * Outer radius of the pie chart.
   * @type {(string|number)}
   * @private
   */
  this.radius_ = '40%';

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
   * @type {anychart.elements.LabelsFactory}
   * @private
   */
  this.labels_ = null;

  /**
   * Pie chart default palette.
   * @type {anychart.utils.DistinctColorPalette|anychart.utils.RangeColorPalette}
   * @private
   */
  this.palette_ = null;

  /**
   * @type {anychart.utils.HatchFillPalette}
   * @private
   */
  this.hatchFillPalette_ = null;

  /**
   * Pie chart default palette type.
   * Internal use only.
   * @private
   * @type {string}
   */
  this.paletteType_;

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
  this.statistic_ = {};

  /**
   * Default fill function.
   * @this {{index:number, sourceColor: acgraph.vector.Fill}}
   * @return {acgraph.vector.Fill} Fill for a pie slice.
   * @private
   */
  this.fill_ = function() {
    return /** @type {acgraph.vector.Fill} */ (this['sourceColor']);
  };

  /**
   * Default stroke function.
   * @this {{index:number, sourceColor: acgraph.vector.Stroke}}
   * @return {acgraph.vector.Stroke} Stroke for a pie slice.
   * @private
   */
  this.stroke_ = function() {
    return /** @type {acgraph.vector.Stroke} */ (anychart.color.darken(this['sourceColor'], .2));
  };

  /**
   * Default fill function for hover state.
   * * @this {{index:number, sourceColor: acgraph.vector.Fill}}
   * @return {acgraph.vector.Fill} Fill for a pie slice in hover state.
   * @private
   */
  this.hoverFill_ = function() {
    return /** @type {acgraph.vector.Fill} */ (anychart.color.lighten(this['sourceColor']));
  };

  /**
   * Default stroke function for hover state.
   * @this {{index:number, sourceColor: acgraph.vector.Stroke}}
   * @return {acgraph.vector.Stroke} Stroke for a pie slice in hover state.
   * @private
   */
  this.hoverStroke_ = function() {
    return /** @type {acgraph.vector.Stroke} */ (anychart.color.darken(this['sourceColor']));
  };

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

  var tooltip = /** @type {anychart.elements.Tooltip} */(this.tooltip());
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
      .fontColor('white')
      .fontSize(13)
      .padding(1);
  (/** @type {anychart.elements.LabelsFactory} */(this.hoverLabels())).enabled(null);
  this.data(opt_data);
  this.legend().enabled(true);

  this.outsideLabelsSpace('30%');
  this.connectorLength('20%');
  this.outsideLabelsCriticalAngle(60);
  this.connectorStroke('black 0.3');

  // Add handler to listen legend item click for legend and explode slice.
  this.legend().listen(anychart.enums.EventType.LEGEND_ITEM_CLICK, function(event) {
    // function that explodes pie slice by index of the clicked legend item

    var index = event['index'];
    var pieChart = /** @type {anychart.pie.Chart} */ (this);
    var iterator = pieChart.data().getIterator();
    if (iterator.select(index)) {
      var isExploded = !!iterator.meta('exploded');
      pieChart.explodeSlice(index, !isExploded);
    }
  }, false, this);

  this.invalidate(anychart.ConsistencyState.ALL);
  this.resumeSignalsDispatching(false);
};
goog.inherits(anychart.pie.Chart, anychart.Chart);


/**
 * @type {string}
 */
anychart.pie.Chart.CHART_TYPE = 'pie';
anychart.chartTypesMap[anychart.pie.Chart.CHART_TYPE] = anychart.pie.Chart;


/**
 * Series element z-index in series root layer.
 * @type {number}
 */
anychart.pie.Chart.ZINDEX_PIE = 30;


/**
 * Hatch fill z-index in series root layer.
 * @type {number}
 */
anychart.pie.Chart.ZINDEX_HATCH_FILL = 31;


/**
 * Label z-index in series root layer.
 * @type {number}
 */
anychart.pie.Chart.ZINDEX_LABEL = 32;


/**
 * @type {number}
 * @private
 */
anychart.pie.Chart.OUTSIDE_LABELS_MAX_WIDTH_ = 150;


/**
 * @type {number}
 * @private
 */
anychart.pie.Chart.OUTSIDE_LABELS_CONNECTOR_SIZE_ = 5;


/**
 * Supported signals.
 * @type {number}
 */
anychart.pie.Chart.prototype.SUPPORTED_SIGNALS =
    anychart.Chart.prototype.SUPPORTED_SIGNALS |
    anychart.Signal.DATA_CHANGED;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.pie.Chart.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.Chart.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.DATA |
    anychart.ConsistencyState.APPEARANCE |
    anychart.ConsistencyState.LABELS;


/**
 * Default hatch fill type.
 * @type {acgraph.vector.HatchFill.HatchFillType|string}
 */
anychart.pie.Chart.DEFAULT_HATCH_FILL_TYPE = 'none';


/**
 * Gets current chart data.
 * @return {anychart.data.View} Current data view.
 *//**
 * Sets data for the current chart.
 * Learn more about mapping at {@link anychart.data.Mapping}.
 * @example <c>Set data using simple array</c>
 *  var data = [20, 7, 10, 14];
 *  anychart.pieChart(data).container(stage).draw();
 * @example <c>Set data using {@link anychart.data.Set}</c>
 *  var dataSet = anychart.data.set([
 *    {name: 'Point 1', value: 10},
 *    {name: 'Point 2', value: 7},
 *    {name: 'Point 3', value: 20},
 *    {name: 'Point 4', value: 14}
 *  ]);
 *  anychart.pieChart(dataSet).container(stage).draw();
 * @example <c>Set data using {@link anychart.data.Mapping}</c>
 *  var dataSet = anychart.data.set([
 *    {name: 'Point 1', value: 10},
 *    {name: 'Point 2', value: 7},
 *    {name: 'Point 3', value: 20},
 *    {name: 'Point 4', value: 14}
 *  ]);
 *  anychart.pieChart(dataSet).container(stage).draw();
 * @example <c>Set data using a complex {@link anychart.data.Mapping}</c>
 *  var dataSet = anychart.data.set([
 *    [1, 22, 13],
 *    [13, 22, 23],
 *    [17, 22, 33],
 *    [21, 22, 43]
 *  ]);
 *  anychart.pieChart(dataSet.mapAs({'value': [1]}))
 *      .container(stage)
 *      .bounds(0,0,'50%', '100%')
 *      .draw();
 *  anychart.pieChart(dataSet.mapAs({'value': [2]}))
 *      .container(stage)
 *      .bounds('50%',0,'50%', '100%')
 *      .draw();
 * @param {(anychart.data.View|anychart.data.Mapping|anychart.data.Set|Array)=} opt_value Data for the chart.
 * @return {anychart.pie.Chart} An instance of {@link anychart.pie.Chart} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(anychart.data.View|anychart.data.Set|Array|string)=} opt_value .
 * @return {(anychart.data.View|anychart.pie.Chart)} .
 */
anychart.pie.Chart.prototype.data = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.parentView_ != opt_value) {
      goog.dispose(this.parentViewToDispose_);
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
        else if (goog.isArray(opt_value) || goog.isString(opt_value))
          parentView = (this.parentViewToDispose_ = new anychart.data.Set(opt_value)).mapAs();
        else
          parentView = (this.parentViewToDispose_ = new anychart.data.Set(null)).mapAs();
        this.registerDisposable(this.parentViewToDispose_);
      }
      this.parentView_ = parentView.derive();
    }

    goog.dispose(this.view_);
    this.view_ = this.prepareData_(this.parentView_);
    this.view_.listenSignals(this.dataInvalidated_, this);
    this.registerDisposable(this.view_);
    this.invalidate(anychart.ConsistencyState.DATA | anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.LABELS, anychart.Signal.NEEDS_REDRAW);
    return this;
  }
  return this.view_;
};


/**
 * Returns current view iterator.
 * @return {!anychart.data.Iterator} Current pie view iterator.
 */
anychart.pie.Chart.prototype.getIterator = function() {
  return this.iterator_ || (this.iterator_ = this.view_.getIterator());
};


/**
 * Method that prepares the final view of data.
 * @param {(anychart.data.View)} data Data.
 * @return {anychart.data.View} Ready to use view.
 * @private
 */
anychart.pie.Chart.prototype.prepareData_ = function(data) {
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
 * @return {(anychart.utils.RangeColorPalette|anychart.utils.DistinctColorPalette)} Color palette instance.
 *//**
 * Setter for a pie palette.
 * @example
 *  var data = [20, 7, 10, 14, 8, 14, 7, 12];
 *  anychart.pieChart(data)
 *     .labels(null)
 *     .legend(null)
 *     .container(stage)
 *     .bounds(0,0,'33%', '100%')
 *     .draw();
 *  anychart.pieChart(data)
 *     .labels(null)
 *     .legend(null)
 *     .container(stage)
 *     .bounds('33%',0,'33%', '100%')
 *     .palette(['#00F', '#00E', '#00D', '#00C', '#00B', '#00A', '#009', '#008'])
 *     .draw();
 *  anychart.pieChart(data)
 *     .labels(null)
 *     .legend(null)
 *     .container(stage)
 *     .bounds('66%',0,'33%', '100%')
 *     .palette(
 *          anychart.utils.rangeColorPalette()
 *              .colors(['red', 'yellow'])
 *              .count(data.length)
 *      )
 *     .draw();
 * @param {(anychart.utils.RangeColorPalette|anychart.utils.DistinctColorPalette|Array)=} opt_value Color palette instance.
 * @return {anychart.pie.Chart} An instance of {@link anychart.pie.Chart} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(anychart.utils.RangeColorPalette|anychart.utils.DistinctColorPalette|Array)=} opt_value .
 * @return {(anychart.utils.RangeColorPalette|anychart.utils.DistinctColorPalette|anychart.pie.Chart)} .
 */
anychart.pie.Chart.prototype.palette = function(opt_value) {
  if (!this.palette_) {
    this.palette_ = new anychart.utils.DistinctColorPalette();
    this.palette_.listenSignals(this.paletteInvalidated_, this);
    this.paletteType_ = 'distinct';
  }

  if (goog.isDef(opt_value)) {
    if (goog.isArray(opt_value)) {
      this.palette_.colors(opt_value);
    } else if (goog.isNull(opt_value)) {
      this.palette_.cloneFrom(opt_value);
    } else {
      if (!(opt_value instanceof anychart.utils.RangeColorPalette || opt_value instanceof anychart.utils.DistinctColorPalette)) {
        return this.palette_;
      }
      var isDistinct = !!(opt_value instanceof anychart.utils.DistinctColorPalette);

      if ((isDistinct && this.paletteType_ == 'distinct') || (!isDistinct && this.paletteType_ == 'range')) {
        this.palette_.cloneFrom(opt_value);
      } else {
        goog.dispose(this.palette_);
        var cls;
        if (isDistinct) {
          this.paletteType_ = 'distinct';
          cls = anychart.utils.DistinctColorPalette;
        } else {
          this.paletteType_ = 'range';
          cls = anychart.utils.RangeColorPalette;
        }

        this.palette_ = new cls();
        this.palette_.cloneFrom(opt_value);
        this.palette_.listenSignals(this.paletteInvalidated_, this);
        this.registerDisposable(this.palette_);
      }
    }
    this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    return this;
  }
  return this.palette_;
};


/**
 * Chart hatch fill palette settings.
 * @param {(Array.<acgraph.vector.HatchFill.HatchFillType>|Object|anychart.utils.HatchFillPalette)=} opt_value Chart
 * hatch fill palette settings to set.
 * @return {anychart.utils.HatchFillPalette|anychart.pie.Chart} Return current chart hatch fill palette or itself
 * for chaining call.
 */
anychart.pie.Chart.prototype.hatchFillPalette = function(opt_value) {
  if (!this.hatchFillPalette_) {
    this.hatchFillPalette_ = new anychart.utils.HatchFillPalette();
    this.hatchFillPalette_.listenSignals(this.paletteInvalidated_, this);
    this.registerDisposable(this.hatchFillPalette_);
  }

  if (goog.isDef(opt_value)) {
    if (opt_value instanceof anychart.utils.HatchFillPalette) {
      this.hatchFillPalette_.deserialize(opt_value.serialize());
    } else if (goog.isObject(opt_value)) {
      this.hatchFillPalette_.deserialize(opt_value);
    } else if (goog.isArray(opt_value)) {
      this.hatchFillPalette_.hatchFills(opt_value);
    }
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
 *  var chart = anychart.pieChart(data);
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
 * @return {!anychart.pie.Chart} An instance of {@link anychart.pie.Chart} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|Function|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.pie.Chart|Function} .
 */
anychart.pie.Chart.prototype.fill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var fill = goog.isFunction(opt_fillOrColorOrKeys) ?
        opt_fillOrColorOrKeys :
        acgraph.vector.normalizeFill.apply(null, arguments);
    if (fill != this.fill_) {
      this.fill_ = fill;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
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
 *  var chart = anychart.pie.chart(data);
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
 * @return {!anychart.pie.Chart} An instance of {@link anychart.pie.Chart} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line joint style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {anychart.pie.Chart|acgraph.vector.Stroke|Function} .
 */
anychart.pie.Chart.prototype.stroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var stroke = goog.isFunction(opt_strokeOrFill) ?
        opt_strokeOrFill :
        acgraph.vector.normalizeStroke.apply(null, arguments);
    if (stroke != this.stroke_) {
      this.stroke_ = stroke;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
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
 *  var chart = anychart.pie.chart(data);
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
 * @return {!anychart.pie.Chart} An instance of {@link anychart.pie.Chart} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|Function|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.pie.Chart|Function} .
 */
anychart.pie.Chart.prototype.hoverFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
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
 *  var chart = anychart.pieChart(data);
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
 * @return {!anychart.pie.Chart} An instance of {@link anychart.pie.Chart} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line joint style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {anychart.pie.Chart|acgraph.vector.Stroke|Function} .
 */
anychart.pie.Chart.prototype.hoverStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
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
 *  var chart = anychart.pieChart(data);
 *  chart.hatchFill('diagonalbrick');
 *  chart.container(stage).draw();
 * @param {(acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function|acgraph.vector.HatchFill.HatchFillType|
 * string|boolean)=} opt_patternFillOrType PatternFill or HatchFill instance or type of hatch fill.
 * @param {string=} opt_color Color.
 * @param {number=} opt_thickness Thickness.
 * @param {number=} opt_size Pattern size.
 * @return {!anychart.pie.Chart} {@link anychart.pie.Chart} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function|acgraph.vector.HatchFill.HatchFillType|
 * string|boolean)=} opt_patternFillOrTypeOrState PatternFill or HatchFill instance or type of hatch fill.
 * @param {string=} opt_color Color.
 * @param {number=} opt_thickness Thickness.
 * @param {number=} opt_size Pattern size.
 * @return {acgraph.vector.PatternFill|acgraph.vector.HatchFill|anychart.pie.Chart|Function|boolean} Hatch fill.
 */
anychart.pie.Chart.prototype.hatchFill = function(opt_patternFillOrTypeOrState, opt_color, opt_thickness, opt_size) {
  if (goog.isDef(opt_patternFillOrTypeOrState)) {
    var hatchFill = goog.isFunction(opt_patternFillOrTypeOrState) || goog.isBoolean(opt_patternFillOrTypeOrState) ?
        opt_patternFillOrTypeOrState :
        acgraph.vector.normalizeHatchFill.apply(null, arguments);

    if (hatchFill != this.hatchFill_) {
      this.hatchFill_ = hatchFill;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
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
 *  var chart = anychart.pieChart(data);
 *  chart.hoverHatchFill('diagonalbrick');
 *  chart.container(stage).draw();
 * @param {(acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function|acgraph.vector.HatchFill.HatchFillType|
 * string|boolean)=} opt_patternFillOrType PatternFill or HatchFill instance or type of hatch fill.
 * @param {string=} opt_color Color.
 * @param {number=} opt_thickness Thickness.
 * @param {number=} opt_size Pattern size.
 * @return {!anychart.pie.Chart} {@link anychart.pie.Chart} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function|acgraph.vector.HatchFill.HatchFillType|
 * string|boolean)=} opt_patternFillOrTypeOrState PatternFill or HatchFill instance or type of hatch fill.
 * @param {string=} opt_color Color.
 * @param {number=} opt_thickness Thickness.
 * @param {number=} opt_size Pattern size.
 * @return {acgraph.vector.PatternFill|acgraph.vector.HatchFill|anychart.pie.Chart|Function|boolean} Hatch fill.
 */
anychart.pie.Chart.prototype.hoverHatchFill = function(opt_patternFillOrTypeOrState, opt_color, opt_thickness, opt_size) {
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
 * Getter for the current pie labels.<br/>
 * It is used to access to the current (default too) settings of the labels.<br>
 * <b>Note:</b> Default labels will appear when this getter is called for the first time.
 * @return {anychart.elements.LabelsFactory} An instance of {@link anychart.elements.LabelsFactory} class for method chaining.
 *//**
 * Setter for the pie labels.<br/>
 * <b>Note:</b> positioing is done using {@link anychart.elements.LabelsFactory#positionFormatter} method
 * and text is formatted using {@link anychart.elements.LabelsFactory#textFormatter} method.
 * @example
 *  var data = [
 *    {name: 'Point 1', value: 10},
 *    {name: 'Point 2', value: 7},
 *    {name: 'Point 3', value: 20},
 *    {name: 'Point 4', value: 14}
 *  ];
 *  var chart = anychart.pieChart(data);
 *  var labels = anychart.elements.labelsFactory();
 *  labels
 *      .position('outside')
 *      .fontSize(10)
 *      .fontColor('red');
 *  chart.labels(labels);
 *  chart.container(stage).draw();
 * @param {anychart.elements.LabelsFactory=} opt_value [] LabelsFactory instance.
 * @return {anychart.pie.Chart} An instance of {@link anychart.pie.Chart} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {anychart.elements.LabelsFactory=} opt_value .
 * @return {(anychart.elements.LabelsFactory|anychart.pie.Chart)} .
 */
anychart.pie.Chart.prototype.labels = function(opt_value) {
  if (!this.labels_) {
    this.labels_ = new anychart.elements.LabelsFactory();
    this.labels_.zIndex(anychart.pie.Chart.ZINDEX_LABEL);
    this.labels_.textFormatter(function() {
      return (this['value'] * 100 / this['sum']).toFixed(1) + '%';
    });
    this.labels_.positionFormatter(function() {
      return this['value'];
    });

    this.labels_.listenSignals(this.labelsInvalidated_, this);
    this.registerDisposable(this.labels_);
    this.invalidate(anychart.ConsistencyState.LABELS, anychart.Signal.NEEDS_REDRAW);
  }

  if (goog.isDef(opt_value) && (opt_value instanceof anychart.elements.LabelsFactory || goog.isNull(opt_value))) {
    this.labels_.deserialize(opt_value ? opt_value.serialize() : {});
    if (this.labels_.zIndex() == 0) this.labels_.zIndex(anychart.pie.Chart.ZINDEX_LABEL);
    this.invalidate(anychart.ConsistencyState.LABELS, anychart.Signal.NEEDS_REDRAW);
    return this;
  }
  return this.labels_;
};


/**
 * Gets or sets series hover data labels.
 * @param {(anychart.elements.LabelsFactory|Object|string|null)=} opt_value pie hover data labels settings.
 * @return {!(anychart.elements.LabelsFactory|anychart.pie.Chart)} Labels instance or itself for chaining call.
 */
anychart.pie.Chart.prototype.hoverLabels = function(opt_value) {
  if (!this.hoverLabels_) {
    this.hoverLabels_ = new anychart.elements.LabelsFactory();
    this.hoverLabels_.zIndex(anychart.pie.Chart.ZINDEX_LABEL);
    this.registerDisposable(this.hoverLabels_);
  }

  if (goog.isDef(opt_value)) {
    if (opt_value instanceof anychart.elements.LabelsFactory) {
      this.hoverLabels_.deserialize(opt_value.serialize());
      if (this.hoverLabels_.zIndex() == 0) this.hoverLabels_.zIndex(anychart.pie.Chart.ZINDEX_LABEL);
    } else if (goog.isObject(opt_value)) {
      this.hoverLabels_.deserialize(opt_value);
      if (this.hoverLabels_.zIndex() == 0) this.hoverLabels_.zIndex(anychart.pie.Chart.ZINDEX_LABEL);
    } else if (anychart.utils.isNone(opt_value)) {
      this.hoverLabels_.enabled(false);
    }
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
 * var chart = anychart.pieChart([5, 2, 1, 3, 1, 3]);
 * chart.labels()
 *   .fontColor('black')
 *   .position('outside');
 * chart.outsideLabelsSpace('15%');
 * chart.container(stage).draw();
 * @param {(number|string)=} opt_value [30%] Value to set.
 * @return {anychart.pie.Chart} {@link anychart.pie.Chart} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(number|string)=} opt_value [30%] Value to set.
 * @return {!anychart.pie.Chart|number|string|null} Outside labels space or self for chaining call.
 */
anychart.pie.Chart.prototype.outsideLabelsSpace = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.outsideLabelsSpace_ != opt_value) {
      this.outsideLabelsSpace_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS | anychart.ConsistencyState.LABELS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.outsideLabelsSpace_;
};


/**
 * Getter for outside labels connector length.
 * @return {number|string|null} Outside labels connector length.
 *//**
 * Setter for outside labels connector length.<br/>
 * <b>Note: </b> Works only with outside labels mode.
 * @example
 * var chart = anychart.pieChart([5, 2, 1, 3, 1, 3]);
 * chart.labels()
 *   .fontColor('black')
 *   .position('outside');
 * chart.connectorLength(20);
 * chart.container(stage).draw();
 * @param {(number|string)=} opt_value [30%] Value to set.
 * @return {anychart.pie.Chart} {@link anychart.pie.Chart} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(number|string)=} opt_value [30%] Value to set.
 * @return {!anychart.pie.Chart|number|string|null} Outside labels margin or self for chaining call.
 */
anychart.pie.Chart.prototype.connectorLength = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.connectorLength_ != opt_value) {
      this.connectorLength_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS | anychart.ConsistencyState.LABELS,
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
 * var chart = anychart.pieChart([50, 2, 1, 3, 1, 3]);
 * chart.labels()
 *   .fontColor('black')
 *   .position('outside');
 * chart.outsideLabelsCriticalAngle(20);
 * chart.container(stage).draw();
 * @param {(number|string)=} opt_value [60] Value to set.
 * @return {anychart.pie.Chart} {@link anychart.pie.Chart} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(number|string)=} opt_value [60] Value to set.
 * @return {!anychart.pie.Chart|number|string|null} Outside labels critical angle or self for chaining call.
 */
anychart.pie.Chart.prototype.outsideLabelsCriticalAngle = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = goog.math.standardAngle(anychart.utils.normalizeSize(opt_value));
    if (this.outsideLabelsCriticalAngle_ != opt_value) {
      this.outsideLabelsCriticalAngle_ = opt_value;
      this.invalidate(anychart.ConsistencyState.LABELS, anychart.Signal.NEEDS_REDRAW);
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
 * var chart = anychart.pieChart([5, 2, 1, 3, 1, 3]);
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
 * @return {!anychart.pie.Chart} {@link anychart.pie.Chart} instance for method chaining.
 *//**
 * Setter for outside labels connectors stroke settings.<br/>
 * Learn more about stroke settings:
 * {@link http://docs.anychart.com/__VERSION__/General_settings/Elements_Stroke}<br/>
 * <b>Note: </b> Works only with outside labels mode.
 * @example
 * var chart = anychart.pieChart([5, 2, 1, 3, 1, 3]);
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
 * @return {!anychart.pie.Chart} {@link anychart.pie.Chart} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line joint style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {anychart.pie.Chart|acgraph.vector.Stroke|Function} .
 */
anychart.pie.Chart.prototype.connectorStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
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
 * anychart.pieChart([5, 2, 1, 3, 1, 3])
 *   .group(function(val){ return val > 2; })
 *   .container(stage).draw();
 * @param {(string|null|function(*):boolean)=} opt_value Filter function or disablt value (null, 'none').
 * @return {anychart.pie.Chart} {@link anychart.pie.Chart} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(string|null|function(*):boolean)=} opt_value Filter function or disablt value (null, 'none').
 * @return {(anychart.pie.Chart|function(*):boolean|null)} Current grouping function or self for method chaining.
 */
anychart.pie.Chart.prototype.group = function(opt_value) {
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
 *  anychart.pieChart(data)
 *     .container(stage)
 *     .radius(100)
 *     .bounds(0,0,'50%', '100%')
 *     .draw();
 *  anychart.pieChart(data)
 *     .container(stage)
 *     .radius('52%')
 *     .bounds('50%',0,'50%', '100%')
 *     .draw();
 * @param {(string|number)=} opt_value ['40%'] Value of the outer radius.
 * @return {anychart.pie.Chart} An instance of {@link anychart.pie.Chart} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(string|number)=} opt_value .
 * @return {(string|number|anychart.pie.Chart)} .
 */
anychart.pie.Chart.prototype.radius = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.radius_ = opt_value;
    this.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.LABELS, anychart.Signal.NEEDS_REDRAW);
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
 *  anychart.pieChart(data)
 *      .innerRadius('25%')
 *      .bounds(0,0,'50%', '100%')
 *      .container(stage)
 *      .draw();
 *  anychart.pieChart(data)
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
 * @return {anychart.pie.Chart} An instance of {@link anychart.pie.Chart} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(string|number|function(number):number)=} opt_value .
 * @return {(string|number|function(number):number|anychart.pie.Chart)} .
 */
anychart.pie.Chart.prototype.innerRadius = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.innerRadius_ = opt_value;
    this.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.LABELS, anychart.Signal.NEEDS_REDRAW);
    return this;
  } else {
    return this.innerRadius_;
  }
};


/**
 * Getter for the pie chart center point.<br/>
 * <b>Note:</b> Works only after {@link anychart.pie.Chart#draw} is called.
 * @example
 *  var pieInnerRadius = 40
 *  var pie = anychart.pieChart([10, 14, 8, 12])
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
 *  anychart.elements.label()
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
anychart.pie.Chart.prototype.getCenterPoint = function() {
  return {'x': this.cx_, 'y': this.cy_};
};


/**
 * Getter for the current pie pixel outer radius.<br/>
 * <b>Note:</b> Works only after {@link anychart.pie.Chart#draw} is called.
 * @return {number} Pixel value of the pie radius.
 */
anychart.pie.Chart.prototype.getPixelRadius = function() {
  return this.radiusValue_;
};


/**
 * Getter for the current pie pixel inner radius.<br/>
 * <b>Note:</b> Works only after {@link anychart.pie.Chart#draw} is called.
 * @return {number} XY coordinate of the pie center.
 */
anychart.pie.Chart.prototype.getPixelInnerRadius = function() {
  return this.innerRadiusValue_;
};


/**
 * Getter for the angle from which the first slice is drawn clockwise.
 * @return {(string|number)} Current start angle.
 *//**
 * Setter for the angle from which the first slice is drawn clockwise.
 * @illustration <t>stageOnly</t>
 * var data = [3.4, 0, 6.6, 6.6, 3.4];
 * chart = anychart.pieChart(data)
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
 * anychart.pieChart([3, 3, 5, 1])
 *   .startAngle(-40)
 *   .container(stage)
 *   .draw();
 * @param {(string|number)=} opt_value [-90] Value of the start angle.
 * @return {anychart.pie.Chart} An instance of {@link anychart.pie.Chart} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(string|number)=} opt_value .
 * @return {(string|number|anychart.pie.Chart)} .
 */
anychart.pie.Chart.prototype.startAngle = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.startAngle_ = (goog.isNull(opt_value) || isNaN(+opt_value)) ? -90 : goog.math.standardAngle(+opt_value);
    this.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.LABELS, anychart.Signal.NEEDS_REDRAW);
    return this;
  } else {
    return this.startAngle_;
  }
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
 *  chart = anychart.pieChart(data);
 *  chart.container(stage)
 *      .explode(15)
 *      .draw();
 * @param {(string|number)=} opt_value [15] Value of the expansion/exploding.
 * @return {anychart.pie.Chart} An instance of {@link anychart.pie.Chart} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(string|number)=} opt_value .
 * @return {(string|number|anychart.pie.Chart)} .
 */
anychart.pie.Chart.prototype.explode = function(opt_value) {
  if (goog.isDef(opt_value)) {
    // TODO(Anton Saukh): that's an inline of ex normalizeNumberOrStringPercentValue - we should do something about it.
    this.explode_ = isNaN(parseFloat(opt_value)) ? 15 : opt_value;
    this.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.BOUNDS | anychart.ConsistencyState.LABELS, anychart.Signal.NEEDS_REDRAW);
    return this;
  } else {
    return this.explode_;
  }
};


/**
 * Explodes slice at index.
 * @example
 * var chart = anychart.pieChart([10, 12, 14, 46]);
 * chart.explodeSlice(2);
 * chart.container(stage).draw();
 * @param {number} index Pie slice index that should be exploded or not.
 * @param {boolean=} opt_explode [true] Whether to explode.
 * @return {anychart.pie.Chart} .
 */
anychart.pie.Chart.prototype.explodeSlice = function(index, opt_explode) {
  var iterator = this.getIterator();
  if (iterator.select(index) && !this.isMissing_(iterator.get('value'))) {
    this.clickSlice(goog.isDef(opt_explode) ? !!opt_explode : true);
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
 *  anychart.pie.chart(data)
 *      .container(stage)
 *      .bounds(0,0,'50%', '100%')
 *      .draw();
 *  anychart.pie.chart(data)
 *      .container(stage)
 *      .bounds('50%',0,'50%', '100%')
 *      .sort(anychart.enums.Sort.DESC)
 *      .draw();
 * @param {(anychart.enums.Sort|string)=} opt_value [{@link anychart.enums.Sort}.NONE] Value of the sort setting.
 * @return {anychart.pie.Chart} An instance of {@link anychart.pie.Chart} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(anychart.enums.Sort|string)=} opt_value .
 * @return {(anychart.enums.Sort|anychart.pie.Chart)} .
 */
anychart.pie.Chart.prototype.sort = function(opt_value) {
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
anychart.pie.Chart.prototype.calculate_ = function(bounds) {
  var minWidthHeight = Math.min(bounds.width, bounds.height);

  this.outsideLabelsSpaceValue_ = this.isOutsideLabels_() ?
      anychart.utils.normalizeSize(this.outsideLabelsSpace_, minWidthHeight) : 0;
  this.radiusValue_ = anychart.utils.normalizeSize(this.radius_, minWidthHeight - this.outsideLabelsSpaceValue_);
  this.connectorLengthValue_ = anychart.utils.normalizeSize(this.connectorLength_, this.radiusValue_);

  //todo Don't remove it, it can be useful (blackart)
  //  this.recommendedLabelWidth_ = parseInt(
  //      (bounds.width
  //          - 2 * this.radiusValue_
  //          - 2 * this.connectorLengthValue_
  //          - 2 * anychart.pie.Chart.OUTSIDE_LABELS_CONNECTOR_SIZE_)
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
};


/**
 * Method that gets final fill color for the current point, with all fallbacks taken into account.
 * @return {!acgraph.vector.Fill} Final hover fill for the current slice.
 * @protected
 */
anychart.pie.Chart.prototype.getLegendItemIconColor = function() {
  var iterator = this.getIterator();

  return this.normalizeColor(/** @type {acgraph.vector.Fill|acgraph.vector.Stroke|Function} */(iterator.get('legendItemIconColor') ||
      iterator.get('fill') ||
      this.palette().colorAt(iterator.getIndex())));
};


/**
 * Method that gets final fill color for the current point, with all fallbacks taken into account.
 * @param {boolean} usePointSettings If point settings should count too (iterator questioning).
 * @param {boolean} hover If the fill should be a hover fill.
 * @return {!acgraph.vector.Fill} Final hover fill for the current slice.
 * @protected
 */
anychart.pie.Chart.prototype.getFillColor = function(usePointSettings, hover) {
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
anychart.pie.Chart.prototype.getStrokeColor = function(usePointSettings, hover) {
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
anychart.pie.Chart.prototype.getFinalHatchFill = function(usePointSettings, hover) {
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
anychart.pie.Chart.prototype.isRadialGradientMode_ = function(fillOrStroke) {
  return goog.isObject(fillOrStroke) && fillOrStroke.hasOwnProperty('mode') && fillOrStroke.hasOwnProperty('cx');
};


/**
 * Gets final normalized fill or stroke color.
 * @param {acgraph.vector.Fill|acgraph.vector.Stroke|Function|boolean} color Normal state color.
 * @param {...(acgraph.vector.Fill|acgraph.vector.Stroke|Function)} var_args .
 * @return {!(acgraph.vector.Fill|acgraph.vector.Stroke)} Normalized color.
 * @protected
 */
anychart.pie.Chart.prototype.normalizeColor = function(color, var_args) {
  var fill;
  var index = this.getIterator().getIndex();
  if (goog.isFunction(color)) {
    var sourceColor = arguments.length > 1 ?
        this.normalizeColor.apply(this, goog.array.slice(arguments, 1)) :
        this.palette().colorAt(index);
    var scope = {
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
anychart.pie.Chart.prototype.normalizeHatchFill = function(hatchFill) {
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
anychart.pie.Chart.prototype.remove = function() {
  if (this.dataLayer_) this.dataLayer_.parent(null);
};


/**
 * Drawing content.
 * @param {anychart.math.Rect} bounds Bounds of content area.
 */
anychart.pie.Chart.prototype.drawContent = function(bounds) {
  var iterator = this.getIterator();
  var exploded;
  var value;

  if (iterator.getRowsCount() >= 10) {
    if (window.console) {
      window.console.log('Warning: Too much points in Pie chart. See https://anychart.atlassian.net/wiki/pages/viewpage.action?pageId=17301506 for details.');
    }
  }

  if (this.palette_ && this.palette_ instanceof anychart.utils.RangeColorPalette) {
    this.palette_.count(iterator.getRowsCount());
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    this.calculate_(bounds);
    this.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.LABELS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.DATA)) {
    var missingPoints = 0; // count of missing points
    var min = Number.MAX_VALUE;
    var max = -Number.MAX_VALUE;
    var sum = 0;

    iterator.reset();
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
    this.statistic_['count'] = count;
    this.statistic_['min'] = min;
    this.statistic_['max'] = max;
    this.statistic_['sum'] = sum;
    this.statistic_['average'] = avg;

    this.markConsistent(anychart.ConsistencyState.DATA);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    if (this.dataLayer_) {
      this.dataLayer_.clear();
    } else {
      this.dataLayer_ = new anychart.utils.TypedLayer(function() {
        return acgraph.path();
      }, function(child) {
        (/** @type {acgraph.vector.Path} */ (child)).clear();
      });
      this.dataLayer_.zIndex(anychart.pie.Chart.ZINDEX_PIE);
      this.dataLayer_.parent(this.rootElement);
    }

    if (!this.hatchLayer_) {
      this.hatchLayer_ = new anychart.utils.TypedLayer(function() {
        return acgraph.path();
      }, function(child) {
        (/** @type {acgraph.vector.Path} */ (child)).clear();
      });
      this.hatchLayer_.parent(this.rootElement);
      this.hatchLayer_.zIndex(/** @type {number} */(anychart.pie.Chart.ZINDEX_HATCH_FILL)).disablePointerEvents(true);
    }

    var start = /** @type {number} */ (this.startAngle_);
    var sweep = 0;

    iterator.reset();
    while (iterator.advance()) {
      value = /** @type {number|string|null|undefined} */ (iterator.get('value'));
      if (this.isMissing_(value)) continue;
      value = +value;
      sweep = value / this.statistic_['sum'] * 360;

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


  if (this.hasInvalidationState(anychart.ConsistencyState.LABELS)) {
    if (!this.labels().container()) this.labels_.container(this.rootElement);
    this.labels().clear();

    if (this.isOutsideLabels_()) {
      this.calculateOutsideLabels();
    } else {
      iterator.reset();
      while (iterator.advance()) {
        if (this.isMissing_(iterator.get('value'))) continue;
        this.drawLabel_(false);
      }
    }
    this.labels().draw();
    this.labels().getDomElement().clip(bounds);
    this.markConsistent(anychart.ConsistencyState.LABELS);
  }
};


/**
 * Checks that value represents missing point.
 * @param {*} value
 * @return {boolean} Is value represents missing value.
 * @private
 */
anychart.pie.Chart.prototype.isMissing_ = function(value) {
  value = goog.isNull(value) ? NaN : +value;
  return !(goog.isNumber(value) && !isNaN(value) && (value > 0));
};


/**
 * Internal function for drawinga slice by arguments.
 * @param {boolean=} opt_update Whether to update current slice.
 * @return {boolean} True if point is drawn.
 * @private
 */
anychart.pie.Chart.prototype.drawSlice_ = function(opt_update) {
  var iterator = this.getIterator();

  var index = /** @type {number} */ (iterator.getIndex());
  var start = /** @type {number} */ (iterator.meta('start'));
  var sweep = /** @type {number} */ (iterator.meta('sweep'));
  // if no information about slice in meta (e.g. no slice has drawn: call explodeSlice(_, _) before chart.draw()).
  if (!goog.isDef(start) || !goog.isDef(sweep) || sweep == 0) return false;
  var exploded = !!iterator.meta('exploded');

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
 * @return {anychart.elements.LabelsFactory.Label} Label.
 */
anychart.pie.Chart.prototype.drawOutsideLabel_ = function(hovered, opt_updateConnector) {
  var iterator = this.getIterator();

  var sliceLabel = iterator.get('label');
  var hoverSliceLabel = hovered ? iterator.get('hoverLabel') : null;

  var index = iterator.getIndex();

  var labelsFactory = /** @type {anychart.elements.LabelsFactory} */(hovered ? this.hoverLabels() : this.labels());

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
  if (isDraw) {
    if (wasNoLabel = !label) {
      label = this.labels().add(this.createFormatProvider(), this.createPositionProvider(), index);
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
    label = this.labels().add(this.createFormatProvider(), this.createPositionProvider(), index);
    anchor = iterator.meta('anchor');
    if (goog.isDef(anchor))
      label.anchor(/** @type {string} */(anchor));
    label.enabled(false);
  }
  if (opt_updateConnector)
    this.updateConnector_(label, isDraw);
  return label;
};


/**
 * Draws label for a slice.
 * @private
 * @param {boolean} hovered If it is a hovered label drawing.
 * @param {boolean=} opt_updateConnector Whether to update connector or not. Used only with outside labels.
 * @return {anychart.elements.LabelsFactory.Label} Label.
 */
anychart.pie.Chart.prototype.drawLabel_ = function(hovered, opt_updateConnector) {
  if (this.isOutsideLabels_())
    return this.drawOutsideLabel_(hovered, opt_updateConnector);

  var iterator = this.getIterator();
  var sliceLabel = iterator.get('label');
  var hoverSliceLabel = hovered ? iterator.get('hoverLabel') : null;
  var index = iterator.getIndex();
  var labelsFactory = /** @type {anychart.elements.LabelsFactory} */(hovered ? this.hoverLabels() : this.labels());

  var label = this.labels().getLabel(index);

  var labelEnabledState = sliceLabel && goog.isDef(sliceLabel['enabled']) ? sliceLabel['enabled'] : null;

  var labelHoverEnabledState = hoverSliceLabel && goog.isDef(hoverSliceLabel['enabled']) ? hoverSliceLabel['enabled'] : null;
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

  if (isDraw) {
    var positionProvider = this.createPositionProvider();
    var formatProvider = this.createFormatProvider();
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
  } else if (label) {
    label.clear();
  }
  return label;
};


/**
 * Colorizes shape in accordance to current slice colorization settings.
 * Shape is get from current meta 'shape'.
 * @param {boolean} hover If the slice is hovered.
 * @protected
 */
anychart.pie.Chart.prototype.colorizeSlice = function(hover) {
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
anychart.pie.Chart.prototype.applyHatchFill = function(hover) {
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
anychart.pie.Chart.prototype.dataInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.DATA_CHANGED)) {
    this.invalidate(anychart.ConsistencyState.DATA | anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW | anychart.Signal.DATA_CHANGED);
  }
};


/**
 * Internal label invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.pie.Chart.prototype.labelsInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    this.invalidate(anychart.ConsistencyState.LABELS, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Internal palette invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.pie.Chart.prototype.paletteInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Slice hover status. NaN - not hovered, non-negative number - pie slice with this index hovered.
 * @type {number}
 * @protected
 */
anychart.pie.Chart.prototype.hoverStatus = NaN;


/**
 * Hovers pie slice by its index.
 * @param {number} index Index of the slice to hover.
 * @param {acgraph.events.Event=} opt_event Event that initiate Slice hovering.
 * @protected
 * @return {!anychart.pie.Chart} {@link anychart.pie.Chart} instance for method chaining.
 */
anychart.pie.Chart.prototype.hoverSlice = function(index, opt_event) {
  if (this.hoverStatus == index) return this;
  this.unhover();
  if (this.getIterator().reset().select(index)) {
    this.colorizeSlice(true);
    this.applyHatchFill(true);
    this.showTooltip(opt_event);
    this.drawLabel_(true, true);
  }
  this.hoverStatus = index;
  return this;
};


/**
 * Removes hover from the pie slice.
 * @return {!anychart.pie.Chart} {@link anychart.pie.Chart} instance for method chaining.
 */
anychart.pie.Chart.prototype.unhover = function() {
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
anychart.pie.Chart.prototype.clickSlice = function(opt_explode) {
  var iterator = this.getIterator();
  if (goog.isDef(opt_explode)) {
    iterator.meta('exploded', opt_explode);
  } else {
    var exploded = iterator.meta('exploded');
    iterator.meta('exploded', !exploded);
  }
  this.drawSlice_(true);
  var index = iterator.getIndex();
  if (this.isOutsideLabels_()) {
    this.labels().clear();
    this.calculateOutsideLabels();
    this.labels().draw();
    iterator.select(index);
  }
  this.drawLabel_(this.hoverStatus == index, this.hoverStatus == index);
};


/**
 * @private
 * @return {boolean} Define, is labels have outside position.
 */
anychart.pie.Chart.prototype.isOutsideLabels_ = function() {
  return anychart.enums.normalizeSidePosition(this.labels().position()) == anychart.enums.SidePosition.OUTSIDE;
};


/**
 * Mouse over internal handler.
 * @param {acgraph.events.Event} event Event object.
 * @private
 */
anychart.pie.Chart.prototype.mouseOverHandler_ = function(event) {
  if (this.dispatchEvent(new anychart.pie.Chart.BrowserEvent(this, event))) {
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
anychart.pie.Chart.prototype.mouseOutHandler_ = function(event) {
  if (this.dispatchEvent(new anychart.pie.Chart.BrowserEvent(this, event))) {
    this.unhover();
    acgraph.events.unlisten(event.target, acgraph.events.EventType.MOUSEOUT, this.mouseOutHandler_, false, this);
  }
};


/**
 * Mouse click internal handler.
 * @param {acgraph.events.Event} event Event object.
 * @private
 */
anychart.pie.Chart.prototype.mouseClickHandler_ = function(event) {
  if (this.dispatchEvent(new anychart.pie.Chart.BrowserEvent(this, event))) {
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
anychart.pie.Chart.prototype.mouseDblClickHandler_ = function(event) {
  this.dispatchEvent(new anychart.pie.Chart.BrowserEvent(this, event));
};


/** @inheritDoc */
anychart.pie.Chart.prototype.createLegendItemsProvider = function() {
  /**
   * @type {!Array.<anychart.elements.Legend.LegendItemProvider>}
   */
  var data = [];
  var iterator = this.getIterator().reset();


  while (iterator.advance()) {
    var index = iterator.getIndex();
    var x = iterator.get('x');

    data.push({
      'index': index,
      'text': String(goog.isDef(iterator.get('name')) ? iterator.get('name') : iterator.get('x')),
      'iconType': anychart.enums.LegendItemIconType.SQUARE,
      'iconStroke': 'none',
      'iconFill': this.getLegendItemIconColor(),
      'iconHatchFill': this.getFinalHatchFill(true, false),
      'iconMarker': null
    });
  }
  return data;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Tooltip.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter for tolltip settings.
 * @return {!anychart.elements.Tooltip} An instance of {@link anychart.elements.Tooltip} class for method chaining.
 *//**
 * Setter for tolltip settings.
 * @example
 * var chart = anychart.pieChart([10, 14, 8, 12]);
 * chart.tooltip()
 *     .titleFormatter(function(){
 *         return 'title [' + this.index + ']';
 *     })
 *     .title()
 *         .enabled(true);
 * chart.container(stage).draw();
 * @param {(null|string|Object|anychart.elements.Tooltip)=} opt_value Tooltip settings.
 * @return {anychart.pie.Chart} An instance of {@link anychart.pie.Chart} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(null|string|Object|anychart.elements.Tooltip)=} opt_value Tooltip settings.
 * @return {!(anychart.pie.Chart|anychart.elements.Tooltip)} Tooltip instance or self for method chaining.
 */
anychart.pie.Chart.prototype.tooltip = function(opt_value) {
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
anychart.pie.Chart.prototype.onTooltipSignal_ = function(event) {
  var tooltip = /** @type {anychart.elements.Tooltip} */(this.tooltip());
  tooltip.redraw();
};


/**
 * Show data point tooltip.
 * @protected
 * @param {goog.events.BrowserEvent=} opt_event Event that initiate tooltip to show.
 */
anychart.pie.Chart.prototype.showTooltip = function(opt_event) {
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
anychart.pie.Chart.prototype.hideTooltip = function() {
  var tooltip = /** @type {anychart.elements.Tooltip} */(this.tooltip());
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
anychart.pie.Chart.prototype.moveTooltip = function(opt_event) {
  var tooltip = /** @type {anychart.elements.Tooltip} */(this.tooltip());
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
 * Create pie label format provider.
 * @return {Object} Object with info for labels formatting.
 * @protected
 */
anychart.pie.Chart.prototype.createFormatProvider = function() {
  var iterator = this.getIterator();
  // no need to store this information always in this.statistic_
  var formatProvider = {};

  formatProvider['index'] = iterator.getIndex();
  formatProvider['name'] = String(goog.isDef(iterator.get('name')) ? iterator.get('name') : iterator.get('x'));
  formatProvider['x'] = iterator.get('x');
  formatProvider['value'] = iterator.get('value');
  if (iterator.meta('groupedPoint') == true) {
    formatProvider['name'] = 'Grouped Point';
    formatProvider['groupedPoint'] = true;
    formatProvider['names'] = iterator.meta('names');
    formatProvider['values'] = iterator.meta('values');
  }
  goog.object.extend(formatProvider, this.statistic_);
  return formatProvider;
};


/**
 *
 * @param {anychart.elements.LabelsFactory.Label} label .
 * @return {anychart.math.Rect}
 */
anychart.pie.Chart.prototype.getLabelBounds = function(label) {
  if (!this.labelsBoundsCache_) this.labelsBoundsCache_ = [];
  var index = label.getIndex();
  if (!this.labelsBoundsCache_[index])
    this.labelsBoundsCache_[index] = anychart.math.Rect.fromCoordinateBox(this.labels_.measureWithTransform(label));

  return this.labelsBoundsCache_[index];
};


/**
 * Drop label bounds cache.
 * @param {anychart.elements.LabelsFactory.Label} label Label to drop bounds.
 */
anychart.pie.Chart.prototype.dropLabelBoundsCache = function(label) {
  var index = label.getIndex();
  if (this.labelsBoundsCache_) {
    this.labelsBoundsCache_[index] = null;
  }
};


/**
 * Defragmentation domain. If domain have critical angle then need defragment domain.
 * @param {!anychart.pie.Chart.PieOutsideLabelsDomain} domain Domain to defragmentation.
 */
anychart.pie.Chart.prototype.domainDefragmentation = function(domain) {
  var labels = domain.labels;
  var sourcePieLabelsDomains = domain.pieLabelsDomains;
  var i, len, label, bounds;
  var prevDomain = sourcePieLabelsDomains[sourcePieLabelsDomains.length - 1];

  if (prevDomain == domain) return;

  var tmpDomain = null;
  var tmpLabels = labels.slice();
  var domainsLength = sourcePieLabelsDomains.length;

  for (i = 0, len = labels.length; i < len; i++) {
    label = labels[i];
    if (label) {
      bounds = this.getLabelBounds(label);

      if (!prevDomain || prevDomain.isNotIntersect(bounds.top, bounds.height)) {
        if (!tmpDomain || tmpDomain.isNotIntersect(bounds.top, bounds.height)) {
          if (tmpDomain) sourcePieLabelsDomains.push(tmpDomain);
          var isRightSide = label.anchor() == anychart.enums.Anchor.LEFT_CENTER;
          tmpDomain = new anychart.pie.Chart.PieOutsideLabelsDomain(isRightSide, this, sourcePieLabelsDomains);
          tmpDomain.addLabel(label);
        } else {
          tmpDomain.addLabel(label);
        }
      } else {
        tmpLabels.splice(i, 1);
        prevDomain.addLabel(label);
      }
    }
  }

  if (sourcePieLabelsDomains.length - domainsLength > 0) {
    domain.labels = tmpDomain.labels;
  } else {
    if (tmpDomain) {
      tmpDomain.clearDroppedLabels();
      if (tmpLabels.length != labels.length)
        domain.labels = tmpLabels;
    }
  }
};


/**
 * Calculating outside labels.
 */
anychart.pie.Chart.prototype.calculateOutsideLabels = function() {
  var iterator = this.getIterator();
  var label, x0, y0, x, y, dR, dR0, isRightSide;

  this.connectorAnchorCoords = [];
  var connector;

  var positionProvider;

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
    var exploded = /** @type {boolean} */ (iterator.meta('exploded'));
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
        anychart.pie.Chart.OUTSIDE_LABELS_CONNECTOR_SIZE_ :
        -anychart.pie.Chart.OUTSIDE_LABELS_CONNECTOR_SIZE_;
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

  var i, j, len, bounds;
  var leftDomains = [], domain = null;

  for (i = 0, len = leftSideLabels.length; i < len; i++) {
    label = leftSideLabels[i];
    if (label) {
      bounds = this.getLabelBounds(label);

      if (!domain || domain.isNotIntersect(bounds.top, bounds.height)) {
        if (domain) leftDomains.push(domain);
        isRightSide = label.anchor() == anychart.enums.Position.LEFT_CENTER;
        domain = new anychart.pie.Chart.PieOutsideLabelsDomain(isRightSide, this, leftDomains);
        domain.addLabel(label);
      } else {
        domain.addLabel(label);
      }
    }
  }
  leftDomains.push(domain);

  var droppedLabels, notIntersection, m, l;
  for (i = 0, len = leftDomains.length; i < len; i++) {
    domain = leftDomains[i];
    if (domain.droppedLabels) {
      if (!droppedLabels) droppedLabels = [];
      droppedLabels = goog.array.concat(droppedLabels, domain.droppedLabels);
    }
  }

  domain = null;
  var domainBounds;
  if (droppedLabels) {
    goog.array.sort(droppedLabels, function(a, b) {
      return a.getIndex() > b.getIndex() ? 1 : a.getIndex() < b.getIndex() ? -1 : 0});

    for (i = 0, len = droppedLabels.length; i < len; i++) {
      label = droppedLabels[i];
      if (label) {
        bounds = this.getLabelBounds(label);

        notIntersection = true;
        for (m = 0, l = leftDomains.length; m < l; m++) {
          notIntersection = notIntersection && leftDomains[m].isNotIntersect(bounds.top, bounds.height);
        }

        if (notIntersection) {
          if (!domain) {
            isRightSide = label.anchor() == anychart.enums.Position.LEFT_CENTER;
            domain = new anychart.pie.Chart.PieOutsideLabelsDomain(isRightSide, this, []);
          }
          domain.softAddLabel(label);
          domainBounds = domain.getBounds();

          notIntersection = true;
          for (m = 0; m < l; m++) {
            notIntersection = notIntersection && leftDomains[m].isNotIntersect(domainBounds.top, domainBounds.height);
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
  }

  //------------------------------------ right domain calculation ------------------------------------------------------

  var rightDomains = [];
  domain = null;
  for (i = rightSideLabels.length; i--;) {
    label = rightSideLabels[i];
    if (label) {
      bounds = this.getLabelBounds(label);

      if (!domain || domain.isNotIntersect(bounds.top, bounds.height)) {
        if (domain) rightDomains.push(domain);
        isRightSide = label.anchor() == anychart.enums.Position.LEFT_CENTER;
        domain = new anychart.pie.Chart.PieOutsideLabelsDomain(isRightSide, this, rightDomains);
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
    if (domain.droppedLabels) {
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
        bounds = this.getLabelBounds(label);

        notIntersection = true;
        for (m = 0, l = rightDomains.length; m < l; m++) {
          notIntersection = notIntersection && rightDomains[m].isNotIntersect(bounds.top, bounds.height);
        }

        if (notIntersection) {
          if (!domain) {
            isRightSide = label.anchor() == anychart.enums.Position.LEFT_CENTER;
            domain = new anychart.pie.Chart.PieOutsideLabelsDomain(isRightSide, this, []);
          }
          domain.softAddLabel(label);
          domainBounds = domain.getBounds();

          notIntersection = true;
          for (m = 0; m < l; m++) {
            notIntersection = notIntersection && rightDomains[m].isNotIntersect(domainBounds.top, domainBounds.height);
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

  //-----------init connector element------------------------------------------------------------------------
  if (this.connectorsLayer_) {
    this.connectorsLayer_.clear();
  } else {
    this.connectorsLayer_ = new anychart.utils.TypedLayer(function() {
      return acgraph.path();
    }, function(child) {
      (/** @type {acgraph.vector.Path} */ (child)).clear();
    });
    this.connectorsLayer_.parent(this.rootElement);
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

  //-----------right domains connectors calculation, applying labels positions--------------------------------

  for (i = 0, len = rightDomains.length; i < len; i++) {
    domain = rightDomains[i];
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
};


/**
 * Draws connector line for label.
 * @param {anychart.elements.LabelsFactory.Label} label Label.
 * @param {acgraph.vector.Path} path Connector path element.
 */
anychart.pie.Chart.prototype.drawConnectorLine = function(label, path) {
  var iterator = this.data().getIterator();
  var index = label.getIndex();
  if (iterator.select(index)) {
    var x0 = this.connectorAnchorCoords[index * 2];
    var y0 = this.connectorAnchorCoords[index * 2 + 1];

    var connector = /** @type {number} */(iterator.meta('connector'));
    var positionProvider = label.positionProvider()['value'];

    var x = positionProvider['x'] - connector;
    var y = positionProvider['y'];

    path.clear().moveTo(x0, y0).lineTo(x, y).lineTo(x + connector, y);
  }
};


/**
 * Show or hide connector for label.
 * @param {anychart.elements.LabelsFactory.Label} label Label.
 * @param {boolean} show Whether to show connector ot not for label.
 * @private
 */
anychart.pie.Chart.prototype.updateConnector_ = function(label, show) {
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
anychart.pie.Chart.prototype.createPositionProvider = function() {
  var outside = this.isOutsideLabels_();
  var iterator = this.getIterator();
  var start = /** @type {number} */ (iterator.meta('start'));
  var sweep = /** @type {number} */ (iterator.meta('sweep'));
  var exploded = /** @type {boolean} */ (iterator.meta('exploded'));
  var angle = (start + sweep / 2) * Math.PI / 180;
  var dR;
  if (outside)
    dR = (this.radiusValue_ + this.connectorLengthValue_) + (exploded ? this.explodeValue_ : 0);
  else
    dR = (this.radiusValue_ + this.innerRadiusValue_) / 2 + (exploded ? this.explodeValue_ : 0);
  var connector = /** @type {number} */ (iterator.meta('connector'));

  var x = this.cx_ + dR * Math.cos(angle);
  var y = this.cy_ + dR * Math.sin(angle);
  return {'value': {'x': x + (outside ? goog.isDef(connector) ? connector : 0 : 0), 'y': y}};
};


/**
 * @inheritDoc
 */
anychart.pie.Chart.prototype.serialize = function() {
  var json = {};

  var chart = goog.base(this, 'serialize');
  chart['type'] = anychart.pie.Chart.CHART_TYPE;

  var fill = this.fill();
  var stroke = this.stroke();
  var hoverFill = this.hoverFill();
  var hoverStroke = this.hoverStroke();
  var data = this.data();

  chart['radius'] = this.radius();
  chart['innerRadius'] = this.innerRadius();
  chart['explode'] = this.explode();
  chart['startAngle'] = this.startAngle();
  chart['sort'] = this.sort();

  if (!goog.isFunction(fill)) chart['fill'] = fill;
  if (!goog.isFunction(stroke)) chart['stroke'] = stroke;
  if (!goog.isFunction(hoverFill)) chart['hoverFill'] = hoverFill;
  if (!goog.isFunction(hoverStroke)) chart['hoverStroke'] = hoverStroke;

  if (goog.isFunction(this.hatchFill())) {
    if (window.console) {
      window.console.log('Warning: We can not serialize hatchFill function, please reset it manually.');
    }
  } else {
    json['hatchFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.hatchFill()));
  }

  if (goog.isFunction(this.hoverHatchFill())) {
    if (window.console) {
      window.console.log('Warning: We can not serialize hoverHatchFill function, please reset it manually.');
    }
  } else {
    json['hoverHatchFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.hoverHatchFill()));
  }

  if (data) chart['data'] = data.serialize();

  chart['labels'] = this.labels().serialize();
  chart['hoverLabels'] = this.hoverLabels().serialize();

  json['chart'] = chart;
  return json;
};


/** @inheritDoc */
anychart.pie.Chart.prototype.deserialize = function(config) {
  var chart = config['chart'];

  var data = chart['data'];
  var radius = chart['radius'];
  var innerRadius = chart['innerRadius'];
  var explode = chart['explode'];
  var startAngle = chart['startAngle'];
  var sort = chart['sort'];
  var fill = chart['fill'];
  var stroke = chart['stroke'];
  var hoverFill = chart['hoverFill'];
  var hoverStroke = chart['hoverStroke'];
  var labels = chart['labels'];

  this.suspendSignalsDispatching();

  goog.base(this, 'deserialize', chart);

  this.data(data);
  this.radius(radius);
  this.innerRadius(innerRadius);
  this.explode(explode);
  this.startAngle(startAngle);
  this.sort(sort);
  this.fill(fill);
  this.stroke(stroke);
  this.hoverFill(hoverFill);
  this.hoverStroke(hoverStroke);
  this.hatchFill(config['hatchFill']);
  this.hoverHatchFill(config['hoverHatchFill']);
  this.labels(labels);
  this.hoverLabels(config['hoverLabels']);

  this.resumeSignalsDispatching(false);

  return this;
};



/**
 * Labels Domain.
 * @param {boolean} isRight .
 * @param {!anychart.pie.Chart} pie .
 * @param {Array.<anychart.pie.Chart.PieOutsideLabelsDomain>} domains .
 * @constructor
 */
anychart.pie.Chart.PieOutsideLabelsDomain = function(isRight, pie, domains) {
  /**
   *
   * @type {Array.<anychart.pie.Chart.PieOutsideLabelsDomain>}
   */
  this.pieLabelsDomains = domains;

  /**
   * Link to pie.
   * @type {!anychart.pie.Chart}
   */
  this.pie = pie;

  /**
   * Domain labels.
   * @type {Array.<anychart.elements.LabelsFactory.Label>}
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
 * @type {Array.<anychart.elements.LabelsFactory.Label>}
 */
anychart.pie.Chart.PieOutsideLabelsDomain.prototype.droppedLabels;


/**
 * Adding label to domain with checks critical angles and intersection with other domains.
 * @param {anychart.elements.LabelsFactory.Label} label Adding label.
 */
anychart.pie.Chart.PieOutsideLabelsDomain.prototype.addLabel = function(label) {
  if (label) {
    this.labels.push(label);
    this.calculate();
  }
};


/**
 * Adding label to domain without any checks.
 * @param {anychart.elements.LabelsFactory.Label} label Adding label.
 */
anychart.pie.Chart.PieOutsideLabelsDomain.prototype.softAddLabel = function(label) {
  if (label) {
    this.labels.push(label);
    this.calcDomain();
  }
};


/**
 * Clearing dropped labels array.
 */
anychart.pie.Chart.PieOutsideLabelsDomain.prototype.clearDroppedLabels = function() {
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
 * @param {anychart.elements.LabelsFactory.Label} label
 * @param {number} index Label index in domain labels array.
 */
anychart.pie.Chart.PieOutsideLabelsDomain.prototype.dropLabel = function(label, index) {
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
anychart.pie.Chart.PieOutsideLabelsDomain.prototype.getBounds = function() {
  if (!this.boundsCache) {
    var firstLabelHeight = this.labels[0] ? this.pie.getLabelBounds(this.labels[0]).height : 0;
    var domainY = this.y + firstLabelHeight / 2;
    this.boundsCache = new acgraph.math.Rect(this.x, domainY, this.width, this.height);
  } else {

  }

  return this.boundsCache;
};


/**
 * Drop bounds cache.
 */
anychart.pie.Chart.PieOutsideLabelsDomain.prototype.dropBoundsCache = function() {
  this.boundsCache = null;
};


/**
 * Check intersections this domain with other domain by y coordinate and height value.
 * @param {number} y Y Coordinate left top position.
 * @param {number} height Height value.
 * @return {boolean} is not intersect with entry with incoming params.
 */
anychart.pie.Chart.PieOutsideLabelsDomain.prototype.isNotIntersect = function(y, height) {
  var bounds = this.getBounds();
  return y + height < bounds.top || y > bounds.top + bounds.height;
};


/**
 * Applying positions to labels.
 */
anychart.pie.Chart.PieOutsideLabelsDomain.prototype.applyPositions = function() {
  for (var j = 0, len = this.labels.length; j < len; j++) {
    var label = this.labels[j];

    var x = this.labelsPositions[j * 2];
    var y = this.labelsPositions[j * 2 + 1];

    var positionProviderValue = label.positionProvider()['value'];
    positionProviderValue['x'] = x;
    positionProviderValue['y'] = y;

    this.pie.dropLabelBoundsCache(label);
  }
};


/**
 * Calculating domain parameters: bounds, labels positions, critical angle.
 */
anychart.pie.Chart.PieOutsideLabelsDomain.prototype.calcDomain = function() {
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

    angle = (start + sweep / 2) * Math.PI / 180;
    angleDeg = goog.math.standardAngle(goog.math.toDegrees(angle));

    connector = this.isRightSide ?
        anychart.pie.Chart.OUTSIDE_LABELS_CONNECTOR_SIZE_ :
        -anychart.pie.Chart.OUTSIDE_LABELS_CONNECTOR_SIZE_;

    dRPie = this.pie.radiusValue_ + (exploded ? this.pie.explodeValue_ : 0);
    dR = (this.pie.getPixelRadius() + this.pie.connectorLengthValue_) + (exploded ? this.pie.explodeValue_ : 0);

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

    this.labelsPositions.push(labelXCoord, y);

    startLabelsDrawingYPos -= labelBounds.height / 2 + nextLabelHeight / 2;
  }

  this.width -= this.x;
};


/**
 * Calculating domain with checks critical angles and intersection with other domains.
 */
anychart.pie.Chart.PieOutsideLabelsDomain.prototype.calculate = function() {
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
    if (boundsPrevDomain && !this.isNotIntersect(boundsPrevDomain.top, boundsPrevDomain.height)) {
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
 * @param {anychart.pie.Chart} target EventTarget to be set as a target of the event.
 * @param {goog.events.BrowserEvent=} opt_e Normalized browser event to initialize this event.
 * @constructor
 * @extends {goog.events.BrowserEvent}
 */
anychart.pie.Chart.BrowserEvent = function(target, opt_e) {
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
   * @type {anychart.pie.Chart}
   */
  this['pie'] = target;
};
goog.inherits(anychart.pie.Chart.BrowserEvent, goog.events.BrowserEvent);


/**
 * An override of BrowserEvent.event_ field to allow compiler to treat it properly.
 * @private
 * @type {goog.events.BrowserEvent}
 */
anychart.pie.Chart.BrowserEvent.prototype.event_;


/**
 * Copies all info from a BrowserEvent to represent a new one, rearmed event, that can be redispatched.
 * @param {goog.events.BrowserEvent} e Normalized browser event to copy the event from.
 * @param {goog.events.EventTarget=} opt_target EventTarget to be set as a target of the event.
 */
anychart.pie.Chart.BrowserEvent.prototype.copyFrom = function(e, opt_target) {
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


/**
 * Returns Pie (donut) instance with initial settings.<br/>
 * <b>Note:</b> To get chart initial state use {@link anychart.pieChart}.
 * @example
 * chart = anychart.pie.chart([20, 7, 10, 14]);
 * @param {(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Data for the chart.
 * @return {!anychart.pie.Chart} {@link anychart.pie.Chart} instance for method chaining.
 */
anychart.pie.chart = function(opt_data) {
  return new anychart.pie.Chart(opt_data);
};


//exports
goog.exportSymbol('anychart.pie.chart', anychart.pie.chart);//doc|ex|non-tr
anychart.pie.Chart.prototype['data'] = anychart.pie.Chart.prototype.data;//doc|ex|
anychart.pie.Chart.prototype['group'] = anychart.pie.Chart.prototype.group;//doc|ex|non-tr
anychart.pie.Chart.prototype['labels'] = anychart.pie.Chart.prototype.labels;//doc|ex
anychart.pie.Chart.prototype['hoverLabels'] = anychart.pie.Chart.prototype.hoverLabels;
anychart.pie.Chart.prototype['radius'] = anychart.pie.Chart.prototype.radius;//doc|ex
anychart.pie.Chart.prototype['innerRadius'] = anychart.pie.Chart.prototype.innerRadius;//doc|ex
anychart.pie.Chart.prototype['startAngle'] = anychart.pie.Chart.prototype.startAngle;//doc|ex
anychart.pie.Chart.prototype['explode'] = anychart.pie.Chart.prototype.explode;//doc/ex
anychart.pie.Chart.prototype['sort'] = anychart.pie.Chart.prototype.sort;//doc|ex
anychart.pie.Chart.prototype['getCenterPoint'] = anychart.pie.Chart.prototype.getCenterPoint;//doc|ex
anychart.pie.Chart.prototype['getPixelRadius'] = anychart.pie.Chart.prototype.getPixelRadius;//doc|need-ex
anychart.pie.Chart.prototype['getPixelInnerRadius'] = anychart.pie.Chart.prototype.getPixelInnerRadius;//doc|need-ex
anychart.pie.Chart.prototype['palette'] = anychart.pie.Chart.prototype.palette;//doc|ex
anychart.pie.Chart.prototype['fill'] = anychart.pie.Chart.prototype.fill;//doc|ex
anychart.pie.Chart.prototype['stroke'] = anychart.pie.Chart.prototype.stroke;//doc|ex
anychart.pie.Chart.prototype['hoverFill'] = anychart.pie.Chart.prototype.hoverFill;//doc|ex
anychart.pie.Chart.prototype['hoverStroke'] = anychart.pie.Chart.prototype.hoverStroke;//doc|ex
anychart.pie.Chart.prototype['hatchFill'] = anychart.pie.Chart.prototype.hatchFill;
anychart.pie.Chart.prototype['hoverHatchFill'] = anychart.pie.Chart.prototype.hoverHatchFill;//doc|ex
anychart.pie.Chart.prototype['explodeSlice'] = anychart.pie.Chart.prototype.explodeSlice;//doc|ex
anychart.pie.Chart.prototype['tooltip'] = anychart.pie.Chart.prototype.tooltip;//doc|ex
anychart.pie.Chart.prototype['outsideLabelsSpace'] = anychart.pie.Chart.prototype.outsideLabelsSpace;//doc|ex
anychart.pie.Chart.prototype['connectorLength'] = anychart.pie.Chart.prototype.connectorLength;//doc|ex
anychart.pie.Chart.prototype['outsideLabelsCriticalAngle'] = anychart.pie.Chart.prototype.outsideLabelsCriticalAngle;//doc|ex
anychart.pie.Chart.prototype['connectorStroke'] = anychart.pie.Chart.prototype.connectorStroke;//doc|ex
