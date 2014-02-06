goog.provide('anychart.pie.Chart');
goog.require('anychart.Chart');
goog.require('anychart.math');
goog.require('anychart.utils.Sort');



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
   * @type {anychart.pie.Chart.OtherPointType}
   * @private
   */
  this.otherPointType_ = anychart.pie.Chart.OtherPointType.NONE;

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
   * Position provider for labels position formatter.
   * @type {function(number):Object}
   * @private
   */
  this.positionProvider_ = goog.bind(function(index) {
    var iterator = this.data().getIterator();
    iterator.select(index);
    var start = /** @type {number} */ (iterator.getMeta('start'));
    var sweep = /** @type {number} */ (iterator.getMeta('sweep'));
    var exploded = /** @type {boolean} */ (iterator.getMeta('exploded'));
    var angle = (start + sweep / 2) * Math.PI / 180;

    var dR = (this.radiusValue_ + this.innerRadiusValue_) / 2 + (exploded ? this.explodeValue_ : 0);

    var x = this.cx_ + dR * Math.cos(angle);
    var y = this.cy_ + dR * Math.sin(angle);

    return {'x': x, 'y': y};
  }, this);


  /**
   * Format provider for labels text formatter.
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
   * Used in setOtherPoint, to prevent call of data set method twice.
   * @see #setOtherPoint
   * @type {boolean}
   * @private
   */
  this.preparingData_ = false;

  this.palette();
  this.labels();
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
        anychart.utils.ConsistencyState.LABELS |
        anychart.utils.ConsistencyState.HOVER |
        anychart.utils.ConsistencyState.CLICK;


/**
 * Other point type enumeration.
 * @enum {string}
 */
anychart.pie.Chart.OtherPointType = {
  /**
   * Values will be collected by filter function and dropped.
   */
  DROP: 'drop',

  /**
   * Values will be collected by filter function and grouped into other point.
   */
  GROUP: 'group',

  /**
   * No other point would be presented.
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
 * Sets the data to chart.
 * @param {(anychart.data.View|anychart.data.Mapping|anychart.data.Set|Array)=} opt_value Data.
 * @return {(anychart.data.View|anychart.pie.Chart)} Current view or self for chaining.
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
    this.view_.listen(anychart.utils.Invalidatable.INVALIDATED, this.dataInvalidated_, false, this);
    this.registerDisposable(this.view_);
    this.invalidate(anychart.utils.ConsistencyState.DATA | anychart.utils.ConsistencyState.PIE_APPEARANCE | anychart.utils.ConsistencyState.LABELS);
    return this;
  }
  return this.view_;
};


/**
 * Method that prepares final view of data.
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
 * Getter/setter for pie palette.
 * @param {(anychart.utils.RangeColorPalette|anychart.utils.DistinctColorPalette|Array)=} opt_value Color palette instance.
 * @return {(anychart.utils.RangeColorPalette|anychart.utils.DistinctColorPalette|anychart.pie.Chart)} Color palette.
 * instance or self for chaining.
 */
anychart.pie.Chart.prototype.palette = function(opt_value) {
  if (!this.palette_) {
    this.palette_ = new anychart.utils.DistinctColorPalette();
    this.palette_.listen(anychart.utils.Invalidatable.INVALIDATED, this.paletteInvalidated_, false, this);
    this.registerDisposable(this.palette_);
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
        this.palette_.listen(anychart.utils.Invalidatable.INVALIDATED, this.paletteInvalidated_, false, this);
        this.registerDisposable(this.palette_);
      }
    }
    this.invalidate(anychart.utils.ConsistencyState.PIE_APPEARANCE);
    return this;
  }
  return this.palette_;
};


/**
 * Getter/setter for pie labels.
 * @param {anychart.elements.Multilabel=} opt_value Multilabel instance.
 * @return {(anychart.elements.Multilabel|anychart.pie.Chart)} Multilabel instance or self for chaining.
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

  if (goog.isDef(opt_value) && opt_value instanceof anychart.elements.Multilabel) {
    this.labels_.cloneFrom(opt_value);
    this.labels_.reset();
    this.invalidate(anychart.utils.ConsistencyState.LABELS);
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
  this.preparingData_ = true;
  this.otherPointType(opt_typeValue);
  this.preparingData_ = false;
  this.otherPointFilter(opt_filterValue);
  this.resumeInvalidationDispatching(true);
};


/**
 * Getter/setter for other point type.
 * @param {(anychart.pie.Chart.OtherPointType|string)=} opt_value Type of the other point if setter.
 * @return {(anychart.pie.Chart.OtherPointType|anychart.pie.Chart)} Type of the other point or self for chaining.
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
 * Getter/setter for other point filter function.
 * @param {function(*):boolean=} opt_value Filter function for the other point if setter.
 * @return {(Function|anychart.pie.Chart)} Filter function of the other point or self for chaining.
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
 * Getter/setter for outer pie radius.
 * @param {(string|number)=} opt_value Value of the outer radius.
 * @return {(string|number|anychart.pie.Chart)} Outer radius or self for chaining.
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
 * Getter/setter for inner radius in case of donut.
 * @param {(string|number|function(number):number)=} opt_value Value of the inner radius.
 * @return {(string|number|function(number):number|anychart.pie.Chart)} Inner radius or self for chaining.
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
 * Getter for pie chart center point.
 * @return {anychart.math.Coordinate} XY coordinate of pie center.
 */
anychart.pie.Chart.prototype.getCenterPoint = function() {
  return {'x': this.cx_, 'y': this.cy_};
};


/**
 * Getter for pie chart pixel radius.
 * @return {number} Pixel value of pie radius.
 */
anychart.pie.Chart.prototype.getPixelRadius = function() {
  return this.radiusValue_;
};


/**
 * Getter for pie chart pixel inner radius.
 * @return {number} XY coordinate of pie center.
 */
anychart.pie.Chart.prototype.getPixelInnerRadius = function() {
  return this.innerRadiusValue_;
};


/**
 * Angle from which to start drawing of pie slices.
 * @param {(string|number)=} opt_value Value of the start angle.
 * @return {(string|number|anychart.pie.Chart)} Start angle or self for chaining.
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
 * Getter/setter for value which pie slice should be exploded.
 * @param {(string|number)=} opt_value Value of the explode.
 * @return {(string|number|anychart.pie.Chart)} Explode setting or self for chaining.
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
 * Getter/setter for sort setting.
 * @param {(anychart.utils.Sort|string)=} opt_value Value of the sort setting.
 * @return {(anychart.utils.Sort|anychart.pie.Chart)} Sort setting or self for chaining.
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

  if (this.isConsistent()) return;

  var iterator = this.view_.getIterator();
  var color, fill, stroke, exploded;

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
       * Sum of all pie slices value.
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

      color = this.palette_.colorAt(iterator.getIndex()) || 'black';
      fill = iterator.get('fill') || color;
      stroke = iterator.get('stroke') || '1 ' + color + ' 0.6';

      iterator.setMeta('start', start).setMeta('sweep', sweep);
      if (!(exploded = iterator.getMeta('exploded'))) {
        exploded = !!iterator.get('exploded');
        iterator.setMeta('exploded', exploded);
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
      iterator.select(pieSliceIndex);
      var isHovered = this.hovered_[2];

      color = iterator.get('fill') || this.palette_.colorAt(pieSliceIndex) || 'black';

      color = /** @type {string} */ (color) + (isHovered ? ' 0.4' : '');
      pieSlice.fill(color);
    }
    this.markConsistent(anychart.utils.ConsistencyState.HOVER);
  }

  if (this.hasInvalidationState(anychart.utils.ConsistencyState.CLICK)) {
    this.markConsistent(anychart.utils.ConsistencyState.CLICK);
    if (this.clicked_) {
      pieSliceIndex = this.clicked_[0];
      iterator.select(pieSliceIndex);
      iterator.setMeta('exploded', !iterator.getMeta('exploded'));
      this.invalidate(anychart.utils.ConsistencyState.PIE_APPEARANCE | anychart.utils.ConsistencyState.LABELS);
    }
  }
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
 * @param {acgraph.vector.Fill?} fill Fill setting.
 * @param {acgraph.vector.Stroke?} stroke Stroke setting.
 * @param {boolean=} opt_exploded Is point exploded.
 * @param {number=} opt_explode Explode value.
 * @param {acgraph.vector.Path=} opt_path If set, draws to that path.
 * @return {boolean} True if point draw.
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
