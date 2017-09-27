goog.provide('anychart.colorScalesModule.ui.ColorRange');
goog.provide('anychart.standalones.ColorRange');
goog.require('anychart.colorScalesModule.Linear');
goog.require('anychart.colorScalesModule.Ordinal');
goog.require('anychart.colorScalesModule.ui.ColorRangeTicks');
goog.require('anychart.core.Axis');
goog.require('anychart.core.IStandaloneBackend');
goog.require('anychart.core.ui.MarkersFactory');
goog.require('anychart.math.Rect');
goog.forwardDeclare('anychart.mapModule.Series');
goog.forwardDeclare('anychart.treemapModule.Chart');



/**
 * Color range.
 * @constructor
 * @extends {anychart.core.Axis}
 * @implements {anychart.core.IStandaloneBackend}
 */
anychart.colorScalesModule.ui.ColorRange = function() {
  anychart.colorScalesModule.ui.ColorRange.base(this, 'constructor');

  /**
   * Size of color range line. Height in horizontal orientation.
   * @type {number}
   * @private
   */
  this.colorLineSize_ = NaN;

  this.bindHandlersToComponent(this, this.handleMouseOverAndMove, this.handleMouseOut, null, this.handleMouseOverAndMove);
  this.eventsHandler.listen(this, acgraph.events.EventType.MOUSEDOWN, this.handleMouseClick);

  this.ALL_VISUAL_STATES |= anychart.ConsistencyState.COLOR_RANGE_MARKER;
};
goog.inherits(anychart.colorScalesModule.ui.ColorRange, anychart.core.Axis);


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.colorScalesModule.ui.ColorRange.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.Axis.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.COLOR_RANGE_MARKER;


/** @inheritDoc */
anychart.colorScalesModule.ui.ColorRange.prototype.createTicks = function() {
  return new anychart.colorScalesModule.ui.ColorRangeTicks();
};


/** @inheritDoc */
anychart.colorScalesModule.ui.ColorRange.prototype.getLine = function() {
  if (!this.line) {
    if (anychart.utils.instanceOf(this.scale(), anychart.colorScalesModule.Linear)) {
      this.line = acgraph.path();
    } else if (anychart.utils.instanceOf(this.scale(), anychart.colorScalesModule.Ordinal)) {
      this.line = acgraph.layer();
      this.lines = [];
    }
    this.line.zIndex(/** @type {number} */(this.zIndex()));
    this.line.parent(/** @type {acgraph.vector.ILayer} */(this.container()));
    this.line.cursor(acgraph.vector.Cursor.POINTER);
    this.bindHandlersToGraphics(this.line);
  }
  return this.line;
};


/**
 * Removes this.line from DOM.
 */
anychart.colorScalesModule.ui.ColorRange.prototype.removeLines = function() {
  if (this.line) {
    this.line.removeAllListeners();
    this.line.remove();
    this.line = null;
  }
  if (this.lines)
    this.lines.length = 0;
};


/**
 * Getter/setter color line size.
 * @param {number=} opt_value
 * @return {number|anychart.colorScalesModule.ui.ColorRange}
 */
anychart.colorScalesModule.ui.ColorRange.prototype.colorLineSize = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.utils.toNumber(opt_value);
    if (this.colorLineSize_ != opt_value) {
      this.colorLineSize_ = opt_value;
      this.invalidate(this.ALL_VISUAL_STATES, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.colorLineSize_;
};


/**
 * Getter/setter for color range align setting.
 * @param {(anychart.enums.Align|string)=} opt_value Color range align.
 * @return {(anychart.enums.Align|anychart.colorScalesModule.ui.ColorRange)} Color range align or self for chaining.
 */
anychart.colorScalesModule.ui.ColorRange.prototype.align = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeAlign(opt_value);
    if (this.align_ != opt_value) {
      this.align_ = opt_value;
      this.invalidate(this.ALL_VISUAL_STATES,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.align_;
  }
};


/**
 * Color range line length.
 * @param {string|number=} opt_value Color line length.
 * @return {number|string|anychart.colorScalesModule.ui.ColorRange} Color line length.
 */
anychart.colorScalesModule.ui.ColorRange.prototype.length = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.length_ != opt_value) {
      this.length_ = opt_value;
      this.invalidate(this.ALL_VISUAL_STATES,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.length_;
};


/**
 * Set/get color range marker.
 * @param {(anychart.core.ui.MarkersFactory.Marker|Object)=} opt_value Marker or marker settings.
 * @return {anychart.core.ui.MarkersFactory.Marker|anychart.colorScalesModule.ui.ColorRange} Color range marker.
 */
anychart.colorScalesModule.ui.ColorRange.prototype.marker = function(opt_value) {
  if (!this.marker_) {
    this.marker_ = new anychart.core.ui.MarkersFactory.Marker();
    this.marker_.positionProvider({value: {x: 0, y: 0}});
    this.marker_.listenSignals(this.markerInvalidated_, this);
  }

  if (goog.isDef(opt_value)) {
    this.marker_.setup(opt_value);
    this.invalidate(anychart.ConsistencyState.COLOR_RANGE_MARKER, anychart.Signal.NEEDS_REDRAW);
    return this;
  }
  return this.marker_;
};


/**
 * Listener for marker invalidation.
 * @param {anychart.SignalEvent} event Invalidation event.
 * @private
 */
anychart.colorScalesModule.ui.ColorRange.prototype.markerInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    this.invalidate(anychart.ConsistencyState.COLOR_RANGE_MARKER, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Set/get target entry.
 * @param {anychart.mapModule.Series|anychart.treemapModule.Chart|anychart.tagCloudModule.Chart=} opt_value Target entry.
 * @return {anychart.mapModule.Series|anychart.treemapModule.Chart|anychart.tagCloudModule.Chart|anychart.colorScalesModule.ui.ColorRange} target entry.
 */
anychart.colorScalesModule.ui.ColorRange.prototype.target = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.target_ != opt_value) {
      this.target_ = opt_value;
      this.calculateRangeRegions_();
      this.target_.listenSignals(this.targetInvalidated_, this);
    }
    return this;
  }
  return this.target_;
};


/**
 * Listens to series invalidation.
 * @param {anychart.SignalEvent} e
 * @private
 */
anychart.colorScalesModule.ui.ColorRange.prototype.targetInvalidated_ = function(e) {
  if (e.hasSignal(anychart.Signal.NEEDS_RECALCULATION | anychart.Signal.NEED_UPDATE_COLOR_RANGE)) {
    this.calculateRangeRegions_();
  }
};


/**
 *
 * @private
 */
anychart.colorScalesModule.ui.ColorRange.prototype.calculateRangeRegions_ = function() {
  var scale = this.scale();
  if (scale && anychart.utils.instanceOf(scale, anychart.colorScalesModule.Ordinal)) {
    this.rangeRegions_ = {};
    var target = /** @type {anychart.mapModule.Series|anychart.treemapModule.Chart|anychart.tagCloudModule.Chart} */ (this.target_);
    var iterator = /** @type {anychart.mapModule.Series|anychart.treemapModule.Chart|anychart.tagCloudModule.Chart} */(target).getResetIterator();
    while (iterator.advance()) {
      var category = goog.isDef(target.categoryFieldName) ? iterator.meta(target.categoryFieldName) : null;
      var pointValue = category || iterator.get(target.drawer ? target.drawer.valueFieldName : target.referenceValueNames[1]);
      var range = scale.getRangeByValue(/** @type {number} */(pointValue));
      if (range) {
        if (!this.rangeRegions_[range.sourceIndex]) this.rangeRegions_[range.sourceIndex] = [];
        this.rangeRegions_[range.sourceIndex].push(iterator.getIndex());
      }
    }
  }
};


/** @inheritDoc */
anychart.colorScalesModule.ui.ColorRange.prototype.getLabelsFormatProvider = function(index, value) {
  var scale = this.scale();

  var provider = {};
  var labelText, labelValue;
  if (anychart.utils.instanceOf(scale, anychart.colorScalesModule.Linear)) {
    labelText = parseFloat(value);
    labelValue = parseFloat(value);
  } else if (anychart.utils.instanceOf(scale, anychart.colorScalesModule.Ordinal)) {
    labelText = scale.ticks().names()[index];
    labelValue = value;

    var range = scale.getRangeByValue(/** @type {number} */(value));
    if (range) {
      provider['colorRange'] = {
        'color': range.color,
        'end': range.end,
        'name': range.name,
        'start': range.start,
        'index': range.sourceIndex
      };
    }
  }

  provider['index'] = index;
  provider['value'] = labelText;
  provider['tickValue'] = labelValue;
  provider['max'] = scale.max ? scale.max : null;
  provider['min'] = scale.min ? scale.min : null;
  provider['scale'] = scale;

  return provider;
};


/** @inheritDoc */
anychart.colorScalesModule.ui.ColorRange.prototype.getAffectBoundsTickLength = function(ticks, opt_side) {
  var result = 0;
  if (ticks.enabled()) {
    var length = /** @type {number} */(ticks.length());

    if (ticks.position() == anychart.enums.SidePosition.CENTER) {
      result = Math.max((length - this.colorLineSize_) / 2, 0);
    } else {
      if (goog.isDef(opt_side)) {
        if (opt_side > 0) {
          if (ticks.position() == anychart.enums.SidePosition.OUTSIDE)
            result = 0;
          else
            result = length;
        } else if (opt_side < 0) {
          if (ticks.position() == anychart.enums.SidePosition.INSIDE)
            result = 0;
          else
            result = length;
        } else {
          result = length;
        }
      } else
        result = length;
    }
  }
  return result;
};


/** @inheritDoc */
anychart.colorScalesModule.ui.ColorRange.prototype.drawTopLine = function(bounds, pixelShift, lineThickness, offset, size) {
  var y = bounds.top + bounds.height + lineThickness / 2 - offset;

  var scale = this.scale();
  if (anychart.utils.instanceOf(scale, anychart.colorScalesModule.Linear)) {
    this.line
        .moveTo(bounds.left + pixelShift, y)
        .lineTo(bounds.left - pixelShift + bounds.width, y)
        .lineTo(bounds.left - pixelShift + bounds.width, y - size)
        .lineTo(bounds.left + pixelShift, y - size)
        .close();
  } else if (anychart.utils.instanceOf(scale, anychart.colorScalesModule.Ordinal)) {
    var ranges = scale.getProcessedRanges();
    var colors = scale.colors();

    var partLength = bounds.width / ranges.length;
    for (var i = 0, len = ranges.length; i < len; i++) {
      var range = ranges[i];
      var color = range['color'] || colors[range.sourceIndex] || colors[colors.length - 1];

      var line = this.lines[i] ? this.lines[i].clear() : this.lines[i] = this.line.path();
      var x = bounds.left + pixelShift + partLength * i;
      line
          .moveTo(x, y)
          .lineTo(x + partLength, y)
          .lineTo(x + partLength, y - size)
          .lineTo(x, y - size)
          .close();

      line.stroke(/** @type {acgraph.vector.Stroke} */(this.stroke()));
      line.fill(color);
    }
  }
};


/** @inheritDoc */
anychart.colorScalesModule.ui.ColorRange.prototype.drawRightLine = function(bounds, pixelShift, lineThickness, offset, size) {
  var x = bounds.left - lineThickness / 2 + offset;

  var scale = this.scale();
  if (anychart.utils.instanceOf(scale, anychart.colorScalesModule.Linear)) {
    this.line
        .moveTo(x, bounds.top + pixelShift)
        .lineTo(x, bounds.top - pixelShift + bounds.height)
        .lineTo(x + size, bounds.top - pixelShift + bounds.height)
        .lineTo(x + size, bounds.top + pixelShift)
        .close();
  } else if (anychart.utils.instanceOf(scale, anychart.colorScalesModule.Ordinal)) {
    var ranges = scale.getProcessedRanges();
    var colors = scale.colors();

    var partLength = bounds.height / ranges.length;
    for (var i = 0, len = ranges.length; i < len; i++) {
      var range = ranges[i];
      var color = range['color'] || colors[range.sourceIndex] || colors[colors.length - 1];

      var line = this.lines[i] ? this.lines[i].clear() : this.lines[i] = this.line.path();
      var y = bounds.top + pixelShift + partLength * (ranges.length - 1 - i);
      line
          .moveTo(x, y)
          .lineTo(x, y + partLength)
          .lineTo(x + size, y + partLength)
          .lineTo(x + size, y)
          .close();

      line.stroke(/** @type {acgraph.vector.Stroke} */(this.stroke()));
      line.fill(color);
    }
  }
};


/** @inheritDoc */
anychart.colorScalesModule.ui.ColorRange.prototype.drawBottomLine = function(bounds, pixelShift, lineThickness, offset, size) {
  var y = bounds.top - lineThickness / 2 + offset;

  var scale = this.scale();
  if (anychart.utils.instanceOf(scale, anychart.colorScalesModule.Linear)) {
    this.line
        .moveTo(bounds.left + pixelShift, y)
        .lineTo(bounds.left - pixelShift + bounds.width, y)
        .lineTo(bounds.left - pixelShift + bounds.width, y + size)
        .lineTo(bounds.left + pixelShift, y + size)
        .close();
  } else if (anychart.utils.instanceOf(scale, anychart.colorScalesModule.Ordinal)) {
    var ranges = scale.getProcessedRanges();
    var colors = scale.colors();

    var partLength = bounds.width / ranges.length;
    for (var i = 0, len = ranges.length; i < len; i++) {
      var range = ranges[i];
      var color = range['color'] || colors[range.sourceIndex] || colors[colors.length - 1];

      var line = this.lines[i] ? this.lines[i].clear() : this.lines[i] = this.line.path();
      var x = bounds.left + pixelShift + partLength * i;
      line
          .moveTo(x, y)
          .lineTo(x + partLength, y)
          .lineTo(x + partLength, y + size)
          .lineTo(x, y + size)
          .close();

      line.stroke(/** @type {acgraph.vector.Stroke} */(this.stroke()));
      line.fill(color);
    }
  }
};


/** @inheritDoc */
anychart.colorScalesModule.ui.ColorRange.prototype.drawLeftLine = function(bounds, pixelShift, lineThickness, offset, size) {
  var x = bounds.left + bounds.width + lineThickness / 2 - offset;

  var scale = this.scale();
  if (anychart.utils.instanceOf(scale, anychart.colorScalesModule.Linear)) {
    this.line
        .moveTo(x, bounds.top + pixelShift)
        .lineTo(x, bounds.top - pixelShift + bounds.height)
        .lineTo(x - size, bounds.top - pixelShift + bounds.height)
        .lineTo(x - size, bounds.top + pixelShift)
        .close();
  } else if (anychart.utils.instanceOf(scale, anychart.colorScalesModule.Ordinal)) {
    var ranges = scale.getProcessedRanges();
    var colors = scale.colors();

    var partLength = bounds.height / ranges.length;
    for (var i = 0, len = ranges.length; i < len; i++) {
      var range = ranges[i];
      var color = range['color'] || colors[range.sourceIndex] || colors[colors.length - 1];

      var line = this.lines[i] ? this.lines[i].clear() : this.lines[i] = this.line.path();
      var y = bounds.top + pixelShift + partLength * (ranges.length - 1 - i);
      line
          .moveTo(x, y)
          .lineTo(x, y + partLength)
          .lineTo(x - size, y + partLength)
          .lineTo(x - size, y)
          .close();

      line.stroke(/** @type {acgraph.vector.Stroke} */(this.stroke()));
      line.fill(color);
    }
  }
};


/** @inheritDoc */
anychart.colorScalesModule.ui.ColorRange.prototype.drawLine = function() {
  var line = this.getLine();
  var scale = this.scale();

  if (!scale)
    this.scale(anychart.scales.linearColor());

  if (anychart.utils.instanceOf(scale, anychart.colorScalesModule.Linear)) {
    line.clear();
    line.stroke(/** @type {acgraph.vector.Stroke} */(this.stroke()));
    var fill = acgraph.vector.normalizeFill(/** @type {!Array.<acgraph.vector.GradientKey>} */(scale.colors()));
    if (this.isHorizontal())
      fill['angle'] = 0;
    else
      fill['angle'] = 90;
    line.fill(fill);
  } else if (anychart.utils.instanceOf(scale, anychart.colorScalesModule.Ordinal)) {
    for (var i = 0, len = this.lines.length; i < len; i++)
      this.lines[i].clear();
  }

  var orientation = /** @type {anychart.enums.Orientation} */(this.orientation());
  var lineDrawer;
  switch (orientation) {
    case anychart.enums.Orientation.TOP:
      lineDrawer = this.drawTopLine;
      break;
    case anychart.enums.Orientation.RIGHT:
      lineDrawer = this.drawRightLine;
      break;
    case anychart.enums.Orientation.BOTTOM:
      lineDrawer = this.drawBottomLine;
      break;
    case anychart.enums.Orientation.LEFT:
      lineDrawer = this.drawLeftLine;
      break;
  }

  var stroke = this.stroke();
  var lineThickness = !stroke || anychart.utils.isNone(stroke) ? 0 : stroke['thickness'] ? parseFloat(this.stroke()['thickness']) : 1;
  var pixelShift = lineThickness % 2 == 0 ? 0 : 0.5;
  var bounds = this.getPixelBounds();
  var markerSize = this.getMarkerSpace_();
  var size = Math.round(this.colorLineSize_);
  var tickOffset = this.getAffectBoundsTickLength(/** @type {!anychart.core.AxisTicks} */(this.ticks()), 1);
  var minorTickOffset = this.getAffectBoundsTickLength(/** @type {!anychart.core.AxisTicks} */(this.minorTicks()), 1);
  var offset = Math.max(tickOffset, minorTickOffset, markerSize);

  lineDrawer.call(this, bounds, pixelShift, lineThickness, offset, size);
};


/**
 * Getter for marker space relative orientation.
 * @return {number}
 * @private
 */
anychart.colorScalesModule.ui.ColorRange.prototype.getMarkerSpace_ = function() {
  var markerSpace = 0;
  if (this.marker_ && this.marker_.enabled()) {
    var orientation = /** @type {anychart.enums.Orientation} */(this.orientation());
    markerSpace = this.marker_.size() * 2;

    var offsetX = goog.isDef(this.marker_.offsetX()) ? this.marker_.offsetX() : 0;
    var offsetY = goog.isDef(this.marker_.offsetY()) ? this.marker_.offsetY() : 0;
    switch (orientation) {
      case anychart.enums.Orientation.TOP:
        markerSpace += offsetY;
        break;
      case anychart.enums.Orientation.RIGHT:
        markerSpace -= offsetX;
        break;
      case anychart.enums.Orientation.BOTTOM:
        markerSpace -= offsetY;
        break;
      case anychart.enums.Orientation.LEFT:
        markerSpace += offsetX;
        break;
    }
  }
  return markerSpace;
};


/** @inheritDoc */
anychart.colorScalesModule.ui.ColorRange.prototype.getPixelBounds = function() {
  if (!this.pixelBounds || this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    var parentBounds = /** @type {anychart.math.Rect} */(this.parentBounds());

    if (parentBounds) {
      var parentLength, parentSize;

      parentBounds.top = Math.round(parentBounds.top);
      parentBounds.left = Math.round(parentBounds.left);
      parentBounds.width = Math.round(parentBounds.width);
      parentBounds.height = Math.round(parentBounds.height);

      if (this.isHorizontal()) {
        parentLength = parentBounds.width;
        parentSize = parentBounds.height;
      } else {
        parentLength = parentBounds.height;
        parentSize = parentBounds.width;
      }

      var length = this.getLength(parentLength);
      var size = this.width() ?
          anychart.utils.normalizeSize(/** @type {null|number|string} */(this.width()), parentSize) :
          this.getSize(parentBounds, length);

      var x, y;
      var padding = this.padding();
      var topPad = anychart.utils.normalizeSize(/** @type {number|string} */(padding.getOption('top')), parentBounds.height);
      var rightPad = anychart.utils.normalizeSize(/** @type {number|string} */(padding.getOption('right')), parentBounds.width);
      var bottomPad = anychart.utils.normalizeSize(/** @type {number|string} */(padding.getOption('bottom')), parentBounds.height);
      var leftPad = anychart.utils.normalizeSize(/** @type {number|string} */(padding.getOption('left')), parentBounds.width);

      var align = this.align();
      var offset;
      if (this.isHorizontal()) {
        if (length + rightPad + leftPad > parentLength)
          length = parentLength - (rightPad + leftPad);
        if (align == anychart.enums.Align.LEFT || align == anychart.enums.Align.TOP) {
          offset = leftPad;
        } else if (align == anychart.enums.Align.RIGHT || align == anychart.enums.Align.BOTTOM) {
          offset = parentLength - length - rightPad;
        } else if (align == anychart.enums.Align.CENTER) {
          offset = (parentLength - length - rightPad - leftPad) / 2;
        }
      } else {
        if (length + bottomPad + topPad > parentLength)
          length = parentLength - (bottomPad + topPad);
        if (align == anychart.enums.Align.LEFT || align == anychart.enums.Align.TOP) {
          offset = topPad;
        } else if (align == anychart.enums.Align.RIGHT || align == anychart.enums.Align.BOTTOM) {
          offset = parentLength - length - bottomPad;
        } else if (align == anychart.enums.Align.CENTER) {
          offset = (parentLength - length - bottomPad - topPad) / 2;
        }
      }

      var width, height;
      switch (this.orientation()) {
        case anychart.enums.Orientation.TOP:
          y = parentBounds.top + topPad;
          x = parentBounds.left + offset;
          height = size;
          width = length;
          break;
        case anychart.enums.Orientation.RIGHT:
          y = parentBounds.top + offset;
          x = parentBounds.left + parentBounds.width - size - rightPad;
          height = length;
          width = size;
          break;
        case anychart.enums.Orientation.BOTTOM:
          y = parentBounds.top + parentBounds.height - size - bottomPad;
          x = parentBounds.left + offset;
          height = size;
          width = length;
          break;
        case anychart.enums.Orientation.LEFT:
          y = parentBounds.top + offset;
          x = parentBounds.left + leftPad;
          height = length;
          width = size;
          break;
      }
      this.pixelBounds = new anychart.math.Rect(Math.round(x), Math.round(y), Math.round(width), Math.round(height));
    } else {
      this.pixelBounds = new anychart.math.Rect(0, 0, 0, 0);
    }
    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }
  return this.pixelBounds;
};


/** @inheritDoc */
anychart.colorScalesModule.ui.ColorRange.prototype.getLength = function(parentLength) {
  return anychart.utils.normalizeSize(this.length_, parentLength);
};


/** @inheritDoc */
anychart.colorScalesModule.ui.ColorRange.prototype.calcSize = function(maxLabelSize, maxMinorLabelSize) {
  var ticks = this.ticks();
  var minorTicks = this.minorTicks();

  var ticksLength = this.getAffectBoundsTickLength(/** @type {!anychart.core.AxisTicks} */(ticks));
  var minorTicksLength = this.getAffectBoundsTickLength(/** @type {!anychart.core.AxisTicks} */(minorTicks));

  var outsideSize = 0;
  var insideSize = this.getMarkerSpace_();

  var sumTicksAndLabelsSizes, sumMinorTicksAndLabelsSizes;
  if (ticks.position() == anychart.enums.SidePosition.OUTSIDE) {
    if (minorTicks.position() == anychart.enums.SidePosition.OUTSIDE) {
      sumTicksAndLabelsSizes = maxLabelSize + ticksLength;
      sumMinorTicksAndLabelsSizes = maxMinorLabelSize + minorTicksLength;
      outsideSize = Math.max(sumTicksAndLabelsSizes, sumMinorTicksAndLabelsSizes);
    } else if (minorTicks.position() == anychart.enums.SidePosition.INSIDE) {
      sumTicksAndLabelsSizes = maxLabelSize + ticksLength;
      outsideSize = Math.max(sumTicksAndLabelsSizes, maxMinorLabelSize);
      insideSize = Math.max(minorTicksLength, insideSize);
    } else {
      sumTicksAndLabelsSizes = maxLabelSize + ticksLength;
      sumMinorTicksAndLabelsSizes = maxMinorLabelSize + minorTicksLength;
      outsideSize = Math.max(sumTicksAndLabelsSizes, sumMinorTicksAndLabelsSizes);
      insideSize = Math.max(minorTicksLength, insideSize);
    }
  } else if (ticks.position() == anychart.enums.SidePosition.INSIDE) {
    if (minorTicks.position() == anychart.enums.SidePosition.OUTSIDE) {
      sumMinorTicksAndLabelsSizes = maxMinorLabelSize + minorTicksLength;
      outsideSize = Math.max(maxLabelSize, sumMinorTicksAndLabelsSizes);
      insideSize = Math.max(ticksLength, insideSize);
    } else if (minorTicks.position() == anychart.enums.SidePosition.INSIDE) {
      outsideSize = Math.max(maxLabelSize, maxMinorLabelSize);
      insideSize = Math.max(ticksLength, minorTicksLength, insideSize);
    } else {
      sumMinorTicksAndLabelsSizes = maxMinorLabelSize + minorTicksLength;
      outsideSize = Math.max(maxLabelSize, sumMinorTicksAndLabelsSizes);
      insideSize = Math.max(ticksLength, minorTicksLength, insideSize);
    }
  } else {
    if (minorTicks.position() == anychart.enums.SidePosition.OUTSIDE) {
      sumTicksAndLabelsSizes = maxLabelSize + ticksLength;
      sumMinorTicksAndLabelsSizes = maxMinorLabelSize + minorTicksLength;
      outsideSize = Math.max(sumTicksAndLabelsSizes, sumMinorTicksAndLabelsSizes);
      insideSize = Math.max(ticksLength, insideSize);
    } else if (minorTicks.position() == anychart.enums.SidePosition.INSIDE) {
      sumTicksAndLabelsSizes = maxLabelSize + ticksLength;
      outsideSize = Math.max(sumTicksAndLabelsSizes, maxMinorLabelSize);
      insideSize = Math.max(ticksLength, minorTicksLength, insideSize);
    } else {
      sumTicksAndLabelsSizes = maxLabelSize + ticksLength;
      sumMinorTicksAndLabelsSizes = maxMinorLabelSize + minorTicksLength;
      outsideSize = Math.max(sumTicksAndLabelsSizes, sumMinorTicksAndLabelsSizes);
      insideSize = Math.max(ticksLength, minorTicksLength, insideSize);
    }
  }

  var stroke = this.stroke();
  var lineThickness = !stroke || anychart.utils.isNone(stroke) ? 0 : stroke['thickness'] ? parseFloat(stroke['thickness']) : 1;
  var colorLineSizePx = Math.round(this.colorLineSize_) + lineThickness;

  return outsideSize + insideSize + colorLineSizePx;
};


/**
 * Shows color range marker.
 * @param {number} value Value.
 */
anychart.colorScalesModule.ui.ColorRange.prototype.showMarker = function(value) {
  // if (isNaN(+value)) return;

  var scale = this.scale();
  var target = /** @type {anychart.mapModule.Series|anychart.tagCloudModule.Chart} */(this.target_);
  var targetScale = target.colorScale() || (target.getColorScale ? target.getColorScale() : void 0);
  var isMarker = this.marker_ && this.marker_.enabled();
  var isTarget = target && target.enabled() && targetScale == scale;

  if (this.enabled() && isMarker && scale && isTarget) {
    var lineBounds = this.line.getBounds();
    var ratio = goog.math.clamp(this.scale().transform(value, .5), 0, 1);

    if (isNaN(ratio)) return;

    var orientation = this.orientation();
    var x, y, rotation;
    switch (orientation) {
      case anychart.enums.Orientation.TOP:
        x = lineBounds.left + lineBounds.width * ratio;
        y = lineBounds.top + lineBounds.height + this.marker_.size();
        rotation = 180;
        break;
      case anychart.enums.Orientation.BOTTOM:
        x = lineBounds.left + lineBounds.width * ratio;
        y = lineBounds.top - this.marker_.size();
        rotation = 0;
        break;
      case anychart.enums.Orientation.LEFT:
        x = lineBounds.left + lineBounds.width + this.marker_.size();
        y = lineBounds.top + lineBounds.height - (lineBounds.height * ratio);
        rotation = 90;
        break;
      case anychart.enums.Orientation.RIGHT:
        x = lineBounds.left - this.marker_.size();
        y = lineBounds.top + lineBounds.height - (lineBounds.height * ratio);
        rotation = -90;
        break;
    }

    this.marker_
        .suspendSignalsDispatching()
        .rotation(rotation)
        .positionProvider({'value': {x: x, y: y}})
        .resumeSignalsDispatching(false)
        .draw();
    this.marker_.getDomElement().visible(true);
  }
};


/**
 * Hides color range marker.
 */
anychart.colorScalesModule.ui.ColorRange.prototype.hideMarker = function() {
  if (this.scale() && this.marker_)
    this.marker_.getDomElement().visible(false);
};


/** @inheritDoc */
anychart.colorScalesModule.ui.ColorRange.prototype.scale = function(opt_value) {
  return anychart.colorScalesModule.ui.ColorRange.base(this, 'scale', opt_value) || this.getTempScale();
};


/** @inheritDoc */
anychart.colorScalesModule.ui.ColorRange.prototype.getAllowedScaleTypes = function() {
  return anychart.scales.Base.ScaleTypes.COLOR_SCALES;
};


/** @inheritDoc */
anychart.colorScalesModule.ui.ColorRange.prototype.scaleInvalidated = function(e) {
  if (e.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.removeLines();
  }
  anychart.colorScalesModule.ui.ColorRange.base(this, 'scaleInvalidated', e);
};


/**
 * Create/get temp scale. If color range doesn't have scale then creates temp scale.
 * @return {anychart.colorScalesModule.Linear}
 */
anychart.colorScalesModule.ui.ColorRange.prototype.getTempScale = function() {
  if (!this.getTempScale_) {
    this.getTempScale_ = anychart.scales.linearColor();
    this.getTempScale_.colors('#fff', '#000');
  }
  return this.getTempScale_;
};


/** @inheritDoc */
anychart.colorScalesModule.ui.ColorRange.prototype.draw = function() {
  if (!this.checkDrawingNeeded())
    return this;

  if (this.hasInvalidationState(anychart.ConsistencyState.COLOR_RANGE_MARKER)) {
    if (this.marker_) {
      this.marker_.container(this.container());
      this.marker_.zIndex(/** @type {number} */(this.zIndex() + 1));
      this.marker_.draw();
      this.marker_.getDomElement().visible(false);
    }
    this.markConsistent(anychart.ConsistencyState.COLOR_RANGE_MARKER);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    if (this.marker_)
      this.marker_.container(this.container());
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    if (this.marker_) {
      var zIndex = /** @type {number} */(this.zIndex());
      this.marker_.zIndex(zIndex + 1);
    }
  }

  return anychart.colorScalesModule.ui.ColorRange.base(this, 'draw');
};


/**
 * @param {anychart.core.MouseEvent} event .
 */
anychart.colorScalesModule.ui.ColorRange.prototype.handleMouseClick = function(event) {
  var scale = this.scale();
  var target = /** @type {anychart.mapModule.Series|anychart.treemapModule.Chart|anychart.tagCloudModule.Chart} */(this.target_);
  var targetScale = target.colorScale() || target.getColorScale();

  if (this.enabled() && scale && target && target.enabled() && targetScale == scale) {
    var lineBounds = this.line.getBounds();
    var x, y, min, ratio, value;
    if (this.isHorizontal()) {
      x = event['clientX'];
      min = lineBounds.left + this.container().getStage().getClientPosition().x;
      ratio = (x - min) / lineBounds.width;
    } else {
      y = event['clientY'];
      min = lineBounds.top + this.container().getStage().getClientPosition().y;
      ratio = (lineBounds.height - (y - min)) / lineBounds.height;
    }

    value = /** @type {number} */(scale.inverseTransform(ratio));
    if (!(event.metaKey || event.shiftKey) && target.map) {
      target.map.unselect();
    }
    var iterator, pointValue, points, chart, interactivity;
    if (anychart.utils.instanceOf(scale, anychart.colorScalesModule.Ordinal)) {
      var range = scale.getRangeByValue(/** @type {string|number} */(value));
      if (scale && target) {
        points = this.rangeRegions_[range.sourceIndex];
        chart = /** @type {anychart.core.SeparateChart} */(target.getChart());
        interactivity = /** @type {anychart.core.utils.Interactivity} */(chart.interactivity());
        if (interactivity.hoverMode() == anychart.enums.HoverMode.SINGLE) {
          this.points_ = {
            series: target,
            points: points
          };
        } else {
          this.points_ = [{
            series: target,
            points: points,
            lastPoint: points[points.length - 1],
            nearestPointToCursor: {index: points[points.length - 1], distance: 0}
          }];
        }
      }

    } else if (anychart.utils.instanceOf(scale, anychart.colorScalesModule.Linear)) {
      iterator = target.getResetIterator();
      var minLength = Infinity;
      var targetValue = NaN;
      var scaleMin = /** @type {number} */(scale.minimum());
      var scaleMax = /** @type {number} */(scale.maximum());
      while (iterator.advance()) {
        pointValue = /** @type {number} */(iterator.get(target.drawer ? target.drawer.valueFieldName : target.referenceValueNames[1]));
        pointValue = goog.math.clamp(pointValue, scaleMin, scaleMax);
        var currLength = Math.abs(value - pointValue);
        if (minLength > currLength) {
          minLength = currLength;
          targetValue = pointValue;
        }
      }

      points = [];
      iterator = target.getResetIterator();
      value = targetValue;

      while (iterator.advance()) {
        pointValue = /** @type {number} */(iterator.get(target.drawer ? target.drawer.valueFieldName : target.referenceValueNames[1]));
        pointValue = goog.math.clamp(pointValue, scaleMin, scaleMax);
        if (pointValue == value)
          points.push(iterator.getIndex());
      }

      if (scale && target) {
        chart = /** @type {anychart.core.SeparateChart} */(target.getChart());
        interactivity = /** @type {anychart.core.utils.Interactivity} */(chart.interactivity());
        if (interactivity.hoverMode() == anychart.enums.HoverMode.SINGLE) {
          this.points_ = {
            series: target,
            points: points
          };
        } else {
          this.points_ = [{
            series: target,
            points: points,
            lastPoint: points[points.length - 1],
            nearestPointToCursor: {index: points[points.length - 1], distance: 0}
          }];
        }
      }
    }
  }
};


/**
 * @param {anychart.core.MouseEvent} event .
 */
anychart.colorScalesModule.ui.ColorRange.prototype.handleMouseOverAndMove = function(event) {
  var scale = this.scale();
  var target = /** @type {anychart.mapModule.Series|anychart.treemapModule.Chart|anychart.tagCloudModule.Chart} */(this.target_);
  var targetScale = target.colorScale() || target.getColorScale();
  if (this.enabled() && scale && target && target.enabled() && targetScale == scale) {
    var lineBounds = this.line.getBounds();
    var x, y, min, ratio, value;
    if (this.isHorizontal()) {
      x = event['clientX'];
      min = lineBounds.left + this.container().getStage().getClientPosition().x;
      ratio = (x - min) / lineBounds.width;
    } else {
      y = event['clientY'];
      min = lineBounds.top + this.container().getStage().getClientPosition().y;
      ratio = (lineBounds.height - (y - min)) / lineBounds.height;
    }

    var iterator, pointValue, points, chart, interactivity;
    value = /** @type {number} */(scale.inverseTransform(ratio));
    if (anychart.utils.instanceOf(scale, anychart.colorScalesModule.Ordinal)) {
      var range = scale.getRangeByValue(/** @type {string|number} */(value));
      points = this.rangeRegions_[range.sourceIndex];
      chart = /** @type {anychart.core.SeparateChart} */(target.getChart());
      interactivity = /** @type {anychart.core.utils.Interactivity} */(chart.interactivity());
      if (interactivity.hoverMode() == anychart.enums.HoverMode.SINGLE) {
        this.points_ = {
          series: target,
          points: points
        };
      } else {
        this.points_ = [{
          series: target,
          points: points,
          lastPoint: points[points.length - 1],
          nearestPointToCursor: {index: points[points.length - 1], distance: 0}
        }];
      }
    } else if (anychart.utils.instanceOf(scale, anychart.colorScalesModule.Linear) && target) {
      iterator = target.getResetIterator();
      var minLength = Infinity;
      var targetValue = NaN;
      var scaleMin = /** @type {number} */(scale.minimum());
      var scaleMax = /** @type {number} */(scale.maximum());

      while (iterator.advance()) {
        pointValue = /** @type {number} */(iterator.get(target.drawer ? target.drawer.valueFieldName : target.referenceValueNames[1]));
        pointValue = goog.math.clamp(pointValue, scaleMin, scaleMax);
        var currLength = Math.abs(value - pointValue);
        if (minLength > currLength) {
          minLength = currLength;
          targetValue = pointValue;
        }
      }

      points = [];
      iterator = target.getResetIterator();
      value = targetValue;
      while (iterator.advance()) {
        pointValue = /** @type {number} */(iterator.get(target.drawer ? target.drawer.valueFieldName : target.referenceValueNames[1]));
        pointValue = goog.math.clamp(pointValue, scaleMin, scaleMax);
        if (pointValue == value)
          points.push(iterator.getIndex());
      }

      if (scale && target) {
        chart = /** @type {anychart.core.SeparateChart} */(target.getChart());
        interactivity = /** @type {anychart.core.utils.Interactivity} */(chart.interactivity());
        if (interactivity.hoverMode() == anychart.enums.HoverMode.SINGLE) {
          var dispatchUnhover = this.points_ && !goog.array.every(points, function(el) {
            return goog.array.contains(this.points_.points, el);
          }, this);

          if (dispatchUnhover) {
            var nearestPointIndex = this.points_.points[this.points_.points.length - 1];
            chart.dispatchEvent(chart.makeInteractivityPointEvent('hovered', event, [{
              series: target,
              points: [],
              nearestPointToCursor: {index: nearestPointIndex, distance: 0}
            }], false));
          }

          this.points_ = {
            series: target,
            points: points
          };
        } else {
          this.points_ = [{
            series: target,
            points: points,
            lastPoint: points[points.length - 1],
            nearestPointToCursor: {index: points[points.length - 1], distance: 0}
          }];
        }
      }

    }
    this.showMarker(value);
  }
};


/**
 * @param {anychart.core.MouseEvent} event .
 */
anychart.colorScalesModule.ui.ColorRange.prototype.handleMouseOut = function(event) {
  this.hideMarker();

  var target = /** @type {anychart.mapModule.Series|anychart.tagCloudModule.Chart} */(this.target_);
  if (target)
    this.series_ = target;
};


/** @inheritDoc */
anychart.colorScalesModule.ui.ColorRange.prototype.remove = function() {
  anychart.colorScalesModule.ui.ColorRange.base(this, 'remove');
  if (this.marker_) this.marker_.remove();
};


/** @inheritDoc */
anychart.colorScalesModule.ui.ColorRange.prototype.serialize = function() {
  var json = anychart.colorScalesModule.ui.ColorRange.base(this, 'serialize');
  json['marker'] = this.marker().serialize();
  json['colorLineSize'] = this.colorLineSize();
  json['length'] = this.length();
  json['align'] = this.align();
  return json;
};


/** @inheritDoc */
anychart.colorScalesModule.ui.ColorRange.prototype.setupByJSON = function(config, opt_default) {
  anychart.colorScalesModule.ui.ColorRange.base(this, 'setupByJSON', config, opt_default);
  this.marker(config['marker']);
  this.colorLineSize(config['colorLineSize']);
  this.length(config['length']);
  this.align(config['align']);
};



/**
 * @constructor
 * @extends {anychart.colorScalesModule.ui.ColorRange}
 */
anychart.standalones.ColorRange = function() {
  anychart.standalones.ColorRange.base(this, 'constructor');
};
goog.inherits(anychart.standalones.ColorRange, anychart.colorScalesModule.ui.ColorRange);
anychart.core.makeStandalone(anychart.standalones.ColorRange, anychart.colorScalesModule.ui.ColorRange);


/**
 * Returns color range instance.
 * @return {!anychart.standalones.ColorRange}
 */
anychart.standalones.colorRange = function() {
  var colorRange = new anychart.standalones.ColorRange();
  colorRange.setupInternal(true, anychart.getFullTheme('standalones.colorRange'));
  return colorRange;
};


//exports
(function() {
  var proto = anychart.colorScalesModule.ui.ColorRange.prototype;
  proto['marker'] = proto.marker;
  proto['colorLineSize'] = proto.colorLineSize;
  proto['length'] = proto.length;
  proto['align'] = proto.align;

  proto = anychart.standalones.ColorRange.prototype;
  goog.exportSymbol('anychart.standalones.colorRange', anychart.standalones.colorRange);
  proto['padding'] = proto.padding;
  proto['draw'] = proto.draw;
  proto['parentBounds'] = proto.parentBounds;
  proto['container'] = proto.container;
  proto['colorLineSize'] = proto.colorLineSize;
})();

