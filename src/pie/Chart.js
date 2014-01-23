goog.provide('anychart.pie.Chart');



/**
 * Pie/Donut chart.
 * @param {(anychart.data.View|anychart.data.Mapping|anychart.data.Set|Array)=} opt_data Data for the chart.
 * @extends {anychart.Chart}
 * @constructor
 */
anychart.pie.Chart = function(opt_data) {
  goog.base(this);
  this.suspendInvalidationDispatching();

  /**
   * Type of the other point.
   * @type {string}
   * @private
   */
  this.otherPointType_ = 'none';

  /**
   * Filter function that should accept a field value and return true if the row
   *    should be included into the resulting view as a and false otherwise..
   * @param {*} val Value supposed to be filtered.
   * @return {boolean} Filtering result.
   * @private
   */
  this.otherPointFilter_ = function(val) {
    return (/** @type {number} */ (val)) > 3;
  };

  /**
   * Start angle for first slice of pie.
   * @type {(string|number)}
   * @private
   */
  this.startAngle_ = -90;

  /**
   * Outer radius for the pie.
   * @type {(string|number)}
   * @private
   */
  this.radius_ = '40%';

  /**
   * Inner radius in case of donut.
   * @type {!(string|number|function(number):number)}
   * @private
   */
  this.innerRadius_ = 0;

  /**
   * Value which pie slice should be exploded.
   * @type {(string|number)}
   * @private
   */
  this.explode_ = 15;

  /**
   * The sort type for the pie points.
   * Other point included into sort.
   * @type {string}
   * @private
   */
  this.sort_ = 'none';

  /**
   * Pie labels.
   * @type {anychart.elements.Multilabel}
   * @private
   */
  this.labels_ = null;

  /**
   * Pie chart default palette.
   * @type {anychart.utils.ColorPalette}
   * @private
   */
  this.palette_ = new anychart.utils.ColorPalette();
  this.palette_.listen(anychart.utils.Invalidatable.INVALIDATED, this.paletteInvalidated_, false, this);

  this.data(opt_data);
  this.invalidate(anychart.utils.ConsistencyState.PIE_APPEARANCE);
  this.resumeInvalidationDispatching(false);
};
goog.inherits(anychart.pie.Chart, anychart.Chart);


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.pie.Chart.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.Chart.prototype.SUPPORTED_CONSISTENCY_STATES |
        anychart.utils.ConsistencyState.DATA |
        anychart.utils.ConsistencyState.PIE_APPEARANCE |
        anychart.utils.ConsistencyState.HOVER |
        anychart.utils.ConsistencyState.CLICK;


/**
 * Sets the data to chart.
 * @param {(anychart.data.View|anychart.data.Mapping|anychart.data.Set|Array)=} opt_value Data.
 * @return {(*|anychart.pie.Chart)} Current view or self for chaining.
 */
anychart.pie.Chart.prototype.data = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.view_ = this.prepareData(opt_value);
    this.view_.listen(anychart.utils.Invalidatable.INVALIDATED, this.dataInvalidated_, false, this);
    this.registerDisposable(this.view_);
    this.invalidate(anychart.utils.ConsistencyState.DATA);
    return this;
  }
  return this.view_;
};


/**
 * Method that prepares final view of data.
 * @param {(anychart.data.View|anychart.data.Mapping|anychart.data.Set|Array)} data Data.
 * @return {anychart.data.View} Prepared view.
 */
anychart.pie.Chart.prototype.prepareData = function(data) {
  var parentView;
  if ((data instanceof anychart.data.Mapping) || (data instanceof anychart.data.View))
    parentView = data;
  else if (data instanceof anychart.data.Set)
    parentView = data.mapAs();
  else if (goog.isArray(data))
    parentView = new anychart.data.Set(data).mapAs();
  else
    parentView = new anychart.data.Set(null).mapAs();

  if (this.otherPointType_ == 'drop') {
    parentView = parentView.filter('value', this.otherPointFilter_);
  } else if (this.otherPointType_ == 'group') {
    parentView = parentView.preparePie('value', this.otherPointFilter_, undefined, function() {
      return {'value': 0};
    });
  } else if (this.otherPointType_ != 'none') {
    throw Error('No acceptable data passed to the pie plot');
  }

  if (this.sort_ == 'none') {
    return parentView;
  } else {
    if (this.sort_ == 'asc')
      return parentView.sort('value', function(a, b) {
        return (/** @type {number} */ (a) - /** @type {number} */ (b));
      });
    else
      return parentView.sort('value', function(a, b) {
        return (/** @type {number} */ (b) - /** @type {number} */ (a));
      });
  }
};


/**
 * Getter/setter for pie palette.
 * @param {(anychart.utils.ColorPalette|Array)=} opt_value Color palette instance.
 * @return {(anychart.utils.ColorPalette|anychart.pie.Chart)} Color palette instance or self for chaining.
 */
anychart.pie.Chart.prototype.palette = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (goog.isArray(opt_value)) {
      this.palette_.colors(opt_value);
    } else {
      this.palette_.cloneFrom(opt_value);
      this.invalidate(anychart.utils.ConsistencyState.PIE_APPEARANCE);
    }
    return this;
  } else {
    return this.palette_;
  }
};


/**
 * Getter/setter for pie labels.
 * @param {anychart.elements.Multilabel=} opt_value Multilabel instance.
 * @return {(anychart.elements.Multilabel|anychart.pie.Chart)} Multilabel instance or self for chaining.
 */
anychart.pie.Chart.prototype.labels = function(opt_value) {
  if (!this.labels_) {
    this.labels_ = new anychart.elements.Multilabel();
    this.labels_.textFormatter(function(formatProvider, index) {
      return formatProvider;
    });
    this.labels_.positionFormatter(function(positionProvider, index) {
      return positionProvider(index);
    });
    this.labels_.listen(anychart.utils.Invalidatable.INVALIDATED, this.labelsInvalidated_, false, this);
    this.registerDisposable(this.labels_);
    this.invalidate(anychart.utils.ConsistencyState.PIE_APPEARANCE);
  }

  if (goog.isDef(opt_value) && opt_value instanceof anychart.elements.Multilabel) {
    this.labels_ = opt_value;
    this.invalidate(anychart.utils.ConsistencyState.PIE_APPEARANCE);
    return this;
  }
  return this.labels_;
};


/**
 * Sets the setting for other point.
 * @param {string=} opt_typeValue Type of the other point filtering.
 * @param {function(*):boolean=} opt_filterValue Filter function.
 */
anychart.pie.Chart.prototype.setOtherPoint = function(opt_typeValue, opt_filterValue) {
  this.suspendInvalidationDispatching();
  this.otherPointType(opt_typeValue);
  this.otherPointFilter(opt_filterValue);
  this.resumeInvalidationDispatching(true);
};


/**
 * Getter/setter for other point type.
 * @param {string=} opt_value Type of the other point if setter.
 * @return {(string|anychart.pie.Chart)} Type of the other point or self for chaining.
 */
anychart.pie.Chart.prototype.otherPointType = function(opt_value) {
  if (goog.isDefAndNotNull(opt_value)) {
    var lower = opt_value.toString().toLowerCase();
    if (this.otherPointType_ != lower) {
      switch (lower) {
        case 'group':
          this.otherPointType_ = 'group';
          break;
        case 'drop':
          this.otherPointType_ = 'drop';
          break;
        case 'none':
        default:
          this.otherPointType_ = 'none';
          break;
      }
      this.data(this.view_);
    }
    return this;
  } else {
    return this.otherPointType_;
  }
};


/**
 * Getter/setter for other point filter function.
 * @param {function(*):boolean=} opt_value Filter function for the other point if setter.
 * @return {(Function|anychart.pie.Chart)} Filter function of the other point or self for chaining.
 */
anychart.pie.Chart.prototype.otherPointFilter = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.otherPointFilter_ = opt_value;
    this.data(this.view_);
    return this;
  } else {
    return this.otherPointFilter_;
  }
};


/**
 * Getter/setter for outer pie radius.
 * @param {(string|number)=} opt_value Value of the outer radius.
 * @return {(string|number|anychart.pie.Chart)} Outer radius or self for chaining.
 */
anychart.pie.Chart.prototype.radius = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.radius_ = opt_value;
    this.invalidate(anychart.utils.ConsistencyState.PIE_APPEARANCE);
    return this;
  } else {
    return this.radius_;
  }
};


/**
 * Getter/setter for inner radius in case of donut.
 * @param {(string|number|function(number):number)=} opt_value Value of the inner radius.
 * @return {(string|number|function(number):number|anychart.pie.Chart)} Inner radius or self for chaining.
 */
anychart.pie.Chart.prototype.innerRadius = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.innerRadius_ = opt_value;
    this.invalidate(anychart.utils.ConsistencyState.PIE_APPEARANCE);
    return this;
  } else {
    return this.innerRadius_;
  }
};


/**
 * Angle from which to start drawing of pie slices.
 * @param {(string|number)=} opt_value Value of the start angle.
 * @return {(string|number|anychart.pie.Chart)} Start angle or self for chaining.
 */
anychart.pie.Chart.prototype.startAngle = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.startAngle_ = +opt_value || 0;
    this.invalidate(anychart.utils.ConsistencyState.PIE_APPEARANCE);
    return this;
  } else {
    return this.startAngle_;
  }
};


/**
 * Getter/setter for value which pie slice should be exploded.
 * @param {(string|number)=} opt_value Value of the explode.
 * @return {(string|number|anychart.pie.Chart)} Explode setting or self for chaining.
 */
anychart.pie.Chart.prototype.explode = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.explode_ = opt_value;
    this.invalidate(anychart.utils.ConsistencyState.PIE_APPEARANCE);
    return this;
  } else {
    return this.explode_;
  }
};


/**
 * Getter/setter for sort setting.
 * @param {string=} opt_value Value of the sort setting.
 * @return {(string|anychart.pie.Chart)} Sort setting or self for chaining.
 */
anychart.pie.Chart.prototype.sort = function(opt_value) {
  if (goog.isDefAndNotNull(opt_value)) {
    var lower = opt_value.toString().toLowerCase();
    switch (lower) {
      case 'asc':
        this.sort_ = 'asc';
        break;
      case 'desc':
        this.sort_ = 'desc';
        break;
      case 'none':
      default:
        this.sort_ = 'none';
        break;
    }
    this.data(this.view_);
    return this;
  } else {
    return this.sort_;
  }
};


/**
 * Calculating common values for pie plot.
 * @param {anychart.math.Rect} bounds Bounds of content area.
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
 * Drawing content.
 * @param {anychart.math.Rect} bounds Bounds of content area.
 */
anychart.pie.Chart.prototype.drawContent = function(bounds) {
  goog.base(this, 'drawContent', bounds);

  if (!this.hasInvalidationState(anychart.utils.ConsistencyState.DATA) && !this.hasInvalidationState(anychart.utils.ConsistencyState.PIE_APPEARANCE) && !this.hasInvalidationState(anychart.utils.ConsistencyState.HOVER) && !this.hasInvalidationState(anychart.utils.ConsistencyState.CLICK)) return;

  var iterator = this.view_.getIterator();
  var color, exploded;

  var positionProvider = goog.bind(function(index) {
    var start = this.anglesMap_[index][0];
    var sweep = this.anglesMap_[index][1];
    var exploded = this.anglesMap_[index][2];
    var angle = (start + sweep / 2) * Math.PI / 180;

    var dR = (this.radiusValue_ + this.innerRadiusValue_) / 2 + (exploded ? this.explodeValue_ : 0);

    var x = this.cx_ + dR * Math.cos(angle);
    var y = this.cy_ + dR * Math.sin(angle);

    return {'x': x, 'y': y};
  }, this);

  if (this.hasInvalidationState(anychart.utils.ConsistencyState.HOVER)) {
    if (this.hovered_) {
      var pieSlice = this.hovered_[0];
      var pieSliceIndex = this.hovered_[1];
      var isHovered = this.hovered_[2];

      color = /** @type {string} */ (this.palette_.colorAt(pieSliceIndex)) + (isHovered ? ' 0.4' : '');
      pieSlice.fill(color);

      this.markConsistent(anychart.utils.ConsistencyState.HOVER);
      return;
    }
  }

  if (this.hasInvalidationState(anychart.utils.ConsistencyState.CLICK)) {
    if (this.clicked_) {
      pieSlice = this.clicked_[0];
      pieSliceIndex = this.clicked_[1];
      this.anglesMap_[pieSliceIndex][2] = !this.anglesMap_[pieSliceIndex][2];

      this.drawPoint_(pieSliceIndex, this.anglesMap_[pieSliceIndex][0], this.anglesMap_[pieSliceIndex][1], this.cx_, this.cy_, this.radiusValue_, this.innerRadiusValue_, this.explodeValue_, this.anglesMap_[pieSliceIndex][2], null, null, pieSlice);
      if (this.labels_) {
        iterator.select(pieSliceIndex);
        this.labels_.draw(iterator.get('value').toString(), positionProvider, pieSliceIndex);
        this.labels_.end();
      }

      this.markConsistent(anychart.utils.ConsistencyState.CLICK);
      return;
    }
  }

  if (this.dataLayer_) {
    this.dataLayer_.removeChildren();
  } else {
    this.dataLayer_ = acgraph.layer().parent(this.rootElement);
  }

  if (this.hasInvalidationState(anychart.utils.ConsistencyState.PIE_APPEARANCE)) {
    this.calculate_(bounds);
  }

  if (this.hasInvalidationState(anychart.utils.ConsistencyState.DATA)) {
    var sum = 0;
    while (iterator.advance()) {
      sum += parseFloat(iterator.get('value'));
    }
    this.valuesSum_ = sum;

    iterator.reset();
  }

  var value;
  var start = /** @type {number} */ (this.startAngle_);
  var sweep = 0;

  this.anglesMap_ = {};

  while (iterator.advance()) {

    value = parseFloat(iterator.get('value'));

    sweep = value / this.valuesSum_ * 360;
    color = this.palette_.colorAt(iterator.getIndex()) || 'black';
    var fill = iterator.get('fill') || color;
    var stroke = iterator.get('stroke') || '1 ' + color + ' 0.6';
    exploded = !!iterator.get('exploded');
    this.anglesMap_[iterator.getIndex()] = [start, sweep, exploded];
    this.drawPoint_(iterator.getIndex(), start, sweep, this.cx_, this.cy_, this.radiusValue_, this.innerRadiusValue_, this.explodeValue_, exploded, fill, stroke, null);
    start += sweep;
  }

  if (this.labels_) {
    iterator.reset();
    this.labels_.container(this.rootElement);

    while (iterator.advance()) {
      this.labels_.draw(iterator.get('value').toString(), positionProvider);
    }
    this.labels_.end();
  }

  this.markConsistent(anychart.utils.ConsistencyState.DATA);
  this.markConsistent(anychart.utils.ConsistencyState.PIE_APPEARANCE);
};


/**
 * Internal function for drawing slice by arguments.
 * @param {number} index Index of row in the view.
 * @param {number} start Start angle.
 * @param {number} sweep Sweep angle.
 * @param {number} cx X coordinate of center point.
 * @param {number} cy Y coordinate of center point.
 * @param {number} radius Outer radius.
 * @param {number} innerRadius Inner radius.
 * @param {number} explode Explode value.
 * @param {boolean} exploded Is point exploded.
 * @param {acgraph.vector.Fill?} fill Fill setting.
 * @param {acgraph.vector.Stroke?} stroke Stroke setting.
 * @param {acgraph.vector.Path=} opt_path If set, draws to that path.
 * @return {boolean} True if point draw.
 * @private
 */
anychart.pie.Chart.prototype.drawPoint_ = function(index, start, sweep, cx, cy, radius, innerRadius, explode, exploded, fill, stroke, opt_path) {
  if (sweep == 0) return false;
  if (opt_path) {
    var pie = opt_path;
    pie.clear();
  } else {
    pie = this.dataLayer_.path();
  }

  if (exploded) {
    var angle = start + sweep / 2;
    var cos = Math.cos(angle * Math.PI / 180);
    var sin = Math.sin(angle * Math.PI / 180);
    var ex = explode * cos;
    var ey = explode * sin;
    pie = acgraph.vector.primitives.donut(pie, cx + ex, cy + ey, radius, innerRadius, start, sweep);
  } else {
    pie = acgraph.vector.primitives.donut(pie, cx, cy, radius, innerRadius, start, sweep);
  }
  if (opt_path) return true;

  pie['__index'] = index;
  pie.fill(fill).stroke(stroke);

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
    this.invalidate(anychart.utils.ConsistencyState.DATA);
  }
};


/**
 * Internal label invalidation handler.
 * @param {anychart.utils.InvalidatedStatesEvent} event Event object.
 * @private
 */
anychart.pie.Chart.prototype.labelsInvalidated_ = function(event) {
  if (event.invalidated(anychart.utils.ConsistencyState.APPEARANCE)) {
    this.invalidate(anychart.utils.ConsistencyState.PIE_APPEARANCE);
  }
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

  if (this.hovered_[0] == pie && this.hovered_[1] == index && this.hovered_[2]) {
    this.hovered_ = [pie, index, false];
  } else {
    this.hovered_ = null;
  }

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

  this.clicked_ = [pie, index];

  this.invalidate(anychart.utils.ConsistencyState.CLICK);
};
