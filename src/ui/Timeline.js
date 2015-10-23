goog.provide('anychart.ui.ProjectTimeline');
goog.provide('anychart.ui.ResourceTimeline');
goog.require('anychart.core.ui.Timeline');



/**
 * @constructor
 * @extends {anychart.core.ui.Timeline}
 */
anychart.ui.ProjectTimeline = function() {
  goog.base(this);
};
goog.inherits(anychart.ui.ProjectTimeline, anychart.core.ui.Timeline);



/**
 * @constructor
 * @extends {anychart.core.ui.Timeline}
 */
anychart.ui.ResourceTimeline = function() {
  goog.base(this, void 0, true);
};
goog.inherits(anychart.ui.ResourceTimeline, anychart.core.ui.Timeline);


/**
 * Constructor function.
 * @return {!anychart.ui.ProjectTimeline}
 */
anychart.ui.projectTimeline = function() {
  return new anychart.ui.ProjectTimeline();
};


/**
 * Constructor function.
 * @return {!anychart.ui.ResourceTimeline}
 */
anychart.ui.resourceTimeline = function() {
  return new anychart.ui.ResourceTimeline();
};


//exports
goog.exportSymbol('anychart.ui.projectTimeline', anychart.ui.projectTimeline);
goog.exportSymbol('anychart.ui.resourceTimeline', anychart.ui.resourceTimeline);
anychart.ui.ResourceTimeline.prototype['draw'] = anychart.ui.ResourceTimeline.prototype.draw;
anychart.ui.ResourceTimeline.prototype['parentBounds'] = anychart.ui.ResourceTimeline.prototype.parentBounds;
anychart.ui.ResourceTimeline.prototype['container'] = anychart.ui.ResourceTimeline.prototype.container;
anychart.ui.ResourceTimeline.prototype['rowStroke'] = anychart.ui.ResourceTimeline.prototype.rowStroke;
anychart.ui.ResourceTimeline.prototype['backgroundFill'] = anychart.ui.ResourceTimeline.prototype.backgroundFill;
anychart.ui.ResourceTimeline.prototype['headerHeight'] = anychart.ui.ResourceTimeline.prototype.headerHeight;

anychart.ui.ProjectTimeline.prototype['draw'] = anychart.ui.ProjectTimeline.prototype.draw;
anychart.ui.ProjectTimeline.prototype['parentBounds'] = anychart.ui.ProjectTimeline.prototype.parentBounds;
anychart.ui.ProjectTimeline.prototype['container'] = anychart.ui.ProjectTimeline.prototype.container;
anychart.ui.ProjectTimeline.prototype['rowStroke'] = anychart.ui.ProjectTimeline.prototype.rowStroke;
anychart.ui.ProjectTimeline.prototype['backgroundFill'] = anychart.ui.ProjectTimeline.prototype.backgroundFill;
anychart.ui.ProjectTimeline.prototype['headerHeight'] = anychart.ui.ProjectTimeline.prototype.headerHeight;


