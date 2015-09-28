goog.provide('anychart.core.utils.IIntervalGenerator');



/**
 * Interface of the interval generator.
 * @interface
 */
anychart.core.utils.IIntervalGenerator = function() {};


/**
 * Sets starting value of the generator (in fact - the one before the first value).
 * The next next() call should return this start value (or aligned left value).
 * @param {number} value
 */
anychart.core.utils.IIntervalGenerator.prototype.setStart;


/**
 * @return {number} Next number in the sequence.
 */
anychart.core.utils.IIntervalGenerator.prototype.next;


/**
 * @return {string} Hash string of the generator to identify similar generators.
 */
anychart.core.utils.IIntervalGenerator.prototype.getHash;
