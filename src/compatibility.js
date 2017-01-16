goog.provide('anychart.compatibility');
goog.require('goog.userAgent');


/**
 * Compatibility namespace.
 * @namespace
 * @name anychart.compatibility
 */

var userAgentString = goog.userAgent.getUserAgentString();


/**
 * Bug with 'pointer-events: none;' (svg root node) in Safari 5.1.x
 * https://bugs.webkit.org/show_bug.cgi?id=45467
 * Safari 5.1.x detect
 * @type {boolean}
 */
anychart.compatibility.ALLOW_GLOBAL_TOOLTIP_CONTAINER = !(goog.userAgent.SAFARI && userAgentString.indexOf('PhantomJS') == -1 &&
    goog.userAgent.isVersionOrHigher('534') && !goog.userAgent.isVersionOrHigher('536'));


/**
 * Flag for throw warning only once about using Porj4 projection without including Proj4 lib.
 * @type {boolean}
 */
anychart.compatibility.threwProj4Warn = false;
