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
  if (!descriptor) {
    anychart.themes.merging.mergingMapInverse_[rootParts[0]] = {requires: [], compiledIn: themeIndex, mergedIn: 0};
    return true;
  }
  var needsCompilation = descriptor.compiledIn <= themeIndex;
  if (needsCompilation) {
    descriptor.compiledIn = themeIndex + 1;
    var requires = descriptor.requires;
    // if (requires.length)
    //  console.log(path, "requires", requires);
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
  return needsCompilation || descriptor.mergedIn < themeIndex;
};


/**
 * @param {string} path
 * @param {number} themeIndex
 */
anychart.themes.merging.markMergedDescriptor = function(path, themeIndex) {
  var rootParts = path.split('.');
  var descriptor = anychart.themes.merging.mergingMapInverse_[rootParts[0]];
  if (!descriptor) {
    anychart.themes.merging.mergingMapInverse_[rootParts[0]] = {requires: [], mergedIn: 0, compiledIn: 0};
  }
  descriptor.mergedIn = themeIndex;
};


/**
 * Clears themes cache.
 */
anychart.themes.merging.clearCache = function() {
  for (var i in anychart.themes.merging.mergingMapInverse_) {
    var descriptor = anychart.themes.merging.mergingMapInverse_[i];
    // we want to keep default theme cache
    descriptor.compiledIn = Math.min(descriptor.compiledIn, 1);
    descriptor.mergedIn = 0;
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
 * @param {anychart.enums.ScaleTypes} defaultType - Default scale type.
 * @return {Object} - Clone of original scale json object with type.
 */
anychart.themes.merging.mergeScale = function(scaleObj, index, chartType, defaultType) {
  var theme = anychart.getFullTheme(chartType);
  var themeScale = anychart.themes.merging.getThemePart_(theme, ['scales', index]);
  scaleObj = /** @type {Object} */(anychart.themes.merging.deepClone_(scaleObj));

  var scaleType;
  if (themeScale) {
    scaleType = scaleObj['type'];
    var themeScaleType = themeScale['type'];

    if (!goog.isDef(scaleType) || !goog.isDef(themeScaleType) || !((themeScaleType == 'ordinal') ^ (scaleType == 'ordinal'))) {
      scaleObj = /** @type {Object} */ (anychart.themes.merging.merge(scaleObj, themeScale));
    }
  }

  scaleType = scaleObj['type'] || defaultType;
  var scaleDefault;
  if (scaleType == anychart.enums.ScaleTypes.ORDINAL_COLOR) {
    anychart.getFullTheme('defaultOrdinalColorScale');
  } else if (scaleType == anychart.enums.ScaleTypes.LINEAR_COLOR) {
    anychart.getFullTheme('defaultLinearColorScale');
  } else {
    scaleDefault = anychart.themes.merging.getThemePart_(
        anychart.getFullTheme('defaultScaleSettings'),
        [anychart.utils.toCamelCase(scaleType)]);
  }

  return /** @type {Object} */ (anychart.themes.merging.merge(scaleObj, scaleDefault));
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
 */
anychart.themes.merging.setThemePart = function(theme, path, value) {
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
  return anychart.themes.merging.setThemePart(
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
    return anychart.themes.merging.setThemePart(theme, targetPath,
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
  target = anychart.themes.merging.demergeCredits_(target);
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
      var defaultArray = anychart.themes.merging.getThemePart_(defaultObj, namePath);
      len = defaultArray.length;
      for (i = 0; i < len; i++) {
        var scaleType = defaultArray[i]['type'];
        var scaleDefault = anychart.themes.merging.getThemePart_(anychart.getFullTheme('defaultScaleSettings'), [scaleType]);
        defaultArray[i] = anychart.themes.merging.merge(defaultArray[i], scaleDefault);
      }
      len = targetPart.length;
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
 * Demerges credits.
 * @param {*} target
 * @return {*}
 * @private
 */
anychart.themes.merging.demergeCredits_ = function(target) {
  if (target) {
    var trgt = target['chart'] || target['gauge'] || target['gantt'] || target['map'];
    if (!trgt) return target;
    var targetType = goog.typeOf(trgt['credits']);
    var defaultType = goog.typeOf(anychart.getFlatTheme('stageCredits'));
    if (targetType == 'object' && defaultType == 'object') {
      var defVal = anychart.getFlatTheme('stageCredits');
      var val = anychart.themes.merging.demerge_(trgt['credits'], defVal);
      if (goog.isDef(val)) {
        trgt['credits'] = val;
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
 * @param {?} item
 * @return {!Array}
 * @private
 */
anychart.themes.merging.flattenRecursive_ = function(item) {
  var result;
  if (goog.isString(item)) {
    result = [item];
  } else {
    result = [];
    var prefix = item[0];
    var postfix = item[1];
    prefix = goog.isString(prefix) ? [prefix] : goog.array.concatMap(prefix, anychart.themes.merging.flattenRecursive_);
    postfix = goog.isString(postfix) ? [postfix] : goog.array.concatMap(postfix, anychart.themes.merging.flattenRecursive_);
    for (var i = 0; i < prefix.length; i++) {
      for (var j = 0; j < postfix.length; j++) {
        result.push(prefix[i] + postfix[j]);
      }
    }
  }
  return result;
};


/**
 * Map used by merger, that explains how to merge. It is an array to ensure merging order.
 * @const {Array.<{defaultObj:string, targets:Array.<string>}>}
 * @private
 */
anychart.themes.merging.mergingMap_ = (function() {
  var arr = [
    {
      defaultObj: 'defaultScaleSettings.linear',
      targets: [
        ['defaultScaleSettings.', [
          'log',
          'dateTime'
        ]]
      ]
    },
    {
      defaultObj: 'defaultOrdinalColorScale',
      targets: [
        'defaultScaleSettings.ordinalColor'
      ]
    },
    {
      defaultObj: 'defaultLinearColorScale',
      targets: [
        'defaultScaleSettings.linearColor'
      ]
    },
    {
      defaultObj: 'defaultFontSettings',
      targets: [
        ['default', [
          'Title',
          'CrosshairLabel',
          'ButtonSettings.normal',
          ['Tooltip', [
            '',
            '.contentInternal'
          ]],
          ['Legend', [
            '',
            '.paginator'
          ]],
          ['Label', [
            'Factory',
            'Settings'
          ]]
        ]],
        [['cartesianBase', 'scatter', 'mekko'],
          '.defaultTextMarkerSettings'],
        ['standalones.', [
          'label',
          'table',
          'textAxisMarker'
        ]],
        [['standalones', 'resource'],
          '.resourceList.baseSettings'],
        'stock.eventMarkers.normal',
        'chart.defaultAnnotationSettings.label'
      ]
    },
    {
      defaultObj: 'defaultLabelSettings',
      targets: [
        ['chart.', [
          [['', 'defaultQuarterSettings.'], 'defaultLabelSettings']
        ]],
        'defaultTextMarkerSettings'
      ]
    },
    {
      defaultObj: 'defaultBackground',
      targets: [
        [[
          ['default', [
            'Title',
            'Timeline.header',
            'TextMarkerSettings',
            'ButtonSettings.normal',
            ['Tooltip', [
              '',
              '.contentInternal'
            ]],
            'LabelFactory',
            'CrosshairLabel',
            ['Legend', [
              '',
              '.paginator'
            ]]
          ]],
          ['chart', [
            '',
            '.defaultAnnotationSettings.label',
            [[
              '',
              '.defaultQuarterSettings'
            ], '.defaultLabelSettings'],
            '.dataArea'
          ]],
          ['stock.', [
            [[
              'defaultPlotSettings',
              'scroller'
            ], '.xAxis'],
            'defaultPlotSettings.dataArea'
          ]],
          ['resource.', [
            'grid',
            'timeLine',
            'resourceList'
          ]],
          ['standalones', [
            '',
            '.label',
            '.resourceList'
          ]]
        ], '.background'],
        'chart.defaultQuarterSettings'
      ]
    },
    {
      defaultObj: 'chart.defaultLabelSettings',
      targets: [
        'defaultNoDataLabel'
      ]
    },
    {
      defaultObj: 'defaultLabelFactory',
      targets: [
        ['default', [
          ['Axis.', [[['minorL', 'l'], 'abels']]],
          ['Timeline.', [
            'header',
            'labels'
          ]]
        ]],
        'standalones.labelsFactory',
        ['map.axesSettings.', [
          [[
            'l',
            'minorL'
          ], 'abels']
        ]],
        [[
          'pert.milestones',
          ['resource.', [
            'activities',
            'conflicts'
          ]]
        ], '.labels'],
        ['pert.tasks.', [[['upper', 'lower'], 'Labels']]],
        'stock.defaultPlotSettings.defaultPriceIndicatorSettings.label',
        'treeMap.normal.headers',
        [[
          'venn',
          'pieFunnelPyramidBase',
          'sunburst',
          ['sankey.', ['node', 'flow', 'dropoff']],
          [['heat', 'tree'], 'Map'],
          [[
            'chart.defaultAnnotation',
            'linearGauge.defaultPointer',
            [['chart', 'map'], '.defaultSeries']
          ], 'Settings.base']
        ], '.normal.labels']
      ]
    },
    {
      defaultObj: 'chart.normal.labels',
      targets: [
        'chart.defaultSeriesSettings.base.normal.labels'
      ]
    },
    {
      defaultObj: 'defaultCrosshairLabel',
      targets: [
        [[
          'cartesianBase',
          'mekko',
          'scatter',
          'map',
          'stock'
        ], '.crosshair.defaultLabelSettings']
      ]
    },
    {
      defaultObj: 'defaultMarkerFactory',
      targets: [
        'defaultTimeline.markers',
        'standalones.markersFactory',
        [[
          'venn',
          'pieFunnelPyramidBase',
          [['heat', 'tree'], 'Map'],
          [[
            'chart.defaultAnnotation',
            [['chart', 'map'], '.defaultSeries']
          ], 'Settings.base']
        ], '.normal.markers']
      ]
    },
    {
      defaultObj: 'defaultTitle',
      targets: [
        [[
          ['default', [
            'Tooltip',
            'Axis',
            'Legend',
            'DataGrid.defaultColumnSettings'
          ]],
          ['chart', [
            '',
            '.defaultQuarterSettings'
          ]],
          'stock.defaultPlotSettings',
          'standalones',
          'map.axesSettings'
        ], '.title']
      ]
    },
    {
      defaultObj: 'defaultSeparator',
      targets: [
        ['default', [
          [[
            'Tooltip.s',
            'Legend.titleS'
          ], 'eparator']
        ]]
      ]
    },
    {
      defaultObj: 'defaultTooltip',
      targets: [
        [[
          ['default', [
            'Legend',
            'DataGrid',
            'Timeline'
          ]],
          'chart',
          'pieFunnelPyramidBase',
          ['pert.', [
            'milestones',
            'tasks'
          ]],
          'stock.eventMarkers'
        ], '.tooltip']
      ]
    },
    {
      defaultObj: 'defaultLegend',
      targets: [
        [[
          'chart',
          'standalones'
        ], '.legend']
      ]
    },
    {
      defaultObj: 'palette',
      targets: [
        [[
          'chart',
          'stock.scroller',
          ['default', ['DataGrid', 'Timeline']]
        ], '.palette']
      ]
    },
    {
      defaultObj: 'hatchFillPalette',
      targets: [
        [[
          'chart',
          'stock.scroller'
        ], '.hatchFillPalette']
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
        [[
          'chart',
          'stock.defaultPlotSettings'
        ], '.markerPalette']
      ]
    },
    {
      defaultObj: 'defaultGridSettings',
      targets: [
        [[
          'defaultMinor',
          [[
            'cartesianBase',
            'scatter',
            'polar',
            'radar',
            'heatMap',
            'stock.defaultPlotSettings'

          ], '.default']
        ], 'GridSettings'],
        'map.gridsSettings',
        ['standalones.', [
          [[
            'linear',
            'radar',
            'polar'
          ], 'Grid']
        ]]
      ]
    },
    {
      defaultObj: 'defaultMinorGridSettings',
      targets: [
        [[
          'cartesianBase',
          'scatter',
          'polar',
          'radar',
          'stock.defaultPlotSettings'
        ], '.defaultMinorGridSettings']
      ]
    },
    {
      defaultObj: 'defaultLineMarkerSettings',
      targets: [
        [[
          'cartesianBase',
          'scatter',
          'mekko',
          'sparkline',
          'defaultTimeline',
          'stock.defaultPlotSettings'
        ], '.defaultLineMarkerSettings'],
        'standalones.lineAxisMarker'
      ]
    },
    {
      defaultObj: 'defaultTextMarkerSettings',
      targets: [
        [[
          'cartesianBase',
          'scatter',
          'mekko',
          'sparkline',
          'defaultTimeline',
          'stock.defaultPlotSettings'
        ], '.defaultTextMarkerSettings'],
        'standalones.textAxisMarker'
      ]
    },
    {
      defaultObj: 'defaultRangeMarkerSettings',
      targets: [
        [[
          'cartesianBase',
          'scatter',
          'mekko',
          'sparkline',
          'defaultTimeline',
          'stock.defaultPlotSettings'
        ], '.defaultRangeMarkerSettings'],
        'standalones.rangeAxisMarker'
      ]
    },
    {
      defaultObj: 'defaultAxis',
      targets: [
        [[
          [[
            'cartesianBase',
            'heatMap',
            'scatter',
            'mekko'
          ], [
            ['.default', ['X', 'Y']]
          ]],
          [[
            'circular',
            'linear'
          ], 'Gauge.default']
        ], 'AxisSettings'],
        [[
          'radar.',
          'polar.'
        ], [
          [[
            'x',
            'y'
          ], 'Axis']
        ]],
        ['stock.', [
          ['defaultPlotSettings.', [
            'defaultYAxisSettings',
            'xAxis'
          ]],
          'scroller.xAxis'
        ]],
        'bullet.axis',
        'defaultColorRange',
        ['standalones.', [
          [[
            'linear',
            'polar',
            'radar',
            'radial'
          ], 'Axis']
        ]]
      ]
    },
    {
      defaultObj: 'defaultColorRange',
      targets: [
        [[
          'map',
          'treeMap',
          'calendar',
          'standalones',
          'tagCloud'
        ], '.colorRange']
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
        [[
          ['cartesianBase.', [
            'x',
            'y'
          ]]
        ], 'Scroller'],
        [[
          'stock',
          'standalones'
        ], '.scroller'],
        ['resource.', [
          [[
            'horizontal',
            'vertical'
          ], 'ScrollBar']
        ]]
      ]
    },
    {
      defaultObj: 'defaultNoDataLabel',
      targets: [
        [['chart', 'stock.defaultPlotSettings'], '.noDataLabel']
      ]
    },
    {
      defaultObj: 'defaultButtonSettings',
      targets: [
        'defaultDataGrid.buttons'
      ]
    },
    {
      defaultObj: 'chart',
      targets: [
        'tagCloud',
        'scatter',
        'radar',
        'polar',
        'bullet',
        'map',
        'sparkline',
        [[['cartesian', ['', '3d']], 'pieFunnelPyramid', 'gantt'], 'Base'],
        ['stock', ['', '.defaultPlotSettings']],
        [['heat', 'tree'], 'Map'],
        [['circular', 'linear'], 'Gauge'],
        'pert',
        'resource',
        'mekko',
        'venn',
        'sunburst',
        'sankey',
        'calendar'
      ]
    },
    {
      defaultObj: 'chart.defaultSeriesSettings',
      targets: [
        'stock.scroller.defaultSeriesSettings'
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
        ['cartesianBase.defaultAnnotationSettings.', [
          'ray',
          'line',
          [['infinite', 'vertical', 'horizontal'], 'Line'],
          'rectangle',
          'ellipse',
          'triangle',
          'trendChannel',
          'andrewsPitchfork',
          ['fibonacci', [
            'Fan',
            'Arc',
            'Retracement',
            'Timezones'
          ]],
          'marker',
          'label'
        ]]
      ]
    },
    {
      defaultObj: 'cartesianBase.defaultSeriesSettings.rangeLike',
      targets: [
        ['cartesianBase.defaultSeriesSettings.', [
          ['range', [
            'Bar',
            'Column',
            [['', 'Spline', 'Step'], 'Area']
          ]],
          'hilo'
        ]]
      ]
    },
    {
      defaultObj: 'cartesianBase.defaultSeriesSettings.base',
      targets: [
        ['cartesianBase.defaultSeriesSettings.', [
          [['area', 'bar', 'line'], 'Like'],
          'marker',
          'bubble'
        ]]
      ]
    },
    {
      defaultObj: 'cartesianBase.defaultSeriesSettings.areaLike',
      targets: [
        ['cartesianBase.defaultSeriesSettings.', [
          [[
            'a',
            'splineA',
            'stepA'
          ], 'rea'],
          ['range', [
            [[
              '',
              'Spline',
              'Step'
            ], 'Area']
          ]]
        ]]
      ]
    },
    {
      defaultObj: 'cartesianBase.defaultSeriesSettings.barLike',
      targets: [
        ['cartesianBase.defaultSeriesSettings.', [
          'bar',
          'column',
          'box',
          ['range', ['Bar', 'Column']],
          'candlestick'
        ]]
      ]
    },
    {
      defaultObj: 'cartesianBase.defaultSeriesSettings.lineLike',
      targets: [
        ['cartesianBase.defaultSeriesSettings.', [
          [['', 'sp'], 'line'],
          [['step', 'jump'], 'Line'],
          'ohlc',
          'stick',
          'hilo'
        ]]
      ]
    },
    {
      defaultObj: 'cartesianBase',
      targets: [
        'cartesian',
        'area',
        ['vertical', ['Area', 'Line']],
        'bar',
        'box',
        'column',
        'financial',
        'line',
        'jumpLine',
        'stick',
        'pareto',
        'waterfall'
      ]
    },
    {
      defaultObj: 'waterfall.defaultSeriesSettings.barLike',
      targets: [
        'waterfall.defaultSeriesSettings.waterfall'
      ]
    },
    {
      defaultObj: 'cartesian3dBase.defaultSeriesSettings.base',
      targets: [
        ['cartesian3dBase.defaultSeriesSettings.', [
          'bar',
          'column',
          'area',
          'line',
          'line2d'
        ]]
      ]
    },
    {
      defaultObj: 'cartesian3dBase',
      targets: [
        [[
          'area',
          'bar',
          'column',
          'line',
          'cartesian'
        ], '3d']
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
      targets: [
        [['area', 'line'], '3d']
      ]
    },
    {
      defaultObj: 'mekko.defaultSeriesSettings.base',
      targets: [
        ['mekko.defaultSeriesSettings.', [
          'mosaic',
          [['', 'bar'], 'mekko']
        ]]
      ]
    },
    {
      defaultObj: 'scatter.defaultAnnotationSettings.base',
      targets: [
        ['scatter.defaultAnnotationSettings.', [
          'ray',
          'line',
          [['infinite', 'vertical', 'horizontal'], 'Line'],
          'rectangle',
          'ellipse',
          'triangle',
          'trendChannel',
          'andrewsPitchfork',
          ['fibonacci', [
            'Fan',
            'Arc',
            'Retracement',
            'Timezones'
          ]],
          'marker',
          'label'
        ]]
      ]
    },
    {
      defaultObj: 'scatter.defaultSeriesSettings.base',
      targets: [
        ['scatter.defaultSeriesSettings.', [
          'bubble',
          'lineLike',
          'marker'
        ]]
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
        'bubble',
        'quadrant'
      ]
    },
    {
      defaultObj: 'radar.defaultSeriesSettings.base',
      targets: [
        ['radar.defaultSeriesSettings.', [
          [['area', 'line'], 'Like'],
          'marker'
        ]]
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
        ['polar.defaultSeriesSettings.', [
            [['area', 'line', 'bar'], 'Like'],
            'marker'
        ]]
      ]
    },
    {
      defaultObj: 'polar.defaultSeriesSettings.rangeLike',
      targets: [
        'polar.defaultSeriesSettings.rangeColumn'
      ]
    },
    {
      defaultObj: 'polar.defaultSeriesSettings.areaLike',
      targets: [
        ['polar.defaultSeriesSettings.', [
          'area',
          'polygon'
        ]]
      ]
    },
    {
      defaultObj: 'polar.defaultSeriesSettings.lineLike',
      targets: [
        ['polar.defaultSeriesSettings.', [
          [[
            '',
            'poly'
          ], 'line']
        ]]
      ]
    },
    {
      defaultObj: 'polar.defaultSeriesSettings.barLike',
      targets: [
        ['polar.defaultSeriesSettings.', [
          [[
            'c', 'rangeC'
          ], 'olumn']
        ]]
      ]
    },
    {
      defaultObj: 'chart.normal.labels',
      targets: [
        'sparkline.labels'
      ]
    },
    {
      defaultObj: 'chart.normal.markers',
      targets: [
        'sparkline.markers'
      ]
    },
    {
      defaultObj: 'chart.defaultSeriesSettings.base.normal',
      targets: [
        'sparkline.defaultSeriesSettings.base'
      ]
    },
    {
      defaultObj: 'chart.defaultSeriesSettings.area.normal',
      targets: [
        'sparkline.defaultSeriesSettings.area'
      ]
    },
    {
      defaultObj: 'chart.defaultSeriesSettings.line.normal',
      targets: [
        'sparkline.defaultSeriesSettings.line'
      ]
    },
    {
      defaultObj: 'chart.defaultSeriesSettings.column.normal',
      targets: [
        'sparkline.defaultSeriesSettings.column'
      ]
    },
    {
      defaultObj: 'sparkline.defaultSeriesSettings.base',
      targets: [
        ['sparkline.defaultSeriesSettings.', [
          'area',
          'line',
          'column',
          'winLoss'
        ]]
      ]
    },
    {
      defaultObj: 'circularGauge.defaultPointerSettings.base',
      targets: [
        ['circularGauge.defaultPointerSettings.', [
          'bar',
          'marker',
          'needle',
          'knob'
        ]]
      ]
    },
    {
      defaultObj: 'map.defaultSeriesSettings.base',
      targets: [
        ['map.defaultSeriesSettings.', [
          'choropleth',
          'bubble',
          'marker',
          'connector'
        ]]
      ]
    },
    {
      defaultObj: 'heatMap.defaultAnnotationSettings.base',
      targets: [
        ['heatMap.defaultAnnotationSettings.', [
          'ray',
          'line',
          [['infinite', 'vertical', 'horizontal'], 'Line'],
          'rectangle',
          'ellipse',
          'triangle',
          'trendChannel',
          'andrewsPitchfork',
          ['fibonacci', [
            'Fan',
            'Arc',
            'Retracement',
            'Timezones'
          ]],
          'marker',
          'label'
        ]]
      ]
    },
    {
      defaultObj: 'stock.defaultAnnotationSettings.base',
      targets: [
        ['stock.defaultAnnotationSettings.', [
          'ray',
          'line',
          [['infinite', 'vertical', 'horizontal'], 'Line'],
          'rectangle',
          'ellipse',
          'triangle',
          'trendChannel',
          'andrewsPitchfork',
          ['fibonacci', [
            'Fan',
            'Arc',
            'Retracement',
            'Timezones'
          ]],
          'marker',
          'label'
        ]]
      ]
    },
    {
      defaultObj: 'stock.defaultPlotSettings.defaultSeriesSettings.base',
      targets: [
        ['stock.defaultPlotSettings.defaultSeriesSettings.', [
          [[
            'area',
            'bar',
            'line'
          ], 'Like'],
          'marker'
        ]]
      ]
    },
    {
      defaultObj: 'stock.defaultPlotSettings.defaultSeriesSettings.rangeLike',
      targets: [
        ['stock.defaultPlotSettings.defaultSeriesSettings.', [
          ['range', [
            'Column',
            [['', 'Spline', 'Step'], 'Area']
          ]],
          'hilo'
        ]]
      ]
    },
    {
      defaultObj: 'stock.defaultPlotSettings.defaultSeriesSettings.areaLike',
      targets: [
        ['stock.defaultPlotSettings.defaultSeriesSettings.', [
          [[
            'a',
            'splineA',
            'stepA'
          ], 'rea'],
          ['range', [
            [['', 'Spline', 'Step'], 'Area']
          ]]
        ]]
      ]
    },
    {
      defaultObj: 'stock.defaultPlotSettings.defaultSeriesSettings.barLike',
      targets: [
        ['stock.defaultPlotSettings.defaultSeriesSettings.', [
          'column',
          'rangeColumn',
          'candlestick'
        ]]
      ]
    },
    {
      defaultObj: 'stock.defaultPlotSettings.defaultSeriesSettings.lineLike',
      targets: [
        ['stock.defaultPlotSettings.defaultSeriesSettings.', [
          [['', 'sp'], 'line'],
          [['step', 'jump'], 'Line'],
          'ohlc',
          'stick',
          'hilo'
        ]]
      ]
    },
    {
      defaultObj: 'stock.scroller.defaultSeriesSettings.base',
      targets: [
        ['stock.scroller.defaultSeriesSettings.', [
            [['area', 'bar', 'line'], 'Like'],
            'marker'
        ]]
      ]
    },
    {
      defaultObj: 'stock.scroller.defaultSeriesSettings.areaLike',
      targets: [
        ['stock.scroller.defaultSeriesSettings.', [
            [['a', 'splineA', 'stepA'], 'rea'],
            ['range', [
              [['', 'Spline', 'Step'], 'Area']
            ]]
        ]]
      ]
    },
    {
      defaultObj: 'stock.scroller.defaultSeriesSettings.barLike',
      targets: [
        ['stock.scroller.defaultSeriesSettings.', [
          'column',
          'rangeColumn',
          'candlestick'
        ]]
      ]
    },
    {
      defaultObj: 'stock.scroller.defaultSeriesSettings.lineLike',
      targets: [
        ['stock.scroller.defaultSeriesSettings.', [
          [['', 'sp'], 'line'],
          [['step', 'jump'], 'Line'],
          'ohlc',
          'stick',
          'hilo'
        ]]
      ]
    },
    {
      defaultObj: 'stock.scroller.defaultSeriesSettings.rangeLike',
      targets: [
        ['stock.scroller.defaultSeriesSettings.', [
            ['range', [
              'Column',
              [['', 'Spline', 'Step'], 'Area']
            ]],
            'hilo'
        ]]
      ]
    },
    {
      defaultObj: 'defaultScrollBar',
      targets: [
        [[
          ['default', [
            'DataGrid',
            'Timeline'
          ]],
          'standalones.timeline'
        ], [
          [['.horizontal', '.vertical'], 'ScrollBar']
        ]]
      ]
    },
    {
      defaultObj: 'defaultDataGrid',
      targets: [
        [['ganttBase', 'standalones'], '.dataGrid']
      ]
    },
    {
      defaultObj: 'defaultTimeline',
      targets: [
        [[
          'ganttBase.t',
          ['standalones.', [
            'projectT',
            'resourceT'
          ]]
        ],
          'imeline'
        ]
      ]
    },
    {
      defaultObj: 'defaultTimeline.elements',
      targets: [
        ['defaultTimeline.', [
          'tasks', 'baselines', 'milestones', 'periods'
        ]]
      ]
    },
    {
      defaultObj: 'defaultTimeline.elements.milestones',
      targets: ['defaultTimeline.elements.milestones.preview']
    },
    {
      defaultObj: 'defaultTimeline.tasks',
      targets: [
        ['defaultTimeline.', ['groupingTasks']]
      ]
    },
    {
      defaultObj: 'ganttBase',
      targets: [
        ['gantt', [
          'Resource',
          'Project'
        ]]
      ]
    },
    {
      defaultObj: 'defaultGroupingSettings',
      targets: [
        ['stock.', [
          [['g', 'scrollerG'], 'rouping']
        ]]
      ]
    },
    {
      defaultObj: 'linearGauge.defaultPointerSettings.base',
      targets: [
        ['linearGauge.defaultPointerSettings.', [
          'bar',
          'rangeBar',
          'marker',
          'tank',
          'thermometer',
          'led'
        ]]
      ]
    },
    {
      defaultObj: 'linearGauge',
      targets: [
        'thermometer',
        'tank',
        'led'
      ]
    },
    {
      defaultObj: 'standalones.resourceList.baseSettings',
      targets: [
        [['standalones.resourceList.'], [
          'names',
          'types',
          'descriptions',
          'tags'
        ]]
      ]
    },
    {
      defaultObj: 'resource.resourceList.baseSettings',
      targets: [
        [['resource.resourceList.'], [
          'names',
          'types',
          'descriptions',
          'tags'
        ]]
      ]
    },
    {
      defaultObj: 'chart.defaultQuarterSettings',
      targets: [
        ['chart.quarters.', [
          [['right', 'left'], 'Top'],
          [['right', 'left'], 'Bottom']
        ]]
      ]
    },
    {
      defaultObj: 'mekko',
      targets: [
        'mosaic',
        'barmekko'
      ]
    },
    {
      defaultObj: 'mekko.defaultAnnotationSettings.base',
      targets: [
        ['mekko.defaultAnnotationSettings.', [
          'ray',
          'line',
          [['infinite', 'vertical', 'horizontal'], 'Line'],
          'rectangle',
          'ellipse',
          'triangle',
          'trendChannel',
          'andrewsPitchfork',
          ['fibonacci', [
            'Fan',
            'Arc',
            'Retracement',
            'Timezones'
          ]],
          'marker',
          'label'
        ]]
      ]
    }
  ];
  for (var i = 0; i < arr.length; i++) {
    arr[i].targets = goog.array.concatMap(arr[i].targets, anychart.themes.merging.flattenRecursive_);
  }
  return arr;
})();


/**
 * @const {Object.<string, Object.<{
 *    requires: Array.<{
 *        defaultObj:string,
 *        targets:Array.<string>
 *    }>,
 *    compiledIn: number,
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
          compiledIn: 0,
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
  PADDING: 8,
  SHAPES: 9
};


/**
 * Objects with keys, that cannot be merged - they should be replaced.
 * @type {Object.<string, anychart.themes.merging.NonMergableEntityTypes_>}
 * @private
 */
anychart.themes.merging.nonMergableEntities_ = (function() {
  var map = {
    'padding': anychart.themes.merging.NonMergableEntityTypes_.PADDING,
    'margin': anychart.themes.merging.NonMergableEntityTypes_.PADDING,
    'scale': anychart.themes.merging.NonMergableEntityTypes_.SCALE,
    'palette': anychart.themes.merging.NonMergableEntityTypes_.PALETTE,
    'fill': anychart.themes.merging.NonMergableEntityTypes_.FILL,
    'stroke': anychart.themes.merging.NonMergableEntityTypes_.STROKE,
    'hatchFill': anychart.themes.merging.NonMergableEntityTypes_.HATCH_FILL,
    'hatchFillPalette': anychart.themes.merging.NonMergableEntityTypes_.HATCH_PALETTE,
    'shapes': anychart.themes.merging.NonMergableEntityTypes_.SHAPES
  };

  populate([[
    'x',
    'y',
    'color'
  ], 'Scale'], anychart.themes.merging.NonMergableEntityTypes_.SCALE);
  populate([[
    'range',
    'marker'
  ], 'Palette'], anychart.themes.merging.NonMergableEntityTypes_.PALETTE);
  populate([[
    'negative',
    'first',
    'last',
    'max',
    'min',
    'rising',
    'falling',
    'background',
    'progress',
    'milestone',
    'parent',
    'connector',
    'odd',
    'even',
    'title',
    'slider',
    'cell',
    ['row', [
      '',
      'Odd',
      'Even',
      'Hover',
      'Selected'
    ]],
    ['base', [
      '',
      'line'
    ]],
    ['icon', [
      '',
      'Marker'
    ]],
    ['drag', [
      'Preview',
      'Area'
    ]],
    ['hover', [
      '',
      'Negative',
      'Rising',
      'Falling'
    ]],
    ['select', [
      '',
      'ed',
      'edElement',
      'Negative',
      'Rising',
      'Falling',
      'Marquee'
    ]]
  ], 'Fill'], anychart.themes.merging.NonMergableEntityTypes_.FILL);
  populate([[
    'negative',
    'first',
    'last',
    'max',
    'min',
    'rising',
    'falling',
    'icon',
    ['hover', [
      '',
      'Negative',
      'Rising',
      'Falling'
    ]],
    ['select', [
      '',
      'ed',
      'Negative',
      'Rising',
      'Falling'
    ]]
  ], 'HatchFill'], anychart.themes.merging.NonMergableEntityTypes_.HATCH_FILL);
  populate([[
    'column',
    'row',
    'connector',
    'median',
    'stem',
    'whisker',
    'negative',
    'high',
    'low',
    'rising',
    'falling',
    'progress',
    'milestone',
    'parent',
    'slider',
    'background',
    [[
      '',
      'line'
    ], 'base'],
    ['hover', [
      '',
      'Median',
      'Stem',
      'Whisker',
      'Negative',
      'High',
      'Low',
      'Rising',
      'Falling'
    ]],
    ['icon', [
      '',
      'Marker'
    ]],
    ['drag', [
      'Preview',
      'Area'
    ]],
    [[
      'x',
      'value'
    ], 'Error'],
    ['select', [
      '',
      'ed',
      'edElement',
      'Low',
      'High',
      'Negative',
      'Rising',
      'Falling',
      'edRising',
      'edFalling',
      'Median',
      'Stem',
      'Whisker',
      'Marquee'
    ]]
  ], 'Stroke'], anychart.themes.merging.NonMergableEntityTypes_.STROKE);

  /**
   * @param {Array|string} item
   * @param {anychart.themes.merging.NonMergableEntityTypes_} type
   */
  function populate(item, type) {
    var names = anychart.themes.merging.flattenRecursive_(item);
    for (var i = 0; i < names.length; i++) {
      map[names[i]] = type;
    }
  }
  return map;
})();


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
  'plot.lineAxesMarkers': 'plot.defaultLineMarkerSettings',
  'plot.rangeAxesMarkers': 'plot.defaultRangeMarkerSettings',
  'plot.textAxesMarkers': 'plot.defaultTextMarkerSettings',
  'chart.ranges': 'chart.defaultRangeSettings',
  'gauge.bars': 'gauge.defaultPointerSettings',
  'gauge.markers': 'gauge.defaultPointerSettings',
  'gauge.needles': 'gauge.defaultPointerSettings',
  'gauge.knobs': 'gauge.defaultPointerSettings',
  'gauge.ranges': 'gauge.defaultRangeSettings',
  'gauge.axes': 'gauge.defaultAxisSettings',
  'gauge.scaleBars': 'gauge.defaultScaleBarSettings',
  'map.callouts': 'map.defaultCalloutSettings',
  // Quadrant chart
  'chart.quarters.rightTop.labels': 'chart.defaultQuarterSettings.defaultLabelSettings',
  'chart.quarters.leftTop.labels': 'chart.defaultQuarterSettings.defaultLabelSettings',
  'chart.quarters.leftBottom.labels': 'chart.defaultQuarterSettings.defaultLabelSettings',
  'chart.quarters.rightBottom.labels': 'chart.defaultQuarterSettings.defaultLabelSettings'
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
  'map.series': {
    defaults: 'map.defaultSeriesSettings',
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


/**
 * Default themes map for child entities that are using in lazy setup system
 *
 * @type {Object}
 */
anychart.themes.DefaultThemes = {
  'title': ['defaultFontSettings', 'defaultTitle'],
  'background': ['defaultBackground'],
  'legend': ['defaultFontSettings', 'defaultLegend'],
  'legendItem': ['defaultFontSettings'],
  'paginator': ['defaultFontSettings'],
  'separator': ['defaultSeparator'],
  'titleSeparator': ['defaultSeparator'],
  'tooltip': ['defaultFontSettings', 'defaultTooltip'],
  'labelsFactory': ['defaultFontSettings', 'defaultLabelFactory'],
  'markersFactory': ['defaultMarkerFactory'],
  'axis': ['defaultAxis'],
  'scroller': ['defaultScroller'],
  'thumbs': ['defaultScroller.thumbs']
};

anychart.themes.DefaultThemes['xScroller'] = anychart.themes.DefaultThemes['scroller'];
anychart.themes.DefaultThemes['yScroller'] = anychart.themes.DefaultThemes['scroller'];
anychart.themes.DefaultThemes['titleSeparator'] = anychart.themes.DefaultThemes['separator'];
