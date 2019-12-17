//region --- Provide and Require
goog.provide('anychart.radarModule.Axis');
goog.provide('anychart.standalones.axes.Radar');
goog.require('acgraph');
goog.require('anychart.color');
goog.require('anychart.core.IAxis');
goog.require('anychart.core.IStandaloneBackend');
goog.require('anychart.core.VisualBase');
goog.require('anychart.core.reporting');
goog.require('anychart.core.ui.LabelsFactory');
goog.require('anychart.core.utils.Bounds');
goog.require('anychart.enums');
goog.require('anychart.format.Context');
goog.require('anychart.math.Rect');
goog.require('anychart.radarPolarBaseModule.RadialAxisTicks');
goog.require('anychart.scales.Base');
//endregion



/**
 * Radar axis Class.
 * @constructor
 * @extends {anychart.core.VisualBase}
 * @implements {anychart.core.IStandaloneBackend}
 * @implements {anychart.core.IAxis}
 */
anychart.radarModule.Axis = function() {
  this.suspendSignalsDispatching();
  anychart.radarModule.Axis.base(this, 'constructor');

  this.addThemes(anychart.themes.DefaultThemes['axis']);

  this.labelsBounds_ = [];
  this.line_ = acgraph.path();
  this.bindHandlersToGraphics(this.line_);

  /**
   * Constant to save space.
   * @type {number}
   * @private
   */
  this.ALL_VISUAL_STATES_ = anychart.ConsistencyState.APPEARANCE |
      anychart.ConsistencyState.AXIS_LABELS |
      anychart.ConsistencyState.AXIS_TICKS |
      anychart.ConsistencyState.BOUNDS;
  this.resumeSignalsDispatching(false);

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['stroke', this.ALL_VISUAL_STATES_, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['startAngle', this.ALL_VISUAL_STATES_, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED]
  ]);
};
goog.inherits(anychart.radarModule.Axis, anychart.core.VisualBase);


/**
 * Properties descriptors.
 * @type {!Object<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.radarModule.Axis.PROPERTY_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  var descriptors = anychart.core.settings.descriptors;
  anychart.core.settings.createDescriptors(map, [
    descriptors.STROKE,
    descriptors.START_ANGLE
  ]);

  return map;
})();
anychart.core.settings.populate(anychart.radarModule.Axis, anychart.radarModule.Axis.PROPERTY_DESCRIPTORS);


//region --- State and Signals
/**
 * Supported consistency states.
 * @type {number}
 */
anychart.radarModule.Axis.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.VisualBase.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.APPEARANCE |
    anychart.ConsistencyState.AXIS_LABELS |
    anychart.ConsistencyState.AXIS_TICKS;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.radarModule.Axis.prototype.SUPPORTED_SIGNALS = anychart.core.VisualBase.prototype.SUPPORTED_SIGNALS;


//endregion
//region --- Properties
/**
 * @type {acgraph.vector.Path}
 * @private
 */
anychart.radarModule.Axis.prototype.line_ = null;


/**
 * @type {string}
 * @private
 */
anychart.radarModule.Axis.prototype.name_ = 'axis';


/**
 * @type {anychart.core.ui.LabelsFactory}
 * @private
 */
anychart.radarModule.Axis.prototype.labels_ = null;


/**
 * @type {anychart.radarPolarBaseModule.RadialAxisTicks}
 * @private
 */
anychart.radarModule.Axis.prototype.ticks_ = null;


/**
 * @type {anychart.scales.Base}
 * @private
 */
anychart.radarModule.Axis.prototype.scale_ = null;


/**
 * @type {anychart.core.utils.Bounds}
 * @private
 */
anychart.radarModule.Axis.prototype.pixelBounds_ = null;


/**
 * @type {number}
 * @private
 */
anychart.radarModule.Axis.prototype.radius_ = NaN;


/**
 *
 * @type {number}
 * @private
 */
anychart.radarModule.Axis.prototype.criticalTickLength_ = NaN;


/**
 * @type {number}
 * @private
 */
anychart.radarModule.Axis.prototype.cx_ = NaN;


/**
 * @type {number}
 * @private
 */
anychart.radarModule.Axis.prototype.cy_ = NaN;


/**
 * @type {Array.<anychart.math.Rect>}
 * @private
 */
anychart.radarModule.Axis.prototype.labelsBounds_ = null;


//endregion
//region --- API
/**
 * @param {(Object|boolean|null)=} opt_value Axis labels.
 * @return {!(anychart.core.ui.LabelsFactory|anychart.radarModule.Axis)} Axis labels of itself for method chaining.
 */
anychart.radarModule.Axis.prototype.labels = function(opt_value) {
  if (!this.labels_) {
    this.labels_ = new anychart.core.ui.LabelsFactory();
    this.setupCreated('labels', this.labels_);
    this.labels_.setParentEventTarget(this);
    this.labels_.listenSignals(this.labelsInvalidated_, this);
  }

  if (goog.isDef(opt_value)) {
    if (goog.isObject(opt_value) && !('enabled' in opt_value))
      opt_value['enabled'] = true;
    this.labels_.setup(opt_value);
    return this;
  }
  return this.labels_;
};


/**
 * Internal label invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.radarModule.Axis.prototype.labelsInvalidated_ = function(event) {
  var state = 0;
  var signal = 0;
  if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    state = this.ALL_VISUAL_STATES_;
    signal = anychart.Signal.BOUNDS_CHANGED | anychart.Signal.NEEDS_REDRAW;
  } else if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    state = anychart.ConsistencyState.AXIS_LABELS;
    signal = anychart.Signal.NEEDS_REDRAW;
  }

  this.dropBoundsCache_();
  this.invalidate(state, signal);
};


/**
 * @param {(Object|boolean|null)=} opt_value Axis ticks.
 * @return {!(anychart.radarPolarBaseModule.RadialAxisTicks|anychart.radarModule.Axis)} Axis ticks or itself for method chaining.
 */
anychart.radarModule.Axis.prototype.ticks = function(opt_value) {
  if (!this.ticks_) {
    this.ticks_ = new anychart.radarPolarBaseModule.RadialAxisTicks();
    this.setupCreated('ticks', this.ticks_);
    this.ticks_.setParentEventTarget(this);
    this.ticks_.listenSignals(this.ticksInvalidated_, this);
  }

  if (goog.isDef(opt_value)) {
    this.ticks_.setup(opt_value);
    return this;
  }
  return this.ticks_;
};


/**
 * Internal ticks invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.radarModule.Axis.prototype.ticksInvalidated_ = function(event) {
  var state = 0;
  var signal = 0;
  if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    state = this.ALL_VISUAL_STATES_;
    signal = anychart.Signal.BOUNDS_CHANGED | anychart.Signal.NEEDS_REDRAW;
  } else if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    state = anychart.ConsistencyState.AXIS_TICKS | anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.BOUNDS;
    signal = anychart.Signal.NEEDS_REDRAW;
  }
  this.invalidate(state, signal);
};


/**
 * @param {(anychart.scales.Base|anychart.enums.ScaleTypes|Object)=} opt_value Scale.
 * @return {anychart.scales.Base|!anychart.radarModule.Axis} Axis scale or itself for method chaining.
 */
anychart.radarModule.Axis.prototype.scale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var val = anychart.scales.Base.setupScale(this.scale_, opt_value, null,
        anychart.scales.Base.ScaleTypes.ALL_DEFAULT, null, this.scaleInvalidated_, this);
    if (val) {
      var dispatch = this.scale_ == val;
      this.scale_ = /** @type {anychart.scales.Linear} */(val);
      this.scale_.resumeSignalsDispatching(dispatch);
      if (!dispatch) {
        this.dropBoundsCache_();
        this.invalidate(this.ALL_VISUAL_STATES_, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
      }
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
anychart.radarModule.Axis.prototype.scaleInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.dropBoundsCache_();
    this.invalidate(this.ALL_VISUAL_STATES_, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
  }
};


//endregion
//region --- Bounds
/** @inheritDoc */
anychart.radarModule.Axis.prototype.invalidateParentBounds = function() {
  this.invalidate(this.ALL_VISUAL_STATES_, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
};


/**
 * @private
 */
anychart.radarModule.Axis.prototype.dropBoundsCache_ = function() {
  if (this.labelsBoundingRects_) this.labelsBoundingRects_.length = 0;
  this.labelsBounds_.length = 0;
  this.overlappedLabels_ = null;
};


/**
 * Calculate axis bounds, center, radius.
 * @return {anychart.core.utils.Bounds}
 * @private
 */
anychart.radarModule.Axis.prototype.calculateAxisBounds_ = function() {
  if (!this.pixelBounds_ || this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    var parentBounds = this.parentBounds();

    if (parentBounds) {
      this.radius_ = Math.round(Math.min(parentBounds.width, parentBounds.height) / 2);
      this.cx_ = Math.round(parentBounds.left + parentBounds.width / 2);
      this.cy_ = Math.round(parentBounds.top + parentBounds.height / 2);

      var scale = /** @type {anychart.scales.ScatterBase|anychart.scales.Ordinal} */(this.scale());
      var labels = /** @type {anychart.core.ui.LabelsFactory} */(this.labels());
      var ticks = /** @type {!anychart.radarPolarBaseModule.RadialAxisTicks} */(this.ticks());

      if (scale) {
        var delta = 0;
        if (this.enabled()) {
          var i;
          var scaleTicksArr = scale.ticks().get();
          var ticksArrLen = scaleTicksArr.length;

          var startAngle = goog.math.standardAngle(/** @type {number} */(this.getOption('startAngle')) - 90);
          var angle;

          var leftExtreme = NaN;
          var topExtreme = NaN;
          var rightExtreme = NaN;
          var bottomExtreme = NaN;

          var leftExtremeLabelIndex = NaN;
          var topExtremeLabelIndex = NaN;
          var rightExtremeLabelIndex = NaN;
          var bottomExtremeLabelIndex = NaN;

          var leftExtremeAngle = NaN;
          var topExtremeAngle = NaN;
          var rightExtremeAngle = NaN;
          var bottomExtremeAngle = NaN;

          this.dropBoundsCache_();
          this.criticalTickLength_ = NaN;
          var tickVal, ratio;

          for (i = 0; i < ticksArrLen; i++) {
            var x, y, x1, y1, lineThickness, angleRad, radius, tickLen;
            tickVal = scaleTicksArr[i];
            ratio = scale.transform(tickVal);
            angle = goog.math.standardAngle(startAngle + ratio * 360);
            angleRad = angle * Math.PI / 180;

            var labelsPosition = /** @type {anychart.enums.SidePosition} */(labels.getOption('position'));
            var labelsSidePosition = anychart.utils.sidePositionToNumber(labelsPosition);
            var ticksLength = anychart.utils.getAffectBoundsTickLength(ticks);

            if (labels.enabled() && labelsSidePosition >= 0) {
              var labelBounds = this.getLabelBounds_(i);

              x = labelBounds.getLeft();
              y = labelBounds.getTop();
              x1 = labelBounds.getRight();
              y1 = labelBounds.getBottom();

              if (ticks.enabled() && ticksLength) {
                lineThickness = this.line_.stroke()['thickness'] ? this.line_.stroke()['thickness'] : 1;
                tickLen = ticks.enabled() ? ticks.getOption('length') : 0;

                radius = this.radius_ + ticksLength + lineThickness / 2;
                var tickX = Math.round(this.cx_ + radius * Math.cos(angleRad));
                var tickY = Math.round(this.cy_ + radius * Math.sin(angleRad));

                x = Math.min(x, tickX);
                x1 = Math.max(x1, tickX);
                y = Math.min(y, tickY);
                y1 = Math.max(y1, tickY);
              }

            } else if (ticks.enabled() && ticksLength) {
              lineThickness = this.line_.stroke()['thickness'] ? this.line_.stroke()['thickness'] : 1;
              tickLen = ticks.enabled() ? ticks.getOption('length') : 0;
              radius = this.radius_ + ticksLength + lineThickness / 2;
              x = x1 = Math.round(this.cx_ + radius * Math.cos(angleRad));
              y = y1 = Math.round(this.cy_ + radius * Math.sin(angleRad));
            } else {
              lineThickness = this.line_.stroke()['thickness'] ? this.line_.stroke()['thickness'] : 1;
              radius = this.radius_ + lineThickness / 2;
              x = x1 = Math.round(this.cx_ + radius * Math.cos(angleRad));
              y = y1 = Math.round(this.cy_ + radius * Math.sin(angleRad));
            }

            if (isNaN(leftExtreme) || x < leftExtreme) {
              leftExtreme = x;
              leftExtremeLabelIndex = i;
              leftExtremeAngle = angle;
            }
            if (isNaN(topExtreme) || y < topExtreme) {
              topExtreme = y;
              topExtremeLabelIndex = i;
              topExtremeAngle = angle;
            }
            if (isNaN(rightExtreme) || x1 > rightExtreme) {
              rightExtreme = x1;
              rightExtremeLabelIndex = i;
              rightExtremeAngle = angle;
            }
            if (isNaN(bottomExtreme) || y1 > bottomExtreme) {
              bottomExtreme = y1;
              bottomExtremeLabelIndex = i;
              bottomExtremeAngle = angle;
            }
          }


          var leftDelta = 0;
          var topDelta = 0;
          var rightDelta = 0;
          var bottomDelta = 0;

          leftExtreme = Math.round(leftExtreme);
          topExtreme = Math.round(topExtreme);
          rightExtreme = Math.round(rightExtreme);
          bottomExtreme = Math.round(bottomExtreme);

          var a;
          if (leftExtreme < parentBounds.getLeft()) {
            a = leftExtremeAngle < 180 ?
                Math.sin((leftExtremeAngle - 90) * Math.PI / 180) :
                Math.cos((leftExtremeAngle - 180) * Math.PI / 180);
            leftDelta = Math.round((parentBounds.getLeft() - leftExtreme) / a);
          }
          if (topExtreme < parentBounds.getTop()) {
            a = topExtremeAngle < 270 ?
                Math.sin((topExtremeAngle - 180) * Math.PI / 180) :
                Math.cos((topExtremeAngle - 270) * Math.PI / 180);
            topDelta = Math.round((parentBounds.getTop() - topExtreme) / a);
          }
          if (rightExtreme > parentBounds.getRight()) {
            a = rightExtremeAngle < 360 ?
                Math.sin((rightExtremeAngle - 270) * Math.PI / 180) :
                Math.cos(rightExtremeAngle * Math.PI / 180);
            rightDelta = Math.round((rightExtreme - parentBounds.getRight()) / a);
          }
          if (bottomExtreme > parentBounds.getBottom()) {
            a = bottomExtremeAngle < 90 ?
                Math.sin(bottomExtremeAngle * Math.PI / 180) :
                Math.cos((bottomExtremeAngle - 90) * Math.PI / 180);
            bottomDelta = Math.round((bottomExtreme - parentBounds.getBottom()) / a);
          }

          delta = Math.max(leftDelta, topDelta, rightDelta, bottomDelta);

          if (delta > 0) {
            this.radius_ -= delta;
            if (this.radius_ < 0) {
              this.radius_ = 0;
              var labelSize = 0;
              if (this.labels().enabled()) {
                var extremeLabelIndex = NaN, isHorizontal;
                if (delta == leftDelta) {
                  extremeLabelIndex = leftExtremeLabelIndex;
                  isHorizontal = true;
                } else if (delta == topDelta) {
                  extremeLabelIndex = topExtremeLabelIndex;
                  isHorizontal = false;
                } else if (delta == rightDelta) {
                  extremeLabelIndex = rightExtremeLabelIndex;
                  isHorizontal = true;
                } else if (delta == bottomDelta) {
                  extremeLabelIndex = bottomExtremeLabelIndex;
                  isHorizontal = false;
                }
                var extremeLabelBounds = this.getLabelBounds_(extremeLabelIndex);
                labelSize = isHorizontal ? extremeLabelBounds.width : extremeLabelBounds.height;
              }
              lineThickness = this.line_.stroke()['thickness'] ? this.line_.stroke()['thickness'] : 1;
              this.criticalTickLength_ = Math.min(parentBounds.width, parentBounds.height) / 2 - labelSize - lineThickness;
            }
            this.dropBoundsCache_();
          }
        }

        var outerRadius = this.radius_ + delta;
        var outerDiameter = outerRadius * 2;
        this.pixelBounds_ = new anychart.core.utils.Bounds(
            this.cx_ - outerRadius,
            this.cy_ - outerRadius,
            outerDiameter,
            outerDiameter);
      } else {
        this.pixelBounds_ = new anychart.core.utils.Bounds(
            this.cx_ - this.radius_,
            this.cy_ - this.radius_,
            this.radius_ * 2,
            this.radius_ * 2);
      }
    } else {
      this.pixelBounds_ = new anychart.core.utils.Bounds(0, 0, 0, 0);
    }
    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }
  return this.pixelBounds_;
};


/**
 * Returns remaining parent bounds to use elsewhere.
 * @return {anychart.math.Rect} Parent bounds without the space used by the title.
 */
anychart.radarModule.Axis.prototype.getRemainingBounds = function() {
  var parentBounds = this.parentBounds();
  if (parentBounds) {
    if (this.enabled()) {
      this.calculateAxisBounds_();
      var lineThickness = this.line_.stroke()['thickness'] ? this.line_.stroke()['thickness'] : 1;
      var halfThickness = Math.floor(lineThickness / 2);
      return new anychart.math.Rect(
          this.cx_ - this.radius_ + halfThickness,
          this.cy_ - this.radius_ + halfThickness,
          (this.radius_ - halfThickness) * 2,
          (this.radius_ - halfThickness) * 2);
    } else {
      return /** @type {anychart.math.Rect} */(parentBounds);
    }
  } else
    return new anychart.math.Rect(0, 0, 0, 0);
};


//endregion
//region --- Drawing
/**
 * Line drawer.
 * @param {number} angle .
 * @param {number} thickness .
 * @param {number} tickLen .
 * @private
 */
anychart.radarModule.Axis.prototype.drawTick_ = function(angle, thickness, tickLen) {
  var ticks = /** @type {anychart.radarPolarBaseModule.RadialAxisTicks} */(this.ticks());
  var ticksPosition = /** @type {anychart.enums.SidePosition} */(ticks.getOption('position'));
  var ticksSidePosition = anychart.utils.sidePositionToNumber(ticksPosition);

  var angleRad = goog.math.toRadians(angle);

  var sin = Math.sin(angleRad);
  var cos = Math.cos(angleRad);

  var pixelShift = this.getPixelShift(angle);
  var xPixelShift = pixelShift[0];
  var yPixelShift = pixelShift[1];

  var startLength = ticksSidePosition ? 0 : -tickLen / 2;
  var endLength = ticksSidePosition ? ticksSidePosition * (tickLen + thickness) : tickLen / 2;

  var radius = this.radius_ + startLength;
  var x0Ticks = Math.round(this.cx_ + radius * cos) + xPixelShift;
  var y0Ticks = Math.round(this.cy_ + radius * sin) + yPixelShift;

  radius = this.radius_ + endLength;
  var x1Ticks = Math.round(this.cx_ + radius * cos) + xPixelShift;
  var y1Ticks = Math.round(this.cy_ + radius * sin) + yPixelShift;

  ticks.drawTick(x0Ticks, y0Ticks, x1Ticks, y1Ticks);
};


/**
 * Line drawer.
 * @param {number} index .
 * @param {number} angle .
 * @private
 */
anychart.radarModule.Axis.prototype.drawLine_ = function(index, angle) {
  var angleRad = goog.math.toRadians(angle);

  var x = Math.round(this.cx_ + this.radius_ * Math.cos(angleRad));
  var y = Math.round(this.cy_ + this.radius_ * Math.sin(angleRad));

  if (!index)
    this.line_.moveTo(x, y);
  else
    this.line_.lineTo(x, y);
};


/**
 * Axis labels drawer.
 * @param {number} index Label index.
 * @param {number} angle Angle.
 * @param {number} thickness .
 * @param {number} tickLen .
 * @private
 */
anychart.radarModule.Axis.prototype.drawLabel_ = function(index, angle, thickness, tickLen) {
  var labels = /** @type {anychart.core.ui.LabelsFactory} */(this.labels());
  var labelsPosition = /** @type {anychart.enums.SidePosition} */(labels.getOption('position'));
  var labelsSidePosition = anychart.utils.sidePositionToNumber(labelsPosition);

  var ticks = /** @type {!anychart.radarPolarBaseModule.RadialAxisTicks} */(this.ticks());
  var ticksLength = anychart.utils.getAffectBoundsTickLength(ticks, labelsSidePosition);

  var offset = this.getLabelPositionOffsetForAngle_(angle, this.getLabelBounds_(index));
  var labelDx = offset.x * labelsSidePosition;
  var labelDy = offset.y * labelsSidePosition;

  var angleRad = goog.math.toRadians(angle);

  var pixelShift = this.getPixelShift(angle);
  var xPixelShift = pixelShift[0];
  var yPixelShift = pixelShift[1];

  var radius = this.radius_ + ticksLength + (labelsSidePosition * thickness);
  var ticksDx = Math.round(this.cx_ + radius * Math.cos(angleRad)) + xPixelShift;
  var ticksDy = Math.round(this.cy_ + radius * Math.sin(angleRad)) + yPixelShift;

  var x = ticksDx + labelDx;
  var y = ticksDy + labelDy;

  var scale = /** @type {anychart.scales.Linear|anychart.scales.Ordinal} */(this.scale());
  var scaleTicksArr = scale.ticks().get();

  var formatProvider = this.getLabelsFormatProvider_(index, scaleTicksArr[index]);
  var positionProvider = {'value': {x: x, y: y}};

  labels.add(formatProvider, positionProvider, index);
};


/** @inheritDoc */
anychart.radarModule.Axis.prototype.isAxisMarkerProvider = function() {
  return false;
};


/** @inheritDoc */
anychart.radarModule.Axis.prototype.checkDrawingNeeded = function() {
  if (this.isConsistent())
    return false;

  if (!this.enabled()) {
    if (this.hasInvalidationState(anychart.ConsistencyState.ENABLED)) {
      this.remove();
      this.markConsistent(anychart.ConsistencyState.ENABLED);
      this.ticks().invalidate(anychart.ConsistencyState.CONTAINER);
      this.labels().invalidate(anychart.ConsistencyState.CONTAINER);
      this.invalidate(
          anychart.ConsistencyState.CONTAINER |
              anychart.ConsistencyState.AXIS_TICKS |
              anychart.ConsistencyState.AXIS_LABELS
      );
    }
    return false;
  }
  this.markConsistent(anychart.ConsistencyState.ENABLED);
  return true;
};


/**
 * Axis drawing.
 * @return {anychart.radarModule.Axis} An instance of {@link anychart.radarModule.Axis} class for method chaining.
 */
anychart.radarModule.Axis.prototype.draw = function() {
  var scale = /** @type {anychart.scales.Linear|anychart.scales.Ordinal} */(this.scale());

  if (!scale) {
    anychart.core.reporting.error(anychart.enums.ErrorCode.SCALE_NOT_SET);
    return this;
  }

  if (!this.checkDrawingNeeded())
    return this;

  var lineDrawer, ticksDrawer, labelsDrawer;
  var ticks = /** @type {anychart.radarPolarBaseModule.RadialAxisTicks} */(this.ticks());
  var labels = /** @type {anychart.core.ui.LabelsFactory} */(this.labels());

  labels.suspendSignalsDispatching();
  ticks.suspendSignalsDispatching();

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    this.line_.clear();
    this.line_.stroke(/** @type {acgraph.vector.Stroke} */(this.getOption('stroke')));

    lineDrawer = this.drawLine_;
    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    var zIndex = /** @type {number} */(this.zIndex());
    this.line_.zIndex(zIndex);
    ticks.zIndex(zIndex);
    labels.zIndex(zIndex);

    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    var container = /** @type {acgraph.vector.ILayer} */(this.container());
    this.line_.parent(container);
    ticks.container(container);
    labels.container(container);

    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.AXIS_TICKS)) {

    ticks.draw();

    ticksDrawer = this.drawTick_;
    this.markConsistent(anychart.ConsistencyState.AXIS_TICKS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.AXIS_LABELS)) {
    if (!labels.container()) labels.container(/** @type {acgraph.vector.ILayer} */(this.container()));
    labels.parentBounds(/** @type {anychart.math.Rect} */(this.parentBounds()));
    labels.clear();

    labelsDrawer = this.drawLabel_;
    this.markConsistent(anychart.ConsistencyState.AXIS_LABELS);
  }

  if (goog.isDef(ticksDrawer) || goog.isDef(lineDrawer) || goog.isDef(labelsDrawer)) {
    this.calculateAxisBounds_();
    var i;
    var scaleTicksArr = scale.ticks().get();
    var ticksArrLen = scaleTicksArr.length;
    var startAngle = goog.math.standardAngle(/** @type {number} */(this.getOption('startAngle')) - 90);
    var tickLen = ticks.enabled() ? isNaN(this.criticalTickLength_) ? /** @type {number} */(ticks.getOption('length')) : this.criticalTickLength_ : 0;
    var lineThickness = this.line_.stroke()['thickness'] ? this.line_.stroke()['thickness'] : 1;
    var halfThickness = Math.floor(lineThickness / 2);
    var angle, tickVal, ratio;

    for (i = 0; i < ticksArrLen; i++) {
      tickVal = scaleTicksArr[i];
      ratio = scale.transform(tickVal);
      angle = goog.math.standardAngle(startAngle + ratio * 360);

      if (lineDrawer)
        lineDrawer.call(this, i, angle);

      if (ticksDrawer)
        ticksDrawer.call(this, angle, halfThickness, tickLen);

      if (labelsDrawer)
        labelsDrawer.call(this, i, angle, halfThickness, tickLen);
    }
    if (i != 0) this.line_.close();
    labels.draw();
  }

  labels.resumeSignalsDispatching(false);
  ticks.resumeSignalsDispatching(false);

  return this;
};


/** @inheritDoc */
anychart.radarModule.Axis.prototype.remove = function() {
  if (this.line_) this.line_.parent(null);
  this.ticks().remove();
  if (this.labels_) this.labels_.remove();
};


//endregion
//region --- Utils
/**
 * Returns labels anchor for angle.
 * @param {number} angle .
 * @param {anychart.math.Rect} bounds .
 * @return {{x: number, y: number}} .
 * @private
 */
anychart.radarModule.Axis.prototype.getLabelPositionOffsetForAngle_ = function(angle, bounds) {
  var width = bounds.width, height = bounds.height;

  var offset = {x: 0, y: 0};
  if (!angle) {
    offset.x += width / 2;
  } else if (angle > 0 && angle < 90) {
    offset.x += width / 2;
    offset.y += height / 2;
  } else if (angle == 90) {
    offset.y += height / 2;
  } else if (angle > 90 && angle < 180) {
    offset.y += height / 2;
    offset.x -= width / 2;
  } else if (angle == 180) {
    offset.x -= width / 2;
  } else if (angle > 180 && angle < 270) {
    offset.y -= height / 2;
    offset.x -= width / 2;
  } else if (angle == 270) {
    offset.y -= height / 2;
  } else if (angle > 270) {
    offset.y -= height / 2;
    offset.x += width / 2;
  }

  return offset;
};


/**
 * @param {number} angle .
 * @return {Array.<number>}
 */
anychart.radarModule.Axis.prototype.getPixelShift = function(angle) {
  var ticksStroke = this.ticks().getOption('stroke');
  var ticksThickness = ticksStroke['thickness'] ? parseFloat(ticksStroke['thickness']) : 1;

  var xPixelShift = 0;
  var yPixelShift = 0;

  var shift = ticksThickness % 2 == 0 ? 0 : 0.5;
  if (!angle) {
    yPixelShift = -shift;
  } else if (angle == 90) {
    xPixelShift = -shift;
  } else if (angle == 180) {
    yPixelShift = shift;
  } else if (angle == 270) {
    xPixelShift = shift;
  }

  return [xPixelShift, yPixelShift];
};


/**
 * Calculate label bounds.
 * @param {number} index Label index.
 * @return {anychart.math.Rect} Label bounds.
 * @private
 */
anychart.radarModule.Axis.prototype.getLabelBounds_ = function(index) {
  var boundsCache = this.labelsBounds_;
  if (goog.isDef(boundsCache[index]))
    return boundsCache[index];

  var lineThickness = this.line_.stroke()['thickness'] ? this.line_.stroke()['thickness'] : 1;
  var ticks = /** @type {!anychart.radarPolarBaseModule.RadialAxisTicks} */(this.ticks());
  var labels = /** @type {anychart.core.ui.LabelsFactory} */(this.labels());
  var scale = /** @type {anychart.scales.ScatterBase|anychart.scales.Ordinal} */(this.scale());
  var scaleTicks = scale.ticks();

  var value = scaleTicks.get()[index];
  var ratio = scale.transform(value);

  var labelsPosition = /** @type {anychart.enums.SidePosition} */(labels.getOption('position'));
  var labelsSidePosition = anychart.utils.sidePositionToNumber(labelsPosition);
  var ticksLength = anychart.utils.getAffectBoundsTickLength(ticks, labelsSidePosition);

  var angle = goog.math.standardAngle(/** @type {number} */(this.getOption('startAngle')) - 90 + ratio * 360);
  var angleRad = angle * Math.PI / 180;

  var tickLen = ticks.enabled() ? isNaN(this.criticalTickLength_) ? ticksLength : this.criticalTickLength_ : 0;
  var radius = this.radius_ + tickLen + lineThickness / 2;

  var x = Math.round(this.cx_ + radius * Math.cos(angleRad));
  var y = Math.round(this.cy_ + radius * Math.sin(angleRad));

  var formatProvider = this.getLabelsFormatProvider_(index, value);
  var positionProvider = {'value': {'x': x, 'y': y}};

  var bounds = labels.measure(formatProvider, positionProvider, undefined, index);

  var offset = this.getLabelPositionOffsetForAngle_(angle, bounds);

  var labelDx = offset.x * labelsSidePosition;
  var labelDy = offset.y * labelsSidePosition;

  bounds.left += labelDx;
  bounds.top += labelDy;

  return boundsCache[index] = bounds;
};


/**
 * Gets format provider for label.
 * @param {number} index Label index.
 * @param {string|number} value Label value.
 * @return {Object} Labels format provider.
 * @private
 */
anychart.radarModule.Axis.prototype.getLabelsFormatProvider_ = function(index, value) {
  var scale = this.scale();

  var labelText, labelValue;
  var addRange = true;
  if (anychart.utils.instanceOf(scale, anychart.scales.Ordinal)) {
    labelText = scale.ticks().names()[index];
    labelValue = value;
    addRange = false;
  } else if (anychart.utils.instanceOf(scale, anychart.scales.DateTime)) {
    labelText = anychart.format.date(/** @type {number} */(value));
    labelValue = value;
  } else {
    labelText = parseFloat(value);
    labelValue = parseFloat(value);
  }

  var values = {
    'axis': {value: this, type: anychart.enums.TokenType.UNKNOWN},
    'index': {value: index, type: anychart.enums.TokenType.NUMBER},
    'value': {value: labelText, type: anychart.enums.TokenType.NUMBER},
    'tickValue': {value: labelValue, type: anychart.enums.TokenType.NUMBER},
    'scale': {value: scale, type: anychart.enums.TokenType.UNKNOWN}
  };

  if (addRange) {
    values['min'] = {value: goog.isDef(scale.min) ? scale.min : null, type: anychart.enums.TokenType.NUMBER};
    values['max'] = {value: goog.isDef(scale.max) ? scale.max : null, type: anychart.enums.TokenType.NUMBER};
  }

  var aliases = {};
  aliases[anychart.enums.StringToken.AXIS_SCALE_MAX] = 'max';
  aliases[anychart.enums.StringToken.AXIS_SCALE_MIN] = 'min';

  var context = new anychart.format.Context(values);
  context.tokenAliases(aliases);

  return context.propagate();
};


/**
 * Drops labels calls cache.
 */
anychart.radarModule.Axis.prototype.dropLabelCallsCache = function() {
  if (this.labels_)
    this.labels_.dropCallsCache();
};


//endregion
//region --- Setup and Serialize
/** @inheritDoc */
anychart.radarModule.Axis.prototype.serialize = function() {
  var json = anychart.radarModule.Axis.base(this, 'serialize');
  anychart.core.settings.serialize(this, anychart.radarModule.Axis.PROPERTY_DESCRIPTORS, json);
  json['labels'] = this.labels().serialize();
  json['ticks'] = this.ticks().serialize();
  return json;
};


/** @inheritDoc */
anychart.radarModule.Axis.prototype.setupByJSON = function(config, opt_default) {
  anychart.radarModule.Axis.base(this, 'setupByJSON', config, opt_default);
  anychart.core.settings.deserialize(this, anychart.radarModule.Axis.PROPERTY_DESCRIPTORS, config, opt_default);
  this.labels().setupInternal(!!opt_default, config['labels']);
  this.ticks(config['ticks']);
};


/** @inheritDoc */
anychart.radarModule.Axis.prototype.disposeInternal = function() {
  delete this.scale_;
  this.labelsBounds_.length = 0;

  goog.disposeAll(this.line_, this.ticks_, this.labels_, this.pixelBounds_);

  this.line_ = null;
  this.ticks_ = null;
  this.pixelBounds_ = null;
  this.labels_ = null;

  anychart.radarModule.Axis.base(this, 'disposeInternal');
};



//endregion
//region --- Standalone
//------------------------------------------------------------------------------
//
//  Standalone
//
//------------------------------------------------------------------------------
/**
 * @constructor
 * @extends {anychart.radarModule.Axis}
 */
anychart.standalones.axes.Radar = function() {
  anychart.standalones.axes.Radar.base(this, 'constructor');
};
goog.inherits(anychart.standalones.axes.Radar, anychart.radarModule.Axis);
anychart.core.makeStandalone(anychart.standalones.axes.Radar, anychart.radarModule.Axis);


/**
 * Returns axis instance.<br/>
 * <b>Note:</b> Any axis must be bound to a scale.
 * @return {!anychart.standalones.axes.Radar}
 */
anychart.standalones.axes.radar = function() {
  var axis = new anychart.standalones.axes.Radar();
  axis.addThemes('standalones.radarAxis');
  return axis;
};


//endregion
//region --- Export
//proto['startAngle'] = proto.startAngle;
//exports
(function() {
  var proto = anychart.radarModule.Axis.prototype;
  proto['labels'] = proto.labels;
  proto['ticks'] = proto.ticks;
  proto['scale'] = proto.scale;
  proto['getRemainingBounds'] = proto.getRemainingBounds;
  // auto
  // proto['stroke'] = proto.stroke;

  proto = anychart.standalones.axes.Radar.prototype;
  goog.exportSymbol('anychart.standalones.axes.radar', anychart.standalones.axes.radar);
  proto['draw'] = proto.draw;
  proto['parentBounds'] = proto.parentBounds;
  proto['container'] = proto.container;
  // auto
  // proto['startAngle'] = proto.startAngle;
})();
//endregion
