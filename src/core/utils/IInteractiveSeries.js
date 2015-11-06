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
anychart.core.utils.IInteractiveSeries.prototype.enabled;


/**
 * @return {anychart.data.Iterator}
 */
anychart.core.utils.IInteractiveSeries.prototype.getIterator;


/**
 * @return {anychart.data.Iterator}
 */
anychart.core.utils.IInteractiveSeries.prototype.getResetIterator;


/**
 * @param {anychart.enums.HoverMode=} opt_value Hover mode.
 * @return {anychart.core.utils.IInteractiveSeries|anychart.enums.HoverMode} .
 */
anychart.core.utils.IInteractiveSeries.prototype.hoverMode;


/**
 * @return {boolean}
 */
anychart.core.utils.IInteractiveSeries.prototype.isDiscreteBased;


/**
 * Apply appearance to series.
 * @param {anychart.PointState|number} pointState .
 */
anychart.core.utils.IInteractiveSeries.prototype.applyAppearanceToSeries;


/**
 * Apply appearance to point.
 * @param {anychart.PointState|number} pointState
 */
anychart.core.utils.IInteractiveSeries.prototype.applyAppearanceToPoint;


/**
 * Finalization point appearance. For drawing labels and markers.
 */
anychart.core.utils.IInteractiveSeries.prototype.finalizePointAppearance;
