goog.provide('anychart.waterfallModule.Chart');

goog.require('anychart.core.CartesianBase');
goog.require('anychart.core.settings');
goog.require('anychart.core.shapeManagers');
goog.require('anychart.core.ui.LabelsFactory');
goog.require('anychart.enums');
goog.require('anychart.format.Context');
goog.require('anychart.math');
goog.require('anychart.waterfallModule.ArrowsController');
goog.require('anychart.waterfallModule.Connectors');
goog.require('anychart.waterfallModule.Series');
goog.require('anychart.waterfallModule.totals.Controller');


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

  /**
   * Splits configs.
   *
   * @type {Array.<anychart.waterfallModule.totals.Total.SplitConfig>}
   * @private
   */
  this.totalSplits_ = [];

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['dataMode',
      anychart.ConsistencyState.SERIES_CHART_SERIES |
      anychart.ConsistencyState.SCALE_CHART_SCALES |
      anychart.ConsistencyState.SCALE_CHART_Y_SCALES,
      anychart.Signal.NEEDS_REDRAW,
      void 0,
      /**
       * @this {anychart.waterfallModule.Chart}
       */
      function() {
        var controller = this.totalsController();
        this.invalidateStore(anychart.enums.Store.WATERFALL);
        controller.invalidate(controller.SUPPORTED_CONSISTENCY_STATES);
      }
    ]
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
  ARROWS: 'arrows',
  CONNECTORS_LABELS: 'connectorsLabels',
  STACK_LABELS: 'stackLabels',
  TOTALS: 'totals'
};


anychart.consistency.supportStates(
    anychart.waterfallModule.Chart,
    anychart.enums.Store.WATERFALL,
    [
     anychart.waterfallModule.Chart.SUPPORTED_STATES.ARROWS,
     anychart.waterfallModule.Chart.SUPPORTED_STATES.CONNECTORS_LABELS,
     anychart.waterfallModule.Chart.SUPPORTED_STATES.STACK_LABELS,
     anychart.waterfallModule.Chart.SUPPORTED_STATES.TOTALS
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

  var seriesPlans = [];
  for (i = 0; i < drawingPlans.length; i++) {
    var plan = drawingPlans[i];
    if (plan.series.getType() !== anychart.waterfallModule.totals.Total.seriesType) {
      seriesPlans.push(plan);
    }
  }

  drawingPlans = seriesPlans;

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

    point.meta['connectorValue'] = prevValue;

    this.pointValueSums_.push(prevValue);
  }
};


/**
 * Return list of series categories.
 *
 * @return {Array.<string>}
 */
anychart.waterfallModule.Chart.prototype.getSeriesCategories = function() {
  var categories = [];
  for (var i = 0; i < this.seriesList.length; i++) {
    var series = this.seriesList[i];
    if (series && series.enabled()) {
      var data = series.data();
      if (data) {
        var iterator = data.getIterator();
        while (iterator.advance()) {
          var pointCategory = iterator.get('x');
          if (!goog.array.contains(categories, pointCategory)) {
            categories.push(pointCategory);
          }
        }
      }
    }
  }

  return categories;
};


/** @inheritDoc */
anychart.waterfallModule.Chart.prototype.calculate = function() {
  this.totalsController().calculate();
  anychart.waterfallModule.Chart.base(this, 'calculate');
};


/** @inheritDoc */
anychart.waterfallModule.Chart.prototype.drawContent = function(contentBounds) {
  anychart.waterfallModule.Chart.base(this, 'drawContent', contentBounds);

  this.drawTotals();
  // Connectors use point bounds for drawing. Draw it after totals and series.
  this.drawConnector();

  this.drawLabels();
  this.drawArrows();

  if (this.needsOutsideLabelsDistribution()) {
    this.putOutsideLabels_();
  }
};


/**
 * Returns connector x coordinate.
 * @param {number} pointMiddleX - Point middle x value.
 * @param {number} width - Point width, positive for left point and negative
 *  for right point.
 * @return {number} - Connector x coordinate.
 */
anychart.waterfallModule.Chart.prototype.getConnectorXCoordinate = function(pointMiddleX, width) {
  var pointHalfWidth = width / 2;
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
anychart.waterfallModule.Chart.prototype.beforeSeriesDraw = function() {
  anychart.waterfallModule.Chart.base(this, 'beforeSeriesDraw');

  var needsOutsideLabelsDataRecreation = goog.array.some(this.seriesList, function(series) {
    return Boolean(series && !series.isDisposed() && series.checkDrawingNeeded());
  });

  if (needsOutsideLabelsDataRecreation) {
    this.outsideLabelsData = {
      isComplete: false
    }; // Possible point of memory growth until GC runs, but who cares.
  }
};


/**
 * Return coordinates that uses for connector drawing.
 *
 * @param {number} fromIndex - Index of from category.
 * @param {number} toIndex - Index of to category.
 * @return {{from: {x: number, y: number}, to: {x: number, y: number}}|undefined}
 */
anychart.waterfallModule.Chart.prototype.getConnectorCoordinates = function(fromIndex, toIndex) {
  if (this.isStackVisible(fromIndex) && this.isStackVisible(toIndex)) {
    var prevBounds = this.getStackBounds(fromIndex);
    var curBounds = this.getStackBounds(toIndex);

    var connectorValue;

    for (var i = this.drawingPlans.length - 1; i >= 0; i--) {
      var plan = this.drawingPlans[i];
      connectorValue = plan.data[fromIndex].meta['connectorValue'];
      if (goog.isDef(connectorValue)) {
        break;
      }
    }

    var leftX = this.getConnectorXCoordinate(prevBounds.getCenter().x, prevBounds.getSize().width);
    var leftY = this.transformValue_(connectorValue);

    var rightX = this.getConnectorXCoordinate(curBounds.getCenter().x, -curBounds.getSize().width);
    var rightY = leftY;

    return {
      from: {
        x: leftX,
        y: leftY
      },
      to: {
        x: rightX,
        y: rightY
      }
    };
  }

  return void 0;
};


/**
 * Draw connector path.
 */
anychart.waterfallModule.Chart.prototype.drawConnector = function() {
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
  var prevIndex;
  for (var index = 0; index < this.drawingPlans[0].data.length; index++) {
    if (this.isStackVisible(index)) {
      if (goog.isDef(prevIndex)) {
        var segmentCoordinates = this.getConnectorCoordinates(prevIndex, index);

        var categoryName = this.drawingPlans[0].data[prevIndex].data['x'];

        var leftX = segmentCoordinates.from.x;
        var leftY = segmentCoordinates.from.y;
        var rightX = segmentCoordinates.to.x;
        var rightY = segmentCoordinates.to.y;

        anychart.core.drawers.move(this.connectorPath_,
          isVertical,
          leftX,
          anychart.utils.applyPixelShift(leftY, thickness)
        );

        anychart.core.drawers.line(this.connectorPath_,
          isVertical,
          rightX,
          anychart.utils.applyPixelShift(rightY, thickness)
        );

        var connectorPoints = isVertical ?
          { x1: leftY, y1: leftX, x2: rightY, y2: rightX } : // OMFG, my mind burns here.
          { x1: leftX, y1: leftY, x2: rightX, y2: rightY };

        this.connectorsPositions_.push(connectorPoints);
        this.outsideLabelsData[categoryName] = this.outsideLabelsData[categoryName] || {};
        this.outsideLabelsData[categoryName].connectorPoints = connectorPoints;
        this.outsideLabelsData[categoryName].stackBounds = this.getStackBounds(prevIndex);

      }
      prevIndex = index;
    }
  }
};


/**
 * Defines, whether labels need to be distributed for 'auto' mode. DVF-4545.
 *
 * @return {boolean}
 */
anychart.waterfallModule.Chart.prototype.needsOutsideLabelsDistribution = function() {
  var labels = /** @type {anychart.core.ui.LabelsFactory} */ (this.labels());
  var labelsPosition = labels.getOption('position');
  return this.getSeriesCount() > 1 &&
    (
      labelsPosition === anychart.enums.Position.AUTO ||
      labelsPosition === 'outside'
    );
};


/**
 * Searches for label intersecting connector.
 *
 * @param {Array.<Object>} labels - Outside labels data array.
 * @param {number} lineCoordinate - Vertical or horizontal coordinate of connector.
 * @return {number} - Index of label intersecting lineCoordinate.
 */
anychart.waterfallModule.Chart.prototype.findOutsideLabelIndexInStack_ = function(labels, lineCoordinate) {
  var isVertical = !!this.isVertical();
  return goog.array.binarySearch(labels, lineCoordinate, function(coord, labelData) {
    var start = isVertical ? labelData.bounds.left : labelData.bounds.top;
    var bottom = start + (isVertical ? labelData.bounds.width : labelData.bounds.height);
    if (start > coord) {
      return 1;
    } else if (bottom < coord) {
      return -1;
    } else {
      return 0;
    }
  });
};


/**
 *
 * @param {Array.<Object>} labels - Array of outside labels data objects.
 * @param {number} startIndex - .
 * @param {number} stackLimit - .
 */
anychart.waterfallModule.Chart.prototype.drawLabelsStackForward_ = function(labels, startIndex, stackLimit) {
  var isVertical = !!this.isVertical();
  for (var j = startIndex; j >= 0; j--) {
    var labelsData = labels[j];
    var labelBounds = labelsData.bounds;
    var labelBoundsStart = isVertical ? labelBounds.left : labelBounds.top;
    var labelBoundsSize = isVertical ? labelBounds.width : labelBounds.height;
    if (isNaN(stackLimit)) {
      stackLimit = labelBoundsStart + labelBoundsSize;
    } else {
      var label = labelsData.label;
      var labelHalfSize = labelBoundsSize / 2;
      var positionProvider = label.positionProvider();
      var ppCoordinate = isVertical ? positionProvider['value'].x : positionProvider['value'].y;
      if (ppCoordinate - labelHalfSize < stackLimit) {
        var newStart = stackLimit + labelHalfSize;
        stackLimit += labelBoundsSize;

        var newPPValue = isVertical ?
          { x: newStart, y: positionProvider['value'].y} :
          { x: positionProvider['value'].x, y: newStart};

        var newPositionProvider = {
          'value': newPPValue,
          'connectorPoint': positionProvider['connectorPoint']
        };

        label.positionProvider(newPositionProvider);
        label.draw();
      } else {
        stackLimit = ppCoordinate + labelHalfSize;
      }
    }
  }
};


/**
 *
 * @param {Array.<Object>} labels - Array of outside labels data objects.
 * @param {number} startIndex - .
 * @param {number} stackLimit - .
 */
anychart.waterfallModule.Chart.prototype.drawLabelsStackBackward_ = function(labels, startIndex, stackLimit) {
  var isVertical = !!this.isVertical();
  for (var j = startIndex; j < labels.length; j++) {
    var labelsData = labels[j];
    var labelBounds = labelsData.bounds;
    var labelBoundsSize = isVertical ? labelBounds.width : labelBounds.height;

    var label = labelsData.label;
    var labelHalfSize = labelBoundsSize / 2;
    var positionProvider = label.positionProvider();
    var ppCoordinate = isVertical ? positionProvider['value'].x : positionProvider['value'].y;

    if (ppCoordinate + labelHalfSize > stackLimit) {
      var newStart = stackLimit - labelHalfSize;
      stackLimit -= labelBoundsSize;

      var newPPValue = isVertical ?
          { x: newStart, y: positionProvider['value'].y} :
          { x: positionProvider['value'].x, y: newStart};

      var newPositionProvider = {
        'value': newPPValue,
        'connectorPoint': positionProvider['connectorPoint']
        };
      label.positionProvider(newPositionProvider);
      label.draw();
    } else {
      stackLimit = ppCoordinate - labelHalfSize;
    }
  }
};


/**
 * Puts outside labels in assigned category.
 *
 * @param {string} categoryName - Drawing plan category name.
 */
anychart.waterfallModule.Chart.prototype.putLabelsInCategory = function(categoryName) {
  var outsideLabelsData = this.outsideLabelsData[categoryName];
  var isVertical = !!this.isVertical();
  var isInverted = !!this.yScale().inverted();

  if (outsideLabelsData) {
    var connectorPoints = outsideLabelsData.connectorPoints;
    var connectorLabel = outsideLabelsData.connectorLabel;
    var stackBounds = outsideLabelsData.stackBounds;
    var labels = outsideLabelsData.labels;

    // This is left here as possibility to add connector label intersection check.
    // if (connectorLabel) {
    //   console.log(this.getLabelBounds(connectorLabel));
    // }

    if (labels) {
      if (connectorPoints) {
        var connectorCoordinate = isVertical ? connectorPoints.x1 : connectorPoints.y1;
        var stackBoundsStart = isVertical ? stackBounds.left : stackBounds.top;
        var stackBoundsSize = isVertical ? stackBounds.width : stackBounds.height;

        if (anychart.math.roughlyEqual(connectorCoordinate, stackBoundsStart, 1)) {
          // Connector goes from the top of stack.
          (isVertical ^ isInverted) ?
            this.drawLabelsStackBackward_(labels, 0, connectorCoordinate) :
            this.drawLabelsStackForward_(labels, labels.length - 1, connectorCoordinate);
        } else if (anychart.math.roughlyEqual(connectorCoordinate, stackBoundsStart + stackBoundsSize, 1)) {
          // Connector goes from the bottom of stack.
          (isVertical ^ isInverted) ?
            this.drawLabelsStackForward_(labels, labels.length - 1, connectorCoordinate) :
            this.drawLabelsStackBackward_(labels, 0, connectorCoordinate);
        } else {
          // Connector goes from the middle.
          var index = this.findOutsideLabelIndexInStack_(labels, connectorCoordinate);
          if (index >= 0) {
            var labelData = labels[index];
            var labelBoundsStart = isVertical ? labelData.bounds.left : labelData.bounds.top;
            var labelBoundsSize = isVertical ? labelData.bounds.width : labelData.bounds.height;
            var connectorRatio = (connectorCoordinate - labelBoundsStart) / labelBoundsSize;

            if (connectorRatio >= 0.5) {
              this.drawLabelsStackForward_(labels, index - 1, connectorCoordinate);
              this.drawLabelsStackBackward_(labels, index, connectorCoordinate);
            } else {
              this.drawLabelsStackForward_(labels, index, connectorCoordinate);
              this.drawLabelsStackBackward_(labels, index + 1, connectorCoordinate);
            }
          } else {
            /*
              This condition is for case like this:

              +--------+
              |Ins.Lab.| --------- connector --------
              +--------+
              |Inside  |
              |Label   |
              +--------+
              |        | -._ Outside Label 1.
              +--------+
              |        | _
              +--------+  \_ Outside Label 2.
            */
            var labelData = labels[0];
            var labelBoundsStart = isVertical ? labelData.bounds.left : labelData.bounds.top;
            if (labelBoundsStart > connectorCoordinate) {
              this.drawLabelsStackForward_(labels, labels.length - 1, NaN);
            } else {
              this.drawLabelsStackBackward_(labels, 0, NaN);
            }
          }
        }
      } else {
        // No connector associated. Looks like we draw the very last 'total'.
        this.drawLabelsStackForward_(labels, labels.length - 1, NaN);
      }
    }
  }
};


/**
 * Sets position to outside labels after series draw.
 */
anychart.waterfallModule.Chart.prototype.putOutsideLabels_ = function() {
  var xScale = this.xScale();
  var drawingPlan0 = this.drawingPlansByXScale[String(goog.getUid(xScale))][0];
  if (drawingPlan0) {
    this.outsideLabelsData.isComplete = true;
    var xArray = drawingPlan0.xArray;
    for (var i = 0; i < xArray.length; i++) {
      var categoryName = xArray[i];
      this.putLabelsInCategory(categoryName);
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
  if (position === anychart.enums.Position.AUTO) {
    var isVertical = this.isVertical();
    var isInverted = this.yScale().inverted();

    var stackDiff = this.getStackSum(index, 'diff');

    position = stackDiff >= 0 ? anychart.enums.Position.CENTER_TOP : anychart.enums.Position.CENTER_BOTTOM;

    position =/** @type {anychart.enums.Position} */ (anychart.utils.rotateAnchor(position, isInverted ? 180 : 0));
    position =/** @type {anychart.enums.Position} */ (anychart.utils.rotateAnchor(position, isVertical ? -90 : 0));
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
  if (anchor === anychart.enums.Anchor.AUTO) {
    return anychart.utils.rotateAnchor(position, 180);
  }

  return anchor;
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
  var bounds = this.getStackBounds_(index);
  var position = anychart.utils.getCoordinateByAnchor(bounds, labelsPosition);

  return {
    'value': {
      x: position['x'],
      y: position['y']
    }
  };
};


/**
 * Returns position provider for connector.
 *
 * @param {number} from - Index of the category connector goes from.
 * @param {number} to - Index of the category connector goes to.
 * @param {anychart.enums.Position} position - Label position.
 *
 * @return {{value: anychart.math.Coordinate}} - Position provider.
 */
anychart.waterfallModule.Chart.prototype.getPositionProviderForConnectorLabel = function(from, to, position) {
  var connectorBounds = this.getConnectorBounds(from, to);

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
 * @param {number} fromIndex - Index of the point connector goes from.
 * @param {number} toIndex - Index of the point connector goes to.
 *
 * @return {anychart.core.BaseContext}
 */
anychart.waterfallModule.Chart.prototype.getFormatProviderForConnectorLabel = function(fromIndex, toIndex) {
  var provider = this.getContext_();

  provider.statisticsSources([this]);

  var total = this.getStackSum(toIndex, 'diff');

  var previousDiffSum = this.getStackSum(fromIndex, 'diff');
  var previousAbsoluteSum = this.getStackSum(fromIndex, 'absolute');

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


/** @inheritDoc */
anychart.waterfallModule.Chart.prototype.createDrawingPlans = function() {
  var plans = anychart.waterfallModule.Chart.base(this, 'createDrawingPlans');
  var values = this.getValuesForOrdinalScale();

  if (!goog.object.isEmpty(values)) {
    var uid = goog.getUid(this.xScale());
    var totalsPlans = this.totalsController().getDrawingPlans(values[uid].xHashMap, values[uid].xArray);

    for (var i = 0; i < totalsPlans.length; i++) {
      plans.push(totalsPlans[i]);
    }
  }

  return plans;
};


/** @inheritDoc */
anychart.waterfallModule.Chart.prototype.getValuesForOrdinalScale = function() {
  var values = anychart.waterfallModule.Chart.base(this, 'getValuesForOrdinalScale');

  if (!goog.object.isEmpty(values)) {
    var scaleUid = goog.getUid(this.xScale());
    var xArray = values[scaleUid].xArray;
    var xHashMap = values[scaleUid].xHashMap;
    var totals = this.getAllTotals();
    var totalsCategories = {};

    for (var i = 0; i < totals.length; i++) {
      var total = totals[i];

      if (total.getOption('enabled')) {
        var totalX = total.getOption('x');
        if (!totalsCategories[totalX]) {
          totalsCategories[totalX] = [];
        }
        totalsCategories[totalX].push.apply(totalsCategories[totalX], total.getReservedCategories());
      }
    }

    for (var targetCategory in totalsCategories) {
      var categoriesToAdd = totalsCategories[targetCategory];
      // findIndex because of categories can be numbers.
    var index = goog.array.findIndex(xArray, function(category) {
        return targetCategory == category;
      });
      if (index !== -1) {
        goog.array.insertArrayAt(xArray, categoriesToAdd, index + 1);
      }
    }

    for (i = 0; i < xArray.length; i++) {
      var category = xArray[i];
      var xHash = anychart.utils.hash(category);
      xHashMap[xHash] = i;
    }
  }

  return values;
};


/**
 * Gets label bounds.
 *
 * @param {anychart.core.ui.LabelsFactory.Label} label - Label.
 * @return {anychart.math.Rect} - .
 */
anychart.waterfallModule.Chart.prototype.getLabelBounds = function(label) {
  var textBounds = label.getTextElement().getBounds();
  var padding = /** @type {Object} */(label.getFinalSettings('padding'));
  return /** @type {anychart.math.Rect} */ (anychart.core.utils.Padding.widenBounds(textBounds, padding));
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
  // DVF-4566
  this.connectorsLabelsLayer_.clip(this.dataBounds);

  var labelsAnchor = /** @type {anychart.enums.Anchor} */(connectorsLabels.getOption('anchor'));
  var labelsPosition = /** @type {anychart.enums.Position} */(connectorsLabels.getOption('position'));

  var currentIndex, prevIndex;
  for (var index = 0; index < this.drawingPlans[0].data.length; index++) {
    if (this.isStackVisible(index)) {
      currentIndex = index;
      if (goog.isDef(prevIndex) && !this.isTotalStack(currentIndex)) {
        var stackContribution = this.getStackSum(index, 'diff');
        var pointCategory = this.drawingPlans[0].xArray[index];

        var labelAnchor = this.resolveAnchorForConnectorLabels(labelsAnchor, labelsPosition, stackContribution);
        var labelPosition = this.resolvePositionForConnectorLabels(labelsPosition, stackContribution);

        var positionProvider = this.getPositionProviderForConnectorLabel(prevIndex, currentIndex, labelPosition);
        var formatProvider = this.getFormatProviderForConnectorLabel(prevIndex, currentIndex);

        var label = connectorsLabels.add(formatProvider, positionProvider, index);

        label.setOption('anchor', labelAnchor);
        this.outsideLabelsData[pointCategory] = this.outsideLabelsData[pointCategory] || {};
        // Label does not have bounds here, it must be asked later.
        this.outsideLabelsData[pointCategory].connectorLabel = label;
      }
      prevIndex = currentIndex;
    }
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

  this.markStateConsistent(anychart.enums.Store.WATERFALL, anychart.waterfallModule.Chart.SUPPORTED_STATES.CONNECTORS_LABELS);
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
  // DVF-4566
  this.stackLabelsLayer_.clip(this.dataBounds);

  var labelsAnchor = this.stackLabels_.anchor();
  var labelsPosition = this.stackLabels_.position();

  for (var index = 0; index < this.drawingPlans[0].data.length; index++) {
    if (!this.isCategoryUsedForTotal(index) && this.isStackVisible(index)) {
      var labelPosition = this.resolvePositionForStackLabel(labelsPosition, index);
      var labelAnchor = this.resolveAnchorForStackLabel(labelsAnchor, labelPosition, index);

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

    if (countOfVisibleSeries && stackLabels.getOption('enabled')) {
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


/** @inheritDoc */
anychart.waterfallModule.Chart.prototype.labelsInvalidated = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    this.arrowsController().invalidateStorage();
    this.invalidateState(anychart.enums.Store.WATERFALL, anychart.waterfallModule.Chart.SUPPORTED_STATES.ARROWS);
  }

  anychart.waterfallModule.Chart.base(this, 'labelsInvalidated', event);
};


/**
 * Stack labels invalidation function.
 */
anychart.waterfallModule.Chart.prototype.stackLabelsInvalidated = function() {
  this.arrowsController().invalidateStorage();
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
    var sourceKey = /** @type {number} */ (item.sourceKey());
    if (this.keyToSeriesMap_[sourceKey].type === 'total') {
      var totals = this.totalsController().getAllTotals();

      for (var i = 0; i < totals.length; i++) {
        var total = totals[i];
        total.hover();
      }
    }
    this.doHoverOnPoints(sourceKey);
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

  var top = this.getStackTop(index);
  var bottom = this.getStackBottom(index);


  // return this.isVertical() ? // Turning to screen coordinates.
  //   anychart.math.rect(top, left, height - top, width) :
  //   anychart.math.rect(left, top, width, height - top);

  var tmp = top;
  top = Math.min(top, bottom);
  bottom = Math.max(tmp, bottom);

  return anychart.math.rect(left, top, width, bottom - top);
};


/**
 * Analogue of 'this.getStackBounds' but it works correctly in vertical case.
 *
 * We can't rework this.getStackBounds method because of waterfall arrows drawing. May be in future.
 *
 * @param {number} index - Stack index.
 *
 * @return {anychart.math.Rect} - Bounds of stack.
 *
 * @private
 */
anychart.waterfallModule.Chart.prototype.getStackBounds_ = function(index) {
  var bounds;

  for (var i = 0; i < this.drawingPlans.length; i++) {
    var plan = this.drawingPlans[i];
    var meta = plan.data[index].meta;
    // Missing point has no path.
    if (!meta['missing']) {
      var shape = goog.object.findValue(meta['shapes'], function(path) {
        return !!path.parent();
      });

      var shapeBounds = shape.getBounds();

      // In some cases NaNs here.
      if (!isNaN(shapeBounds.left) && !isNaN(shapeBounds.top) && !isNaN(shapeBounds.width) && !isNaN(shapeBounds.height)) {
        bounds = bounds || shapeBounds.clone();
        bounds.boundingRect(shapeBounds);
      }
    }
  }

  return bounds;
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
  var sum = 0;

  for (var i = 0; i < this.drawingPlans.length; i++) {
    var point = this.drawingPlans[i].data[index];
    if (point.meta['missing'])
      continue;

    var value;
    if (opt_treatDiffAsAbsForTotal) {
      value = this.getPointStackingValue(point);
    } else {
      value = goog.isDef(point.meta[metaFieldName]) ? point.meta[metaFieldName] : point.data['value'];
    }
    sum += value;
  }

  return sum;
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
    return isVisible || !(plan.data[index].meta['missing'] || plan.data[index].meta['skipDrawing']);
  }, false);
};


/**
 * Whether total/split stack.
 *
 * Do not treat first series point as total.
 *
 * @param {number} index - Stack index.
 *
 * @return {boolean}
 */
anychart.waterfallModule.Chart.prototype.isTotalStack = function(index) {
  return goog.array.reduce(this.drawingPlans, function(isTotal, plan) {
    return isTotal || plan.data[index].meta['isTotal'] || plan.data[index].meta['isSplit'];
  }, false) && !!index;
};


/**
 * Whether category used for total drawing.
 *
 * @param {number} index - Stack index.
 *
 * @return {boolean}
 */
anychart.waterfallModule.Chart.prototype.isCategoryUsedForTotal = function(index) {
  var forTotal = false;

  for (var i = 0; i < this.drawingPlans.length; i++) {
    var plan = this.drawingPlans[i];
    var isTotalSeries = plan.series.getType() === anychart.waterfallModule.totals.Total.seriesType;
    forTotal = forTotal || (isTotalSeries && !plan.data[index].meta['missing']);
  }

  return forTotal;
};


/**
 * Return highest value of stack.
 *
 * @param {number} index - Stack index.
 *
 * @return {number}
 */
anychart.waterfallModule.Chart.prototype.getStackTop = function(index) {
  var top = -Infinity;
  for (var i = 0; i < this.drawingPlans.length; i++) {
    var plan = this.drawingPlans[i];
    var meta = plan.data[index].meta;

    if (meta['missing']) continue;

    var stackedValue = /**@type {number}*/(meta['zero']);
    var stackedZero = /**@type {number}*/(meta['value']);

    top = Math.max(top, stackedValue, stackedZero);
  }
  return top;
};


/**
 * Return lowest value of stack.
 *
 * @param {number} index - Stack index.
 *
 * @return {number}
 */
anychart.waterfallModule.Chart.prototype.getStackBottom = function(index) {
  var bottom = Infinity;
  for (var i = 0; i < this.drawingPlans.length; i++) {
    var plan = this.drawingPlans[i];
    var meta = plan.data[index].meta;

    if (meta['missing']) continue;

    var stackedValue = /**@type {number}*/(meta['zero']);
    var stackedZero = /**@type {number}*/(meta['value']);

    bottom = Math.min(bottom, stackedValue, stackedZero);
  }

  return bottom;
};


/**
 * Return all labels that stack use.
 *
 * @param {number} index - Stack index.
 *
 * @return {Array.<anychart.core.ui.LabelsFactory.Label>}
 */
anychart.waterfallModule.Chart.prototype.getStackLabels = function(index) {
  var labels = [];

  for (var i = 0; i < this.drawingPlans.length; i++) {
    var plan = this.drawingPlans[i];
    var pointMeta = plan.data[index].meta;
    var label = pointMeta['label'];
    if (label && label.getFinalSettings('enabled')) {
      labels.push(label);
    }
  }

  var stackLabels = this.stackLabels();
  if (stackLabels.enabled()) {
    var stackLabel = stackLabels.getLabel(index);
    if (stackLabel) {
      labels.push(stackLabel);
    }
  }

  return labels;
};


//endregion
//region --- Series
/** @inheritDoc */
anychart.waterfallModule.Chart.prototype.seriesInvalidated = function(event) {
  this.invalidateMultiState(anychart.enums.Store.WATERFALL, [
    anychart.waterfallModule.Chart.SUPPORTED_STATES.ARROWS,
    anychart.waterfallModule.Chart.SUPPORTED_STATES.STACK_LABELS,
    anychart.waterfallModule.Chart.SUPPORTED_STATES.TOTALS
  ]);

  if (event.hasSignal(
    anychart.Signal.DATA_CHANGED |
    anychart.Signal.ENABLED_STATE_CHANGED |
    anychart.Signal.NEEDS_RECALCULATION
  )) {
    this.totalsController().invalidate(anychart.ConsistencyState.SERIES_DATA);
  }

  anychart.waterfallModule.Chart.base(this, 'seriesInvalidated', event);
};


/** @inheritDoc */
anychart.waterfallModule.Chart.prototype.invalidateSeriesOfScaleInternal = function() {
  anychart.waterfallModule.Chart.base(this, 'invalidateSeriesOfScaleInternal');
  // DVF-4566
  this.invalidateMultiState(
    anychart.enums.Store.WATERFALL,
    [
      anychart.waterfallModule.Chart.SUPPORTED_STATES.STACK_LABELS,
      anychart.waterfallModule.Chart.SUPPORTED_STATES.CONNECTORS_LABELS
    ]
  );
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
 * @param {number} from - Index of the point connector goes from.
 * @param {number} to - Index of the point connector goes to.
 *
 * @return {anychart.math.Rect} Bounds of the connector.
 */
anychart.waterfallModule.Chart.prototype.getConnectorBounds = function(from, to) {
  var connectorPosition = this.getConnectorCoordinates(from, to);
  var x1 = Math.min(connectorPosition.from.x, connectorPosition.to.x);
  var y1 = Math.min(connectorPosition.from.y, connectorPosition.to.y);
  var x2 = Math.max(connectorPosition.from.x, connectorPosition.to.x);
  var y2 = Math.max(connectorPosition.from.y, connectorPosition.to.y);

  var connectorBounds = this.isVertical() ?
      anychart.math.rect(y1, x1, y2 - y1, x2 - x1) :
      anychart.math.rect(x1, y1, x2 - x1, y2 - y1);

  return connectorBounds;
};


//endregion
//region --- Totals
/**
 * Return total value for passed category.
 *
 * @param {string} category Category value.
 * @return {number}
 */
anychart.waterfallModule.Chart.prototype.getTotalValue = function(category) {
  var visibleCategories = this.xScale().values();
  var isDiffMode = this.getOption('dataMode') === anychart.enums.WaterfallDataMode.DIFF;
  var totalValue = 0;
  for (var i = 0; i < this.seriesList.length; i++) {
    var series = /** @type {anychart.core.series.Cartesian} */(this.seriesList[i]);
    if (series && series.enabled()) {
      var data = series.data();
      if (data) {
        var iterator = data.getIterator();
        var excludes = series.getExcludedIndexesInternal();
        var seriesSum = 0;
        while (iterator.advance()) {
          var index = iterator.getIndex();
          // !visibleCategories.length Check for first draw, before xScale calculated.
          var isVisible =
            (goog.array.indexOf(visibleCategories, iterator.get('x')) !== -1 || !visibleCategories.length) &&
            (goog.array.indexOf(excludes, index) === -1);

          if (isVisible) {
            var value = iterator.get('value');
            if (goog.isNumber(value)) {
              if (isDiffMode) {
                seriesSum += /** @type {number}*/(value);
              } else {
                seriesSum = /** @type {number}*/(value);
              }
            }
            if (category === iterator.get('x')) {
              break;
            }
          }
        }
        totalValue += seriesSum;
      }
    }
  }
  return totalValue;
};


/**
 * Create Total instance, setup it by passed config and return it.
 *
 * @param {!anychart.waterfallModule.totals.Total.Config} config - Configuration object for total.
 *
 * @return {?anychart.waterfallModule.totals.Total} - Total instance.
 */
anychart.waterfallModule.Chart.prototype.addTotal = function(config) {
  if (goog.isObject(config)) {
    return this.totalsController().addTotal(config);
  }
  return null;
};


/**
 * Remove total instance.
 *
 * @param {anychart.waterfallModule.totals.Total} totalToRemove - Instance of total to remove.
 * @return {boolean} - 'true' if total removed successfully 'false' otherwise.
 */
anychart.waterfallModule.Chart.prototype.removeTotal = function(totalToRemove) {
  return this.totalsController().removeTotal(totalToRemove);
};


/**
 * Remove total by index.
 *
 * @param {number} indexToRemove - Index of total to remove.
 * @return {boolean} - 'true' if total removed successfully 'false' otherwise.
 */
anychart.waterfallModule.Chart.prototype.removeTotalAt = function(indexToRemove) {
  return this.totalsController().removeTotalAt(indexToRemove);
};


/**
 * Return total by index.
 *
 * @param {number} index - Index of total.
 * @return {anychart.waterfallModule.totals.Total} - Total instance or 'null' if has no total.
 */
anychart.waterfallModule.Chart.prototype.getTotalAt = function(index) {
  return this.totalsController().getTotalAt(index);
};


/**
 * Return array of totals.
 *
 * @return {Array.<anychart.waterfallModule.totals.Total>} - Array of all totals.
 */
anychart.waterfallModule.Chart.prototype.getAllTotals = function() {
  return this.totalsController().getAllTotals();
};


/**
 * Getter/Setter for total splits.
 * Split independent total that created via this.createTotal({x, name}).
 * Total will be splitted if it reserve last chart category and sum of all split values is equal or less total value.
 *
 * @param {Array.<anychart.waterfallModule.totals.Total.SplitConfig>=} opt_splits - Array of splits. Each split item must contain at least two fields 'name' and 'value'
 *
 * @return {Array.<Object>|anychart.waterfallModule.Chart}
 */
anychart.waterfallModule.Chart.prototype.splitTotal = function(opt_splits) {
  if (goog.isDef(opt_splits)) {
    this.totalSplits_ = opt_splits;
    this.invalidateStore(anychart.enums.Store.WATERFALL);
    this.totalsController().invalidate(this.totalsController().SUPPORTED_CONSISTENCY_STATES);
    this.invalidate(this.SUPPORTED_CONSISTENCY_STATES, anychart.Signal.NEEDS_REDRAW);
    return this;
  }
  return this.totalSplits_;
};


/**
 * Totals storage invalidate handler.
 * @param {anychart.SignalEvent} event
 */
anychart.waterfallModule.Chart.prototype.totalsControllerInvalidated_ = function(event) {
  this.invalidateStore(anychart.enums.Store.WATERFALL);

  var stateToInvalidate =
    anychart.ConsistencyState.APPEARANCE |
    anychart.ConsistencyState.SERIES_DATA |
    anychart.ConsistencyState.SERIES_CHART_SERIES |
    anychart.ConsistencyState.SCALE_CHART_SCALES |
    anychart.ConsistencyState.SCALE_CHART_SCALE_MAPS |
    anychart.ConsistencyState.SCALE_CHART_Y_SCALES |
    anychart.ConsistencyState.AXES_CHART_AXES;

  this.invalidate(stateToInvalidate, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Draw totals.
 */
anychart.waterfallModule.Chart.prototype.drawTotals = function() {
  if (
    this.hasStateInvalidation(anychart.enums.Store.WATERFALL, anychart.waterfallModule.Chart.SUPPORTED_STATES.TOTALS) ||
    this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    var controller = this.totalsController();

    controller.container(this.rootElement);
    controller.parentBounds(this.dataBounds);
    controller.draw();

    this.markStateConsistent(anychart.enums.Store.WATERFALL, anychart.waterfallModule.Chart.SUPPORTED_STATES.TOTALS);
  }
};


/**
 * Invalidate totals.
 * @private
 */
anychart.waterfallModule.Chart.prototype.invalidateTotals_ = function() {
  this.invalidateState(anychart.enums.Store.WATERFALL, anychart.waterfallModule.Chart.SUPPORTED_STATES.TOTALS);
  this.totalsController().invalidate(anychart.ConsistencyState.SERIES_DATA);
};


//endregion
//region --- Overrides
/** @inheritDoc */
anychart.waterfallModule.Chart.prototype.xScaleInvalidated = function(scale) {
  this.invalidateTotals_();
  anychart.waterfallModule.Chart.base(this, 'xScaleInvalidated', scale);
};


/** @inheritDoc */
anychart.waterfallModule.Chart.prototype.yScaleInvalidated = function(scale) {
  this.invalidateTotals_();
  anychart.waterfallModule.Chart.base(this, 'yScaleInvalidated', scale);
};


/** @inheritDoc */
anychart.waterfallModule.Chart.prototype.unhover = function(opt_indexOrIndexes) {
  anychart.waterfallModule.Chart.base(this, 'unhover', opt_indexOrIndexes);
  var totals = this.totalsController().getAllTotals();

  for (var i = 0; i < totals.length; i++) {
    var total = totals[i];
    total.unhover();
  }
};


/** @inheritDoc */
anychart.waterfallModule.Chart.prototype.getPointsForUnionDisplayMode = function(series, pointIndex, categoryIndex) {
  if (series && series.getType() === anychart.waterfallModule.totals.Total.seriesType) {
    return [{
      'series': series,
      'points': [pointIndex]
    }];
  }

  return anychart.waterfallModule.Chart.base(this, 'getPointsForUnionDisplayMode', series, pointIndex, categoryIndex);
};


/** @inheritDoc */
anychart.waterfallModule.Chart.prototype.getSeriesList = function() {
  var chartSeries = anychart.waterfallModule.Chart.base(this, 'getSeriesList');
  var rv = [];

  rv.push.apply(rv, chartSeries);

  rv.push.apply(rv, this.getAllTotals());

  return rv;
};


/** @inheritDoc */
anychart.waterfallModule.Chart.prototype.onMarkersSignal = function(event) {
  this.invalidateTotals_();
  anychart.waterfallModule.Chart.base(this, 'onMarkersSignal', event);
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
 * Returns totals controller.
 *
 * @return {anychart.waterfallModule.totals.Controller}
 */
anychart.waterfallModule.Chart.prototype.totalsController = function() {
  if (!this.totalsController_) {
    this.totalsController_ = new anychart.waterfallModule.totals.Controller(this);
    this.totalsController_.listenSignals(this.totalsControllerInvalidated_, this);
  }
  return this.totalsController_;
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
  json['chart']['totals'] = this.totalsController().serialize();
  json['chart']['arrows'] = this.arrowsController().serialize();
  json['chart']['totalSplits'] = this.totalSplits_;

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

  if (config['totals']) {
    this.totalsController().setupInternal(!!opt_default, config['totals']);
  }

  if (config['totalSplits']) {
    this.splitTotal(config['totalSplits']);
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
      this.arrowsController_,
      this.totalsController_
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

  proto['addTotal'] = proto.addTotal;
  proto['removeTotal'] = proto.removeTotal;
  proto['removeTotalAt'] = proto.removeTotalAt;
  proto['getTotalAt'] = proto.getTotalAt;
  proto['getAllTotals'] = proto.getAllTotals;
  proto['splitTotal'] = proto.splitTotal;
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
