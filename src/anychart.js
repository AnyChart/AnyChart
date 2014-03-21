goog.provide('anychart');
goog.provide('anychart.globalLock');

goog.require('acgraphexport');
goog.require('anychart.Chart');
goog.require('anychart.data');
goog.require('anychart.elements.Background');
goog.require('anychart.elements.Label');
goog.require('anychart.elements.Marker');
goog.require('anychart.elements.Multilabel');
goog.require('anychart.elements.Multimarker');
goog.require('anychart.elements.Separator');
goog.require('anychart.elements.Ticks');
goog.require('anychart.elements.Title');
goog.require('anychart.math');
goog.require('anychart.pie');
goog.require('anychart.scales.Linear');
goog.require('anychart.scales.Ordinal');
goog.require('anychart.utils');
goog.require('anychart.utils.DistinctColorPalette');
goog.require('anychart.utils.RangeColorPalette');

/**
 @namespace
 @name anychart
 */


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
 * Locks the globalLock. You should then free the lock. The lock should be freed the same number of times, that it
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


/**
 * Validates correctness of the json.
 * @param {Object} json JSON object.
 * @return {boolean} Is json valid.
 * @private
 */
anychart.isJsonValid_ = function(json) {
  return true;
};



/**
 * Factory for creating class constructors by json config.
 * @constructor
 */
anychart.ClassFactory = function() {
};
goog.addSingletonGetter(anychart.ClassFactory);


/**
 * Returns instance of the class.
 * @param {Object} json json config.
 * @return {*} Class constructor.
 */
anychart.ClassFactory.prototype.getClass = function(json) {
  if (json['chart'] && json['chart']['type'] == 'pie') return new anychart.pie.Chart();
  return null;
};


/**
 * Десериализует переданный JSON и возвращает получившийся элемент в случае успеха или null.
 * @param {(Object|string)} jsonConfig Config.
 * @return {*} Element created by config.
 */
anychart.json = function(jsonConfig) {
  /**
   * Parsed json config.
   * @type {Object}
   */
  var json = {};
  if (goog.isString(jsonConfig)) {
    try {
      json = /** @type {Object} */ (JSON.parse(jsonConfig));
    } catch (e) {
      if (window['console']) window['console']['log'](e.stack);
      json = null;
    }
  } else if (goog.isObject(jsonConfig) && !goog.isFunction(jsonConfig)) {
    json = jsonConfig;
  }

  if (anychart.isJsonValid_(json)) {
    var cls = anychart.ClassFactory.getInstance().getClass(json);
    if (cls) {
      cls.deserialize(json);
      return cls;
    }
    else return null;
  } else return null;
};
//----------------------------------------------------------------------------------------------------------------------
//
//  Default font settings
//
//----------------------------------------------------------------------------------------------------------------------
goog.global['anychart'] = goog.global['anychart'] || {};


/**
 * Default value for size of font.
 * @type {string|number}
 *
 */
goog.global['anychart']['fontSize'] = '16px';


/**
 * Default value for color of font
 * @type {string}
 *
 */
goog.global['anychart']['fontColor'] = '#000';


/**
 * Default value for style of font.
 * @type {string}
 *
 */
goog.global['anychart']['fontFamily'] = 'Arial';


/**
 * Default value for direction of text. Text direction may be left-to-right or right-to-left.
 * @type {string}
 *
 */
goog.global['anychart']['textDirection'] = acgraph.vector.Text.Direction.LTR;
//endregion


//----------------------------------------------------------------------------------------------------------------------
//
//  Definers.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Define, is passed value fit to the none definition.
 * @param {*} value Value to define.
 * @return {boolean} Is passed value fit to the none definition.
 */
anychart.isNone = function(value) {
  return value === null || (goog.isString(value) && value.toLowerCase() == 'none');
};


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
 * Add callback for document load event.
 * @example <t>listingOnly</t>
 * anychart.onDocumentLoad(function() {
 *     var chart = new anychart.pie.Chart([ //create an instance of pie chart with data
 *         ['Chocolate paste', 5],
 *         ['White honey', 2],
 *         ['Strawberry jam', 2],
 *         ['Сondensed milk', 1]
 *     ]);
 *     chart.title('The kind of pancakes preferred at the Sochi 2014 Olympic Games');
 *     chart.container('chart-container'); //pass the container where chart will be drawn
 *     chart.draw(); //call the chart draw() method to initiate chart drawing
 * });
 * @param {Function} func Function which will called on document load event.
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
