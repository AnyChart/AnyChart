goog.provide('anychart.heatmapModule.Series');
goog.require('acgraph');
goog.require('anychart.color');
goog.require('anychart.colorScalesModule');
goog.require('anychart.core.series.Cartesian');
goog.require('anychart.core.settings');
goog.require('anychart.core.utils.Padding');
goog.require('anychart.enums');
goog.require('anychart.format.Context');
goog.require('anychart.heatmapModule.Drawer');
goog.require('anychart.math.Rect');
goog.require('anychart.utils');



/**
 * Base class for all heat map series.<br/>
 * @param {!anychart.core.IChart} chart
 * @param {!anychart.core.IPlot} plot
 * @param {string} type
 * @param {anychart.core.series.TypeConfig} config
 * @param {boolean} sortedMode
 * @constructor
 * @extends {anychart.core.series.Cartesian}
 */
anychart.heatmapModule.Series = function(chart, plot, type, config, sortedMode) {
  anychart.heatmapModule.Series.base(this, 'constructor', chart, plot, type, config, sortedMode);

  this.normal().labels().adjustFontSizeMode('same');
  this.normal().labels().setParentEventTarget(this);

  /**
   * Stroke resolver.
   * @type {function(anychart.core.series.Base, number, boolean=, boolean=):acgraph.vector.Stroke}
   * @private
   */
  this.strokeResolver_ = /** @type {function(anychart.core.series.Base, number, boolean=, boolean=):acgraph.vector.Stroke} */(
      anychart.color.getColorResolver('stroke', anychart.enums.ColorType.STROKE, true));
  this.normal_.setMeta('stroke', [
    anychart.ConsistencyState.SERIES_POINTS,
    anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEED_UPDATE_LEGEND,
    anychart.core.series.Capabilities.ANY
  ]);
};
goog.inherits(anychart.heatmapModule.Series, anychart.core.series.Cartesian);


/**
 * Labels z-index.
 */
anychart.heatmapModule.Series.prototype.LABELS_ZINDEX = anychart.core.shapeManagers.LABELS_OVER_MARKERS_ZINDEX;


/**
 * Token aliases list.
 * @type {Object.<string, string>}
 */
anychart.heatmapModule.Series.prototype.TOKEN_ALIASES = (function() {
  var tokenAliases = {};
  tokenAliases[anychart.enums.StringToken.X_VALUE] = 'x';
  return tokenAliases;
})();


/** @inheritDoc */
anychart.heatmapModule.Series.prototype.tooltip = function(opt_value) {
  var res = (/** @type {anychart.heatmapModule.Chart} */(this.chart)).tooltip(opt_value);
  return goog.isDef(opt_value) ? this : /** @type {!anychart.core.ui.Tooltip} */(res);
};


/**
 * @param {anychart.data.IRowInfo} point
 * @param {anychart.PointState} pointState
 * @param {string} prefix
 * @param {number} minFontSize
 * @return {number}
 * @private
 */
anychart.heatmapModule.Series.prototype.calcMinFontSize_ = function(point, pointState, prefix, minFontSize) {
  var label = this.drawFactoryElement(
      [this.normal().labels, this.hovered().labels, this.selected().labels],
      [],
      ['label', 'hoverLabel', 'selectLabel'],
      this.planHasPointLabels(),
      true,
      null,
      point,
      pointState,
      false);

  if (label) {
    var mergedSettings = label.getMergedSettings();
    var needAdjust = (mergedSettings['adjustByHeight'] || mergedSettings['adjustByHeight']);
    if (needAdjust) {
      var width = /** @type {number} */(point.meta(prefix + 'Width'));
      var height = /** @type {number} */(point.meta(prefix + 'Height'));
      var padding = new anychart.core.utils.Padding().setup(mergedSettings['padding']);
      width -= padding.getOption('left') + padding.getOption('right');
      height -= padding.getOption('top') + padding.getOption('bottom');
      goog.dispose(padding);
      padding = null;
      var fontSize = label.calculateFontSize(
          width,
          height,
          mergedSettings['minFontSize'],
          mergedSettings['maxFontSize'],
          mergedSettings['adjustByWidth'],
          mergedSettings['adjustByHeight']);

      minFontSize = Math.min(minFontSize || Infinity, fontSize);
    }
  }
  return minFontSize;
};


/** @inheritDoc */
anychart.heatmapModule.Series.prototype.additionalLabelsInitialize = function() {
  var labels = /** @type {anychart.core.ui.LabelsFactory} */(this.normal().labels());
  var hoverLabels = /** @type {anychart.core.ui.LabelsFactory} */(this.hovered().labels());
  var selectLabels = /** @type {anychart.core.ui.LabelsFactory} */(this.selected().labels());

  var labelsEnabled = /** @type {boolean} */(labels.enabled());
  var hoverLabelsEnabled = labelsEnabled || /** @type {boolean} */(hoverLabels.enabled());
  var selectLabelsEnabled = labelsEnabled || /** @type {boolean} */(selectLabels.enabled());

  var normalAdjust = labels.adjustEnabled();
  var hoverAdjust = (normalAdjust || hoverLabels.adjustEnabled()) && hoverLabelsEnabled;
  var selectAdjust = (normalAdjust || selectLabels.adjustEnabled()) && selectLabelsEnabled;
  normalAdjust = labelsEnabled && normalAdjust;

  var minFontSize, hoverMinFontSize, selectMinFontSize;
  minFontSize = hoverMinFontSize = selectMinFontSize = NaN;
  labels.setAdjustFontSize(null);
  hoverLabels.setAdjustFontSize(null);
  selectLabels.setAdjustFontSize(null);

  if (normalAdjust || hoverAdjust || selectAdjust) {
    var iterator = this.getIterator();
    iterator.reset();
    while (iterator.advance()) {
      if (!iterator.meta('missing')) {
        if (normalAdjust) {
          minFontSize = this.calcMinFontSize_(iterator, anychart.PointState.NORMAL, 'normal', minFontSize);
        }
        if (hoverAdjust) {
          hoverMinFontSize = this.calcMinFontSize_(iterator, anychart.PointState.HOVER, 'hover', hoverMinFontSize);
        }
        if (selectAdjust) {
          selectMinFontSize = this.calcMinFontSize_(iterator, anychart.PointState.SELECT, 'select', selectMinFontSize);
        }
      }
    }
  }
  if (normalAdjust) {
    labels.setAdjustFontSize(minFontSize);
  } else {
    labels.setAdjustFontSize(null);
  }

  if (hoverAdjust) {
    hoverLabels.setAdjustFontSize(hoverMinFontSize);
  } else {
    hoverLabels.setAdjustFontSize(null);
  }

  if (selectAdjust) {
    selectLabels.setAdjustFontSize(selectMinFontSize);
  } else {
    selectLabels.setAdjustFontSize(null);
  }
};


/**
 * Prepares outliers part of point meta.
 * @param {anychart.data.IRowInfo} rowInfo
 * @param {Array.<string>} yNames
 * @param {Array.<string|number>} yColumns
 * @param {number} pointMissing
 * @param {number} xRatio
 * @return {number} - pointMissing updated value.
 * @protected
 */
anychart.heatmapModule.Series.prototype.makeHeatMapMeta = function(rowInfo, yNames, yColumns, pointMissing, xRatio) {
  // we assume here, that isPointVisible injected 'left', 'right', 'top' and 'bottom' meta already
  var left = /** @type {number} */(rowInfo.meta('left'));
  var right = /** @type {number} */(rowInfo.meta('right'));
  var top = /** @type {number} */(rowInfo.meta('top'));
  var bottom = /** @type {number} */(rowInfo.meta('bottom'));

  var stroke = this.strokeResolver_(this, anychart.PointState.NORMAL);
  var hoverStroke = this.strokeResolver_(this, anychart.PointState.HOVER);
  var selectStroke = this.strokeResolver_(this, anychart.PointState.SELECT);
  var strokeThicknessHalf = acgraph.vector.getThickness(stroke) / 2;
  var hoverStrokeThicknessHalf = acgraph.vector.getThickness(hoverStroke) / 2;
  var selectStrokeThicknessHalf = acgraph.vector.getThickness(selectStroke) / 2;

  var width = right - left;
  var height = bottom - top;

  rowInfo.meta('normalX', left + strokeThicknessHalf);
  rowInfo.meta('normalY', top + strokeThicknessHalf);
  rowInfo.meta('normalWidth', width - strokeThicknessHalf - strokeThicknessHalf);
  rowInfo.meta('normalHeight', height - strokeThicknessHalf - strokeThicknessHalf);

  rowInfo.meta('hoverX', left + hoverStrokeThicknessHalf);
  rowInfo.meta('hoverY', top + hoverStrokeThicknessHalf);
  rowInfo.meta('hoverWidth', width - hoverStrokeThicknessHalf - hoverStrokeThicknessHalf);
  rowInfo.meta('hoverHeight', height - hoverStrokeThicknessHalf - hoverStrokeThicknessHalf);

  rowInfo.meta('selectX', left + selectStrokeThicknessHalf);
  rowInfo.meta('selectY', top + selectStrokeThicknessHalf);
  rowInfo.meta('selectWidth', width - selectStrokeThicknessHalf - selectStrokeThicknessHalf);
  rowInfo.meta('selectHeight', height - selectStrokeThicknessHalf - selectStrokeThicknessHalf);

  return pointMissing;
};


/** @inheritDoc */
anychart.heatmapModule.Series.prototype.isPointVisible = function(point) {
  var xScale = this.getXScale();
  var yScale = /** @type {anychart.scales.Base} */(this.yScale());
  var x = point.get('x');
  var y = point.get('y');

  var leftRatio = xScale.transform(x, 0);
  var rightRatio = xScale.transform(x, 1);
  var topRatio = yScale.transform(y, 0);
  var bottomRatio = yScale.transform(y, 1);

  if (leftRatio < 0 && rightRatio < 0 ||
      topRatio < 0 && bottomRatio < 0 ||
      leftRatio > 1 && rightRatio > 1 ||
      topRatio > 1 && bottomRatio > 1)
    return false;

  var l = Math.round(this.applyRatioToBounds(leftRatio, true));
  var t = Math.round(this.applyRatioToBounds(topRatio, false));
  var r = Math.round(this.applyRatioToBounds(rightRatio, true));
  var b = Math.round(this.applyRatioToBounds(bottomRatio, false));
  var vPadding = this.verticalGridThickness / 2;
  var hPadding = this.horizontalGridThickness / 2;

  var left = Math.min(l, r);
  var right = Math.max(l, r);
  var top = Math.min(t, b);
  var bottom = Math.max(t, b);

  // that's how grids.Linear aligns its lines
  left += Math.ceil(vPadding);
  top += Math.floor(hPadding);
  right -= (rightRatio == 1) ? Math.ceil(vPadding) : Math.floor(vPadding);
  bottom -= (bottomRatio == 1) ? Math.floor(hPadding) : Math.ceil(hPadding);

  point.meta('left', left);
  point.meta('top', top);
  point.meta('right', right);
  point.meta('bottom', bottom);
  point.meta('x', xScale.transform(x, 0.5));
  return true;
};


/** @inheritDoc */
anychart.heatmapModule.Series.prototype.prepareMetaMakers = function(yNames, yColumns) {
  this.metaMakers.length = 0;
  this.metaMakers.push(this.makeHeatMapMeta);
  var iterator = this.getIterator();
  iterator.reset();
  while (iterator.advance()) {
    this.makePointMeta(iterator, yNames, yColumns);
  }
  this.metaMakers.length = 0;
};


/** @inheritDoc */
anychart.heatmapModule.Series.prototype.createPositionProviderByGeometry = function(anchor) {
  var iterator = this.getIterator();
  var left = /** @type {number} */(iterator.meta('left'));
  var top = /** @type {number} */(iterator.meta('top'));
  var right = /** @type {number} */(iterator.meta('right'));
  var bottom = /** @type {number} */(iterator.meta('bottom'));
  var bounds = new anychart.math.Rect(left, top, right - left, bottom - top);
  var res = anychart.utils.getCoordinateByAnchor(bounds, /** @type {anychart.enums.Anchor} */(anchor));
  res['x'] = Math.floor(res['x']);
  res['y'] = Math.floor(res['y']);
  return res;
};


/** @inheritDoc */
anychart.heatmapModule.Series.prototype.drawLabel = function(point, pointState, pointStateChanged) {
  var displayMode = (/** @type {anychart.heatmapModule.Chart} */(this.chart)).getOption('labelsDisplayMode');
  var label = this.drawFactoryElement(
      [this.normal().labels, this.hovered().labels, this.selected().labels],
      [],
      ['label', 'hoverLabel', 'selectLabel'],
      this.planHasPointLabels(),
      true,
      null,
      point,
      pointState,
      false);
  if (label) {
    var prefix;
    if (pointState == anychart.PointState.NORMAL) {
      prefix = 'normal';
    } else if (pointState == anychart.PointState.HOVER) {
      prefix = 'hover';
    } else {
      prefix = 'select';
    }

    var x = /** @type {number} */(point.meta(prefix + 'X'));
    var y = /** @type {number} */(point.meta(prefix + 'Y'));
    var width = /** @type {number} */(point.meta(prefix + 'Width'));
    var height = /** @type {number} */(point.meta(prefix + 'Height'));
    var cellBounds = anychart.math.rect(x, y, width, height);
    var labels = this.normal().labels();

    if (displayMode == anychart.enums.LabelsDisplayMode.DROP) {
      var mergedSettings = label.getMergedSettings();
      mergedSettings['width'] = null;
      mergedSettings['height'] = null;
      var bounds = labels.measure(label.formatProvider(), label.positionProvider(), mergedSettings);
      // we allow 0.5 pixel bounds overlap to allow better labels positioning
      if (cellBounds.left > bounds.left + .5 ||
          cellBounds.getRight() < bounds.getRight() - .5 ||
          cellBounds.top > bounds.top + .5 ||
          cellBounds.getBottom() < bounds.getBottom() - .5) {
        labels.clear(label.getIndex());
        label = null;
      }
    }

    if (label) {
      var clipBounds = displayMode == anychart.enums.LabelsDisplayMode.ALWAYS_SHOW ?
          this.pixelBoundsCache :
          goog.math.Rect.intersection(this.pixelBoundsCache, /** @type {goog.math.Rect} */ (cellBounds));
      if (clipBounds) {
        label['clip'](clipBounds);

        if (pointStateChanged)
          label.draw();
      } else {
        labels.clear(label.getIndex());
      }
    }
  }
  point.meta('label', label);
};


/** @inheritDoc */
anychart.heatmapModule.Series.prototype.setupLabelDrawingPlan = function(label,
                                                                         chartNormal, seriesNormal, pointNormal,
                                                                         chartState, seriesState, pointState,
                                                                         chartExtremumNormal, seriesExtremumNormal, pointExtremumNormal,
                                                                         chartExtremumState, seriesExtremumState, pointExtremumState) {
  label.stateOrder(anychart.utils.extractSettings([
    pointState, anychart.utils.ExtractSettingModes.PLAIN_OBJECT,
    seriesState, anychart.utils.ExtractSettingModes.OWN_SETTINGS,
    pointNormal, anychart.utils.ExtractSettingModes.PLAIN_OBJECT,
    seriesNormal, anychart.utils.ExtractSettingModes.OWN_SETTINGS,
    label, anychart.utils.ExtractSettingModes.OWN_SETTINGS,
    seriesState || seriesNormal, anychart.utils.ExtractSettingModes.AUTO_SETTINGS,
    seriesState, anychart.utils.ExtractSettingModes.THEME_SETTINGS,
    label, anychart.utils.ExtractSettingModes.AUTO_SETTINGS,
    seriesNormal, anychart.utils.ExtractSettingModes.THEME_SETTINGS
  ]));
};


/**
 * Calculates grid padding for heat map cells.
 */
anychart.heatmapModule.Series.prototype.prepareAdditional = function() {
  var res = (/** @type {anychart.heatmapModule.Chart} */(this.getChart())).calculateGridsThickness();
  this.verticalGridThickness = res.vertical;
  this.horizontalGridThickness = res.horizontal;
  anychart.heatmapModule.Series.base(this, 'prepareAdditional');
};


/**
 * Apply axes lines space.
 * @param {number} value Value.
 * @return {number} .
 * @protected
 */
anychart.heatmapModule.Series.prototype.applyAxesLinesSpace = function(value) {
  var bounds = this.pixelBoundsCache;
  var max = bounds.getBottom() - this.axesLinesSpace()['bottom']();
  var min = bounds.getTop() + this.axesLinesSpace()['top']();

  return goog.math.clamp(value, min, max);
};


/** @inheritDoc */
anychart.heatmapModule.Series.prototype.createStatisticsSource = function(rowInfo) {
  return [this, this.getChart()];
};


/** @inheritDoc */
anychart.heatmapModule.Series.prototype.getCustomTokenValues = function(rowInfo) {
  return {};
};


/** @inheritDoc */
anychart.heatmapModule.Series.prototype.getContextProviderValues = function(provider, rowInfo) {
  var values = {
    'chart': {value: this.getChart(), type: anychart.enums.TokenType.UNKNOWN},
    'series': {value: this, type: anychart.enums.TokenType.UNKNOWN},
    'scale': {value: this.xScale(), type: anychart.enums.TokenType.UNKNOWN},
    'index': {value: rowInfo.getIndex(), type: anychart.enums.TokenType.NUMBER},
    'x': {value: rowInfo.get('x'), type: anychart.enums.TokenType.STRING},
    'y': {value: rowInfo.get('y'), type: anychart.enums.TokenType.STRING},
    'heat': {value: rowInfo.get('heat'), type: anychart.enums.TokenType.NUMBER},
    'seriesName': {value: this.name(), type: anychart.enums.TokenType.STRING}
  };

  var colorScale = this.getChart().colorScale();
  if (colorScale) {
    var value = rowInfo.get('heat');

    if (anychart.utils.instanceOf(colorScale, anychart.colorScalesModule.Ordinal)) {
      var range = colorScale.getRangeByValue(/** @type {number} */(value));
      if (range) {
        var colorRange = {
          'color': range.color,
          'end': range.end,
          'name': range.name,
          'start': range.start,
          'index': range.sourceIndex
        };
        values['colorRange'] = {value: colorRange, type: anychart.enums.TokenType.UNKNOWN};
      }
      values['color'] = {value: colorScale.valueToColor(/** @type {number} */(value)), type: anychart.enums.TokenType.UNKNOWN};
    }
  }

  return values;
};


/** @inheritDoc */
anychart.heatmapModule.Series.prototype.getColorResolutionContext = function(opt_baseColor, opt_ignorePointSettings, opt_ignoreColorScale) {
  var pointProvider = /** @type {anychart.format.Context} */(anychart.heatmapModule.Series.base(this, 'getColorResolutionContext', opt_baseColor, opt_ignorePointSettings, opt_ignoreColorScale));
  var values = pointProvider.contextValues();

  var iterator = pointProvider.dataSource();

  values['x'] = {value: iterator.get('x'), type: anychart.enums.TokenType.STRING};
  values['y'] = {value: iterator.get('y'), type: anychart.enums.TokenType.STRING};
  values['heat'] = {value: iterator.get('heat'), type: anychart.enums.TokenType.NUMBER};

  var scaledColor;
  var source = opt_baseColor || this.getOption('color') || 'blue';
  var colorScale = (/** @type {anychart.heatmapModule.Chart} */(this.getChart())).colorScale();
  if (colorScale) {
    var value = /** @type {number|string} */(iterator.get('heat'));
    if (goog.isDef(value))
      scaledColor = colorScale.valueToColor(value);

    values['scaledColor'] = {value: scaledColor, type: anychart.enums.TokenType.UNKNOWN};
  }

  values['colorScale'] = {value: colorScale, type: anychart.enums.TokenType.UNKNOWN};
  values['sourceColor'] = {value: scaledColor || source, type: anychart.enums.TokenType.UNKNOWN};

  return pointProvider.propagate(values);
};


//exports
(function() {
  var proto = anychart.heatmapModule.Series.prototype;
  proto['tooltip'] = proto.tooltip;
})();
