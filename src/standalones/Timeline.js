goog.provide('anychart.standalones.ProjectTimeline');
goog.provide('anychart.standalones.ResourceTimeline');
goog.require('anychart.core.ui.Timeline');



/**
 * @constructor
 * @extends {anychart.core.ui.Timeline}
 */
anychart.standalones.ProjectTimeline = function() {
  anychart.standalones.ProjectTimeline.base(this, 'constructor');
};
goog.inherits(anychart.standalones.ProjectTimeline, anychart.core.ui.Timeline);
anychart.core.makeStandalone(anychart.standalones.ProjectTimeline, anychart.core.ui.Timeline);



/**
 * @constructor
 * @extends {anychart.core.ui.Timeline}
 */
anychart.standalones.ResourceTimeline = function() {
  anychart.standalones.ResourceTimeline.base(this, 'constructor', void 0, true);
};
goog.inherits(anychart.standalones.ResourceTimeline, anychart.core.ui.Timeline);
anychart.core.makeStandalone(anychart.standalones.ResourceTimeline, anychart.core.ui.Timeline);


/**
 * Constructor function.
 * @return {!anychart.standalones.ProjectTimeline}
 */
anychart.standalones.projectTimeline = function() {
  var timeline = new anychart.standalones.ProjectTimeline();
  timeline.setup(anychart.getFullTheme()['standalones']['timeline']);
  return timeline;
};


/**
 * Constructor function.
 * @return {!anychart.standalones.ResourceTimeline}
 */
anychart.standalones.resourceTimeline = function() {
  var timeline = new anychart.standalones.ResourceTimeline();
  timeline.setup(anychart.getFullTheme()['standalones']['timeline']);
  return timeline;
};


/**
 * Constructor function.
 * @return {!anychart.standalones.ProjectTimeline}
 * @deprecated Since 7.12.0. Use anychart.standalones.projectTimeline instead.
 */
anychart.ui.projectTimeline = function() {
  anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null, ['anychart.ui.projectTimeline', 'anychart.standalones.projectTimeline'], true);
  return anychart.standalones.projectTimeline();
};


/**
 * Constructor function.
 * @return {!anychart.standalones.ResourceTimeline}
 * @deprecated Since 7.12.0. Use anychart.standalones.resourceTimeline instead.
 */
anychart.ui.resourceTimeline = function() {
  anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null, ['anychart.ui.resourceTimeline', 'anychart.standalones.resourceTimeline'], true);
  return anychart.standalones.resourceTimeline();
};


//exports
goog.exportSymbol('anychart.ui.projectTimeline', anychart.ui.projectTimeline);
goog.exportSymbol('anychart.ui.resourceTimeline', anychart.ui.resourceTimeline);
goog.exportSymbol('anychart.standalones.projectTimeline', anychart.standalones.projectTimeline);
goog.exportSymbol('anychart.standalones.resourceTimeline', anychart.standalones.resourceTimeline);
anychart.standalones.ResourceTimeline.prototype['draw'] = anychart.standalones.ResourceTimeline.prototype.draw;
anychart.standalones.ResourceTimeline.prototype['parentBounds'] = anychart.standalones.ResourceTimeline.prototype.parentBounds;
anychart.standalones.ResourceTimeline.prototype['container'] = anychart.standalones.ResourceTimeline.prototype.container;
anychart.standalones.ResourceTimeline.prototype['rowStroke'] = anychart.standalones.ResourceTimeline.prototype.rowStroke;
anychart.standalones.ResourceTimeline.prototype['backgroundFill'] = anychart.standalones.ResourceTimeline.prototype.backgroundFill;
anychart.standalones.ResourceTimeline.prototype['headerHeight'] = anychart.standalones.ResourceTimeline.prototype.headerHeight;

anychart.standalones.ProjectTimeline.prototype['draw'] = anychart.standalones.ProjectTimeline.prototype.draw;
anychart.standalones.ProjectTimeline.prototype['parentBounds'] = anychart.standalones.ProjectTimeline.prototype.parentBounds;
anychart.standalones.ProjectTimeline.prototype['container'] = anychart.standalones.ProjectTimeline.prototype.container;
anychart.standalones.ProjectTimeline.prototype['rowStroke'] = anychart.standalones.ProjectTimeline.prototype.rowStroke;
anychart.standalones.ProjectTimeline.prototype['backgroundFill'] = anychart.standalones.ProjectTimeline.prototype.backgroundFill;
anychart.standalones.ProjectTimeline.prototype['headerHeight'] = anychart.standalones.ProjectTimeline.prototype.headerHeight;
