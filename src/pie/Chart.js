goog.provide('anychart.pie.Chart');
goog.require('anychart.Chart');
goog.require('anychart.color');
goog.require('anychart.math');
goog.require('anychart.utils.Sort');



/**
 * Pie (Donut) Chart Class.<br/>
 * Learn more about this type of charts at:
 * {@link http://demos.anychart.dev/articles/Pie-Donut.html}.<br/>
 * Pie is interactive, you can customize click and hover behavior.
 * @example
 *  var data = [20, 7, 10, 14];
 *  chart = new anychart.pie.Chart(data);
 * @param {(anychart.data.View|anychart.data.Mapping|anychart.data.Set|Array)=} opt_data Data for the chart.
 * @extends {anychart.Chart}
 * @constructor
 */
anychart.pie.Chart = function(opt_data) {
  goog.base(this);
  this.suspendInvalidationDispatching();

  /**
   * Type of the other point.
   * @type {anychart.pie.Chart.OtherPointType}
   * @private
   */
  this.otherPointType_ = anychart.pie.Chart.OtherPointType.NONE;

  /**
   * Filter function that should accept a field value and return true if the row
   *    should be included into the resulting view as a and false otherwise.
   * @param {*} val Value supposed to be filtered.
   * @return {boolean} Filtering result.
   * @private
   */
  this.otherPointFilter_ = function(val) {
    return (/** @type {number} */ (val)) > 3;
  };

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
   * Other point included into sort.
   * @type {anychart.utils.Sort}
   * @private
   */
  this.sort_ = anychart.utils.Sort.NONE;

  /**
   * Pie labels.
   * @type {anychart.elements.Multilabel}
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
   * Position provider for the labels position formatter.
   * @type {function(number):Object}
   * @private
   */
  this.positionProvider_ = goog.bind(function(index) {
    var iterator = this.data().getIterator();
    iterator.select(index);
    var start = /** @type {number} */ (iterator.meta('start'));
    var sweep = /** @type {number} */ (iterator.meta('sweep'));
    var exploded = /** @type {boolean} */ (iterator.meta('exploded'));
    var angle = (start + sweep / 2) * Math.PI / 180;

    var dR = (this.radiusValue_ + this.innerRadiusValue_) / 2 + (exploded ? this.explodeValue_ : 0);

    var x = this.cx_ + dR * Math.cos(angle);
    var y = this.cy_ + dR * Math.sin(angle);

    return {'x': x, 'y': y};
  }, this);


  /**
   * Format provider for the the labels text formatter.
   * @type {function(number, String):Object}
   * @private
   */
  this.formatProvider_ = goog.bind(function(index, fieldName) {
    return this.get(index, fieldName);
  }, {
    'get': goog.bind(function(index, fieldName) {
      var iterator = this.data().getIterator();
      iterator.select(index);
      return iterator.get(fieldName);
    }, this)
  }
  );

  /**
   * Flag identifies that information is not fully gathered to calculate/recalculate data.
   * Used in setOtherPoint to prevent call of data set method twice.
   * @see #setOtherPoint
   * @type {boolean}
   * @private
   */
  this.preparingData_ = false;

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

  this.palette();
  this.labels()
      .fontColor('white')
      .fontSize(13);
  this.data(opt_data);
  this.invalidate(anychart.utils.ConsistencyState.PIE_APPEARANCE);
  this.resumeInvalidationDispatching(false);
};
goog.inherits(anychart.pie.Chart, anychart.Chart);


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.pie.Chart.prototype.DISPATCHED_CONSISTENCY_STATES =
    anychart.Chart.prototype.DISPATCHED_CONSISTENCY_STATES |
    anychart.utils.ConsistencyState.DATA |
    anychart.utils.ConsistencyState.PIE_APPEARANCE |
    anychart.utils.ConsistencyState.LABELS |
    anychart.utils.ConsistencyState.HOVER |
    anychart.utils.ConsistencyState.CLICK;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.pie.Chart.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.Chart.prototype.SUPPORTED_CONSISTENCY_STATES |
        anychart.utils.ConsistencyState.DATA |
        anychart.utils.ConsistencyState.PIE_APPEARANCE |
        anychart.utils.ConsistencyState.LABELS |
        anychart.utils.ConsistencyState.HOVER |
        anychart.utils.ConsistencyState.CLICK;


/**
 * Defines the way to treat points filtered out by a filter function.
 * @enum {string}
 */
anychart.pie.Chart.OtherPointType = {
  /**
   * Ignore filtered out point.
   */
  DROP: 'drop',

  /**
   * Group filtered out point into one point.
   */
  GROUP: 'group',

  /**
   * Don't do anything with filtered out points.<br/>
   * This is a default behavior.
   */
  NONE: 'none'
};


/**
 * Normalizes user input of other point type to its enumeration values. Also accepts null. Defaults to opt_default or 'none'.
 * @param {string} otherPointType Other point type to normalize.
 * @param {anychart.pie.Chart.OtherPointType=} opt_default Default value to return.
 * @return {anychart.pie.Chart.OtherPointType} Normalized other point type.
 */
anychart.pie.Chart.normalizeOtherPointType = function(otherPointType, opt_default) {
  if (goog.isString(otherPointType)) {
    otherPointType = otherPointType.toLowerCase();
    for (var i in anychart.pie.Chart.OtherPointType) {
      if (otherPointType == anychart.pie.Chart.OtherPointType[i])
        return anychart.pie.Chart.OtherPointType[i];
    }
  }
  return opt_default || anychart.pie.Chart.OtherPointType.NONE;
};


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
 *  new anychart.pie.Chart(dataSet.mapAs({'value': 1}))
 *      .container(stage)
 *      .bounds(0,0,'50%', '100%')
 *      .draw();
 *  new anychart.pie.Chart(dataSet.mapAs({'value': 2}))
 *      .container(stage)
 *      .bounds('50%',0,'50%', '100%')
 *      .draw();
 * @param {(anychart.data.View|anychart.data.Mapping|anychart.data.Set|Array)=} opt_value Data for the chart.
 * @return {anychart.pie.Chart} An instance of {@link anychart.pie.Chart} class for method chaining.
 *//**
 * Returns current chart data.
 * @return {anychart.data.View} Current view or self for chaining.
 *//**
 * @ignoreDoc
 * @param {(anychart.data.View|anychart.data.Mapping|anychart.data.Set|Array)=} opt_value .
 * @return {(anychart.data.View|anychart.pie.Chart)} .
 */
anychart.pie.Chart.prototype.data = function(opt_value) {
  if (this.preparingData_) return this;
  if (goog.isDef(opt_value)) {
    if (this.parentView_ != opt_value) {
      goog.dispose(this.parentViewToDispose_);
      /**
       * @type {anychart.data.View}
       */
      var parentView;
      if ((opt_value instanceof anychart.data.Mapping) || (opt_value instanceof anychart.data.View)) {
        parentView = opt_value;
        this.parentViewToDispose_ = null;
      } else {
        if (opt_value instanceof anychart.data.Set)
          parentView = (this.parentViewToDispose_ = opt_value).mapAs();
        else if (goog.isArray(opt_value))
          parentView = (this.parentViewToDispose_ = new anychart.data.Set(opt_value)).mapAs();
        else
          parentView = (this.parentViewToDispose_ = new anychart.data.Set(null)).mapAs();
        this.registerDisposable(this.parentViewToDispose_);
      }
      this.parentView_ = parentView.derive();
    }

    goog.dispose(this.view_);
    this.view_ = this.prepareData_(this.parentView_);
    this.view_.listenInvalidation(this.dataInvalidated_, this);
    this.registerDisposable(this.view_);
    this.invalidate(anychart.utils.ConsistencyState.DATA | anychart.utils.ConsistencyState.PIE_APPEARANCE | anychart.utils.ConsistencyState.LABELS);
    return this;
  }
  return this.view_;
};


/**
 * Method that prepares the final view of data.
 * @param {(anychart.data.View)} data Data.
 * @return {anychart.data.View} Prepared view.
 * @private
 */
anychart.pie.Chart.prototype.prepareData_ = function(data) {
  if (this.otherPointType_ == 'drop') {
    data = data.filter('value', this.otherPointFilter_);
    data.transitionMeta(true);
  } else if (this.otherPointType_ == 'group') {
    data = data.preparePie('value', this.otherPointFilter_, undefined, function() {
      return {'value': 0};
    });
    data.transitionMeta(true);
  } else if (this.otherPointType_ != 'none') {
    throw Error('No acceptable data passed to the pie plot');
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
    this.palette_.listenInvalidation(this.paletteInvalidated_, this);
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
        this.palette_.listenInvalidation(this.paletteInvalidated_, this);
        this.registerDisposable(this.palette_);
      }
    }
    this.invalidate(anychart.utils.ConsistencyState.PIE_APPEARANCE);
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
 * };</code>
 * @return {!anychart.pie.Chart} An instance of {@link anychart.pie.Chart} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(acgraph.vector.Fill|function():acgraph.vector.Fill)=} opt_value .
 * @return {(acgraph.vector.Fill|function():acgraph.vector.Fill|anychart.pie.Chart)} .
 */
anychart.pie.Chart.prototype.fill = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.fill_ = opt_value;
    this.invalidate(anychart.utils.ConsistencyState.PIE_APPEARANCE);
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
 * };</code>
 * @return {!anychart.pie.Chart} An instance of {@link anychart.pie.Chart} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(acgraph.vector.Stroke|function():acgraph.vector.Stroke)=} opt_value .
 * @return {(acgraph.vector.Stroke|function():acgraph.vector.Stroke|anychart.pie.Chart)} .
 */
anychart.pie.Chart.prototype.stroke = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.stroke_ = opt_value;
    this.invalidate(anychart.utils.ConsistencyState.PIE_APPEARANCE);
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
 * };</code>
 * @return {!anychart.pie.Chart} An instance of {@link anychart.pie.Chart} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(acgraph.vector.Fill|function():acgraph.vector.Fill)=} opt_value .
 * @return {(acgraph.vector.Fill|function():acgraph.vector.Fill|anychart.pie.Chart)} .
 */
anychart.pie.Chart.prototype.hoverFill = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.hoverFill_ = opt_value;
    this.invalidate(anychart.utils.ConsistencyState.PIE_APPEARANCE);
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
 * };</code>
 * @return {!anychart.pie.Chart} An instance of {@link anychart.pie.Chart} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(acgraph.vector.Stroke|function():acgraph.vector.Stroke)=} opt_value .
 * @return {(acgraph.vector.Stroke|function():acgraph.vector.Stroke|anychart.pie.Chart)} .
 */
anychart.pie.Chart.prototype.hoverStroke = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.hoverStroke_ = opt_value;
    this.invalidate(anychart.utils.ConsistencyState.PIE_APPEARANCE);
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
 * @return {anychart.elements.Multilabel} An instance of {@link anychart.elements.Multilabel} class for method chaining.
 *//**
 * Setter for the pie labels.<br/>
 * <b>Note:</b> positioing is done using {@link anychart.elements.Multilabel#positionFormatter} method
 * and text is formatted using {@link anychart.elements.Multilabel#textFormatter} method.
 * @example
 *  var data = [
 *    {name: 'Point 1', value: 10},
 *    {name: 'Point 2', value: 7},
 *    {name: 'Point 3', value: 20},
 *    {name: 'Point 4', value: 14}
 *  ];
 *  chart = new anychart.pie.Chart(data);
 *  var labels = new anychart.elements.Multilabel();
 *  labels.textFormatter(function(formatProvider, index){
 *        var lblText = formatProvider(index, 'name');
 *        lblText += ': ' + formatProvider(index, 'value');
 *        return lblText;
 *      })
 *      .positionFormatter(function(positionProvider, index){
 *        return positionProvider(index);
 *      })
 *      .fontSize(10)
 *      .fontColor('white');
 *  chart.labels(labels);
 * @param {anychart.elements.Multilabel=} opt_value [] Multilabel instance.
 * @return {anychart.pie.Chart} An instance of {@link anychart.pie.Chart} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {anychart.elements.Multilabel=} opt_value .
 * @return {(anychart.elements.Multilabel|anychart.pie.Chart)} .
 */
anychart.pie.Chart.prototype.labels = function(opt_value) {
  if (!this.labels_) {
    this.labels_ = new anychart.elements.Multilabel();
    this.labels_.cloneFrom(null);
    this.labels_.textFormatter(function(formatProvider, index) {
      return formatProvider(index, 'value').toString();
    });
    this.labels_.positionFormatter(function(positionProvider, index) {
      return positionProvider(index);
    });

    this.labels_.reset();
    this.labels_.listen(anychart.utils.Invalidatable.INVALIDATED, this.labelsInvalidated_, false, this);
    this.registerDisposable(this.labels_);
    this.invalidate(anychart.utils.ConsistencyState.LABELS);
  }

  if (goog.isDef(opt_value) && (opt_value instanceof anychart.elements.Multilabel || goog.isNull(opt_value))) {
    this.labels_.cloneFrom(opt_value);
    this.labels_.reset();
    this.invalidate(anychart.utils.ConsistencyState.LABELS);
    return this;
  }
  return this.labels_;
};


/**
 * Combined call of {@link anychart.pie.Chart#otherPointType} and {@link anychart.pie.Chart#otherPointFilter} methods.
 * <br>
 * We recommend to use this method to set of "Other" point parameters, because this way
 * chart is redrawn only once, in case of sequential call - it is redrawn twice.
 * @example
 *  var data = [10, 1, 7, 10, 2, 4, 20, 3, 14];
 *  chart = new anychart.pie.Chart(data);
 *  chart.setOtherPoint('drop', function(value){
 *    return (value >= 10);
 *  });
 * @param {(anychart.pie.Chart.OtherPointType|string)} typeValue Type of the other point filtering.
 * @param {(function(*):boolean)} filterValue Filter function which returns boolean flag
 * based on a value of a point, flag is used to decide whether a point falls into "Other". In general this function looks like this:
 * <code>function(pointValue){
 *   ...
 *   return BOOLEAN;
 * }.
 * </code>
 */
anychart.pie.Chart.prototype.setOtherPoint = function(typeValue, filterValue) {
  this.suspendInvalidationDispatching();
  this.preparingData_ = true;
  this.otherPointType(typeValue);
  this.preparingData_ = false;
  this.otherPointFilter(filterValue);
  this.resumeInvalidationDispatching(true);
};


/**
 * Sets the way to create the "Other" point.<br/>
 * <b>Note:</b> If you plan to use a filter function for an "Other" point we recommend to use
 * {@link anychart.pie.Chart#setOtherPoint} method which combines two methods.
 * @param {(anychart.pie.Chart.OtherPointType|string)=} opt_value [{@link anychart.pie.Chart.OtherPointType}.NONE] The way to create the "Other" point.
 * @return {anychart.pie.Chart} An instance of {@link anychart.pie.Chart} class for method chaining.
 *//**
 * Returns the current way to create the "Other" point.
 * @return {(anychart.pie.Chart.OtherPointType|string)} The current way to create the "Other" point.
 *//**
 * @ignoreDoc
 * @param {(anychart.pie.Chart.OtherPointType|string)=} opt_value .
 * @return {(anychart.pie.Chart.OtherPointType|string|anychart.pie.Chart)} .
 */
anychart.pie.Chart.prototype.otherPointType = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.pie.Chart.normalizeOtherPointType(opt_value);
    if (this.otherPointType_ != opt_value) {
      this.otherPointType_ = opt_value;
      this.data(this.parentView_);
    }
    return this;
  } else {
    return this.otherPointType_;
  }
};


/**
 * Sets the filter function of the "Other" point.<br/>
 * <b>Note:</b> If you plan to use grouping on the "Other" point we recommend to use
 * {@link anychart.pie.Chart#setOtherPoint} method, which combines two methods.
 * @example
 *  var data = [10, 1, 7, 10, 2, 4, 20, 3, 14];
 *  chart = new anychart.pie.Chart(data);
 *  // Leave only the points that pass the filter-function
 *  chart.otherPointType('drop');
 *  // Leave only the points with values greater than 10.
 *  chart.otherPointFilter(function(value){
 *     return (value >= 10);
 *   });
 * @param {function(*):boolean=} opt_value [//only the point with values greater than 3
 * function(val) {
 *   return val > 3;
 * }] Filter-function that returns boolean
 * flag to decide if it is a point to be placed in the "Other" point. In general this function looks like this:
 * <code>function(pointValue){
 *   ...
 *   return BOOLEAN;
 * }.
 * </code>
 * @return {anychart.pie.Chart} An instance of {@link anychart.pie.Chart} class for method chaining.
 *//**
 * Returns the current filter-function of the "Other" point.
 * @return {Function} Filter-function.
 *//**
 * @ignoreDoc
 * @param {function(*):boolean=} opt_value .
 * @return {(Function|anychart.pie.Chart)} .
 */
anychart.pie.Chart.prototype.otherPointFilter = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.otherPointFilter_ = opt_value;
    this.data(this.parentView_);
    return this;
  } else {
    return this.otherPointFilter_;
  }
};


/**
 * Setter for the outer pie radius.<br/>
 * Radious can be set as a number (considered as number of pixels),
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
    this.invalidate(anychart.utils.ConsistencyState.PIE_APPEARANCE | anychart.utils.ConsistencyState.LABELS);
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
 * @param {(string|number|function(number):number)=} opt_value [0] he value of the inner radius in pixels, percents or
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
    this.invalidate(anychart.utils.ConsistencyState.PIE_APPEARANCE | anychart.utils.ConsistencyState.LABELS);
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
    this.invalidate(anychart.utils.ConsistencyState.PIE_APPEARANCE | anychart.utils.ConsistencyState.LABELS);
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
    this.invalidate(anychart.utils.ConsistencyState.PIE_APPEARANCE | anychart.utils.ConsistencyState.LABELS);
    return this;
  } else {
    return this.explode_;
  }
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
 * Gets the final normalized fill color.
 * @param {number} pieSliceIndex Index of a pie slice.
 * @param {boolean=} opt_hover Whether a pie sliceis hovered or not.
 * @param {acgraph.vector.Fill=} opt_fill Normal state fill.
 * @return {!acgraph.vector.Fill} Normalized fill.
 * @private
 */
anychart.pie.Chart.prototype.getFillColor_ = function(pieSliceIndex, opt_hover, opt_fill) {
  var scope, fill;

  scope = {
    'index': pieSliceIndex
  };

  if (goog.isFunction(this.fill_)) {
    scope['sourceColor'] = this.palette_.colorAt(pieSliceIndex) || 'black';
    fill = this.fill_.call(scope);
  } else if (goog.isDef(this.fill_)) {
    fill = this.fill_;
  }

  fill = anychart.color.normalizeFill(fill);

  if (goog.isDefAndNotNull(opt_hover) && opt_hover === true) {
    if (goog.isDef(opt_fill)) fill = anychart.color.normalizeFill(opt_fill);
    scope['sourceColor'] = fill;
    if (goog.isFunction(this.hoverFill_)) {
      fill = this.hoverFill_.call(scope);
    } else if (goog.isDefAndNotNull(this.hoverFill_)) {
      fill = this.hoverFill_;
    }
    return anychart.color.normalizeFill(fill);
  } else {
    return fill;
  }
};


/**
 * Gets the final normalized stroke color.
 * @param {number} pieSliceIndex Index of a pie slice.
 * @param {boolean=} opt_hover Whether a pie slice is hovered or not.
 * @param {acgraph.vector.Stroke=} opt_stroke Normal state stroke.
 * @return {!acgraph.vector.Stroke} Normalized stroke.
 * @private
 */
anychart.pie.Chart.prototype.getStrokeColor_ = function(pieSliceIndex, opt_hover, opt_stroke) {
  var scope, stroke;

  scope = {
    'index': pieSliceIndex
  };

  if (goog.isFunction(this.stroke_)) {
    scope['sourceColor'] = this.palette_.colorAt(pieSliceIndex) || 'black';
    stroke = this.stroke_.call(scope);
  } else if (goog.isDefAndNotNull(this.stroke_)) {
    stroke = this.stroke_;
  } else stroke = 'none';

  stroke = anychart.color.normalizeStroke(stroke);

  if (goog.isDefAndNotNull(opt_hover) && opt_hover === true) {
    if (goog.isDef(opt_stroke)) stroke = anychart.color.normalizeStroke(opt_stroke);
    scope['sourceColor'] = stroke;
    if (goog.isFunction(this.hoverStroke_)) {
      stroke = this.hoverStroke_.call(scope);
    } else if (goog.isDefAndNotNull(this.hoverStroke_)) {
      stroke = this.hoverStroke_;
    }
    return anychart.color.normalizeStroke(stroke);
  } else {
    return stroke;
  }
};


/**
 * Drawing content.
 * @param {anychart.math.Rect} bounds Bounds of content area.
 */
anychart.pie.Chart.prototype.drawContent = function(bounds) {
  goog.base(this, 'drawContent', bounds);

  if (this.isConsistent()) return;

  var iterator = this.view_.getIterator();
  var fill, stroke, exploded;

  if (iterator.getRowsCount() >= 10) {
    if (window.console) {
      window.console.log('Warning: Too much points in Pie chart. See https://anychart.atlassian.net/wiki/pages/viewpage.action?pageId=17301506 for details.');
    }
  }

  if (this.hasInvalidationState(anychart.utils.ConsistencyState.PIE_APPEARANCE | anychart.utils.ConsistencyState.APPEARANCE)) {
    if (this.dataLayer_) {
      this.dataLayer_.removeChildren();
    } else {
      this.dataLayer_ = acgraph.layer().parent(this.rootElement);
    }

    this.calculate_(bounds);

    if (this.hasInvalidationState(anychart.utils.ConsistencyState.DATA)) {
      var sum = 0;
      while (iterator.advance()) {
        sum += parseFloat(iterator.get('value'));
      }

      /**
       * Sum of all  pie slices values.
       * @type {number}
       * @private
       */
      this.valuesSum_ = sum;

      iterator.reset();
      this.markConsistent(anychart.utils.ConsistencyState.DATA);
    }

    var value;
    var start = /** @type {number} */ (this.startAngle_);
    var sweep = 0;

    while (iterator.advance()) {
      value = parseFloat(iterator.get('value'));

      sweep = value / this.valuesSum_ * 360;

      fill = iterator.get('fill') || this.getFillColor_(iterator.getIndex());
      stroke = iterator.get('stroke') || this.getStrokeColor_(iterator.getIndex());

      iterator.meta('start', start).meta('sweep', sweep);
      if (!(exploded = iterator.meta('exploded'))) {
        exploded = !!iterator.get('exploded');
        iterator.meta('exploded', exploded);
      }

      this.drawPoint_(iterator.getIndex(), start, sweep, this.cx_, this.cy_, this.radiusValue_, this.innerRadiusValue_, fill, stroke, exploded, this.explodeValue_, null);
      start += sweep;
    }
    this.markConsistent(anychart.utils.ConsistencyState.PIE_APPEARANCE);
  }

  if (this.hasInvalidationState(anychart.utils.ConsistencyState.LABELS | anychart.utils.ConsistencyState.APPEARANCE)) {
    if (this.labels_) {
      this.labels_.reset();
      iterator.reset();

      if (!this.labels_.container()) this.labels_.container(this.rootElement);

      while (iterator.advance()) {
        this.labels_.draw(this.formatProvider_, this.positionProvider_);
      }
      this.labels_.end();
    }
    this.markConsistent(anychart.utils.ConsistencyState.LABELS);
  }

  if (this.hasInvalidationState(anychart.utils.ConsistencyState.HOVER)) {
    if (this.hovered_) {
      var pieSlice = this.hovered_[0];
      var pieSliceIndex = this.hovered_[1];
      var isHovered = this.hovered_[2];
      iterator.select(pieSliceIndex);

      var fillColor = isHovered ? iterator.get('hoverFill') : iterator.get('fill');
      var strokeColor = isHovered ? iterator.get('hoverStroke') : iterator.get('stroke');

      fill = fillColor || this.getFillColor_(iterator.getIndex(), isHovered, iterator.get('fill'));
      stroke = strokeColor || this.getStrokeColor_(iterator.getIndex(), isHovered, iterator.get('stroke'));

      pieSlice.fill(fill);
      pieSlice.stroke(stroke);
    }
    this.markConsistent(anychart.utils.ConsistencyState.HOVER);
  }

  if (this.hasInvalidationState(anychart.utils.ConsistencyState.CLICK)) {
    this.markConsistent(anychart.utils.ConsistencyState.CLICK);
    if (this.clicked_) {
      pieSliceIndex = this.clicked_[0];
      iterator.select(pieSliceIndex);
      iterator.meta('exploded', !iterator.meta('exploded'));
      this.invalidate(anychart.utils.ConsistencyState.PIE_APPEARANCE | anychart.utils.ConsistencyState.LABELS);
    }
  }
};


/**
 * Internal function for drawinga slice by arguments.
 * @param {number} index Index of a row in the view.
 * @param {number} start Start angle.
 * @param {number} sweep Sweep angle.
 * @param {number} cx The X coordinate of center point.
 * @param {number} cy The Y coordinate of center point.
 * @param {number} radius Outer radius.
 * @param {number} innerRadius Inner radius.
 * @param {acgraph.vector.Fill?} fill Fill setting.
 * @param {acgraph.vector.Stroke?} stroke Stroke setting.
 * @param {boolean=} opt_exploded Is point exploded.
 * @param {number=} opt_explode Explode value.
 * @param {acgraph.vector.Path=} opt_path If set, draws to that path.
 * @return {boolean} True if point is drawn.
 * @private
 */
anychart.pie.Chart.prototype.drawPoint_ = function(index, start, sweep, cx, cy, radius, innerRadius, fill, stroke, opt_exploded, opt_explode, opt_path) {
  if (sweep == 0) return false;
  if (opt_path) {
    var pie = opt_path;
    pie.clear();
  } else {
    pie = this.dataLayer_.path();
  }

  if (opt_exploded) {
    var angle = start + sweep / 2;
    var cos = Math.cos(angle * Math.PI / 180);
    var sin = Math.sin(angle * Math.PI / 180);
    var ex = opt_explode * cos;
    var ey = opt_explode * sin;
    pie = acgraph.vector.primitives.donut(pie, cx + ex, cy + ey, radius, innerRadius, start, sweep);
  } else {
    pie = acgraph.vector.primitives.donut(pie, cx, cy, radius, innerRadius, start, sweep);
  }
  if (opt_path) return true;

  pie['__index'] = index;
  pie.fill(fill);
  pie.stroke(stroke);

  acgraph.events.listen(pie, acgraph.events.EventType.MOUSEOVER, this.mouseOverHandler_, false, this);
  acgraph.events.listen(pie, acgraph.events.EventType.CLICK, this.mouseClickHandler_, false, this);

  return true;
};


/**
 * Internal data invalidation handler.
 * @param {anychart.utils.InvalidatedStatesEvent} event Event object.
 * @private
 */
anychart.pie.Chart.prototype.dataInvalidated_ = function(event) {
  if (event.invalidated(anychart.utils.ConsistencyState.DATA)) {
    this.invalidate(anychart.utils.ConsistencyState.DATA | anychart.utils.ConsistencyState.PIE_APPEARANCE);
  }
};


/**
 * Internal label invalidation handler.
 * @param {anychart.utils.InvalidatedStatesEvent} event Event object.
 * @private
 */
anychart.pie.Chart.prototype.labelsInvalidated_ = function(event) {
  this.invalidate(anychart.utils.ConsistencyState.LABELS);
};


/**
 * Internal palette invalidation handler.
 * @param {anychart.utils.InvalidatedStatesEvent} event Event object.
 * @private
 */
anychart.pie.Chart.prototype.paletteInvalidated_ = function(event) {
  if (event.invalidated(anychart.utils.ConsistencyState.DATA)) {
    this.invalidate(anychart.utils.ConsistencyState.PIE_APPEARANCE);
  }
};


/**
 * Mouse over internal handler.
 * @param {acgraph.events.Event} event Event object.
 * @private
 */
anychart.pie.Chart.prototype.mouseOverHandler_ = function(event) {
  var pie = event.target;
  var index = pie['__index'];

  this.hovered_ = [pie, index, true];

  acgraph.events.listen(pie, acgraph.events.EventType.MOUSEOUT, this.mouseOutHandler_, false, this);
  this.invalidate(anychart.utils.ConsistencyState.HOVER);
};


/**
 * Mouse out internal handler.
 * @param {acgraph.events.Event} event Event object.
 * @private
 */
anychart.pie.Chart.prototype.mouseOutHandler_ = function(event) {
  var pie = event.target;
  var index = pie['__index'];

  this.hovered_ = [pie, index, false];

  acgraph.events.unlisten(pie, acgraph.events.EventType.MOUSEOUT, this.mouseOutHandler_, false, this);

  this.invalidate(anychart.utils.ConsistencyState.HOVER);
};


/**
 * Mouse click internal handler.
 * @param {acgraph.events.Event} event Event object.
 * @private
 */
anychart.pie.Chart.prototype.mouseClickHandler_ = function(event) {
  var pie = event.target;
  var index = pie['__index'];

  this.clicked_ = [index];
  this.invalidate(anychart.utils.ConsistencyState.CLICK);
};


/**
 * @inheritDoc
 */
anychart.pie.Chart.prototype.serialize = function() {
  var json = {};

  var chart = goog.base(this, 'serialize');

  chart['type'] = 'pie';

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


/**
 * Deserialize pie chart from config.
 * @param {Object} config json config.
 */
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

  var margin = chart['margin'];
  var padding = chart['padding'];
  var background = chart['background'];
  var title = chart['title'];
  var labels = chart['labels'];

  this.suspendInvalidationDispatching();

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

  if (margin) {
    this.margin().deserialize(margin);
  }

  if (padding) {
    this.padding().deserialize(padding);
  }

  if (background) {
    this.background().deserialize(background);
  }

  if (title) {
    this.title().deserialize(title);
  }

  if (labels) {
    var multiLabels = this.labels();
    multiLabels.textFormatter(/** @type {Function} */ (this.labels().textFormatter()));
    multiLabels.positionFormatter(/** @type {Function} */ (this.labels().positionFormatter()));
    multiLabels.deserialize(labels);
  }

  this.resumeInvalidationDispatching(false);
};
