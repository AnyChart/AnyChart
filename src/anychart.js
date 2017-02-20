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
goog.require('anychart.standalones');
goog.require('anychart.standalones.axes');
goog.require('anychart.standalones.axisMarkers');
goog.require('anychart.standalones.grids');
goog.require('anychart.themes.merging');
goog.require('anychart.ui');
goog.require('anychart.utils');
goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.dom.animationFrame.polyfill');
goog.require('goog.events.KeyEvent');
goog.require('goog.events.KeyHandler');
goog.require('goog.json.hybrid');

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
anychart.graphics = goog.global['acgraph'];


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
    this.credits_.setup(anychart.getFullTheme('stageCredits'));
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


/**
 Sets and returns an address export server script, which is used to export to an image
 or PDF.
 @see acgraph.vector.Stage#saveAsPdf
 @see acgraph.vector.Stage#saveAsPng
 @see acgraph.vector.Stage#saveAsJpg
 @see acgraph.vector.Stage#saveAsSvg
 @param {string=} opt_address Export server script URL.
 @return {string} Export server script URL.
 @deprecated Since 7.10.1. Use anychart.exports.server() instead.
 */
anychart.server = function(opt_address) {
  anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null, ['anychart.server()', 'anychart.exports.server()', null, 'Function'], true);
  return anychart.exports.server(opt_address);
};


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
    instance.setupByVal(chart || gauge || gantt || map);
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
goog.global['anychart'] = goog.global['anychart'] || {};


/**
 * Default value for the font size.
 * @type {string|number}
 *
 */
//goog.global['anychart']['fontSize'] = '12px';
goog.global['anychart']['fontSize'] = '13px';


/**
 * Default value for the font color.
 * @type {string}
 *
 */
//goog.global['anychart']['fontColor'] = '#000';
goog.global['anychart']['fontColor'] = '#7c868e'; //colorAxisFont


/**
 * Default value for the font style.
 * @type {string}
 *
 */
//goog.global['anychart']['fontFamily'] = 'Arial';
goog.global['anychart']['fontFamily'] = "'Verdana', Helvetica, Arial, sans-serif";


/**
 * Default value for the text direction. Text direction may be left-to-right or right-to-left.
 * @type {string}
 *
 */
goog.global['anychart']['textDirection'] = acgraph.vector.Text.Direction.LTR;
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

  goog.events.listen(goog.global, goog.events.EventType.LOAD, function() {
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
  var window = goog.global;
  var document = window['document'];

  // goog.events.EventType.DOMCONTENTLOADED - for browsers that support DOMContentLoaded event. IE9+
  // goog.events.EventType.READYSTATECHANGE - for IE9-
  acgraph.events.listen(document, [goog.events.EventType.DOMCONTENTLOADED, goog.events.EventType.READYSTATECHANGE], anychart.completed_, false);

  // A fallback to window.onload that will always work
  acgraph.events.listen(/** @type {EventTarget}*/ (window), goog.events.EventType.LOAD, anychart.completed_, false);
};


/**
 * Detaching DOM load events.
 * @private
 */
anychart.detachDomEvents_ = function() {
  var window = goog.global;
  var document = window['document'];

  acgraph.events.unlisten(document, [goog.events.EventType.DOMCONTENTLOADED, goog.events.EventType.READYSTATECHANGE], anychart.completed_, false);
  acgraph.events.unlisten(/** @type {EventTarget}*/ (window), goog.events.EventType.LOAD, anychart.completed_, false);
};


/**
 * Function called when one of [ DOMContentLoad , onreadystatechanged ] events fired on document or onload on window.
 * @param {goog.events.Event} event Event object.
 * @private
 */
anychart.completed_ = function(event) {
  var document = goog.global['document'];
  // readyState === "complete" is good enough for us to call the dom ready in oldIE
  if (document.addEventListener || window['event']['type'] === 'load' || document['readyState'] === 'complete') {
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

  var document = goog.global['document'];

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
  if (anychart.isReady_) {
    func.call(opt_scope);
  }

  if (!anychart.documentReadyCallbacks_) {
    anychart.documentReadyCallbacks_ = [];
  }
  anychart.documentReadyCallbacks_.push([func, opt_scope]);

  var document = goog.global['document'];

  if (document['readyState'] === 'complete') {
    setTimeout(anychart.ready_, 1);
  } else {
    anychart.attachDomEvents_();
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
 * Array of themes that will be applied for anychart globally.
 * @type {Array<string|Object>}
 * @private
 */
anychart.themes_ = [];


/**
 * Clones of themes, where i-th clone corresponds to (i-1)-th theme and 0 clone is a default theme clone.
 * @type {Array.<!Object>}
 * @private
 */
anychart.themeClones_ = [];


/**
 * Sets the theme/themes for anychart globally or gets current theme/themes.
 * @param {?(string|Object|Array<string|Object>)=} opt_value Object/name of a theme or array of objects/names of the themes.
 * @return {string|Object|Array<string|Object>}
 */
anychart.theme = function(opt_value) {
  if (goog.isDef(opt_value)) {
    anychart.themes_ = opt_value ? (goog.isArray(opt_value) ? opt_value : [opt_value]) : [];
    anychart.themeClones_.length = 0;
    anychart.themes.merging.clearCache();
  }
  return anychart.themes_;
};


/**
 * Append theme for anychart globally.
 * @param {string|Object} value
 */
anychart.appendTheme = function(value) {
  anychart.themes_.push(value);
};


/**
 * Returns final compiled and merged theme. Pass root name to compile the theme
 * partially.
 * @param {string} root
 * @return {*}
 */
anychart.getFullTheme = function(root) {
  anychart.performance.start('Theme compilation');
  var i;
  if (!anychart.themeClones_.length) {
    anychart.themeClones_.push(goog.global['anychart']['themes'][anychart.DEFAULT_THEME] || {});
  }
  for (i = anychart.themeClones_.length - 1; i < anychart.themes_.length; i++) {
    var themeToMerge = anychart.themes_[i];
    var clone = anychart.utils.recursiveClone(goog.isString(themeToMerge) ? goog.global['anychart']['themes'][themeToMerge] : themeToMerge);
    anychart.themeClones_.push(goog.isObject(clone) ? clone : {});
  }
  var startMergeAt = Infinity;
  for (i = 0; i < anychart.themeClones_.length; i++) {
    if (anychart.themes.merging.compileTheme(anychart.themeClones_[i], root, i))
      startMergeAt = Math.min(startMergeAt, i);
  }
  for (i = Math.max(1, startMergeAt); i < anychart.themeClones_.length; i++) {
    // theme clones are guaranteed to be objects, so we can skip replacing them
    anychart.themes.merging.merge(anychart.themeClones_[i], anychart.themeClones_[i - 1]);
  }
  anychart.performance.end('Theme compilation');
  return anychart.themes.merging.getThemePart(anychart.themeClones_[anychart.themeClones_.length - 1], root);
};


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
 * @return {Function}
 */
anychart.createNFIMError = function(featureName) {
  return function() {
    anychart.core.reporting.error(anychart.enums.ErrorCode.NO_FEATURE_IN_MODULE, null, [featureName]);
  };
};


/** @ignoreDoc */
anychart.area = anychart.area || anychart.createNFIMError('Area chart');


/** @ignoreDoc */
anychart.area3d = anychart.area3d || anychart.createNFIMError('3D Area chart');


/** @ignoreDoc */
anychart.bar = anychart.bar || anychart.createNFIMError('Bar chart');


/** @ignoreDoc */
anychart.bar3d = anychart.bar3d || anychart.createNFIMError('3D Bar chart');


/** @ignoreDoc */
anychart.bubble = anychart.bubble || anychart.createNFIMError('Bubble chart');


/** @ignoreDoc */
anychart.bullet = anychart.bullet || anychart.createNFIMError('Bullet chart');


/** @ignoreDoc */
anychart.cartesian = anychart.cartesian || anychart.createNFIMError('Cartesian chart');


/** @ignoreDoc */
anychart.cartesian3d = anychart.cartesian3d || anychart.createNFIMError('3D Cartesian chart');


/** @ignoreDoc */
anychart.scatter = anychart.scatter || anychart.createNFIMError('Scatter chart');


/** @ignoreDoc */
anychart.column = anychart.column || anychart.createNFIMError('Column chart');


/** @ignoreDoc */
anychart.column3d = anychart.column3d || anychart.createNFIMError('3D Column chart');


/** @ignoreDoc */
anychart.box = anychart.box || anychart.createNFIMError('Box chart');


/** @ignoreDoc */
anychart.financial = anychart.financial || anychart.createNFIMError('Financial chart');


/** @ignoreDoc */
anychart.funnel = anychart.funnel || anychart.createNFIMError('Funnel chart');


/** @ignoreDoc */
anychart.line = anychart.line || anychart.createNFIMError('Line chart');


/** @ignoreDoc */
anychart.verticalLine = anychart.verticalLine || anychart.createNFIMError('Vertical Line chart');


/** @ignoreDoc */
anychart.verticalArea = anychart.verticalArea || anychart.createNFIMError('Vertical Area chart');


/** @ignoreDoc */
anychart.marker = anychart.marker || anychart.createNFIMError('Marker chart');


/** @ignoreDoc */
anychart.pie = anychart.pie || anychart.createNFIMError('Pie chart');


/** @ignoreDoc */
anychart.pie3d = anychart.pie3d || anychart.createNFIMError('3D Pie chart');


/** @ignoreDoc */
anychart.pyramid = anychart.pyramid || anychart.createNFIMError('Pyramid chart');


/** @ignoreDoc */
anychart.radar = anychart.radar || anychart.createNFIMError('Radar chart');


/** @ignoreDoc */
anychart.polar = anychart.polar || anychart.createNFIMError('Polar chart');


/** @ignoreDoc */
anychart.sparkline = anychart.sparkline || anychart.createNFIMError('Sparkline chart');


/** @ignoreDoc */
anychart.heatMap = anychart.heatMap || anychart.createNFIMError('HeatMap chart');


/** @ignoreDoc */
anychart.circularGauge = anychart.circularGauge || anychart.createNFIMError('Circular gauge');


/** @ignoreDoc */
anychart.gauges.circular = anychart.gauges.circular || anychart.createNFIMError('Circular gauge');


/** @ignoreDoc */
anychart.gauges.linear = anychart.gauges.linear || anychart.createNFIMError('Linear gauge');


/** @ignoreDoc */
anychart.gauges.tank = anychart.gauges.tank || anychart.createNFIMError('Tank gauge');


/** @ignoreDoc */
anychart.gauges.thermometer = anychart.gauges.thermometer || anychart.createNFIMError('Thermometer gauge');


/** @ignoreDoc */
anychart.gauges.led = anychart.gauges.led || anychart.createNFIMError('LED gauge');


/** @ignoreDoc */
anychart.map = anychart.map || anychart.createNFIMError('Map');


/** @ignoreDoc */
anychart.choropleth = anychart.choropleth || anychart.createNFIMError('Choropleth map');


/** @ignoreDoc */
anychart.bubbleMap = anychart.bubbleMap || anychart.createNFIMError('Bubble map');


/** @ignoreDoc */
anychart.connector = anychart.connector || anychart.createNFIMError('Connector map');


/** @ignoreDoc */
anychart.markerMap = anychart.markerMap || anychart.createNFIMError('Marker map');


/** @ignoreDoc */
anychart.seatMap = anychart.seatMap || anychart.createNFIMError('Seat map');


/** @ignoreDoc */
anychart.ganttProject = anychart.ganttProject || anychart.createNFIMError('Gantt Project chart');


/** @ignoreDoc */
anychart.ganttResource = anychart.ganttResource || anychart.createNFIMError('Gantt Resource chart');


/** @ignoreDoc */
anychart.stock = anychart.stock || anychart.createNFIMError('Stock chart');


/** @ignoreDoc */
anychart.toolbar = anychart.toolbar || anychart.createNFIMError('Toolbar');


/** @ignoreDoc */
anychart.ganttToolbar = anychart.ganttToolbar || anychart.createNFIMError('Gantt toolbar');


/** @ignoreDoc */
anychart.treeMap = anychart.treeMap || anychart.createNFIMError('TreeMap chart');


/** @inheritDoc */
anychart.pareto = anychart.pareto || anychart.createNFIMError('Pareto chart');


/** @inheritDoc */
anychart.resource = anychart.resource || anychart.createNFIMError('Resource chart');


//region ------ Standalones
/** @ignoreDoc */
anychart.standalones.background = anychart.standalones.background || anychart.createNFIMError('anychart.standalones.Background');


/** @ignoreDoc */
anychart.ui.background = anychart.ui.background || anychart.createNFIMError('anychart.ui.Background');


/** @ignoreDoc */
anychart.standalones.colorRange = anychart.standalones.colorRange || anychart.createNFIMError('anychart.standalones.ColorRange');


/** @ignoreDoc */
anychart.ui.colorRange = anychart.ui.colorRange || anychart.createNFIMError('anychart.ui.ColorRange');


/** @ignoreDoc */
anychart.standalones.dataGrid = anychart.standalones.dataGrid || anychart.createNFIMError('anychart.standalones.DataGrid');


/** @ignoreDoc */
anychart.ui.dataGrid = anychart.ui.dataGrid || anychart.createNFIMError('anychart.ui.DataGrid');


/** @ignoreDoc */
anychart.standalones.label = anychart.standalones.label || anychart.createNFIMError('anychart.standalones.Label');


/** @ignoreDoc */
anychart.ui.label = anychart.ui.label || anychart.createNFIMError('anychart.ui.Label');


/** @ignoreDoc */
anychart.standalones.labelsFactory = anychart.standalones.labelsFactory || anychart.createNFIMError('anychart.standalones.LabelsFactory');


/** @ignoreDoc */
anychart.ui.labelsFactory = anychart.ui.labelsFactory || anychart.createNFIMError('anychart.ui.LabelsFactory');


/** @ignoreDoc */
anychart.standalones.legend = anychart.standalones.legend || anychart.createNFIMError('anychart.standalones.Legend');


/** @ignoreDoc */
anychart.ui.legend = anychart.ui.legend || anychart.createNFIMError('anychart.ui.Legend');


/** @ignoreDoc */
anychart.standalones.markersFactory = anychart.standalones.markersFactory || anychart.createNFIMError('anychart.standalones.MarkersFactory');


/** @ignoreDoc */
anychart.ui.markersFactory = anychart.ui.markersFactory || anychart.createNFIMError('anychart.ui.MarkersFactory');


/** @ignoreDoc */
anychart.standalones.projectTimeline = anychart.standalones.projectTimeline || anychart.createNFIMError('anychart.standalones.ProjectTimeline');


/** @ignoreDoc */
anychart.ui.projectTimeline = anychart.ui.projectTimeline || anychart.createNFIMError('anychart.ui.ProjectTimeline');


/** @ignoreDoc */
anychart.standalones.resourceTimeline = anychart.standalones.resourceTimeline || anychart.createNFIMError('anychart.standalones.ResourceTimeline');


/** @ignoreDoc */
anychart.ui.resourceTimeline = anychart.ui.resourceTimeline || anychart.createNFIMError('anychart.ui.ResourceTimeline');


/** @ignoreDoc */
anychart.standalones.resourceList = anychart.standalones.resourceList || anychart.createNFIMError('anychart.standalones.ResourceList');


/** @ignoreDoc */
anychart.standalones.scroller = anychart.standalones.scroller || anychart.createNFIMError('anychart.standalones.scroller');


/** @ignoreDoc */
anychart.ui.scroller = anychart.ui.scroller || anychart.createNFIMError('anychart.ui.Scroller');


/** @ignoreDoc */
anychart.standalones.table = anychart.standalones.table || anychart.createNFIMError('anychart.standalones.Table');


/** @ignoreDoc */
anychart.ui.table = anychart.ui.table || anychart.createNFIMError('anychart.ui.Table');


/** @ignoreDoc */
anychart.standalones.title = anychart.standalones.title || anychart.createNFIMError('anychart.standalones.Title');


/** @ignoreDoc */
anychart.ui.title = anychart.ui.title || anychart.createNFIMError('anychart.ui.Title');


/** @ignoreDoc */
anychart.standalones.axes.linear = anychart.standalones.axes.linear || anychart.createNFIMError('anychart.standalones.axes.Linear');


/** @ignoreDoc */
anychart.standalones.axes.polar = anychart.standalones.axes.polar || anychart.createNFIMError('anychart.standalones.axes.Polar');


/** @ignoreDoc */
anychart.standalones.axes.radar = anychart.standalones.axes.radar || anychart.createNFIMError('anychart.standalones.axes.Radar');


/** @ignoreDoc */
anychart.standalones.axes.radial = anychart.standalones.axes.radial || anychart.createNFIMError('anychart.standalones.axes.Radial');


/** @ignoreDoc */
anychart.axes.linear = anychart.axes.linear || anychart.createNFIMError('anychart.axes.Linear');


/** @ignoreDoc */
anychart.axes.polar = anychart.axes.polar || anychart.createNFIMError('anychart.axes.Polar');


/** @ignoreDoc */
anychart.axes.radar = anychart.axes.radar || anychart.createNFIMError('anychart.axes.Radar');


/** @ignoreDoc */
anychart.axes.radial = anychart.axes.radial || anychart.createNFIMError('anychart.axes.Radial');


/** @ignoreDoc */
anychart.axisMarkers.line = anychart.axisMarkers.line || anychart.createNFIMError('anychart.axisMarkers.Line');


/** @ignoreDoc */
anychart.axisMarkers.range = anychart.axisMarkers.range || anychart.createNFIMError('anychart.axisMarkers.Range');


/** @ignoreDoc */
anychart.axisMarkers.text = anychart.axisMarkers.text || anychart.createNFIMError('anychart.axisMarkers.Text');


/** @ignoreDoc */
anychart.standalones.axisMarkers.line = anychart.standalones.axisMarkers.line || anychart.createNFIMError('anychart.standalones.axisMarkers.Line');


/** @ignoreDoc */
anychart.standalones.axisMarkers.range = anychart.standalones.axisMarkers.range || anychart.createNFIMError('anychart.standalones.axisMarkers.Range');


/** @ignoreDoc */
anychart.standalones.axisMarkers.text = anychart.standalones.axisMarkers.text || anychart.createNFIMError('anychart.standalones.axisMarkers.Text');


/** @ignoreDoc */
anychart.grids.linear = anychart.grids.linear || anychart.createNFIMError('anychart.grids.Linear');


/** @ignoreDoc */
anychart.grids.linear3d = anychart.grids.linear3d || anychart.createNFIMError('anychart.grids.Linear3d');


/** @ignoreDoc */
anychart.grids.polar = anychart.grids.polar || anychart.createNFIMError('anychart.grids.Polar');


/** @ignoreDoc */
anychart.grids.radar = anychart.grids.radar || anychart.createNFIMError('anychart.grids.Radar');


/** @ignoreDoc */
anychart.standalones.grids.linear = anychart.standalones.grids.linear || anychart.createNFIMError('anychart.standalones.grids.Linear');


/** @ignoreDoc */
anychart.standalones.grids.linear3d = anychart.standalones.grids.linear3d || anychart.createNFIMError('anychart.standalones.grids.Linear3d');


/** @ignoreDoc */
anychart.standalones.grids.polar = anychart.standalones.grids.polar || anychart.createNFIMError('anychart.standalones.grids.Polar');


/** @ignoreDoc */
anychart.standalones.grids.radar = anychart.standalones.grids.radar || anychart.createNFIMError('anychart.standalones.grids.Radar');


//endregion
//region ------ UI
/** @ignoreDoc */
anychart.ui.contextMenu = anychart.ui.contextMenu || /** @type {function():null} */ (function(opt_fromTheme) {
  if (!opt_fromTheme) {
    anychart.core.reporting.error(anychart.enums.ErrorCode.NO_FEATURE_IN_MODULE, null, ['Context Menu']);
  }
  return null;
});


/** @ignoreDoc */
anychart.ui.ganttToolbar = anychart.ui.ganttToolbar || anychart.createNFIMError('Gantt toolbar');


/** @ignoreDoc */
anychart.ui.preloader = anychart.ui.preloader || anychart.createNFIMError('Preloader');


/** @ignoreDoc */
anychart.ui.rangePicker = anychart.ui.rangePicker || anychart.createNFIMError('Range picker');


/** @ignoreDoc */
anychart.ui.rangeSelector = anychart.ui.rangeSelector || anychart.createNFIMError('Range selector');
//endregion
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
goog.exportSymbol('anychart.server', anychart.server);
goog.exportSymbol('anychart.fromJson', anychart.fromJson);//doc|ex
goog.exportSymbol('anychart.fromXml', anychart.fromXml);//doc|ex
goog.exportSymbol('anychart.onDocumentLoad', anychart.onDocumentLoad);//doc|need-ex
goog.exportSymbol('anychart.onDocumentReady', anychart.onDocumentReady);//doc|ex
goog.exportSymbol('anychart.licenseKey', anychart.licenseKey);//doc|ex
goog.exportSymbol('anychart.area', anychart.area);//linkedFromModule
goog.exportSymbol('anychart.verticalArea', anychart.verticalArea);//linkedFromModule
goog.exportSymbol('anychart.area3d', anychart.area3d);
goog.exportSymbol('anychart.bar', anychart.bar);//linkedFromModule
goog.exportSymbol('anychart.bar3d', anychart.bar3d);
goog.exportSymbol('anychart.box', anychart.box);
goog.exportSymbol('anychart.bubble', anychart.bubble);//linkedFromModule
goog.exportSymbol('anychart.bullet', anychart.bullet);//linkedFromModule
goog.exportSymbol('anychart.cartesian', anychart.cartesian);//linkedFromModule
goog.exportSymbol('anychart.cartesian3d', anychart.cartesian3d);
goog.exportSymbol('anychart.column', anychart.column);//linkedFromModule
goog.exportSymbol('anychart.column3d', anychart.column3d);
goog.exportSymbol('anychart.financial', anychart.financial);//linkedFromModule
goog.exportSymbol('anychart.funnel', anychart.funnel);//linkedFromModule
goog.exportSymbol('anychart.line', anychart.line);//linkedFromModule
goog.exportSymbol('anychart.verticalLine', anychart.verticalLine);//linkedFromModule
goog.exportSymbol('anychart.marker', anychart.marker);//linkedFromModule
goog.exportSymbol('anychart.pie', anychart.pie);//linkedFromModule
goog.exportSymbol('anychart.pie3d', anychart.pie3d);//linkedFromModule
goog.exportSymbol('anychart.pyramid', anychart.pyramid);//linkedFromModule
goog.exportSymbol('anychart.radar', anychart.radar);
goog.exportSymbol('anychart.polar', anychart.polar);
goog.exportSymbol('anychart.sparkline', anychart.sparkline);
goog.exportSymbol('anychart.heatMap', anychart.heatMap);
goog.exportSymbol('anychart.scatter', anychart.scatter);
goog.exportSymbol('anychart.map', anychart.map);
goog.exportSymbol('anychart.choropleth', anychart.choropleth);
goog.exportSymbol('anychart.bubbleMap', anychart.bubbleMap);
goog.exportSymbol('anychart.markerMap', anychart.markerMap);
goog.exportSymbol('anychart.seatMap', anychart.seatMap);
goog.exportSymbol('anychart.connector', anychart.connector);
goog.exportSymbol('anychart.circularGauge', anychart.circularGauge);
goog.exportSymbol('anychart.gauges.circular', anychart.gauges.circular);
goog.exportSymbol('anychart.gauges.linear', anychart.gauges.linear);
goog.exportSymbol('anychart.gauges.thermometer', anychart.gauges.thermometer);
goog.exportSymbol('anychart.gauges.tank', anychart.gauges.tank);
goog.exportSymbol('anychart.gauges.led', anychart.gauges.led);
goog.exportSymbol('anychart.ganttProject', anychart.ganttProject);
goog.exportSymbol('anychart.ganttResource', anychart.ganttResource);
goog.exportSymbol('anychart.stock', anychart.stock);
goog.exportSymbol('anychart.theme', anychart.theme);
goog.exportSymbol('anychart.appendTheme', anychart.appendTheme);
goog.exportSymbol('anychart.toolbar', anychart.toolbar);
goog.exportSymbol('anychart.ganttToolbar', anychart.ganttToolbar);
goog.exportSymbol('anychart.treeMap', anychart.treeMap);
goog.exportSymbol('anychart.pareto', anychart.pareto);
goog.exportSymbol('anychart.resource', anychart.resource);
goog.exportSymbol('anychart.standalones.background', anychart.standalones.background);
goog.exportSymbol('anychart.ui.background', anychart.ui.background);
goog.exportSymbol('anychart.standalones.colorRange', anychart.standalones.colorRange);
goog.exportSymbol('anychart.ui.colorRange', anychart.ui.colorRange);
goog.exportSymbol('anychart.standalones.dataGrid', anychart.standalones.dataGrid);
goog.exportSymbol('anychart.ui.dataGrid', anychart.ui.dataGrid);
goog.exportSymbol('anychart.standalones.label', anychart.standalones.label);
goog.exportSymbol('anychart.ui.label', anychart.ui.label);
goog.exportSymbol('anychart.standalones.labelsFactory', anychart.standalones.labelsFactory);
goog.exportSymbol('anychart.ui.labelsFactory', anychart.ui.labelsFactory);
goog.exportSymbol('anychart.standalones.legend', anychart.standalones.legend);
goog.exportSymbol('anychart.ui.legend', anychart.ui.legend);
goog.exportSymbol('anychart.standalones.markersFactory', anychart.standalones.markersFactory);
goog.exportSymbol('anychart.ui.markersFactory', anychart.ui.markersFactory);
goog.exportSymbol('anychart.standalones.projectTimeline', anychart.standalones.projectTimeline);
goog.exportSymbol('anychart.ui.projectTimeline', anychart.ui.projectTimeline);
goog.exportSymbol('anychart.standalones.resourceTimeline', anychart.standalones.resourceTimeline);
goog.exportSymbol('anychart.ui.resourceTimeline', anychart.ui.resourceTimeline);
goog.exportSymbol('anychart.standalones.resourceList', anychart.standalones.resourceList);
goog.exportSymbol('anychart.standalones.scroller', anychart.standalones.scroller);
goog.exportSymbol('anychart.ui.scroller', anychart.ui.scroller);
goog.exportSymbol('anychart.standalones.table', anychart.standalones.table);
goog.exportSymbol('anychart.ui.table', anychart.ui.table);
goog.exportSymbol('anychart.standalones.title', anychart.standalones.title);
goog.exportSymbol('anychart.ui.title', anychart.ui.title);
goog.exportSymbol('anychart.standalones.axes.linear', anychart.standalones.axes.linear);
goog.exportSymbol('anychart.standalones.axes.polar', anychart.standalones.axes.polar);
goog.exportSymbol('anychart.standalones.axes.radar', anychart.standalones.axes.radar);
goog.exportSymbol('anychart.standalones.axes.radial', anychart.standalones.axes.radial);
goog.exportSymbol('anychart.axes.linear', anychart.axes.linear);
goog.exportSymbol('anychart.axes.polar', anychart.axes.polar);
goog.exportSymbol('anychart.axes.radar', anychart.axes.radar);
goog.exportSymbol('anychart.axes.radial', anychart.axes.radial);
goog.exportSymbol('anychart.axisMarkers.line', anychart.axisMarkers.line);
goog.exportSymbol('anychart.axisMarkers.range', anychart.axisMarkers.range);
goog.exportSymbol('anychart.axisMarkers.text', anychart.axisMarkers.text);
goog.exportSymbol('anychart.standalones.axisMarkers.line', anychart.standalones.axisMarkers.line);
goog.exportSymbol('anychart.standalones.axisMarkers.range', anychart.standalones.axisMarkers.range);
goog.exportSymbol('anychart.standalones.axisMarkers.text', anychart.standalones.axisMarkers.text);
goog.exportSymbol('anychart.grids.linear', anychart.grids.linear);
goog.exportSymbol('anychart.grids.linear3d', anychart.grids.linear3d);
goog.exportSymbol('anychart.grids.polar', anychart.grids.polar);
goog.exportSymbol('anychart.grids.radar', anychart.grids.radar);
goog.exportSymbol('anychart.standalones.grids.linear', anychart.standalones.grids.linear);
goog.exportSymbol('anychart.standalones.grids.linear3d', anychart.standalones.grids.linear3d);
goog.exportSymbol('anychart.standalones.grids.polar', anychart.standalones.grids.polar);
goog.exportSymbol('anychart.standalones.grids.radar', anychart.standalones.grids.radar);
goog.exportSymbol('anychart.ui.contextMenu', anychart.ui.contextMenu);
goog.exportSymbol('anychart.ui.ganttToolbar', anychart.ui.ganttToolbar);
goog.exportSymbol('anychart.ui.preloader', anychart.ui.preloader);
goog.exportSymbol('anychart.ui.rangePicker', anychart.ui.rangePicker);
goog.exportSymbol('anychart.ui.rangeSelector', anychart.ui.rangeSelector);
(function() {
  var proto = acgraph.vector.Stage.prototype;
  proto['credits'] = proto.credits;
})();
