goog.provide('anychart.waterfallModule.Chart');

goog.require('anychart.core.CartesianBase');
goog.require('anychart.core.settings');
goog.require('anychart.core.shapeManagers');
goog.require('anychart.core.ui.LabelsFactory');
goog.require('anychart.enums');
goog.require('anychart.format.Context');
goog.require('anychart.waterfallModule.ArrowsController');
goog.require('anychart.waterfallModule.Connectors');
goog.require('anychart.waterfallModule.Series');



/**
 * Waterfall chart class.<br/>
 * To get the chart use these method:
 *  <ul>
 *      <li>{@link anychart.waterfall}</li>
 *  </ul>
 * @extends {anychart.core.CartesianBase}
 * @constructor
 */
anychart.waterfallModule.Chart = function() {
  anychart.waterfallModule.Chart.base(this, 'constructor');

  this.addThemes('waterfall');

  this.setType(anychart.enums.ChartTypes.WATERFALL);

  /**
   * Contains pairs of coordinates, which represent start
   * and end of the waterfall connector. They are used
   * for labels connectors position calculation.
   *
   * @type {Array.<{x1: number, y1: number, x2: number, y2: number}>}
   *
   * @private
   */
  this.connectorsPositions_ = [];

  /**
   * Pool of the free contexts.
   * Used to avoid excessive context objects creation.
   * See also getContext_ and resetContextPool_.
   *
   * @type {Array.<anychart.format.Context>}
   *
   * @private
   */
  this.freeContextsPool_ = [];

  /**
   * Pool of the used contexts.
   * See this.freeContextsPool_.
   *
   * @type {Array.<anychart.format.Context>}
   *
   * @private
   */
  this.usedContextsPool_ = [];

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['dataMode', anychart.ConsistencyState.SERIES_CHART_SERIES | anychart.ConsistencyState.SCALE_CHART_SCALES | anychart.ConsistencyState.SCALE_CHART_Y_SCALES, anychart.Signal.NEEDS_REDRAW]
  ]);
};
goog.inherits(anychart.waterfallModule.Chart, anychart.core.CartesianBase);


/**
 * Z-index of the connectors labels layer.
 * Must be above series.
 *
 * @type {number}
 */
anychart.waterfallModule.Chart.ZINDEX_CONNECTORS_LABELS = anychart.core.ChartWithSeries.ZINDEX_SERIES + 1;


/**
 * States that waterfall chart supports.
 *
 * @enum {string}
 */
anychart.waterfallModule.Chart.SUPPORTED_STATES = {
  STACK_LABELS: 'stackLabels',
  CONNECTORS_LABELS: 'connectorsLabels',
  ARROWS: 'arrows'
};


anychart.consistency.supportStates(
    anychart.waterfallModule.Chart,
    anychart.enums.Store.WATERFALL,
    [
     anychart.waterfallModule.Chart.SUPPORTED_STATES.STACK_LABELS,
     anychart.waterfallModule.Chart.SUPPORTED_STATES.CONNECTORS_LABELS,
     anychart.waterfallModule.Chart.SUPPORTED_STATES.ARROWS
    ]
);


//region --- infrastructure
/**
 * Series config for Mekko chart.
 * @type {!Object.<string, anychart.core.series.TypeConfig>}
 */
anychart.waterfallModule.Chart.prototype.seriesConfig = (function() {
  var capabilities = (
      anychart.core.series.Capabilities.ALLOW_INTERACTIVITY |
      anychart.core.series.Capabilities.ALLOW_POINT_SETTINGS |
      // anychart.core.series.Capabilities.ALLOW_ERROR |
      anychart.core.series.Capabilities.SUPPORTS_MARKERS |
      anychart.core.series.Capabilities.SUPPORTS_LABELS | 0);

  var res = {};
  res[anychart.enums.WaterfallSeriesType.WATERFALL] = {
    drawerType: anychart.enums.SeriesDrawerTypes.WATERFALL,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_POINT,
    shapesConfig: [
      anychart.core.shapeManagers.pathRisingFillStrokeConfig,
      anychart.core.shapeManagers.pathRisingHatchConfig,
      anychart.core.shapeManagers.pathFallingFillStrokeConfig,
      anychart.core.shapeManagers.pathFallingHatchConfig,
      anychart.core.shapeManagers.pathFillStrokeConfig,
      anychart.core.shapeManagers.pathHatchConfig
    ],
    secondaryShapesConfig: null,
    postProcessor: null,
    capabilities: capabilities,
    anchoredPositionTop: 'value',
    anchoredPositionBottom: 'zero'
  };
  return res;
})();
anychart.core.ChartWithSeries.generateSeriesConstructors(anychart.waterfallModule.Chart, anychart.waterfallModule.Chart.prototype.seriesConfig);


/** @inheritDoc */
anychart.waterfallModule.Chart.prototype.normalizeSeriesType = function(type) {
  return anychart.enums.WaterfallSeriesType.WATERFALL;
};


/** @inheritDoc */
anychart.waterfallModule.Chart.prototype.getYScaleStackMode = function(yScale) {
  return anychart.enums.ScaleStackMode.VALUE;
};


/** @inheritDoc */
anychart.waterfallModule.Chart.prototype.extendYScaleRange = function(scale, value) {};


/** @inheritDoc */
anychart.waterfallModule.Chart.prototype.getPointStackingValue = function(point) {
  return +point.meta[point.meta['isTotal'] ? 'absolute' : 'diff'];
};


/** @inheritDoc */
anychart.waterfallModule.Chart.prototype.postProcessStacking = function(drawingPlans, firstIndex, lastIndex, yScale) {
  var prevValue = 0;
  var i, point;
  if (firstIndex) {
    for (i = 0; i < drawingPlans.length; i++) {
      point = drawingPlans[i].data[firstIndex - 1];
      prevValue += Number(point.meta['diff']) || 0;
    }
  }
  this.pointValueSums_ = [];
  for (i = firstIndex; i <= lastIndex; i++) {
    var absSum = 0;
    for (var j = 0; j < drawingPlans.length; j++) {
      point = drawingPlans[j].data[i];
      if (!point.meta['isTotal']) {
        point.meta['stackedZero'] += prevValue;
        point.meta['stackedValue'] += prevValue;
        point.meta['stackedZeroPrev'] += prevValue;
        point.meta['stackedValuePrev'] += prevValue;
        point.meta['stackedZeroNext'] += prevValue;
        point.meta['stackedValueNext'] += prevValue;
      }
      yScale.extendDataRange(point.meta['stackedValue']);
      yScale.extendDataRange(point.meta['stackedValuePrev']);
      yScale.extendDataRange(point.meta['stackedValueNext']);
      absSum += !point.meta['missing'] ? (Number(point.meta['diff']) || 0) : 0;
    }
    prevValue += absSum;
    this.pointValueSums_.push(prevValue);
  }
};


/** @inheritDoc */
anychart.waterfallModule.Chart.prototype.drawContent = function(contentBounds) {
  anychart.waterfallModule.Chart.base(this, 'drawContent', contentBounds);

  this.drawLabels();

  this.drawArrows();
};


/**
 * Returns connector x coordinate.
 * @param {number} pointMiddleX - Point middle x value.
 * @param {number} pointHalfWidth - Half point width, positive for left point and negative
 *  for right point.
 * @return {number} - Connector x coordinate.
 */
anychart.waterfallModule.Chart.prototype.getConnectorXCoordinate = function(pointMiddleX, pointHalfWidth) {
  var isVertical = this.isVertical();
  var isXScaleInverted = this.xScale().inverted();

  /*
    Direction is normal when first point middleX value is less than
    the second point middleX. It happens when chart is vertical and has
    inverted xScale or is horizontal and has non-inverted xScale.
    If direction is not normal, half width must be inverted to get
    correct connector coordinate.
   */
  var isDirectionNormal = !(isVertical ^ isXScaleInverted);

  return pointMiddleX + (isDirectionNormal ? pointHalfWidth : -pointHalfWidth);
};


/** @inheritDoc */
anychart.waterfallModule.Chart.prototype.afterSeriesDraw = function() {
  anychart.waterfallModule.Chart.base(this, 'afterSeriesDraw');
  if (!this.connectorPath_) {
    this.connectorPath_ = acgraph.path();
  } else {
    this.connectorPath_.clear();
  }
  var xScale = this.xScale();
  var drawingPlans = this.drawingPlansByXScale[String(goog.getUid(xScale))];
  if (!drawingPlans || !drawingPlans.length)
    return;
  var connectorStroke = /** @type {acgraph.vector.Stroke} */(this.connectors().getOption('stroke'));
  this.connectorPath_.stroke(connectorStroke);
  var thickness = acgraph.vector.getThickness(connectorStroke);
  this.connectorPath_.parent(this.container());
  this.connectorPath_.zIndex(1000);
  this.connectorPath_.clip(this.getPlotBounds());
  var isVertical = /** @type {boolean} */(this.isVertical());
  var individualPointWidths = xScale.checkWeights();
  var firstIndex = drawingPlans[0].firstIndex;
  var lastIndex = drawingPlans[0].lastIndex;
  var leftX, leftY, meta, drawingPlan, pointWidth, rightX, rightY;
  var index = this.getLastNonNaNSeries_(drawingPlans, firstIndex);
  if (isNaN(index)) {
    leftX = leftY = NaN;
  } else {
    drawingPlan = drawingPlans[index];
    meta = drawingPlan.data[firstIndex].meta;
    if (individualPointWidths) {
      pointWidth = drawingPlan.series.getCategoryWidth(goog.isDef(meta['category']) ? /** @type {number} */(meta['category']) : firstIndex);
    } else {
      pointWidth = drawingPlan.series.pointWidthCache;
    }
    leftY = anychart.utils.applyPixelShift(this.transformValue_(this.pointValueSums_[0]), thickness);
    leftX = this.getConnectorXCoordinate(meta['valueX'], pointWidth / 2);
  }

  this.connectorsPositions_.length = 0;
  for (var i = firstIndex + 1; i <= lastIndex; i++) {
    index = this.getFirstNonNaNSeries_(drawingPlans, i);
    if (isNaN(index)) {
      rightX = rightY = NaN;
    } else {
      drawingPlan = drawingPlans[index];
      meta = drawingPlan.data[i].meta;
      if (individualPointWidths) {
        pointWidth = drawingPlan.series.getCategoryWidth(goog.isDef(meta['category']) ? /** @type {number} */(meta['category']) : firstIndex);
      } else {
        pointWidth = drawingPlan.series.pointWidthCache;
      }
      rightY = anychart.utils.applyPixelShift(this.transformValue_(this.pointValueSums_[i - firstIndex - 1]), thickness);
      rightX = this.getConnectorXCoordinate(meta['valueX'], -(pointWidth / 2));
    }
    if (!isNaN(leftX) && !isNaN(leftY)) {
      if (!isNaN(rightX) && !isNaN(rightY)) {
        anychart.core.drawers.move(this.connectorPath_, isVertical, leftX, leftY);
        anychart.core.drawers.line(this.connectorPath_, isVertical, rightX, rightY);
        this.connectorsPositions_.push({
          x1: leftX,
          y1: leftY,
          x2: rightX,
          y2: rightY
        });
      } else {
        continue;
      }
    }
    index = this.getLastNonNaNSeries_(drawingPlans, i);
    if (isNaN(index)) {
      leftX = leftY = NaN;
    } else {
      drawingPlan = drawingPlans[index];
      meta = drawingPlan.data[i].meta;
      if (individualPointWidths) {
        pointWidth = drawingPlan.series.getCategoryWidth(goog.isDef(meta['category']) ? /** @type {number} */(meta['category']) : firstIndex);
      } else {
        pointWidth = drawingPlan.series.pointWidthCache;
      }
      leftY = anychart.utils.applyPixelShift(this.transformValue_(this.pointValueSums_[i - firstIndex]), thickness);
      leftX = this.getConnectorXCoordinate(meta['valueX'], pointWidth / 2);
    }
  }
};


/**
 * Transforms y value to pix coord.
 * @param {*} value
 * @return {number}
 * @private
 */
anychart.waterfallModule.Chart.prototype.transformValue_ = function(value) {
  var ratio = this.yScale().transform(value);
  var bounds = this.dataBounds;
  var min, range;
  if (this.isVertical()) {
    min = bounds.left;
    range = bounds.width;
  } else {
    min = bounds.getBottom();
    range = -bounds.height;
  }
  return min + ratio * range;
};


/**
 * Returns first drawing plan index, that has a non-missing value at the passed index.
 * @param {Array.<Object>} drawingPlans
 * @param {number} index
 * @return {number}
 * @private
 */
anychart.waterfallModule.Chart.prototype.getFirstNonNaNSeries_ = function(drawingPlans, index) {
  for (var i = 0; i < drawingPlans.length; i++) {
    if (!drawingPlans[i].data[index].meta['missing'])
      return i;
  }
  return NaN;
};


/**
 * Returns first drawing plan index, that has a non-missing value at the passed index.
 * @param {Array.<Object>} drawingPlans
 * @param {number} index
 * @return {number}
 * @private
 */
anychart.waterfallModule.Chart.prototype.getLastNonNaNSeries_ = function(drawingPlans, index) {
  for (var i = drawingPlans.length; i--;) {
    var data = drawingPlans[i].data;
    if (data.length && !data[index].meta['missing'])
      return i;
  }
  return NaN;
};


/** @inheritDoc */
anychart.waterfallModule.Chart.prototype.createSeriesInstance = function(type, config) {
  return new anychart.waterfallModule.Series(this, this, type, config, true);
};


//endregion
//region --- api/descriptors
/**
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.waterfallModule.Chart.PROPERTY_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};
  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'dataMode',
      anychart.enums.normalizeWaterfallDataMode);
  return map;
})();
anychart.core.settings.populate(anychart.waterfallModule.Chart, anychart.waterfallModule.Chart.PROPERTY_DESCRIPTORS);


//endregion
//region --- Labels
/**
 * Clears used contexts pool, pushes all items to the free pool.
 * Must be called before any of the getContext_() calls.
 *
 * @private
 */
anychart.waterfallModule.Chart.prototype.resetContextPool_ = function() {
  goog.array.forEach(this.usedContextsPool_, function(value) {
    this.freeContextsPool_.push(value);
  }, this);
  this.usedContextsPool_.length = 0;
};


/**
 * Either returns format context from the pool, or creates new one.
 *
 * @return {anychart.format.Context}
 *
 * @private
 */
anychart.waterfallModule.Chart.prototype.getContext_ = function() {
  var context = this.freeContextsPool_.pop() || new anychart.format.Context();
  this.usedContextsPool_.push(context);
  return context;
};


/**
 * Return format provider for stack labels.
 *
 * @param {number} index - Stack index.
 *
 * @return {anychart.core.BaseContext}
 */
anychart.waterfallModule.Chart.prototype.getFormatProviderForStackedLabel = function(index) {
  var provider = this.getContext_();

  var total = this.getStackSum(index, 'absolute');
  var stackDiff = this.getStackSum(index, 'diff', true);

  var values = {
    'index': {value: index, type: anychart.enums.TokenType.NUMBER},

    // Left for legacy.
    'value': {value: total, type: anychart.enums.TokenType.NUMBER},

    // DVF-4527.
    'total': {value: total, type: anychart.enums.TokenType.NUMBER},
    'stack': {value: stackDiff, type: anychart.enums.TokenType.NUMBER}
  };

  return provider.propagate(values);
};


/**
 * Resolve label position for stack.
 *
 * @param {anychart.enums.Position} position - Labels position of labels factory.
 * @param {number} index - Index of stack.
 *
 * @return {anychart.enums.Position}
 */
anychart.waterfallModule.Chart.prototype.resolvePositionForStackLabel = function(position, index) {
  if (position == anychart.enums.Position.AUTO) {
    var stackDiff = this.getStackSum(index, 'diff');
    return stackDiff >= 0 ? anychart.enums.Position.CENTER_TOP : anychart.enums.Position.CENTER_BOTTOM;
  }

  return position;
};


/**
 * Resolve anchor for specific stack label.
 *
 * @param {anychart.enums.Anchor} anchor - Anchor for stack labels.
 * @param {anychart.enums.Position} position - Position for stack labels.
 * @param {number} index - Index of stack.
 *
 * @return {anychart.enums.Anchor} - Resolved anchor value for stack label.
 */
anychart.waterfallModule.Chart.prototype.resolveAnchorForStackLabel = function(anchor, position, index) {
  if (anchor == anychart.enums.Anchor.AUTO) {
    if (position == anychart.enums.Position.AUTO) {
      var stackDiff = this.getStackSum(index, 'diff');

      anchor = stackDiff >= 0 ? anychart.enums.Anchor.CENTER_BOTTOM : anychart.enums.Anchor.CENTER_TOP;
    } else if (position == anychart.enums.Position.CENTER) {
      anchor = anychart.enums.Anchor.CENTER;
    } else {
      anchor = anychart.utils.rotateAnchor(position, 180);
    }
  }

  return anychart.utils.rotateAnchor(anchor, this.isVertical() ? -90 : 0);
};


/**
 * Return position provider for stack labels.
 *
 * @param {number} index - Stack index.
 * @param {anychart.enums.Position} labelsPosition - Labels position.
 *
 * @return {{value: {x: number, y:number}}} - Position provider.
 */
anychart.waterfallModule.Chart.prototype.getPositionProviderForStackedLabel = function(index, labelsPosition) {
  var bounds = this.getStackBounds(index);
  var position = anychart.utils.getCoordinateByAnchor(bounds, labelsPosition);

  var x = position['x'];
  var y = position['y'];

  var tmpX = x;
  x = this.isVertical() ? y : x;
  y = this.isVertical() ? tmpX : y;

  return {
    'value': {
      x: x,
      y: y
    }
  };
};


/**
 * Returns position provider for connector.
 *
 * @param {number} connectorIndex - Index of the connector.
 * @param {anychart.enums.Position} position - Label position.
 *
 * @return {{value: anychart.math.Coordinate}} - Position provider.
 */
anychart.waterfallModule.Chart.prototype.getPositionProviderForConnectorLabel = function(connectorIndex, position) {
  var connectorBounds = this.getConnectorBounds(connectorIndex);

  return { 'value': anychart.utils.getCoordinateByAnchor(connectorBounds, position) };
};


/**
 * Returns resolved anchor for connector label.
 *
 * @param {anychart.enums.Anchor} anchor - Label anchor.
 * @param {anychart.enums.Position} position - Label position.
 * @param {number} stackContribution - Sum of diff values of the stack.
 *
 * @return {anychart.enums.Anchor}
 */
anychart.waterfallModule.Chart.prototype.resolveAnchorForConnectorLabels = function(anchor, position, stackContribution) {
  if (anchor === anychart.enums.Anchor.AUTO) {
    if (position === anychart.enums.Position.AUTO) {
      var anchors = this.isVertical() ?
          [anychart.enums.Anchor.LEFT_CENTER, anychart.enums.Anchor.RIGHT_CENTER] :
          [anychart.enums.Anchor.CENTER_BOTTOM, anychart.enums.Anchor.CENTER_TOP];
      anchor = stackContribution >= 0 ? anchors[0] : anchors[1];
    } else if (position === anychart.enums.Position.CENTER) {
      anchor = anychart.enums.Anchor.CENTER;
    } else {
      anchor = anychart.utils.rotateAnchor(position, 180);
    }
  }
  return anchor;
};


/**
 * Returns resolved position of the connector label.
 *
 * @param {anychart.enums.Position} position - Label position.
 * @param {number} stackContribution - Sum of diff values of the stack.
 *
 * @return {anychart.enums.Position}
 */
anychart.waterfallModule.Chart.prototype.resolvePositionForConnectorLabels = function(position, stackContribution) {
  if (position === anychart.enums.Position.AUTO) {
    var positions = this.isVertical() ?
        [anychart.enums.Position.RIGHT_CENTER, anychart.enums.Position.LEFT_CENTER] :
        [anychart.enums.Position.CENTER_TOP, anychart.enums.Position.CENTER_BOTTOM];
    return stackContribution >= 0 ? positions[0] : positions[1];
  }

  return position;
};


/**
 * Returns format provider for connector.
 *
 * @param {number} index - Index of the point connector goes to.
 * @param {number} previousIndex - Index of the point connector goes out of.
 *
 * @return {anychart.core.BaseContext}
 */
anychart.waterfallModule.Chart.prototype.getFormatProviderForConnectorLabel = function(index, previousIndex) {
  var provider = this.getContext_();

  provider.statisticsSources([this]);

  var total = this.getStackSum(index, 'diff');

  var previousDiffSum = this.getStackSum(previousIndex, 'diff');
  var previousAbsoluteSum = this.getStackSum(previousIndex, 'absolute');

  var stackPercent = total / Math.abs(previousDiffSum);
  var totalPercent = total / Math.abs(previousAbsoluteSum);

  var isStackFinite = isFinite(stackPercent);
  var isTotalFinite = isFinite(totalPercent);

  var values = {
    'value': {value: total, type: anychart.enums.TokenType.NUMBER},
    'stack': {
      value: isStackFinite ? stackPercent : '-',
      type: isStackFinite ? anychart.enums.TokenType.PERCENT : anychart.enums.TokenType.STRING
    },
    'total': {
      value: isTotalFinite ? totalPercent : '-',
      type: isTotalFinite ? anychart.enums.TokenType.PERCENT : anychart.enums.TokenType.STRING
    }
  };

  return provider.propagate(values);
};


/**
 * Returns format provider for connector.
 *
 * @param {number} toIndex - Index of the point connector goes to.
 * @param {number} fromIndex - Index of the point connector goes out of.
 *
 * @return {anychart.core.BaseContext}
 */
anychart.waterfallModule.Chart.prototype.getFormatProviderForArrow = function(toIndex, fromIndex) {
  var provider = this.getContext_();

  provider.statisticsSources([this]);

  var from = this.getStackSum(fromIndex, 'absolute');
  var to = this.getStackSum(toIndex, 'absolute');

  var diff = to - from;

  var values = {
    'value': {value: diff, type: anychart.enums.TokenType.NUMBER},
    'absolute': {
      value: diff,
      type: anychart.enums.TokenType.NUMBER
    },
    'percent': {
      value: from == 0 ? '-' : diff / Math.abs(from),
      type: from == 0 ? anychart.enums.TokenType.STRING : anychart.enums.TokenType.PERCENT
    }
  };

  return provider.propagate(values);
};


/**
 * Draws connectors labels.
 */
anychart.waterfallModule.Chart.prototype.updateConnectorsLabels = function() {
  /** @type {anychart.core.ui.LabelsFactory} */
  var connectorsLabels = this.connectors().labels();

  if (!this.connectorsLabelsLayer_) {
    this.connectorsLabelsLayer_ = this.rootElement.layer();
    this.connectorsLabelsLayer_.zIndex(anychart.waterfallModule.Chart.ZINDEX_CONNECTORS_LABELS);

    connectorsLabels.container(this.connectorsLabelsLayer_);
  }

  var labelsAnchor = /** @type {anychart.enums.Anchor} */(connectorsLabels.getOption('anchor'));
  var labelsPosition = /** @type {anychart.enums.Position} */(connectorsLabels.getOption('position'));

  var series = this.getSeriesAt(0);
  var iterator = series.getDetachedIterator();

  var lastNonMissingIndex = null;
  var connectorIndex = 0;
  while (iterator.advance()) {
    var index = iterator.getIndex();
    var isConnectorToTotal = iterator.meta('isTotal');

    var pointsMissing = goog.array.reduce(this.seriesList, function(prevValue, curValue) {
      var it = curValue.getIterator();
      it.select(index);
      return it.meta('missing') ? ++prevValue : prevValue;
    }, 0);

    var isLastNull = goog.isNull(lastNonMissingIndex);
    var isStackMissing = pointsMissing == this.seriesList.length;
    if (isLastNull || isStackMissing) {
      // Update last index only if stack we are skipping is not missing.
      lastNonMissingIndex = (isLastNull && !isStackMissing) ? index : lastNonMissingIndex;
      continue;
    }

    // If connector goes to total stack, label is skipped, but last and connector index is updated.
    if (!isConnectorToTotal) {
      var stackContribution = this.getStackSum(index, 'diff');

      var labelAnchor = this.resolveAnchorForConnectorLabels(labelsAnchor, labelsPosition, stackContribution);
      var labelPosition = this.resolvePositionForConnectorLabels(labelsPosition, stackContribution);

      var positionProvider = this.getPositionProviderForConnectorLabel(connectorIndex, labelPosition);
      var formatProvider = this.getFormatProviderForConnectorLabel(
          index,
          /** @type {number} */(lastNonMissingIndex)
          );

      var label = connectorsLabels.add(formatProvider, positionProvider, connectorIndex);

      label.setOption('anchor', labelAnchor);
    }

    lastNonMissingIndex = index;
    connectorIndex++;
  }

  connectorsLabels.draw();
};


/**
 * Checks if connectors labels should be drawn.
 * Draws them if needed. Clears consistency states on them.
 */
anychart.waterfallModule.Chart.prototype.drawConnectorsLabels = function() {
  var boundsInvalidated = this.hasInvalidationState(anychart.ConsistencyState.BOUNDS);

  var connectorsLabelsInvalidated = boundsInvalidated ||
      this.hasStateInvalidation(
          anychart.enums.Store.WATERFALL,
          anychart.waterfallModule.Chart.SUPPORTED_STATES.CONNECTORS_LABELS
      );

  var connectorsLabels = this.connectors().labels();
  if (connectorsLabelsInvalidated) {
    this.connectors().suspendSignalsDispatching();
    connectorsLabels.clear();

    if (connectorsLabels.getOption('enabled') && this.getSeriesCount()) {
      this.updateConnectorsLabels();
    }
    this.connectors().resumeSignalsDispatching(false);
  }

  connectorsLabels.markConsistent(connectorsLabels.SUPPORTED_CONSISTENCY_STATES);
};


/**
 * Draw stack labels of chart.
 */
anychart.waterfallModule.Chart.prototype.updateStackLabels = function() {
  if (!this.stackLabelsLayer_) {
    this.stackLabelsLayer_ = this.rootElement.layer();
    this.stackLabelsLayer_.zIndex(40); //Above series.

    this.stackLabels_.container(this.stackLabelsLayer_);
  }

  var series = this.getSeriesAt(0);

  var iterator = series.getResetIterator();

  var labelsAnchor = this.stackLabels_.anchor();
  var labelsPosition = this.stackLabels_.position();

  while (iterator.advance()) {
    var index = iterator.getIndex();

    if (this.isStackVisible(index)) {
      var labelAnchor = this.resolveAnchorForStackLabel(labelsAnchor, labelsPosition, index);
      var labelPosition = this.resolvePositionForStackLabel(labelsPosition, index);

      var positionProvider = this.getPositionProviderForStackedLabel(index, labelPosition);
      var formatProvider = this.getFormatProviderForStackedLabel(index);

      var label = this.stackLabels_.getLabel(index);

      label = label ? label : this.stackLabels_.add(null, null, index);

      label.formatProvider(formatProvider);
      label.positionProvider(positionProvider);

      label.anchor(labelAnchor);
    }
  }

  this.stackLabels_.draw();
};


/**
 * Checks if stack labels should be drawn.
 * Draws them if needed. Clears consistency state on labels.
 */
anychart.waterfallModule.Chart.prototype.drawStackLabels = function() {
  var boundsInvalidated = this.hasInvalidationState(anychart.ConsistencyState.BOUNDS);

  var stackLabelsInvalidated = boundsInvalidated ||
      this.hasStateInvalidation(
          anychart.enums.Store.WATERFALL,
          anychart.waterfallModule.Chart.SUPPORTED_STATES.STACK_LABELS
      );

  var stackLabels = this.stackLabels();
  if (stackLabelsInvalidated) {
    stackLabels.clear();

    var countOfVisibleSeries = goog.array.reduce(this.seriesList, function(count, series) {
      return series.enabled() ? count + 1 : count;
    }, 0);

    if (countOfVisibleSeries > 1 && stackLabels.getOption('enabled')) {
      this.updateStackLabels();
    }
  }

  stackLabels.markConsistent(stackLabels.SUPPORTED_CONSISTENCY_STATES);
};


/**
 * Draw chart labels.
 */
anychart.waterfallModule.Chart.prototype.drawLabels = function() {
  this.resetContextPool_();

  this.drawStackLabels();
  this.drawConnectorsLabels();

  this.markMultiStateConsistent(
      anychart.enums.Store.WATERFALL,
      [
        anychart.waterfallModule.Chart.SUPPORTED_STATES.STACK_LABELS,
        anychart.waterfallModule.Chart.SUPPORTED_STATES.CONNECTORS_LABELS
      ]
  );
};


/**
 * Stack labels invalidation function.
 */
anychart.waterfallModule.Chart.prototype.stackLabelsInvalidated = function() {
  this.invalidateMultiState(
      anychart.enums.Store.WATERFALL,
      [
        anychart.waterfallModule.Chart.SUPPORTED_STATES.STACK_LABELS,
        anychart.waterfallModule.Chart.SUPPORTED_STATES.ARROWS
      ],
      anychart.Signal.NEEDS_REDRAW
  );
};


/**
 * Labels factory getter/setter for stack labels.
 *
 * @param {Object=} opt_value - Labels config.
 *
 * @return {anychart.waterfallModule.Chart|anychart.core.ui.LabelsFactory} - Chart or labels factory instance.
 */
anychart.waterfallModule.Chart.prototype.stackLabels = function(opt_value) {
  if (!this.stackLabels_) {
    this.stackLabels_ = new anychart.core.ui.LabelsFactory();
    this.setupCreated('stackLabels', this.stackLabels_);
    this.stackLabels_.markConsistent(this.stackLabels_.SUPPORTED_CONSISTENCY_STATES);
    this.stackLabels_.listenSignals(this.stackLabelsInvalidated, this);
  }

  if (goog.isDef(opt_value)) {
    if (goog.isObject(opt_value) && !('enabled' in opt_value))
      opt_value['enabled'] = true;
    this.stackLabels_.setup(opt_value);
    return this;
  }

  return this.stackLabels_;
};


//endregion
//region --- legend
/** @inheritDoc */
anychart.waterfallModule.Chart.prototype.legendItemCanInteractInMode = function(mode) {
  return true;
};


/** @inheritDoc */
anychart.waterfallModule.Chart.prototype.createLegendItemsProvider = function(sourceMode, itemsFormat) {
  /**
   * @type {!Array.<anychart.core.ui.Legend.LegendItemProvider>}
   */
  var data = [];
  if (sourceMode == anychart.enums.LegendItemsSourceMode.CATEGORIES) {
    this.keyToSeriesMap_ = {};
    var seriesList = this.getAllSeries();
    var series;
    var totalFill, risingFill, fallingFill;
    var totalFillHash, risingFillHash, fallingFillHash;
    var seen = {};
    var legendItemKey = 0;
    var resolver;

    for (var i = 0; i < seriesList.length; i++) {
      series = /** @type {anychart.core.series.Base} */ (seriesList[i]);

      resolver = anychart.color.getColorResolver('risingFill', anychart.enums.ColorType.FILL, false);
      risingFill = resolver(series, anychart.PointState.NORMAL, true, true);
      risingFillHash = anychart.utils.hash(risingFill);
      if (!(risingFillHash in seen)) {
        seen[risingFillHash] = legendItemKey;
        this.keyToSeriesMap_[legendItemKey] = {
          series: [series],
          type: 'rising'
        };
        data.push({
          'text': 'Increase',
          'categoryType': 'increase',
          'iconEnabled': true,
          'iconFill': /** @type {acgraph.vector.Fill} */ (risingFill),
          'sourceUid': goog.getUid(this),
          'sourceKey': legendItemKey++
        });
      } else {
        this.keyToSeriesMap_[seen[risingFillHash]].series.push(series);
      }

      resolver = anychart.color.getColorResolver('fallingFill', anychart.enums.ColorType.FILL, false);
      fallingFill = resolver(series, anychart.PointState.NORMAL, true, true);
      fallingFillHash = anychart.utils.hash(fallingFill);
      if (!(fallingFillHash in seen)) {
        seen[fallingFillHash] = legendItemKey;
        this.keyToSeriesMap_[legendItemKey] = {
          series: [series],
          type: 'falling'
        };
        data.push({
          'text': 'Decrease',
          'categoryType': 'decrease',
          'iconEnabled': true,
          'iconFill': /** @type {acgraph.vector.Fill} */ (fallingFill),
          'sourceUid': goog.getUid(this),
          'sourceKey': legendItemKey++
        });
      } else {
        this.keyToSeriesMap_[seen[fallingFillHash]].series.push(series);
      }

      resolver = anychart.color.getColorResolver('fill', anychart.enums.ColorType.FILL, false);
      totalFill = resolver(series, anychart.PointState.NORMAL, true, true);
      totalFillHash = anychart.utils.hash(totalFill);
      if (!(totalFillHash in seen)) {
        seen[totalFillHash] = legendItemKey;
        this.keyToSeriesMap_[legendItemKey] = {
          series: [series],
          type: 'total'
        };
        data.push({
          'text': 'Total',
          'categoryType': 'total',
          'iconEnabled': true,
          'iconFill': /** @type {acgraph.vector.Fill} */ (totalFill),
          'sourceUid': goog.getUid(this),
          'sourceKey': legendItemKey++
        });
      } else {
        this.keyToSeriesMap_[seen[totalFillHash]].series.push(series);
      }
    }
  } else {
    data = anychart.waterfallModule.Chart.base(this, 'createLegendItemsProvider', sourceMode, itemsFormat);
  }
  return data;
};


/**
 * Hover all points for all series on legend mouse over.
 * @param {number} sourceKey
 */
anychart.waterfallModule.Chart.prototype.doHoverOnPoints = function(sourceKey) {
  var seriesInfo = this.keyToSeriesMap_[sourceKey];
  var seriesList = seriesInfo.series;
  var pointType = seriesInfo.type;
  var series, iterator, isTotal, rising, falling, indexes, condition;
  for (var i = 0; i < seriesList.length; i++) {
    series = seriesList[i];
    iterator = series.getDetachedIterator();
    indexes = [];
    while (iterator.advance()) {
      var index = iterator.getIndex();
      if (iterator.meta('missing'))
        continue;
      isTotal = iterator.meta('isTotal');
      rising = (iterator.meta('diff') >= 0) && !isTotal;
      falling = (iterator.meta('diff') < 0) && !isTotal;

      condition = (isTotal && pointType == 'total') || (rising && pointType == 'rising') || (falling && pointType == 'falling');
      if (condition)
        indexes.push(index);
    }
    series.hover(indexes);
  }
};


/** @inheritDoc */
anychart.waterfallModule.Chart.prototype.legendItemOver = function(item, event) {
  var sourceMode = /** @type {anychart.enums.LegendItemsSourceMode} */(this.legend().getOption('itemsSourceMode'));
  if (sourceMode == anychart.enums.LegendItemsSourceMode.CATEGORIES) {
    this.doHoverOnPoints(/** @type {number} */ (item.sourceKey()));
  } else {
    return anychart.waterfallModule.Chart.base(this, 'legendItemOver', item, event);
  }
};


/** @inheritDoc */
anychart.waterfallModule.Chart.prototype.legendItemOut = function(item, event) {
  var sourceMode = /** @type {anychart.enums.LegendItemsSourceMode} */(this.legend().getOption('itemsSourceMode'));
  if (sourceMode == anychart.enums.LegendItemsSourceMode.CATEGORIES) {
    this.unhover();
  } else {
    return anychart.waterfallModule.Chart.base(this, 'legendItemOut', item, event);
  }
};


/** @inheritDoc */
anychart.waterfallModule.Chart.prototype.legendItemClick = function(item, event) {
  var sourceMode = /** @type {anychart.enums.LegendItemsSourceMode} */(this.legend().getOption('itemsSourceMode'));
  if (sourceMode == anychart.enums.LegendItemsSourceMode.DEFAULT) {
    return anychart.waterfallModule.Chart.base(this, 'legendItemClick', item, event);
  }
};


//endregion
//region --- Stack
/**
 * Returns bounds of stack.
 * Used for labels position calculation.
 *
 * @param {number} index - Stack index.
 *
 * @return {!anychart.math.Rect} - Bounds of stack.
 */
anychart.waterfallModule.Chart.prototype.getStackBounds = function(index) {
  var width = goog.array.reduce(this.drawingPlans, function(width, plan) {
    var seriesPointWidth = plan.series.pointWidthCache;
    return Math.max(seriesPointWidth, width);
  }, -Infinity);

  var left = this.drawingPlans[0].data[index].meta['valueX'] - width / 2;

  var top = this.transformValue_(this.getStackTop(index));
  var height = this.transformValue_(this.getStackBottom(index));

  return anychart.math.rect(left, top, width, height - top);
};


/**
 * Returns number of stacks, including excluded/invisible once.
 *
 * @return {number} - Number of stacks on waterfall chart.
 */
anychart.waterfallModule.Chart.prototype.getStacksCount = function() {
  return this.drawingPlans.length ? this.drawingPlans[0].data.length : 0;
};


/**
 * Returns sum of stack values with given meta field name.
 *
 * @param {number} index - Stack index.
 * @param {string} metaFieldName - Name of the meta field.
 * @param {boolean=} opt_treatDiffAsAbsForTotal - Whether to take 'absolute' value instead of 'diff' if
 *  point is 'total' point. Only used for 'diff' meta field name.
 *
 * @return {number}
 */
anychart.waterfallModule.Chart.prototype.getStackSum = function(index, metaFieldName, opt_treatDiffAsAbsForTotal) {
  return goog.array.reduce(this.seriesList, function(sum, currentSeries) {
    if (currentSeries.enabled()) {
      var iterator = currentSeries.getIterator();
      iterator.select(index);

      if (iterator.meta('missing')) return sum;

      var value = opt_treatDiffAsAbsForTotal ?
          this.getPointStackingValue(iterator.getCurrentPoint()) :
          iterator.meta(metaFieldName);

      return sum + value;
    }

    return sum;
  }, 0, this);
};


/**
 * Whether stack visible.
 * Stack is visible when at least one point visible.
 *
 * @param {number} index - Stack index.
 *
 * @return {boolean}
 */
anychart.waterfallModule.Chart.prototype.isStackVisible = function(index) {
  return goog.array.reduce(this.drawingPlans, function(isVisible, plan) {
    return isVisible || !plan.data[index].meta['missing'];
  }, false);
};


/**
 * Return highest value of stack.
 *
 * @param {number} index - Stack index.
 *
 * @return {number}
 */
anychart.waterfallModule.Chart.prototype.getStackTop = function(index) {
  return goog.array.reduce(this.seriesList, function(top, currentSeries) {
    if (currentSeries.enabled()) {
      var iterator = currentSeries.getIterator();

      iterator.select(index);

      if (iterator.meta('missing')) return top;

      var stackedValue = /**@type {number}*/(iterator.meta('stackedValue'));
      var stackedZero = /**@type {number}*/(iterator.meta('stackedZero'));

      return Math.max(top, stackedValue, stackedZero);
    }
    return top;
  }, -Infinity);
};


/**
 * Return lowest value of stack.
 *
 * @param {number} index - Stack index.
 *
 * @return {number}
 */
anychart.waterfallModule.Chart.prototype.getStackBottom = function(index) {
  return goog.array.reduce(this.seriesList, function(bottom, currentSeries) {
    if (currentSeries.enabled()) {
      var iterator = currentSeries.getIterator();

      iterator.select(index);

      if (iterator.meta('missing')) return bottom;

      var stackedValue = /**@type {number}*/(iterator.meta('stackedValue'));
      var stackedZero = /**@type {number}*/(iterator.meta('stackedZero'));

      return Math.min(stackedValue, stackedZero, bottom);
    }
    return bottom;
  }, Infinity);
};


//endregion
//region --- Series
/** @inheritDoc */
anychart.waterfallModule.Chart.prototype.seriesInvalidated = function(event) {
  this.invalidateMultiState(
      anychart.enums.Store.WATERFALL,
      [
        anychart.waterfallModule.Chart.SUPPORTED_STATES.STACK_LABELS,
        anychart.waterfallModule.Chart.SUPPORTED_STATES.ARROWS
      ]
  );

  anychart.waterfallModule.Chart.base(this, 'seriesInvalidated', event);
};


/** @inheritDoc */
anychart.waterfallModule.Chart.prototype.invalidateSeriesOfScaleInternal = function() {
  anychart.waterfallModule.Chart.base(this, 'invalidateSeriesOfScaleInternal');
  this.invalidateState(anychart.enums.Store.WATERFALL, anychart.waterfallModule.Chart.SUPPORTED_STATES.STACK_LABELS);
};


//endregion
//region --- Connectors
/**
 * Deprecated connector stroke getter/setter.
 *
 * @deprecated since 8.9.1 use waterfallChart.connectors().stroke() instead. DVF-4496
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)=} opt_strokeOrFill Stroke settings,
 *    if used as a setter.
 * @param {number=} opt_thickness Line thickness. If empty - set to 1.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 *    Dash array contains a list of comma and/or white space separated lengths and percentages that specify the
 *    lengths of alternating dashes and gaps. If an odd number of values is provided, then the list of values is
 *    repeated to yield an even number of values. Thus, stroke dashpattern: 5,3,2 is equivalent to dashpattern: 5,3,2,5,3,2.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line join style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Style of line cap.
 * @return {acgraph.vector.Stroke|anychart.waterfallModule.Chart} Stroke or itself for chaining.
 */
anychart.waterfallModule.Chart.prototype.connectorStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null, ['chart.connectorStroke()', 'chart.connectors().stroke()'], true);
  var c = this.connectors();
  return arguments.length ?
      (c['stroke'].apply(c, arguments) && this) :
      c['stroke']();
};


/**
 * Getter/setter for the waterfall connectors.
 *
 * @param {Object=} opt_settings - Connectors settings.
 *
 * @return {anychart.waterfallModule.Chart|anychart.waterfallModule.Connectors} Connectors instance
 *  or self instance for method chaining.
 */
anychart.waterfallModule.Chart.prototype.connectors = function(opt_settings) {
  if (!this.connectors_) {
    this.connectors_ = new anychart.waterfallModule.Connectors();
    this.setupCreated('connectors', this.connectors_);
    this.connectors_.listenSignals(this.connectorsInvalidated, this);
  }

  if (goog.isDef(opt_settings)) {
    this.connectors_.setup(opt_settings);
    return this;
  } else {
    return this.connectors_;
  }
};


/**
 * Connectors signals handler.
 *
 * @param {anychart.SignalEvent} event
 */
anychart.waterfallModule.Chart.prototype.connectorsInvalidated = function(event) {
  // Stroke invalidated.
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW_APPEARANCE)) {
    this.invalidate(anychart.ConsistencyState.SERIES_CHART_SERIES, anychart.Signal.NEEDS_REDRAW);
  }
  // Connector labels invalidated.
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW_LABELS)) {
    this.invalidateState(
        anychart.enums.Store.WATERFALL,
        anychart.waterfallModule.Chart.SUPPORTED_STATES.CONNECTORS_LABELS,
        anychart.Signal.NEEDS_REDRAW
    );
  }
};


/**
 * Returns bounds used for connector label positioning.
 *
 * @param {number} index - Connector index.
 *
 * @return {anychart.math.Rect} Bounds of the connector.
 */
anychart.waterfallModule.Chart.prototype.getConnectorBounds = function(index) {
  var connectorPosition = this.connectorsPositions_[index];
  var x1 = Math.min(connectorPosition.x1, connectorPosition.x2);
  var y1 = Math.min(connectorPosition.y1, connectorPosition.y2);
  var x2 = Math.max(connectorPosition.x2, connectorPosition.x1);
  var y2 = Math.max(connectorPosition.y2, connectorPosition.y1);

  var connectorBounds = this.isVertical() ?
      anychart.math.rect(y1, x1, y2 - y1, x2 - x1) :
      anychart.math.rect(x1, y1, x2 - x1, y2 - y1);

  return connectorBounds;
};


//endregion
//region --- Arrows
/**
 * Draws waterfall arrows.
 */
anychart.waterfallModule.Chart.prototype.drawArrows = function() {
  var arrowsController = this.arrowsController();

  if (!this.arrowsLayer_) {
    this.arrowsLayer_ = this.rootElement.layer();
    this.arrowsLayer_.zIndex(anychart.waterfallModule.ArrowsController.ARROWS_ZINDEX);
    arrowsController.container(this.arrowsLayer_);
  }

  var arrowsInvalidated = this.hasStateInvalidation(
      anychart.enums.Store.WATERFALL,
      anychart.waterfallModule.Chart.SUPPORTED_STATES.ARROWS
      );

  var boundsInvalidated = this.hasInvalidationState(anychart.ConsistencyState.BOUNDS);

  if (boundsInvalidated) {
    arrowsController.invalidate(anychart.ConsistencyState.BOUNDS);
  }

  if (arrowsInvalidated || boundsInvalidated) {
    arrowsController.draw();
    this.markStateConsistent(
        anychart.enums.Store.WATERFALL,
        anychart.waterfallModule.Chart.SUPPORTED_STATES.ARROWS
    );
  }
};


/**
 * Returns arrows controller.
 *
 * @return {anychart.waterfallModule.ArrowsController}
 */
anychart.waterfallModule.Chart.prototype.arrowsController = function() {
  if (!goog.isDef(this.arrowsController_)) {
    this.arrowsController_ = new anychart.waterfallModule.ArrowsController(this);
    this.arrowsController_.listenSignals(this.arrowsInvalidationHandler_, this);
  }
  return this.arrowsController_;
};


/**
 * Handles arrows invalidation signals.
 *
 * @private
 */
anychart.waterfallModule.Chart.prototype.arrowsInvalidationHandler_ = function() {
  this.invalidateState(
      anychart.enums.Store.WATERFALL,
      anychart.waterfallModule.Chart.SUPPORTED_STATES.ARROWS,
      anychart.Signal.NEEDS_REDRAW
  );
};


/**
 * Creates new arrow with given settings.
 *
 * @param {Object=} opt_settings - Arrow settings.
 * @return {anychart.waterfallModule.Arrow}
 */
anychart.waterfallModule.Chart.prototype.addArrow = function(opt_settings) {
  return this.arrowsController().addArrow(opt_settings);
};


/**
 * Returns arrow with given index.
 *
 * @param {number} index - Arrow index.
 * @return {anychart.waterfallModule.Arrow}
 */
anychart.waterfallModule.Chart.prototype.getArrow = function(index) {
  return this.arrowsController().getArrow(index);
};


/**
 * Removes arrow with given index.
 *
 * @param {number} index - Arrow index to remove.
 * @return {boolean} - Whether arrow removed or not.
 */
anychart.waterfallModule.Chart.prototype.removeArrowAt = function(index) {
  return this.arrowsController().removeArrowAt(index);
};


/**
 * Removes arrow instance.
 *
 * @param {anychart.waterfallModule.Arrow} arrow - Arrow instance.
 * @return {boolean} - Whether arrow removed or not.
 */
anychart.waterfallModule.Chart.prototype.removeArrow = function(arrow) {
  return this.arrowsController().removeArrow(arrow);
};


/**
 * Returns array with all instances of arrows.
 *
 * @return {Array.<anychart.waterfallModule.Arrow>} - Array of arrow instances.
 */
anychart.waterfallModule.Chart.prototype.getAllArrows = function() {
  return this.arrowsController().getAllArrows();
};


//endregion
//region --- setup/dispose
/** @inheritDoc */
anychart.waterfallModule.Chart.prototype.serialize = function() {
  var json = anychart.waterfallModule.Chart.base(this, 'serialize');
  anychart.core.settings.serialize(this, anychart.waterfallModule.Chart.PROPERTY_DESCRIPTORS, json['chart']);
  json['chart']['stackLabels'] = this.stackLabels().serialize();
  json['chart']['connectors'] = this.connectors().serialize();
  json['chart']['arrows'] = this.arrowsController().serialize();

  return json;
};


/** @inheritDoc */
anychart.waterfallModule.Chart.prototype.setupByJSON = function(config, opt_default) {
  anychart.waterfallModule.Chart.base(this, 'setupByJSON', config, opt_default);

  var stackLabelsConfig = config['stackLabels'];
  if (stackLabelsConfig) {
    this.stackLabels().setupInternal(!!opt_default, stackLabelsConfig);
  }

  if (config['arrows']) {
    this.arrowsController().setupInternal(!!opt_default, config['arrows']);
  }

  var connectorsConfig = config['connectors'];

  // Field connectorStroke must be passed to the connectors entity.
  if (connectorsConfig || config['connectorStroke']) {
    connectorsConfig = connectorsConfig || {};
    // Fallback to the deprecated connectorStroke in case old config passed.
    connectorsConfig['stroke'] = connectorsConfig['stroke'] || config['connectorStroke'];
    this.connectors().setupInternal(!!opt_default, connectorsConfig);
  }

  anychart.core.settings.deserialize(this, anychart.waterfallModule.Chart.PROPERTY_DESCRIPTORS, config);
};


/** @inheritDoc */
anychart.waterfallModule.Chart.prototype.disposeInternal = function() {
  goog.disposeAll(
      this.stackLabels_,
      this.stackLabelsLayer_,
      this.connectorPath_,
      this.connectorsLabelsLayer_,
      this.connectors_,
      this.arrowsController_
  );
  anychart.waterfallModule.Chart.base(this, 'disposeInternal');
};


//endregion
//region --- exports
/**
 * @suppress {deprecated}
 */
(function() {
  var proto = anychart.waterfallModule.Chart.prototype;
  //generated automatically
  //proto['waterfall'] = proto.waterfall;
  //proto['dataMode'] = proto.dataMode;

  proto['stackLabels'] = proto.stackLabels;
  proto['xScale'] = proto.xScale;
  proto['yScale'] = proto.yScale;
  proto['crosshair'] = proto.crosshair;
  proto['xGrid'] = proto.xGrid;
  proto['yGrid'] = proto.yGrid;
  proto['xMinorGrid'] = proto.xMinorGrid;
  proto['yMinorGrid'] = proto.yMinorGrid;
  proto['xAxis'] = proto.xAxis;
  proto['getXAxesCount'] = proto.getXAxesCount;
  proto['yAxis'] = proto.yAxis;
  proto['getYAxesCount'] = proto.getYAxesCount;
  proto['getSeries'] = proto.getSeries;
  proto['lineMarker'] = proto.lineMarker;
  proto['rangeMarker'] = proto.rangeMarker;
  proto['textMarker'] = proto.textMarker;
  proto['palette'] = proto.palette;
  proto['markerPalette'] = proto.markerPalette;
  proto['hatchFillPalette'] = proto.hatchFillPalette;
  proto['getType'] = proto.getType;
  proto['addSeries'] = proto.addSeries;
  proto['getSeriesAt'] = proto.getSeriesAt;
  proto['getSeriesCount'] = proto.getSeriesCount;
  proto['removeSeries'] = proto.removeSeries;
  proto['removeSeriesAt'] = proto.removeSeriesAt;
  proto['removeAllSeries'] = proto.removeAllSeries;
  proto['getPlotBounds'] = proto.getPlotBounds;
  proto['xZoom'] = proto.xZoom;
  proto['yZoom'] = proto.yZoom;
  proto['xScroller'] = proto.xScroller;
  proto['yScroller'] = proto.yScroller;
  proto['getStat'] = proto.getStat;
  proto['annotations'] = proto.annotations;
  proto['getXScales'] = proto.getXScales;
  proto['getYScales'] = proto.getYScales;
  proto['data'] = proto.data;
  proto['connectors'] = proto.connectors;
  proto['addArrow'] = proto.addArrow;
  proto['getArrow'] = proto.getArrow;
  proto['removeArrowAt'] = proto.removeArrowAt;
  proto['removeArrow'] = proto.removeArrow;
  proto['getAllArrows'] = proto.getAllArrows;
  // deprecated
  proto['connectorStroke'] = proto.connectorStroke;
})();
//endregion
