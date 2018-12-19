goog.provide('anychart.reflow.IMeasurementsTargetProvider');



//region -- IMeasurementsTargetProvider interface.
/**
 * Interface to represent an entity that cal provide texts to measure it.
 * @interface
 */
anychart.reflow.IMeasurementsTargetProvider = function() {};


/**
 * Provides the set of text instances to be measured.
 * NOTE: instances must be completely set up (styles and text value).
 * @return {Array.<anychart.core.ui.OptimizedText>}
 */
anychart.reflow.IMeasurementsTargetProvider.prototype.provideMeasurements = function() {};


/**
 * Adds a signal events listener.
 * @param {function(this:SCOPE, anychart.SignalEvent):(boolean|undefined)} listener - Callback method.
 * @param {SCOPE=} opt_scope - Object in whose scope to call the listener.
 * @return {goog.events.ListenableKey} - Unique key for the listener.
 * @template SCOPE
 */
anychart.reflow.IMeasurementsTargetProvider.prototype.listenSignals = function(listener, opt_scope) {};


/**
 * Removes a signal events listener.
 *
 * @param {function(this:SCOPE, anychart.SignalEvent):(boolean|undefined)} listener - Callback method.
 * @param {SCOPE=} opt_scope - Object in whose scope to call the listener.
 * @return {boolean} - Whether any listener was removed.
 * @template SCOPE
 */
anychart.reflow.IMeasurementsTargetProvider.prototype.unlistenSignals = function(listener, opt_scope) {};


//endregion
