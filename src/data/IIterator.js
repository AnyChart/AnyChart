goog.provide('anychart.data.IIterator');
goog.require('anychart.data.IRowInfo');



/**
 * Iterator interface.
 * @interface
 * @extends {anychart.data.IRowInfo}
 */
anychart.data.IIterator = function() {};


/**
 * Resets the data iterator to its zero state (before the first item of the view).
 * @return {anychart.data.IIterator}
 */
anychart.data.IIterator.prototype.reset = function() {};


/**
 * Advances the iterator to the next position.
 * @return {boolean}
 */
anychart.data.IIterator.prototype.advance = function() {};


/**
 * Returns rows count.
 * @return {number}
 */
anychart.data.IIterator.prototype.getRowsCount = function() {};
