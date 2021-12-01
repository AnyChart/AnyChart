goog.provide('anychart.waterfallModule.Series');
goog.require('anychart.core.series.Cartesian');
goog.require('anychart.core.settings');
goog.require('anychart.enums');



/**
 * Class that represents a series for the user.
 * @param {!anychart.core.IChart} chart
 * @param {!anychart.core.IPlot} plot
 * @param {string} type
 * @param {anychart.core.series.TypeConfig} config
 * @param {boolean} sortedMode
 * @constructor
 * @extends {anychart.core.series.Cartesian}
 */
anychart.waterfallModule.Series = function(chart, plot, type, config, sortedMode) {
  anychart.waterfallModule.Series.base(this, 'constructor', chart, plot, type, config, sortedMode);
};
goog.inherits(anychart.waterfallModule.Series, anychart.core.series.Cartesian);


//region --- overrides
/**
 * Token aliases list.
 * @type {Object.<string, string>}
 */
anychart.waterfallModule.Series.prototype.TOKEN_ALIASES = (function() {
  var tokenAliases = {};
  tokenAliases[anychart.enums.StringToken.BUBBLE_SIZE] = 'size';
  tokenAliases[anychart.enums.StringToken.RANGE_START] = 'low';
  tokenAliases[anychart.enums.StringToken.RANGE_END] = 'high';
  tokenAliases[anychart.enums.StringToken.X_VALUE] = 'x';
  tokenAliases[anychart.enums.StringToken.DIFF] = 'diff';
  tokenAliases[anychart.enums.StringToken.ABSOLUTE] = 'absolute';
  tokenAliases[anychart.enums.StringToken.IS_TOTAL] = 'isTotal';
  return tokenAliases;
})();


/** @inheritDoc */
anychart.waterfallModule.Series.prototype.resolveAutoAnchor = function(position, rotation) {
  if (position == 'inside' || position == 'outside') {
    return anychart.enums.Anchor.CENTER;
  }

  if (position == anychart.enums.Position.AUTO) {
    if (this.chart.getSeriesCount() > 1) {
      return anychart.enums.Anchor.CENTER;
    } else {
      position = 'value';
    }
  }

  return anychart.waterfallModule.Series.base(this, 'resolveAutoAnchor', position, rotation);
};


/** @inheritDoc */
anychart.waterfallModule.Series.prototype.createPositionProvider = function(position, opt_shift3D) {
  if (this.chart.needsOutsideLabelsDistribution() && (position == 'inside' || position == 'outside')) {
    position = anychart.enums.Position.CENTER;
  }

  if (position == anychart.enums.Position.AUTO) {
    if (this.chart.getSeriesCount() > 1) {
      position = anychart.enums.Position.CENTER;
    } else {
      position = 'value';
    }
  }

  return anychart.waterfallModule.Series.base(this, 'createPositionProvider', position, opt_shift3D);
};


/**
 * Gets outside labels data object.
 *
 * @param {anychart.core.ui.LabelsFactory.Label} label - Label.
 * @param {anychart.data.IRowInfo} point - .
 * @return {Object} - Collected outside label bounds data.
 */
anychart.waterfallModule.Series.prototype.getLabelOutOfBoundsData = function(label, point) {
  var labelBounds = this.chart.getLabelBounds(label);
  var labelWidth = labelBounds.width;
  var labelHeight = labelBounds.height;
  var uid = goog.getUid(label);

  var top = /** @type {number} */ (point.meta('value'));
  var bottom = /** @type {number} */ (point.meta('zero'));
  var pointHeight = Math.abs(top - bottom);

  var isOutOfBounds = !!this.chart.isVertical() ?
    (labelWidth > pointHeight) :
    (labelHeight > pointHeight);

  return {
    uid: uid,
    isOutOfBounds: isOutOfBounds,
    label: label,
    bounds: labelBounds
  };
};


/**
 * Creates and returns new position provider for outside labels.
 *
 * @param {anychart.data.IRowInfo} point - .
 * @param {{value: {x:number, y:number}}} positionProvider - Incoming default position provider.
 * @return {{value: {x:number, y:number}}} - New position provider.
 */
anychart.waterfallModule.Series.prototype.getOutsidePositionProvider = function(point, positionProvider) {
  var isVertical = !!this.chart.isVertical();
  var halfSize = this.pointWidthCache / 2;
  var ppValue = positionProvider['value'];
  var ppCoordinate = isVertical ? ppValue.y : ppValue.x;
  var sign = isVertical ? -1 : 1;
  var outsideCoordinate = ppCoordinate + halfSize * sign;

  var newPPValue = isVertical ?
    { x: ppValue.x, y: outsideCoordinate + 3 * sign} :
    { x: outsideCoordinate + 3 * sign, y: ppValue.y};

  var newConnectorPointValue = isVertical ?
    { x: ppValue.x, y: outsideCoordinate - 2 * sign} :
    { x: outsideCoordinate - 2 * sign, y: ppValue.y};

  return {
    'value': newPPValue,
    'connectorPoint': {
      'value': newConnectorPointValue
    }
  };
};


/**
 * Comparison function for horizontal layout of chart to sort labels order.
 *
 * @param {Object} item1 - Item1 to compare.
 * @param {Object} item2 - Item2 to compare.
 * @return {number} - Comparison result.
 */
anychart.waterfallModule.Series.prototype.labelOutOfBoundsHorizontalDataComparator_ = function(item1, item2) {
  if (item1 && item2) {
    var start1 = item1.bounds.top;
    var start2 = item2.bounds.top;
    var diff = start2 - start1; // Can be NaN.
    if (diff > 0) {
      return 1;
    }
    // Never returns zero to avoid skipping an insertion of same value (@see goog.array.binaryInsert).
  }

  return -1;
};


/**
 * Comparison function for vertical layout of chart to sort labels order.
 *
 * @param {Object} item1 - Item1 to compare.
 * @param {Object} item2 - Item2 to compare.
 * @return {number} - Comparison result.
 */
anychart.waterfallModule.Series.prototype.labelOutOfBoundsVerticalDataComparator_ = function(item1, item2) {
  if (item1 && item2) {
    var start1 = item1.bounds.left;
    var start2 = item2.bounds.left;
    var diff = start2 - start1; // Can be NaN.
    if (diff > 0) {
      return 1;
    }
    // Never returns zero to avoid skipping an insertion of same value (@see goog.array.binaryInsert).
  }

  return -1;
};




/** @inheritDoc */
anychart.waterfallModule.Series.prototype.drawFactoryElement = function(seriesFactoryGetters, chartFactoryGetters, overrideNames, hasPointOverrides, isLabel, positionYs, point, state, callDraw) {
  var element = /** @type {anychart.core.ui.LabelsFactory.Label} */ (anychart.waterfallModule.Series.base(this, 'drawFactoryElement', seriesFactoryGetters, chartFactoryGetters, overrideNames, hasPointOverrides, isLabel, positionYs, point, state, true));

  // position inside  - always inside, drop
  // position outside - always outside
  // position auto    - inside / outside

  if (element && isLabel) {
    var labelOutOfBoundsData = this.getLabelOutOfBoundsData(element, point);
    var isOutOfBounds = labelOutOfBoundsData.isOutOfBounds;

    var position = element.getFinalSettings('position');
    var positionProvider = /** @type {{value: {x:number, y:number}}} */ (element.positionProvider());
    var isVertical = !!this.chart.isVertical();

    var autoAnchor = isVertical ?
      anychart.enums.Anchor.CENTER_BOTTOM :
      anychart.enums.Anchor.LEFT_CENTER;

    var outsideProvider;

    // label.autoAnchor() value will be set in resolveAutoAnchor() earlier.
    if (position == 'outside') {
      outsideProvider = this.getOutsidePositionProvider(point, positionProvider);
      this.setPositionProvider(/** @type {!anychart.core.ui.LabelsFactory.Label} */ (element), outsideProvider);
      element.autoAnchor(autoAnchor);
    } else if (position == 'inside') {
      element.enabled(!isOutOfBounds);
    } else {
      if (isOutOfBounds && this.chart.needsOutsideLabelsDistribution()) {
        var pointCategory = point.get('x');
        this.chart.outsideLabelsData[pointCategory] = this.chart.outsideLabelsData[pointCategory] || {};
        this.chart.outsideLabelsData[pointCategory].labels = this.chart.outsideLabelsData[pointCategory].labels || [];
        this.chart.outsideLabelsData[pointCategory].uids = this.chart.outsideLabelsData[pointCategory].uids || {};

        var uid = labelOutOfBoundsData.uid;

        if (!(uid in this.chart.outsideLabelsData[pointCategory].uids)) {
          this.chart.outsideLabelsData[pointCategory].uids[uid] = labelOutOfBoundsData;

          var comparator = isVertical ?
            this.labelOutOfBoundsVerticalDataComparator_ :
            this.labelOutOfBoundsHorizontalDataComparator_;

          goog.array.binaryInsert(
            this.chart.outsideLabelsData[pointCategory].labels,
            labelOutOfBoundsData,
            comparator
          );
        }

        outsideProvider = this.getOutsidePositionProvider(point, positionProvider);
        this.setPositionProvider(/** @type {!anychart.core.ui.LabelsFactory.Label} */ (element), outsideProvider);
        element.autoAnchor(autoAnchor);

        if (this.chart.outsideLabelsData.isComplete) {
          this.chart.putLabelsInCategory(pointCategory);
        }
      }
    }

    element.draw();
  }
  return element;
};


/** @inheritDoc */
anychart.waterfallModule.Series.prototype.getContextProviderValues = function(provider, rowInfo) {
  var values = anychart.waterfallModule.Series.base(this, 'getContextProviderValues', provider, rowInfo);

  values['diff'] = {
    value: rowInfo.meta('diff'),
    type: anychart.enums.TokenType.NUMBER
  };
  values['absolute'] = {
    value: rowInfo.meta('absolute'),
    type: anychart.enums.TokenType.NUMBER
  };
  values['isTotal'] = {
    value: rowInfo.meta('isTotal'),
    type: anychart.enums.TokenType.UNKNOWN
  };
  return values;
};


/** @inheritDoc */
anychart.waterfallModule.Series.prototype.initPostProcessingMeta = function() {
  return {
    prevValue: 0,
    hadNonMissing: false,
    modeAbsolute: /** @type {string} */ (/** @type {anychart.waterfallModule.Chart} */ (this.chart).getOption('dataMode')) == anychart.enums.WaterfallDataMode.ABSOLUTE
  };
};


/** @inheritDoc */
anychart.waterfallModule.Series.prototype.postProcessPoint = function(iterator, point, processingMeta) {
  var pointExcluded = goog.array.indexOf(this.excludedPoints || [], point.meta['rawIndex']) > -1;
  var isTotalValue = iterator.get('isTotal');
  var isMissing = (!!point.meta['missing']) || pointExcluded;
  var isFirstPoint = !(processingMeta.hadNonMissing || isMissing);
  var isTotal = isFirstPoint ||
      (goog.isDef(isTotalValue) ? !!isTotalValue : isMissing);
  if (isMissing && (isFirstPoint || !isTotal)) {
    point.meta['missing'] = anychart.core.series.PointAbsenceReason.VALUE_FIELD_MISSING;
  } else {
    var value;
    if (processingMeta.modeAbsolute) {
      value = isMissing ? processingMeta.prevValue : +(point.data['value']);
    } else {
      value = processingMeta.prevValue + (isMissing ? 0 : +(point.data['value']));
    }
    point.meta['absolute'] = value;
    point.meta['diff'] = value - processingMeta.prevValue;
    point.meta['isTotal'] = isTotal;
    point.meta['missing'] = 0;
    processingMeta.hadNonMissing = true;
    processingMeta.prevValue = value;
  }
};


/** @inheritDoc */
anychart.waterfallModule.Series.prototype.checkDirectionIsPositive = function(position) {
  var result;
  if (position == 'value') {
    result = (Number(this.getIterator().meta('diff')) || 0) >= 0;
  } else
    result = anychart.waterfallModule.Series.base(this, 'checkDirectionIsPositive', position);
  return result;
};


/** @inheritDoc */
anychart.waterfallModule.Series.prototype.getPointValue = function(rowInfo) {
  return rowInfo.meta('isTotal') ? rowInfo.get('value') : rowInfo.meta('diff');
};


//endregion
