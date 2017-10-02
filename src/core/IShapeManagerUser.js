goog.provide('anychart.core.IShapeManagerUser');


goog.require('anychart.core.settings.IObjectWithSettings');



/**
 * Interface to represent both the series and charts without series that use shapeManagers.
 * @interface
 * @extends {anychart.core.settings.IObjectWithSettings}
 */
anychart.core.IShapeManagerUser = function() {};


/**
 * @return {boolean}
 */
anychart.core.IShapeManagerUser.prototype.isDiscreteBased = function() {};


/**
 * @return {!anychart.data.IIterator}
 */
anychart.core.IShapeManagerUser.prototype.getIterator = function() {};


/**
 * Returns proper settings due to the state if point settings are supported by the IShapeManagerUser.
 * @param {string} name
 * @param {number} state
 * @param {anychart.data.IRowInfo} point
 * @param {Function} normalizer
 * @param {boolean} scrollerSelected
 * @param {string=} opt_seriesName - series option name if differs from point names.
 * @param {boolean=} opt_ignorePointSettings
 * @return {*}
 */
anychart.core.IShapeManagerUser.prototype.resolveOption = function(name, state, point, normalizer, scrollerSelected, opt_seriesName, opt_ignorePointSettings) {};


/**
 * @return {acgraph.vector.HatchFill}
 */
anychart.core.IShapeManagerUser.prototype.getAutoHatchFill = function() {};


/**
 * Returns hatch fill resolution context.
 * This context is used to resolve a hatch fill set as a function for current point.
 * @param {boolean=} opt_ignorePointSettings - Whether should take detached iterator.
 * @return {Object}
 */
anychart.core.IShapeManagerUser.prototype.getHatchFillResolutionContext = function(opt_ignorePointSettings) {};


/**
 * Returns color resolution context.
 * This context is used to resolve a fill or stroke set as a function for current point.
 * @param {(acgraph.vector.Fill|acgraph.vector.Stroke)=} opt_baseColor - .
 * @param {boolean=} opt_ignorePointSettings - Whether should take detached iterator.
 * @param {boolean=} opt_ignoreColorScale - Whether should use color scale.
 * @return {Object}
 */
anychart.core.IShapeManagerUser.prototype.getColorResolutionContext = function(opt_baseColor, opt_ignorePointSettings, opt_ignoreColorScale) {};


