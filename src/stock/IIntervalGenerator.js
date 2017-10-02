goog.provide('anychart.stockModule.IIntervalGenerator');



/**
 * Interface of the interval generator.
 * @interface
 */
anychart.stockModule.IIntervalGenerator = function() {};


/**
 * Sets starting value of the generator (in fact - the one before the first value).
 * The next next() call should return this start value (or aligned left value).
 * @param {number} value
 * @return {anychart.stockModule.IIntervalGenerator}
 */
anychart.stockModule.IIntervalGenerator.prototype.setStart = function(value) {};


/**
 * @return {number} Next number in the sequence.
 */
anychart.stockModule.IIntervalGenerator.prototype.next = function() {};


/**
 * @return {string} Hash string of the generator to identify similar generators.
 */
anychart.stockModule.IIntervalGenerator.prototype.getHash = function() {};
