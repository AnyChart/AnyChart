/**
 * @fileoverview anychart.ui namespace file.
 * @suppress {extraRequire}
 */

goog.provide('anychart.standalones');
goog.require('anychart.core.reporting');
goog.require('anychart.standalones.ResourceList');



/**
 * Namespace with standalones.
 * @namespace
 * @name anychart.standalones
 */


/**
 * @ignoreDoc
 */
anychart.standalones.resourceList = goog.global['anychart']['standalones']['resourceList'] || /** @type {function():null} */ (function() {
  anychart.core.reporting.error(anychart.enums.ErrorCode.NO_FEATURE_IN_MODULE, null, ['anychart.standalones.ResourceList']);
  return null;
});
