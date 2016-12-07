goog.provide('anychart.core.utils.IInteractiveSeries');



/**
 * Interface to aggregate series features for interactivity.
 * @interface
 */
anychart.core.utils.IInteractiveSeries = function() {};


/**
 * @param {boolean=} opt_value
 * @return {boolean|anychart.core.VisualBase}
 */
anychart.core.utils.IInteractiveSeries.prototype.enabled = function(opt_value) {};


/**
 * @return {!anychart.data.IIterator}
 */
anychart.core.utils.IInteractiveSeries.prototype.getIterator = function() {};


/**
 * @return {!anychart.data.IIterator}
 */
anychart.core.utils.IInteractiveSeries.prototype.getResetIterator = function() {};


/**
 * @param {anychart.enums.HoverMode=} opt_value Hover mode.
 * @return {anychart.core.utils.IInteractiveSeries|anychart.enums.HoverMode} .
 */
anychart.core.utils.IInteractiveSeries.prototype.hoverMode = function(opt_value) {};


/**
 * @return {boolean}
 */
anychart.core.utils.IInteractiveSeries.prototype.isDiscreteBased = function() {};


/**
 * @return {boolean}
 */
anychart.core.utils.IInteractiveSeries.prototype.isSizeBased = function() {
};


/**
 * Apply appearance to series.
 * @param {anychart.PointState|number} pointState .
 */
anychart.core.utils.IInteractiveSeries.prototype.applyAppearanceToSeries = function(pointState) {};


/**
 * Apply appearance to point.
 * @param {anychart.PointState|number} pointState
 */
anychart.core.utils.IInteractiveSeries.prototype.applyAppearanceToPoint = function(pointState) {};


/**
 * Finalization point appearance. For drawing labels and markers.
 */
anychart.core.utils.IInteractiveSeries.prototype.finalizePointAppearance = function() {};


/**
 * Checks if an element has any consistency state set.
 * @return {boolean} True if it has it.
 */
anychart.core.utils.IInteractiveSeries.prototype.isConsistent = function() {};
