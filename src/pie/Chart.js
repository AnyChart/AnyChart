goog.provide('anychart.pie.Chart');
goog.require('anychart.Chart');
goog.require('anychart.color');
goog.require('anychart.elements.LabelsFactory');
goog.require('anychart.elements.Tooltip');
goog.require('anychart.math');
goog.require('anychart.utils.DistinctColorPalette');
goog.require('anychart.utils.RangeColorPalette');
goog.require('anychart.utils.Sort');
goog.require('anychart.utils.TypedLayer');



/**
 * Pie (Donut) Chart Class.<br/>
 * Pie is interactive, you can customize click and hover behavior.
 * @example
 *  var data = [20, 7, 10, 14];
 *  chart = new anychart.pie.Chart(data);
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
   * @type {(function(*):boolean)?}
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
   * @type {anychart.utils.Sort}
   * @private
   */
  this.sort_ = anychart.utils.Sort.NONE;

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
   * @type {!anychart.data.Iterator}
   */
  this.iterator_;

  var tooltip = /** @type {anychart.elements.Tooltip} */(this.tooltip());
  tooltip.suspendSignalsDispatching();
  tooltip.isFloating(true);
  tooltip.content().useHtml(true);
  tooltip.titleFormatter(function() {
    return this['name'];
  });
  tooltip.contentFormatter(function() {
    return this['name'] + '<br>' + this['value'];
  });
  tooltip.resumeSignalsDispatching(false);

  this.palette();
  this.labels()
      .fontColor('white')
      .fontSize(13);
  this.data(opt_data);
  this.legend().enabled(true);

  // Add handler to listen legend item click for legend and explode slice.
  this.legend().listen(anychart.events.EventType.LEGEND_ITEM_CLICK, function(event) {
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
 * Sets data for the current chart.
 * Learn more about mapping at {@link anychart.data.Mapping}.
 * @example <c>Set data using simple array</c>
 *  var data = [20, 7, 10, 14];
 *  chart = new anychart.pie.Chart(data);
 * @example <c>Set data using {@link anychart.data.Set}</c>
 *  var dataSet = new anychart.data.Set([
 *    {name: 'Point 1', value: 10},
 *    {name: 'Point 2', value: 7},
 *    {name: 'Point 3', value: 20},
 *    {name: 'Point 4', value: 14}
 *  ]);
 *  var chart = new anychart.pie.Chart(dataSet);
 * @example <c>Set data using {@link anychart.data.Mapping}</c>
 *  var dataSet = new anychart.data.Set([
 *    {name: 'Point 1', value: 10},
 *    {name: 'Point 2', value: 7},
 *    {name: 'Point 3', value: 20},
 *    {name: 'Point 4', value: 14}
 *  ]);
 *  var chart = new anychart.pie.Chart(dataSet.mapAs().sort('value'));
 * @example <c>Set data using a complex {@link anychart.data.Mapping}</c> <t>stageOnly</t>
 *  var dataSet = new anychart.data.Set([
 *    [1, 22, 13],
 *    [13, 22, 23],
 *    [17, 22, 33],
 *    [21, 22, 43]
 *  ]);
 *  new anychart.pie.Chart(dataSet.mapAs({'value': [1]}))
 *      .container(stage)
 *      .bounds(0,0,'50%', '100%')
 *      .draw();
 *  new anychart.pie.Chart(dataSet.mapAs({'value': [2]}))
 *      .container(stage)
 *      .bounds('50%',0,'50%', '100%')
 *      .draw();
 * @param {(anychart.data.View|anychart.data.Mapping|anychart.data.Set|Array)=} opt_value Data for the chart.
 * @return {anychart.pie.Chart} An instance of {@link anychart.pie.Chart} class for method chaining.
 *//**
 * Returns current chart data.
 * @return {anychart.data.View} Current view or self for method chaining.
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
 * @example <t>stageOnly</t>
 *  var data = [20, 7, 10, 14, 8, 14, 7, 12];
 *  new anychart.pie.Chart(data)
 *     .container(stage)
 *     .bounds(0,0,'33%', '100%')
 *     .draw();
 *  var chart2 = new anychart.pie.Chart(data)
 *     .container(stage)
 *     .bounds('33%',0,'33%', '100%')
 *     .palette(['#00F', '#00E', '#00D', '#00C', '#00B', '#00A', '#009', '#008'])
 *     .draw();
 *  chart2.labels();
 *  var chart3 = new anychart.pie.Chart(data)
 *     .container(stage)
 *     .bounds('66%',0,'33%', '100%')
 *     .palette(
 *          new anychart.utils.RangeColorPalette()
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
 * Getter for the pie slices fill in normal state.
 * @return {(acgraph.vector.Fill|function():acgraph.vector.Fill)} Current fill in the normal state.
 *//**
 * Setter for the pie slices fill in the normal state.
 * @example
 *  var data = [10, 1, 7, 10];
 *  chart = new anychart.pie.Chart(data);
 *  chart.fill( function() {
 *    var color = 50*(this.index + 1);
 *    return 'rgba('+color+','+color+','+color+','+(0.5+(this.index/10))+')';
 *  });
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
 * @param {(acgraph.vector.Fill|function():acgraph.vector.Fill)=} opt_value .
 * @return {(acgraph.vector.Fill|function():acgraph.vector.Fill|anychart.pie.Chart)} .
 */
anychart.pie.Chart.prototype.fill = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.fill_ = opt_value;
    this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    return this;
  } else {
    return this.fill_;
  }
};


/**
 * Getter for the pie slices stroke in the normal state.
 * @return {(acgraph.vector.Stroke|function():acgraph.vector.Stroke)} Current stroke in the normal state.
 *//**
 * Setter for the pie slices stroke in the normal state.
 * @example
 *  var data = [10, 1, 7, 10];
 *  chart = new anychart.pie.Chart(data);
 *  chart.stroke('#CC0088');
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
 * @param {(acgraph.vector.Stroke|function():acgraph.vector.Stroke)=} opt_value .
 * @return {(acgraph.vector.Stroke|function():acgraph.vector.Stroke|anychart.pie.Chart)} .
 */
anychart.pie.Chart.prototype.stroke = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.stroke_ = opt_value;
    this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    return this;
  } else {
    return this.stroke_;
  }
};


/**
 * Getter for the pie slices fill in the hover state.
 * @return {(acgraph.vector.Fill|function():acgraph.vector.Fill)} Current fill in the hover state.
 *//**
 * Setter for the pie slices fill in the hover state.
 * @example
 *  var data = [10, 1, 7, 10];
 *  chart = new anychart.pie.Chart(data);
 *  chart.hoverFill( function() {
 *    var color = 50*(this.index + 1);
 *    return 'rgba('+color+','+color+','+color+','+(0.5+(this.index/10))+')';
 *  });
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
 * @param {(acgraph.vector.Fill|function():acgraph.vector.Fill)=} opt_value .
 * @return {(acgraph.vector.Fill|function():acgraph.vector.Fill|anychart.pie.Chart)} .
 */
anychart.pie.Chart.prototype.hoverFill = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.hoverFill_ = opt_value;
    this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    return this;
  } else {
    return this.hoverFill_;
  }
};


/**
 * Getter for the pie slices stroke in the hover state.
 * @return {(acgraph.vector.Stroke|function():acgraph.vector.Stroke)} Current stroke in the hover state.
 *//**
 * Setter for the pie slices stroke in the hover state.
 * @example
 *  var data = [10, 1, 7, 10];
 *  chart = new anychart.pie.Chart(data);
 *  chart.hoverStroke('2 #CC0088');
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
 * @param {(acgraph.vector.Stroke|function():acgraph.vector.Stroke)=} opt_value .
 * @return {(acgraph.vector.Stroke|function():acgraph.vector.Stroke|anychart.pie.Chart)} .
 */
anychart.pie.Chart.prototype.hoverStroke = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.hoverStroke_ = opt_value;
    this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    return this;
  } else {
    return this.hoverStroke_;
  }
};


/**
 * Getter for the current pie labels.<br/>
 * It is used to access to the current (default too) settings of the labels.<br>
 * <b>Note:</b> Default labels will appear when this getter is called for the first time.
 * @example <c>Default labels sample</c><t>stageOnly</t>
 *  var data = [10, 7, 4];
 *  var chart1 = new anychart.pie.Chart(data)
 *     .container(stage)
 *     .bounds(0,0,'33%', '100%')
 *     .draw();
 *  chart1.labels(null);
 *  var chart2 = new anychart.pie.Chart(data)
 *     .container(stage)
 *     .bounds('33%',0,'33%', '100%')
 *     .draw();
 *  chart2.labels();
 *  var chart3 = new anychart.pie.Chart(data)
 *     .container(stage)
 *     .bounds('66%',0,'33%', '100%')
 *     .draw();
 *  chart3.labels()
 *     .fontSize(10)
 *     .fontColor('white');
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
 *  chart = new anychart.pie.Chart(data);
 *  var labels = new anychart.elements.LabelsFactory();
 *  labels.textFormatter(function(){
 *        var lblText = this['name'];
 *        lblText += ': ' + this['value'];
 *        return lblText;
 *      })
 *      .positionFormatter(function(){
 *        return this['value'];
 *      })
 *      .fontSize(10)
 *      .fontColor('white');
 *  chart.labels(labels);
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
    this.invalidate(anychart.ConsistencyState.LABELS, anychart.Signal.NEEDS_REDRAW);
    return this;
  }
  return this.labels_;
};


/**
 * Setter/getter for points grouping function.
 * If function is passed - sets it as a filter for grouping.
 * If 'none' string or null is passed - turns grouping off.
 * If nothing is passed - returns the last values set by grouping functionor null.
 * @param {(string|null|function(*):boolean)=} opt_value Filtering function or disabling value (null, 'none').
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
 * Setter for the outer pie radius.<br/>
 * Radius can be set as a number (considered as number of pixels),
 * or as a string, e.g.'42%' or '152px'.
 * @example <t>stageOnly</t>
 *  var data = [10, 7, 4];
 *  var chart1 = new anychart.pie.Chart(data)
 *     .container(stage)
 *     .bounds(0,0,'50%', '100%')
 *     .draw();
 *  var chart2 = new anychart.pie.Chart(data)
 *     .container(stage)
 *     .bounds('50%',0,'50%', '100%')
 *     .draw();
 *  chart2.radius('52%');
 * @param {(string|number)=} opt_value ['40%'] Value of the outer radius.
 * @return {anychart.pie.Chart} An instance of {@link anychart.pie.Chart} class for method chaining.
 *//**
 * Getter for the current pie outer radius.
 * @return {(string|number)} Outer radius.
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
 * Setter for the inner radius in case of a Donut chart.
 * @example <t>stageOnly</t>
 *  var data = [10, 7, 4, 5];
 *  var chart1 = new anychart.pie.Chart(data)
 *      .container(stage)
 *      .bounds(0,0,'50%', '100%')
 *      .draw();
 *  var chart2 = new anychart.pie.Chart(data)
 *      .container(stage)
 *      .bounds('50%',0,'50%', '100%')
 *      .draw();
 *  chart1.innerRadius('25%');
 *  chart2.innerRadius(function(outerRadius){
 *    return parseFloat(outerRadius)/2;
 *  });
 * @param {(string|number|function(number):number)=} opt_value [0] The value of the inner radius in pixels, percents or
 * function. In general the function should look like this:
 * <code>function(outerRadius){
 *   ...
 *   return NUMBER;
 * }.
 * </code>
 * @return {anychart.pie.Chart} An instance of {@link anychart.pie.Chart} class for method chaining.
 *//**
 * Getter for the inner radius in case of a Donut chart.
 * @return {(string|number|function(number):number)} Current inner radius of a pie/donut chart.
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
 * Setter for the angle from which the first slice is drawn clockwise.
 * @illustration
 * var data = [3.4, 0, 6.6, 6.6, 3.4];
 * chart = new anychart.pie.Chart(data);
 * chart.container(stage).draw();
 * chart.startAngle(0);
 * var center = chart.getCenterPoint();
 * layer.circle(center.x + chart.getPixelRadius(), center.y, 4).fill('red .5').stroke('red');
 * layer.text(center.x + chart.getPixelRadius()+7, center.y - 8, '0\u00B0');
 * layer.circle(center.x + Math.cos(Math.PI/3)*chart.getPixelRadius(), center.y - Math.sin(Math.PI/3)*chart.getPixelRadius(), 4).fill('red .5').stroke('red');
 * layer.text(center.x + Math.cos(Math.PI/3)*chart.getPixelRadius()+7, center.y - Math.sin(Math.PI/3)*chart.getPixelRadius() -10, '-60\u00B0');
 * layer.circle(center.x + Math.cos(Math.PI/3)*chart.getPixelRadius(), center.y + Math.sin(Math.PI/3)*chart.getPixelRadius(), 4).fill('red .5').stroke('red');
 * layer.text(center.x + Math.cos(Math.PI/3)*chart.getPixelRadius()+7, center.y + Math.sin(Math.PI/3)*chart.getPixelRadius() -6, '60\u00B0');
 * layer.circle(center.x - chart.getPixelRadius(), center.y, 4).fill('red .5').stroke('red');
 * layer.text(center.x - chart.getPixelRadius()-30, center.y -8, '180\u00B0');
 * @param {(string|number)=} opt_value [-90] Value of the start angle.
 * @return {anychart.pie.Chart} An instance of {@link anychart.pie.Chart} class for method chaining.
 *//**
 * Getter for the angle from which the first slice is drawn clockwise.
 * @return {(string|number)} Current start angle.
 *//**
 * @ignoreDoc
 * @param {(string|number)=} opt_value .
 * @return {(string|number|anychart.pie.Chart)} .
 */
anychart.pie.Chart.prototype.startAngle = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.startAngle_ = (+opt_value == 0) ? 0 : +opt_value || -90;
    this.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.LABELS, anychart.Signal.NEEDS_REDRAW);
    return this;
  } else {
    return this.startAngle_;
  }
};


/**
 * Sets the value of exploding in pixels.
 * @illustration
 * layer.parent(stage);
 *  var data = new anychart.data.Set([
 *       {name: 'Point 1', value: 10},
 *       {name: 'Point 2', value: 0},
 *       {name: 'Point 3', value: 20},
 *       {name: 'Point 4', value: 7, exploded: true},
 *       {name: 'Point 5', value: 14, exploded: true}
 *     ]);
 *  chart = new anychart.pie.Chart(data);
 *  chart.container(stage)
 *      .explode(25)
 *      .draw();
 *  var center = chart.getCenterPoint();
 *  layer.path()
 *      .moveTo(center.x, center.y)
 *      .lineTo(center.x+15, center.y+18)
 *      .stroke('1 red');
 *  layer.circle(center.x+15, center.y+18, 4).fill('red .5').stroke('red');
 *  layer.path()
 *      .moveTo(center.x, center.y)
 *      .lineTo(center.x+15, center.y-19)
 *      .stroke('1 red');
 *  layer.circle(center.x+15, center.y-19, 4).fill('red .5').stroke('red');
 *  layer = acgraph.layer();
 *  layer.circle(center.x, center.y, 4).fill('red .5').stroke('red');
 *  layer.path()
 *      .moveTo(center.x, center.y)
 *      .lineTo(center.x-20, center.y-17)
 *      .stroke('1 red');
 *  layer.circle(center.x-20, center.y-17, 4).fill('red .5').stroke('red');
 *  layer.text(center.x -25, center.y -10, '15');
 *  layer.path()
 *      .moveTo(center.x, center.y)
 *      .lineTo(center.x-20, center.y+14)
 *      .stroke('1 red');
 *  layer.circle(center.x-20, center.y+14, 4).fill('red .5').stroke('red');
 * @param {(string|number)=} opt_value [15] Value of the expansion/exploding.
 * @return {anychart.pie.Chart} An instance of {@link anychart.pie.Chart} class for method chaining.
 *//**
 * Getter for the value of pie slice exploding.
 * @return {(string|number)} Exploding value.
 *//**
 * @ignoreDoc
 * @param {(string|number)=} opt_value .
 * @return {(string|number|anychart.pie.Chart)} .
 */
anychart.pie.Chart.prototype.explode = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.explode_ = anychart.utils.normalizeNumberOrStringPercentValue(opt_value, 15);
    this.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.BOUNDS | anychart.ConsistencyState.LABELS, anychart.Signal.NEEDS_REDRAW);
    return this;
  } else {
    return this.explode_;
  }
};


/**
 * Explodes slice at index.
 * @param {number} index Pie slice index that should be exploded or not.
 * @param {boolean=} opt_explode Whether to explode.
 * @return {anychart.pie.Chart} .
 */
anychart.pie.Chart.prototype.explodeSlice = function(index, opt_explode) {
  var iterator = this.getIterator();
  if (iterator.select(index) && !this.isMissing_(iterator.get('value'))) {
    this.clickSlice(goog.isDef(opt_explode) ? opt_explode : true);
  }
  return this;
};


/**
 * Setter for the sort setting.<br/>
 * Ascending, Descending and No sorting is supported.
 * @example <t>stageOnly</t>
 *  var data = [3.4, 10, 6.6, 7, 3.4];
 *  new anychart.pie.Chart(data)
 *      .container(stage)
 *      .bounds(0,0,'50%', '100%')
 *      .draw();
 *  new anychart.pie.Chart(data)
 *      .container(stage)
 *      .bounds('50%',0,'50%', '100%')
 *      .sort(anychart.utils.Sort.DESC)
 *      .draw();
 * @param {(anychart.utils.Sort|string)=} opt_value [{@link anychart.utils.Sort}.NONE] Value of the sort setting.
 * @return {anychart.pie.Chart} An instance of {@link anychart.pie.Chart} class for method chaining.
 *//**
 * Getter for the current sort setting.
 * @return {anychart.utils.Sort} Sort setting.
 *//**
 * @ignoreDoc
 * @param {(anychart.utils.Sort|string)=} opt_value .
 * @return {(anychart.utils.Sort|anychart.pie.Chart)} .
 */
anychart.pie.Chart.prototype.sort = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.utils.normalizeSort(opt_value);
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

  this.radiusValue_ = anychart.utils.normalize(this.radius_, minWidthHeight);

  this.innerRadiusValue_ = goog.isFunction(this.innerRadius_) ?
      this.innerRadius_(this.radiusValue_) :
      anychart.utils.normalize(this.innerRadius_, this.radiusValue_);

  this.explodeValue_ = anychart.utils.normalize(this.explode_, minWidthHeight);

  this.cx_ = bounds.left + bounds.width / 2;
  this.cy_ = bounds.top + bounds.height / 2;
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
 * Gets final normalized fill or stroke color.
 * @param {acgraph.vector.Fill|acgraph.vector.Stroke|Function} color Normal state color.
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
      this.dataLayer_.parent(this.rootElement);
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

    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }


  if (this.hasInvalidationState(anychart.ConsistencyState.LABELS)) {
    if (this.labels_) {
      iterator.reset();

      if (!this.labels_.container()) this.labels_.container(this.rootElement);
      this.labels_.clear();
      while (iterator.advance()) {
        if (this.isMissing_(iterator.get('value'))) continue;
        var formatProvider = this.createFormatProvider();
        var positionProvider = this.createPositionProvider();
        // index for positionProvider function, cause label set it as an argument
        this.labels_.add(formatProvider, positionProvider, iterator.getIndex());
      }
      this.labels_.draw();
    }
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

  var exploded = !!iterator.meta('exploded');

  if (sweep == 0) return false;
  var slice;
  if (opt_update) {
    slice = /** @type {acgraph.vector.Path} */ (iterator.meta('slice'));
    slice.clear();
  } else {
    slice = this.dataLayer_.genNextChild();
    iterator.meta('slice', slice);
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
  this.colorizeSlice(false);

  acgraph.events.listen(slice, acgraph.events.EventType.MOUSEOVER, this.mouseOverHandler_, false, this);
  acgraph.events.listen(slice, acgraph.events.EventType.CLICK, this.mouseClickHandler_, false, this);
  acgraph.events.listen(slice, acgraph.events.EventType.DBLCLICK, this.mouseDblClickHandler_, false, this);

  return true;
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
    slice.stroke(this.getStrokeColor(true, hover));
    slice.fill(this.getFillColor(true, hover));
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
    this.showTooltip(opt_event);
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
    this.hideTooltip();
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
    iterator.meta('exploded', !!opt_explode);
  } else {
    var exploded = iterator.meta('exploded');
    iterator.meta('exploded', !exploded);
  }
  this.drawSlice_(true);
  var sliceLabel;
  if (sliceLabel = this.labels().getLabel(iterator.getIndex())) {
    sliceLabel.positionProvider(this.createPositionProvider()).draw();
  }
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
    data.push({
      'index': index,
      'text': iterator.get('name') || 'Point - ' + index,
      'iconType': anychart.elements.LegendItem.IconType.CIRCLE,
      'iconStroke': 'none',
      'iconFill': this.getFillColor(true, false),
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
 * Pie chart tooltip.
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
  formatProvider['name'] = iterator.get('name') ? iterator.get('name') : 'Point ' + iterator.getIndex();
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
 * Create column series format provider.
 * @return {Object} Object with info for labels formatting.
 * @protected
 */
anychart.pie.Chart.prototype.createPositionProvider = function() {
  var iterator = this.getIterator();
  var start = /** @type {number} */ (iterator.meta('start'));
  var sweep = /** @type {number} */ (iterator.meta('sweep'));
  var exploded = /** @type {boolean} */ (iterator.meta('exploded'));
  var angle = (start + sweep / 2) * Math.PI / 180;

  var dR = (this.radiusValue_ + this.innerRadiusValue_) / 2 + (exploded ? this.explodeValue_ : 0);

  var x = this.cx_ + dR * Math.cos(angle);
  var y = this.cy_ + dR * Math.sin(angle);
  return {'value': {'x': x, 'y': y}};
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

  if (data) chart['data'] = data.serialize();

  if (this.labels_) chart['labels'] = this.labels_.serialize();

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
  this.labels(labels);

  this.resumeSignalsDispatching(false);

  return this;
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
      type = anychart.events.EventType.POINT_MOUSE_OUT;
      break;
    case acgraph.events.EventType.MOUSEOVER:
      type = anychart.events.EventType.POINT_MOUSE_OVER;
      break;
    case acgraph.events.EventType.CLICK:
      type = anychart.events.EventType.POINT_CLICK;
      break;
    case acgraph.events.EventType.DBLCLICK:
      type = anychart.events.EventType.POINT_DOUBLE_CLICK;
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
 * Constructor function.
 * @param {(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Data for the chart.
 * @return {!anychart.pie.Chart}
 */
anychart.pie.chart = function(opt_data) {
  return new anychart.pie.Chart(opt_data);
};


//exports
goog.exportSymbol('anychart.pie.chart', anychart.pie.chart);
anychart.pie.Chart.prototype['data'] = anychart.pie.Chart.prototype.data;//in docs/final
anychart.pie.Chart.prototype['group'] = anychart.pie.Chart.prototype.group;
anychart.pie.Chart.prototype['labels'] = anychart.pie.Chart.prototype.labels;//in docs/final
anychart.pie.Chart.prototype['radius'] = anychart.pie.Chart.prototype.radius;//in docs/final
anychart.pie.Chart.prototype['innerRadius'] = anychart.pie.Chart.prototype.innerRadius;//in docs/final
anychart.pie.Chart.prototype['startAngle'] = anychart.pie.Chart.prototype.startAngle;//in docs/final
anychart.pie.Chart.prototype['explode'] = anychart.pie.Chart.prototype.explode;//in docs/final
anychart.pie.Chart.prototype['sort'] = anychart.pie.Chart.prototype.sort;//in docs/final
anychart.pie.Chart.prototype['getCenterPoint'] = anychart.pie.Chart.prototype.getCenterPoint;//in docs/final
anychart.pie.Chart.prototype['getPixelRadius'] = anychart.pie.Chart.prototype.getPixelRadius;//in docs/final
anychart.pie.Chart.prototype['getPixelInnerRadius'] = anychart.pie.Chart.prototype.getPixelInnerRadius;//in docs/final
anychart.pie.Chart.prototype['palette'] = anychart.pie.Chart.prototype.palette;//in docs/final
anychart.pie.Chart.prototype['fill'] = anychart.pie.Chart.prototype.fill;//in docs/final
anychart.pie.Chart.prototype['stroke'] = anychart.pie.Chart.prototype.stroke;//in docs/final
anychart.pie.Chart.prototype['hoverFill'] = anychart.pie.Chart.prototype.hoverFill;//in docs/final
anychart.pie.Chart.prototype['hoverStroke'] = anychart.pie.Chart.prototype.hoverStroke;//in docs/final
anychart.pie.Chart.prototype['serialize'] = anychart.pie.Chart.prototype.serialize;//in docs/
anychart.pie.Chart.prototype['explodeSlice'] = anychart.pie.Chart.prototype.explodeSlice;
anychart.pie.Chart.prototype['tooltip'] = anychart.pie.Chart.prototype.tooltip;
