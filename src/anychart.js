goog.provide('anychart');
goog.provide('anychart.globalLock');

goog.require('acgraphexport');
goog.require('anychart.Chart');
goog.require('anychart.data');
goog.require('anychart.elements.Background');
goog.require('anychart.elements.Title');
goog.require('anychart.utils');

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

