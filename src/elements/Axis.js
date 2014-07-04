goog.provide('anychart.elements.Axis');

goog.require('acgraph.vector.Path');
goog.require('anychart.VisualBase');
goog.require('anychart.color');
goog.require('anychart.elements.LabelsFactory');
goog.require('anychart.elements.Ticks');
goog.require('anychart.elements.Title');
goog.require('anychart.math.Rect');
goog.require('anychart.scales.Base');
goog.require('anychart.scales.ScatterBase');
goog.require('anychart.utils');



/**
 * @constructor
 * @extends {anychart.VisualBase}
 */
anychart.elements.Axis = function() {
  this.suspendSignalsDispatching();
  goog.base(this);

  this.labelsBounds_ = [];
  this.minorLabelsBounds_ = [];

  this.zIndex(10);

  this.line_ = acgraph.path();

  this.title()
      .suspendSignalsDispatching()
      .text('Axis title')
      .fontFamily('Tahoma')
      .fontSize('11')
      .fontColor('rgb(34,34,34)')
      .fontWeight('bold')
      .padding(5)
      .margin(10, 5, 10, 5);

  this.title().background()
      .suspendSignalsDispatching()
      .stroke({
        'keys': [
          '0 #DDDDDD 1',
          '1 #D0D0D0 1'
        ],
        'angle' : '90'
      })
      .fill({
        'keys': [
          '0 #FFFFFF 1',
          '0.5 #F3F3F3 1',
          '1 #FFFFFF 1'
        ],
        'angle' : '90'
      })
      .enabled(false)
      .resumeSignalsDispatching(false);

  this.labels()
      .suspendSignalsDispatching()
      .enabled(true)
      .offsetX(0)
      .offsetY(0)
      .anchor(anychart.utils.NinePositions.CENTER)
      .padding(2, 3, 2, 3)
      .fontFamily('Tahoma')
      .fontSize('11')
      .fontColor('rgb(34,34,34)')
      .resumeSignalsDispatching(false);

  this.labels().background()
      .suspendSignalsDispatching()
      .enabled(false)
      .stroke({
        'keys': [
          '0 #DDDDDD 1',
          '1 #D0D0D0 1'
        ],
        'angle': '90'
      })
      .fill({
        'keys': [
          '0 #FFFFFF 1',
          '0.5 #F3F3F3 1',
          '1 #FFFFFF 1'
        ],
        'angle': '90'
      })
      .resumeSignalsDispatching(false);

  this.minorLabels()
      .suspendSignalsDispatching()
      .enabled(false)
      .offsetX(0)
      .offsetY(0)
      .padding(2, 3, 2, 3)
      .fontFamily('Tahoma')
      .fontSize('11')
      .fontColor('rgb(34,34,34)')
      .resumeSignalsDispatching(false);

  this.minorLabels()
      .suspendSignalsDispatching()
      .background(this.labels().background())
      .resumeSignalsDispatching(false);

  this.ticks()
      .suspendSignalsDispatching()
      .enabled(true)
      .length(5)
      .stroke({'color': '#313131', 'lineJoin': 'round', 'lineCap': 'butt'})
      .resumeSignalsDispatching(false);

  this.minorTicks()
      .suspendSignalsDispatching()
      .enabled(true)
      .length(2)
      .stroke({'color': '#3C3C3C', 'lineJoin': 'round', 'lineCap': 'butt'})
      .resumeSignalsDispatching(false);

  this.overlapMode(anychart.elements.Axis.OverlapMode.OVERLAP);
  this.stroke({'color': '#474747', 'lineJoin': 'round', 'lineCap': 'square'});

  this.resumeSignalsDispatching(true);

  /**
   * Const to save space.
   * @type {number}
   * @private
   */
  this.ALL_VISUAL_STATES_ = anychart.ConsistencyState.APPEARANCE |
      anychart.ConsistencyState.TITLE |
      anychart.ConsistencyState.LABELS |
      anychart.ConsistencyState.MINOR_LABELS |
      anychart.ConsistencyState.TICKS |
      anychart.ConsistencyState.MINOR_TICKS |
      anychart.ConsistencyState.BOUNDS |
      anychart.ConsistencyState.OVERLAP;
};
goog.inherits(anychart.elements.Axis, anychart.VisualBase);


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.elements.Axis.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.VisualBase.prototype.SUPPORTED_CONSISTENCY_STATES |
        anychart.ConsistencyState.APPEARANCE |
        anychart.ConsistencyState.TITLE |
        anychart.ConsistencyState.LABELS |
        anychart.ConsistencyState.MINOR_LABELS |
        anychart.ConsistencyState.TICKS |
        anychart.ConsistencyState.MINOR_TICKS |
        anychart.ConsistencyState.BOUNDS |
        anychart.ConsistencyState.OVERLAP;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.elements.Axis.prototype.SUPPORTED_SIGNALS = anychart.VisualBase.prototype.SUPPORTED_SIGNALS;


/**
 * Overlap mods.
 * @enum {string}
 */
anychart.elements.Axis.OverlapMode = {
  NO_OVERLAP: 'nooverlap',
  OVERLAP: 'overlap'
};


/**
 * @type {acgraph.vector.Path}
 * @private
 */
anychart.elements.Axis.prototype.line_ = null;


/**
 * @param {Object} formatProvider
 * @return {string}
 * @private
 */
anychart.elements.Axis.prototype.labelsTextFormatter_ = function(formatProvider) {
  return formatProvider['defaultText'];
};


/**
 * @param {Object} formatProvider
 * @return {string}
 * @private
 */
anychart.elements.Axis.prototype.minorLabelsTextFormatter_ = function(formatProvider) {
  return formatProvider['defaultText'];
};


/**
 * @type {string}
 * @private
 */
anychart.elements.Axis.prototype.name_ = 'axis';


/**
 * @type {string|anychart.elements.Title}
 * @private
 */
anychart.elements.Axis.prototype.title_ = null;


/**
 * @type {anychart.elements.LabelsFactory}
 * @private
 */
anychart.elements.Axis.prototype.labels_ = null;


/**
 * @type {anychart.elements.LabelsFactory}
 * @private
 */
anychart.elements.Axis.prototype.minorLabels_ = null;


/**
 * @type {anychart.elements.Ticks}
 * @private
 */
anychart.elements.Axis.prototype.ticks_ = null;


/**
 * @type {anychart.elements.Ticks}
 * @private
 */
anychart.elements.Axis.prototype.minorTicks_ = null;


/**
 * @type {string|acgraph.vector.Stroke}
 * @private
 */
anychart.elements.Axis.prototype.stroke_ = 'none';


/**
 * @type {string|anychart.utils.Orientation}
 * @private
 */
anychart.elements.Axis.prototype.orientation_ = anychart.utils.Orientation.TOP;


/**
 * @type {anychart.scales.Base}
 * @private
 */
anychart.elements.Axis.prototype.scale_ = null;


/**
 * @type {anychart.elements.Axis.OverlapMode|string}
 * @private
 */
anychart.elements.Axis.prototype.overlapMode_ = anychart.elements.Axis.OverlapMode.OVERLAP;


/**
 * @type {anychart.math.Rect}
 * @private
 */
anychart.elements.Axis.prototype.parentBounds_ = null;


/**
 * @type {anychart.utils.Bounds}
 * @private
 */
anychart.elements.Axis.prototype.pixelBounds_ = null;


/**
 * @type {number}
 * @private
 */
anychart.elements.Axis.prototype.length_ = NaN;


/**
 * @type {number}
 * @private
 */
anychart.elements.Axis.prototype.offsetX_ = 0;


/**
 * @type {number}
 * @private
 */
anychart.elements.Axis.prototype.offsetY_ = 0;


/**
 * @type {boolean}
 * @private
 */
anychart.elements.Axis.prototype.drawFirstLabel_ = true;


/**
 * @type {boolean}
 * @private
 */
anychart.elements.Axis.prototype.drawLastLabel_ = true;


/**
 * @type {Array.<Array.<number>>}
 * @private
 */
anychart.elements.Axis.prototype.labelsBounds_ = null;


/**
 * @type {Array.<Array.<number>>}
 * @private
 */
anychart.elements.Axis.prototype.minorLabelsBounds_ = null;


/**
 * Getter for axis name.
 * @return {string} Axis name.
 *//**
 * Setter for axis name.
 * @param {string=} opt_value Name.
 * @return {!anychart.elements.Axis} {@link anychart.elements.Axis} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {string=} opt_value Name.
 * @return {string|anychart.elements.Axis} Axis name or itself for method chaining.
 */
anychart.elements.Axis.prototype.name = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.name_ != opt_value)
      this.name_ = opt_value;
    return this;
  } else {
    return this.name_;
  }
};


/**
 * Getter for the title axis.
 * @return {string|anychart.elements.Title} Axis title.
 *//**
 * Setter for the title axis.
 * @param {(string|anychart.elements.Title)=} opt_value Value to set.
 * @return {!anychart.elements.Axis} {@link anychart.elements.Axis} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(string|anychart.elements.Title)=} opt_value Axis title.
 * @return {string|anychart.elements.Title|anychart.elements.Axis} Axis title or itself for method chaining.
 */
anychart.elements.Axis.prototype.title = function(opt_value) {
  if (!this.title_) {
    this.title_ = new anychart.elements.Title();
    this.title_.listenSignals(this.titleInvalidated_, this);
    this.registerDisposable(this.title_);
  }

  if (goog.isDef(opt_value)) {
    this.title_.suspendSignalsDispatching();
    if (goog.isString(opt_value)) {
      this.title_.text(opt_value);
    } else if (opt_value instanceof anychart.elements.Title) {
      this.title_.deserialize(opt_value.serialize());
    } else if (goog.isObject(opt_value)) {
      this.title_.deserialize(opt_value);
    } else if (anychart.utils.isNone(opt_value)) {
      this.title_.enabled(false);
    }
    this.title_.resumeSignalsDispatching(true);
    return this;
  }
  return this.title_;
};


/**
 * Internal title invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.elements.Axis.prototype.titleInvalidated_ = function(event) {
  var state = 0;
  var signal = 0;
  if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    state = this.ALL_VISUAL_STATES_;
    signal = anychart.Signal.BOUNDS_CHANGED | anychart.Signal.NEEDS_REDRAW;
  } else if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    state = anychart.ConsistencyState.TITLE;
    signal = anychart.Signal.NEEDS_REDRAW;
  }
  this.invalidate(state, signal);
};


/**
 * Getter for axis labels.
 * @return {anychart.elements.LabelsFactory} Axis labels of itself for method chaining.
 *//**
 * Setter for axis labels.
 * @param {anychart.elements.LabelsFactory=} opt_value Value to set.
 * @return {!anychart.elements.Axis} An instance of the {@link anychart.elements.Axis} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {anychart.elements.LabelsFactory=} opt_value Axis labels.
 * @return {anychart.elements.LabelsFactory|anychart.elements.Axis} Axis labels of itself for method chaining.
 */
anychart.elements.Axis.prototype.labels = function(opt_value) {
  if (!this.labels_) {
    this.labels_ = new anychart.elements.LabelsFactory();
    this.labels_.textFormatter(this.labelsTextFormatter_);
    this.labels_.positionFormatter(function(positionProvider) {
      return positionProvider;
    });
    this.labels_.listenSignals(this.labelsInvalidated_, this);
    this.registerDisposable(this.labels_);
  }

  if (goog.isDef(opt_value)) {
    if (opt_value instanceof anychart.elements.LabelsFactory) {
      this.labels_.deserialize(opt_value.serialize());
    } else if (goog.isObject(opt_value)) {
      this.labels_.deserialize(opt_value);
    } else if (anychart.utils.isNone(opt_value)) {
      this.labels_.enabled(false);
    }
    this.dropBoundsCache_();
    return this;
  }
  return this.labels_;
};


/**
 * Internal label invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.elements.Axis.prototype.labelsInvalidated_ = function(event) {
  var state = 0;
  var signal = 0;
  if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    state = this.ALL_VISUAL_STATES_;
    signal = anychart.Signal.BOUNDS_CHANGED | anychart.Signal.NEEDS_REDRAW;
  } else if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    state = anychart.ConsistencyState.LABELS;
    signal = anychart.Signal.NEEDS_REDRAW;
  }
  this.invalidate(state, signal);
};


/**
 * Getter for axis minor labels.
 * @return {anychart.elements.LabelsFactory} Axis labels.
 *//**
 * Setter for axis minor labels.
 * @param {anychart.elements.LabelsFactory=} opt_value Value to set.
 * @return {!anychart.elements.Axis} {@link anychart.elements.Axis} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {anychart.elements.LabelsFactory=} opt_value Axis labels.
 * @return {anychart.elements.LabelsFactory|anychart.elements.Axis} Axis labels of itself for method chaining.
 */
anychart.elements.Axis.prototype.minorLabels = function(opt_value) {
  if (!this.minorLabels_) {
    this.minorLabels_ = new anychart.elements.LabelsFactory();
    this.isHorizontal() ? this.minorLabels_.rotation(0) : this.minorLabels_.rotation(-90);
    this.minorLabels_.textFormatter(this.minorLabelsTextFormatter_);
    this.minorLabels_.positionFormatter(function(positionProvider) {
      return positionProvider;
    });
    this.minorLabels_.listenSignals(this.minorLabelsInvalidated_, this);
    this.registerDisposable(this.minorLabels_);
  }

  if (goog.isDef(opt_value)) {
    if (opt_value instanceof anychart.elements.LabelsFactory) {
      this.minorLabels_.deserialize(opt_value.serialize());
    } else if (goog.isObject(opt_value)) {
      this.minorLabels_.deserialize(opt_value);
    } else if (anychart.utils.isNone(opt_value)) {
      this.minorLabels_.enabled(false);
    }
    this.dropBoundsCache_();
    return this;
  }
  return this.minorLabels_;
};


/**
 * Internal minor label invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.elements.Axis.prototype.minorLabelsInvalidated_ = function(event) {
  var state = 0;
  var signal = 0;
  if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    state = this.ALL_VISUAL_STATES_;
    signal = anychart.Signal.BOUNDS_CHANGED | anychart.Signal.NEEDS_REDRAW;
  } else if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    state = anychart.ConsistencyState.MINOR_LABELS;
    signal = anychart.Signal.NEEDS_REDRAW;
  }
  this.invalidate(state, signal);
};


/**
 * Getter for axis ticks.
 * @return {anychart.elements.Ticks} Axis ticks.
 *//**
 * Setter for axis ticks.
 * @param {anychart.elements.Ticks=} opt_value Value to set.
 * @return {!anychart.elements.Axis} {@link anychart.elements.Axis} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {anychart.elements.Ticks=} opt_value Axis ticks.
 * @return {anychart.elements.Ticks|anychart.elements.Axis} Axis ticks or itself for method chaining.
 */
anychart.elements.Axis.prototype.ticks = function(opt_value) {
  if (!this.ticks_) {
    this.ticks_ = new anychart.elements.Ticks();
    this.ticks_.listen(anychart.Base.SIGNAL, this.ticksInvalidated_, false, this);
    this.registerDisposable(this.ticks_);
  }

  if (goog.isDef(opt_value)) {
    this.ticks_.suspendSignalsDispatching();
    if (opt_value instanceof anychart.elements.Ticks) {
      this.ticks_.deserialize(opt_value.serialize());
    } else if (goog.isObject(opt_value)) {
      this.ticks_.deserialize(opt_value);
    } else if (anychart.utils.isNone(opt_value)) {
      this.ticks_.enabled(false);
    }
    this.ticks_.resumeSignalsDispatching(true);
    this.invalidate(anychart.ConsistencyState.APPEARANCE |
        anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW);
    return this;
  }
  return this.ticks_;
};


/**
 * Internal ticks invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.elements.Axis.prototype.ticksInvalidated_ = function(event) {
  var state = 0;
  var signal = 0;
  if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    state = this.ALL_VISUAL_STATES_;
    signal = anychart.Signal.BOUNDS_CHANGED | anychart.Signal.NEEDS_REDRAW;
  } else if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    state = anychart.ConsistencyState.TICKS;
    signal = anychart.Signal.NEEDS_REDRAW;
  }
  this.invalidate(state, signal);
};


/**
 * Getter for minor axis ticks.
 * @return {anychart.elements.Ticks} Axis ticks.
 *//**
 * Setter for minor axis ticks.
 * @param {anychart.elements.Ticks=} opt_value Value to set.
 * @return {!anychart.elements.Axis} {@link anychart.elements.Axis} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {anychart.elements.Ticks=} opt_value Axis ticks.
 * @return {anychart.elements.Ticks|anychart.elements.Axis} Axis ticks or itself for method chaining.
 */
anychart.elements.Axis.prototype.minorTicks = function(opt_value) {
  if (!this.minorTicks_) {
    this.minorTicks_ = new anychart.elements.Ticks();
    this.minorTicks_.listen(anychart.Base.SIGNAL, this.minorTicksInvalidated_, false, this);
    this.registerDisposable(this.minorTicks_);
  }

  if (goog.isDef(opt_value)) {
    this.minorTicks_.suspendSignalsDispatching();
    if (opt_value instanceof anychart.elements.Ticks) {
      this.minorTicks_.deserialize(opt_value.serialize());
    } else if (goog.isObject(opt_value)) {
      this.minorTicks_.deserialize(opt_value);
    } else if (anychart.utils.isNone(opt_value)) {
      this.minorTicks_.enabled(false);
    }
    this.minorTicks_.resumeSignalsDispatching(true);
    return this;
  }
  return this.minorTicks_;
};


/**
 * Internal minor ticks invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.elements.Axis.prototype.minorTicksInvalidated_ = function(event) {
  var state = 0;
  var signal = 0;
  if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    state = this.ALL_VISUAL_STATES_;
    signal = anychart.Signal.BOUNDS_CHANGED | anychart.Signal.NEEDS_REDRAW;
  } else if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    state = anychart.ConsistencyState.MINOR_TICKS;
    signal = anychart.Signal.NEEDS_REDRAW;
  }
  this.invalidate(state, signal);
};


/**
 * Getter for axis line stroke.
 * @return {string|acgraph.vector.Stroke} Axis line stroke settings.
 *//**
 * Setter for axis line stroke.
 * @param {(string|acgraph.vector.Stroke)=} opt_value Value to set.
 * @return {!anychart.elements.Axis} {@link anychart.elements.Axis} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(string|acgraph.vector.Stroke)=} opt_value Stroke.
 * @return {string|acgraph.vector.Stroke|anychart.elements.Axis} Axis line stroke or itself for method chaining.
 */
anychart.elements.Axis.prototype.stroke = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.color.normalizeStroke(opt_value);
    if (this.stroke_ != opt_value) {
      var thicknessOld = goog.isObject(this.stroke_) ? this.stroke_['thickness'] || 1 : 1;
      var thicknessNew = goog.isObject(opt_value) ? opt_value['thickness'] || 1 : 1;
      this.stroke_ = opt_value;
      if (thicknessNew == thicknessOld)
        this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
      else
        this.invalidate(this.ALL_VISUAL_STATES_, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.stroke_;
  }
};


/**
 * Getter for axis orientation.
 * @return {string|anychart.utils.Orientation} Axis orientation.
 *//**
 * Setter for axis orientation.
 * @param {(string|anychart.utils.Orientation)=} opt_value Value to set.
 * @return {!anychart.elements.Axis} An instance of the {@link anychart.elements.Axis} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(string|anychart.utils.Orientation)=} opt_value Axis orientation.
 * @return {string|anychart.utils.Orientation|anychart.elements.Axis} Axis orientation oe itself for method chaining.
 */
anychart.elements.Axis.prototype.orientation = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var orientation = anychart.utils.normalizeOrientation(opt_value);
    if (this.orientation_ != orientation) {
      this.orientation_ = orientation;
      this.dropBoundsCache_();
      this.invalidate(this.ALL_VISUAL_STATES_, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.orientation_;
  }
};


/**
 * Getter for axis scale.
 * @return {anychart.scales.Base} Axis scale.
 *//**
 * Setter for axis scale.
 * @param {anychart.scales.Base=} opt_value Value to set.
 * @return {!anychart.elements.Axis} {@link anychart.elements.Axis} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {anychart.scales.Base=} opt_value Scale.
 * @return {anychart.scales.Base|anychart.elements.Axis} Axis scale or itself for method chaining.
 */
anychart.elements.Axis.prototype.scale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.scale_ != opt_value) {
      this.scale_ = opt_value;
      this.scale_.listenSignals(this.scaleInvalidated_, this);
    }
    return this;
  } else {
    return this.scale_;
  }
};


/**
 * Internal ticks invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.elements.Axis.prototype.scaleInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.dropBoundsCache_();
    this.invalidate(this.ALL_VISUAL_STATES_, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
  }
};


/**
 * Getter for axis X offset.
 * @return {number} Offset by X.
 *//**
 * Setter for axis X offset.
 * @param {number=} opt_value Value to set.
 * @return {!anychart.elements.Axis} {@link anychart.elements.Axis} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {number=} opt_value Value to set.
 * @return {number|anychart.elements.Axis} Offset or itself for method chaining.
 */
anychart.elements.Axis.prototype.offsetX = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.offsetX_ != opt_value) {
      this.offsetX_ = opt_value;
      this.dropBoundsCache_();
      this.invalidate(this.ALL_VISUAL_STATES_, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.offsetX_;
};


/**
 * Getter for axis Y offset.
 * @return {number} Offset by Y.
 *//**
 * Setter for axis Y offset.
 * @param {number=} opt_value Value to set.
 * @return {!anychart.elements.Axis} {@link anychart.elements.Axis} for method chaining.
 *//**
 * @ignoreDoc
 * @param {number=} opt_value Value to set.
 * @return {number|anychart.elements.Axis} Offset or itself for method chaining.
 */
anychart.elements.Axis.prototype.offsetY = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.offsetY_ != opt_value) {
      this.offsetY_ = opt_value;
      this.dropBoundsCache_();
      this.invalidate(this.ALL_VISUAL_STATES_, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.offsetY_;
};


/**
 * Getter for axis length.
 * @return {number} Axis length.
 *//**
 * Setter for axis length.<br/>
 * <b>Note:</b> width and height swap in case of horizontal axis.
 * @param {number=} opt_value Axis length.
 * @return {!anychart.elements.Axis} {@link anychart.elements.Axis} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {number=} opt_value Axis lenght.
 * @return {number|anychart.elements.Axis} Length or itself for method chaining.
 */
anychart.elements.Axis.prototype.length = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.length_ != opt_value) {
      this.length_ = Math.round(opt_value);
      this.dropBoundsCache_();
      this.invalidate(this.ALL_VISUAL_STATES_, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.length_;
};


/**
 * Getter for parentBounds.
 * @return {acgraph.math.Rect} Current parent bounds.
 *//**
 * Setter for parentBounds.
 * @param {acgraph.math.Rect=} opt_value Value to set.
 * @return {!anychart.elements.Axis} {@link anychart.elements.Axis} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {acgraph.math.Rect=} opt_value Bounds for marker.
 * @return {acgraph.math.Rect|anychart.elements.Axis} Bounds or this.
 */
anychart.elements.Axis.prototype.parentBounds = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.parentBounds_ != opt_value) {
      this.parentBounds_ = opt_value.clone();
      this.invalidate(this.ALL_VISUAL_STATES_, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.parentBounds_;
};


/**
 * Gets axis pixel bounds.
 * @return {anychart.utils.Bounds} Pixel bounds.
 * @private
 */
anychart.elements.Axis.prototype.getPixelBounds_ = function() {
  if (!this.pixelBounds_ || this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    var container = /** @type {acgraph.vector.ILayer} */(this.container());
    var stage = container ? container.getStage() : null;

    var parentBounds;
    if (this.parentBounds_) {
      parentBounds = this.parentBounds_;
    } else if (stage) {
      parentBounds = stage.getBounds();
    } else {
      parentBounds = null;
    }

    if (parentBounds) {
      var parentLength;

      parentBounds.top = Math.round(parentBounds.top);
      parentBounds.left = Math.round(parentBounds.left);
      parentBounds.width = Math.round(parentBounds.width);
      parentBounds.height = Math.round(parentBounds.height);

      if (this.orientation_ == anychart.utils.Orientation.TOP || this.orientation_ == anychart.utils.Orientation.BOTTOM) {
        parentLength = parentBounds.width;
      } else {
        parentLength = parentBounds.height;
      }
      var length = isNaN(this.length_) ? this.length_ = /** @type {number} */(parentLength) : this.length_;
      var size = this.getSize_(parentBounds, length);

      var x, y;

      var width, height;
      switch (this.orientation()) {
        case anychart.utils.Orientation.TOP:
          y = parentBounds.top + this.offsetY_;
          x = parentBounds.left + this.offsetX_;
          height = size;
          width = length;
          break;
        case anychart.utils.Orientation.RIGHT:
          y = parentBounds.top + this.offsetY_;
          x = parentBounds.left + (parentBounds.width - size) - this.offsetX_;
          width = size;
          height = length;
          break;
        case anychart.utils.Orientation.BOTTOM:
          y = parentBounds.top + (parentBounds.height - size) - this.offsetY_;
          x = parentBounds.left + this.offsetX_;
          height = size;
          width = length;
          break;
        case anychart.utils.Orientation.LEFT:
          y = parentBounds.top + this.offsetY_;
          x = parentBounds.left + this.offsetX_;
          width = size;
          height = length;
          break;
      }
      this.pixelBounds_ = new anychart.utils.Bounds(Math.round(x), Math.round(y), Math.round(width), Math.round(height));
    } else {
      this.pixelBounds_ = new anychart.utils.Bounds(0, 0, 0, 0);
    }
    this.dropBoundsCache_();
    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }
  return this.pixelBounds_;
};


/**
 * @private
 */
anychart.elements.Axis.prototype.dropBoundsCache_ = function() {
  this.labelsBounds_.length = 0;
  this.minorLabelsBounds_.length = 0;
  this.overlappedLabels_ = null;
};


/**
 * Returns an object with indexes of labels to draw.
 * @param {anychart.math.Rect=} opt_bounds Parent bounds.
 * @return {boolean|Object.<string, Array.<boolean>>} Object with indexes of labels to draw.
 * or Boolean when there are no labels.
 * @private
 */
anychart.elements.Axis.prototype.getOverlappedLabels_ = function(opt_bounds) {
  if (!this.overlappedLabels_ || this.hasInvalidationState(anychart.ConsistencyState.OVERLAP)) {
    if (this.overlapMode_ == anychart.elements.Axis.OverlapMode.NO_OVERLAP) {
      return false;
    } else if (this.overlapMode_ == anychart.elements.Axis.OverlapMode.OVERLAP) {
      var scale = /** @type {anychart.scales.ScatterBase|anychart.scales.Ordinal} */(this.scale());
      var labels = [];
      var minorLabels = [];

      if (scale) {
        var i, j;

        /**
         * Index of previous major label which is displayed.
         * @type {number}
         */
        var prevDrawableLabel = -1;
        /**
         * Index of the next label, which we should display and it doesn't overlap previous major label and the
         * very last if it is on.
         * @type {number}
         */
        var nextDrawableLabel = -1;
        /**
         * Index of previous minor label which is displayed.
         * @type {number}
         */
        var prevDrawableMinorLabel = -1;

        var scaleTicksArr = scale.ticks().get();
        var ticksArrLen = scaleTicksArr.length;
        var tickVal, ratio, bounds1, bounds2, bounds3, bounds4;
        var tempRatio;
        var k = -1;
        var isLabels = this.labels().enabled();

        if (scale instanceof anychart.scales.ScatterBase) {
          var scaleMinorTicksArr = scale.minorTicks().get();
          i = 0;
          j = 0;
          var minorTicksArrLen = scaleMinorTicksArr.length;
          var minorTickVal, minorRatio;
          var isMinorLabels = this.minorLabels().enabled();

          while (i < ticksArrLen || j < minorTicksArrLen) {
            tickVal = scaleTicksArr[i];
            minorTickVal = scaleMinorTicksArr[j];
            ratio = scale.transform(tickVal);
            minorRatio = scale.transform(minorTickVal);
            bounds1 = bounds2 = bounds3 = bounds4 = null;

            if (nextDrawableLabel == -1 && isLabels) {
              k = i;
              while (nextDrawableLabel == -1 && k < ticksArrLen) {
                bounds1 = this.getLabelBounds_(k, true, opt_bounds);

                if (prevDrawableLabel != -1)
                  bounds2 = this.getLabelBounds_(prevDrawableLabel, true, opt_bounds);

                if (k != ticksArrLen - 1 && this.drawLastLabel())
                  bounds3 = this.getLabelBounds_(ticksArrLen - 1, true, opt_bounds);

                if (!(this.checkLabelsIntersection_(bounds1, bounds2) ||
                    this.checkLabelsIntersection_(bounds1, bounds3))) {
                  tempRatio = scale.transform(scaleTicksArr[k]);
                  if ((tempRatio <= 0 && this.drawFirstLabel()) || (tempRatio >= 1 && this.drawLastLabel()))
                    nextDrawableLabel = k;
                  else if (tempRatio > 0 && tempRatio < 1)
                    nextDrawableLabel = k;
                }
                k++;
              }
            }

            if (((ratio <= minorRatio && i < ticksArrLen) || j == minorTicksArrLen)) {
              if (isLabels && i == nextDrawableLabel && this.labels().enabled()) {
                prevDrawableLabel = i;
                nextDrawableLabel = -1;
                labels.push(true);
              } else {
                labels.push(false);
              }
              i++;
              if (ratio == minorRatio && (this.labels().enabled() || this.ticks().enabled())) {
                minorLabels.push(false);
                j++;
              }
            } else {
              if (isMinorLabels) {
                bounds1 = this.getLabelBounds_(j, false, opt_bounds);

                if (prevDrawableLabel != -1)
                  bounds2 = this.getLabelBounds_(prevDrawableLabel, true, opt_bounds);

                if (nextDrawableLabel != -1)
                  bounds3 = this.getLabelBounds_(nextDrawableLabel, true, opt_bounds);

                if (prevDrawableMinorLabel != -1)
                  bounds4 = this.getLabelBounds_(prevDrawableMinorLabel, false, opt_bounds);

                var label = this.minorLabels().getLabel(j);
                var isLabelEnabled = label ?
                    goog.isDef(label.enabled()) ?
                        label.enabled() :
                        true :
                    true;

                if (!(this.checkLabelsIntersection_(bounds1, bounds2) ||
                    this.checkLabelsIntersection_(bounds1, bounds3) ||
                    this.checkLabelsIntersection_(bounds1, bounds4)) && isLabelEnabled) {

                  tempRatio = scale.transform(scaleMinorTicksArr[j]);
                  if ((tempRatio <= 0 && this.drawFirstLabel()) || (tempRatio >= 1 && this.drawLastLabel())) {
                    prevDrawableMinorLabel = j;
                    minorLabels.push(true);
                  } else if (tempRatio > 0 && tempRatio < 1) {
                    prevDrawableMinorLabel = j;
                    minorLabels.push(true);
                  } else {
                    minorLabels.push(false);
                  }

                } else {
                  minorLabels.push(false);
                }
              } else {
                minorLabels.push(false);
              }
              j++;
            }
          }
        } else if (scale instanceof anychart.scales.Ordinal) {
          for (i = 0; i < ticksArrLen; i++) {
            if (isLabels && this.labels().enabled()) {
              bounds1 = this.getLabelBounds_(i, true, opt_bounds);

              if (prevDrawableLabel != -1)
                bounds2 = this.getLabelBounds_(prevDrawableLabel, true, opt_bounds);

              if (!this.checkLabelsIntersection_(bounds1, bounds2)) {
                prevDrawableLabel = i;
                labels.push(true);
              } else {
                labels.push(false);
              }
            } else {
              labels.push(false);
            }
          }
        }
      }
      this.overlappedLabels_ = {labels: labels, minorLabels: minorLabels};
    }
    this.markConsistent(anychart.ConsistencyState.OVERLAP);
  }
  return this.overlappedLabels_;
};


/**
 * Calculates the size of an axis (for horizontal - height, for vertical - width)
 * @param {anychart.math.Rect} parentBounds Parent bounds.
 * @param {number} length Axis length.
 * @return {number} Size.
 * @private
 */
anychart.elements.Axis.prototype.getSize_ = function(parentBounds, length) {
  var bounds, size, i, delta;
  var maxLabelSize = 0;
  var maxMinorLabelSize = 0;
  var ticksLength = 0;
  var minorTicksLength = 0;
  var titleSize = 0;

  var title = this.title();
  var ticks = this.ticks();
  var minorTicks = this.minorTicks();
  var labels = this.labels();
  var minorLabels = this.minorLabels();

  var line = this.line_;
  line.stroke(this.stroke_);
  var lineThickness = line.stroke().thickness ? parseFloat(line.stroke().thickness) : 1;

  if (title.enabled()) {
    if (!title.container()) title.container(/** @type {acgraph.vector.ILayer} */(this.container()));
    title.suspendSignalsDispatching();
    title.parentBounds(parentBounds);
    title.orientation(this.orientation_);
    titleSize = this.isHorizontal() ? title.getContentBounds().height : title.getContentBounds().width;
    title.resumeSignalsDispatching(false);
  }

  if (ticks.enabled() && ticks.position() == anychart.elements.Ticks.Position.OUTSIDE) {
    ticksLength = ticks.length();
  }

  if (minorTicks.enabled() && minorTicks.position() == anychart.elements.Ticks.Position.OUTSIDE) {
    minorTicksLength = minorTicks.length();
  }

  var scale = /** @type {anychart.scales.ScatterBase|anychart.scales.Ordinal} */(this.scale());

  var isLabels = /** @type {boolean} */(labels.enabled() && goog.isDef(scale));
  var isMinorLabels = /** @type {boolean} */(minorLabels.enabled() && goog.isDef(scale) && scale instanceof anychart.scales.ScatterBase);

  var width = this.isHorizontal() ? length : 0;
  var height = this.isHorizontal() ? 0 : length;

  var tempBounds = new anychart.math.Rect(0, 0, width, height);
  var overlappedLabels = this.getOverlappedLabels_(tempBounds);
  var ticksArr, minorTicksArr;

  if (isLabels) {
    ticksArr = scale.ticks().get();
    var drawLabels = goog.isObject(overlappedLabels) ? overlappedLabels.labels : !overlappedLabels;
    for (i = 0; i < ticksArr.length; i++) {
      var drawLabel = goog.isArray(drawLabels) ? drawLabels[i] : drawLabels;
      if (drawLabel) {
        bounds = labels.measure(this.getLabelsFormatProvider_(i, ticksArr[i]), {x: 0, y: 0});
        size = this.isHorizontal() ?
            bounds.height - (bounds.top + bounds.height / 2) :
            bounds.width - (bounds.left + bounds.width / 2);
        if (size > maxLabelSize) maxLabelSize = size;
      }
    }
  }

  if (isMinorLabels) {
    minorTicksArr = scale.minorTicks().get();
    var drawMinorLabels = goog.isObject(overlappedLabels) ? overlappedLabels.minorLabels : !overlappedLabels;
    for (i = 0; i < drawMinorLabels.length; i++) {
      var drawMinorLabel = goog.isArray(drawMinorLabels) ? drawMinorLabels[i] : drawMinorLabels;
      if (drawMinorLabel) {
        bounds = minorLabels.measure(this.getLabelsFormatProvider_(i, minorTicksArr[i]), {x: 0, y: 0});
        size = this.isHorizontal() ?
            bounds.height - (bounds.top + bounds.height / 2) :
            bounds.width - (bounds.left + bounds.width / 2);
        if (size > maxMinorLabelSize) maxMinorLabelSize = size;
      }
    }
  }

  var minorSize = maxMinorLabelSize + minorTicksLength;
  var majorSize = maxLabelSize + ticksLength;

  var ticksAndLabelsSize = (minorSize > majorSize) ? minorSize : majorSize;
  delta = lineThickness + ticksAndLabelsSize + titleSize;
  return /** @type {number} */(delta);
};


/**
 * Returns remaining parent bounds to use elsewhere.
 * @return {anychart.math.Rect} Parent bounds without the space used by the title.
 */
anychart.elements.Axis.prototype.getRemainingBounds = function() {
  var parentBounds;
  if (this.parentBounds_) {
    parentBounds = this.parentBounds_;
  } else {
    var container = /** @type {acgraph.vector.ILayer} */(this.container());
    var stage = container ? container.getStage() : null;
    if (stage) {
      parentBounds = /** @type {anychart.math.Rect} */(stage.getBounds());
    } else {
      parentBounds = null;
    }
  }

  if (parentBounds) {
    var remainingBounds = parentBounds.clone();
    var axisBounds = this.getPixelBounds_();

    switch (this.orientation()) {
      case anychart.utils.Orientation.TOP:
        remainingBounds.height -= axisBounds.height();
        remainingBounds.top += axisBounds.height() + this.offsetY();
        break;
      case anychart.utils.Orientation.RIGHT:
        remainingBounds.width -= axisBounds.width() + this.offsetX();
        break;
      case anychart.utils.Orientation.BOTTOM:
        remainingBounds.height -= axisBounds.height() + this.offsetY();
        break;
      case anychart.utils.Orientation.LEFT:
        remainingBounds.width -= axisBounds.width();
        remainingBounds.left += axisBounds.width() + this.offsetX();
        break;
    }

    return remainingBounds;
  } else return new anychart.math.Rect(0, 0, 0, 0);
};


/**
 * Returns half-pixel shift direction. In order to make the display of elements sharp
 * we use half-pixel shift, when element size/position doesn't calculate into integer number of pixels.
 * For example, line of 1px width can occupy two pixels (half of one, and half of another) - it will not look sharp.
 * But we can move this line 0.5px to left or rigth, it will occupy 1 whole pixel and look sharp.
 * In case of moving ticks: if all ticks are moved in one direction - the last tick will be visible off,
 * we avoid this by moving half of the pixels to left, and another half - to right.
 * This function gives us a sign that defines the shift direction.
 * @param {number} index Element index.
 * @param {number} count Number of elements.
 * @param {number} value Shift value.
 * @return {number} Transformed shift value.
 * @private
 */
anychart.elements.Axis.prototype.getPixelShift_ = function(index, count, value) {
  return (index < count / 2) ? value : -value;
};


/**
 * Calculate label bounds.
 * @param {number} index Label index.
 * @param {boolean} isMajor Major labels or minor.
 * @param {anychart.math.Rect=} opt_parentBounds Parent bounds.
 * @return {Array.<number>} Label bounds.
 * @private
 */
anychart.elements.Axis.prototype.getLabelBounds_ = function(index, isMajor, opt_parentBounds) {
  if (!isMajor && this.scale() && !(this.scale() instanceof anychart.scales.ScatterBase))
    return null;

  var boundsCache = isMajor ? this.labelsBounds_ : this.minorLabelsBounds_;
  if (goog.isDef(boundsCache[index]))
    return boundsCache[index];

  var bounds = goog.isDef(opt_parentBounds) ? opt_parentBounds : this.getPixelBounds_().toRect();
  var lineBounds = goog.isDef(opt_parentBounds) ? opt_parentBounds : this.line_.getBounds();
  var ticks = isMajor ? this.ticks() : this.minorTicks();
  var ticksLength = ticks.length();
  var lineThickness = this.line_.stroke().thickness ? this.line_.stroke().thickness : 1;
  var labels = isMajor ? this.labels() : this.minorLabels();

  var x, y;
  var scale = /** @type {anychart.scales.ScatterBase|anychart.scales.Ordinal} */(this.scale());
  var scaleTicks = isMajor ? scale.ticks() : scale.minorTicks();

  var value = scaleTicks.get()[index];
  var ratio;
  if (goog.isArray(value)) {
    ratio = (scale.transform(value[0], 0) + scale.transform(value[1], 1)) / 2;
    value = value[0];
  } else {
    ratio = scale.transform(value, .5);
  }

  var formatProvider = this.getLabelsFormatProvider_(index, value);
  var positionProvider = {x: 0, y: 0};
  var labelBounds = labels.measure(formatProvider, positionProvider);

  var isEnabled = ticks.enabled();
  var position = ticks.position();

  switch (this.orientation_) {
    case anychart.utils.Orientation.TOP:
      x = Math.round(bounds.left + ratio * bounds.width);
      y = lineBounds.top - lineThickness / 2 - labelBounds.height / 2;
      if (position == anychart.elements.Ticks.Position.OUTSIDE && isEnabled) {
        y -= ticksLength;
      }
      break;
    case anychart.utils.Orientation.RIGHT:
      x = lineBounds.left + lineThickness / 2 + labelBounds.width / 2;
      y = Math.round(bounds.top + ratio * bounds.height);

      if (position == anychart.elements.Ticks.Position.OUTSIDE && isEnabled) {
        x += ticksLength;
      }
      break;
    case anychart.utils.Orientation.BOTTOM:
      x = Math.round(bounds.left + ratio * bounds.width);
      y = lineBounds.top + lineThickness / 2 + labelBounds.height / 2;

      if (position == anychart.elements.Ticks.Position.OUTSIDE && isEnabled) {
        y += ticksLength;
      }
      break;
    case anychart.utils.Orientation.LEFT:
      x = lineBounds.left - lineThickness / 2 - labelBounds.width / 2;
      y = Math.round(bounds.top + ratio * bounds.height);

      if (position == anychart.elements.Ticks.Position.OUTSIDE && isEnabled) {
        x -= ticksLength;
      }
      break;
  }
  positionProvider.x = x;
  positionProvider.y = y;

  return boundsCache[index] = labels.measureWithTransform(formatProvider, positionProvider);
};


/**
 * Cheking labels intersection. Label is a rectangle described by an array of its vertices.
 * We consider that two labels do not intersect, if we find a side of any of two labels
 * relative to which all vertices of another label lie towards the same direction or lie on this side.
 * @param {Array.<number>=} opt_first First label.
 * @param {Array.<number>=} opt_second Second label.
 * @return {boolean} Returns true if labels intersect, false
 * if labels do not intersect.
 * @private
 */
anychart.elements.Axis.prototype.checkLabelsIntersection_ = function(opt_first, opt_second) {
  var result = false, k, k1, i, len;
  if (!opt_first || !opt_second) return false;
  for (i = 0, len = opt_first.length; i < len - 1; i = i + 2) {
    k = i == len - 2 ? 0 : i + 2;
    k1 = i == len - 2 ? 1 : i + 3;
    result = result || this.checkPoints_(opt_first[i], opt_first[i + 1], opt_first[k], opt_first[k1], opt_second);
  }
  for (i = 0, len = opt_second.length; i < len - 1; i = i + 2) {
    k = i == len - 2 ? 0 : i + 2;
    k1 = i == len - 2 ? 1 : i + 3;
    result = result || this.checkPoints_(opt_second[i], opt_second[i + 1], opt_second[k], opt_second[k1], opt_first);
  }
  return !result;
};


/**
 * Check an array of points position in relation to
 * a line defined by two points.
 * @param {number} p1x X coordinate of the first point.
 * @param {number} p1y Y coordinate of the first point.
 * @param {number} p2x X coordinate of the second point.
 * @param {number} p2y Y coordinate of the second point.
 * @param {Array.<number>} pointsArr Array of points to check against the line
 * defined by two points.
 * @return {boolean} If all points from an array lie on the line or lie towards the same direction,
 * returns true, returns false otherwise.
 * @private
 */
anychart.elements.Axis.prototype.checkPoints_ = function(p1x, p1y, p2x, p2y, pointsArr) {
  var ok = true;
  for (var j = 0, len = pointsArr.length; j < len - 1; j = j + 2) {
    ok = ok && this.isPointOnLine_(p1x, p1y, p2x, p2y, pointsArr[j], pointsArr[j + 1]) <= 0;
  }
  return ok;
};


/**
 * Check a point position against a line defined by two points.
 * @param {number} p1x X coordinate of the first point.
 * @param {number} p1y Y coordinate of the first point.
 * @param {number} p2x X coordinate of the second point.
 * @param {number} p2y Y coordinate of the second point.
 * @param {number} p3x X coordinate of a point to check.
 * @param {number} p3y X coordinate of a point to check.
 * @return {number} Returns 0 if a point lies on a line, in other cases a sign of a number
 * defines a direction.
 * @private
 */
anychart.elements.Axis.prototype.isPointOnLine_ = function(p1x, p1y, p2x, p2y, p3x, p3y) {
  var result = (p1y - p2y) * p3x + (p2x - p1x) * p3y + (p1x * p2y - p2x * p1y);
  return result == 0 ? 0 : result > 0 ? 1 : -1;
};


/**
 * Getter for the first label drawing flag.
 * @return {boolean} Drawing flag.
 *//**
 * Setter for the first label drawing flag.
 * @param {boolean=} opt_value [true] Value to set.
 * @return {!anychart.elements.Axis} {@link anychart.elements.Axis} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {boolean=} opt_value Drawing flag.
 * @return {boolean|anychart.elements.Axis} Drawing flag or itself for method chaining.
 */
anychart.elements.Axis.prototype.drawFirstLabel = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.drawFirstLabel_ != opt_value) {
      this.drawFirstLabel_ = opt_value;
      var state = anychart.ConsistencyState.ALL &
          ~anychart.VisualBase.prototype.SUPPORTED_CONSISTENCY_STATES;
      this.invalidate(state, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.drawFirstLabel_;
};


/**
 * Getter for the last label drawing flag.
 * @return {boolean} Drawing flag.
 *//**
 * Setter for the last label drawing flag.
 * @param {boolean=} opt_value [true] Value to set.
 * @return {!anychart.elements.Axis} {@link anychart.elements.Axis} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {boolean=} opt_value Drawing flag.
 * @return {boolean|anychart.elements.Axis} Drawing flag or itself for method chaining.
 */
anychart.elements.Axis.prototype.drawLastLabel = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.drawLastLabel_ != opt_value) {
      this.drawLastLabel_ = opt_value;
      var state = anychart.ConsistencyState.ALL &
          ~anychart.VisualBase.prototype.SUPPORTED_CONSISTENCY_STATES;
      this.invalidate(state, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.drawLastLabel_;
};


/**
 * Getter for overlap mode for labels.
 * @return {anychart.elements.Axis.OverlapMode|string} OverlapMode flag.
 *//**
 * Setter for overlap mode for labels.
 * @param {(anychart.elements.Axis.OverlapMode|string)=} opt_value [true] Value to set.
 * @return {!anychart.elements.Axis} {@link anychart.elements.Axis} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(anychart.elements.Axis.OverlapMode|string)=} opt_value Value to set.
 * @return {anychart.elements.Axis.OverlapMode|string|anychart.elements.Axis} Drawing flag or itself for method chaining.
 */
anychart.elements.Axis.prototype.overlapMode = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var overlap = opt_value.toLowerCase();
    if (this.overlapMode_ != overlap) {
      this.overlapMode_ = overlap;
      var state = anychart.ConsistencyState.ALL &
          ~anychart.VisualBase.prototype.SUPPORTED_CONSISTENCY_STATES;
      this.invalidate(state, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.overlapMode_;
};


/**
 * Whether an axis is horizontal.
 * @return {boolean} If the axis is horizontal.
 */
anychart.elements.Axis.prototype.isHorizontal = function() {
  return this.orientation_ == anychart.utils.Orientation.TOP ||
      this.orientation_ == anychart.utils.Orientation.BOTTOM;
};


/**
 * Axis line drawer for top orientation.
 * @param {number} pixelShift Pixel shift for sharp display.
 * @private
 */
anychart.elements.Axis.prototype.drawTopLine_ = function(pixelShift) {
  var bounds = this.getPixelBounds_().toRect();
  var y = bounds.top + bounds.height + pixelShift;
  this.line_
      .moveTo(bounds.left + pixelShift, y)
      .lineTo(bounds.left - pixelShift + bounds.width, y);
};


/**
 * Axis line drawer for right orientation.
 * @param {number} pixelShift Pixel shift for sharp display..
 * @private
 */
anychart.elements.Axis.prototype.drawRightLine_ = function(pixelShift) {
  var bounds = this.getPixelBounds_().toRect();
  var x = bounds.left - pixelShift;
  this.line_
      .moveTo(x, bounds.top + pixelShift)
      .lineTo(x, bounds.top - pixelShift + bounds.height);
};


/**
 * Axis line drawer for bottom orientation.
 * @param {number} pixelShift Pixel shift for sharp display.
 * @private
 */
anychart.elements.Axis.prototype.drawBottomLine_ = function(pixelShift) {
  var bounds = this.getPixelBounds_().toRect();
  var y = bounds.top + pixelShift;
  this.line_
      .moveTo(bounds.left + pixelShift, y - 1)
      .lineTo(bounds.left - pixelShift + bounds.width, y - 1);
};


/**
 * Axis line drawer for left orientation.
 * @param {number} pixelShift Pixel shift for sharp display.
 * @private
 */
anychart.elements.Axis.prototype.drawLeftLine_ = function(pixelShift) {
  var bounds = this.getPixelBounds_().toRect();
  var x = bounds.left + bounds.width + pixelShift;
  this.line_
      .moveTo(x, bounds.top + pixelShift)
      .lineTo(x, bounds.top - pixelShift + bounds.height);
};


/**
 * Gets format provider for label.
 * @param {number} index Label index.
 * @param {string|number} value Label value.
 * @return {Object} Labels format provider.
 * @private
 */
anychart.elements.Axis.prototype.getLabelsFormatProvider_ = function(index, value) {
  var axisName = this.name();
  var scale = this.scale();

  var labelText, labelValue;
  if (scale instanceof anychart.scales.Linear) {
    labelText = parseFloat(value);
    labelValue = parseFloat(value);
  } else if (scale instanceof anychart.scales.Ordinal) {
    labelText = scale.ticks().names()[index];
    labelValue = value;
  } else if (scale instanceof anychart.scales.DateTime) {
    var date = new Date(value);
    var mm = date.getMonth() + 1;
    var dd = date.getDate();
    var yy = date.getFullYear();

    mm = mm < 10 ? '0' + mm : '' + mm;
    dd = dd < 10 ? '0' + dd : '' + dd;

    labelText = mm + '-' + dd;
    labelValue = value;
  }

  return {
    'index': index,
    'value': labelValue,
    'defaultText': labelText,
    'name': axisName,
    'max': scale.max ? scale.max : null,
    'min': scale.min ? scale.min : null,
    'scale': scale
    //TODO as soon as it becomes possible:
    //sum -- the sum data values from series bound to this axis (depends on orientation)
    //average -- the sum divided by the number of points
    //median -- axis median
    //mode -- axis mode
  };
};


/**
 * Axis labels drawer for top orientation.
 * @param {number|string} value Scale ratio.
 * @param {number} ratio Scale ratio.
 * @param {number} index Scale label index.
 * @param {number} pixelShift Pixel shift for sharp display.
 * @private
 */
anychart.elements.Axis.prototype.drawTopLabels_ = function(value, ratio, index, pixelShift) {
  var bounds = this.getPixelBounds_();
  var lineBounds = this.line_.getBounds();
  var ticksLength = this.ticks().length();
  var lineThickness = this.line_.stroke().thickness ? this.line_.stroke().thickness : 1;
  var labels = this.labels();
  var formatProvider = this.getLabelsFormatProvider_(index, value);
  var positionProvider = {x: 0, y: 0};
  var labelBounds = labels.measure(formatProvider, positionProvider);

  var x = Math.round(bounds.left() + ratio * bounds.width()) + pixelShift;
  var y = lineBounds.top - lineThickness / 2 - labelBounds.height / 2;

  if (this.ticks_.position() == anychart.elements.Ticks.Position.OUTSIDE && this.ticks().enabled()) {
    y -= ticksLength;
  }

  positionProvider.x = x;
  positionProvider.y = y;

  labels.add(formatProvider, positionProvider);
};


/**
 * Axis labels drawer for right orientation.
 * @param {number|string} value Scale ratio.
 * @param {number} ratio Scale ratio.
 * @param {number} index Scale label index.
 * @param {number} pixelShift Pixel shift for sharp display.
 * @private
 */
anychart.elements.Axis.prototype.drawRightLabels_ = function(value, ratio, index, pixelShift) {
  var bounds = this.getPixelBounds_();
  var lineBounds = this.line_.getBounds();
  var ticksLength = this.ticks().length();
  var lineThickness = this.line_.stroke().thickness ? this.line_.stroke().thickness : 1;
  var labels = this.labels();
  var formatProvider = this.getLabelsFormatProvider_(index, value);
  var positionProvider = {x: 0, y: 0};
  var labelBounds = labels.measure(formatProvider, positionProvider);

  var x = lineBounds.left + lineThickness / 2 + labelBounds.width / 2;
  var y = Math.round(bounds.top() + bounds.height() - ratio * bounds.height()) + pixelShift;

  if (this.ticks_.position() == anychart.elements.Ticks.Position.OUTSIDE && this.ticks().enabled()) {
    x += ticksLength;
  }

  positionProvider.x = x;
  positionProvider.y = y;
  labels.add(formatProvider, positionProvider);
};


/**
 * Axis labels drawer for bottom orientation.
 * @param {number|string} value Scale ratio.
 * @param {number} ratio Scale ratio.
 * @param {number} index Scale label index.
 * @param {number} pixelShift Pixel shift for sharp display.
 * @private
 */
anychart.elements.Axis.prototype.drawBottomLabels_ = function(value, ratio, index, pixelShift) {
  var bounds = this.getPixelBounds_();
  var lineBounds = this.line_.getBounds();
  var ticksLength = this.ticks().length();
  var lineThickness = this.line_.stroke().thickness ? this.line_.stroke().thickness : 1;
  var labels = this.labels();
  var formatProvider = this.getLabelsFormatProvider_(index, value);
  var positionProvider = {x: 0, y: 0};
  var labelBounds = labels.measure(formatProvider, positionProvider);

  var x = Math.round(bounds.left() + ratio * bounds.width()) + pixelShift;
  var y = lineBounds.top + lineThickness / 2 + labelBounds.height / 2;

  if (this.ticks_.position() == anychart.elements.Ticks.Position.OUTSIDE && this.ticks().enabled()) {
    y += ticksLength;
  }

  positionProvider.x = x;
  positionProvider.y = y;
  labels.add(formatProvider, positionProvider);
};


/**
 * Axis labels drawer for left orientation.
 * @param {number|string} value Scale ratio.
 * @param {number} ratio Scale ratio.
 * @param {number} index Scale label index.
 * @param {number} pixelShift Pixel shift for sharp display.
 * @private
 */
anychart.elements.Axis.prototype.drawLeftLabels_ = function(value, ratio, index, pixelShift) {
  var bounds = this.getPixelBounds_();
  var lineBounds = this.line_.getBounds();
  var ticksLength = this.ticks().length();
  var lineThickness = this.line_.stroke().thickness ? this.line_.stroke().thickness : 1;
  var labels = this.labels();
  var formatProvider = this.getLabelsFormatProvider_(index, value);
  var positionProvider = {x: 0, y: 0};
  var labelBounds = labels.measure(formatProvider, positionProvider);

  var x = lineBounds.left - lineThickness / 2 - labelBounds.width / 2;
  var y = Math.round(bounds.top() + bounds.height() - ratio * bounds.height()) + pixelShift;

  if (this.ticks_.position() == anychart.elements.Ticks.Position.OUTSIDE && this.ticks().enabled()) {
    x -= ticksLength;
  }

  positionProvider.x = x;
  positionProvider.y = y;
  labels.add(formatProvider, positionProvider);
};


/**
 * Axis minor labels drawer for top orientation.
 * @param {number|string} value Scale ratio.
 * @param {number} ratio Scale ratio.
 * @param {number} index Scale label index.
 * @param {number} pixelShift Pixel shift for sharp display.
 * @private
 */
anychart.elements.Axis.prototype.drawTopMinorLabels_ = function(value, ratio, index, pixelShift) {
  var bounds = this.getPixelBounds_();
  var lineBounds = this.line_.getBounds();
  var ticksLength = this.minorTicks().length();
  var lineThickness = this.line_.stroke().thickness ? this.line_.stroke().thickness : 1;
  var minorLabels = this.minorLabels();
  var formatProvider = this.getLabelsFormatProvider_(index, value);
  var positionProvider = {x: 0, y: 0};
  var labelBounds = minorLabels.measure(formatProvider, positionProvider);

  var x = Math.round(bounds.left() + ratio * bounds.width()) + pixelShift;
  var y = lineBounds.top - lineThickness / 2 - labelBounds.height / 2;

  if (this.minorTicks().position() == anychart.elements.Ticks.Position.OUTSIDE && this.minorTicks().enabled()) {
    y -= ticksLength;
  }

  positionProvider.x = x;
  positionProvider.y = y;
  minorLabels.add(formatProvider, positionProvider);
};


/**
 * Axis minor labels drawer for right orientation.
 * @param {number|string} value Scale ratio.
 * @param {number} ratio Scale ratio.
 * @param {number} index Scale label index.
 * @param {number} pixelShift Pixel shift for sharp display.
 * @private
 */
anychart.elements.Axis.prototype.drawRightMinorLabels_ = function(value, ratio, index, pixelShift) {
  var bounds = this.getPixelBounds_();
  var lineBounds = this.line_.getBounds();
  var ticksLength = this.minorTicks_.length();
  var lineThickness = this.line_.stroke().thickness ? this.line_.stroke().thickness : 1;
  var minorLabels = this.minorLabels();
  var formatProvider = this.getLabelsFormatProvider_(index, value);
  var positionProvider = {x: 0, y: 0};
  var labelBounds = minorLabels.measure(formatProvider, positionProvider);

  var x = lineBounds.left + lineThickness / 2 + labelBounds.width / 2;
  var y = Math.round(bounds.top() + bounds.height() - ratio * bounds.height()) + pixelShift;

  if (this.minorTicks().position() == anychart.elements.Ticks.Position.OUTSIDE && this.minorTicks().enabled()) {
    x += ticksLength;
  }
  positionProvider.x = x;
  positionProvider.y = y;
  minorLabels.add(formatProvider, positionProvider);
};


/**
 * Axis minor labels drawer for bottom orientation.
 * @param {number|string} value Scale ratio.
 * @param {number} ratio Scale ratio.
 * @param {number} index Scale label index.
 * @param {number} pixelShift Pixel shift for sharp display.
 * @private
 */
anychart.elements.Axis.prototype.drawBottomMinorLabels_ = function(value, ratio, index, pixelShift) {
  var bounds = this.getPixelBounds_();
  var lineBounds = this.line_.getBounds();
  var ticksLength = this.minorTicks_.length();
  var lineThickness = this.line_.stroke().thickness ? this.line_.stroke().thickness : 1;
  var minorLabels = this.minorLabels();
  var formatProvider = this.getLabelsFormatProvider_(index, value);
  var positionProvider = {x: 0, y: 0};
  var labelBounds = minorLabels.measure(formatProvider, positionProvider);

  var x = Math.round(bounds.left() + ratio * bounds.width()) + pixelShift;
  var y = lineBounds.top + lineThickness / 2 + labelBounds.height / 2;

  if (this.minorTicks().position() == anychart.elements.Ticks.Position.OUTSIDE && this.minorTicks().enabled()) {
    y += ticksLength;
  }
  positionProvider.x = x;
  positionProvider.y = y;
  minorLabels.add(formatProvider, positionProvider);
};


/**
 * Axis minor labels drawer for left orientation.
 * @param {number|string} value Scale ratio.
 * @param {number} ratio Scale ratio.
 * @param {number} index Scale label index.
 * @param {number} pixelShift Pixel shift for sharp display.
 * @private
 */
anychart.elements.Axis.prototype.drawLeftMinorLabels_ = function(value, ratio, index, pixelShift) {
  var bounds = this.getPixelBounds_();
  var lineBounds = this.line_.getBounds();
  var ticksLength = this.minorTicks_.length();
  var lineThickness = this.line_.stroke().thickness ? this.line_.stroke().thickness : 1;
  var minorLabels = this.minorLabels();
  var formatProvider = this.getLabelsFormatProvider_(index, value);
  var positionProvider = {x: 0, y: 0};
  var labelBounds = minorLabels.measure(formatProvider, positionProvider);

  var x = lineBounds.left - lineThickness / 2 - labelBounds.width / 2;
  var y = Math.round(bounds.top() + bounds.height() - ratio * bounds.height()) + pixelShift;

  if (this.minorTicks().position() == anychart.elements.Ticks.Position.OUTSIDE && this.minorTicks().enabled()) {
    x -= ticksLength;
  }
  positionProvider.x = x;
  positionProvider.y = y;
  minorLabels.add(formatProvider, positionProvider);
};


/** @inheritDoc */
anychart.elements.Axis.prototype.checkDrawingNeeded = function() {
  if (this.isConsistent())
    return false;

  if (!this.enabled()) {
    if (this.hasInvalidationState(anychart.ConsistencyState.ENABLED)) {
      this.remove();
      this.markConsistent(anychart.ConsistencyState.ENABLED);
      this.title().invalidate(anychart.ConsistencyState.CONTAINER);
      this.ticks().invalidate(anychart.ConsistencyState.CONTAINER);
      this.minorTicks().invalidate(anychart.ConsistencyState.CONTAINER);
      this.labels().invalidate(anychart.ConsistencyState.CONTAINER);
      this.minorLabels().invalidate(anychart.ConsistencyState.CONTAINER);
      this.invalidate(
          anychart.ConsistencyState.CONTAINER |
          anychart.ConsistencyState.TITLE |
          anychart.ConsistencyState.TICKS |
          anychart.ConsistencyState.MINOR_TICKS |
          anychart.ConsistencyState.LABELS |
          anychart.ConsistencyState.MINOR_LABELS
      );
    }
    return false;
  }
  this.markConsistent(anychart.ConsistencyState.ENABLED);
  return true;
};


/**
 * Axis drawing.
 */
anychart.elements.Axis.prototype.draw = function() {
  if (!this.checkDrawingNeeded())
    return;

  var orientation, lineDrawer, ticksDrawer, labelsDrawer, minorTicksDrawer, minorLabelsDrawer;
  var minorTicks, ticks;
  var lineThickness;

  switch (this.orientation_) {
    case anychart.utils.Orientation.TOP:
      orientation = [this.drawTopLine_, this.drawTopLabels_, this.drawTopMinorLabels_];
      break;
    case anychart.utils.Orientation.RIGHT:
      orientation = [this.drawRightLine_, this.drawRightLabels_, this.drawRightMinorLabels_];
      break;
    case anychart.utils.Orientation.BOTTOM:
      orientation = [this.drawBottomLine_, this.drawBottomLabels_, this.drawBottomMinorLabels_];
      break;
    case anychart.utils.Orientation.LEFT:
      orientation = [this.drawLeftLine_, this.drawLeftLabels_, this.drawLeftMinorLabels_];
      break;
  }

  this.title().suspendSignalsDispatching();
  this.labels().suspendSignalsDispatching();
  this.minorLabels().suspendSignalsDispatching();
  this.ticks().suspendSignalsDispatching();
  this.minorTicks().suspendSignalsDispatching();

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    if (!this.line_) {
      this.line_ = acgraph.path();
      this.registerDisposable(this.line_);
    }
    this.line_.clear();
    this.line_.stroke(this.stroke_);

    lineThickness = this.line_.stroke().thickness ? parseFloat(this.line_.stroke().thickness) : 1;
    var pixelShift = lineThickness % 2 == 0 ? 0 : 0.5;

    lineDrawer = orientation[0];
    lineDrawer.call(this, pixelShift);

    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    var zIndex = /** @type {number} */(this.zIndex());
    this.title().zIndex(zIndex);
    this.line_.zIndex(zIndex);
    this.ticks().zIndex(zIndex);
    this.minorTicks().zIndex(zIndex);
    this.labels().zIndex(zIndex);
    this.minorLabels().zIndex(zIndex);
    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    var container = /** @type {acgraph.vector.ILayer} */(this.container());
    this.title().container(container);
    this.line_.parent(container);
    this.ticks().container(container);
    this.minorTicks().container(container);

    this.labels().container(container);
    this.minorLabels().container(container);
    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.TITLE)) {
    var title = this.title();
    title.parentBounds(this.getPixelBounds_().toRect());
    title.orientation(this.orientation_);
    title.draw();
    this.markConsistent(anychart.ConsistencyState.TITLE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.TICKS)) {
    ticks = this.ticks();
    ticks.orientation(/** @type {anychart.utils.Orientation} */ (this.orientation()));
    ticks.draw();
    ticksDrawer = ticks.getTicksDrawer();
    this.markConsistent(anychart.ConsistencyState.TICKS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.MINOR_TICKS)) {
    minorTicks = this.minorTicks();
    minorTicks.orientation(/** @type {anychart.utils.Orientation} */ (this.orientation()));
    minorTicks.draw();
    minorTicksDrawer = minorTicks.getTicksDrawer();
    this.markConsistent(anychart.ConsistencyState.MINOR_TICKS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.LABELS)) {
    var labels = this.labels();
    if (!labels.container()) labels.container(/** @type {acgraph.vector.ILayer} */(this.container()));
    labels.parentBounds(this.parentBounds_);
    labelsDrawer = orientation[1];
    labels.clear();
    this.markConsistent(anychart.ConsistencyState.LABELS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.MINOR_LABELS)) {
    var minorLabels = this.minorLabels();
    if (!minorLabels.container()) minorLabels.container(/** @type {acgraph.vector.ILayer} */(this.container()));
    minorLabels.parentBounds(this.parentBounds_);
    minorLabelsDrawer = orientation[2];
    minorLabels.clear();
    this.markConsistent(anychart.ConsistencyState.MINOR_LABELS);
  }

  if (goog.isDef(ticksDrawer) || goog.isDef(minorTicksDrawer) || goog.isDef(labelsDrawer) || goog.isDef(minorLabelsDrawer)) {
    var scale = /** @type {anychart.scales.ScatterBase|anychart.scales.Ordinal} */(this.scale());
    if (scale && this.container()) {
      var i, j, overlappedLabels, needDrawLabels, needDrawMinorLabels;

      var scaleTicksArr = scale.ticks().get();
      var ticksArrLen = scaleTicksArr.length;
      var tickThickness = this.ticks_.stroke().thickness ? parseFloat(this.ticks_.stroke().thickness) : 1;
      var tickVal, ratio, drawLabel;
      var pixelBounds = this.getPixelBounds_();
      var lineBounds = this.line_.getBounds();
      lineThickness = this.line_.stroke().thickness ? parseFloat(this.line_.stroke().thickness) : 1;

      if (scale instanceof anychart.scales.ScatterBase) {
        overlappedLabels = this.getOverlappedLabels_();

        if (goog.isObject(overlappedLabels)) {
          needDrawLabels = overlappedLabels.labels;
          needDrawMinorLabels = overlappedLabels.minorLabels;
        } else {
          needDrawLabels = !overlappedLabels;
          needDrawMinorLabels = !overlappedLabels;
        }

        var scaleMinorTicksArr = scale.minorTicks().get();
        var minorTickThickness = this.minorTicks_.stroke().thickness ? parseFloat(this.minorTicks_.stroke().thickness) : 1;

        i = 0;
        j = 0;
        var minorTicksArrLen = scaleMinorTicksArr.length;
        var minorTickVal, minorRatio;

        while (i < ticksArrLen || j < minorTicksArrLen) {
          tickVal = scaleTicksArr[i];
          minorTickVal = scaleMinorTicksArr[j];
          ratio = scale.transform(tickVal);
          minorRatio = scale.transform(minorTickVal);

          if (((ratio <= minorRatio && i < ticksArrLen) || j == minorTicksArrLen)) {
            var majorPixelShift = tickThickness % 2 == 0 ? 0 : -.5;
            if (ticksDrawer)
              ticksDrawer.call(
                  ticks,
                  ratio,
                  pixelBounds,
                  lineBounds,
                  lineThickness,
                  majorPixelShift);

            drawLabel = goog.isArray(needDrawLabels) ? needDrawLabels[i] : needDrawLabels;
            if (labelsDrawer && drawLabel)
              labelsDrawer.call(this, tickVal, scale.transform(tickVal, .5), i, majorPixelShift);
            i++;
          } else {
            var minorPixelShift = minorTickThickness % 2 == 0 ? 0 : -.5;
            if (minorTicksDrawer && ratio != minorRatio)
              ticksDrawer.call(
                  minorTicks,
                  minorRatio,
                  pixelBounds,
                  lineBounds,
                  lineThickness,
                  minorPixelShift);

            drawLabel = goog.isArray(needDrawMinorLabels) ? needDrawMinorLabels[j] : needDrawMinorLabels;
            if (minorLabelsDrawer && drawLabel)
              minorLabelsDrawer.call(this, minorTickVal, scale.transform(minorTickVal, .5), j, minorPixelShift);
            j++;
          }
        }
        if (minorLabelsDrawer) this.minorLabels().draw();

      } else if (scale instanceof anychart.scales.Ordinal) {
        overlappedLabels = this.getOverlappedLabels_();
        needDrawLabels = goog.isObject(overlappedLabels) ? overlappedLabels.labels : !overlappedLabels;

        for (i = 0; i < ticksArrLen; i++) {
          tickVal = scaleTicksArr[i];
          var leftTick, rightTick, labelPosition;
          if (goog.isArray(tickVal)) {
            leftTick = tickVal[0];
            rightTick = tickVal[1];
            labelPosition = (scale.transform(tickVal[0], 0) + scale.transform(tickVal[1], 1)) / 2;
          } else {
            leftTick = rightTick = tickVal;
            labelPosition = scale.transform(tickVal, .5);
          }
          ratio = scale.transform(leftTick, 0);
          pixelShift = tickThickness % 2 == 0 ? 0 : -.5;

          if (ticksDrawer) {
            ticksDrawer.call(
                ticks,
                ratio,
                pixelBounds,
                lineBounds,
                lineThickness,
                pixelShift);

            if (i == ticksArrLen - 1)
              ticksDrawer.call(
                  ticks,
                  scale.transform(rightTick, 1),
                  pixelBounds,
                  lineBounds,
                  lineThickness,
                  pixelShift);
          }

          drawLabel = goog.isArray(needDrawLabels) ? needDrawLabels[i] : needDrawLabels;
          if (labelsDrawer && drawLabel)
            labelsDrawer.call(this, leftTick, labelPosition, i, pixelShift);
        }
      }
      if (goog.isDef(labelsDrawer)) this.labels().draw();
    }
  }

  this.title().resumeSignalsDispatching(false);
  this.labels().resumeSignalsDispatching(false);
  this.minorLabels().resumeSignalsDispatching(false);
  this.ticks().resumeSignalsDispatching(false);
  this.minorTicks().resumeSignalsDispatching(false);
};


/** @inheritDoc */
anychart.elements.Axis.prototype.remove = function() {
  if (this.title_) this.title_.remove();
  if (this.line_) this.line_.parent(null);
  this.ticks().remove();
  this.minorTicks().remove();
  if (this.labels_) this.labels_.remove();
  if (this.minorLabels_) this.minorLabels_.remove();
};


/**
 * Axis serialization.
 * @return {Object} Serialized axis data.
 */
anychart.elements.Axis.prototype.serialize = function() {
  var data = goog.base(this, 'serialize');

  data['title'] = this.title().serialize();
  data['labels'] = this.labels().serialize();
  data['minorLabels'] = this.minorLabels().serialize();
  data['ticks'] = this.ticks().serialize();
  data['minorTicks'] = this.minorTicks().serialize();

  data['stroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke}*/(this.stroke()));
  data['name'] = this.name();
  data['length'] = this.length();
  data['offsetX'] = this.offsetX();
  data['offsetY'] = this.offsetY();
  data['orientation'] = this.orientation();
  data['drawFirstLabel'] = this.drawFirstLabel();
  data['drawLastLabel'] = this.drawLastLabel();
  data['overlapMode'] = this.overlapMode();

  return data;
};


/** @inheritDoc */
anychart.elements.Axis.prototype.deserialize = function(value) {
  this.suspendSignalsDispatching();

  goog.base(this, 'deserialize', value);

  this.title(value['title']);
  this.labels(value['labels']);
  this.minorLabels(value['minorLabels']);
  this.ticks(value['ticks']);
  this.minorTicks(value['minorTicks']);

  this.stroke(value['stroke']);
  this.name(value['name']);
  this.length(parseFloat(value['length']));
  this.offsetX(value['offsetX']);
  this.stroke(value['offsetY']);
  this.orientation(value['orientation']);
  this.drawFirstLabel(value['drawFirstLabel']);
  this.drawLastLabel(value['drawLastLabel']);
  this.overlapMode(value['overlapMode']);

  this.resumeSignalsDispatching(true);

  return this;
};


/** @inheritDoc */
anychart.elements.Axis.prototype.disposeInternal = function() {
  goog.base(this, 'disposeInternal');

  delete this.scale_;
  this.labelsBounds_ = null;
  this.minorLabelsBounds_ = null;

  this.title_ = null;

  goog.dispose(this.line_);
  this.line_ = null;

  this.ticks_ = null;

  this.minorTicks_ = null;

  this.parentBounds_ = null;
  this.pixelBounds_ = null;

  this.labels_ = null;
  this.minorLabels_ = null;
};
