goog.provide('anychart.core.ICenterContentChart');



/**
 * Interface to represent both the series and charts without series that use shapeManagers.
 * @interface
 */
anychart.core.ICenterContentChart = function() {};


/**
 * @return {anychart.math.Rect} Center content bounds.
 */
anychart.core.ICenterContentChart.prototype.getCenterContentBounds = function() {};


/**
 * @return {Array.<number>} Coordinate of the current pie chart center.
 */
anychart.core.ICenterContentChart.prototype.getCenterCoords = function() {};


/**
 * Listener for graphics elements. If center content is graphics element use it.
 */
anychart.core.ICenterContentChart.prototype.acgraphElementsListener = function() {};


/**
 * Listener for anychart charts. If center content is anychart chart use it.
 */
anychart.core.ICenterContentChart.prototype.chartsListener = function() {};
