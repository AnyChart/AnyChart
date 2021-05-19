goog.provide('anychart.calendarModule.settings.Base');
goog.require('anychart.core.Base');


/**
 * Class represents base settings of calendar chart entities.
 *
 * @extends {anychart.core.Base}
 * @constructor
 */
anychart.calendarModule.settings.Base = function() {
  anychart.calendarModule.settings.Base.base(this, 'constructor');
};
goog.inherits(anychart.calendarModule.settings.Base, anychart.core.Base);


/**
 * Supported signals mask.
 * @type {number}
 */
anychart.calendarModule.settings.Base.prototype.SUPPORTED_SIGNALS = anychart.Signal.NEEDS_REDRAW;
