goog.provide('anychart');
goog.provide('anychart.globalLock');
goog.require('acgraphexport');
goog.require('anychart.data');
goog.require('anychart.math');
goog.require('anychart.utils');
goog.require('goog.json.hybrid');

/**
 * Core space for all anychart components.
 * @namespace
 * @name anychart
 */


/**
 * Current version of the framework.
 * @example <t>lineChart</t>
 * chart.line([1.1, 1.4, 1.3, 1.6]);
 * chart.title().text('Current version is ' + anychart.VERSION);
 * @define {string} Replaced on compile time.
 */
anychart.VERSION = '';


/**
 * Define, if is developers edition.
 * @example <t>lineChart</t>
 * chart.line([1.1, 1.4, 1.3, 1.6]);
 * if (!anychart.DEVELOP){
 *   chart.title().text('It is production edition');
 * }else{
 *   chart.title().text('It is developers edition');
 * }
 * @define {boolean} Replaced on compile time.
 */
anychart.DEVELOP = true;


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
anychart.graphics = window['acgraph'];


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
 * @param {string} type
 * @return {anychart.Chart}
 */
anychart.createChartByType = function(type) {
  var cls = anychart.chartTypesMap[type];
  if (cls) {
    return /** @type {anychart.Chart} */(new cls());
  } else {
    throw 'Unknown chart type: ' + type + '\nIt can be contains in other modules, see module list for details.';
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

  if (!json) throw 'Empty json config';

  var chart = json['chart'];
  if (!chart) throw 'Config should contains chart node';


  var instance = anychart.createChartByType(chart['type']);
  instance.deserialize(json);
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
goog.global['anychart']['fontSize'] = '12px';


/**
 * Default value for the font color.
 * @type {string}
 *
 */
goog.global['anychart']['fontColor'] = '#000';


/**
 * Default value for the font style.
 * @type {string}
 *
 */
goog.global['anychart']['fontFamily'] = 'Arial';


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

  goog.events.listen(goog.dom.getWindow(), goog.events.EventType.LOAD, function() {
    for (var i = 0, count = anychart.documentLoadCallbacks_.length; i < count; i++) {
      var item = anychart.documentLoadCallbacks_[i];
      item[0].apply(item[1]);
    }
  });
};


/**
 * Attaching DOM load events.
 * @private
 */
anychart.attachDomEvents_ = function() {
  var window = goog.dom.getWindow();
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
  var window = goog.dom.getWindow();
  var document = window['document'];

  acgraph.events.unlisten(document, [goog.events.EventType.DOMCONTENTLOADED, goog.events.EventType.READYSTATECHANGE], anychart.completed_, false);
  acgraph.events.unlisten(/** @type {EventTarget}*/ (window), goog.events.EventType.LOAD, anychart.completed_, false);
};


/**
 * Function called when one of [ DOMContentLoad , onreadystatechanged ] events fired on document or onload on window.
 * @param {acgraph.events.Event} event Event object.
 * @private
 */
anychart.completed_ = function(event) {
  var document = goog.dom.getWindow()['document'];
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
 * @param {acgraph.events.Event} event Event object.
 * @return {*} Nothing if document already loaded or timeoutID.
 */
anychart.ready_ = function(event) {
  if (anychart.isReady_) {
    return;
  }

  var document = goog.dom.getWindow()['document'];

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
 * It is called when the DOM is ready which can be prior to images and other external content is loaded.
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

  var document = goog.dom.getWindow()['document'];

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
 * var chart = anychart.pieChart([1, 2, 3]);
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


/**
 * @ignoreDoc
 */
anychart.areaChart = anychart.areaChart || function() {
  anychart.utils.error(anychart.enums.ErrorCode.NO_FEATURE_IN_MODULE, null, ['Area chart']);
};


/**
 * @ignoreDoc
 */
anychart.barChart = anychart.barChart || function() {
  anychart.utils.error(anychart.enums.ErrorCode.NO_FEATURE_IN_MODULE, null, ['Bar chart']);
};


/**
 * @ignoreDoc
 */
anychart.bubbleChart = anychart.bubbleChart || function() {
  anychart.utils.error(anychart.enums.ErrorCode.NO_FEATURE_IN_MODULE, null, ['Bubble chart']);
};


/**
 * @ignoreDoc
 */
anychart.bulletChart = anychart.bulletChart || function() {
  anychart.utils.error(anychart.enums.ErrorCode.NO_FEATURE_IN_MODULE, null, ['Bullet chart']);
};


/**
 * @ignoreDoc
 */
anychart.cartesianChart = anychart.cartesianChart || function() {
  anychart.utils.error(anychart.enums.ErrorCode.NO_FEATURE_IN_MODULE, null, ['Cartesian chart']);
};


/**
 * @ignoreDoc
 */
anychart.columnChart = anychart.columnChart || function() {
  anychart.utils.error(anychart.enums.ErrorCode.NO_FEATURE_IN_MODULE, null, ['Column chart']);
};


/**
 * @ignoreDoc
 */
anychart.financialChart = anychart.financialChart || function() {
  anychart.utils.error(anychart.enums.ErrorCode.NO_FEATURE_IN_MODULE, null, ['Financial chart']);
};


/**
 * @ignoreDoc
 */
anychart.lineChart = anychart.lineChart || function() {
  anychart.utils.error(anychart.enums.ErrorCode.NO_FEATURE_IN_MODULE, null, ['Line chart']);
};


/**
 * @ignoreDoc
 */
anychart.markerChart = anychart.markerChart || function() {
  anychart.utils.error(anychart.enums.ErrorCode.NO_FEATURE_IN_MODULE, null, ['Marker chart']);
};


/**
 * @ignoreDoc
 */
anychart.pieChart = anychart.pieChart || function() {
  anychart.utils.error(anychart.enums.ErrorCode.NO_FEATURE_IN_MODULE, null, ['Pie chart']);
};


//exports
goog.exportSymbol('anychart.VERSION', anychart.VERSION);//doc|ex
goog.exportSymbol('anychart.DEVELOP', anychart.DEVELOP);//doc|ex
goog.exportSymbol('anychart.graphics', anychart.graphics);//import
goog.exportSymbol('anychart.fromJson', anychart.fromJson);//doc|ex
goog.exportSymbol('anychart.fromXml', anychart.fromXml);//doc|ex
goog.exportSymbol('anychart.onDocumentLoad', anychart.onDocumentLoad);//doc|need-ex
goog.exportSymbol('anychart.onDocumentReady', anychart.onDocumentReady);//doc|ex
goog.exportSymbol('anychart.licenseKey', anychart.licenseKey);//doc|ex
goog.exportSymbol('anychart.areaChart', anychart.areaChart);
goog.exportSymbol('anychart.barChart', anychart.barChart);
goog.exportSymbol('anychart.bubbleChart', anychart.bubbleChart);
goog.exportSymbol('anychart.bulletChart', anychart.bulletChart);
goog.exportSymbol('anychart.cartesianChart', anychart.cartesianChart);
goog.exportSymbol('anychart.columnChart', anychart.columnChart);
goog.exportSymbol('anychart.financialChart', anychart.financialChart);
goog.exportSymbol('anychart.lineChart', anychart.lineChart);
goog.exportSymbol('anychart.markerChart', anychart.markerChart);
goog.exportSymbol('anychart.pieChart', anychart.pieChart);
