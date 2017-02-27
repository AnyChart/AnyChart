goog.provide('anychart.themes.merging');
goog.require('anychart.color');


/**
 * Compiles target root in the theme. If the target is already compiled returns null.
 * Note: expects the theme to be a clone of the actual theme, so it can be edited in place.
 * @param {!Object} theme
 * @param {string} path
 * @param {number} themeIndex
 * @return {boolean}
 */
anychart.themes.merging.compileTheme = function(theme, path, themeIndex) {
  var rootParts = path.split('.');
  var descriptor = anychart.themes.merging.mergingMapInverse_[rootParts[0]];
  var needsCompilation = !!(descriptor && descriptor.mergedIn <= themeIndex);
  if (needsCompilation) {
    descriptor.mergedIn = themeIndex + 1;
    var requires = descriptor.requires;
    for (var i = 0; i < requires.length; i++) {
      var req = requires[i];
      // ensure the default object is merged first
      anychart.themes.merging.compileTheme(theme, req.defaultObj, themeIndex);
      var targets = req.targets;
      var defObjSplit = req.defaultObj.split('.');
      for (var j = 0; j < targets.length; j++) {
        // the theme is always an object, so the reference remains correct
        anychart.themes.merging.mergeThemePart_(theme, targets[j].split('.'), defObjSplit);
      }
    }
  }
  return needsCompilation;
};


/**
 * Clears themes cache.
 */
anychart.themes.merging.clearCache = function() {
  for (var i in anychart.themes.merging.mergingMapInverse_) {
    var descriptor = anychart.themes.merging.mergingMapInverse_[i];
    // we want to keep default theme cache
    descriptor.mergedIn = Math.min(descriptor.mergedIn, 1);
  }
};


/**
 * Returns theme part denoted be a string where parts are separated with a point.
 * @param {*} theme
 * @param {string} path
 * @return {*}
 */
anychart.themes.merging.getThemePart = function(theme, path) {
  return anychart.themes.merging.getThemePart_(theme, path.split('.'));
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
 * Merges scale. Actually sets scale's type if is not set.
 * @param {Object} scaleObj - Scale object.
 * @param {number|string} index - Index or part of path.
 * @param {string} chartType - Chart type.
 * @return {Object} - Clone of original scale json object with type.
 */
anychart.themes.merging.mergeScale = function(scaleObj, index, chartType) {
  var theme = anychart.getFullTheme(chartType);
  var themeScale = anychart.themes.merging.getThemePart_(theme, ['scales', index]);

  if (themeScale) {
    var scaleType = scaleObj['type'];
    var themeScaleType = themeScale['type'];

    if (goog.isDef(scaleType) && goog.isDef(themeScaleType) && ((themeScaleType == 'ordinal') ^ (scaleType == 'ordinal'))) {
      return scaleObj;
    } else {
      var deepClone = anychart.themes.merging.deepClone_(scaleObj);
      return /** @type {Object} */ (anychart.themes.merging.merge(deepClone, themeScale));
    }
  }

  return scaleObj;
};


/**
 * Does a recursive clone of the object.
 * NOTE:Clones only objects and sub-objects. Arrays and another fields leaves as is.
 *
 * @param {*} obj - Object to clone.
 * @return {*} - Clone of the input object.
 * @private
 */
anychart.themes.merging.deepClone_ = function(obj) {
  if (goog.typeOf(obj) == 'object') {
    var res = {};
    for (var key in obj) {
      if (obj.hasOwnProperty(key))
        res[key] = anychart.themes.merging.deepClone_(obj[key]);
    }
    return res;
  } else {
    return obj;
  }
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
  target = anychart.themes.merging.demergeMultiple_(target, defaultObj);
  target = anychart.themes.merging.demergeScales_(target, defaultObj);
  return anychart.themes.merging.demergeTyped_(target, defaultObj);
};


/**
 * Demerges series entities.
 * @param {*} target
 * @param {*} defaultObj
 * @return {*}
 * @private
 */
anychart.themes.merging.demergeTyped_ = function(target, defaultObj) {
  var i, len;
  for (var name in anychart.themes.merging.typedEntities_) {
    var descriptor = anychart.themes.merging.typedEntities_[name];
    var namePath = name.split('.');
    var targetPart = anychart.themes.merging.getThemePart_(target, namePath);
    var itemsDefaults = anychart.themes.merging.getThemePart_(defaultObj, descriptor.defaults.split('.'));
    if (goog.isArray(targetPart) && goog.isDef(itemsDefaults)) { // if we have no itemsDefaults we do not demerge anything
      len = targetPart.length;
      for (i = 0; i < len; i++) {
        var type = anychart.themes.merging.getThemePart_(targetPart, [i, descriptor.typeDescriptor]);
        if (goog.isDef(type)) {
          var itemDefault = anychart.themes.merging.getThemePart_(itemsDefaults, [type]);
          targetPart[i] = anychart.themes.merging.demerge_(targetPart[i], itemDefault) || {};
        }
      }
    }
  }
  return target;
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
    if (goog.isArray(targetPart)) {
      len = targetPart.length;
      var defaultArray = anychart.themes.merging.getThemePart_(defaultObj, namePath);
      var itemDefault = anychart.themes.merging.getThemePart_(defaultObj,
          anychart.themes.merging.multipleEntities_[name].split('.'));
      var success = true;
      var defaultArrayElement;
      var defaultArrayLen = goog.isArray(defaultArray) ? defaultArray.length : 0;
      if (defaultArrayLen == len) {
        for (i = 0; i < len; i++) {
          defaultArrayElement = anychart.utils.recursiveClone(defaultArray[i]);
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
          if (i < defaultArrayLen) {
            defaultArrayElement = anychart.utils.recursiveClone(defaultArray[i]);
            defaultArrayElement = anychart.themes.merging.merge(defaultArrayElement, itemDefault);
          } else {
            defaultArrayElement = itemDefault;
          }
          targetPart[i] = anychart.themes.merging.demerge_(targetPart[i], defaultArrayElement) || {};
        }
      }
    }
  }
  return target;
};


/**
 * Demerges scale arrays.
 * @param {*} target
 * @param {*} defaultObj
 * @return {*}
 * @private
 */
anychart.themes.merging.demergeScales_ = function(target, defaultObj) {
  var i, len;
  for (var j = 0; j < anychart.themes.merging.scaleEntities_.length; j++) {
    var namePath = anychart.themes.merging.scaleEntities_[j].split('.');
    var targetPart = anychart.themes.merging.getThemePart_(target, namePath);
    if (goog.isArray(targetPart)) {
      len = targetPart.length;
      var defaultArray = anychart.themes.merging.getThemePart_(defaultObj, namePath);
      var success = true;
      if (goog.isArray(defaultArray) && defaultArray.length == len) {
        for (i = 0; i < len; i++) {
          if (!anychart.themes.merging.checkEquality_(targetPart[i], defaultArray[i])) {
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
          targetPart[i] = anychart.themes.merging.demerge_(targetPart[i], defaultArray[i]) || {};
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
              defVal = goog.isFunction(defVal) ? undefined : acgraph.vector.normalizeFill(defVal);
              break;
            case anychart.themes.merging.NonMergableEntityTypes_.HATCH_FILL:
              defVal = goog.isFunction(defVal) ?
                  undefined :
                  anychart.color.serialize(/** @type {acgraph.vector.Fill} */(acgraph.vector.normalizeHatchFill(defVal)));
              break;
            case anychart.themes.merging.NonMergableEntityTypes_.STROKE:
              defVal = goog.isFunction(defVal) ? undefined : acgraph.vector.normalizeStroke(defVal);
              break;
            case anychart.themes.merging.NonMergableEntityTypes_.PADDING:
              defVal = anychart.core.utils.Space.normalizeSpace(defVal);
              break;
          }
        } else {
          nonMergableEntityType = anychart.themes.merging.NonMergableEntityTypes_.NONE;
        }
        if (nonMergableEntityType != anychart.themes.merging.NonMergableEntityTypes_.NONE) {
          val = anychart.themes.merging.checkEquality_(target[key], defVal, nonMergableEntityType) ?
              undefined : target[key];
        } else {
          val = anychart.themes.merging.demerge_(target[key], defVal,
              nonMergableEntityType || opt_nonMergableEntityType);
        }
        if (goog.isDef(val)) {
          target[key] = val;
          empty = false;
        } else if (key == 'xScale' || key == 'yScale' || key == 'colorScale') {
          empty = false;
        } else if (key != 'enabled') {
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
              defVal = goog.isFunction(defVal) ? undefined : acgraph.vector.normalizeFill(defVal);
              break;
            case anychart.themes.merging.NonMergableEntityTypes_.HATCH_FILL:
              defVal = goog.isFunction(defVal) ?
                  undefined :
                  anychart.color.serialize(/** @type {acgraph.vector.Fill} */(acgraph.vector.normalizeHatchFill(defVal)));
              break;
            case anychart.themes.merging.NonMergableEntityTypes_.STROKE:
              defVal = goog.isFunction(defVal) ? undefined : acgraph.vector.normalizeStroke(defVal);
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
 * @const {Array.<{defaultObj:string, targets:Array.<string>}>}
 * @private
 */
anychart.themes.merging.mergingMap_ = [
  {
    defaultObj: 'defaultFontSettings',
    targets: [
      'defaultTitle',
      'defaultLabelFactory',
      'defaultCrosshairLabel',
      'defaultTooltip',
      'defaultTooltip.contentInternal',
      'defaultLegend',
      'defaultLegend.paginator',
      'chart.defaultLabelSettings',
      'cartesianBase.defaultTextMarkerSettings',
      'scatter.defaultTextMarkerSettings',
      'standalones.label',
      'standalones.table',
      'standalones.textAxisMarker',
      'standalones.resourceList.baseSettings',
      'resource.resourceList.baseSettings'
    ]
  },
  {
    defaultObj: 'defaultBackground',
    targets: [
      'defaultTitle.background',
      'defaultTooltip.background',
      'defaultTooltip.contentInternal.background',
      'defaultLabelFactory.background',
      'defaultCrosshairLabel.background',
      'chart.background',
      'defaultLegend.background',
      'defaultLegend.paginator.background',
      'chart.defaultLabelSettings.background',
      'stock.defaultPlotSettings.xAxis.background',
      'stock.scroller.xAxis.background',
      'resource.grid.background',
      'resource.timeLine.background',
      'resource.resourceList.background',
      'standalones.background',
      'standalones.label.background',
      'standalones.resourceList.background'
    ]
  },
  {
    defaultObj: 'defaultLabelFactory',
    targets: [
      'defaultAxis.labels',
      'defaultAxis.minorLabels',
      'chart.defaultAnnotationSettings.base.labels',
      'chart.defaultSeriesSettings.base.labels',
      'pieFunnelPyramidBase.labels',
      'defaultTimeline.labels',
      'defaultDataGrid.defaultColumnSettings.cellTextSettings',
      'standalones.labelsFactory',
      'heatMap.labels',
      'map.defaultSeriesSettings.base.labels',
      'map.axesSettings.labels',
      'map.axesSettings.minorLabels',
      'treeMap.headers',
      'treeMap.labels',
      'linearGauge.defaultPointerSettings.base.label',
      'pert.milestones.labels',
      'pert.tasks.upperLabels',
      'pert.tasks.lowerLabels',
      'defaultTimeline.header.topLevel.labels',
      'defaultTimeline.header.midLevel.labels',
      'defaultTimeline.header.lowLevel.labels',
      'resource.activities.labels',
      'resource.conflicts.labels'
    ]
  },
  {
    defaultObj: 'defaultCrosshairLabel',
    targets: [
      'cartesianBase.crosshair.xLabel',
      'cartesianBase.crosshair.yLabel',
      'scatter.crosshair.xLabel',
      'scatter.crosshair.yLabel',
      'map.crosshair.xLabel',
      'map.crosshair.yLabel'
    ]
  },
  {
    defaultObj: 'defaultMarkerFactory',
    targets: [
      'chart.defaultAnnotationSettings.base.markers',
      'chart.defaultSeriesSettings.base.markers',
      'pieFunnelPyramidBase.markers',
      'defaultTimeline.markers',
      'standalones.markersFactory',
      'heatMap.markers',
      'map.defaultSeriesSettings.base.markers',
      'treeMap.markers'
    ]
  },
  {
    defaultObj: 'defaultTitle',
    targets: [
      'defaultTooltip.title',
      'defaultAxis.title',
      'chart.title',
      'defaultLegend.title',
      'defaultDataGrid.defaultColumnSettings.title',
      'standalones.title',
      'map.axesSettings.title'
    ]
  },
  {
    defaultObj: 'defaultSeparator',
    targets: [
      'defaultTooltip.separator',
      'defaultLegend.titleSeparator'
    ]
  },
  {
    defaultObj: 'defaultTooltip',
    targets: [
      'defaultLegend.tooltip',
      'chart.tooltip',
      'pieFunnelPyramidBase.tooltip',
      'defaultDataGrid.tooltip',
      'defaultTimeline.tooltip',
      'pert.milestones.tooltip',
      'pert.tasks.tooltip'
    ]
  },
  {
    defaultObj: 'defaultLegend',
    targets: [
      'chart.legend',
      'standalones.legend'
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
    defaultObj: 'hatchFillPaletteFor3D',
    targets: [
      'cartesian3dBase.hatchFillPalette'
    ]
  },
  {
    defaultObj: 'markerPalette',
    targets: [
      'chart.markerPalette'
    ]
  },
  {
    defaultObj: 'defaultGridSettings',
    targets: [
      'defaultMinorGridSettings',
      'cartesianBase.defaultGridSettings',
      'scatter.defaultGridSettings',
      'polar.defaultGridSettings',
      'radar.defaultGridSettings',
      'heatMap.defaultGridSettings',
      'stock.defaultPlotSettings.defaultGridSettings',
      'standalones.linearGrid',
      'standalones.radarGrid',
      'standalones.polarGrid'
    ]
  },
  {
    defaultObj: 'defaultMinorGridSettings',
    targets: [
      'cartesianBase.defaultMinorGridSettings',
      'scatter.defaultMinorGridSettings',
      'polar.defaultMinorGridSettings',
      'radar.defaultMinorGridSettings',
      'stock.defaultPlotSettings.defaultMinorGridSettings'
    ]
  },
  {
    defaultObj: 'defaultLineMarkerSettings',
    targets: [
      'cartesianBase.defaultLineMarkerSettings',
      'scatter.defaultLineMarkerSettings',
      'sparkline.defaultLineMarkerSettings',
      'standalones.lineAxisMarker',
      'defaultTimeline.defaultLineMarkerSettings'
    ]
  },
  {
    defaultObj: 'defaultTextMarkerSettings',
    targets: [
      'cartesianBase.defaultTextMarkerSettings',
      'scatter.defaultTextMarkerSettings',
      'sparkline.defaultTextMarkerSettings',
      'standalones.textAxisMarker',
      'defaultTimeline.defaultTextMarkerSettings'
    ]
  },
  {
    defaultObj: 'defaultRangeMarkerSettings',
    targets: [
      'cartesianBase.defaultRangeMarkerSettings',
      'scatter.defaultRangeMarkerSettings',
      'sparkline.defaultRangeMarkerSettings',
      'standalones.rangeAxisMarker',
      'defaultTimeline.defaultRangeMarkerSettings'
    ]
  },
  {
    defaultObj: 'defaultAxis',
    targets: [
      'cartesianBase.defaultXAxisSettings',
      'cartesianBase.defaultYAxisSettings',
      'heatMap.defaultXAxisSettings',
      'heatMap.defaultYAxisSettings',
      'scatter.defaultXAxisSettings',
      'scatter.defaultYAxisSettings',
      'bullet.axis',
      'radar.xAxis',
      'radar.yAxis',
      'polar.xAxis',
      'polar.yAxis',
      'circularGauge.defaultAxisSettings',
      'stock.defaultPlotSettings.defaultYAxisSettings',
      'stock.defaultPlotSettings.xAxis',
      'stock.scroller.xAxis',
      'defaultColorRange',
      'linearGauge.defaultAxisSettings',
      'standalones.linearAxis',
      'standalones.polarAxis',
      'standalones.radarAxis',
      'standalones.radialAxis'
    ]
  },
  {
    defaultObj: 'defaultColorRange',
    targets: [
      'map.colorRange',
      'treeMap.colorRange',
      'standalones.colorRange'
    ]
  },
  {
    defaultObj: 'defaultCallout',
    targets: [
      'map.defaultCalloutSettings'
    ]
  },
  {
    defaultObj: 'defaultScroller',
    targets: [
      'cartesianBase.xScroller',
      'heatMap.xScroller',
      'heatMap.yScroller',
      'stock.scroller',
      'resource.horizontalScrollBar',
      'resource.verticalScrollBar',
      'standalones.scroller'
    ]
  },
  {
    defaultObj: 'chart',
    targets: [
      'cartesianBase',
      'pieFunnelPyramidBase',
      'scatter',
      'radar',
      'polar',
      'heatMap',
      'bullet',
      'circularGauge',
      'map',
      'sparkline',
      'ganttBase',
      'stock',
      'stock.defaultPlotSettings',
      'treeMap',
      'linearGauge',
      'pert',
      'resource'
    ]
  },
  {
    defaultObj: 'chart.defaultSeriesSettings',
    targets: [
      'stock.scroller.defaultSeriesSettings'
    ]
  },
  {
    defaultObj: 'chart.tooltip',
    targets: [
      'stock.tooltip'
    ]
  },
  {
    defaultObj: 'pieFunnelPyramidBase',
    targets: [
      'pie',
      'pyramid',
      'funnel'
    ]
  },
  {
    defaultObj: 'pie',
    targets: ['pie3d']
  },
  {
    defaultObj: 'cartesianBase.defaultAnnotationSettings.base',
    targets: [
      'cartesianBase.defaultAnnotationSettings.ray',
      'cartesianBase.defaultAnnotationSettings.line',
      'cartesianBase.defaultAnnotationSettings.infiniteLine',
      'cartesianBase.defaultAnnotationSettings.verticalLine',
      'cartesianBase.defaultAnnotationSettings.horizontalLine',
      'cartesianBase.defaultAnnotationSettings.rectangle',
      'cartesianBase.defaultAnnotationSettings.ellipse',
      'cartesianBase.defaultAnnotationSettings.triangle',
      'cartesianBase.defaultAnnotationSettings.trendChannel',
      'cartesianBase.defaultAnnotationSettings.andrewsPitchfork',
      'cartesianBase.defaultAnnotationSettings.fibonacciFan',
      'cartesianBase.defaultAnnotationSettings.fibonacciArc',
      'cartesianBase.defaultAnnotationSettings.fibonacciRetracement',
      'cartesianBase.defaultAnnotationSettings.fibonacciTimezones',
      'cartesianBase.defaultAnnotationSettings.marker',
      'cartesianBase.defaultAnnotationSettings.label'
    ]
  },
  {
    defaultObj: 'cartesianBase.defaultSeriesSettings.rangeLike',
    targets: [
      'cartesianBase.defaultSeriesSettings.rangeArea',
      'cartesianBase.defaultSeriesSettings.rangeBar',
      'cartesianBase.defaultSeriesSettings.rangeColumn',
      'cartesianBase.defaultSeriesSettings.rangeSplineArea',
      'cartesianBase.defaultSeriesSettings.rangeStepArea'
    ]
  },
  {
    defaultObj: 'cartesianBase.defaultSeriesSettings.base',
    targets: [
      'cartesianBase.defaultSeriesSettings.areaLike',
      'cartesianBase.defaultSeriesSettings.barLike',
      'cartesianBase.defaultSeriesSettings.lineLike',
      'cartesianBase.defaultSeriesSettings.pieLike',
      'cartesianBase.defaultSeriesSettings.marker',
      'cartesianBase.defaultSeriesSettings.bubble'
    ]
  },
  {
    defaultObj: 'cartesianBase.defaultSeriesSettings.areaLike',
    targets: [
      'cartesianBase.defaultSeriesSettings.area',
      'cartesianBase.defaultSeriesSettings.splineArea',
      'cartesianBase.defaultSeriesSettings.stepArea',
      'cartesianBase.defaultSeriesSettings.rangeArea',
      'cartesianBase.defaultSeriesSettings.rangeSplineArea',
      'cartesianBase.defaultSeriesSettings.rangeStepArea'
    ]
  },
  {
    defaultObj: 'cartesianBase.defaultSeriesSettings.barLike',
    targets: [
      'cartesianBase.defaultSeriesSettings.bar',
      'cartesianBase.defaultSeriesSettings.column',
      'cartesianBase.defaultSeriesSettings.box',
      'cartesianBase.defaultSeriesSettings.rangeBar',
      'cartesianBase.defaultSeriesSettings.rangeColumn',
      'cartesianBase.defaultSeriesSettings.candlestick'
    ]
  },
  {
    defaultObj: 'cartesianBase.defaultSeriesSettings.lineLike',
    targets: [
      'cartesianBase.defaultSeriesSettings.line',
      'cartesianBase.defaultSeriesSettings.spline',
      'cartesianBase.defaultSeriesSettings.stepLine',
      'cartesianBase.defaultSeriesSettings.ohlc',
      'cartesianBase.defaultSeriesSettings.jumpLine',
      'cartesianBase.defaultSeriesSettings.stick'
    ]
  },
  {
    defaultObj: 'cartesianBase',
    targets: [
      'cartesian',
      'area',
      'verticalArea',
      'bar',
      'box',
      'column',
      'financial',
      'line',
      'verticalLine',
      'jumpLine',
      'stick',
      'pareto'
    ]
  },
  {
    defaultObj: 'cartesian3dBase.defaultSeriesSettings.base',
    targets: [
      'cartesian3dBase.defaultSeriesSettings.bar',
      'cartesian3dBase.defaultSeriesSettings.column',
      'cartesian3dBase.defaultSeriesSettings.area'
    ]
  },
  {
    defaultObj: 'cartesian3dBase',
    targets: [
      'area3d',
      'bar3d',
      'column3d',
      'cartesian3d'
    ]
  },
  {
    defaultObj: 'cartesian',
    targets: ['cartesian3d']
  },
  {
    defaultObj: 'bar',
    targets: ['bar3d']
  },
  {
    defaultObj: 'column',
    targets: ['column3d']
  },
  {
    defaultObj: 'area',
    targets: ['area3d']
  },
  {
    defaultObj: 'scatter.defaultAnnotationSettings.base',
    targets: [
      'scatter.defaultAnnotationSettings.ray',
      'scatter.defaultAnnotationSettings.line',
      'scatter.defaultAnnotationSettings.infiniteLine',
      'scatter.defaultAnnotationSettings.verticalLine',
      'scatter.defaultAnnotationSettings.horizontalLine',
      'scatter.defaultAnnotationSettings.rectangle',
      'scatter.defaultAnnotationSettings.ellipse',
      'scatter.defaultAnnotationSettings.triangle',
      'scatter.defaultAnnotationSettings.trendChannel',
      'scatter.defaultAnnotationSettings.andrewsPitchfork',
      'scatter.defaultAnnotationSettings.fibonacciFan',
      'scatter.defaultAnnotationSettings.fibonacciArc',
      'scatter.defaultAnnotationSettings.fibonacciRetracement',
      'scatter.defaultAnnotationSettings.fibonacciTimezones',
      'scatter.defaultAnnotationSettings.marker',
      'scatter.defaultAnnotationSettings.label'
    ]
  },
  {
    defaultObj: 'scatter.defaultSeriesSettings.base',
    targets: [
      'scatter.defaultSeriesSettings.bubble',
      'scatter.defaultSeriesSettings.lineLike',
      'scatter.defaultSeriesSettings.marker'
    ]
  },
  {
    defaultObj: 'scatter.defaultSeriesSettings.lineLike',
    targets: [
      'scatter.defaultSeriesSettings.line'
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
      'radar.defaultSeriesSettings.areaLike',
      'radar.defaultSeriesSettings.lineLike',
      'radar.defaultSeriesSettings.marker'
    ]
  },
  {
    defaultObj: 'radar.defaultSeriesSettings.areaLike',
    targets: [
      'radar.defaultSeriesSettings.area'
    ]
  },
  {
    defaultObj: 'radar.defaultSeriesSettings.lineLike',
    targets: [
      'radar.defaultSeriesSettings.line'
    ]
  },
  {
    defaultObj: 'polar.defaultSeriesSettings.base',
    targets: [
      'polar.defaultSeriesSettings.areaLike',
      'polar.defaultSeriesSettings.lineLike',
      'polar.defaultSeriesSettings.marker'
    ]
  },
  {
    defaultObj: 'polar.defaultSeriesSettings.areaLike',
    targets: [
      'polar.defaultSeriesSettings.area'
    ]
  },
  {
    defaultObj: 'polar.defaultSeriesSettings.lineLike',
    targets: [
      'polar.defaultSeriesSettings.line'
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
      'map.defaultSeriesSettings.choropleth',
      'map.defaultSeriesSettings.bubble',
      'map.defaultSeriesSettings.marker',
      'map.defaultSeriesSettings.connector'
    ]
  },
  {
    defaultObj: 'map',
    targets: [
      'choropleth',
      'bubbleMap',
      'connector',
      'markerMap',
      'seatMap'
    ]
  },
  {
    defaultObj: 'stock.defaultAnnotationSettings.base',
    targets: [
      'stock.defaultAnnotationSettings.ray',
      'stock.defaultAnnotationSettings.line',
      'stock.defaultAnnotationSettings.infiniteLine',
      'stock.defaultAnnotationSettings.verticalLine',
      'stock.defaultAnnotationSettings.horizontalLine',
      'stock.defaultAnnotationSettings.rectangle',
      'stock.defaultAnnotationSettings.ellipse',
      'stock.defaultAnnotationSettings.triangle',
      'stock.defaultAnnotationSettings.trendChannel',
      'stock.defaultAnnotationSettings.andrewsPitchfork',
      'stock.defaultAnnotationSettings.fibonacciFan',
      'stock.defaultAnnotationSettings.fibonacciArc',
      'stock.defaultAnnotationSettings.fibonacciRetracement',
      'stock.defaultAnnotationSettings.fibonacciTimezones',
      'stock.defaultAnnotationSettings.marker',
      'stock.defaultAnnotationSettings.label'
    ]
  },
  {
    defaultObj: 'stock.defaultPlotSettings.defaultSeriesSettings.rangeLike',
    targets: [
      'stock.defaultPlotSettings.defaultSeriesSettings.rangeArea',
      'stock.defaultPlotSettings.defaultSeriesSettings.rangeColumn',
      'stock.defaultPlotSettings.defaultSeriesSettings.rangeSplineArea',
      'stock.defaultPlotSettings.defaultSeriesSettings.rangeStepArea'
    ]
  },
  {
    defaultObj: 'stock.defaultPlotSettings.defaultSeriesSettings.base',
    targets: [
      'stock.defaultPlotSettings.defaultSeriesSettings.areaLike',
      'stock.defaultPlotSettings.defaultSeriesSettings.barLike',
      'stock.defaultPlotSettings.defaultSeriesSettings.lineLike',
      'stock.defaultPlotSettings.defaultSeriesSettings.pieLike',
      'stock.defaultPlotSettings.defaultSeriesSettings.marker',
      'stock.defaultPlotSettings.defaultSeriesSettings.bubble'
    ]
  },
  {
    defaultObj: 'stock.defaultPlotSettings.defaultSeriesSettings.areaLike',
    targets: [
      'stock.defaultPlotSettings.defaultSeriesSettings.area',
      'stock.defaultPlotSettings.defaultSeriesSettings.splineArea',
      'stock.defaultPlotSettings.defaultSeriesSettings.stepArea',
      'stock.defaultPlotSettings.defaultSeriesSettings.rangeArea',
      'stock.defaultPlotSettings.defaultSeriesSettings.rangeSplineArea',
      'stock.defaultPlotSettings.defaultSeriesSettings.rangeStepArea'
    ]
  },
  {
    defaultObj: 'stock.defaultPlotSettings.defaultSeriesSettings.barLike',
    targets: [
      'stock.defaultPlotSettings.defaultSeriesSettings.bar',
      'stock.defaultPlotSettings.defaultSeriesSettings.column',
      'stock.defaultPlotSettings.defaultSeriesSettings.box',
      'stock.defaultPlotSettings.defaultSeriesSettings.rangeBar',
      'stock.defaultPlotSettings.defaultSeriesSettings.rangeColumn',
      'stock.defaultPlotSettings.defaultSeriesSettings.candlestick'
    ]
  },
  {
    defaultObj: 'stock.defaultPlotSettings.defaultSeriesSettings.lineLike',
    targets: [
      'stock.defaultPlotSettings.defaultSeriesSettings.line',
      'stock.defaultPlotSettings.defaultSeriesSettings.spline',
      'stock.defaultPlotSettings.defaultSeriesSettings.stepLine',
      'stock.defaultPlotSettings.defaultSeriesSettings.ohlc',
      'stock.defaultPlotSettings.defaultSeriesSettings.jumpLine',
      'stock.defaultPlotSettings.defaultSeriesSettings.stick'
    ]
  },
  {
    defaultObj: 'stock.scroller.defaultSeriesSettings.base',
    targets: [
      'stock.scroller.defaultSeriesSettings.areaLike',
      'stock.scroller.defaultSeriesSettings.barLike',
      'stock.scroller.defaultSeriesSettings.lineLike',
      'stock.scroller.defaultSeriesSettings.pieLike',
      'stock.scroller.defaultSeriesSettings.marker',
      'stock.scroller.defaultSeriesSettings.bubble'
    ]
  },
  {
    defaultObj: 'stock.scroller.defaultSeriesSettings.areaLike',
    targets: [
      'stock.scroller.defaultSeriesSettings.area',
      'stock.scroller.defaultSeriesSettings.splineArea',
      'stock.scroller.defaultSeriesSettings.stepArea',
      'stock.scroller.defaultSeriesSettings.rangeArea',
      'stock.scroller.defaultSeriesSettings.rangeSplineArea',
      'stock.scroller.defaultSeriesSettings.rangeStepArea'
    ]
  },
  {
    defaultObj: 'stock.scroller.defaultSeriesSettings.barLike',
    targets: [
      'stock.scroller.defaultSeriesSettings.bar',
      'stock.scroller.defaultSeriesSettings.column',
      'stock.scroller.defaultSeriesSettings.box',
      'stock.scroller.defaultSeriesSettings.rangeBar',
      'stock.scroller.defaultSeriesSettings.rangeColumn',
      'stock.scroller.defaultSeriesSettings.candlestick'
    ]
  },
  {
    defaultObj: 'stock.scroller.defaultSeriesSettings.lineLike',
    targets: [
      'stock.scroller.defaultSeriesSettings.line',
      'stock.scroller.defaultSeriesSettings.spline',
      'stock.scroller.defaultSeriesSettings.stepLine',
      'stock.scroller.defaultSeriesSettings.ohlc',
      'stock.scroller.defaultSeriesSettings.jumpLine',
      'stock.scroller.defaultSeriesSettings.stick'
    ]
  },
  {
    defaultObj: 'stock.scroller.defaultSeriesSettings.rangeLike',
    targets: [
      'stock.scroller.defaultSeriesSettings.rangeArea',
      'stock.scroller.defaultSeriesSettings.rangeColumn',
      'stock.scroller.defaultSeriesSettings.rangeSplineArea',
      'stock.scroller.defaultSeriesSettings.rangeStepArea'
    ]
  },
  {
    defaultObj: 'defaultScrollBar',
    targets: [
      'defaultDataGrid.horizontalScrollBar',
      'defaultDataGrid.verticalScrollBar',
      'standalones.timeline.horizontalScrollBar',
      'standalones.timeline.verticalScrollBar',
      'defaultTimeline.horizontalScrollBar',
      'defaultTimeline.verticalScrollBar'
    ]
  },
  {
    defaultObj: 'defaultDataGrid',
    targets: [
      'ganttBase.dataGrid',
      'standalones.dataGrid'
    ]
  },
  {
    defaultObj: 'defaultTimeline',
    targets: [
      'ganttBase.timeline',
      'standalones.projectTimeline',
      'standalones.resourceTimeline'
    ]
  },
  {
    defaultObj: 'ganttBase',
    targets: [
      'ganttResource',
      'ganttProject'
    ]
  },
  {
    defaultObj: 'defaultGroupingSettings',
    targets: [
      'stock.grouping',
      'stock.scrollerGrouping'
    ]
  },
  {
    defaultObj: 'linearGauge.defaultPointerSettings.base',
    targets: [
      'linearGauge.defaultPointerSettings.bar',
      'linearGauge.defaultPointerSettings.rangeBar',
      'linearGauge.defaultPointerSettings.marker',
      'linearGauge.defaultPointerSettings.tank',
      'linearGauge.defaultPointerSettings.thermometer',
      'linearGauge.defaultPointerSettings.led'
    ]
  },
  {
    defaultObj: 'linearGauge',
    targets: [
      'bulletGauge',
      'thermometerGauge',
      'tankGauge',
      'ledGauge'
    ]
  },
  {
    defaultObj: 'standalones.resourceList.baseSettings',
    targets: [
      'standalones.resourceList.names',
      'standalones.resourceList.types',
      'standalones.resourceList.descriptions',
      'standalones.resourceList.tags'
    ]
  },
  {
    defaultObj: 'resource.resourceList.baseSettings',
    targets: [
      'resource.resourceList.names',
      'resource.resourceList.types',
      'resource.resourceList.descriptions',
      'resource.resourceList.tags'
    ]
  }
];


/**
 * @const {Object.<string, Object.<{
 *    requires: Array.<{
 *        defaultObj:string,
 *        targets:Array.<string>
 *    }>,
 *    mergedIn: number
 * }>>}
 * @private
 */
anychart.themes.merging.mergingMapInverse_ = (function() {
  var mergingMap = anychart.themes.merging.mergingMap_;
  var res = {};
  for (var i = 0; i < mergingMap.length; i++) {
    var defObj = mergingMap[i].defaultObj;
    var targets = mergingMap[i].targets;
    for (var j = 0; j < targets.length; j++) {
      var target = targets[j];
      var targetSplit = target.split('.');
      var root = targetSplit[0];
      var obj = res[root];
      if (!obj) {
        res[root] = obj = {
          requires: [],
          mergedIn: 0
        };
      }
      var last = obj.requires[obj.requires.length - 1];
      if (last && last.defaultObj == defObj) {
        last.targets.push(target);
      } else {
        obj.requires.push({
          defaultObj: defObj,
          targets: [target]
        });
      }
    }
  }
  return res;
})();


/**
 * Type of the non-mergable entity.
 * @enum {number}
 * @private
 */
anychart.themes.merging.NonMergableEntityTypes_ = {
  NONE: 0,
  FILL: 1,
  STROKE: 2,
  HATCH_FILL: 3,
  PALETTE: 4,
  HATCH_PALETTE: 5,
  MARKER_PALETTE: 6,
  SCALE: 7,
  PADDING: 8
};


/**
 * Objects with keys, that cannot be merged - they should be replaced.
 * @type {Object.<string, anychart.themes.merging.NonMergableEntityTypes_>}
 * @private
 */
anychart.themes.merging.nonMergableEntities_ = {
  'padding': anychart.themes.merging.NonMergableEntityTypes_.PADDING,

  'scale': anychart.themes.merging.NonMergableEntityTypes_.SCALE,
  'xScale': anychart.themes.merging.NonMergableEntityTypes_.SCALE,
  'yScale': anychart.themes.merging.NonMergableEntityTypes_.SCALE,
  'colorScale': anychart.themes.merging.NonMergableEntityTypes_.SCALE,

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
  'selectedFill': anychart.themes.merging.NonMergableEntityTypes_.FILL,
  'selectNegativeFill': anychart.themes.merging.NonMergableEntityTypes_.FILL,
  'selectRisingFill': anychart.themes.merging.NonMergableEntityTypes_.FILL,
  'selectFallingFill': anychart.themes.merging.NonMergableEntityTypes_.FILL,

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
  'selectHatchFill': anychart.themes.merging.NonMergableEntityTypes_.HATCH_FILL,
  'selectNegativeHatchFill': anychart.themes.merging.NonMergableEntityTypes_.HATCH_FILL,
  'selectRisingHatchFill': anychart.themes.merging.NonMergableEntityTypes_.HATCH_FILL,
  'selectFallingHatchFill': anychart.themes.merging.NonMergableEntityTypes_.HATCH_FILL,

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
  'valueErrorStroke': anychart.themes.merging.NonMergableEntityTypes_.STROKE,
  'selectedStroke': anychart.themes.merging.NonMergableEntityTypes_.STROKE,
  'selectLowStroke': anychart.themes.merging.NonMergableEntityTypes_.STROKE,
  'selectHighStroke': anychart.themes.merging.NonMergableEntityTypes_.STROKE,
  'selectNegativeStroke': anychart.themes.merging.NonMergableEntityTypes_.STROKE,
  'selectRisingStroke': anychart.themes.merging.NonMergableEntityTypes_.STROKE,
  'selectFallingStroke': anychart.themes.merging.NonMergableEntityTypes_.STROKE,
  'selectedRisingStroke': anychart.themes.merging.NonMergableEntityTypes_.STROKE,
  'selectedFallingStroke': anychart.themes.merging.NonMergableEntityTypes_.STROKE,
  'selectMedianStroke': anychart.themes.merging.NonMergableEntityTypes_.STROKE,
  'selectStemStroke': anychart.themes.merging.NonMergableEntityTypes_.STROKE,
  'selectWhiskerStroke': anychart.themes.merging.NonMergableEntityTypes_.STROKE
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
  'gauge.ranges': 'gauge.defaultRangeSettings',
  'gauge.axes': 'gauge.defaultAxisSettings',
  'gauge.scaleBars': 'gauge.defaultScaleBarSettings',
  'map.callouts': 'map.defaultCalloutSettings'
};


/**
 * Defaults nodes for array entities.
 * @type {Array.<string>}
 * @private
 */
anychart.themes.merging.scaleEntities_ = [
  'chart.scales',
  'gauge.scales'
];


/**
 * Defaults nodes for typed array entities.
 * @type {Object.<string, {defaults: string, typeDescriptor: string}>}
 * @private
 */
anychart.themes.merging.typedEntities_ = {
  'chart.series': {
    defaults: 'chart.defaultSeriesSettings',
    typeDescriptor: 'seriesType'
  },
  'gauge.pointers': {
    defaults: 'gauge.defaultPointerSettings',
    typeDescriptor: 'pointerType'
  },
  // this part is for own annotation serialization
  'annotationsList': {
    defaults: 'defaultAnnotationSettings',
    typeDescriptor: 'type'
  }
};
