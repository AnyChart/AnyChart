goog.provide('anychart.themes.merging');
goog.require('anychart.color');


/**
 * Propagates all default values to their end-point targets.
 * @param {*} theme
 * @return {*}
 */
anychart.themes.merging.compileTheme = function(theme) {
  var result = anychart.utils.recursiveClone(theme);
  var i;
  for (i = 0; i < anychart.themes.merging.mergingMap_.length; i++) {
    var obj = anychart.themes.merging.mergingMap_[i];
    var defaultsObj = obj.defaultObj;
    for (var j = 0; j < obj.targets.length; j++) {
      result = anychart.themes.merging.mergeThemePart_(result, obj.targets[j].split('.'), defaultsObj.split('.'));
    }
  }
  return result || {};
};


/**
 * Safely retrieves the part of the theme by the path parts. Returns the part or undefined if it couldn't be found.
 * @param {*} theme
 * @param {Array.<string|number>} path
 * @return {*}
 * @private
 */
anychart.themes.merging.getThemePart_ = function(theme, path) {
  var result = theme;
  for (var i = 0; i < path.length; i++) {
    if (goog.isObject(result))
      result = result[path[i]];
    else
      return undefined;
  }
  return result;
};


/**
 * Brutally puts value to the specified path in theme. If any intermediate steps are not objects, they will be forced
 * to become. If passed value is undefined - does nothing.
 * @param {*} theme
 * @param {Array.<string|number>} path Path parts.
 * @param {*} value
 * @return {*} Theme with the result.
 * @private
 */
anychart.themes.merging.setThemePart_ = function(theme, path, value) {
  if (goog.isDef(value)) {
    var curr = goog.isObject(theme) ? theme : {};
    var result = curr;
    for (var i = 0; i < path.length - 1; i++) {
      var key = path[i];
      if (!goog.isObject(curr[key]))
        curr[key] = {};
      curr = curr[key];
    }
    curr[path[path.length - 1]] = value;
    return result;
  } else {
    return theme;
  }
};


/**
 * Brutally removes value from the specified path in theme. If any intermediate objects except the root one become empty,
 * they would also be removed.
 * @param {*} theme
 * @param {Array.<string|number>} path Path parts.
 * @return {*} Theme with the result.
 * @private
 */
anychart.themes.merging.removeThemePart_ = function(theme, path) {
  theme = goog.isObject(theme) ? theme : {};
  var curr = theme;
  var pathElements = [curr];
  var last = path.length - 1;
  for (var i = 0; i < last; i++) {
    var key = path[i];
    if (!goog.isObject(curr[key]))
      return theme;
    curr = curr[key];
    pathElements.push(curr);
  }
  for (i = last + 1; i--;) {
    curr = pathElements.pop();
    delete curr[path[i]];
    var hasElements = false;
    for (var ignored in curr) {
      hasElements = true;
      break;
    }
    if (hasElements)
      break;
  }
  return theme;
};


/**
 * Merges theme part.
 * @param {*} theme
 * @param {Array.<string|number>} targetPath
 * @param {Array.<string|number>} defaultPath
 * @return {*}
 * @private
 */
anychart.themes.merging.mergeThemePart_ = function(theme, targetPath, defaultPath) {
  return anychart.themes.merging.setThemePart_(
      theme, targetPath,
      anychart.themes.merging.merge(
          anychart.themes.merging.getThemePart_(theme, targetPath),
          anychart.themes.merging.getThemePart_(theme, defaultPath)));
};


/**
 * Replaces passed targetPath part with defaultPath part if the former is not defined.
 * @param {*} theme
 * @param {Array.<string|number>} targetPath
 * @param {Array.<string|number>} defaultPath
 * @return {*}
 * @private
 */
anychart.themes.merging.replaceThemePart_ = function(theme, targetPath, defaultPath) {
  if (!goog.isDef(anychart.themes.merging.getThemePart_(theme, targetPath)))
    return anychart.themes.merging.setThemePart_(theme, targetPath,
        anychart.themes.merging.getThemePart_(theme, defaultPath));
  return theme;
};


/**
 * Recursive extending of objects. We do not care about copying any objects here, because we assume that both target
 * and target are already recursively cloned. TARGET OBJECTS CAN BE MODIFIED.
 * @param {*} target
 * @param {*} defaultObj
 * @return {*} Extended target object.
 */
anychart.themes.merging.merge = function(target, defaultObj) {
  if (goog.isDef(target)) {
    if (goog.typeOf(target) == 'object') {
      if (goog.typeOf(defaultObj) == 'object') {
        for (var key in defaultObj) {
          if (!(key in target && key in anychart.themes.merging.nonMergableEntities_))
            target[key] = anychart.themes.merging.merge(target[key], defaultObj[key]);
        }
      }
    } else if ((goog.isBoolean(target) || goog.isNull(target)) && goog.typeOf(defaultObj) == 'object') {
      return anychart.themes.merging.merge({'enabled': !!target}, defaultObj);
    }
    return target;
  }
  return anychart.utils.recursiveClone(defaultObj);
};


/**
 * Makes passed target unmerged by removing all properties that are the same in defaultObj.
 * @param {*} target
 * @param {*} defaultObj
 * @return {*}
 */
anychart.themes.merging.demerge = function(target, defaultObj) {
  target = anychart.themes.merging.demerge_(target, defaultObj);
  return anychart.themes.merging.demergeMultiple_(target, defaultObj);
};


/**
 * Demerges array entities.
 * @param {*} target
 * @param {*} defaultObj
 * @return {*}
 * @private
 */
anychart.themes.merging.demergeMultiple_ = function(target, defaultObj) {
  var i, len;
  for (var name in anychart.themes.merging.multipleEntities_) {
    var namePath = name.split('.');
    var targetPart = anychart.themes.merging.getThemePart_(target, namePath);
    if (goog.isDef(targetPart) && goog.isArray(targetPart)) {
      len = targetPart.length;
      var defaultArray = anychart.themes.merging.getThemePart_(defaultObj, namePath);
      var itemDefault = anychart.themes.merging.getThemePart_(defaultObj,
          anychart.themes.merging.multipleEntities_[name].split('.'));
      var success = true;
      if (goog.isArray(defaultArray) && defaultArray.length == len) {
        for (i = 0; i < len; i++) {
          var defaultArrayElement = anychart.utils.recursiveClone(defaultArray[i]);
          defaultArrayElement = anychart.themes.merging.merge(defaultArrayElement, itemDefault);
          if (!anychart.themes.merging.checkEquality_(targetPart[i], defaultArrayElement)) {
            success = false;
            break;
          }
        }
      } else {
        success = false;
      }
      if (success) {
        target = anychart.themes.merging.removeThemePart_(target, namePath);
      } else {
        for (i = 0; i < len; i++) {
          targetPart[i] = anychart.themes.merging.demerge_(targetPart[i], itemDefault) || {};
        }
      }
    }
  }
  return target;
};


/**
 * Makes passed target unmerged by removing all properties that are the same in defaultObj.
 * @param {*} target
 * @param {*} defaultObj
 * @param {anychart.themes.merging.NonMergableEntityTypes_=} opt_nonMergableEntityType
 * @return {*}
 * @private
 */
anychart.themes.merging.demerge_ = function(target, defaultObj, opt_nonMergableEntityType) {
  var targetType = goog.typeOf(target);
  var defaultType = goog.typeOf(defaultObj);
  var val;
  if (targetType == 'object' && defaultType == 'object') {
    var empty = true;
    for (var key in target) {
      if (key in defaultObj) {
        var defVal = defaultObj[key];
        var nonMergableEntityType;
        if (key in anychart.themes.merging.nonMergableEntities_) {
          nonMergableEntityType = anychart.themes.merging.nonMergableEntities_[key];
          switch (nonMergableEntityType) {
            case anychart.themes.merging.NonMergableEntityTypes_.FILL:
              defVal = acgraph.vector.normalizeFill(defVal);
              break;
            case anychart.themes.merging.NonMergableEntityTypes_.HATCH_FILL:
              defVal = anychart.color.serialize(/** @type {acgraph.vector.Fill} */(acgraph.vector.normalizeHatchFill(defVal)));
              break;
            case anychart.themes.merging.NonMergableEntityTypes_.STROKE:
              defVal = acgraph.vector.normalizeStroke(defVal);
              break;
          }
        }
        val = anychart.themes.merging.demerge_(target[key], defVal,
            nonMergableEntityType || opt_nonMergableEntityType);
        if (goog.isDef(val)) {
          target[key] = val;
          empty = false;
        } else {
          delete target[key];
        }
      } else if (goog.isDef(target[key])) {
        empty = false;
      }
    }
    if (empty)
      return undefined;
  } else if (goog.isDef(opt_nonMergableEntityType) && targetType == 'array' && defaultType == 'array') {
    return anychart.themes.merging.checkEquality_(target, defaultObj,
        opt_nonMergableEntityType) ? undefined : target;
  } else if (target == defaultObj) {
    return undefined;
  }
  return target;
};


/**
 * Returns true if target can be created from defaultObj only by adding properties to internal objects.
 * @param {*} target
 * @param {*} defaultObj
 * @param {anychart.themes.merging.NonMergableEntityTypes_=} opt_arrayTyped
 * @return {boolean}
 * @private
 */
anychart.themes.merging.checkEquality_ = function(target, defaultObj, opt_arrayTyped) {
  var targetType = goog.typeOf(target);
  var defaultType = goog.typeOf(defaultObj);
  var defVal;
  if (targetType == defaultType) {
    if (targetType == 'object') {
      var key;
      for (key in target) {
        defVal = defaultObj[key];
        if (key in anychart.themes.merging.nonMergableEntities_) {
          switch (anychart.themes.merging.nonMergableEntities_[key]) {
            case anychart.themes.merging.NonMergableEntityTypes_.FILL:
              defVal = acgraph.vector.normalizeFill(defVal);
              break;
            case anychart.themes.merging.NonMergableEntityTypes_.HATCH_FILL:
              defVal = anychart.color.serialize(/** @type {acgraph.vector.Fill} */(acgraph.vector.normalizeHatchFill(defVal)));
              break;
            case anychart.themes.merging.NonMergableEntityTypes_.STROKE:
              defVal = acgraph.vector.normalizeStroke(defVal);
              break;
          }
        }
        if (!anychart.themes.merging.checkEquality_(target[key], defVal, opt_arrayTyped))
          return false;
      }
      //for (key in defaultObj) {
      //  if (!(key in target))
      //    return false;
      //}
    } else if (targetType == 'array') {
      var len = target.length;
      if (len != defaultObj.length) return false;
      for (var i = 0; i < len; i++) {
        defVal = defaultObj[i];
        switch (opt_arrayTyped) {
          case anychart.themes.merging.NonMergableEntityTypes_.PALETTE:
            defVal = acgraph.vector.normalizeFill(defVal);
            break;
          case anychart.themes.merging.NonMergableEntityTypes_.HATCH_PALETTE:
            defVal = anychart.color.serialize(/** @type {acgraph.vector.Fill} */(acgraph.vector.normalizeHatchFill(defVal)));
            break;
        }
        if (!anychart.themes.merging.checkEquality_(target[i], defVal))
          return false;
      }
    } else
      return target === defaultObj;
    return true;
  }
  return false;
};


/**
 * Map used by merger, that explains how to merge. It is an array to ensure merging order.
 * @type {Array.<{defaultObj:string, targets:Array.<string>}>}
 * @private
 */
anychart.themes.merging.mergingMap_ = [
  {
    defaultObj: 'defaultFontSettings',
    targets: [
      'defaultTitle',
      'defaultLabelFactory',
      'defaultTooltip.content',
      'chart.legend',
      'chart.legend.paginator',
      'chart.defaultLabelSettings',
      'cartesian.defaultTextMarkerSettings',
      'cartesian.crosshair.xLabel',
      'cartesian.crosshair.yLabel',
      'scatter.defaultTextMarkerSettings',
      'scatter.crosshair.xLabel',
      'scatter.crosshair.yLabel',
      'standalones.label',
      'standalones.legend',
      'standalones.legend.paginator',
      'standalones.table',
      'standalones.textAxisMarker'
    ]
  },
  {
    defaultObj: 'defaultBackground',
    targets: [
      'defaultTitle.background',
      'defaultTooltip.background',
      'defaultTooltip.content.background',
      'defaultLabelFactory.background',
      'chart.background',
      'chart.legend.background',
      'chart.legend.paginator.background',
      'chart.defaultLabelSettings.background',
      'cartesian.crosshair.xLabel.background',
      'cartesian.crosshair.yLabel.background',
      'scatter.crosshair.xLabel.background',
      'scatter.crosshair.yLabel.background',
      'standalones.background',
      'standalones.label.background',
      'standalones.legend.paginator.background'
    ]
  },
  {
    defaultObj: 'defaultLabelFactory',
    targets: [
      'defaultAxis.labels',
      'defaultAxis.minorLabels',
      'cartesian.defaultSeriesSettings.base.labels',
      'scatter.defaultSeriesSettings.base.labels',
      'pie.labels',
      'pyramidFunnel.labels',
      'radar.defaultSeriesSettings.base.labels',
      'polar.defaultSeriesSettings.base.labels',
      'sparkline.defaultSeriesSettings.base.labels',
      'gantt.base.timeline.labelsFactory',
      'defaultDataGrid.defaultColumnSettings.cellTextSettings',
      'gantt.base.timeline.header.labelsFactory',
      'standalones.labelsFactory',
      'map.defaultSeriesSettings.base.labels'
    ]
  },
  {
    defaultObj: 'defaultMarkerFactory',
    targets: [
      'cartesian.defaultSeriesSettings.base.markers',
      'scatter.defaultSeriesSettings.base.markers',
      'pyramidFunnel.markers',
      'radar.defaultSeriesSettings.base.markers',
      'polar.defaultSeriesSettings.base.markers',
      'sparkline.defaultSeriesSettings.base.markers',
      'gantt.base.timeline.markersFactory',
      'standalones.markersFactory',
      'map.defaultSeriesSettings.base.markers'
    ]
  },
  {
    defaultObj: 'defaultTitle',
    targets: [
      'defaultTooltip.title',
      'defaultAxis.title',
      'chart.title',
      'chart.legend.title',
      'defaultDataGrid.defaultColumnSettings.title',
      'standalones.title',
      'standalones.legend.title'
    ]
  },
  {
    defaultObj: 'defaultTooltip',
    targets: [
      'chart.legend.tooltip',
      'chart.defaultSeriesSettings.base.tooltip',
      'pie.tooltip',
      'pyramidFunnel.tooltip',
      'defaultDataGrid.tooltip',
      'gantt.base.timeline.tooltip',
      'standalones.legend.tooltip'
    ]
  },
  {
    defaultObj: 'palette',
    targets: [
      'chart.palette'
    ]
  },
  {
    defaultObj: 'hatchFillPalette',
    targets: [
      'chart.hatchFillPalette'
    ]
  },
  {
    defaultObj: 'markerPalette',
    targets: [
      'chart.markerPalette'
    ]
  },
  {
    defaultObj: 'chart',
    targets: [
      'cartesian',
      'scatter',
      'bullet',
      'pie',
      'pyramidFunnel',
      'radar',
      'polar',
      'circularGauge',
      'map',
      'sparkline',
      'gantt.base'
    ]
  },
  {
    defaultObj: 'pie',
    targets: ['pie3d']
  },
  {
    defaultObj: 'pyramidFunnel',
    targets: [
      'pyramid',
      'funnel'
    ]
  },
  {
    defaultObj: 'defaultAxis',
    targets: [
      'cartesian.defaultXAxisSettings',
      'cartesian.defaultYAxisSettings',
      'scatter.defaultXAxisSettings',
      'scatter.defaultYAxisSettings',
      'bullet.axis',
      'radar.xAxis',
      'radar.yAxis',
      'polar.xAxis',
      'polar.yAxis',
      'circularGauge.defaultAxisSettings',
      'map.colorRange',
      'standalones.linearAxis',
      'standalones.polarAxis',
      'standalones.radarAxis',
      'standalones.radialAxis'
    ]
  },
  {
    defaultObj: 'cartesian.defaultSeriesSettings.base',
    targets: [
      'cartesian.defaultSeriesSettings.area',
      'cartesian.defaultSeriesSettings.bar',
      'cartesian.defaultSeriesSettings.box',
      'cartesian.defaultSeriesSettings.bubble',
      'cartesian.defaultSeriesSettings.candlestick',
      'cartesian.defaultSeriesSettings.column',
      'cartesian.defaultSeriesSettings.line',
      'cartesian.defaultSeriesSettings.marker',
      'cartesian.defaultSeriesSettings.ohlc',
      'cartesian.defaultSeriesSettings.rangeArea',
      'cartesian.defaultSeriesSettings.rangeBar',
      'cartesian.defaultSeriesSettings.rangeColumn',
      'cartesian.defaultSeriesSettings.rangeSplineArea',
      'cartesian.defaultSeriesSettings.rangeStepArea',
      'cartesian.defaultSeriesSettings.spline',
      'cartesian.defaultSeriesSettings.splineArea',
      'cartesian.defaultSeriesSettings.stepLine',
      'cartesian.defaultSeriesSettings.stepArea'
    ]
  },
  {
    defaultObj: 'cartesian',
    targets: [
      'area',
      'bar',
      'box',
      'column',
      'financial',
      'line'
    ]
  },
  {
    defaultObj: 'scatter.defaultSeriesSettings.base',
    targets: [
      'scatter.defaultSeriesSettings.bubble',
      'scatter.defaultSeriesSettings.line',
      'scatter.defaultSeriesSettings.marker'
    ]
  },
  {
    defaultObj: 'scatter',
    targets: [
      'marker',
      'bubble'
    ]
  },
  {
    defaultObj: 'radar.defaultSeriesSettings.base',
    targets: [
      'radar.defaultSeriesSettings.area',
      'radar.defaultSeriesSettings.line',
      'radar.defaultSeriesSettings.marker'
    ]
  },
  {
    defaultObj: 'polar.defaultSeriesSettings.base',
    targets: [
      'polar.defaultSeriesSettings.area',
      'polar.defaultSeriesSettings.line',
      'polar.defaultSeriesSettings.marker'
    ]
  },
  {
    defaultObj: 'sparkline.defaultSeriesSettings.base',
    targets: [
      'sparkline.defaultSeriesSettings.area',
      'sparkline.defaultSeriesSettings.line',
      'sparkline.defaultSeriesSettings.column',
      'sparkline.defaultSeriesSettings.winLoss'
    ]
  },
  {
    defaultObj: 'circularGauge.defaultPointerSettings.base',
    targets: [
      'circularGauge.defaultPointerSettings.bar',
      'circularGauge.defaultPointerSettings.marker',
      'circularGauge.defaultPointerSettings.needle',
      'circularGauge.defaultPointerSettings.knob'
    ]
  },
  {
    defaultObj: 'map.defaultSeriesSettings.base',
    targets: [
      'map.defaultSeriesSettings.choropleth'
    ]
  },
  {
    defaultObj: 'defaultDataGrid',
    targets: [
      'gantt.base.dataGrid',
      'standalones.dataGrid'
    ]
  },
  {
    defaultObj: 'gantt.base',
    targets: [
      'gantt.ganttResource',
      'gantt.ganttProject'
    ]
  }
];


/**
 * Type of the non-mergable entity.
 * @enum {number}
 * @private
 */
anychart.themes.merging.NonMergableEntityTypes_ = {
  FILL: 1,
  STROKE: 2,
  HATCH_FILL: 3,
  PALETTE: 4,
  HATCH_PALETTE: 5,
  MARKER_PALETTE: 6,
  SCALE: 7
};


/**
 * Objects with keys, that cannot be merged - they should be replaced.
 * @type {Object.<string, anychart.themes.merging.NonMergableEntityTypes_>}
 * @private
 */
anychart.themes.merging.nonMergableEntities_ = {
  'scale': anychart.themes.merging.NonMergableEntityTypes_.SCALE,
  'xScale': anychart.themes.merging.NonMergableEntityTypes_.SCALE,
  'yScale': anychart.themes.merging.NonMergableEntityTypes_.SCALE,

  'palette': anychart.themes.merging.NonMergableEntityTypes_.PALETTE,
  'rangePalette': anychart.themes.merging.NonMergableEntityTypes_.PALETTE,
  'hatchFillPalette': anychart.themes.merging.NonMergableEntityTypes_.HATCH_PALETTE,
  'markerPalette': anychart.themes.merging.NonMergableEntityTypes_.MARKER_PALETTE,

  'rowHoverFill': anychart.themes.merging.NonMergableEntityTypes_.FILL,
  'rowSelectedFill': anychart.themes.merging.NonMergableEntityTypes_.FILL,
  'fill': anychart.themes.merging.NonMergableEntityTypes_.FILL,
  'hoverFill': anychart.themes.merging.NonMergableEntityTypes_.FILL,
  'negativeFill': anychart.themes.merging.NonMergableEntityTypes_.FILL,
  'firstFill': anychart.themes.merging.NonMergableEntityTypes_.FILL,
  'lastFill': anychart.themes.merging.NonMergableEntityTypes_.FILL,
  'maxFill': anychart.themes.merging.NonMergableEntityTypes_.FILL,
  'minFill': anychart.themes.merging.NonMergableEntityTypes_.FILL,
  'hoverNegativeFill': anychart.themes.merging.NonMergableEntityTypes_.FILL,
  'risingFill': anychart.themes.merging.NonMergableEntityTypes_.FILL,
  'fallingFill': anychart.themes.merging.NonMergableEntityTypes_.FILL,
  'hoverRisingFill': anychart.themes.merging.NonMergableEntityTypes_.FILL,
  'hoverFallingFill': anychart.themes.merging.NonMergableEntityTypes_.FILL,
  'rowFill': anychart.themes.merging.NonMergableEntityTypes_.FILL,
  'rowOddFill': anychart.themes.merging.NonMergableEntityTypes_.FILL,
  'rowEvenFill': anychart.themes.merging.NonMergableEntityTypes_.FILL,
  'backgroundFill': anychart.themes.merging.NonMergableEntityTypes_.FILL,
  'baseFill': anychart.themes.merging.NonMergableEntityTypes_.FILL,
  'baselineFill': anychart.themes.merging.NonMergableEntityTypes_.FILL,
  'progressFill': anychart.themes.merging.NonMergableEntityTypes_.FILL,
  'milestoneFill': anychart.themes.merging.NonMergableEntityTypes_.FILL,
  'parentFill': anychart.themes.merging.NonMergableEntityTypes_.FILL,
  'connectorFill': anychart.themes.merging.NonMergableEntityTypes_.FILL,
  'selectedElementFill': anychart.themes.merging.NonMergableEntityTypes_.FILL,
  'oddFill': anychart.themes.merging.NonMergableEntityTypes_.FILL,
  'evenFill': anychart.themes.merging.NonMergableEntityTypes_.FILL,
  'selectFill': anychart.themes.merging.NonMergableEntityTypes_.FILL,
  'titleFill': anychart.themes.merging.NonMergableEntityTypes_.FILL,
  'iconFill': anychart.themes.merging.NonMergableEntityTypes_.FILL,
  'iconMarkerFill': anychart.themes.merging.NonMergableEntityTypes_.FILL,
  'sliderFill': anychart.themes.merging.NonMergableEntityTypes_.FILL,
  'dragPreviewFill': anychart.themes.merging.NonMergableEntityTypes_.FILL,
  'dragAreaFill': anychart.themes.merging.NonMergableEntityTypes_.FILL,
  'cellFill': anychart.themes.merging.NonMergableEntityTypes_.FILL,

  'hatchFill': anychart.themes.merging.NonMergableEntityTypes_.HATCH_FILL,
  'hoverHatchFill': anychart.themes.merging.NonMergableEntityTypes_.HATCH_FILL,
  'negativeHatchFill': anychart.themes.merging.NonMergableEntityTypes_.HATCH_FILL,
  'firstHatchFill': anychart.themes.merging.NonMergableEntityTypes_.HATCH_FILL,
  'lastHatchFill': anychart.themes.merging.NonMergableEntityTypes_.HATCH_FILL,
  'maxHatchFill': anychart.themes.merging.NonMergableEntityTypes_.HATCH_FILL,
  'minHatchFill': anychart.themes.merging.NonMergableEntityTypes_.HATCH_FILL,
  'hoverNegativeHatchFill': anychart.themes.merging.NonMergableEntityTypes_.HATCH_FILL,
  'risingHatchFill': anychart.themes.merging.NonMergableEntityTypes_.HATCH_FILL,
  'fallingHatchFill': anychart.themes.merging.NonMergableEntityTypes_.HATCH_FILL,
  'hoverRisingHatchFill': anychart.themes.merging.NonMergableEntityTypes_.HATCH_FILL,
  'hoverFallingHatchFill': anychart.themes.merging.NonMergableEntityTypes_.HATCH_FILL,
  'selectedHatchFill': anychart.themes.merging.NonMergableEntityTypes_.HATCH_FILL,
  'iconHatchFill': anychart.themes.merging.NonMergableEntityTypes_.HATCH_FILL,

  'columnStroke': anychart.themes.merging.NonMergableEntityTypes_.STROKE,
  'rowStroke': anychart.themes.merging.NonMergableEntityTypes_.STROKE,
  'stroke': anychart.themes.merging.NonMergableEntityTypes_.STROKE,
  'hoverStroke': anychart.themes.merging.NonMergableEntityTypes_.STROKE,
  'connectorStroke': anychart.themes.merging.NonMergableEntityTypes_.STROKE,
  'medianStroke': anychart.themes.merging.NonMergableEntityTypes_.STROKE,
  'hoverMedianStroke': anychart.themes.merging.NonMergableEntityTypes_.STROKE,
  'stemStroke': anychart.themes.merging.NonMergableEntityTypes_.STROKE,
  'hoverStemStroke': anychart.themes.merging.NonMergableEntityTypes_.STROKE,
  'whiskerStroke': anychart.themes.merging.NonMergableEntityTypes_.STROKE,
  'hoverWhiskerStroke': anychart.themes.merging.NonMergableEntityTypes_.STROKE,
  'negativeStroke': anychart.themes.merging.NonMergableEntityTypes_.STROKE,
  'hoverNegativeStroke': anychart.themes.merging.NonMergableEntityTypes_.STROKE,
  'highStroke': anychart.themes.merging.NonMergableEntityTypes_.STROKE,
  'hoverHighStroke': anychart.themes.merging.NonMergableEntityTypes_.STROKE,
  'lowStroke': anychart.themes.merging.NonMergableEntityTypes_.STROKE,
  'hoverLowStroke': anychart.themes.merging.NonMergableEntityTypes_.STROKE,
  'risingStroke': anychart.themes.merging.NonMergableEntityTypes_.STROKE,
  'hoverRisingStroke': anychart.themes.merging.NonMergableEntityTypes_.STROKE,
  'fallingStroke': anychart.themes.merging.NonMergableEntityTypes_.STROKE,
  'hoverFallingStroke': anychart.themes.merging.NonMergableEntityTypes_.STROKE,
  'baseStroke': anychart.themes.merging.NonMergableEntityTypes_.STROKE,
  'baselineStroke': anychart.themes.merging.NonMergableEntityTypes_.STROKE,
  'progressStroke': anychart.themes.merging.NonMergableEntityTypes_.STROKE,
  'milestoneStroke': anychart.themes.merging.NonMergableEntityTypes_.STROKE,
  'parentStroke': anychart.themes.merging.NonMergableEntityTypes_.STROKE,
  'selectedElementStroke': anychart.themes.merging.NonMergableEntityTypes_.STROKE,
  'selectStroke': anychart.themes.merging.NonMergableEntityTypes_.STROKE,
  'iconStroke': anychart.themes.merging.NonMergableEntityTypes_.STROKE,
  'iconMarkerStroke': anychart.themes.merging.NonMergableEntityTypes_.STROKE,
  'backgroundStroke': anychart.themes.merging.NonMergableEntityTypes_.STROKE,
  'sliderStroke': anychart.themes.merging.NonMergableEntityTypes_.STROKE,
  'dragPreviewStroke': anychart.themes.merging.NonMergableEntityTypes_.STROKE,
  'dragAreaStroke': anychart.themes.merging.NonMergableEntityTypes_.STROKE,
  'xErrorStroke': anychart.themes.merging.NonMergableEntityTypes_.STROKE,
  'valueErrorStroke': anychart.themes.merging.NonMergableEntityTypes_.STROKE
};


/**
 * Defaults nodes for array entities.
 * @type {Object.<string, string>}
 * @private
 */
anychart.themes.merging.multipleEntities_ = {
  'chart.chartLabels': 'chart.defaultLabelSettings',
  'chart.grids': 'chart.defaultGridSettings',
  'chart.minorGrids': 'chart.defaultMinorGridSettings',
  'chart.xAxes': 'chart.defaultXAxisSettings',
  'chart.yAxes': 'chart.defaultYAxisSettings',
  'chart.axes': 'chart.defaultAxisSettings',
  'chart.lineAxesMarkers': 'chart.defaultLineMarkerSettings',
  'chart.rangeAxesMarkers': 'chart.defaultRangeMarkerSettings',
  'chart.textAxesMarkers': 'chart.defaultTextMarkerSettings',
  'chart.ranges': 'chart.defaultRangeSettings',
  'gauge.bars': 'gauge.defaultPointerSettings',
  'gauge.markers': 'gauge.defaultPointerSettings',
  'gauge.needles': 'gauge.defaultPointerSettings',
  'gauge.knobs': 'gauge.defaultPointerSettings',
  'gauge.ranges': 'gauge.defaultRangeSettings'
};
