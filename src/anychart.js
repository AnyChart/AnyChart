/**
 * @fileoverview anychart namespace file.
 * @suppress {extraRequire}
 */

goog.provide('anychart');
goog.provide('anychart.gauges');
goog.provide('anychart.globalLock');
goog.require('acgraph');
goog.require('anychart.base');
goog.require('anychart.core.reporting');
goog.require('anychart.core.ui.StageCredits');
goog.require('anychart.performance');
goog.require('anychart.reflow.Measuriator');
goog.require('anychart.themes.merging');
goog.require('anychart.utils');
goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.dom.animationFrame.polyfill');
goog.require('goog.events.KeyEvent');
goog.require('goog.events.KeyHandler');
goog.require('goog.json.hybrid');

goog.forwardDeclare('anychart.core.Chart');

/**
 * Core space for all anychart components.
 * @namespace
 * @name anychart
 */


//----------------------------------------------------------------------------------------------------------------------
//
//  Graphics engine
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Drawing core namespace.
 * @namespace
 * @name anychart.graphics
 */
anychart.graphics = anychart.window['acgraph'];


/**
 * Get/Set global object.
 * @param {Window=} opt_value Global context.
 * @return {Window} .
 */
anychart.global = function(opt_value) {
  if (goog.isDef(opt_value)) {
    goog.global = opt_value;

    anychart.window = opt_value;
    anychart.document = opt_value['document'];
  }
  return goog.global;
};


/**
 * Experimental flag, not for public usage.
 * Initially implemented for DVF-4279 for gantt big data processing purposes.
 * DEV NOTE: do not describe for a while.
 * @type {boolean}
 * @private
 */
anychart.isAsync_ = false;


/**
 * Experimental setter of async mode.
 * @param {boolean=} opt_value - Value to set.
 * @return {boolean}
 */
anychart.isAsync = function(opt_value) {
  if (goog.isDef(opt_value)) {
    anychart.isAsync_ = opt_value;
  }
  return anychart.isAsync_;
};


/**
 * If the credits is allowed to be disabled for the stage regardless of the product key.
 * @type {boolean}
 */
acgraph.vector.Stage.prototype.allowCreditsDisabling = false;


/**
 * Stage credits.
 * @param {(Object|boolean|null)=} opt_value .
 * @return {!(acgraph.vector.Stage|anychart.core.ui.StageCredits)}
 */
acgraph.vector.Stage.prototype.credits = function(opt_value) {
  if (!this.credits_) {
    this.credits_ = new anychart.core.ui.StageCredits(this, this.allowCreditsDisabling);
    this.credits_.setup(anychart.getFlatTheme('stageCredits'));
  }
  if (goog.isDef(opt_value)) {
    this.credits_.setup(opt_value);
    return this;
  }
  return this.credits_;
};


// /**
//  * Original render function from the graphics stage.
//  * @type {Function}
//  * @private
//  */
// acgraph.vector.Stage.prototype.originalRender_ = acgraph.vector.Stage.prototype.renderInternal;
//
//
// /**
//  * Render internal override.
//  */
// acgraph.vector.Stage.prototype.renderInternal = function() {
//   this.originalRender_();
//   this.credits().render();
// };


//----------------------------------------------------------------------------------------------------------------------
//
//  Global lock
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * If the globalLock is locked.
 * @type {number}
 */
anychart.globalLock.locked = 0;


/**
 * An array of subscribers for the globalLock free.
 * @type {!Array.<Function>}
 */
anychart.globalLock.subscribers = [];


/**
 * Locks the globalLock. You should then free the lock. The lock should be freed the same number of times that it
 * was locked.
 */
anychart.globalLock.lock = function() {
  anychart.globalLock.locked++;
};


/**
 * Registers a callback for the globalLock free.
 * @param {!Function} handler Handler function.
 * @param {Object=} opt_context Handler context.
 */
anychart.globalLock.onUnlock = function(handler, opt_context) {
  if (anychart.globalLock.locked) {
    anychart.globalLock.subscribers.push(goog.bind(handler, opt_context));
  } else {
    handler.apply(opt_context);
  }
};


/**
 * Frees the lock and fires unlock callbacks if it was the last free.
 */
anychart.globalLock.unlock = function() {
  anychart.globalLock.locked--;
  if (!anychart.globalLock.locked) {
    var arr = anychart.globalLock.subscribers.slice(0);
    anychart.globalLock.subscribers.length = 0;
    for (var i = 0; i < arr.length; i++) {
      arr[i]();
    }
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  JSON
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * @type {Object}
 */
anychart.chartTypesMap = {};


/**
 * @type {Object}
 */
anychart.gaugeTypesMap = {};


/**
 * @type {Object}
 */
anychart.mapTypesMap = {};


/**
 * @type {Object}
 */
anychart.ganttTypesMap = {};


/**
 * @param {string} type
 * @return {anychart.core.Chart}
 */
anychart.createChartByType = function(type) {
  var cls = anychart.chartTypesMap[type];
  if (cls) {
    return /** @type {anychart.core.Chart} */(cls());
  } else {
    throw 'Unknown chart type: ' + type + '\nProbably it is in some other module, see module list for details.';
  }
};


/**
 * @param {string} type
 * @return {anychart.core.Chart}
 */
anychart.createGaugeByType = function(type) {
  var cls = anychart.gaugeTypesMap[type];
  if (cls) {
    return /** @type {anychart.core.Chart} */(cls());
  } else {
    throw 'Unknown gauge type: ' + type + '\nProbably it is in some other module, see module list for details.';
  }
};


/**
 * @param {string} type
 * @return {anychart.core.Chart}
 */
anychart.createMapByType = function(type) {
  var cls = anychart.mapTypesMap[type];
  if (cls) {
    return /** @type {anychart.core.Chart} */(cls());
  } else {
    throw 'Unknown map type: ' + type + '\nProbably it is in some other module, see module list for details.';
  }
};


/**
 * @param {string} type
 * @return {anychart.core.Chart}
 */
anychart.createGanttByType = function(type) {
  var cls = anychart.ganttTypesMap[type];
  if (cls) {
    return /** @type {anychart.core.Chart} */(cls());
  } else {
    throw 'Unknown gantt type: ' + type + '\nProbably it is in some other module, see module list for details.';
  }
};


/**
 * Creates an element by JSON config.
 * @example
 *  var json = {
 *    "chart": {
 *      "type": "pie",
 *      "data": [
 *        ["Product A", 1222],
 *        ["Product B", 2431],
 *        ["Product C", 3624]
 *      ]
 *    }
 *  };
 * var chart = anychart.fromJson(json);
 * chart.container('container').draw();
 * @param {(Object|string)} jsonConfig Config.
 * @return {*} Element created by config.
 */
anychart.fromJson = function(jsonConfig) {
  /**
   * Parsed json config.
   * @type {Object}
   */
  var json;
  if (goog.isString(jsonConfig)) {
    json = goog.json.hybrid.parse(jsonConfig);
  } else if (goog.isObject(jsonConfig) && !goog.isFunction(jsonConfig)) {
    json = jsonConfig;
  }

  var instance = null;

  if (json) {
    var chart = json['chart'];
    var gauge = json['gauge'];
    var gantt = json['gantt'];
    var map = json['map'];
    if (chart)
      instance = anychart.createChartByType(chart['type']);
    else if (gauge)
      instance = anychart.createGaugeByType(gauge['type']);
    else if (gantt) {
      if (gantt['type'] == 'project') //legacy
        gantt['type'] = anychart.enums.ChartTypes.GANTT_PROJECT;
      else if (gantt['type'] == 'resource')
        gantt['type'] = anychart.enums.ChartTypes.GANTT_RESOURCE;
      instance = anychart.createGanttByType(gantt['type']);
    } else if (map)
      instance = anychart.createMapByType(map['type']);
  }

  if (instance)
    instance.setupInternal(false, chart || gauge || gantt || map);
  else
    anychart.core.reporting.error(anychart.enums.ErrorCode.EMPTY_CONFIG);

  return instance;
};


/**
 * Creates an element by XML config.
 * @example
 * var xmlString = '<xml>' +
 *   '<chart type="pie" >' +
 *     '<data>' +
 *       '<point name="Product A" value="1222"/>' +
 *       '<point name="Product B" value="2431"/>' +
 *       '<point name="Product C" value="3624"/>' +
 *       '<point name="Product D" value="5243"/>' +
 *       '<point name="Product E" value="8813"/>' +
 *     '</data>' +
 *   '</chart>' +
 * '</xml>';
 * var chart = anychart.fromXml(xmlString);
 * chart.container('container').draw();
 * @param {string|Node} xmlConfig Config.
 * @return {*} Element created by config.
 */
anychart.fromXml = function(xmlConfig) {
  return anychart.fromJson(anychart.utils.xml2json(xmlConfig));
};
//----------------------------------------------------------------------------------------------------------------------
//
//  Default font settings
//
//----------------------------------------------------------------------------------------------------------------------
anychart.window['anychart'] = anychart.window['anychart'] || {};


/**
 * Default value for the font size.
 * @type {string|number}
 *
 */
//anychart.window['anychart']['fontSize'] = '12px';
anychart.window['anychart']['fontSize'] = '13px';


/**
 * Default value for the font color.
 * @type {string}
 *
 */
//anychart.window['anychart']['fontColor'] = '#000';
anychart.window['anychart']['fontColor'] = '#7c868e'; //colorAxisFont


/**
 * Default value for the font style.
 * @type {string}
 *
 */
//anychart.window['anychart']['fontFamily'] = 'Arial';
anychart.window['anychart']['fontFamily'] = "'Verdana', Helvetica, Arial, sans-serif";


/**
 * Default value for the text direction. Text direction may be left-to-right or right-to-left.
 * @type {string}
 *
 */
anychart.window['anychart']['textDirection'] = acgraph.vector.Text.Direction.LTR;


//endregion
//----------------------------------------------------------------------------------------------------------------------
//
//  Document load event.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * @type {Array.<Array>}
 * @private
 */
anychart.documentLoadCallbacks_;


/**
 * Add callback for the document load event.<br/>
 * It is fired when the entire page loads, including its content (images, css, scripts, etc.).
 * @param {Function} func Function which will be called on document load event.
 * @param {*=} opt_scope Function call context.
 */
anychart.onDocumentLoad = function(func, opt_scope) {
  if (!anychart.documentLoadCallbacks_) {
    anychart.documentLoadCallbacks_ = [];
  }
  anychart.documentLoadCallbacks_.push([func, opt_scope]);

  goog.events.listen(anychart.window, goog.events.EventType.LOAD, function() {
    for (var i = 0, count = anychart.documentLoadCallbacks_.length; i < count; i++) {
      var item = anychart.documentLoadCallbacks_[i];
      item[0].apply(item[1]);
    }
    anychart.documentLoadCallbacks_.length = 0;
  });
};


/**
 * Attaching DOM load events.
 * @private
 */
anychart.attachDomEvents_ = function() {
  var window = anychart.window;
  var document = anychart.document;

  // goog.events.EventType.DOMCONTENTLOADED - for browsers that support DOMContentLoaded event. IE9+
  // goog.events.EventType.READYSTATECHANGE - for IE9-
  acgraph.events.listen(document, [goog.events.EventType.DOMCONTENTLOADED, goog.events.EventType.READYSTATECHANGE], anychart.completed_, false);

  // A fallback to window.onload that will always work
  acgraph.events.listen(/** @type {EventTarget} */ (window), goog.events.EventType.LOAD, anychart.completed_, false);
};


/**
 * Detaching DOM load events.
 * @private
 */
anychart.detachDomEvents_ = function() {
  var window = anychart.window;
  var document = anychart.document;

  acgraph.events.unlisten(document, [goog.events.EventType.DOMCONTENTLOADED, goog.events.EventType.READYSTATECHANGE], anychart.completed_, false);
  acgraph.events.unlisten(/** @type {EventTarget} */ (window), goog.events.EventType.LOAD, anychart.completed_, false);
};


/**
 * Function called when one of [ DOMContentLoad , onreadystatechanged ] events fired on document or onload on window.
 * @param {goog.events.Event} event Event object.
 * @private
 */
anychart.completed_ = function(event) {
  var document = anychart.document;
  // readyState === "complete" is good enough for us to call the dom ready in oldIE
  if (document.addEventListener || anychart.window['event']['type'] === 'load' || document['readyState'] === 'complete') {
    anychart.detachDomEvents_();
    anychart.ready_(event);
  }
};


/**
 * Identifies that document is loaded.
 * @type {boolean}
 * @private
 */
anychart.isReady_ = false;


/**
 * Function called when document content loaded.
 * @private
 * @param {goog.events.Event} event Event object.
 * @return {*} Nothing if document already loaded or timeoutID.
 */
anychart.ready_ = function(event) {
  if (anychart.isReady_) {
    return;
  }

  var document = anychart.document;

  // Make sure the document body at least exists in case IE gets a little overzealous (ticket #5443).
  if (!document['body']) {
    return setTimeout(function() {
      anychart.ready_(event);
    }, 1);
  }

  anychart.isReady_ = true;

  for (var i = 0, count = anychart.documentReadyCallbacks_.length; i < count; i++) {
    var item = anychart.documentReadyCallbacks_[i];
    item[0].apply(item[1], [event]);
  }
};


/**
 * Add callback for document ready event.<br/>
 * It is called when the DOM is ready, this can happen prior to images and other external content is loaded.
 * @example <t>lineChart</t>
 * chart.spline([1.1, 1.4, 1.2, 1.9]);
 * @param {Function} func Function which will called on document load event.
 * @param {*=} opt_scope Function call context.
 */
anychart.onDocumentReady = function(func, opt_scope) {
  if (anychart.window['isNodeJS']) {
    anychart.isReady_ = true;
  }
  if (anychart.isReady_) {
    func.call(opt_scope);
  } else {
    if (!anychart.documentReadyCallbacks_) {
      anychart.documentReadyCallbacks_ = [];
    }
    anychart.documentReadyCallbacks_.push([func, opt_scope]);

    if (anychart.document['readyState'] === 'complete') {
      setTimeout(anychart.ready_, 1);
    } else {
      anychart.attachDomEvents_();
    }
  }
};


/**
 * License key.
 * @type {?string}
 * @private
 */
anychart.licenseKey_ = null;


/**
 * Setter for AnyChart license key.<br/>
 * To purchase a license proceed to <a href="http://www.anychart.com/buy/">Buy AnyChart</a> page.
 * @example
 * anychart.licenseKey('YOUR-LICENSE-KEY');
 * var chart = anychart.pie([1, 2, 3]);
 * chart.container(stage).draw();
 * @param {string=} opt_value Your licence key.
 * @return {?string} Current licence key.
 */
anychart.licenseKey = function(opt_value) {
  if (goog.isDef(opt_value)) {
    anychart.licenseKey_ = opt_value;
  }
  return anychart.licenseKey_;
};


/**
 * Method to get hash from string.
 * @return {boolean} Is key valid.
 */
anychart.isValidKey = function() {
  if (!goog.isDefAndNotNull(anychart.licenseKey_) || !goog.isString(anychart.licenseKey_)) return false;
  var lio = anychart.licenseKey_.lastIndexOf('-');
  var value = anychart.licenseKey_.substr(0, lio);
  var hashToCheck = anychart.licenseKey_.substr(lio + 1);
  return (hashToCheck == anychart.utils.crc32(value + anychart.utils.getSalt()));
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Themes.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Final array of themes json objects that will be applied for anychart globally.
 * @type {Array.<Object>}
 * @private
 */
anychart.themes_ = [];


/**
 * Array of addinional themes that will be applied for anychart globally.
 * @type {Array.<Object>}
 * @private
 */
anychart.additionalThemes_ = [];


/**
 * Clones of themes, where i-th clone corresponds to (i-1)-th theme and 0 clone is a default theme clone.
 * @type {Array.<!Object>}
 * @private
 */
anychart.themeClones_ = [];


/**
 * Merged clones of themes.
 * @type {Array.<!Object>}
 * @private
 */
anychart.mergedThemeClones_ = [];


/**
 * Returns current global themes array
 *
 * @return {Array.<Object>}
 */
anychart.getThemes = function() {
  if (!anychart.themes_.length) {
    anychart.themes_ = [anychart.window['anychart']['themes'][anychart.DEFAULT_THEME] || {}];

    if (anychart.additionalThemes_.length)
      anychart.themes_ = goog.array.concat(anychart.themes_, anychart.additionalThemes_);
  }

  return anychart.themes_;
};


/**
 * Sets the theme/themes for anychart globally or gets current theme/themes.
 * @param {?(string|Object|Array<string|Object>)=} opt_value Object/name of a theme or array of objects/names of the themes.
 * @return {string|Object|Array<string|Object>}
 */
anychart.theme = function(opt_value) {
  if (goog.isDef(opt_value)) {
    anychart.additionalThemes_.length = 0;

    if (opt_value) {
      if (goog.isArray(opt_value)) {
        for (var i = 0; i < opt_value.length; i++) {
          anychart.appendTheme(opt_value[i]);
        }
      } else
        anychart.appendTheme(opt_value);
    }

    anychart.themes_.length = 0;
    anychart.themeClones_.length = 0;
    anychart.mergedThemeClones_.length = 0;
    anychart.themes.merging.clearCache();
  }
  return anychart.additionalThemes_;
};


/**
 * Append theme for anychart globally.
 * @param {string|Object} value
 */
anychart.appendTheme = function(value) {
  var clone = goog.isString(value) ? anychart.utils.recursiveClone(/** @type {Object} */(anychart.window['anychart']['themes'][value])) : value;
  anychart.additionalThemes_.push(/** @type {Object} */(clone));

  anychart.themes_.length = 0;
};


/**
 * Returns final flattened theme object.
 *
 * @param {string} themePath Theme name (path) to get flattened
 * @param {Object=} opt_flatTheme Base flat theme object to collect flattened settings
 * @param {Function=} opt_resolver Function to resolve special theme values
 * @return {Object} Result flattened theme object
 */
anychart.getFlatTheme = function(themePath, opt_flatTheme, opt_resolver) {
  opt_flatTheme = goog.isDef(opt_flatTheme) ? opt_flatTheme : {};
  var splitPath = themePath.split('.');
  var themes = anychart.getThemes();
  var part;

  for (var t = 0; t < themes.length; t++) {
    var theme = themes[t];
    for (var j = 0; j < splitPath.length; j++) {
      if (theme) {
        part = splitPath[j];
        theme = theme[part];
      }
    }

    if (goog.isDef(theme)) {
      if (goog.typeOf(theme) == 'object') {
        anychart.utils.normalizeTheme(theme);
      } else {
        if (goog.isFunction(opt_resolver))
          theme = opt_resolver(theme);
        else if (goog.isBoolean(theme))
          theme = {'enabled': theme};
        else
          theme = null;
      }

      if (theme)
        goog.mixin(opt_flatTheme, theme);
    }
  }

  return opt_flatTheme;
};


/**
 * Returns final compiled and merged theme. Pass root name to compile the theme
 * partially.
 * @param {string} root
 * @return {*}
 */
anychart.getFullTheme = function(root) {
  root = anychart.utils.toCamelCase(root);
  anychart.performance.start('Theme compilation');
  var i;
  if (!anychart.themeClones_.length) {
    anychart.themeClones_.push(anychart.window['anychart']['themes'][anychart.DEFAULT_THEME] || {});
    anychart.mergedThemeClones_.push(anychart.themeClones_[0]);
  }
  for (i = anychart.themeClones_.length - 1; i < anychart.additionalThemes_.length; i++) {
    var themeToMerge = anychart.additionalThemes_[i];
    var clone = anychart.utils.recursiveClone(goog.isString(themeToMerge) ? anychart.window['anychart']['themes'][themeToMerge] : themeToMerge);
    anychart.themeClones_.push(goog.isObject(clone) ? clone : {});
    anychart.mergedThemeClones_.push({});
  }

  var startMergeAt = Infinity;
  for (i = 0; i < anychart.themeClones_.length; i++) {
    if (anychart.themes.merging.compileTheme(anychart.themeClones_[i], root, i))
      startMergeAt = Math.min(startMergeAt, i);
  }

  for (i = Math.max(1, startMergeAt); i < anychart.mergedThemeClones_.length; i++) {
    var rootParts = root.split('.');
    anychart.themes.merging.setThemePart(
        anychart.mergedThemeClones_[i],
        [rootParts[0]],
        anychart.themes.merging.merge(
            anychart.utils.recursiveClone(anychart.themes.merging.getThemePart(anychart.themeClones_[i], rootParts[0])),
            anychart.themes.merging.getThemePart(anychart.mergedThemeClones_[i - 1], rootParts[0])));

    anychart.themes.merging.markMergedDescriptor(root, i);
  }
  anychart.performance.end('Theme compilation');

  return anychart.themes.merging.getThemePart(anychart.mergedThemeClones_[anychart.mergedThemeClones_.length - 1], root);
};


//region -- Measuriator.
/**
 * Shared measuriator.
 * @type {anychart.reflow.Measuriator}
 */
anychart.measuriator = new anychart.reflow.Measuriator();


//endregion


// we execute it here to move load from first chart drawing to library initialization phase.
// setTimeout(anychart.getFullTheme, 0);


//region --- Patches for missing features
//------------------------------------------------------------------------------
//
//  Patches for missing features
//
//------------------------------------------------------------------------------
/**
 * Creates error reporter for NO_FEATURE_IN_MODULE.
 * @param {string} featureName
 * @param {boolean=} opt_ifNotFromTheme
 * @return {!Function}
 */
anychart.createNFIMError = function(featureName, opt_ifNotFromTheme) {
  return function(opt_fromTheme) {
    if (!opt_ifNotFromTheme || !opt_fromTheme) {
      anychart.core.reporting.error(anychart.enums.ErrorCode.NO_FEATURE_IN_MODULE, null, [featureName]);
    }
  };
};


/**
 * @param {string} modulePath
 * @param {string} error
 * @param {boolean=} opt_ifNotFromTheme
 * @return {!Function}
 */
anychart.getFeatureOrError = function(modulePath, error, opt_ifNotFromTheme) {
  var path = modulePath.split('.');
  var target = anychart.window;
  for (var i = 0; i < path.length; i++) {
    target = target[path[i]];
    if (!target) return anychart.createNFIMError(error, opt_ifNotFromTheme);
  }
  return /** @type {!Function} */(target);
};


/**
 * @param {Object} proto
 * @param {string} methodName
 * @param {string} error
 * @return {!Function}
 */
anychart.getMethodOrError = function(proto, methodName, error) {
  var target = /** @type {Function} */(proto[methodName]);
  return target ? target : anychart.createNFIMError(error);
};


//endregion
//region ------- Charts tracking


/**
 * Container for tracking charts.
 * @type {Object<string, anychart.core.Chart>}
 * @private
 */
anychart.trackedCharts_ = {};


/**
 * Returns tracking chart by it's id.
 * @param {!string} id
 * @return {?anychart.core.Chart}
 */
anychart.getChartById = function(id) {
  return anychart.trackedCharts_[id];
};


/**
 *
 * @param {anychart.core.Chart} chart
 * @param {!string} newId
 * @param {string=} opt_oldId
 * @return {boolean}
 */
anychart.trackChart = function(chart, newId, opt_oldId) {
  if (anychart.trackedCharts_[newId] && anychart.trackedCharts_[newId] != chart) {
    anychart.core.reporting.warning(anychart.enums.WarningCode.OBJECT_KEY_COLLISION, null, [newId], true);
    return false;
  }

  if (goog.isDef(opt_oldId))
    anychart.untrackChart(chart, /** @type {string} */(opt_oldId));

  anychart.trackedCharts_[newId] = chart;
  return true;
};


/**
 *
 * @param {anychart.core.Chart} chart
 * @param {string} oldId
 * @return {boolean}
 */
anychart.untrackChart = function(chart, oldId) {
  if (anychart.trackedCharts_[oldId] && anychart.trackedCharts_[oldId] == chart) {
    delete anychart.trackedCharts_[oldId];
    return true;
  }

  return false;
};


//endregion


if (COMPILED) {
  goog.dom.animationFrame.polyfill.install();
} else {
  anychart.onDocumentReady(function() {
    goog.dom.animationFrame.polyfill.install();
  });
}


//exports
goog.exportSymbol('anychart.graphics', anychart.graphics);//import
goog.exportSymbol('anychart.fromJson', anychart.fromJson);//doc|ex
goog.exportSymbol('anychart.fromXml', anychart.fromXml);//doc|ex
goog.exportSymbol('anychart.onDocumentLoad', anychart.onDocumentLoad);//doc|need-ex
goog.exportSymbol('anychart.onDocumentReady', anychart.onDocumentReady);//doc|ex
goog.exportSymbol('anychart.licenseKey', anychart.licenseKey);//doc|ex
goog.exportSymbol('anychart.theme', anychart.theme);
goog.exportSymbol('anychart.appendTheme', anychart.appendTheme);
goog.exportSymbol('anychart.global', anychart.global);
goog.exportSymbol('anychart.getChartById', anychart.getChartById);
goog.exportSymbol('anychart.isAsync', anychart.isAsync);
goog.exportSymbol('anychart.area', anychart.getFeatureOrError('anychart.area', 'Area chart'));
goog.exportSymbol('anychart.area3d', anychart.getFeatureOrError('anychart.area3d', '3D Area chart'));
goog.exportSymbol('anychart.bar', anychart.getFeatureOrError('anychart.bar', 'Bar chart'));
goog.exportSymbol('anychart.vertical', anychart.getFeatureOrError('anychart.vertical', 'Bar chart'));
goog.exportSymbol('anychart.bar3d', anychart.getFeatureOrError('anychart.bar3d', '3D Bar chart'));
goog.exportSymbol('anychart.bubble', anychart.getFeatureOrError('anychart.bubble', 'Bubble chart'));
goog.exportSymbol('anychart.bullet', anychart.getFeatureOrError('anychart.bullet', 'Bullet chart'));
goog.exportSymbol('anychart.cartesian', anychart.getFeatureOrError('anychart.cartesian', 'Cartesian chart'));
goog.exportSymbol('anychart.cartesian3d', anychart.getFeatureOrError('anychart.cartesian3d', '3D Cartesian chart'));
goog.exportSymbol('anychart.scatter', anychart.getFeatureOrError('anychart.scatter', 'Scatter chart'));
goog.exportSymbol('anychart.stick', anychart.getFeatureOrError('anychart.stick', 'Stick chart'));
goog.exportSymbol('anychart.jumpLine', anychart.getFeatureOrError('anychart.jumpLine', 'JumpLine chart'));
goog.exportSymbol('anychart.stepLine', anychart.getFeatureOrError('anychart.stepLine', 'StepLine chart'));
goog.exportSymbol('anychart.ohlc', anychart.getFeatureOrError('anychart.ohlc', 'OHLC chart'));
goog.exportSymbol('anychart.candlestick', anychart.getFeatureOrError('anychart.candlestick', 'Candlestick chart'));
goog.exportSymbol('anychart.column', anychart.getFeatureOrError('anychart.column', 'Column chart'));
goog.exportSymbol('anychart.column3d', anychart.getFeatureOrError('anychart.column3d', '3D Column chart'));
goog.exportSymbol('anychart.box', anychart.getFeatureOrError('anychart.box', 'Box chart'));
goog.exportSymbol('anychart.financial', anychart.getFeatureOrError('anychart.financial', 'Financial chart'));
goog.exportSymbol('anychart.funnel', anychart.getFeatureOrError('anychart.funnel', 'Funnel chart'));
goog.exportSymbol('anychart.line', anychart.getFeatureOrError('anychart.line', 'Line chart'));
goog.exportSymbol('anychart.verticalLine', anychart.getFeatureOrError('anychart.verticalLine', 'Vertical Line chart'));
goog.exportSymbol('anychart.verticalArea', anychart.getFeatureOrError('anychart.verticalArea', 'Vertical Area chart'));
goog.exportSymbol('anychart.marker', anychart.getFeatureOrError('anychart.marker', 'Marker chart'));
goog.exportSymbol('anychart.sunburst', anychart.getFeatureOrError('anychart.sunburst', 'Sunburst chart'));
goog.exportSymbol('anychart.pie', anychart.getFeatureOrError('anychart.pie', 'Pie chart'));
goog.exportSymbol('anychart.pie3d', anychart.getFeatureOrError('anychart.pie3d', '3D Pie chart'));
goog.exportSymbol('anychart.pyramid', anychart.getFeatureOrError('anychart.pyramid', 'Pyramid chart'));
goog.exportSymbol('anychart.radar', anychart.getFeatureOrError('anychart.radar', 'Radar chart'));
goog.exportSymbol('anychart.polar', anychart.getFeatureOrError('anychart.polar', 'Polar chart'));
goog.exportSymbol('anychart.pert', anychart.getFeatureOrError('anychart.pert', 'Pert chart'));
goog.exportSymbol('anychart.sparkline', anychart.getFeatureOrError('anychart.sparkline', 'Sparkline chart'));
goog.exportSymbol('anychart.heatMap', anychart.getFeatureOrError('anychart.heatMap', 'HeatMap chart'));
goog.exportSymbol('anychart.gauges.circular', anychart.getFeatureOrError('anychart.gauges.circular', 'Circular gauge'));
goog.exportSymbol('anychart.gauges.linear', anychart.getFeatureOrError('anychart.gauges.linear', 'Linear gauge'));
goog.exportSymbol('anychart.gauges.tank', anychart.getFeatureOrError('anychart.gauges.tank', 'Tank gauge'));
goog.exportSymbol('anychart.gauges.thermometer', anychart.getFeatureOrError('anychart.gauges.thermometer', 'Thermometer gauge'));
goog.exportSymbol('anychart.gauges.led', anychart.getFeatureOrError('anychart.gauges.led', 'LED gauge'));
goog.exportSymbol('anychart.map', anychart.getFeatureOrError('anychart.map', 'Map'));
goog.exportSymbol('anychart.choropleth', anychart.getFeatureOrError('anychart.choropleth', 'Choropleth map'));
goog.exportSymbol('anychart.bubbleMap', anychart.getFeatureOrError('anychart.bubbleMap', 'Bubble map'));
goog.exportSymbol('anychart.connector', anychart.getFeatureOrError('anychart.connector', 'Connector map'));
goog.exportSymbol('anychart.markerMap', anychart.getFeatureOrError('anychart.markerMap', 'Marker map'));
goog.exportSymbol('anychart.seatMap', anychart.getFeatureOrError('anychart.seatMap', 'Seat map'));
goog.exportSymbol('anychart.ganttProject', anychart.getFeatureOrError('anychart.ganttProject', 'Gantt Project chart'));
goog.exportSymbol('anychart.ganttResource', anychart.getFeatureOrError('anychart.ganttResource', 'Gantt Resource chart'));
goog.exportSymbol('anychart.stock', anychart.getFeatureOrError('anychart.stock', 'Stock chart'));
goog.exportSymbol('anychart.treeMap', anychart.getFeatureOrError('anychart.treeMap', 'TreeMap chart'));
goog.exportSymbol('anychart.pareto', anychart.getFeatureOrError('anychart.pareto', 'Pareto chart'));
goog.exportSymbol('anychart.resource', anychart.getFeatureOrError('anychart.resource', 'Resource chart'));
goog.exportSymbol('anychart.quadrant', anychart.getFeatureOrError('anychart.quadrant', 'Quadrant chart'));
goog.exportSymbol('anychart.venn', anychart.getFeatureOrError('anychart.venn', 'Venn chart'));
goog.exportSymbol('anychart.tagCloud', anychart.getFeatureOrError('anychart.tagCloud', 'TagCloud chart'));
goog.exportSymbol('anychart.timeline', anychart.getFeatureOrError('anychart.timeline', 'Timeline chart'));
goog.exportSymbol('anychart.mekko', anychart.getFeatureOrError('anychart.mekko', 'Mekko chart'));
goog.exportSymbol('anychart.mosaic', anychart.getFeatureOrError('anychart.mosaic', 'Mosaic chart'));
goog.exportSymbol('anychart.barmekko', anychart.getFeatureOrError('anychart.barmekko', 'Barmekko chart'));
goog.exportSymbol('anychart.waterfall', anychart.getFeatureOrError('anychart.waterfall', 'Waterfall chart'));
goog.exportSymbol('anychart.wordtree', anychart.getFeatureOrError('anychart.wordtree', 'Wordtree chart'));
goog.exportSymbol('anychart.sankey', anychart.getFeatureOrError('anychart.sankey', 'Sankey chart'));
goog.exportSymbol('anychart.surface', anychart.getFeatureOrError('anychart.surface', 'Surface chart'));
goog.exportSymbol('anychart.graph', anychart.getFeatureOrError('anychart.graph', 'Graph chart'));
goog.exportSymbol('anychart.standalones.background', anychart.getFeatureOrError('anychart.standalones.background', 'anychart.standalones.Background'));
goog.exportSymbol('anychart.standalones.colorRange', anychart.getFeatureOrError('anychart.standalones.colorRange', 'anychart.standalones.ColorRange'));
goog.exportSymbol('anychart.standalones.dataGrid', anychart.getFeatureOrError('anychart.standalones.dataGrid', 'anychart.standalones.DataGrid'));
goog.exportSymbol('anychart.standalones.label', anychart.getFeatureOrError('anychart.standalones.label', 'anychart.standalones.Label'));
goog.exportSymbol('anychart.standalones.labelsFactory', anychart.getFeatureOrError('anychart.standalones.labelsFactory', 'anychart.standalones.LabelsFactory'));
goog.exportSymbol('anychart.standalones.legend', anychart.getFeatureOrError('anychart.standalones.legend', 'anychart.standalones.Legend'));
goog.exportSymbol('anychart.standalones.markersFactory', anychart.getFeatureOrError('anychart.standalones.markersFactory', 'anychart.standalones.MarkersFactory'));
goog.exportSymbol('anychart.standalones.projectTimeline', anychart.getFeatureOrError('anychart.standalones.projectTimeline', 'anychart.standalones.ProjectTimeline'));
goog.exportSymbol('anychart.standalones.resourceTimeline', anychart.getFeatureOrError('anychart.standalones.resourceTimeline', 'anychart.standalones.ResourceTimeline'));
goog.exportSymbol('anychart.standalones.resourceList', anychart.getFeatureOrError('anychart.standalones.resourceList', 'anychart.standalones.ResourceList'));
goog.exportSymbol('anychart.standalones.scroller', anychart.getFeatureOrError('anychart.standalones.scroller', 'anychart.standalones.scroller'));
goog.exportSymbol('anychart.standalones.table', anychart.getFeatureOrError('anychart.standalones.table', 'anychart.standalones.Table'));
goog.exportSymbol('anychart.standalones.title', anychart.getFeatureOrError('anychart.standalones.title', 'anychart.standalones.Title'));
goog.exportSymbol('anychart.standalones.axes.linear', anychart.getFeatureOrError('anychart.standalones.axes.linear', 'anychart.standalones.axes.Linear'));
goog.exportSymbol('anychart.standalones.axes.polar', anychart.getFeatureOrError('anychart.standalones.axes.polar', 'anychart.standalones.axes.Polar'));
goog.exportSymbol('anychart.standalones.axes.radar', anychart.getFeatureOrError('anychart.standalones.axes.radar', 'anychart.standalones.axes.Radar'));
goog.exportSymbol('anychart.standalones.axes.radial', anychart.getFeatureOrError('anychart.standalones.axes.radial', 'anychart.standalones.axes.Radial'));
goog.exportSymbol('anychart.standalones.axisMarkers.line', anychart.getFeatureOrError('anychart.standalones.axisMarkers.line', 'anychart.standalones.axisMarkers.Line'));
goog.exportSymbol('anychart.standalones.axisMarkers.range', anychart.getFeatureOrError('anychart.standalones.axisMarkers.range', 'anychart.standalones.axisMarkers.Range'));
goog.exportSymbol('anychart.standalones.axisMarkers.text', anychart.getFeatureOrError('anychart.standalones.axisMarkers.text', 'anychart.standalones.axisMarkers.Text'));
goog.exportSymbol('anychart.standalones.grids.linear', anychart.getFeatureOrError('anychart.standalones.grids.linear', 'anychart.standalones.grids.Linear'));
goog.exportSymbol('anychart.standalones.grids.linear3d', anychart.getFeatureOrError('anychart.standalones.grids.linear3d', 'anychart.standalones.grids.Linear3d'));
goog.exportSymbol('anychart.standalones.grids.polar', anychart.getFeatureOrError('anychart.standalones.grids.polar', 'anychart.standalones.grids.Polar'));
goog.exportSymbol('anychart.standalones.grids.radar', anychart.getFeatureOrError('anychart.standalones.grids.radar', 'anychart.standalones.grids.Radar'));
goog.exportSymbol('anychart.ui.contextMenu', anychart.getFeatureOrError('anychart.ui.contextMenu', 'Context Menu', true));
goog.exportSymbol('anychart.ui.ganttToolbar', anychart.getFeatureOrError('anychart.ui.ganttToolbar', 'Gantt toolbar'));
goog.exportSymbol('anychart.ui.preloader', anychart.getFeatureOrError('anychart.ui.preloader', 'Preloader'));
goog.exportSymbol('anychart.ui.rangePicker', anychart.getFeatureOrError('anychart.ui.rangePicker', 'Range picker'));
goog.exportSymbol('anychart.ui.rangeSelector', anychart.getFeatureOrError('anychart.ui.rangeSelector', 'Range selector'));
goog.exportSymbol('anychart.ui.zoom', anychart.getFeatureOrError('anychart.ui.zoom', 'Zoom control'));
goog.exportSymbol('anychart.ui.binding.exec', anychart.getFeatureOrError('anychart.ui.binding.exec', 'UI binding'));
goog.exportSymbol('anychart.ui.binding.init', anychart.getFeatureOrError('anychart.ui.binding.init', 'UI binding'));
goog.exportSymbol('anychart.fromXmlFile', anychart.getFeatureOrError('anychart.fromXmlFile', 'Data adapter'));
goog.exportSymbol('anychart.fromJsonFile', anychart.getFeatureOrError('anychart.fromJsonFile', 'Data adapter'));
goog.exportSymbol('anychart.data.parseHtmlTable', anychart.getFeatureOrError('anychart.data.parseHtmlTable', 'Data adapter'));
goog.exportSymbol('anychart.data.loadJsonFile', anychart.getFeatureOrError('anychart.data.loadJsonFile', 'Data adapter'));
goog.exportSymbol('anychart.data.loadXmlFile', anychart.getFeatureOrError('anychart.data.loadXmlFile', 'Data adapter'));
goog.exportSymbol('anychart.data.loadCsvFile', anychart.getFeatureOrError('anychart.data.loadCsvFile', 'Data adapter'));
goog.exportSymbol('anychart.data.loadGoogleSpreadsheet', anychart.getFeatureOrError('anychart.data.loadGoogleSpreadsheet', 'Data adapter'));
(function() {
  var proto = acgraph.vector.Stage.prototype;
  proto['credits'] = proto.credits;
  proto['saveAsPNG'] = anychart.getMethodOrError(proto, 'saveAsPng', 'Exporting');
  proto['saveAsJPG'] = anychart.getMethodOrError(proto, 'saveAsJpg', 'Exporting');
  proto['saveAsPDF'] = anychart.getMethodOrError(proto, 'saveAsPdf', 'Exporting');
  proto['saveAsSVG'] = anychart.getMethodOrError(proto, 'saveAsSvg', 'Exporting');
  proto['saveAsPng'] = anychart.getMethodOrError(proto, 'saveAsPng', 'Exporting');
  proto['saveAsJpg'] = anychart.getMethodOrError(proto, 'saveAsJpg', 'Exporting');
  proto['saveAsPdf'] = anychart.getMethodOrError(proto, 'saveAsPdf', 'Exporting');
  proto['saveAsSvg'] = anychart.getMethodOrError(proto, 'saveAsSvg', 'Exporting');
  proto['shareAsPng'] = anychart.getMethodOrError(proto, 'shareAsPng', 'Exporting');
  proto['shareAsJpg'] = anychart.getMethodOrError(proto, 'shareAsJpg', 'Exporting');
  proto['shareAsPdf'] = anychart.getMethodOrError(proto, 'shareAsPdf', 'Exporting');
  proto['shareAsSvg'] = anychart.getMethodOrError(proto, 'shareAsSvg', 'Exporting');
  proto['getPngBase64String'] = anychart.getMethodOrError(proto, 'getPngBase64String', 'Exporting');
  proto['getJpgBase64String'] = anychart.getMethodOrError(proto, 'getJpgBase64String', 'Exporting');
  proto['getSvgBase64String'] = anychart.getMethodOrError(proto, 'getSvgBase64String', 'Exporting');
  proto['getPdfBase64String'] = anychart.getMethodOrError(proto, 'getPdfBase64String', 'Exporting');
  proto['print'] = anychart.getMethodOrError(proto, 'print', 'Exporting');
  proto['toSvg'] = anychart.getMethodOrError(proto, 'toSvg', 'Exporting');
})();
